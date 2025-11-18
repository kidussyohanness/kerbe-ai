#!/usr/bin/env node

/**
 * Comprehensive KPI Validation Test
 * Validates all KPIs are calculated correctly from test data
 */

const http = require('http');

const BACKEND_URL = 'http://localhost:8787';
const TEST_USER_ID = 'cmgtv2kjt0000sfzqb6d91ez0';

// Expected values from test data files
const EXPECTED_VALUES = {
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
    operatingIncome: -200000, // Negative (loss)
    interestExpense: 180000, // Positive (expense shown as positive)
    netIncome: -305000 // Negative (loss)
  },
  cashFlow: {
    operatingCashFlow: -155000, // Negative
    investingCashFlow: -1000000, // Negative
    financingCashFlow: 1300000,
    netCashFlow: 145000
  }
};

// Expected KPI calculations
const EXPECTED_KPIS = {
  cash: 2500000,
  grossMargin: 33.60, // (4150000 / 12350000) * 100
  operatingMargin: -1.62, // (-200000 / 12350000) * 100
  currentRatio: 2.31, // 5650000 / 2450000
  interestCoverage: -1.11, // -200000 / 180000
  dso: 53.2, // (1800000 / 12350000) * 365
  dio: 53.4, // (1200000 / 8200000) * 365
  dpo: 42.3, // (950000 / 8200000) * 365
  ccc: 64.3, // DSO + DIO - DPO
  runway: 193.5, // cash / abs(avg monthly operating cash flow)
  fcf: -1155000, // operatingCashFlow + investingCashFlow
  revenueGrowth: 0 // Would need prior period
};

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: 'Invalid JSON', raw: data });
        }
      });
    }).on('error', reject);
  });
}

function calculateKPIs(bs, is, cf) {
  const grossMargin = ((is.grossProfit / is.totalRevenue) * 100);
  const operatingMargin = ((is.operatingIncome / is.totalRevenue) * 100);
  const currentRatio = (bs.currentAssets / bs.currentLiabilities);
  const interestCoverage = is.interestExpense !== 0 ? (is.operatingIncome / Math.abs(is.interestExpense)) : 0;
  const dso = (bs.accountsReceivable / is.totalRevenue) * 365;
  const dio = (bs.inventory / is.costOfGoodsSold) * 365;
  const dpo = (bs.accountsPayable / is.costOfGoodsSold) * 365;
  const ccc = dso + dio - dpo;
  const avgMonthlyCashFlow = Math.abs(cf.operatingCashFlow / 12);
  const runway = avgMonthlyCashFlow > 0 ? (bs.cash / avgMonthlyCashFlow) : 0;
  const fcf = cf.operatingCashFlow + cf.investingCashFlow;
  
  return {
    cash: bs.cash,
    grossMargin: parseFloat(grossMargin.toFixed(2)),
    operatingMargin: parseFloat(operatingMargin.toFixed(2)),
    currentRatio: parseFloat(currentRatio.toFixed(2)),
    interestCoverage: parseFloat(interestCoverage.toFixed(2)),
    dso: parseFloat(dso.toFixed(1)),
    dio: parseFloat(dio.toFixed(1)),
    dpo: parseFloat(dpo.toFixed(1)),
    ccc: parseFloat(ccc.toFixed(1)),
    runway: parseFloat(runway.toFixed(1)),
    fcf: fcf,
    revenueGrowth: 0
  };
}

function compareValues(expected, actual, tolerance = 0.01) {
  if (typeof expected === 'number' && typeof actual === 'number') {
    return Math.abs(expected - actual) <= tolerance;
  }
  return expected === actual;
}

async function runValidation() {
  console.log('🔍 Comprehensive KPI Validation Test\n');
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  const issues = [];
  
  try {
    // Get financial data
    const response = await makeRequest(`${BACKEND_URL}/dashboard/financial-data/${TEST_USER_ID}?months=12`);
    
    if (!response.success || !response.data || !response.data.financialData || response.data.financialData.length === 0) {
      console.error('❌ No financial data found');
      return;
    }
    
    const periodData = response.data.financialData[0];
    const bs = periodData.balanceSheet || {};
    const is = periodData.incomeStatement || {};
    const cf = periodData.cashFlow || {};
    
    console.log('\n📊 Data Validation:\n');
    
    // Validate Balance Sheet
    console.log('Balance Sheet:');
    Object.keys(EXPECTED_VALUES.balanceSheet).forEach(key => {
      const expected = EXPECTED_VALUES.balanceSheet[key];
      const actual = bs[key];
      const match = compareValues(expected, actual);
      if (match) {
        console.log(`  ✅ ${key}: ${actual.toLocaleString()}`);
        passed++;
      } else {
        console.log(`  ❌ ${key}: Expected ${expected.toLocaleString()}, Got ${actual?.toLocaleString() || 'undefined'}`);
        failed++;
        issues.push(`Balance Sheet ${key}: Expected ${expected}, Got ${actual}`);
      }
    });
    
    // Validate Income Statement
    console.log('\nIncome Statement:');
    Object.keys(EXPECTED_VALUES.incomeStatement).forEach(key => {
      const expected = EXPECTED_VALUES.incomeStatement[key];
      const actual = is[key];
      const match = compareValues(expected, actual);
      if (match) {
        console.log(`  ✅ ${key}: ${actual?.toLocaleString() || actual}`);
        passed++;
      } else {
        console.log(`  ❌ ${key}: Expected ${expected.toLocaleString()}, Got ${actual?.toLocaleString() || 'undefined'}`);
        failed++;
        issues.push(`Income Statement ${key}: Expected ${expected}, Got ${actual}`);
      }
    });
    
    // Validate Cash Flow
    console.log('\nCash Flow:');
    Object.keys(EXPECTED_VALUES.cashFlow).forEach(key => {
      const expected = EXPECTED_VALUES.cashFlow[key];
      const actual = cf[key];
      const match = compareValues(expected, actual);
      if (match) {
        console.log(`  ✅ ${key}: ${actual?.toLocaleString() || actual}`);
        passed++;
      } else {
        console.log(`  ❌ ${key}: Expected ${expected.toLocaleString()}, Got ${actual?.toLocaleString() || 'undefined'}`);
        failed++;
        issues.push(`Cash Flow ${key}: Expected ${expected}, Got ${actual}`);
      }
    });
    
    // Calculate and validate KPIs
    console.log('\n📈 KPI Validation:\n');
    const actualKPIs = calculateKPIs(bs, is, cf);
    
    Object.keys(EXPECTED_KPIS).forEach(key => {
      const expected = EXPECTED_KPIS[key];
      const actual = actualKPIs[key];
      const tolerance = key.includes('Margin') || key.includes('Ratio') || key.includes('Coverage') ? 0.1 : 1;
      const match = compareValues(expected, actual, tolerance);
      
      if (match) {
        console.log(`  ✅ ${key}: ${actual} (Expected: ${expected})`);
        passed++;
      } else {
        console.log(`  ❌ ${key}: Got ${actual}, Expected ${expected}`);
        failed++;
        issues.push(`KPI ${key}: Expected ${expected}, Got ${actual}`);
      }
    });
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);
    
    if (issues.length > 0) {
      console.log('⚠️  Issues Found:');
      issues.forEach((issue, idx) => {
        console.log(`  ${idx + 1}. ${issue}`);
      });
    } else {
      console.log('✅ All validations passed!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

runValidation();

