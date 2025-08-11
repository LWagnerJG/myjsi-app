// components/common/SearchInput.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Mic } from 'lucide-react';

export const SearchInput = React.memo(function SearchInput({
    theme,
    value = '',
    onChange,
    onSubmit,
    onVoiceClick,
    className = '',
}) {
    const [focused, setFocused] = useState(false);
    const [tick, setTick] = useState(0);
    const inputRef = useRef(null);

    const phrases = useMemo(
        () => [
            'Find install guides...',
            'Compare product specs...',
            'Start sample order...',
            'Check lead times...',
            'Create social posts...',
            'Show commission rates...',
            'Price out package...',
            'Search dealer directory...',
            'Summarize a contract...',
            'Suggest finish pairings...',
            'Write customer email...',
            'Draft install checklist...',
            'Analyze win chances...',
            'Plan design days...',
            'Build product comparison...',
        ],
        []
    );

    const DISPLAY_MS = 7200;

    useEffect(() => {
        const id = setInterval(() => setTick((p) => p + 1), DISPLAY_MS);
        return () => clearInterval(id);
    }, []);

    const showHint = !value && !focused;
    const isAskCycle = tick % 3 === 0;
    const hintText = isAskCycle ? 'Ask me anything...' : phrases[(tick - 1 + phrases.length) % phrases.length];

    const pill = {
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: `0 6px 24px ${theme.colors.shadow}`,
        borderRadius: 9999,
        height: 56,
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit && onSubmit(value);
            }}
            className={`w-full ${className}`}
        >
            <style>{`
        @keyframes siCrossfade {
          0% { opacity: 0; transform: translateY(2px) }
          15% { opacity: .95; transform: translateY(0) }
          85% { opacity: .95; transform: translateY(0) }
          100% { opacity: 0; transform: translateY(-2px) }
        }
        @keyframes siPulse {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(0) scale(1.02); }
          100% { transform: translateY(0) scale(1); }
        }
      `}</style>

            <div className="w-full flex items-center px-4 relative" style={pill}>
                <Search className="w-5 h-5 mr-2 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />

                <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder=""
                    className="flex-1 bg-transparent outline-none text-[14px]"
                    style={{ color: theme.colors.textPrimary }}
                    aria-label="Search"
                />

                {showHint && (
                    <span
                        key={tick}
                        className="pointer-events-none absolute left-11 right-11 truncate select-none text-[13px]"
                        style={{
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: theme.colors.textSecondary,
                            opacity: 0.52,
                            whiteSpace: 'nowrap',
                            animation: `siCrossfade ${DISPLAY_MS}ms ease-in-out 1${isAskCycle ? `, siPulse 2400ms ease-in-out infinite` : ''}`,
                        }}
                        aria-hidden="true"
                    >
                        {hintText}
                    </span>
                )}

                <button
                    type="button"
                    onClick={onVoiceClick}
                    className="ml-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
                    style={{ color: theme.colors.textSecondary }}
                    aria-label="Voice input"
                >
                    <Mic className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
});
