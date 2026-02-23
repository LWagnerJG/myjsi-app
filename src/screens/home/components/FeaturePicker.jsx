import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const FeaturePicker = ({ value, onChange, options, colors, isDark }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const current = options.find(o => o.id === value);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(p => !p); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 animate-pulse-subtle"
                style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(53,53,53,0.08)',
                    color: colors.textPrimary,
                    border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(53,53,53,0.20)'}`,
                }}
            >
                {current?.label}
                <ChevronDown className="w-3 h-3 opacity-60" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {open && (
                <div
                    className="absolute right-0 top-full mt-2 w-44 rounded-2xl overflow-hidden z-30 py-1.5"
                    style={{
                        backgroundColor: isDark ? 'rgba(36,36,36,0.96)' : 'rgba(252,250,248,0.98)',
                        border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.08)',
                        boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 8px 32px rgba(0,0,0,0.12)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                    }}
                >
                    {options.map(opt => (
                        <button
                            key={opt.id}
                            onClick={(e) => { e.stopPropagation(); onChange(opt.id); setOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-[13px] transition-colors"
                            style={{
                                backgroundColor: opt.id === value
                                    ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)')
                                    : 'transparent',
                                color: opt.id === value ? colors.textPrimary : colors.textSecondary,
                                fontWeight: opt.id === value ? 600 : 400,
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
