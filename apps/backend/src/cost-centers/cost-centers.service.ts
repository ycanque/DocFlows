import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CostCentersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.costCenter.findMany({
      where: { isActive: true },
      include: {
        project: true,
        businessUnit: true,
      },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.costCenter.findUnique({
      where: { id },
      include: {
        project: true,
        businessUnit: true,
      },
    });
  }
}
