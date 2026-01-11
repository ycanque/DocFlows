-- CreateEnum
CREATE TYPE "ApprovalLevel" AS ENUM ('DEPARTMENT_MANAGER', 'UNIT_MANAGER', 'GENERAL_MANAGER');

-- CreateEnum
CREATE TYPE "RequisitionType" AS ENUM ('PURCHASE_REQUEST', 'REFUND_LIQUIDATION', 'SUBCON_SERVICES', 'CLEANING_MAINTENANCE', 'REPAIR_TROUBLESHOOTING', 'TRAINING', 'PERMITS_LICENSES', 'LAB_TESTING', 'BORROW_ITEMS', 'INSTALLATION_SETUP', 'FUEL', 'DOCUMENTS_RECORDS', 'FACILITIES_USAGE', 'ALLOWANCES', 'OTHER');

-- AlterTable
ALTER TABLE "business_units" ADD COLUMN     "unit_manager_id" UUID;

-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "business_unit_id" UUID;

-- AlterTable
ALTER TABLE "requisition_slips" ADD COLUMN     "process_owner_dept_code" TEXT,
ADD COLUMN     "requisition_type" "RequisitionType" NOT NULL DEFAULT 'PURCHASE_REQUEST';

-- CreateIndex
CREATE INDEX "business_units_unit_manager_id_idx" ON "business_units"("unit_manager_id");

-- CreateIndex
CREATE INDEX "departments_business_unit_id_idx" ON "departments"("business_unit_id");

-- CreateIndex
CREATE INDEX "requisition_slips_requisition_type_idx" ON "requisition_slips"("requisition_type");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "business_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;
