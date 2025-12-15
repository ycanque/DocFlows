-- CreateEnum
CREATE TYPE "CostCenterType" AS ENUM ('PROJECT', 'BUSINESS_UNIT', 'DIVISION');

-- CreateEnum
CREATE TYPE "BusinessUnitStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED');

-- AlterTable
ALTER TABLE "requisition_slips" ADD COLUMN     "business_unit_id" UUID,
ADD COLUMN     "cost_center_id" UUID,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'PHP',
ADD COLUMN     "project_id" UUID;

-- CreateTable
CREATE TABLE "business_units" (
    "id" UUID NOT NULL,
    "unit_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "BusinessUnitStatus" NOT NULL DEFAULT 'ACTIVE',
    "budget_amount" DECIMAL(15,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "project_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "business_unit_id" UUID,
    "start_date" DATE,
    "end_date" DATE,
    "budget_amount" DECIMAL(15,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" UUID NOT NULL,
    "type" "CostCenterType" NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "project_id" UUID,
    "business_unit_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_units_unit_code_key" ON "business_units"("unit_code");

-- CreateIndex
CREATE INDEX "business_units_unit_code_idx" ON "business_units"("unit_code");

-- CreateIndex
CREATE INDEX "business_units_status_idx" ON "business_units"("status");

-- CreateIndex
CREATE UNIQUE INDEX "projects_project_code_key" ON "projects"("project_code");

-- CreateIndex
CREATE INDEX "projects_project_code_idx" ON "projects"("project_code");

-- CreateIndex
CREATE INDEX "projects_business_unit_id_idx" ON "projects"("business_unit_id");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_code_key" ON "cost_centers"("code");

-- CreateIndex
CREATE INDEX "cost_centers_code_idx" ON "cost_centers"("code");

-- CreateIndex
CREATE INDEX "cost_centers_type_idx" ON "cost_centers"("type");

-- CreateIndex
CREATE INDEX "cost_centers_project_id_idx" ON "cost_centers"("project_id");

-- CreateIndex
CREATE INDEX "cost_centers_business_unit_id_idx" ON "cost_centers"("business_unit_id");

-- CreateIndex
CREATE INDEX "requisition_slips_cost_center_id_idx" ON "requisition_slips"("cost_center_id");

-- CreateIndex
CREATE INDEX "requisition_slips_project_id_idx" ON "requisition_slips"("project_id");

-- CreateIndex
CREATE INDEX "requisition_slips_business_unit_id_idx" ON "requisition_slips"("business_unit_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "business_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "business_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_slips" ADD CONSTRAINT "requisition_slips_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_slips" ADD CONSTRAINT "requisition_slips_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_slips" ADD CONSTRAINT "requisition_slips_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "business_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;
