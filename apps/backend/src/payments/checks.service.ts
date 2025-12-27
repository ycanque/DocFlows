import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, Check, CheckStatus, CheckVoucherStatus, RFPStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChecksService {
  constructor(private prisma: PrismaService) {}

  async issue(
    cvId: string,
    bankAccountId: string,
    checkNumber: string,
    issuedBy: string,
  ): Promise<Check> {
    // Verify CV exists and is APPROVED
    const cv = await this.prisma.checkVoucher.findUnique({
      where: { id: cvId },
      include: {
        requisitionForPayment: true,
      },
    });

    if (!cv) {
      throw new NotFoundException(`Check Voucher with ID ${cvId} not found`);
    }

    if (cv.status !== CheckVoucherStatus.APPROVED) {
      throw new BadRequestException(
        `Can only issue Check from APPROVED CV. Current status: ${cv.status}`,
      );
    }

    // Verify bank account exists
    const bankAccount = await this.prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
    });

    if (!bankAccount) {
      throw new NotFoundException(`Bank Account with ID ${bankAccountId} not found`);
    }

    // Verify check number doesn't already exist
    const existingCheck = await this.prisma.check.findUnique({
      where: { checkNumber },
    });

    if (existingCheck) {
      throw new BadRequestException(`Check with number ${checkNumber} already exists`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Create Check
      const check = await tx.check.create({
        data: {
          checkNumber,
          checkVoucherId: cvId,
          bankAccountId,
          payee: cv.payee,
          amount: cv.amount,
          checkDate: new Date(),
          status: CheckStatus.ISSUED,
          issuedBy,
        },
        include: {
          checkVoucher: {
            include: {
              requisitionForPayment: true,
            },
          },
          bankAccount: true,
        },
      });

      // Update CV status
      await tx.checkVoucher.update({
        where: { id: cvId },
        data: {
          status: CheckVoucherStatus.CHECK_ISSUED,
        },
      });

      // Update RFP status
      const rfpId = cv.requisitionForPaymentId;
      await tx.requisitionForPayment.update({
        where: { id: rfpId },
        data: {
          status: 'CHECK_ISSUED',
        },
      });

      // Create approval record
      await tx.approvalRecord.create({
        data: {
          entityType: 'Check',
          entityId: check.id,
          approvalLevel: 1,
          approvedBy: issuedBy,
          comments: `Check issued: ${checkNumber}`,
          timestamp: new Date(),
        },
      });

      return check;
    });
  }

  async findAll(): Promise<Check[]> {
    return this.prisma.check.findMany({
      include: {
        checkVoucher: {
          include: {
            requisitionForPayment: {
              include: {
                requester: true,
                department: true,
              },
            },
          },
        },
        bankAccount: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Check> {
    const check = await this.prisma.check.findUnique({
      where: { id },
      include: {
        checkVoucher: {
          include: {
            requisitionForPayment: {
              include: {
                requester: true,
                department: true,
              },
            },
          },
        },
        bankAccount: true,
      },
    });

    if (!check) {
      throw new NotFoundException(`Check with ID ${id} not found`);
    }

    return check;
  }

  async clear(id: string, clearedBy: string, receivedBy?: string): Promise<Check> {
    const check = await this.findOne(id);

    if (check.status !== CheckStatus.ISSUED) {
      throw new BadRequestException(
        `Can only disburse ISSUED checks. Current status: ${check.status}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.check.update({
        where: { id },
        data: {
          status: CheckStatus.DISBURSED,
          disbursedBy: clearedBy,
          receivedBy: receivedBy || null,
          disbursementDate: new Date(),
        },
        include: {
          checkVoucher: {
            include: {
              requisitionForPayment: {
                include: {
                  requester: true,
                  department: true,
                },
              },
            },
          },
          bankAccount: true,
        },
      });

      await tx.approvalRecord.create({
        data: {
          entityType: 'Check',
          entityId: id,
          approvalLevel: 2,
          approvedBy: clearedBy,
          comments: 'Check cleared/disbursed',
          timestamp: new Date(),
        },
      });

      // Update RFP status to DISBURSED and create approval record
      if (updated.checkVoucher?.requisitionForPayment) {
        await tx.requisitionForPayment.update({
          where: { id: updated.checkVoucher.requisitionForPaymentId },
          data: {
            status: RFPStatus.DISBURSED,
          },
        });

        await tx.approvalRecord.create({
          data: {
            entityType: 'RequisitionForPayment',
            entityId: updated.checkVoucher.requisitionForPaymentId,
            approvalLevel: 0,
            approvedBy: clearedBy,
            comments: 'Check Disbursed - Payment Complete',
            timestamp: new Date(),
          },
        });
      }

      return updated;
    });
  }

  async findByCheckNumber(checkNumber: string): Promise<Check | null> {
    return this.prisma.check.findUnique({
      where: { checkNumber },
      include: {
        checkVoucher: {
          include: {
            requisitionForPayment: {
              include: {
                requester: true,
                department: true,
              },
            },
          },
        },
        bankAccount: true,
      },
    });
  }

  async void(id: string, voidedBy: string, reason: string): Promise<Check> {
    const check = await this.findOne(id);

    if (check.status !== CheckStatus.ISSUED && check.status !== CheckStatus.DISBURSED) {
      throw new BadRequestException(`Cannot void Check in ${check.status} status`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.check.update({
        where: { id },
        data: {
          status: CheckStatus.VOIDED,
        },
        include: {
          checkVoucher: {
            include: {
              requisitionForPayment: {
                include: {
                  requester: true,
                  department: true,
                },
              },
            },
          },
          bankAccount: true,
        },
      });

      // Create approval record for Check
      await tx.approvalRecord.create({
        data: {
          entityType: 'Check',
          entityId: id,
          approvalLevel: 0,
          comments: `Check voided: ${reason}`,
          timestamp: new Date(),
        },
      });

      // Update RFP status to REJECTED
      if (updated.checkVoucher?.requisitionForPaymentId) {
        await tx.requisitionForPayment.update({
          where: { id: updated.checkVoucher.requisitionForPaymentId },
          data: {
            status: RFPStatus.REJECTED,
          },
        });

        // Create approval record for RFP
        await tx.approvalRecord.create({
          data: {
            entityType: 'RequisitionForPayment',
            entityId: updated.checkVoucher.requisitionForPaymentId,
            approvalLevel: 0,
            comments: `Payment rejected - Check voided: ${reason}`,
            timestamp: new Date(),
          },
        });
      }

      return updated;
    });
  }
}
