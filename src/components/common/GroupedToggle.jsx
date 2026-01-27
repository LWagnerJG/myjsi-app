import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * JSI-style Segmented Toggle
 * EXACT match to JSI website (ui-containerapp-prod-ncus/products?tab=categories)
 * 
 * From JSI HTML source:
 * - Container: bg-primary-300 (~#F5F3F0), rounded-lg, p-0, overflow-hidden
 * - Inner: p-[1px]
 * - Buttons: rounded-full, px-5/px-6, py-2, text-[15px], text-black, font-medium
 * - Selected indicator: white bg, rounded-full (9999px), inset-[-5px] extension
 * - Selected text: font-semibold
 */
export const SegmentedToggle = ({ value, onChange, options, theme, size = 'md' }) => {
  const containerRef = useRef(null);
  const buttonRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, height: 0, top: 0, ready: false });

  const sizes = {
    sm: { text: 'text-[13px]', px: 'px-4', py: 'py-1.5', iconSize: 'w-3.5 h-3.5', gap: 'gap-1.5' },
    md: { text: 'text-[15px]', px: 'px-5', py: 'py-2', iconSize: 'w-4 h-4', gap: 'gap-2' },
    lg: { text: 'text-base', px: 'px-6', py: 'py-2.5', iconSize: 'w-5 h-5', gap: 'gap-2' }
  };
  const s = sizes[size] || sizes.md;

  const updateIndicator = useCallback(() => {
    const index = options.findIndex(opt => opt.value === value);
    if (index === -1) {
      setIndicator(prev => ({ ...prev, ready: false }));
      return;
    }
    const button = buttonRefs.current[index];
    const container = containerRef.current;
    if (!button || !container) return;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    
    // JSI uses inset-[-5px] to extend pill beyond button
    const extend = 5;
    setIndicator({
      left: buttonRect.left - containerRect.left - extend,
      width: buttonRect.width + (extend * 2),
      height: buttonRect.height + (extend * 2),
      top: buttonRect.top - containerRect.top - extend,
      ready: true
    });
  }, [value, options]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useEffect(() => {
    const handleResize = () => updateIndicator();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateIndicator]);

  // JSI bg-primary-300: very subtle warm cream, barely visible
  const containerBg = '#F5F3F0';

  return (
    <div
      ref={containerRef}
      className="relative rounded-lg w-full overflow-visible"
      style={{ backgroundColor: containerBg, padding: '1px' }}
    >
      <div className="relative flex" style={{ padding: '1px' }}>
        {/* White pill indicator - extends beyond button (inset-[-5px]) */}
        {indicator.ready && (
          <motion.span
            layout
            className="absolute bg-white"
            style={{
              left: indicator.left,
              top: indicator.top,
              width: indicator.width,
              height: indicator.height,
              borderRadius: 9999,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              zIndex: 10
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}

        {/* Buttons */}
        {options.map((opt, index) => {
          const isSelected = opt.value === value;
          const Icon = opt.icon;

          return (
            <button
              key={opt.value}
              ref={el => buttonRefs.current[index] = el}
              onClick={() => onChange(opt.value)}
              className={`relative rounded-full ${s.px} ${s.py} ${s.text} transition whitespace-nowrap`}
              style={{ 
                color: '#000000',
                fontWeight: isSelected ? 600 : 500,
                zIndex: 20
              }}
            >
              <div className={`relative flex items-center justify-center ${s.gap}`}>
                {Icon && <Icon className={s.iconSize} />}
                <span>{opt.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Backward compatible export
export const GroupedToggle = SegmentedToggle;

