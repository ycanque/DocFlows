// User Roles - RBAC Model v4
export enum UserRole {
  // Base role - can create and submit own requests
  REQUESTER = "REQUESTER",
  // Can approve requests (inherits REQUESTER)
  APPROVER = "APPROVER",
  // Finance/Treasury staff (inherits APPROVER)
  FINANCE_STAFF = "FINANCE_STAFF",
  // Head of Finance/Accounting (inherits FINANCE_STAFF)
  ACCOUNTING_HEAD = "ACCOUNTING_HEAD",
  // Department head - parallel to APPROVER with department scope
  DEPARTMENT_HEAD = "DEPARTMENT_HEAD",
  // Administrator - manages users, departments (inherits ACCOUNTING_HEAD)
  ADMIN = "ADMIN",
  // System administrator - full system access (inherits ADMIN)
  SYSTEM_ADMIN = "SYSTEM_ADMIN",
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
