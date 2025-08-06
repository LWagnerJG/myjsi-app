import React from 'react';
import { Search, Mic } from 'lucide-react';

export const SearchInput = React.memo(({
    onSubmit,
    value,
    onChange,
    placeholder,
    theme,
    className,
    style,
    onVoiceClick
}) => {
    return (
        <form
            onSubmit={onSubmit}
            className={`relative flex items-center transition-all duration-200 outline-none ${className || ''}`}
            style={{
                borderRadius: '9999px',
                backgroundColor: '#ffffff',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                minHeight: 48,
                height: 48,
                padding: 0,
                ...style
            }}
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
                className="w-full bg-transparent pl-12 pr-12 py-3 text-base outline-none border-none rounded-full placeholder-gray-500/70 focus:placeholder-gray-400/80 transition-colors duration-200"
                style={{ color: theme.colors.textPrimary, fontWeight: 400, fontSize: 16, height: 48, lineHeight: '48px' }}
            />
            {onVoiceClick && (
                <button type="button" onClick={onVoiceClick} className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-blue-50/60 rounded-full transition-colors duration-200">
                    <Mic className="h-5 w-5" style={{ color: theme.colors.textSecondary, opacity: 0.7 }} />
                </button>
            )}
        </form>
    );
});
