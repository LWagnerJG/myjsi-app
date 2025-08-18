import React, { useEffect, useMemo, useState } from 'react';
import { Search, Mic } from 'lucide-react';

// HomeSearchInput (unchanged)
export const HomeSearchInput = React.memo(function HomeSearchInput({
    theme,
    value = '',
    onChange,
    onSubmit,
    onVoiceClick,
    className = '',
    onFocus,
    onBlur,
}) {
    const [focused, setFocused] = useState(false);
    const [tick, setTick] = useState(0);
    const [prevText, setPrevText] = useState(null);
    const phrases = useMemo(() => [
        'Ask me anything...',
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
    ], []);
    const DISPLAY_MS = 8200;
    const FADE_MS = 1500;
    const FADE_IN_DELAY = 360;
    const phraseFor = (i) => phrases[i % phrases.length];
    useEffect(() => {
        const id = setInterval(() => setTick(p => p + 1), DISPLAY_MS);
        return () => clearInterval(id);
    }, [DISPLAY_MS]);
    useEffect(() => {
        if (tick === 0) return;
        setPrevText(phraseFor(tick - 1));
        const t = setTimeout(() => setPrevText(null), FADE_MS + 120);
        return () => clearTimeout(t);
    }, [tick]);
    const currentText = phraseFor(tick);
    const isAskCycle = currentText === 'Ask me anything...';
    const shouldPulse = isAskCycle && tick !== 0;
    const showHint = !value && !focused;
    const handleFocus = (e) => { setFocused(true); onFocus && onFocus(e); };
    const handleBlur = (e) => { setFocused(false); onBlur && onBlur(e); };
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit && onSubmit(value);
            }}
            className={`flex items-center flex-1 ${className}`}
            autoComplete="off"
        >
            <style>{`
        @keyframes siFadeIn { from { opacity: 0 } to { opacity: .52 } }
        @keyframes siFadeOut { from { opacity: .52 } to { opacity: 0 } }
        @keyframes siPulseSlow { 0% { transform: scale(1) } 50% { transform: scale(1.01) } 100% { transform: scale(1) } }
      `}</style>

            <div className="flex items-center justify-center mr-3" style={{ width: 24, height: 24 }}>
                <Search className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
            </div>

            <div className="flex-1 relative">
                <input
                    value={value}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder=""
                    className="w-full bg-transparent outline-none text-[15px]"
                    style={{
                        color: theme.colors.textPrimary,
                        height: 56,
                        lineHeight: '56px',
                        fontWeight: 400,
                        WebkitFontSmoothing: 'antialiased',
                    }}
                    aria-label="Search"
                />

                {showHint && (
                    <div
                        className="pointer-events-none absolute inset-0 flex items-center"
                        aria-hidden="true"
                    >
                        {prevText && (
                            <span
                                className="absolute w-full truncate"
                                style={{
                                    zIndex: 0,
                                    color: theme.colors.textSecondary,
                                    opacity: 0.52,
                                    animation: `siFadeOut ${FADE_MS}ms ease both`,
                                    fontWeight: 400,
                                }}
                            >
                                {prevText}
                            </span>
                        )}
                        <span
                            key={tick}
                            className="absolute w-full truncate"
                            style={{
                                zIndex: 1,
                                color: theme.colors.textSecondary,
                                opacity: 0.52,
                                animation: `siFadeIn ${FADE_MS}ms ${FADE_IN_DELAY}ms ease both${shouldPulse ? `, siPulseSlow 2600ms ease-in-out infinite` : ''}`,
                                transformOrigin: 'center',
                                fontWeight: 400,
                            }}
                        >
                            {currentText}
                        </span>
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={onVoiceClick}
                className="ml-3 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: theme.colors.textSecondary }}
                aria-label="Voice input"
            >
                <Mic className="w-5 h-5" />
            </button>
        </form>
    );
});

// Standard search input with header variant EXACT match to AppHeader pill
export const SearchInput = React.memo(function SearchInput({
    value = '',
    onChange,
    placeholder,
    theme,
    className = '',
    style = {},
    variant = 'default', // 'default' | 'header'
    inputClassName = ''
}) {
    const isHeader = variant === 'header';

    // Pill style pulled from AppHeader (keep in sync)
    const pill = isHeader ? {
        height: 56,
        backgroundColor: theme?.colors?.surface,
        border: `1px solid ${theme?.colors?.border}`,
        boxShadow: `0 8px 24px ${theme?.colors?.shadow}`,
        borderRadius: 9999,
        paddingLeft: 18,
        paddingRight: 18
    } : {
        height: 44,
        backgroundColor: theme?.colors?.surface,
        border: `1px solid ${theme?.colors?.border}`,
        borderRadius: 9999,
        paddingLeft: 16,
        paddingRight: 16
    };

    const iconColor = theme?.colors?.textSecondary || '#666';

    return (
        <div className={`flex items-center flex-1 ${isHeader ? 'gap-2' : 'gap-2'} ${className}`}
             style={{ ...pill, ...style }}>
            <Search className="w-5 h-5" style={{ color: iconColor }} />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                placeholder={placeholder}
                className={`flex-1 h-full bg-transparent outline-none text-[15px] placeholder:opacity-70 ${inputClassName}`}
                style={{ color: theme?.colors?.textPrimary || '#111' }}
                aria-label={placeholder}
            />
        </div>
    );
});
