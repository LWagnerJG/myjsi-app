import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Search, Mic, X } from 'lucide-react';
import { getHomeChromeIconButtonStyles } from '../../design-system/homeChrome.js';
import { isDarkTheme } from '../../design-system/tokens.js';

// HomeSearchInput — lives inside the home screen search pill (56px pill, animated placeholder)
export const HomeSearchInput = React.memo(function HomeSearchInput({
    theme,
    value = '',
    onChange,
    onSubmit,
    onVoiceClick,
    className = '',
    onFocus,
    onBlur,
    onKeyDown,
    ariaExpanded,
    ariaActiveDescendant,
    ariaControls,
}) {
    const [focused, setFocused] = useState(false);
    const [tick, setTick] = useState(0);
    const [prevText, setPrevText] = useState(null);
    const phrases = useMemo(() => [
        'Search or ask Elliott...',
        'What are lead times for Motif?',
        'Compare Jasper vs Motif specs',
        'Help me start a sample order',
        'Show commission rates',
        'Write an email to my customer',
        'What finishes pair with Slate?',
        'Draft an install checklist',
        'Find dealers near Indianapolis',
        'Summarize this contract',
        'Ask Elliott about finishes...',
    ], []);
    const DISPLAY_MS = 8200;
    const FADE_MS = 1500;
    const FADE_IN_DELAY = 360;
    const phraseFor = useCallback((i) => phrases[i % phrases.length], [phrases]);
    useEffect(() => {
        const id = setInterval(() => setTick(p => p + 1), DISPLAY_MS);
        return () => clearInterval(id);
    }, [DISPLAY_MS]);
    useEffect(() => {
        if (tick === 0) return;
        setPrevText(phraseFor(tick - 1));
        const t = setTimeout(() => setPrevText(null), FADE_MS + 120);
        return () => clearTimeout(t);
    }, [tick, phraseFor]);
    const currentText = phraseFor(tick);
    const isAskCycle = currentText === 'Ask me anything...';
    const shouldPulse = isAskCycle && tick !== 0;
    const showHint = !value && !focused;
    const isDark = isDarkTheme(theme);
    const iconButtonStyles = getHomeChromeIconButtonStyles(isDark);
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

            <div className="flex items-center justify-center mr-3" style={{ width: 20, height: 20 }}>
                <Search style={{ width: 18, height: 18, color: theme.colors.textSecondary }} />
            </div>

            <div className="flex-1 relative">
                <input
                    value={value}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={onKeyDown}
                    placeholder=""
                    className="w-full bg-transparent outline-none"
                    style={{
                        color: theme.colors.textPrimary,
                        fontSize: "1rem",
                        height: 56,
                        lineHeight: '56px',
                        fontWeight: 400,
                        WebkitFontSmoothing: 'antialiased',
                    }}
                    role="combobox"
                    aria-label="Search or ask Elliott"
                    aria-autocomplete="list"
                    aria-haspopup="listbox"
                    aria-expanded={ariaExpanded}
                    aria-activedescendant={ariaActiveDescendant}
                    aria-controls={ariaControls}
                    autoComplete="off"
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
                className="ml-2 rounded-full flex items-center justify-center transition-colors hover:opacity-90"
                style={{ ...iconButtonStyles, width: 36, height: 36, color: theme.colors.textSecondary }}
                aria-label="Voice input"
            >
                <Mic style={{ width: 16, height: 16 }} />
            </button>
        </form>
    );
});

// SearchInput — universal search pill used across all non-home screens.
// Uses the same frosted-glass language as the home screen pill and app header.
// `variant` prop is accepted for backwards-compat but no longer changes styling.
export const SearchInput = React.memo(function SearchInput({
    id,
    value = '',
    onChange,
    placeholder,
    theme,
    className = '',
    style = {},
    variant,        // kept for backwards-compat, ignored
    inputClassName = '',
    autoFocus = false,
    inputRef,
}) {
    void variant;
    const dark = isDarkTheme(theme);
    // Match homeChrome primary palette — frosted glass pill
    const bg  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.72)';
    const bdr = dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.80)';
    const shadow = dark
      ? '0 2px 10px rgba(0,0,0,0.25)'
      : '0 2px 10px rgba(53,53,53,0.08)';
    const iconColor = theme?.colors?.textSecondary || '#666';

    return (
        <div
            id={id}
            className={`flex items-center gap-2.5 ${className}`}
            role="search"
            style={{
                height: 56,
                borderRadius: 9999,
                backgroundColor: bg,
                border: bdr,
                boxShadow: shadow,
                backdropFilter: 'blur(12px) saturate(1.4)',
                WebkitBackdropFilter: 'blur(12px) saturate(1.4)',
                paddingLeft: 14,
                paddingRight: value ? 8 : 14,
                transition: 'border-color 150ms ease, box-shadow 150ms ease',
                ...style,
            }}
        >
            <Search
                aria-hidden="true"
                style={{ width: 18, height: 18, color: iconColor, opacity: 0.6, flexShrink: 0 }}
            />
            <input
                type="search"
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                placeholder={placeholder}
                className={`flex-1 h-full bg-transparent outline-none ${inputClassName}`}
                style={{ color: theme?.colors?.textPrimary || '#111', fontSize: "1rem" }}
                aria-label={placeholder}
                autoComplete="off"
                autoFocus={autoFocus}
                ref={inputRef}
            />
            {value && onChange && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="flex-shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center transition-opacity hover:opacity-80 active:scale-90"
                    style={{ backgroundColor: dark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.10)' }}
                    aria-label="Clear search"
                >
                    <X style={{ width: 11, height: 11, color: iconColor }} />
                </button>
            )}
        </div>
    );
});
