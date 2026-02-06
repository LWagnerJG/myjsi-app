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
    const shadows = isDark ? DESIGN_TOKENS.shadowsDark : DESIGN_TOKENS.shadows;

    let boxShadow = shadows.none;
    if (variant === 'elevated' || variant === 'interactive') boxShadow = shadows.card;
    else if (variant === 'minimal') boxShadow = shadows.md;

    const borderColor = theme?.colors?.border || JSI_COLORS.stone;
    const radius = DESIGN_TOKENS.borderRadius.xl; // 24px for JSI

    // Frosted glass backgrounds — semi-transparent for depth
    const glassBg = isDark
      ? 'rgba(40, 40, 40, 0.72)'
      : 'rgba(255, 255, 255, 0.72)';

    // Subtle inner glow border for glass edge definition
    const glassBorder = isDark
      ? '1px solid rgba(255, 255, 255, 0.08)'
      : '1px solid rgba(255, 255, 255, 0.6)';

    // Interactive classes with hover shadow lift
    const interactiveClasses = interactive || variant === 'interactive'
      ? 'cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-[0.985] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#353535]/10'
      : '';

    const outlinedBorder = variant === 'outlined'
      ? `1.5px solid ${borderColor}`
      : glassBorder;

    return (
      <Component
        ref={ref}
        className={`bg-clip-padding ${interactiveClasses} ${className}`}
        style={{
          backgroundColor: glassBg,
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
          boxShadow,
          borderRadius: radius,
          border: outlinedBorder,
          ...style
        }}
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
    const [isHovered, setIsHovered] = React.useState(false);

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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Image */}
        {image && (
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={image}
              alt={subCategoryTitle}
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

        {/* JSI Dark Overlay on Hover */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-3 transition-all duration-300"
          style={{
            backgroundColor: isHovered ? 'rgba(53,53,53,0.85)' : 'rgba(53,53,53,0)',
            opacity: isHovered ? 1 : 0,
            pointerEvents: isHovered ? 'auto' : 'none',
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
