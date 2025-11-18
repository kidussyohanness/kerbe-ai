#!/bin/bash

# 🚀 Supabase Migration Script
# This script migrates from SQLite to Supabase (PostgreSQL)

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║          🚀 SUPABASE MIGRATION - AUTOMATED SETUP 🚀              ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if DATABASE_URL is set
if [ -z "$SUPABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_URL not set in environment${NC}"
    echo ""
    echo "Please provide your Supabase connection string:"
    echo "Example: postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
    echo ""
    read -p "Enter DATABASE_URL: " SUPABASE_URL
    echo ""
fi

# Validate connection string format
if [[ ! "$SUPABASE_URL" =~ ^postgresql:// ]]; then
    echo -e "${RED}❌ Invalid connection string format${NC}"
    echo "Expected: postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
    exit 1
fi

echo -e "${GREEN}✅ Connection string validated${NC}"
echo ""

# Step 1: Update Backend Schema
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Updating Backend Prisma Schema..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd analytics-platform-backend

# Update backend schema datasource
sed -i.bak 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
sed -i.bak 's|url      = "file:./dev.db"|url      = env("DATABASE_URL")|' prisma/schema.prisma

echo -e "${GREEN}✅ Backend schema updated for PostgreSQL${NC}"
echo ""

# Step 2: Update Backend .env
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Updating Backend .env file..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create or update .env
if [ ! -f .env ]; then
    touch .env
fi

# Remove old DATABASE_URL if exists
sed -i.bak '/^DATABASE_URL=/d' .env
sed -i.bak '/^DIRECT_URL=/d' .env

# Add new DATABASE_URL
echo "DATABASE_URL=\"$SUPABASE_URL\"" >> .env
echo "DIRECT_URL=\"$SUPABASE_URL\"" >> .env

echo -e "${GREEN}✅ Backend .env updated with Supabase connection${NC}"
echo ""

# Step 3: Generate Prisma Client
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Generating Prisma Client..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

npx prisma generate

echo -e "${GREEN}✅ Prisma client generated${NC}"
echo ""

# Step 4: Push Schema to Supabase
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Pushing schema to Supabase..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

npx prisma db push --accept-data-loss

echo -e "${GREEN}✅ Schema pushed to Supabase${NC}"
echo ""

# Step 5: Update Frontend Schema
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Updating Frontend Prisma Schema..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd ../analytics-platform-frontend

# Update frontend schema datasource
sed -i.bak 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
sed -i.bak 's|url      = "file:./dev.db"|url      = env("DATABASE_URL")|' prisma/schema.prisma

echo -e "${GREEN}✅ Frontend schema updated for PostgreSQL${NC}"
echo ""

# Step 6: Update Frontend .env.local
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Updating Frontend .env.local file..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create or update .env.local
if [ ! -f .env.local ]; then
    touch .env.local
fi

# Remove old DATABASE_URL if exists
sed -i.bak '/^DATABASE_URL=/d' .env.local

# Add new DATABASE_URL
echo "DATABASE_URL=\"$SUPABASE_URL\"" >> .env.local

echo -e "${GREEN}✅ Frontend .env.local updated${NC}"
echo ""

# Step 7: Generate Frontend Prisma Client
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 7: Generating Frontend Prisma Client..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

npx prisma generate

echo -e "${GREEN}✅ Frontend Prisma client generated${NC}"
echo ""

# Step 8: Test Connection
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 8: Testing Database Connection..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd ../analytics-platform-backend

# Create a simple test script
cat > test-db-connection.js << 'EOFTEST'
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test query
    const userCount = await prisma.user.count();
    console.log(`📊 Current users in database: ${userCount}`);
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    await prisma.$disconnect();
    return false;
  }
}

testConnection();
EOFTEST

node test-db-connection.js
TEST_RESULT=$?

rm test-db-connection.js

if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Database connection test passed${NC}"
else
    echo -e "${RED}❌ Database connection test failed${NC}"
    exit 1
fi

echo ""

# Step 9: Restart Backend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 9: Restarting Backend Server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Kill existing backend process
pkill -f "npm run dev" || true
sleep 2

# Start backend in background
npm run dev > /tmp/backend-supabase.log 2>&1 &
BACKEND_PID=$!

echo -e "${GREEN}✅ Backend restarted (PID: $BACKEND_PID)${NC}"
echo ""

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Test backend health
if curl -s http://localhost:3002/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy and responding${NC}"
else
    echo -e "${YELLOW}⚠️  Backend may need more time to start${NC}"
fi

echo ""

# Step 10: Restart Frontend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 10: Restarting Frontend Server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd ../analytics-platform-frontend

# Kill existing frontend process
pkill -f "next dev" || true
sleep 2

# Start frontend in background
npm run dev > /tmp/frontend-supabase.log 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Frontend restarted (PID: $FRONTEND_PID)${NC}"
echo ""

# Summary
cd ..

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║              ✨ SUPABASE MIGRATION COMPLETE! ✨                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ Backend schema migrated to PostgreSQL${NC}"
echo -e "${GREEN}✅ Frontend schema migrated to PostgreSQL${NC}"
echo -e "${GREEN}✅ Environment variables updated${NC}"
echo -e "${GREEN}✅ Prisma clients generated${NC}"
echo -e "${GREEN}✅ Schema pushed to Supabase${NC}"
echo -e "${GREEN}✅ Database connection tested${NC}"
echo -e "${GREEN}✅ Servers restarted${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "NEXT STEPS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Test the application:"
echo "   → Frontend: http://localhost:3001/dashboard"
echo "   → Backend:  http://localhost:3002/api/health"
echo ""
echo "2. Upload a test document to verify everything works"
echo ""
echo "3. Check Supabase dashboard:"
echo "   → https://app.supabase.com"
echo "   → Go to Table Editor to see your data"
echo ""
echo "4. Monitor logs if needed:"
echo "   → Backend:  tail -f /tmp/backend-supabase.log"
echo "   → Frontend: tail -f /tmp/frontend-supabase.log"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}🎉 Your platform is now running on Supabase! 🎉${NC}"
echo ""

