# Supabase Local Development Setup

This guide covers running Supabase locally for development, including Storage for file uploads.

## Overview

Supabase local development runs a complete Supabase stack via Docker, including:

- PostgreSQL database
- Storage (S3-compatible)
- Auth
- REST API
- GraphQL API
- Realtime
- Edge Functions
- Studio (admin UI)

## Prerequisites

- Docker Desktop installed and running
- Node.js installed
- Project already initialized with `npx supabase init`

## Quick Start

### 1. Start Supabase Local Stack

```powershell
# From project root
npx supabase start
```

This will:

- Pull necessary Docker images (first time only)
- Start all Supabase services
- Display connection details and API keys

### 2. Access Local Services

After starting, you'll have access to:

| Service                     | URL                                                     |
| --------------------------- | ------------------------------------------------------- |
| **Studio**                  | http://127.0.0.1:54323                                  |
| **API URL**                 | http://127.0.0.1:54321                                  |
| **Storage API**             | http://127.0.0.1:54321/storage/v1                       |
| **Database**                | postgresql://postgres:postgres@127.0.0.1:54322/postgres |
| **Mailpit** (Email testing) | http://127.0.0.1:54324                                  |

### 3. API Keys (Local Development)

These keys are generated for local development:

```
Publishable Key: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
Secret Key: sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
```

### 4. Storage (S3) Configuration

For S3-compatible storage access:

```
URL: http://127.0.0.1:54321/storage/v1/s3
Access Key: 625729a08b95bf1b7ff351a663f3a23c
Secret Key: 850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907
Region: local
```

## Environment Variables

### Backend (.env)

```env
# Supabase Local Development
SUPABASE_URL="http://127.0.0.1:54321"
SUPABASE_ANON_KEY="sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz"

# Supabase Storage (S3 Compatible)
SUPABASE_STORAGE_URL="http://127.0.0.1:54321/storage/v1"
SUPABASE_S3_URL="http://127.0.0.1:54321/storage/v1/s3"
SUPABASE_S3_ACCESS_KEY="625729a08b95bf1b7ff351a663f3a23c"
SUPABASE_S3_SECRET_KEY="850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907"
SUPABASE_S3_REGION="local"
```

### Frontend (.env.local)

```env
# Supabase Local Development
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"
NEXT_PUBLIC_SUPABASE_STORAGE_URL="http://127.0.0.1:54321/storage/v1"
```

## Common Commands

```powershell
# Start local Supabase
npx supabase start

# Stop local Supabase (keeps data)
npx supabase stop

# Stop and reset all data
npx supabase stop --no-backup

# View status
npx supabase status

# Access database migrations
npx supabase db push

# Generate TypeScript types from database
npx supabase gen types typescript --local > types/supabase.ts

# View logs
npx supabase logs
```

## Working with Storage

### Create a Storage Bucket via Studio

1. Open Studio at http://127.0.0.1:54323
2. Navigate to Storage
3. Create a new bucket (e.g., "documents", "uploads")
4. Set bucket policies (public/private)

### Create a Storage Bucket Programmatically

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Create a bucket
const { data, error } = await supabase.storage.createBucket("documents", {
  public: false,
  fileSizeLimit: 52428800, // 50MB
});
```

### Upload Files

```typescript
// Upload a file
const { data, error } = await supabase.storage
  .from("documents")
  .upload("folder/filename.pdf", file);

// Get public URL (for public buckets)
const { data: publicData } = supabase.storage
  .from("documents")
  .getPublicUrl("folder/filename.pdf");

// Create signed URL (for private buckets)
const { data: signedData, error } = await supabase.storage
  .from("documents")
  .createSignedUrl("folder/filename.pdf", 60); // 60 seconds
```

## Integration with Existing Docker Setup

Your existing PostgreSQL container runs on port `5433`. Supabase local uses:

- **Port 54322** for its PostgreSQL instance
- **Port 54321** for the API gateway
- **Port 54323** for Studio

These don't conflict with your existing DocFlows database setup.

## Database Considerations

Supabase local runs its own PostgreSQL instance separate from your DocFlows database. If you want to:

1. **Use DocFlows DB + Supabase Storage only**: Keep your existing setup and only use Supabase for Storage/Auth
2. **Migrate to Supabase DB**: Consider migrating your Prisma schema to Supabase's PostgreSQL instance

For now, you can run both in parallel:

- DocFlows API uses your PostgreSQL on port 5433
- File uploads use Supabase Storage on the Supabase stack

## Switching to Production

When ready to deploy:

1. Create a Supabase project at https://supabase.com
2. Update environment variables with production URLs and keys:

```env
# Production
SUPABASE_URL="https://yourproject.supabase.co"
SUPABASE_ANON_KEY="your_production_anon_key"
```

3. Push your local database changes (if using Supabase DB):

```powershell
npx supabase db push --linked
```

## Troubleshooting

### Docker Not Running

```
Error: Cannot connect to Docker daemon
```

**Solution**: Start Docker Desktop

### Port Conflicts

```
Error: Port 54321 already in use
```

**Solution**: Stop other services or modify ports in `supabase/config.toml`

### Reset Everything

```powershell
npx supabase stop --no-backup
npx supabase start
```

## Additional Resources

- [Supabase Local Development Docs](https://supabase.com/docs/guides/local-development)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
