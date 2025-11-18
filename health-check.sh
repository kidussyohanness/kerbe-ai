#!/bin/bash

# KERBÉ AI System Health Check Script
# This script validates the entire system before startup

set -e

echo "🔍 KERBÉ AI System Health Check"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "OK" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    else
        echo -e "${RED}❌ $message${NC}"
    fi
}

# Check if we're in the right directory
if [ ! -d "analytics-platform-frontend" ] || [ ! -d "analytics-platform-backend" ]; then
    print_status "ERROR" "Not in project root directory (missing frontend/backend directories)"
    exit 1
fi

print_status "OK" "In project root directory"

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null || echo "not found")
if [ "$NODE_VERSION" = "not found" ]; then
    print_status "ERROR" "Node.js not installed"
    exit 1
fi
print_status "OK" "Node.js version: $NODE_VERSION"

# Check npm
NPM_VERSION=$(npm --version 2>/dev/null || echo "not found")
if [ "$NPM_VERSION" = "not found" ]; then
    print_status "ERROR" "npm not installed"
    exit 1
fi
print_status "OK" "npm version: $NPM_VERSION"

echo ""
echo "📁 Frontend Health Check"
echo "------------------------"

# Check frontend directory
if [ ! -d "analytics-platform-frontend" ]; then
    print_status "ERROR" "Frontend directory not found"
    exit 1
fi
print_status "OK" "Frontend directory exists"

cd analytics-platform-frontend

# Check frontend package.json
if [ ! -f "package.json" ]; then
    print_status "ERROR" "Frontend package.json not found"
    exit 1
fi
print_status "OK" "Frontend package.json exists"

# Check frontend node_modules
if [ ! -d "node_modules" ]; then
    print_status "WARN" "Frontend node_modules not found, installing..."
    npm install
fi
print_status "OK" "Frontend dependencies installed"

# Check frontend environment files
if [ ! -f ".env.local" ]; then
    print_status "ERROR" "Frontend .env.local not found"
    exit 1
fi
print_status "OK" "Frontend .env.local exists"

# Check database file
if [ ! -f "prisma/dev.db" ]; then
    print_status "WARN" "Frontend database not found, creating..."
    npx prisma migrate deploy
fi
print_status "OK" "Frontend database exists"

# Check Prisma client
print_status "OK" "Generating Prisma client..."
npx prisma generate > /dev/null 2>&1
print_status "OK" "Prisma client generated"

cd ..

echo ""
echo "🔧 Backend Health Check"
echo "-----------------------"

# Check backend directory
if [ ! -d "analytics-platform-backend" ]; then
    print_status "ERROR" "Backend directory not found"
    exit 1
fi
print_status "OK" "Backend directory exists"

cd analytics-platform-backend

# Check backend package.json
if [ ! -f "package.json" ]; then
    print_status "ERROR" "Backend package.json not found"
    exit 1
fi
print_status "OK" "Backend package.json exists"

# Check backend node_modules
if [ ! -d "node_modules" ]; then
    print_status "WARN" "Backend node_modules not found, installing..."
    npm install
fi
print_status "OK" "Backend dependencies installed"

# Check backend environment files
if [ ! -f ".env" ]; then
    print_status "ERROR" "Backend .env not found"
    exit 1
fi
print_status "OK" "Backend .env exists"

# Check backend database
if [ ! -f "prisma/dev.db" ]; then
    print_status "WARN" "Backend database not found, creating..."
    npx prisma migrate deploy
fi
print_status "OK" "Backend database exists"

cd ..

echo ""
echo "🌐 Port Availability Check"
echo "--------------------------"

# Check if ports are available
check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_status "WARN" "Port $port is in use (may be running $service)"
    else
        print_status "OK" "Port $port is available"
    fi
}

check_port 3000 "Frontend"
check_port 3001 "Frontend (alternative)"
check_port 8787 "Backend"

echo ""
echo "🔑 Environment Variables Check"
echo "-----------------------------"

# Check critical environment variables
check_env_var() {
    local file=$1
    local var=$2
    local description=$3
    
    if grep -q "^$var=" "$file" 2>/dev/null; then
        print_status "OK" "$description configured"
    else
        print_status "ERROR" "$description missing in $file"
        return 1
    fi
}

# Check frontend environment
if [ -f "analytics-platform-frontend/.env.local" ]; then
    check_env_var "analytics-platform-frontend/.env.local" "NEXTAUTH_SECRET" "NextAuth Secret"
    check_env_var "analytics-platform-frontend/.env.local" "NEXTAUTH_URL" "NextAuth URL"
    check_env_var "analytics-platform-frontend/.env.local" "GOOGLE_CLIENT_ID" "Google Client ID"
    check_env_var "analytics-platform-frontend/.env.local" "GOOGLE_CLIENT_SECRET" "Google Client Secret"
    check_env_var "analytics-platform-frontend/.env.local" "DATABASE_URL" "Frontend Database URL"
fi

# Check backend environment
if [ -f "analytics-platform-backend/.env" ]; then
    check_env_var "analytics-platform-backend/.env" "OPENAI_API_KEY" "OpenAI API Key"
    check_env_var "analytics-platform-backend/.env" "DATABASE_URL" "Backend Database URL"
    check_env_var "analytics-platform-backend/.env" "PORT" "Backend Port"
fi

echo ""
echo "🚀 System Ready!"
echo "================="
print_status "OK" "All health checks passed"
print_status "OK" "System is ready to start"

echo ""
echo "📋 Quick Start Commands:"
echo "-----------------------"
echo "Frontend: cd analytics-platform-frontend && npm run dev"
echo "Backend:  cd analytics-platform-backend && npm run dev"
echo ""
echo "🌐 URLs:"
echo "-------"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8787"
echo "Health:   http://localhost:3000/api/health"
echo ""
echo "🔍 Health Check:"
echo "---------------"
echo "Run this script anytime: ./health-check.sh"
echo "API Health Check: curl http://localhost:3000/api/health"
