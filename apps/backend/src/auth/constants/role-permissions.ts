import { UserRole } from '@prisma/client';
import { Permissions, Permission } from './permissions';

/**
 * Role-Permission mapping with inheritance
 *
 * Inheritance Hierarchy:
 * - REQUESTER (base)
 * - APPROVER → REQUESTER
 * - FINANCE_STAFF → APPROVER → REQUESTER
 * - ACCOUNTING_HEAD → FINANCE_STAFF → APPROVER → REQUESTER
 * - DEPARTMENT_HEAD → APPROVER → REQUESTER (parallel branch)
 * - ADMIN → ACCOUNTING_HEAD → FINANCE_STAFF → APPROVER → REQUESTER
 * - SYSTEM_ADMIN → ADMIN → ... (full hierarchy)
 */

// Base permissions for each role (without inheritance)
const BASE_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // REQUESTER - Base role for creating and submitting own requests
  [UserRole.REQUESTER]: [
    // Requisitions
    Permissions.REQUISITIONS_CREATE_OWN,
    Permissions.REQUISITIONS_READ_OWN,
    Permissions.REQUISITIONS_UPDATE_OWN,
    Permissions.REQUISITIONS_SUBMIT_OWN,
    // Payments
    Permissions.PAYMENTS_CREATE_OWN,
    Permissions.PAYMENTS_READ_OWN,
    Permissions.PAYMENTS_UPDATE_OWN,
    Permissions.PAYMENTS_SUBMIT_OWN,
    // User (self)
    Permissions.USERS_READ_OWN,
    Permissions.USERS_UPDATE_OWN,
    // Documents (own)
    Permissions.DOCUMENTS_UPLOAD_OWN,
    Permissions.DOCUMENTS_DOWNLOAD_OWN,
    Permissions.DOCUMENTS_DELETE_OWN,
    // Reports (own)
    Permissions.REPORTS_READ_OWN,
    // Approvals (own)
    Permissions.APPROVALS_READ_OWN,
    // Audit (own)
    Permissions.AUDIT_READ_OWN,
    // Adjustments
    Permissions.ADJUSTMENTS_CREATE_OWN,
    Permissions.ADJUSTMENTS_READ_OWN,
    // Personnel
    Permissions.PERSONNEL_CREATE_OWN,
    Permissions.PERSONNEL_READ_OWN,
    // Tickets
    Permissions.TICKETS_CREATE_OWN,
    Permissions.TICKETS_READ_OWN,
    // Cash Advances
    Permissions.ADVANCES_CREATE_OWN,
    Permissions.ADVANCES_READ_OWN,
    // Dashboard
    Permissions.DASHBOARD_VIEW_OWN,
    // Settings
    Permissions.SETTINGS_VIEW,
  ],

  // APPROVER - Can approve requests (inherits REQUESTER)
  [UserRole.APPROVER]: [
    // Requisitions (approval)
    Permissions.REQUISITIONS_READ_ALL,
    Permissions.REQUISITIONS_APPROVE,
    Permissions.REQUISITIONS_REJECT,
    // Payments (approval)
    Permissions.PAYMENTS_READ_ALL,
    Permissions.PAYMENTS_APPROVE,
    Permissions.PAYMENTS_REJECT,
    // Approvals
    Permissions.APPROVALS_CREATE,
    Permissions.APPROVALS_READ_ALL,
    // Adjustments
    Permissions.ADJUSTMENTS_READ_ALL,
    Permissions.ADJUSTMENTS_APPROVE,
    Permissions.ADJUSTMENTS_REJECT,
    // Personnel
    Permissions.PERSONNEL_READ_ALL,
    Permissions.PERSONNEL_APPROVE,
    // Tickets
    Permissions.TICKETS_READ_ALL,
    Permissions.TICKETS_APPROVE,
    // Cash Advances
    Permissions.ADVANCES_READ_ALL,
    Permissions.ADVANCES_APPROVE,
  ],

  // FINANCE_STAFF - Finance/Treasury operations (inherits APPROVER)
  [UserRole.FINANCE_STAFF]: [
    // Vouchers
    Permissions.VOUCHERS_CREATE,
    Permissions.VOUCHERS_READ_ALL,
    Permissions.VOUCHERS_UPDATE,
    Permissions.VOUCHERS_VERIFY,
    // Checks
    Permissions.CHECKS_CREATE,
    Permissions.CHECKS_READ_ALL,
    Permissions.CHECKS_ISSUE,
    Permissions.CHECKS_DISBURSE,
    // Bank Accounts
    Permissions.BANK_ACCOUNTS_READ_ALL,
    // Cash Advances
    Permissions.ADVANCES_DISBURSE,
    // Materials
    Permissions.MATERIALS_CREATE,
    Permissions.MATERIALS_READ_ALL,
    Permissions.MATERIALS_ISSUE,
    // Tickets
    Permissions.TICKETS_BOOK,
    // Reports
    Permissions.REPORTS_READ_ALL,
    Permissions.REPORTS_GENERATE,
  ],

  // ACCOUNTING_HEAD - Financial approvals (inherits FINANCE_STAFF)
  [UserRole.ACCOUNTING_HEAD]: [
    // Vouchers
    Permissions.VOUCHERS_APPROVE,
    Permissions.VOUCHERS_REJECT,
    // Checks
    Permissions.CHECKS_APPROVE,
    // Payments (all approvals)
    Permissions.PAYMENTS_APPROVE_ALL,
    // Materials
    Permissions.MATERIALS_APPROVE,
    // Reports
    Permissions.REPORTS_EXPORT,
  ],

  // DEPARTMENT_HEAD - Department-scoped management (parallel to APPROVER, inherits REQUESTER)
  [UserRole.DEPARTMENT_HEAD]: [
    // Requisitions (department)
    Permissions.REQUISITIONS_READ_DEPARTMENT,
    Permissions.REQUISITIONS_APPROVE,
    Permissions.REQUISITIONS_REJECT,
    // Payments (department)
    Permissions.PAYMENTS_READ_DEPARTMENT,
    Permissions.PAYMENTS_APPROVE_DEPARTMENT,
    Permissions.PAYMENTS_REJECT,
    // Users (department)
    Permissions.USERS_READ_DEPARTMENT,
    // Reports (department)
    Permissions.REPORTS_READ_DEPARTMENT,
    // Approvals
    Permissions.APPROVALS_CREATE,
    Permissions.APPROVALS_READ_ALL,
    // Personnel
    Permissions.PERSONNEL_READ_DEPARTMENT,
    Permissions.PERSONNEL_APPROVE,
    // Dashboard
    Permissions.DASHBOARD_VIEW_DEPARTMENT,
  ],

  // ADMIN - Administrative functions (inherits ACCOUNTING_HEAD)
  [UserRole.ADMIN]: [
    // User Management
    Permissions.USERS_CREATE,
    Permissions.USERS_READ_ALL,
    Permissions.USERS_UPDATE,
    Permissions.USERS_DEACTIVATE,
    Permissions.USERS_REACTIVATE,
    Permissions.USERS_RESET_PASSWORD,
    Permissions.USERS_CHANGE_ROLE,
    // Roles
    Permissions.ROLES_READ,
    Permissions.ROLES_MANAGE,
    // Departments
    Permissions.DEPARTMENTS_CREATE,
    Permissions.DEPARTMENTS_READ_ALL,
    Permissions.DEPARTMENTS_UPDATE,
    Permissions.DEPARTMENTS_DELETE,
    Permissions.DEPARTMENTS_ASSIGN_HEAD,
    // Bank Accounts
    Permissions.BANK_ACCOUNTS_CREATE,
    Permissions.BANK_ACCOUNTS_UPDATE,
    Permissions.BANK_ACCOUNTS_DELETE,
    // Documents
    Permissions.DOCUMENTS_DOWNLOAD_ALL,
    Permissions.DOCUMENTS_DELETE_ALL,
    // Audit
    Permissions.AUDIT_READ_ALL,
    // Dashboard
    Permissions.DASHBOARD_VIEW_ALL,
    // Settings
    Permissions.SETTINGS_MANAGE,
  ],

  // SYSTEM_ADMIN - Full system access (inherits ADMIN)
  [UserRole.SYSTEM_ADMIN]: [
    // Requisitions
    Permissions.REQUISITIONS_UPDATE_ALL,
    Permissions.REQUISITIONS_DELETE,
    // Payments
    Permissions.PAYMENTS_UPDATE_ALL,
    Permissions.PAYMENTS_DELETE,
    // Users
    Permissions.USERS_DELETE,
    // Checks
    Permissions.CHECKS_VOID,
    // System
    Permissions.SYSTEM_CONFIG,
    Permissions.SYSTEM_BACKUP,
    Permissions.SYSTEM_RESTORE,
    Permissions.SYSTEM_LOGS_READ,
    // Audit
    Permissions.AUDIT_EXPORT,
  ],
};

