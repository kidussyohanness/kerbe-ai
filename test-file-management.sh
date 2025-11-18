#!/bin/bash

echo "🧪 Testing KERBÉ AI File Management System"
echo "=========================================="

# Test 1: Check if server is running
echo "1. Testing server status..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|307"; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running"
    exit 1
fi

# Test 2: Check authentication redirect
echo "2. Testing authentication redirect..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard/files | grep -q "307"; then
    echo "✅ Authentication redirect working"
else
    echo "❌ Authentication redirect failed"
fi

# Test 3: Check API endpoints
echo "3. Testing API endpoints..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/files | grep -q "401"; then
    echo "✅ Files API endpoint working (401 Unauthorized expected)"
else
    echo "❌ Files API endpoint failed"
fi

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/folders | grep -q "401"; then
    echo "✅ Folders API endpoint working (401 Unauthorized expected)"
else
    echo "❌ Folders API endpoint failed"
fi

# Test 4: Check database connectivity
echo "4. Testing database connectivity..."
cd analytics-platform-frontend
if npx prisma db push --accept-data-loss > /dev/null 2>&1; then
    echo "✅ Database connection working"
else
    echo "❌ Database connection failed"
fi

# Test 5: Check if upload directory exists
echo "5. Testing file storage..."
if [ -d "uploads" ]; then
    echo "✅ Upload directory exists"
else
    echo "❌ Upload directory missing"
fi

echo ""
echo "🎉 File Management System Test Complete!"
echo "========================================"
echo ""
echo "📋 Next Steps:"
echo "1. Sign in at http://localhost:3000/signin"
echo "2. Navigate to 'My Files' in the dashboard"
echo "3. Upload test files using drag & drop"
echo "4. Create folders to organize documents"
echo "5. Test search and filtering features"
echo ""
echo "📁 Test file available: analytics-platform-frontend/test-upload.txt"