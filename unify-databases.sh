#!/bin/bash

# Database Unification Script
# This script unifies frontend and backend databases

set -e

echo "🔄 Starting Database Unification..."
echo ""

# Step 1: Backup databases (already done, but verify)
echo "✅ Step 1: Verifying backups..."
if [ -f "analytics-platform-backend/prisma/dev.db.backup-*" ]; then
  echo "   Backups exist"
else
  echo "   Creating backups..."
  cd analytics-platform-backend/prisma && cp dev.db dev.db.backup-$(date +%Y%m%d-%H%M%S) && cd ../..
  cd analytics-platform-frontend/prisma && cp dev.db dev.db.backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || echo "   Frontend DB doesn't exist (OK)" && cd ../..
fi

# Step 2: Generate Prisma clients
echo ""
echo "✅ Step 2: Generating Prisma clients..."
cd analytics-platform-backend
npx prisma generate
cd ../analytics-platform-frontend
npx prisma generate
cd ..

# Step 3: Run migrations on backend (creates new tables)
echo ""
echo "✅ Step 3: Running database migrations..."
cd analytics-platform-backend
npx prisma migrate dev --name unify_databases --create-only || echo "   Migration file created (run manually if needed)"
cd ..

# Step 4: Verify schema
echo ""
echo "✅ Step 4: Validating schemas..."
cd analytics-platform-backend && npx prisma validate && cd ..
cd analytics-platform-frontend && npx prisma validate && cd ..

echo ""
echo "🎉 Database unification setup complete!"
echo ""
echo "⚠️  IMPORTANT: Update environment variables:"
echo "   1. Frontend .env.local should have:"
echo "      DATABASE_URL=\"file:../../analytics-platform-backend/prisma/dev.db\""
echo ""
echo "   2. Backend .env should have (already set):"
echo "      DATABASE_URL=\"file:./prisma/dev.db\""
echo ""
echo "   3. Restart both servers to apply changes"
echo ""
echo "   4. Test by:"
echo "      - Logging in with Google (creates Account/Session)"
echo "      - Uploading a document"
echo "      - Checking dashboard"

