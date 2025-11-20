import { FinancialData } from '../../analytics-platform-backend/src/services/openAIFinancialAnalysis';

export interface KPICalculationResult {
  value: number | string;
  status: 'good' | 'warning' | 'critical' | 'unavailable';
  calculation: string;
  source: string[];
  threshold?: {
    good: number;
    warning: number;
    critical: number;
  };
}

export interface SMBDashboardKPIs {
  cash: KPICalculationResult;
  runway: KPICalculationResult;
  freeCashFlow: KPICalculationResult;
  revenueGrowth: KPICalculationResult;
  grossMargin: KPICalculationResult;
  operatingMargin: KPICalculationResult;
  cashConversionCycle: KPICalculationResult;
  interestCoverage: KPICalculationResult;
  currentRatio?: KPICalculationResult; // Optional
}

export class SMBKPICalculator {
  
  /**
   * Calculate all 8 main KPIs for SMB dashboard
   */
  static calculateAllKPIs(financialData: FinancialData[]): SMBDashboardKPIs {
    const latestData = financialData[financialData.length - 1];
    const previousData = financialData[financialData.length - 2];
    const threeMonthsAgo = financialData[financialData.length - 4];
    const twelveMonthsAgo = financialData[financialData.length - 13];

    return {
      cash: this.calculateCash(latestData),
      runway: this.calculateRunway(financialData),
      freeCashFlow: this.calculateFreeCashFlow(latestData),
      revenueGrowth: this.calculateRevenueGrowth(latestData, previousData, twelveMonthsAgo),
      grossMargin: this.calculateGrossMargin(latestData),
      operatingMargin: this.calculateOperatingMargin(latestData),
      cashConversionCycle: this.calculateCashConversionCycle(financialData),
      interestCoverage: this.calculateInterestCoverage(latestData),
      currentRatio: this.calculateCurrentRatio(latestData)
    };
  }

  /**
   * Cash = cash_and_equivalents[t]
   */
  private static calculateCash(data: FinancialData): KPICalculationResult {
    const cash = data.balanceSheet.cash;
    
    return {
      value: cash,
      status: cash > 0 ? 'good' : 'critical',
      calculation: `Cash = ${cash.toLocaleString()}`,
      source: ['Balance Sheet → Cash and Equivalents']
    };
  }

  /**
   * Runway = cash_now / |avg_monthly_net_cf|
   * avg_monthly_net_cf = average(net_change_in_cash[t-1..t-3]) or TTM/12
   */
  private static calculateRunway(financialData: FinancialData[]): KPICalculationResult {
    const latestData = financialData[financialData.length - 1];
    const cash = latestData.balanceSheet.cash;
    
    // Calculate average monthly net cash flow from last 3 months
    const recentData = financialData.slice(-3);
    const monthlyNetCashFlows = recentData.map(data => data.cashFlow.netCashFlow);
    const avgMonthlyNetCF = monthlyNetCashFlows.reduce((sum, cf) => sum + cf, 0) / monthlyNetCashFlows.length;
    
    if (avgMonthlyNetCF >= 0) {
      return {
        value: 'Profitable / ∞',
        status: 'good',
        calculation: 'Runway = Profitable (positive cash flow)',
        source: ['Cash Flow Statement → Net Change in Cash (last 3 months)'],
        threshold: { good: 12, warning: 6, critical: 0 }
      };
    }
    
    const runwayMonths = Math.abs(cash / avgMonthlyNetCF);
    
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (runwayMonths < 6) status = 'critical';
    else if (runwayMonths < 12) status = 'warning';
    
    return {
      value: runwayMonths,
      status,
      calculation: `Runway = ${cash.toLocaleString()} / |${avgMonthlyNetCF.toLocaleString()}| = ${runwayMonths.toFixed(1)} months`,
      source: ['Balance Sheet → Cash', 'Cash Flow Statement → Net Change in Cash (last 3 months)'],
      threshold: { good: 12, warning: 6, critical: 0 }
    };
  }

  /**
   * FCF = CFO - Capex
   */
  private static calculateFreeCashFlow(data: FinancialData): KPICalculationResult {
    const cfo = data.cashFlow.operatingCashFlow;
    const capex = Math.abs(data.cashFlow.investingCashFlow); // Use absolute value for capex
    
    const fcf = cfo - capex;
    
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (fcf < 0) status = 'critical';
    else if (fcf < cfo * 0.5) status = 'warning';
    
    return {
      value: fcf,
      status,
      calculation: `FCF = ${cfo.toLocaleString()} - ${capex.toLocaleString()} = ${fcf.toLocaleString()}`,
      source: ['Cash Flow Statement → Cash from Operations', 'Cash Flow Statement → Capital Expenditures']
    };
  }

