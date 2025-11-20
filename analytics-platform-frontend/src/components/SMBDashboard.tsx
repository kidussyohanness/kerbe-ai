'use client';

import React, { useState } from 'react';
import SMBKPICard from '@/components/SMBKPICard';
import { SMBDashboardKPIs, SMBKPICalculator } from '@/lib/kpiCalculations';
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Percent, 
  RefreshCw, 
  Shield, 
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface SMBDashboardProps {
  kpis: SMBDashboardKPIs;
  onExplainKPI?: (kpiName: string) => void;
}

export default function SMBDashboard({ kpis, onExplainKPI }: SMBDashboardProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getCriticalKPIs = () => {
    return Object.entries(kpis).filter(([, kpi]) => kpi.status === 'critical');
  };

  const criticalKPIs = getCriticalKPIs();

  return (
    <div className="space-y-8">
      {/* Critical Alerts Banner */}
      {criticalKPIs.length > 0 && (
        <div className="glass-card glass-red p-6 border border-red-200">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-800">
              Critical Issues Requiring Immediate Attention
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criticalKPIs.map(([kpiName, kpi]) => (
              <div key={kpiName} className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="font-semibold text-red-800 capitalize">
                  {kpiName.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-red-600 text-sm">
                  {typeof kpi.value === 'number' ? SMBKPICalculator.formatCurrency(kpi.value) : kpi.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overview Section */}
      <div className="glass-card glass-gradient p-6">
        <div 
          className="flex items-center justify-between cursor-pointer mb-6"
          onClick={() => toggleSection('overview')}
        >
          <h2 className="text-2xl font-bold text-text-primary">Overview</h2>
          {expandedSections.has('overview') ? 
            <ChevronUp className="w-6 h-6 text-text-secondary" /> : 
            <ChevronDown className="w-6 h-6 text-text-secondary" />
          }
        </div>
        
        {expandedSections.has('overview') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SMBKPICard
              title="Cash"
              kpi={kpis.cash}
              icon={<DollarSign className="w-5 h-5 text-accent-blue" />}
              format="currency"
              onExplain={() => onExplainKPI?.('cash')}
            />
            
            <SMBKPICard
              title="Runway"
              kpi={kpis.runway}
              icon={<Clock className="w-5 h-5 text-accent-green" />}
              format="months"
              onExplain={() => onExplainKPI?.('runway')}
            />
            
            <SMBKPICard
              title="Free Cash Flow"
              kpi={kpis.freeCashFlow}
              icon={<TrendingUp className="w-5 h-5 text-accent-purple" />}
              format="currency"
              onExplain={() => onExplainKPI?.('freeCashFlow')}
            />
            
            <SMBKPICard
              title="Revenue Growth"
              kpi={kpis.revenueGrowth}
              icon={<Percent className="w-5 h-5 text-accent-orange" />}
              format="percentage"
              onExplain={() => onExplainKPI?.('revenueGrowth')}
            />
          </div>
        )}
      </div>

      {/* Profitability Section */}
      <div className="glass-card glass-gradient p-6">
        <div 
          className="flex items-center justify-between cursor-pointer mb-6"
          onClick={() => toggleSection('profitability')}
        >
          <h2 className="text-2xl font-bold text-text-primary">Profitability</h2>
          {expandedSections.has('profitability') ? 
            <ChevronUp className="w-6 h-6 text-text-secondary" /> : 
            <ChevronDown className="w-6 h-6 text-text-secondary" />
          }
        </div>
        
        {expandedSections.has('profitability') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SMBKPICard
              title="Gross Margin %"
              kpi={kpis.grossMargin}
              icon={<Percent className="w-5 h-5 text-green-600" />}
              format="percentage"
              onExplain={() => onExplainKPI?.('grossMargin')}
            />
            
            <SMBKPICard
              title="Operating Margin %"
              kpi={kpis.operatingMargin}
              icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
              format="percentage"
              onExplain={() => onExplainKPI?.('operatingMargin')}
            />
          </div>
        )}
      </div>

      {/* Cash & Working Capital Section */}
      <div className="glass-card glass-gradient p-6">
        <div 
          className="flex items-center justify-between cursor-pointer mb-6"
          onClick={() => toggleSection('cashWorkingCapital')}
        >
          <h2 className="text-2xl font-bold text-text-primary">Cash & Working Capital</h2>
          {expandedSections.has('cashWorkingCapital') ? 
            <ChevronUp className="w-6 h-6 text-text-secondary" /> : 
            <ChevronDown className="w-6 h-6 text-text-secondary" />
          }
        </div>
        
        {expandedSections.has('cashWorkingCapital') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SMBKPICard
              title="Cash Conversion Cycle"
              kpi={kpis.cashConversionCycle}
              icon={<RefreshCw className="w-5 h-5 text-purple-600" />}
              format="days"
              onExplain={() => onExplainKPI?.('cashConversionCycle')}
            />
            
            {kpis.currentRatio && (
              <SMBKPICard
                title="Current Ratio"
                kpi={kpis.currentRatio}
                icon={<Shield className="w-5 h-5 text-indigo-600" />}
                format="ratio"
                onExplain={() => onExplainKPI?.('currentRatio')}
              />
            )}
          </div>
        )}
      </div>

      {/* Risk Section */}
      <div className="glass-card glass-gradient p-6">
        <div 
          className="flex items-center justify-between cursor-pointer mb-6"
          onClick={() => toggleSection('risk')}
        >
          <h2 className="text-2xl font-bold text-text-primary">Risk</h2>
          {expandedSections.has('risk') ? 
            <ChevronUp className="w-6 h-6 text-text-secondary" /> : 
            <ChevronDown className="w-6 h-6 text-text-secondary" />
          }
        </div>
        
        {expandedSections.has('risk') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SMBKPICard
              title="Interest Coverage"
              kpi={kpis.interestCoverage}
              icon={<Shield className="w-5 h-5 text-red-600" />}
              format="ratio"
              onExplain={() => onExplainKPI?.('interestCoverage')}
            />
            
            {kpis.currentRatio && (
              <SMBKPICard
                title="Current Ratio"
                kpi={kpis.currentRatio}
                icon={<Shield className="w-5 h-5 text-indigo-600" />}
                format="ratio"
                onExplain={() => onExplainKPI?.('currentRatio')}
              />
            )}
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="glass-card glass-blue p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4">
          💡 Quick Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="font-semibold text-accent-blue mb-2">Runway Management</div>
            <div className="text-text-secondary">
              Green: ≥12 mo | Yellow: 6-12 mo | Red: &lt;6 mo
            </div>
          </div>
          
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="font-semibold text-accent-green mb-2">Margin Health</div>
            <div className="text-text-secondary">
              GM% drop &gt;2pp MoM = Red flag
            </div>
          </div>
          
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="font-semibold text-accent-purple mb-2">Working Capital</div>
            <div className="text-text-secondary">
              CCC rising ≥2 months or &gt;60 days = Red flag
            </div>
          </div>
          
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="font-semibold text-accent-red mb-2">Interest Risk</div>
            <div className="text-text-secondary">
              Coverage &lt;2x = Red | 2-3x = Yellow
            </div>
          </div>
          
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="font-semibold text-accent-orange mb-2">Liquidity</div>
            <div className="text-text-secondary">
              Current Ratio &lt;1.0 = Red flag
            </div>
          </div>
          
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="font-semibold text-accent-blue mb-2">Data Quality</div>
            <div className="text-text-secondary">
              Click help icons to see calculation details
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
