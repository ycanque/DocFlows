-- AlterTable
ALTER TABLE "approval_records" ADD COLUMN     "submitted_by" UUID;

-- CreateIndex
CREATE INDEX "approval_records_submitted_by_idx" ON "approval_records"("submitted_by");

-- AddForeignKey
ALTER TABLE "approval_records" ADD CONSTRAINT "approval_records_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
