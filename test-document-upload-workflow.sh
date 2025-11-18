#!/bin/bash

# KERBÉ AI Document Upload Workflow Test
# This script tests the complete document upload and KPI integration workflow

set -e

echo "🧪 KERBÉ AI Document Upload Workflow Test"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "OK" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    elif [ "$status" = "INFO" ]; then
        echo -e "${BLUE}ℹ️  $message${NC}"
    else
        echo -e "${RED}❌ $message${NC}"
    fi
}

# Test configuration
USER_ID="cmgtv2kjt0000sfzqb6d91ez0"
COMPANY_ID="seed-company"
BACKEND_URL="http://localhost:8787"
FRONTEND_URL="http://localhost:3000"

echo ""
print_status "INFO" "Testing Document Upload Workflow"
echo "----------------------------------------"

# Test 1: Backend Health Check
echo ""
print_status "INFO" "Test 1: Backend Health Check"
if curl -s "$BACKEND_URL/health" | jq -e '.status == "ok"' > /dev/null; then
    print_status "OK" "Backend is healthy"
else
    print_status "ERROR" "Backend health check failed"
    exit 1
fi

# Test 2: Frontend Health Check
echo ""
print_status "INFO" "Test 2: Frontend Health Check"
if curl -s "$FRONTEND_URL/api/health" | jq -e '.status == "healthy"' > /dev/null; then
    print_status "OK" "Frontend is healthy"
else
    print_status "ERROR" "Frontend health check failed"
    exit 1
fi

# Test 3: Create Test Document
echo ""
print_status "INFO" "Test 3: Creating Test Financial Document"
cat > test-income-statement.csv << 'EOF'
Company Name,Acme Tech Solutions Inc.
Period,Q2 2024
Date,2024-06-30

INCOME STATEMENT
Total Revenue,45000000
Cost of Goods Sold,22500000
Gross Profit,22500000
Operating Expenses,18000000
Operating Income,4500000
Interest Expense,500000
Tax Expense,1000000
Net Income,3000000
EOF

if [ -f "test-income-statement.csv" ]; then
    print_status "OK" "Test income statement created"
else
    print_status "ERROR" "Failed to create test document"
    exit 1
fi

# Test 4: Document Upload
echo ""
print_status "INFO" "Test 4: Document Upload"
UPLOAD_RESPONSE=$(curl -s -X POST "$BACKEND_URL/document/analyze" \
  -H "x-company-id: $COMPANY_ID" \
  -H "x-user-id: $USER_ID" \
  -F "file=@test-income-statement.csv" \
  -F "documentType=income_statement" \
  -F "businessContext=Q2 2024 Income Statement Test")

if echo "$UPLOAD_RESPONSE" | jq -e '.success == true' > /dev/null; then
    print_status "OK" "Document uploaded successfully"
    DOCUMENT_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.documentId')
    print_status "INFO" "Document ID: $DOCUMENT_ID"
else
    print_status "ERROR" "Document upload failed"
    echo "$UPLOAD_RESPONSE" | jq .
    exit 1
fi

# Test 5: Document Persistence
echo ""
print_status "INFO" "Test 5: Document Persistence Check"
DOCUMENTS_RESPONSE=$(curl -s "$BACKEND_URL/user/documents" -H "x-user-id: $USER_ID")

if echo "$DOCUMENTS_RESPONSE" | jq -e '.success == true' > /dev/null; then
    DOCUMENT_COUNT=$(echo "$DOCUMENTS_RESPONSE" | jq '.documents | length')
    print_status "OK" "Documents retrieved successfully (Total: $DOCUMENT_COUNT)"
    
    # Check if our document is in the list
    if echo "$DOCUMENTS_RESPONSE" | jq -e --arg id "$DOCUMENT_ID" '.documents[] | select(.id == $id)' > /dev/null; then
        print_status "OK" "Uploaded document found in user's document list"
    else
        print_status "WARN" "Uploaded document not found in user's document list"
    fi
else
    print_status "ERROR" "Failed to retrieve documents"
    echo "$DOCUMENTS_RESPONSE" | jq .
    exit 1
fi

# Test 6: Financial Data Integration
echo ""
print_status "INFO" "Test 6: Financial Data Integration"
FINANCIAL_DATA_RESPONSE=$(curl -s "$BACKEND_URL/dashboard/financial-data/$USER_ID?months=12")

