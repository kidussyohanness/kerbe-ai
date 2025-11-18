#!/usr/bin/env node

/**
 * Comprehensive Website Evaluation Script
 * Tests all frontend and backend features
 */

const http = require('http');
const fs = require('fs');

const results = {
  frontend: { passed: 0, failed: 0, tests: [] },
  backend: { passed: 0, failed: 0, tests: [] },
  integration: { passed: 0, failed: 0, tests: [] },
  overall: { passed: 0, failed: 0, total: 0 }
};

async function makeRequest(method, url, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.includes('localhost:3000') ? 'localhost' : 'localhost',
      port: url.includes('localhost:3000') ? 3000 : (url.includes('8788') ? 8788 : 8787),
      path: url.includes('localhost:3000') ? url.replace('http://localhost:3000', '') : url.replace(/http:\/\/localhost:\d+/, ''),
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: responseData,
          success: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

function addTestResult(category, testName, passed, details = '') {
  results[category].tests.push({ name: testName, passed, details });
  if (passed) {
    results[category].passed++;
  } else {
    results[category].failed++;
  }
  results.overall.total++;
  if (passed) {
    results.overall.passed++;
  } else {
    results.overall.failed++;
  }
}

async function testFrontend() {
  console.log('🌐 Testing Frontend...\n');
  
  try {
    // Test homepage
    const homepage = await makeRequest('GET', 'http://localhost:3000');
    addTestResult('frontend', 'Homepage loads', homepage.success, `Status: ${homepage.status}`);
    
    // Test dashboard page
    const dashboard = await makeRequest('GET', 'http://localhost:3000/dashboard');
    addTestResult('frontend', 'Dashboard page loads', dashboard.success, `Status: ${dashboard.status}`);
    
    // Test upload page
    const upload = await makeRequest('GET', 'http://localhost:3000/dashboard/upload');
    addTestResult('frontend', 'Upload page loads', upload.success, `Status: ${upload.status}`);
    
    // Test signin page
    const signin = await makeRequest('GET', 'http://localhost:3000/signin');
    addTestResult('frontend', 'Signin page loads', signin.success, `Status: ${signin.status}`);
    
    // Test chat page
    const chat = await makeRequest('GET', 'http://localhost:3000/dashboard/chat');
    addTestResult('frontend', 'Chat page loads', chat.success, `Status: ${chat.status}`);
    
  } catch (error) {
    addTestResult('frontend', 'Frontend connectivity', false, error.message);
  }
}

async function testBackend() {
  console.log('🔧 Testing Backend Services...\n');
  
  try {
    // Test main backend health
    const mainBackend = await makeRequest('GET', 'http://localhost:8787/health');
    addTestResult('backend', 'Main backend health', mainBackend.success, `Status: ${mainBackend.status}`);
    
    // Test analytics endpoint
    const analytics = await makeRequest('GET', 'http://localhost:8787/analytics/overview');
    addTestResult('backend', 'Analytics endpoint', analytics.success, `Status: ${analytics.status}`);
    
    // Test AI chat endpoint
    const chat = await makeRequest('POST', 'http://localhost:8787/chat/ask', {
      message: "Hello, test message",
      context: "test"
    });
    addTestResult('backend', 'AI Chat endpoint', chat.success, `Status: ${chat.status}`);
    
    // Test document analysis endpoint
    const docAnalysis = await makeRequest('POST', 'http://localhost:8787/document/analyze', {
      documentType: 'balance_sheet',
      businessContext: 'test',
      fileContent: 'test data'
    });
    addTestResult('backend', 'Document analysis endpoint', docAnalysis.success, `Status: ${docAnalysis.status}`);
    
    // Test financial generator health
    const financialGen = await makeRequest('GET', 'http://localhost:8788/health');
    addTestResult('backend', 'Financial generator health', financialGen.success, `Status: ${financialGen.status}`);
    
    // Test balance sheet generation
    const balanceSheet = await makeRequest('POST', 'http://localhost:8788/generate/balance-sheet', {
      companyName: "Test Company",
      cash: 1000000,
      accounts_payable: 500000,
      common_stock: 500000,
      returnFormat: "json"
    });
    addTestResult('backend', 'Balance sheet generation', balanceSheet.success, `Status: ${balanceSheet.status}`);
    
    // Test income statement generation
    const incomeStatement = await makeRequest('POST', 'http://localhost:8788/generate/income-statement', {
      companyName: "Test Company",
      revenue: 2000000,
      cost_of_goods_sold: 1000000,
      returnFormat: "json"
    });
    addTestResult('backend', 'Income statement generation', incomeStatement.success, `Status: ${incomeStatement.status}`);
    
    // Test cash flow generation
    const cashFlow = await makeRequest('POST', 'http://localhost:8788/generate/cash-flow', {
      companyName: "Test Company",
      net_income: 500000,
      beginning_cash: 100000,
      returnFormat: "json"
    });
    addTestResult('backend', 'Cash flow generation', cashFlow.success, `Status: ${cashFlow.status}`);
    
  } catch (error) {
    addTestResult('backend', 'Backend connectivity', false, error.message);
  }
}

async function testIntegration() {
  console.log('🔗 Testing Frontend-Backend Integration...\n');
  
  try {
    // Test if frontend can reach backend APIs
    const analyticsData = await makeRequest('GET', 'http://localhost:8787/analytics/overview');
    const hasData = analyticsData.success && analyticsData.data.includes('kpis');
    addTestResult('integration', 'Frontend can fetch analytics data', hasData, 
      hasData ? 'Analytics data structure valid' : 'No valid analytics data');
    
    // Test document upload flow
    const uploadTest = await makeRequest('POST', 'http://localhost:8787/document/analyze', {
      documentType: 'balance_sheet',
      businessContext: 'Integration test',
      fileContent: 'Company,Amount\nCash,1000000\nAccounts Payable,500000'
    });
    const uploadSuccess = uploadTest.success && uploadTest.data.includes('analysisResult');
    addTestResult('integration', 'Document upload and analysis flow', uploadSuccess,
      uploadSuccess ? 'Document analysis working' : 'Document analysis failed');
    
    // Test financial statement generation flow
    const financialTest = await makeRequest('POST', 'http://localhost:8788/generate/balance-sheet', {
      companyName: "Integration Test Company",
      cash: 2000000,
      accounts_payable: 1000000,
      common_stock: 1000000,
      returnFormat: "json"
    });
    const financialSuccess = financialTest.success && financialTest.data.includes('statement');
    addTestResult('integration', 'Financial statement generation flow', financialSuccess,
      financialSuccess ? 'Financial generation working' : 'Financial generation failed');
    
  } catch (error) {
    addTestResult('integration', 'Integration connectivity', false, error.message);
  }
}

async function testEdgeCases() {
  console.log('🧪 Testing Edge Cases and Error Handling...\n');
  
  try {
    // Test invalid data handling
    const invalidData = await makeRequest('POST', 'http://localhost:8788/generate/balance-sheet', {
      companyName: "Test",
      cash: "not_a_number",
      returnFormat: "json"
    });
    const hasValidation = invalidData.success && invalidData.data.includes('validation');
    addTestResult('integration', 'Invalid data validation', hasValidation,
      hasValidation ? 'Validation errors caught' : 'No validation errors');
    
    // Test missing required fields
    const missingFields = await makeRequest('POST', 'http://localhost:8788/generate/balance-sheet', {
      cash: 1000000,
      returnFormat: "json"
    });
    const catchesMissing = missingFields.success && missingFields.data.includes('Missing required field');
    addTestResult('integration', 'Missing fields validation', catchesMissing,
      catchesMissing ? 'Missing fields caught' : 'Missing fields not caught');
    
    // Test mathematical validation
    const mathError = await makeRequest('POST', 'http://localhost:8788/generate/balance-sheet', {
      companyName: "Test",
      totalAssets: 1000000,
      totalLiabilities: 600000,
      totalEquity: 300000, // Should not balance
      returnFormat: "json"
    });
    const catchesMathError = mathError.success && mathError.data.includes('equation error');
    addTestResult('integration', 'Mathematical validation', catchesMathError,
      catchesMathError ? 'Math errors caught' : 'Math errors not caught');
    
  } catch (error) {
    addTestResult('integration', 'Edge case testing', false, error.message);
  }
}

function printResults() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE WEBSITE EVALUATION RESULTS');
  console.log('='.repeat(80));
  
  // Frontend Results
  console.log('\n🌐 FRONTEND EVALUATION:');
  console.log(`✅ Passed: ${results.frontend.passed}`);
  console.log(`❌ Failed: ${results.frontend.failed}`);
  console.log(`📈 Success Rate: ${((results.frontend.passed / (results.frontend.passed + results.frontend.failed)) * 100).toFixed(1)}%`);
  
  if (results.frontend.tests.length > 0) {
    console.log('\nFrontend Test Details:');
    results.frontend.tests.forEach(test => {
      console.log(`  ${test.passed ? '✅' : '❌'} ${test.name}: ${test.details}`);
    });
  }
  
  // Backend Results
  console.log('\n🔧 BACKEND EVALUATION:');
  console.log(`✅ Passed: ${results.backend.passed}`);
  console.log(`❌ Failed: ${results.backend.failed}`);
  console.log(`📈 Success Rate: ${((results.backend.passed / (results.backend.passed + results.backend.failed)) * 100).toFixed(1)}%`);
  
  if (results.backend.tests.length > 0) {
    console.log('\nBackend Test Details:');
    results.backend.tests.forEach(test => {
      console.log(`  ${test.passed ? '✅' : '❌'} ${test.name}: ${test.details}`);
    });
  }
  
  // Integration Results
  console.log('\n🔗 INTEGRATION EVALUATION:');
  console.log(`✅ Passed: ${results.integration.passed}`);
  console.log(`❌ Failed: ${results.integration.failed}`);
  console.log(`📈 Success Rate: ${((results.integration.passed / (results.integration.passed + results.integration.failed)) * 100).toFixed(1)}%`);
  
  if (results.integration.tests.length > 0) {
    console.log('\nIntegration Test Details:');
    results.integration.tests.forEach(test => {
      console.log(`  ${test.passed ? '✅' : '❌'} ${test.name}: ${test.details}`);
    });
  }
  
  // Overall Results
  console.log('\n🎯 OVERALL EVALUATION:');
  console.log(`✅ Total Passed: ${results.overall.passed}`);
  console.log(`❌ Total Failed: ${results.overall.failed}`);
  console.log(`📈 Overall Success Rate: ${((results.overall.passed / results.overall.total) * 100).toFixed(1)}%`);
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  
  if (results.frontend.failed > 0) {
    console.log('🔧 Frontend Issues:');
    results.frontend.tests.filter(t => !t.passed).forEach(test => {
      console.log(`  - Fix: ${test.name}`);
    });
  }
  
  if (results.backend.failed > 0) {
    console.log('🔧 Backend Issues:');
    results.backend.tests.filter(t => !t.passed).forEach(test => {
      console.log(`  - Fix: ${test.name}`);
    });
  }
  
  if (results.integration.failed > 0) {
    console.log('🔧 Integration Issues:');
    results.integration.tests.filter(t => !t.passed).forEach(test => {
      console.log(`  - Fix: ${test.name}`);
    });
  }
  
  if (results.overall.passed === results.overall.total) {
    console.log('🎉 All systems are working perfectly!');
    console.log('🚀 Ready for production deployment!');
  } else {
    console.log('⚠️ Some issues need attention before production deployment.');
  }
  
  console.log('\n' + '='.repeat(80));
}

async function runEvaluation() {
  console.log('🚀 Starting Comprehensive Website Evaluation...\n');
  
  await testFrontend();
  await testBackend();
  await testIntegration();
  await testEdgeCases();
  
  printResults();
}

// Run the evaluation
runEvaluation().catch(console.error);


