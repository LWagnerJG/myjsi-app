import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { X, Search, MapPin, Building2 } from 'lucide-react';
import { getUnifiedBackdropStyle, UNIFIED_BACKDROP_TRANSITION, UNIFIED_MODAL_Z } from '../../../components/common/modalUtils.js';
import { MOTION_DURATIONS_MS, MOTION_EASINGS, buildCssTransition } from '../../../design-system/motion.js';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion.js';

export const DirectoryModal = ({ show, onClose, onSelect, theme, dealers = [], designFirms = [] }) => {
    const [q, setQ] = useState('');
    const [mounted, setMounted] = useState(show);
    const [visible, setVisible] = useState(false);
    const isDark = isDarkTheme(theme);
    const prefersReduced = usePrefersReducedMotion();

    const items = useMemo(() => {
        const normalize = (x, idx, type) => ({
            key: `${x?.id ?? x?.name ?? 'item'}-${idx}`,
            name: x?.name ?? x?.company ?? x?.title ?? 'Unknown',
            address: x?.address ?? x?.Address ?? x?.location ?? x?.street ?? x?.office ?? '',
            type,
        });
        const list = [
            ...(dealers || []).map((d, i) => normalize(d, i, 'dealer')),
            ...(designFirms || []).map((d, i) => normalize(d, i + 1000, 'design')),
        ];
        const k = q.trim().toLowerCase();
        return k ? list.filter((i) => i.name.toLowerCase().includes(k) || i.address.toLowerCase().includes(k)) : list;
    }, [q, dealers, designFirms]);

    useEffect(() => {
        if (show) { setMounted(true); requestAnimationFrame(() => setVisible(true)); }
        else { setVisible(false); const t = setTimeout(() => setMounted(false), prefersReduced ? 0 : 220); return () => clearTimeout(t); }
    }, [show, prefersReduced]);

    useEffect(() => { if (!show) setQ(''); }, [show]);

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 flex flex-col justify-end sm:justify-center items-center pointer-events-none" style={{ zIndex: UNIFIED_MODAL_Z + 10 }}>
            <div
                style={{
                    position: 'fixed',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    top: 0,
                    ...getUnifiedBackdropStyle(visible, prefersReduced),
                    transition: prefersReduced ? 'none' : UNIFIED_BACKDROP_TRANSITION,
                    pointerEvents: 'auto'
                }}
                onClick={onClose}
            />
            <div
                className="w-full sm:mx-auto pointer-events-auto"
                style={{
                    transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(.97)',
                    opacity: visible ? 1 : 0,
                    transition: prefersReduced
                        ? 'none'
                        : [
                            buildCssTransition('transform', MOTION_DURATIONS_MS.slow, MOTION_EASINGS.springOut),
                            buildCssTransition('opacity', MOTION_DURATIONS_MS.medium, MOTION_EASINGS.standard),
                        ].join(', '),
                    background: theme.colors.surface,
                    boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)',
                    borderRadius: 24,
                    maxWidth: 480,
                    width: 'calc(100% - 32px)',
                    margin: '0 auto',
                    maxHeight: '75vh',
                }}
            >
                <div className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(53,53,53,0.04)' }}>
                                <Building2 className="w-4.5 h-4.5" style={{ color: theme.colors.accent }} />
                            </div>
                            <div>
                                <h3 className="font-bold text-[15px] tracking-tight" style={{ color: theme.colors.textPrimary }}>Ship to Company</h3>
                                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Select a saved address</p>
                            </div>
                        </div>
                        <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.04)' }}>
                            <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search by name or address..."
                            className="w-full rounded-2xl pl-10 pr-4 py-3 text-[13px] outline-none border transition focus:ring-2"
                            style={{ background: isDark ? 'rgba(255,255,255,0.08)' : theme.colors.inputBackground, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, focusRingColor: theme.colors.accent }}
                        />
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: theme.colors.textSecondary }} />
                    </div>

                    {/* Company list */}
                    <div className="max-h-[45vh] overflow-y-auto space-y-1.5 pr-1 scrollbar-hide">
                        {items.map((it) => (
                            <button
                                key={it.key}
                                onClick={() => { onSelect({ name: it.name, address1: it.address || '' }); onClose(); }}
                                className="w-full text-left px-4 py-3 rounded-2xl group transition-all active:scale-[0.99]"
                                style={{ backgroundColor: 'transparent' }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.025)'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(53,53,53,0.04)' }}>
                                        <Building2 className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-[13px] truncate" style={{ color: theme.colors.textPrimary }}>{it.name}</p>
                                            {it.type === 'dealer' && <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: isDark ? 'rgba(74,124,89,0.15)' : 'rgba(74,124,89,0.08)', color: theme.colors.success }}>Dealer</span>}
                                            {it.type === 'design' && <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: isDark ? 'rgba(91,123,140,0.15)' : 'rgba(91,123,140,0.08)', color: '#5B7B8C' }}>Design</span>}
                                        </div>
                                        {it.address && (
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
                                                <p className="text-xs leading-snug truncate" style={{ color: theme.colors.textSecondary }}>{it.address}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                        {items.length === 0 && (
                            <div className="flex flex-col items-center py-8">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(53,53,53,0.04)' }}>
                                    <Search className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                                </div>
                                <p className="text-[13px] font-medium" style={{ color: theme.colors.textSecondary }}>No companies found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
