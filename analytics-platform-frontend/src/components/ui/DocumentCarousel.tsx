'use client';

import React, { useEffect, useState, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DocumentType } from '@/types/sections';

type DocumentCarouselProps = {
  documentTypes: DocumentType[];
  className?: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
};

export default function DocumentCarousel({
  documentTypes,
  className = '',
  autoRotate = true,
  rotationSpeed = 4000,
}: DocumentCarouselProps) {
  // Find Balance Sheets index to center it initially
  const balanceSheetIndex = documentTypes.findIndex(doc => doc.name === 'Balance Sheets');
  const initialIndex = balanceSheetIndex >= 0 ? balanceSheetIndex : 0;
  const initialRotation = balanceSheetIndex >= 0 ? -(360 / documentTypes.length) * balanceSheetIndex : 0;
  
  const [rotation, setRotation] = useState(initialRotation);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const dragStartX = useRef(0);
  const dragStartRotation = useRef(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoRotate || documentTypes.length <= 1 || isPaused || isDragging) return;
    
    // Continuous rotation - rotate other cards around the active one (counter-clockwise - cards come from left)
    const interval = setInterval(() => {
      setRotation((prevRotation) => {
        // Increment rotation counter-clockwise (positive) so cards come from left
        const anglePerCard = 360 / documentTypes.length;
        const newRotation = prevRotation - (anglePerCard / 30); // Slow rotation (negative = counter-clockwise)
        
        // When rotation completes one full card, move to next active card
        if (Math.abs(newRotation) <= -anglePerCard) {
          const nextIndex = (activeIndex + 1) % documentTypes.length;
          setActiveIndex(nextIndex);
          return 0; // Reset rotation, new card is now centered
        }
        
        return newRotation;
      });
    }, 50); // Smooth continuous rotation

    return () => clearInterval(interval);
  }, [autoRotate, documentTypes.length, isPaused, isDragging, activeIndex]);

  // Drag handlers
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX.current;
      const sensitivity = 0.2; // Slower drag sensitivity
      const anglePerCard = 360 / documentTypes.length;
      const rotationDelta = deltaX * sensitivity; // Reversed: drag right = rotate right (clockwise), drag left = rotate left (counter-clockwise)
      let newRotation = dragStartRotation.current - rotationDelta; // Negative for counter-clockwise
      
      // Snap to next/previous card when rotation exceeds threshold
      if (newRotation < -anglePerCard / 2) {
        const nextIndex = (activeIndex + 1) % documentTypes.length;
        setActiveIndex(nextIndex);
        setRotation(0);
        dragStartRotation.current = 0;
      } else if (newRotation > anglePerCard / 2) {
        const prevIndex = (activeIndex - 1 + documentTypes.length) % documentTypes.length;
        setActiveIndex(prevIndex);
        setRotation(0);
        dragStartRotation.current = 0;
      } else {
        // Continue rotating around current active card
        setRotation(newRotation);
      }
    };

    const handleGlobalMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      // Resume auto-rotation after a delay
      setTimeout(() => setIsPaused(false), 2000);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, documentTypes.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsPaused(true);
    dragStartX.current = e.clientX;
    dragStartRotation.current = rotation;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => setIsPaused(false), 2000);
  };

  // Touch handlers for mobile
  useEffect(() => {
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const deltaX = e.touches[0].clientX - dragStartX.current;
      const sensitivity = 0.2; // Slower touch sensitivity
      const anglePerCard = 360 / documentTypes.length;
      const rotationDelta = deltaX * sensitivity; // Reversed for counter-clockwise
      let newRotation = dragStartRotation.current - rotationDelta;
      
      // Snap to next/previous card when rotation exceeds threshold
      if (newRotation < -anglePerCard / 2) {
        const nextIndex = (activeIndex + 1) % documentTypes.length;
        setActiveIndex(nextIndex);
        setRotation(0);
      } else if (newRotation > anglePerCard / 2) {
        const prevIndex = (activeIndex - 1 + documentTypes.length) % documentTypes.length;
        setActiveIndex(prevIndex);
        setRotation(0);
      } else {
        setRotation(newRotation);
      }
    };

    const handleGlobalTouchEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);
      setTimeout(() => setIsPaused(false), 2000);
    };

    if (isDragging) {
      window.addEventListener('touchmove', handleGlobalTouchMove);
      window.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, documentTypes.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setIsPaused(true);
    dragStartX.current = e.touches[0].clientX;
    dragStartRotation.current = rotation;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTimeout(() => setIsPaused(false), 2000);
  };

  // Button handlers
  const rotateLeft = () => {
    setIsPaused(true);
    const nextIndex = (activeIndex - 1 + documentTypes.length) % documentTypes.length;
    setActiveIndex(nextIndex);
    setRotation(0); // Reset rotation, new card is centered
    setTimeout(() => setIsPaused(false), 2000);
  };

  const rotateRight = () => {
    setIsPaused(true);
    const nextIndex = (activeIndex + 1) % documentTypes.length;
    setActiveIndex(nextIndex);
    setRotation(0); // Reset rotation, new card is centered
    setTimeout(() => setIsPaused(false), 2000);
  };

  const handleCardClick = (index: number) => {
    // Center the clicked card
    setActiveIndex(index);
    setRotation(0); // Reset rotation, clicked card is now centered
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 2000);
  };

  return (
    <div className={`w-full flex flex-col items-center relative ${className}`}>
      {/* 3D Carousel Container - Merry-go-round style */}
      <div 
        ref={carouselRef}
        className="relative w-full h-[500px] md:h-[600px] perspective-1000 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
      >
        {/* Navigation Buttons - Positioned on sides */}
        <button
          onClick={rotateLeft}
          className="absolute left-4 md:left-8 glass-container glass-gradient p-3 rounded-full border border-white/20 hover:border-accent-blue/50 transition-all duration-300 hover:scale-110 z-20"
          aria-label="Rotate left"
        >
          <ChevronLeft size={24} className="text-accent-blue" />
        </button>
        <button
          onClick={rotateRight}
          className="absolute right-4 md:right-8 glass-container glass-gradient p-3 rounded-full border border-white/20 hover:border-accent-blue/50 transition-all duration-300 hover:scale-110 z-20"
          aria-label="Rotate right"
        >
          <ChevronRight size={24} className="text-accent-blue" />
        </button>
        <div
          className="relative w-full h-full preserve-3d"
          style={{
            transform: 'rotateY(0deg)', // Container doesn't rotate - cards rotate individually
            transformStyle: 'preserve-3d',
          }}
        >
          {documentTypes.map((docType, index) => {
            const angle = (360 / documentTypes.length) * index;
            // Increased radius for wider spread - uses more of left/right screen space
            const radius = 380;
            const isActive = index === activeIndex;
            
            // Active card stays centered at front (x=0, z=radius) and doesn't rotate
            // Other cards rotate around it
            let x, z, cardRotation;
            if (isActive) {
              // Active card: centered at front, facing forward, no movement
              x = 0;
              z = radius;
              cardRotation = 0; // Faces forward (toward screen)
            } else {
              // Non-active cards: rotate around the active card
              // Calculate their position relative to active card
              const relativeAngle = angle - (360 / documentTypes.length) * activeIndex;
              const rotatedAngle = relativeAngle + rotation;
              x = Math.sin((rotatedAngle * Math.PI) / 180) * radius;
              z = Math.cos((rotatedAngle * Math.PI) / 180) * radius;
              // Cards face outward from center - rotateY matches their angular position
              // This makes them face radially outward (away from center)
              cardRotation = rotatedAngle;
            }
            
            // Calculate scale based on z position (items further back are much smaller)
            // Active card is full size, back cards are much smaller
            const baseScale = 0.3 + (z + radius) / (radius * 2) * 0.4; // Scale from 0.3 to 0.7 for non-active
            const scale = isActive ? 1.0 : baseScale;
            
            // Calculate opacity - back cards are barely visible
            // Active card is fully opaque, back cards fade significantly
            const baseOpacity = 0.1 + (z + radius) / (radius * 2) * 0.2; // Opacity from 0.1 to 0.3 for non-active
            const opacity = isActive ? 1.0 : baseOpacity;

            const IconComponent = LucideIcons[docType.icon as keyof typeof LucideIcons];

            return (
              <div
                key={index}
                className="absolute cursor-pointer"
                style={{
                  left: '50%',
                  top: '50%',
                  width: '240px',
                  transform: `
                    translateX(${x}px) 
                    translateZ(${z}px) 
                    translate(-50%, -50%)
                    rotateY(${cardRotation}deg)
                    scale(${isActive ? Math.max(scale, 1.0) : scale})
                  `,
                  transformStyle: 'preserve-3d',
                  opacity: opacity,
                  transition: isActive ? 'opacity 0.3s' : 'opacity 0.3s, transform 0.3s',
                  zIndex: isActive ? 100 : Math.max(1, Math.round(z + radius)),
                }}
                onClick={() => handleCardClick(index)}
              >
                <div
                  className={`
                    glass-container glass-gradient p-5 md:p-6 rounded-xl
                    border border-white/20 backdrop-blur-xl
                    shadow-[0_8px_32px_rgba(0,0,0,0.3)]
                    hover:border-accent-blue/50 transition-all duration-300
                    ${isActive ? 'ring-2 ring-accent-blue/50' : ''}
                  `}
                >
                  {/* Icon */}
                  <div className="flex justify-center mb-3">
                    {IconComponent && (
                      <div className={`p-3 rounded-lg bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 transition-transform duration-300`}>
                        <IconComponent size={isActive ? 40 : 32} className="text-accent-blue" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className={`font-bold text-center text-text-primary mb-2 ${isActive ? 'text-lg md:text-xl' : 'text-sm md:text-base'}`}>
                    {docType.name}
                  </h3>

                  {/* Description */}
                  {isActive && (
                    <p className="text-xs md:text-sm text-text-secondary text-center mb-3">
                      {docType.description}
                    </p>
                  )}

                  {/* Features - only show for active card */}
                  {isActive && (
                    <div className="space-y-1.5">
                      {docType.features.slice(0, 3).map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-center gap-2 text-xs text-text-secondary"
                        >
                          <div className="w-1 h-1 rounded-full bg-accent-blue" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {documentTypes.map((_, index) => (
          <button
            key={index}
            onClick={() => handleCardClick(index)}
            className={`
              h-2 rounded-full transition-all duration-300
              ${index === activeIndex ? 'w-8 bg-accent-blue' : 'w-2 bg-white/30 hover:bg-white/50'}
            `}
            aria-label={`Go to ${documentTypes[index].name}`}
          />
        ))}
      </div>
    </div>
  );
}

