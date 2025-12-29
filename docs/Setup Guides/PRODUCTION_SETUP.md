# Production Deployment Guide - DocFlows

Deployment architecture:

- **Database:** Neon PostgreSQL (Production) | Docker PostgreSQL (Development)
- **Backend:** Render (Production) | npm run start:dev (Development)
- **Frontend:** Vercel (Production) | npm run dev (Development)

---

## Table of Contents

1. [Development Setup](#development-setup)
2. [CD Workflow](#cd-workflow)
3. [Environment Variables](#environment-variables)
4. [Backend Configuration & Deployment](#backend-configuration--deployment)
5. [Frontend Configuration & Deployment](#frontend-configuration--deployment)
6. [Database Setup](#database-setup)
7. [Security Hardening](#security-hardening)
8. [Monitoring & Logging](#monitoring--logging)
9. [Post-Deployment Verification](#post-deployment-verification)
10. [Troubleshooting](#troubleshooting)

---

## Development Setup

### Prerequisites

- Node.js 20+, npm, Docker & Docker Compose
- Git
- Neon account (for staging/production DB connection strings)
- Render account (for backend deployment)
- Vercel account (for frontend deployment)

### Local Development

1. **Clone and install:**

   ```bash
   git clone <repository-url>
   cd DocFlows
   npm install
   ```

2. **Start PostgreSQL via Docker:**

   ```bash
   npm run dev:db
   ```

   - Postgres runs on `localhost:5433`
   - PgAdmin available at `http://localhost:5050` (admin@docflow.com / admin)

3. **Set up backend database:**

   ````bash
   cd apps/backend
   npm run prisma:generate
   npm run prisma:migrate dev
   cd ../..\n   ```

   ````

4. **Start development servers:**

   ```bash
   npm run dev
   ```

   - Backend: `http://localhost:5040`
   - Frontend: `http://localhost:3000`

---

## CD Workflow

### Step-by-Step Process

#### 1. **Work** — Feature Development

```bash
# Create feature branch from main
git checkout main
git pull
git checkout -b feat/my-feature

# Make changes, commit frequently
git add .
git commit -m "feat: add new requisition form"
```

#### 2. **Test** — Local Validation

```bash
# Run linter
npm run lint

# Run tests
npm test
npm run test:e2e -w apps/backend

# Manual testing in browser
# Frontend: http://localhost:3000
# Backend API docs: http://localhost:5040/api
```

#### 3. **PR** — Push and Request Review

```bash
# Push feature branch
git push origin feat/my-feature

# Open Pull Request on GitHub
# - GitHub will run automated checks
# - Vercel will create a preview deployment automatically
```

#### 4. **Review** — PR Checks

**Frontend:**

- Visit the **Vercel Preview URL** (auto-commented on PR)
- Verify UI changes, responsiveness, and functionality

**Backend:**

- Review code changes
- Manually test endpoints on local machine (or staging if available)
- Verify database migrations run cleanly

#### 5. **Deploy** — Merge to Main

```bash
# Merge PR to main on GitHub (requires approval)
git checkout main
git pull

# Automatic actions triggered:
# ✓ Render redeploys backend
# ✓ Vercel redeploys frontend
# ✓ Neon database stays in sync
```

---

## Environment Variables

### Development (.env files in repo root or app folders)

#### Backend — `apps/backend/.env.local`

```env
# Local development with Docker PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/document_flow"

PORT=5040
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000,http://127.0.0.1:3000"

# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="dev-secret-key-min-32-chars-replace-in-prod"
JWT_EXPIRES_IN="24h"

LOG_LEVEL="debug"
```

#### Frontend — `apps/frontend/.env.local`

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:5040"
```

**Note:** Add `apps/backend/.env.local` and `apps/frontend/.env.local` to `.gitignore`.

### Production Environment Variables

#### Render Backend

Set these in **Render Dashboard → Backend Service → Environment:**

```env
# Neon PostgreSQL connection string
DATABASE_URL="postgresql://user:password@ep-xxxx.neon.tech/document_flow?sslmode=require"

NODE_ENV=production
PORT=5040

# Generate strong secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="<strong-random-secret>"
JWT_EXPIRES_IN="24h"

# CORS: Allow your Vercel frontend domain
CORS_ORIGIN="https://yourdomain.vercel.app,https://yourdomain.com"

LOG_LEVEL="info"
```

#### Vercel Frontend

Set these in **Vercel Dashboard → Project Settings → Environment Variables:**

```env
NEXT_PUBLIC_API_BASE_URL="https://backend-yourdomain.render.com"
```

**How to Generate JWT Secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Backend Configuration & Deployment

### 1. CORS Setup for Render

The `CORS_ORIGIN` environment variable in Render controls allowed origins. Current setup in [apps/backend/src/main.ts](apps/backend/src/main.ts) already uses env-driven config:

```typescript
const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.enableCors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
```

✅ **No changes needed** — CORS is already flexible.

### 2. Deploy Backend to Render

#### Create a Render Web Service

1. Go to [render.com](https://render.com) and sign in
2. Click **New +** → **Web Service**
3. **Connect GitHub repository**
   - Select your DocFlows repo
   - Auto-deploy on push to `main`

4. **Configure Service:**
   - **Name:** `docflows-backend`
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build -w apps/backend`
   - **Start Command:** `npm start -w apps/backend`
   - **Instance Type:** Starter (free tier) or higher

5. **Set Environment Variables:**
   - Copy all variables from [Environment Variables](#environment-variables) section above
   - Click **Deploy**

#### Verify Deployment

```bash
# Once deployed, check health endpoint
curl https://docflows-backend.render.com/api/health
```

### 3. Prisma Migrations on Render

Migrations run automatically via Render's build phase. To manually run migrations on production:

```bash
# From Render Shell (if needed)
npm run prisma:migrate deploy
```

### 4. Local Build Verification

Before pushing to Render, verify build locally:

```bash
cd apps/backend
npm run build
echo "Build successful if dist/ folder exists"
ls -la dist/
```

---

## Frontend Configuration & Deployment

### 1. Vercel Configuration (Automatic)

Vercel auto-detects Next.js projects. **No config file changes needed** — Vercel will:

- ✅ Install dependencies
- ✅ Run `npm run build`
- ✅ Start with `npm run start`
- ✅ Create preview URLs for all PRs

### 2. Deploy Frontend to Vercel

#### Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. **Import GitHub Repository**
   - Select your DocFlows repo
   - Auto-deploy on push to `main`

4. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `apps/frontend`
   - **Build Command:** `npm run build -w apps/frontend`
   - **Output Directory:** `.next`

5. **Set Environment Variables:**

   ```
   NEXT_PUBLIC_API_BASE_URL = https://docflows-backend.render.com
   ```

   (or your Render backend URL)

6. Click **Deploy**

#### Preview Deployments

- **Automatic:** Every PR gets a preview URL (commented by Vercel bot)
- Use preview URL to test UI changes before merging
- No manual action needed

#### Production Deployment

- **Automatic:** Merging PR to `main` triggers production deploy
- Live at `yourdomain.vercel.app` (or custom domain if configured)

### 3. Local Build Verification

Before pushing, verify build locally:

```bash
cd apps/frontend
npm run build
echo "Build successful if .next/ folder exists"
ls -la .next/
```

---

## Database Setup

### Development Database (Docker PostgreSQL)

Use the included Docker Compose setup:

```bash
npm run dev:db
```

This runs PostgreSQL on `localhost:5433` with credentials:

- User: `postgres`
- Password: `postgres`
- Database: `document_flow`

### Production Database (Neon)

[Neon](https://neon.tech) provides serverless PostgreSQL with:

- Automatic backups and PITR (point-in-time recovery)
- Connection pooling built-in
- Auto-scaling compute
- Free tier available

#### Create Neon Project

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project: `docflows-prod`
3. Copy the **Connection String** (looks like: `postgresql://user:password@ep-xxxx.neon.tech/neon?sslmode=require`)
4. Use this as `DATABASE_URL` in Render environment variables

#### Run Production Migrations

Once Render backend is deployed:

```bash
# From local machine
export DATABASE_URL="<neon-connection-string>"
cd apps/backend
npm run prisma:migrate deploy
```

Or use Render Shell:

1. Go to **Render Dashboard** → **Backend Service** → **Shell**
2. Run:
   ```bash
   npm run prisma:migrate deploy
   ```

#### Verify Neon Connection

```bash
# Test connection locally
psql "postgresql://user:password@ep-xxxx.neon.tech/document_flow?sslmode=require"

# List tables
\dt

# Exit
\q
```

### Database Backups

Neon automatically handles:

- ✅ Daily automated backups
- ✅ Point-in-time recovery (7 days free)
- ✅ Branching for testing schema changes

No manual backup setup needed.

---

## Docker & Local Development

### Development with Docker Compose

The existing [docker/docker-compose.yml](docker/docker-compose.yml) is used for **local development only**.

#### Start Local Stack

```bash
npm run dev:db
```

This brings up:

- PostgreSQL on `localhost:5433`
- PgAdmin on `http://localhost:5050`

#### Stop Local Stack

```bash
docker compose -f docker/docker-compose.yml down
```

#### Wipe Data and Restart

```bash
docker compose -f docker/docker-compose.yml down -v
npm run dev:db
cd apps/backend && npm run prisma:migrate dev
```

### Production (No Docker Needed)

- **Backend:** Deployed to Render (fully managed Node.js)
- **Frontend:** Deployed to Vercel (fully managed Next.js)
- **Database:** Neon PostgreSQL (fully managed)

**Note:** Production deployments do NOT use Docker. Render and Vercel handle containerization internally.

---

## Security Hardening

### 1. Input Validation ✅

Already configured in [apps/backend/src/main.ts](apps/backend/src/main.ts):

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidUnknownValues: false,
    transform: true,
  })
);
```

### 2. JWT Secret Management

**Generate strong secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Store securely:**

- ✅ Render environment variables (encrypted at rest)
- ✅ Vercel environment variables (encrypted at rest)
- ❌ NEVER commit `.env` to git
- ❌ NEVER hardcode secrets in code

### 3. HTTPS/TLS ✅

Automatically provided by:

- ✅ **Render:** Automatic HTTPS for `*.render.com` domains
- ✅ **Vercel:** Automatic HTTPS with free Let's Encrypt certificates
- ✅ **Neon:** Requires `sslmode=require` in connection string

### 4. CORS Configuration

Update `CORS_ORIGIN` in Render when adding custom domains:

```env
# Before custom domain
CORS_ORIGIN="https://yourdomain.vercel.app"

# After adding custom domain to Vercel
CORS_ORIGIN="https://yourdomain.vercel.app,https://yourdomain.com"
```

### 5. Environment Variable Security

**Do not commit to git:**

```bash
# Ensure .gitignore includes
.env
.env.local
.env.*.local
```

**Store securely:**

- Render Dashboard → Environment Variables (encrypted)
- Vercel Dashboard → Project Settings → Environment Variables (encrypted)
- Never share secrets via chat or email

### 6. Database Security (Neon) ✅

**Neon provides:**

- ✅ Network isolation
- ✅ SSL/TLS required
- ✅ Built-in backups
- ✅ Automatic security patches
- ✅ Password hashing for auth (if using)

### 7. Rate Limiting (Optional)

Add rate limiting for extra protection:

```bash
npm install -w apps/backend @nestjs/throttler
```

Add to AppModule imports:

```typescript
import { ThrottlerModule } from "@nestjs/throttler";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
})
export class AppModule {}
```

---

## Performance Optimization

### 1. Backend (Render)

**Compression:** Add to [apps/backend/src/main.ts](apps/backend/src/main.ts):

```bash
npm install -w apps/backend compression
```

```typescript
import * as compression from "compression";
app.use(compression());
```

**Database Optimization:**

- Use Prisma `.select()` to fetch only needed fields
- Implement pagination for list endpoints
- Verify indexes in [apps/backend/prisma/schema.prisma](apps/backend/prisma/schema.prisma)

### 2. Frontend (Vercel)

Vercel automatically optimizes:

- ✅ Code minification and tree-shaking
- ✅ Image optimization (if using Next.js Image)
- ✅ Code splitting and lazy loading
- ✅ Edge caching
- ✅ Gzip/Brotli compression

**Recommendations:**

- Use `next/image` for images
- Use dynamic imports for large components: `dynamic(() => import('...'))`
- Enable [ISR](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration) for static pages

### 3. Database (Neon)

Neon provides:

- ✅ Query optimization
- ✅ Connection pooling
- ✅ Automatic scaling

---

## Monitoring & Logging

### 1. Render Backend Logs

View real-time logs in **Render Dashboard:**

1. Go to **Backend Service** → **Logs**
2. Filter by date/level
3. Export logs for analysis

### 2. Vercel Frontend Logs

View real-time logs in **Vercel Dashboard:**

1. Go to **Deployments** → Select deployment → **Logs**
2. View build logs and runtime logs separately

### 3. Neon Database Logs

Monitor in **Neon Console:**

1. Go to **Monitoring** tab
2. View query statistics, slow queries, connections

### 4. Application Health Check

Add optional health endpoint in backend:

```typescript
@Get('/api/health')
health() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}
```

Test:

```bash
curl https://docflows-backend.render.com/api/health
```

### 5. Monitoring Services (Optional)

**Recommended free/cheap options:**

- **Sentry** - Error tracking (free tier available)
- **Vercel Analytics** - Built into Vercel
- **New Relic** - Free tier APM
- **Datadog** - Comprehensive monitoring (paid)

---

## Deployment Quick Reference

### Initial Setup (One-Time)

#### 1. Create Neon Database

```bash
# At neon.tech:
# - Create project "docflows-prod"
# - Copy Connection String
# - Save for Render environment setup
```

#### 2. Deploy Backend to Render

```bash
# At render.com:
# - New Web Service
# - Connect GitHub repo
# - Build: npm install && npm run build -w apps/backend
# - Start: npm start -w apps/backend
# - Set DATABASE_URL and other env vars
# - Deploy
```

#### 3. Deploy Frontend to Vercel

```bash
# At vercel.com:
# - Import GitHub repo
# - Root directory: apps/frontend
# - Set NEXT_PUBLIC_API_BASE_URL env var
# - Deploy
```

#### 4. Run Initial Migrations

```bash
# From local machine
export DATABASE_URL="<neon-connection-string>"
cd apps/backend
npm run prisma:migrate deploy
```

### Ongoing Deployments (After Initial Setup)

Once configured, deployment is automatic:

```bash
# 1. Work on feature
git checkout -b feat/my-feature
git add . && git commit -m "feat: ..."

# 2. Push to GitHub
git push origin feat/my-feature

# 3. Open PR
# - Vercel auto-creates preview URL
# - GitHub Actions run checks

# 4. Merge to main
# - Render auto-deploys backend
# - Vercel auto-deploys frontend
# - Neon stays connected
```

No manual deployment commands needed after initial setup!

---

## Post-Deployment Verification

### After First Deploy

#### Backend Health Check

```bash
curl https://docflows-backend.render.com/api/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2025-12-30T...",
  "uptime": 123.456
}
```

#### Frontend Accessibility

```bash
curl -I https://yourdomain.vercel.app
```

Expected: `HTTP/1.1 200 OK`

#### Database Verification

```bash
# Connect to Neon
psql "postgresql://user:password@ep-xxxx.neon.tech/document_flow?sslmode=require"

# List tables
\dt

# Check migrations ran
SELECT version FROM _prisma_migrations;

# Exit
\q
```

### Smoke Tests

Manually test in production:

- [ ] Login works
- [ ] Create new requisition
- [ ] Can view dashboard
- [ ] Can approve documents
- [ ] Database data persists

### Monitor Logs

**Render Backend:**

- Dashboard → Backend Service → Logs

**Vercel Frontend:**

- Dashboard → Deployments → Logs

**Neon Database:**

- Neon Console → Monitoring

---

## Troubleshooting

### CORS Errors

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Fix:**

1. Check Render environment: `CORS_ORIGIN` should include your Vercel domain
2. Verify frontend URL format: `https://yourdomain.vercel.app` (not `http://`)
3. Restart Render backend after env change

### Database Connection Errors

**Error:** `ECONNREFUSED or database connection timeout`

**Fixes:**

1. Verify `DATABASE_URL` in Render environment is correct (from Neon)
2. Ensure Neon project exists and is active
3. Check network connectivity: `psql "<DATABASE_URL>"`
4. Verify SSL mode in connection string: `sslmode=require`

### JWT/Auth Errors

**Error:** `Unauthorized or token invalid`

**Fixes:**

1. Regenerate JWT secret (if compromised):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Update in Render → restart backend
3. Clear browser cookies and log in again
4. Check token expiration: `JWT_EXPIRES_IN="24h"`

### Render Build Fails

**Error:** Build fails on deploy

**Fixes:**

1. Check build logs in Render Dashboard
2. Verify `DATABASE_URL` is set (migration step needs it)
3. Ensure `package.json` scripts are correct:
   - Build: `npm run build -w apps/backend`
   - Start: `npm start -w apps/backend`
4. Test locally: `npm run build -w apps/backend`

### Vercel Deployment Issues

**Error:** Build fails or preview not working

**Fixes:**

1. Check Vercel build logs: Dashboard → Deployments → View Logs
2. Verify root directory is set to `apps/frontend`
3. Ensure `NEXT_PUBLIC_API_BASE_URL` is set
4. Test locally: `npm run build -w apps/frontend`

### Performance Issues

**Slow API responses:**

- Check Neon query logs
- Review Render logs for errors
- Add database indexes if needed

**Slow frontend:**

- Check Vercel Analytics
- Use Chrome DevTools → Lighthouse
- Optimize images with Next.js Image

### Quick Rollback

If critical issue on main branch:

1. **Revert commit:**

   ```bash
   git revert <commit-hash>
   git push origin main
   ```

   - Render/Vercel auto-deploy previous version

2. **Or redeploy previous commit:**
   - Render: Dashboard → Deployments → Select previous → Redeploy
   - Vercel: Dashboard → Deployments → Select previous → Promote to Production

---

## Additional Resources

- [Render Deployment Guide](https://render.com/docs/deploy-node)
- [Vercel Deployment Guide](https://vercel.com/docs/deployments/overview)
- [Neon Documentation](https://neon.tech/docs/introduction)
- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)

---

## Environment Variables Reference

### Complete List

| Variable                   | Backend | Frontend | Development    | Production    |
| -------------------------- | ------- | -------- | -------------- | ------------- |
| `DATABASE_URL`             | ✓       |          | localhost:5433 | Neon          |
| `PORT`                     | ✓       |          | 5040           | 5040 (Render) |
| `NODE_ENV`                 | ✓       |          | development    | production    |
| `CORS_ORIGIN`              | ✓       |          | localhost:3000 | Vercel domain |
| `JWT_SECRET`               | ✓       |          | dev-key        | strong random |
| `JWT_EXPIRES_IN`           | ✓       |          | 24h            | 24h           |
| `LOG_LEVEL`                | ✓       |          | debug          | info          |
| `NEXT_PUBLIC_API_BASE_URL` |         | ✓        | localhost:5040 | Render URL    |

### Generate Commands

**JWT Secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example Output:**

```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f
```

---

**Last Updated:** December 30, 2025
