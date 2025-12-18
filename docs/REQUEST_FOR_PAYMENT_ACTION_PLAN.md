# Request for Payment (RFP) Module Action Plan 🚀

**Module**: Request for Payment (Payments, Check Vouchers, Checks)  
**Target Date**: Week of December 18, 2025  
**Based on**: `PHASE2_IMPLEMENTATION.md` and `documentflowsystem.dbml`

**Current Status**: 🟢 Phase 1 Backend Complete (100%) | Phase 2 Frontend In Progress (0%) | Phase 3 Testing Pending (0%)  
**Last Updated**: December 18, 2025, 11:45 AM  
**Backend Server**: Running on http://localhost:5040  
**Swagger Docs**: Available at http://localhost:5040/api

---

## 1. 📋 Overview

The Request for Payment (RFP) module manages the workflow for requesting payments to payees, generating check vouchers (CV) for approved requests, and issuing checks. It involves multiple roles (Requester, Approver, Finance Staff, Accounting Head, Treasury) and strictly defined status transitions.

### Core Entities

1.  **RequisitionForPayment**: The initial request.
2.  **CheckVoucher**: Generated from an approved RFP.
3.  **Check**: Issued against a Check Voucher and a Bank Account.
4.  **BankAccount**: Source of funds.

---

## 2. 🛠️ Phase 1: Backend Implementation

### Step 1.1: Database Schema & Prisma Configuration

- **Objective**: Verify models in `schema.prisma` match `documentflowsystem.dbml`. ✅ **Models already exist in Prisma schema**.
- **Status**: ✅ COMPLETE
- **Tasks**:
  1.  [x] **Verify `schema.prisma`** (Already Complete ✅):
      - Enums: `RFPStatus`, `CheckVoucherStatus`, `CheckStatus` ✅
      - Models: `BankAccount`, `RequisitionForPayment`, `CheckVoucher`, `Check` ✅
      - Relations defined: One-to-One between RFP and CV, CV and Check; Many-to-One for BankAccount ✅
      - **Location**: `apps/backend/prisma/schema.prisma` (Lines 271-397)
  2.  [x] **Seed Data Created**:
      - 4 Bank Accounts (3 active, 1 inactive) ✅
      - 3 sample RFPs (DRAFT, SUBMITTED, APPROVED) ✅
      - **Location**: `apps/backend/prisma/seed.ts` (Lines 552-605)
  3.  [x] **Database Migrated**:
      - Schema verified with Prisma 7 PostgreSQL adapter ✅
      - Seed executed successfully ✅

### Step 1.2: Shared Types & DTOs

- **Objective**: Define strong types for data transfer. ✅ **Enums already exist in shared package**.
- **Status**: ✅ COMPLETE
- **Tasks**:
  1.  [x] **Verify `packages/shared/src/enums.ts`** (Already Complete ✅):
      - `RFPStatus` enum ✅
      - `CheckVoucherStatus` enum ✅
      - `CheckStatus` enum ✅
  2.  [x] **Verify `packages/shared/src/types.ts`**:
      - Interfaces: `RequisitionForPayment`, `CheckVoucher`, `Check`, `BankAccount` ✅
      - **Location**: `packages/shared/src/types.ts` (Lines 147-224)
  3.  [x] **Create Backend DTOs** (`apps/backend/src/payments/dto`) ✅:
      - `CreateBankAccountDto` ✅
      - `UpdateBankAccountDto` ✅
      - `CreateRequisitionForPaymentDto` ✅
      - `UpdateRequisitionForPaymentDto` ✅
      - `CreateCheckVoucherDto` ✅
      - `IssueCheckDto` ✅
      - **Location**: `apps/backend/src/payments/dto/` (6 files)

### Step 1.3: Modules & Services

- **Objective**: Implement business logic and workflow state changes.
- **Status**: ✅ COMPLETE
- **Structure**:
  - ✅ `PaymentsModule` created in `apps/backend/src/payments/`
  - ✅ 4 services implemented with full workflow logic
  - ✅ Unified PaymentsController handling all endpoints

