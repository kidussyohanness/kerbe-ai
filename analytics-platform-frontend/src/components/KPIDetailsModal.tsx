'use client';

import { useEffect, useState } from 'react';
import { X, Calculator, TrendingUp, BarChart3, Brain, FileText, AlertTriangle, CheckCircle, Clock, DollarSign, Percent, RefreshCw, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { KPICalculationResult, SMBKPICalculator } from '@/lib/kpiCalculations';

interface KPIDetailsModalProps {
  kpiName: string;
  kpi: KPICalculationResult;
  userId: string;
  onClose: () => void;
}

interface KPIDetailsData {
  metric: string;
  formula: string;
  calculation: {
    totalNetIncome?: number;
    totalRevenue?: number;
    totalLiabilities?: number;
    totalEquity?: number;
    result: number;
    unit: string;
  };
  breakdown?: any[];
  methodology: string;
  interpretation: string;
  aiInsights?: {
    summary: string;
    recommendations: string[];
    trends: string;
    benchmarks: string;
  };
  chartData?: any[];
  dataSources: string[];
}

const KPI_ICONS = {
  cash: <DollarSign className="w-6 h-6" />,
  runway: <Clock className="w-6 h-6" />,
  freeCashFlow: <TrendingUp className="w-6 h-6" />,
  revenueGrowth: <Percent className="w-6 h-6" />,
  grossMargin: <Percent className="w-6 h-6" />,
  operatingMargin: <Percent className="w-6 h-6" />,
  cashConversionCycle: <RefreshCw className="w-6 h-6" />,
  interestCoverage: <Shield className="w-6 h-6" />,
  currentRatio: <Shield className="w-6 h-6" />
};

const KPI_DESCRIPTIONS = {
  cash: {
    title: 'Cash Position',
    description: 'Total liquid cash available to the business',
    formula: 'Cash = Sum of all cash accounts from balance sheet',
    methodology: 'This metric represents the total cash and cash equivalents available to the business. It includes checking accounts, savings accounts, money market funds, and other highly liquid assets that can be quickly converted to cash.',
    interpretation: 'A healthy cash position provides financial flexibility and security. Businesses should maintain enough cash to cover 3-6 months of operating expenses.'
  },
  runway: {
    title: 'Cash Runway',
    description: 'How many months the business can operate with current cash',
    formula: 'Runway = Current Cash ÷ Average Monthly Net Cash Flow',
    methodology: 'Cash runway is calculated by dividing the current cash position by the average monthly net cash flow (burn rate). This indicates how long the business can continue operating at its current rate before running out of cash.',
    interpretation: 'A longer runway provides more time to achieve profitability or secure additional funding. Most investors prefer to see at least 12-18 months of runway.'
  },
  freeCashFlow: {
    title: 'Free Cash Flow',
    description: 'Cash generated from operations after capital expenditures',
    formula: 'FCF = Operating Cash Flow - Capital Expenditures',
    methodology: 'Free cash flow represents the cash a company generates from its operations after accounting for capital expenditures. It\'s a key indicator of financial health and ability to fund growth.',
    interpretation: 'Positive free cash flow indicates the business is generating more cash than it\'s spending, which is essential for growth and debt repayment.'
  },
  revenueGrowth: {
    title: 'Revenue Growth Rate',
    description: 'Percentage change in revenue over time',
    formula: 'Growth Rate = (Current Period Revenue - Previous Period Revenue) ÷ Previous Period Revenue × 100',
    methodology: 'Revenue growth rate measures the percentage increase in revenue from one period to the next. It\'s calculated using a rolling average to smooth out seasonal variations.',
    interpretation: 'Consistent revenue growth indicates market demand and business scalability. Growth rates vary by industry, but 10-20% annual growth is generally considered healthy for SMBs.'
  },
  grossMargin: {
    title: 'Gross Margin Percentage',
    description: 'Percentage of revenue remaining after cost of goods sold',
    formula: 'Gross Margin % = (Revenue - COGS) ÷ Revenue × 100',
    methodology: 'Gross margin percentage measures the profitability of core business operations before operating expenses. It indicates pricing power and operational efficiency.',
    interpretation: 'Higher gross margins indicate better pricing power and operational efficiency. Industry benchmarks vary, but margins above 40% are generally considered strong.'
  },
  operatingMargin: {
    title: 'Operating Margin Percentage',
    description: 'Percentage of revenue remaining after all operating expenses',
    formula: 'Operating Margin % = Operating Income ÷ Revenue × 100',
    methodology: 'Operating margin measures profitability after all operating expenses including COGS, salaries, rent, and other operational costs. It excludes interest and taxes.',
    interpretation: 'Operating margin indicates overall operational efficiency. Margins above 10% are generally considered healthy for SMBs, though this varies by industry.'
  },
  cashConversionCycle: {
    title: 'Cash Conversion Cycle',
    description: 'Days required to convert investments in inventory to cash',
    formula: 'CCC = Days Sales Outstanding + Days Inventory Outstanding - Days Payable Outstanding',
    methodology: 'The cash conversion cycle measures how quickly a company can convert its investments in inventory and other resources into cash flows from sales.',
    interpretation: 'A shorter cycle is better as it means the company can quickly convert investments into cash. Cycles under 30 days are generally considered efficient.'
  },
  interestCoverage: {
    title: 'Interest Coverage Ratio',
    description: 'Ability to pay interest expenses with operating income',
    formula: 'Interest Coverage = Operating Income ÷ Interest Expense',
    methodology: 'Interest coverage ratio measures a company\'s ability to pay interest expenses with its operating income. It indicates financial stability and debt servicing capacity.',
    interpretation: 'Ratios above 2.5x are generally considered safe, while ratios below 1.5x may indicate financial stress. Higher ratios provide more financial flexibility.'
  },
  currentRatio: {
    title: 'Current Ratio',
    description: 'Ability to pay short-term obligations with current assets',
    formula: 'Current Ratio = Current Assets ÷ Current Liabilities',
    methodology: 'The current ratio measures a company\'s ability to pay its short-term obligations with its current assets. It\'s a key liquidity metric.',
    interpretation: 'Ratios between 1.5-3.0 are generally considered healthy. Ratios below 1.0 may indicate liquidity problems, while ratios above 3.0 may suggest inefficient use of assets.'
  }
};

export default function KPIDetailsModal({ kpiName, kpi, userId, onClose }: KPIDetailsModalProps) {
  const [data, setData] = useState<KPIDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<any>(null);

  useEffect(() => {
    fetchKPIDetails();
    fetchAIInsights();
  }, [kpiName]);

  const fetchKPIDetails = async () => {
    try {
      const response = await fetch(
        `http://localhost:8787/insights/calculation/${kpiName}`,
        {
          headers: { 'x-user-id': userId }
        }
      );
      const result = await response.json();
      if (result.success) {
        setData(result.calculation);
      } else {
        // If backend doesn't have the metric, create mock data
        setData(createMockKPIData(kpiName, kpi));
      }
    } catch (error) {
      console.error('Failed to fetch KPI details:', error);
      // Fallback to mock data
      setData(createMockKPIData(kpiName, kpi));
    } finally {
      setLoading(false);
    }
  };

  const createMockKPIData = (metricName: string, kpi: KPICalculationResult): KPIDetailsData => {
    const description = KPI_DESCRIPTIONS[metricName as keyof typeof KPI_DESCRIPTIONS];
    if (!description) {
      return {
        metric: metricName,
        formula: 'N/A',
        calculation: { result: kpi.value, unit: 'N/A' },
        methodology: 'Calculation details not available',
        interpretation: 'This metric is calculated from uploaded financial documents.',
        dataSources: ['Uploaded financial documents']
      };
    }

    return {
      metric: description.title,
      formula: description.formula,
      calculation: { 
        result: kpi.value, 
        unit: kpi.unit || 'N/A' 
      },
      methodology: description.methodology,
      interpretation: description.interpretation,
      dataSources: ['Balance Sheet', 'Income Statement', 'Cash Flow Statement']
    };
  };

  const fetchAIInsights = async () => {
    try {
      const response = await fetch('http://localhost:8787/chat/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-company-id': 'seed-company',
          'x-user-id': userId
        },
        body: JSON.stringify({
          question: `Provide detailed insights and recommendations for the ${kpiName} KPI. Current value: ${kpi.value}. Status: ${kpi.status}. Include trends, benchmarks, and actionable recommendations.`
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setAiInsights(result.response);
      } else {
        // Fallback to mock AI insights
        setAiInsights(createMockAIInsights(kpiName, kpi));
      }
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
      // Fallback to mock AI insights
      setAiInsights(createMockAIInsights(kpiName, kpi));
    }
  };

  const createMockAIInsights = (metricName: string, kpi: KPICalculationResult) => {
    const statusMessages = {
      good: 'This KPI is performing well and indicates healthy financial management.',
      warning: 'This KPI requires attention and may need improvement.',
      critical: 'This KPI is in a critical state and requires immediate action.'
    };

    return `${statusMessages[kpi.status]} The ${metricName} KPI shows a value of ${kpi.value}, which ${kpi.status === 'good' ? 'indicates strong performance' : 'suggests areas for improvement'}. Consider monitoring this metric regularly and comparing with industry benchmarks for better context.`;
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toLocaleString()}`;
  };

  const formatValue = (value: number | string) => {
    if (typeof value === 'string') return value;
    
    switch (kpiName) {
      case 'cash':
      case 'freeCashFlow':
        return formatCurrency(value);
      case 'runway':
        return `${value.toFixed(1)} months`;
      case 'revenueGrowth':
      case 'grossMargin':
      case 'operatingMargin':
        return `${value.toFixed(1)}%`;
      case 'cashConversionCycle':
        return `${value.toFixed(0)} days`;
      case 'interestCoverage':
      case 'currentRatio':
        return `${value.toFixed(2)}x`;
      default:
        return value.toLocaleString();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500/10 border-green-500/30';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'critical': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  const generateMockChartData = () => {
    const months = 12;
    const data = [];
    const baseValue = typeof kpi.value === 'number' ? kpi.value : 0;
    
    // Use a seeded random generator for consistent values
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    for (let i = months - 1; i >= 0; i--) {
      const variation = (seededRandom(i * 1.1) - 0.5) * 0.2; // ±10% variation
      const value = baseValue * (1 + variation);
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      data.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        value: Math.max(0, value),
        period: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      });
    }
    
    return data;
  };

  const kpiInfo = KPI_DESCRIPTIONS[kpiName as keyof typeof KPI_DESCRIPTIONS];
  const chartData = generateMockChartData();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="glass-card max-w-4xl w-full max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex justify-between items-start p-4 pb-3 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
              {KPI_ICONS[kpiName as keyof typeof KPI_ICONS]}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-text-primary">
                {kpiInfo?.title || kpiName}
              </h2>
              <p className="text-text-secondary text-lg">
                {kpiInfo?.description || 'Key Performance Indicator'}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <div className={`text-2xl font-bold ${getStatusColor(kpi.status)}`}>
                  {formatValue(kpi.value)}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBgColor(kpi.status)}`}>
                  {kpi.status.charAt(0).toUpperCase() + kpi.status.slice(1)}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Calculation Details */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-accent-blue" />
                  Calculation Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Formula</label>
                    <div className="bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 p-3 rounded-lg mt-1">
                      <code className="text-accent-blue font-mono text-sm">{kpiInfo?.formula}</code>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Current Calculation</label>
                    <div className="bg-white/5 p-3 rounded-lg mt-1">
                      <code className="text-text-primary font-mono text-sm">{kpi.calculation}</code>
                    </div>
                  </div>

                  {kpi.source.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-text-secondary">Data Sources</label>
                      <div className="mt-1">
                        {kpi.source.map((source, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-text-primary py-1">
                            <FileText className="w-4 h-4 text-accent-blue" />
                            <span>{source}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Methodology */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Methodology</h3>
                <p className="text-text-secondary leading-relaxed">
                  {kpiInfo?.methodology || 'This KPI is calculated using standard financial analysis methods based on your uploaded financial documents.'}
                </p>
              </div>

              {/* Interpretation */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent-green" />
                  Interpretation
                </h3>
                <p className="text-text-primary leading-relaxed">
                  {kpiInfo?.interpretation || 'This metric provides insights into your business performance and financial health.'}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Chart */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent-purple" />
                  Historical Trend
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="month" 
                        stroke="rgba(255,255,255,0.6)"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.6)"
                        fontSize={12}
                        tickFormatter={(value) => {
                          if (kpiName === 'cash' || kpiName === 'freeCashFlow') {
                            return formatCurrency(value);
                          } else if (kpiName === 'runway') {
                            return `${value.toFixed(1)}m`;
                          } else if (kpiName.includes('Margin') || kpiName === 'revenueGrowth') {
                            return `${value.toFixed(1)}%`;
                          } else if (kpiName === 'cashConversionCycle') {
                            return `${value.toFixed(0)}d`;
                          } else {
                            return `${value.toFixed(1)}x`;
                          }
                        }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                        formatter={(value: any) => [formatValue(value), kpiName]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Insights */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-accent-orange" />
                  AI Insights & Recommendations
                </h3>
                {aiInsights ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-accent-orange/10 to-accent-purple/10 p-4 rounded-lg">
                      <p className="text-text-primary leading-relaxed">{aiInsights}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-orange mx-auto mb-4"></div>
                    <p className="text-text-secondary">Generating AI insights...</p>
                  </div>
                )}
              </div>

              {/* Thresholds & Benchmarks */}
              {kpi.threshold && (
                <div className="glass-card p-6">
                  <h3 className="text-xl font-semibold text-text-primary mb-4">Thresholds & Benchmarks</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-text-primary">Good</span>
                      </div>
                      <span className="text-sm text-text-primary font-semibold">
                        ≥ {formatValue(kpi.threshold.good)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-text-primary">Warning</span>
                      </div>
                      <span className="text-sm text-text-primary font-semibold">
                        ≥ {formatValue(kpi.threshold.warning)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-text-primary">Critical</span>
                      </div>
                      <span className="text-sm text-text-primary font-semibold">
                        &lt; {formatValue(kpi.threshold.critical)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
