'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { FileText, Calendar, CheckCircle, Clock, AlertCircle, Download, Trash2, Eye, Upload, Plus, X } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import DocumentUploader from '@/components/DocumentUploader';
import { AnalysisResult } from '@/types/documentAnalysis';

interface UserDocument {
  id: string;
  filename: string;
  originalName: string;
  documentType: string;
  fileSize: number;
  status: string;
  analysisResults: AnalysisResult | null;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<UserDocument | null>(null);
  const [viewingDocument, setViewingDocument] = useState<UserDocument | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get userId from session
      const userId = (session?.user as { id?: string })?.id;
      if (!userId) {
        console.warn('User not authenticated');
        setLoading(false);
        return;
      }
      
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('documentType', filterType);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      const response = await fetch(`http://localhost:8787/user/documents?${params}`, {
        headers: {
          'x-user-id': userId
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Sort documents by createdAt date, newest first
        const sortedDocuments = data.documents.sort((a: UserDocument, b: UserDocument) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setDocuments(sortedDocuments);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  }, [session, filterType, filterStatus]);

  // Fetch user documents
  useEffect(() => {
    if (session?.user?.email) {
      fetchDocuments();
    }
  }, [session, fetchDocuments]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  const getDocumentTypeName = (type: string) => {
    const types: Record<string, string> = {
      'balance_sheet': 'Balance Sheet',
      'income_statement': 'Income Statement',
      'cash_flow': 'Cash Flow Statement',
      'order_sheets': 'Order Sheets',
      'inventory_reports': 'Inventory Report',
      'customer_reports': 'Customer Report',
      'supplier_reports': 'Supplier Report',
      'financial_reports': 'Financial Report',
    };
    return types[type] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUploadComplete = () => {
    setUploadSuccess(true);
    setShowUploadModal(false);
    // Refresh the list immediately and again after a short delay to ensure backend has processed
    fetchDocuments();
    setTimeout(() => {
      fetchDocuments(); // Refresh again to catch any async updates
    }, 2000);
    setTimeout(() => setUploadSuccess(false), 5000);
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
    setTimeout(() => setUploadError(''), 5000);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">My Documents</h1>
          <p className="text-text-secondary">
            All your uploaded documents and their analysis results
          </p>
        </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="glass-button glass-gradient px-6 py-3 rounded-lg hover-lift flex items-center gap-2 font-semibold"
          >
            <Upload className="w-5 h-5" />
            Upload Document
          </button>
        </div>

        {/* Success/Error Messages */}
        {uploadSuccess && (
          <div className="glass-card glass-green p-4 mb-6 flex items-center gap-3 animate-slide-in">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <p className="text-text-primary font-medium">Document uploaded and analyzed successfully!</p>
          </div>
        )}

        {deleteSuccess && (
          <div className="glass-card glass-green p-4 mb-6 flex items-center gap-3 animate-slide-in">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <p className="text-text-primary font-medium">Document deleted successfully!</p>
          </div>
        )}

        {uploadError && (
          <div className="glass-card bg-red-500/10 border-red-500/30 p-4 mb-6 flex items-center gap-3 animate-slide-in">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-text-primary font-medium">{uploadError}</p>
          </div>
        )}

        {/* Filters */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Document Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="glass-input px-4 py-2 rounded-lg"
              >
                <option value="all">All Types</option>
                <option value="balance_sheet">Balance Sheets</option>
                <option value="income_statement">Income Statements</option>
                <option value="cash_flow">Cash Flow Statements</option>
                <option value="order_sheets">Order Sheets</option>
                <option value="inventory_reports">Inventory Reports</option>
                <option value="customer_reports">Customer Reports</option>
                <option value="supplier_reports">Supplier Reports</option>
                <option value="financial_reports">Financial Reports</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="glass-input px-4 py-2 rounded-lg"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchDocuments}
                className="glass-button glass-blue px-6 py-2 rounded-lg hover-lift"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Documents List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Upload className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              No Documents Yet
            </h3>
            <p className="text-text-secondary mb-6">
              Upload your first document to get started with AI-powered analysis
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="glass-button glass-gradient px-8 py-3 rounded-lg hover-lift inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Upload Your First Document
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="glass-card p-6 hover-lift transition-all cursor-pointer"
                onClick={() => setSelectedDocument(doc)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Status Icon */}
                    <div className="mt-1">
                      {getStatusIcon(doc.status)}
                    </div>

                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-text-primary mb-1 truncate">
                        {doc.originalName}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {getDocumentTypeName(doc.documentType)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(doc.createdAt)}
                        </span>
                        <span>{formatFileSize(doc.fileSize)}</span>
                      </div>

                      {/* Analysis Preview */}
                      {doc.analysisResults && (
                        <div className="mt-3 p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-text-primary font-medium">
                              Analysis Confidence:
                            </span>
                            <span className="text-accent-blue font-semibold">
                              {doc.analysisResults.confidence}%
                            </span>
                          </div>
                          {doc.analysisResults.extractedData?.companyName && (
                            <div className="flex items-center gap-2 text-sm mt-1">
                              <span className="text-text-secondary">Company:</span>
                              <span className="text-text-primary">
                                {doc.analysisResults.extractedData.companyName}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingDocument(doc);
                      }}
                      className="glass-button glass-blue p-2 rounded-lg hover-lift"
                      title="View Document"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Document Details Modal */}
        {selectedDocument && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedDocument(null)}
          >
            <div
              className="glass-card max-w-4xl w-full max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Fixed */}
              <div className="p-6 pb-4 border-b border-white/10 flex-shrink-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 mr-4">
                    <h2 className="text-2xl font-bold text-text-primary mb-2 truncate">
                    {selectedDocument.originalName}
                  </h2>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedDocument.status)}
                    <span className="text-text-secondary">
                      {selectedDocument.status.charAt(0).toUpperCase() + selectedDocument.status.slice(1)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDocument(null)}
                    className="text-text-secondary hover:text-text-primary transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                    <X className="w-6 h-6" />
                </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">

              {/* Document Metadata */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/5 rounded-lg">
                <div>
                  <p className="text-sm text-text-secondary">Type</p>
                  <p className="text-text-primary font-medium">
                    {getDocumentTypeName(selectedDocument.documentType)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Size</p>
                  <p className="text-text-primary font-medium">
                    {formatFileSize(selectedDocument.fileSize)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Uploaded</p>
                  <p className="text-text-primary font-medium">
                    {formatDate(selectedDocument.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Last Updated</p>
                  <p className="text-text-primary font-medium">
                    {formatDate(selectedDocument.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Analysis Results */}
              {selectedDocument.analysisResults && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-text-primary">
                    Analysis Results
                  </h3>

                  {/* Confidence Score */}
                  <div className="glass-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-secondary">Confidence Score</span>
                      <span className="text-2xl font-bold text-accent-blue">
                        {selectedDocument.analysisResults.confidence}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-accent-blue to-accent-green h-2 rounded-full"
                        style={{ width: `${selectedDocument.analysisResults.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Extracted Data */}
                  {selectedDocument.analysisResults.extractedData && (
                    <div className="glass-card p-6">
                      <h4 className="text-lg font-semibold text-text-primary mb-4">
                        Extracted Financial Data
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(selectedDocument.analysisResults.extractedData).map(
                          ([key, value]) => (
                            <div key={key} className="p-3 bg-white/5 rounded-lg">
                              <p className="text-sm text-text-secondary capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </p>
                              <p className="text-text-primary font-medium">
                                {typeof value === 'number'
                                  ? value.toLocaleString()
                                  : value?.toString() || 'N/A'}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Validation Results */}
                  {selectedDocument.analysisResults.validation && (
                    <div className="glass-card p-6">
                      <h4 className="text-lg font-semibold text-text-primary mb-4">
                        Validation Results
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-text-secondary">Status</span>
                          <span className={`font-semibold ${
                            selectedDocument.analysisResults.validation.isValid
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}>
                            {selectedDocument.analysisResults.validation.isValid ? 'Valid' : 'Invalid'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-text-secondary">Completeness</span>
                          <span className="text-text-primary font-semibold">
                            {selectedDocument.analysisResults.validation.completeness}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {selectedDocument.analysisResults.recommendations && 
                   selectedDocument.analysisResults.recommendations.length > 0 && (
                    <div className="glass-card p-6">
                      <h4 className="text-lg font-semibold text-text-primary mb-4">
                        Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {selectedDocument.analysisResults.recommendations.map(
                          (rec: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-text-secondary">
                              <span className="text-accent-blue mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              </div>

              {/* Actions - Fixed Footer */}
              <div className="flex-shrink-0 p-6 pt-4 border-t border-white/10">
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      window.open(`http://localhost:8787/documents/${selectedDocument.filename}`, '_blank');
                    }}
                    className="flex-1 glass-button glass-blue py-3 rounded-lg hover-lift flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
                        try {
                          const userId = (session?.user as { id?: string })?.id;
                          if (!userId) {
                            alert('User not authenticated');
                            return;
                          }
                          
                          // Check if backend is running first
                          const healthCheck = await fetch('http://localhost:8787/health');
                          if (!healthCheck.ok) {
                            throw new Error('Backend server is not running. Please start the backend server.');
                          }
                          
                          const response = await fetch(`http://localhost:8787/user/documents/${selectedDocument.id}`, {
                            method: 'DELETE',
                            headers: {
                              'x-user-id': userId
                            }
                          });
                          
                          if (response.ok) {
                            setSelectedDocument(null);
                            fetchDocuments(); // Refresh the list
                            setDeleteSuccess(true);
                            setTimeout(() => setDeleteSuccess(false), 3000);
                          } else {
                            const errorData = await response.json().catch(() => ({}));
                            throw new Error(errorData.error || `Server error: ${response.status}`);
                          }
                        } catch (error) {
                          console.error('Delete error:', error);
                          const errorMessage = error instanceof Error 
                            ? error.message 
                            : 'Failed to delete document. Please try again.';
                          setUploadError(errorMessage);
                          setTimeout(() => setUploadError(''), 5000);
                        }
                      }
                    }}
                    className="flex-1 glass-button bg-red-500/10 hover:bg-red-500/20 py-3 rounded-lg hover-lift flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowUploadModal(false)}
          >
            <div
              className="glass-card max-w-4xl w-full flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Fixed */}
              <div className="flex justify-between items-center p-4 pb-3 border-b border-white/10 flex-shrink-0">
                <h2 className="text-xl font-bold text-text-primary">
                  Upload Document
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-text-secondary hover:text-text-primary transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <DocumentUploader
                  onAnalysisComplete={handleUploadComplete}
                  onError={handleUploadError}
                  onAnalysisStart={() => {}}
                  userId={(session?.user as { id?: string })?.id || ''}
                />
              </div>
            </div>
          </div>
        )}

        {/* Document Viewer Modal */}
        {viewingDocument && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setViewingDocument(null)}
          >
            <div
              className="glass-card p-6 w-full max-w-6xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-white/10">
                <div className="flex-1 min-w-0 mr-4">
                  <h2 className="text-2xl font-bold text-text-primary mb-2 truncate">
                    {viewingDocument.originalName}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-text-secondary flex-wrap">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {getDocumentTypeName(viewingDocument.documentType)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(viewingDocument.createdAt)}
                    </span>
                    <span>{formatFileSize(viewingDocument.fileSize)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setViewingDocument(null)}
                  className="text-text-secondary hover:text-text-primary transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Document Content */}
              <div className="flex-1 overflow-hidden bg-white/5 rounded-lg">
                <iframe
                  src={`http://localhost:8787/documents/${viewingDocument.filename}`}
                  className="w-full h-full min-h-[600px]"
                  title={viewingDocument.originalName}
                  onError={() => {
                    console.error('Failed to load document');
                  }}
                />
                
                {/* Fallback for unsupported file types */}
                <div className="hidden" id="fallback-message">
                  <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                    <FileText className="w-16 h-16 text-text-muted mb-4" />
                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                      Preview Not Available
                    </h3>
                    <p className="text-text-secondary mb-6">
                      This file type cannot be previewed in the browser.
                    </p>
                    <button
                      onClick={() => {
                        window.open(`http://localhost:8787/documents/${viewingDocument.filename}`, '_blank');
                      }}
                      className="glass-button glass-blue px-6 py-3 rounded-lg hover-lift flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download Document
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-4 mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    window.open(`http://localhost:8787/documents/${viewingDocument.filename}`, '_blank');
                  }}
                  className="flex-1 glass-button glass-blue py-3 rounded-lg hover-lift flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
                <button
                  onClick={() => {
                    setViewingDocument(null);
                    setSelectedDocument(viewingDocument);
                  }}
                  className="flex-1 glass-button py-3 rounded-lg hover-lift flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  View Analysis
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