  /**
   * Revenue Growth: MoM % and YoY %
   */
  private static calculateRevenueGrowth(
    latest: FinancialData, 
    previous: FinancialData | undefined, 
    twelveMonthsAgo: FinancialData | undefined
  ): KPICalculationResult {
    const currentRevenue = latest.incomeStatement.totalRevenue;
    
    if (!previous) {
      return {
        value: 'Unavailable',
        status: 'unavailable',
        calculation: 'Need previous month data',
        source: ['Income Statement → Revenue']
      };
    }
    
    const previousRevenue = previous.incomeStatement.totalRevenue;
    const momGrowth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    
    let yoyGrowth = 0;
    if (twelveMonthsAgo) {
      const yoyRevenue = twelveMonthsAgo.incomeStatement.totalRevenue;
      yoyGrowth = ((currentRevenue - yoyRevenue) / yoyRevenue) * 100;
    }
    
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (momGrowth < -5) status = 'critical';
    else if (momGrowth < 0) status = 'warning';
    
    return {
      value: momGrowth,
      status,
      calculation: `MoM = (${currentRevenue.toLocaleString()} - ${previousRevenue.toLocaleString()}) / ${previousRevenue.toLocaleString()} = ${momGrowth.toFixed(1)}%`,
      source: ['Income Statement → Revenue (current)', 'Income Statement → Revenue (previous month)'],
      threshold: { good: 5, warning: 0, critical: -5 }
    };
  }

  /**
   * Gross Margin % = (revenue - cogs) / revenue
   */
  private static calculateGrossMargin(data: FinancialData): KPICalculationResult {
    const revenue = data.incomeStatement.totalRevenue;
    const cogs = data.incomeStatement.costOfGoodsSold;
    
    if (revenue === 0) {
      return {
        value: 'Unavailable',
        status: 'unavailable',
        calculation: 'Need revenue data',
        source: ['Income Statement → Revenue', 'Income Statement → Cost of Goods Sold']
      };
    }
    
    const grossMargin = ((revenue - cogs) / revenue) * 100;
    
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (grossMargin < 20) status = 'critical';
    else if (grossMargin < 40) status = 'warning';
    
    return {
      value: grossMargin,
      status,
      calculation: `GM% = (${revenue.toLocaleString()} - ${cogs.toLocaleString()}) / ${revenue.toLocaleString()} = ${grossMargin.toFixed(1)}%`,
      source: ['Income Statement → Revenue', 'Income Statement → Cost of Goods Sold'],
      threshold: { good: 50, warning: 30, critical: 20 }
    };
  }

  /**
   * Operating Margin = EBIT / revenue
   */
  private static calculateOperatingMargin(data: FinancialData): KPICalculationResult {
    const revenue = data.incomeStatement.totalRevenue;
    const ebit = data.incomeStatement.operatingIncome;
    
    if (revenue === 0) {
      return {
        value: 'Unavailable',
        status: 'unavailable',
        calculation: 'Need revenue data',
        source: ['Income Statement → Revenue', 'Income Statement → Operating Income']
      };
    }
    
    const operatingMargin = (ebit / revenue) * 100;
    
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (operatingMargin < 5) status = 'critical';
    else if (operatingMargin < 15) status = 'warning';
    
    return {
      value: operatingMargin,
      status,
      calculation: `Op Margin = ${ebit.toLocaleString()} / ${revenue.toLocaleString()} = ${operatingMargin.toFixed(1)}%`,
      source: ['Income Statement → Operating Income', 'Income Statement → Revenue'],
      threshold: { good: 20, warning: 10, critical: 5 }
    };
  }

