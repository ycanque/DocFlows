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
  CostCenterType,
  BusinessUnitStatus,
  ProjectStatus,
  RequisitionType,
  ApprovalLevel,
} from "./enums";

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
  businessUnitId?: string;
  businessUnit?: BusinessUnit;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessUnit {
  id: string;
  unitCode: string;
  name: string;
  description?: string;
  status: BusinessUnitStatus;
  budgetAmount?: number;
  unitManagerId?: string;
  departments?: Department[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  projectCode: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  businessUnitId?: string;
  businessUnit?: BusinessUnit;
  startDate?: string;
  endDate?: string;
  budgetAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CostCenter {
  id: string;
  type: CostCenterType;
  code: string;
  name: string;
  description?: string;
  projectId?: string;
  project?: Project;
  businessUnitId?: string;
  businessUnit?: BusinessUnit;
  isActive: boolean;
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
  submittedBy?: string;
  submitter?: User;
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
  reqSeq: number;
  requesterId: string;
  requester?: User;
  departmentId: string;
  department?: Department;
  costCenterId?: string;
  costCenter?: CostCenter;
  projectId?: string;
  project?: Project;
  businessUnitId?: string;
  businessUnit?: BusinessUnit;
  type: RequisitionType;
  processOwnerDeptCode?: string;
  dateRequested: string;
  dateNeeded: string;
  purpose: string;
  currency: string;
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
  specification?: string;
  unitCost?: number;
  subtotal?: number;
  createdAt: string;
  updatedAt: string;
}

// Payment Entities
export interface RequisitionForPayment {
  id: string;
  rfpNumber: string;
  rfpSeq: number;
  requisitionSlipId?: string;
  requisitionSlip?: RequisitionSlip;
  requesterId: string;
  requester?: User;
  departmentId: string;
  department?: Department;
  seriesCode: string;
  dateRequested: string;
  dateNeeded: string;
  payee: string;
  particulars: string;
  amount: number;
  currency: string;
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
  receivedBy?: string;
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
