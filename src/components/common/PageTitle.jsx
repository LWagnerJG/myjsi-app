import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { isDarkTheme } from '../../design-system/tokens.js';

export const PageTitle = React.memo(({ title, theme, onBack, children, showBack = true }) => {
    const dark = isDarkTheme(theme);
    return (
        <div className="px-4 pt-6 pb-4 flex justify-between items-center">
            <div className="flex-1 flex items-center space-x-2">
                {onBack && showBack && (
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 rounded-full transition-colors"
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <ArrowLeft className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    </button>
                )}
                <h1 className="text-[1.625rem] font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>{title}</h1>
            </div>
            {children}
        </div>
    );
});
