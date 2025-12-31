# Supabase Local - Quick Reference

## 🚀 Quick Commands

```powershell
# Start Supabase stack
npx supabase start

# Stop Supabase (preserves data)
npx supabase stop

# Stop and reset all data
npx supabase stop --no-backup

# Check status
npx supabase status

# View logs
npx supabase logs
```

## 🌐 Local Endpoints

| Service           | URL                                                     |
| ----------------- | ------------------------------------------------------- |
| Studio (Admin UI) | http://127.0.0.1:54323                                  |
| API Gateway       | http://127.0.0.1:54321                                  |
| Storage API       | http://127.0.0.1:54321/storage/v1                       |
| Database          | postgresql://postgres:postgres@127.0.0.1:54322/postgres |
| Mailpit (Email)   | http://127.0.0.1:54324                                  |

## 🔑 Local API Keys

```
Publishable: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
Secret: sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
```

## 📦 Storage (S3)

```
URL: http://127.0.0.1:54321/storage/v1/s3
Access Key: 625729a08b95bf1b7ff351a663f3a23c
Secret Key: 850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907
Region: local
```

## 📝 Example: Upload File

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "http://127.0.0.1:54321",
  "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"
);

// Upload
const { data, error } = await supabase.storage
  .from("documents")
  .upload("folder/file.pdf", file);

// Get URL
const { data: url } = supabase.storage
  .from("documents")
  .getPublicUrl("folder/file.pdf");
```

## 🔧 Configuration

Config file: `supabase/config.toml`

- Change ports if needed
- Configure storage limits
- Adjust auth settings

## 📚 Full Documentation

See [SUPABASE_LOCAL_SETUP.md](SUPABASE_LOCAL_SETUP.md) for complete guide.
