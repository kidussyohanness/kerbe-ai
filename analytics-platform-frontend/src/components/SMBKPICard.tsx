'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KPICalculationResult, SMBKPICalculator } from '@/lib/kpiCalculations';

interface SMBKPICardProps {
  title: string;
  kpi: KPICalculationResult;
  icon: React.ReactNode;
  format?: 'currency' | 'percentage' | 'number' | 'days' | 'months' | 'ratio';
  onExplain?: () => void;
  className?: string;
}

export default function SMBKPICard({
  title,
  kpi,
  icon,
  format = 'number',
  onExplain,
  className = ''
}: SMBKPICardProps) {
  
  const formatValue = (value: number | string) => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'currency':
        return SMBKPICalculator.formatCurrency(value);
      case 'percentage':
        return SMBKPICalculator.formatPercentage(value);
      case 'days':
        return `${value.toFixed(0)} days`;
      case 'months':
        return `${value.toFixed(1)} mo`;
      case 'ratio':
        return `${value.toFixed(2)}x`;
      default:
        return value.toLocaleString();
    }
  };

  const getStatusIcon = () => {
    switch (kpi.status) {
      case 'good':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <Minus className="w-4 h-4 text-yellow-600" />;
      case 'critical':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (kpi.status) {
      case 'good': return 'Good';
      case 'warning': return 'Needs Attention';
      case 'critical': return 'Critical';
      case 'unavailable': return 'Unavailable';
      default: return 'Unknown';
    }
  };

  return (
    <div 
      className={`glass-card glass-gradient p-6 border ${SMBKPICalculator.getStatusBgColor(kpi.status)} ${className} ${onExplain ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : ''}`}
      onClick={onExplain}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-white/20 rounded-lg">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${SMBKPICalculator.getStatusColor(kpi.status)}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Value */}
      <div className="mb-4">
        <div className={`text-3xl font-bold ${SMBKPICalculator.getStatusColor(kpi.status)}`}>
          {formatValue(kpi.value)}
        </div>
        
        {/* Threshold indicators */}
        {kpi.threshold && typeof kpi.value === 'number' && (
          <div className="flex items-center space-x-2 mt-2">
            <div className="flex space-x-1">
              <div className={`w-2 h-2 rounded-full ${kpi.value >= kpi.threshold.good ? 'bg-green-500' : 'bg-gray-300'}`} />
              <div className={`w-2 h-2 rounded-full ${kpi.value >= kpi.threshold.warning ? 'bg-yellow-500' : 'bg-gray-300'}`} />
              <div className={`w-2 h-2 rounded-full ${kpi.value >= kpi.threshold.critical ? 'bg-red-500' : 'bg-gray-300'}`} />
            </div>
            <span className="text-xs text-text-secondary">
              Target: {formatValue(kpi.threshold.good)}
            </span>
          </div>
        )}
        
        {onExplain && (
          <div className="text-xs text-text-secondary mt-2 opacity-70">
            Click to view details
          </div>
        )}
      </div>

      {/* Calculation */}
      <div className="text-xs text-text-secondary bg-white/10 rounded-lg p-3">
        <div className="font-medium mb-1">Calculation:</div>
        <div className="font-mono text-xs">{kpi.calculation}</div>
        
        {kpi.source.length > 0 && (
          <div className="mt-2">
            <div className="font-medium mb-1">Source:</div>
            <ul className="text-xs space-y-1">
              {kpi.source.map((source, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-accent-blue mr-1">•</span>
                  <span>{source}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
