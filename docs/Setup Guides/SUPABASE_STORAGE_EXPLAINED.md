# How Supabase Storage Works Locally

## 📦 Storage Architecture Overview

Supabase Storage is an S3-compatible file storage system built on top of PostgreSQL. In your local development environment, it runs as a containerized service with files stored in Docker volumes.

## 🗂️ File Storage Location

### Local Docker Volume

Files uploaded to local Supabase Storage are stored in a **Docker volume** named `supabase_storage_DocFlows`:

```
Docker Volume: supabase_storage_DocFlows
Physical Location: /var/lib/docker/volumes/supabase_storage_DocFlows/_data
Container Mount Point: /mnt (inside supabase_storage_DocFlows container)
```

### Why Docker Volumes?

Docker volumes provide:

- **Persistence**: Data survives container restarts
- **Isolation**: Storage is separate from your host filesystem
- **Portability**: Easy to back up, move, or share
- **Performance**: Optimized for container I/O

## 📁 Storage Structure

Inside the volume, files are organized hierarchically:

```
/var/lib/docker/volumes/supabase_storage_DocFlows/_data/
├── stub/                          # Placeholder directory
└── [bucket-name]/                 # Created when you create a bucket
    ├── [folder]/                  # Optional folder structure
    │   └── [file-name]           # Actual file
    └── [another-file]
```

### Example Directory Tree

If you create buckets and upload files:

```
/mnt/
├── documents/                     # "documents" bucket
│   ├── requisitions/
│   │   ├── REQ-001-2025.pdf
│   │   └── REQ-002-2025.pdf
│   └── approvals/
│       └── approval-001.pdf
│
├── uploads/                       # "uploads" bucket
│   └── temp/
│       └── image.jpg
│
└── invoices/                      # "invoices" bucket
    └── 2025/
        └── invoice-001.pdf
```

## 💾 How Files Are Stored

### Storage API Layer

Supabase Storage doesn't directly store raw files. Instead:

1. **File Upload** → Sent to Storage API (port 5000 in container)
2. **Metadata Storage** → File info stored in PostgreSQL (`storage.objects` table)
3. **Physical Storage** → File stored in the volume
4. **Access Control** → Permissions managed via PostgreSQL policies

### Storage API Container

The storage service runs in: `supabase_storage_DocFlows`

```
Container: supabase_storage_DocFlows
Image: public.ecr.aws/supabase/storage-api:v1.33.2
Port: 5000 (internal)
Volume Mount: /mnt
```

## 🔗 S3-Compatible API

Supabase Storage implements the **S3 API**, accessible at:

```
http://127.0.0.1:54321/storage/v1/s3
```

This means you can use it like AWS S3:

### Configuration for S3 Access

```
Endpoint: http://127.0.0.1:54321/storage/v1/s3
Access Key: 625729a08b95bf1b7ff351a663f3a23c
Secret Key: 850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907
Region: local
Bucket Name: [your-bucket-name]
```

## 📤 Upload Flow

### Step 1: Create a Bucket

```typescript
const supabase = createClient(
  "http://127.0.0.1:54321",
  "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"
);

// Create bucket
await supabase.storage.createBucket("documents", {
  public: false,
  fileSizeLimit: 52428800, // 50MB
});

// Now "/mnt/documents/" directory is created
```

### Step 2: Upload a File

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from("documents")
  .upload("requisitions/REQ-001.pdf", pdfFile);

// File is now at:
// /var/lib/docker/volumes/supabase_storage_DocFlows/_data/documents/requisitions/REQ-001.pdf
```

### Step 3: File Path Resolution

```
API Call: POST /storage/v1/object/documents/requisitions/REQ-001.pdf
↓
Storage Service receives request
↓
Validates permissions (checks PostgreSQL)
↓
Stores file in volume: /mnt/documents/requisitions/REQ-001.pdf
↓
Records metadata in database: storage.objects table
↓
Returns download URL or status
```

## 🔐 Metadata Storage

File information is stored in PostgreSQL:

```sql
-- storage.objects table (in Supabase DB)
SELECT
  id,
  bucket_id,
  name,              -- e.g., "requisitions/REQ-001.pdf"
  owner,             -- user ID
  created_at,
  updated_at,
  last_accessed_at,
  metadata          -- custom JSON metadata
FROM storage.objects
WHERE bucket_id = 'documents'
```

This metadata allows:

- Listing files
- Retrieving file properties
- Enforcing access controls
- Audit trails

## 📊 Storage Limits (Configurable)

In `supabase/config.toml`:

```toml
[storage]
enabled = true
file_size_limit = "50MiB"  # Max individual file size

# Configure per-bucket limits:
# [storage.buckets.documents]
# public = false
# file_size_limit = "100MiB"
# allowed_mime_types = ["application/pdf", "image/*"]
```

## 🔄 Access Methods

### 1. Supabase REST API

```typescript
// Upload
await supabase.storage.from("documents").upload("file.pdf", file);

// Download
await supabase.storage.from("documents").download("file.pdf");

