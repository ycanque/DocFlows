-- AlterTable
ALTER TABLE "requisition_slips" ADD COLUMN     "req_seq" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "requisitions_for_payment" ADD COLUMN     "rfp_seq" SERIAL NOT NULL;
