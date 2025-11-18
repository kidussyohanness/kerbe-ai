#!/usr/bin/env node

/**
 * Comprehensive Chat History Testing Script
 * Tests all edge cases for chat history functionality
 */

const http = require('http');

const BACKEND_URL = 'http://localhost:8787';
const TEST_USER_ID = 'cmgtv2kjt0000sfzqb6d91ez0'; // Use existing test user

const testResults = {
  passed: 0,
  failed: 0,
  tests: [],
  errors: []
};

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port || 8787,
      path: urlObj.pathname,
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
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
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
    if (details.error) {
      testResults.errors.push({ test: name, error: details.error });
    }
  }
}

async function runTests() {
  console.log('🧪 Starting Comprehensive Chat History Tests\n');
  console.log('='.repeat(80));
  
  // Test 1: Valid userId - should return messages (or empty array)
  console.log('\n📋 Test 1: Valid userId');
  try {
    const response = await makeRequest(`${BACKEND_URL}/chat/history`, {
      headers: { 'x-user-id': TEST_USER_ID }
    });
    recordTest('Valid userId Request',
      response.status === 200 && response.body.messages !== undefined,
      `Status: ${response.status}, Has messages: ${Array.isArray(response.body.messages)}`,
      { response: response.body }
    );
    
    if (Array.isArray(response.body.messages)) {
      recordTest('Messages Array Valid',
        true,
        `Found ${response.body.messages.length} messages`,
        { count: response.body.messages.length }
      );
    }
  } catch (error) {
    recordTest('Valid userId Request', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test 2: Missing userId header
  console.log('\n📋 Test 2: Missing userId');
  try {
    const response = await makeRequest(`${BACKEND_URL}/chat/history`);
    recordTest('Missing userId Header',
      response.status === 400,
      `Status: ${response.status} (should be 400)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Missing userId Header', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test 3: Invalid userId format
  console.log('\n📋 Test 3: Invalid userId Format');
  try {
    const response = await makeRequest(`${BACKEND_URL}/chat/history`, {
      headers: { 'x-user-id': 'invalid@user#id' }
    });
    recordTest('Invalid userId Format',
      response.status === 400,
      `Status: ${response.status} (should be 400)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Invalid userId Format', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test 4: Empty userId
  console.log('\n📋 Test 4: Empty userId');
  try {
    const response = await makeRequest(`${BACKEND_URL}/chat/history`, {
      headers: { 'x-user-id': '' }
    });
    recordTest('Empty userId',
      response.status === 400,
      `Status: ${response.status} (should be 400)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Empty userId', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test 5: Non-existent userId (should return empty array, not error)
  console.log('\n📋 Test 5: Non-existent userId');
  try {
    const response = await makeRequest(`${BACKEND_URL}/chat/history`, {
      headers: { 'x-user-id': 'non-existent-user-12345' }
    });
    recordTest('Non-existent userId',
      response.status === 200 && Array.isArray(response.body.messages),
      `Status: ${response.status}, Messages: ${response.body.messages?.length || 0}`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Non-existent userId', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test 6: SQL injection attempt
  console.log('\n📋 Test 6: SQL Injection Attempt');
  try {
    const response = await makeRequest(`${BACKEND_URL}/chat/history`, {
      headers: { 'x-user-id': "'; DROP TABLE chatmessages; --" }
    });
    recordTest('SQL Injection Prevention',
      response.status === 400,
      `Status: ${response.status} (should reject invalid format)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('SQL Injection Prevention', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test 7: Very long userId
  console.log('\n📋 Test 7: Very Long userId');
  try {
    const longUserId = 'a'.repeat(1000);
    const response = await makeRequest(`${BACKEND_URL}/chat/history`, {
      headers: { 'x-user-id': longUserId }
    });
    recordTest('Very Long userId',
      response.status === 400 || response.status === 200,
      `Status: ${response.status}`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Very Long userId', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test 8: Special characters in userId
  console.log('\n📋 Test 8: Special Characters in userId');
  try {
    const response = await makeRequest(`${BACKEND_URL}/chat/history`, {
      headers: { 'x-user-id': 'user<script>alert("xss")</script>' }
    });
    recordTest('Special Characters userId',
      response.status === 400,
      `Status: ${response.status} (should reject)`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Special Characters userId', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test 9: Valid userId with underscore and hyphen
  console.log('\n📋 Test 9: Valid userId with Special Chars');
  try {
    const response = await makeRequest(`${BACKEND_URL}/chat/history`, {
      headers: { 'x-user-id': 'test_user-123' }
    });
    recordTest('Valid Special Chars userId',
      response.status === 200,
      `Status: ${response.status}`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Valid Special Chars userId', false, `Error: ${error.message}`, { error: error.message });
  }
  
  // Test 10: Response structure validation
  console.log('\n📋 Test 10: Response Structure');
  try {
    const response = await makeRequest(`${BACKEND_URL}/chat/history`, {
      headers: { 'x-user-id': TEST_USER_ID }
    });
    const hasMessages = response.body.messages !== undefined;
    const isArray = Array.isArray(response.body.messages);
    const messagesValid = isArray ? response.body.messages.every(msg => 
      msg.role && msg.content && (msg.createdAt === undefined || typeof msg.createdAt === 'string')
    ) : true;
    
    recordTest('Response Structure Valid',
      hasMessages && isArray && messagesValid,
      `Has messages: ${hasMessages}, Is array: ${isArray}, Messages valid: ${messagesValid}`,
      { response: response.body }
    );
  } catch (error) {
    recordTest('Response Structure Valid', false, `Error: ${error.message}`, { error: error.message });
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
  
  if (testResults.errors.length > 0) {
    console.log('⚠️  Errors Found:');
    testResults.errors.forEach((err, idx) => {
      console.log(`   ${idx + 1}. ${err.test}: ${err.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(80));
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

