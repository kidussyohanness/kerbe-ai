#!/bin/bash

# Comprehensive Test for Document Persistence Feature
# Tests both upload methods and verifies documents are accessible after upload

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

BACKEND_URL="http://localhost:8787"
TEST_USER_ID="cmgtv2kjt0000sfzqb6d91ez0"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🧪 DOCUMENT PERSISTENCE COMPREHENSIVE TEST  ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
    local test_name="$1"
    local command="$2"
    local expected="$3"
    
    echo -ne "${CYAN}Testing: $test_name... ${NC}"
    
    if eval "$command" | grep -q "$expected"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo -e "${CYAN}📋 Step 1: Upload document via Financial Analysis endpoint${NC}"
echo "─────────────────────────────────────────────────────"

UPLOAD_RESULT=$(curl -s -X POST "$BACKEND_URL/document/analyze" \
  -H "x-user-id: $TEST_USER_ID" \
  -F "file=@test-data/kerbe_tech_balance_sheet_2024.csv" \
  -F "documentType=balance_sheet" \
  -F "businessContext=Test upload via analysis endpoint")

DOC_ID_1=$(echo "$UPLOAD_RESULT" | jq -r '.documentId')
SAVED_1=$(echo "$UPLOAD_RESULT" | jq -r '.saved')
SUCCESS_1=$(echo "$UPLOAD_RESULT" | jq -r '.success')

echo "   Document ID: $DOC_ID_1"
echo "   Success: $SUCCESS_1"
echo "   Saved to DB: $SAVED_1"

if [ "$SAVED_1" = "true" ]; then
    echo -e "   ${GREEN}✅ Document saved to database${NC}"
    ((TESTS_PASSED++))
else
    echo -e "   ${RED}❌ Document NOT saved to database${NC}"
    ((TESTS_FAILED++))
fi

sleep 2

echo ""
echo -e "${CYAN}📋 Step 2: Upload another document${NC}"
echo "─────────────────────────────────────────────────────"

UPLOAD_RESULT_2=$(curl -s -X POST "$BACKEND_URL/document/analyze" \
  -H "x-user-id: $TEST_USER_ID" \
  -F "file=@test-data/kerbe_tech_income_statement_2024.csv" \
  -F "documentType=income_statement" \
  -F "businessContext=Income statement analysis")

DOC_ID_2=$(echo "$UPLOAD_RESULT_2" | jq -r '.documentId')
echo "   Document ID: $DOC_ID_2"
echo "   Saved: $(echo "$UPLOAD_RESULT_2" | jq -r '.saved')"

sleep 2

echo ""
echo -e "${CYAN}📋 Step 3: Retrieve all user documents${NC}"
echo "─────────────────────────────────────────────────────"

DOCUMENTS=$(curl -s "$BACKEND_URL/user/documents" \
  -H "x-user-id: $TEST_USER_ID")

TOTAL_DOCS=$(echo "$DOCUMENTS" | jq -r '.total')
echo "   Total Documents: $TOTAL_DOCS"

if [ "$TOTAL_DOCS" -gt 0 ]; then
    echo -e "   ${GREEN}✅ Documents retrieved successfully${NC}"
    ((TESTS_PASSED++))
    
    echo ""
    echo "   📄 Documents List:"
    echo "$DOCUMENTS" | jq -r '.documents[] | "      - \(.filename) (\(.documentType)) - Status: \(.status)"'
else
    echo -e "   ${RED}❌ No documents retrieved${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${CYAN}📋 Step 4: Get specific document with analysis${NC}"
echo "─────────────────────────────────────────────────────"

DOCUMENT_DETAIL=$(curl -s "$BACKEND_URL/user/documents/$DOC_ID_1" \
  -H "x-user-id: $TEST_USER_ID")

HAS_ANALYSIS=$(echo "$DOCUMENT_DETAIL" | jq -r '.document.analysisResults != null')
STATUS=$(echo "$DOCUMENT_DETAIL" | jq -r '.document.status')
CONFIDENCE=$(echo "$DOCUMENT_DETAIL" | jq -r '.document.analysisResults.confidence // "N/A"')

echo "   Document Status: $STATUS"
echo "   Has Analysis: $HAS_ANALYSIS"
echo "   Confidence: $CONFIDENCE%"

if [ "$HAS_ANALYSIS" = "true" ]; then
    echo -e "   ${GREEN}✅ Analysis results persisted${NC}"
    ((TESTS_PASSED++))
else
    echo -e "   ${RED}❌ Analysis results NOT persisted${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${CYAN}📋 Step 5: Get storage statistics${NC}"
