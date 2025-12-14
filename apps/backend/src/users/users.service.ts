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
    const users = await this.prisma.user.findMany({
      include: {
        department: true,
        approverProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((user) => this.stripPassword(user));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        department: true,
        approverProfile: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.stripPassword(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id); // Verify user exists
    
    const data: Record<string, unknown> = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: {
        department: true,
        approverProfile: true,
      },
    });
    return this.stripPassword(user);
  }

  async remove(id: string) {
    await this.findOne(id); // Verify user exists
    const user = await this.prisma.user.delete({ where: { id } });
    return this.stripPassword(user);
  }

  /**
   * Find user by email - used for authentication
   */
  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        department: true,
        approverProfile: true,
      },
    });
    return user; // Return with password for auth validation
  }
}