// Get Public URL
const { data } = supabase.storage.from("documents").getPublicUrl("file.pdf");

// Create Signed URL (temporary access)
const { data } = await supabase.storage
  .from("documents")
  .createSignedUrl("file.pdf", 3600); // 1 hour
```

### 2. S3 API (AWS SDK Compatible)

```typescript
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  endpoint: "http://127.0.0.1:54321/storage/v1/s3",
  accessKeyId: "625729a08b95bf1b7ff351a663f3a23c",
  secretAccessKey:
    "850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907",
  region: "local",
  s3ForcePathStyle: true,
});

// Upload
await s3
  .putObject({
    Bucket: "documents",
    Key: "requisitions/REQ-001.pdf",
    Body: fileBuffer,
  })
  .promise();

// Download
await s3
  .getObject({
    Bucket: "documents",
    Key: "requisitions/REQ-001.pdf",
  })
  .promise();
```

## 🔍 Inspecting Storage

### View Docker Volume Information

```powershell
docker volume inspect supabase_storage_DocFlows
```

Returns:

```json
[
  {
    "Name": "supabase_storage_DocFlows",
    "Driver": "local",
    "Mountpoint": "/var/lib/docker/volumes/supabase_storage_DocFlows/_data",
    "Labels": {},
    "Scope": "local"
  }
]
```

### List Files in Storage Container

```powershell
# Connect to storage container
docker exec -it supabase_storage_DocFlows sh

# List buckets
ls -la /mnt/

# List files in a bucket
ls -la /mnt/documents/

# View file size
du -sh /mnt/documents/*
```

### Check Storage in Supabase Studio

1. Open http://127.0.0.1:54323
2. Navigate to **Storage**
3. View all buckets and files
4. See file metadata and access controls

## 💾 Persistence & Backup

### Data Persists Because:

- Files are in a Docker **named volume**, not a temporary container layer
- Volumes persist even when containers stop/restart
- Metadata in PostgreSQL is also persisted

### Backup the Storage

```powershell
# Backup storage volume
docker run --rm -v supabase_storage_DocFlows:/data -v C:\Backups:/backup `
  alpine tar czf /backup/storage-backup.tar.gz -C /data .

# Restore from backup
docker run --rm -v supabase_storage_DocFlows:/data -v C:\Backups:/backup `
  alpine tar xzf /backup/storage-backup.tar.gz -C /data
```

## 🗑️ Cleanup

### Delete a Bucket

```typescript
// Soft delete via API
const { error } = await supabase.storage.deleteBucket("documents");

// This deletes metadata but may keep physical files
```

### Reset Everything

```powershell
# Stop and remove all data
npx supabase stop --no-backup

# This deletes the volume and all files
# When you restart, you get a fresh storage
npx supabase start
```

## ⚙️ Configuration Options

In `supabase/config.toml`:

```toml
[storage]
enabled = true                         # Enable/disable storage
file_size_limit = "50MiB"             # Default max file size

# S3 protocol support
[storage.s3_protocol]
enabled = true                         # Enable S3 API access

# Example: Pre-configured buckets (uncomment to use)
# [storage.buckets.documents]
# public = false
# file_size_limit = "100MiB"
# allowed_mime_types = ["application/pdf"]
# objects_path = "./data/documents"    # Custom path
```

## 📝 Example: Full Upload/Download Workflow

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "http://127.0.0.1:54321",
  "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"
);

// 1. Create bucket
await supabase.storage.createBucket("requisitions", { public: false });

// 2. Upload file
const file = new File(["PDF content"], "REQ-001.pdf", {
  type: "application/pdf",
});
const { data, error } = await supabase.storage
  .from("requisitions")
  .upload("2025/REQ-001.pdf", file);

// File is now at:
// /var/lib/docker/volumes/supabase_storage_DocFlows/_data/requisitions/2025/REQ-001.pdf

// 3. Get signed URL (for private bucket)
const { data: urlData } = await supabase.storage
  .from("requisitions")
  .createSignedUrl("2025/REQ-001.pdf", 3600); // Valid 1 hour

console.log("Download URL:", urlData?.signedUrl);

// 4. List files
const { data: files } = await supabase.storage
  .from("requisitions")
  .list("2025/");

files?.forEach((file) => {
  console.log(`${file.name} - ${file.metadata?.size} bytes`);
});

// 5. Delete file
await supabase.storage.from("requisitions").remove(["2025/REQ-001.pdf"]);
```

## 🔄 Local vs Production

| Aspect           | Local                  | Production                      |
| ---------------- | ---------------------- | ------------------------------- |
| **Storage**      | Docker Volume          | AWS S3 / Google Cloud Storage   |
| **Metadata DB**  | PostgreSQL (local)     | Supabase PostgreSQL             |
| **Access Point** | http://127.0.0.1:54321 | https://yourproject.supabase.co |
| **Persistence**  | Named Docker volume    | Cloud storage                   |
| **Cost**         | Free (local)           | Pay per GB used                 |
| **Scaling**      | Limited to disk space  | Unlimited                       |

When moving to production, change only the API URL and auth keys—the code stays the same!
