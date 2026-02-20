import React from 'react';
import { DESIGN_TOKENS, JSI_COLORS, isDarkTheme } from '../../design-system/tokens.js';

// JSI GlassCard Component
// Frosted-glass cards with subtle transparency, backdrop blur, and refined shadows
// Uses DESIGN_TOKENS.frost presets for consistent glassmorphism across the app
// Variants:
//  - elevated: Frosted glass with blur + soft shadow (default)
//  - minimal: Lighter frost, subtler shadow
//  - interactive: hover effects with lift + enhanced frost
//  - outlined: Subtle border + light frost, no shadow
export const GlassCard = React.memo(
  React.forwardRef(function GlassCard(
    {
      children,
      className = '',
      theme,
      variant = 'elevated',
      interactive = false,
      style = {},
      as: Component = 'div',
      ...props
    },
    ref
  ) {
    const isDark = isDarkTheme(theme);
    const radius = DESIGN_TOKENS.borderRadius.xl; // 24px for JSI

    // Opaque backgrounds — clean and simple
    const cardBg = isDark ? '#2A2A2A' : '#FFFFFF';

    // Subtle border for edge definition
    const cardBorder = isDark
      ? '1px solid rgba(255, 255, 255, 0.06)'
      : '1px solid rgba(0, 0, 0, 0.06)';

    const borderColor = theme?.colors?.border || JSI_COLORS.stone;

    const isInteractive = interactive || variant === 'interactive';

    // Interactive classes
    const interactiveClasses = isInteractive
      ? 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.985] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#353535]/10'
      : '';

    const outlinedBorder = variant === 'outlined'
      ? `1.5px solid ${borderColor}`
      : cardBorder;

    // Keyboard support for interactive cards
    const handleKeyDown = isInteractive ? (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        props.onClick?.(e);
      }
    } : undefined;

    return (
      <Component
        ref={ref}
        className={`${interactiveClasses} ${className}`}
        style={{
          backgroundColor: cardBg,
          boxShadow: 'none',
          borderRadius: radius,
          border: outlinedBorder,
          ...style
        }}
        {...(isInteractive && { role: 'button', tabIndex: 0, onKeyDown: handleKeyDown })}
        {...props}
      >
        {children}
      </Component>
    );
  })
);

// Product Card with JSI hover overlay
export const ProductCard = React.memo(
  React.forwardRef(function ProductCard(
    {
      children,
      familyName,
      subCategoryTitle,
      image,
      onLearnClick,
      onProductsClick,
      theme,
      className = '',
      style = {},
      ...props
    },
    ref
  ) {
    const [isActive, setIsActive] = React.useState(false);

    return (
      <div
        ref={ref}
        className={`relative overflow-hidden cursor-pointer group ${className}`}
        style={{
          borderRadius: DESIGN_TOKENS.borderRadius.xl,
          backgroundColor: theme?.colors?.surface || JSI_COLORS.white,
          boxShadow: DESIGN_TOKENS.shadows.card,
          ...style,
        }}
        onMouseEnter={() => setIsActive(true)}
        onMouseLeave={() => setIsActive(false)}
        onFocus={() => setIsActive(true)}
        onBlur={(e) => {
          // Keep overlay visible while focus is within the card
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsActive(false);
          }
        }}
        role="group"
        aria-label={`${familyName || ''} ${subCategoryTitle || ''}`.trim()}
        {...props}
      >
        {/* Image */}
        {image && (
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={image}
              alt={`${familyName || ''} ${subCategoryTitle || ''}`.trim()}
              loading="lazy"
              width="400"
              height="300"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        {/* Content - Family name small, SubCategory bold */}
        <div className="p-4">
          {familyName && (
            <p
              className="text-xs font-medium uppercase tracking-wider mb-1"
              style={{ color: theme?.colors?.textSecondary || JSI_COLORS.charcoal }}
            >
              {familyName}
            </p>
          )}
          {subCategoryTitle && (
            <h3
              className="text-lg font-bold"
              style={{ color: theme?.colors?.textPrimary || JSI_COLORS.charcoal }}
            >
              {subCategoryTitle}
            </h3>
          )}
          {children}
        </div>

        {/* JSI Dark Overlay on Hover/Focus */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-3 transition-all duration-300"
          style={{
            backgroundColor: isActive ? 'rgba(53,53,53,0.85)' : 'rgba(53,53,53,0)',
            opacity: isActive ? 1 : 0,
            pointerEvents: isActive ? 'auto' : 'none',
          }}
        >
          {onLearnClick && (
            <button
              onClick={(e) => { e.stopPropagation(); onLearnClick(); }}
              className="px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: JSI_COLORS.white,
                color: JSI_COLORS.charcoal,
              }}
            >
              Learn
            </button>
          )}
          {onProductsClick && (
            <button
              onClick={(e) => { e.stopPropagation(); onProductsClick(); }}
              className="px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'transparent',
                color: JSI_COLORS.white,
                border: `1.5px solid ${JSI_COLORS.white}`,
              }}
            >
              Products
            </button>
          )}
        </div>
      </div>
    );
  })
);