// Role inheritance map
const ROLE_INHERITANCE: Record<UserRole, UserRole[]> = {
  [UserRole.REQUESTER]: [],
  [UserRole.APPROVER]: [UserRole.REQUESTER],
  [UserRole.FINANCE_STAFF]: [UserRole.APPROVER, UserRole.REQUESTER],
  [UserRole.ACCOUNTING_HEAD]: [UserRole.FINANCE_STAFF, UserRole.APPROVER, UserRole.REQUESTER],
  [UserRole.DEPARTMENT_HEAD]: [UserRole.REQUESTER], // Parallel branch - only inherits REQUESTER
  [UserRole.ADMIN]: [
    UserRole.ACCOUNTING_HEAD,
    UserRole.FINANCE_STAFF,
    UserRole.APPROVER,
    UserRole.REQUESTER,
  ],
  [UserRole.SYSTEM_ADMIN]: [
    UserRole.ADMIN,
    UserRole.ACCOUNTING_HEAD,
    UserRole.FINANCE_STAFF,
    UserRole.APPROVER,
    UserRole.REQUESTER,
  ],
};

/**
 * Get all permissions for a role including inherited permissions
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  const permissions = new Set<Permission>();

  // Add base permissions for the role
  BASE_ROLE_PERMISSIONS[role]?.forEach((p) => permissions.add(p));

  // Add inherited permissions
  ROLE_INHERITANCE[role]?.forEach((inheritedRole) => {
    BASE_ROLE_PERMISSIONS[inheritedRole]?.forEach((p) => permissions.add(p));
  });

  return Array.from(permissions);
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  const rolePermissions = getPermissionsForRole(role);
  return permissions.some((p) => rolePermissions.includes(p));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  const rolePermissions = getPermissionsForRole(role);
  return permissions.every((p) => rolePermissions.includes(p));
}

/**
 * Get role display information
 */
