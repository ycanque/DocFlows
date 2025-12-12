-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER', 'APPROVER', 'DEPARTMENT_HEAD', 'FINANCE', 'ACCOUNTING', 'TREASURY');

-- CreateEnum
CREATE TYPE "RequisitionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RFPStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'CV_GENERATED', 'CHECK_ISSUED', 'DISBURSED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CheckVoucherStatus" AS ENUM ('DRAFT', 'PENDING_VERIFICATION', 'VERIFIED', 'APPROVED', 'CHECK_ISSUED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CheckStatus" AS ENUM ('ISSUED', 'CLEARED', 'VOIDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AdjustmentStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MaterialIssuanceStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'ISSUED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PersonnelStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWED', 'SHORTLISTED', 'INTERVIEWED', 'SELECTED', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "PlaneTicketStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'BOOKED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TripType" AS ENUM ('ONE_WAY', 'ROUND_TRIP');

-- CreateEnum
CREATE TYPE "CashAdvanceStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'DISBURSED', 'REPAYING', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "department_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "head_of_department_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approvers" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "department_id" UUID,
    "approval_level" INTEGER NOT NULL,
    "approval_limit" DECIMAL(15,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approvers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_records" (
    "id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "approval_level" INTEGER NOT NULL,
    "approved_by" UUID,
    "rejected_by" UUID,
    "comments" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requisition_slips" (
    "id" UUID NOT NULL,
    "requisition_number" TEXT NOT NULL,
    "requester_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "date_requested" DATE NOT NULL,
    "date_needed" DATE NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" "RequisitionStatus" NOT NULL DEFAULT 'DRAFT',
    "current_approval_level" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requisition_slips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_items" (
    "id" UUID NOT NULL,
    "requisition_slip_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "particulars" TEXT NOT NULL,
    "estimated_cost" DECIMAL(15,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "request_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requisitions_for_payment" (
    "id" UUID NOT NULL,
    "rfp_number" TEXT NOT NULL,
    "requisition_slip_id" UUID,
    "requester_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "series_code" TEXT NOT NULL,
    "date_needed" DATE NOT NULL,
    "payee" TEXT NOT NULL,
    "particulars" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "status" "RFPStatus" NOT NULL DEFAULT 'DRAFT',
    "current_approval_level" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requisitions_for_payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_vouchers" (
    "id" UUID NOT NULL,
    "cv_number" TEXT NOT NULL,
    "requisition_for_payment_id" UUID NOT NULL,
    "payee" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "particulars" TEXT NOT NULL,
    "status" "CheckVoucherStatus" NOT NULL DEFAULT 'DRAFT',
    "verified_by" UUID,
    "approved_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "check_vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checks" (
    "id" UUID NOT NULL,
    "check_number" TEXT NOT NULL,
    "check_voucher_id" UUID NOT NULL,
    "bank_account_id" UUID NOT NULL,
    "payee" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "check_date" DATE NOT NULL,
    "status" "CheckStatus" NOT NULL DEFAULT 'ISSUED',
    "issued_by" UUID,
    "disbursed_by" UUID,
    "disbursement_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" UUID NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests_for_adjustment" (
    "id" UUID NOT NULL,
    "rfa_number" TEXT NOT NULL,
    "requester_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "date_requested" DATE NOT NULL,
    "purpose_of_adjustment" TEXT NOT NULL,
    "details_of_adjustment" TEXT NOT NULL,
    "status" "AdjustmentStatus" NOT NULL DEFAULT 'DRAFT',
    "current_approval_level" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_for_adjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adjustment_items" (
    "id" UUID NOT NULL,
    "request_for_adjustment_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "original_amount" DECIMAL(15,2) NOT NULL,
    "adjusted_amount" DECIMAL(15,2) NOT NULL,
    "difference" DECIMAL(15,2) NOT NULL,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adjustment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_issuance_slips" (
    "id" UUID NOT NULL,
    "slip_number" TEXT NOT NULL,
    "issued_by_id" UUID NOT NULL,
    "approved_by_id" UUID,
    "received_by_id" UUID NOT NULL,
    "charged_to" TEXT NOT NULL,
    "project_number" TEXT,
    "date" DATE NOT NULL,
    "status" "MaterialIssuanceStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_issuance_slips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_items" (
    "id" UUID NOT NULL,
    "material_issuance_slip_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "uom" TEXT NOT NULL,
    "required_quantity" INTEGER NOT NULL,
    "issued_quantity" INTEGER NOT NULL,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnel_requests" (
    "id" UUID NOT NULL,
    "request_number" TEXT NOT NULL,
    "requester_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "position" TEXT NOT NULL,
    "number_of_personnel" INTEGER NOT NULL,
    "type_of_employment" "EmploymentType" NOT NULL,
    "qualifications" TEXT[],
    "duties_and_responsibilities" TEXT[],
    "status" "PersonnelStatus" NOT NULL DEFAULT 'DRAFT',
    "current_approval_level" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personnel_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plane_ticket_requests" (
    "id" UUID NOT NULL,
    "ticket_number" TEXT NOT NULL,
    "requester_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "family_name" TEXT NOT NULL,
    "contact_number" TEXT NOT NULL,
    "charge_to" TEXT NOT NULL,
    "trip_type" "TripType" NOT NULL,
    "departure" TEXT NOT NULL,
    "return_date" TEXT,
    "baggage" TEXT,
    "purpose_of_travel" TEXT NOT NULL,
    "status" "PlaneTicketStatus" NOT NULL DEFAULT 'DRAFT',
    "current_approval_level" INTEGER NOT NULL DEFAULT 0,
    "booking_reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plane_ticket_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_advance_agreements" (
    "id" UUID NOT NULL,
    "agreement_number" TEXT NOT NULL,
    "employee_id" UUID NOT NULL,
    "employee_name" TEXT NOT NULL,
    "cash_advance_amount" DECIMAL(15,2) NOT NULL,
    "repayment_amount" DECIMAL(15,2) NOT NULL,
    "repayment_balance" DECIMAL(15,2) NOT NULL,
    "signed_date" DATE NOT NULL,
    "status" "CashAdvanceStatus" NOT NULL DEFAULT 'DRAFT',
    "current_approval_level" INTEGER NOT NULL DEFAULT 0,
    "disbursement_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_advance_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_department_id_idx" ON "users"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE INDEX "departments_code_idx" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "approvers_user_id_key" ON "approvers"("user_id");

-- CreateIndex
CREATE INDEX "approvers_user_id_idx" ON "approvers"("user_id");

-- CreateIndex
CREATE INDEX "approvers_department_id_idx" ON "approvers"("department_id");

-- CreateIndex
CREATE INDEX "approvers_approval_level_idx" ON "approvers"("approval_level");

-- CreateIndex
CREATE INDEX "approval_records_entity_type_entity_id_idx" ON "approval_records"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "approval_records_approved_by_idx" ON "approval_records"("approved_by");

-- CreateIndex
CREATE INDEX "approval_records_rejected_by_idx" ON "approval_records"("rejected_by");

-- CreateIndex
CREATE UNIQUE INDEX "requisition_slips_requisition_number_key" ON "requisition_slips"("requisition_number");

-- CreateIndex
CREATE INDEX "requisition_slips_requisition_number_idx" ON "requisition_slips"("requisition_number");

-- CreateIndex
CREATE INDEX "requisition_slips_requester_id_idx" ON "requisition_slips"("requester_id");

-- CreateIndex
CREATE INDEX "requisition_slips_department_id_idx" ON "requisition_slips"("department_id");

-- CreateIndex
CREATE INDEX "requisition_slips_status_idx" ON "requisition_slips"("status");

-- CreateIndex
CREATE INDEX "request_items_requisition_slip_id_idx" ON "request_items"("requisition_slip_id");

-- CreateIndex
CREATE UNIQUE INDEX "requisitions_for_payment_rfp_number_key" ON "requisitions_for_payment"("rfp_number");

-- CreateIndex
CREATE INDEX "requisitions_for_payment_rfp_number_idx" ON "requisitions_for_payment"("rfp_number");

-- CreateIndex
CREATE INDEX "requisitions_for_payment_requester_id_idx" ON "requisitions_for_payment"("requester_id");

-- CreateIndex
CREATE INDEX "requisitions_for_payment_department_id_idx" ON "requisitions_for_payment"("department_id");

-- CreateIndex
CREATE INDEX "requisitions_for_payment_status_idx" ON "requisitions_for_payment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "check_vouchers_cv_number_key" ON "check_vouchers"("cv_number");

-- CreateIndex
CREATE UNIQUE INDEX "check_vouchers_requisition_for_payment_id_key" ON "check_vouchers"("requisition_for_payment_id");

-- CreateIndex
CREATE INDEX "check_vouchers_cv_number_idx" ON "check_vouchers"("cv_number");

-- CreateIndex
CREATE INDEX "check_vouchers_status_idx" ON "check_vouchers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "checks_check_number_key" ON "checks"("check_number");

-- CreateIndex
CREATE UNIQUE INDEX "checks_check_voucher_id_key" ON "checks"("check_voucher_id");

-- CreateIndex
CREATE INDEX "checks_check_number_idx" ON "checks"("check_number");

-- CreateIndex
CREATE INDEX "checks_bank_account_id_idx" ON "checks"("bank_account_id");

-- CreateIndex
CREATE INDEX "checks_status_idx" ON "checks"("status");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_account_number_key" ON "bank_accounts"("account_number");

-- CreateIndex
CREATE INDEX "bank_accounts_account_number_idx" ON "bank_accounts"("account_number");

-- CreateIndex
CREATE UNIQUE INDEX "requests_for_adjustment_rfa_number_key" ON "requests_for_adjustment"("rfa_number");

-- CreateIndex
CREATE INDEX "requests_for_adjustment_rfa_number_idx" ON "requests_for_adjustment"("rfa_number");

-- CreateIndex
CREATE INDEX "requests_for_adjustment_requester_id_idx" ON "requests_for_adjustment"("requester_id");

-- CreateIndex
CREATE INDEX "requests_for_adjustment_department_id_idx" ON "requests_for_adjustment"("department_id");

-- CreateIndex
CREATE INDEX "requests_for_adjustment_status_idx" ON "requests_for_adjustment"("status");

-- CreateIndex
CREATE INDEX "adjustment_items_request_for_adjustment_id_idx" ON "adjustment_items"("request_for_adjustment_id");

-- CreateIndex
CREATE UNIQUE INDEX "material_issuance_slips_slip_number_key" ON "material_issuance_slips"("slip_number");

-- CreateIndex
CREATE INDEX "material_issuance_slips_slip_number_idx" ON "material_issuance_slips"("slip_number");

-- CreateIndex
CREATE INDEX "material_issuance_slips_issued_by_id_idx" ON "material_issuance_slips"("issued_by_id");

-- CreateIndex
CREATE INDEX "material_issuance_slips_status_idx" ON "material_issuance_slips"("status");

-- CreateIndex
CREATE INDEX "material_items_material_issuance_slip_id_idx" ON "material_items"("material_issuance_slip_id");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_requests_request_number_key" ON "personnel_requests"("request_number");

-- CreateIndex
CREATE INDEX "personnel_requests_request_number_idx" ON "personnel_requests"("request_number");

-- CreateIndex
CREATE INDEX "personnel_requests_requester_id_idx" ON "personnel_requests"("requester_id");

-- CreateIndex
CREATE INDEX "personnel_requests_department_id_idx" ON "personnel_requests"("department_id");

-- CreateIndex
CREATE INDEX "personnel_requests_status_idx" ON "personnel_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "plane_ticket_requests_ticket_number_key" ON "plane_ticket_requests"("ticket_number");

-- CreateIndex
CREATE INDEX "plane_ticket_requests_ticket_number_idx" ON "plane_ticket_requests"("ticket_number");

-- CreateIndex
CREATE INDEX "plane_ticket_requests_requester_id_idx" ON "plane_ticket_requests"("requester_id");

-- CreateIndex
CREATE INDEX "plane_ticket_requests_status_idx" ON "plane_ticket_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "cash_advance_agreements_agreement_number_key" ON "cash_advance_agreements"("agreement_number");

-- CreateIndex
CREATE INDEX "cash_advance_agreements_agreement_number_idx" ON "cash_advance_agreements"("agreement_number");

-- CreateIndex
CREATE INDEX "cash_advance_agreements_employee_id_idx" ON "cash_advance_agreements"("employee_id");

-- CreateIndex
CREATE INDEX "cash_advance_agreements_status_idx" ON "cash_advance_agreements"("status");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvers" ADD CONSTRAINT "approvers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvers" ADD CONSTRAINT "approvers_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_records" ADD CONSTRAINT "approval_records_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_records" ADD CONSTRAINT "approval_records_rejected_by_fkey" FOREIGN KEY ("rejected_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_slips" ADD CONSTRAINT "requisition_slips_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_slips" ADD CONSTRAINT "requisition_slips_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_items" ADD CONSTRAINT "request_items_requisition_slip_id_fkey" FOREIGN KEY ("requisition_slip_id") REFERENCES "requisition_slips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitions_for_payment" ADD CONSTRAINT "requisitions_for_payment_requisition_slip_id_fkey" FOREIGN KEY ("requisition_slip_id") REFERENCES "requisition_slips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitions_for_payment" ADD CONSTRAINT "requisitions_for_payment_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitions_for_payment" ADD CONSTRAINT "requisitions_for_payment_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_vouchers" ADD CONSTRAINT "check_vouchers_requisition_for_payment_id_fkey" FOREIGN KEY ("requisition_for_payment_id") REFERENCES "requisitions_for_payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checks" ADD CONSTRAINT "checks_check_voucher_id_fkey" FOREIGN KEY ("check_voucher_id") REFERENCES "check_vouchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checks" ADD CONSTRAINT "checks_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests_for_adjustment" ADD CONSTRAINT "requests_for_adjustment_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests_for_adjustment" ADD CONSTRAINT "requests_for_adjustment_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adjustment_items" ADD CONSTRAINT "adjustment_items_request_for_adjustment_id_fkey" FOREIGN KEY ("request_for_adjustment_id") REFERENCES "requests_for_adjustment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_items" ADD CONSTRAINT "material_items_material_issuance_slip_id_fkey" FOREIGN KEY ("material_issuance_slip_id") REFERENCES "material_issuance_slips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_requests" ADD CONSTRAINT "personnel_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_requests" ADD CONSTRAINT "personnel_requests_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plane_ticket_requests" ADD CONSTRAINT "plane_ticket_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_advance_agreements" ADD CONSTRAINT "cash_advance_agreements_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
