// Enhanced Document Analysis Types

export interface BusinessContext {
  industry?: string;
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  businessModel?: string;
  specificConcerns?: string[];
  analysisFocus?: string[];
}

export interface DynamicQuestion {
  id: string;
  question: string;
  field: string;
  category: 'basic' | 'financial' | 'operational' | 'strategic';
  priority: 'high' | 'medium' | 'low';
  validation?: {
    type: 'number' | 'text' | 'date' | 'percentage';
    min?: number;
    max?: number;
    format?: string;
  };
}

export interface DocumentStructure {
  sections: string[];
  tables: number;
  charts: number;
  confidence: number;
}

export interface BusinessInsights {
  industryBenchmark?: {
    industry: string;
    percentile: number;
    keyMetrics: Record<string, string>;
  };
  peerComparison?: {
    companySize: string;
    performance: string;
    strengths: string[];
    weaknesses: string[];
  };
  trendAnalysis?: {
    growthRate: number;
    volatility: string;
    seasonality: string;
    forecast: string;
  };
}

export interface Recommendations {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
}

export interface EnhancedAnalysisResult {
  success: boolean;
  documentType: string;
  extractedData: any;
  validation: any;
  mathValidation: any;
  errorDetection: any;
  confidence: number;
  recommendations: string[];
  error?: string;
  
  // Enhanced fields
  documentStructure: DocumentStructure;
  dynamicQuestions: DynamicQuestion[];
  businessInsights: BusinessInsights;
  recommendations: Recommendations;
}
