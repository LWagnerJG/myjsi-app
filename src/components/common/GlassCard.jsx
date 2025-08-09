import React from 'react';

export const GlassCard = React.memo(
    React.forwardRef(({ children, className = '', theme, ...props }, ref) => (
        <div
            ref={ref}
            className={`rounded-[24px] border shadow-lg transition-all duration-300 ${className}`}
            style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                boxShadow: `0 8px 24px ${theme.colors.shadow}`,
                backdropFilter: theme.backdropFilter,
                WebkitBackdropFilter: theme.backdropFilter
            }}
            {...props}
        >
            {children}
        </div>
    ))
);
