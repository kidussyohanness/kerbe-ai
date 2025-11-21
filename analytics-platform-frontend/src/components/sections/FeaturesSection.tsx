'use client';

import React from 'react';
import { FeaturesSectionProps } from '@/types/sections';
import GradientText from '@/components/ui/GradientText';
import AnimatedSection from '@/components/ui/AnimatedSection';
import * as LucideIcons from 'lucide-react';

export default function FeaturesSection({ 
  title, 
  features,
  className = "",
  id = "features"
}: FeaturesSectionProps) {
  return (
    <section id={id} className={`py-20 px-8 relative z-10 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <AnimatedSection animationType="fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-text-primary mb-16">
            {title.includes('KERBÉ AI') ? (
              <>
                Why Choose <GradientText>KERBÉ AI</GradientText>?
              </>
            ) : (
              title
            )}
          </h2>
        </AnimatedSection>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon && (LucideIcons as any)[feature.icon] 
              ? (LucideIcons as any)[feature.icon] 
              : null;
            
            return (
              <AnimatedSection 
                key={index}
                animationType="slide-up" 
                animationDelay={`${index * 0.1}s`}
              >
                <div className="glass-container glass-gradient p-6 text-center hover-lift h-full flex flex-col items-center">
                  {IconComponent && (
                    <div className="mb-4 text-accent-blue">
                      <IconComponent size={32} strokeWidth={1.5} />
                    </div>
                  )}
                  <h3 className="text-lg font-bold mb-3 text-text-primary">{feature.title}</h3>
                  <p className="text-text-secondary text-sm flex-grow">{feature.description}</p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
