// User Roles
export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  APPROVER = "APPROVER",
  DEPARTMENT_HEAD = "DEPARTMENT_HEAD",
  FINANCE = "FINANCE",
  ACCOUNTING = "ACCOUNTING",
  TREASURY = "TREASURY",
}

// Requisition Status
export enum RequisitionStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

// Requisition for Payment Status
export enum RFPStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  CV_GENERATED = "CV_GENERATED",
  CHECK_ISSUED = "CHECK_ISSUED",
  DISBURSED = "DISBURSED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

// Cost Center Type
export enum CostCenterType {
  PROJECT = "PROJECT",
  BUSINESS_UNIT = "BUSINESS_UNIT",
  DIVISION = "DIVISION",
}

// Business Unit Status
export enum BusinessUnitStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// Project Status
export enum ProjectStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  COMPLETED = "COMPLETED",
}

// Check Voucher Status
export enum CheckVoucherStatus {
  DRAFT = "DRAFT",
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  VERIFIED = "VERIFIED",
  APPROVED = "APPROVED",
  CHECK_ISSUED = "CHECK_ISSUED",
  REJECTED = "REJECTED",
}

// Check Status
export enum CheckStatus {
  ISSUED = "ISSUED",
  DISBURSED = "DISBURSED",
  VOIDED = "VOIDED",
  CANCELLED = "CANCELLED",
}

// Adjustment Request Status
export enum AdjustmentStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

// Material Issuance Status
export enum MaterialIssuanceStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  ISSUED = "ISSUED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

// Personnel Request Status
export enum PersonnelStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  REVIEWED = "REVIEWED",
  SHORTLISTED = "SHORTLISTED",
  INTERVIEWED = "INTERVIEWED",
  SELECTED = "SELECTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

// Plane Ticket Status
export enum PlaneTicketStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  BOOKED = "BOOKED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

// Cash Advance Status
export enum CashAdvanceStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  DISBURSED = "DISBURSED",
  REPAYING = "REPAYING",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

// Trip Type (for Plane Tickets)
export enum TripType {
  ONE_WAY = "ONE_WAY",
  ROUND_TRIP = "ROUND_TRIP",
}

// Employment Type (for Personnel Requests)
export enum EmploymentType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
  INTERNSHIP = "INTERNSHIP",
}

// ============================================
// Foundation Phase - Organizational Hierarchy
// ============================================

// Approval Level hierarchy for standardized RBAC
// This follows the company's 3-tier approval matrix
export enum ApprovalLevel {
  DEPARTMENT_MANAGER = "DEPARTMENT_MANAGER", // Level 1: Dept Manager / Asst. Manager
  UNIT_MANAGER = "UNIT_MANAGER", // Level 2: Business Unit Manager
  GENERAL_MANAGER = "GENERAL_MANAGER", // Level 3: GM - Final approval
}

// Numeric mapping for approval levels (used in currentApprovalLevel field)
export const APPROVAL_LEVEL_MAP: Record<ApprovalLevel, number> = {
  [ApprovalLevel.DEPARTMENT_MANAGER]: 1,
  [ApprovalLevel.UNIT_MANAGER]: 2,
  [ApprovalLevel.GENERAL_MANAGER]: 3,
};

// Requisition Type - determines process owner/routing
// Based on company's Document Flow specifications
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

// Human-readable labels for Requisition Types
export const REQUISITION_TYPE_LABELS: Record<RequisitionType, string> = {
  [RequisitionType.PURCHASE_REQUEST]: "Purchase Request",
  [RequisitionType.REFUND_LIQUIDATION]: "Refund/Liquidation",
  [RequisitionType.SUBCON_SERVICES]: "Subcontractor Services",
  [RequisitionType.CLEANING_MAINTENANCE]: "Cleaning & Maintenance",
  [RequisitionType.REPAIR_TROUBLESHOOTING]: "Repair & Troubleshooting",
  [RequisitionType.TRAINING]: "Training",
  [RequisitionType.PERMITS_LICENSES]: "Permits & Licenses",
  [RequisitionType.LAB_TESTING]: "Laboratory Testing",
  [RequisitionType.BORROW_ITEMS]: "Borrow Items",
  [RequisitionType.INSTALLATION_SETUP]: "Installation & Setup",
  [RequisitionType.FUEL]: "Fuel",
  [RequisitionType.DOCUMENTS_RECORDS]: "Documents & Records",
  [RequisitionType.FACILITIES_USAGE]: "Facilities Usage",
  [RequisitionType.ALLOWANCES]: "Allowances",
  [RequisitionType.OTHER]: "Other",
};
