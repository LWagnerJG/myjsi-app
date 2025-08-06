import React from 'react';

export const Button = React.memo(({ children, className = '', theme, ...props }) => (
    <button
        className={`px-4 py-2 rounded-lg font-semibold active:scale-95 transition-transform duration-150 ${className}`}
        style={
            theme
                ? { backgroundColor: theme.colors.accent, color: '#fff' }
                : undefined
        }
        {...props}
    >
        {children}
    </button>
));
