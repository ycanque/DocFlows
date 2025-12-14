import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RequisitionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequisitionDto } from './dto/create-requisition.dto';
import { CreateRequestItemDto } from './dto/create-request-item.dto';
import { UpdateRequisitionDto } from './dto/update-requisition.dto';

@Injectable()
export class RequisitionsService {
  constructor(private readonly prisma: PrismaService) {}

  private toCreateItem(item: CreateRequestItemDto): Prisma.RequestItemCreateWithoutRequisitionSlipInput {
    return {
      quantity: item.quantity,
      unit: item.unit,
      particulars: item.particulars,
      estimatedCost: item.estimatedCost,
    };
  }

  async create(dto: CreateRequisitionDto) {
    return this.prisma.requisitionSlip.create({
      data: {
        requisitionNumber: `REQ-${Date.now()}`,
        requesterId: dto.requesterId,
        departmentId: dto.departmentId,
        dateRequested: new Date(dto.dateRequested),
        dateNeeded: new Date(dto.dateNeeded),
        purpose: dto.purpose,
        status: dto.status ?? RequisitionStatus.DRAFT,
        items: {
          create: dto.items?.map((item) => this.toCreateItem(item)) ?? [],
        },
      },
      include: { items: true, requester: true, department: true },
    });
  }

  findAll() {
    return this.prisma.requisitionSlip.findMany({
      include: { items: true, requester: true, department: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const requisition = await this.prisma.requisitionSlip.findUnique({
      where: { id },
      include: { items: true, requester: true, department: true },
    });

    if (!requisition) throw new NotFoundException('Requisition not found');
    return requisition;
  }

  async update(id: string, dto: UpdateRequisitionDto) {
    await this.findOne(id);

    const data: Prisma.RequisitionSlipUpdateInput = {
      department: dto.departmentId
        ? { connect: { id: dto.departmentId } }
        : undefined,
      dateRequested: dto.dateRequested ? new Date(dto.dateRequested) : undefined,
      dateNeeded: dto.dateNeeded ? new Date(dto.dateNeeded) : undefined,
      purpose: dto.purpose,
      status: dto.status,
    };

    if (dto.items) {
      data.items = {
        deleteMany: { requisitionSlipId: id },
        create: dto.items.map((item) => this.toCreateItem(item)),
      };
    }

    return this.prisma.requisitionSlip.update({
      where: { id },
      data,
      include: { items: true, requester: true, department: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.requisitionSlip.delete({ where: { id } });
  }

  /**
   * Submit requisition for approval (DRAFT -> SUBMITTED -> PENDING_APPROVAL)
   */
  async submit(id: string) {
    const requisition = await this.findOne(id);
    
    if (requisition.status !== RequisitionStatus.DRAFT) {
      throw new Error('Only draft requisitions can be submitted');
    }

    return this.prisma.requisitionSlip.update({
      where: { id },
      data: {
        status: RequisitionStatus.SUBMITTED,
        currentApprovalLevel: 0,
      },
      include: { items: true, requester: true, department: true },
    });
  }

  /**
   * Approve requisition at current level
   */
  async approve(id: string, userId: string, comments?: string) {
    const requisition = await this.findOne(id);

    const allowedStatuses: RequisitionStatus[] = [RequisitionStatus.SUBMITTED, RequisitionStatus.PENDING_APPROVAL];
    if (!allowedStatuses.includes(requisition.status)) {
      throw new Error('Requisition cannot be approved in current status');
    }

    // Get approvers for this department to determine approval levels
    const approvers = await this.prisma.approver.findMany({
      where: {
        departmentId: requisition.departmentId,
        isActive: true,
      },
      orderBy: { approvalLevel: 'asc' },
    });

    const nextLevel = requisition.currentApprovalLevel + 1;
    const isLastLevel = nextLevel >= approvers.length;

    return this.prisma.$transaction(async (tx) => {
      // Create approval record
      await tx.approvalRecord.create({
        data: {
          entityType: 'RequisitionSlip',
          entityId: id,
          approvalLevel: nextLevel,
          approvedBy: userId,
          comments,
        },
      });

      // Update requisition status
      return tx.requisitionSlip.update({
        where: { id },
        data: {
          currentApprovalLevel: nextLevel,
          status: isLastLevel ? RequisitionStatus.APPROVED : RequisitionStatus.PENDING_APPROVAL,
        },
        include: { items: true, requester: true, department: true },
      });
    });
  }

  /**
   * Reject requisition
   */
  async reject(id: string, userId: string, comments?: string) {
    const requisition = await this.findOne(id);

    const allowedStatuses: RequisitionStatus[] = [RequisitionStatus.SUBMITTED, RequisitionStatus.PENDING_APPROVAL];
    if (!allowedStatuses.includes(requisition.status)) {
      throw new Error('Requisition cannot be rejected in current status');
    }

    return this.prisma.$transaction(async (tx) => {
      // Create rejection record
      await tx.approvalRecord.create({
        data: {
          entityType: 'RequisitionSlip',
          entityId: id,
          approvalLevel: requisition.currentApprovalLevel + 1,
          rejectedBy: userId,
          comments,
        },
      });

      // Update requisition status
      return tx.requisitionSlip.update({
        where: { id },
        data: { status: RequisitionStatus.REJECTED },
        include: { items: true, requester: true, department: true },
      });
    });
  }

  /**
   * Cancel requisition (can only be done by requester or admin)
   */
  async cancel(id: string) {
    const requisition = await this.findOne(id);

    const disallowedStatuses: RequisitionStatus[] = [RequisitionStatus.APPROVED, RequisitionStatus.COMPLETED, RequisitionStatus.CANCELLED];
    if (disallowedStatuses.includes(requisition.status)) {
      throw new Error('Requisition cannot be cancelled in current status');
    }

    return this.prisma.requisitionSlip.update({
      where: { id },
      data: { status: RequisitionStatus.CANCELLED },
      include: { items: true, requester: true, department: true },
    });
  }

  /**
   * Get approval history for a requisition
   */
  async getApprovalHistory(id: string) {
    await this.findOne(id); // Verify requisition exists

    return this.prisma.approvalRecord.findMany({
      where: {
        entityType: 'RequisitionSlip',
        entityId: id,
      },
      include: {
        approver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        rejector: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { approvalLevel: 'asc' },
    });
  }
}
