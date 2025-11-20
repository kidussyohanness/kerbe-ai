'use client';

import React, { useEffect, useMemo, useState } from 'react';

interface TypingAnimationProps {
  /** Back-compat single string. If `words` is provided, it takes precedence. */
  text?: string;
  /** Rotating phrases. */
  words?: string[];

  /** ms per character while typing */
  speed?: number;
  /** ms per character while erasing */
  eraseSpeed?: number;
  /** initial delay before starting (ms) */
  delay?: number;
  /** pause after typing a word and before erasing / between words (ms) */
  pauseBetween?: number;
  /** loop through words */
  loop?: boolean;

  /** class applied to the visible text span (great for gradient classes) */
  className?: string;
  /** show a blinking cursor */
  cursor?: boolean;

  /** fires once when the *first* full word finishes typing */
  onComplete?: () => void;
}

export default function TypingAnimation({
  text,
  words,
  speed = 100,
  eraseSpeed = 45,
  delay = 0,
  pauseBetween = 800,
  loop = true,
  className = '',
  cursor = true,
  onComplete,
}: TypingAnimationProps) {
  // Normalize input: prefer `words` if provided, else `[text]` if present, else empty.
  const list = useMemo<string[]>(
    () =>
      Array.isArray(words) && words.length
        ? words
        : typeof text === 'string' && text.length
        ? [text]
        : [],
    [words, text]
  );

  const [started, setStarted] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);
  const [display, setDisplay] = useState('');
  const [phase, setPhase] = useState<'idle' | 'typing' | 'pausing' | 'erasing'>('idle');
  const [completedOnce, setCompletedOnce] = useState(false);

  // Kick off after initial delay
  useEffect(() => {
    if (!list.length) return;
    const t = setTimeout(() => {
      setStarted(true);
      setPhase('typing');
    }, delay);
    return () => clearTimeout(t);
  }, [delay, list.length]);

  // Main type/erase loop
  useEffect(() => {
    if (!started || !list.length) return;

    const full = list[wordIdx] ?? '';
    let t: ReturnType<typeof setTimeout> | undefined;

    if (phase === 'typing') {
      if (display.length < full.length) {
        t = setTimeout(() => setDisplay(full.slice(0, display.length + 1)), speed);
      } else {
        // Word fully typed
        if (!completedOnce) {
          setCompletedOnce(true);
          onComplete?.();
        }
        t = setTimeout(() => setPhase('pausing'), pauseBetween);
      }
    } else if (phase === 'pausing') {
      t = setTimeout(() => setPhase(list.length > 1 ? 'erasing' : 'typing'), pauseBetween);
    } else if (phase === 'erasing') {
      if (display.length > 0) {
        t = setTimeout(() => setDisplay(full.slice(0, display.length - 1)), eraseSpeed);
      } else {
        const next = wordIdx + 1;
        if (next < list.length) {
          setWordIdx(next);
          setPhase('typing');
        } else if (loop && list.length > 0) {
          setWordIdx(0);
          setPhase('typing');
        } else {
          setPhase('idle');
        }
      }
    }

    return () => {
      if (t) clearTimeout(t);
    };
  }, [
    started,
    list,
    wordIdx,
    phase,
    display,
    speed,
    eraseSpeed,
    pauseBetween,
    loop,
    onComplete,
    completedOnce,
  ]);

  return (
    <span className={className}>
      {display}
      {cursor && (phase !== 'idle' || !display) && <span aria-hidden="true" className="animate-pulse">|</span>}
    </span>
  );
}
