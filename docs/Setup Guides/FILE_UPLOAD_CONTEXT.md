# Local Supabase Setup Context - File Upload Feature

## 🎯 Complete System Overview

### Project Structure

- **Monorepo**: Root with workspace management
  - `apps/backend` - NestJS API (port 5040)
  - `apps/frontend` - Next.js 16 (port 3000)
  - `packages/shared` - Shared TypeScript types & enums
  - `docker/` - PostgreSQL (port 5433) + pgAdmin (port 5050)
  - `supabase/` - Supabase local config

### Additional Docker Services (Already Running)

- **Supabase Stack** on separate ports:
  - Main API Gateway: `http://127.0.0.1:54321`
  - Storage API: `http://127.0.0.1:54321/storage/v1`
  - PostgreSQL (for Supabase): `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
  - Studio (Admin UI): `http://127.0.0.1:54323`
  - Mailpit (Email testing): `http://127.0.0.1:54324`

---

## 🔐 Authentication & Security

### JWT Configuration

```env
JWT_SECRET="dev-secret-key-min-32-chars-replace-in-prod"
JWT_EXPIRES_IN="24h"
```

### CORS Configuration

```
Allowed Origins:
- http://localhost:3000
- http://127.0.0.1:3000
- http://localhost:5040
```

### Supabase Auth Keys

```
SUPABASE_URL: http://127.0.0.1:54321
Publishable Key: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
Service Role Key: sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
```

---

## 📦 Supabase Storage Configuration

### Environment Variables

**Backend (.env)**

```env
SUPABASE_URL="http://127.0.0.1:54321"
SUPABASE_ANON_KEY="sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz"
SUPABASE_STORAGE_URL="http://127.0.0.1:54321/storage/v1"
SUPABASE_S3_URL="http://127.0.0.1:54321/storage/v1/s3"
SUPABASE_S3_ACCESS_KEY="625729a08b95bf1b7ff351a663f3a23c"
SUPABASE_S3_SECRET_KEY="850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907"
SUPABASE_S3_REGION="local"
```

**Frontend (.env.local)**

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5040
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"
NEXT_PUBLIC_SUPABASE_STORAGE_URL="http://127.0.0.1:54321/storage/v1"
```

### Storage Configuration (supabase/config.toml)

```toml
[storage]
enabled = true
file_size_limit = "50MiB"

[storage.s3_protocol]
enabled = true
```

### File Storage Location

- **Docker Volume**: `supabase_storage_DocFlows`
- **Host Path**: `/var/lib/docker/volumes/supabase_storage_DocFlows/_data`
- **Container Path**: `/mnt` (inside storage container)
- **Files persist**: Across container restarts

---

## 📚 Database Schema

### Current Models (Relevant to File Uploads)

From `apps/backend/prisma/schema.prisma`:

**User Model**

```prisma
model User {
  id            String    @id @default(uuid()) @db.Uuid
  email         String    @unique
  firstName     String    @map("first_name")
  lastName      String    @map("last_name")
  role          UserRole  @default(USER)
  departmentId  String?   @map("department_id") @db.Uuid
  department    Department? @relation(fields: [departmentId], references: [id])
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // File-related relations would go here
  @@map("users")
}
```

**Available Workflow Models** (that may need file attachments):

- RequisitionSlip
- RequisitionForPayment
- CheckVoucher
- RequestForAdjustment
- MaterialIssuanceSlip
- PersonnelRequest
- PlaneTicketRequest
- CashAdvanceAgreement

### Database Connections

- **DocFlows DB**: `postgresql://postgres:postgres@localhost:5433/document_flow` (for main app data)
- **Supabase DB**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres` (for storage metadata)

---

## 🔗 API Architecture

### Backend Structure

```
apps/backend/src/
├── app.module.ts           # Main module (add new modules here)
├── app.controller.ts
├── main.ts                 # Bootstrap & CORS config
├── auth/                   # JWT authentication
├── users/
├── departments/
├── requisitions/           # Example feature module
├── payments/
├── cost-centers/
├── dashboard/
└── prisma/                 # Prisma client management
```

### API Request Flow

```
Next.js Client
    ↓
API Interceptor (axios) adds JWT token
    ↓
Backend CORS validation
    ↓
NestJS Controller
    ↓
Service (business logic)
    ↓
Prisma ORM or Supabase SDK
    ↓
