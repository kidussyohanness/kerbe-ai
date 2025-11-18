#!/bin/bash

# Simple upload test using curl
BASE_URL="${API_BASE_URL:-http://localhost:8787}"
TEST_USER_ID="test-user-123"

echo "=========================================="
echo "Testing Document Upload"
echo "=========================================="

# Check if backend is running
echo -e "\n[1/4] Checking backend health..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" != "200" ]; then
    echo "❌ Backend is not running or not accessible"
    echo "Please start the backend server first"
    exit 1
fi
echo "✅ Backend is running"

# Create a test CSV file
echo -e "\n[2/4] Creating test CSV file..."
mkdir -p test-data
cat > test-data/test-balance-sheet.csv << 'EOF'
Company,Period,Total Assets,Total Liabilities,Total Equity
Test Company Inc,Q4 2024,1000000,600000,400000
EOF
echo "✅ Test CSV file created"

# Test CSV upload
echo -e "\n[3/4] Testing CSV upload..."
UPLOAD_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "x-user-id: $TEST_USER_ID" \
  -F "file=@test-data/test-balance-sheet.csv" \
  -F "documentType=balance_sheet" \
  -F "businessContext=Test upload from script" \
  "$BASE_URL/document/analyze")

HTTP_CODE=$(echo "$UPLOAD_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$UPLOAD_RESPONSE" | sed '$d')

echo "Response code: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Upload successful!"
    echo "$RESPONSE_BODY" | grep -o '"success":[^,]*' | head -1
    echo "$RESPONSE_BODY" | grep -o '"documentId":"[^"]*"' | head -1
    echo "$RESPONSE_BODY" | grep -o '"saved":[^,}]*' | head -1
else
    echo "❌ Upload failed"
    echo "Response: $RESPONSE_BODY"
    exit 1
fi

# Query uploaded documents
echo -e "\n[4/4] Querying uploaded documents..."
QUERY_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "x-user-id: $TEST_USER_ID" \
  "$BASE_URL/user/documents")

HTTP_CODE=$(echo "$QUERY_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$QUERY_RESPONSE" | sed '$d')

echo "Response code: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
    DOC_COUNT=$(echo "$RESPONSE_BODY" | grep -o '"documents":\[' | wc -l | tr -d ' ')
    if [ -n "$DOC_COUNT" ]; then
        echo "✅ Found documents in database"
        echo "$RESPONSE_BODY" | head -20
    else
        echo "⚠️  No documents found (this might be expected)"
    fi
else
    echo "❌ Query failed"
    echo "Response: $RESPONSE_BODY"
fi

echo -e "\n=========================================="
echo "Test completed!"
echo "=========================================="

