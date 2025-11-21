'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as LucideIcons from 'lucide-react';

type DocumentType = {
  name: string;
  icon: string;
  description: string;
  features: string[];
};

type DocumentSliderProps = {
  documentTypes: DocumentType[];
  className?: string;
  autoSlide?: boolean;
  slideInterval?: number;
};

export default function DocumentSlider({
  documentTypes,
  className = '',
  autoSlide = true,
  slideInterval = 5000,
}: DocumentSliderProps) {
  const [active, setActive] = useState(0);
  const [reveal, setReveal] = useState(0.42);
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // auto-advance
  useEffect(() => {
    if (!autoSlide || dragging || documentTypes.length <= 1) return;
    const id = setInterval(
      () => setActive((p) => (p + 1) % documentTypes.length),
      slideInterval
    );
    return () => clearInterval(id);
  }, [autoSlide, dragging, documentTypes.length, slideInterval]);

  // drag
  const onPointerDown = () => setDragging(true);
  const onPointerUp = () => setDragging(false);
  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setReveal(Math.min(1, Math.max(0, x / rect.width)));
  };

  const docType = documentTypes[active];
  const IconComponent = docType?.icon && (LucideIcons as any)[docType.icon] 
    ? (LucideIcons as any)[docType.icon] 
    : null;

  return (
    <div className={`w-full ${className}`}>
      {/* dots */}
      <div className="flex justify-center gap-2 mb-6">
        {documentTypes.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setActive(i);
              setReveal(0.42);
            }}
            className={`h-2 rounded-full transition-all ${
              i === active ? 'w-6 bg-accent-blue' : 'w-2 bg-white/25 hover:bg-white/40'
            }`}
            aria-label={`Go to ${documentTypes[i].name}`}
          />
        ))}
      </div>

      {/* window */}
      <div
        ref={ref}
        role="region"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerMove={onPointerMove}
        className="
          relative overflow-hidden rounded-2xl
          border border-white/10 backdrop-blur
          bg-white/5 shadow-[0_0_40px_rgba(34,211,238,0.15)]
          ring-1 ring-cyan-300/20
        "
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      >
        <div className="flex items-center gap-2 px-4 py-3 bg-black/30 border-b border-white/10">
          <div className="flex gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500/80" />
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-400/80" />
            <span className="inline-block w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="ml-3 text-xs text-white/60 truncate">
            {docType ? `${docType.name}` : ''}
          </div>
        </div>

        <div className="relative h-[420px] md:h-[480px]">
          {/* right (KPIs) full */}
          <Panel side="right" docType={docType} accent="to-teal-300" IconComponent={null} />
          {/* left (Document) clipped */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ clipPath: `inset(0 ${Math.max(0, 1 - reveal) * 100}% 0 0)` }}
          >
            <Panel side="left" docType={docType} accent="to-fuchsia-400" IconComponent={IconComponent} />
          </div>

          {/* handle */}
          <div
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(reveal * 100)}
            tabIndex={0}
            className="absolute top-0 bottom-0"
            style={{ left: `${reveal * 100}%`, transform: 'translateX(-50%)' }}
          >
            <div className="pointer-events-auto h-full w-1.5 md:w-2 bg-accent-blue/70 shadow-[0_0_20px_rgba(34,211,238,0.7)] rounded-full" />
            <div className="pointer-events-auto absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] md:text-xs font-medium bg-black/60 border border-white/10 rounded-full text-white/80">
              drag
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({
  side,
  docType,
  accent,
  IconComponent,
}: {
  side: 'left' | 'right';
  docType: DocumentType | undefined;
  accent: string;
  IconComponent?: React.ComponentType<any>;
}) {
  if (!docType) return null;

  return (
    <div
      className={`absolute inset-0 p-5 md:p-8 flex flex-col ${
        side === 'left' ? 'items-start' : 'items-end'
      }`}
    >
      <div
        className={`w-full h-full rounded-xl border border-white/10 bg-black/40 overflow-hidden animate-fade-in ${
          side === 'left' ? 'animate-slide-up' : 'animate-slide-down'
        }`}
        style={{ animationDelay: '0.1s' }}
      >
        <div className="px-4 py-2 text-[11px] tracking-wide uppercase text-white/60 border-b border-white/10 bg-white/5">
          {side === 'left' ? 'Your Document' : 'KPIs & Insights'}
        </div>
        <div className="p-4 md:p-6 flex flex-col gap-3 h-full">
          {side === 'left' ? (
            <>
              <div className="flex items-center gap-4 mb-2">
                {IconComponent && (
                  <div className="text-accent-blue">
                    <IconComponent size={48} strokeWidth={1.5} />
                  </div>
                )}
                <div>
                  <h3 className={`text-lg md:text-xl font-semibold bg-gradient-to-r from-cyan-200 ${accent} bg-clip-text text-transparent`}>
                    {docType.name}
                  </h3>
                  <p className="text-xs text-white/60 mt-1">{docType.description}</p>
                </div>
              </div>
              <div className="mt-auto grid grid-cols-2 md:grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 rounded-lg border border-white/10 bg-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] flex items-center justify-center text-[11px] text-white/60"
                  >
                    doc-{i + 1}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className={`text-lg md:text-xl font-semibold bg-gradient-to-r from-cyan-200 ${accent} bg-clip-text text-transparent mb-2`}>
                Insights Unlocked
              </h3>
              <div className="flex-1 grid grid-cols-1 gap-3 overflow-y-auto">
                {docType.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-3 rounded-lg border border-white/10 bg-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]"
                  >
                    <span className="text-accent-blue mt-0.5">✓</span>
                    <span className="text-sm text-white/80">{feature}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

