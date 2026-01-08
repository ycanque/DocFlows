# RBAC & Approval Workflow Implementation Action Plan

**Date:** January 8, 2026  
**Status:** ✅ Completed  
**Project:** DocFlows - Document Workflow Management System

## Executive Summary

This document outlines the comprehensive action plan for implementing Role-Based Access Control (RBAC) and multi-level approval workflows in the DocFlows application. The implementation replaces the simple role-based system with a granular permission-based architecture supporting hierarchical approvals and fine-grained access control.

## Table of Contents

1. [System Overview](#system-overview)
2. [Role Architecture](#role-architecture)
3. [Permission System](#permission-system)
4. [Implementation Phases](#implementation-phases)
5. [Technical Requirements](#technical-requirements)
6. [Testing Strategy](#testing-strategy)
7. [Deployment Plan](#deployment-plan)

---

## System Overview

### Current State (Before Implementation)

- Simple role enumeration: `ADMIN`, `USER`, `APPROVER`, `DEPARTMENT_HEAD`, `FINANCE`, `ACCOUNTING`, `TREASURY`
- Limited permission granularity
- Hard-coded access control logic
- No hierarchical inheritance

### Target State (After Implementation)

- 7 well-defined roles with clear responsibilities
- 90+ granular permissions using `module:action:scope` format
- Hierarchical role inheritance for permission propagation
- Code-based permission system (not database-driven)
- Fine-grained access control at endpoint level

---

## Role Architecture

### 1. Role Definitions

#### REQUESTER

- **Level:** 1 (Base)
- **Inherits From:** None
- **Description:** Base user who can create and manage their own requests
- **Primary Responsibilities:**
  - Create requisitions, payment requests, personnel requests
  - View and edit own draft requests
  - Submit requests for approval
  - Track request status

#### APPROVER

- **Level:** 2
- **Inherits From:** REQUESTER
- **Description:** Can approve/reject requests at departmental level
- **Primary Responsibilities:**
  - All REQUESTER permissions
  - Approve/reject requisitions
  - Approve/reject payment requests
  - View requests pending approval

#### FINANCE_STAFF

- **Level:** 3
- **Inherits From:** APPROVER
- **Description:** Finance department staff handling financial operations
- **Primary Responsibilities:**
  - All APPROVER permissions
  - Verify check vouchers
  - Issue checks
  - Process disbursements
  - Manage cash advances

#### ACCOUNTING_HEAD

- **Level:** 4
- **Inherits From:** FINANCE_STAFF
- **Description:** Head of accounting with final financial approval authority
- **Primary Responsibilities:**
  - All FINANCE_STAFF permissions
  - Final approval for check vouchers
  - Approve voucher adjustments
  - Access to all financial records
  - Generate financial reports

#### DEPARTMENT_HEAD

- **Level:** Special (Parallel Branch)
- **Inherits From:** REQUESTER
- **Description:** Department leader with approval authority for their department
- **Primary Responsibilities:**
  - All REQUESTER permissions
  - Approve department personnel requests
  - Approve department requisitions
  - Manage department budgets
  - View department reports

#### ADMIN

- **Level:** 5
- **Inherits From:** ACCOUNTING_HEAD
- **Description:** System administrator with broad permissions
- **Primary Responsibilities:**
  - All ACCOUNTING_HEAD permissions
  - User management (create, edit, deactivate)
  - Department management
  - Cost center management
  - System configuration

#### SYSTEM_ADMIN

- **Level:** 6 (Highest)
- **Inherits From:** ADMIN
- **Description:** Super administrator with full system access
- **Primary Responsibilities:**
  - All ADMIN permissions
  - Role management
  - Permission management
  - Change user roles
  - Reset passwords
  - Access audit logs
  - System-wide settings

### 2. Role Inheritance Hierarchy

```
REQUESTER (base)
    ├─→ APPROVER
    │       ├─→ FINANCE_STAFF
    │       │       ├─→ ACCOUNTING_HEAD
    │       │       │       ├─→ ADMIN
    │       │       │       │       └─→ SYSTEM_ADMIN
    │       │       │       │
    └─→ DEPARTMENT_HEAD (parallel branch)
```

---

## Permission System

### 1. Permission Format

Permissions follow the pattern: `module:action:scope`

- **module**: The feature area (requisitions, payments, users, etc.)
- **action**: The operation (create, read, update, delete, approve, etc.)
- **scope**: The access level (own, department, all)

**Examples:**

- `requisitions:create:own` - Create own requisitions
- `payments:approve:department` - Approve department payments
- `users:read:all` - View all users

### 2. Permission Categories

#### Requisitions (20 permissions)

- `requisitions:create:own`
- `requisitions:read:own`
- `requisitions:read:department`
- `requisitions:read:all`
- `requisitions:update:own`
- `requisitions:delete:own`
- `requisitions:submit:own`
- `requisitions:approve:own`
- `requisitions:approve:department`
- `requisitions:approve:all`
- `requisitions:reject:own`
- `requisitions:reject:department`
- `requisitions:reject:all`
- `requisitions:cancel:own`
- `requisitions:cancel:all`
- `requisitions:export:own`
- `requisitions:export:department`
- `requisitions:export:all`

#### Payments (21 permissions)

Similar structure to requisitions with additional:

- `payments:process:all`
- `payments:disburse:all`

#### Vouchers (15 permissions)

- Create, read, update, delete (with scopes)
- `vouchers:verify:all`
- `vouchers:approve:all`
- `vouchers:reject:all`
- `vouchers:issue-check:all`

#### Checks (14 permissions)

- Create, read, update operations
- `checks:issue:all`
- `checks:clear:all`
- `checks:void:all`
- `checks:print:all`

#### Personnel Requests (15 permissions)

Similar structure to requisitions

#### Cash Advances (15 permissions)

Similar structure with additional:

- `advances:disburse:all`
- `advances:liquidate:all`

#### Material Requests (8 permissions)

Simplified structure for material issuance

#### Departments (5 permissions)

- `departments:read:all`
- `departments:create`
- `departments:update`
- `departments:delete`
- `departments:manage-budget`

#### Users (9 permissions)

- `users:read:own`
- `users:read:all`
- `users:create`
- `users:update:own`
- `users:update:all`
- `users:delete`
- `users:deactivate`
- `users:change-role`
- `users:reset-password`

#### Roles (2 permissions)

- `roles:read`
- `roles:manage`

#### Audit (3 permissions)

- `audit:read:own`
- `audit:read:all`
- `audit:export`

#### Settings (2 permissions)

- `settings:view`
- `settings:manage`

**Total: 90+ granular permissions**

---

## Implementation Phases

### Phase 1: Backend Foundation ✅

**Duration:** Completed
**Deliverables:**

- [x] Update Prisma schema with new UserRole enum
- [x] Create permission constants module
- [x] Implement role-permission mapping with inheritance
- [x] Create permission guard and decorator
- [x] Update users module with RBAC endpoints

**Key Files:**

- `apps/backend/prisma/schema.prisma`
- `apps/backend/src/auth/constants/permissions.ts`
- `apps/backend/src/auth/constants/role-permissions.ts`
- `apps/backend/src/auth/guards/permissions.guard.ts`
- `apps/backend/src/auth/decorators/require-permission.decorator.ts`
- `apps/backend/src/users/users.service.ts`
- `apps/backend/src/users/users.controller.ts`

### Phase 2: Database Migration ✅

**Duration:** Completed
**Deliverables:**

- [x] Create migration to update UserRole enum
- [x] Map existing users to new roles
- [x] Update seed data with new roles

**Migration Strategy:**

```sql
USER → REQUESTER
FINANCE → FINANCE_STAFF
ACCOUNTING → ACCOUNTING_HEAD
TREASURY → FINANCE_STAFF
(ADMIN, APPROVER, DEPARTMENT_HEAD remain unchanged)
```

**Key Files:**

- `apps/backend/prisma/migrations/20260108080149_add_rbac_roles/migration.sql`
- `apps/backend/prisma/seed.ts`

### Phase 3: Shared Package Update ✅

**Duration:** Completed
**Deliverables:**

- [x] Update UserRole enum in shared package
- [x] Create frontend permission constants
- [x] Export permissions from shared package
- [x] Rebuild and publish shared package

**Key Files:**

- `packages/shared/src/enums.ts`
- `packages/shared/src/permissions.ts`
- `packages/shared/src/index.ts`

### Phase 4: Frontend Infrastructure ✅

**Duration:** Completed
**Deliverables:**

- [x] Create user service with RBAC methods
- [x] Implement usePermissions hook
- [x] Create missing UI components (input, label, table, accordion)
- [x] Install required dependencies (sonner, @radix-ui packages)

**Key Files:**

- `apps/frontend/src/services/userService.ts`
- `apps/frontend/src/hooks/usePermissions.ts`
- `apps/frontend/src/components/ui/input.tsx`
- `apps/frontend/src/components/ui/label.tsx`
- `apps/frontend/src/components/ui/table.tsx`
- `apps/frontend/src/components/ui/accordion.tsx`

### Phase 5: Settings UI ✅

**Duration:** Completed
**Deliverables:**

- [x] Create Settings page layout with tabs
- [x] Implement User Management UI
- [x] Implement Role Management UI
- [x] Implement Permission Management UI
- [x] Update sidebar navigation with Settings link

**Key Features:**

- **User Management:**
  - User list with search and filtering
  - Create new users
  - Edit user details
  - Change user roles
  - Activate/deactivate users
  - Reset passwords
  - Permission-based visibility

- **Role Management:**
  - Role hierarchy visualization
  - Permission breakdown by category
  - Capabilities matrix
  - Role inheritance display

- **Permission Management:**
  - Searchable permission browser
  - Categorized permission list
  - Scope indicators
  - Permission format reference

**Key Files:**

- `apps/frontend/src/components/settings/SettingsContent.tsx`
- `apps/frontend/src/components/settings/UserManagement.tsx`
- `apps/frontend/src/components/settings/RoleManagement.tsx`
- `apps/frontend/src/components/settings/PermissionManagement.tsx`
- `apps/frontend/src/components/layout/Sidebar.tsx`

### Phase 6: Existing Code Updates ✅

**Duration:** Completed
**Deliverables:**

- [x] Update all UserRole references in frontend
- [x] Update all UserRole references in backend
- [x] Fix permission checks in existing components
- [x] Update seed data

**Files Updated:**

- `apps/frontend/src/app/checks/[id]/page.tsx`
- `apps/frontend/src/app/vouchers/[id]/page.tsx`
- `apps/frontend/src/app/payments/[id]/page.tsx`
- `apps/frontend/src/app/payments/vouchers/[id]/page.tsx`
- `apps/backend/src/requisitions/requisitions.controller.ts`
- `apps/backend/prisma/seed.ts`

### Phase 7: Testing & Validation ✅

**Duration:** Completed
**Deliverables:**

- [x] Build verification (backend + frontend)
- [x] TypeScript compilation check
- [x] Migration verification
- [x] UI component verification

---

## Technical Requirements

### Backend Stack

- **Framework:** NestJS
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT-based
- **Guards:** RolesGuard, PermissionsGuard
- **Decorators:** @RequirePermission, @Roles

### Frontend Stack

- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 19, shadcn/ui components
- **State Management:** React Context (AuthContext)
- **Styling:** Tailwind CSS
- **Icons:** lucide-react
- **Notifications:** sonner (toast library)

### Shared Package

- **Language:** TypeScript
- **Build Tool:** tsc
- **Exports:** Enums, Types, Permissions

---

## Testing Strategy

### Unit Tests

- [ ] Permission calculation logic
- [ ] Role inheritance resolution
- [ ] Guard behavior with various role combinations
- [ ] Service methods for user management

### Integration Tests

- [ ] Permission-protected endpoints
- [ ] Role changes and permission updates
- [ ] User activation/deactivation flows
- [ ] Password reset functionality

### E2E Tests

- [ ] User login with different roles
- [ ] Permission-based UI visibility
- [ ] Settings page CRUD operations
- [ ] Approval workflows with different roles

### Manual Testing Checklist

- [x] Build succeeds without errors
- [x] Migration applies successfully
- [ ] Seed data creates users with correct roles
- [ ] Settings page displays correctly
- [ ] User management functions work
- [ ] Role hierarchy displays correctly
- [ ] Permission browser is functional
- [ ] Sidebar shows/hides based on permissions

---

## Deployment Plan

### Pre-Deployment

1. ✅ Complete code implementation
2. ✅ Run full build verification
3. ✅ Apply database migration in development
4. [ ] Backup production database
5. [ ] Create rollback migration script
6. [ ] Document breaking changes

### Deployment Steps

1. [ ] Stop production services
2. [ ] Backup database
3. [ ] Apply migration: `npx prisma migrate deploy`
4. [ ] Run seed script if needed: `npm run prisma:seed`
5. [ ] Deploy backend application
6. [ ] Deploy frontend application
7. [ ] Verify services are running
8. [ ] Test critical workflows
9. [ ] Monitor error logs

### Post-Deployment

1. [ ] Verify all users migrated successfully
2. [ ] Test permission checks in production
3. [ ] Monitor performance metrics
4. [ ] Gather user feedback
5. [ ] Document known issues

### Rollback Plan

If issues occur:

1. Stop services
2. Restore database backup
3. Deploy previous application version
4. Verify system stability
5. Investigate root cause

---

## Risk Assessment

### High Priority Risks

#### Risk 1: Data Migration Failures

- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:**
  - Custom migration SQL with proper role mapping
  - Test migration on copy of production data
  - Backup before migration
  - Rollback script ready

#### Risk 2: Permission Logic Errors

- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:**
  - Comprehensive unit tests
  - Code review of permission mappings
  - Test with all role combinations
  - Monitor audit logs after deployment

#### Risk 3: Breaking Changes for Existing Users

- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:**
  - Careful role migration mapping
  - Communication plan for users
  - Admin tools to fix incorrect roles
  - Grace period for adjustments

---

## Success Metrics

### Technical Metrics

- ✅ Zero build errors
- ✅ All TypeScript compilation passes
- ✅ Migration applies without errors
- [ ] All tests pass (>95% coverage)
- [ ] No performance degradation

### Business Metrics

- [ ] Users can successfully log in with new roles
- [ ] Permission checks work correctly in all modules
- [ ] Settings page accessible to admins
- [ ] User management operations complete successfully
- [ ] No unauthorized access incidents

### User Experience Metrics

- [ ] UI renders correctly for all roles
- [ ] Settings page is intuitive and functional
- [ ] Permission-based features show/hide appropriately
- [ ] No confusion about role capabilities
- [ ] Positive feedback from pilot users

---

## Conclusion

This action plan provides a comprehensive roadmap for implementing RBAC and approval workflows in DocFlows. The implementation has been completed successfully across all phases, with a robust permission system supporting 7 roles and 90+ granular permissions.

The system is built on solid architectural principles:

- **Code-based permissions** for performance and maintainability
- **Hierarchical inheritance** for logical permission flow
- **Fine-grained control** with module:action:scope format
- **Type-safe implementation** across the entire stack

All backend and frontend components are in place, the database migration has been applied, and the build verification confirms successful implementation. The system is now ready for testing and deployment.

---

## Appendix

### A. Permission Reference

See `apps/backend/src/auth/constants/permissions.ts` for complete permission list.

### B. Role Permission Mapping

See `apps/backend/src/auth/constants/role-permissions.ts` for detailed mappings.

### C. Migration Details

See `apps/backend/prisma/migrations/20260108080149_add_rbac_roles/migration.sql` for SQL.

### D. API Endpoints

**User Management:**

- `GET /api/users/me` - Get current user
- `GET /api/users/me/permissions` - Get user permissions
- `GET /api/users` - List all users (permission: `users:read:all`)
- `POST /api/users` - Create user (permission: `users:create`)
- `PATCH /api/users/:id` - Update user (permission: `users:update:all`)
- `PATCH /api/users/:id/role` - Change role (permission: `users:change-role`)
- `PATCH /api/users/:id/deactivate` - Deactivate user (permission: `users:deactivate`)
- `PATCH /api/users/:id/reactivate` - Reactivate user (permission: `users:deactivate`)
- `PATCH /api/users/:id/reset-password` - Reset password (permission: `users:reset-password`)

**RBAC Metadata:**

- `GET /api/users/rbac/roles` - Get all roles with info
- `GET /api/users/rbac/permissions` - Get all permissions
- `GET /api/users/rbac/permissions/categories` - Get permission categories

---

**Document Version:** 1.0  
**Last Updated:** January 8, 2026  
**Authors:** DocFlows Development Team
