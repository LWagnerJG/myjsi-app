import React, { useState, useRef, useMemo, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search } from 'lucide-react';
import { DESIGN_TOKENS, inputSurface, isDarkTheme, subtleBorder } from '../../design-system/tokens.js';
import { getNoAutofillName, NO_AUTOFILL_INPUT_PROPS } from '../../utils/noAutofillInput.js';

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
    const [menuPos, setMenuPos] = useState(null);
    const [inputLocked, setInputLocked] = useState(true);
    const [inputName] = useState(() => getNoAutofillName('combobox'));
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
    const menuRef = useRef(null);
    const dark = isDarkTheme(theme);

    const measure = useCallback(() => {
        if (!wrapperRef.current) return null;
        const rect = wrapperRef.current.getBoundingClientRect();
        const chrome = document.querySelector('[data-bottom-chrome]');
        const bottomOccupied = chrome ? (window.innerHeight - chrome.getBoundingClientRect().top) : 0;
        setDropUp(window.innerHeight - rect.bottom - bottomOccupied < 260);
        setMenuPos({ top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width });
        return rect;
    }, []);

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

    const borderColor = subtleBorder(theme).replace('1px solid ', '');
    const sharedInputSurface = inputSurface(theme);
    const inputBg = dark ? theme.colors.background : sharedInputSurface.backgroundColor;

    // Close on outside click/tap
    useEffect(() => {
        if (!isOpen) return;
        const close = (e) => {
            if (wrapperRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
            setIsOpen(false);
        };
        document.addEventListener('mousedown', close);
        document.addEventListener('touchstart', close, { passive: true });
        return () => {
            document.removeEventListener('mousedown', close);
            document.removeEventListener('touchstart', close);
        };
    }, [isOpen]);

    useLayoutEffect(() => {
        if (!isOpen) {
            setMenuPos(null);
            return;
        }
        measure();
    }, [isOpen, measure]);

    useEffect(() => {
        if (!isOpen) return;
        const sync = () => measure();
        window.addEventListener('resize', sync);
        window.addEventListener('scroll', sync, true);
        return () => {
            window.removeEventListener('resize', sync);
            window.removeEventListener('scroll', sync, true);
        };
    }, [isOpen, measure]);

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
                <label className="block text-[0.8125rem] font-semibold px-1" style={{ color: theme.colors.textSecondary }}>
                    {label}
                </label>
            )}
            <div className="relative" ref={wrapperRef}>
                <Search
                    className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${compact ? 'left-3 w-3.5 h-3.5' : 'left-3.5 w-4 h-4'}`}
                    style={{ color: theme.colors.textSecondary }}
                />
                <input
                    ref={inputRef}
                    type="text"
                    inputMode="text"
                    name={inputName}
                    readOnly={inputLocked}
                    {...NO_AUTOFILL_INPUT_PROPS}
                    value={value || ''}
                    onFocus={() => {
                        setInputLocked(false);
                        if (showDropdown) setIsOpen(true);
                    }}
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
                        fontSize: "0.875rem",
                        backgroundColor: inputBg,
                        borderColor,
                        color: theme.colors.textPrimary,
                    }}
                />

                {showList && menuPos && createPortal(
                    <div
                        ref={menuRef}
                        className={`rounded-2xl border overflow-hidden ${dropdownClassName}`}
                        style={{
                            position: 'fixed',
                            left: menuPos.left,
                            width: menuPos.width,
                            zIndex: DESIGN_TOKENS.zIndex.popover,
                            ...(dropUp
                                ? { bottom: window.innerHeight - menuPos.top + 6 }
                                : { top: menuPos.bottom + 6 }),
                            backgroundColor: theme.colors.surface,
                            borderColor,
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
                                    onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
                                    onClick={() => handleSelect(opt)}
                                    className="w-full text-left px-4 py-2.5 text-[0.8125rem] font-medium transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.09] active:bg-black/[0.06]"
                                    style={{ color: theme.colors.textPrimary }}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>,
                    document.body,
                )}
            </div>

            {shouldShowAddButton && (
                <button
                    type="button"
                    onClick={handleAdd}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full transition-colors"
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
