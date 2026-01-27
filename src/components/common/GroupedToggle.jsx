import React, { useId } from 'react';
import { motion } from 'framer-motion';

/**
 * JSI-style Segmented Toggle
 * EXACT replica of JSI website toggle design:
 * - No container background (transparent)
 * - Each button is a pill with border
 * - Selected = dark border (#353535)
 * - Unselected = light border (#E0DDD8)
 * - Small gap between buttons
 */
export const SegmentedToggle = ({ value, onChange, options, theme, size = 'md' }) => {
  const sizes = {
    sm: { text: 'text-[13px]', px: 'px-5', py: 'py-2', gap: 'gap-1' },
    md: { text: 'text-[15px]', px: 'px-6', py: 'py-2.5', gap: 'gap-1.5' },
    lg: { text: 'text-base', px: 'px-7', py: 'py-3', gap: 'gap-2' }
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`inline-flex ${s.gap}`}>
      {options.map((opt) => {
        const isSelected = opt.value === value;
        const Icon = opt.icon;

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative rounded-full ${s.px} ${s.py} ${s.text} transition-all whitespace-nowrap border-2`}
            style={{ 
              borderColor: isSelected ? '#353535' : '#E0DDD8',
              backgroundColor: 'transparent',
              color: isSelected ? '#1a1a1a' : '#666666',
              fontWeight: isSelected ? 600 : 500
            }}
          >
            <span className={`flex items-center justify-center ${s.gap}`}>
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

