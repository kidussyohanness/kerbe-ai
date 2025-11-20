'use client';

import React, { useState, useEffect } from 'react';
import { DocumentType, AnalysisResult } from '@/types/documentAnalysis';
import { BusinessContext, DynamicQuestion, EnhancedAnalysisResult } from '@/types/enhancedDocumentAnalysis';
import LoadingSpinner from './LoadingSpinner';

interface EnhancedDocumentAnalyticsProps {
  onAnalysisComplete?: (analysis: EnhancedAnalysisResult) => void;
  showDemoMode?: boolean;
}

const DOCUMENT_TYPES_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: 'balance_sheet', label: 'Balance Sheet' },
  { value: 'income_statement', label: 'Income Statement' },
  { value: 'cash_flow', label: 'Cash Flow Statement' },
  { value: 'financial_reports', label: 'General Financial Report' },
  { value: 'inventory', label: 'Inventory Report' },
  { value: 'budget', label: 'Budget Report' },
  { value: 'forecast', label: 'Financial Forecast' },
];

export default function EnhancedDocumentAnalytics({ onAnalysisComplete, showDemoMode = false }: EnhancedDocumentAnalyticsProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [businessContext, setBusinessContext] = useState<BusinessContext>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [analysisResults, setAnalysisResults] = useState<EnhancedAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'insights' | 'recommendations'>('overview');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setAnalysisResults(null);
    }
  };

  const handleDocumentTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDocumentType(event.target.value as DocumentType);
    setError(null);
  };

  const handleBusinessContextChange = (field: keyof BusinessContext, value: any) => {
    setBusinessContext(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedFile || !documentType) {
      setError('Please select a file and a document type.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResults(null);
    setAnalysisProgress('Uploading document...');
    setProgressPercentage(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('documentType', documentType);
    formData.append('businessContext', JSON.stringify(businessContext));

    // Simulate progress updates with percentage
    const progressSteps = [
      { text: 'Uploading document...', percentage: 10 },
      { text: 'Analyzing document structure...', percentage: 25 },
      { text: 'Extracting financial data...', percentage: 50 },
      { text: 'Generating insights...', percentage: 75 },
      { text: 'Creating recommendations...', percentage: 90 },
      { text: 'Finalizing analysis...', percentage: 100 }
    ];

    let currentStep = 0;
    const progressInterval = setInterval(() => {
      if (currentStep < progressSteps.length) {
        const step = progressSteps[currentStep];
        setAnalysisProgress(step.text);
        setProgressPercentage(step.percentage);
        currentStep++;
      }
    }, 15000); // Update every 15 seconds

    try {
      const response = await fetch('/api/document/enhanced-analytics', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to perform enhanced document analysis');
      }

      const data = await response.json();
      setAnalysisResults(data);
      onAnalysisComplete?.(data);
      setAnalysisProgress('Analysis completed!');
      setProgressPercentage(100);
      console.log('Enhanced document analysis completed successfully!');
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message);
      console.error(`Analysis Error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDemoMode = () => {
    setIsAnalyzing(true);
    setError(null);
    setProgressPercentage(0);
    setAnalysisProgress('Starting demo analysis...');
    
    // Simulate progress for demo mode
    const demoProgressSteps = [
      { text: 'Starting demo analysis...', percentage: 20 },
      { text: 'Loading sample data...', percentage: 40 },
      { text: 'Processing mock financial data...', percentage: 60 },
      { text: 'Generating demo insights...', percentage: 80 },
      { text: 'Preparing results...', percentage: 100 }
    ];

    let demoStep = 0;
    const demoInterval = setInterval(() => {
      if (demoStep < demoProgressSteps.length) {
        const step = demoProgressSteps[demoStep];
        setAnalysisProgress(step.text);
        setProgressPercentage(step.percentage);
        demoStep++;
      }
    }, 400); // Update every 400ms for demo
    
    // Simulate analysis with mock data
    setTimeout(() => {
      const mockResults: EnhancedAnalysisResult = {
        success: true,
        documentType: 'financial_reports',
        extractedData: {
          companyName: 'Apple Inc.',
          period: 'Q3 2025',
          totalRevenue: 123500000000,
          netIncome: 28500000000,
          totalAssets: 450000000000,
          totalLiabilities: 280000000000,
          cash: 45000000000,
          operatingCashFlow: 35000000000
        },
        validation: { isValid: true, missingFields: [], invalidFields: [], warnings: [], completeness: 95 },
        mathValidation: { isValid: true, missingFields: [], invalidFields: [], warnings: [], completeness: 98 },
        errorDetection: { isValid: true, missingFields: [], invalidFields: [], warnings: [], completeness: 92 },
        confidence: 94,
        recommendations: ['Optimize cash management', 'Review debt structure', 'Enhance revenue diversification'],
        documentStructure: {
          sections: ['Income Statement', 'Balance Sheet', 'Cash Flow Statement', 'Notes'],
          tables: 8,
          charts: 3,
          confidence: 0.92
        },
        dynamicQuestions: [
          { id: 'q1', question: 'What is the company name?', field: 'companyName', category: 'basic', priority: 'high' },
          { id: 'q2', question: 'What is the total revenue?', field: 'totalRevenue', category: 'financial', priority: 'high' },
          { id: 'q3', question: 'What is the net income?', field: 'netIncome', category: 'financial', priority: 'high' }
        ],
        businessInsights: {
          industryBenchmark: {
            industry: 'Technology',
            percentile: 85,
            keyMetrics: { revenue: 'above average', profitability: 'excellent', liquidity: 'strong' }
          },
          peerComparison: {
            companySize: 'Large',
            performance: 'Above average',
            strengths: ['Strong cash position', 'High profitability', 'Low debt ratio'],
            weaknesses: ['Revenue concentration', 'Market saturation risk']
          },
          trendAnalysis: {
            growthRate: 8.5,
            volatility: 'Low',
            seasonality: 'Q4 peak',
            forecast: 'Stable growth expected'
          }
        },
        recommendations: {
          immediate: ['Review cash allocation strategy', 'Assess market expansion opportunities'],
          shortTerm: ['Optimize operational efficiency', 'Enhance product diversification'],
          longTerm: ['Develop new revenue streams', 'Strengthen market position']
        }
      };
      
      clearInterval(demoInterval);
      setAnalysisResults(mockResults);
      onAnalysisComplete?.(mockResults);
      setAnalysisProgress('Demo analysis completed!');
      setProgressPercentage(100);
      setIsAnalyzing(false);
      console.log('Demo analysis completed successfully!');
    }, 2000);
  };

  const renderOverview = () => {
    if (!analysisResults) return null;

    return (
      <div className="space-y-6">
        {/* Document Structure */}
        <div className="bg-glass-card p-6 rounded-xl">
          <h3 className="text-xl font-bold text-text-primary mb-4">Document Structure Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-glass-bg-secondary/30 p-4 rounded-lg">
              <h4 className="font-semibold text-text-primary mb-2">Sections Identified</h4>
              <p className="text-accent-blue font-bold">{analysisResults.documentStructure.sections.length}</p>
              <div className="mt-2 text-sm text-text-secondary">
                {analysisResults.documentStructure.sections.join(', ')}
              </div>
            </div>
            <div className="bg-glass-bg-secondary/30 p-4 rounded-lg">
              <h4 className="font-semibold text-text-primary mb-2">Tables Found</h4>
              <p className="text-accent-blue font-bold">{analysisResults.documentStructure.tables}</p>
            </div>
            <div className="bg-glass-bg-secondary/30 p-4 rounded-lg">
              <h4 className="font-semibold text-text-primary mb-2">Charts Found</h4>
              <p className="text-accent-blue font-bold">{analysisResults.documentStructure.charts}</p>
            </div>
          </div>
        </div>

        {/* Analysis Confidence */}
        <div className="bg-glass-card p-6 rounded-xl">
          <h3 className="text-xl font-bold text-text-primary mb-4">Analysis Confidence</h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1 bg-glass-bg-secondary rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-accent-blue to-accent-purple h-4 rounded-full transition-all duration-1000"
                style={{ width: `${analysisResults.confidence}%` }}
              ></div>
            </div>
            <span className="text-2xl font-bold text-accent-blue">{analysisResults.confidence}%</span>
          </div>
          <p className="text-sm text-text-secondary mt-2">
            Based on document structure analysis and data extraction completeness
          </p>
        </div>

        {/* Key Metrics */}
        <div className="bg-glass-card p-6 rounded-xl">
          <h3 className="text-xl font-bold text-text-primary mb-4">Key Extracted Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisResults.extractedData && Object.entries(analysisResults.extractedData).slice(0, 6).map(([key, value]) => (
              <div key={key} className="bg-glass-bg-secondary/30 p-4 rounded-lg">
                <h4 className="font-semibold text-text-primary mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <p className="text-accent-blue font-bold">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDataExtraction = () => {
    if (!analysisResults) return null;

    return (
      <div className="space-y-6">
        {/* Dynamic Questions */}
        <div className="bg-glass-card p-6 rounded-xl">
          <h3 className="text-xl font-bold text-text-primary mb-4">Dynamic Questions Generated</h3>
          <div className="space-y-4">
            {analysisResults.dynamicQuestions.map((question, index) => (
              <div key={question.id} className="bg-glass-bg-secondary/30 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-text-primary">{question.question}</h4>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      question.category === 'basic' ? 'bg-blue-100 text-blue-800' :
                      question.category === 'financial' ? 'bg-green-100 text-green-800' :
                      question.category === 'operational' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {question.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      question.priority === 'high' ? 'bg-red-100 text-red-800' :
                      question.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {question.priority}
                    </span>
                  </div>
                </div>
                <p className="text-text-secondary text-sm">
                  Field: <code className="bg-glass-bg-secondary px-2 py-1 rounded">{question.field}</code>
                </p>
                {question.validation && (
                  <p className="text-text-secondary text-sm mt-1">
                    Validation: {question.validation.type}
                    {question.validation.min && ` (min: ${question.validation.min})`}
                    {question.validation.max && ` (max: ${question.validation.max})`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Extracted Data */}
        <div className="bg-glass-card p-6 rounded-xl">
          <h3 className="text-xl font-bold text-text-primary mb-4">All Extracted Data</h3>
          <div className="bg-glass-bg-secondary p-4 rounded-lg">
            <pre className="text-sm text-text-secondary overflow-auto">
              {JSON.stringify(analysisResults.extractedData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  const renderInsights = () => {
    if (!analysisResults) return null;

    return (
      <div className="space-y-6">
        {/* Industry Benchmark */}
        {analysisResults.businessInsights.industryBenchmark && (
          <div className="bg-glass-card p-6 rounded-xl">
            <h3 className="text-xl font-bold text-text-primary mb-4">Industry Benchmarking</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-glass-bg-secondary/30 p-4 rounded-lg">
                <h4 className="font-semibold text-text-primary mb-2">Industry</h4>
                <p className="text-accent-blue font-bold">
                  {analysisResults.businessInsights.industryBenchmark.industry}
                </p>
              </div>
              <div className="bg-glass-bg-secondary/30 p-4 rounded-lg">
                <h4 className="font-semibold text-text-primary mb-2">Percentile</h4>
                <p className="text-accent-blue font-bold">
                  {analysisResults.businessInsights.industryBenchmark.percentile}th percentile
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Peer Comparison */}
        {analysisResults.businessInsights.peerComparison && (
          <div className="bg-glass-card p-6 rounded-xl">
            <h3 className="text-xl font-bold text-text-primary mb-4">Peer Comparison</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-glass-bg-secondary/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-text-primary mb-2">Company Size</h4>
                  <p className="text-accent-blue font-bold">
                    {analysisResults.businessInsights.peerComparison.companySize}
                  </p>
                </div>
                <div className="bg-glass-bg-secondary/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-text-primary mb-2">Performance</h4>
                  <p className="text-accent-blue font-bold">
                    {analysisResults.businessInsights.peerComparison.performance}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-glass-bg-secondary/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-text-primary mb-2">Strengths</h4>
                  <ul className="text-text-secondary">
                    {analysisResults.businessInsights.peerComparison.strengths?.map((strength, index) => (
                      <li key={index} className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-glass-bg-secondary/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-text-primary mb-2">Weaknesses</h4>
                  <ul className="text-text-secondary">
                    {analysisResults.businessInsights.peerComparison.weaknesses?.map((weakness, index) => (
                      <li key={index} className="flex items-center">
                        <span className="text-red-500 mr-2">⚠</span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trend Analysis */}
        {analysisResults.businessInsights.trendAnalysis && (
          <div className="bg-glass-card p-6 rounded-xl">
            <h3 className="text-xl font-bold text-text-primary mb-4">Trend Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-glass-bg-secondary/30 p-4 rounded-lg">
                <h4 className="font-semibold text-text-primary mb-2">Growth Rate</h4>
                <p className="text-accent-blue font-bold">
                  {analysisResults.businessInsights.trendAnalysis.growthRate}%
                </p>
              </div>
              <div className="bg-glass-bg-secondary/30 p-4 rounded-lg">
                <h4 className="font-semibold text-text-primary mb-2">Volatility</h4>
                <p className="text-accent-blue font-bold">
                  {analysisResults.businessInsights.trendAnalysis.volatility}
                </p>
              </div>
              <div className="bg-glass-bg-secondary/30 p-4 rounded-lg">
                <h4 className="font-semibold text-text-primary mb-2">Seasonality</h4>
                <p className="text-accent-blue font-bold">
                  {analysisResults.businessInsights.trendAnalysis.seasonality}
                </p>
              </div>
              <div className="bg-glass-bg-secondary/30 p-4 rounded-lg">
                <h4 className="font-semibold text-text-primary mb-2">Forecast</h4>
                <p className="text-accent-blue font-bold">
                  {analysisResults.businessInsights.trendAnalysis.forecast}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!analysisResults) return null;

    return (
      <div className="space-y-6">
        {/* Immediate Recommendations */}
        <div className="bg-glass-card p-6 rounded-xl">
          <h3 className="text-xl font-bold text-text-primary mb-4">Immediate Actions (0-3 months)</h3>
          <div className="space-y-3">
            {analysisResults.recommendations.immediate.map((rec, index) => (
              <div key={index} className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                <div className="flex items-start">
                  <span className="text-red-500 font-bold mr-3">!</span>
                  <p className="text-text-primary">{rec}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Short-term Recommendations */}
        <div className="bg-glass-card p-6 rounded-xl">
          <h3 className="text-xl font-bold text-text-primary mb-4">Short-term Actions (3-12 months)</h3>
          <div className="space-y-3">
            {analysisResults.recommendations.shortTerm.map((rec, index) => (
              <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                <div className="flex items-start">
                  <span className="text-yellow-500 font-bold mr-3">⚡</span>
                  <p className="text-text-primary">{rec}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Long-term Recommendations */}
        <div className="bg-glass-card p-6 rounded-xl">
          <h3 className="text-xl font-bold text-text-primary mb-4">Long-term Strategy (1-3 years)</h3>
          <div className="space-y-3">
            {analysisResults.recommendations.longTerm.map((rec, index) => (
              <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                <div className="flex items-start">
                  <span className="text-blue-500 font-bold mr-3">🎯</span>
                  <p className="text-text-primary">{rec}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-container glass-blue p-6 rounded-xl shadow-glow-blue">
      <h3 className="text-xl font-semibold text-text-primary mb-4">Enhanced Document Analytics</h3>
      
      {/* File Upload */}
      <div className="mb-4">
        <label htmlFor="file-upload" className="block text-sm font-medium text-text-secondary mb-2">
          Choose File
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-text-primary
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-accent-blue/20 file:text-accent-blue
            hover:file:bg-accent-blue/30"
        />
        {selectedFile && <p className="mt-2 text-sm text-text-muted">Selected: {selectedFile.name}</p>}
      </div>

      {/* Document Type Selection */}
      <div className="mb-4">
        <label htmlFor="document-type" className="block text-sm font-medium text-text-secondary mb-2">
          Document Type
        </label>
        <select
          id="document-type"
          value={documentType || ''}
          onChange={handleDocumentTypeChange}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm rounded-md
            bg-glass-bg-secondary text-text-primary border border-white/10"
        >
          <option value="" disabled>Select a document type</option>
          {DOCUMENT_TYPES_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Business Context */}
      <div className="mb-6 space-y-4">
        <h4 className="text-lg font-semibold text-text-primary">Business Context (Optional)</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Industry</label>
            <input
              type="text"
              value={businessContext.industry || ''}
              onChange={(e) => handleBusinessContextChange('industry', e.target.value)}
              placeholder="e.g., Technology, Healthcare, Manufacturing"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm rounded-md
                bg-glass-bg-secondary text-text-primary border border-white/10"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Company Size</label>
            <select
              value={businessContext.companySize || ''}
              onChange={(e) => handleBusinessContextChange('companySize', e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm rounded-md
                bg-glass-bg-secondary text-text-primary border border-white/10"
            >
              <option value="">Select company size</option>
              <option value="startup">Startup</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Specific Concerns</label>
          <textarea
            value={businessContext.specificConcerns?.join(', ') || ''}
            onChange={(e) => handleBusinessContextChange('specificConcerns', e.target.value.split(', ').filter(Boolean))}
            placeholder="e.g., Cash flow issues, Growth planning, Cost optimization"
            rows={3}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm rounded-md
              bg-glass-bg-secondary text-text-primary border border-white/10"
          />
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="flex space-x-4">
        <button
          onClick={handleSubmit}
          disabled={!selectedFile || !documentType || isAnalyzing}
          className="flex-1 glass-button glass-gradient px-8 py-3 text-text-primary font-semibold hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner className="mr-2" /> {progressPercentage}% - {analysisProgress}
            </span>
          ) : (
            'Start AI Analysis'
          )}
        </button>
        
        <button
          onClick={handleDemoMode}
          disabled={isAnalyzing}
          className="flex-1 glass-button glass-blue px-8 py-3 text-text-primary font-semibold hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner className="mr-2" /> {progressPercentage}% - Demo
            </span>
          ) : (
            'Try Demo Analysis'
          )}
        </button>
      </div>

      {/* Progress Bar */}
      {isAnalyzing && (
        <div className="mt-6">
          <div className="bg-glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-text-primary">AI Analysis Progress</h4>
              <span className="text-xl font-bold text-accent-blue">{progressPercentage}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-glass-bg-secondary rounded-full h-3 mb-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-accent-blue via-accent-purple to-accent-orange h-3 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Animated shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
            
            {/* Progress Text */}
            <p className="text-text-secondary text-center font-medium">
              {analysisProgress}
            </p>
            
            {/* Progress Steps */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className={`text-center p-2 rounded ${progressPercentage >= 10 ? 'bg-accent-blue/20 text-accent-blue' : 'bg-glass-bg-secondary text-text-muted'}`}>
                Upload
              </div>
              <div className={`text-center p-2 rounded ${progressPercentage >= 50 ? 'bg-accent-blue/20 text-accent-blue' : 'bg-glass-bg-secondary text-text-muted'}`}>
                Analysis
              </div>
              <div className={`text-center p-2 rounded ${progressPercentage >= 100 ? 'bg-accent-blue/20 text-accent-blue' : 'bg-glass-bg-secondary text-text-muted'}`}>
                Complete
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {analysisResults && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-text-primary mb-4">Analysis Results</h3>
          
          {/* Tabs */}
          <div className="flex border-b border-white/10 mb-6">
            {['overview', 'data', 'insights', 'recommendations'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab
                    ? 'text-text-primary border-b-2 border-accent-blue'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'data' && renderDataExtraction()}
          {activeTab === 'insights' && renderInsights()}
          {activeTab === 'recommendations' && renderRecommendations()}
        </div>
      )}
    </div>
  );
}