  /**
   * Cash Conversion Cycle = DSO + DIO - DPO
   */
  private static calculateCashConversionCycle(financialData: FinancialData[]): KPICalculationResult {
    const latestData = financialData[financialData.length - 1];
    const previousData = financialData[financialData.length - 2];
    
    // Calculate TTM averages for stability
    const ttmData = financialData.slice(-12);
    const avgAR = (latestData.balanceSheet.accountsReceivable + (previousData?.balanceSheet.accountsReceivable || 0)) / 2;
    const avgInv = (latestData.balanceSheet.inventory + (previousData?.balanceSheet.inventory || 0)) / 2;
    const avgAP = (latestData.balanceSheet.accountsPayable + (previousData?.balanceSheet.accountsPayable || 0)) / 2;
    
    const ttmRevenue = ttmData.reduce((sum, data) => sum + data.incomeStatement.totalRevenue, 0);
    const ttmCOGS = ttmData.reduce((sum, data) => sum + data.incomeStatement.costOfGoodsSold, 0);
    
    if (ttmRevenue === 0 || ttmCOGS === 0) {
      return {
        value: 'Unavailable',
        status: 'unavailable',
        calculation: 'Need revenue and COGS data',
        source: ['Balance Sheet → AR, Inventory, AP', 'Income Statement → Revenue, COGS']
      };
    }
    
    const DSO = (avgAR / (ttmRevenue / 365));
    const DIO = (avgInv / (ttmCOGS / 365));
    const DPO = (avgAP / (ttmCOGS / 365));
    const CCC = DSO + DIO - DPO;
    
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (CCC > 60) status = 'critical';
    else if (CCC > 30) status = 'warning';
    
    return {
      value: CCC,
      status,
      calculation: `CCC = ${DSO.toFixed(1)} + ${DIO.toFixed(1)} - ${DPO.toFixed(1)} = ${CCC.toFixed(1)} days`,
      source: ['Balance Sheet → AR, Inventory, AP (averages)', 'Income Statement → Revenue, COGS (TTM)'],
      threshold: { good: 30, warning: 45, critical: 60 }
    };
  }

  /**
   * Interest Coverage = EBIT / interest_expense
   */
  private static calculateInterestCoverage(data: FinancialData): KPICalculationResult {
    const ebit = data.incomeStatement.operatingIncome;
    const interestExpense = data.incomeStatement.interestExpense;
    
    if (interestExpense === 0) {
      return {
        value: 'No Interest',
        status: 'good',
        calculation: 'No interest expense',
        source: ['Income Statement → Interest Expense']
      };
    }
    
    const interestCoverage = ebit / interestExpense;
    
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (interestCoverage < 2) status = 'critical';
    else if (interestCoverage < 3) status = 'warning';
    
    return {
      value: interestCoverage,
      status,
      calculation: `Interest Coverage = ${ebit.toLocaleString()} / ${interestExpense.toLocaleString()} = ${interestCoverage.toFixed(1)}x`,
      source: ['Income Statement → Operating Income', 'Income Statement → Interest Expense'],
      threshold: { good: 5, warning: 3, critical: 2 }
    };
  }

  /**
   * Current Ratio = current_assets / current_liabilities
   */
  private static calculateCurrentRatio(data: FinancialData): KPICalculationResult {
    const currentAssets = data.balanceSheet.currentAssets;
    const currentLiabilities = data.balanceSheet.currentLiabilities;
    
    if (currentLiabilities === 0) {
      return {
        value: 'Unavailable',
        status: 'unavailable',
        calculation: 'Need current liabilities data',
        source: ['Balance Sheet → Current Assets', 'Balance Sheet → Current Liabilities']
      };
    }
    
    const currentRatio = currentAssets / currentLiabilities;
    
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (currentRatio < 1.0) status = 'critical';
    else if (currentRatio < 1.5) status = 'warning';
    
    return {
      value: currentRatio,
      status,
      calculation: `Current Ratio = ${currentAssets.toLocaleString()} / ${currentLiabilities.toLocaleString()} = ${currentRatio.toFixed(2)}`,
      source: ['Balance Sheet → Current Assets', 'Balance Sheet → Current Liabilities'],
      threshold: { good: 2.0, warning: 1.5, critical: 1.0 }
    };
  }

  /**
   * Format currency values for display
   */
  static formatCurrency(value: number): string {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  }

  /**
   * Format percentage values for display
   */
  static formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  /**
   * Get status color class
   */
  static getStatusColor(status: 'good' | 'warning' | 'critical' | 'unavailable'): string {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      case 'unavailable': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  }

  /**
   * Get status background color class
   */
  static getStatusBgColor(status: 'good' | 'warning' | 'critical' | 'unavailable'): string {
    switch (status) {
      case 'good': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'critical': return 'bg-red-50 border-red-200';
      case 'unavailable': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  }
}
