'use client';

import React from 'react';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animationDelay?: string;
  animationType?: 'fade-in' | 'slide-up' | 'scale-in';
}

export default function AnimatedSection({ 
  children, 
  className = "", 
  animationDelay = "0s",
  animationType = "fade-in"
}: AnimatedSectionProps) {
  const animationClass = `animate-${animationType}`;
  const style = animationDelay !== "0s" ? { animationDelay } : undefined;

  return (
    <div className={`${animationClass} ${className}`} style={style}>
      {children}
    </div>
  );
}
