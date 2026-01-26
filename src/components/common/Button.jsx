import React from 'react';
import { DESIGN_TOKENS, JSI_COLORS, getPrimaryButtonStyles, getSecondaryButtonStyles } from '../../design-system/tokens.js';

// JSI Button Component
// Primary buttons use pill shape (border-radius: 9999px) per JSI style guide
// Variants:
//  - primary: Filled background with accent color (charcoal)
//  - secondary: Outlined with border
//  - ghost: No background, minimal styling
export const Button = React.memo(({
  children,
  className = '',
  theme,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  ...props
}) => {
  // Size configurations
  const sizeStyles = {
    sm: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      height: '36px',
    },
    md: {
      padding: '0.625rem 1.5rem',
      fontSize: '1rem',
      height: '44px',
    },
    lg: {
      padding: '0.75rem 2rem',
      fontSize: '1.125rem',
      height: '52px',
    },
  };

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return getPrimaryButtonStyles(theme);
      case 'secondary':
        return getSecondaryButtonStyles(theme);
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: theme?.colors?.textPrimary || JSI_COLORS.charcoal,
          border: 'none',
          boxShadow: 'none',
        };
      default:
        return getPrimaryButtonStyles(theme);
    }
  };

  return (
    <button
      className={`font-semibold active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{
        ...getVariantStyles(),
        ...sizeStyles[size],
        borderRadius: DESIGN_TOKENS.borderRadius.pill, // Pill shape for all JSI buttons
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontFamily: DESIGN_TOKENS.typography.fontFamily,
        transition: DESIGN_TOKENS.transitions.fast,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
      }}
      {...props}
    >
      {children}
    </button>
  );
});

// Icon Button variant - circular
export const IconButton = React.memo(({
  children,
  className = '',
  theme,
  size = 'md',
  variant = 'primary',
  ...props
}) => {
  const sizeMap = {
    sm: '36px',
    md: '44px',
    lg: '52px',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme?.colors?.accent || JSI_COLORS.charcoal,
          color: JSI_COLORS.white,
        };
      case 'secondary':
        return {
          backgroundColor: theme?.colors?.surface || JSI_COLORS.white,
          color: theme?.colors?.textPrimary || JSI_COLORS.charcoal,
          border: `1.5px solid ${theme?.colors?.border || JSI_COLORS.stone}`,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: theme?.colors?.textPrimary || JSI_COLORS.charcoal,
        };
      default:
        return {
          backgroundColor: theme?.colors?.accent || JSI_COLORS.charcoal,
          color: JSI_COLORS.white,
        };
    }
  };

  return (
    <button
      className={`active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        ...getVariantStyles(),
        width: sizeMap[size],
        height: sizeMap[size],
        borderRadius: DESIGN_TOKENS.borderRadius.full,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        border: variant === 'primary' || variant === 'ghost' ? 'none' : undefined,
        boxShadow: variant === 'primary' ? DESIGN_TOKENS.shadows.button : 'none',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
      }}
      {...props}
    >
      {children}
    </button>
  );
});
