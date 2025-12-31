-- CreateEnum
CREATE TYPE "FileUploadStatus" AS ENUM ('UPLOADING', 'COMPLETED', 'FAILED', 'DELETED');

-- CreateTable
CREATE TABLE "file_uploads" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "original_file_name" TEXT NOT NULL,
    "bucket_name" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "status" "FileUploadStatus" NOT NULL DEFAULT 'UPLOADING',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "file_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "file_uploads_user_id_idx" ON "file_uploads"("user_id");

-- CreateIndex
CREATE INDEX "file_uploads_bucket_name_idx" ON "file_uploads"("bucket_name");

-- CreateIndex
CREATE INDEX "file_uploads_status_idx" ON "file_uploads"("status");

-- CreateIndex
CREATE INDEX "file_uploads_uploaded_at_idx" ON "file_uploads"("uploaded_at");

-- AddForeignKey
ALTER TABLE "file_uploads" ADD CONSTRAINT "file_uploads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
