# DocFlows Quick Start Guide

## 🚀 Starting the Development Stack

### 1. Start Database (Docker)

```bash
cd "c:\Users\Nori\Documents\GitHub\Projects\DocFlows Repos\DocFlows"
npm run dev:db
```

**Services:**

- PostgreSQL: `localhost:5433`
- pgAdmin: http://localhost:5050

### 2. Start Backend (NestJS)

```bash
cd "c:\Users\Nori\Documents\GitHub\Projects\DocFlows Repos\DocFlows"
npm run dev
```

**Backend API:** http://localhost:5040  
**Swagger Docs:** http://localhost:5040/api

### 3. Start Frontend (Next.js)

```bash
cd "c:\Users\Nori\Documents\GitHub\Projects\DocFlows Repos\DocFlows\apps\frontend"
npm run dev
```

**Frontend App:** http://localhost:3000

---

## 🔐 Test Credentials

```
Admin:
Email: admin@docflow.com
Password: admin123

User:
Email: user1@docflow.com
Password: password123

Approver:
Email: approver@docflow.com
Password: password123

Finance Manager:
Email: finance.manager@docflow.com
Password: password123
```

---

## 📚 API Endpoints (Backend)

### Authentication

- `POST /auth/login` - Login with email/password

### Users

- `GET /users` - List all users
- `GET /users/:id` - Get user details
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Departments

- `GET /departments` - List all departments
- `GET /departments/:id` - Get department details
- `POST /departments` - Create department
- `PATCH /departments/:id` - Update department
- `DELETE /departments/:id` - Delete department

### Requisitions (Full Workflow)

- `GET /requisitions` - List all requisitions
- `GET /requisitions/:id` - Get requisition details
- `POST /requisitions` - Create requisition
- `PATCH /requisitions/:id` - Update requisition
- `DELETE /requisitions/:id` - Delete requisition
- `POST /requisitions/:id/submit` - Submit for approval
- `POST /requisitions/:id/approve` - Approve requisition (role-restricted)
- `POST /requisitions/:id/reject` - Reject requisition (role-restricted)
- `POST /requisitions/:id/cancel` - Cancel requisition
- `GET /requisitions/:id/approval-history` - Get approval trail

---

## 🌐 Frontend Routes

### Public Routes

- `/` - Home (redirects based on auth)
- `/login` - Login page

### Protected Routes

- `/dashboard` - Main dashboard (user profile, quick actions)

### Coming Soon

- `/dashboard/requisitions` - Requisitions list
- `/dashboard/requisitions/create` - Create requisition
- `/dashboard/requisitions/[id]` - Requisition details
- `/dashboard/users` - Users management
- `/dashboard/departments` - Departments management

---

## 🛠️ Common Commands

### Database

```bash
# Run migrations
cd apps/backend
npm run prisma:migrate dev

# Generate Prisma client
npm run prisma:generate

# Seed database
npm run prisma:seed

# Open Prisma Studio
npm run prisma:studio
```

### Backend

```bash
# Install dependencies
cd apps/backend
npm install

# Start development
npm run start:dev

# Run tests
npm test

# Build for production
npm run build
```

### Frontend

```bash
# Install dependencies
cd apps/frontend
npm install

# Start development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Workspace (Root)

```bash
# Install all dependencies
npm install

# Start database
npm run dev:db

# Start backend (from root)
npm run dev

# Run all tests
npm test
```

---

## 📦 Project Structure

```
DocFlows/
├── apps/
│   ├── backend/              # NestJS API
│   │   ├── src/
│   │   │   ├── auth/        # Authentication module
│   │   │   ├── users/       # Users management
│   │   │   ├── departments/ # Departments
│   │   │   ├── requisitions/# Requisitions workflow
│   │   │   └── prisma/      # Database service
│   │   └── prisma/
│   │       ├── schema.prisma # Database schema
│   │       └── seed.ts       # Seed data
│   │
│   └── frontend/             # Next.js App
│       └── src/
│           ├── app/          # Pages (App Router)
│           ├── components/   # Reusable components
│           ├── contexts/     # React contexts
│           ├── lib/          # Utilities (API client)
│           └── services/     # API service layer (coming)
│
├── packages/
│   └── shared/               # Shared TypeScript types
│       └── src/
│           ├── enums.ts      # Status enums, roles
│           └── types.ts      # Entity interfaces
│
├── docker/
│   └── docker-compose.yml    # PostgreSQL + pgAdmin
│
└── models/                   # DBML/SDML/UXML/WDML specs
```

---

## 🔧 Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/document_flow"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="15m"
CORS_ORIGIN="http://localhost:3000"
PORT=5040
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5040
```

---

## 🐛 Troubleshooting

### Backend won't start

1. Check if port 5040 is already in use
2. Verify database is running (`npm run dev:db`)
3. Run `npm run prisma:generate` after schema changes

### Frontend can't connect to API

1. Check backend is running on port 5040
2. Verify `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
3. Check browser console for CORS errors

### Database connection failed

1. Verify Docker is running
2. Check if PostgreSQL container is up: `docker ps`
3. Restart database: `docker compose -f docker/docker-compose.yml restart`

### Login not working

1. Verify database is seeded: `npm run prisma:seed` in backend
2. Check backend logs for authentication errors
3. Clear browser localStorage and try again

---

## 📖 Documentation

- [README.md](../README.md) - Project overview
- [PHASE2_IMPLEMENTATION.md](./PHASE2_IMPLEMENTATION.md) - Implementation status
- [FRONTEND_SETUP_COMPLETE.md](./FRONTEND_SETUP_COMPLETE.md) - Frontend setup details
- [DATABASE_SETUP_COMPLETE.md](./DATABASE_SETUP_COMPLETE.md) - Database configuration
- [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) - Initial setup guide

---

## 🎯 Current Status (December 15, 2025)

✅ **Backend**: Fully operational

- Auth, Users, Departments, Requisitions modules complete
- 21 API endpoints functional
- Database seeded with test data

✅ **Frontend**: Infrastructure complete

- Authentication flow working
- Login page functional
- Dashboard page with user profile
- Protected routes implemented

⏳ **Next Tasks**:

1. Implement Requisitions management UI
2. Create service layer for API calls
3. Build shared UI components
4. Add Users management pages

---

**Quick Test**: Visit http://localhost:3000, login with `admin@docflow.com` / `admin123`, view dashboard!
