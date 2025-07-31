import React, { useState, useRef, useMemo, useCallback, useLayoutEffect, useEffect } from 'react';
import { Search } from 'lucide-react';
import { GlassCard } from '../common/GlassCard.jsx';
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
    const wrapRef = useRef(null);
    const dropRef = useRef(null);

    const filtered = useMemo(() => {
        const q = (value || '').toLowerCase();
        if (!q) return options;
        return options.filter(o => o.toLowerCase().includes(q));
    }, [value, options]);

    const calcPos = useCallback(() => {
        if (!wrapRef.current) return;
        const r = wrapRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const spaceBelow = vh - r.bottom;
        const spaceAbove = r.top;
        const maxHeight = vh * 0.4;
        const w = Math.max(r.width, DROPDOWN_MIN_WIDTH);

        let top;
        let dropdownMaxHeight;

        if (spaceBelow > maxHeight || spaceBelow > spaceAbove) {
            top = r.bottom + DROPDOWN_GAP;
            dropdownMaxHeight = Math.min(maxHeight, spaceBelow - DROPDOWN_SIDE_PADDING * 2);
        } else {
            top = r.top - Math.min(maxHeight, spaceAbove - DROPDOWN_SIDE_PADDING * 2) - DROPDOWN_GAP;
            dropdownMaxHeight = Math.min(maxHeight, spaceAbove - DROPDOWN_SIDE_PADDING * 2);
        }

        let left = r.left;
        if (left + w > vw - DROPDOWN_SIDE_PADDING) left = vw - w - DROPDOWN_SIDE_PADDING;
        if (left < DROPDOWN_SIDE_PADDING) left = DROPDOWN_SIDE_PADDING;

        setPos({ top, left, width: w, height: dropdownMaxHeight });
    }, []);

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
            if (wrapRef.current && !wrapRef.current.contains(e.target) && dropRef.current && !dropRef.current.contains(e.target)) {
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

    return (
        <div ref={wrapRef} className="space-y-2">
            {label && (
                <label className="block text-sm font-semibold px-3" style={{ color: theme.colors.textSecondary }}>
                    {label}
                </label>
            )}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                <input
                    type="text"
                    value={value || ''}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-4 py-3 border rounded-full text-base"
                    style={{ backgroundColor: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                />
            </div>

            {isOpen && (
                <DropdownPortal parentRef={wrapRef} onClose={() => setIsOpen(false)}>
                    <div ref={dropRef} className={`fixed z-[9999] pointer-events-auto ${dropdownClassName}`} style={{ top: pos.top, left: pos.left, width: pos.width }}>
                        <GlassCard theme={theme} className="p-1.5 overflow-y-auto scrollbar-hide rounded-2xl shadow-lg" style={{ maxHeight: pos.height, backgroundColor: '#FFFFFF' }}>
                            {filtered.length > 0 && filtered.map((opt) => (
                                <button key={opt} type="button" onClick={() => handleSelectOption(opt)} className="block w-full text-left py-2.5 px-3.5 text-sm rounded-lg hover:bg-black/5" style={{ color: theme.colors.textPrimary }}>
                                    {opt}
                                </button>
                            ))}
                            {onAddNew && value && !options.some(o => o.toLowerCase() === value.toLowerCase()) && (
                                <button type="button" onClick={handleAdd} className="block w-full text-left py-2.5 px-3.5 text-sm mt-1 rounded-lg font-semibold" style={{ color: theme.colors.accent }}>
                                    + Add "{value}"
                                </button>
                            )}
                        </GlassCard>
                    </div>
                </DropdownPortal>
            )}
        </div>
    );
});
