import React from 'react';
import { Search, Mic } from 'lucide-react';

export const SearchInput = React.memo(
    ({
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
                    borderRadius: 9999,
                    backgroundColor: '#ffffff',
                    border: '1px solid #E6E6E6',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    minHeight: 56,
                    height: 56,
                    padding: 0,
                    ...style
                }}
                aria-label="Search"
            >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search
                        className="w-[20px] h-[20px]"
                        style={{ color: theme.colors.textSecondary, opacity: 0.7 }}
                        aria-hidden="true"
                    />
                </div>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="w-full bg-transparent pl-12 pr-12 text-[15px] outline-none border-none rounded-full placeholder-gray-500/70 focus:placeholder-gray-400/80"
                    style={{
                        color: theme.colors.textPrimary,
                        fontWeight: 400,
                        height: 56,
                        lineHeight: '56px'
                    }}
                    aria-label={placeholder || 'Search'}
                />
                {onVoiceClick && (
                    <button
                        type="button"
                        onClick={onVoiceClick}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center rounded-full transition-colors duration-150 hover:bg-black/5 active:scale-95"
                        aria-label="Voice input"
                    >
                        <Mic
                            className="w-[18px] h-[18px]"
                            style={{ color: theme.colors.textSecondary, opacity: 0.75 }}
                        />
                    </button>
                )}
            </form>
        );
    }
);
