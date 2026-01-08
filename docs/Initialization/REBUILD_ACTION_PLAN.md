# Document Flow System – Rebuild Action Plan (Next.js + NestJS + PostgreSQL)

This plan defines how to rebuild the Document Flow System in a clean repository with a modern architecture while preserving the model-based methodology, workflows, and camelCase API contracts. It is designed so GitHub Copilot can infer intent, architecture, and conventions to assist effectively.

## Goals
- Migrate to a new monorepo with clear separation of frontend, backend, and shared code.
- Frontend: Next.js 14 + React + TypeScript + Tailwind.
- Backend: NestJS 10 modular architecture with Prisma ORM.
- Database: PostgreSQL (Dockerized).
- Auth: JWT (Passport.js) with roles; same or updated enums.
- Preserve approval workflows, camelCase API responses, and model-first development.

## Monorepo Layout
- apps/frontend: Next.js app (App Router, TS)
- apps/backend: NestJS API (modules per feature)
- packages/shared: Shared TypeScript types, enums, DTOs
- docker: Docker Compose for Postgres (+ optional pgAdmin)
- .github/workflows: CI for build/test/typecheck/lint

## Architectural Principles
- Model-first: Update `/models` (DBML/SDML/UXML/WDML) prior to code changes.
- CamelCase API, snake_case DB: Use Prisma `@map("snake_case")` to keep DB normalized while exposing camelCase in API.
- Approval records: Track workflow transitions in `approval_records` via transactions.
- Role-based guards: `JwtAuthGuard` + `RolesGuard` at controller level.
- Frontend navigation: Next.js pages for top-level; component-level state for drill-down (retain `currentView` → `subView` → `selectedId` pattern inside feature components where useful).

## Initial Setup Steps
1. Create new folder and initialize monorepo with npm workspaces.
2. Scaffold Next.js frontend.
3. Scaffold NestJS backend.
4. Add shared package for types/enums/DTOs.
5. Add Docker Compose for PostgreSQL.
6. Configure Prisma schema and migrations.
7. Implement Auth (JWT + roles).
8. Wire core feature modules and endpoints.
9. Add dev scripts and CI workflow.

## Commands (Bootstrap)
```bash
# 0) Create repo folder
mkdir docflow-rebuild && cd docflow-rebuild

# 1) Initialize workspace monorepo
npm init -y
npm pkg set workspaces="[\"apps/frontend\", \"apps/backend\", \"packages/shared\"]"

# 2) Frontend scaffold (Next.js 14, TS, Tailwind)
npx create-next-app@latest apps/frontend --ts --app --eslint --tailwind --src-dir

# 3) Backend scaffold (NestJS 10)
npx @nestjs/cli new apps/backend --package-manager npm

# 4) Shared package
mkdir -p packages/shared && cd packages/shared && npm init -y && cd -

# 5) Dockerized Postgres
mkdir -p docker
cat > docker/docker-compose.yml << 'EOF'
version: '3.9'
services:
  postgres:
    image: postgres:16
    container_name: docflow_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: document_flow
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 10
volumes:
  pgdata:
EOF

# 6) Start database
docker compose -f docker/docker-compose.yml up -d

# 7) Backend: add Prisma and configure
cd apps/backend
npm install @prisma/client prisma
npx prisma init --datasource-provider postgresql

# Set DATABASE_URL in apps/backend/.env to match Docker
echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/document_flow" > .env

# 8) Generate client and run initial migration
npx prisma generate
npx prisma migrate dev --name init
cd -
```

## Environments
- apps/backend/.env
  - DATABASE_URL=postgresql://postgres:postgres@localhost:5432/document_flow
  - JWT_SECRET=replace_me
  - JWT_EXPIRES_IN=15m
  - CORS_ORIGIN=http://localhost:3000
- apps/frontend/.env.local
  - NEXT_PUBLIC_API_BASE_URL=http://localhost:5040

## Shared Types & Enums (packages/shared)
- Export core types and enums that reflect camelCase API responses:
  - User, Department, Approver, ApprovalRecord
  - RequisitionSlip, RequestItem
  - RequisitionForPayment, CheckVoucher, Check
  - RequestForAdjustment, AdjustmentItem
  - MaterialIssuanceSlip, MaterialItem
  - PersonnelRequest
  - PlaneTicketRequest
  - CashAdvanceAgreement
