/**
 * FloatingPill — shared floating bottom pill for CTAs and info displays.
 *
 * Renders a frosted-glass rounded-full pill, fixed to the viewport bottom,
 * horizontally centred via auto-margins (no transform dependency, so it
 * composes safely with framer-motion animations).
 *
 * For interactive pills pass `onClick`; for display-only pills omit it.
 *
 * Usage:
 *   <FloatingPill theme={theme} onClick={fn} icon={<Plus />} label="New Item" />
 *   <FloatingPill theme={theme} visible={hasItems}><CustomContent /></FloatingPill>
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { floatingBarStyle, isDarkTheme } from '../../design-system/tokens.js';
import { getFloatingPillMotion } from '../../design-system/motion.js';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';

const FloatingPill = ({
  theme,
  onClick,
  visible = true,
  icon,
  label,
  children,
  className = '',
  type = 'button',
  disabled = false,
  zIndex = 20,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const m = getFloatingPillMotion(prefersReducedMotion);
  const isDark = isDarkTheme(theme);

  const Tag = onClick ? motion.button : motion.div;

  return (
    <AnimatePresence>
      {visible && (
        <Tag
          initial={m.initial}
          animate={m.animate}
          exit={m.exit}
          transition={m.transition}
          {...(onClick ? { onClick, type, disabled } : {})}
          className={`
            fixed left-1/2
            w-fit max-w-[calc(100%-2.5rem)]
            flex items-center justify-center gap-3
            px-6 py-3 sm:px-7 sm:py-3.5
            rounded-full
            transition-shadow duration-200
            ${onClick ? 'active:scale-[0.97] cursor-pointer' : ''}
            ${disabled ? 'opacity-40 pointer-events-none' : ''}
            ${className}
          `}
          style={{
            ...floatingBarStyle(theme),
            bottom: 'max(20px, calc(env(safe-area-inset-bottom, 0px) + 12px))',
            zIndex,
            color: isDark ? '#fff' : '#353535',
          }}
        >
          {icon && (
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.07)' }}
            >
              {React.cloneElement(icon, { className: 'w-4 h-4 sm:w-[18px] sm:h-[18px]' })}
            </div>
          )}
          {label && (
            <span className="font-semibold text-sm sm:text-[0.9375rem] whitespace-nowrap">
              {label}
            </span>
          )}
          {children}
        </Tag>
      )}
    </AnimatePresence>
  );
};

export default FloatingPill;
