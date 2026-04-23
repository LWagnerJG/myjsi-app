import React, { useRef, useState, useCallback, useLayoutEffect, useEffect } from 'react';
import { motion } from 'framer-motion';
import { isDarkTheme } from '../../design-system/tokens.js';

/**
 * JSI-style Segmented Toggle
 * Uses a single measured pill that animates via spring physics.
 * No layoutId — avoids text-flash issues on mobile browsers.
 */
export const SegmentedToggle = ({ 
  value, 
  onChange, 
  options, 
  size = 'md',
  fullWidth = false,
  theme,
  className = ''
}) => {
  const dark = theme ? isDarkTheme(theme) : false;
  const containerRef = useRef(null);
  const [pillLayout, setPillLayout] = useState(null);
  const isFirstRender = useRef(true);
  
  const sizes = {
    smDense: {
      text: 'text-[0.8125rem]',
      px: 'px-2.5',
      py: 'py-1.5',
      gap: 'gap-1',
      iconSize: 'w-3.5 h-3.5',
      badgeSize: 'w-4 h-4 text-[0.6875rem]'
    },
    sm: { 
      text: 'text-[0.8125rem]', 
      px: 'px-3', 
      py: 'py-1.5', 
      gap: 'gap-1.5',
      iconSize: 'w-3.5 h-3.5',
      badgeSize: 'w-4 h-4 text-[0.6875rem]'
    },
    md: { 
      text: 'text-[0.9375rem]', 
      px: 'px-5', 
      py: 'py-2', 
      gap: 'gap-2',
      iconSize: 'w-4 h-4',
      badgeSize: 'w-5 h-5 text-xs'
    },
    lg: { 
      text: 'text-base', 
      px: 'px-6', 
      py: 'py-2.5', 
      gap: 'gap-2',
      iconSize: 'w-5 h-5',
      badgeSize: 'w-5 h-5 text-xs'
    }
  };
  
  const s = sizes[size] || sizes.md;
  const containerBg = theme?.colors?.subtle || '#E3E0D8';
  const selectedText = theme?.colors?.textPrimary || '#1a1a1a';
  const unselectedText = dark ? 'rgba(240,240,240,0.78)' : '#6A6762';
  const badgeBg = theme?.colors?.error || '#B85C5C';
  const selectedPillStyle = dark
    ? { backgroundColor: 'rgba(255,255,255,0.14)' }
    : {
        backgroundColor: '#FFFFFF',
        border: '1px solid rgba(255,255,255,0.96)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      };

  // Measure the active button and position the pill
  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeIndex = options.findIndex(o => o.value === value);
    const btn = container.querySelectorAll('[data-toggle-btn]')[activeIndex];
    if (btn) {
      setPillLayout({ left: btn.offsetLeft, width: btn.offsetWidth });
    }
  }, [value, options]);

  useLayoutEffect(() => {
    measure();
    // After first render, allow spring animations
    requestAnimationFrame(() => { isFirstRender.current = false; });
  }, [measure]);

  // Re-measure on resize
  useEffect(() => {
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div 
      ref={containerRef}
      className={`${fullWidth ? 'flex w-full' : 'inline-flex'} rounded-full p-[3px] relative ${className}`} 
      style={{ backgroundColor: containerBg }}
    >
      {/* Single animated pill — extends 3px beyond button to cover container padding */}
      {pillLayout && (
        <motion.div
          className="absolute top-0 bottom-0 rounded-full pointer-events-none"
          style={selectedPillStyle}
          initial={false}
          animate={{ left: pillLayout.left - 3, width: pillLayout.width + 6 }}
          transition={isFirstRender.current
            ? { duration: 0 }
            : { type: 'spring', stiffness: 400, damping: 30 }
          }
        />
      )}
      {options.map((opt) => {
        const isSelected = opt.value === value;
        const Icon = opt.icon;
        const badge = opt.badge;

        return (
          <button
            key={opt.value}
            type="button"
            data-toggle-btn
            onClick={() => onChange(opt.value)}
            className={`relative rounded-full ${s.px} ${s.py} ${s.text} transition-colors whitespace-nowrap ${fullWidth ? 'flex-1' : ''}`}
            aria-pressed={isSelected}
            style={{ color: isSelected ? selectedText : unselectedText }}
          >
            <span className={`relative z-10 flex items-center justify-center ${s.gap}`}
              style={{ fontWeight: 600 }}
            >
              {Icon && <Icon className={s.iconSize} />}
              {opt.label}
              {badge != null && badge > 0 && (
                <span 
                  className={`${s.badgeSize} rounded-full flex items-center justify-center font-bold ml-1`}
                  style={{ backgroundColor: badgeBg, color: 'white' }}
                >
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};


