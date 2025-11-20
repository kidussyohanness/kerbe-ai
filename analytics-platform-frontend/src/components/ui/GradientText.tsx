'use client';

import React from 'react';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export default function GradientText({ children, className = "" }: GradientTextProps) {
  return (
    <span className={`text-gradient bg-gradient-to-r from-accent-blue to-accent-orange bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}