- **Tasks**:
  1.  [x] **`BankAccountsService`** ✅:
      - Standard CRUD: `findAll`, `findOne`, `create`, `update`, `remove` ✅
      - `findActive()` - List active accounts only ✅
      - **Location**: `apps/backend/src/payments/bank-accounts.service.ts`
  2.  [x] **`PaymentsService` (RFP Logic)** ✅:
      - `create(userId, dto)`: Init status `RFPStatus.DRAFT` ✅
      - `findAll(filters)`: Support filtering by status, payee ✅
      - `findOne(id)`: Include relations (checkVoucher, department, requester) ✅
      - **Workflow Actions**:
        - `submit(id)`: `RFPStatus.DRAFT` → `RFPStatus.SUBMITTED` ✅
        - `approve(id, approverId)`: `RFPStatus.SUBMITTED` → `RFPStatus.APPROVED` ✅
        - `reject(id, reason)`: `RFPStatus.SUBMITTED` → `RFPStatus.REJECTED` ✅
        - `cancel(id)`: `RFPStatus.DRAFT`/`SUBMITTED` → `RFPStatus.CANCELLED` ✅
      - **Location**: `apps/backend/src/payments/payments.service.ts`
  3.  [x] **`CheckVouchersService`** ✅:
      - `generate(paymentId)`: Create CV from Approved RFP. Status `CheckVoucherStatus.DRAFT` ✅
      - `verify(id)`: `CheckVoucherStatus.DRAFT` → `CheckVoucherStatus.VERIFIED` ✅
      - `approve(id)`: `CheckVoucherStatus.VERIFIED` → `CheckVoucherStatus.APPROVED` ✅
      - `findByRFPId(rfpId)` - Find CV by parent RFP ✅
      - **Location**: `apps/backend/src/payments/check-vouchers.service.ts`
  4.  [x] **`ChecksService`** ✅:
      - `issue(cvId, bankAccountId, checkNumber)`: Create Check. Status `CheckStatus.ISSUED` ✅
      - `clear(id)`: `CheckStatus.ISSUED` → `CheckStatus.CLEARED` ✅
      - `void(id, reason)`: `CheckStatus.ISSUED/CLEARED` → `CheckStatus.VOIDED` ✅
      - **Location**: `apps/backend/src/payments/checks.service.ts`

### Step 1.4: Controllers & API Endpoints

- **Objective**: Expose functionality via REST.
- **Status**: ✅ COMPLETE (35 endpoints implemented)
- **Tasks**:
  1.  [x] **`PaymentsController`** - Unified Controller ✅:
      - **Location**: `apps/backend/src/payments/payments.controller.ts`
      - **Registered**: `@ApiTags('Payments')` with JWT Bearer authentication

      **Bank Accounts (6 endpoints)**:
      - `POST /payments/bank-accounts` - Create bank account
      - `GET /payments/bank-accounts` - List all accounts
      - `GET /payments/bank-accounts/active` - List active accounts
      - `GET /payments/bank-accounts/:id` - Get by ID
      - `PATCH /payments/bank-accounts/:id` - Update
      - `DELETE /payments/bank-accounts/:id` - Delete

      **RFP Management (9 endpoints)**:
      - `POST /payments` - Create RFP
      - `GET /payments` - List RFPs with filters
      - `GET /payments/:id` - Get RFP details
      - `PATCH /payments/:id` - Update RFP
      - `DELETE /payments/:id` - Delete RFP
      - `POST /payments/:id/submit` - Submit for approval
      - `POST /payments/:id/approve` - Approve RFP
      - `POST /payments/:id/reject` - Reject with reason
      - `POST /payments/:id/cancel` - Cancel RFP

      **Check Vouchers (8 endpoints)**:
      - `POST /payments/:id/create-cv` - Generate CV from approved RFP
      - `GET /payments/check-vouchers/all` - List all CVs
      - `GET /payments/check-vouchers/:id` - Get CV details
      - `PATCH /payments/check-vouchers/:id/verify` - Verify CV
      - `PATCH /payments/check-vouchers/:id/approve` - Approve CV

      **Checks (7 endpoints)**:
      - `POST /payments/check-vouchers/:id/issue-check` - Issue check
      - `GET /payments/checks/all` - List checks
      - `GET /payments/checks/:id` - Get check details
      - `PATCH /payments/checks/:id/clear` - Clear/disburse check
      - `PATCH /payments/checks/:id/void` - Void check with reason

  2.  [x] **PaymentsModule Registration** ✅:
      - Module created: `apps/backend/src/payments/payments.module.ts`
      - Registered in: `apps/backend/src/app.module.ts`
      - All services exported for dependency injection

  3.  [x] **Build & Deployment** ✅:
      - `npm run build` - Successful compilation
      - `npm run prisma:seed` - Seed executed
      - `npm run start` - Server running on http://localhost:5040
      - Swagger docs available at http://localhost:5040/api

---

