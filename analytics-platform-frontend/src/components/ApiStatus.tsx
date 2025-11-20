'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import LoadingSpinner from './LoadingSpinner';

interface ApiStatusProps {
  className?: string;
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'checking';
  responseTime?: number;
  lastChecked?: Date;
  error?: string;
}

export default function ApiStatus({ className = '' }: ApiStatusProps) {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Backend Health', status: 'checking' },
    { name: 'Analytics API', status: 'checking' },
    { name: 'Document Analysis', status: 'checking' },
    { name: 'Chat API', status: 'checking' },
  ]);
  const [isChecking, setIsChecking] = useState(false);

  const checkService = async (serviceName: string, checkFn: () => Promise<any>) => {
    const startTime = Date.now();
    try {
      const response = await checkFn();
      const responseTime = Date.now() - startTime;
      
      setServices(prev => prev.map(s => 
        s.name === serviceName 
          ? { 
              ...s, 
              status: response.success ? 'healthy' : 'unhealthy',
              responseTime,
              lastChecked: new Date(),
              error: response.success ? undefined : response.error
            }
          : s
      ));
    } catch (error) {
      const responseTime = Date.now() - startTime;
      setServices(prev => prev.map(s => 
        s.name === serviceName 
          ? { 
              ...s, 
              status: 'unhealthy',
              responseTime,
              lastChecked: new Date(),
              error: error instanceof Error ? error.message : String(error)
            }
          : s
      ));
    }
  };

  const checkAllServices = async () => {
    setIsChecking(true);
    
    await Promise.all([
      checkService('Backend Health', () => apiService.getHealth()),
      checkService('Analytics API', () => apiService.getAnalyticsOverview()),
      checkService('Document Analysis', () => apiService.getDocumentHealth()),
      checkService('Chat API', () => apiService.askQuestion('test')),
    ]);
    
    setIsChecking(false);
  };

  useEffect(() => {
    checkAllServices();
    
    // Check every 30 seconds
    const interval = setInterval(checkAllServices, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'OK';
      case 'unhealthy':
        return 'ERROR';
      case 'checking':
        return 'CHECK';
      default:
        return '?';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'unhealthy':
        return 'text-red-600';
      case 'checking':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">API Status</h3>
        <button
          onClick={checkAllServices}
          disabled={isChecking}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Refresh'}
        </button>
      </div>
      
      <div className="space-y-3">
        {services.map((service) => (
          <div key={service.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">
                {getStatusIcon(service.status)}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {service.name}
              </span>
            </div>
            
            <div className="text-right">
              <div className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                {service.status === 'checking' ? (
                  <LoadingSpinner size="sm" text="" />
                ) : (
                  service.status
                )}
              </div>
              {service.responseTime && (
                <div className="text-xs text-gray-500">
                  {service.responseTime}ms
                </div>
              )}
              {service.error && (
                <div className="text-xs text-red-500 max-w-32 truncate" title={service.error}>
                  {service.error}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Last checked: {services[0]?.lastChecked?.toLocaleTimeString() || 'Never'}
        </div>
      </div>
    </div>
  );
}
