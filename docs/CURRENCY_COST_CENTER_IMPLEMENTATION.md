# Currency & Cost Center Fields Implementation Summary

## Overview

This document summarizes the implementation of the **currency** and **cost center** fields in the New Requisition form, as requested and based on the provided reference image.

---

## Backend Changes

### 1. Prisma Schema Updates (`apps/backend/prisma/schema.prisma`)

- Added enums: `CostCenterType`, `BusinessUnitStatus`, `ProjectStatus`
- Created models: `BusinessUnit`, `Project`, `CostCenter`
- Updated `RequisitionSlip` model:
  - `currency` (String, default "PHP")
  - `costCenterId` (optional UUID)
  - `projectId` (optional UUID)
  - `businessUnitId` (optional UUID)

### 2. Cost Centers API (`apps/backend/src/cost-centers`)

- Created `CostCentersModule`, `CostCentersService`, `CostCentersController`
- Endpoints: `GET /cost-centers`, `GET /cost-centers/:id`
- Registered in `AppModule`

### 3. DTOs

- `CreateRequisitionDto` and `UpdateRequisitionDto` now include optional `currency`, `costCenterId`, `projectId`, `businessUnitId`

### 4. Requisitions Service

- `create()` method and queries now include new fields and relations

### 5. Database Migration

- Migration: `20251215110441_add_curency_and_cost_centers` applied

### 6. Seed Data

- 3 Business Units: CHEM, LAB, WATER
- 2 Projects
- 5 Cost Centers (3 Business Unit, 2 Project)

---

## Frontend Changes

### 1. Shared Types (`packages/shared/src`)

- Added enums: `CostCenterType`, `BusinessUnitStatus`, `ProjectStatus`
- Added interfaces: `BusinessUnit`, `Project`, `CostCenter`
- Updated `RequisitionSlip` interface

### 2. Cost Center Service (`apps/frontend/src/services/costCenterService.ts`)

- `getCostCenters()` and `getCostCenter(id)` for API integration

### 3. Requisition Form (`apps/frontend/src/app/requisitions/create/page.tsx`)

- **Currency Dropdown**: PHP (default), USD, EUR, JPY, GBP
- **Cost Center Selector**: Populated from API, shows code, name, and type
- Both fields required and styled as per reference
- Helper text for currency field

### 4. Requisition Service DTO (`apps/frontend/src/services/requisitionService.ts`)

- Extended DTOs with new fields

---

## Form Layout

1. Department (required)
2. Date Requested (required)
3. Date Needed (required)
4. **Currency (required)**
5. **Cost Center (required)**
6. Purpose (required)
7. Items (dynamic array)

---

## Testing & Seed Data

- Seed script creates:
  - CHEM - CHEMICALS (Business Unit)
  - LAB - LABORATORY (Business Unit)
  - WATER - WATER (Business Unit)
  - PROJ-2025-001 - Infrastructure Upgrade 2025 (Project)
  - PROJ-2025-002 - Quality Assurance Initiative (Project)

---

## How to Test

1. Start backend and database (`npm run dev:db`, `npm run dev` in backend)
2. Start frontend (`npm run dev` in frontend)
3. Go to `/requisitions/create`
4. You should see the new Currency and Cost Center fields as shown in the reference image

---

## Status

All changes are implemented, tested, and ready for use.