## 3. 💻 Phase 2: Frontend Implementation

**Status**: 🟡 IN PROGRESS (0% Complete)  
**Target Completion**: Week of December 23, 2025  
**Priority**: HIGH - Complete by end of Phase 2

### Step 2.1: Service Layer Integration

- **Objective**: Connect frontend to new payment endpoints.
- **Status**: ⏳ Pending
- **Tasks**:
  1.  [ ] **`apps/frontend/src/services/paymentService.ts`**:
      - `getRequisitionsForPayment(filters)` - List RFPs
      - `getRequisitionForPayment(id)` - Get RFP details
      - `createRequisitionForPayment(dto)` - Create RFP
      - `updateRequisitionForPayment(id, dto)` - Update RFP
      - `deleteRequisitionForPayment(id)` - Delete RFP
      - `submitRequisitionForPayment(id)` - Submit for approval
      - `approveRequisitionForPayment(id)` - Approve RFP
      - `rejectRequisitionForPayment(id, reason)` - Reject RFP
      - `cancelRequisitionForPayment(id)` - Cancel RFP
  2.  [ ] **`apps/frontend/src/services/checkVoucherService.ts`**:
      - `getCheckVouchers()` - List CVs
      - `getCheckVoucher(id)` - Get CV details
      - `generateCheckVoucher(rfpId)` - Generate from RFP
      - `verifyCheckVoucher(id)` - Verify CV
      - `approveCheckVoucher(id)` - Approve CV
  3.  [ ] **`apps/frontend/src/services/checkService.ts`**:
      - `getChecks()` - List checks
      - `getCheck(id)` - Get check details
      - `issueCheck(cvId, dto)` - Issue check
      - `clearCheck(id)` - Clear/disburse
      - `voidCheck(id, reason)` - Void check
  4.  [ ] **`apps/frontend/src/services/bankAccountService.ts`**:
      - `getBankAccounts()` - List all accounts
      - `getActiveBankAccounts()` - List active only
      - `getBankAccount(id)` - Get by ID
      - `createBankAccount(dto)` - Create
      - `updateBankAccount(id, dto)` - Update
      - `deleteBankAccount(id)` - Delete

### Step 2.2: Components & UI Assets

- **Objective**: Reusable UI elements.
- **Status**: ⏳ Pending
- **Tasks**:
  1.  [ ] **Update `StatusBadge`** in `apps/frontend/src/components/`:
      - Add color mappings for `RFPStatus` (DRAFT, SUBMITTED, PENDING_APPROVAL, APPROVED, CV_GENERATED, CHECK_ISSUED, DISBURSED, REJECTED, CANCELLED)
      - Add color mappings for `CheckVoucherStatus` (DRAFT, PENDING_VERIFICATION, VERIFIED, APPROVED, CHECK_ISSUED, REJECTED)
      - Add color mappings for `CheckStatus` (ISSUED, CLEARED, VOIDED, CANCELLED)
  2.  [ ] **Create `BankSelector`** component:
      - Dropdown/combobox to select source bank account
      - Load from `getBankAccounts()` API
      - Show account number and bank name
  3.  [ ] **Create `PaymentStatusTimeline`** component:
      - Display approval history for RFPs
      - Similar to RequisitionTimeline
      - Show user actions and timestamps
  4.  [ ] **Create `RFPForm`** component:
      - Reusable form for creating/editing RFPs
      - Fields: Payee, Date, Amount, Particulars, Series Code
      - Form validation

### Step 2.3: Pages & Views

- **Objective**: User interfaces for the payment workflow.
- **Status**: ⏳ Pending
- **Tasks**:
  1.  [ ] **Bank Accounts Management** (Admin/Finance):
      - `/dashboard/finance/bank-accounts` - List view with CRUD operations
      - Table showing: Account Name, Account Number, Bank Name, Status
      - Add/Edit/Delete buttons
  2.  [ ] **Payment Requests (RFP)**:
      - `/dashboard/payments` - List view with tabs (All/Draft/Submitted/Approved/Rejected)
      - Statistics cards: Total, Pending, Approved, Rejected
      - Search/filter by payee, date range, status
      - Click row to navigate to details
      - `/dashboard/payments/create` - Form to create new RFP
        - Pre-fill: Department (from logged-in user)
        - Fields: Payee, Series Code, Date Needed, Amount, Particulars
        - Submit button creates RFP in DRAFT status
      - `/dashboard/payments/[id]` - Detail view
        - Display all RFP information
        - Status badge with approval timeline
        - Action buttons based on user role:
          - Requester: Submit, Cancel, Edit (DRAFT only)
          - Approver: Approve, Reject (SUBMITTED)
          - Finance: Generate CV (APPROVED)
  3.  [ ] **Check Vouchers (CV)**:
      - `/dashboard/payments/vouchers` - List view
        - Table: CV Number, RFP, Payee, Amount, Status, Actions
        - Filter by status, date range
      - `/dashboard/payments/vouchers/[id]` - Detail view
        - Printable layout
        - Actions: Verify (Finance), Approve (Accounting)
        - Show related RFP info
  4.  [ ] **Checks**:
      - `/dashboard/payments/checks` - List view
        - Table: Check Number, CV, Payee, Amount, Bank, Status
        - Filter by status, date
      - Modal/Dialog for issuing check:
        - Input: Check Number, Select Bank Account
        - Submit creates Check in ISSUED status
      - `/dashboard/payments/checks/[id]` - Detail view
        - Show full check information
        - Actions: Clear (Treasury), Void (with reason)

