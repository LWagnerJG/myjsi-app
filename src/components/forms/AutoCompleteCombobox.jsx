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

    const calcPos = useCallback(() => {
        if (!inputWrapperRef.current) return;
        const r = inputWrapperRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const itemHeight = 40;
        const padding = 12;
        const maxItems = 8;
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
            finalHeight = Math.min(contentHeight, spaceBelow - DROPDOWN_GAP * 2, 300);
        } else {
            // Position above
            finalHeight = Math.min(contentHeight, spaceAbove - DROPDOWN_GAP * 2, 300);
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
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                <input
                    type="text"
                    value={value || ''}
                    onFocus={handleInputFocus}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-4 py-3 border rounded-full text-base transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ 
                        backgroundColor: theme.colors.subtle, 
                        borderColor: theme.colors.border, 
                        color: theme.colors.textPrimary 
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
                <DropdownPortal parentRef={inputWrapperRef} onClose={() => setIsOpen(false)}>
                    <div 
                        ref={dropRef} 
                        className={`fixed z-[9999] pointer-events-auto ${dropdownClassName}`} 
                        style={{ 
                            top: pos.top, 
                            left: pos.left, 
                            width: pos.width 
                        }}
                    >
                        <div 
                            className="p-1.5 overflow-y-auto scrollbar-hide rounded-2xl shadow-lg border transition-all duration-300" 
                            style={{ 
                                height: `${pos.height}px`,
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.border,
                                boxShadow: `0 4px 30px ${theme.colors.shadow || 'rgba(0, 0, 0, 0.1)'}`,
                                backdropFilter: 'none',
                                WebkitBackdropFilter: 'none',
                            }}
                        >
                            {filtered.map((opt) => (
                                <button 
                                    key={opt} 
                                    type="button" 
                                    onClick={() => handleSelectOption(opt)} 
                                    className="block w-full text-left py-2.5 px-3.5 text-sm rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors" 
                                    style={{ color: theme.colors.textPrimary }}
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