export const ROLE_INFO: Record<UserRole, { label: string; description: string; level: number }> = {
  [UserRole.REQUESTER]: {
    label: 'Requester',
    description: 'Can create and submit own requests',
    level: 1,
  },
  [UserRole.APPROVER]: {
    label: 'Approver',
    description: 'Can approve requests from others',
    level: 2,
  },
  [UserRole.FINANCE_STAFF]: {
    label: 'Finance Staff',
    description: 'Finance/Treasury operations including vouchers and checks',
    level: 3,
  },
  [UserRole.ACCOUNTING_HEAD]: {
    label: 'Accounting Head',
    description: 'Financial approvals and oversight',
    level: 4,
  },
  [UserRole.DEPARTMENT_HEAD]: {
    label: 'Department Head',
    description: 'Department-level management and approvals',
    level: 3,
  },
  [UserRole.ADMIN]: {
    label: 'Administrator',
    description: 'User and system administration',
    level: 5,
  },
  [UserRole.SYSTEM_ADMIN]: {
    label: 'System Administrator',
    description: 'Full system access including configuration',
    level: 6,
  },
};

/**
 * Get all roles as array
 */
export function getAllRoles(): UserRole[] {
  return Object.values(UserRole);
}

/**
 * Get roles sorted by level
 */
export function getRolesSortedByLevel(): UserRole[] {
  return getAllRoles().sort((a, b) => ROLE_INFO[a].level - ROLE_INFO[b].level);
}