- Export status enums to match workflows (e.g., `RequisitionStatus`, `RFPStatus`, `PersonnelStatus`, `PlaneTicketStatus`, `CashAdvanceStatus`).

## Backend Modules (apps/backend)
- auth: JWT issuance, guards, role enums
- requisitions: CRUD + approval flow
- payments: RFP lifecycle (CV generation, check issuance, disbursement)
- adjustments: RFA handling
- materials: issuance slips + items
- personnel: hiring/staffing requests
- plane-tickets: travel requests and booking
- cash-advances: agreements + repayment tracking
- approval-records: audit trail
- prisma: PrismaService (singleton), migration scripts

### NestJS Patterns
- Services: inject `PrismaService`, return `Promise<T>`, use transactions for multi-step changes.
- Controllers: `@UseGuards(JwtAuthGuard, RolesGuard)`, `@Roles(...)`, `@ApiBearerAuth()` where Swagger is used.
- DTOs: `class-validator` for input validation.
- Prisma: all tables use UUID PKs, timestamps, cascade delete where appropriate.
- Approval records: create on every state change with `entityType`, `entityId`, `approvedBy/rejectedBy`, `approvalLevel`, `timestamp`.

## Frontend (apps/frontend)
- Pages per feature: `/requisitions`, `/payments`, `/materials`, `/personnel`, `/plane-tickets`, `/cash-advances`.
- Within pages, retain component-level state navigation for drill-down:
  - `currentView` → `subView` → `selectedId`
- Service layer per feature (typed responses) consuming `NEXT_PUBLIC_API_BASE_URL`.
- Tailwind styling conventions (status badges, buttons, forms).
- Auth context on init; handle loading state while profile fetches.

## Prisma Schema Guidance
- Use `@map("snake_case")` to keep DB columns normalized while exposing camelCase in generated client and API.
- Ensure all enums mirror workflow states.
- Include relations and indexes per feature as in the original system.

## Migration Order (Recommended)
1. Core: `users`, `departments`, `approvers`, `approval_records`.
2. Requisition slips + items.
3. Requisition for payment + vouchers + checks.
4. Adjustments (RFA).
5. Materials issuance + items.
6. Personnel requests.
7. Plane ticket requests.
8. Cash advance agreements.

## Auth Implementation
- JWT issuance on login; `passport-jwt` for route protection.
- `RolesGuard` reads role from JWT payload; decorators enforce access.
- Token expiry default 15 minutes; configurable via env.
- Frontend stores JWT (HttpOnly cookie or memory + bearer) and queries profile on init.

## Dev Scripts (Root and Apps)
- Root `package.json`:
  - `dev:db`: `docker compose -f docker/docker-compose.yml up -d`
  - `dev`: `npm run dev -w apps/backend & npm run dev -w apps/frontend`
- Backend `package.json`:
  - `prisma:generate`, `prisma:migrate`, `prisma:studio`
  - `start:dev`, `build`, `start:prod`
- Frontend `package.json`:
  - `dev`, `build`, `start`

## CI Overview
- Jobs: install, lint, typecheck, test, build
- Optional: build Docker images for backend; run migrations on staging

## Copilot Context Hints
- Use model-first methodology: update `/models` before code changes.
- Enforce camelCase in API and types; DB uses snake_case via Prisma `@map`.
- Approval workflows require `approval_records` creation on each transition.
- Frontend uses service-per-feature and typed responses.
- Navigation prefers component-level state drill-down even with Next.js pages.
- Prefer transactions in services for multi-step workflows.

## Next Actions
1. Create the new repo and apply the bootstrap commands above.
2. Add initial Prisma schema for core entities and run migrations.
3. Implement `auth` module and a simple `users` endpoint.
4. Wire frontend auth context and a basic dashboard.
5. Begin porting Requisitions feature end-to-end.

## Verification Checklist
- Backend compiles and runs at `http://localhost:5040`.
- Frontend compiles and runs at `http://localhost:3000`.
- Dockerized Postgres is healthy and Prisma connects.
- JWT auth works; protected endpoints require token.
- Types and API responses align (camelCase) across shared, backend, and frontend.
