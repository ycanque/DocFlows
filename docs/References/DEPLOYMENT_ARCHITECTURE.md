# DocFlows Deployment Architecture

## Overview

Your DocFlows project is configured for a modern, serverless deployment architecture with the following stack:

```
┌─────────────────────────────────────────────────────────────┐
│                        PRODUCTION                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Vercel                    Render                  Neon       │
│  (Frontend)                (Backend)           (PostgreSQL)   │
│  ─────────                 ──────────          ──────────     │
│  Next.js App      ←→       NestJS API    ←→    Database       │
│  yourdomain.app   CORS     backend.app    DB   ep-xxxx.neon   │
│  (auto SSL)       TLS      (auto SSL)     SSL  (auto backup)  │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      DEVELOPMENT                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  npm run dev           npm run dev:db                         │
│  (Local Frontend)      (Docker PostgreSQL)                    │
│  localhost:3000        localhost:5433                         │
│                                                               │
│  npm run dev -w apps/backend (Backend)                        │
│  localhost:5040                                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Services

### Vercel (Frontend)
- **Platform:** Vercel
- **What:** Next.js 16 application
- **Auto-deploy:** On push to `main` branch
- **Preview URLs:** Automatic for every PR
- **SSL/TLS:** Automatic (free Let's Encrypt)
- **Cost:** Free tier available, scales with usage

### Render (Backend)
- **Platform:** Render
- **What:** NestJS API server
- **Auto-deploy:** On push to `main` branch
- **SSL/TLS:** Automatic for `*.render.com`
- **Cost:** Free tier (Starter), scales with instance type

### Neon (Database)
- **Platform:** Neon
- **What:** Serverless PostgreSQL
- **Backups:** Automatic daily + point-in-time recovery
- **Features:** Connection pooling, auto-scaling, branching
- **Cost:** Free tier available (512MB)

---

## CD/CD Workflow

### 1. Development
```bash
git checkout -b feat/my-feature
npm run dev              # Frontend + Backend locally
npm run dev:db          # Docker PostgreSQL
```

### 2. Testing
```bash
npm run lint            # Code quality
npm test                # Unit tests
npm run test:e2e -w apps/backend  # E2E tests
```

### 3. Push & PR
```bash
git push origin feat/my-feature
# Open PR on GitHub
# → Vercel auto-creates preview URL
# → GitHub Actions run checks
```

### 4. Review
- **Frontend:** Test on Vercel preview URL
- **Backend:** Manual testing on local machine
- **Database:** Verify migrations work

### 5. Merge & Deploy
```bash
git checkout main && git merge feat/my-feature
# GitHub action or manual merge
# → Render auto-deploys backend
# → Vercel auto-deploys frontend
# → Neon connected via DATABASE_URL
```

No manual deployment commands needed!

---

## Key Configuration Files

### Environment Variables

**Backend (Render)**
- `DATABASE_URL` - Neon connection string
- `JWT_SECRET` - Strong random 32+ chars
- `CORS_ORIGIN` - Your Vercel domain
- `NODE_ENV=production`
- `PORT=5040`

**Frontend (Vercel)**
- `NEXT_PUBLIC_API_BASE_URL` - Render backend URL

**Local Development**
- Create `.env.local` files (not committed)
- Backend: `apps/backend/.env.local`
- Frontend: `apps/frontend/.env.local`

### Build Commands

| Service | Build | Start |
|---------|-------|-------|
| Render | `npm install && npm run build -w apps/backend` | `npm start -w apps/backend` |
| Vercel | Auto-detected (Next.js) | Auto-detected |

### Root Directory Paths

| Service | Root Directory |
|---------|---|
| Render | Monorepo root (auto-detects `apps/backend`) |
| Vercel | `apps/frontend` |

---

## First-Time Setup Steps

### 1. Create Neon Database
1. Visit [neon.tech](https://neon.tech)
2. Sign up and create new project
3. Copy connection string
4. Save for Render setup

### 2. Deploy Backend to Render
1. Visit [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Set environment variables (see above)
5. Deploy

### 3. Deploy Frontend to Vercel
1. Visit [vercel.com](https://vercel.com)
2. New Project → Import GitHub repo
3. Root directory: `apps/frontend`
4. Set `NEXT_PUBLIC_API_BASE_URL`
5. Deploy

### 4. Run Database Migrations
```bash
export DATABASE_URL="<neon-connection>"
cd apps/backend
npm run prisma:migrate deploy
```

### 5. Test Everything
```bash
curl https://backend-name.render.com/api/health
# Should return: { "status": "ok", ... }
```

---

## Monitoring

### Logs
- **Render:** Dashboard → Backend Service → Logs
- **Vercel:** Dashboard → Deployments → Logs
- **Neon:** Console → Monitoring tab

### Health Checks
```bash
# Backend health
curl https://backend-name.render.com/api/health

# Frontend
curl -I https://yourdomain.vercel.app
```

### Rollback
```bash
# Revert last commit
git revert <commit-hash>
git push origin main

# Services auto-redeploy with previous code
```

---

## Cost Breakdown (Approximate)

| Service | Free Tier | Pro/Paid |
|---------|-----------|----------|
| Vercel | ✅ Unlimited projects | $20/mo per additional seat |
| Render | ✅ One service (Starter) | $7/mo+ per service |
| Neon | ✅ 512MB storage | $14/mo for 10GB |
| **Total** | **$0** | **~$21+/mo** |

All services have free tiers sufficient for development/small production use.

---

## Quick Reference

### Commands
```bash
# Local development
npm install              # Install all workspaces
npm run dev             # Frontend + Backend
npm run dev:db          # Docker PostgreSQL

# Code quality
npm run lint            # ESLint
npm test                # Jest tests
npm run test:e2e -w apps/backend  # E2E tests

# Build
npm run build           # Both apps
npm run build -w apps/backend
npm run build -w apps/frontend

# Database
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate dev  # Local migration
npm run prisma:studio   # Prisma UI
```

### URLs
- **Local Frontend:** http://localhost:3000
- **Local Backend:** http://localhost:5040
- **Local API Docs:** http://localhost:5040/api
- **Local PgAdmin:** http://localhost:5050
- **Render:** https://docflows-backend.render.com
- **Vercel:** https://yourdomain.vercel.app
- **Neon Console:** https://neon.tech/app

### Important Files
- `apps/backend/src/main.ts` - Backend bootstrap & CORS
- `apps/backend/prisma/schema.prisma` - Database schema
- `apps/frontend/next.config.ts` - Frontend config
- `docker/docker-compose.yml` - Local dev stack
- `.env.local` (not in git) - Local secrets

---

## Support

See [PRODUCTION_SETUP.md](docs/PRODUCTION_SETUP.md) for comprehensive deployment documentation including:
- Detailed setup instructions
- Troubleshooting guide
- Security hardening
- Performance optimization
- Monitoring setup

---

**Last Updated:** December 30, 2025
