'use client';

import React from 'react';
import Link from 'next/link';
import { CTASectionProps } from '@/types/sections';
import AnimatedSection from '@/components/ui/AnimatedSection';

export default function CTASection({ 
  title, 
  description, 
  ctaText, 
  ctaHref,
  className = ""
}: CTASectionProps) {
  return (
    <div className={`py-20 px-8 relative z-10 ${className}`}>
      <div className="max-w-4xl mx-auto text-center">
        <AnimatedSection animationType="fade-in">
          <div className="glass-container glass-gradient p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              {title}
            </h2>
            <p className="text-xl text-text-secondary mb-8">
              {description}
            </p>
            <Link
              href={ctaHref}
              className="inline-block glass-button glass-gradient px-12 py-6 text-text-primary font-bold text-xl hover-lift focus-ring"
            >
              <span className="flex items-center space-x-3">
                <span>{ctaText}</span>
              </span>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
