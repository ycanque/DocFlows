import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RequisitionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequisitionDto } from './dto/create-requisition.dto';
import { CreateRequestItemDto } from './dto/create-request-item.dto';
import { UpdateRequisitionDto } from './dto/update-requisition.dto';

@Injectable()
export class RequisitionsService {
  constructor(private readonly prisma: PrismaService) {}

  private toCreateItem(
    item: CreateRequestItemDto,
  ): Prisma.RequestItemCreateWithoutRequisitionSlipInput {
    return {
      quantity: item.quantity,
      unit: item.unit,
      particulars: item.particulars,
      specification: item.specification,
      unitCost: item.unitCost,
      subtotal: item.subtotal,
    };
  }

  async create(dto: CreateRequisitionDto) {
    return this.prisma.requisitionSlip.create({
      data: {
        requisitionNumber: `REQ-${Date.now()}`,
        requesterId: dto.requesterId,
        departmentId: dto.departmentId,
        costCenterId: dto.costCenterId,
        projectId: dto.projectId,
        businessUnitId: dto.businessUnitId,
        dateRequested: new Date(dto.dateRequested),
        dateNeeded: new Date(dto.dateNeeded),
        purpose: dto.purpose,
        currency: dto.currency ?? 'PHP',
        status: dto.status ?? RequisitionStatus.DRAFT,
        items: {
          create: dto.items?.map((item) => this.toCreateItem(item)) ?? [],
        },
      },
      include: {
        items: true,
        requester: true,
        department: true,
        costCenter: true,
        project: true,
        businessUnit: true,
      },
    });
  }

