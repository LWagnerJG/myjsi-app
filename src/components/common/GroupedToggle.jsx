import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * JSI-style Segmented Toggle
 * Matches the design from JSI website - pill container with sliding white indicator
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
    sm: { py: 'py-2', text: 'text-xs', iconSize: 'w-3 h-3', gap: 'gap-1.5' },
    md: { py: 'py-2.5', text: 'text-sm', iconSize: 'w-4 h-4', gap: 'gap-2' },
    lg: { py: 'py-3', text: 'text-base', iconSize: 'w-5 h-5', gap: 'gap-2' }
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

  // JSI brand colors
  const bgColor = theme?.colors?.subtle || '#E3E0D8';
  const textPrimary = theme?.colors?.textPrimary || '#353535';
  const textMuted = theme?.colors?.textSecondary || '#666666';

  return (
    <div
      ref={containerRef}
      className="relative w-full flex rounded-full p-1"
      style={{ backgroundColor: bgColor }}
    >
      {/* Sliding indicator */}
      {indicator.ready && (
        <motion.div
          layout
          className="absolute inset-y-1 rounded-full bg-white"
          style={{
            left: indicator.left,
            width: indicator.width,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
            zIndex: 0
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
            className={`relative z-10 flex-1 flex items-center justify-center ${s.gap} ${s.py} px-4 ${s.text} font-semibold rounded-full transition-colors duration-200`}
            style={{
              color: isSelected ? textPrimary : textMuted
            }}
          >
            {Icon && <Icon className={s.iconSize} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

// Backward compatible export
export const GroupedToggle = SegmentedToggle;
