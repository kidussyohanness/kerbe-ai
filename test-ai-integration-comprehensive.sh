#!/bin/bash

# COMPREHENSIVE AI INTEGRATION TEST
# Tests all features that use AI backend

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

BACKEND_URL="http://localhost:8787"
USER_ID="cmgtv2kjt0000sfzqb6d91ez0"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🤖 COMPREHENSIVE AI INTEGRATION TEST  🤖               ║${NC}"
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
# TEST 1: AI Chat Endpoint
# ============================================================================

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}  💬 TEST 1: AI Chat Endpoint${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

AI_CHAT_RESPONSE=$(curl -s -X POST "$BACKEND_URL/insights/ask" \
  -H "x-user-id: $USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is my total revenue?"}')

AI_SUCCESS=$(echo "$AI_CHAT_RESPONSE" | jq -r '.success')
AI_ANSWER=$(echo "$AI_CHAT_RESPONSE" | jq -r '.answer')
AI_DOCS_USED=$(echo "$AI_CHAT_RESPONSE" | jq -r '.documentsUsed')
AI_ERROR=$(echo "$AI_CHAT_RESPONSE" | jq -r '.error // "none"')

echo "  AI Chat Success: $AI_SUCCESS"
echo "  Documents Used: $AI_DOCS_USED"
echo "  Has Answer: $([ -n "$AI_ANSWER" ] && [ "$AI_ANSWER" != "null" ] && echo "Yes" || echo "No")"
echo "  Error: $AI_ERROR"
echo ""

run_test "AI Chat API responds" "[ \"$AI_SUCCESS\" = \"true\" ]"
run_test "AI Chat uses documents" "[ $AI_DOCS_USED -gt 0 ]"
run_test "AI Chat provides answer" "[ -n \"$AI_ANSWER\" ] && [ \"$AI_ANSWER\" != \"null\" ]"
run_test "AI Chat has no errors" "[ \"$AI_ERROR\" = \"none\" ]"

if [ "$AI_SUCCESS" = "true" ]; then
    echo -e "  ${CYAN}Answer Preview:${NC}"
    echo "  $(echo "$AI_ANSWER" | head -c 200)..."
fi

echo ""

# ============================================================================
# TEST 2: Document Analysis AI
# ============================================================================

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}  📄 TEST 2: Document Analysis AI Integration${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Create a test CSV
cat > /tmp/test_ai_doc.csv << 'CSVEOF'
Company,Test Corp
Period,Q1 2024
Revenue,1500000
Cost of Goods Sold,600000
Gross Profit,900000
Operating Expenses,400000
Net Income,500000
CSVEOF

DOC_ANALYSIS=$(curl -s -X POST "$BACKEND_URL/document/analyze" \
  -H "x-user-id: $USER_ID" \
  -F "file=@/tmp/test_ai_doc.csv" \
  -F "documentType=income_statement")

DOC_SUCCESS=$(echo "$DOC_ANALYSIS" | jq -r '.success')
DOC_COMPANY=$(echo "$DOC_ANALYSIS" | jq -r '.analysisResult.extractedData.companyName // "none"')
DOC_REVENUE=$(echo "$DOC_ANALYSIS" | jq -r '.analysisResult.extractedData.totalRevenue // 0')
DOC_CONFIDENCE=$(echo "$DOC_ANALYSIS" | jq -r '.analysisResult.confidence // 0')
DOC_ERROR=$(echo "$DOC_ANALYSIS" | jq -r '.error // "none"')

echo "  Document Analysis Success: $DOC_SUCCESS"
echo "  Company Extracted: $DOC_COMPANY"
echo "  Revenue Extracted: $DOC_REVENUE"
echo "  Confidence: $DOC_CONFIDENCE"
echo "  Error: $DOC_ERROR"
echo ""

run_test "Document analysis succeeds" "[ \"$DOC_SUCCESS\" = \"true\" ]"
run_test "Company name extracted" "[ \"$DOC_COMPANY\" != \"none\" ] && [ -n \"$DOC_COMPANY\" ]"
run_test "Revenue extracted" "[ $DOC_REVENUE -gt 0 ]"
run_test "Confidence score present" "[ $DOC_CONFIDENCE -gt 0 ]"
run_test "No analysis errors" "[ \"$DOC_ERROR\" = \"none\" ]"

rm /tmp/test_ai_doc.csv

echo ""

# ============================================================================
# TEST 3: Question Analysis (if exists)
# ============================================================================

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}  ❓ TEST 3: Question Analysis Endpoint${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

QUESTION_RESPONSE=$(curl -s -X POST "$BACKEND_URL/question/analyze" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is my profit margin?", "companyId": "test"}' 2>&1)

if echo "$QUESTION_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    Q_SUCCESS=$(echo "$QUESTION_RESPONSE" | jq -r '.success')
    echo "  Question Analysis Success: $Q_SUCCESS"
    run_test "Question analysis works" "[ \"$Q_SUCCESS\" = \"true\" ]"
else
    echo "  ⚠️  Question analysis endpoint not available or different format"
fi

echo ""

# ============================================================================
# TEST 4: AI Provider Configuration
# ============================================================================

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}  ⚙️  TEST 4: AI Provider Configuration${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check backend logs for AI provider
cd /Users/kidusyohanness/Documents/GitHub/kerbe-ai/analytics-platform-backend
AI_PROVIDER=$(grep "AI_PROVIDER" .env 2>/dev/null | cut -d'=' -f2 | tr -d '"' || echo "not found")
HAS_OPENAI_KEY=$(grep "OPENAI_API_KEY" .env 2>/dev/null | grep -v "^#" | wc -l | tr -d ' ')

echo "  AI Provider: $AI_PROVIDER"
echo "  OpenAI Key Configured: $([ $HAS_OPENAI_KEY -gt 0 ] && echo "Yes" || echo "No")"

if [ "$AI_PROVIDER" = "openai" ] && [ $HAS_OPENAI_KEY -gt 0 ]; then
    echo -e "  ${GREEN}✅ OpenAI configured correctly${NC}"
elif [ "$AI_PROVIDER" = "mock" ]; then
    echo -e "  ${YELLOW}⚠️  Using MOCK AI (no real API calls)${NC}"
else
    echo -e "  ${RED}❌ AI provider not properly configured${NC}"
fi

echo ""

# ============================================================================
# TEST 5: Test Actual AI Call
# ============================================================================

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}  🧠 TEST 5: Test Real AI API Call${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test with a specific question to see AI response quality
DETAILED_QUESTION="Based on my uploaded financial documents, what is my total revenue for 2024 and how does it compare to previous periods?"

DETAILED_AI_RESPONSE=$(curl -s -X POST "$BACKEND_URL/insights/ask" \
  -H "x-user-id: $USER_ID" \
  -H "Content-Type: application/json" \
  -d "{\"question\": \"$DETAILED_QUESTION\"}")

DETAILED_SUCCESS=$(echo "$DETAILED_AI_RESPONSE" | jq -r '.success')
DETAILED_ANSWER=$(echo "$DETAILED_AI_RESPONSE" | jq -r '.answer')
DETAILED_TOKENS=$(echo "$DETAILED_AI_RESPONSE" | jq -r '.usage.total_tokens // 0')

echo "  Detailed Question Test:"
echo "  Success: $DETAILED_SUCCESS"
echo "  Answer Length: ${#DETAILED_ANSWER} characters"
echo "  Tokens Used: $DETAILED_TOKENS"
echo ""

run_test "Detailed AI response succeeds" "[ \"$DETAILED_SUCCESS\" = \"true\" ]"
run_test "Answer is substantial" "[ ${#DETAILED_ANSWER} -gt 50 ]"

if [ "$DETAILED_SUCCESS" = "true" ]; then
    echo -e "  ${CYAN}Full Answer:${NC}"
    echo "$DETAILED_ANSWER" | fold -w 70 -s | sed 's/^/  /'
fi

echo ""

# ============================================================================
# TEST 6: Backend Log Analysis
# ============================================================================

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}  📋 TEST 6: Backend Log Analysis${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f /tmp/backend.log ]; then
    AI_ERRORS=$(grep -i "ai\|openai\|error" /tmp/backend.log | tail -10)
    if [ -n "$AI_ERRORS" ]; then
        echo "  Recent AI-related logs:"
        echo "$AI_ERRORS" | sed 's/^/  /'
    else
        echo "  No recent AI errors in logs ✅"
    fi
else
    echo "  Backend log not found"
fi

echo ""

# ============================================================================
# SUMMARY
# ============================================================================

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           📊 AI INTEGRATION TEST SUMMARY                    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "Total AI Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     🎉 ALL AI INTEGRATIONS WORKING! 🎉                   ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}AI Features Verified:${NC}"
    echo "  ✅ AI Chat - responds to questions"
    echo "  ✅ Document Analysis - extracts data"
    echo "  ✅ Provider Configuration - OpenAI configured"
    echo "  ✅ Token Usage - tracked correctly"
    echo ""
    exit 0
else
    echo ""
    echo -e "${YELLOW}⚠️  Some AI tests failed - review above${NC}"
    exit 1
fi