  findAll() {
    return this.prisma.requisitionSlip.findMany({
      include: {
        items: true,
        requester: true,
        department: true,
        costCenter: true,
        project: true,
        businessUnit: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async search(query: string) {
    // Only search by requisition number to avoid UUID parsing errors
    // Limit results for performance
    const requisitions = await this.prisma.requisitionSlip.findMany({
      where: {
        requisitionNumber: {
          contains: query,
          mode: 'insensitive',
        },
        // Only include submitted or approved requisitions that can be referenced in payments
        status: {
          in: [RequisitionStatus.PENDING_APPROVAL, RequisitionStatus.APPROVED, RequisitionStatus.COMPLETED],
        },
      },
      select: {
        id: true,
        requisitionNumber: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10, // Limit to 10 results for performance
    });

    return requisitions;
  }

  async findOne(id: string) {
    const requisition = await this.prisma.requisitionSlip.findUnique({
      where: { id },
      include: {
        items: true,
        requester: true,
        department: true,
        costCenter: true,
        project: true,
        businessUnit: true,
      },
    });

    if (!requisition) throw new NotFoundException('Requisition not found');
    return requisition;
  }

  async update(id: string, dto: UpdateRequisitionDto) {
    await this.findOne(id);

    const data: Prisma.RequisitionSlipUpdateInput = {
      department: dto.departmentId ? { connect: { id: dto.departmentId } } : undefined,
      costCenter: dto.costCenterId ? { connect: { id: dto.costCenterId } } : undefined,
      dateRequested: dto.dateRequested ? new Date(dto.dateRequested) : undefined,
      dateNeeded: dto.dateNeeded ? new Date(dto.dateNeeded) : undefined,
      purpose: dto.purpose,
      currency: dto.currency,
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
      include: { items: true, requester: true, department: true, costCenter: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.requisitionSlip.delete({ where: { id } });
  }

  /**
   * Submit requisition for approval (DRAFT -> PENDING_APPROVAL)
   */
  async submit(id: string, userId: string) {
    const requisition = await this.findOne(id);

    if (requisition.status !== RequisitionStatus.DRAFT) {
      throw new Error('Only draft requisitions can be submitted');
    }

    // Get approvers for this department to determine approval levels
    const approvers = await this.prisma.approver.findMany({
      where: {
        departmentId: requisition.departmentId,
        isActive: true,
      },
      orderBy: { approvalLevel: 'asc' },
    });

    const maxApprovalLevel =
      approvers.length > 0 ? Math.max(...approvers.map((a) => a.approvalLevel)) : 1;

    return this.prisma.$transaction(async (tx) => {
      // Create submission record (level 0)
      await tx.approvalRecord.create({
        data: {
          entityType: 'RequisitionSlip',
          entityId: id,
          approvalLevel: 0,
          submittedBy: userId,
          comments: 'Submitted for approval',
        },
      });

      // Create pending approval records for each required level
      for (let level = 1; level <= maxApprovalLevel; level++) {
        await tx.approvalRecord.create({
          data: {
            entityType: 'RequisitionSlip',
            entityId: id,
            approvalLevel: level,
            comments: `Awaiting approval at level ${level}`,
          },
        });
      }

      // Update requisition status
      return tx.requisitionSlip.update({
        where: { id },
        data: {
          status: RequisitionStatus.PENDING_APPROVAL,
          currentApprovalLevel: 1, // Start at level 1 for approval
        },
        include: { items: true, requester: true, department: true },
      });
    });
  }

  /**
   * Approve requisition at current level
   */
  async approve(id: string, userId: string, comments?: string) {
    const requisition = await this.findOne(id);

    const allowedStatuses: RequisitionStatus[] = [
      RequisitionStatus.SUBMITTED,
      RequisitionStatus.PENDING_APPROVAL,
    ];
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

    const currentLevel = requisition.currentApprovalLevel;
    const maxApprovalLevel =
      approvers.length > 0 ? Math.max(...approvers.map((a) => a.approvalLevel)) : 1;
    const isLastLevel = currentLevel >= maxApprovalLevel;

    return this.prisma.$transaction(async (tx) => {
      // Find and update the existing approval record for the current level
      const existingRecord = await tx.approvalRecord.findFirst({
        where: {
          entityType: 'RequisitionSlip',
          entityId: id,
          approvalLevel: currentLevel,
        },
      });

      if (existingRecord) {
        // Update existing record with approval
        console.log(`Updating approval record ${existingRecord.id} with approvedBy: ${userId}`);
        const updated = await tx.approvalRecord.update({
          where: { id: existingRecord.id },
          data: {
            approvedBy: userId,
            comments: comments || `Approved at level ${currentLevel}`,
            timestamp: new Date(),
          },
        });
        console.log(`Updated approval record:`, updated);
      } else {
        // Create new approval record if it doesn't exist (fallback)
        await tx.approvalRecord.create({
          data: {
            entityType: 'RequisitionSlip',
            entityId: id,
            approvalLevel: currentLevel,
            approvedBy: userId,
            comments: comments || `Approved at level ${currentLevel}`,
          },
        });
      }

      // Update requisition status
      return tx.requisitionSlip.update({
        where: { id },
        data: {
          currentApprovalLevel: isLastLevel ? currentLevel : currentLevel + 1,
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

    const allowedStatuses: RequisitionStatus[] = [
      RequisitionStatus.SUBMITTED,
      RequisitionStatus.PENDING_APPROVAL,
    ];
    if (!allowedStatuses.includes(requisition.status)) {
      throw new Error('Requisition cannot be rejected in current status');
    }

    return this.prisma.$transaction(async (tx) => {
      // Find and update the existing approval record for the current level
      const existingRecord = await tx.approvalRecord.findFirst({
        where: {
          entityType: 'RequisitionSlip',
          entityId: id,
          approvalLevel: requisition.currentApprovalLevel,
        },
      });

      if (existingRecord) {
        // Update existing record with rejection
        await tx.approvalRecord.update({
          where: { id: existingRecord.id },
          data: {
            rejectedBy: userId,
            comments: comments || `Rejected at level ${requisition.currentApprovalLevel}`,
            timestamp: new Date(),
          },
        });
      } else {
        // Create new rejection record if it doesn't exist (fallback)
        await tx.approvalRecord.create({
          data: {
            entityType: 'RequisitionSlip',
            entityId: id,
            approvalLevel: requisition.currentApprovalLevel,
            rejectedBy: userId,
            comments,
          },
        });
      }

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
  async cancel(id: string, userId: string) {
    const requisition = await this.findOne(id);

    const disallowedStatuses: RequisitionStatus[] = [
      RequisitionStatus.APPROVED,
      RequisitionStatus.COMPLETED,
      RequisitionStatus.CANCELLED,
    ];
    if (disallowedStatuses.includes(requisition.status)) {
      throw new Error('Requisition cannot be cancelled in current status');
    }

    return this.prisma.$transaction(async (tx) => {
      // Create cancellation record
      await tx.approvalRecord.create({
        data: {
          entityType: 'RequisitionSlip',
          entityId: id,
          approvalLevel: -1, // Use -1 to indicate cancellation
          submittedBy: userId,
          comments: 'Requisition cancelled',
        },
      });

      // Update requisition status
      return tx.requisitionSlip.update({
        where: { id },
        data: { status: RequisitionStatus.CANCELLED },
        include: { items: true, requester: true, department: true },
      });
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
        submitter: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
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
