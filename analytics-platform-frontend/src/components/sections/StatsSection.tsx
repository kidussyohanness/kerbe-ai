'use client';

import React from 'react';
import GradientText from '@/components/ui/GradientText';
import AnimatedSection from '@/components/ui/AnimatedSection';

interface Stat {
  value: string;
  label: string;
  description: string;
}

interface StatsSectionProps {
  title: string;
  stats: Stat[];
  className?: string;
  id?: string;
}

export default function StatsSection({ 
  title, 
  stats,
  className = "",
  id = "stats"
}: StatsSectionProps) {
  return (
    <section id={id} className={`py-16 px-8 relative z-10 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <AnimatedSection animationType="fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary mb-12">
            {title}
          </h2>
        </AnimatedSection>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <AnimatedSection 
              key={index}
              animationType="slide-up" 
              animationDelay={`${index * 0.1}s`}
            >
              <div className="glass-container glass-gradient p-6 text-center hover-lift transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold mb-3">
                  <GradientText>{stat.value}</GradientText>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {stat.label}
                </h3>
                <p className="text-text-secondary text-xs leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

