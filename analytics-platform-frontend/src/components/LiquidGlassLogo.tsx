'use client';

import React from 'react';
import Image from 'next/image';

interface LiquidGlassLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const LiquidGlassLogo: React.FC<LiquidGlassLogoProps> = ({ 
  size = 'md', 
  className = ''
}) => {
  const sizeClasses = {
    sm: { logo: 'w-8 h-8', text: 'text-xl' },
    md: { logo: 'w-12 h-12', text: 'text-2xl' },
    lg: { logo: 'w-16 h-16', text: 'text-3xl' },
    xl: { logo: 'w-20 h-20', text: 'text-4xl' }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className="relative">
        <div className="relative">
          {/* KERBÉ AI Logo with Blue/Orange Filter */}
          <div className={`${currentSize.logo} relative overflow-hidden rounded-lg`}>
            <Image
              src="/kerbe_ai_svg.png"
              alt="KERBÉ AI Logo"
              width={64}
              height={64}
              className={`w-full h-full object-contain filter brightness-110 contrast-125 saturate-150`}
              style={{
                filter: 'brightness(1.1) contrast(1.25) saturate(1.5) hue-rotate(200deg) sepia(0.3)',
                mixBlendMode: 'multiply'
              }}
            />
            {/* Blue/Orange Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 to-accent-orange/20 rounded-lg mix-blend-overlay"></div>
          </div>
        </div>
      </div>

      {/* Logo Text - Using kerbe_ai_print.png */}
      <div className={`font-bold ${currentSize.text}`}>
        <div className="relative">
            <Image
              src="/kerbe_ai_print.png"
              alt="KERBÉ AI"
              width={200}
              height={60}
              className="h-40 w-auto object-contain filter brightness-110 contrast-125 saturate-150"
            style={{
              filter: 'brightness(1.1) contrast(1.25) saturate(1.5) hue-rotate(200deg) sepia(0.3)',
              mixBlendMode: 'multiply'
            }}
          />
          {/* Blue/Orange Text Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/30 to-accent-orange/30 mix-blend-overlay rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default LiquidGlassLogo;
