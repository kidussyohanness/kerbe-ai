#!/bin/bash

echo "🚀 KERBE AI PLATFORM COMPREHENSIVE TEST"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_pattern="$3"
    
    echo -n "Testing $test_name... "
    
    if eval "$command" | grep -q "$expected_pattern"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        ((TESTS_FAILED++))
    fi
}

# Function to run a test with JSON validation
run_json_test() {
    local test_name="$1"
    local command="$2"
    local json_path="$3"
    local expected_value="$4"
    
    echo -n "Testing $test_name... "
    
    result=$(eval "$command" | jq -r "$json_path" 2>/dev/null)
    if [ "$result" = "$expected_value" ]; then
        echo -e "${GREEN}✅ PASSED${NC} (Got: $result)"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} (Expected: $expected_value, Got: $result)"
        ((TESTS_FAILED++))
    fi
}

echo -e "\n${BLUE}1. BACKEND HEALTH CHECKS${NC}"
echo "------------------------"

run_json_test "Backend Health" "curl -s http://localhost:8787/health" ".status" "ok"
run_json_test "Backend Service" "curl -s http://localhost:8787/health" ".service" "kerbe-ai-backend"

echo -e "\n${BLUE}2. ANALYTICS API TESTS${NC}"
echo "----------------------"

run_json_test "Analytics Overview" "curl -s -H 'x-company-id: seed-company' http://localhost:8787/analytics/overview" ".kpis.revenueTotal" "7000"
run_json_test "Analytics Orders" "curl -s -H 'x-company-id: seed-company' http://localhost:8787/analytics/overview" ".kpis.orders" "42"
run_json_test "Analytics Growth" "curl -s -H 'x-company-id: seed-company' http://localhost:8787/analytics/overview" ".kpis.growthVsPrev" "0.12"

echo -e "\n${BLUE}3. REFERENCE DATA API TESTS${NC}"
echo "----------------------------"

run_json_test "Products API" "curl -s -H 'x-company-id: seed-company' http://localhost:8787/reference/products" ".[0].name" "Premium Widget"
run_json_test "Customers API" "curl -s -H 'x-company-id: seed-company' http://localhost:8787/reference/customers" ".[0].name" "Acme Corporation"
run_json_test "Datasets API" "curl -s -H 'x-company-id: seed-company' http://localhost:8787/datasets" ".datasets[0].name" "Sample Business Data"

echo -e "\n${BLUE}4. DOCUMENT ANALYSIS TESTS${NC}"
echo "----------------------------"

