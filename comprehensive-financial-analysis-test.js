#!/usr/bin/env node

/**
 * Comprehensive Financial Analysis Testing Suite
 * Tests every functionality and edge case of the financial analysis system
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

// Test configuration
const CONFIG = {
  backendUrl: 'http://localhost:8787',
  frontendUrl: 'http://localhost:3000',
  testTimeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
};

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m'
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

function createTestData(type, data = {}) {
  const baseData = {
    companyName: data.companyName || "Test Company Inc.",
    period: data.period || "2024-12-31",
    ...data
  };

  switch (type) {
    case 'balance_sheet':
      return `Account,Amount
Cash and Cash Equivalents,${baseData.cash || 2500000}
Accounts Receivable,${baseData.accountsReceivable || 1800000}
Inventory,${baseData.inventory || 1200000}
Prepaid Expenses,${baseData.prepaidExpenses || 150000}
Total Current Assets,${baseData.currentAssets || 5650000}
Property, Plant & Equipment,${baseData.propertyPlantEquipment || 8500000}
Intangible Assets,${baseData.intangibleAssets || 2000000}
Long-term Investments,${baseData.longTermInvestments || 3300000}
Total Non-Current Assets,${baseData.nonCurrentAssets || 13800000}
TOTAL ASSETS,${baseData.totalAssets || 19450000}
Accounts Payable,${baseData.accountsPayable || 950000}
Short-term Debt,${baseData.shortTermDebt || 1200000}
Accrued Expenses,${baseData.accruedExpenses || 300000}
Total Current Liabilities,${baseData.currentLiabilities || 2450000}
Long-term Debt,${baseData.longTermDebt || 5500000}
Deferred Tax Liabilities,${baseData.deferredTaxLiabilities || 800000}
Total Non-Current Liabilities,${baseData.nonCurrentLiabilities || 6300000}
TOTAL LIABILITIES,${baseData.totalLiabilities || 8750000}
Share Capital,${baseData.shareCapital || 5000000}
Retained Earnings,${baseData.retainedEarnings || 5200000}
Other Comprehensive Income,${baseData.otherComprehensiveIncome || 500000}
TOTAL EQUITY,${baseData.totalEquity || 10700000}`;

    case 'income_statement':
      return `Account,Amount
Total Revenue,${baseData.totalRevenue || 15000000}
Cost of Goods Sold,${baseData.costOfGoodsSold || 8000000}
Gross Profit,${baseData.grossProfit || 7000000}
Operating Expenses,${baseData.operatingExpenses || 4500000}
Operating Income,${baseData.operatingIncome || 2500000}
Interest Expense,${baseData.interestExpense || 300000}
Income Before Tax,${baseData.incomeBeforeTax || 2200000}
Tax Expense,${baseData.taxExpense || 550000}
Net Income,${baseData.netIncome || 1650000}`;

    case 'cash_flow':
      return `Account,Amount
Operating Cash Flow,${baseData.operatingCashFlow || 2800000}
Investing Cash Flow,${baseData.investingCashFlow || -1200000}
Financing Cash Flow,${baseData.financingCashFlow || -500000}
Net Cash Flow,${baseData.netCashFlow || 1100000}
Beginning Cash,${baseData.beginningCash || 1400000}
Ending Cash,${baseData.endingCash || 2500000}`;

    default:
      return `Company,${baseData.companyName}
Period,${baseData.period}
Data,${JSON.stringify(baseData)}`;
  }
}

function createTestFile(filename, content) {
  const filePath = path.join(__dirname, 'test-files', filename);
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  fs.writeFileSync(filePath, content);
  return filePath;
}

function cleanupTestFiles() {
  const testDir = path.join(__dirname, 'test-files');
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}

// HTTP request helper
async function makeRequest(method, url, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          };
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test runner
class TestRunner {
  constructor() {
    this.tests = [];
    this.currentTest = null;
  }

  addTest(name, testFunction) {
    this.tests.push({ name, testFunction });
  }

  async runTest(test) {
    testResults.total++;
    this.currentTest = test;
    
    log(`🧪 Running: ${test.name}`, 'info');
    
    try {
      const startTime = Date.now();
      await test.testFunction();
      const duration = Date.now() - startTime;
      
      testResults.passed++;
      log(`✅ PASSED: ${test.name} (${duration}ms)`, 'success');
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({
        test: test.name,
        error: error.message,
        stack: error.stack
      });
      log(`❌ FAILED: ${test.name} - ${error.message}`, 'error');
    }
  }

  async runAll() {
    log('🚀 Starting Comprehensive Financial Analysis Test Suite', 'info');
    log(`📊 Running ${this.tests.length} tests...`, 'info');
    
    for (const test of this.tests) {
      await this.runTest(test);
    }
    
    this.printResults();
  }

  printResults() {
    log('\n📈 TEST RESULTS SUMMARY', 'info');
    log('='.repeat(50), 'info');
    log(`Total Tests: ${testResults.total}`, 'info');
    log(`Passed: ${testResults.passed}`, 'success');
    log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
    log(`Skipped: ${testResults.skipped}`, 'warning');
    log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 
        testResults.passed === testResults.total ? 'success' : 'warning');
    
    if (testResults.errors.length > 0) {
      log('\n❌ FAILED TESTS:', 'error');
      testResults.errors.forEach(error => {
        log(`  • ${error.test}: ${error.error}`, 'error');
      });
    }
    
    if (testResults.passed === testResults.total) {
      log('\n🎉 ALL TESTS PASSED! The financial analysis system is perfect!', 'success');
    } else {
      log('\n⚠️ Some tests failed. Please review and fix issues.', 'warning');
    }
  }
}

// Test cases
const testRunner = new TestRunner();

// 1. Document Analysis Service Tests
testRunner.addTest('Document Analysis - Balance Sheet CSV', async () => {
  const csvContent = createTestData('balance_sheet');
  const filePath = createTestFile('balance_sheet_test.csv', csvContent);
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('documentType', 'balance_sheet');
  
  const response = await fetch(`${CONFIG.backendUrl}/document/analyze`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(`Analysis failed: ${result.error}`);
  }
  
  if (!result.extractedData || !result.extractedData.companyName) {
    throw new Error('Company name not extracted');
  }
  
  if (!result.extractedData.totalAssets || result.extractedData.totalAssets !== 19450000) {
    throw new Error(`Total assets incorrect: expected 19450000, got ${result.extractedData.totalAssets}`);
  }
  
  if (result.confidence < 80) {
    throw new Error(`Confidence too low: ${result.confidence}%`);
  }
});

testRunner.addTest('Document Analysis - Income Statement CSV', async () => {
  const csvContent = createTestData('income_statement');
  const filePath = createTestFile('income_statement_test.csv', csvContent);
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('documentType', 'income_statement');
  
  const response = await fetch(`${CONFIG.backendUrl}/document/analyze`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(`Analysis failed: ${result.error}`);
  }
  
  if (!result.extractedData.totalRevenue || result.extractedData.totalRevenue !== 15000000) {
    throw new Error(`Total revenue incorrect: expected 15000000, got ${result.extractedData.totalRevenue}`);
  }
  
  if (!result.extractedData.netIncome || result.extractedData.netIncome !== 1650000) {
    throw new Error(`Net income incorrect: expected 1650000, got ${result.extractedData.netIncome}`);
  }
});

testRunner.addTest('Document Analysis - Cash Flow CSV', async () => {
  const csvContent = createTestData('cash_flow');
  const filePath = createTestFile('cash_flow_test.csv', csvContent);
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('documentType', 'cash_flow');
  
  const response = await fetch(`${CONFIG.backendUrl}/document/analyze`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(`Analysis failed: ${result.error}`);
  }
  
  if (!result.extractedData.operatingCashFlow || result.extractedData.operatingCashFlow !== 2800000) {
    throw new Error(`Operating cash flow incorrect: expected 2800000, got ${result.extractedData.operatingCashFlow}`);
  }
});

// 2. Mathematical Validation Tests
testRunner.addTest('Mathematical Validation - Balanced Balance Sheet', async () => {
  const csvContent = createTestData('balance_sheet', {
    totalAssets: 1000000,
    totalLiabilities: 600000,
    totalEquity: 400000
  });
  const filePath = createTestFile('balanced_sheet.csv', csvContent);
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('documentType', 'balance_sheet');
  
  const response = await fetch(`${CONFIG.backendUrl}/document/analyze`, {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(`Analysis failed: ${result.error}`);
  }
  
  if (!result.mathValidation.isValid) {
    throw new Error(`Math validation failed: ${result.mathValidation.invalidFields.join(', ')}`);
  }
});

testRunner.addTest('Mathematical Validation - Unbalanced Balance Sheet', async () => {
  const csvContent = createTestData('balance_sheet', {
    totalAssets: 1000000,
    totalLiabilities: 600000,
    totalEquity: 300000 // Should be 400000 to balance
  });
  const filePath = createTestFile('unbalanced_sheet.csv', csvContent);
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('documentType', 'balance_sheet');
  
  const response = await fetch(`${CONFIG.backendUrl}/document/analyze`, {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(`Analysis failed: ${result.error}`);
  }
  
  if (result.mathValidation.isValid) {
    throw new Error('Math validation should have failed for unbalanced sheet');
  }
  
  if (result.mathValidation.invalidFields.length === 0) {
    throw new Error('No math errors detected for unbalanced sheet');
  }
});

// 3. Edge Case Tests
testRunner.addTest('Edge Case - Empty Document', async () => {
  const filePath = createTestFile('empty.csv', '');
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('documentType', 'balance_sheet');
  
  const response = await fetch(`${CONFIG.backendUrl}/document/analyze`, {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  // Should handle empty document gracefully
  if (result.success && result.confidence > 50) {
    throw new Error('Empty document should have low confidence');
  }
});

testRunner.addTest('Edge Case - Malformed CSV', async () => {
  const malformedCsv = `Account,Amount
Cash and Cash Equivalents,2,500,000
Accounts Receivable,1,800,000
Inventory,1,200,000
Property Plant Equipment,8,500,000
TOTAL ASSETS,13,000,000
Accounts Payable,950,000
Short-term Debt,1,200,000
Long-term Debt,5,500,000
TOTAL LIABILITIES,7,650,000
Share Capital,5,000,000
Retained Earnings,350,000
TOTAL EQUITY,5,350,000`;
  
  const filePath = createTestFile('malformed.csv', malformedCsv);
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('documentType', 'balance_sheet');
  
  const response = await fetch(`${CONFIG.backendUrl}/document/analyze`, {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(`Analysis failed: ${result.error}`);
  }
  
  // Should detect mathematical errors
  if (result.mathValidation.isValid) {
    throw new Error('Should detect math errors in malformed data');
  }
});

testRunner.addTest('Edge Case - Negative Values', async () => {
  const csvContent = createTestData('balance_sheet', {
    cash: -1000000,
    totalAssets: 1000000,
    totalLiabilities: 600000,
    totalEquity: 400000
  });
  const filePath = createTestFile('negative_values.csv', csvContent);
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('documentType', 'balance_sheet');
  
  const response = await fetch(`${CONFIG.backendUrl}/document/analyze`, {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(`Analysis failed: ${result.error}`);
  }
  
  // Should detect warnings for negative cash
  if (result.errorDetection.warnings.length === 0) {
    throw new Error('Should detect warnings for negative cash');
  }
});

testRunner.addTest('Edge Case - Extremely Large Numbers', async () => {
  const csvContent = createTestData('balance_sheet', {
    totalAssets: 1e15,
    totalLiabilities: 6e14,
    totalEquity: 4e14
  });
  const filePath = createTestFile('large_numbers.csv', csvContent);
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('documentType', 'balance_sheet');
  
  const response = await fetch(`${CONFIG.backendUrl}/document/analyze`, {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(`Analysis failed: ${result.error}`);
  }
  
  // Should handle large numbers without errors
  if (result.extractedData.totalAssets !== 1e15) {
    throw new Error(`Large number not handled correctly: ${result.extractedData.totalAssets}`);
  }
});

// 4. AI Service Tests
testRunner.addTest('AI Service - Mock Provider', async () => {
  const csvContent = createTestData('balance_sheet');
  const filePath = createTestFile('ai_test.csv', csvContent);
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('documentType', 'balance_sheet');
  
  const response = await fetch(`${CONFIG.backendUrl}/document/analyze`, {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(`Analysis failed: ${result.error}`);
  }
  
  // Mock AI should return consistent results
  if (!result.extractedData.companyName) {
    throw new Error('AI service did not extract company name');
  }
  
  if (result.confidence < 50) {
    throw new Error(`AI confidence too low: ${result.confidence}%`);
  }
});

// 5. Validation System Tests
testRunner.addTest('Validation - Required Fields Missing', async () => {
  const incompleteCsv = `Account,Amount
Cash and Cash Equivalents,2500000
Accounts Receivable,1800000
Inventory,1200000
TOTAL ASSETS,5500000`;
  
  const filePath = createTestFile('incomplete.csv', incompleteCsv);
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('documentType', 'balance_sheet');
  
  const response = await fetch(`${CONFIG.backendUrl}/document/analyze`, {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(`Analysis failed: ${result.error}`);
  }
  
  // Should detect missing required fields
  if (result.validation.missingFields.length === 0) {
    throw new Error('Should detect missing required fields');
  }
  
  if (result.validation.completeness > 80) {
    throw new Error(`Completeness too high for incomplete data: ${result.validation.completeness}%`);
  }
});

testRunner.addTest('Validation - Data Type Validation', async () => {
  const invalidTypesCsv = `Account,Amount
Company Name,Test Company Inc.
Period,2024-12-31
Total Assets,not_a_number
Total Liabilities,also_not_a_number
Total Equity,definitely_not_a_number`;
  
  const filePath = createTestFile('invalid_types.csv', invalidTypesCsv);
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('documentType', 'balance_sheet');
  
  const response = await fetch(`${CONFIG.backendUrl}/document/analyze`, {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(`Analysis failed: ${result.error}`);
  }
  
  // Should detect invalid data types
  if (result.validation.invalidFields.length === 0) {
    throw new Error('Should detect invalid data types');
  }
});

// 6. Error Detection Tests
testRunner.addTest('Error Detection - Spelling Errors', async () => {
  const csvWithErrors = `Account,Amount
Cash and Cash Equivalents,2500000
Accounts Recievable,1800000  // Spelling error
Inventory,1200000
Property Plant Equipment,8500000
TOTAL ASSETS,14000000
Accounts Payable,950000
Short-term Debt,1200000
Long-term Debt,5500000
TOTAL LIABILITIES,7650000
Share Capital,5000000
Retained Earnings,1350000
TOTAL EQUITY,6350000`;
  
  const filePath = createTestFile('spelling_errors.csv', csvWithErrors);
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('documentType', 'balance_sheet');
  
  const response = await fetch(`${CONFIG.backendUrl}/document/analyze`, {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(`Analysis failed: ${result.error}`);
  }
  
  // Should detect spelling errors
  if (result.errorDetection.warnings.length === 0) {
    throw new Error('Should detect spelling errors');
  }
});

// 7. Performance Tests
testRunner.addTest('Performance - Large Document', async () => {
  const largeCsv = createTestData('balance_sheet');
  // Duplicate data to create a large document
  const largeContent = Array(100).fill(largeCsv).join('\n\n');
  const filePath = createTestFile('large_document.csv', largeContent);
  
  const startTime = Date.now();
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('documentType', 'balance_sheet');
  
  const response = await fetch(`${CONFIG.backendUrl}/document/analyze`, {
    method: 'POST',
    body: formData
  });
  
  const duration = Date.now() - startTime;
  
  if (duration > 10000) { // 10 seconds
    throw new Error(`Performance test failed: took ${duration}ms (should be < 10s)`);
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(`Analysis failed: ${result.error}`);
  }
  
  log(`Large document processed in ${duration}ms`, 'success');
});

// 8. Security Tests
testRunner.addTest('Security - SQL Injection Attempt', async () => {
  const maliciousCsv = `Account,Amount
'; DROP TABLE users; --,1000000
Cash and Cash Equivalents,2500000
TOTAL ASSETS,3500000`;
  
  const filePath = createTestFile('sql_injection.csv', maliciousCsv);
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('documentType', 'balance_sheet');
  
  const response = await fetch(`${CONFIG.backendUrl}/document/analyze`, {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  // Should handle malicious input safely
  if (!result.success && result.error.includes('SQL')) {
    throw new Error('SQL injection detected in error message');
  }
  
  // Should either succeed or fail gracefully without exposing SQL
  if (result.success) {
    // If it succeeds, malicious input should be sanitized
    if (result.extractedData && JSON.stringify(result.extractedData).includes('DROP TABLE')) {
      throw new Error('Malicious input not sanitized');
    }
  }
});

testRunner.addTest('Security - XSS Attempt', async () => {
  const maliciousCsv = `Account,Amount
<script>alert('xss')</script>,1000000
Cash and Cash Equivalents,2500000
TOTAL ASSETS,3500000`;
  
  const filePath = createTestFile('xss_attempt.csv', maliciousCsv);
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('documentType', 'balance_sheet');
  
  const response = await fetch(`${CONFIG.backendUrl}/document/analyze`, {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  // Should handle malicious input safely
  if (result.success) {
    if (result.extractedData && JSON.stringify(result.extractedData).includes('<script>')) {
      throw new Error('XSS attempt not sanitized');
    }
  }
});

// 9. Integration Tests
testRunner.addTest('Integration - Complete Workflow', async () => {
  const csvContent = createTestData('balance_sheet');
  const filePath = createTestFile('integration_test.csv', csvContent);
  
  // Step 1: Upload and analyze
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('documentType', 'balance_sheet');
  
  const response = await fetch(`${CONFIG.backendUrl}/document/analyze`, {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(`Analysis failed: ${result.error}`);
  }
  
  // Step 2: Validate all components are present
  if (!result.extractedData) {
    throw new Error('No extracted data');
  }
  
  if (!result.validation) {
    throw new Error('No validation result');
  }
  
  if (!result.mathValidation) {
    throw new Error('No math validation result');
  }
  
  if (!result.errorDetection) {
    throw new Error('No error detection result');
  }
  
  if (typeof result.confidence !== 'number') {
    throw new Error('No confidence score');
  }
  
  if (!Array.isArray(result.recommendations)) {
    throw new Error('No recommendations');
  }
  
  // Step 3: Verify data integrity
  if (result.extractedData.totalAssets !== 19450000) {
    throw new Error('Data integrity check failed');
  }
  
  // Step 4: Verify validation results
  if (!result.validation.isValid) {
    throw new Error('Validation should pass for valid data');
  }
  
  if (result.mathValidation.isValid !== true) {
    throw new Error('Math validation should pass for balanced sheet');
  }
  
  if (result.confidence < 80) {
    throw new Error(`Confidence too low: ${result.confidence}%`);
  }
});

// 10. Analytics Service Tests
testRunner.addTest('Analytics - Business Insights', async () => {
  const response = await fetch(`${CONFIG.backendUrl}/analytics/overview`, {
    method: 'GET'
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  const result = await response.json();
  
  if (!result.kpis) {
    throw new Error('No KPIs returned');
  }
  
  if (typeof result.kpis.revenueTotal !== 'number') {
    throw new Error('Revenue total not a number');
  }
  
  if (!Array.isArray(result.timeseries)) {
    throw new Error('Timeseries not an array');
  }
  
  if (!Array.isArray(result.topProducts)) {
    throw new Error('Top products not an array');
  }
  
  if (!Array.isArray(result.topCustomers)) {
    throw new Error('Top customers not an array');
  }
  
  if (!Array.isArray(result.forecast)) {
    throw new Error('Forecast not an array');
  }
});

// Main execution
async function main() {
  try {
    // Check if backend is running
    log('🔍 Checking backend status...', 'info');
    const healthResponse = await fetch(`${CONFIG.backendUrl}/health`);
    if (!healthResponse.ok) {
      throw new Error('Backend is not running. Please start it first.');
    }
    log('✅ Backend is running', 'success');
    
    // Run all tests
    await testRunner.runAll();
    
  } catch (error) {
    log(`💥 Test suite failed: ${error.message}`, 'error');
    process.exit(1);
  } finally {
    // Cleanup
    cleanupTestFiles();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n🛑 Test suite interrupted', 'warning');
  cleanupTestFiles();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  log(`💥 Uncaught exception: ${error.message}`, 'error');
  cleanupTestFiles();
  process.exit(1);
});

// Run the test suite
if (require.main === module) {
  main();
}

module.exports = { TestRunner, testResults };
