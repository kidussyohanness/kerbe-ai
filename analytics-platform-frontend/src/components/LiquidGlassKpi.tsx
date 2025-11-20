'use client';

import React from 'react';

interface LiquidGlassKpiProps {
  title: string;
  value: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
  className?: string;
}

const LiquidGlassKpi: React.FC<LiquidGlassKpiProps> = ({
  title,
  value,
  description,
  trend = 'neutral',
  icon,
  className = ''
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-text-muted';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <div className={`glass-card glass-blue p-6 hover-lift group ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {icon && <span className="text-2xl">{icon}</span>}
            <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
          </div>
          
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-text-primary">{value}</p>
            <span className={`text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
            </span>
          </div>
          
          {description && (
            <p className="text-xs text-text-muted mt-1">{description}</p>
          )}
        </div>
        
        {/* Animated background glow */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent-blue/5 to-accent-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );
};

export default LiquidGlassKpi;
