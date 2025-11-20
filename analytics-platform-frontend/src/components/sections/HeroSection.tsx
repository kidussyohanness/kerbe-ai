'use client';

import React from 'react';
import Link from 'next/link';
import GradientText from '@/components/ui/GradientText';
import { HeroSectionProps } from '@/types/sections';
import AnimatedSection from '@/components/ui/AnimatedSection';
import TypingAnimation from '@/components/ui/TypingAnimation';
import FloatingElements from '@/components/ui/FloatingElements';

export default function HeroSection({ 
  subtitle, 
  description, 
  ctaText, 
  ctaHref,
  className = "",
  id = "home"
}: HeroSectionProps) {
  return (
    <section
      id={id}
      className={`flex flex-col items-center justify-center gap-12 p-8 pt-32 relative z-10 ${className}`}
    >
      <FloatingElements count={12} />

      <div className="text-center space-y-8 max-w-5xl animate-fade-in relative z-10">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-text-primary mb-6 animate-slide-up">
          <span className="text-white">Turn Your Business Documents Into</span>
          <br />
          <GradientText className="inline-block">
            <TypingAnimation
              words={[
                "Smart Insights",
                "Actionable Analytics",
                "Automated Summaries",
                "Risk Flags",
                "Anomaly Detection",
                "Trend Forecasts",
                "KPI Dashboards",
                "Compliance Checks",
                "Data Extraction",
                "Cash-Flow Clarity",
              ]}
              speed={80}
              eraseSpeed={40}
              delay={300}
              pauseBetween={800}
              loop
              cursor
              className="inline-block"   // IMPORTANT: no text-* color here
            />
          </GradientText>
        </h1>


        {/* Subtitle */}
        <AnimatedSection animationType="slide-up" animationDelay="0.2s">
          <p className="text-xl md:text-2xl text-text-secondary max-w-4xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </AnimatedSection>

        {/* Description */}
        <AnimatedSection animationType="slide-up" animationDelay="0.4s">
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            <strong className="text-text-primary">{description}</strong>
          </p>
        </AnimatedSection>
      </div>

      {/* Action Button */}
      <AnimatedSection animationType="slide-up" animationDelay="0.6s">
        <div className="flex justify-center mt-8">
          <Link
            href={ctaHref}
            className="group glass-button glass-gradient px-12 py-6 text-text-primary font-bold text-xl hover-lift focus-ring"
          >
            <span className="flex items-center space-x-3">
              <span>{ctaText}</span>
            </span>
          </Link>
        </div>
      </AnimatedSection>
    </section>
  );
}
