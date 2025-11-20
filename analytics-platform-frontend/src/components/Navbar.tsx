'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import LiquidGlassLogo from './LiquidGlassLogo';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Features', href: '#features' },
    { name: 'Contact', href: '#contact' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-container glass-blue shadow-glow-blue border-b border-white/10 backdrop-blur-xl bg-glass-bg-secondary/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <LiquidGlassLogo size="md" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-text-secondary hover:text-text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-white/5"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Login Button */}
          <div className="hidden md:block">
            <Link
              href="/signin"
              className="group glass-button glass-blue inline-flex items-center gap-2
                        px-5 py-2 rounded-xl text-text-primary font-semibold
                        hover-lift focus-ring transition-all duration-300"
            >
              <span>Login</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-text-secondary hover:text-text-primary p-2 rounded-md transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 glass-container glass-blue border-t border-white/10 backdrop-blur-xl bg-glass-bg-secondary/80">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-text-secondary hover:text-text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 hover:bg-white/5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4">
                <Link
                  href="/signin"
                  className="glass-button glass-gradient px-6 py-2 text-text-primary font-semibold hover-lift shadow-glow-gradient transition-all duration-300 block text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Login</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
