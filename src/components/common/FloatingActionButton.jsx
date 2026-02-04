import React from 'react';
import { motion } from 'framer-motion';
import { DESIGN_TOKENS, JSI_COLORS } from '../../design-system/tokens.js';

/**
 * FloatingActionButton (FAB)
 *
 * Prominent circular button that floats above content for primary actions
 * Features smooth animations and multiple positioning options
 *
 * @param {Component} icon - Lucide icon component
 * @param {string} label - Accessible label text
 * @param {function} onClick - Click handler
 * @param {string} position - Position: 'bottom-right', 'bottom-left', 'bottom-center', 'top-right'
 * @param {object} theme - Theme object for styling
 * @param {string} className - Additional CSS classes
 */
export const FloatingActionButton = ({
  icon: Icon,
  label,
  onClick,
  position = 'bottom-right',
  theme,
  variant = 'solid', // 'solid' | 'frost'
  className = ''
}) => {
  const positionClasses = {
    'bottom-right': 'fixed bottom-20 right-4 lg:bottom-8 lg:right-8',
    'bottom-left': 'fixed bottom-20 left-4 lg:bottom-8 lg:left-8',
    'bottom-center': 'fixed bottom-20 left-1/2 -translate-x-1/2 lg:bottom-8',
    'top-right': 'fixed top-20 right-4 lg:top-8 lg:right-8'
  };

  const solidStyle = {
    backgroundColor: theme?.colors?.accent || JSI_COLORS.charcoal,
    color: JSI_COLORS.white,
    boxShadow: DESIGN_TOKENS.shadows['2xl'],
  };

  const frostStyle = {
    backgroundColor: 'rgba(53, 53, 53, 0.65)',
    color: JSI_COLORS.white,
    boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.08) inset',
    backdropFilter: 'blur(34px) saturate(180%)',
    WebkitBackdropFilter: 'blur(34px) saturate(180%)',
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20
      }}
      onClick={onClick}
      className={`w-14 h-14 rounded-full flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-offset-2 ${positionClasses[position]} ${className}`}
      style={{
        ...(variant === 'frost' ? frostStyle : solidStyle),
        zIndex: DESIGN_TOKENS.zIndex.toast,
        focusRingColor: `${theme?.colors?.accent || JSI_COLORS.charcoal}40`
      }}
      aria-label={label}
    >
      <Icon className="w-6 h-6" strokeWidth={2.5} />
    </motion.button>
  );
};

/**
 * ExtendedFloatingActionButton
 *
 * FAB with text label that appears on hover
 *
 * @param {Component} icon - Lucide icon component
 * @param {string} label - Button label text
 * @param {function} onClick - Click handler
 * @param {string} position - Position: 'bottom-right', 'bottom-left'
 * @param {object} theme - Theme object for styling
 */
export const ExtendedFloatingActionButton = ({
  icon: Icon,
  label,
  onClick,
  position = 'bottom-right',
  theme
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const positionClasses = {
    'bottom-right': 'fixed bottom-20 right-4 lg:bottom-8 lg:right-8',
    'bottom-left': 'fixed bottom-20 left-4 lg:bottom-8 lg:left-8'
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`h-14 rounded-full flex items-center gap-3 shadow-2xl focus:outline-none focus:ring-4 focus:ring-offset-2 overflow-hidden ${positionClasses[position]}`}
      style={{
        backgroundColor: theme?.colors?.accent || JSI_COLORS.charcoal,
        color: JSI_COLORS.white,
        boxShadow: DESIGN_TOKENS.shadows['2xl'],
        zIndex: DESIGN_TOKENS.zIndex.toast,
        paddingLeft: '1rem',
        paddingRight: isHovered ? '1.5rem' : '1rem'
      }}
    >
      <Icon className="w-6 h-6" strokeWidth={2.5} />
      <motion.span
        initial={{ width: 0, opacity: 0 }}
        animate={{
          width: isHovered ? 'auto' : 0,
          opacity: isHovered ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
        className="font-semibold text-sm whitespace-nowrap"
      >
        {label}
      </motion.span>
    </motion.button>
  );
};
