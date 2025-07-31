import React, { useRef, useMemo } from 'react';
import { Search, Mic } from 'lucide-react';

export const SearchInput = React.memo(({ onSubmit, value, onChange, placeholder, theme, className, onVoiceClick }) => (
    <form onSubmit={onSubmit} className={`relative flex items-center ${className || ''}`}>
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5" style={{ color: theme.colors.textSecondary }} />
        </div>
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full pl-12 pr-12 py-3 border rounded-full focus:ring-2 text-base outline-none shadow-lg"
            style={{
                backgroundColor: theme.colors.surface,
                borderColor: 'transparent',
                color: theme.colors.textPrimary,
                ringColor: theme.colors.accent,
            }}
        />
        {onVoiceClick && (
            <button type="button" onClick={onVoiceClick} className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <Mic className="h-5 w-5" style={{ color: theme.colors.textSecondary }} />
            </button>
        )}
    </form>
));