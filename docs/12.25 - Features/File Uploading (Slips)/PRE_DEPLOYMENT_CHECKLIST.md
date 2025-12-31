# Pre-Deployment Checklist

## Code Review
- [x] File upload feature implemented
- [x] Workflow step associations working
- [x] File deletion restrictions in place
- [x] View/download functionality implemented
- [x] Frontend and backend integration complete

## Database
- [ ] Neon database created for staging
- [ ] Connection string obtained
- [ ] Database migrations ready:
  - `20251231080857_add_file_uploads`
  - `20251231084342_add_file_relationships`
  - `20251231094402_add_workflow_step_to_file_uploads`
- [ ] Run `npm run prisma:migrate deploy` after backend deployment

## Supabase Storage
- [ ] Supabase project created
- [ ] `documents` bucket created (private)
- [ ] Service role key obtained
- [ ] S3 credentials generated
- [ ] File size limit set to 50MB

## Backend (Render)
- [ ] Repository connected
- [ ] Build command set: `npm run build`
- [ ] Start command set: `npm run start:prod`
- [ ] Environment variables configured:
  - [ ] DATABASE_URL (Neon connection string)
  - [ ] PORT=5040
  - [ ] NODE_ENV=production
  - [ ] CORS_ORIGIN (Vercel frontend URL)
  - [ ] JWT_SECRET (secure random string)
  - [ ] JWT_EXPIRES_IN=24h
  - [ ] LOG_LEVEL=info
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] SUPABASE_STORAGE_URL
  - [ ] SUPABASE_S3_URL
  - [ ] SUPABASE_S3_ACCESS_KEY
  - [ ] SUPABASE_S3_SECRET_KEY
  - [ ] SUPABASE_S3_REGION
- [ ] Health check endpoint verified

## Frontend (Vercel)
- [ ] Repository connected
- [ ] Framework preset: Next.js
- [ ] Root directory: apps/frontend
- [ ] Build command: `npm run build`
- [ ] Environment variables configured:
  - [ ] NEXT_PUBLIC_API_BASE_URL (Render backend URL)
- [ ] Domain configured (if custom domain)

## Testing
- [ ] Backend builds successfully locally: `npm run build`
- [ ] Frontend builds successfully locally: `npm run build`
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Database migrations can be applied
- [ ] File upload works locally
- [ ] File download works locally
- [ ] Workflow step associations correct

## Security
- [ ] Service role key kept secret
- [ ] JWT secret is strong (32+ characters)
- [ ] CORS only allows staging frontend URL
- [ ] File size limits enforced
- [ ] File type validation in place
- [ ] Authentication required for all uploads

## Post-Deployment
- [ ] Run database migrations on staging
- [ ] Test file upload flow
- [ ] Test file view/download
- [ ] Test workflow step associations
- [ ] Test file deletion restrictions
- [ ] Monitor error logs
- [ ] Verify CORS working
- [ ] Check file storage in Supabase

## Rollback Plan
- [ ] Previous deployment saved in Vercel
- [ ] Previous deployment saved in Render
- [ ] Migrations are additive (backward compatible)
- [ ] Can revert frontend/backend independently

## Documentation
- [x] DEPLOYMENT.md created
- [x] .env.example files created
- [ ] Team notified of new feature
- [ ] Staging URL shared with testers

## Notes
- File uploads require authentication
- Max file size: 50MB
- Supported formats: PDF, JPG, PNG, DOC, DOCX
- Files associated with workflow steps and requisitions
- Soft delete maintains audit trail
