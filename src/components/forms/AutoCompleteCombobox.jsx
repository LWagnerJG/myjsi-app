import React, { useState, useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import { Search } from 'lucide-react';
import { isDarkTheme } from '../../design-system/tokens.js';

export const AutoCompleteCombobox = React.memo(({
    label,
    options = [],
    value,
    onChange,
    onSelect,
    onAddNew,
    placeholder = '',
    theme,
    dropdownClassName = '',
    resetOnSelect = false,
    compact = false,
    showDropdown = true,
    showAddButton = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropUp, setDropUp] = useState(false);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
    const dark = isDarkTheme(theme);

    // Flip dropdown above the input when there isn't enough space below.
    // Also re-checks on resize so the iOS keyboard opening (which shrinks innerHeight) is handled.
    const calcDropUp = () => {
        if (!wrapperRef.current) return;
        const rect = wrapperRef.current.getBoundingClientRect();
        const chrome = document.querySelector('[data-bottom-chrome]');
        const bottomOccupied = chrome ? (window.innerHeight - chrome.getBoundingClientRect().top) : 0;
        setDropUp(window.innerHeight - rect.bottom - bottomOccupied < 260);
    };
    useLayoutEffect(() => {
        if (!isOpen) return;
        calcDropUp();
    }, [isOpen]);
    useEffect(() => {
        if (!isOpen) return;
        window.addEventListener('resize', calcDropUp);
        return () => window.removeEventListener('resize', calcDropUp);
    }, [isOpen]);

    const filtered = useMemo(() => {
        if (!showDropdown) return [];
        const q = (value || '').toLowerCase();
        if (!q) return options;
        return options.filter(o => o.toLowerCase().includes(q));
    }, [showDropdown, value, options]);

    const shouldShowAddButton = useMemo(() => {
        return showAddButton && onAddNew && value && value.trim()
            && !options.some(o => o.toLowerCase() === value.toLowerCase());
    }, [showAddButton, onAddNew, value, options]);

    const subtleBorder = dark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.07)';
    const inputBg = dark ? theme.colors.background : theme.colors.surface;

    // Close on outside click/tap — option buttons are inside wrapperRef so they won't trigger this
    useEffect(() => {
        if (!isOpen) return;
        const close = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', close);
        document.addEventListener('touchstart', close, { passive: true });
        return () => {
            document.removeEventListener('mousedown', close);
            document.removeEventListener('touchstart', close);
        };
    }, [isOpen]);

    const handleSelect = (opt) => {
        onSelect?.(opt);
        setIsOpen(false);
        inputRef.current?.blur();
        onChange(resetOnSelect ? '' : opt);
    };

    const handleAdd = () => {
        if (!value) return;
        onAddNew?.(value);
        onSelect?.(value);
        onChange(value);
        setIsOpen(false);
        inputRef.current?.blur();
    };

    const showList = showDropdown && isOpen && filtered.length > 0;

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-[13px] font-semibold px-1" style={{ color: theme.colors.textSecondary }}>
                    {label}
                </label>
            )}
            {/* Wrapper is position:relative so the dropdown anchors to it — no portal needed */}
            <div className="relative" ref={wrapperRef}>
                <Search
                    className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${compact ? 'left-3 w-3.5 h-3.5' : 'left-3.5 w-4 h-4'}`}
                    style={{ color: theme.colors.textSecondary }}
                />
                <input
                    ref={inputRef}
                    type="search"
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="off"
                    autoComplete="off"
                    value={value || ''}
                    onFocus={() => { if (showDropdown) setIsOpen(true); }}
                    onChange={(e) => {
                        onChange(e.target.value);
                        if (showDropdown) setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    className="w-full border rounded-full focus:outline-none focus:ring-0"
                    style={{
                        height: 40,
                        paddingLeft: compact ? 34 : 38,
                        paddingRight: 16,
                        fontSize: 14,
                        backgroundColor: inputBg,
                        borderColor: subtleBorder,
                        color: theme.colors.textPrimary,
                    }}
                />

                {/* Inline dropdown — flips above when near bottom of viewport */}
                {showList && (
                    <div
                        className={`absolute left-0 right-0 z-50 rounded-2xl border overflow-hidden ${dropdownClassName}`}
                        style={{
                            ...(dropUp ? { bottom: 'calc(100% + 6px)' } : { top: 'calc(100% + 6px)' }),
                            backgroundColor: theme.colors.surface,
                            borderColor: subtleBorder,
                            boxShadow: dark
                                ? '0 8px 32px rgba(0,0,0,0.45)'
                                : '0 8px 24px rgba(0,0,0,0.11)',
                        }}
                    >
                        <div className="overflow-y-auto py-1" style={{ maxHeight: 216 }}>
                            {filtered.map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    // onMouseDown prevents input blur before click fires on desktop
                                    onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
                                    // onClick handles touch tap on mobile
                                    onClick={() => handleSelect(opt)}
                                    className="w-full text-left px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] active:bg-black/[0.06]"
                                    style={{ color: theme.colors.textPrimary }}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {shouldShowAddButton && (
                <button
                    type="button"
                    onClick={handleAdd}
                    className="inline-flex items-center px-3 py-1.5 text-[12px] font-semibold rounded-full transition-colors"
                    style={{
                        color: theme.colors.accent,
                        backgroundColor: `${theme.colors.accent}14`,
                    }}
                >
                    + Add "{value}"
                </button>
            )}
        </div>
    );
});
