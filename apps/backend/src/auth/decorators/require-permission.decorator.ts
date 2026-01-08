import { SetMetadata } from '@nestjs/common';
import { Permission } from '../constants/permissions';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to require specific permissions for a route
 * @param permissions - One or more permissions required
 * @example
 * @RequirePermission(Permissions.USERS_READ_ALL)
 * @RequirePermission(Permissions.USERS_READ_ALL, Permissions.USERS_CREATE)
 */
export const RequirePermission = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
