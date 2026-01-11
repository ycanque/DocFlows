# Approval System Implementation

**Status**: ✅ Completed  
**Date**: January 11, 2026  
**Version**: Phase 2.5 - Requisition Module Refactoring

---

## Overview

Complete overhaul of the DocFlows approval system to implement a standardized Business Unit-based approval matrix following the company's 3-tier hierarchy. This replaces the previous department-level approval routing with a structured organizational approach.

## Goals

1. **Standardized Approval Hierarchy**: Implement 3-tier approval (Department Manager → Unit Manager → General Manager)
2. **Business Unit-Based Routing**: Approvals follow the requester's Business Unit, not the receiving department
3. **Dual Department Tracking**: Separate requester department (for approvals) from receiving department (for fulfillment)
4. **Request Type Taxonomy**: Classify requisitions by type to route to correct process owners
5. **Smart Auth**: Enhance authentication to include organizational context for frontend hydration

---

## Phase 1: Foundation Layer

### 1.1 Database Schema Changes

**File**: `apps/backend/prisma/schema.prisma`

#### Business Unit Enhancement

- Added `businessUnitId` to `Approver` model for BU-level approval assignments
- Global approvers (GM level) can have `null` businessUnitId for company-wide authority

```prisma
model Approver {
  id               String        @id @default(uuid()) @db.Uuid
  userId           String        @map("user_id") @db.Uuid
  departmentId     String?       @map("department_id") @db.Uuid
  businessUnitId   String?       @map("business_unit_id") @db.Uuid // New field
  approvalLevel    ApprovalLevel @map("approval_level")
  isActive         Boolean       @default(true) @map("is_active")

  user             User          @relation(fields: [userId], references: [id])
  department       Department?   @relation(fields: [departmentId], references: [id])
  businessUnit     BusinessUnit? @relation("ApproverBusinessUnit", fields: [businessUnitId], references: [id])
}
```

#### Requisition Slip Enhancement

- Added `receivingDepartmentId` for process owner department
- Added `type` field for request classification
- Dual department relations: `RequesterDepartment` and `ReceivingDepartment`

```prisma
model RequisitionSlip {
  // ... existing fields
  departmentId          String              @map("department_id") @db.Uuid
  receivingDepartmentId String?             @map("receiving_department_id") @db.Uuid
  type                  RequisitionType?    @default(PURCHASE_REQUEST)

  department            Department          @relation("RequesterDepartment", fields: [departmentId], references: [id])
  receivingDepartment   Department?         @relation("ReceivingDepartment", fields: [receivingDepartmentId], references: [id])
}
```

#### Department Relations Update

```prisma
model Department {
  // Dual relations for RequisitionSlip
  RequisitionSlipsAsRequester RequisitionSlip[]      @relation("RequesterDepartment")
  RequisitionSlipsAsReceiver  RequisitionSlip[]      @relation("ReceivingDepartment")
}
```

**Migration**: `20251225_add_bu_approval_and_receiving_dept`

### 1.2 Shared Enums & Types

**File**: `packages/shared/src/enums.ts`

#### Approval Level Enum

```typescript
export enum ApprovalLevel {
  DEPARTMENT_MANAGER = "DEPARTMENT_MANAGER", // Level 1: Dept Manager / Asst. Manager
  UNIT_MANAGER = "UNIT_MANAGER", // Level 2: Business Unit Manager
  GENERAL_MANAGER = "GENERAL_MANAGER", // Level 3: GM - Final approval
}

export const APPROVAL_LEVEL_MAP: Record<ApprovalLevel, number> = {
  [ApprovalLevel.DEPARTMENT_MANAGER]: 1,
  [ApprovalLevel.UNIT_MANAGER]: 2,
  [ApprovalLevel.GENERAL_MANAGER]: 3,
};
```

#### Requisition Type Taxonomy

