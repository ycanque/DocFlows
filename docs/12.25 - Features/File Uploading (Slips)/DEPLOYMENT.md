# Deployment Guide - File Upload Feature

This guide covers deploying the file upload feature to the staging environment.

## Infrastructure

- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Neon PostgreSQL
- **Storage**: Supabase

## Prerequisites

### 1. Supabase Storage Setup

1. Create a `documents` bucket in your Supabase project:
   - Go to Supabase Dashboard → Storage
   - Click "New Bucket"
   - Name: `documents`
   - Public bucket: `false` (we use signed URLs)
   - File size limit: `52428800` (50MB)

2. Get your Supabase credentials:
   - Project URL: `https://your-project.supabase.co`
   - Anon Key: From Settings → API
   - Service Role Key: From Settings → API (keep secret!)
   - S3 Access Key & Secret: From Settings → Storage → S3 Access Keys

### 2. Database Migration

The following migrations need to be applied to Neon:

1. `20251231080857_add_file_uploads` - Creates file_uploads table
2. `20251231084342_add_file_relationships` - Adds requisition relationships
3. `20251231094402_add_workflow_step_to_file_uploads` - Adds workflow step field

**Run migrations:**
```bash
cd apps/backend
npm run prisma:migrate deploy
```

## Backend Deployment (Render)

### Environment Variables

Set the following in Render → Environment:

```env
# Database
DATABASE_URL=postgresql://username:password@host.region.neon.tech/dbname?sslmode=require

# Server
PORT=5040
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-staging.vercel.app

# JWT
JWT_SECRET=<generate-secure-random-string>
JWT_EXPIRES_IN=24h

# Logging
LOG_LEVEL=info

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_STORAGE_URL=https://your-project.supabase.co/storage/v1
SUPABASE_S3_URL=https://your-project.supabase.co/storage/v1/s3
SUPABASE_S3_ACCESS_KEY=<your-s3-access-key>
SUPABASE_S3_SECRET_KEY=<your-s3-secret-key>
SUPABASE_S3_REGION=<your-region>
```

### Build & Deploy

1. Push code to your repository
2. Render will automatically build and deploy
3. Verify health endpoint: `https://your-backend.onrender.com`

### Post-Deployment

1. Run database migrations:
   ```bash
   npm run prisma:migrate deploy
   ```

2. Test file upload endpoint:
   ```bash
   curl -X POST https://your-backend.onrender.com/uploads \
     -H "Authorization: Bearer <token>" \
     -F "file=@test.pdf"
   ```

## Frontend Deployment (Vercel)

### Environment Variables

Set in Vercel → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-staging.onrender.com
```

### Build & Deploy

1. Push code to your repository
2. Vercel will automatically build and deploy
3. Verify deployment: `https://your-frontend.vercel.app`

### Post-Deployment Verification

1. Login to the application
2. Navigate to Requisitions → Create New
3. Upload a test document in the Attachments tab
4. Verify file appears in the list
5. Submit requisition and check workflow step associations

## Testing Checklist

- [ ] Backend health check passes
- [ ] Database migrations applied successfully
- [ ] Supabase bucket created and accessible
- [ ] File upload works in requisitions/create
- [ ] File upload works in requisitions/[id]
- [ ] Files are associated with correct workflow steps
- [ ] "View documents" button appears in approval history
- [ ] Files can be viewed/downloaded
- [ ] Files from previous workflow steps cannot be deleted
- [ ] File list groups files by workflow step

## Rollback Plan

If issues occur:

1. **Frontend**: Revert to previous deployment in Vercel
2. **Backend**: Revert to previous deployment in Render
3. **Database**: Keep migrations (they're backward compatible)
4. **Storage**: Files remain in Supabase (no cleanup needed)

## Monitoring

### Key Endpoints to Monitor

- `GET /uploads` - List files
- `POST /uploads` - Upload file
- `GET /uploads/:id` - Get file
- `DELETE /uploads/:id` - Delete file
- `GET /uploads/requisition/:id` - List requisition files

### Expected Behavior

- Upload max size: 50MB
- Supported formats: PDF, JPG, PNG, DOC, DOCX
- Files stored with workflow step metadata
- Files linked to requisition records
- Soft delete (files marked as deleted, not removed)

## Troubleshooting

### Upload Fails

- Check CORS_ORIGIN includes frontend URL
- Verify Supabase service role key is correct
- Check file size < 50MB
- Verify file type is allowed

### Files Not Appearing

- Check requisitionId is being sent
- Verify workflow step is correctly mapped
- Check database file_uploads table

### View/Download Issues

- Verify SUPABASE_URL is correct
- Check file still exists in storage
- Verify user has valid JWT token

## Security Notes

- Service role key gives full access - keep secret!
- Files are not public - accessed via signed URLs
- User can only delete files from current workflow step
- All uploads require authentication
- Files isolated per user and requisition

## Performance Considerations

- 50MB file limit per upload
- Files stored in Supabase (CDN-backed)
- Database indexes on requisitionSlipId and workflowStep
- Soft delete to maintain audit trail

## Next Steps

After successful staging deployment:

1. Monitor for 24-48 hours
2. Collect user feedback
3. Address any issues
4. Plan production deployment
