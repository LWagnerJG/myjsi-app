import React, { useRef } from 'react';
import { Search, Mic } from 'lucide-react';

export const SearchInput = React.memo(function SearchInput({
    onSubmit,
    value,
    onChange,
    placeholder,
    theme,
    className,
    style,
    onVoiceClick,
}) {
    const inputRef = useRef(null);

    const PILL = {
        backgroundColor: theme.colors.surface,
        border: 'none',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        borderRadius: 9999,
        height: 56,
    };

    return (
        <form
            onSubmit={onSubmit}
            className={`relative w-full flex items-center gap-3 px-5 ${className || ''}`}
            style={{ ...PILL, ...style }}
        >
            <Search className="h-5 w-5" style={{ color: theme.colors.textSecondary, opacity: 0.7 }} />
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="flex-1 bg-transparent outline-none border-0 text-[15px] placeholder-gray-500/70"
                style={{
                    color: theme.colors.textPrimary,
                    height: 56,
                    lineHeight: '56px',
                }}
            />
            {onVoiceClick && (
                <button
                    type="button"
                    onClick={onVoiceClick}
                    className="rounded-full p-2 -mr-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                    <Mic className="h-5 w-5" style={{ color: theme.colors.textSecondary, opacity: 0.7 }} />
                </button>
            )}
        </form>
    );
});
