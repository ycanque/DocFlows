# Supabase Storage Security Model

## 🔐 Security Overview

Supabase Storage implements **layered security** through API-level access control combined with PostgreSQL row-level security (RLS). However, the file storage itself has important considerations for local development.

## 📋 Access Control Architecture

### 1. API Gateway Layer (Kong)

All storage requests go through Kong API Gateway:

```
Client Request
    ↓
Kong Gateway (Port 54321)
    ↓
Validates JWT Token
    ↓
Checks bucket permissions
    ↓
Routes to Storage Service
    ↓
Storage API enforces RLS policies
```

### 2. PostgreSQL Row-Level Security (RLS)

File access is controlled via `storage.objects` table policies:

```sql
-- storage.objects table structure
CREATE TABLE storage.objects (
  id BIGSERIAL PRIMARY KEY,
  bucket_id TEXT,
  name TEXT,              -- File path
  owner UUID,             -- User ID
  owner_id TEXT,          -- Alternate owner field
  metadata JSONB,         -- Custom metadata
  updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  -- ... other fields
);

-- RLS Policies Example:
-- Only bucket owner can read
CREATE POLICY "authenticated users can read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
  );

-- Only owner can delete
CREATE POLICY "owner can delete" ON storage.objects
  FOR DELETE USING (
    owner = auth.uid()
  );
```

### 3. Bucket-Level Policies

Each bucket has settings that enforce access:

```typescript
// Public bucket - anyone can read
await supabase.storage.createBucket("public-files", { public: true });

// Private bucket - requires authentication
await supabase.storage.createBucket("private-documents", { public: false });
```

When accessing:

```typescript
// For PRIVATE buckets:
// Must include valid JWT token in Authorization header
const { data, error } = await supabase.storage
  .from("private-documents")
  .download("file.pdf");

// For PUBLIC buckets:
// Accessible to anyone with the URL
const url = supabase.storage.from("public-files").getPublicUrl("file.pdf")
  .data.publicUrl;
```

## 🔑 File Encryption: Local vs Production

### ⚠️ LOCAL DEVELOPMENT

**Files are stored in PLAINTEXT in the Docker volume:**

```
/var/lib/docker/volumes/supabase_storage_DocFlows/_data/
├── documents/
│   └── REQ-001.pdf    ← Binary PDF stored as-is, NOT encrypted
```

**Why?**

- Local development prioritizes ease of debugging and testing
- Storage encryption adds complexity and performance overhead
- Local volumes are considered trusted development environments
- No encryption keys needed for iteration

**Security implications:**

- ✅ Protected by API-level access control
- ✅ Requires valid JWT to access via API
- ⚠️ Anyone with Docker access can read raw files
- ⚠️ Files visible if someone accesses the Docker volume directly

### ✅ PRODUCTION (Supabase Cloud)

**Files are encrypted at rest:**

- Supabase uses **encrypted storage** for hosted platforms
- Files encrypted using customer-managed or Supabase-managed keys
- Additional encryption in transit (HTTPS/TLS)
- Compliance with security standards (SOC 2, GDPR)

## 🛡️ Access Prevention Methods

### Method 1: API JWT Authentication

Files can **only** be accessed via the Supabase Storage API:

```typescript
// ✅ ALLOWED - Uses authenticated API
const { data } = await supabase.storage
  .from("private-documents")
  .download("REQ-001.pdf");

// ❌ NOT ALLOWED - Direct file access
// Cannot access: http://127.0.0.1:54321/storage/v1/object/REQ-001.pdf
// without proper JWT token in Authorization header
```

### Method 2: Signed URLs (Time-Limited)

Instead of direct downloads, use signed URLs:

```typescript
// Generate URL valid for 1 hour only
const { data } = await supabase.storage
  .from("documents")
  .createSignedUrl("REQ-001.pdf", 3600);

// URL includes signature: ?token=...&expires=...
// Expires after 1 hour or when user logs out
```

### Method 3: Row-Level Security Policies

Policies enforce who can perform what operations:

```sql
-- Only documents owner can download
CREATE POLICY "users can only download own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents'
    AND owner = auth.uid()
  );

-- Only authenticated users can list
CREATE POLICY "authenticated users can list" ON storage.objects
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );
```

## 🚨 Direct Access Scenarios

### Scenario 1: Accessing Docker Volume Directly

```powershell
# Someone with Docker access could read files directly:
docker exec supabase_storage_DocFlows cat /mnt/documents/REQ-001.pdf

# This BYPASSES Supabase API security
# They can read plaintext files without any JWT token
```

**Mitigation:**

- Restrict Docker access (use Docker socket permissions)
- Don't expose Docker daemon to untrusted networks
- Keep local development isolated

### Scenario 2: Database Access

```sql
-- Someone with PostgreSQL access could list all files:
SELECT * FROM storage.objects;

-- They can see metadata but not necessarily read files
-- However, they know what files exist and their paths
```

**Mitigation:**

- Use strong PostgreSQL credentials
- Restrict database access to localhost only
- Use `postgres:postgres` in local dev, change in production

