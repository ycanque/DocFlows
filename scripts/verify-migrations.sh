#!/bin/bash

# Migration Verification Script
# Run this to verify all file upload migrations are present

echo "Checking file upload migrations..."

MIGRATIONS_DIR="apps/backend/prisma/migrations"

# Check for required migrations
MIGRATIONS=(
  "20251231080857_add_file_uploads"
  "20251231084342_add_file_relationships"
  "20251231094402_add_workflow_step_to_file_uploads"
)

ALL_PRESENT=true

for migration in "${MIGRATIONS[@]}"; do
  if [ -d "$MIGRATIONS_DIR/$migration" ]; then
    echo "✅ Found: $migration"
  else
    echo "❌ Missing: $migration"
    ALL_PRESENT=false
  fi
done

if [ "$ALL_PRESENT" = true ]; then
  echo ""
  echo "✅ All file upload migrations are present!"
  echo ""
  echo "To apply migrations to staging:"
  echo "1. Set DATABASE_URL to your Neon staging database"
  echo "2. Run: cd apps/backend && npm run prisma:migrate deploy"
  exit 0
else
  echo ""
  echo "❌ Some migrations are missing!"
  echo "Please ensure all migrations are generated before deploying."
  exit 1
fi