```typescript
export enum RequisitionType {
  PURCHASE_REQUEST = "PURCHASE_REQUEST", // Supplies, tools, equipment
  REFUND_LIQUIDATION = "REFUND_LIQUIDATION", // PO for refund/liquidation
  SUBCON_SERVICES = "SUBCON_SERVICES", // External service providers
  CLEANING_MAINTENANCE = "CLEANING_MAINTENANCE", // Janitorial, repairs
  REPAIR_TROUBLESHOOTING = "REPAIR_TROUBLESHOOTING", // IT, Technical repairs
  TRAINING = "TRAINING", // Employee training programs
  PERMITS_LICENSES = "PERMITS_LICENSES", // Government compliance
  LAB_TESTING = "LAB_TESTING", // Reagents, laboratory tests
  BORROW_ITEMS = "BORROW_ITEMS", // Vehicles, tools borrowing
  INSTALLATION_SETUP = "INSTALLATION_SETUP", // Set-up services
  FUEL = "FUEL", // Gasoline/Diesel
  DOCUMENTS_RECORDS = "DOCUMENTS_RECORDS", // Retrieving files/records
  FACILITIES_USAGE = "FACILITIES_USAGE", // Conference rooms, facilities
  ALLOWANCES = "ALLOWANCES", // Meals, load, hazard pay
  OTHER = "OTHER", // Catch-all for other requests
}
```

### 1.3 Frontend Request Type Mapping

**File**: `apps/frontend/src/lib/constants.ts`

Maps request types to eligible receiving departments by department code:

```typescript
export const REQUEST_TYPE_MAPPING: Record<RequisitionType, string[]> = {
  [RequisitionType.PURCHASE_REQUEST]: ["PROC"], // Procurement
  [RequisitionType.REFUND_LIQUIDATION]: ["PROC"], // Procurement
  [RequisitionType.SUBCON_SERVICES]: ["PROC"], // Procurement
  [RequisitionType.CLEANING_MAINTENANCE]: ["ADMIN"], // Admin
  [RequisitionType.REPAIR_TROUBLESHOOTING]: ["MIS"], // IT
  [RequisitionType.TRAINING]: ["HR"], // Human Resources
  [RequisitionType.PERMITS_LICENSES]: ["ADMIN", "PROC"], // Admin or Procurement
  [RequisitionType.LAB_TESTING]: ["LAB"], // Laboratory
  [RequisitionType.BORROW_ITEMS]: ["ADMIN"], // Admin
  [RequisitionType.INSTALLATION_SETUP]: ["MIS"], // IT
  [RequisitionType.FUEL]: ["ADMIN"], // Admin
  [RequisitionType.DOCUMENTS_RECORDS]: ["ADMIN"], // Admin
  [RequisitionType.FACILITIES_USAGE]: ["ADMIN"], // Admin
  [RequisitionType.ALLOWANCES]: ["HR"], // Human Resources
  [RequisitionType.OTHER]: [], // Any department
};
```

### 1.4 Seed Data Updates

**File**: `apps/backend/prisma/seed.ts`

- Seeded Business Units: CBU, EBU, WBU, RTSD, SALES, ADMIN
- Linked departments to their respective business units
- Created approval matrix with BU-level assignments:
  - Level 1 (Department Managers): Assigned to specific departments
  - Level 2 (Unit Managers): Assigned to business units
  - Level 3 (General Manager): Global assignment (null businessUnitId)

---

## Phase 2: Backend Implementation

### 2.1 DTOs Update

**File**: `apps/backend/src/requisitions/dto/create-requisition.dto.ts`

```typescript
export class CreateRequisitionDto {
  @IsString()
  requesterId!: string;

  @IsString()
  departmentId!: string; // Requester's department (for approval routing)

  @IsString()
  @IsOptional()
  receivingDepartmentId?: string; // Process owner department

  @IsEnum(RequisitionType)
  @IsOptional()
  type?: RequisitionType = RequisitionType.PURCHASE_REQUEST;

  // ... other fields
}
```

### 2.2 Requisitions Service Refactoring

