import React from 'react';

export const GlassCard = React.memo(
    React.forwardRef(({ children, className = '', theme, ...props }, ref) => (
        <div
            ref={ref}
            className={`rounded-[2.25rem] border shadow-lg transition-all duration-300 ${className}`}
            style={{
                backgroundColor: theme.colors.surface, // This line makes the card's background white
                borderColor: theme.colors.border,
                boxShadow: `0 4px 30px ${theme.colors.shadow}`,
                backdropFilter: theme.backdropFilter,
                WebkitBackdropFilter: theme.backdropFilter,
            }}
            {...props}
        >
            {children}
        </div>
    ))
);
