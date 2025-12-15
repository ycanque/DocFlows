/*
  Warnings:

  - You are about to drop the column `estimated_cost` on the `request_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "request_items" DROP COLUMN "estimated_cost",
ADD COLUMN     "specification" TEXT,
ADD COLUMN     "total_cost" DECIMAL(15,2),
ADD COLUMN     "unit_cost" DECIMAL(15,2);
