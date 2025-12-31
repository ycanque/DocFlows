# Backend-Managed Upload System Implementation

**Date:** December 31, 2025  
**Status:** ✅ Implemented & Tested  
**Version:** 1.0.0

---

## 📋 Overview

A production-ready file upload system has been implemented using a **Backend-Managed Architecture** where the frontend uploads files to a NestJS backend API, which then manages all interactions with Supabase Storage. This approach provides centralized security, better validation, and complete audit trails.

### Architecture

```
Next.js Frontend → NestJS Backend API → Supabase Storage
   (JWT)           (validates JWT)      (service key)
                   (validates files)
                   (saves metadata)
                   (tracks uploads)
```

---

## 🏗️ Implementation Details

### Backend Components

#### 1. **Prisma Schema Updates** ([apps/backend/prisma/schema.prisma](../apps/backend/prisma/schema.prisma))

New `FileUpload` model added:
```prisma
enum FileUploadStatus {
  UPLOADING
  COMPLETED
  FAILED
  DELETED
}

model FileUpload {
  id                String            @id @default(uuid()) @db.Uuid
  userId            String            @map("user_id") @db.Uuid
  user              User              @relation(fields: [userId], references: [id])
  fileName          String            @map("file_name")
  originalFileName  String            @map("original_file_name")
  bucketName        String            @map("bucket_name")
  storagePath       String            @map("storage_path")
  fileSize          BigInt            @map("file_size")
  mimeType          String            @map("mime_type")
  status            FileUploadStatus  @default(UPLOADING)
  uploadedAt        DateTime          @default(now()) @map("uploaded_at")
  deletedAt         DateTime?         @map("deleted_at")
  metadata          Json?
  
  @@map("file_uploads")
  @@index([userId])
  @@index([bucketName])
  @@index([status])
  @@index([uploadedAt])
}
```

#### 2. **Supabase Service** ([apps/backend/src/uploads/supabase.service.ts](../apps/backend/src/uploads/supabase.service.ts))

Handles all Supabase Storage interactions using the **service role key** (bypasses RLS for server-side operations).

**Methods:**
- `uploadFile()` - Upload file to Supabase Storage
- `deleteFile()` - Delete file from storage
- `listFiles()` - List files in bucket
- `getPublicUrl()` - Get public URL for file
- `getSignedUrl()` - Get temporary signed URL
- `downloadFile()` - Download file blob
- `createBucket()` - Create new storage bucket

#### 3. **Uploads Service** ([apps/backend/src/uploads/uploads.service.ts](../apps/backend/src/uploads/uploads.service.ts))

Business logic layer for file operations.

**Methods:**
- `uploadFile()` - Validate, upload, and save metadata
- `listUserFiles()` - Get user's files from database
- `getFile()` - Get single file details
- `deleteFile()` - Delete file (soft delete)
- `getSignedUrl()` - Generate temporary download URL
- `downloadFile()` - Download file

