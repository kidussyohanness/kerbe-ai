'use client';

import { AnalysisResult, DocumentType } from '@/types/documentAnalysis';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onUseData: () => void;
  onReanalyze: () => void;
}

export default function AnalysisResults({ result, onUseData, onReanalyze }: AnalysisResultsProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSeverityColor = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderValidationSection = (title: string, validation: any) => {
    if (!validation) return null;

    return (
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
        
        <div className="space-y-3">
          {/* Validation Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${validation.isValid ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`font-medium ${validation.isValid ? 'text-green-700' : 'text-red-700'}`}>
              {validation.isValid ? 'Valid' : 'Issues Found'}
            </span>
            <span className="text-sm text-gray-500">
              ({validation.completeness?.toFixed(1)}% complete)
            </span>
          </div>

          {/* Missing Fields */}
          {validation.missingFields && validation.missingFields.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-700 mb-2">Missing Fields:</h4>
              <div className="flex flex-wrap gap-2">
                {validation.missingFields.map((field: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Invalid Fields */}
          {validation.invalidFields && validation.invalidFields.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-700 mb-2">Invalid Fields:</h4>
              <div className="space-y-1">
                {validation.invalidFields.map((field: string, index: number) => (
                  <div key={index} className="text-sm text-red-600">
                    • {field}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {validation.warnings && validation.warnings.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-yellow-700 mb-2">Warnings:</h4>
              <div className="space-y-1">
                {validation.warnings.map((warning: string, index: number) => (
                  <div key={index} className="text-sm text-yellow-600">
                    • {warning}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderExtractedData = (data: any) => {
    if (!data) return null;

    const renderValue = (key: string, value: any, level = 0) => {
      if (value === null || value === undefined) return null;
      
      if (typeof value === 'object' && !Array.isArray(value)) {
        return (
          <div key={key} className={level > 0 ? 'ml-4' : ''}>
            <h4 className="text-sm font-medium text-gray-700 mb-1 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <div className="space-y-1">
              {Object.entries(value).map(([subKey, subValue]) => 
                renderValue(subKey, subValue, level + 1)
              )}
            </div>
          </div>
        );
      }

      return (
        <div key={key} className={`flex justify-between ${level > 0 ? 'ml-4' : ''}`}>
          <span className="text-sm text-gray-600 capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}:
          </span>
          <span className="text-sm font-medium text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : String(value)}
          </span>
        </div>
      );
    };

    return (
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Extracted Data</h3>
        <div className="space-y-3">
          {Object.entries(data).map(([key, value]) => renderValue(key, value))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Document Analysis Results
          </h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
            {result.confidence}% Confidence
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Document Type:</span>
            <span className="ml-2 font-medium capitalize">
              {result.documentType.replace('_', ' ')}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Company:</span>
            <span className="ml-2 font-medium">
              {result.extractedData?.companyName || 'Not detected'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Period:</span>
            <span className="ml-2 font-medium">
              {result.extractedData?.period || 'Not detected'}
            </span>
          </div>
        </div>
      </div>

      {/* Extracted Data */}
      {renderExtractedData(result.extractedData)}

      {/* Validation Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderValidationSection('Data Validation', result.validation)}
        {renderValidationSection('Mathematical Validation', result.mathValidation)}
      </div>

      {/* Error Detection */}
      {result.errorDetection && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Error Detection</h3>
          <div className="space-y-2">
            {result.errorDetection.invalidFields.map((error: string, index: number) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            ))}
            {result.errorDetection.warnings.map((warning: string, index: number) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-yellow-600">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Recommendations</h3>
          <ul className="space-y-2">
            {result.recommendations.map((recommendation: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-blue-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onUseData}
          disabled={!result.success || result.confidence < 50}
          className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Use This Data for Dashboard
        </button>
        
        <button
          onClick={onReanalyze}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Reanalyze Document
        </button>
      </div>

      {/* Low Confidence Warning */}
      {result.confidence < 50 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 text-yellow-600">⚠️</div>
            <div>
              <h4 className="font-medium text-yellow-800">Low Confidence Analysis</h4>
              <p className="text-sm text-yellow-700 mt-1">
                The analysis confidence is below 50%. Please review the extracted data carefully 
                and consider reanalyzing the document or checking the file format.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
