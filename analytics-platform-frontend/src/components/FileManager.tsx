"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Upload, 
  FolderPlus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  MoreVertical,
  FileText,
  Image,
  FileSpreadsheet,
  File,
  Download,
  Trash2,
  Edit,
  Eye,
  Share2,
  Tag,
  Folder,
  ChevronRight,
  Home,
  RefreshCw
} from 'lucide-react';

interface Document {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  documentType: string;
  status: string;
  processingProgress: number;
  createdAt: string;
  updatedAt: string;
  description?: string;
  tags: string[];
  folder?: {
    id: string;
    name: string;
    color?: string;
  };
  analysisCount: number;
  version: number;
  accessLevel: string;
}

interface Folder {
  id: string;
  name: string;
  description?: string;
  parentFolderId?: string;
  color?: string;
  icon?: string;
  isShared: boolean;
  documentCount: number;
  subfolderCount: number;
  subfolders: Array<{
    id: string;
    name: string;
    documentCount: number;
    color?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface FileManagerProps {
  onDocumentSelect?: (document: Document) => void;
  onAnalysisRequest?: (document: Document) => void;
}

export default function FileManager({ onDocumentSelect, onAnalysisRequest }: FileManagerProps) {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
  }, [selectedFolder, filterType, sortBy, sortOrder, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        sortBy,
        sortOrder,
        ...(selectedFolder && { folderId: selectedFolder }),
        ...(filterType !== 'all' && { type: filterType }),
        ...(searchQuery && { search: searchQuery })
      });

      const [filesResponse, foldersResponse] = await Promise.all([
        fetch(`/api/files?${params}`),
        fetch('/api/folders')
      ]);

      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        setDocuments(filesData.documents || []);
      }

      if (foldersResponse.ok) {
        const foldersData = await foldersResponse.json();
        setFolders(foldersData.folders || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!session?.user?.id) return;

    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', 'general');
      if (selectedFolder) {
        formData.append('folderId', selectedFolder);
      }

      try {
        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        
        if (result.success) {
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[file.name];
              return newProgress;
            });
          }, 2000);
          
          // Refresh data
          loadData();
          return result;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Upload error:', error);
        setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
      }
    });

    await Promise.all(uploadPromises);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (mimeType.includes('image')) return <Image className="w-5 h-5 text-green-500" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
      return <FileSpreadsheet className="w-5 h-5 text-blue-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const getFolderPath = (folderId?: string) => {
    if (!folderId) return [];
    
    const findFolder = (id: string): Folder | null => {
      return folders.find(f => f.id === id) || null;
    };

    const path = [];
    let currentId = folderId;
    
    while (currentId) {
      const folder = findFolder(currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parentFolderId || '';
      } else {
        break;
      }
    }
    
    return path;
  };

  const currentFolder = selectedFolder ? folders.find(f => f.id === selectedFolder) : null;
  const folderPath = getFolderPath(selectedFolder || undefined);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedFolder(null)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <Home className="w-4 h-4 mr-1" />
            All Files
          </button>
          
          {folderPath.map((folder, index) => (
            <React.Fragment key={folder.id}>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <button
                onClick={() => setSelectedFolder(folder.id)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <Folder className="w-4 h-4 mr-1" />
                {folder.name}
              </button>
            </React.Fragment>
          ))}
          
          {currentFolder && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="flex items-center text-gray-900 font-medium">
                <Folder className="w-4 h-4 mr-1" />
                {currentFolder.name}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
          </button>
          
          <button
            onClick={loadData}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="balance_sheet">Balance Sheets</option>
            <option value="income_statement">Income Statements</option>
            <option value="cash_flow">Cash Flow</option>
            <option value="general">General</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="originalName-asc">Name A-Z</option>
            <option value="originalName-desc">Name Z-A</option>
            <option value="fileSize-desc">Largest First</option>
            <option value="fileSize-asc">Smallest First</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFolderModal(true)}
            className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FolderPlus className="w-4 h-4 mr-1" />
            New Folder
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-1" />
            Upload
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="flex-1 p-4 overflow-auto"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {dragActive && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-50 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <Upload className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <p className="text-lg font-medium text-blue-700">Drop files here to upload</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}>
            {/* Folders */}
            {folders
              .filter(folder => folder.parentFolderId === selectedFolder)
              .map((folder) => (
                <div
                  key={folder.id}
                  className={`p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white' : 'flex items-center space-x-4'
                  }`}
                  onClick={() => setSelectedFolder(folder.id)}
                >
                  {viewMode === 'grid' ? (
                    <div className="text-center">
                      <Folder className={`w-12 h-12 mx-auto mb-2 ${folder.color ? `text-${folder.color}-500` : 'text-blue-500'}`} />
                      <h3 className="font-medium text-gray-900 truncate">{folder.name}</h3>
                      <p className="text-sm text-gray-500">{folder.documentCount} files</p>
                    </div>
                  ) : (
                    <>
                      <Folder className={`w-8 h-8 ${folder.color ? `text-${folder.color}-500` : 'text-blue-500'}`} />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{folder.name}</h3>
                        <p className="text-sm text-gray-500">{folder.documentCount} files</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </>
                  )}
                </div>
              ))}

            {/* Documents */}
            {documents.map((document) => (
              <div
                key={document.id}
                className={`p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white' : 'flex items-center space-x-4'
                }`}
                onClick={() => onDocumentSelect?.(document)}
              >
                {viewMode === 'grid' ? (
                  <div className="text-center">
                    {getFileIcon(document.mimeType)}
                    <h3 className="font-medium text-gray-900 truncate mt-2">{document.originalName}</h3>
                    <p className="text-sm text-gray-500">{formatFileSize(document.fileSize)}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(document.createdAt).toLocaleDateString()}</p>
                  </div>
                ) : (
                  <>
                    {getFileIcon(document.mimeType)}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{document.originalName}</h3>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(document.fileSize)} • {new Date(document.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {document.documentType}
                      </span>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Upload Progress */}
            {Object.entries(uploadProgress).map(([filename, progress]) => (
              <div key={filename} className="p-4 border border-gray-200 rounded-lg bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">{filename}</span>
                  <span className="text-sm text-blue-700">{progress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${progress === -1 ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.abs(progress)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
