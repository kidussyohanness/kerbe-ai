"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Search, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  LayoutDashboard,
  X,
  Loader2,
  ArrowRight
} from "lucide-react";

interface SearchResult {
  id: string;
  type: 'document' | 'kpi' | 'chat' | 'page';
  title: string;
  description?: string;
  url: string;
  metadata?: Record<string, any>;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle search modal - handled by parent
      }
      
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        handleSelectResult(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !session?.user) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const userId = (session.user as { id?: string })?.id;
      if (!userId) {
        setResults([]);
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8787';
      const response = await fetch(`${baseUrl}/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'x-user-id': userId,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setResults(data.results || []);
          setSelectedIndex(0);
        } else {
          setResults([]);
        }
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  const handleSelectResult = (result: SearchResult) => {
    if (result.url.includes('?')) {
      // URL already has query params
      router.push(result.url);
    } else {
      router.push(result.url);
    }
    onClose();
    setQuery("");
    setResults([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'kpi':
        return <TrendingUp className="w-4 h-4" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4" />;
      case 'page':
        return <LayoutDashboard className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'document':
        return 'Document';
      case 'kpi':
        return 'KPI';
      case 'chat':
        return 'Chat';
      case 'page':
        return 'Page';
      default:
        return 'Result';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        <div 
          className="w-full max-w-2xl glass-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <Search className="w-5 h-5 text-text-secondary flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents, KPIs, chat history..."
              className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary/50 text-sm"
            />
            {loading && (
              <Loader2 className="w-4 h-4 text-text-secondary animate-spin flex-shrink-0" />
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {query.trim() && results.length === 0 && !loading && (
              <div className="p-8 text-center text-text-secondary text-sm">
                No results found for &quot;{query}&quot;
              </div>
            )}

            {query.trim() && results.length === 0 && loading && (
              <div className="p-8 text-center text-text-secondary text-sm flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching...</span>
              </div>
            )}

            {!query.trim() && (
              <div className="p-8 text-center text-text-secondary text-sm">
                <div className="mb-4">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                </div>
                <p className="mb-2">Search across your documents, KPIs, and chat history</p>
                <p className="text-xs opacity-70">Press <kbd className="px-2 py-1 bg-white/5 rounded text-xs">⌘K</kbd> or <kbd className="px-2 py-1 bg-white/5 rounded text-xs">Ctrl+K</kbd> to open search</p>
              </div>
            )}

            {results.length > 0 && (
              <div ref={resultsRef} className="divide-y divide-white/5">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelectResult(result)}
                    className={`w-full text-left p-4 hover:bg-white/5 transition-colors ${
                      index === selectedIndex ? 'bg-white/5' : ''
                    }`}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                        index === selectedIndex 
                          ? 'bg-gradient-to-br from-accent-blue to-accent-orange text-white'
                          : 'bg-white/5 text-text-secondary'
                      }`}>
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-text-primary truncate">
                            {result.title}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-text-secondary/70">
                            {getTypeLabel(result.type)}
                          </span>
                        </div>
                        {result.description && (
                          <p className="text-xs text-text-secondary/70 line-clamp-2">
                            {result.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className={`w-4 h-4 flex-shrink-0 text-text-secondary/50 transition-opacity ${
                        index === selectedIndex ? 'opacity-100' : 'opacity-0'
                      }`} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-xs text-text-secondary/60">
              <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-xs">↑↓</kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-xs">Enter</kbd>
                  <span>Select</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-xs">Esc</kbd>
                  <span>Close</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

