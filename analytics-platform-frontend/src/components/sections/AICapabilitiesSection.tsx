'use client';

import React from 'react';
import GradientText from '@/components/ui/GradientText';
import AnimatedSection from '@/components/ui/AnimatedSection';
import * as LucideIcons from 'lucide-react';

interface AICapability {
  title: string;
  description: string;
  icon: string;
}

interface AICapabilitiesSectionProps {
  title: string;
  subtitle: string;
  capabilities: AICapability[];
  className?: string;
  id?: string;
}

export default function AICapabilitiesSection({ 
  title, 
  subtitle,
  capabilities,
  className = "",
  id = "ai-capabilities"
}: AICapabilitiesSectionProps) {
  return (
    <section id={id} className={`py-20 px-8 relative z-10 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <AnimatedSection animationType="fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              {title}
            </h2>
          </AnimatedSection>
          <AnimatedSection animationType="slide-up">
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              {subtitle}
            </p>
          </AnimatedSection>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((capability, index) => {
            const IconComponent = capability.icon && (LucideIcons as any)[capability.icon] 
              ? (LucideIcons as any)[capability.icon] 
              : null;
            
            return (
              <AnimatedSection 
                key={index}
                animationType="slide-up" 
                animationDelay={`${index * 0.1}s`}
              >
                <div className="glass-container glass-gradient p-8 hover-lift h-full">
                  {IconComponent && (
                    <div className="mb-4 text-accent-blue">
                      <IconComponent size={40} strokeWidth={1.5} />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-text-primary mb-3">
                    {capability.title}
                  </h3>
                  <p className="text-text-secondary">
                    {capability.description}
                  </p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}

