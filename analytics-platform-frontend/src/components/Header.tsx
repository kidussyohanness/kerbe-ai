"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Upload, Search } from "lucide-react";
import LiquidGlassLogo from "./LiquidGlassLogo";
import SearchModal from "./SearchModal";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-glass-bg-secondary shadow-xl border-r border-white/10">
            <div className="flex h-16 items-center justify-between px-4">
              <h2 className="text-lg font-semibold text-text-primary">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="px-4 py-6 space-y-1">
              <a href="/dashboard" className="group flex items-center px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-md transition-all duration-200">
                <span className="group-hover:translate-x-1 transition-transform duration-200">Overview</span>
                <svg className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <a href="/dashboard/chat" className="group flex items-center px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-md transition-all duration-200">
                <span className="group-hover:translate-x-1 transition-transform duration-200">KAI</span>
                <svg className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <a href="/dashboard/documents" className="group flex items-center px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-md transition-all duration-200">
                <span className="group-hover:translate-x-1 transition-transform duration-200">My Documents</span>
                <svg className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </nav>
          </div>
        </div>
      )}

            <div className="fixed top-0 left-0 right-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/10 bg-glass-bg-secondary/80 backdrop-blur-xl px-4 sm:gap-x-6 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          type="button"
          className="-m-2.5 p-2.5 text-text-secondary hover:text-text-primary lg:hidden transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="sr-only">Open sidebar</span>
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center">
          <Link 
            href="/dashboard" 
            className="flex items-center px-3 py-2 rounded-md overflow-hidden"
            style={{ 
              maxWidth: 'fit-content',
              maxHeight: '48px' // Constrain to navbar height
            }}
          >
            <LiquidGlassLogo size="sm" />
          </Link>
        </div>

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          {/* Quick Actions - Most valuable for users */}
          <div className="flex flex-1 items-center justify-end gap-x-2 lg:gap-x-3">
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setShowSearch(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
              title="Search documents and data (⌘K)"
            >
              <Search className="w-4 h-4" />
              <span className="hidden xl:inline">Search</span>
              <kbd className="hidden xl:inline ml-2 px-1.5 py-0.5 text-xs bg-white/5 rounded border border-white/10">
                ⌘K
              </kbd>
            </button>

            {/* Quick Upload Button */}
            <Link
              href="/dashboard/documents"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 hover:from-accent-blue/30 hover:to-accent-purple/30 text-accent-blue border border-accent-blue/20 hover:border-accent-blue/30 transition-all shadow-sm hover:shadow-md"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden lg:inline">Upload</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
}