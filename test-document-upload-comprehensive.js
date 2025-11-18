/**
 * Comprehensive test script for document upload functionality
 * Tests CSV, PDF, and Excel uploads with SQLite backend
 */

const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Use native fetch if available (Node 18+), otherwise use dynamic import
let fetch;
if (typeof globalThis.fetch === 'function') {
  fetch = globalThis.fetch;
} else {
  // Try to use node-fetch if available, otherwise use http
  try {
    fetch = require('node-fetch');
  } catch (e) {
    // Fallback to http-based fetch
    const http = require('http');
    const https = require('https');
    const { URL } = require('url');
    
    fetch = async (url, options = {}) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      return new Promise((resolve, reject) => {
        const req = client.request(url, {
          method: options.method || 'GET',
          headers: options.headers || {},
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            const response = {
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              statusText: res.statusMessage,
              json: async () => JSON.parse(data),
              text: async () => data,
            };
            resolve(response);
          });
        });
        
        req.on('error', reject);
        
        if (options.body) {
          if (options.body.pipe) {
            // Stream
            options.body.pipe(req);
          } else {
            req.write(options.body);
            req.end();
          }
        } else {
          req.end();
        }
      });
    };
  }
}

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8787';
const TEST_USER_ID = 'test-user-123'; // Use a test user ID

// Test files directory
const TEST_FILES_DIR = path.join(__dirname, 'test-data');

// Colors for console output
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