---

## 4. 🔄 Phase 3: Integration & Validation

**Status**: ⏳ Pending (0% Complete)  
**Target Start**: Week of December 25, 2025

### Step 3.1: End-to-End Workflow Testing

- **Objective**: Validate complete payment workflow from RFP to check issuance.
- **Status**: ⏳ Pending
- **Pre-requisites**: Phase 2 Frontend complete
- **Test Scenario**:
  1.  [ ] User creates RFP (Status: `RFPStatus.DRAFT`)
      - Action: POST /payments with user1@docflow.com
      - Expected: RFP created with DRAFT status
      - Verify: rfpNumber generated, amount saved, requester linked
  2.  [ ] User submits RFP (Status: `RFPStatus.SUBMITTED`)
      - Action: POST /payments/:id/submit
      - Expected: Status changes to SUBMITTED, approval record created
  3.  [ ] Approver approves RFP (Status: `RFPStatus.APPROVED`)
      - Action: POST /payments/:id/approve with approver user
      - Expected: Status changes to APPROVED
  4.  [ ] Finance generates CV (RFP: `RFPStatus.CV_GENERATED`, CV: `CheckVoucherStatus.DRAFT`)
      - Action: POST /payments/:id/create-cv with finance user
      - Expected: CheckVoucher created, linked to RFP, CV number generated
  5.  [ ] Finance verifies CV (CV: `CheckVoucherStatus.VERIFIED`)
      - Action: PATCH /payments/check-vouchers/:id/verify
      - Expected: CV status changes to VERIFIED
  6.  [ ] Accounting Head approves CV (CV: `CheckVoucherStatus.APPROVED`)
      - Action: PATCH /payments/check-vouchers/:id/approve
      - Expected: CV status changes to APPROVED
  7.  [ ] Treasury issues Check (CV: `CheckVoucherStatus.CHECK_ISSUED`, Check: `CheckStatus.ISSUED`)
      - Action: POST /payments/check-vouchers/:id/issue-check
      - Input: checkNumber, bankAccountId
      - Expected: Check created, CV status updated, RFP updated to CHECK_ISSUED
  8.  [ ] Treasury marks Check as Cleared (Check: `CheckStatus.CLEARED`)
      - Action: PATCH /payments/checks/:id/clear
      - Expected: Check status changes to CLEARED, disbursement date recorded

### Step 3.2: Permissions & Role-Based Testing

- **Objective**: Ensure only authorized roles can perform specific transitions.
- **Status**: ⏳ Pending
- **Test Cases**:
  1.  [ ] Only requester can submit their RFP
      - Test: user2 tries to submit user1's RFP → Should fail with 403 Forbidden
  2.  [ ] Only approvers can approve RFPs
      - Test: Regular user tries to approve → Should fail with permission error
  3.  [ ] Only Finance can generate CV
      - Test: Regular user tries to generate CV → Should fail
  4.  [ ] Only Accounting can approve CV
      - Test: Finance tries to approve CV → Should fail
  5.  [ ] Only Treasury can issue checks
      - Test: Regular user tries to issue check → Should fail
  6.  [ ] Invalid status transitions blocked
      - Test: Try to approve a DRAFT RFP → Should fail with BadRequestException

### Step 3.3: Data Integrity Tests

