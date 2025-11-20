'use client';

import React from 'react';
import ContactForm from '@/components/ContactForm';
import { ContactSectionProps } from '@/types/sections';
import GradientText from '@/components/ui/GradientText';
import AnimatedSection from '@/components/ui/AnimatedSection';

export default function ContactSection({ 
  title, 
  description,
  className = "",
  id = "contact"
}: ContactSectionProps) {
  return (
    <section id={id} className={`py-20 px-8 relative z-10 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <AnimatedSection animationType="fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Get In <GradientText>Touch</GradientText>
            </h2>
          </AnimatedSection>
          <AnimatedSection animationType="slide-up">
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              {description}
            </p>
          </AnimatedSection>
        </div>

        <AnimatedSection animationType="slide-up">
          <ContactForm className="animate-slide-up" />
        </AnimatedSection>
      </div>
    </section>
  );
}
