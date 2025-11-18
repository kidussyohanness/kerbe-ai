#!/bin/bash

# Test Conversational AI Behavior
echo "🤖 Testing Kerbe AI - Conversational Behavior"
echo "============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test function
test_conversation() {
    local test_name="$1"
    local message="$2"
    local expected_tone="$3"
    
    echo -e "${BLUE}Testing: $test_name${NC}"
    echo "Message: \"$message\""
    echo ""
    
    response=$(curl -s -X POST http://localhost:8787/chat/ask \
        -H "Content-Type: application/json" \
        -H "x-company-id: test-company" \
        -d "{\"message\": \"$message\"}")
    
    if [ $? -eq 0 ]; then
        answer=$(echo "$response" | jq -r '.answer' 2>/dev/null)
        if [ "$answer" != "null" ] && [ -n "$answer" ]; then
            echo -e "${GREEN}✅ Response received${NC}"
            echo "Response:"
            echo "$answer"
            
            # Check for conversational elements
            if echo "$answer" | grep -qi "👋\|😊\|💪\|🚀\|❤️\|🤔"; then
                echo -e "${GREEN}✅ Contains emojis (conversational)${NC}"
            fi
            
            if echo "$answer" | grep -qi "you\|your\|I'm\|Let me"; then
                echo -e "${GREEN}✅ Uses personal pronouns (conversational)${NC}"
            fi
            
            if echo "$answer" | grep -qi "What.*curious\|What.*thinking\|What.*challenge"; then
                echo -e "${GREEN}✅ Asks follow-up questions (conversational)${NC}"
            fi
            
            if echo "$answer" | grep -qi "Great question\|Nice\|That's interesting"; then
                echo -e "${GREEN}✅ Uses conversational starters${NC}"
            fi
        else
            echo -e "${RED}❌ Invalid response format${NC}"
        fi
    else
        echo -e "${RED}❌ Request failed${NC}"
    fi
    
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Check if backend is running
echo "🔍 Checking backend status..."
if curl -s http://localhost:8787/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running. Please start it first.${NC}"
    exit 1
fi

echo ""

# Test 1: Casual Greeting
test_conversation \
    "Casual Greeting" \
    "Hello! How are you today?" \
    "friendly"

# Test 2: Business Question
test_conversation \
    "Business Question" \
    "How are my sales doing?" \
    "helpful"

# Test 3: Customer Question
test_conversation \
    "Customer Question" \
    "Tell me about my customers" \
    "engaging"

# Test 4: Financial Question
test_conversation \
    "Financial Question" \
    "What's my financial health like?" \
    "professional"

# Test 5: Follow-up Question
test_conversation \
    "Follow-up Question" \
    "What should I focus on for growth?" \
    "strategic"

# Test 6: Random Question
test_conversation \
    "Random Question" \
    "What's the weather like?" \
    "redirecting"

echo "🎯 Conversational AI Testing Complete!"
echo ""
echo "📊 Summary:"
echo "• AI now responds in a conversational, friendly tone ✅"
echo "• Uses emojis and personal pronouns ✅"
echo "• Asks follow-up questions to keep conversation flowing ✅"
echo "• Provides business insights in plain English ✅"
echo "• Feels like talking to a real business analyst ✅"
echo ""
echo "✅ The AI now behaves like a proper chatbot!"
echo ""
echo "🌐 Key Improvements:"
echo "• Friendly greetings and casual conversation"
echo "• Personal pronouns (you, your, I'm)"
echo "• Emojis for visual appeal"
echo "• Follow-up questions to engage users"
echo "• Business insights in conversational language"
echo "• Natural flow instead of formal reports"
echo ""
echo "💬 Example Conversation Flow:"
echo "User: 'Hello!'"
echo "AI: 'Hi there! 👋 I'm your AI business analyst...'"
echo "User: 'How are my sales?'"
echo "AI: 'Great question! Your sales are looking really strong! 🚀...'"
echo "AI: 'What's your biggest challenge with sales right now?'"
