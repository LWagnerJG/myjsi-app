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
    const [i, setI] = useState(0);
    const inputRef = useRef(null);

    const phrases = useMemo(
        () => [
            'Lead times today...',
            'Dealer contacts nearby...',
            'Compare Vision vs...',
            'Create sample order...',
            'Track commissions now...',
            'Draft quote fast...',
            'Design days schedule...',
            'Loaner pool status...',
            'Install guides please...',
            'Find fabrics quick...',
            'Commission rates table...',
            'Dealer directory lookup...',
            'Start new project...',
            'Competitive analysis tips...',
            'Product specs summary...',
        ],
        []
    );

    const DISPLAY_MS = 5200;

    useEffect(() => {
        const id = setInterval(() => setI((p) => (p + 1) % phrases.length), DISPLAY_MS);
        return () => clearInterval(id);
    }, [phrases.length]);

    const showHint = !value && !focused;
    const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

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
        @keyframes siFade {
          0% { opacity: 0 }
          10% { opacity: .92 }
          90% { opacity: .92 }
          100% { opacity: 0 }
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
                        key={i}
                        className="pointer-events-none absolute left-11 right-11 truncate select-none text-[13.5px]"
                        style={{
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: theme.colors.textSecondary,
                            opacity: 0.58,
                            whiteSpace: 'nowrap',
                            animation: `siFade ${DISPLAY_MS}ms ease-in-out 1`,
                        }}
                        aria-hidden="true"
                    >
                        {cap(phrases[i])}
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
