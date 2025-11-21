'use client';

import React from 'react';
import { HowItWorksSectionProps } from '@/types/sections';
import GradientText from '@/components/ui/GradientText';
import AnimatedSection from '@/components/ui/AnimatedSection';
import FloatingElements from '@/components/ui/FloatingElements';
import HowItWorksSlider from '@/components/ui/HowItWorksSlider';

export default function HowItWorksSection({ 
  title,
  steps,
  className = "",
  id = "how-it-works"
}: HowItWorksSectionProps) {
  return (
    <section id={id} className={`py-20 px-8 relative z-10 ${className}`}>
      <FloatingElements count={8} />
      <div className="max-w-6xl mx-auto relative">
        <AnimatedSection animationType="fade-in">
          <h2 className="text-5xl md:text-7xl font-bold text-center mb-6">
            <GradientText>{title || 'How It Works'}</GradientText>
          </h2>
        </AnimatedSection>

        <AnimatedSection animationType="slide-up" animationDelay="0.2s">
          <HowItWorksSlider className="mb-16" />
        </AnimatedSection>
      </div>
    </section>
  );
}
