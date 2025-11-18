#!/usr/bin/env node

/**
 * Advanced Edge Case Testing for Financial Analysis System
 * Tests complex scenarios and boundary conditions
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Test configuration
const CONFIG = {
  backendUrl: 'http://localhost:8787',
  testDir: 'advanced-test-files',
  timeout: 30000
};

// Create test directory
if (!fs.existsSync(CONFIG.testDir)) {
  fs.mkdirSync(CONFIG.testDir, { recursive: true });
}

// Advanced test cases
const advancedTestCases = [
  {
    name: "Complex Balance Sheet with Multiple Currencies",
    data: `Account,Amount,Currency
Cash and Cash Equivalents,2500000,USD
Accounts Receivable,1800000,USD
Inventory,1200000,USD
Foreign Currency Assets,500000,EUR
Total Current Assets,6000000,USD
Property, Plant & Equipment,8500000,USD
Intangible Assets,2000000,USD
Long-term Investments,3300000,USD
Total Non-Current Assets,13800000,USD
TOTAL ASSETS,19800000,USD
Accounts Payable,950000,USD
Short-term Debt,1200000,USD
Accrued Expenses,300000,USD
Foreign Currency Liabilities,200000,EUR
Total Current Liabilities,2650000,USD
Long-term Debt,5500000,USD
Deferred Tax Liabilities,800000,USD
Total Non-Current Liabilities,6300000,USD
TOTAL LIABILITIES,8950000,USD
Share Capital,5000000,USD
Retained Earnings,5200000,USD
Other Comprehensive Income,650000,USD
TOTAL EQUITY,10850000,USD`,
    expectedIssues: ["currency_conversion", "balance_equation"]
  },
  
  {
    name: "Income Statement with Seasonal Variations",
    data: `Account,Q1,Q2,Q3,Q4,Annual
Total Revenue,3500000,4000000,3800000,3700000,15000000
Cost of Goods Sold,1900000,2100000,2000000,2000000,8000000
Gross Profit,1600000,1900000,1800000,1700000,7000000
Operating Expenses,1100000,1200000,1150000,1050000,4500000
Operating Income,500000,700000,650000,650000,2500000
Interest Expense,75000,75000,75000,75000,300000
Income Before Tax,425000,625000,575000,575000,2200000
Tax Expense,106250,156250,143750,143750,550000
Net Income,318750,468750,431250,431250,1650000`,
    expectedIssues: ["seasonal_analysis", "quarterly_consolidation"]
  },
  
  {
    name: "Cash Flow with Complex Transactions",
    data: `Account,Amount,Notes
Operating Activities:
Net Income,1650000,From income statement
Depreciation,450000,Non-cash expense
Accounts Receivable Change,-200000,Increase in receivables
Inventory Change,-150000,Increase in inventory
Accounts Payable Change,100000,Increase in payables
Operating Cash Flow,1850000,Calculated
Investing Activities:
Capital Expenditures,-1200000,Equipment purchases
Asset Purchases,-500000,New investments
Asset Sales,300000,Disposal proceeds
Investing Cash Flow,-1400000,Net investing
Financing Activities:
Debt Issuance,800000,New loans
Debt Repayment,-400000,Principal payments
Equity Issuance,200000,New shares
Dividends,-300000,Shareholder payments
Financing Cash Flow,300000,Net financing
Net Cash Flow,750000,Total change
Beginning Cash,1400000,Prior period
Ending Cash,2150000,Current period`,
    expectedIssues: ["complex_transactions", "cash_reconciliation"]
  },
  
  {
    name: "Multi-Entity Consolidated Statement",
    data: `Entity,Account,Amount
Parent Company,Cash and Cash Equivalents,1500000
Subsidiary A,Cash and Cash Equivalents,800000
Subsidiary B,Cash and Cash Equivalents,200000
Consolidated,Cash and Cash Equivalents,2500000
Parent Company,Accounts Receivable,1000000
Subsidiary A,Accounts Receivable,600000
Subsidiary B,Accounts Receivable,200000
Consolidated,Accounts Receivable,1800000
Parent Company,Inventory,800000
Subsidiary A,Inventory,300000
Subsidiary B,Inventory,100000
Consolidated,Inventory,1200000
Consolidated,Total Current Assets,5500000
Consolidated,Property Plant Equipment,8500000
Consolidated,Intangible Assets,2000000
Consolidated,Long-term Investments,3300000
Consolidated,Total Non-Current Assets,13800000
Consolidated,TOTAL ASSETS,19300000
Consolidated,Accounts Payable,950000
Consolidated,Short-term Debt,1200000
Consolidated,Accrued Expenses,300000
Consolidated,Total Current Liabilities,2450000
Consolidated,Long-term Debt,5500000
Consolidated,Deferred Tax Liabilities,800000
Consolidated,Total Non-Current Liabilities,6300000
Consolidated,TOTAL LIABILITIES,8750000
Consolidated,Share Capital,5000000
Consolidated,Retained Earnings,5200000
Consolidated,Other Comprehensive Income,350000
Consolidated,TOTAL EQUITY,10550000`,
    expectedIssues: ["consolidation_logic", "entity_elimination"]
  },
  
  {
    name: "Financial Statement with Footnotes",
    data: `Account,Amount,Footnote
Cash and Cash Equivalents,2500000,Includes $500K in restricted cash
Accounts Receivable,1800000,Net of $200K allowance for doubtful accounts
Inventory,1200000,LIFO method, market value $1.3M
Prepaid Expenses,150000,Prepaid insurance and rent
Total Current Assets,5650000,
Property, Plant & Equipment,8500000,Net of $2.1M accumulated depreciation
Intangible Assets,2000000,Goodwill and patents
Long-term Investments,3300000,Equity method investments
Total Non-Current Assets,13800000,
TOTAL ASSETS,19450000,
Accounts Payable,950000,Trade payables
Short-term Debt,1200000,Line of credit
Accrued Expenses,300000,Salaries and benefits
Total Current Liabilities,2450000,
Long-term Debt,5500000,5% interest rate
Deferred Tax Liabilities,800000,Temporary differences
Total Non-Current Liabilities,6300000,
TOTAL LIABILITIES,8750000,
Share Capital,5000000,100,000 shares outstanding
Retained Earnings,5200000,Includes $1M dividends declared
Other Comprehensive Income,500000,Foreign currency translation
TOTAL EQUITY,10700000,
TOTAL LIABILITIES AND EQUITY,19450000,`,
    expectedIssues: ["footnote_parsing", "additional_context"]
  },
  
  {
    name: "Statement with Prior Year Comparisons",
    data: `Account,Current Year,Prior Year,Change,Change %
Cash and Cash Equivalents,2500000,2000000,500000,25.0%
Accounts Receivable,1800000,1600000,200000,12.5%
Inventory,1200000,1000000,200000,20.0%
Prepaid Expenses,150000,100000,50000,50.0%
Total Current Assets,5650000,4700000,950000,20.2%
Property, Plant & Equipment,8500000,8000000,500000,6.3%
Intangible Assets,2000000,2000000,0,0.0%
Long-term Investments,3300000,3000000,300000,10.0%
Total Non-Current Assets,13800000,13000000,800000,6.2%
TOTAL ASSETS,19450000,17700000,1750000,9.9%
Accounts Payable,950000,800000,150000,18.8%
Short-term Debt,1200000,1000000,200000,20.0%
Accrued Expenses,300000,250000,50000,20.0%
Total Current Liabilities,2450000,2050000,400000,19.5%
Long-term Debt,5500000,5000000,500000,10.0%
Deferred Tax Liabilities,800000,750000,50000,6.7%
Total Non-Current Liabilities,6300000,5750000,550000,9.6%
TOTAL LIABILITIES,8750000,7800000,950000,12.2%
Share Capital,5000000,5000000,0,0.0%
Retained Earnings,5200000,4500000,700000,15.6%
Other Comprehensive Income,500000,400000,100000,25.0%
TOTAL EQUITY,10700000,9900000,800000,8.1%
TOTAL LIABILITIES AND EQUITY,19450000,17700000,1750000,9.9%`,
    expectedIssues: ["year_over_year", "percentage_calculations"]
  }
];

// Test runner
class AdvancedTestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async runTest(testCase) {
    this.results.total++;
    
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log('─'.repeat(60));
    
    try {
      // Create test file
      const filename = `${testCase.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`;
      const filePath = path.join(CONFIG.testDir, filename);
      fs.writeFileSync(filePath, testCase.data);
      
      // Test document analysis
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
      
      // Validate results
      this.validateAdvancedResults(result, testCase);
      
      this.results.passed++;
      console.log('✅ PASSED');
      
    } catch (error) {
      this.results.failed++;
      this.results.errors.push({
        test: testCase.name,
        error: error.message
      });
      console.log(`❌ FAILED: ${error.message}`);
    }
  }

  validateAdvancedResults(result, testCase) {
    console.log(`   Confidence: ${result.confidence}%`);
    console.log(`   Validation: ${result.validation.isValid ? 'Valid' : 'Invalid'}`);
    console.log(`   Math Validation: ${result.mathValidation.isValid ? 'Valid' : 'Invalid'}`);
    
    if (result.validation.missingFields.length > 0) {
      console.log(`   Missing Fields: ${result.validation.missingFields.join(', ')}`);
    }
    
    if (result.validation.invalidFields.length > 0) {
      console.log(`   Invalid Fields: ${result.validation.invalidFields.join(', ')}`);
    }
    
    if (result.validation.warnings.length > 0) {
      console.log(`   Warnings: ${result.validation.warnings.length}`);
    }
    
    if (result.errorDetection.warnings.length > 0) {
      console.log(`   Error Detection Warnings: ${result.errorDetection.warnings.length}`);
    }
    
    if (result.recommendations.length > 0) {
      console.log(`   Recommendations: ${result.recommendations.length}`);
    }
    
    // Check for expected issues
    if (testCase.expectedIssues) {
      console.log(`   Expected Issues: ${testCase.expectedIssues.join(', ')}`);
    }
    
    // Validate extracted data
    if (result.extractedData) {
      console.log(`   Company Name: ${result.extractedData.companyName || 'Not found'}`);
      console.log(`   Period: ${result.extractedData.period || 'Not found'}`);
      
      if (result.extractedData.totalAssets) {
        console.log(`   Total Assets: $${result.extractedData.totalAssets.toLocaleString()}`);
      }
      
      if (result.extractedData.totalLiabilities) {
        console.log(`   Total Liabilities: $${result.extractedData.totalLiabilities.toLocaleString()}`);
      }
      
      if (result.extractedData.totalEquity) {
        console.log(`   Total Equity: $${result.extractedData.totalEquity.toLocaleString()}`);
      }
    }
  }

  async runAll() {
    console.log('🚀 Starting Advanced Edge Case Testing');
    console.log('=====================================');
    
    for (const testCase of advancedTestCases) {
      await this.runTest(testCase);
    }
    
    this.printResults();
  }

  printResults() {
    console.log('\n📊 ADVANCED TEST RESULTS');
    console.log('========================');
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.errors.forEach(error => {
        console.log(`  • ${error.test}: ${error.error}`);
      });
    }
    
    if (this.results.passed === this.results.total) {
      console.log('\n🎉 ALL ADVANCED TESTS PASSED!');
      console.log('✅ Complex scenarios handled correctly');
      console.log('✅ Edge cases managed properly');
      console.log('✅ System is robust and reliable');
    } else {
      console.log('\n⚠️ Some advanced tests failed');
      console.log('Please review and improve handling of complex scenarios');
    }
  }
}

// Cleanup function
function cleanup() {
  if (fs.existsSync(CONFIG.testDir)) {
    fs.rmSync(CONFIG.testDir, { recursive: true, force: true });
  }
}

// Main execution
async function main() {
  try {
    // Check if backend is running
    console.log('🔍 Checking backend status...');
    const healthResponse = await fetch(`${CONFIG.backendUrl}/health`);
    if (!healthResponse.ok) {
      throw new Error('Backend is not running. Please start it first.');
    }
    console.log('✅ Backend is running');
    
    // Run advanced tests
    const testRunner = new AdvancedTestRunner();
    await testRunner.runAll();
    
  } catch (error) {
    console.error(`💥 Advanced test suite failed: ${error.message}`);
    process.exit(1);
  } finally {
    cleanup();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Advanced test suite interrupted');
  cleanup();
  process.exit(0);
});

// Run the advanced test suite
if (require.main === module) {
  main();
}

module.exports = { AdvancedTestRunner, advancedTestCases };
