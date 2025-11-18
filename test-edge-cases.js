#!/usr/bin/env node

/**
 * Comprehensive Edge Case Testing for Financial Statement Generator
 */

const http = require('http');

// Test cases for different edge cases
const testCases = [
  {
    name: "✅ Valid Data Test",
    data: {
      companyName: "Apple Inc",
      cash: 50000000000,
      accounts_receivable: 25000000000,
      accounts_payable: 30000000000,
      common_stock: 20000000000,
      retained_earnings: 25000000000, // Adjusted to balance: 75B assets = 30B liabilities + 45B equity
      returnFormat: "json"
    },
    expectedResult: "success"
  },
  {
    name: "❌ Missing Required Fields",
    data: {
      cash: 50000000000,
      // Missing companyName
      returnFormat: "json"
    },
    expectedResult: "validation_errors"
  },
  {
    name: "❌ Invalid Data Types",
    data: {
      companyName: "Test Company",
      cash: "not_a_number",
      revenue: "invalid",
      cost_of_goods_sold: "also_invalid",
      returnFormat: "json"
    },
    expectedResult: "validation_errors"
  },
  {
    name: "⚠️ Negative Values (where not allowed)",
    data: {
      companyName: "Test Company",
      cash: -1000000, // Should be positive
      revenue: 1000000,
      cost_of_goods_sold: 500000,
      returnFormat: "json"
    },
    expectedResult: "validation_warnings"
  },
  {
    name: "❌ Mathematical Errors - Balance Sheet",
    data: {
      companyName: "Test Company",
      totalAssets: 1000000,
      totalLiabilities: 600000,
      totalEquity: 300000, // Should be 400000 to balance
      cash: 100000,
      returnFormat: "json"
    },
    expectedResult: "math_errors"
  },
  {
    name: "⚠️ Extremely Large Numbers",
    data: {
      companyName: "Test Company",
      cash: 1e20, // Extremely large
      revenue: 1e18,
      cost_of_goods_sold: 1e17,
      returnFormat: "json"
    },
    expectedResult: "validation_warnings"
  },
  {
    name: "❌ Empty Data",
    data: {
      returnFormat: "json"
    },
    expectedResult: "validation_errors"
  },
  {
    name: "❌ Null/Undefined Values",
    data: {
      companyName: "Test Company",
      cash: null,
      revenue: undefined,
      cost_of_goods_sold: "",
      returnFormat: "json"
    },
    expectedResult: "validation_errors"
  },
  {
    name: "⚠️ String Numbers (should convert)",
    data: {
      companyName: "Test Company",
      cash: "50000000",
      accounts_payable: "30000000",
      common_stock: "20000000",
      returnFormat: "json"
    },
    expectedResult: "success"
  },
  {
    name: "❌ Division by Zero Risk",
    data: {
      companyName: "Test Company",
      cash: 1000000,
      revenue: 0, // This could cause division by zero in ratios
      cost_of_goods_sold: 500000,
      returnFormat: "json"
    },
    expectedResult: "validation_warnings"
  }
];

async function testEdgeCases() {
  console.log('🧪 Testing Financial Statement Generator Edge Cases...\n');
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`);
    console.log('─'.repeat(50));
    
    try {
      // Test Balance Sheet
      const balanceSheetResponse = await makeRequest('POST', '/generate/balance-sheet', testCase.data);
      
      if (balanceSheetResponse.includes('"success"')) {
        const data = JSON.parse(balanceSheetResponse);
        
        if (data.statement && data.statement.validation) {
          const validation = data.statement.validation;
          console.log(`   Errors: ${validation.errors.length}`);
          console.log(`   Warnings: ${validation.warnings.length}`);
          console.log(`   Overall Valid: ${validation.overallValid}`);
          
          if (validation.errors.length > 0) {
            console.log('   Error Details:');
            validation.errors.forEach(error => console.log(`     - ${error}`));
          }
          
          if (validation.warnings.length > 0) {
            console.log('   Warning Details:');
            validation.warnings.forEach(warning => console.log(`     - ${warning}`));
          }
          
          // Determine if test passed based on expected result
          const hasErrors = validation.errors.length > 0;
          const hasWarnings = validation.warnings.length > 0;
          const isValid = validation.overallValid;
          
          let testPassed = false;
          switch (testCase.expectedResult) {
            case "success":
              testPassed = isValid && !hasErrors;
              break;
            case "validation_errors":
              testPassed = hasErrors && !isValid;
              break;
            case "validation_warnings":
              testPassed = hasWarnings && !hasErrors;
              break;
            case "math_errors":
              testPassed = hasErrors && validation.errors.some(e => e.includes('equation') || e.includes('balance'));
              break;
          }
          
          if (testPassed) {
            console.log('   ✅ Test PASSED');
            passedTests++;
          } else {
            console.log('   ❌ Test FAILED');
          }
        }
      } else {
        console.log('   ❌ No validation data returned');
      }
      
    } catch (error) {
      console.log(`   ❌ Test ERROR: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All edge cases handled correctly!');
  } else {
    console.log('⚠️ Some edge cases need attention');
  }
}

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8788,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve(responseData);
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

// Run the tests
testEdgeCases();