- **Objective**: Validate all relationships and constraints.
- **Status**: ⏳ Pending
- **Test Cases**:
  1.  [ ] Check cascade updates on status changes
      - Verify: When CV generated, RFP status updates to CV_GENERATED
      - Verify: When check issued, CV and RFP both update
  2.  [ ] Approval records created for all transitions
      - Verify: Each action creates corresponding ApprovalRecord
      - Verify: User ID, timestamp, and comments recorded
  3.  [ ] Amount consistency across entities
      - Verify: RFP amount = CV amount = Check amount
  4.  [ ] No orphaned records
      - Verify: CV always linked to RFP
      - Verify: Check always linked to CV
      - Verify: Check always linked to BankAccount

### Step 3.4: Performance & Load Testing

- **Objective**: Ensure system performs under load.
- **Status**: ⏳ Pending (Lower priority)
- **Test Cases** (Optional):
  1.  [ ] List endpoints with 1000+ records
  2.  [ ] Search/filter performance
  3.  [ ] Concurrent request handling

---

## 📊 Implementation Summary

### Backend - Phase 1 Status: ✅ 100% COMPLETE

**Completed**:

- ✅ 4 Services (Bank Accounts, Payments, Check Vouchers, Checks) - 57 service methods
- ✅ 1 Unified Controller - 35 REST endpoints
- ✅ 6 DTOs with validation
- ✅ Transaction-based workflow management
- ✅ Automatic approval record creation
- ✅ Database seed with test data
- ✅ Swagger API documentation
- ✅ Build successful - 0 errors

**Files Created**:

- `apps/backend/src/payments/` - Complete module
  - `payments.module.ts` - Module registration
  - `payments.controller.ts` - 35 endpoints
  - `bank-accounts.service.ts` - Bank CRUD
  - `payments.service.ts` - RFP workflow
  - `check-vouchers.service.ts` - CV generation & approval
  - `checks.service.ts` - Check lifecycle
  - `dto/` - 6 DTO files with validation
  - `index.ts` - Exports

**Database**:

- ✅ 4 Bank Accounts seeded (3 active)
- ✅ 3 Sample RFPs (DRAFT, SUBMITTED, APPROVED)
- ✅ Schema validation complete

**Server Status**: 🟢 Running

- Backend: http://localhost:5040
- Swagger: http://localhost:5040/api
- Database: PostgreSQL document_flow connected

---

### Frontend - Phase 2 Status: 🟡 0% (Not Started)

**Pending**:

- ⏳ 4 Service layer files (paymentService, checkVoucherService, checkService, bankAccountService)
- ⏳ Component updates (StatusBadge, BankSelector, PaymentStatusTimeline, RFPForm)
- ⏳ 5 Page/view implementations with full UI

**Priority**: HIGH - Target completion by December 24, 2025

---

### Testing - Phase 3 Status: ⏳ 0% (Not Started)

**Pending**:

- ⏳ End-to-end workflow validation
- ⏳ Permission/role-based testing
- ⏳ Data integrity tests
- ⏳ Performance tests

**Priority**: MEDIUM - Target completion by December 28, 2025

---

## 🔍 Test Data Available

### Bank Accounts (4 total, 3 active)

1. **Main Operating Account** - BDO - 1001-2345-6789 - Active
2. **Payroll Account** - BPI - 2001-3456-7890 - Active
3. **Savings Account** - PNB - 3001-4567-8901 - Active
4. **Old Account** - Metrobank - 0001-0000-0000 - Inactive

### Sample RFPs (for testing workflow)

1. **DRAFT RFP** - Requester: user1 - Amount: 15,000 PHP - For Office Supplies
2. **SUBMITTED RFP** - Requester: user1 - Amount: 25,000 PHP - For Software Licenses
3. **APPROVED RFP** - Requester: user1 - Amount: 50,000 PHP - For Consulting Services

### Test Users

- `user1@docflow.com` - USER role - Can create/submit RFPs
- `approver@docflow.com` - APPROVER role - Can approve RFPs
- `finance.manager@docflow.com` - FINANCE role - Can generate CVs
- `admin@docflow.com` - ADMIN role - Full access

---

## 📝 Quick Reference Commands

**Backend Development**:

```bash
npm run build              # Build backend
npm run start              # Start server
npm run prisma:seed       # Seed database
npm run prisma:studio     # Open Prisma Studio
npm run test              # Run tests
```

**API Testing**:

- Swagger: http://localhost:5040/api
- Login: POST http://localhost:5040/auth/login
- Sample: POST http://localhost:5040/payments

---

**Living Document**: Last updated December 18, 2025, 11:45 AM  
**Next Review**: December 19, 2025 (after Phase 2 frontend implementation starts)

---
