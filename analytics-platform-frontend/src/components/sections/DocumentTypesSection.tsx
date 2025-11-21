'use client';

import React from 'react';
import GradientText from '@/components/ui/GradientText';
import AnimatedSection from '@/components/ui/AnimatedSection';
import FloatingElements from '@/components/ui/FloatingElements';
import DocumentCarousel from '@/components/ui/DocumentCarousel';

interface DocumentType {
  name: string;
  icon: string;
  description: string;
  features: string[];
}

interface DocumentTypesSectionProps {
  title: string;
  subtitle: string;
  documentTypes: DocumentType[];
  className?: string;
  id?: string;
}

export default function DocumentTypesSection({ 
  title, 
  subtitle,
  documentTypes,
  className = "",
  id = "document-types"
}: DocumentTypesSectionProps) {
  return (
    <section id={id} className={`py-20 px-8 relative z-10 ${className}`}>
      <FloatingElements count={10} />
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <AnimatedSection animationType="fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              {title}
            </h2>
          </AnimatedSection>
          <AnimatedSection animationType="slide-up">
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              <GradientText>{subtitle}</GradientText>
            </p>
          </AnimatedSection>
        </div>

        <AnimatedSection animationType="slide-up" animationDelay="0.2s">
          <DocumentCarousel
            documentTypes={documentTypes}
            autoRotate
            rotationSpeed={4000}
          />
        </AnimatedSection>
      </div>
    </section>
  );
}

