/**
 * Permission constants for RBAC implementation
 * Format: module:action:scope
 * Scopes: own, department, all
 */
export const Permissions = {
  // ============================================
  // Requisition Permissions
  // ============================================
  REQUISITIONS_CREATE_OWN: 'requisitions:create:own',
  REQUISITIONS_READ_OWN: 'requisitions:read:own',
  REQUISITIONS_READ_DEPARTMENT: 'requisitions:read:department',
  REQUISITIONS_READ_ALL: 'requisitions:read:all',
  REQUISITIONS_UPDATE_OWN: 'requisitions:update:own',
  REQUISITIONS_UPDATE_ALL: 'requisitions:update:all',
  REQUISITIONS_DELETE: 'requisitions:delete',
  REQUISITIONS_SUBMIT_OWN: 'requisitions:submit:own',
  REQUISITIONS_APPROVE: 'requisitions:approve',
  REQUISITIONS_REJECT: 'requisitions:reject',

  // ============================================
  // Payment Permissions
  // ============================================
  PAYMENTS_CREATE_OWN: 'payments:create:own',
  PAYMENTS_READ_OWN: 'payments:read:own',
  PAYMENTS_READ_DEPARTMENT: 'payments:read:department',
  PAYMENTS_READ_ALL: 'payments:read:all',
  PAYMENTS_UPDATE_OWN: 'payments:update:own',
  PAYMENTS_UPDATE_ALL: 'payments:update:all',
  PAYMENTS_DELETE: 'payments:delete',
  PAYMENTS_SUBMIT_OWN: 'payments:submit:own',
  PAYMENTS_APPROVE: 'payments:approve',
  PAYMENTS_APPROVE_DEPARTMENT: 'payments:approve:department',
  PAYMENTS_APPROVE_ALL: 'payments:approve:all',
  PAYMENTS_REJECT: 'payments:reject',

  // ============================================
  // Check Voucher Permissions
  // ============================================
  VOUCHERS_CREATE: 'vouchers:create',
  VOUCHERS_READ_ALL: 'vouchers:read:all',
  VOUCHERS_UPDATE: 'vouchers:update',
  VOUCHERS_VERIFY: 'vouchers:verify',
  VOUCHERS_APPROVE: 'vouchers:approve',
  VOUCHERS_REJECT: 'vouchers:reject',

  // ============================================
  // Check Permissions
  // ============================================
  CHECKS_CREATE: 'checks:create',
  CHECKS_READ_ALL: 'checks:read:all',
  CHECKS_ISSUE: 'checks:issue',
  CHECKS_DISBURSE: 'checks:disburse',
  CHECKS_VOID: 'checks:void',
  CHECKS_APPROVE: 'checks:approve',

  // ============================================
  // User Management Permissions
  // ============================================
  USERS_CREATE: 'users:create',
  USERS_READ_OWN: 'users:read:own',
  USERS_READ_DEPARTMENT: 'users:read:department',
  USERS_READ_ALL: 'users:read:all',
  USERS_UPDATE_OWN: 'users:update:own',
  USERS_UPDATE: 'users:update',
  USERS_DEACTIVATE: 'users:deactivate',
  USERS_REACTIVATE: 'users:reactivate',
  USERS_DELETE: 'users:delete',
  USERS_RESET_PASSWORD: 'users:reset-password',
  USERS_CHANGE_ROLE: 'users:change-role',

  // ============================================
  // Role Management Permissions
  // ============================================
  ROLES_READ: 'roles:read',
  ROLES_MANAGE: 'roles:manage',

  // ============================================
  // Department Permissions
  // ============================================
  DEPARTMENTS_CREATE: 'departments:create',
  DEPARTMENTS_READ_ALL: 'departments:read:all',
  DEPARTMENTS_UPDATE: 'departments:update',
  DEPARTMENTS_DELETE: 'departments:delete',
  DEPARTMENTS_ASSIGN_HEAD: 'departments:assign-head',

  // ============================================
  // Bank Account Permissions
  // ============================================
  BANK_ACCOUNTS_CREATE: 'bank-accounts:create',
  BANK_ACCOUNTS_READ_ALL: 'bank-accounts:read:all',
  BANK_ACCOUNTS_UPDATE: 'bank-accounts:update',
  BANK_ACCOUNTS_DELETE: 'bank-accounts:delete',

  // ============================================
  // Document/File Permissions
  // ============================================
  DOCUMENTS_UPLOAD_OWN: 'documents:upload:own',
  DOCUMENTS_DOWNLOAD_OWN: 'documents:download:own',
  DOCUMENTS_DOWNLOAD_ALL: 'documents:download:all',
  DOCUMENTS_DELETE_OWN: 'documents:delete:own',
  DOCUMENTS_DELETE_ALL: 'documents:delete:all',

  // ============================================
  // Report Permissions
  // ============================================
  REPORTS_READ_OWN: 'reports:read:own',
  REPORTS_READ_DEPARTMENT: 'reports:read:department',
  REPORTS_READ_ALL: 'reports:read:all',
  REPORTS_GENERATE: 'reports:generate',
  REPORTS_EXPORT: 'reports:export',

  // ============================================
  // System Permissions
  // ============================================
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_RESTORE: 'system:restore',
  SYSTEM_LOGS_READ: 'system:logs:read',

  // ============================================
  // Approval Permissions
  // ============================================
  APPROVALS_CREATE: 'approvals:create',
  APPROVALS_READ_OWN: 'approvals:read:own',
  APPROVALS_READ_ALL: 'approvals:read:all',

  // ============================================
  // Audit Permissions
  // ============================================
  AUDIT_READ_OWN: 'audit:read:own',
  AUDIT_READ_ALL: 'audit:read:all',
  AUDIT_EXPORT: 'audit:export',

  // ============================================
  // Adjustment Permissions
  // ============================================
  ADJUSTMENTS_CREATE_OWN: 'adjustments:create:own',
  ADJUSTMENTS_READ_OWN: 'adjustments:read:own',
  ADJUSTMENTS_READ_ALL: 'adjustments:read:all',
  ADJUSTMENTS_APPROVE: 'adjustments:approve',
  ADJUSTMENTS_REJECT: 'adjustments:reject',

  // ============================================
  // Material Issuance Permissions
  // ============================================
  MATERIALS_CREATE: 'materials:create',
  MATERIALS_READ_ALL: 'materials:read:all',
  MATERIALS_ISSUE: 'materials:issue',
  MATERIALS_APPROVE: 'materials:approve',

  // ============================================
  // Personnel Request Permissions
  // ============================================
  PERSONNEL_CREATE_OWN: 'personnel:create:own',
  PERSONNEL_READ_OWN: 'personnel:read:own',
  PERSONNEL_READ_DEPARTMENT: 'personnel:read:department',
  PERSONNEL_READ_ALL: 'personnel:read:all',
  PERSONNEL_APPROVE: 'personnel:approve',

  // ============================================
  // Plane Ticket Permissions
  // ============================================
  TICKETS_CREATE_OWN: 'tickets:create:own',
  TICKETS_READ_OWN: 'tickets:read:own',
  TICKETS_READ_ALL: 'tickets:read:all',
  TICKETS_APPROVE: 'tickets:approve',
  TICKETS_BOOK: 'tickets:book',

  // ============================================
  // Cash Advance Permissions
  // ============================================
  ADVANCES_CREATE_OWN: 'advances:create:own',
  ADVANCES_READ_OWN: 'advances:read:own',
  ADVANCES_READ_ALL: 'advances:read:all',
  ADVANCES_APPROVE: 'advances:approve',
  ADVANCES_DISBURSE: 'advances:disburse',

  // ============================================
  // Dashboard Permissions
  // ============================================
  DASHBOARD_VIEW_OWN: 'dashboard:view:own',
  DASHBOARD_VIEW_DEPARTMENT: 'dashboard:view:department',
  DASHBOARD_VIEW_ALL: 'dashboard:view:all',

  // ============================================
  // Settings Permissions
  // ============================================
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_MANAGE: 'settings:manage',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

// Get all permission values as array
export const ALL_PERMISSIONS = Object.values(Permissions);

// Permission categories for UI grouping
export const PERMISSION_CATEGORIES = {
  requisitions: {
    label: 'Requisitions',
    permissions: [
      Permissions.REQUISITIONS_CREATE_OWN,
      Permissions.REQUISITIONS_READ_OWN,
      Permissions.REQUISITIONS_READ_DEPARTMENT,
      Permissions.REQUISITIONS_READ_ALL,
      Permissions.REQUISITIONS_UPDATE_OWN,
      Permissions.REQUISITIONS_UPDATE_ALL,
      Permissions.REQUISITIONS_DELETE,
      Permissions.REQUISITIONS_SUBMIT_OWN,
      Permissions.REQUISITIONS_APPROVE,
      Permissions.REQUISITIONS_REJECT,
    ],
  },
  payments: {
    label: 'Payments',
    permissions: [
      Permissions.PAYMENTS_CREATE_OWN,
      Permissions.PAYMENTS_READ_OWN,
      Permissions.PAYMENTS_READ_DEPARTMENT,
      Permissions.PAYMENTS_READ_ALL,
      Permissions.PAYMENTS_UPDATE_OWN,
      Permissions.PAYMENTS_UPDATE_ALL,
      Permissions.PAYMENTS_DELETE,
      Permissions.PAYMENTS_SUBMIT_OWN,
      Permissions.PAYMENTS_APPROVE,
      Permissions.PAYMENTS_APPROVE_DEPARTMENT,
      Permissions.PAYMENTS_APPROVE_ALL,
      Permissions.PAYMENTS_REJECT,
    ],
  },
  vouchers: {
    label: 'Check Vouchers',
    permissions: [
      Permissions.VOUCHERS_CREATE,
      Permissions.VOUCHERS_READ_ALL,
      Permissions.VOUCHERS_UPDATE,
      Permissions.VOUCHERS_VERIFY,
      Permissions.VOUCHERS_APPROVE,
      Permissions.VOUCHERS_REJECT,
    ],
  },
  checks: {
    label: 'Checks',
    permissions: [
      Permissions.CHECKS_CREATE,
      Permissions.CHECKS_READ_ALL,
      Permissions.CHECKS_ISSUE,
      Permissions.CHECKS_DISBURSE,
      Permissions.CHECKS_VOID,
      Permissions.CHECKS_APPROVE,
    ],
  },
  users: {
    label: 'User Management',
    permissions: [
      Permissions.USERS_CREATE,
      Permissions.USERS_READ_OWN,
      Permissions.USERS_READ_DEPARTMENT,
      Permissions.USERS_READ_ALL,
      Permissions.USERS_UPDATE_OWN,
      Permissions.USERS_UPDATE,
      Permissions.USERS_DEACTIVATE,
      Permissions.USERS_REACTIVATE,
      Permissions.USERS_DELETE,
      Permissions.USERS_RESET_PASSWORD,
      Permissions.USERS_CHANGE_ROLE,
    ],
  },
  roles: {
    label: 'Role Management',
    permissions: [Permissions.ROLES_READ, Permissions.ROLES_MANAGE],
  },
  departments: {
    label: 'Departments',
    permissions: [
      Permissions.DEPARTMENTS_CREATE,
      Permissions.DEPARTMENTS_READ_ALL,
      Permissions.DEPARTMENTS_UPDATE,
      Permissions.DEPARTMENTS_DELETE,
      Permissions.DEPARTMENTS_ASSIGN_HEAD,
    ],
  },
  bankAccounts: {
    label: 'Bank Accounts',
    permissions: [
      Permissions.BANK_ACCOUNTS_CREATE,
      Permissions.BANK_ACCOUNTS_READ_ALL,
      Permissions.BANK_ACCOUNTS_UPDATE,
      Permissions.BANK_ACCOUNTS_DELETE,
    ],
  },
  documents: {
    label: 'Documents',
    permissions: [
      Permissions.DOCUMENTS_UPLOAD_OWN,
      Permissions.DOCUMENTS_DOWNLOAD_OWN,
      Permissions.DOCUMENTS_DOWNLOAD_ALL,
      Permissions.DOCUMENTS_DELETE_OWN,
      Permissions.DOCUMENTS_DELETE_ALL,
    ],
  },
  reports: {
    label: 'Reports',
    permissions: [
      Permissions.REPORTS_READ_OWN,
      Permissions.REPORTS_READ_DEPARTMENT,
      Permissions.REPORTS_READ_ALL,
      Permissions.REPORTS_GENERATE,
      Permissions.REPORTS_EXPORT,
    ],
  },
  system: {
    label: 'System',
    permissions: [
      Permissions.SYSTEM_CONFIG,
      Permissions.SYSTEM_BACKUP,
      Permissions.SYSTEM_RESTORE,
      Permissions.SYSTEM_LOGS_READ,
    ],
  },
  audit: {
    label: 'Audit',
    permissions: [Permissions.AUDIT_READ_OWN, Permissions.AUDIT_READ_ALL, Permissions.AUDIT_EXPORT],
  },
  settings: {
    label: 'Settings',
    permissions: [Permissions.SETTINGS_VIEW, Permissions.SETTINGS_MANAGE],
  },
} as const;
