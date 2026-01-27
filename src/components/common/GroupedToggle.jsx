import React, { useId } from 'react';
import { motion } from 'framer-motion';

/**
 * JSI-style Segmented Toggle
 * EXACT replica of JSI website toggle design:
 * - Warm pill container background
 * - White selected pill
 * - Dark text on selected, muted on unselected
 */
export const SegmentedToggle = ({ value, onChange, options, theme, size = 'md' }) => {
  const id = useId();
  const sizes = {
    sm: { text: 'text-[13px]', px: 'px-4', py: 'py-1.5', gap: 'gap-1.5' },
    md: { text: 'text-[15px]', px: 'px-5', py: 'py-2', gap: 'gap-2' },
    lg: { text: 'text-base', px: 'px-6', py: 'py-2.5', gap: 'gap-2' }
  };
  const s = sizes[size] || sizes.md;
  const containerBg = '#E3E0D8';

  return (
    <div className="inline-flex rounded-full p-[3px]" style={{ backgroundColor: containerBg }}>
      {options.map((opt) => {
        const isSelected = opt.value === value;
        const Icon = opt.icon;

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative rounded-full ${s.px} ${s.py} ${s.text} transition-all whitespace-nowrap`}
            style={{
              color: isSelected ? '#1a1a1a' : '#6A6762',
              fontWeight: isSelected ? 600 : 500
            }}
          >
            {isSelected && (
              <motion.span
                layoutId={`toggle-pill-${id}`}
                className="absolute inset-0 bg-white rounded-full"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className={`relative z-10 flex items-center justify-center ${s.gap}`}>
              {Icon && <Icon className="w-4 h-4" />}
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// Backward compatible export
export const GroupedToggle = SegmentedToggle;

