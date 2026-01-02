import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, RequisitionForPayment, RFPStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequisitionForPaymentDto, UpdateRequisitionForPaymentDto } from './dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateRequisitionForPaymentDto): Promise<RequisitionForPayment> {
    // Create the record first to get auto-incremented rfpSeq
    const created = await this.prisma.requisitionForPayment.create({
      data: {
        rfpNumber: 'TEMP', // Temporary placeholder
        requesterId: data.requesterId,
        departmentId: data.departmentId,
        seriesCode: data.seriesCode,
        dateRequested: data.dateRequested,
        dateNeeded: data.dateNeeded,
        payee: data.payee,
        particulars: data.particulars,
        amount: data.amount,
        currency: data.currency || 'PHP',
        requisitionSlipId: data.requisitionSlipId,
        status: RFPStatus.DRAFT,
        currentApprovalLevel: 0,
      },
    });

    // Generate the formatted RFP number with the sequence
    const rfpNumber = `RFP-${created.rfpSeq.toString().padStart(6, '0')}`;

    // Update the record with the proper rfpNumber
    const result = await this.prisma.requisitionForPayment.update({
      where: { id: created.id },
      data: { rfpNumber },
      include: {
        requester: true,
        department: true,
        checkVoucher: true,
      },
    });

    // Associate files if fileIds provided
    if (data.fileIds && data.fileIds.length > 0) {
      await this.prisma.fileUpload.updateMany({
        where: { id: { in: data.fileIds } },
        data: { requisitionForPaymentId: created.id },
      });
    }

    return result;
  }

  async findAll(filters?: {
    status?: RFPStatus;
    payee?: string;
    departmentId?: string;
  }): Promise<RequisitionForPayment[]> {
    return this.prisma.requisitionForPayment.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.payee && { payee: { contains: filters.payee, mode: 'insensitive' } }),
        ...(filters?.departmentId && { departmentId: filters.departmentId }),
      },
      include: {
        requester: true,
        department: true,
        checkVoucher: {
          include: {
            check: {
              include: {
                bankAccount: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<any> {
    const rfp = await this.prisma.requisitionForPayment.findUnique({
      where: { id },
      include: {
        requester: true,
        department: true,
        checkVoucher: {
          include: {
            check: {
              include: {
                bankAccount: true,
              },
            },
          },
        },
      },
    });

    if (!rfp) {
      throw new NotFoundException(`RFP with ID ${id} not found`);
    }

    // Fetch approval records separately
    const approvalRecords = await this.prisma.approvalRecord.findMany({
      where: {
        entityType: 'RequisitionForPayment',
        entityId: id,
      },
      include: {
        submitter: true,
        approver: true,
        rejector: true,
      },
      orderBy: { timestamp: 'desc' },
    });

    return { ...rfp, approvalRecords };
  }

  async update(id: string, data: UpdateRequisitionForPaymentDto): Promise<RequisitionForPayment> {
    const rfp = await this.findOne(id);

    // Can only update DRAFT RFPs
    if (rfp.status !== RFPStatus.DRAFT) {
      throw new BadRequestException('Can only update RFP in DRAFT status');
    }

    return this.prisma.requisitionForPayment.update({
      where: { id },
      data: {
        ...(data.departmentId && { department: { connect: { id: data.departmentId } } }),
        ...(data.seriesCode && { seriesCode: data.seriesCode }),
        ...(data.dateRequested && { dateRequested: data.dateRequested }),
        ...(data.dateNeeded && { dateNeeded: data.dateNeeded }),
        ...(data.payee && { payee: data.payee }),
        ...(data.particulars && { particulars: data.particulars }),
        ...(data.amount && { amount: data.amount }),
      },
      include: {
        requester: true,
        department: true,
        checkVoucher: true,
      },
    });
  }

  async remove(id: string): Promise<RequisitionForPayment> {
    const rfp = await this.findOne(id);

    // Can only delete DRAFT RFPs
    if (rfp.status !== RFPStatus.DRAFT) {
      throw new BadRequestException('Can only delete RFP in DRAFT status');
    }

    return this.prisma.requisitionForPayment.delete({
      where: { id },
      include: {
        requester: true,
        department: true,
        checkVoucher: true,
      },
    });
  }

  async submit(id: string, userId: string): Promise<RequisitionForPayment> {
    const rfp = await this.findOne(id);

    if (rfp.status !== RFPStatus.DRAFT) {
      throw new BadRequestException(`Cannot submit RFP in ${rfp.status} status`);
    }

    // Verify user is the requester
    if (rfp.requesterId !== userId) {
      throw new ForbiddenException('Only the requester can submit this RFP');
    }

    return this.prisma.$transaction(async (tx) => {
      // Get approvers for this department to determine approval levels
      const approvers = await tx.approver.findMany({
        where: {
          departmentId: rfp.departmentId,
          isActive: true,
        },
        orderBy: { approvalLevel: 'asc' },
      });

      const maxApprovalLevel =
        approvers.length > 0 ? Math.max(...approvers.map((a) => a.approvalLevel)) : 1;

      // Update RFP status
      const updated = await tx.requisitionForPayment.update({
        where: { id },
        data: {
          status: RFPStatus.SUBMITTED,
          currentApprovalLevel: 1,
        },
        include: {
          requester: true,
          department: true,
          checkVoucher: true,
        },
      });

      // Create submission record (level 0)
      await tx.approvalRecord.create({
        data: {
          entityType: 'RequisitionForPayment',
          entityId: id,
          approvalLevel: 0,
          submittedBy: userId,
          comments: 'Submitted for approval',
          timestamp: new Date(),
        },
      });

      // Create pending approval record for level 1 only
      // Subsequent levels will be created when previous level is approved
      await tx.approvalRecord.create({
        data: {
          entityType: 'RequisitionForPayment',
          entityId: id,
          approvalLevel: 1,
          comments: `Awaiting approval at level 1`,
          timestamp: new Date(),
        },
      });

      return updated;
    });
  }

  async approve(id: string, approverId: string): Promise<RequisitionForPayment> {
    const rfp = await this.findOne(id);

    if (rfp.status !== RFPStatus.SUBMITTED) {
      throw new BadRequestException(
        `Cannot approve RFP in ${rfp.status} status. RFP must be SUBMITTED.`,
      );
    }

    // Verify approver exists and has appropriate role
    const approver = await this.prisma.user.findUnique({
      where: { id: approverId },
    });

    if (!approver) {
      throw new NotFoundException(`Approver with ID ${approverId} not found`);
    }

    // Get approvers for this department to determine approval levels
    const approvers = await this.prisma.approver.findMany({
      where: {
        departmentId: rfp.departmentId,
        isActive: true,
      },
      orderBy: { approvalLevel: 'asc' },
    });

    const currentLevel = rfp.currentApprovalLevel;
    const maxApprovalLevel =
      approvers.length > 0 ? Math.max(...approvers.map((a) => a.approvalLevel)) : 1;
    const isLastLevel = currentLevel >= maxApprovalLevel;

    return this.prisma.$transaction(async (tx) => {
      // Find the pending approval record for current level
      const pendingRecord = await tx.approvalRecord.findFirst({
        where: {
          entityType: 'RequisitionForPayment',
          entityId: id,
          approvalLevel: rfp.currentApprovalLevel,
          approvedBy: null,
          rejectedBy: null,
        },
      });

      // Update the pending record with approval
      if (pendingRecord) {
        await tx.approvalRecord.update({
          where: { id: pendingRecord.id },
          data: {
            approvedBy: approverId,
            comments: 'Approved',
            timestamp: new Date(),
          },
        });
      }

      // If not the last level, create pending approval record for next level
      if (!isLastLevel) {
        await tx.approvalRecord.create({
          data: {
            entityType: 'RequisitionForPayment',
            entityId: id,
            approvalLevel: currentLevel + 1,
            comments: `Awaiting approval at level ${currentLevel + 1}`,
            timestamp: new Date(),
          },
        });
      }

      // Update RFP status
      const updated = await tx.requisitionForPayment.update({
        where: { id },
        data: {
          currentApprovalLevel: isLastLevel ? currentLevel : currentLevel + 1,
          status: isLastLevel ? RFPStatus.APPROVED : RFPStatus.SUBMITTED,
        },
        include: {
          requester: true,
          department: true,
          checkVoucher: true,
        },
      });

      return updated;
    });
  }

  async reject(id: string, rejectorId: string, reason?: string): Promise<RequisitionForPayment> {
    const rfp = await this.findOne(id);

    if (rfp.status !== RFPStatus.SUBMITTED) {
      throw new BadRequestException(
        `Cannot reject RFP in ${rfp.status} status. RFP must be SUBMITTED.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Find the pending approval record for current level
      const pendingRecord = await tx.approvalRecord.findFirst({
        where: {
          entityType: 'RequisitionForPayment',
          entityId: id,
          approvalLevel: rfp.currentApprovalLevel,
          approvedBy: null,
          rejectedBy: null,
        },
      });

      // Update the pending record with rejection
      if (pendingRecord) {
        await tx.approvalRecord.update({
          where: { id: pendingRecord.id },
          data: {
            rejectedBy: rejectorId,
            comments: reason || 'Rejected',
            timestamp: new Date(),
          },
        });
      }

      // Update RFP status
      const updated = await tx.requisitionForPayment.update({
        where: { id },
        data: {
          status: RFPStatus.REJECTED,
          currentApprovalLevel: 0,
        },
        include: {
          requester: true,
          department: true,
          checkVoucher: true,
        },
      });

      return updated;
    });
  }

  async cancel(id: string, userId: string): Promise<RequisitionForPayment> {
    const rfp = await this.findOne(id);

    if (rfp.status !== RFPStatus.DRAFT && rfp.status !== RFPStatus.SUBMITTED) {
      throw new BadRequestException(`Cannot cancel RFP in ${rfp.status} status`);
    }

    // Verify user is requester
    if (rfp.requesterId !== userId) {
      throw new ForbiddenException('Only the requester can cancel this RFP');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.requisitionForPayment.update({
        where: { id },
        data: {
          status: RFPStatus.CANCELLED,
          currentApprovalLevel: 0,
        },
        include: {
          requester: true,
          department: true,
          checkVoucher: true,
        },
      });

      await tx.approvalRecord.create({
        data: {
          entityType: 'RequisitionForPayment',
          entityId: id,
          approvalLevel: 0,
          comments: 'RFP cancelled by requester',
          timestamp: new Date(),
        },
      });

      return updated;
    });
  }
}
