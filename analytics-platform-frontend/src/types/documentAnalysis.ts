export type DocumentType = 
  | 'balance_sheet' 
  | 'income_statement' 
  | 'cash_flow' 
  | 'order_sheets' 
  | 'inventory_reports' 
  | 'customer_reports' 
  | 'supplier_reports' 
  | 'financial_reports';

export interface ExtractedData {
  companyName?: string;
  period?: string;
  [key: string]: any;
}

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  invalidFields: string[];
  warnings: string[];
  completeness: number;
}

export interface AnalysisResult {
  success: boolean;
  documentType: DocumentType;
  extractedData: ExtractedData | null;
  validation: ValidationResult | null;
  mathValidation: ValidationResult | null;
  errorDetection: ValidationResult | null;
  confidence: number;
  recommendations: string[];
  error?: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  analysisResult?: AnalysisResult;
  documentId?: string;
  error?: string;
}

export interface DocumentValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

export interface MathValidationError {
  equation: string;
  expected: number;
  actual: number;
  difference: number;
  severity: 'error' | 'warning';
}

export interface DocumentProcessingStatus {
  status: 'uploading' | 'processing' | 'analyzing' | 'validating' | 'completed' | 'error';
  progress: number;
  message: string;
  analysisResult?: AnalysisResult;
}

export interface DocumentTypeInfo {
  type: DocumentType;
  name: string;
  description: string;
  requiredFields: string[];
  supportedFormats: string[];
}
