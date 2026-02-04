import React, { useId } from 'react';
import { motion } from 'framer-motion';

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
  className = ''
}) => {
  const id = useId();
  
  const sizes = {
    sm: { 
      text: 'text-[13px]', 
      px: 'px-4', 
      py: 'py-1.5', 
      gap: 'gap-1.5',
      iconSize: 'w-3.5 h-3.5',
      badgeSize: 'w-4 h-4 text-[10px]'
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
  const containerBg = '#E3E0D8';

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
              color: isSelected ? '#1a1a1a' : '#6A6762',
              fontWeight: isSelected ? 600 : 500
            }}
            aria-pressed={isSelected}
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
              {Icon && <Icon className={s.iconSize} />}
              {opt.label}
              {badge != null && badge > 0 && (
                <span 
                  className={`${s.badgeSize} bg-red-500 text-white rounded-full flex items-center justify-center font-bold ml-1`}
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

