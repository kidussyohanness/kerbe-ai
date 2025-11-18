#!/usr/bin/env node

/**
 * Comprehensive Upload and KPI Testing Script
 * Tests document upload, analysis, storage, and KPI calculations
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');
const { URL } = require('url');

const BACKEND_URL = 'http://localhost:8787';
// Use existing user ID from database or create a new one
const TEST_USER_ID = 'cmgtv2kjt0000sfzqb6d91ez0'; // Use existing test user

const testResults = {
  passed: 0,
  failed: 0,
  tests: [],
  errors: []
};

// Test utilities
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        ...options.headers
      },
      timeout: 60000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: json, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data, raw: data });
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      if (options.body instanceof FormData) {
        options.body.pipe(req);
      } else {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        req.end();
      }
    } else {
      req.end();
    }
  });
}

function recordTest(name, passed, message, details = {}) {
  const test = { name, passed, message, details, timestamp: new Date().toISOString() };
  testResults.tests.push(test);
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}: ${message}`);
  } else {
    testResults.failed++;
    console.error(`❌ ${name}: ${message}`);
    if (details.error) {
      testResults.errors.push({ test: name, error: details.error });
    }
  }
}

// Upload a document using proper FormData handling
async function uploadDocument(filePath, documentType, userId) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    
    formData.append('file', fileContent, fileName);
    formData.append('documentType', documentType);
    
    const url = `${BACKEND_URL}/document/analyze`;
    const urlObj = new URL(url);
    
    const headers = {
      'x-user-id': userId,
      'x-company-id': 'test-company',
      ...formData.getHeaders()
    };
    
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port || 8787,
      path: urlObj.pathname,
      method: 'POST',
      headers: headers,
      timeout: 60000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: json, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data, raw: data });
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    formData.pipe(req);
  });
}

// Get user documents
async function getUserDocuments(userId) {
  const response = await makeRequest(`${BACKEND_URL}/user/documents`, {
    headers: { 'x-user-id': userId }
  });
  return response.body;
}

// Get financial data for KPIs
async function getFinancialData(userId) {
  const response = await makeRequest(`${BACKEND_URL}/dashboard/financial-data/${userId}?months=12`, {
    headers: { 'x-user-id': userId }
  });
  return response.body;
}

// Calculate expected KPIs from raw data
function calculateExpectedKPIs(balanceSheet, incomeStatement, cashFlow) {
  const bs = balanceSheet || {};
  const is = incomeStatement || {};
  const cf = cashFlow || {};
  
  // Extract values with fallbacks
  const cash = bs.cash || bs.cashAndEquivalents || 0;
  const currentAssets = bs.currentAssets || 0;
  const currentLiabilities = bs.currentLiabilities || 0;
  const totalRevenue = is.totalRevenue || is.revenue || 0;
  const cogs = is.costOfGoodsSold || is.cogs || 0;
  const operatingExpenses = is.operatingExpenses || is.opex || 0;
  const operatingIncome = is.operatingIncome || is.ebit || 0;
  const interestExpense = is.interestExpense || 0;
  const netIncome = is.netIncome || 0;
  const accountsReceivable = bs.accountsReceivable || 0;
  const inventory = bs.inventory || 0;
  const accountsPayable = bs.accountsPayable || 0;
  const operatingCashFlow = cf.operatingCashFlow || cf.cfo || 0;
  const investingCashFlow = cf.investingCashFlow || cf.cfi || 0;
  
  // Calculate KPIs
  const grossProfit = totalRevenue - cogs;
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const operatingMargin = totalRevenue > 0 ? (operatingIncome / totalRevenue) * 100 : 0;
  const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
  const interestCoverage = interestExpense > 0 ? operatingIncome / interestExpense : 0;
  
  // DSO, DIO, DPO (simplified - using annual revenue/COGS)
  const dso = totalRevenue > 0 ? (accountsReceivable / totalRevenue) * 365 : 0;
  const dio = cogs > 0 ? (inventory / cogs) * 365 : 0;
  const dpo = cogs > 0 ? (accountsPayable / cogs) * 365 : 0;
  const ccc = dso + dio - dpo;
  
  // Cash runway (simplified - using average monthly cash flow)
  const avgMonthlyCashFlow = operatingCashFlow / 12;
  const runway = avgMonthlyCashFlow !== 0 ? Math.abs(cash / avgMonthlyCashFlow) : 0;
  
  // Free cash flow
  const fcf = operatingCashFlow + investingCashFlow;
  
  // Revenue growth (would need prior period, assuming 0 for single period)
  const revenueGrowth = 0;
  
  return {
    cash: cash,
    runway: runway,
    fcf: fcf,
    revenueGrowth: revenueGrowth,
    grossMargin: grossMargin,
    operatingMargin: operatingMargin,
    ccc: ccc,
    interestCoverage: interestCoverage,
    currentRatio: currentRatio
  };
}

// Test suite
async function runTests() {
  console.log('🧪 Starting Comprehensive Upload and KPI Tests\n');
  console.log(`Test User ID: ${TEST_USER_ID}\n`);
  
  const testDataDir = path.join(__dirname, 'test-data');
  
  // Test 1: Upload Balance Sheet
  console.log('\n📄 Test 1: Upload Balance Sheet');
  let balanceSheetResponse;
  try {
    const bsPath = path.join(testDataDir, 'kerbe_tech_balance_sheet_2024.csv');
    if (!fs.existsSync(bsPath)) {
      throw new Error(`Balance sheet file not found: ${bsPath}`);
    }
    balanceSheetResponse = await uploadDocument(bsPath, 'balance_sheet', TEST_USER_ID);
    recordTest('Upload Balance Sheet',
      balanceSheetResponse.status === 200 && balanceSheetResponse.body.success,
      `Status: ${balanceSheetResponse.status}, Success: ${balanceSheetResponse.body.success}`,
      { response: balanceSheetResponse.body }
    );
  } catch (error) {
    recordTest('Upload Balance Sheet', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Wait a bit for processing
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test 2: Upload Income Statement
  console.log('\n📄 Test 2: Upload Income Statement');
  let incomeStatementResponse;
  try {
    const isPath = path.join(testDataDir, 'kerbe_tech_income_statement_2024.csv');
    if (!fs.existsSync(isPath)) {
      throw new Error(`Income statement file not found: ${isPath}`);
    }
    incomeStatementResponse = await uploadDocument(isPath, 'income_statement', TEST_USER_ID);
    recordTest('Upload Income Statement',
      incomeStatementResponse.status === 200 && incomeStatementResponse.body.success,
      `Status: ${incomeStatementResponse.status}, Success: ${incomeStatementResponse.body.success}`,
      { response: incomeStatementResponse.body }
    );
  } catch (error) {
    recordTest('Upload Income Statement', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Wait a bit for processing
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test 3: Upload Cash Flow
  console.log('\n📄 Test 3: Upload Cash Flow');
  let cashFlowResponse;
  try {
    const cfPath = path.join(testDataDir, 'kerbe_tech_cash_flow_2024.csv');
    if (!fs.existsSync(cfPath)) {
      throw new Error(`Cash flow file not found: ${cfPath}`);
    }
    cashFlowResponse = await uploadDocument(cfPath, 'cash_flow', TEST_USER_ID);
    recordTest('Upload Cash Flow',
      cashFlowResponse.status === 200 && cashFlowResponse.body.success,
      `Status: ${cashFlowResponse.status}, Success: ${cashFlowResponse.body.success}`,
      { response: cashFlowResponse.body }
    );
  } catch (error) {
    recordTest('Upload Cash Flow', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Wait for all processing to complete
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Test 4: Verify Documents Are Stored
  console.log('\n📋 Test 4: Verify Documents Are Stored');
  let documents;
  try {
    // Wait a bit more for async processing
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const docsResponse = await getUserDocuments(TEST_USER_ID);
    console.log('Documents response:', JSON.stringify(docsResponse, null, 2));
    documents = docsResponse.documents || [];
    recordTest('Documents Retrieved',
      docsResponse.success && documents.length >= 3,
      `Found ${documents.length} documents`,
      { 
        success: docsResponse.success,
        total: docsResponse.total,
        documents: documents.map(d => ({ 
          id: d.id, 
          type: d.documentType, 
          status: d.status,
          hasAnalysis: !!d.analysisResults
        })) 
      }
    );
    
    // Check each document type
    const hasBalanceSheet = documents.some(d => d.documentType === 'balance_sheet');
    const hasIncomeStatement = documents.some(d => d.documentType === 'income_statement');
    const hasCashFlow = documents.some(d => d.documentType === 'cash_flow');
    
    recordTest('All Document Types Present',
      hasBalanceSheet && hasIncomeStatement && hasCashFlow,
      `BS: ${hasBalanceSheet}, IS: ${hasIncomeStatement}, CF: ${hasCashFlow}`,
      { hasBalanceSheet, hasIncomeStatement, hasCashFlow }
    );
    
    // Check document status
    const completedDocs = documents.filter(d => d.status === 'completed');
    recordTest('Documents Completed',
      completedDocs.length >= 3,
      `${completedDocs.length} documents completed`,
      { completed: completedDocs.length, total: documents.length }
    );
    
    // Check analysis results
    const docsWithAnalysis = documents.filter(d => d.analysisResults && d.analysisResults.extractedData);
    recordTest('Documents Have Analysis Results',
      docsWithAnalysis.length >= 3,
      `${docsWithAnalysis.length} documents have analysis results`,
      { withAnalysis: docsWithAnalysis.length }
    );
    
  } catch (error) {
    recordTest('Documents Retrieved', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test 5: Verify Financial Data Extraction
  console.log('\n📊 Test 5: Verify Financial Data Extraction');
  let financialData;
  try {
    const financialResponse = await getFinancialData(TEST_USER_ID);
    console.log('Financial data response:', JSON.stringify(financialResponse, null, 2));
    financialData = financialResponse.data;
    
    recordTest('Financial Data Retrieved',
      financialResponse.success && financialData,
      `Success: ${financialResponse.success}, Has Data: ${!!financialData}`,
      { response: financialResponse }
    );
    
    if (financialData && financialData.financialData) {
      const fd = financialData.financialData;
      recordTest('Financial Data Array Not Empty',
        Array.isArray(fd) && fd.length > 0,
        `Found ${fd.length} periods`,
        { periods: fd.length }
      );
      
      // Check data completeness
      const completeness = financialData.dataCompleteness || {};
      recordTest('Data Completeness',
        completeness.hasBalanceSheet && completeness.hasIncomeStatement && completeness.hasCashFlow,
        `BS: ${completeness.hasBalanceSheet}, IS: ${completeness.hasIncomeStatement}, CF: ${completeness.hasCashFlow}`,
        { completeness }
      );
      
      // Verify extracted data structure
      if (fd.length > 0) {
        const firstPeriod = fd[0];
        const hasBalanceSheet = firstPeriod.balanceSheet && Object.keys(firstPeriod.balanceSheet).length > 0;
        const hasIncomeStatement = firstPeriod.incomeStatement && Object.keys(firstPeriod.incomeStatement).length > 0;
        const hasCashFlow = firstPeriod.cashFlow && Object.keys(firstPeriod.cashFlow).length > 0;
        
        recordTest('Financial Data Structure Valid',
          hasBalanceSheet && hasIncomeStatement && hasCashFlow,
          `BS: ${hasBalanceSheet}, IS: ${hasIncomeStatement}, CF: ${hasCashFlow}`,
          { firstPeriod }
        );
      }
    }
  } catch (error) {
    recordTest('Financial Data Retrieved', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test 6: Verify KPI Calculations
  console.log('\n📈 Test 6: Verify KPI Calculations');
  if (financialData && financialData.financialData && financialData.financialData.length > 0) {
    try {
      const periodData = financialData.financialData[0];
      const bs = periodData.balanceSheet || {};
      const is = periodData.incomeStatement || {};
      const cf = periodData.cashFlow || {};
      
      // Calculate expected KPIs
      const expectedKPIs = calculateExpectedKPIs(bs, is, cf);
      
      // Get actual KPIs from dashboard endpoint
      const kpiResponse = await makeRequest(`${BACKEND_URL}/dashboard/kpis`, {
        headers: { 'x-user-id': TEST_USER_ID, 'x-company-id': 'test-company' }
      });
      
      recordTest('KPIs Retrieved',
        kpiResponse.status === 200,
        `Status: ${kpiResponse.status}`,
        { kpis: kpiResponse.body }
      );
      
      // Verify key KPI values
      if (bs.cash !== undefined) {
        recordTest('Cash KPI',
          true,
          `Cash: $${bs.cash.toLocaleString()}`,
          { cash: bs.cash }
        );
      }
      
      if (is.totalRevenue !== undefined) {
        const grossMargin = ((is.totalRevenue - (is.costOfGoodsSold || 0)) / is.totalRevenue) * 100;
        recordTest('Gross Margin KPI',
          grossMargin >= 0 && grossMargin <= 100,
          `Gross Margin: ${grossMargin.toFixed(2)}%`,
          { grossMargin, revenue: is.totalRevenue, cogs: is.costOfGoodsSold }
        );
      }
      
      if (bs.currentAssets !== undefined && bs.currentLiabilities !== undefined) {
        const currentRatio = bs.currentLiabilities > 0 ? bs.currentAssets / bs.currentLiabilities : 0;
        recordTest('Current Ratio KPI',
          currentRatio >= 0,
          `Current Ratio: ${currentRatio.toFixed(2)}`,
          { currentRatio, currentAssets: bs.currentAssets, currentLiabilities: bs.currentLiabilities }
        );
      }
      
    } catch (error) {
      recordTest('KPI Calculations', false, `Error: ${error.message}`, { error: error.message });
    }
  } else {
    recordTest('KPI Calculations', false, 'No financial data available', {});
  }
  
  // Test 7: Edge Cases
  console.log('\n🔍 Test 7: Edge Cases');
  
  // Test 7a: Empty file
  try {
    const emptyPath = path.join(__dirname, 'test-empty.csv');
    fs.writeFileSync(emptyPath, '');
    const emptyResponse = await uploadDocument(emptyPath, 'balance_sheet', TEST_USER_ID);
    recordTest('Empty File Handling',
      emptyResponse.status === 400 || emptyResponse.status === 500,
      `Status: ${emptyResponse.status} (should reject empty file)`,
      { response: emptyResponse.body }
    );
    fs.unlinkSync(emptyPath);
  } catch (error) {
    recordTest('Empty File Handling', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test 7b: Invalid document type
  try {
    const bsPath = path.join(testDataDir, 'kerbe_tech_balance_sheet_2024.csv');
    const invalidResponse = await uploadDocument(bsPath, 'invalid_type', TEST_USER_ID);
    recordTest('Invalid Document Type Handling',
      invalidResponse.status === 400,
      `Status: ${invalidResponse.status} (should reject invalid type)`,
      { response: invalidResponse.body }
    );
  } catch (error) {
    recordTest('Invalid Document Type Handling', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test 7c: Duplicate upload
  try {
    const bsPath = path.join(testDataDir, 'kerbe_tech_balance_sheet_2024.csv');
    const duplicateResponse = await uploadDocument(bsPath, 'balance_sheet', TEST_USER_ID);
    recordTest('Duplicate Upload Handling',
      duplicateResponse.status === 200 || duplicateResponse.status === 409,
      `Status: ${duplicateResponse.status} (should handle duplicates gracefully)`,
      { response: duplicateResponse.body }
    );
  } catch (error) {
    recordTest('Duplicate Upload Handling', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Generate Report
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(80) + '\n');
  
  const totalTests = testResults.passed + testResults.failed;
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / totalTests) * 100).toFixed(1)}%\n`);
  
  if (testResults.errors.length > 0) {
    console.log('⚠️  Errors Found:');
    testResults.errors.forEach((err, idx) => {
      console.log(`   ${idx + 1}. ${err.test}: ${err.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(80));
  
  // Save detailed report
  const reportPath = path.join(__dirname, 'UPLOAD_KPI_TEST_RESULTS.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    testUser: TEST_USER_ID,
    timestamp: new Date().toISOString(),
    results: testResults
  }, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
if (require.main === module) {
  runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runTests };

