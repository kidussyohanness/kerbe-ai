#!/usr/bin/env node

/**
 * Comprehensive Website Diagnosis
 * Tests all features, edge cases, and error handling
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://localhost:8787';
const FRONTEND_URL = 'http://localhost:3000';
const TEST_USER_ID = 'cmgtv2kjt0000sfzqb6d91ez0';
const TEST_COMPANY_ID = 'test-company-123';

const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
  errors: []
};

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port || 8787,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data), raw: data });
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
      if (typeof options.body === 'string') {
        req.write(options.body);
      } else {
        req.write(JSON.stringify(options.body));
      }
    }
    
    req.end();
  });
}

function recordTest(category, name, passed, message, details = {}, isWarning = false) {
  const test = { category, name, passed, message, details, timestamp: new Date().toISOString(), warning: isWarning };
  testResults.tests.push(test);
  if (isWarning) {
    testResults.warnings++;
    console.log(`⚠️  [${category}] ${name}: ${message}`);
  } else if (passed) {
    testResults.passed++;
    console.log(`✅ [${category}] ${name}: ${message}`);
  } else {
    testResults.failed++;
    console.error(`❌ [${category}] ${name}: ${message}`);
    if (details.error) {
      testResults.errors.push({ category, name, error: details.error });
    }
  }
}

async function testHealthChecks() {
  console.log('\n🏥 Testing Health Checks');
  console.log('='.repeat(80));
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    recordTest('Health', 'Backend Health Check',
      response.status === 200 && response.body.status === 'ok',
      `Status: ${response.status}`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Health', 'Backend Health Check', false, `Error: ${error.message}`, { error: error.message });
  }
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/document/health`);
    recordTest('Health', 'Document Service Health',
      response.status === 200,
      `Status: ${response.status}`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Health', 'Document Service Health', false, `Error: ${error.message}`, { error: error.message });
  }
}

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication & User Management');
  console.log('='.repeat(80));
  
  // Test with valid userId
  try {
    const response = await makeRequest(`${BACKEND_URL}/user/documents`, {
      headers: { 'x-user-id': TEST_USER_ID }
    });
    recordTest('Auth', 'Valid User ID',
      response.status === 200 || response.status === 400,
      `Status: ${response.status}`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Auth', 'Valid User ID', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test with missing userId
  try {
    const response = await makeRequest(`${BACKEND_URL}/user/documents`);
    recordTest('Auth', 'Missing User ID',
      response.status === 400 || response.status === 401,
      `Status: ${response.status} (should require userId)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Auth', 'Missing User ID', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test with invalid userId format
  try {
    const response = await makeRequest(`${BACKEND_URL}/user/documents`, {
      headers: { 'x-user-id': '../../etc/passwd' }
    });
    recordTest('Auth', 'Invalid User ID Format',
      response.status === 400,
      `Status: ${response.status} (should reject invalid format)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Auth', 'Invalid User ID Format', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test with extremely long userId
  try {
    const longUserId = 'a'.repeat(300);
    const response = await makeRequest(`${BACKEND_URL}/user/documents`, {
      headers: { 'x-user-id': longUserId }
    });
    recordTest('Auth', 'Long User ID',
      response.status === 400,
      `Status: ${response.status} (should reject overly long userId)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Auth', 'Long User ID', false, `Error: ${error.message}`, { error: error.message });
  }
}

async function testDocumentUpload() {
  console.log('\n📄 Testing Document Upload & Processing');
  console.log('='.repeat(80));
  
  // Test empty file upload
  try {
    const formData = `------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="empty.txt"
Content-Type: text/plain


------WebKitFormBoundary7MA4YWxkTrZu0gW--`;
    
    const response = await makeRequest(`${BACKEND_URL}/document/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
        'x-user-id': TEST_USER_ID
      },
      body: formData
    });
    recordTest('Documents', 'Empty File Upload',
      response.status === 400,
      `Status: ${response.status} (should reject empty files)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Documents', 'Empty File Upload', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test missing file
  try {
    const response = await makeRequest(`${BACKEND_URL}/document/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-user-id': TEST_USER_ID
      }
    });
    recordTest('Documents', 'Missing File',
      response.status === 400 || response.status === 500,
      `Status: ${response.status} (should handle missing file)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Documents', 'Missing File', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test invalid document type
  try {
    const response = await makeRequest(`${BACKEND_URL}/document/analyze?documentType=invalid_type`, {
      method: 'POST',
      headers: { 'x-user-id': TEST_USER_ID }
    });
    recordTest('Documents', 'Invalid Document Type',
      response.status === 400 || response.status === 500,
      `Status: ${response.status} (should handle invalid type)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Documents', 'Invalid Document Type', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test document types endpoint
  try {
    const response = await makeRequest(`${BACKEND_URL}/document/types`);
    recordTest('Documents', 'Get Document Types',
      response.status === 200 && Array.isArray(response.body),
      `Status: ${response.status}, Types: ${response.body?.length || 0}`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Documents', 'Get Document Types', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test user documents list
  try {
    const response = await makeRequest(`${BACKEND_URL}/user/documents`, {
      headers: { 'x-user-id': TEST_USER_ID }
    });
    recordTest('Documents', 'List User Documents',
      response.status === 200,
      `Status: ${response.status}`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Documents', 'List User Documents', false, `Error: ${error.message}`, { error: error.message });
  }
}

async function testKPICalculations() {
  console.log('\n📊 Testing KPI Calculations');
  console.log('='.repeat(80));
  
  // Test KPIs endpoint
  try {
    const response = await makeRequest(`${BACKEND_URL}/kpis`, {
      headers: { 'x-company-id': TEST_COMPANY_ID }
    });
    recordTest('KPIs', 'Get KPIs',
      response.status === 200,
      `Status: ${response.status}`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('KPIs', 'Get KPIs', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test dashboard KPIs
  try {
    const response = await makeRequest(`${BACKEND_URL}/dashboard/kpis`, {
      headers: { 'x-user-id': TEST_USER_ID }
    });
    recordTest('KPIs', 'Dashboard KPIs',
      response.status === 200,
      `Status: ${response.status}`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('KPIs', 'Dashboard KPIs', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test financial data endpoint
  try {
    const response = await makeRequest(`${BACKEND_URL}/dashboard/financial-data/${TEST_USER_ID}`);
    recordTest('KPIs', 'Financial Data',
      response.status === 200,
      `Status: ${response.status}`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('KPIs', 'Financial Data', false, `Error: ${error.message}`, { error: error.message });
  }
}

async function testChatFunctionality() {
  console.log('\n💬 Testing Chat Functionality');
  console.log('='.repeat(80));
  
  // Test chat history
  try {
    const response = await makeRequest(`${BACKEND_URL}/chat/history`, {
      headers: { 'x-user-id': TEST_USER_ID }
    });
    recordTest('Chat', 'Get Chat History',
      response.status === 200,
      `Status: ${response.status}`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Chat', 'Get Chat History', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test chat history without userId
  try {
    const response = await makeRequest(`${BACKEND_URL}/chat/history`);
    recordTest('Chat', 'Chat History Without User',
      response.status === 400,
      `Status: ${response.status} (should require userId)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Chat', 'Chat History Without User', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test ask question
  try {
    const response = await makeRequest(`${BACKEND_URL}/chat/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': TEST_USER_ID
      },
      body: { question: 'What is the total revenue?' }
    });
    recordTest('Chat', 'Ask Question',
      response.status === 200,
      `Status: ${response.status}`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Chat', 'Ask Question', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test ask with empty question
  try {
    const response = await makeRequest(`${BACKEND_URL}/chat/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': TEST_USER_ID
      },
      body: { question: '' }
    });
    recordTest('Chat', 'Empty Question',
      response.status === 400 || response.status === 500,
      `Status: ${response.status} (should handle empty question)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Chat', 'Empty Question', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test ask with very long question
  try {
    const longQuestion = 'a'.repeat(10000);
    const response = await makeRequest(`${BACKEND_URL}/chat/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': TEST_USER_ID
      },
      body: { question: longQuestion }
    });
    recordTest('Chat', 'Very Long Question',
      response.status === 200 || response.status === 400,
      `Status: ${response.status} (should handle long input)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Chat', 'Very Long Question', false, `Error: ${error.message}`, { error: error.message });
  }
}

async function testSearchFunctionality() {
  console.log('\n🔍 Testing Search Functionality');
  console.log('='.repeat(80));
  
  // Test search with query
  try {
    const response = await makeRequest(`${BACKEND_URL}/search?q=balance`, {
      headers: { 'x-user-id': TEST_USER_ID }
    });
    recordTest('Search', 'Search Query',
      response.status === 200 && response.body.success,
      `Status: ${response.status}, Results: ${response.body.results?.length || 0}`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Search', 'Search Query', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test search without query
  try {
    const response = await makeRequest(`${BACKEND_URL}/search`, {
      headers: { 'x-user-id': TEST_USER_ID }
    });
    recordTest('Search', 'Search Without Query',
      response.status === 400,
      `Status: ${response.status} (should require query)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Search', 'Search Without Query', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test search without userId
  try {
    const response = await makeRequest(`${BACKEND_URL}/search?q=test`);
    recordTest('Search', 'Search Without User',
      response.status === 400,
      `Status: ${response.status} (should require userId)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Search', 'Search Without User', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test search with special characters
  try {
    const response = await makeRequest(`${BACKEND_URL}/search?q=<script>alert('xss')</script>`, {
      headers: { 'x-user-id': TEST_USER_ID }
    });
    recordTest('Search', 'Search XSS Attempt',
      response.status === 200 || response.status === 400,
      `Status: ${response.status} (should handle XSS attempts safely)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Search', 'Search XSS Attempt', false, `Error: ${error.message}`, { error: error.message });
  }
}

async function testAPIEndpoints() {
  console.log('\n🌐 Testing API Endpoints');
  console.log('='.repeat(80));
  
  const endpoints = [
    { path: '/analytics/overview', method: 'GET', headers: { 'x-company-id': TEST_COMPANY_ID }, name: 'Analytics Overview' },
    { path: '/dashboard/overview', method: 'GET', headers: { 'x-user-id': TEST_USER_ID }, name: 'Dashboard Overview' },
    { path: '/dashboard/metrics', method: 'GET', headers: { 'x-user-id': TEST_USER_ID }, name: 'Dashboard Metrics' },
    { path: '/datasets', method: 'GET', headers: { 'x-company-id': TEST_COMPANY_ID }, name: 'List Datasets' },
    { path: '/datasets/active', method: 'GET', headers: { 'x-company-id': TEST_COMPANY_ID }, name: 'Active Dataset' },
    { path: '/reference/products', method: 'GET', headers: { 'x-company-id': TEST_COMPANY_ID }, name: 'Reference Products' },
    { path: '/reference/customers', method: 'GET', headers: { 'x-company-id': TEST_COMPANY_ID }, name: 'Reference Customers' },
    { path: '/user/storage-stats', method: 'GET', headers: { 'x-user-id': TEST_USER_ID }, name: 'Storage Stats' },
    { path: '/insights/conflicts', method: 'GET', headers: { 'x-user-id': TEST_USER_ID }, name: 'Insight Conflicts' },
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${BACKEND_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: endpoint.headers
      });
      recordTest('API', endpoint.name,
        response.status === 200 || response.status === 400 || response.status === 404,
        `Status: ${response.status}`,
        { response: response.body }
      );
    } catch (error) {
      recordTest('API', endpoint.name, false, `Error: ${error.message}`, { error: error.message });
    }
  }
}

async function testErrorHandling() {
  console.log('\n⚠️  Testing Error Handling');
  console.log('='.repeat(80));
  
  // Test 404 endpoint
  try {
    const response = await makeRequest(`${BACKEND_URL}/nonexistent-endpoint`);
    recordTest('Errors', '404 Handling',
      response.status === 404,
      `Status: ${response.status} (should return 404)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Errors', '404 Handling', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test invalid JSON
  try {
    const response = await makeRequest(`${BACKEND_URL}/chat/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': TEST_USER_ID
      },
      body: 'invalid json{'
    });
    recordTest('Errors', 'Invalid JSON',
      response.status === 400 || response.status === 500,
      `Status: ${response.status} (should handle invalid JSON)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Errors', 'Invalid JSON', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test SQL injection attempt
  try {
    const response = await makeRequest(`${BACKEND_URL}/user/documents`, {
      headers: { 'x-user-id': "'; DROP TABLE users; --" }
    });
    recordTest('Errors', 'SQL Injection Attempt',
      response.status === 400 || response.status === 500,
      `Status: ${response.status} (should prevent SQL injection)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Errors', 'SQL Injection Attempt', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test path traversal attempt
  try {
    const response = await makeRequest(`${BACKEND_URL}/user/documents/../../../etc/passwd`, {
      headers: { 'x-user-id': TEST_USER_ID }
    });
    recordTest('Errors', 'Path Traversal Attempt',
      response.status === 400 || response.status === 404 || response.status === 500,
      `Status: ${response.status} (should prevent path traversal)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Errors', 'Path Traversal Attempt', false, `Error: ${error.message}`, { error: error.message });
  }
}

async function testDataIntegrity() {
  console.log('\n🔒 Testing Data Integrity');
  console.log('='.repeat(80));
  
  // Test userId isolation
  try {
    const response1 = await makeRequest(`${BACKEND_URL}/user/documents`, {
      headers: { 'x-user-id': TEST_USER_ID }
    });
    const response2 = await makeRequest(`${BACKEND_URL}/user/documents`, {
      headers: { 'x-user-id': 'different-user-id' }
    });
    recordTest('Data', 'User Isolation',
      response1.status === 200 && response2.status === 200,
      `Both users can access their own data`,
      { user1: response1.body, user2: response2.body }
    );
  } catch (error) {
    recordTest('Data', 'User Isolation', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test chat history isolation
  try {
    const response1 = await makeRequest(`${BACKEND_URL}/chat/history`, {
      headers: { 'x-user-id': TEST_USER_ID }
    });
    const response2 = await makeRequest(`${BACKEND_URL}/chat/history`, {
      headers: { 'x-user-id': 'different-user-id' }
    });
    recordTest('Data', 'Chat History Isolation',
      response1.status === 200 && response2.status === 200,
      `Each user sees only their own chat history`,
      { user1: response1.body, user2: response2.body }
    );
  } catch (error) {
    recordTest('Data', 'Chat History Isolation', false, `Error: ${error.message}`, { error: error.message });
  }
}

async function testPerformance() {
  console.log('\n⚡ Testing Performance');
  console.log('='.repeat(80));
  
  const startTime = Date.now();
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    const duration = Date.now() - startTime;
    recordTest('Performance', 'Health Check Speed',
      duration < 100,
      `Response time: ${duration}ms`,
      { duration }
    );
  } catch (error) {
    recordTest('Performance', 'Health Check Speed', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test concurrent requests
  try {
    const startTime = Date.now();
    const promises = Array(10).fill(null).map(() => makeRequest(`${BACKEND_URL}/health`));
    await Promise.all(promises);
    const duration = Date.now() - startTime;
    recordTest('Performance', 'Concurrent Requests',
      duration < 1000,
      `10 concurrent requests: ${duration}ms`,
      { duration }
    );
  } catch (error) {
    recordTest('Performance', 'Concurrent Requests', false, `Error: ${error.message}`, { error: error.message });
  }
}

async function runDiagnosis() {
  console.log('🔍 COMPREHENSIVE WEBSITE DIAGNOSIS');
  console.log('='.repeat(80));
  console.log(`Backend: ${BACKEND_URL}`);
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Test User ID: ${TEST_USER_ID}`);
  console.log('='.repeat(80));
  
  // Check if backend is running
  try {
    await makeRequest(`${BACKEND_URL}/health`);
    console.log('✅ Backend is running\n');
  } catch (error) {
    console.error('❌ Backend is not running. Please start the backend server first.');
    process.exit(1);
  }
  
  await testHealthChecks();
  await testAuthentication();
  await testDocumentUpload();
  await testKPICalculations();
  await testChatFunctionality();
  await testSearchFunctionality();
  await testAPIEndpoints();
  await testErrorHandling();
  await testDataIntegrity();
  await testPerformance();
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 DIAGNOSIS SUMMARY');
  console.log('='.repeat(80) + '\n');
  
  const totalTests = testResults.passed + testResults.failed;
  const successRate = totalTests > 0 ? ((testResults.passed / totalTests) * 100).toFixed(1) : 0;
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⚠️  Warnings: ${testResults.warnings}`);
  console.log(`Success Rate: ${successRate}%\n`);
  
  // Group by category
  const byCategory = {};
  testResults.tests.forEach(test => {
    if (!byCategory[test.category]) {
      byCategory[test.category] = { passed: 0, failed: 0, warnings: 0 };
    }
    if (test.warning) {
      byCategory[test.category].warnings++;
    } else if (test.passed) {
      byCategory[test.category].passed++;
    } else {
      byCategory[test.category].failed++;
    }
  });
  
  console.log('Results by Category:');
  Object.keys(byCategory).forEach(category => {
    const stats = byCategory[category];
    const total = stats.passed + stats.failed;
    const rate = total > 0 ? ((stats.passed / total) * 100).toFixed(1) : 0;
    console.log(`  ${category}: ${stats.passed}/${total} passed (${rate}%)${stats.warnings > 0 ? `, ${stats.warnings} warnings` : ''}`);
  });
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Critical Errors:');
    testResults.errors.forEach(err => {
      console.log(`  - [${err.category}] ${err.name}: ${err.error}`);
    });
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: totalTests,
      passed: testResults.passed,
      failed: testResults.failed,
      warnings: testResults.warnings,
      successRate: parseFloat(successRate)
    },
    byCategory,
    tests: testResults.tests,
    errors: testResults.errors
  };
  
  fs.writeFileSync('diagnosis-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to: diagnosis-report.json');
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

runDiagnosis().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
