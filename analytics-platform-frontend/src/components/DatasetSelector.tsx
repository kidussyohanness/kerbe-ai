"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";

interface Dataset {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  isActive: boolean;
  dataSources: Array<{
    id: string;
    filename: string;
    fileType: string;
    fileSize: number;
    status: string;
    uploadedAt: string;
  }>;
  _count: {
    products: number;
    customers: number;
    orders: number;
    documents: number;
  };
}

interface DatasetSelectorProps {
  onDatasetChange?: (dataset: Dataset | null) => void;
  className?: string;
}

export default function DatasetSelector({ onDatasetChange, className = "" }: DatasetSelectorProps) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDatasets();
    loadActiveDataset();
  }, []);

  const loadDatasets = async () => {
    try {
      const response = await apiService.getDatasets();
      if (response.success) {
        setDatasets(response.data.datasets || []);
      } else {
        // Provide mock data when backend is not available
        const mockDatasets = [
          {
            id: "mock-1",
            name: "Sample Business Data",
            description: "Demo dataset for testing",
            createdAt: new Date().toISOString(),
            fileCount: 5,
            totalSize: 1024000
          }
        ];
        setDatasets(mockDatasets);
        console.warn("Using mock datasets due to backend error:", response.error);
      }
    } catch (err) {
      // Provide mock data when fetch fails
      const mockDatasets = [
        {
          id: "mock-1",
          name: "Sample Business Data",
          description: "Demo dataset for testing",
          createdAt: new Date().toISOString(),
          fileCount: 5,
          totalSize: 1024000
        }
      ];
      setDatasets(mockDatasets);
      console.warn("Using mock datasets due to fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveDataset = async () => {
    try {
      // For now, we'll use the first dataset as active since we don't have a specific active endpoint
      // This can be enhanced later when the backend supports active dataset tracking
      if (datasets.length > 0) {
        setActiveDataset(datasets[0]);
        onDatasetChange?.(datasets[0]);
      }
    } catch (err) {
      console.error("Error loading active dataset:", err);
    }
  };

  const activateDataset = async (dataset: Dataset) => {
    try {
      // For now, we'll just set the active dataset locally
      // This can be enhanced later when the backend supports dataset activation
      setActiveDataset(dataset);
      onDatasetChange?.(dataset);
      setIsOpen(false);
      // Reload the page to refresh analytics
      window.location.reload();
    } catch (err) {
      setError("Failed to activate dataset");
      console.error("Error activating dataset:", err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading datasets...</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="text-sm font-medium">
          {activeDataset ? activeDataset.name : "Select Dataset"}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {datasets.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">No datasets found</p>
              <p className="text-xs mt-1">Upload some data to create your first dataset</p>
            </div>
          ) : (
            <div className="py-2">
              {datasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                    activeDataset?.id === dataset.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => activateDataset(dataset)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900">{dataset.name}</h3>
                        {activeDataset?.id === dataset.id && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Active
                          </span>
                        )}
                      </div>
                      {dataset.description && (
                        <p className="text-xs text-gray-500 mt-1">{dataset.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{dataset._count.products} products</span>
                        <span>{dataset._count.customers} customers</span>
                        <span>{dataset._count.orders} orders</span>
                        <span>{dataset._count.documents} documents</span>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-400">
                          Created {new Date(dataset.createdAt).toLocaleDateString()}
                        </p>
                        {dataset.dataSources.length > 0 && (
                          <div className="mt-1">
                            <p className="text-xs text-gray-500">Files:</p>
                            <div className="space-y-1">
                              {dataset.dataSources.slice(0, 3).map((source) => (
                                <div key={source.id} className="flex items-center space-x-2 text-xs text-gray-400">
                                  <span>📄</span>
                                  <span>{source.filename}</span>
                                  <span>({formatFileSize(source.fileSize)})</span>
                                </div>
                              ))}
                              {dataset.dataSources.length > 3 && (
                                <p className="text-xs text-gray-400">
                                  +{dataset.dataSources.length - 3} more files
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
