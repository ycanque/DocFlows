-- AlterTable
ALTER TABLE "requisitions_for_payment" ADD COLUMN     "date_requested" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP;
