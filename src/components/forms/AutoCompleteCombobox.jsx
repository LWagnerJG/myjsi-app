import React, { useState, useRef, useMemo, useCallback, useLayoutEffect, useEffect } from 'react';
import { Search } from 'lucide-react';
import { DropdownPortal } from '../../DropdownPortal.jsx';
import { DROPDOWN_MIN_WIDTH, DROPDOWN_SIDE_PADDING, DROPDOWN_GAP } from '../../constants/dropdown.js';

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
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0, height: 'auto' });
    const inputWrapperRef = useRef(null);
    const dropRef = useRef(null);

    const filtered = useMemo(() => {
        const q = (value || '').toLowerCase();
        if (!q) return options;
        return options.filter(o => o.toLowerCase().includes(q));
    }, [value, options]);

    const shouldShowAddButton = useMemo(() => {
        return onAddNew && value && value.trim() && !options.some(o => o.toLowerCase() === value.toLowerCase());
    }, [onAddNew, value, options]);

    // Force solid background colors - more aggressive detection
    const getDropdownStyles = () => {
        const isDarkTheme = theme.colors.background?.includes('#1E') || 
                           theme.colors.background?.includes('#2') || 
                           theme.colors.surface?.includes('#2') ||
                           theme.colors.textPrimary?.includes('#F');
        
        if (isDarkTheme) {
            return {
                backgroundColor: '#2A2A2A',
                color: '#F5F5F5',
                borderColor: 'rgba(255,255,255,0.12)',
                '--dropdown-bg': '#2A2A2A',
                '--dropdown-border': 'rgba(255,255,255,0.12)'
            };
        } else {
            return {
                backgroundColor: '#FFFFFF',
                color: '#111111',
                borderColor: 'rgba(0,0,0,0.12)',
                '--dropdown-bg': '#FFFFFF',
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
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: theme.colors.textSecondary }} />
                <input
                    type="text"
                    value={value || ''}
                    onFocus={handleInputFocus}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-4 py-3 border rounded-full text-base transition-all duration-200 focus:outline-none focus:ring"
                    style={{ 
                        backgroundColor: dropdownStyles.backgroundColor,
                        borderColor: dropdownStyles.borderColor, 
                        color: dropdownStyles.color,
                        borderWidth: '1px'
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
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 20px rgba(0, 0, 0, 0.1)',
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
