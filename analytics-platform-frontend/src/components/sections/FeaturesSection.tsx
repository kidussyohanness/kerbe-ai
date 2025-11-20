'use client';

import React from 'react';
import { FeaturesSectionProps } from '@/types/sections';
import GradientText from '@/components/ui/GradientText';
import AnimatedSection from '@/components/ui/AnimatedSection';

export default function FeaturesSection({ 
  title, 
  features,
  className = "",
  id = "features"
}: FeaturesSectionProps) {
  return (
    <div id={id} className={`glass-container glass-gradient p-12 text-text-primary animate-fade-in ${className}`}>
      <AnimatedSection animationType="fade-in">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
          Why Choose <GradientText>KERBÉ AI</GradientText>?
        </h2>
      </AnimatedSection>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <AnimatedSection 
            key={index}
            animationType="slide-up" 
            animationDelay={`${index * 0.1}s`}
          >
            <div className="text-center hover-lift">
              <h3 className="text-xl font-bold mb-2 text-text-primary">{feature.title}</h3>
              <p className="text-text-secondary">{feature.description}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  );
}
