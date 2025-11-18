#!/bin/bash

# Kerbe AI MVP Startup Script
echo "🚀 Starting Kerbe AI Analytics Platform MVP..."

# Check if we're in the right directory
if [ ! -d "analytics-platform-backend" ] || [ ! -d "analytics-platform-frontend" ]; then
    echo "❌ Please run this script from the root directory of the kerbe-ai project"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f "analytics-platform-backend/.env" ]; then
    echo "📝 Creating .env file with default configuration..."
    cat > analytics-platform-backend/.env << EOF
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/kerbe_analytics"
DIRECT_URL="postgresql://postgres:password@localhost:5432/kerbe_analytics"

# Server Configuration
NODE_ENV="development"
PORT=8787

# AI Provider Configuration (Mock mode for testing)
AI_PROVIDER="mock"

# Authentication Configuration
NEXTAUTH_DATABASE_URL="postgresql://postgres:password@localhost:5432/kerbe_auth"
NEXTAUTH_DIRECT_URL="postgresql://postgres:password@localhost:5432/kerbe_auth"
NEXTAUTH_SECRET="your-nextauth-secret-change-this"
AUTH_USE_DB="0"
AUTH_DEMO_EMAIL="demo@kerbe.ai"
AUTH_DEMO_PASSWORD="DemoPass123!"
EOF
    echo "✅ Created .env file with mock AI configuration"
fi

# Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "analytics-platform-backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd analytics-platform-backend && npm install && cd ..
fi

if [ ! -d "analytics-platform-frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd analytics-platform-frontend && npm install && cd ..
fi

# Start database (if Docker is available)
echo "🗄️ Starting database..."
if command -v docker &> /dev/null; then
    cd analytics-platform-backend
    docker compose up -d
    echo "✅ Database started"
    cd ..
else
    echo "⚠️ Docker not found. Please start PostgreSQL manually or install Docker."
fi

# Build and start backend
echo "🔧 Building backend..."
cd analytics-platform-backend
npm run build
echo "🚀 Starting backend server..."
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd analytics-platform-frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Kerbe AI MVP is starting up!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8787"
echo "🤖 AI Chat: http://localhost:3000/dashboard/chat"
echo ""
echo "📋 Demo Credentials:"
echo "   Email: demo@kerbe.ai"
echo "   Password: DemoPass123!"
echo ""
echo "🛑 To stop the servers, press Ctrl+C"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
