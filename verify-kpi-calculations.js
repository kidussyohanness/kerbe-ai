#!/usr/bin/env node

/**
 * Verify KPI Calculations Against Test Data
 * Compares expected vs actual KPI values
 */

const http = require('http');

const BACKEND_URL = 'http://localhost:8787';
const TEST_USER_ID = 'cmgtv2kjt0000sfzqb6d91ez0';

// Expected values from test data files
const EXPECTED_DATA = {
  balanceSheet: {
    cash: 2500000,
    currentAssets: 5650000,
    currentLiabilities: 2450000,
    accountsReceivable: 1800000,
    inventory: 1200000,
    accountsPayable: 950000,
    shortTermDebt: 1200000,
    longTermDebt: 5500000,
    totalAssets: 19450000,
    totalLiabilities: 8750000,
    totalEquity: 10700000
  },
  incomeStatement: {
    totalRevenue: 12350000,
    costOfGoodsSold: 8200000,
    grossProfit: 4150000,
    operatingExpenses: 4350000,
    operatingIncome: -200000, // Negative!
    interestExpense: 180000,
    netIncome: -305000 // Negative!
  },
  cashFlow: {
    operatingCashFlow: -155000, // Negative!
    investingCashFlow: -1000000, // Negative!
    financingCashFlow: 1300000,
    netCashFlow: 145000
  }
};

// Calculate expected KPIs
function calculateExpectedKPIs() {
  const bs = EXPECTED_DATA.balanceSheet;
  const is = EXPECTED_DATA.incomeStatement;
  const cf = EXPECTED_DATA.cashFlow;
  
  // Gross Margin %
  const grossMargin = ((is.grossProfit / is.totalRevenue) * 100).toFixed(2);
  
  // Operating Margin %
  const operatingMargin = ((is.operatingIncome / is.totalRevenue) * 100).toFixed(2);
  
  // Current Ratio
  const currentRatio = (bs.currentAssets / bs.currentLiabilities).toFixed(2);
  
  // Interest Coverage
  const interestCoverage = (is.operatingIncome / is.interestExpense).toFixed(2);
  
  // DSO (Days Sales Outstanding)
  const dso = ((bs.accountsReceivable / is.totalRevenue) * 365).toFixed(1);
  
  // DIO (Days Inventory Outstanding)
  const dio = ((bs.inventory / is.costOfGoodsSold) * 365).toFixed(1);
  
  // DPO (Days Payable Outstanding)
  const dpo = ((bs.accountsPayable / is.costOfGoodsSold) * 365).toFixed(1);
  
  // CCC (Cash Conversion Cycle)
  const ccc = (parseFloat(dso) + parseFloat(dio) - parseFloat(dpo)).toFixed(1);
  
  // Cash Runway (months)
  const avgMonthlyCashFlow = Math.abs(cf.operatingCashFlow / 12);
  const runway = avgMonthlyCashFlow > 0 ? (bs.cash / avgMonthlyCashFlow).toFixed(1) : 'N/A';
  
  // Free Cash Flow
  const fcf = cf.operatingCashFlow + cf.investingCashFlow;
  
  // Revenue Growth (would need prior period, assuming 0%)
  const revenueGrowth = 0;
  
  return {
    cash: bs.cash,
    grossMargin: parseFloat(grossMargin),
    operatingMargin: parseFloat(operatingMargin),
    currentRatio: parseFloat(currentRatio),
    interestCoverage: parseFloat(interestCoverage),
    dso: parseFloat(dso),
    dio: parseFloat(dio),
    dpo: parseFloat(dpo),
    ccc: parseFloat(ccc),
    runway: runway === 'N/A' ? 0 : parseFloat(runway),
    fcf: fcf,
    revenueGrowth: revenueGrowth
  };
}

