import React from 'react';

// Unified Card styling (borderless by default) for consistent tiles across apps
// Variants:
//  - elevated: medium soft shadow, no border
//  - minimal: lighter shadow, no border
//  - interactive: same as elevated + hover/active effects
//  - outlined: subtle border, no shadow (legacy fallback)
export const GlassCard = React.memo(
  React.forwardRef(function GlassCard(
    { children, className = '', theme, variant = 'elevated', interactive = false, style = {}, as: Component = 'div', ...props },
    ref
  ) {
    const isDark = (theme?.colors?.background || '').toLowerCase().startsWith('#0') || (theme?.colors?.background || '').toLowerCase().startsWith('#1');

    const shadowElevatedLight = '0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)';
    const shadowElevatedDark = '0 4px 16px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.4)';
    const shadowMinimalLight = '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
    const shadowMinimalDark = '0 2px 8px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.35)';

    let boxShadow = 'none';
    if (variant === 'elevated' || variant === 'interactive') boxShadow = isDark ? shadowElevatedDark : shadowElevatedLight;
    else if (variant === 'minimal') boxShadow = isDark ? shadowMinimalDark : shadowMinimalLight;

    const borderColor = theme?.colors?.border || 'rgba(0,0,0,0.12)';
    const radius = 24;

    const interactiveClasses = interactive || variant === 'interactive'
      ? 'cursor-pointer transition-transform duration-150 hover:shadow-lg active:scale-[0.985] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/10 dark:focus:ring-white/20'
      : '';

    const outlinedStyles = variant === 'outlined' ? { border: `1px solid ${borderColor}` } : { border: 'none' };

    return (
      <Component
        ref={ref}
        className={`rounded-[${radius}px] bg-clip-padding ${interactiveClasses} ${className}`}
        style={{
          backgroundColor: theme?.colors?.surface || '#fff',
          boxShadow,
          ...outlinedStyles,
          ...style
        }}
        {...props}
      >
        {children}
      </Component>
    );
  })
);
