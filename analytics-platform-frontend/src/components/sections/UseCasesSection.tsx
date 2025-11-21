'use client';

import React from 'react';
import GradientText from '@/components/ui/GradientText';
import AnimatedSection from '@/components/ui/AnimatedSection';
import FloatingElements from '@/components/ui/FloatingElements';
import * as LucideIcons from 'lucide-react';

interface UseCase {
  title: string;
  description: string;
  icon: string;
  benefit: string;
}

interface UseCasesSectionProps {
  title: string;
  subtitle: string;
  useCases: UseCase[];
  className?: string;
  id?: string;
}

export default function UseCasesSection({ 
  title, 
  subtitle,
  useCases,
  className = "",
  id = "use-cases"
}: UseCasesSectionProps) {
  return (
    <section id={id} className={`py-20 px-8 relative z-10 ${className}`}>
      <FloatingElements count={8} />
      <div className="max-w-6xl mx-auto relative">
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
          {useCases.map((useCase, index) => {
            const IconComponent = useCase.icon && (LucideIcons as any)[useCase.icon] 
              ? (LucideIcons as any)[useCase.icon] 
              : null;
            
            return (
              <AnimatedSection 
                key={index}
                animationType="slide-up" 
                animationDelay={`${index * 0.1}s`}
              >
                <div className="glass-container glass-gradient p-8 hover-lift h-full flex flex-col">
                  {IconComponent && (
                    <div className="mb-4 text-accent-blue">
                      <IconComponent size={40} strokeWidth={1.5} />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-text-primary mb-3">
                    {useCase.title}
                  </h3>
                  <p className="text-text-secondary mb-4 flex-grow">
                    {useCase.description}
                  </p>
                  <div className="pt-4 border-t border-glass-border">
                    <span className="text-sm font-semibold text-accent-blue">
                      {useCase.benefit}
                    </span>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}

