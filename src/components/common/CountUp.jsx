import React, { useEffect, useState } from 'react';
import { animate, useMotionValue } from 'framer-motion';

// Lightweight reusable count up component
// Props: value (number), decimals (int), prefix, suffix, duration (s), ease, format (fn)
export const CountUp = ({
  value = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 0.6,
  ease = 'easeOut',
  format,
  className,
  style
}) => {
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mv = useMotionValue(prefersReduced ? value : 0);
  const [display, setDisplay] = useState(prefersReduced ? value : 0);

  useEffect(() => {
    if (prefersReduced) { setDisplay(value); return; }
    const controls = animate(mv, value, { duration, ease });
    const unsub = mv.on('change', v => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [value, duration, ease, mv, prefersReduced]);

  let shown = display;
  if (decimals >= 0) {
    const factor = Math.pow(10, decimals);
    shown = Math.round(shown * factor) / factor;
  }
  const text = format ? format(shown) : `${prefix}${shown.toFixed(decimals)}${suffix}`;
  return <span className={className} style={style}>{text}</span>;
};