### Scenario 3: Network Interception (Local Dev)

Local API traffic is unencrypted HTTP:

```
http://127.0.0.1:54321/storage/v1/...
```

**Mitigation:**

- Local development only (localhost)
- Not exposed to external networks
- Enable HTTPS in production (Supabase Cloud provides this)

## 📊 Security Summary Table

| Security Layer              | Local Dev                   | Production                |
| --------------------------- | --------------------------- | ------------------------- |
| **File Encryption at Rest** | ❌ No (plaintext in volume) | ✅ Yes (encrypted)        |
| **Transit Encryption**      | ❌ HTTP only                | ✅ HTTPS/TLS              |
| **API Authentication**      | ✅ JWT required             | ✅ JWT required           |
| **Row-Level Security**      | ✅ PostgreSQL RLS           | ✅ PostgreSQL RLS         |
| **Access Logging**          | ⚠️ Limited                  | ✅ Full audit logs        |
| **Docker Volume Access**    | ⚠️ Plaintext visible        | 🔒 Cloud provider handles |
| **Network Exposure**        | ✅ Localhost only           | 🔒 Private networks       |

## 🔒 Security Best Practices

### For Local Development

```typescript
// 1. Use private buckets by default
await supabase.storage.createBucket("documents", { public: false });

// 2. Always use JWT authentication
const token = localStorage.getItem("sb-token"); // From AuthContext
const headers = {
  Authorization: `Bearer ${token}`,
};

// 3. Use signed URLs for file sharing
const { data } = await supabase.storage
  .from("documents")
  .createSignedUrl("REQ-001.pdf", 3600); // 1 hour expiry

// 4. Implement RLS policies
const { error } = await supabase.rpc("create_storage_policies");

// 5. Never store sensitive keys in files
// Use secure credential storage instead
```

### For Production (Supabase Cloud)

```typescript
// 1. Enable encryption at rest (default on Supabase)
// 2. Use custom JWT secret
// 3. Implement comprehensive RLS policies
// 4. Enable audit logging
// 5. Use CDN for static file distribution
// 6. Implement virus scanning
// 7. Set up backup procedures

// Example RLS policy for production
const { error } = await supabase.from("storage.objects").insert({
  bucket_id: "documents",
  name: "requisitions/REQ-001.pdf",
  owner: userId,
  metadata: {
    department: "Finance",
    visibility: "private",
  },
});
```

## 🔑 Environment Isolation

### Local Development

```env
SUPABASE_URL="http://127.0.0.1:54321"
SUPABASE_ANON_KEY="sb_publishable_..." # Low-privilege key
SUPABASE_SERVICE_ROLE_KEY="sb_secret_..." # Admin-only key
```

### Production

```env
SUPABASE_URL="https://yourproject.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_..." # Different key
SUPABASE_SERVICE_ROLE_KEY="sb_secret_..." # Different key
```

Keys are **completely different** between environments.

## 🧪 Testing Security

### Check if file is truly protected:

```typescript
// 1. Create private bucket and upload file
await supabase.storage.createBucket("test", { public: false });
await supabase.storage.from("test").upload("secret.txt", file);

// 2. Try to access without token
fetch("http://127.0.0.1:54321/storage/v1/object/test/secret.txt");
// Result: 400 Bad Request (no auth)

// 3. Try with invalid token
fetch("http://127.0.0.1:54321/storage/v1/object/test/secret.txt", {
  headers: { Authorization: "Bearer invalid" },
});
// Result: 401 Unauthorized

// 4. Try with valid token - works!
const token = (await supabase.auth.getSession()).data.session?.access_token;
fetch("http://127.0.0.1:54321/storage/v1/object/test/secret.txt", {
  headers: { Authorization: `Bearer ${token}` },
});
// Result: 200 OK + file content
```

## ⚠️ Important Considerations

### Local Development Security Trade-offs

**Acceptable Risks:**

- Plaintext files in Docker volume (dev-only)
- HTTP instead of HTTPS (localhost only)
- Default credentials (dev-only)

**NOT Acceptable:**

- Storing real sensitive data (PII, financial info)
- Exposing local services to external networks
- Sharing dev credentials with others

### Recommendation for DocFlows

1. **Local Dev**: Use Supabase Storage for testing UI/uploads
2. **Never store**: Actual confidential data locally
3. **Use test files**: Dummy PDFs, fake requisitions
4. **Production-Ready**: Switch to Supabase Cloud with encryption

## 🔄 Migration Considerations

When moving from local to production:

```typescript
// Same code works - no changes needed!
const supabase = createClient(
  process.env.SUPABASE_URL, // Changes: local vs production
  process.env.SUPABASE_ANON_KEY // Changes: different key
);

// Everything else is identical
await supabase.storage.from("documents").upload("REQ-001.pdf", file); // Works same way locally and in production
```

The only differences:

- API URL (localhost vs cloud)
- API keys (dev vs prod)
- Encryption at rest (automatic on cloud)
- HTTPS vs HTTP (automatic on cloud)
