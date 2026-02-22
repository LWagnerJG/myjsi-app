import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { isDarkTheme } from '../../design-system/tokens.js';

/**
 * JSI-style Segmented Toggle
 * A beautiful, animated pill-style toggle for switching between options.
 * 
 * Features:
 * - Warm pill container background (#E3E0D8)
 * - Animated white selected pill with spring physics
 * - Icon support with optional badges (for notifications/counts)
 * - Responsive: fullWidth mode stretches to fill container
 * - Three sizes: sm, md, lg
 * 
 * @param {string} value - Current selected value
 * @param {function} onChange - Callback when selection changes
 * @param {Array} options - Array of option objects: { value, label, icon?, badge? }
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth - If true, toggle stretches to fill container width
 * @param {string} className - Additional classes for the container
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
  const id = useId();
  const dark = theme ? isDarkTheme(theme) : false;
  
  const sizes = {
    sm: { 
      text: 'text-[13px]', 
      px: 'px-4', 
      py: 'py-1.5', 
      gap: 'gap-1.5',
      iconSize: 'w-3.5 h-3.5',
      badgeSize: 'w-4 h-4 text-[11px]'
    },
    md: { 
      text: 'text-[15px]', 
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
  const selectedBg = dark ? 'rgba(255,255,255,0.14)' : '#FFFFFF';
  const selectedText = theme?.colors?.textPrimary || '#1a1a1a';
  const unselectedText = dark ? 'rgba(240,240,240,0.78)' : '#6A6762';
  const selectedShadow = dark ? '0 1px 2px rgba(0,0,0,0.45)' : '0 1px 2px rgba(0,0,0,0.08)';

  return (
    <div 
      className={`${fullWidth ? 'flex w-full' : 'inline-flex'} rounded-full p-[3px] ${className}`} 
      style={{ backgroundColor: containerBg }}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        const Icon = opt.icon;
        const badge = opt.badge;

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative rounded-full ${s.px} ${s.py} ${s.text} transition-all whitespace-nowrap ${fullWidth ? 'flex-1' : ''}`}
            style={{
              color: isSelected ? selectedText : unselectedText,
              fontWeight: isSelected ? 600 : 500
            }}
            aria-pressed={isSelected}
          >
            {isSelected && (
              <motion.span
                layoutId={`toggle-pill-${id}`}
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: selectedBg, boxShadow: selectedShadow }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className={`relative z-10 flex items-center justify-center ${s.gap}`}>
              {Icon && <Icon className={s.iconSize} />}
              {opt.label}
              {badge != null && badge > 0 && (
                <span 
                  className={`${s.badgeSize} rounded-full flex items-center justify-center font-bold ml-1`}
                  style={{ backgroundColor: '#B85C5C', color: 'white' }}
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

// Backward compatible export
export const GroupedToggle = SegmentedToggle;