**File**: `apps/backend/src/requisitions/requisitions.service.ts`

#### Key Changes

1. **BU-Level Approval Matrix Logic**

```typescript
const APPROVAL_LEVELS = {
  DEPARTMENT_MANAGER: 1,
  UNIT_MANAGER: 2,
  GENERAL_MANAGER: 3,
};

private async getDepartmentBusinessUnit(departmentId: string): Promise<string> {
  const dept = await this.prisma.department.findUnique({
    where: { id: departmentId },
    select: { businessUnitId: true },
  });

  if (!dept?.businessUnitId) {
    throw new BadRequestException('Department must belong to a Business Unit');
  }

  return dept.businessUnitId;
}
```

2. **Approver Lookup by BU + Level**

```typescript
private async findApproverForLevel(
  businessUnitId: string,
  level: number,
): Promise<Approver | null> {
  // Level 3 (GM) has no BU restriction
  const whereConditions = level === APPROVAL_LEVELS.GENERAL_MANAGER
    ? [
        { approvalLevel: ApprovalLevel.GENERAL_MANAGER, departmentId: null },
      ]
    : [
        { businessUnitId }, // Explicit BU assignment
        { department: { businessUnitId } }, // Inherited from dept
      ];

  return this.prisma.approver.findFirst({
    where: {
      OR: whereConditions,
      approvalLevel: this.getLevelEnum(level),
      isActive: true,
    },
    include: { user: true },
  });
}
```

3. **Submit Method - Creates Level 1 Approval**

```typescript
async submit(id: string): Promise<RequisitionSlip> {
  const requisition = await this.findOne(id);

  // Get requester's Business Unit
  const businessUnitId = await this.getDepartmentBusinessUnit(
    requisition.departmentId,
  );

  // Find Level 1 Approver (Department Manager)
  const level1Approver = await this.findApproverForLevel(businessUnitId, 1);

  if (!level1Approver) {
    throw new BadRequestException(
      'No Level 1 approver found for your Business Unit',
    );
  }

  // Create Level 1 pending approval
  await this.prisma.approvalRecord.create({
    data: {
      requisitionSlipId: id,
      approverId: level1Approver.id,
      approvalLevel: 1,
      status: 'PENDING',
    },
  });

  return this.prisma.requisitionSlip.update({
    where: { id },
    data: {
      status: RequisitionStatus.PENDING_APPROVAL,
      currentApprovalLevel: 1,
    },
  });
}
```

4. **Approve Method - Progresses Through Levels**

```typescript
async approve(id: string, userId: string): Promise<RequisitionSlip> {
  const requisition = await this.findOne(id);
  const businessUnitId = await this.getDepartmentBusinessUnit(
    requisition.departmentId,
  );

  // Verify user is authorized approver for current level
  const currentApprover = await this.prisma.approver.findFirst({
    where: {
      userId,
      approvalLevel: this.getLevelEnum(requisition.currentApprovalLevel),
      isActive: true,
      OR: [
        { businessUnitId },
        { department: { businessUnitId } },
      ],
    },
  });

  if (!currentApprover) {
    throw new UnauthorizedException(
      'You are not authorized to approve at this level',
    );
  }

  // Mark current level as APPROVED
  await this.prisma.approvalRecord.updateMany({
    where: {
      requisitionSlipId: id,
      approvalLevel: requisition.currentApprovalLevel,
      status: 'PENDING',
    },
    data: {
      status: 'APPROVED',
      comments: null,
      actionDate: new Date(),
    },
  });

  const maxLevel = await this.getMaxApprovalLevel(businessUnitId);

  // If final level, mark as APPROVED
  if (requisition.currentApprovalLevel >= maxLevel) {
    return this.prisma.requisitionSlip.update({
      where: { id },
      data: { status: RequisitionStatus.APPROVED },
    });
  }

  // Progress to next level
  const nextLevel = requisition.currentApprovalLevel + 1;
  const nextApprover = await this.findApproverForLevel(businessUnitId, nextLevel);

  if (!nextApprover) {
    throw new BadRequestException(`No approver found for Level ${nextLevel}`);
  }

  // Create next level approval record
  await this.prisma.approvalRecord.create({
    data: {
      requisitionSlipId: id,
      approverId: nextApprover.id,
      approvalLevel: nextLevel,
      status: 'PENDING',
    },
  });

  return this.prisma.requisitionSlip.update({
    where: { id },
    data: { currentApprovalLevel: nextLevel },
  });
}
```

