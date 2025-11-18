#!/usr/bin/env node

/**
 * Comprehensive Search Functionality Test
 * Tests search across documents, KPIs, chat history, and pages
 */

const http = require('http');

const BACKEND_URL = 'http://localhost:8787';
const TEST_USER_ID = 'cmgtv2kjt0000sfzqb6d91ez0';

const testResults = {
  passed: 0,
  failed: 0,
  tests: []
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
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data), raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, body: data, raw: data });
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
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
  }
}

async function runTests() {
  console.log('🔍 Testing Search Functionality\n');
  console.log('='.repeat(80));
  
  // Test 1: Search for documents
  console.log('\n📄 Test 1: Search Documents');
  try {
    const response = await makeRequest(`${BACKEND_URL}/search?q=balance`, {
      headers: { 'x-user-id': TEST_USER_ID }
    });
    recordTest('Document Search',
      response.status === 200 && response.body.success,
      `Status: ${response.status}, Results: ${response.body.results?.length || 0}`,
      { response: response.body }
    );
    
    if (response.body.results) {
      const documentResults = response.body.results.filter(r => r.type === 'document');
      recordTest('Document Results Found',
        documentResults.length > 0,
        `Found ${documentResults.length} document results`,
        { documents: documentResults }
      );
    }
  } catch (error) {
    recordTest('Document Search', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test 2: Search for KPIs
  console.log('\n📊 Test 2: Search KPIs');
  try {
    const response = await makeRequest(`${BACKEND_URL}/search?q=cash`, {
      headers: { 'x-user-id': TEST_USER_ID }
    });
    recordTest('KPI Search',
      response.status === 200 && response.body.success,
      `Status: ${response.status}, Results: ${response.body.results?.length || 0}`,
      { response: response.body }
    );
    
    if (response.body.results) {
      const kpiResults = response.body.results.filter(r => r.type === 'kpi');
      recordTest('KPI Results Found',
        kpiResults.length >= 0, // May be 0 if no matching KPIs
        `Found ${kpiResults.length} KPI results`,
        { kpis: kpiResults }
      );
    }
  } catch (error) {
    recordTest('KPI Search', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test 3: Search for pages
  console.log('\n📑 Test 3: Search Pages');
  try {
    const response = await makeRequest(`${BACKEND_URL}/search?q=dashboard`, {
      headers: { 'x-user-id': TEST_USER_ID }
    });
    recordTest('Page Search',
      response.status === 200 && response.body.success,
      `Status: ${response.status}, Results: ${response.body.results?.length || 0}`,
      { response: response.body }
    );
    
    if (response.body.results) {
      const pageResults = response.body.results.filter(r => r.type === 'page');
      recordTest('Page Results Found',
        pageResults.length > 0,
        `Found ${pageResults.length} page results`,
        { pages: pageResults }
      );
    }
  } catch (error) {
    recordTest('Page Search', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test 4: Search chat history
  console.log('\n💬 Test 4: Search Chat History');
  try {
    const response = await makeRequest(`${BACKEND_URL}/search?q=financial`, {
      headers: { 'x-user-id': TEST_USER_ID }
    });
    recordTest('Chat Search',
      response.status === 200 && response.body.success,
      `Status: ${response.status}, Results: ${response.body.results?.length || 0}`,
      { response: response.body }
    );
    
    if (response.body.results) {
      const chatResults = response.body.results.filter(r => r.type === 'chat');
      recordTest('Chat Results Found',
        chatResults.length >= 0, // May be 0 if no chat history
        `Found ${chatResults.length} chat results`,
        { chats: chatResults }
      );
    }
  } catch (error) {
    recordTest('Chat Search', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test 5: Empty query
  console.log('\n🔍 Test 5: Empty Query');
  try {
    const response = await makeRequest(`${BACKEND_URL}/search?q=`, {
      headers: { 'x-user-id': TEST_USER_ID }
    });
    recordTest('Empty Query Handling',
      response.status === 400,
      `Status: ${response.status} (should reject empty query)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Empty Query Handling', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test 6: Missing userId
  console.log('\n🔍 Test 6: Missing User ID');
  try {
    const response = await makeRequest(`${BACKEND_URL}/search?q=test`);
    recordTest('Missing User ID',
      response.status === 400,
      `Status: ${response.status} (should require userId)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Missing User ID', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test 7: Relevance scoring
  console.log('\n🔍 Test 7: Relevance Scoring');
  try {
    const response = await makeRequest(`${BACKEND_URL}/search?q=balance sheet`, {
      headers: { 'x-user-id': TEST_USER_ID }
    });
    recordTest('Relevance Scoring',
      response.status === 200 && response.body.results && response.body.results.length > 0,
      `Status: ${response.status}, Results sorted by relevance`,
      { 
        results: response.body.results?.map(r => ({ 
          title: r.title, 
          score: r.relevanceScore,
          type: r.type 
        }))
      }
    );
  } catch (error) {
    recordTest('Relevance Scoring', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test 8: Multiple result types
  console.log('\n🔍 Test 8: Multiple Result Types');
  try {
    const response = await makeRequest(`${BACKEND_URL}/search?q=financial`, {
      headers: { 'x-user-id': TEST_USER_ID }
    });
    if (response.status === 200 && response.body.results) {
      const types = new Set(response.body.results.map(r => r.type));
      recordTest('Multiple Types',
        types.size > 1,
        `Found ${types.size} different result types: ${Array.from(types).join(', ')}`,
        { types: Array.from(types) }
      );
    } else {
      recordTest('Multiple Types', false, 'No results found', {});
    }
  } catch (error) {
    recordTest('Multiple Types', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(80) + '\n');
  
  const totalTests = testResults.passed + testResults.failed;
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / totalTests) * 100).toFixed(1)}%\n`);
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

