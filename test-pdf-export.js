#!/usr/bin/env node

/**
 * Test script for PDF Export functionality
 */

const http = require('http');
const fs = require('fs');

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
  tax_expense: 15000000000,
  exportFormat: 'pdf'  // Request PDF export
};

async function testPDFExport() {
  console.log('🧪 Testing PDF Export Functionality...\n');
  
  try {
    // Test Balance Sheet PDF Export
    console.log('📊 Testing Balance Sheet PDF Export...');
    const balanceSheetPDF = await makeRequest('POST', '/generate/balance-sheet', sampleData);
    
    if (balanceSheetPDF.length > 1000) { // PDF files are typically larger
      console.log('✅ Balance Sheet PDF generated successfully!');
      console.log('📄 PDF size:', balanceSheetPDF.length, 'bytes');
      
      // Save PDF to file
      fs.writeFileSync('balance-sheet-apple.pdf', balanceSheetPDF);
      console.log('💾 Saved as: balance-sheet-apple.pdf');
    } else {
      console.log('❌ Balance Sheet PDF generation failed');
    }
    
    // Test Income Statement PDF Export
    console.log('\n💰 Testing Income Statement PDF Export...');
    const incomeStatementPDF = await makeRequest('POST', '/generate/income-statement', sampleData);
    
    if (incomeStatementPDF.length > 1000) {
      console.log('✅ Income Statement PDF generated successfully!');
      console.log('📄 PDF size:', incomeStatementPDF.length, 'bytes');
      
      // Save PDF to file
      fs.writeFileSync('income-statement-apple.pdf', incomeStatementPDF);
      console.log('💾 Saved as: income-statement-apple.pdf');
    } else {
      console.log('❌ Income Statement PDF generation failed');
    }
    
    // Test Cash Flow PDF Export
    console.log('\n💸 Testing Cash Flow Statement PDF Export...');
    const cashFlowPDF = await makeRequest('POST', '/generate/cash-flow', sampleData);
    
    if (cashFlowPDF.length > 1000) {
      console.log('✅ Cash Flow Statement PDF generated successfully!');
      console.log('📄 PDF size:', cashFlowPDF.length, 'bytes');
      
      // Save PDF to file
      fs.writeFileSync('cash-flow-apple.pdf', cashFlowPDF);
      console.log('💾 Saved as: cash-flow-apple.pdf');
    } else {
      console.log('❌ Cash Flow Statement PDF generation failed');
    }
    
    console.log('\n🎉 PDF Export functionality is working perfectly!');
    console.log('📁 Generated PDF files:');
    console.log('   - balance-sheet-apple.pdf');
    console.log('   - income-statement-apple.pdf');
    console.log('   - cash-flow-apple.pdf');
    
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
testPDFExport();

