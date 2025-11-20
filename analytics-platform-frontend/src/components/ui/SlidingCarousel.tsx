'use client';

import React, { useState, useEffect } from 'react';
import { HowItWorksStep } from '@/types/sections';
import AnimatedSection from './AnimatedSection';

interface SlidingCarouselProps {
  steps: HowItWorksStep[];
  autoSlide?: boolean;
  slideInterval?: number;
  className?: string;
}

export default function SlidingCarousel({ 
  steps, 
  autoSlide = true, 
  slideInterval = 4000,
  className = ""
}: SlidingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!autoSlide || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % steps.length);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, slideInterval, isHovered, steps.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % steps.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + steps.length) % steps.length);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Carousel Container */}
      <div 
        className="overflow-hidden rounded-xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {steps.map((step, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <div className="glass-card p-8 text-center hover-lift mx-4">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-accent-blue to-accent-orange text-white text-2xl font-bold mb-4 animate-pulse">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-text-primary">{step.title}</h3>
                <p className="text-text-secondary text-lg leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-glass-bg-secondary/80 backdrop-blur-xl rounded-full p-3 hover:bg-glass-bg-secondary transition-all duration-300 shadow-lg hover:shadow-xl"
        aria-label="Previous step"
      >
        <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-glass-bg-secondary/80 backdrop-blur-xl rounded-full p-3 hover:bg-glass-bg-secondary transition-all duration-300 shadow-lg hover:shadow-xl"
        aria-label="Next step"
      >
        <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Progress Dots */}
      <div className="flex justify-center mt-8 space-x-3">
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-gradient-to-r from-accent-blue to-accent-orange scale-125'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to step ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-4 w-full bg-white/10 rounded-full h-1 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-accent-blue to-accent-orange rounded-full transition-all duration-300 ease-out"
          style={{ 
            width: `${((currentIndex + 1) / steps.length) * 100}%`,
            transition: autoSlide && !isHovered ? `width ${slideInterval}ms linear` : 'width 300ms ease-out'
          }}
        />
      </div>
    </div>
  );
}
