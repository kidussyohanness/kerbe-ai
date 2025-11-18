// Test script for SMB KPI calculations
import { SMBKPICalculator } from './src/lib/kpiCalculations';

// Mock financial data for testing
const mockFinancialData = [
  {
    companyName: 'Test Company',
    period: '2024-01-01',
    balanceSheet: {
      totalAssets: 1000000,
      currentAssets: 500000,
      nonCurrentAssets: 500000,
      totalLiabilities: 400000,
      currentLiabilities: 200000,
      nonCurrentLiabilities: 200000,
      totalEquity: 600000,
      cash: 100000,
      accountsReceivable: 150000,
      inventory: 100000,
      accountsPayable: 80000,
      shortTermDebt: 50000,
      longTermDebt: 150000,
      retainedEarnings: 400000
    },
    incomeStatement: {
      totalRevenue: 800000,
      costOfGoodsSold: 400000,
      grossProfit: 400000,
      operatingExpenses: 200000,
      operatingIncome: 200000,
      interestExpense: 10000,
      taxExpense: 50000,
      netIncome: 140000
    },
    cashFlow: {
      operatingCashFlow: 180000,
      investingCashFlow: -50000,
      financingCashFlow: -20000,
      netCashFlow: 110000
    }
  },
  {
    companyName: 'Test Company',
    period: '2024-02-01',
    balanceSheet: {
      totalAssets: 1050000,
      currentAssets: 520000,
      nonCurrentAssets: 530000,
      totalLiabilities: 420000,
      currentLiabilities: 210000,
      nonCurrentLiabilities: 210000,
      totalEquity: 630000,
      cash: 120000,
      accountsReceivable: 160000,
      inventory: 110000,
      accountsPayable: 85000,
      shortTermDebt: 50000,
      longTermDebt: 150000,
      retainedEarnings: 420000
    },
    incomeStatement: {
      totalRevenue: 850000,
      costOfGoodsSold: 425000,
      grossProfit: 425000,
      operatingExpenses: 210000,
      operatingIncome: 215000,
      interestExpense: 10000,
      taxExpense: 55000,
      netIncome: 150000
    },
    cashFlow: {
      operatingCashFlow: 190000,
      investingCashFlow: -60000,
      financingCashFlow: -15000,
      netCashFlow: 115000
    }
  }
];

console.log('Testing SMB KPI Calculations...\n');

try {
  const kpis = SMBKPICalculator.calculateAllKPIs(mockFinancialData);
  
  console.log('✅ KPI Calculations Results:');
  console.log('============================');
  
  Object.entries(kpis).forEach(([kpiName, kpi]) => {
    console.log(`\n${kpiName.toUpperCase()}:`);
    console.log(`  Value: ${typeof kpi.value === 'number' ? SMBKPICalculator.formatCurrency(kpi.value) : kpi.value}`);
    console.log(`  Status: ${kpi.status}`);
    console.log(`  Calculation: ${kpi.calculation}`);
    console.log(`  Source: ${kpi.source.join(', ')}`);
  });
  
  console.log('\n✅ All KPI calculations completed successfully!');
  
} catch (error) {
  console.error('❌ Error in KPI calculations:', error);
}
