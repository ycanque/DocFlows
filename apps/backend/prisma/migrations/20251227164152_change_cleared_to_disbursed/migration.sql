/*
  Warnings:

  - The values [CLEARED] on the enum `CheckStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CheckStatus_new" AS ENUM ('ISSUED', 'DISBURSED', 'VOIDED', 'CANCELLED');
ALTER TABLE "public"."checks" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "checks" ALTER COLUMN "status" TYPE "CheckStatus_new" USING ("status"::text::"CheckStatus_new");
ALTER TYPE "CheckStatus" RENAME TO "CheckStatus_old";
ALTER TYPE "CheckStatus_new" RENAME TO "CheckStatus";
DROP TYPE "public"."CheckStatus_old";
ALTER TABLE "checks" ALTER COLUMN "status" SET DEFAULT 'ISSUED';
COMMIT;
