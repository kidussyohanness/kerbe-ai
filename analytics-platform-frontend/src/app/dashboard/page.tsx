'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import SMBDashboard from '@/components/SMBDashboard';
import Link from 'next/link';
import KPIDetailsModal from '@/components/KPIDetailsModal';
import { SMBKPICalculator, SMBDashboardKPIs, KPICalculationResult } from '@/lib/kpiCalculations';
// Define FinancialData interface locally to avoid cross-package imports
interface FinancialData {
  companyName: string;
  period: string;
  balanceSheet: {
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
  };
  incomeStatement: {
    totalRevenue: number;
    costOfGoodsSold: number;
    grossProfit: number;
    operatingExpenses: number;
    operatingIncome: number;
    interestExpense: number;
    taxExpense: number;
    netIncome: number;
  };
  cashFlow: {
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    netCashFlow: number;
  };
}
import { MessageCircle, AlertTriangle, Upload, RefreshCw, CheckCircle } from 'lucide-react';

interface SMBDashboardData {
  kpis: SMBDashboardKPIs;
  dataCompleteness: {
    score: number;
    requiredDocs: number;
    totalRequiredDocs: number;
    recommendedDocs: number;
    totalRecommendedDocs: number;
    monthsOfData: number;
    hasBalanceSheet: boolean;
    hasIncomeStatement: boolean;
    hasCashFlow: boolean;
  };
  documentCount: number;
  isValidForKPIs: boolean;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<SMBDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedKPI, setSelectedKPI] = useState<{name: string, kpi: KPICalculationResult} | null>(null);
  const [lastDocumentCount, setLastDocumentCount] = useState<number>(0);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get userId from session
      const userId = (session?.user as { id?: string })?.id;
      if (!userId) {
        console.warn('User not authenticated');
        setLoading(false);
        return;
      }
      
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8787';
      
      try {
        // Fetch real financial data from uploaded documents
        const response = await fetch(`${baseUrl}/dashboard/financial-data/${userId}?months=12`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch financial data');
        }
        
        const result = await response.json();
        
        if (result.success) {
          const { financialData, dataCompleteness, documentCount } = result.data;
          
          // Check if we have the minimum required documents
          const isValidForKPIs = dataCompleteness.hasBalanceSheet && 
                                dataCompleteness.hasIncomeStatement && 
                                dataCompleteness.hasCashFlow;
          
          // Check if document count has increased (new documents uploaded)
          if (documentCount > lastDocumentCount && lastDocumentCount > 0) {
            setShowUpdatePrompt(true);
          }
          setLastDocumentCount(documentCount);
          
          if (financialData.length > 0 && isValidForKPIs) {
            // Use real data from uploaded documents
            const kpis = SMBKPICalculator.calculateAllKPIs(financialData);
            
            setDashboardData({
              kpis,
              dataCompleteness,
              documentCount,
              isValidForKPIs: true
            });
            return;
          } else {
            // Not enough documents or invalid data
            setDashboardData({
              kpis: {} as SMBDashboardKPIs, // Empty KPIs
              dataCompleteness,
              documentCount,
              isValidForKPIs: false
            });
            return;
          }
        }
      } catch (apiError) {
        console.warn('Failed to fetch real data, falling back to mock data:', apiError);
      }
      
      // Fallback: Use mock data if no real data available
      const mockFinancialData: FinancialData[] = Array.from({ length: 12 }, (_, i) => {
        const monthOffset = 11 - i;
        const baseRevenue = 6500000 + (monthOffset * 150000);
        const baseCOGS = baseRevenue * 0.4;
        const baseOpEx = baseRevenue * 0.15;
        
        return {
          companyName: 'Sample SMB',
          period: new Date(Date.now() - monthOffset * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          balanceSheet: {
            totalAssets: 15000000 + (monthOffset * 200000),
            currentAssets: 8000000 + (monthOffset * 100000),
            nonCurrentAssets: 7000000 + (monthOffset * 100000),
            totalLiabilities: 6000000 + (monthOffset * 50000),
            currentLiabilities: 3000000 + (monthOffset * 25000),
            nonCurrentLiabilities: 3000000 + (monthOffset * 25000),
            totalEquity: 9000000 + (monthOffset * 150000),
            cash: 3200000 - (monthOffset * 50000),
            accountsReceivable: 1200000 + (monthOffset * 20000),
            inventory: 800000 + (monthOffset * 10000),
            accountsPayable: 600000 + (monthOffset * 5000),
            shortTermDebt: 500000,
            longTermDebt: 2500000,
            retainedEarnings: 5000000 + (monthOffset * 100000)
          },
          incomeStatement: {
            totalRevenue: baseRevenue,
            costOfGoodsSold: baseCOGS,
            grossProfit: baseRevenue - baseCOGS,
            operatingExpenses: baseOpEx,
            operatingIncome: baseRevenue - baseCOGS - baseOpEx,
            interestExpense: 25000,
            taxExpense: (baseRevenue - baseCOGS - baseOpEx - 25000) * 0.25,
            netIncome: (baseRevenue - baseCOGS - baseOpEx - 25000) * 0.75
          },
          cashFlow: {
            operatingCashFlow: (baseRevenue - baseCOGS - baseOpEx) * 0.8,
            investingCashFlow: -150000,
            financingCashFlow: -50000,
            netCashFlow: (baseRevenue - baseCOGS - baseOpEx) * 0.8 - 150000 - 50000
          }
        };
      });
      
      const kpis = SMBKPICalculator.calculateAllKPIs(mockFinancialData);
      
      setDashboardData({
        kpis,
        dataCompleteness: {
          score: 0, // Indicate this is mock data
          requiredDocs: 0,
          totalRequiredDocs: 3,
          recommendedDocs: 0,
          totalRecommendedDocs: 36,
          monthsOfData: 12,
          hasBalanceSheet: false,
          hasIncomeStatement: false,
          hasCashFlow: false
        },
        documentCount: 0,
        isValidForKPIs: false
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [lastDocumentCount, session]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);


  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent-blue mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading SMB dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const kpis = dashboardData?.kpis;
  const completeness = dashboardData?.dataCompleteness;

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-2">
            Executive Dashboard
          </h1>
          <p className="text-xl text-text-secondary">
            Your company&apos;s 8 most critical KPIs - {completeness?.monthsOfData || 0} months of data analyzed
          </p>
        </div>

        {/* Missing Documents Warning Banner */}
        {dashboardData && !dashboardData.isValidForKPIs && (
          <div className="glass-card glass-red p-6 border border-red-200 animate-slide-in">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Missing Required Documents
                </h3>
                <p className="text-red-700 mb-4">
                  To calculate KPIs, you need to upload at least one of each document type:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className={`p-4 rounded-lg border-2 ${
                    dashboardData.dataCompleteness.hasBalanceSheet 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {dashboardData.dataCompleteness.hasBalanceSheet ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                      <span className={`font-semibold ${
                        dashboardData.dataCompleteness.hasBalanceSheet ? 'text-green-800' : 'text-red-800'
                      }`}>
                        Balance Sheet
                      </span>
                    </div>
                    <p className={`text-sm ${
                      dashboardData.dataCompleteness.hasBalanceSheet ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {dashboardData.dataCompleteness.hasBalanceSheet 
                        ? '✅ Uploaded' 
                        : '❌ Required for Cash, Current Ratio, CCC calculations'
                      }
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-lg border-2 ${
                    dashboardData.dataCompleteness.hasIncomeStatement 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {dashboardData.dataCompleteness.hasIncomeStatement ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                      <span className={`font-semibold ${
                        dashboardData.dataCompleteness.hasIncomeStatement ? 'text-green-800' : 'text-red-800'
                      }`}>
                        Income Statement
                      </span>
                    </div>
                    <p className={`text-sm ${
                      dashboardData.dataCompleteness.hasIncomeStatement ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {dashboardData.dataCompleteness.hasIncomeStatement 
                        ? '✅ Uploaded' 
                        : '❌ Required for Revenue Growth, Margins, Interest Coverage'
                      }
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-lg border-2 ${
                    dashboardData.dataCompleteness.hasCashFlow 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {dashboardData.dataCompleteness.hasCashFlow ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                      <span className={`font-semibold ${
                        dashboardData.dataCompleteness.hasCashFlow ? 'text-green-800' : 'text-red-800'
                      }`}>
                        Cash Flow Statement
                      </span>
                    </div>
                    <p className={`text-sm ${
                      dashboardData.dataCompleteness.hasCashFlow ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {dashboardData.dataCompleteness.hasCashFlow 
                        ? '✅ Uploaded' 
                        : '❌ Required for Runway, Free Cash Flow calculations'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href="/dashboard/documents"
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Missing Documents
                  </a>
                  <span className="text-sm text-red-600">
                    {dashboardData.documentCount} document(s) uploaded
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Data Update Prompt */}
        {showUpdatePrompt && dashboardData && dashboardData.isValidForKPIs && (
          <div className="glass-card glass-blue p-6 border border-blue-200 animate-slide-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">
                    New Data Found!
                  </h3>
                  <p className="text-blue-700">
                    {dashboardData.documentCount - lastDocumentCount} new document(s) uploaded. 
                    Click &quot;Update KPIs&quot; to refresh calculations with the latest data.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowUpdatePrompt(false);
                    fetchDashboardData();
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Update KPIs
                </button>
                <button
                  onClick={() => setShowUpdatePrompt(false)}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Completeness Banner */}
        {completeness && completeness.score < 100 && (
          <div className="glass-card glass-gradient p-6 border border-accent-blue/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  Data Completeness: {completeness.score}%
                </h3>
                <p className="text-sm text-text-secondary">
                  {completeness.requiredDocs}/{completeness.totalRequiredDocs} required documents | {' '}
                  {completeness.recommendedDocs}/{completeness.totalRecommendedDocs} recommended documents | {' '}
                  {completeness.monthsOfData} months of history
                </p>
              </div>
              <a
                href="/dashboard/documents"
                className="px-4 py-2 bg-accent-blue/20 hover:bg-accent-blue/30 text-accent-blue rounded-lg transition-colors text-sm font-medium"
              >
                Upload More Data
              </a>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-accent-blue to-accent-green h-2 rounded-full transition-all duration-500"
                style={{ width: `${completeness.score}%` }}
              />
            </div>
          </div>
        )}

        {/* SMB Dashboard */}
        {kpis && dashboardData?.isValidForKPIs && (
          <SMBDashboard 
            kpis={kpis} 
            onExplainKPI={(kpiName) => {
              const kpi = kpis[kpiName as keyof typeof kpis];
              if (kpi) {
                setSelectedKPI({name: kpiName, kpi});
              }
            }}
          />
        )}

        {/* No Valid Data Message */}
        {dashboardData && !dashboardData.isValidForKPIs && (
          <div className="glass-card p-12 text-center">
            <div className="max-w-md mx-auto">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-text-primary mb-4">
                KPIs Not Available
          </h3>
              <p className="text-text-secondary mb-6">
                Upload at least one Balance Sheet, Income Statement, and Cash Flow Statement 
                to enable KPI calculations and analysis.
              </p>
              <a
                href="/dashboard/documents"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent-blue hover:bg-accent-blue/80 text-white rounded-lg transition-colors font-medium"
              >
                <Upload className="w-5 h-5" />
                Upload Documents
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Floating Chat Button */}
      <Link href="/dashboard/chat">
        <button className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40 animate-bounce-slow">
          <MessageCircle className="w-7 h-7 text-white" />
        </button>
      </Link>

      {selectedKPI && (
        <KPIDetailsModal
          kpiName={selectedKPI.name}
          kpi={selectedKPI.kpi}
          userId={(session?.user as { id?: string })?.id || ''}
          onClose={() => setSelectedKPI(null)}
        />
      )}
    </DashboardLayout>
  );
}
