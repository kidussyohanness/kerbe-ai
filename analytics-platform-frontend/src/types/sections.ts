// Section component interfaces for type safety and reusability

export interface SectionProps {
  className?: string;
  id?: string;
}

export interface HeroSectionProps extends SectionProps {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaHref: string;
}

export interface HowItWorksStep {
  title: string;
  description: string;
  animationDelay?: string;
}

export interface HowItWorksSectionProps extends SectionProps {
  title: string;
  steps: HowItWorksStep[];
}

export interface Feature {
  title: string;
  description: string;
}

export interface FeaturesSectionProps extends SectionProps {
  title: string;
  features: Feature[];
}

export interface CTASectionProps extends SectionProps {
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
}

export interface ContactSectionProps extends SectionProps {
  title: string;
  description: string;
}