**Key Features:**
- File validation (size, type)
- User isolation (only user's own files)
- Metadata tracking in PostgreSQL
- Soft deletes (files marked deleted, not purged)

#### 4. **Uploads Controller** ([apps/backend/src/uploads/uploads.controller.ts](../apps/backend/src/uploads/uploads.controller.ts))

REST API endpoints with JWT authentication.

#### 5. **Uploads Module** ([apps/backend/src/uploads/uploads.module.ts](../apps/backend/src/uploads/uploads.module.ts))

Registered in [apps/backend/src/app.module.ts](../apps/backend/src/app.module.ts)

### Frontend Components

#### 1. **Supabase Client** ([apps/frontend/src/lib/supabase.ts](../apps/frontend/src/lib/supabase.ts))

Supabase client instance (now primarily for future use; current implementation uses backend API).

#### 2. **Upload Service** ([apps/frontend/src/services/uploadService.ts](../apps/frontend/src/services/uploadService.ts))

Updated to use backend API instead of direct Supabase access.

**Methods:**
- `uploadFile()` - POST to `/uploads` endpoint
- `listFiles()` - GET from `/uploads` endpoint
- `deleteFile()` - DELETE from `/uploads/:id`
- `getFile()` - GET from `/uploads/:id`
- `getSignedUrl()` - GET from `/uploads/:id/signed-url`
- `downloadFile()` - GET from `/uploads/:id/download`

#### 3. **File Upload Component** ([apps/frontend/src/components/FileUpload.tsx](../apps/frontend/src/components/FileUpload.tsx))

Reusable file input component with:
- File selection
- Progress tracking
- Size validation
- Error handling

#### 4. **Test Page** ([apps/frontend/src/app/uploads/page.tsx](../apps/frontend/src/app/uploads/page.tsx))

Demonstration page at `/uploads` route with:
- Upload form
- File listing table
- File management (view, delete)
- Bucket filtering

---

## 🔌 API Endpoints

All endpoints require JWT authentication (Bearer token).

### Upload File
```
POST /uploads
Content-Type: multipart/form-data

Form Data:
- file: File (required)
- bucket: string (optional, default: "documents")
- folder: string (optional)

Response:
{
  "id": "uuid",
  "fileName": "1767168831389_document.pdf",
  "originalFileName": "document.pdf",
  "storagePath": "1767168831389_document.pdf",
  "fileSize": 45650060,
  "mimeType": "application/pdf",
  "url": "http://127.0.0.1:54321/storage/v1/object/public/documents/...",
  "uploadedAt": "2025-12-31T20:13:51.389Z"
}
```

### List User Files
```
GET /uploads?bucket=documents

Response:
[
  {
    "id": "uuid",
    "fileName": "1767168831389_document.pdf",
    "originalFileName": "document.pdf",
    ...
  }
]
```

### Get Single File
```
GET /uploads/:id

Response: FileResponseDto
```

### Delete File
```
DELETE /uploads/:id

Response:
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Get Signed URL
```
GET /uploads/:id/signed-url?expiresIn=3600

Response:
{
  "url": "signed-url-for-temporary-access",
  "expiresIn": 3600
}
```

### Download File
```
GET /uploads/:id/download

Response: Blob (file binary data)
```

---

## 🔐 Security Features

✅ **JWT Authentication**
- All endpoints require valid JWT token
- Token auto-added by axios interceptor in frontend

✅ **User Isolation**
- Users can only access their own files
- `userId` from JWT enforces this at service level

✅ **File Validation**
- Maximum file size: 50MB
- Allowed MIME types:
  - `application/pdf`
  - `image/jpeg`, `image/jpg`, `image/png`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

✅ **Server-Side Security**
- Backend uses Supabase **service role key** (not exposed to client)
- Bypasses RLS policies (security handled in backend)
- All validation happens on server

✅ **Audit Trail**
- Every file upload tracked in `file_uploads` table
- Metadata includes: user, filename, size, MIME type, timestamp
- Soft deletes (deleted_at timestamp for historical tracking)

---

## 📊 Database Schema

### file_uploads Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users table |
| file_name | String | Unique internal filename |
| original_file_name | String | Filename provided by user |
| bucket_name | String | Supabase bucket name |
| storage_path | String | Full path in Supabase Storage |
| file_size | BigInt | File size in bytes |
| mime_type | String | MIME type (e.g., application/pdf) |
| status | Enum | UPLOADING, COMPLETED, FAILED, DELETED |
| uploaded_at | DateTime | When file was uploaded |
| deleted_at | DateTime | When file was deleted (NULL if active) |
| metadata | Json | Additional metadata (extensible) |

**Indexes:**
- user_id (query user's files)
- bucket_name (filter by bucket)
- status (find failed uploads)
- uploaded_at (sort chronologically)

---

## 🚀 Usage Guide

### For Frontend Developers

#### 1. Upload a File

```typescript
import { uploadFile, type UploadedFile } from '@/services/uploadService'

const handleUpload = async (file: File) => {
  const result = await uploadFile(file, 'documents', 'folder')
  
  if (result.success && result.file) {
    console.log('Uploaded:', result.file.id, result.file.url)
  } else {
    console.error('Upload failed:', result.error)
  }
}
```

#### 2. List User's Files

```typescript
import { listFiles } from '@/services/uploadService'

const files = await listFiles('documents')
files.forEach(file => {
  console.log(file.originalFileName, file.fileSize)
})
```

#### 3. Delete a File

```typescript
import { deleteFile } from '@/services/uploadService'

const success = await deleteFile(fileId)
```

#### 4. Get Download URL

```typescript
import { getSignedUrl } from '@/services/uploadService'

const url = await getSignedUrl(fileId, 3600) // 1 hour expiry
window.location.href = url // Download
```

### For Backend Developers

#### 1. Access User from Request

```typescript
@Post()
@UseGuards(JwtAuthGuard)
async upload(@Request() req) {
  const userId = req.user.id // Automatically extracted from JWT
  // Use userId for all operations
}
```

#### 2. Extend File Validation

In [uploads.controller.ts](../apps/backend/src/uploads/uploads.controller.ts):

```typescript
// Add custom validation before upload
const allowedMimeTypes = ['application/pdf', 'image/png']
if (!allowedMimeTypes.includes(file.mimetype)) {
  throw new BadRequestException('File type not allowed')
}
```

#### 3. Add File Metadata

In [uploads.service.ts](../apps/backend/src/uploads/uploads.service.ts):

```typescript
const fileUpload = await this.prisma.fileUpload.create({
  data: {
    // ... existing fields
    metadata: {
      scanDate: new Date(),
      virusScan: 'pending',
      tags: ['invoice', 'important']
    }
  }
})
```

---

## 🗄️ Database Migration

Migration file: `20251231080857_add_file_uploads`

To run migration:
```powershell
cd apps/backend
npm run prisma:migrate dev
```

---

## 📦 Dependencies

### Backend
- `@supabase/supabase-js` ^2.89.0
- `@nestjs/platform-express` (for file uploads)
- Existing: `@prisma/client`, `@nestjs/jwt`, etc.

### Frontend
- `@supabase/supabase-js` (for future client-side operations)
- Existing: `axios`, `react`, `next`

---

## 🧪 Testing

### Manual Testing Steps

1. **Navigate to uploads page:**
   ```
   http://localhost:3000/uploads
   ```

2. **Login** if not already authenticated (JWT token required)

3. **Upload a file:**
   - Select a PDF, image, or document
   - Click "Upload File"
   - Observe progress indicator
   - File should appear in list

4. **View file:**
   - Click "View" button
   - File opens in new tab

5. **Delete file:**
   - Click "Delete" button
   - Confirm deletion
   - File removed from list (soft delete in DB)

### Backend Testing

Check backend logs:
```
[Nest] ... LOG [RoutesResolver] UploadsController {/uploads}
[Nest] ... LOG [RouterExplorer] Mapped {/uploads, POST}
[Nest] ... LOG [RouterExplorer] Mapped {/uploads, GET}
```

---

## 🔄 Future Enhancements

### Planned Features
- [ ] Virus scanning integration (ClamAV)
- [ ] File compression (PDFs, images)
- [ ] Batch upload
- [ ] Drag-and-drop support
- [ ] S3-compatible storage
- [ ] File sharing with permissions
- [ ] Version history/restore
- [ ] Integration with workflow models (attach to requisitions, payments, etc.)

### Database Extensions
- Add `workflowType` and `workflowId` to link files to specific documents
- Add `accessLevel` (private, department, organization)
- Add `expiresAt` for temporary files

---

## 🔧 Troubleshooting

### Issue: 404 Not Found on /uploads endpoints

**Solution:** Backend needs to be restarted
```powershell
cd apps/backend
npm run start:dev
```

### Issue: 401 Unauthorized

**Solution:** 
- Ensure you're logged in
- Check that JWT token is being sent in Authorization header
- Token should be in format: `Bearer <token>`

### Issue: File size exceeds 50MB

**Solution:** Files larger than 50MB are rejected by backend validation. To increase:

In [uploads.controller.ts](../apps/backend/src/uploads/uploads.controller.ts):
```typescript
const maxSize = 100 * 1024 * 1024 // 100MB
if (file.size > maxSize) {
  throw new BadRequestException('File size exceeds limit')
}
```

### Issue: Unsupported file type

**Solution:** Check allowed MIME types in controller. Update the `allowedMimeTypes` array to support your file type.

---

## 📚 Related Files

- [Backend Prisma Schema](../apps/backend/prisma/schema.prisma)
- [Backend Migrations](../apps/backend/prisma/migrations/)
- [Supabase Storage Context](./Setup%20Guides/FILE_UPLOAD_CONTEXT.md)
- [Frontend Upload Service](../apps/frontend/src/services/uploadService.ts)
- [Test Page](../apps/frontend/src/app/uploads/page.tsx)

---

## ✅ Completion Checklist

- [x] Prisma schema updated with FileUpload model
- [x] Database migration applied
- [x] Supabase service created
- [x] Uploads service implemented
- [x] Uploads controller with endpoints
- [x] JWT authentication integrated
- [x] File validation (size, type)
- [x] Frontend upload service updated
- [x] Test page implemented
- [x] Error handling
- [x] Documentation

---

**Last Updated:** December 31, 2025  
**Maintained By:** Development Team  
**Status:** Production Ready
