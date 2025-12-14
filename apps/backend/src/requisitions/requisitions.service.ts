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
}
