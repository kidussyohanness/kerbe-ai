'use client';

import React, { useState, useEffect } from 'react';

interface FloatingElementsProps {
  count?: number;
  className?: string;
}

// Simple seeded random number generator for consistent values
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function FloatingElements({ count = 6, className = "" }: FloatingElementsProps) {
  const [elements, setElements] = useState<Array<{
    id: number;
    size: number;
    left: number;
    top: number;
    animationDelay: number;
    animationDuration: number;
  }>>([]);

  useEffect(() => {
    // Generate elements only on client side to avoid hydration mismatch
    const generatedElements = Array.from({ length: count }, (_, i) => ({
      id: i,
      size: seededRandom(i * 1.1) * 20 + 10,
      left: seededRandom(i * 1.2) * 100,
      top: seededRandom(i * 1.3) * 100,
      animationDelay: seededRandom(i * 1.4) * 20,
      animationDuration: seededRandom(i * 1.5) * 20 + 10,
    }));
    setElements(generatedElements);
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute rounded-full bg-gradient-to-r from-accent-blue/20 to-accent-orange/20 animate-float"
          style={{
            width: `${element.size}px`,
            height: `${element.size}px`,
            left: `${element.left}%`,
            top: `${element.top}%`,
            animationDelay: `${element.animationDelay}s`,
            animationDuration: `${element.animationDuration}s`,
          }}
        />
      ))}
    </div>
  );
}
