'use client';

import { useState, useRef } from 'react';
import { DocumentType, AnalysisResult, DocumentProcessingStatus } from '@/types/documentAnalysis';
import { apiService } from '@/lib/api';
import { FileText, TrendingUp, DollarSign, Package, Users, ShoppingCart, FileSpreadsheet, Upload, CheckCircle, ArrowRight } from 'lucide-react';

interface DocumentUploaderProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  onError: (error: string) => void;
  onAnalysisStart?: () => void;
  userId?: string;
}

export default function DocumentUploader({ onAnalysisComplete, onError, onAnalysisStart, userId }: DocumentUploaderProps) {
  const [step, setStep] = useState<'type' | 'upload'>(  'type');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [businessContext, setBusinessContext] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<DocumentProcessingStatus | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes = [
    { 
      value: 'balance_sheet', 
      label: 'Balance Sheet', 
      description: 'Assets, Liabilities, and Equity',
      icon: <FileSpreadsheet className="w-6 h-6" />
    },
    { 
      value: 'income_statement', 
      label: 'Income Statement', 
      description: 'Revenue, Expenses, and Profit/Loss',
      icon: <TrendingUp className="w-6 h-6" />
    },
    { 
      value: 'cash_flow', 
      label: 'Cash Flow Statement', 
      description: 'Cash inflows and outflows',
      icon: <DollarSign className="w-6 h-6" />
    },
    { 
      value: 'order_sheets', 
      label: 'Order Sheets', 
      description: 'Sales and purchase orders',
      icon: <ShoppingCart className="w-6 h-6" />
    },
    { 
      value: 'inventory_reports', 
      label: 'Inventory Reports', 
      description: 'Stock levels and inventory tracking',
      icon: <Package className="w-6 h-6" />
    },
    { 
      value: 'customer_reports', 
      label: 'Customer Reports', 
      description: 'Customer data and analytics',
      icon: <Users className="w-6 h-6" />
    },
    { 
      value: 'supplier_reports', 
      label: 'Supplier Reports', 
      description: 'Supplier performance and data',
      icon: <Users className="w-6 h-6" />
    },
    { 
      value: 'financial_reports', 
      label: 'Financial Reports', 
      description: 'General financial reports',
      icon: <FileText className="w-6 h-6" />
    }
  ];

  const supportedFormats = ['PDF', 'DOC', 'DOCX', 'XLSX', 'CSV', 'TXT'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxFileSize) {
      onError(`File size too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`);
      return;
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const supportedExtensions = ['pdf', 'doc', 'docx', 'xlsx', 'csv', 'txt'];
    
    if (!fileExtension || !supportedExtensions.includes(fileExtension)) {
      onError(`Unsupported file type. Supported formats: ${supportedFormats.join(', ')}`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      onError('Please select a file and document type');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setProcessingStatus({
      status: 'uploading',
      progress: 0,
      message: 'Uploading document...'
    });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', documentType);
      if (businessContext) {
        formData.append('businessContext', businessContext);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      setProcessingStatus({
        status: 'processing',
        progress: 50,
        message: 'Processing document...'
      });

      // Trigger analysis start callback
      if (onAnalysisStart) {
        onAnalysisStart();
      }

      console.log('Uploading document:', {
        filename: selectedFile.name,
        documentType,
        userId: userId || 'not provided',
        fileSize: selectedFile.size,
      });

      const response = await apiService.analyzeDocument(selectedFile, documentType, businessContext, userId);

      clearInterval(progressInterval);

      console.log('Upload response:', {
        success: response.success,
        error: response.error,
        hasData: !!response.data,
      });

      if (!response.success) {
        const errorMessage = response.error || response.data?.error || 'Analysis failed';
        console.error('Upload failed:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = response.data;
      
      if (!result || !result.analysisResult) {
        console.error('Invalid response format:', result);
        throw new Error('Invalid response from server');
      }

      console.log('Analysis completed:', {
        confidence: result.analysisResult.confidence,
        saved: result.saved,
        documentId: result.documentId,
      });

      setProcessingStatus({
        status: 'completed',
        progress: 100,
        message: 'Analysis completed successfully',
        analysisResult: result.analysisResult
      });

      // Call the completion callback which should refresh the documents list
      onAnalysisComplete(result.analysisResult);
      
      // Reset form after successful upload
      setTimeout(() => {
        resetUpload();
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      console.error('Error details:', {
        message: errorMessage,
        error: error,
      });
      
      onError(errorMessage);
      setProcessingStatus({
        status: 'error',
        progress: 0,
        message: errorMessage
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setStep('type');
    setSelectedFile(null);
    setDocumentType(null);
    setBusinessContext('');
    setUploadProgress(0);
    setProcessingStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          step === 'type' ? 'bg-accent-blue/20 text-accent-blue' : 'bg-white/5 text-text-secondary'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
            step === 'type' ? 'bg-accent-blue text-white' : documentType ? 'bg-green-500 text-white' : 'bg-white/10 text-text-secondary'
          }`}>
            {documentType ? <CheckCircle className="w-5 h-5" /> : '1'}
          </div>
          <span className="font-medium">Select Type</span>
        </div>
        
        <ArrowRight className="w-5 h-5 text-text-muted" />
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          step === 'upload' ? 'bg-accent-blue/20 text-accent-blue' : 'bg-white/5 text-text-secondary'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
            step === 'upload' ? 'bg-accent-blue text-white' : 'bg-white/10 text-text-secondary'
          }`}>
            2
          </div>
          <span className="font-medium">Upload File</span>
        </div>
      </div>

      {/* Step 1: Document Type Selection */}
      {step === 'type' && (
        <div className="space-y-4 animate-fade-in">
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-text-primary mb-2">
              What type of document are you uploading?
            </h3>
            <p className="text-text-secondary">
              Select the category that best matches your document
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {documentTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  setDocumentType(type.value as DocumentType);
                  setTimeout(() => setStep('upload'), 300);
                }}
                disabled={isUploading}
                className={`glass-card p-4 text-left transition-all hover-lift group ${
                  documentType === type.value
                    ? 'ring-2 ring-accent-blue bg-accent-blue/10'
                    : ''
                } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`p-2 rounded-lg transition-all ${
                    documentType === type.value
                      ? 'bg-accent-blue text-white'
                      : 'bg-white/5 text-accent-blue group-hover:bg-accent-blue/20'
                  }`}>
                    {type.icon}
                  </div>
                  <div className="flex-1 w-full">
                    <div className="font-semibold text-base text-text-primary mb-1">
                      {type.label}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {type.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: File Upload */}
      {step === 'upload' && (
        <div className="space-y-4 animate-fade-in">
          {/* Selected Type Display */}
          <div className="glass-card p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-accent-blue">
                {documentTypes.find(t => t.value === documentType)?.icon}
              </div>
              <div>
                <p className="text-xs text-text-secondary">Document Type</p>
                <p className="font-semibold text-sm text-text-primary">
                  {documentTypes.find(t => t.value === documentType)?.label}
                </p>
              </div>
            </div>
            <button
              onClick={() => setStep('type')}
              disabled={isUploading}
              className="text-accent-blue hover:text-accent-blue/80 text-xs font-medium transition-colors disabled:opacity-50"
            >
              Change
            </button>
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block text-base font-semibold text-text-primary mb-2">
              Choose your file
            </label>
            <div 
              className={`glass-card border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                selectedFile 
                  ? 'border-green-500/50 bg-green-500/5' 
                  : 'border-white/20 hover:border-accent-blue/50 hover:bg-accent-blue/5'
              } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover-lift'}`}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xlsx,.csv,.txt"
                className="hidden"
                disabled={isUploading}
              />
              
              {selectedFile ? (
                <div className="animate-fade-in">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <div className="text-base font-semibold text-text-primary mb-1 truncate px-2">
                    {selectedFile.name}
                  </div>
                  <div className="text-sm text-text-secondary">
                    File selected! Click &quot;Analyze Document&quot; below.
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-accent-blue mx-auto mb-2" />
                  <div className="text-base font-semibold text-text-primary mb-1">
                    Drag and drop your file here
                  </div>
                  <div className="text-sm text-text-secondary mb-2">
                    or click to browse
                  </div>
                  <div className="flex items-center justify-center gap-1.5 flex-wrap text-xs text-text-muted">
                    {supportedFormats.map((format, idx) => (
                      <span key={format} className="px-1.5 py-0.5 bg-white/5 rounded">
                        {format}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-2">Max file size: 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Business Context */}
          <div>
            <label className="block text-base font-semibold text-text-primary mb-2">
              Tell us about this document <span className="text-text-muted font-normal text-xs">(Optional)</span>
            </label>
            <textarea
              value={businessContext}
              onChange={(e) => setBusinessContext(e.target.value)}
              placeholder="e.g., 'Q4 2024 Financial Review'"
              className="w-full glass-input px-3 py-2 rounded-lg text-sm text-text-primary placeholder-text-muted focus:ring-2 focus:ring-accent-blue transition-all"
              rows={2}
              disabled={isUploading}
            />
            <p className="text-xs text-text-secondary mt-1">
              This helps our AI provide more accurate analysis.
            </p>
          </div>

          {/* Upload Progress */}
          {processingStatus && (
            <div className="glass-card glass-blue p-3 animate-slide-in">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-text-primary">
                  {processingStatus.message}
                </span>
                <span className="text-xs text-accent-blue font-semibold">
                  {processingStatus.progress}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-accent-blue to-accent-green h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${processingStatus.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1 glass-button glass-gradient px-6 py-3 rounded-lg hover-lift disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base font-semibold"
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  Analyze Document
                </span>
              )}
            </button>
            
            <button
              onClick={resetUpload}
              disabled={isUploading}
              className="glass-button px-5 py-3 rounded-lg hover-lift disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
            >
              Start Over
            </button>
          </div>

          {/* Analysis Results Preview */}
          {processingStatus?.analysisResult && (
            <div className="glass-card glass-green p-3 animate-slide-in">
              <h3 className="text-base font-semibold text-text-primary mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Analysis Complete!
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <span className="text-text-secondary">Confidence</span>
                  <span className="text-text-primary font-semibold">
                    {processingStatus.analysisResult.confidence}%
                  </span>
                </div>
                {processingStatus.analysisResult.extractedData?.companyName && (
                  <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span className="text-text-secondary">Company</span>
                    <span className="text-text-primary font-semibold truncate ml-2">
                      {processingStatus.analysisResult.extractedData.companyName}
                    </span>
                  </div>
                )}
                {processingStatus.analysisResult.extractedData?.period && (
                  <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span className="text-text-secondary">Period</span>
                    <span className="text-text-primary font-semibold">
                      {processingStatus.analysisResult.extractedData.period}
                    </span>
                  </div>
                )}
                {processingStatus.analysisResult.recommendations.length > 0 && (
                  <div className="p-2 bg-white/5 rounded">
                    <strong className="text-text-primary text-xs">Recommendations:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      {processingStatus.analysisResult.recommendations.slice(0, 2).map((rec, index) => (
                        <li key={index} className="text-text-secondary text-xs">{rec}</li>
                      ))}
                      {processingStatus.analysisResult.recommendations.length > 2 && (
                        <li className="text-text-muted text-xs">+{processingStatus.analysisResult.recommendations.length - 2} more...</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
