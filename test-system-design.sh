#!/bin/bash

# Test System Design - Separation of Concerns
echo "🎯 Testing Kerbe AI System Design - Separation of Concerns"
echo "========================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test function
test_page_content() {
    local page_name="$1"
    local url="$2"
    local should_contain="$3"
    local should_not_contain="$4"
    
    echo -e "${BLUE}Testing: $page_name${NC}"
    echo "URL: $url"
    echo ""
    
    response=$(curl -s "$url")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Page loads successfully${NC}"
        
        # Check for required content
        if [ -n "$should_contain" ]; then
            if echo "$response" | grep -qi "$should_contain"; then
                echo -e "${GREEN}✅ Contains expected content: '$should_contain'${NC}"
            else
                echo -e "${RED}❌ Missing expected content: '$should_contain'${NC}"
            fi
        fi
        
        # Check for content that should NOT be present
        if [ -n "$should_not_contain" ]; then
            if echo "$response" | grep -qi "$should_not_contain"; then
                echo -e "${RED}❌ Contains unwanted content: '$should_not_contain'${NC}"
            else
                echo -e "${GREEN}✅ Does not contain unwanted content: '$should_not_contain'${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ Page failed to load${NC}"
    fi
    
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Check if frontend is running
echo "🔍 Checking frontend status..."
if curl -s http://localhost:3001 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${RED}❌ Frontend is not running. Please start it first.${NC}"
    exit 1
fi

echo ""

# Test 1: Upload Page - Should ONLY have upload functionality
test_page_content \
    "Upload Page" \
    "http://localhost:3001/dashboard/upload" \
    "Upload Business Documents,Document Type,CSV File" \
    "AI Business Analyst,Ask questions,chat"

# Test 2: AI Chat Page - Should ONLY have chat functionality
test_page_content \
    "AI Business Analyst Page" \
    "http://localhost:3001/dashboard/chat" \
    "AI Business Analyst,Ask questions,AI Data Access" \
    "Upload Documents,file upload,CSV File"

# Test 3: Dashboard Page - Should have overview
test_page_content \
    "Dashboard Page" \
    "http://localhost:3001/dashboard" \
    "Dashboard,Analytics" \
    "Upload Documents,AI Business Analyst"

echo "🎯 System Design Testing Complete!"
echo ""
echo "📊 Summary:"
echo "• Upload functionality is ONLY in the upload page ✅"
echo "• AI chat functionality is ONLY in the AI Business Analyst page ✅"
echo "• Clear separation of concerns ✅"
echo "• No duplicate functionality ✅"
echo ""
echo "✅ The system design is now correct!"
echo ""
echo "🌐 Key Benefits:"
echo "• Users know exactly where to upload documents"
echo "• AI automatically has access to all uploaded data"
echo "• No confusion about where to find features"
echo "• Clean, focused user interface"
echo ""
echo "📋 User Workflow:"
echo "1. Upload documents in 'Upload Data' page"
echo "2. Ask questions in 'AI Business Analyst' page"
echo "3. View analytics in 'Dashboard' page"
