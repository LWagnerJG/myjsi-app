import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { isDarkTheme } from '../../design-system/tokens.js';

export const PageTitle = React.memo(({
    title,
    subtitle,
    theme,
    onBack,
    children,
    showBack = true,
    className = '',
    titleClassName = '',
    subtitleClassName = '',
}) => {
    const dark = isDarkTheme(theme);
    return (
        <div className={`px-4 pt-6 pb-4 flex justify-between items-start gap-3 ${className}`}>
            <div className="flex-1 flex items-start space-x-2 min-w-0">
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
                <div className="min-w-0">
                    <h1
                        className={`text-[1.625rem] font-bold tracking-tight leading-tight ${titleClassName}`}
                        style={{ color: theme.colors.textPrimary }}
                    >
                        {title}
                    </h1>
                    {subtitle ? (
                        <p
                            className={`text-[0.8125rem] mt-1 leading-relaxed ${subtitleClassName}`}
                            style={{ color: theme.colors.textSecondary }}
                        >
                            {subtitle}
                        </p>
                    ) : null}
                </div>
            </div>
            {children}
        </div>
    );
});
