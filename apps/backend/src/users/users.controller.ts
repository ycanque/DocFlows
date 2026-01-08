import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { Permissions } from '../auth/constants/permissions';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@prisma/client';

@ApiTags('users')
@ApiBearerAuth('JWT')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ============================================
  // User CRUD Operations
  // ============================================

  @Post()
  @RequirePermission(Permissions.USERS_CREATE)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @RequirePermission(Permissions.USERS_READ_ALL)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@Request() req: { user: { sub: string } }) {
    return this.usersService.findOne(req.user.sub);
  }

  @Get('me/permissions')
  @ApiOperation({ summary: 'Get permissions for current user' })
  @ApiResponse({ status: 200, description: 'List of permissions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyPermissions(@Request() req: { user: { sub: string; role: UserRole } }) {
    const permissions = this.usersService.getPermissionsForUser(req.user.role);
    return { permissions, role: req.user.role };
  }

  @Get('department/:departmentId')
  @RequirePermission(Permissions.USERS_READ_DEPARTMENT)
  @ApiOperation({ summary: 'Get users by department' })
  @ApiResponse({ status: 200, description: 'List of users in department' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  findByDepartment(@Param('departmentId') departmentId: string) {
    return this.usersService.findByDepartment(departmentId);
  }

  @Get(':id')
  @RequirePermission(Permissions.USERS_READ_ALL)
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission(Permissions.USERS_UPDATE)
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/role')
  @RequirePermission(Permissions.USERS_CHANGE_ROLE)
  @ApiOperation({ summary: 'Change user role' })
  @ApiBody({ schema: { type: 'object', properties: { role: { enum: Object.values(UserRole) } } } })
  @ApiResponse({ status: 200, description: 'Role changed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  changeRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.changeRole(id, role);
  }

  @Patch(':id/deactivate')
  @RequirePermission(Permissions.USERS_DEACTIVATE)
  @ApiOperation({ summary: 'Deactivate a user' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Patch(':id/reactivate')
  @RequirePermission(Permissions.USERS_REACTIVATE)
  @ApiOperation({ summary: 'Reactivate a user' })
  @ApiResponse({ status: 200, description: 'User reactivated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  reactivate(@Param('id') id: string) {
    return this.usersService.reactivate(id);
  }

  @Patch(':id/reset-password')
  @RequirePermission(Permissions.USERS_RESET_PASSWORD)
  @ApiOperation({ summary: 'Reset user password' })
  @ApiBody({
    schema: { type: 'object', properties: { password: { type: 'string', minLength: 6 } } },
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  resetPassword(@Param('id') id: string, @Body('password') password: string) {
    return this.usersService.resetPassword(id, password);
  }

  @Delete(':id')
  @RequirePermission(Permissions.USERS_DELETE)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // ============================================
  // Role & Permission Endpoints
  // ============================================

  @Get('rbac/roles')
  @RequirePermission(Permissions.ROLES_READ)
  @ApiOperation({ summary: 'Get all roles with their info and permissions' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  getAllRoles() {
    return this.usersService.getAllRolesWithInfo();
  }

  @Get('rbac/permissions')
  @RequirePermission(Permissions.ROLES_READ)
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'List of all permissions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  getAllPermissions() {
    return this.usersService.getAllPermissions();
  }

  @Get('rbac/permissions/categories')
  @RequirePermission(Permissions.ROLES_READ)
  @ApiOperation({ summary: 'Get permissions grouped by category' })
  @ApiResponse({ status: 200, description: 'Permissions grouped by category' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  getPermissionCategories() {
    return this.usersService.getAllPermissionCategories();
  }
}