async function getFinancialData() {
  return new Promise((resolve, reject) => {
    const url = `${BACKEND_URL}/dashboard/financial-data/${TEST_USER_ID}?months=12`;
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function verifyKPIs() {
  console.log('🔍 Verifying KPI Calculations\n');
  console.log('='.repeat(80));
  
  // Calculate expected KPIs
  const expectedKPIs = calculateExpectedKPIs();
  console.log('\n📊 Expected KPIs (from test data):');
  console.log(JSON.stringify(expectedKPIs, null, 2));
  
  // Get actual financial data
  try {
    const response = await getFinancialData();
    if (!response.success || !response.data || !response.data.financialData || response.data.financialData.length === 0) {
      console.error('\n❌ No financial data found');
      return;
    }
    
    const periodData = response.data.financialData[0];
    console.log('\n📄 Actual Financial Data:');
    console.log('Balance Sheet:', JSON.stringify(periodData.balanceSheet, null, 2));
    console.log('Income Statement:', JSON.stringify(periodData.incomeStatement, null, 2));
    console.log('Cash Flow:', JSON.stringify(periodData.cashFlow, null, 2));
    
    // Verify data matches expected
    console.log('\n✅ Data Verification:');
    
    // Balance Sheet
    const bsMatch = 
      periodData.balanceSheet.cash === EXPECTED_DATA.balanceSheet.cash &&
      periodData.balanceSheet.currentAssets === EXPECTED_DATA.balanceSheet.currentAssets &&
      periodData.balanceSheet.currentLiabilities === EXPECTED_DATA.balanceSheet.currentLiabilities;
    
    console.log(`Balance Sheet Match: ${bsMatch ? '✅' : '❌'}`);
    if (!bsMatch) {
      console.log('Expected:', EXPECTED_DATA.balanceSheet);
      console.log('Actual:', periodData.balanceSheet);
    }
    
    // Income Statement - Note: operatingIncome and netIncome should be negative
    const isMatch = 
      periodData.incomeStatement.totalRevenue === EXPECTED_DATA.incomeStatement.totalRevenue &&
      periodData.incomeStatement.costOfGoodsSold === EXPECTED_DATA.incomeStatement.costOfGoodsSold;
    
    console.log(`Income Statement Match: ${isMatch ? '✅' : '❌'}`);
    if (!isMatch) {
      console.log('Expected:', EXPECTED_DATA.incomeStatement);
      console.log('Actual:', periodData.incomeStatement);
    }
    
    // Cash Flow - Note: operating and investing should be negative
    const cfMatch = 
      Math.abs(periodData.cashFlow.operatingCashFlow) === Math.abs(EXPECTED_DATA.cashFlow.operatingCashFlow) &&
      Math.abs(periodData.cashFlow.investingCashFlow) === Math.abs(EXPECTED_DATA.cashFlow.investingCashFlow);
    
    console.log(`Cash Flow Match: ${cfMatch ? '✅' : '❌'}`);
    if (!cfMatch) {
      console.log('Expected:', EXPECTED_DATA.cashFlow);
      console.log('Actual:', periodData.cashFlow);
    }
    
    // Calculate actual KPIs from extracted data
    const bs = periodData.balanceSheet;
    const is = periodData.incomeStatement;
    const cf = periodData.cashFlow;
    
    const actualGrossMargin = ((is.grossProfit / is.totalRevenue) * 100).toFixed(2);
    const actualCurrentRatio = (bs.currentAssets / bs.currentLiabilities).toFixed(2);
    
    console.log('\n📈 KPI Verification:');
    console.log(`Gross Margin: Expected ${expectedKPIs.grossMargin}%, Actual ${actualGrossMargin}%`);
    console.log(`Current Ratio: Expected ${expectedKPIs.currentRatio}, Actual ${actualCurrentRatio}`);
    console.log(`Cash: Expected $${expectedKPIs.cash.toLocaleString()}, Actual $${bs.cash.toLocaleString()}`);
    
    // Check for issues
    const issues = [];
    
    if (is.operatingIncome !== EXPECTED_DATA.incomeStatement.operatingIncome) {
      issues.push(`Operating Income mismatch: Expected ${EXPECTED_DATA.incomeStatement.operatingIncome}, Got ${is.operatingIncome}`);
    }
    
    if (is.netIncome !== EXPECTED_DATA.incomeStatement.netIncome) {
      issues.push(`Net Income mismatch: Expected ${EXPECTED_DATA.incomeStatement.netIncome}, Got ${is.netIncome}`);
    }
    
    if (cf.operatingCashFlow !== EXPECTED_DATA.cashFlow.operatingCashFlow) {
      issues.push(`Operating Cash Flow mismatch: Expected ${EXPECTED_DATA.cashFlow.operatingCashFlow}, Got ${cf.operatingCashFlow}`);
    }
    
    if (cf.investingCashFlow !== EXPECTED_DATA.cashFlow.investingCashFlow) {
      issues.push(`Investing Cash Flow mismatch: Expected ${EXPECTED_DATA.cashFlow.investingCashFlow}, Got ${cf.investingCashFlow}`);
    }
    
    if (issues.length > 0) {
      console.log('\n⚠️  Issues Found:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    } else {
      console.log('\n✅ All KPIs match expected values!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyKPIs();