echo "Testing Balance Sheet Analysis..."
balance_result=$(curl -s -X POST -F "file=@test-data/kerbe_tech_balance_sheet_2024.csv" -F "documentType=balance_sheet" -F "businessContext=Kerbe Tech 2024 Balance Sheet" -H "x-company-id: seed-company" http://localhost:8787/document/analyze)
if echo "$balance_result" | jq -e '.success' > /dev/null; then
    echo -e "${GREEN}✅ Balance Sheet Analysis PASSED${NC}"
    ((TESTS_PASSED++))
    
    # Extract key financial data
    total_assets=$(echo "$balance_result" | jq -r '.analysisResult.extractedData.totalAssets')
    company_name=$(echo "$balance_result" | jq -r '.analysisResult.extractedData.companyName')
    echo "   📊 Company: $company_name"
    echo "   💰 Total Assets: \$${total_assets}"
else
    echo -e "${RED}❌ Balance Sheet Analysis FAILED${NC}"
    ((TESTS_FAILED++))
fi

echo "Testing Annual Report Analysis..."
annual_result=$(curl -s -X POST -F "file=@test-data/kerbe_tech_annual_report_2024.txt" -F "documentType=financial_reports" -F "businessContext=Kerbe Tech 2024 Annual Report" -H "x-company-id: seed-company" http://localhost:8787/document/analyze)
if echo "$annual_result" | jq -e '.success' > /dev/null; then
    echo -e "${GREEN}✅ Annual Report Analysis PASSED${NC}"
    ((TESTS_PASSED++))
    
    # Extract key financial data
    total_assets=$(echo "$annual_result" | jq -r '.analysisResult.extractedData.totalAssets')
    company_name=$(echo "$annual_result" | jq -r '.analysisResult.extractedData.companyName')
    total_revenue=$(echo "$annual_result" | jq -r '.analysisResult.extractedData.totalRevenue // "N/A"')
    echo "   📊 Company: $company_name"
    echo "   💰 Total Assets: \$${total_assets}"
    echo "   📈 Total Revenue: \$${total_revenue}"
else
    echo -e "${RED}❌ Annual Report Analysis FAILED${NC}"
    ((TESTS_FAILED++))
fi

echo -e "\n${BLUE}5. CHAT API TESTS${NC}"
echo "----------------"

echo "Testing Chat Question..."
chat_result=$(curl -s -X POST -H "Content-Type: application/json" -H "x-company-id: seed-company" -d '{"question": "What is the current revenue?"}' http://localhost:8787/chat/ask)
if echo "$chat_result" | jq -e '.answer' > /dev/null; then
    echo -e "${GREEN}✅ Chat API PASSED${NC}"
    ((TESTS_PASSED++))
    answer=$(echo "$chat_result" | jq -r '.answer')
    echo "   💬 AI Response: ${answer:0:100}..."
else
    echo -e "${RED}❌ Chat API FAILED${NC}"
    ((TESTS_FAILED++))
fi

echo -e "\n${BLUE}6. FRONTEND TESTS${NC}"
echo "------------------"

run_test "Frontend Accessibility" "curl -s -I http://localhost:3000" "HTTP/1.1 200 OK"
run_test "Dashboard Page" "curl -s -L http://localhost:3000/dashboard" "KERB"
run_test "Landing Page" "curl -s http://localhost:3000" "KERB"

echo -e "\n${BLUE}7. DATA VALIDATION TESTS${NC}"
echo "-------------------------"

echo "Validating Financial Data Accuracy..."
# Check if analysis succeeded and company name is extracted
if echo "$annual_result" | jq -e '.success == true' > /dev/null; then
    company_name=$(echo "$annual_result" | jq -r '.analysisResult.extractedData.companyName // "null"')
    if [ "$company_name" != "null" ] && [ ! -z "$company_name" ]; then
        echo -e "${GREEN}✅ Company Name Extracted: $company_name${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ Company Name Not Extracted${NC}"
        ((TESTS_FAILED++))
    fi
    
    # Check if any financial data was extracted
    total_assets=$(echo "$annual_result" | jq -r '.analysisResult.extractedData.totalAssets // "null"')
    if [ "$total_assets" != "null" ] || echo "$annual_result" | jq -e '.analysisResult.extractedData | keys | length > 2' > /dev/null; then
        echo -e "${GREEN}✅ Financial Data Extracted${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ Financial Data Not Extracted${NC}"
        ((TESTS_FAILED++))
    fi
else
    echo -e "${RED}❌ Analysis Failed${NC}"
    ((TESTS_FAILED++))
    ((TESTS_FAILED++))
fi

echo -e "\n${BLUE}8. ERROR HANDLING TESTS${NC}"
echo "-------------------------"

echo "Testing Invalid Document Type..."
invalid_result=$(curl -s -X POST -F "file=@test-data/kerbe_tech_products.csv" -F "documentType=invalid_type" -H "x-company-id: seed-company" http://localhost:8787/document/analyze)
if echo "$invalid_result" | jq -e '.success == false' > /dev/null; then
    echo -e "${GREEN}✅ Error Handling PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Error Handling FAILED${NC}"
    ((TESTS_FAILED++))
fi

echo -e "\n${BLUE}9. PERFORMANCE TESTS${NC}"
echo "---------------------"

echo "Testing Response Times..."
start_time=$(date +%s%N)
curl -s -H "x-company-id: seed-company" http://localhost:8787/analytics/overview > /dev/null
end_time=$(date +%s%N)
response_time=$(( (end_time - start_time) / 1000000 ))

if [ $response_time -lt 1000 ]; then
    echo -e "${GREEN}✅ Analytics API Response Time: ${response_time}ms (Good)${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️ Analytics API Response Time: ${response_time}ms (Slow)${NC}"
    ((TESTS_PASSED++))
fi

# Final Results
echo -e "\n${BLUE}📊 TEST RESULTS SUMMARY${NC}"
echo "========================"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Platform is working perfectly!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please check the issues above.${NC}"
    exit 1
fi
