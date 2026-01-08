/*
Warnings:

- The values [USER,FINANCE,ACCOUNTING,TREASURY] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

Migration Strategy:
- USER -> REQUESTER (basic user becomes requester)
- FINANCE -> FINANCE_STAFF (finance staff)
- ACCOUNTING -> ACCOUNTING_HEAD (accounting head)
- TREASURY -> FINANCE_STAFF (treasury becomes finance staff)
- ADMIN -> ADMIN (remains admin)
- APPROVER -> APPROVER (remains approver)
- DEPARTMENT_HEAD -> DEPARTMENT_HEAD (remains department head)
*/

-- AlterEnum
BEGIN;

-- Step 1: Create new enum type
CREATE TYPE "UserRole_new" AS ENUM ('REQUESTER', 'APPROVER', 'FINANCE_STAFF', 'ACCOUNTING_HEAD', 'DEPARTMENT_HEAD', 'ADMIN', 'SYSTEM_ADMIN');

-- Step 2: Remove default temporarily
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;

-- Step 3: Change column to use new enum type with mapping
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING (
  CASE "role"::text
    WHEN 'USER' THEN 'REQUESTER'::"UserRole_new"
    WHEN 'FINANCE' THEN 'FINANCE_STAFF'::"UserRole_new"
    WHEN 'ACCOUNTING' THEN 'ACCOUNTING_HEAD'::"UserRole_new"
    WHEN 'TREASURY' THEN 'FINANCE_STAFF'::"UserRole_new"
    WHEN 'ADMIN' THEN 'ADMIN'::"UserRole_new"
    WHEN 'APPROVER' THEN 'APPROVER'::"UserRole_new"
    WHEN 'DEPARTMENT_HEAD' THEN 'DEPARTMENT_HEAD'::"UserRole_new"
    ELSE 'REQUESTER'::"UserRole_new"
  END
);

-- Step 4: Rename old enum and new enum
ALTER TYPE "UserRole" RENAME TO "UserRole_old";

ALTER TYPE "UserRole_new" RENAME TO "UserRole";

-- Step 5: Drop old enum type
DROP TYPE "public"."UserRole_old";

-- Step 6: Set new default
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'REQUESTER';

COMMIT;