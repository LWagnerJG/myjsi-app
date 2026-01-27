import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * JSI-style Segmented Toggle
 * Matches the exact design from JSI website (ui-containerapp-prod-ncus)
 * - Subtle warm cream background (nearly borderless)
 * - White sliding pill indicator with soft shadow
 * - Clean typography with proper weight contrast
 * 
 * @param {string} value - Current selected value
 * @param {function} onChange - Callback when selection changes
 * @param {Array} options - Array of { value, label, icon?: LucideIcon }
 * @param {object} theme - Theme object (optional, uses defaults)
 * @param {string} size - 'sm' | 'md' | 'lg' (default: 'md')
 */
export const SegmentedToggle = ({ value, onChange, options, theme, size = 'md' }) => {
  const containerRef = useRef(null);
  const buttonRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  const sizes = {
    sm: { height: 'h-10', py: 'py-2', text: 'text-[13px]', iconSize: 'w-3.5 h-3.5', gap: 'gap-1.5', padding: 'p-[3px]' },
    md: { height: 'h-11', py: 'py-2.5', text: 'text-sm', iconSize: 'w-4 h-4', gap: 'gap-2', padding: 'p-1' },
    lg: { height: 'h-12', py: 'py-3', text: 'text-base', iconSize: 'w-5 h-5', gap: 'gap-2', padding: 'p-1' }
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
    setIndicator({
      left: buttonRect.left - containerRect.left,
      width: buttonRect.width,
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

  // JSI exact brand colors - warm cream background, charcoal text
  const bgColor = '#EBE8E3'; // Slightly warmer/lighter than stone
  const textSelected = '#353535'; // JSI Charcoal
  const textUnselected = '#9A9590'; // Warm gray for unselected

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex rounded-full ${s.padding} ${s.height}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Sliding white indicator pill */}
      {indicator.ready && (
        <motion.div
          layout
          className="absolute rounded-full bg-white"
          style={{
            left: indicator.left,
            width: indicator.width,
            top: 3,
            bottom: 3,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)',
            zIndex: 0
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
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
            className={`relative z-10 flex-1 flex items-center justify-center ${s.gap} ${s.text} rounded-full transition-colors duration-200`}
            style={{
              color: isSelected ? textSelected : textUnselected,
              fontWeight: isSelected ? 600 : 500
            }}
          >
            {Icon && <Icon className={s.iconSize} style={{ strokeWidth: isSelected ? 2.5 : 2 }} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

// Backward compatible export
export const GroupedToggle = SegmentedToggle;

