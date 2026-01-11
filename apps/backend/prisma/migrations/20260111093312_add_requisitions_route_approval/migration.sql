-- AlterTable
ALTER TABLE "approvers" ADD COLUMN     "business_unit_id" UUID;

-- AlterTable
ALTER TABLE "requisition_slips" ADD COLUMN     "receiving_department_id" UUID;

-- CreateIndex
CREATE INDEX "approvers_business_unit_id_idx" ON "approvers"("business_unit_id");

-- CreateIndex
CREATE INDEX "requisition_slips_receiving_department_id_idx" ON "requisition_slips"("receiving_department_id");

-- AddForeignKey
ALTER TABLE "approvers" ADD CONSTRAINT "approvers_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "business_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_slips" ADD CONSTRAINT "requisition_slips_receiving_department_id_fkey" FOREIGN KEY ("receiving_department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
