import React from 'react';

const GlassCard = React.memo(React.forwardRef(({ children, className = '', theme, ...props }, ref) => (
    <div
        ref={ref}
        className={`rounded-[1.75rem] border shadow-lg transition-all duration-300 ${className}`}
        style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            boxShadow: `0 4px 30px ${theme.colors.shadow}, inset 1px 1px 1px ${theme.colors.highlight}, inset -1px -1px 1px ${theme.colors.embossShadow}`,
            backdropFilter: theme.backdropFilter,
            WebkitBackdropFilter: theme.backdropFilter,
        }}
        {...props}
    >
        {children}
    </div>
)));

export default GlassCard;