#### All Queries Include Organizational Context

```typescript
include: {
  requester: true,
  department: {
    include: {
      businessUnit: true, // For approval routing
    },
  },
  receivingDepartment: true, // For fulfillment
  costCenter: true,
  approvalRecords: {
    include: {
      approver: {
        include: { user: true },
      },
    },
  },
}
```

### 2.3 Smart Auth Implementation

**File**: `apps/backend/src/auth/auth.service.ts`

Enhanced authentication response to include organizational context:

```typescript
export interface AuthUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  departmentId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  department: {
    id: string;
    name: string;
    code: string;
    businessUnitId: string | null;
    businessUnit: {
      id: string;
      unitCode: string;
      name: string;
      description: string | null;
      status: string;
    } | null;
  } | null;
}

async validateUser(email: string, password: string): Promise<AuthUserResponse> {
  const user = await this.prisma.user.findUnique({
    where: { email },
    include: {
      department: {
        include: {
          businessUnit: true, // Include BU for frontend context
        },
      },
    },
  });

  // ... validation logic

  return user;
}
```

**Benefits**:

- Frontend can auto-fill requester department
- UI can show user's Business Unit context
- Enables context-aware permissions/routing

---

## Phase 3: Frontend Implementation

### 3.1 Service Layer Updates

**File**: `apps/frontend/src/services/requisitionService.ts`

```typescript
export interface CreateRequisitionDto {
  requesterId: string;
  departmentId: string; // Requester's department
  receivingDepartmentId?: string; // Process owner department (filtered by type)
  type?: RequisitionType; // Requisition type for routing
  costCenterId?: string;
  dateRequested: string;
  dateNeeded: string;
  purpose: string;
  currency?: string;
  items: RequestItem[];
  fileIds?: string[];
}
```

### 3.2 Create Requisition Form Refactoring

**File**: `apps/frontend/src/app/requisitions/create/page.tsx`

#### New Form Structure

```tsx
// 1. Request Type Dropdown
<select value={formData.type} onChange={handleTypeChange}>
  <option value="">Select request type</option>
  {Object.values(RequisitionType).map((type) => (
    <option key={type} value={type}>
      {REQUISITION_TYPE_LABELS[type]}
    </option>
  ))}
</select>

// 2. Your Department (Read-only)
<div className="px-3 py-2.5 bg-zinc-50 border rounded-md">
  <span>{requesterDepartment?.name ?? 'Not assigned'}</span>
</div>
<p className="text-xs text-zinc-500">
  Auto-filled from your profile (approvals route through here)
</p>

// 3. Receiving Department (Filtered by Type)
{!formData.type ? (
  <div>Select a request type first</div>
) : (
  <select value={formData.receivingDepartmentId}>
    <option value="">Select receiving department</option>
    {filteredReceivingDepartments.map((dept) => (
      <option key={dept.id} value={dept.id}>
        {dept.name} ({dept.code})
      </option>
    ))}
  </select>
)}
```

#### Smart Filtering Logic

```tsx
const filteredReceivingDepartments = useMemo(() => {
  if (!formData.type) return [];

  const allowedCodes = REQUEST_TYPE_MAPPING[formData.type as RequisitionType];

  // Empty array means any department can be selected
  if (allowedCodes.length === 0) return departments;

  // Filter departments by allowed codes
  return departments.filter((dept) => allowedCodes.includes(dept.code));
}, [formData.type, departments]);
```

#### Auto-fill Requester Department

