import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
import { Permission } from '../constants/permissions';
import { hasAllPermissions, hasAnyPermission } from '../constants/role-permissions';

export interface PermissionGuardOptions {
  /**
   * If true, user needs all permissions. If false, any permission is enough.
   * @default false (any permission)
   */
  requireAll?: boolean;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('No user found in request');
      throw new ForbiddenException('Access denied: No user context');
    }

    const userRole = user.role as UserRole;

    if (!userRole) {
      this.logger.warn(`User ${user.sub} has no role assigned`);
      throw new ForbiddenException('Access denied: No role assigned');
    }

    // Check if user has any of the required permissions
    const hasAccess = hasAnyPermission(userRole, requiredPermissions);

    if (!hasAccess) {
      this.logger.warn(
        `User ${user.sub} with role ${userRole} denied access. Required: ${requiredPermissions.join(', ')}`,
      );
      throw new ForbiddenException('Access denied: Insufficient permissions');
    }

    this.logger.debug(
      `User ${user.sub} with role ${userRole} granted access for ${requiredPermissions.join(', ')}`,
    );

    return true;
  }
}

/**
 * Guard that requires ALL specified permissions (more restrictive)
 */
@Injectable()
export class AllPermissionsGuard implements CanActivate {
  private readonly logger = new Logger(AllPermissionsGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied: No user context');
    }

    const userRole = user.role as UserRole;

    if (!userRole) {
      throw new ForbiddenException('Access denied: No role assigned');
    }

    const hasAccess = hasAllPermissions(userRole, requiredPermissions);

    if (!hasAccess) {
      this.logger.warn(
        `User ${user.sub} with role ${userRole} denied access. Required ALL: ${requiredPermissions.join(', ')}`,
      );
      throw new ForbiddenException('Access denied: Insufficient permissions');
    }

    return true;
  }
}
