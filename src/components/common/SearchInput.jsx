// components/common/SearchInput.jsx
import React, { useEffect, useMemo, useState } from 'react';
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
    const [prevText, setPrevText] = useState(null);

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

    const DISPLAY_MS = 8200;
    const FADE_MS = 1500;
    const FADE_IN_DELAY = 320;

    const phraseFor = (i) =>
        i % 3 === 0 ? 'Ask me anything...' : phrases[(i - 1 + phrases.length) % phrases.length];

    useEffect(() => {
        const id = setInterval(() => setTick((p) => p + 1), DISPLAY_MS);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        if (tick === 0) return;
        setPrevText(phraseFor(tick - 1));
        const t = setTimeout(() => setPrevText(null), FADE_MS + 120);
        return () => clearTimeout(t);
    }, [tick]);

    const currentText = phraseFor(tick);
    const isAskCycle = currentText === 'Ask me anything...';
    const shouldPulse = isAskCycle && tick !== 0; // no pulse on very first render
    const showHint = !value && !focused;

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
        @keyframes siFadeIn { from { opacity: 0 } to { opacity: .52 } }
        @keyframes siFadeOut { from { opacity: .52 } to { opacity: 0 } }
        @keyframes siPulseSlow { 0% { transform: scale(1) } 50% { transform: scale(1.01) } 100% { transform: scale(1) } }
      `}</style>

            <div className="w-full relative flex items-center px-4" style={pill}>
                <Search className="w-5 h-5 mr-2 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />

                <input
                    value={value}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder=""
                    className="flex-1 bg-transparent outline-none text-[13px]"
                    style={{ color: theme.colors.textPrimary, lineHeight: 1.25 }}
                    aria-label="Search"
                />

                {showHint && (
                    <div
                        className="pointer-events-none absolute left-11 right-11"
                        style={{
                            top: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            overflow: 'visible',
                            lineHeight: 1.25,
                        }}
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
                                    willChange: 'opacity',
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
                                animation: `siFadeIn ${FADE_MS}ms ${FADE_IN_DELAY}ms ease both${shouldPulse ? `, siPulseSlow 2600ms ease-in-out infinite` : ''
                                    }`,
                                transformOrigin: 'center',
                                willChange: 'opacity, transform',
                            }}
                        >
                            {currentText}
                        </span>
                    </div>
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
