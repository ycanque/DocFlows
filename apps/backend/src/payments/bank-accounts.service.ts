import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, BankAccount } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBankAccountDto, UpdateBankAccountDto } from './dto';

@Injectable()
export class BankAccountsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateBankAccountDto): Promise<BankAccount> {
    return this.prisma.bankAccount.create({
      data: {
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        bankName: data.bankName,
        isActive: data.isActive ?? true,
      },
    });
  }

  async findAll(): Promise<BankAccount[]> {
    return this.prisma.bankAccount.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<BankAccount> {
    const bankAccount = await this.prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!bankAccount) {
      throw new NotFoundException(`Bank Account with ID ${id} not found`);
    }

    return bankAccount;
  }

  async update(id: string, data: UpdateBankAccountDto): Promise<BankAccount> {
    await this.findOne(id); // Verify exists

    return this.prisma.bankAccount.update({
      where: { id },
      data: {
        ...(data.accountName && { accountName: data.accountName }),
        ...(data.accountNumber && { accountNumber: data.accountNumber }),
        ...(data.bankName && { bankName: data.bankName }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async remove(id: string): Promise<BankAccount> {
    await this.findOne(id); // Verify exists

    return this.prisma.bankAccount.delete({
      where: { id },
    });
  }

  async findActive(): Promise<BankAccount[]> {
    return this.prisma.bankAccount.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
