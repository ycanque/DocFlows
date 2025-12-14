import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private stripPassword<T extends { password?: string }>(user: T) {
    // Remove password before returning user payloads
    const { password, ...rest } = user;
    return rest;
  }

  async create(dto: CreateUserDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role ?? UserRole.USER,
        departmentId: dto.departmentId,
      },
    });

    return this.stripPassword(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.stripPassword(user));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.stripPassword(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const data: Record<string, unknown> = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.prisma.user.update({ where: { id }, data });
    return this.stripPassword(user);
  }

  async remove(id: string) {
    const user = await this.prisma.user.delete({ where: { id } });
    return this.stripPassword(user);
  }
}
