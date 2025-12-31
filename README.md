# Document Flow System

A modern full-stack document workflow management system built with Next.js, NestJS, and PostgreSQL.

## 🏗️ Architecture

**Monorepo Structure:**

- `apps/frontend` - Next.js 14 + React + TypeScript + Tailwind CSS
- `apps/backend` - NestJS 10 + Prisma ORM + PostgreSQL
- `packages/shared` - Shared TypeScript types, enums, and DTOs
- `docker` - PostgreSQL database container
- `models` - DBML, SDML, UXML, WDML model files

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd DocFlows
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the database**

```bash
npm run dev:db
```

4. **Set up the backend database**

```bash
cd apps/backend
npm run prisma:generate
npm run prisma:migrate
cd ../..
```

5. **Start Supabase local stack** (for Storage & Auth)

```bash
npx supabase start
```

6. **Start development servers**

```bash
npm run dev
```

This starts:

- Frontend: http://localhost:3000
- Backend: http://localhost:5040
- PgAdmin: http://localhost:5050
- Supabase Studio: http://127.0.0.1:54323
- Supabase API: http://127.0.0.1:54321

## 📦 Project Structure

```
DocFlows/
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   │   ├── app.module.ts
│   │   │   ├── main.ts
│   │   │   └── ... (feature modules)
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   │
│   └── frontend/         # Next.js App
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   └── lib/
│       └── package.json
│
├── packages/
│   └── shared/           # Shared types & enums
│       ├── src/
│       │   ├── types.ts
│       │   ├── enums.ts
│       │   └── index.ts
│       └── package.json
│
├── docker/
│   ├── docker-compose.yml
│   └── README.md
│
├── models/               # Model-first design files
│   ├── dbml/            # Domain models
│   ├── sdml/            # Security models
│   ├── uxml/            # UI/UX models
│   └── wdml/            # Design tokens
│
└── package.json          # Root workspace config
```

## 🎯 Key Features

### Implemented Workflows

- ✅ Requisition Slips (with items and approval flow)
- ✅ Requisition for Payment (RFP with CV generation)
- ✅ Check Vouchers & Check Disbursement
- ✅ Request for Adjustment (RFA)
- ✅ Material Issuance Slips
- ✅ Personnel Requests
- ✅ Plane Ticket Requests
- ✅ Cash Advance Agreements

### Core Functionality

- 🔐 JWT Authentication with role-based access control
- 📋 Multi-level approval workflows
- 🔄 Real-time status tracking
- 📝 Audit trail via approval records
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design

## 🛠️ Development

### Available Scripts

**Root Level:**

```bash
npm run dev          # Start all development servers
npm run dev:db       # Start PostgreSQL container
npm run build        # Build all apps
npm test             # Run tests in all workspaces

# Supabase commands
npx supabase start   # Start Supabase local stack
npx supabase stop    # Stop Supabase (keeps data)
npx supabase status  # Check Supabase status
```

**Backend (apps/backend):**

```bash
npm run start:dev           # Start NestJS in watch mode
npm run prisma:generate     # Generate Prisma client
npm run prisma:migrate      # Run database migrations
npm run prisma:studio       # Open Prisma Studio
npm run prisma:seed         # Seed database with default data
npm run build               # Build for production
npm run start:prod          # Start production build
```

**Frontend (apps/frontend):**

```bash
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

**Shared Package (packages/shared):**

```bash
npm run build        # Compile TypeScript
npm run dev          # Watch mode for development
```

## 🗄️ Database

### Connection Details

- **Host:** localhost:5432
- **Database:** document_flow
- **Username:** postgres
- **Password:** postgres

### Schema Management

```bash
# Create a new migration
cd apps/backend
npm run prisma:migrate dev --name describe_changes

# Apply migrations
npm run prisma:migrate

# Reset database (WARNING: deletes all data)
npm run prisma:migrate reset

# View database in browser
npm run prisma:studio
```

## 🔑 Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/document_flow"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="15m"
CORS_ORIGIN="http://localhost:3000"
PORT=5040
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5040
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"
```

> **Note:** For detailed Supabase setup and Storage configuration, see [Supabase Local Setup Guide](docs/Setup%20Guides/SUPABASE_LOCAL_SETUP.md)

## 📝 Model-First Development

This project follows a **model-first methodology**:

1. **Update models** in `/models` directory (DBML/SDML/UXML/WDML)
2. **Update Prisma schema** based on model changes
3. **Generate migrations** and Prisma client
4. **Implement code** following the updated models
5. **Verify consistency** between models and implementation

### Model Types

- **DBML**: Domain entities, processes, business rules
- **SDML**: Security assets, threats, controls, policies
- **UXML**: UI views, forms, navigation flows
- **WDML**: Design tokens, component styles, layouts

## 🎨 UI Conventions

### Status Badges

```tsx
// Approved
<span className="bg-emerald-50 text-emerald-700">Approved</span>

// Rejected
<span className="bg-red-50 text-red-700">Rejected</span>

// Pending
<span className="bg-yellow-50 text-yellow-700">Pending</span>
```

### Buttons

```tsx
// Primary
<button className="bg-slate-900 text-white">Submit</button>

// Secondary
<button className="bg-white border border-slate-300">Cancel</button>
```

## 🔐 Authentication

### Default Admin Account

- **Email:** admin@docflow.com
- **Password:** admin123 (change in production)

### JWT Token

- Expires in 15 minutes by default
- Stored in httpOnly cookie (recommended) or localStorage
- Include in requests via `Authorization: Bearer <token>` header

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests
npm test -w apps/backend

# Run with coverage
npm test -- --coverage
```

## 📚 API Documentation

When the backend is running, Swagger API documentation is available at:

```
http://localhost:5040/api
```

## 🚢 Deployment

### Production Build

```bash
# Build all apps
npm run build

# Start backend in production mode
cd apps/backend
npm run start:prod

# Start frontend in production mode
cd apps/frontend
npm run start
```

### Docker Deployment

(Coming soon)

## 🤝 Contributing

1. Follow the model-first development approach
2. Update models before implementing features
3. Use camelCase for API responses and frontend types
4. Use snake_case for database columns (via Prisma @map)
5. Always create approval records for workflow transitions
6. Add indexes for frequently queried columns

## 📄 License

[Add your license here]

## 🙏 Acknowledgments

Built with modern technologies:

- [Next.js](https://nextjs.org/)
- [NestJS](https://nestjs.com/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Tailwind CSS](https://tailwindcss.com/)
