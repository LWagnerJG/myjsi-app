import React, { useState, useRef, useMemo, useCallback, useLayoutEffect, useEffect } from 'react';
import { Search } from 'lucide-react';
import { DropdownPortal } from '../../DropdownPortal.jsx';
import { DROPDOWN_MIN_WIDTH, DROPDOWN_SIDE_PADDING, DROPDOWN_GAP } from '../../constants/dropdown.js';
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
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0, height: 'auto' });
    const inputWrapperRef = useRef(null);
    const dropRef = useRef(null);
    const inputRef = useRef(null);
    const dark = isDarkTheme(theme);

    const filtered = useMemo(() => {
        const q = (value || '').toLowerCase();
        if (!q) return options;
        return options.filter(o => o.toLowerCase().includes(q));
    }, [value, options]);

    const shouldShowAddButton = useMemo(() => {
        return onAddNew && value && value.trim() && !options.some(o => o.toLowerCase() === value.toLowerCase());
    }, [onAddNew, value, options]);

    // Use centralized theme detection to keep dark/light behavior consistent across screens
    const getDropdownStyles = () => {
        if (dark) {
            return {
                backgroundColor: theme.colors.surface,
                color: theme.colors.textPrimary,
                borderColor: 'rgba(255,255,255,0.12)',
                '--dropdown-bg': theme.colors.surface,
                '--dropdown-border': 'rgba(255,255,255,0.12)'
            };
        } else {
            return {
                backgroundColor: theme.colors.surface,
                color: theme.colors.textPrimary,
                borderColor: 'rgba(0,0,0,0.12)',
                '--dropdown-bg': theme.colors.surface,
                '--dropdown-border': 'rgba(0,0,0,0.12)'
            };
        }
    };

    const dropdownStyles = getDropdownStyles();

    const calcPos = useCallback(() => {
        if (!inputWrapperRef.current) return;
        const r = inputWrapperRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const itemHeight = 44;
        const padding = 8;
        const maxItems = 6;
        const totalItems = filtered.length;
        const visibleItems = Math.min(totalItems, maxItems);
        const contentHeight = totalItems > 0 ? Math.max(60, visibleItems * itemHeight + padding) : 0;

        const spaceBelow = vh - r.bottom;
        const spaceAbove = r.top;
        const w = Math.max(r.width, DROPDOWN_MIN_WIDTH);

        let top;
        let finalHeight;

        // Decide if dropdown should appear above or below
        if (spaceBelow >= contentHeight || spaceBelow >= spaceAbove) {
            // Position below
            top = r.bottom + DROPDOWN_GAP;
            finalHeight = Math.min(contentHeight, spaceBelow - DROPDOWN_GAP * 2, 280);
        } else {
            // Position above
            finalHeight = Math.min(contentHeight, spaceAbove - DROPDOWN_GAP * 2, 280);
            top = r.top - finalHeight - DROPDOWN_GAP;
        }

        // Horizontal positioning
        let left = r.left;
        if (left + w > vw - DROPDOWN_SIDE_PADDING) {
            left = vw - w - DROPDOWN_SIDE_PADDING;
        }
        if (left < DROPDOWN_SIDE_PADDING) {
            left = DROPDOWN_SIDE_PADDING;
        }

        setPos({ top, left, width: w, height: finalHeight });
    }, [filtered.length]);

    useLayoutEffect(() => {
        if (isOpen) {
            calcPos();
        }
    }, [isOpen, calcPos]);

    useEffect(() => {
        if (!isOpen) return;
        const handler = () => calcPos();
        window.addEventListener('resize', handler);
        window.addEventListener('scroll', handler, true);
        return () => {
            window.removeEventListener('resize', handler);
            window.removeEventListener('scroll', handler, true);
        };
    }, [isOpen, calcPos]);

    useEffect(() => {
        const away = (e) => {
            if (inputWrapperRef.current && !inputWrapperRef.current.contains(e.target) && 
                dropRef.current && !dropRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', away);
        return () => document.removeEventListener('mousedown', away);
    }, []);

    const handleSelectOption = (opt) => {
        onSelect?.(opt);
        setIsOpen(false);
        inputRef.current?.blur();
        if (resetOnSelect) {
            onChange('');
        } else {
            onChange(opt);
        }
    };

    const handleAdd = () => {
        if (!value) return;
        onAddNew?.(value);
        onSelect?.(value);
        onChange(value);
        setIsOpen(false);
        inputRef.current?.blur();
    };

    const handleInputFocus = () => {
        setIsOpen(true);
    };

    const handleInputChange = (e) => {
        onChange(e.target.value);
        if (!isOpen) {
            setIsOpen(true);
        }
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-semibold px-3" style={{ color: theme.colors.textSecondary }}>
                    {label}
                </label>
            )}
            <div className="relative" ref={inputWrapperRef}>
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ${compact ? 'w-3.5 h-3.5' : 'w-5 h-5'}`} style={{ color: theme.colors.textSecondary }} />
                <input
                    ref={inputRef}
                    type="text"
                    value={value || ''}
                    onFocus={handleInputFocus}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className={`w-full border rounded-full transition-all duration-200 focus:outline-none focus:ring-0 ${compact ? 'pl-10 pr-4 text-[13px]' : 'pl-12 pr-4 py-3 text-base'}`}
                    style={{ 
                        backgroundColor: dropdownStyles.backgroundColor,
                        borderColor: dropdownStyles.borderColor, 
                        color: dropdownStyles.color,
                        borderWidth: '1px',
                        ...(compact ? { height: 40 } : {})
                    }}
                />
            </div>

            {/* Inline "+ Add" button that appears next to the input field */}
            {shouldShowAddButton && (
                <div className="animate-fade-in">
                    <button 
                        type="button" 
                        onClick={handleAdd} 
                        className="inline-flex items-center space-x-1 px-3 py-2 text-sm font-semibold rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                        style={{ 
                            color: theme.colors.accent,
                            backgroundColor: 'transparent'
                        }}
                    >
                        <span>+ Add "{value}"</span>
                    </button>
                </div>
            )}

            {/* Dropdown portal for filtered options */}
            {isOpen && filtered.length > 0 && (
                <DropdownPortal>
                    <div 
                        ref={dropRef} 
                        className={`fixed z-[10000] pointer-events-auto select-none dropdown-container ${dropdownClassName}`} 
                        style={{ 
                            top: pos.top, 
                            left: pos.left, 
                            width: pos.width,
                            ...dropdownStyles
                        }}
                    >
                        <div 
                            className="overflow-y-auto scrollbar-hide rounded-2xl border transition-all duration-200 animate-fade-in autocomplete-dropdown"
                            style={{ 
                                height: `${pos.height}px`,
                                backgroundColor: `${dropdownStyles.backgroundColor} !important`,
                                borderColor: dropdownStyles.borderColor,
                                color: dropdownStyles.color,
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                                backdropFilter: 'none !important',
                                WebkitBackdropFilter: 'none !important',
                                willChange: 'transform, opacity',
                                padding: '8px',
                                // Multiple fallbacks for solid background
                                background: `${dropdownStyles.backgroundColor} !important`,
                                border: `1px solid ${dropdownStyles.borderColor} !important`
                            }}
                        >
                            {filtered.map((opt) => (
                                <button 
                                    key={opt} 
                                    type="button" 
                                    onClick={() => handleSelectOption(opt)} 
                                    className="block w-full text-left py-3 px-4 text-sm rounded-xl transition-all duration-150 font-medium hover:scale-[1.01] focus:outline-none focus:scale-[1.01]" 
                                    style={{ 
                                        color: dropdownStyles.color,
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = theme.colors.accent + '15';
                                        e.target.style.color = theme.colors.accent;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = dropdownStyles.color;
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.backgroundColor = theme.colors.accent + '15';
                                        e.target.style.color = theme.colors.accent;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = dropdownStyles.color;
                                    }}
                                    tabIndex={0}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </DropdownPortal>
            )}
        </div>
    );
});
