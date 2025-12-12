# Quick Reference Guide

## Common Commands

### Starting Development

```bash
# Start database
npm run dev:db

# Start all dev servers (backend + frontend)
npm run dev

# OR start individually:
cd apps/backend && npm run start:dev    # Backend on :5040
cd apps/frontend && npm run dev         # Frontend on :3000
```

### Database Operations

```bash
cd apps/backend

# Generate Prisma client (after schema changes)
npm run prisma:generate

# Create migration
npm run prisma:migrate dev --name your_migration_name

# Apply migrations
npm run prisma:migrate

# Reset database (WARNING: deletes all data)
npm run prisma:migrate reset

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

### Building for Production

```bash
# Build everything
npm run build

# Build individually
npm run build -w apps/backend
npm run build -w apps/frontend
npm run build -w packages/shared
```

## File Locations

| What | Where |
|------|-------|
| Backend code | `apps/backend/src/` |
| Prisma schema | `apps/backend/prisma/schema.prisma` |
| Backend env | `apps/backend/.env` |
| Frontend code | `apps/frontend/src/` |
| Frontend env | `apps/frontend/.env.local` |
| Shared types | `packages/shared/src/` |
| Docker config | `docker/docker-compose.yml` |
| Models | `models/` |

## URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:5040
- PostgreSQL: localhost:5432
- PgAdmin: http://localhost:5050
- Prisma Studio: http://localhost:5555 (when running)

## Database Credentials

```
Host: localhost
Port: 5432
Database: document_flow
Username: postgres
Password: postgres
```

## Adding a New Feature

### 1. Update Model
Edit files in `/models/` (DBML/SDML/UXML/WDML)

### 2. Update Prisma Schema
Edit `apps/backend/prisma/schema.prisma`

```prisma
model YourEntity {
  id        String   @id @default(uuid()) @db.Uuid
  fieldName String   @map("field_name")
  // ...
  @@map("your_entities")
}
```

### 3. Create Migration
```bash
cd apps/backend
npm run prisma:generate
npm run prisma:migrate dev --name add_your_entity
```

### 4. Update Shared Types
Edit `packages/shared/src/types.ts`

```typescript
export interface YourEntity {
  id: string;
  fieldName: string;  // camelCase
  // ...
}
```

### 5. Create Backend Module
```bash
cd apps/backend
npx nest g module your-entity
npx nest g controller your-entity
npx nest g service your-entity
```

### 6. Implement Service
```typescript
// apps/backend/src/your-entity/your-entity.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class YourEntityService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.yourEntity.findMany();
  }
}
```

### 7. Create Frontend Service
```typescript
// apps/frontend/src/services/yourEntity.ts
export async function getYourEntities() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/your-entity`);
  return response.json();
}
```

### 8. Create Frontend Pages
- Create page in `apps/frontend/src/app/your-entity/page.tsx`
- Create components in `apps/frontend/src/components/your-entity/`

## Troubleshooting

### "Prisma Client did not initialize yet"
```bash
cd apps/backend
npm run prisma:generate
```

### Database connection error
```bash
# Check if database is running
docker ps

# Start database if not running
npm run dev:db

# Check connection string in apps/backend/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/document_flow"
```

### Frontend can't reach backend
1. Check backend is running on port 5040
2. Verify CORS settings in `apps/backend/src/main.ts`
3. Check `NEXT_PUBLIC_API_BASE_URL` in `apps/frontend/.env.local`

### TypeScript errors after schema change
```bash
# Regenerate Prisma client
cd apps/backend
npm run prisma:generate

# Rebuild shared package
cd ../../packages/shared
npm run build
```

## Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| Database columns | snake_case | `first_name` |
| Prisma model fields | camelCase | `firstName` |
| API responses | camelCase | `{ firstName: "John" }` |
| Frontend types | camelCase | `interface User { firstName: string }` |
| React components | PascalCase | `UserProfile.tsx` |
| Services | camelCase | `userService.ts` |
| Enums | SCREAMING_SNAKE | `USER_ROLE.ADMIN` |

## Status Enum Values

```typescript
// Requisitions
DRAFT, SUBMITTED, PENDING_APPROVAL, APPROVED, REJECTED, CANCELLED, COMPLETED

// Payments
DRAFT, SUBMITTED, PENDING_APPROVAL, APPROVED, CV_GENERATED, CHECK_ISSUED, DISBURSED, REJECTED, CANCELLED

// Adjustments
DRAFT, SUBMITTED, PENDING_APPROVAL, APPROVED, REJECTED, CANCELLED

// Materials
DRAFT, SUBMITTED, APPROVED, ISSUED, REJECTED, CANCELLED

// Personnel
DRAFT, SUBMITTED, REVIEWED, SHORTLISTED, INTERVIEWED, SELECTED, APPROVED, REJECTED, CANCELLED

// Plane Tickets
DRAFT, SUBMITTED, APPROVED, BOOKED, REJECTED, CANCELLED

// Cash Advances
DRAFT, SUBMITTED, APPROVED, DISBURSED, REPAYING, COMPLETED, REJECTED, CANCELLED
```

## Environment Variables

### Development
Already configured in:
- `apps/backend/.env`
- `apps/frontend/.env.local`

### Production
Create:
- `apps/backend/.env.production`
- `apps/frontend/.env.production`

Update:
- JWT_SECRET to strong random value
- DATABASE_URL to production database
- CORS_ORIGIN to production frontend URL

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "feat: add your feature"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

## Package Management

```bash
# Install package in backend
npm install package-name -w apps/backend

# Install package in frontend
npm install package-name -w apps/frontend

# Install package in shared
npm install package-name -w packages/shared

# Install package in all workspaces
npm install package-name --workspaces
```

## Testing

```bash
# Run all tests
npm test

# Test specific workspace
npm test -w apps/backend

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Useful Prisma Commands

```bash
# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Pull schema from database
npx prisma db pull

# Push schema to database (without migration)
npx prisma db push

# Seed database
npm run prisma:seed
```

## Docker Commands

```bash
# Start services
docker compose -f docker/docker-compose.yml up -d

# Stop services
docker compose -f docker/docker-compose.yml down

# View logs
docker compose -f docker/docker-compose.yml logs -f

# Remove volumes (delete data)
docker compose -f docker/docker-compose.yml down -v

# Rebuild containers
docker compose -f docker/docker-compose.yml up -d --build
```
