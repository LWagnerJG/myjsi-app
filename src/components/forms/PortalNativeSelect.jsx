import React from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { GlassCard } from '../common/GlassCard.jsx';
import { DropdownPortal } from '../../DropdownPortal.jsx';
import {
    DROPDOWN_MIN_WIDTH,
    DROPDOWN_SIDE_PADDING,
    DROPDOWN_GAP,
} from '../../constants/dropdown.js';

export const PortalNativeSelect = ({
    label,
    value,
    onChange,
    options,
    placeholder,
    theme,
    required,
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [pos, setPos] = React.useState({ top: 0, left: 0, width: 0, height: 0 });
    const wrapRef = React.useRef(null);
    const dropRef = React.useRef(null);
    
    // Calculate dynamic height based on number of options
    const calculateDropdownHeight = React.useCallback(() => {
        const optionHeight = 40; // py-2.5 + text height ? 40px per option
        const padding = 12; // p-1.5 = 6px top + 6px bottom
        const minHeight = 60;
        const maxHeight = Math.min(400, window.innerHeight * 0.6); // Max 60% of screen height
        
        const calculatedHeight = Math.min(
            Math.max(minHeight, options.length * optionHeight + padding),
            maxHeight
        );
        
        return calculatedHeight;
    }, [options.length]);
    
    const calcPos = React.useCallback(() => { 
        if (!wrapRef.current) return; 
        
        const r = wrapRef.current.getBoundingClientRect(); 
        const vw = window.innerWidth; 
        const vh = window.innerHeight; 
        const h = calculateDropdownHeight();
        const w = Math.max(r.width, DROPDOWN_MIN_WIDTH); 
        
        let top = r.bottom + DROPDOWN_GAP; 
        if (top + h > vh) top = r.top - h - DROPDOWN_GAP; 
        
        let left = r.left; 
        if (left + w > vw - DROPDOWN_SIDE_PADDING) left = vw - w - DROPDOWN_SIDE_PADDING; 
        if (left < DROPDOWN_SIDE_PADDING) left = DROPDOWN_SIDE_PADDING; 
        
        setPos({ top, left, width: w, height: h }); 
    }, [calculateDropdownHeight]);
    
    const toggleOpen = React.useCallback(() => { 
        if (!isOpen) {
            // Calculate position synchronously before opening
            calcPos();
        }
        setIsOpen(o => !o); 
    }, [isOpen, calcPos]);
    
    React.useEffect(() => { 
        const away = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target) && 
                dropRef.current && !dropRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }; 
        document.addEventListener('mousedown', away); 
        return () => document.removeEventListener('mousedown', away); 
    }, []);
    
    React.useEffect(() => { 
        if (!isOpen) return; 
        const handler = () => calcPos(); 
        window.addEventListener('resize', handler); 
        window.addEventListener('scroll', handler, true); 
        return () => { 
            window.removeEventListener('resize', handler); 
            window.removeEventListener('scroll', handler, true); 
        }; 
    }, [isOpen, calcPos]);
    
    const selectedLabel = React.useMemo(() => { 
        if (!Array.isArray(options)) return placeholder; 
        return options.find((o) => o.value === value)?.label || placeholder; 
    }, [options, value, placeholder]);
    
    const handleSelect = React.useCallback((v) => { 
        onChange({ target: { value: v } }); 
        setIsOpen(false); 
    }, [onChange]);

    // Determine if scrolling is needed (for very large lists)
    const needsScrolling = React.useMemo(() => {
        const optionHeight = 40;
        const padding = 12;
        const maxHeight = Math.min(400, window.innerHeight * 0.6);
        return (options.length * optionHeight + padding) > maxHeight;
    }, [options.length]);
    
    return (
        <>
            <div ref={wrapRef} className="relative space-y-2">
                {label && (
                    <label className="block text-sm font-semibold px-3" style={{ color: theme.colors.textSecondary }}>
                        {label}
                    </label>
                )}
                <button
                    type="button"
                    onClick={toggleOpen}
                    aria-expanded={isOpen}
                    aria-required={required}
                    className="w-full px-4 py-3 border rounded-full text-base text-left flex justify-between items-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ 
                        backgroundColor: theme.colors.subtle, 
                        borderColor: theme.colors.border, 
                        color: value ? theme.colors.textPrimary : theme.colors.textSecondary,
                    }}
                >
                    <span className="pr-6 truncate">{selectedLabel}</span>
                    <ChevronDown 
                        className={`absolute right-4 w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                        style={{ color: theme.colors.textSecondary }} 
                    />
                </button>
            </div>
            {isOpen && (
                <DropdownPortal parentRef={wrapRef} onClose={() => setIsOpen(false)}>
                    <div 
                        ref={dropRef} 
                        className="z-[9999] pointer-events-auto"
                        style={{ 
                            top: pos.top, 
                            left: pos.left, 
                            width: pos.width 
                        }}
                    >
                        {/* Use a direct div instead of GlassCard to avoid backdrop filter */}
                        <div 
                            className={`p-1.5 rounded-2xl shadow-lg border transition-all duration-300 ${needsScrolling ? 'overflow-y-auto scrollbar-hide' : ''}`}
                            style={{ 
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.border,
                                boxShadow: `0 4px 30px ${theme.colors.shadow || 'rgba(0, 0, 0, 0.1)'}`,
                                height: `${pos.height}px`,
                                maxHeight: needsScrolling ? `${pos.height}px` : 'none',
                                // Explicitly remove backdrop filters for solid appearance
                                backdropFilter: 'none',
                                WebkitBackdropFilter: 'none',
                            }}
                        >
                            {options.map((opt) => (
                                <button 
                                    key={opt.value} 
                                    type="button" 
                                    onClick={() => handleSelect(opt.value)} 
                                    className="block w-full text-left py-2.5 px-3.5 text-sm rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5" 
                                    style={{ 
                                        backgroundColor: opt.value === value ? theme.colors.primary : 'transparent', 
                                        color: opt.value === value ? theme.colors.surface : theme.colors.textPrimary, 
                                        fontWeight: opt.value === value ? 600 : 400,
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </DropdownPortal>
            )}
        </>
    );
};
