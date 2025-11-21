"use client";

import React, { lazy } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LazySection from "@/components/ui/LazySection";
import SectionErrorBoundary from "@/components/ui/SectionErrorBoundary";
import ParticleSystem from "@/components/ui/ParticleSystem";

// Lazy load sections for better performance
const HeroSection = lazy(() => import("@/components/sections/HeroSection"));
const HowItWorksSection = lazy(() => import("@/components/sections/HowItWorksSection"));
const StatsSection = lazy(() => import("@/components/sections/StatsSection"));
const DocumentTypesSection = lazy(() => import("@/components/sections/DocumentTypesSection"));
const AICapabilitiesSection = lazy(() => import("@/components/sections/AICapabilitiesSection"));
const FeaturesSection = lazy(() => import("@/components/sections/FeaturesSection"));
const UseCasesSection = lazy(() => import("@/components/sections/UseCasesSection"));
const CTASection = lazy(() => import("@/components/sections/CTASection"));
const ContactSection = lazy(() => import("@/components/sections/ContactSection"));

// Import content constants
import { 
  HERO_CONTENT, 
  HOW_IT_WORKS_CONTENT,
  STATS_CONTENT,
  DOCUMENT_TYPES_CONTENT,
  AI_CAPABILITIES_CONTENT,
  FEATURES_CONTENT,
  USE_CASES_CONTENT,
  CTA_CONTENT, 
  CONTACT_CONTENT 
} from "@/constants/content";

export default function Home() {
  return (
    <main className="min-h-screen bg-glass-bg-primary animated-bg">
      {/* Particle System Background */}
      <ParticleSystem particleCount={30} />
      
      {/* Navbar */}
      <Navbar />
      
      {/* Hero Section */}
      <SectionErrorBoundary sectionName="Hero">
        <LazySection>
          <HeroSection {...HERO_CONTENT} />
        </LazySection>
      </SectionErrorBoundary>

      {/* Stats Section */}
      <SectionErrorBoundary sectionName="Stats">
        <LazySection>
          <StatsSection {...STATS_CONTENT} />
        </LazySection>
      </SectionErrorBoundary>

      {/* How It Works Section */}
      <SectionErrorBoundary sectionName="How It Works">
        <LazySection>
          <HowItWorksSection {...HOW_IT_WORKS_CONTENT} />
        </LazySection>
      </SectionErrorBoundary>

      {/* Document Types Section */}
      <SectionErrorBoundary sectionName="Document Types">
        <LazySection>
          <DocumentTypesSection {...DOCUMENT_TYPES_CONTENT} />
        </LazySection>
      </SectionErrorBoundary>

      {/* AI Capabilities Section */}
      <SectionErrorBoundary sectionName="AI Capabilities">
        <LazySection>
          <AICapabilitiesSection {...AI_CAPABILITIES_CONTENT} />
        </LazySection>
      </SectionErrorBoundary>

      {/* Features Section */}
      <SectionErrorBoundary sectionName="Features">
        <LazySection>
          <FeaturesSection {...FEATURES_CONTENT} />
        </LazySection>
      </SectionErrorBoundary>

      {/* Use Cases Section */}
      <SectionErrorBoundary sectionName="Use Cases">
        <LazySection>
          <UseCasesSection {...USE_CASES_CONTENT} />
        </LazySection>
      </SectionErrorBoundary>

      {/* CTA Section */}
      <SectionErrorBoundary sectionName="Call to Action">
        <LazySection>
          <CTASection {...CTA_CONTENT} />
        </LazySection>
      </SectionErrorBoundary>

      {/* Contact Section */}
      <SectionErrorBoundary sectionName="Contact">
        <LazySection>
          <ContactSection {...CONTACT_CONTENT} />
        </LazySection>
      </SectionErrorBoundary>

      {/* Footer */}
      <Footer />
    </main>
  );
}