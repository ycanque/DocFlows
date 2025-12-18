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

  async create(
    userId: string,
    departmentId: string,
    data: CreateRequisitionForPaymentDto,
  ): Promise<RequisitionForPayment> {
    // Generate unique RFP number
    const rfpNumber = `RFP-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

    return this.prisma.requisitionForPayment.create({
      data: {
        rfpNumber,
        requesterId: userId,
        departmentId,
        seriesCode: data.seriesCode,
        dateNeeded: data.dateNeeded,
        payee: data.payee,
        particulars: data.particulars,
        amount: data.amount,
        requisitionSlipId: data.requisitionSlipId,
        status: RFPStatus.DRAFT,
        currentApprovalLevel: 0,
      },
      include: {
        requester: true,
        department: true,
        checkVoucher: true,
      },
    });
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
        checkVoucher: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<RequisitionForPayment> {
    const rfp = await this.prisma.requisitionForPayment.findUnique({
      where: { id },
      include: {
        requester: true,
        department: true,
        checkVoucher: true,
      },
    });

    if (!rfp) {
      throw new NotFoundException(`RFP with ID ${id} not found`);
    }

    return rfp;
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
        ...(data.seriesCode && { seriesCode: data.seriesCode }),
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

      // Create approval record
      await tx.approvalRecord.create({
        data: {
          entityType: 'RequisitionForPayment',
          entityId: id,
          approvalLevel: 1,
          submittedBy: userId,
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

    return this.prisma.$transaction(async (tx) => {
      // Update RFP status
      const updated = await tx.requisitionForPayment.update({
        where: { id },
        data: {
          status: RFPStatus.APPROVED,
          currentApprovalLevel: 2,
        },
        include: {
          requester: true,
          department: true,
          checkVoucher: true,
        },
      });

      // Create approval record
      await tx.approvalRecord.create({
        data: {
          entityType: 'RequisitionForPayment',
          entityId: id,
          approvalLevel: 2,
          approvedBy: approverId,
          timestamp: new Date(),
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

      // Create rejection record
      await tx.approvalRecord.create({
        data: {
          entityType: 'RequisitionForPayment',
          entityId: id,
          approvalLevel: 1,
          rejectedBy: rejectorId,
          comments: reason,
          timestamp: new Date(),
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