```tsx
useEffect(() => {
  if (user?.departmentId) {
    setFormData((prev) => ({
      ...prev,
      departmentId: user.departmentId!,
    }));
  }
}, [user]);
```

---

## Approval Flow Diagram

```
Requester (User)
    ↓
[Create Requisition]
    ↓
Department: User's Dept (for approval routing)
Receiving Dept: Selected based on Request Type
    ↓
[Submit]
    ↓
Lookup Requester's Business Unit
    ↓
┌─────────────────────────────────────┐
│  Level 1: Department Manager        │
│  - Matches User's BU                │
│  - Creates PENDING approval record  │
└─────────────────────────────────────┘
    ↓ [Approve]
    ↓
┌─────────────────────────────────────┐
│  Level 2: Unit Manager              │
│  - Matches User's BU                │
│  - Creates PENDING approval record  │
└─────────────────────────────────────┘
    ↓ [Approve]
    ↓
┌─────────────────────────────────────┐
│  Level 3: General Manager           │
│  - Global approver (any BU)         │
│  - Creates PENDING approval record  │
└─────────────────────────────────────┘
    ↓ [Approve]
    ↓
[Status: APPROVED]
    ↓
Receiving Department processes request
```

---

## Key Business Rules

1. **Approval Routing**: Based on requester's department Business Unit, NOT the receiving department
2. **Approver Assignment**:
   - Level 1-2: Must match requester's Business Unit (via `businessUnitId` or `department.businessUnitId`)
   - Level 3: Global approver with `departmentId: null`
3. **Request Type Routing**: Determines which departments can be selected as receiving/process owner
4. **Dual Department Tracking**:
   - `departmentId`: Where the requester works (approval hierarchy)
   - `receivingDepartmentId`: Who processes the request (fulfillment)
5. **Sequential Approval**: Levels must be approved in order (1→2→3), with approval records created on-demand

---

## Database Migrations Required

```bash
# In apps/backend directory
npm run prisma:migrate dev --name add_bu_approval_and_receiving_dept
npm run prisma:generate
npm run prisma:seed
```

---

## Testing Checklist

- [ ] Seed data creates proper BU hierarchy
- [ ] Approvers assigned at correct levels with BU links
- [ ] Requisition creation saves both departmentId and receivingDepartmentId
- [ ] Submit creates Level 1 approval for correct BU
- [ ] Approve progresses through levels sequentially
- [ ] Level 3 (GM) can approve across all BUs
- [ ] Frontend filters receiving departments based on request type
- [ ] User's department auto-filled and read-only
- [ ] Smart Auth returns department + BU context

---

## Future Enhancements

1. **Dynamic Approval Levels**: Allow BUs to configure 1-3 levels based on amount thresholds
2. **Delegation**: Allow approvers to delegate authority temporarily
3. **Parallel Approvals**: Support multiple approvers at same level (e.g., dual signature)
4. **Escalation**: Auto-escalate to next level if no action within SLA
5. **Audit Trail**: Track all approval actions with timestamps and IP addresses
6. **Conditional Routing**: Route based on amount, category, or other business rules

---

## Files Modified

### Backend

- `apps/backend/prisma/schema.prisma`
- `apps/backend/prisma/seed.ts`
- `apps/backend/src/auth/auth.service.ts`
- `apps/backend/src/requisitions/dto/create-requisition.dto.ts`
- `apps/backend/src/requisitions/requisitions.service.ts`

### Frontend

- `apps/frontend/src/services/requisitionService.ts`
- `apps/frontend/src/app/requisitions/create/page.tsx`
- `apps/frontend/src/lib/constants.ts`

### Shared

- `packages/shared/src/enums.ts`
- `packages/shared/src/types.ts`

---

## References

- Company Document Flow Specifications
- Organizational Hierarchy Chart
- Approval Matrix Documentation
- Business Unit Structure

---

**Completed By**: GitHub Copilot  
**Review Status**: Pending QA Testing  
**Deployment**: Staged for Production
