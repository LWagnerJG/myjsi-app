import React from 'react';
import { Search, Mic } from 'lucide-react';

/**
 * Props:
 * - variant: "elevated" | "bare"
 *   - "elevated": renders its own background/border/shadow (default)
 *   - "bare": renders a transparent field; parent provides the shell
 */
export const SearchInput = React.memo(({
    onSubmit,
    value,
    onChange,
    onFocus,
    placeholder,
    theme,
    className,
    style,
    onVoiceClick,
    variant = 'elevated'
}) => {
    const isBare = variant === 'bare';

    const shellStyle = isBare
        ? {}
        : {
            borderRadius: '9999px',
            backgroundColor: '#ffffff',
            border: '1px solid #E5E7EB',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            minHeight: 56,
            height: 56
        };

    return (
        <form
            onSubmit={onSubmit}
            className={`relative flex items-center transition-all duration-200 outline-none ${className || ''}`}
            style={{ ...shellStyle, ...style }}
        >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search
                    className="h-5 w-5"
                    style={{ color: theme.colors.textSecondary, opacity: 0.7 }}
                />
            </div>

            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onFocus={onFocus}
                className={`w-full ${isBare ? 'bg-transparent' : 'bg-transparent'} pl-12 pr-12 text-base outline-none border-none rounded-full placeholder-gray-500/70 focus:placeholder-gray-400/80`}
                style={{
                    color: theme.colors.textPrimary,
                    fontWeight: 400,
                    fontSize: 16,
                    height: 56,
                    lineHeight: '56px'
                }}
            />

            {onVoiceClick && (
                <button
                    type="button"
                    onClick={onVoiceClick}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors duration-200"
                >
                    <Mic className="h-5 w-5" style={{ color: theme.colors.textSecondary, opacity: 0.7 }} />
                </button>
            )}
        </form>
    );
});
