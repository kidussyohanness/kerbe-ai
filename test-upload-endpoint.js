/**
 * Test script to verify document upload endpoint works correctly
 * Tests the actual API endpoint with FormData
 */

const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8787';
const TEST_USER_ID = 'test-user-123';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testHealth() {
  log('\n[1/5] Testing backend health...', 'blue');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    if (response.ok) {
      log('✓ Backend is running', 'green');
      return true;
    } else {
      log(`✗ Backend health check failed: ${JSON.stringify(data)}`, 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Cannot connect to backend: ${error.message}`, 'red');
    log(`  Make sure the backend is running on ${BASE_URL}`, 'yellow');
    return false;
  }
}

async function testCSVUpload() {
  log('\n[2/5] Creating test CSV file...', 'blue');
  
  // Create test CSV
  const testDir = path.join(__dirname, 'test-data');
  fs.mkdirSync(testDir, { recursive: true });
  
  const csvPath = path.join(testDir, 'test-upload.csv');
  const csvContent = `Company,Period,Total Assets,Total Liabilities,Total Equity
Test Company Inc,Q4 2024,1000000,600000,400000`;
  
  fs.writeFileSync(csvPath, csvContent);
  log(`✓ Created test CSV: ${csvPath}`, 'green');
  
  log('\n[3/5] Testing CSV upload to /document/analyze...', 'blue');
  
  try {
    const formData = new FormData();
    const fileStream = fs.createReadStream(csvPath);
    formData.append('file', fileStream, 'test-upload.csv');
    formData.append('documentType', 'balance_sheet');
    formData.append('businessContext', 'Test upload from script');
    
    log('Sending request with FormData...', 'yellow');
    log(`  URL: ${BASE_URL}/document/analyze`, 'yellow');
    log(`  Method: POST`, 'yellow');
    log(`  Headers: x-user-id: ${TEST_USER_ID}`, 'yellow');
    
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}/document/analyze`, {
      method: 'POST',
      body: formData,
      headers: {
        'x-user-id': TEST_USER_ID,
        'x-company-id': 'seed-company',
        // Don't set Content-Type - let FormData handle it
        ...formData.getHeaders(),
      },
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`Response received in ${duration}s`, 'yellow');
    log(`Status: ${response.status} ${response.statusText}`, 'yellow');
    
    const responseData = await response.json();
    
    if (!response.ok) {
      log(`✗ Upload failed: ${response.status}`, 'red');
      log(`Response: ${JSON.stringify(responseData, null, 2)}`, 'red');
      return false;
    }
    
    if (responseData.success) {
      log('✓ Upload successful!', 'green');
      log(`  Document ID: ${responseData.documentId}`, 'green');
      log(`  Saved to DB: ${responseData.saved ? 'Yes' : 'No'}`, 'green');
      
      if (responseData.analysisResult) {
        const analysis = responseData.analysisResult;
        log(`  Confidence: ${analysis.confidence}%`, 'green');
        if (analysis.extractedData?.companyName) {
          log(`  Company: ${analysis.extractedData.companyName}`, 'green');
        }
      }
      
      return true;
    } else {
      log(`✗ Analysis failed: ${responseData.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Upload error: ${error.message}`, 'red');
    if (error.stack) {
      log(`Stack: ${error.stack}`, 'red');
    }
    return false;
  }
}

async function testDocumentQuery() {
  log('\n[4/5] Testing document query...', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/user/documents`, {
      headers: {
        'x-user-id': TEST_USER_ID,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      log(`✓ Found ${data.documents?.length || 0} documents`, 'green');
      return true;
    } else {
      log(`✗ Query failed: ${data.error || response.statusText}`, 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Query error: ${error.message}`, 'red');
    return false;
  }
}

async function testErrorHandling() {
  log('\n[5/5] Testing error handling (missing file)...', 'blue');
  
  try {
    const formData = new FormData();
    formData.append('documentType', 'balance_sheet');
    // Intentionally not adding file
    
    const response = await fetch(`${BASE_URL}/document/analyze`, {
      method: 'POST',
      body: formData,
      headers: {
        'x-user-id': TEST_USER_ID,
        ...formData.getHeaders(),
      },
    });
    
    const data = await response.json();
    
    if (!response.ok && !data.success) {
      log('✓ Error handling works correctly', 'green');
      log(`  Error message: ${data.error}`, 'green');
      return true;
    } else {
      log('✗ Expected error but got success', 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Error handling test failed: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('========================================', 'blue');
  log('Document Upload Endpoint Test', 'blue');
  log('========================================', 'blue');
  
  // Test 1: Health check
  const healthOk = await testHealth();
  if (!healthOk) {
    log('\n✗ Backend is not accessible. Please start the backend server.', 'red');
    process.exit(1);
  }
  
  // Test 2: CSV Upload
  const uploadOk = await testCSVUpload();
  
  // Test 3: Document Query
  const queryOk = await testDocumentQuery();
  
  // Test 4: Error Handling
  const errorOk = await testErrorHandling();
  
  // Summary
  log('\n========================================', 'blue');
  log('Test Summary', 'blue');
  log('========================================', 'blue');
  
  const results = [
    { name: 'Health Check', ok: healthOk },
    { name: 'CSV Upload', ok: uploadOk },
    { name: 'Document Query', ok: queryOk },
    { name: 'Error Handling', ok: errorOk },
  ];
  
  let allPassed = true;
  results.forEach(({ name, ok }) => {
    if (ok) {
      log(`✓ ${name}: PASSED`, 'green');
    } else {
      log(`✗ ${name}: FAILED`, 'red');
      allPassed = false;
    }
  });
  
  log('\n========================================', 'blue');
  if (allPassed) {
    log('All tests passed! ✓', 'green');
    process.exit(0);
  } else {
    log('Some tests failed. Please check the errors above.', 'red');
    process.exit(1);
  }
}

// Use native fetch or require node-fetch
if (typeof fetch === 'undefined') {
  try {
    global.fetch = require('node-fetch');
  } catch (e) {
    console.error('Error: fetch is not available. Please install node-fetch or use Node 18+');
    process.exit(1);
  }
}

runTests().catch((error) => {
  log(`\n✗ Test runner error: ${error.message}`, 'red');
  if (error.stack) {
    log(`Stack: ${error.stack}`, 'red');
  }
  process.exit(1);
});


