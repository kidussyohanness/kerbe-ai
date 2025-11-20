'use client';

import React, { useEffect, useRef, useState } from 'react';

type Step = {
  title: string;
  description: string;
};

type TechSliderProps = {
  steps: Step[];
  className?: string;
  autoSlide?: boolean;
  slideInterval?: number;
};

export default function TechSlider({
  steps,
  className = '',
  autoSlide = true,
  slideInterval = 4500,
}: TechSliderProps) {
  const [active, setActive] = useState(0);
  const [reveal, setReveal] = useState(0.42);
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // auto-advance
  useEffect(() => {
    if (!autoSlide || dragging || steps.length <= 1) return;
    const id = setInterval(
      () => setActive((p) => (p + 1) % steps.length),
      slideInterval
    );
    return () => clearInterval(id);
  }, [autoSlide, dragging, steps.length, slideInterval]);

  // drag
  const onPointerDown = () => setDragging(true);
  const onPointerUp = () => setDragging(false);
  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setReveal(Math.min(1, Math.max(0, x / rect.width)));
  };

  const step = steps[active];

  return (
    <div className={`w-full ${className}`}>
      {/* dots */}
      <div className="flex justify-center gap-2 mb-6">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all ${
              i === active ? 'w-6 bg-cyan-400' : 'w-2 bg-white/25 hover:bg-white/40'
            }`}
            aria-label={`Go to step ${i + 1}`}
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
            {`Step ${active + 1} — ${step?.title ?? ''}`}
          </div>
        </div>

        <div className="relative h-[360px] md:h-[420px]">
          {/* right (output) full */}
          <Panel side="right" step={step} accent="to-teal-300" />
          {/* left (input) clipped */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ clipPath: `inset(0 ${Math.max(0, 1 - reveal) * 100}% 0 0)` }}
          >
            <Panel side="left" step={step} accent="to-fuchsia-400" />
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
            <div className="pointer-events-auto h-full w-1.5 md:w-2 bg-cyan-300/70 shadow-[0_0_20px_rgba(34,211,238,0.7)] rounded-full" />
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
  step,
  accent,
}: {
  side: 'left' | 'right';
  step: Step | undefined;
  accent: string;
}) {
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
          {side === 'left' ? 'Your Input' : 'AI Output'}
        </div>
        <div className="p-4 md:p-6 flex flex-col gap-3 h-full">
          <h3 className={`text-lg md:text-xl font-semibold bg-gradient-to-r from-cyan-200 ${accent} bg-clip-text text-transparent`}>
            {step?.title ?? ''}
          </h3>
          <p className="text-sm md:text-base leading-relaxed text-white/80">
            {step?.description ?? ''}
          </p>
          <div className="mt-auto grid grid-cols-2 md:grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-lg border border-white/10 bg-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] flex items-center justify-center text-[11px] text-white/60"
              >
                {side === 'left' ? 'doc' : 'insight'}-{i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
