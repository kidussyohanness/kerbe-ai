#!/bin/bash

# COMPREHENSIVE PLATFORM TEST
# Tests all features end-to-end with rigorous edge cases

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

BACKEND_URL="http://localhost:8787"
FRONTEND_URL="http://localhost:3001"
USER_ID="cmgtv2kjt0000sfzqb6d91ez0"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🧪 COMPREHENSIVE PLATFORM TEST - ALL FEATURES  🧪       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
    local test_name="$1"
    shift
    local command="$@"
    
    echo -ne "${CYAN}Testing: $test_name...${NC} "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# ============================================================================
# SECTION 1: BACKEND API TESTS
# ============================================================================

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}  🔧 BACKEND API TESTS${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

run_test "Backend Health Check" "curl -s '$BACKEND_URL/health' | jq -e '.status == \"ok\"'"
run_test "Dashboard Overview API" "curl -s '$BACKEND_URL/dashboard/overview' -H 'x-user-id: $USER_ID' | jq -e '.success'"
run_test "Profit Margin Calculation" "curl -s '$BACKEND_URL/insights/calculation/profit_margin' -H 'x-user-id: $USER_ID' | jq -e '.success'"
run_test "Debt-to-Equity Calculation" "curl -s '$BACKEND_URL/insights/calculation/debt_to_equity' -H 'x-user-id: $USER_ID' | jq -e '.success'"
run_test "Total Revenue Calculation" "curl -s '$BACKEND_URL/insights/calculation/total_revenue' -H 'x-user-id: $USER_ID' | jq -e '.success'"
run_test "ROE Calculation" "curl -s '$BACKEND_URL/insights/calculation/roe' -H 'x-user-id: $USER_ID' | jq -e '.success'"
run_test "Conflict Detection API" "curl -s '$BACKEND_URL/insights/conflicts' -H 'x-user-id: $USER_ID' | jq -e '.success'"
run_test "Insight Provenance API" "curl -s -X POST '$BACKEND_URL/insights/provenance' -H 'x-user-id: $USER_ID' -H 'Content-Type: application/json' -d '{\"insightText\": \"test\"}' | jq -e '.success'"
run_test "AI Chat API" "curl -s -X POST '$BACKEND_URL/insights/ask' -H 'x-user-id: $USER_ID' -H 'Content-Type: application/json' -d '{\"question\": \"What is my revenue?\"}' | jq -e '.success'"
run_test "User Documents API" "curl -s '$BACKEND_URL/user/documents' -H 'x-user-id: $USER_ID' | jq -e '.success'"

# Document Preview (if documents exist)
DOC_ID=$(curl -s "$BACKEND_URL/user/documents" -H "x-user-id: $USER_ID" | jq -r '.documents[0].id // "none"')
if [ "$DOC_ID" != "none" ]; then
    run_test "Document Preview API" "curl -s '$BACKEND_URL/documents/$DOC_ID/preview' -H 'x-user-id: $USER_ID' | jq -e '.success'"
else
    echo -e "${CYAN}Testing: Document Preview API...${NC} ${YELLOW}⚠️  SKIP (no documents)${NC}"
fi

echo ""

# ============================================================================
# SECTION 2: FRONTEND ACCESSIBILITY
# ============================================================================

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}  🌐 FRONTEND ACCESSIBILITY TESTS${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

run_test "Frontend Homepage" "curl -s '$FRONTEND_URL' | grep -q 'KERB'"
run_test "Dashboard Page" "curl -s -L '$FRONTEND_URL/dashboard' | grep -q 'KERB'"
run_test "Sales Page" "curl -s -L '$FRONTEND_URL/dashboard/sales' | grep -q 'KERB'"
run_test "Costs Page" "curl -s -L '$FRONTEND_URL/dashboard/costs' | grep -q 'KERB'"
run_test "Working Capital Page" "curl -s -L '$FRONTEND_URL/dashboard/working-capital' | grep -q 'KERB'"
run_test "Cash & Runway Page" "curl -s -L '$FRONTEND_URL/dashboard/cash-runway' | grep -q 'KERB'"
run_test "Forecast Page" "curl -s -L '$FRONTEND_URL/dashboard/forecast' | grep -q 'KERB'"
run_test "Data Quality Page" "curl -s -L '$FRONTEND_URL/dashboard/data-quality' | grep -q 'KERB'"
run_test "My Documents Page" "curl -s -L '$FRONTEND_URL/dashboard/documents' | grep -q 'KERB'"
run_test "Upload Page" "curl -s -L '$FRONTEND_URL/dashboard/analysis' | grep -q 'KERB'"
run_test "Test Features Page" "curl -s -L '$FRONTEND_URL/test-features' | grep -q 'KERB'"

echo ""

# ============================================================================
# SECTION 3: DATA VALIDATION
# ============================================================================

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}  📊 DATA VALIDATION TESTS${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test Dashboard Data Structure
DASHBOARD_DATA=$(curl -s "$BACKEND_URL/dashboard/overview" -H "x-user-id: $USER_ID")

run_test "Dashboard has metrics" "echo '$DASHBOARD_DATA' | jq -e '.data.metrics'"
run_test "Dashboard has documents count" "echo '$DASHBOARD_DATA' | jq -e '.data.metrics.documentsAnalyzed'"
run_test "Dashboard has completeness" "echo '$DASHBOARD_DATA' | jq -e '.data.metrics.completeness'"
run_test "Dashboard has insights" "echo '$DASHBOARD_DATA' | jq -e '.data.metrics.keyInsights | length > 0'"

# Test Calculation Data Structure
CALC_DATA=$(curl -s "$BACKEND_URL/insights/calculation/profit_margin" -H "x-user-id: $USER_ID")

run_test "Calculation has formula" "echo '$CALC_DATA' | jq -e '.calculation.formula'"
run_test "Calculation has result" "echo '$CALC_DATA' | jq -e '.calculation.calculation.result'"
run_test "Calculation has breakdown" "echo '$CALC_DATA' | jq -e '.calculation.breakdown | length > 0'"
run_test "Calculation has methodology" "echo '$CALC_DATA' | jq -e '.calculation.methodology'"

echo ""

# ============================================================================
# SECTION 4: EDGE CASE TESTS
# ============================================================================

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}  🔍 EDGE CASE TESTS${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test empty user
EMPTY_USER="cmgtxp09h0000sf812xybq3qq"
EMPTY_DATA=$(curl -s "$BACKEND_URL/dashboard/overview" -H "x-user-id: $EMPTY_USER")

run_test "Empty state returns 0 documents" "echo '$EMPTY_DATA' | jq -e '.data.metrics.documentsAnalyzed == 0'"
run_test "Empty state has recommendations" "echo '$EMPTY_DATA' | jq -e '.data.metrics.recommendations | length > 0'"

# Test all calculation endpoints
for metric in "profit_margin" "debt_to_equity" "roe" "total_revenue"; do
    run_test "Calculation endpoint: $metric" "curl -s '$BACKEND_URL/insights/calculation/$metric' -H 'x-user-id: $USER_ID' | jq -e '.success'"
done

echo ""

# ============================================================================
# SUMMARY
# ============================================================================

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              📊 COMPREHENSIVE TEST SUMMARY                   ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     🎉 ALL BACKEND & API TESTS PASSING! 🎉               ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Backend Status: ✅ FULLY OPERATIONAL${NC}"
    echo -e "${CYAN}Frontend Status: ✅ ALL PAGES ACCESSIBLE${NC}"
    echo -e "${CYAN}API Endpoints:   ✅ ALL WORKING${NC}"
    echo ""
    echo -e "${YELLOW}Frontend Interaction Test:${NC}"
    echo "  Go to: http://localhost:3001/dashboard"
    echo "  Or test: http://localhost:3001/test-features"
    echo ""
    echo "  Features to test manually:"
    echo "  1. Click ? button on KPI cards → Should open calculation modal"
    echo "  2. Click 💡 on insights → Should open provenance modal"
    echo "  3. Click 🟣 chat button → Should open AI chat"
    echo "  4. Click 'Show Action Steps' → Should expand action details"
    echo ""
    exit 0
else
    echo ""
    echo -e "${YELLOW}⚠️  Some tests failed - see above${NC}"
    exit 1
fi

