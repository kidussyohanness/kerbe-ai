'use client';

import React from 'react';
import { HowItWorksSectionProps } from '@/types/sections';
import GradientText from '@/components/ui/GradientText';
import AnimatedSection from '@/components/ui/AnimatedSection';
import FloatingElements from '@/components/ui/FloatingElements';
import TechSlider from '@/components/ui/TechSlider';

export default function HowItWorksSection({ 
  steps,
  className = "",
  id = "how-it-works"
}: HowItWorksSectionProps) {
  return (
    <section id={id} className={`py-20 px-8 relative z-10 ${className}`}>
      <FloatingElements count={8} />
      <div className="max-w-6xl mx-auto relative">
        <AnimatedSection animationType="fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-text-primary mb-16">
            How It Works - <GradientText>Simple as 1, 2, 3</GradientText>
          </h2>
        </AnimatedSection>

        <AnimatedSection animationType="slide-up" animationDelay="0.2s">
          <TechSlider
            steps={steps}
            autoSlide
            slideInterval={4500}
            className="mb-16"
          />
        </AnimatedSection>
      </div>
    </section>
  );
}
