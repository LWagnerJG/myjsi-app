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
        'Search apps or ask Elliott...',
        'Lead times for Motif',
        'Compare Jasper and Motif specs',
        'Start a sample order',
        'Check commission rates',
        'Draft a customer email',
    ], []);
    const HINT_OPACITY = 0.62;
    const DISPLAY_MS = 8200;
    const FADE_MS = 1500;
    const FADE_IN_DELAY = 360;
    const phraseFor = useCallback((i) => phrases[i % phrases.length], [phrases]);
    const isInitialPhrase = tick === 0;
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
                @keyframes siFadeIn { from { opacity: 0 } to { opacity: .62 } }
                @keyframes siFadeOut { from { opacity: .62 } to { opacity: 0 } }
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
                        fontSize: "1.0625rem",
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
                                    opacity: HINT_OPACITY,
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
                                opacity: HINT_OPACITY,
                                animation: isInitialPhrase ? 'none' : `siFadeIn ${FADE_MS}ms ${FADE_IN_DELAY}ms ease both`,
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
// size="md" (default): 56px standalone search
// size="control": matches SegmentedToggle / CTA height via --jsi-ctrl-h
//
// Typed text (control) matches SegmentedToggle `sm` / `smDense`:
//   0.8125rem · font-weight 600
// Placeholder stays the same size/leading but lighter weight + fainter color
// so it sits on the toggle baseline without competing with selected labels.
const CONTROL_TEXT_SIZE = '0.8125rem';
const CONTROL_TEXT_WEIGHT = 600;
const PLACEHOLDER_TEXT_WEIGHT = 500;

export const SearchInput = React.memo(function SearchInput({
    id,
    value = '',
    onChange,
    placeholder,
    theme,
    className = '',
    style = {},
    inputClassName = '',
    autoFocus = false,
    inputRef,
    size = 'md',
}) {
    const dark = isDarkTheme(theme);
    const isControl = size === 'control';
    // Match homeChrome primary palette — frosted glass pill with a clear edge
    const bg  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.72)';
    const bdr = dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.80)';
    const shadow = dark
      ? '0 2px 10px rgba(0,0,0,0.25)'
      : '0 2px 10px rgba(53,53,53,0.08)';
    const iconColor = theme?.colors?.textSecondary || '#666';
    // Fainter than SegmentedToggle unselected labels — hint, not chrome
    const placeholderColor = dark ? 'rgba(240,240,240,0.42)' : 'rgba(53,53,53,0.40)';
    const iconMutedColor = dark ? 'rgba(240,240,240,0.48)' : 'rgba(53,53,53,0.42)';
    // Fixed icon column keeps placeholder/value text on one vertical edge across sizes
    const iconSlot = isControl ? 18 : 22;
    const iconSize = isControl ? 15 : 18;
    const clearSize = isControl ? 18 : 22;
    const clearIcon = isControl ? 10 : 11;
    const inputFontSize = isControl ? CONTROL_TEXT_SIZE : '1rem';
    const inputFontWeight = isControl ? CONTROL_TEXT_WEIGHT : 400;
    const placeholderWeight = isControl ? PLACEHOLDER_TEXT_WEIGHT : 400;
    const controlHeight = isControl ? 'var(--jsi-ctrl-h)' : 56;
    // Line-height = control height optically centers placeholder with toggle labels
    const inputLineHeight = isControl ? 'var(--jsi-ctrl-h)' : '56px';
    const reactId = React.useId().replace(/:/g, '');
    const placeholderStyleId = `search-ph-${reactId}`;

    return (
        <div
            id={id}
            className={`flex items-center ${className}`}
            role="search"
            style={{
                height: controlHeight,
                borderRadius: 9999,
                backgroundColor: bg,
                border: bdr,
                boxShadow: shadow,
                backdropFilter: 'blur(12px) saturate(1.4)',
                WebkitBackdropFilter: 'blur(12px) saturate(1.4)',
                paddingLeft: isControl ? 10 : 14,
                paddingRight: value ? (isControl ? 6 : 8) : (isControl ? 12 : 14),
                transition: 'border-color 150ms ease, box-shadow 150ms ease',
                ...style,
            }}
        >
            <style>{`
                #${placeholderStyleId} {
                    -webkit-appearance: none;
                    appearance: none;
                }
                #${placeholderStyleId}::placeholder {
                    color: ${placeholderColor} !important;
                    opacity: 1 !important;
                    font-size: ${inputFontSize};
                    font-weight: ${placeholderWeight};
                    letter-spacing: -0.01em;
                    line-height: ${inputLineHeight};
                    text-align: left;
                    vertical-align: middle;
                }
                #${placeholderStyleId}::-webkit-input-placeholder {
                    color: ${placeholderColor} !important;
                    opacity: 1 !important;
                    font-size: ${inputFontSize};
                    font-weight: ${placeholderWeight};
                    letter-spacing: -0.01em;
                    line-height: ${inputLineHeight};
                    text-align: left;
                }
                #${placeholderStyleId}::-moz-placeholder {
                    color: ${placeholderColor} !important;
                    opacity: 1 !important;
                    font-weight: ${placeholderWeight};
                    line-height: ${inputLineHeight};
                }
            `}</style>
            <span
                aria-hidden="true"
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: iconSlot, height: iconSlot }}
            >
                <Search
                    style={{ width: iconSize, height: iconSize, color: iconMutedColor, opacity: 1 }}
                />
            </span>
            <input
                id={placeholderStyleId}
                type="text"
                role="searchbox"
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                placeholder={placeholder}
                className={`min-w-0 flex-1 bg-transparent outline-none border-0 ${inputClassName}`}
                style={{
                    color: theme?.colors?.textPrimary || '#111',
                    fontSize: inputFontSize,
                    fontWeight: inputFontWeight,
                    letterSpacing: '-0.01em',
                    lineHeight: inputLineHeight,
                    height: '100%',
                    margin: 0,
                    // Optical gap after icon column — matches SegmentedToggle label inset feel
                    paddingLeft: isControl ? 8 : 10,
                    paddingRight: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                }}
                aria-label={placeholder}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                autoFocus={autoFocus}
                ref={inputRef}
            />
            {value && onChange && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="flex-shrink-0 rounded-full flex items-center justify-center transition-opacity hover:opacity-80 active:scale-90"
                    style={{
                        width: clearSize,
                        height: clearSize,
                        backgroundColor: dark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.10)',
                    }}
                    aria-label="Clear search"
                >
                    <X style={{ width: clearIcon, height: clearIcon, color: iconColor }} />
                </button>
            )}
        </div>
    );
});
