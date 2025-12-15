/*
  Warnings:

  - You are about to drop the column `total_cost` on the `request_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "request_items" DROP COLUMN "total_cost",
ADD COLUMN     "subtotal" DECIMAL(15,2);
