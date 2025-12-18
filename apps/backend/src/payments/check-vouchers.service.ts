import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, CheckVoucher, CheckVoucherStatus, RFPStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CheckVouchersService {
  constructor(private prisma: PrismaService) {}

  async generate(paymentId: string, userId: string): Promise<CheckVoucher> {
    // Verify RFP exists and is APPROVED
    const rfp = await this.prisma.requisitionForPayment.findUnique({
      where: { id: paymentId },
    });

    if (!rfp) {
      throw new NotFoundException(`RFP with ID ${paymentId} not found`);
    }

    if (rfp.status !== RFPStatus.APPROVED) {
      throw new BadRequestException(
        `Can only generate CV from APPROVED RFP. Current status: ${rfp.status}`,
      );
    }

    // Check if CV already exists
    const existing = await this.prisma.checkVoucher.findUnique({
      where: { requisitionForPaymentId: paymentId },
    });

    if (existing) {
      throw new BadRequestException('Check Voucher already exists for this RFP');
    }

    // Generate unique CV number
    const cvNumber = `CV-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

    return this.prisma.$transaction(async (tx) => {
      // Create CV
      const cv = await tx.checkVoucher.create({
        data: {
          cvNumber,
          requisitionForPaymentId: paymentId,
          payee: rfp.payee,
          amount: rfp.amount,
          particulars: rfp.particulars,
          status: CheckVoucherStatus.DRAFT,
        },
        include: {
          requisitionForPayment: {
            include: {
              requester: true,
              department: true,
            },
          },
        },
      });

      // Update RFP status to CV_GENERATED
      await tx.requisitionForPayment.update({
        where: { id: paymentId },
        data: {
          status: RFPStatus.CV_GENERATED,
        },
      });

      // Create approval record
      await tx.approvalRecord.create({
        data: {
          entityType: 'CheckVoucher',
          entityId: cv.id,
          approvalLevel: 1,
          comments: 'CV generated from approved RFP',
          timestamp: new Date(),
        },
      });

      return cv;
    });
  }

  async findAll(): Promise<CheckVoucher[]> {
    return this.prisma.checkVoucher.findMany({
      include: {
        requisitionForPayment: {
          include: {
            requester: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<CheckVoucher> {
    const cv = await this.prisma.checkVoucher.findUnique({
      where: { id },
      include: {
        requisitionForPayment: {
          include: {
            requester: true,
            department: true,
          },
        },
      },
    });

    if (!cv) {
      throw new NotFoundException(`Check Voucher with ID ${id} not found`);
    }

    return cv;
  }

  async verify(id: string, verifierId: string): Promise<CheckVoucher> {
    const cv = await this.findOne(id);

    if (cv.status !== CheckVoucherStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot verify CV in ${cv.status} status. CV must be in DRAFT status.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.checkVoucher.update({
        where: { id },
        data: {
          status: CheckVoucherStatus.VERIFIED,
          verifiedBy: verifierId,
        },
        include: {
          requisitionForPayment: {
            include: {
              requester: true,
              department: true,
            },
          },
        },
      });

      await tx.approvalRecord.create({
        data: {
          entityType: 'CheckVoucher',
          entityId: id,
          approvalLevel: 2,
          approvedBy: verifierId,
          comments: 'CV verified by Finance',
          timestamp: new Date(),
        },
      });

      return updated;
    });
  }

  async approve(id: string, approverId: string): Promise<CheckVoucher> {
    const cv = await this.findOne(id);

    if (cv.status !== CheckVoucherStatus.VERIFIED) {
      throw new BadRequestException(
        `Cannot approve CV in ${cv.status} status. CV must be VERIFIED.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.checkVoucher.update({
        where: { id },
        data: {
          status: CheckVoucherStatus.APPROVED,
          approvedBy: approverId,
        },
        include: {
          requisitionForPayment: {
            include: {
              requester: true,
              department: true,
            },
          },
        },
      });

      await tx.approvalRecord.create({
        data: {
          entityType: 'CheckVoucher',
          entityId: id,
          approvalLevel: 3,
          approvedBy: approverId,
          comments: 'CV approved by Accounting Head',
          timestamp: new Date(),
        },
      });

      return updated;
    });
  }

  async findByRFPId(rfpId: string): Promise<CheckVoucher | null> {
    return this.prisma.checkVoucher.findUnique({
      where: { requisitionForPaymentId: rfpId },
      include: {
        requisitionForPayment: {
          include: {
            requester: true,
            department: true,
          },
        },
      },
    });
  }
}
