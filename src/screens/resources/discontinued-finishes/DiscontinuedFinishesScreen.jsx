import React, { useState, useMemo } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { Modal } from '../../../components/common/Modal.jsx';
import { ShoppingCart, Palette } from 'lucide-react';
import { EmptyState } from '../../../components/common/EmptyState.jsx';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { DISCONTINUED_FINISHES } from './data.js';
import { SAMPLE_PRODUCTS } from '../../samples/data.js';

export const DiscontinuedFinishesScreen = ({ theme, onNavigate, onUpdateCart }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFinish, setSelectedFinish] = useState(null);
    const isDark = isDarkTheme(theme);
    const text = theme.colors.textPrimary;
    const sub = theme.colors.textSecondary;
    const accent = theme.colors.accent;

    const fmtDate = (d) => {
        if (!d) return '';
        const [y, m] = d.split('-');
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${months[parseInt(m, 10) - 1]} ${y}`;
    };

    const LongArrow = () => (
        <svg width="28" height="12" viewBox="0 0 28 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="6" x2="22" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <polyline points="20,2 26,6 20,10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    const finishes = useMemo(() =>
        DISCONTINUED_FINISHES.map((f) => ({
            id: f.id,
            oldName: f.oldName,
            newName: f.newName,
            category: f.category,
            lab: f.lab || null,
            discontinuedDate: f.discontinuedDate || '',
            newImage: f.newImage || '',
        })),
    []);

    const getImg = (name) => {
        if (!name) return '';
        const d = DISCONTINUED_FINISHES.find(f => f.oldName === name || f.newName === name);
        return d?.newImage || '';
    };

    const fmt = (name) => !name ? '' : name.split(' ').map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()).join(' ');

    const grouped = useMemo(() => {
        const q = searchTerm.toLowerCase().trim();
        const filtered = finishes.filter(f =>
            f.oldName.toLowerCase().includes(q) ||
            f.newName.toLowerCase().includes(q) ||
            f.category.toLowerCase().includes(q) ||
            (f.lab || '').toLowerCase().includes(q)
        );
        const order = ['Wood Veneer', 'Laminate', 'Metal'];
        const g = filtered.reduce((acc, f) => {
            (acc[f.category] = acc[f.category] || []).push(f);
            return acc;
        }, {});
        return order.filter(c => g[c]).map(c => [c, g[c]]);
    }, [searchTerm, finishes]);

    const handleOrderClick = () => {
        if (!selectedFinish) return;
        const targetName = (selectedFinish.newName || '').toLowerCase();
        const sampleMatch = SAMPLE_PRODUCTS.find(p => (p.name || '').toLowerCase() === targetName);
        const newItem = sampleMatch || {
            id: `sample-${targetName.replace(/\s+/g, '-')}`,
            name: fmt(selectedFinish.newName),
            category: 'finishes',
            image: getImg(selectedFinish.newName),
        };
        if (onUpdateCart) onUpdateCart(newItem, 1);
        setSelectedFinish(null);
        onNavigate && onNavigate('samples/cart');
    };

    /* ── Swatch ── */
    const Swatch = ({ image, alt, size = 40, color }) => (
        <div
            className="flex-shrink-0 overflow-hidden"
            style={{
                width: size,
                height: size,
                borderRadius: 12,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                backgroundColor: color || (isDark ? '#3C3C3C' : theme.colors.subtle),
            }}
        >
            {image ? (
                <img src={image} alt={alt} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <Palette className="w-4 h-4" style={{ color: sub, opacity: 0.25 }} />
                </div>
            )}
        </div>
    );

    /* ── Single row ── */
    const FinishRow = ({ finish, isLast }) => {
        const oldImg = getImg(finish.oldName);
        const newImg = getImg(finish.newName);
        return (
            <button
                onClick={() => setSelectedFinish(finish)}
                className="w-full text-left focus:outline-none active:scale-[0.995] transition-transform"
            >
                <div
                    className="items-center px-4 py-3"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '46% 28px 1fr',
                        gap: 0,
                        alignItems: 'center',
                    }}
                >
                    {/* Old finish — fixed 38% column keeps arrow in a consistent spot */}
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <Swatch image={oldImg} alt={finish.oldName} />
                        <div className="min-w-0">
                            <p className="font-semibold text-[0.8125rem] leading-tight truncate" style={{ color: text }}>
                                {fmt(finish.oldName)}
                            </p>
                            <p className="text-[0.625rem] font-medium mt-0.5" style={{ color: sub }}>
                                {finish.discontinuedDate && (
                                    <span style={{ opacity: 0.7 }}>Disc. {fmtDate(finish.discontinuedDate)}</span>
                                )}
                                {finish.lab && (
                                    <span style={{ opacity: 0.45 }}>{finish.discontinuedDate ? '  ·  ' : ''}Lab {finish.lab}</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Arrow — always at the 38% mark, never shifts */}
                    <div className="flex items-center justify-center" style={{ color: accent, opacity: 0.5 }}>
                        <LongArrow />
                    </div>

                    {/* New finish — takes all remaining space */}
                    <div className="flex items-center gap-2.5 min-w-0 pl-7">
                        <Swatch image={newImg} alt={finish.newName} />
                        <div className="min-w-0">
                            <p className="font-semibold text-[0.8125rem] leading-tight truncate" style={{ color: text }}>
                                {fmt(finish.newName)}
                            </p>
                            <p className="text-[0.625rem] font-medium mt-0.5" style={{ color: accent, opacity: 0.55 }}>
                                Replacement
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                {!isLast && (
                    <div className="mx-4" style={{ height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }} />
                )}
            </button>
        );
    };

    return (
        <div className="h-full flex flex-col app-header-offset">
            {/* Title + search */}
            <div className="flex-shrink-0 px-5 pt-3 pb-3" style={{ backgroundColor: theme.colors.background }}>
                <StandardSearchBar
                    value={searchTerm}
                    onChange={(val) => setSearchTerm(val)}
                    placeholder="Search by finish name..."
                    theme={theme}
                />
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-8 scrollbar-hide">
                {grouped.length > 0 ? (
                    <div className="space-y-5 mt-1">
                        {grouped.map(([category, items]) => (
                            <section key={category}>
                                <h2
                                    className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] mb-2 px-0.5"
                                    style={{ color: sub, opacity: 0.55 }}
                                >
                                    {category}
                                </h2>
                                <GlassCard theme={theme} className="overflow-hidden" style={{ padding: 0 }}>
                                    {items.map((finish, index) => (
                                        <FinishRow
                                            key={finish.id}
                                            finish={finish}
                                            isLast={index === items.length - 1}
                                        />
                                    ))}
                                </GlassCard>
                            </section>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={Palette}
                        title="No results"
                        description={`No finishes match "${searchTerm}"`}
                        theme={theme}
                    />
                )}
            </div>

            {/* Modal */}
            <Modal show={!!selectedFinish} onClose={() => setSelectedFinish(null)} title="Add Replacement Sample" theme={theme}>
                {selectedFinish && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-center gap-6 py-4">
                            <div className="flex flex-col items-center gap-2">
                                <Swatch image={getImg(selectedFinish.oldName)} alt={selectedFinish.oldName} size={52} />
                                <div className="text-center">
                                    <p className="text-xs font-semibold" style={{ color: sub }}>{fmt(selectedFinish.oldName)}</p>
                                    <p className="text-[0.625rem] mt-0.5 font-medium" style={{ color: sub, opacity: 0.5 }}>Discontinued</p>
                                </div>
                            </div>
                            <div className="flex-shrink-0 -mt-5" style={{ color: sub, opacity: 0.4 }}>
                                <LongArrow />
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Swatch image={getImg(selectedFinish.newName)} alt={selectedFinish.newName} size={52} />
                                <div className="text-center">
                                    <p className="text-xs font-semibold" style={{ color: text }}>{fmt(selectedFinish.newName)}</p>
                                    <p className="text-[0.625rem] mt-0.5 font-medium" style={{ color: accent }}>Replacement</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-[0.8125rem] text-center leading-relaxed" style={{ color: sub }}>
                            Add a sample of <span className="font-semibold" style={{ color: text }}>{fmt(selectedFinish.newName)}</span> to your cart?
                        </p>

                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={() => setSelectedFinish(null)}
                                className="flex-1 font-semibold py-2.5 rounded-full text-[0.8125rem] motion-tap active:scale-[0.98] transition-all"
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : theme.colors.subtle, color: text }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleOrderClick}
                                className="flex-1 font-semibold py-2.5 rounded-full text-[0.8125rem] flex items-center justify-center gap-2 motion-tap active:scale-[0.98] transition-all"
                                style={{ backgroundColor: accent, color: theme.colors.accentText }}
                            >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                Add to Cart
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
