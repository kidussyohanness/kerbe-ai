// Financial Data Types
export interface BalanceSheetData {
  totalAssets: number;
  currentAssets: number;
  nonCurrentAssets: number;
  totalLiabilities: number;
  currentLiabilities: number;
  nonCurrentLiabilities: number;
  totalEquity: number;
  cash: number;
  accountsReceivable: number;
  inventory: number;
  accountsPayable: number;
  shortTermDebt: number;
  longTermDebt: number;
  retainedEarnings: number;
}

export interface IncomeStatementData {
  totalRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  interestExpense: number;
  taxExpense: number;
  netIncome: number;
}

export interface CashFlowData {
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
}

export interface CombinedFinancialData {
  balanceSheet: BalanceSheetData;
  incomeStatement: IncomeStatementData;
  cashFlow: CashFlowData;
  period: string;
  companyName: string;
}

// Financial Ratios Types
export interface LiquidityRatios {
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  operatingCashFlowRatio: number;
}

export interface ProfitabilityRatios {
  grossProfitMargin: number;
  operatingMargin: number;
  netProfitMargin: number;
  returnOnAssets: number;
  returnOnEquity: number;
  returnOnInvestment: number;
}

export interface LeverageRatios {
  debtToEquity: number;
  debtToAssets: number;
  interestCoverage: number;
  debtServiceCoverage: number;
}

export interface EfficiencyRatios {
  assetTurnover: number;
  inventoryTurnover: number;
  receivablesTurnover: number;
  payablesTurnover: number;
  workingCapitalTurnover: number;
}

export interface AllFinancialRatios {
  liquidity: LiquidityRatios;
  profitability: ProfitabilityRatios;
  leverage: LeverageRatios;
  efficiency: EfficiencyRatios;
}

// Industry Benchmarking Types
export interface IndustryBenchmark {
  industry: string;
  companySize: 'small' | 'medium' | 'large';
  ratios: {
    currentRatio: { median: number; percentile25: number; percentile75: number };
    quickRatio: { median: number; percentile25: number; percentile75: number };
    grossMargin: { median: number; percentile25: number; percentile75: number };
    operatingMargin: { median: number; percentile25: number; percentile75: number };
    netMargin: { median: number; percentile25: number; percentile75: number };
    roa: { median: number; percentile25: number; percentile75: number };
    roe: { median: number; percentile25: number; percentile75: number };
    debtToEquity: { median: number; percentile25: number; percentile75: number };
    assetTurnover: { median: number; percentile25: number; percentile75: number };
    inventoryTurnover: { median: number; percentile25: number; percentile75: number };
  };
}

// Trend Analysis Types
export interface TrendAnalysis {
  growthRates: {
    revenueGrowth: number;
    profitGrowth: number;
    assetGrowth: number;
    equityGrowth: number;
  };
  trends: {
    revenueTrend: 'increasing' | 'decreasing' | 'stable';
    profitTrend: 'increasing' | 'decreasing' | 'stable';
    marginTrend: 'improving' | 'declining' | 'stable';
  };
  seasonality: {
    hasSeasonality: boolean;
    peakMonths: number[];
    lowMonths: number[];
  };
  volatility: {
    revenueVolatility: number;
    profitVolatility: number;
    marginVolatility: number;
  };
}

// Risk Assessment Types
export interface RiskAssessment {
  overallRiskScore: number; // 0-100, higher = riskier
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: {
    liquidityRisk: number;
    creditRisk: number;
    operationalRisk: number;
    marketRisk: number;
  };
  redFlags: string[];
  warnings: string[];
  recommendations: string[];
}

// API Response Types
export interface AdvancedAnalyticsResponse {
  success: boolean;
  data?: {
    ratios?: AllFinancialRatios;
    riskAssessment?: RiskAssessment;
    trendAnalysis?: TrendAnalysis;
    benchmark?: IndustryBenchmark;
    summary?: {
      overallHealth: string;
      keyStrengths: string[];
      keyWeaknesses: string[];
      priorityActions: string[];
    };
  };
  error?: string;
}

// Component Props Types
export interface AdvancedAnalyticsProps {
  financialData: CombinedFinancialData;
  onAnalysisComplete?: (analysis: any) => void;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  status: 'good' | 'fair' | 'poor';
}

export interface RiskFactorCardProps {
  title: string;
  score: number;
}
