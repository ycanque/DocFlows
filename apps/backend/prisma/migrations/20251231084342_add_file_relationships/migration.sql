-- AlterTable
ALTER TABLE "file_uploads" ADD COLUMN     "requisition_for_payment_id" UUID,
ADD COLUMN     "requisition_slip_id" UUID;

-- CreateIndex
CREATE INDEX "file_uploads_requisition_slip_id_idx" ON "file_uploads"("requisition_slip_id");

-- CreateIndex
CREATE INDEX "file_uploads_requisition_for_payment_id_idx" ON "file_uploads"("requisition_for_payment_id");

-- AddForeignKey
ALTER TABLE "file_uploads" ADD CONSTRAINT "file_uploads_requisition_slip_id_fkey" FOREIGN KEY ("requisition_slip_id") REFERENCES "requisition_slips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_uploads" ADD CONSTRAINT "file_uploads_requisition_for_payment_id_fkey" FOREIGN KEY ("requisition_for_payment_id") REFERENCES "requisitions_for_payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
