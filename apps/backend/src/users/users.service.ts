import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { getPermissionsForRole, getAllRoles, ROLE_INFO } from '../auth/constants/role-permissions';
import { PERMISSION_CATEGORIES, ALL_PERMISSIONS } from '../auth/constants/permissions';

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
        role: dto.role ?? UserRole.REQUESTER,
        departmentId: dto.departmentId,
        isActive: dto.isActive ?? true,
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

  async findByDepartment(departmentId: string) {
    const users = await this.prisma.user.findMany({
      where: { departmentId },
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

  async changeRole(id: string, role: UserRole) {
    await this.findOne(id); // Verify user exists

    const user = await this.prisma.user.update({
      where: { id },
      data: { role },
      include: {
        department: true,
        approverProfile: true,
      },
    });
    return this.stripPassword(user);
  }

  async deactivate(id: string) {
    await this.findOne(id); // Verify user exists

    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      include: {
        department: true,
        approverProfile: true,
      },
    });
    return this.stripPassword(user);
  }

  async reactivate(id: string) {
    await this.findOne(id); // Verify user exists

    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      include: {
        department: true,
        approverProfile: true,
      },
    });
    return this.stripPassword(user);
  }

  async resetPassword(id: string, newPassword: string) {
    await this.findOne(id); // Verify user exists

    if (newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const user = await this.prisma.user.update({
      where: { id },
      data: { password: hashed },
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

  /**
   * Get permissions for a user based on their role
   */
  getPermissionsForUser(role: UserRole): string[] {
    return getPermissionsForRole(role);
  }

  /**
   * Get all available roles with their info
   */
  getAllRolesWithInfo() {
    return getAllRoles().map((role) => ({
      value: role,
      ...ROLE_INFO[role],
      permissions: getPermissionsForRole(role),
    }));
  }

  /**
   * Get all permission categories with permissions
   */
  getAllPermissionCategories() {
    return PERMISSION_CATEGORIES;
  }

  /**
   * Get all permissions
   */
  getAllPermissions() {
    return ALL_PERMISSIONS;
  }
}
