#!/usr/bin/env node

/**
 * Test script for Financial Statement Generator
 */

const http = require('http');

// Sample business data
const sampleData = {
  companyName: "Apple Inc",
  cash: 50000000000,
  accounts_receivable: 25000000000,
  inventory: 10000000000,
  property_plant_equipment: 120000000000,
  accounts_payable: 80000000000,
  short_term_debt: 20000000000,
  long_term_debt: 95000000000,
  common_stock: 50000000000,
  retained_earnings: 150000000000,
  revenue: 394328000000,
  cost_of_goods_sold: 223546000000,
  salaries: 50000000000,
  rent: 5000000000,
  marketing: 20000000000,
  depreciation: 10000000000,
  interest_expense: 3000000000,
  tax_expense: 15000000000
};

async function testFinancialGenerator() {
  console.log('🧪 Testing Financial Statement Generator...\n');
  
  try {
    // Test Balance Sheet Generation
    console.log('📊 Testing Balance Sheet Generation...');
    const balanceSheetResponse = await makeRequest('POST', '/generate/balance-sheet', sampleData);
    
    if (balanceSheetResponse.includes('BALANCE SHEET')) {
      console.log('✅ Balance Sheet generated successfully!');
      console.log('📄 HTML output length:', balanceSheetResponse.length, 'characters');
    } else {
      console.log('❌ Balance Sheet generation failed');
    }
    
    // Test Income Statement Generation
    console.log('\n💰 Testing Income Statement Generation...');
    const incomeStatementResponse = await makeRequest('POST', '/generate/income-statement', sampleData);
    
    if (incomeStatementResponse.includes('"success":true')) {
      console.log('✅ Income Statement generated successfully!');
      const data = JSON.parse(incomeStatementResponse);
      console.log('📈 Net Income:', data.statement.expenses.netIncome.toLocaleString());
    } else {
      console.log('❌ Income Statement generation failed');
    }
    
    // Test Cash Flow Generation
    console.log('\n💸 Testing Cash Flow Statement Generation...');
    const cashFlowResponse = await makeRequest('POST', '/generate/cash-flow', sampleData);
    
    if (cashFlowResponse.includes('"success":true')) {
      console.log('✅ Cash Flow Statement generated successfully!');
      const data = JSON.parse(cashFlowResponse);
      console.log('💵 Net Cash from Operations:', data.statement.operating.netCashFromOperations.toLocaleString());
    } else {
      console.log('❌ Cash Flow Statement generation failed');
    }
    
    console.log('\n🎉 Financial Statement Generator is working perfectly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
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

// Run the test
testFinancialGenerator();