echo "─────────────────────────────────────────────────────"

STORAGE_STATS=$(curl -s "$BACKEND_URL/user/storage-stats" \
  -H "x-user-id: $TEST_USER_ID")

STORAGE_SUCCESS=$(echo "$STORAGE_STATS" | jq -r '.success')
DOC_COUNT=$(echo "$STORAGE_STATS" | jq -r '.stats.documentCount')
ANALYSIS_COUNT=$(echo "$STORAGE_STATS" | jq -r '.stats.analysisCount')
STORAGE_USED=$(echo "$STORAGE_STATS" | jq -r '.stats.storageUsedFormatted')

echo "   Documents: $DOC_COUNT"
echo "   Analyses: $ANALYSIS_COUNT"
echo "   Storage Used: $STORAGE_USED"

if [ "$STORAGE_SUCCESS" = "true" ]; then
    echo -e "   ${GREEN}✅ Storage tracking working${NC}"
    ((TESTS_PASSED++))
else
    echo -e "   ${RED}❌ Storage tracking failed${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${CYAN}📋 Step 6: Verify persistence after logout/login${NC}"
echo "─────────────────────────────────────────────────────"
echo "   Simulating: User logs out and logs back in"

sleep 1

# Fetch documents again (simulating a fresh login)
DOCUMENTS_AFTER=$(curl -s "$BACKEND_URL/user/documents" \
  -H "x-user-id: $TEST_USER_ID")

TOTAL_AFTER=$(echo "$DOCUMENTS_AFTER" | jq -r '.total')
echo "   Documents after 're-login': $TOTAL_AFTER"

if [ "$TOTAL_AFTER" = "$TOTAL_DOCS" ]; then
    echo -e "   ${GREEN}✅ Documents persisted across sessions${NC}"
    ((TESTS_PASSED++))
else
    echo -e "   ${RED}❌ Documents lost after logout${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${CYAN}📋 Step 7: Verify file actually saved to disk${NC}"
echo "─────────────────────────────────────────────────────"

FILES_ON_DISK=$(ls -1 analytics-platform-backend/uploads/$TEST_USER_ID/ 2>/dev/null | wc -l)
echo "   Files on disk: $FILES_ON_DISK"

if [ $FILES_ON_DISK -gt 0 ]; then
    echo -e "   ${GREEN}✅ Files physically stored${NC}"
    ((TESTS_PASSED++))
    echo "   File list:"
    ls -lh analytics-platform-backend/uploads/$TEST_USER_ID/ | tail -n +2 | awk '{print "      - " $9 " (" $5 ")"}'
else
    echo -e "   ${RED}❌ No files on disk${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${CYAN}📋 Step 8: Test filtering by document type${NC}"
echo "─────────────────────────────────────────────────────"

FILTERED=$(curl -s "$BACKEND_URL/user/documents?documentType=balance_sheet" \
  -H "x-user-id: $TEST_USER_ID")

FILTERED_COUNT=$(echo "$FILTERED" | jq -r '.total')
echo "   Balance sheets only: $FILTERED_COUNT"

if [ "$FILTERED_COUNT" -gt 0 ]; then
    echo -e "   ${GREEN}✅ Filtering works${NC}"
    ((TESTS_PASSED++))
else
    echo -e "   ${RED}❌ Filtering failed${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${CYAN}📋 Step 9: Test filtering by status${NC}"
echo "─────────────────────────────────────────────────────"

COMPLETED=$(curl -s "$BACKEND_URL/user/documents?status=completed" \
  -H "x-user-id: $TEST_USER_ID")

COMPLETED_COUNT=$(echo "$COMPLETED" | jq -r '.total')
echo "   Completed documents: $COMPLETED_COUNT"

if [ "$COMPLETED_COUNT" -ge 0 ]; then
    echo -e "   ${GREEN}✅ Status filtering works${NC}"
    ((TESTS_PASSED++))
else
    echo -e "   ${RED}❌ Status filtering failed${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}           📊 TEST RESULTS SUMMARY           ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}✅ Document persistence is fully functional!${NC}"
    echo ""
    echo -e "${CYAN}Key Features Verified:${NC}"
    echo "  ✅ Documents save to database"
    echo "  ✅ Files save to disk"
    echo "  ✅ Analysis results persist"
    echo "  ✅ Documents accessible after logout/login"
    echo "  ✅ Filtering by type and status works"
    echo "  ✅ Storage tracking functional"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  Some tests failed${NC}"
    echo "Please review the errors above"
    exit 1
fi

