import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, RequisitionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequisitionDto } from './dto/create-requisition.dto';
import { CreateRequestItemDto } from './dto/create-request-item.dto';
import { UpdateRequisitionDto } from './dto/update-requisition.dto';

/**
 * Approval Levels for the standardized RBAC hierarchy
 */
const APPROVAL_LEVELS = {
  DEPARTMENT_MANAGER: 1,
  UNIT_MANAGER: 2,
  GENERAL_MANAGER: 3,
};

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

  /**
   * Get the Business Unit ID for a department
   */
  private async getDepartmentBusinessUnit(departmentId: string): Promise<string | null> {
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
      select: { businessUnitId: true },
    });
    return department?.businessUnitId ?? null;
  }

  /**
   * Find approvers for a specific Business Unit and approval level
   * This implements the BU-level approval matrix
   */
  private async findApproverForLevel(businessUnitId: string | null, approvalLevel: number) {
    // For GM level (3), find approver without BU restriction (GM approves across all)
    if (approvalLevel === APPROVAL_LEVELS.GENERAL_MANAGER) {
      return this.prisma.approver.findFirst({
        where: {
          approvalLevel,
          isActive: true,
          // GM has no departmentId or businessUnitId restriction
          departmentId: null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    }

    // For levels 1 and 2, find approver by BU
    return this.prisma.approver.findFirst({
      where: {
        approvalLevel,
        isActive: true,
        OR: [
          { businessUnitId }, // Explicit BU assignment
          { department: { businessUnitId } }, // Department in the BU
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Get maximum approval level configured for a Business Unit
   */
  private async getMaxApprovalLevel(businessUnitId: string | null): Promise<number> {
    // Check what approval levels are configured
    const approvers = await this.prisma.approver.findMany({
      where: {
        isActive: true,
        OR: [
          { businessUnitId },
          { department: { businessUnitId } },
          { departmentId: null }, // GM level
        ],
      },
      select: { approvalLevel: true },
      distinct: ['approvalLevel'],
    });

    if (approvers.length === 0) return 1; // Default to 1 level if none configured
    return Math.max(...approvers.map((a) => a.approvalLevel));
  }

  async create(dto: CreateRequisitionDto) {
    // Get the business unit from the requester's department
    const businessUnitId =
      dto.businessUnitId || (await this.getDepartmentBusinessUnit(dto.departmentId));

    // Create the record first to get auto-incremented reqSeq
    const created = await this.prisma.requisitionSlip.create({
      data: {
        requisitionNumber: 'TEMP', // Temporary placeholder
        requesterId: dto.requesterId,
        departmentId: dto.departmentId,
        receivingDepartmentId: dto.receivingDepartmentId,
        costCenterId: dto.costCenterId,
        projectId: dto.projectId,
        businessUnitId: businessUnitId,
        type: dto.type,
        dateRequested: new Date(dto.dateRequested),
        dateNeeded: new Date(dto.dateNeeded),
        purpose: dto.purpose,
        currency: dto.currency ?? 'PHP',
        status: dto.status ?? RequisitionStatus.DRAFT,
        items: {
          create: dto.items?.map((item) => this.toCreateItem(item)) ?? [],
        },
      },
    });

    // Generate the formatted requisition number with the sequence
    const requisitionNumber = `REQ-${created.reqSeq.toString().padStart(6, '0')}`;

    // Link attached files if provided
    if (dto.fileIds && dto.fileIds.length > 0) {
      await this.prisma.fileUpload.updateMany({
        where: {
          id: { in: dto.fileIds },
          userId: dto.requesterId, // Security: only link user's own files
        },
        data: {
          requisitionSlipId: created.id,
        },
      });
    }

    // Update the record with the proper requisitionNumber
    return this.prisma.requisitionSlip.update({
      where: { id: created.id },
      data: { requisitionNumber },
      include: {
        items: true,
        requester: true,
        department: {
          include: { businessUnit: true },
        },
        receivingDepartment: true,
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
        department: {
          include: { businessUnit: true },
        },
        receivingDepartment: true,
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
          in: [
            RequisitionStatus.PENDING_APPROVAL,
            RequisitionStatus.APPROVED,
            RequisitionStatus.COMPLETED,
          ],
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
        department: {
          include: { businessUnit: true },
        },
        receivingDepartment: true,
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
      include: {
        items: true,
        requester: true,
        department: {
          include: { businessUnit: true },
        },
        receivingDepartment: true,
        costCenter: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.requisitionSlip.delete({ where: { id } });
  }

  /**
   * Submit requisition for approval (DRAFT -> PENDING_APPROVAL)
   * Uses BU-level approval matrix
   */
  async submit(id: string, userId: string) {
    const requisition = await this.findOne(id);

    if (requisition.status !== RequisitionStatus.DRAFT) {
      throw new BadRequestException('Only draft requisitions can be submitted');
    }

    // Get the BU for the requester's department (approval routing)
    const businessUnitId =
      requisition.businessUnitId ||
      requisition.department?.businessUnitId ||
      (await this.getDepartmentBusinessUnit(requisition.departmentId));

    // Get max approval level for this BU
    const maxApprovalLevel = await this.getMaxApprovalLevel(businessUnitId);

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

      // Create pending approval record for level 1 (Department Manager)
      await tx.approvalRecord.create({
        data: {
          entityType: 'RequisitionSlip',
          entityId: id,
          approvalLevel: APPROVAL_LEVELS.DEPARTMENT_MANAGER,
          comments: `Awaiting Department Manager approval`,
        },
      });

      // Update requisition status and ensure BU is set
      return tx.requisitionSlip.update({
        where: { id },
        data: {
          status: RequisitionStatus.PENDING_APPROVAL,
          currentApprovalLevel: APPROVAL_LEVELS.DEPARTMENT_MANAGER,
          businessUnitId: businessUnitId,
        },
        include: {
          items: true,
          requester: true,
          department: {
            include: { businessUnit: true },
          },
          receivingDepartment: true,
        },
      });
    });
  }

  /**
   * Approve requisition at current level
   * Implements BU-level approval matrix:
   * Level 1: Department Manager
   * Level 2: Unit Manager
   * Level 3: General Manager
   */
  async approve(id: string, userId: string, comments?: string) {
    const requisition = await this.findOne(id);

    const allowedStatuses: RequisitionStatus[] = [
      RequisitionStatus.SUBMITTED,
      RequisitionStatus.PENDING_APPROVAL,
    ];
    if (!allowedStatuses.includes(requisition.status)) {
      throw new BadRequestException('Requisition cannot be approved in current status');
    }

    // Get BU for approval routing
    const businessUnitId = requisition.businessUnitId || requisition.department?.businessUnitId;

    // Verify the user is an authorized approver for this level and BU
    const approverRecord = await this.prisma.approver.findFirst({
      where: {
        userId,
        approvalLevel: requisition.currentApprovalLevel,
        isActive: true,
        OR: [
          // BU-level approver
          { businessUnitId },
          // Department-level approver within the BU
          { department: { businessUnitId } },
          // GM (level 3) can approve anything
          {
            AND: [{ approvalLevel: APPROVAL_LEVELS.GENERAL_MANAGER }, { departmentId: null }],
          },
        ],
      },
    });

    if (!approverRecord) {
      throw new BadRequestException(
        `You are not authorized to approve at level ${requisition.currentApprovalLevel} for this Business Unit`,
      );
    }

    const currentLevel = requisition.currentApprovalLevel;
    const maxApprovalLevel = await this.getMaxApprovalLevel(businessUnitId);
    const isLastLevel = currentLevel >= maxApprovalLevel;

    // Determine next level label for comments
    const levelLabels: Record<number, string> = {
      [APPROVAL_LEVELS.DEPARTMENT_MANAGER]: 'Department Manager',
      [APPROVAL_LEVELS.UNIT_MANAGER]: 'Unit Manager',
      [APPROVAL_LEVELS.GENERAL_MANAGER]: 'General Manager',
    };

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
        await tx.approvalRecord.update({
          where: { id: existingRecord.id },
          data: {
            approvedBy: userId,
            comments:
              comments || `Approved by ${levelLabels[currentLevel] || `Level ${currentLevel}`}`,
            timestamp: new Date(),
          },
        });
      } else {
        await tx.approvalRecord.create({
          data: {
            entityType: 'RequisitionSlip',
            entityId: id,
            approvalLevel: currentLevel,
            approvedBy: userId,
            comments:
              comments || `Approved by ${levelLabels[currentLevel] || `Level ${currentLevel}`}`,
          },
        });
      }

      // If not the last level, create pending approval record for next level
      if (!isLastLevel) {
        const nextLevel = currentLevel + 1;
        await tx.approvalRecord.create({
          data: {
            entityType: 'RequisitionSlip',
            entityId: id,
            approvalLevel: nextLevel,
            comments: `Awaiting ${levelLabels[nextLevel] || `Level ${nextLevel}`} approval`,
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
        include: {
          items: true,
          requester: true,
          department: {
            include: { businessUnit: true },
          },
          receivingDepartment: true,
        },
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
      throw new BadRequestException('Requisition cannot be rejected in current status');
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
        await tx.approvalRecord.update({
          where: { id: existingRecord.id },
          data: {
            rejectedBy: userId,
            comments: comments || `Rejected at level ${requisition.currentApprovalLevel}`,
            timestamp: new Date(),
          },
        });
      } else {
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
        include: {
          items: true,
          requester: true,
          department: {
            include: { businessUnit: true },
          },
          receivingDepartment: true,
        },
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
      throw new BadRequestException('Requisition cannot be cancelled in current status');
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
        include: {
          items: true,
          requester: true,
          department: {
            include: { businessUnit: true },
          },
          receivingDepartment: true,
        },
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
