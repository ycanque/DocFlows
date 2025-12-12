import {
  UserRole,
  RequisitionStatus,
  RFPStatus,
  CheckVoucherStatus,
  CheckStatus,
  AdjustmentStatus,
  MaterialIssuanceStatus,
  PersonnelStatus,
  PlaneTicketStatus,
  CashAdvanceStatus,
  TripType,
  EmploymentType,
} from './enums';

// Core Entities
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  departmentId?: string;
  department?: Department;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headOfDepartmentId?: string;
  headOfDepartment?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Approver {
  id: string;
  userId: string;
  user?: User;
  departmentId?: string;
  department?: Department;
  approvalLevel: number;
  approvalLimit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalRecord {
  id: string;
  entityType: string;
  entityId: string;
  approvalLevel: number;
  approvedBy?: string;
  approver?: User;
  rejectedBy?: string;
  rejector?: User;
  comments?: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

// Requisition Entities
export interface RequisitionSlip {
  id: string;
  requisitionNumber: string;
  requesterId: string;
  requester?: User;
  departmentId: string;
  department?: Department;
  dateRequested: string;
  dateNeeded: string;
  purpose: string;
  status: RequisitionStatus;
  currentApprovalLevel: number;
  items: RequestItem[];
  approvalRecords?: ApprovalRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface RequestItem {
  id: string;
  requisitionSlipId: string;
  quantity: number;
  unit: string;
  particulars: string;
  estimatedCost?: number;
  createdAt: string;
  updatedAt: string;
}

// Payment Entities
export interface RequisitionForPayment {
  id: string;
  rfpNumber: string;
  requisitionSlipId?: string;
  requisitionSlip?: RequisitionSlip;
  requesterId: string;
  requester?: User;
  departmentId: string;
  department?: Department;
  seriesCode: string;
  dateNeeded: string;
  payee: string;
  particulars: string;
  amount: number;
  status: RFPStatus;
  currentApprovalLevel: number;
  checkVoucher?: CheckVoucher;
  approvalRecords?: ApprovalRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckVoucher {
  id: string;
  cvNumber: string;
  requisitionForPaymentId: string;
  requisitionForPayment?: RequisitionForPayment;
  payee: string;
  amount: number;
  particulars: string;
  status: CheckVoucherStatus;
  verifiedBy?: string;
  verifier?: User;
  approvedBy?: string;
  approver?: User;
  check?: Check;
  createdAt: string;
  updatedAt: string;
}

export interface Check {
  id: string;
  checkNumber: string;
  checkVoucherId: string;
  checkVoucher?: CheckVoucher;
  bankAccountId: string;
  bankAccount?: BankAccount;
  payee: string;
  amount: number;
  checkDate: string;
  status: CheckStatus;
  issuedBy?: string;
  issuer?: User;
  disbursedBy?: string;
  disburser?: User;
  disbursementDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Adjustment Entities
export interface RequestForAdjustment {
  id: string;
  rfaNumber: string;
  requesterId: string;
  requester?: User;
  departmentId: string;
  department?: Department;
  dateRequested: string;
  purposeOfAdjustment: string;
  detailsOfAdjustment: string;
  status: AdjustmentStatus;
  currentApprovalLevel: number;
  items: AdjustmentItem[];
  approvalRecords?: ApprovalRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface AdjustmentItem {
  id: string;
  requestForAdjustmentId: string;
  description: string;
  originalAmount: number;
  adjustedAmount: number;
  difference: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// Material Entities
export interface MaterialIssuanceSlip {
  id: string;
  slipNumber: string;
  issuedById: string;
  issuedBy?: User;
  approvedById?: string;
  approver?: User;
  receivedById: string;
  receiver?: User;
  chargedTo: string;
  projectNumber?: string;
  date: string;
  status: MaterialIssuanceStatus;
  items: MaterialItem[];
  approvalRecords?: ApprovalRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface MaterialItem {
  id: string;
  materialIssuanceSlipId: string;
  description: string;
  uom: string;
  requiredQuantity: number;
  issuedQuantity: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// Personnel Entities
export interface PersonnelRequest {
  id: string;
  requestNumber: string;
  requesterId: string;
  requester?: User;
  departmentId: string;
  department?: Department;
  position: string;
  numberOfPersonnel: number;
  typeOfEmployment: EmploymentType;
  qualifications: string[];
  dutiesAndResponsibilities: string[];
  status: PersonnelStatus;
  currentApprovalLevel: number;
  approvalRecords?: ApprovalRecord[];
  createdAt: string;
  updatedAt: string;
}

// Plane Ticket Entities
export interface PlaneTicketRequest {
  id: string;
  ticketNumber: string;
  requesterId: string;
  requester?: User;
  firstName: string;
  middleName?: string;
  familyName: string;
  contactNumber: string;
  chargeTo: string;
  tripType: TripType;
  departure: string;
  returnDate?: string;
  baggage?: string;
  purposeOfTravel: string;
  status: PlaneTicketStatus;
  currentApprovalLevel: number;
  bookingReference?: string;
  approvalRecords?: ApprovalRecord[];
  createdAt: string;
  updatedAt: string;
}

// Cash Advance Entities
export interface CashAdvanceAgreement {
  id: string;
  agreementNumber: string;
  employeeId: string;
  employee?: User;
  employeeName: string;
  cashAdvanceAmount: number;
  repaymentAmount: number;
  repaymentBalance: number;
  signedDate: string;
  status: CashAdvanceStatus;
  currentApprovalLevel: number;
  disbursementDate?: string;
  approvalRecords?: ApprovalRecord[];
  createdAt: string;
  updatedAt: string;
}