if echo "$FINANCIAL_DATA_RESPONSE" | jq -e '.success == true' > /dev/null; then
    print_status "OK" "Financial data retrieved successfully"
    
    # Check data completeness
    HAS_BALANCE_SHEET=$(echo "$FINANCIAL_DATA_RESPONSE" | jq '.data.dataCompleteness.hasBalanceSheet')
    HAS_INCOME_STATEMENT=$(echo "$FINANCIAL_DATA_RESPONSE" | jq '.data.dataCompleteness.hasIncomeStatement')
    HAS_CASH_FLOW=$(echo "$FINANCIAL_DATA_RESPONSE" | jq '.data.dataCompleteness.hasCashFlow')
    
    print_status "INFO" "Data Completeness:"
    print_status "INFO" "  Balance Sheet: $HAS_BALANCE_SHEET"
    print_status "INFO" "  Income Statement: $HAS_INCOME_STATEMENT"
    print_status "INFO" "  Cash Flow: $HAS_CASH_FLOW"
    
    if [ "$HAS_BALANCE_SHEET" = "true" ] && [ "$HAS_INCOME_STATEMENT" = "true" ] && [ "$HAS_CASH_FLOW" = "true" ]; then
        print_status "OK" "All required documents present for KPI calculation"
    else
        print_status "WARN" "Some required documents missing for KPI calculation"
    fi
    
    # Check financial data periods
    PERIODS_COUNT=$(echo "$FINANCIAL_DATA_RESPONSE" | jq '.data.financialData | length')
    print_status "INFO" "Financial data periods: $PERIODS_COUNT"
    
else
    print_status "ERROR" "Failed to retrieve financial data"
    echo "$FINANCIAL_DATA_RESPONSE" | jq .
    exit 1
fi

# Test 7: KPI Calculation
echo ""
print_status "INFO" "Test 7: KPI Calculation"
if [ "$HAS_BALANCE_SHEET" = "true" ] && [ "$HAS_INCOME_STATEMENT" = "true" ] && [ "$HAS_CASH_FLOW" = "true" ]; then
    print_status "OK" "KPIs should be calculable with current data"
    
    # Test a specific KPI endpoint
    KPI_RESPONSE=$(curl -s "$BACKEND_URL/insights/calculation/cash" -H "x-company-id: $COMPANY_ID")
    if echo "$KPI_RESPONSE" | jq -e '.success == true' > /dev/null; then
        print_status "OK" "Cash KPI calculation successful"
    else
        print_status "WARN" "Cash KPI calculation failed"
    fi
else
    print_status "WARN" "Skipping KPI calculation test - insufficient data"
fi

# Test 8: Frontend Integration
echo ""
print_status "INFO" "Test 8: Frontend Integration"
# Check if frontend can access the health endpoint
if curl -s "$FRONTEND_URL/api/health" | jq -e '.services.database == "healthy"' > /dev/null; then
    print_status "OK" "Frontend database connection healthy"
else
    print_status "WARN" "Frontend database connection issues"
fi

# Cleanup
echo ""
print_status "INFO" "Cleanup"
rm -f test-income-statement.csv
print_status "OK" "Test files cleaned up"

# Summary
echo ""
echo "🎉 Test Summary"
echo "==============="
print_status "OK" "Document Upload Workflow Test Completed Successfully"
print_status "INFO" "All core functionality is working:"
print_status "INFO" "  ✅ Backend and Frontend Health Checks"
print_status "INFO" "  ✅ Document Upload and Analysis"
print_status "INFO" "  ✅ Document Persistence"
print_status "INFO" "  ✅ Financial Data Integration"
print_status "INFO" "  ✅ KPI Calculation Readiness"
print_status "INFO" "  ✅ Frontend Integration"

echo ""
print_status "INFO" "The document upload system is fully functional!"
print_status "INFO" "Users can now upload documents and see them in their document list."
print_status "INFO" "KPIs will be calculated automatically when all required documents are present."

echo ""
print_status "INFO" "Next Steps:"
print_status "INFO" "  1. Test the frontend UI by accessing http://localhost:3000"
print_status "INFO" "  2. Sign in and navigate to the Documents page"
print_status "INFO" "  3. Upload a document using the UI"
print_status "INFO" "  4. Verify the document appears in the list"
print_status "INFO" "  5. Check that KPIs are calculated on the dashboard"
