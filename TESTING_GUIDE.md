# 🧪 Complete Testing Guide

## Quick Start Testing

### 1. Start Services
```bash
# Terminal 1 - Backend
cd analytics-platform-backend
node simple-mock.js

# Terminal 2 - Frontend
cd analytics-platform-frontend
npm run dev
```

### 2. Test in Browser
- Open `http://localhost:3000` (or 3001)
- Navigate to Dashboard → Upload
- Upload a test document
- Watch loading progress
- Verify auto-redirect

## Automated Testing Scripts

### Available Test Scripts:

#### **Core Functionality Tests:**
- `./test-loading-functionality.sh` - Tests loading progress and auto-redirect
- `./test-complete-system.sh` - End-to-end system testing
- `./test-document-analysis.sh` - AI document analysis testing
- `./test-dynamic-dashboard.sh` - Dashboard functionality testing

#### **Document Format Tests:**
- `./test-multi-format-documents.sh` - Tests PDF, DOC, XLSX, CSV, TXT
- `./test-real-balance-sheets.sh` - Tests with real company data
- `./test-business-documents.sh` - Tests various business document types

#### **Feature-Specific Tests:**
- `./test-file-management.sh` - Document management system
- `./test-unified-ai-workflow.sh` - Complete AI workflow
- `./test-conversational-ai.sh` - Chat functionality

### Running Tests:

#### **Quick Test (Recommended):**
```bash
./test-loading-functionality.sh
```

#### **Comprehensive Test:**
```bash
./test-complete-system.sh
```

#### **All Tests:**
```bash
# Run all test scripts
for script in test-*.sh; do
  echo "Running $script..."
  ./$script
  echo ""
done
```

## Test Data Available

### Real Company Data:
- `test-data/apple_balance_sheet_2024.csv` - Apple Inc. balance sheet
- `test-data/microsoft_income_statement_2024.txt` - Microsoft income statement
- `test-data/tesla_cash_flow_2024.txt` - Tesla cash flow statement

### Sample Business Data:
- `test-data/sample_balance_sheet.csv` - Sample balance sheet
- `test-data/sample_income_statement.csv` - Sample income statement
- `test-data/sample_cash_flow.csv` - Sample cash flow
- `test-data/sample_*.csv` - Various business document samples

## Testing Checklist

### ✅ Basic Functionality:
- [ ] Services start without errors
- [ ] Frontend loads on correct port
- [ ] Backend API responds to health checks
- [ ] Navigation works between pages
- [ ] Upload form displays correctly

### ✅ Document Upload:
- [ ] File selection works
- [ ] Document type selection works
- [ ] Business context input works
- [ ] Upload button triggers analysis
- [ ] Loading progress displays correctly
- [ ] Auto-redirect to dashboard works

### ✅ AI Analysis:
- [ ] Document analysis completes successfully
- [ ] Financial data extracted correctly
- [ ] Company name identified
- [ ] Confidence score calculated
- [ ] Recommendations generated
- [ ] Risk factors identified

### ✅ Dashboard Display:
- [ ] AI insights section displays
- [ ] Extracted data shows correctly
- [ ] Charts and KPIs render
- [ ] Data updates after new uploads
- [ ] Error handling works

### ✅ Multi-Format Support:
- [ ] CSV files work
- [ ] TXT files work
- [ ] PDF files work (if supported)
- [ ] DOC/DOCX files work (if supported)
- [ ] XLSX files work (if supported)

## Troubleshooting

### Common Issues:

#### **Services Not Starting:**
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :8787

# Kill existing processes
pkill -f "node simple-mock.js"
pkill -f "npm run dev"
```

#### **Frontend Not Loading:**
```bash
# Check which port frontend is on
curl -s http://localhost:3000 > /dev/null && echo "Port 3000" || echo "Not on 3000"
curl -s http://localhost:3001 > /dev/null && echo "Port 3001" || echo "Not on 3001"
```

#### **Backend API Errors:**
```bash
# Test backend health
curl http://localhost:8787/health

# Test document analysis
curl -X POST "http://localhost:8787/document/analyze" \
  -F "file=@test-data/sample_balance_sheet.csv" \
  -F "documentType=balance_sheet"
```

#### **Upload Issues:**
- Check file size (max 10MB)
- Check file format (PDF, DOC, DOCX, XLSX, CSV, TXT)
- Check browser console for errors
- Verify backend is running

## Performance Testing

### Load Testing:
```bash
# Test multiple uploads
for i in {1..5}; do
  curl -X POST "http://localhost:8787/document/analyze" \
    -F "file=@test-data/sample_balance_sheet.csv" \
    -F "documentType=balance_sheet" &
done
wait
```

### Memory Testing:
```bash
# Monitor memory usage
top -pid $(pgrep -f "node simple-mock.js")
```

## Production Testing

### Before Deployment:
1. Run all test scripts
2. Test with real business documents
3. Verify all features work
4. Check error handling
5. Test loading performance
6. Verify data accuracy

### Post-Deployment:
1. Test with production data
2. Monitor error logs
3. Check performance metrics
4. Verify user experience
5. Test edge cases

## Test Results Interpretation

### ✅ Success Indicators:
- All services start without errors
- Uploads complete successfully
- Data appears on dashboard
- Loading progress works
- Auto-redirect functions
- No console errors

### ❌ Failure Indicators:
- Services fail to start
- Upload errors
- Missing data on dashboard
- Loading stuck or broken
- Console errors
- API timeouts

## Next Steps

1. **Run Basic Tests** - Start with `./test-loading-functionality.sh`
2. **Test Real Data** - Upload actual business documents
3. **Verify Features** - Check all functionality works
4. **Performance Test** - Test with multiple uploads
5. **Production Ready** - Deploy when all tests pass

---

**Happy Testing! 🚀**