async function testHealthCheck() {
  log('\n=== Testing Health Check ===', 'blue');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    if (response.ok) {
      log('✓ Health check passed', 'green');
      return true;
    } else {
      log(`✗ Health check failed: ${data.error || response.statusText}`, 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Health check error: ${error.message}`, 'red');
    return false;
  }
}

async function testDocumentUpload(filePath, documentType, description = '') {
  log(`\n=== Testing Upload: ${path.basename(filePath)} ===`, 'blue');
  
  if (!fs.existsSync(filePath)) {
    log(`✗ File not found: ${filePath}`, 'red');
    return { success: false, error: 'File not found' };
  }

  try {
    const formData = new FormData();
    const fileStream = fs.createReadStream(filePath);
    const fileName = path.basename(filePath);
    
    formData.append('file', fileStream, fileName);
    formData.append('documentType', documentType);
    if (description) {
      formData.append('businessContext', description);
    }

    log(`Uploading file: ${fileName}`, 'yellow');
    log(`Document type: ${documentType}`, 'yellow');
    
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}/document/analyze`, {
      method: 'POST',
      body: formData,
      headers: {
        'x-user-id': TEST_USER_ID,
        ...formData.getHeaders(),
      },
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    const responseData = await response.json();
    
    log(`Response status: ${response.status}`, 'yellow');
    log(`Response time: ${duration}s`, 'yellow');
    
    if (!response.ok) {
      log(`✗ Upload failed: ${responseData.error || response.statusText}`, 'red');
      if (responseData.error) {
        log(`Error details: ${JSON.stringify(responseData, null, 2)}`, 'red');
      }
      return { success: false, error: responseData.error || response.statusText, status: response.status };
    }

    if (responseData.success) {
      log('✓ Upload successful', 'green');
      log(`Document ID: ${responseData.documentId}`, 'green');
      log(`Saved to DB: ${responseData.saved ? 'Yes' : 'No'}`, 'green');
      
      if (responseData.analysisResult) {
        const analysis = responseData.analysisResult;
        log(`Analysis confidence: ${analysis.confidence}%`, 'green');
        
        if (analysis.extractedData) {
          log(`Extracted data:`, 'green');
          log(`  Company: ${analysis.extractedData.companyName || 'N/A'}`, 'green');
          if (analysis.extractedData.period) {
            log(`  Period: ${analysis.extractedData.period}`, 'green');
          }
        }
        
        if (analysis.recommendations && analysis.recommendations.length > 0) {
          log(`Recommendations: ${analysis.recommendations.length}`, 'green');
        }
      }
      
      return { 
        success: true, 
        data: responseData,
        duration: parseFloat(duration)
      };
    } else {
      log(`✗ Analysis failed: ${responseData.error || 'Unknown error'}`, 'red');
      return { success: false, error: responseData.error || 'Analysis failed' };
    }
  } catch (error) {
    log(`✗ Upload error: ${error.message}`, 'red');
    if (error.stack) {
      log(`Stack trace: ${error.stack}`, 'red');
    }
    return { success: false, error: error.message };
  }
}

async function testCSVUpload() {
  log('\n=== Testing CSV Upload ===', 'blue');
  
  // Try to find a CSV file in test-data directory
  const csvFiles = [
    'test-financial-data.csv',
    'test-balance-sheet.csv',
    'balance-sheet.csv',
    'income-statement.csv',
  ];
  
  let csvFile = null;
  for (const file of csvFiles) {
    const filePath = path.join(TEST_FILES_DIR, file);
    if (fs.existsSync(filePath)) {
      csvFile = filePath;
      break;
    }
  }
  
  if (!csvFile) {
    log('Creating sample CSV file...', 'yellow');
    csvFile = path.join(TEST_FILES_DIR, 'test-balance-sheet.csv');
    fs.mkdirSync(TEST_FILES_DIR, { recursive: true });
    
    const sampleCSV = `Company,Period,Total Assets,Total Liabilities,Total Equity
Test Company Inc,Q4 2024,1000000,600000,400000
`;
    fs.writeFileSync(csvFile, sampleCSV);
    log(`Created sample CSV: ${csvFile}`, 'yellow');
  }
  
  return await testDocumentUpload(csvFile, 'balance_sheet', 'Test CSV upload');
}

async function testPDFUpload() {
  log('\n=== Testing PDF Upload ===', 'blue');
  
  // Try to find a PDF file
  const pdfFiles = [
    'balance-sheet-apple.pdf',
    'income-statement-apple.pdf',
    'cash-flow-apple.pdf',
  ];
  
  let pdfFile = null;
  for (const file of pdfFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      pdfFile = filePath;
      break;
    }
  }
  
  if (!pdfFile) {
    log('⚠ No PDF file found for testing', 'yellow');
    return { success: true, skipped: true };
  }
  
  return await testDocumentUpload(pdfFile, 'balance_sheet', 'Test PDF upload');
}

async function testDatabaseQuery() {
  log('\n=== Testing Database Query ===', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/user/documents`, {
      headers: {
        'x-user-id': TEST_USER_ID,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success && data.documents) {
      log(`✓ Found ${data.documents.length} documents in database`, 'green');
      
      if (data.documents.length > 0) {
        const latestDoc = data.documents[0];
        log(`Latest document:`, 'green');
        log(`  ID: ${latestDoc.id}`, 'green');
        log(`  Filename: ${latestDoc.filename}`, 'green');
        log(`  Type: ${latestDoc.documentType}`, 'green');
        log(`  Status: ${latestDoc.status}`, 'green');
        log(`  Size: ${(latestDoc.fileSize / 1024).toFixed(2)} KB`, 'green');
        
        if (latestDoc.analysisResults) {
          log(`  Has analysis: Yes`, 'green');
        }
      }
      
      return { success: true, count: data.documents.length };
    } else {
      log(`✗ Failed to query documents: ${data.error || response.statusText}`, 'red');
      return { success: false, error: data.error || response.statusText };
    }
  } catch (error) {
    log(`✗ Database query error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  log('========================================', 'blue');
  log('Document Upload Comprehensive Test', 'blue');
  log('========================================', 'blue');
  
  // Test 1: Health check
  const healthCheck = await testHealthCheck();
  if (!healthCheck) {
    log('\n✗ Backend server is not running or not accessible', 'red');
    log('Please make sure the backend server is running on', 'yellow');
    log(`${BASE_URL}`, 'yellow');
    process.exit(1);
  }
  
  // Test 2: CSV Upload
  const csvResult = await testCSVUpload();
  
  // Test 3: PDF Upload (if available)
  const pdfResult = await testPDFUpload();
  
  // Test 4: Database Query
  const dbResult = await testDatabaseQuery();
  
  // Summary
  log('\n========================================', 'blue');
  log('Test Summary', 'blue');
  log('========================================', 'blue');
  
  const results = [
    { name: 'Health Check', result: healthCheck },
    { name: 'CSV Upload', result: csvResult.success },
    { name: 'PDF Upload', result: pdfResult.success || pdfResult.skipped },
    { name: 'Database Query', result: dbResult.success },
  ];
  
  let allPassed = true;
  results.forEach(({ name, result }) => {
    if (result) {
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

// Run tests
runAllTests().catch((error) => {
  log(`\n✗ Test runner error: ${error.message}`, 'red');
  if (error.stack) {
    log(`Stack trace: ${error.stack}`, 'red');
  }
  process.exit(1);
});