Database/Storage
```

### API Request Format

```typescript
// Frontend axios config (lib/api.ts)
const api = axios.create({
  baseURL: "http://localhost:5040",
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Auto-adds JWT token to requests:
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## 📦 Installed Dependencies

### Backend

```json
{
  "@nestjs/common": "^11.0.1",
  "@nestjs/core": "^11.0.1",
  "@nestjs/jwt": "^11.0.0",
  "@nestjs/passport": "^11.0.1",
  "@nestjs/platform-express": "^11.0.1",
  "@nestjs/swagger": "^11.2.3",
  "@prisma/client": "^7.1.0",
  "@supabase/supabase-js": "^2.89.0", // ← For Supabase
  "class-validator": "^0.14.1",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1"
}
```

### Frontend

```json
{
  "@supabase/supabase-js": "^2.89.0", // ← Already installed!
  "axios": "^1.13.2", // ← For API calls
  "next": "16.0.10",
  "react": "19.2.1",
  "react-dom": "19.2.1",
  "date-fns": "^4.1.0",
  "@radix-ui/react-dialog": "^1.1.15" // ← For file dialogs
}
```

---

## 🛠️ Shared Types & Enums

### Available User Roles (packages/shared/src/enums.ts)

```typescript
enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  APPROVER = "APPROVER",
  DEPARTMENT_HEAD = "DEPARTMENT_HEAD",
  FINANCE = "FINANCE",
  ACCOUNTING = "ACCOUNTING",
  TREASURY = "TREASURY",
}
```

### Available Workflow Statuses

- RequisitionStatus
- RFPStatus (Requisition for Payment)
- CheckVoucherStatus
- AdjustmentStatus
- MaterialIssuanceStatus
- PersonnelStatus
- PlaneTicketStatus
- CashAdvanceStatus

---

## 🚀 Development Commands

### Start Everything

```powershell
# Terminal 1: Start PostgreSQL + pgAdmin
npm run dev:db

# Terminal 2: Start Supabase (if not running)
npx supabase start

# Terminal 3: Start frontend + backend
npm run dev
```

### Backend-Specific

```powershell
cd apps/backend

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# View database in browser
npm run prisma:studio

# Start development server
npm run start:dev
```

### Supabase-Specific

```powershell
# Start Supabase stack
npx supabase start

# Stop (keeps data)
npx supabase stop

# Reset all data
npx supabase stop --no-backup

# Check status
npx supabase status

# View logs
npx supabase logs
```

---

## 📋 File Upload Implementation Checklist

### Backend (NestJS)

- [ ] Create `uploads` module (or `files` module)
- [ ] Create upload service with Supabase client
- [ ] Create upload controller with endpoints:
  - `POST /uploads/[bucket]` - Upload file
  - `GET /uploads/[bucket]/[filename]` - Get signed URL
  - `DELETE /uploads/[bucket]/[filename]` - Delete file
  - `GET /uploads/[bucket]/list` - List files
- [ ] Add file validation (size, mime type)
- [ ] Implement error handling
- [ ] Add security (require JWT, RLS policies)
- [ ] Create upload DTO (Data Transfer Object)

### Database Schema (Prisma)

- [ ] Create `FileUpload` or `Attachment` model
  - Fields: id, userId, fileName, bucketName, storagePath, fileSize, mimeType, createdAt, updatedAt
- [ ] Create relation models (e.g., RequisitionFile, PaymentFile, etc.)
- [ ] Run `npm run prisma:migrate`

### Frontend (Next.js)

- [ ] Create file upload service
- [ ] Create file input component
- [ ] Create upload progress component
- [ ] Add error handling and user feedback
- [ ] Integrate with existing forms (requisitions, payments, etc.)
- [ ] Add file preview/display component
- [ ] Handle file download/access

### Supabase Storage

- [ ] Create storage buckets via Studio
  - Suggested: `documents`, `requisitions`, `payments`, `attachments`
- [ ] Set bucket policies (public/private)
- [ ] Configure allowed MIME types
- [ ] Set file size limits

### Testing

- [ ] Test local file uploads
- [ ] Test file permissions (JWT validation)
- [ ] Test signed URLs
- [ ] Test file download
- [ ] Test file deletion

---

## 🔑 Key API Endpoints to Create

### Upload File

```
POST /uploads/upload
Body: FormData {
  file: File,
  bucket: string,
  folder?: string
}
Response: {
  id: string,
  fileName: string,
  storagePath: string,
  fileSize: number,
  url: string
}
```

### Get Signed URL

```
GET /uploads/signed-url/:bucket/:filename?expiresIn=3600
Response: {
  url: string,
  expiresIn: number
}
```

### List Files

```
GET /uploads/:bucket/list?folder=requisitions
Response: {
  files: [{
    name: string,
    size: number,
    createdAt: string
  }]
}
```

### Delete File

```
DELETE /uploads/:bucket/:filename
Response: {
  success: boolean
}
```

---

## 🔒 Security Considerations

### Authentication

- All endpoints require JWT token (already implemented)
- Token auto-added by axios interceptor
- Validate token in NestJS guards

### Authorization

- Check user role and department
- Only allow users to access their own files
- Implement RLS policies in Supabase

### File Validation

- Validate file size (max 50MB in local, configurable)
- Validate MIME type (only allow PDF, images, etc.)
- Scan filename for malicious content
- Sanitize paths to prevent directory traversal

### Storage Security

- **Local Dev**: Files plaintext in Docker volume (acceptable for dev)
- **Production**: Supabase Cloud provides encryption
- Use signed URLs for temporary access
- Set proper bucket policies

---

## 🧪 Testing with Supabase Studio

1. Open Supabase Studio: `http://127.0.0.1:54323`
2. Go to **Storage** tab
3. Create test buckets
4. Test upload via browser
5. View file metadata in database
6. Test signed URLs
7. Test access controls

---

## 📝 Example: Complete Upload Flow

### Step 1: Create Bucket (One-time setup)

```typescript
// In NestJS service
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

await supabase.storage.createBucket("documents", {
  public: false,
  fileSizeLimit: 52428800, // 50MB
});
```

### Step 2: Upload File (Frontend)

```typescript
// In Next.js component
const handleFileUpload = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucket", "documents");

  const response = await api.post("/uploads/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data; // { id, fileName, storagePath, url }
};
```

### Step 3: Handle Upload (Backend)

```typescript
// In NestJS controller
@Post('upload')
@UseGuards(JwtAuthGuard)
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  return this.uploadsService.upload(file, req.user.id)
}

// In service
async upload(file: Express.Multer.File, userId: string) {
  const fileName = `${userId}/${Date.now()}_${file.originalname}`

  const { data, error } = await this.supabase.storage
    .from('documents')
    .upload(fileName, file.buffer)

  if (error) throw new BadRequestException(error)

  // Save metadata to Prisma
  const uploaded = await this.prisma.fileUpload.create({
    data: {
      userId,
      fileName: file.originalname,
      bucketName: 'documents',
      storagePath: fileName,
      fileSize: file.size,
      mimeType: file.mimetype
    }
  })

  return { id: uploaded.id, ...uploaded }
}
```

### Step 4: Access File (Signed URL)

```typescript
// Get temporary download URL
const { data } = await supabase.storage
  .from("documents")
  .createSignedUrl(storagePath, 3600); // 1 hour

return { url: data.signedUrl };
```

---

## 📊 Current App Workflow Models

These can all potentially attach files:

1. **Requisition Slips** - Attach supporting docs
2. **Requisition for Payment** - Attach invoices, receipts
3. **Check Vouchers** - Attach supporting documents
4. **Request for Adjustment** - Attach adjustment justification
5. **Material Issuance Slips** - Attach material specs
6. **Personnel Requests** - Attach job descriptions
7. **Plane Ticket Requests** - Attach travel itinerary
8. **Cash Advance Agreements** - Attach agreement docs

---

## 🎯 Recommended Implementation Order

1. **Backend Setup**
   - Create uploads module
   - Implement Supabase storage service
   - Create upload controller & DTOs
   - Add security validation

2. **Frontend Setup**
   - Create upload service wrapper
   - Create file input component
   - Add progress tracking

3. **Database**
   - Add FileUpload model
   - Create relations to workflow models
   - Run migrations

4. **Integration**
   - Add file upload to requisition forms
   - Add file list/download to detail views
   - Add file management to admin panel

5. **Testing**
   - Manual testing with Supabase Studio
   - Integration tests
   - Edge cases (large files, errors, etc.)

---

## 🔗 Related Documentation

- [SUPABASE_LOCAL_SETUP.md](SUPABASE_LOCAL_SETUP.md) - Detailed setup guide
- [SUPABASE_STORAGE_EXPLAINED.md](SUPABASE_STORAGE_EXPLAINED.md) - How storage works
- [SUPABASE_SECURITY.md](SUPABASE_SECURITY.md) - Security considerations
- [SUPABASE_QUICK_REFERENCE.md](SUPABASE_QUICK_REFERENCE.md) - Quick commands
