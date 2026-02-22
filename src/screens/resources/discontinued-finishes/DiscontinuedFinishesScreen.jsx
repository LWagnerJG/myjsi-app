import React, { useState, useMemo, useEffect } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { Modal } from '../../../components/common/Modal.jsx';
import { ArrowRight, Search, ShoppingCart, Palette } from 'lucide-react';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { DISCONTINUED_FINISHES } from './data.js';
import { SAMPLE_PRODUCTS } from '../../samples/data.js';

export const DiscontinuedFinishesScreen = ({ theme, onNavigate, onUpdateCart }) => {
    const [finishes, setFinishes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFinish, setSelectedFinish] = useState(null);
    const isDark = isDarkTheme(theme);

    useEffect(() => {
        const staticFinishes = DISCONTINUED_FINISHES.map((finish, index) => ({
            id: index + 1,
            OldFinish: finish.oldName,
            NewFinishName: finish.newName,
            Category: finish.category,
            OldVeneerCode: finish.veneer,
            NewVeneerCode: finish.veneer,
            OldSolidCode: finish.solid,
            NewSolidCode: finish.solid
        }));
        setFinishes(staticFinishes);
        setIsLoading(false);
    }, []);

    const getLocalFinishImagePath = (finishName) => {
        if (!finishName) return '';
        const finishData = DISCONTINUED_FINISHES.find(f => f.oldName === finishName || f.newName === finishName);
        return finishData?.newImage || '';
    };

    const formatFinishName = (name) => !name ? '' : name.split(' ').map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()).join(' ');

    const groupedFinishes = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase().trim();
        const filtered = finishes.filter(finish => {
            const cat = typeof finish.Category === 'string' ? finish.Category : finish.Category?.Value || '';
            return (
                (finish.OldFinish || '').toLowerCase().includes(lowercasedFilter) ||
                (finish.NewFinishName || '').toLowerCase().includes(lowercasedFilter) ||
                cat.toLowerCase().includes(lowercasedFilter)
            );
        });
        return filtered.reduce((acc, f) => {
            const cat = typeof f.Category === 'string' ? f.Category : f.Category?.Value || 'Uncategorized';
            (acc[cat] = acc[cat] || []).push(f);
            return acc;
        }, {});
    }, [searchTerm, finishes]);

    const handleOrderClick = () => {
        if (!selectedFinish) return;
        const targetName = (selectedFinish.NewFinishName || '').toLowerCase();
        const sampleMatch = SAMPLE_PRODUCTS.find(p => (p.name || '').toLowerCase() === targetName);
        const newItem = sampleMatch || {
            id: `sample-${targetName.replace(/\s+/g, '-')}`,
            name: formatFinishName(selectedFinish.NewFinishName),
            category: 'finishes',
            image: getLocalFinishImagePath(selectedFinish.NewFinishName)
        };
        if (onUpdateCart) onUpdateCart(newItem, 1);
        setSelectedFinish(null);
        onNavigate && onNavigate('samples/cart');
    };

    /* ── Finish swatch with inset shadow for tactile depth ── */
    const FinishSwatch = ({ image, alt, size = 42 }) => (
        <div
            className="flex-shrink-0 rounded-full overflow-hidden"
            style={{
                width: size,
                height: size,
                border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)'}`,
                boxShadow: isDark
                    ? '0 1px 3px rgba(0,0,0,0.15)'
                    : '0 1px 3px rgba(53,53,53,0.06)',
                backgroundColor: isDark ? '#3C3C3C' : theme.colors.subtle,
            }}
        >
            {image ? (
                <img src={image} alt={alt} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <Palette className="w-4 h-4" style={{ color: theme.colors.textSecondary, opacity: 0.4 }} />
                </div>
            )}
        </div>
    );

    /* ── Single finish mapping row ── */
    const FinishRow = ({ finish, isLast }) => {
        const oldImg = getLocalFinishImagePath(finish.OldFinish);
        const newImg = getLocalFinishImagePath(finish.NewFinishName);
        return (
            <button
                onClick={() => setSelectedFinish(finish)}
                className="w-full text-left transition-all duration-150 focus:outline-none group"
                style={{ padding: '14px 16px', borderRadius: 16 }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
                <div className="flex items-center gap-3">
                    {/* Old (discontinued) finish */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FinishSwatch image={oldImg} alt={finish.OldFinish} />
                        <div className="min-w-0">
                            <p className="font-semibold text-[13px] leading-tight truncate" style={{ color: theme.colors.textPrimary }}>
                                {formatFinishName(finish.OldFinish)}
                            </p>
                            <p className="text-xs font-medium tracking-wide mt-0.5" style={{ color: theme.colors.textSecondary }}>
                                {finish.OldVeneerCode}
                            </p>
                        </div>
                    </div>

                    {/* Arrow pill */}
                    <div
                        className="flex-shrink-0 flex items-center justify-center"
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: 9999,
                            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(53,53,53,0.04)',
                        }}
                    >
                        <ArrowRight
                            className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                            style={{ color: theme.colors.textSecondary }}
                        />
                    </div>

                    {/* New (replacement) finish */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FinishSwatch image={newImg} alt={finish.NewFinishName} />
                        <div className="min-w-0">
                            <p className="font-semibold text-[13px] leading-tight truncate" style={{ color: theme.colors.textPrimary }}>
                                {formatFinishName(finish.NewFinishName)}
                            </p>
                            <p className="text-xs font-medium tracking-wide mt-0.5" style={{ color: theme.colors.accent }}>
                                {finish.NewVeneerCode || finish.NewSolidCode || finish.OldSolidCode}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Separator — skip on last item */}
                {!isLast && (
                    <div
                        className="mt-3.5 mx-1"
                        style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}` }}
                    />
                )}
            </button>
        );
    };

    /* ── Skeleton loader for perceived speed ── */
    const LoadingSkeleton = () => (
        <div className="space-y-4 mt-2">
            {[1, 2, 3].map(i => (
                <div key={i} className="space-y-3">
                    <div className="h-4 rounded-full animate-pulse" style={{ width: i === 1 ? 120 : 90, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }} />
                    <GlassCard theme={theme} className="p-3">
                        {[1, 2, 3].map(j => (
                            <div key={j} className="flex items-center gap-3 py-3">
                                <div className="w-10 h-10 rounded-full animate-pulse" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }} />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3 w-24 rounded-full animate-pulse" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }} />
                                    <div className="h-2 w-14 rounded-full animate-pulse" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }} />
                                </div>
                                <div className="w-6 h-6 rounded-full animate-pulse" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }} />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3 w-20 rounded-full animate-pulse" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }} />
                                    <div className="h-2 w-14 rounded-full animate-pulse" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }} />
                                </div>
                            </div>
                        ))}
                    </GlassCard>
                </div>
            ))}
        </div>
    );

    return (
        <div className="h-full flex flex-col app-header-offset">
            {/* Search bar — fixed below app header */}
            <div className="flex-shrink-0 px-4 pt-1 pb-3" style={{ backgroundColor: theme.colors.background }}>
                <StandardSearchBar
                    value={searchTerm}
                    onChange={(val) => setSearchTerm(val)}
                    placeholder="Search discontinued or replacement..."
                    theme={theme}
                />
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : Object.keys(groupedFinishes).length > 0 ? (
                    <div className="space-y-6 mt-1">
                        {Object.entries(groupedFinishes).map(([category, finishItems]) => (
                            <section key={category}>
                                {/* Category header — JSI uppercase label style */}
                                <h2
                                    className="text-[13px] font-bold uppercase tracking-widest mb-2.5 px-1"
                                    style={{ color: theme.colors.textPrimary, letterSpacing: '0.08em' }}
                                >
                                    {category}
                                </h2>
                                <GlassCard theme={theme} className="overflow-hidden" style={{ padding: 4 }}>
                                    {finishItems.map((finish, index) => (
                                        <FinishRow
                                            key={finish.id || index}
                                            finish={finish}
                                            isLast={index === finishItems.length - 1}
                                        />
                                    ))}
                                </GlassCard>
                            </section>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(53,53,53,0.04)' }}
                        >
                            <Search className="w-6 h-6" style={{ color: theme.colors.textSecondary }} />
                        </div>
                        <p className="font-semibold text-[15px]" style={{ color: theme.colors.textPrimary }}>
                            No results found
                        </p>
                        <p className="text-[13px] mt-1 text-center max-w-[260px]" style={{ color: theme.colors.textSecondary }}>
                            No finishes match &ldquo;{searchTerm}&rdquo;. Try a different name or code.
                        </p>
                    </div>
                )}
            </div>

            {/* ── Confirmation modal with visual preview ── */}
            <Modal show={!!selectedFinish} onClose={() => setSelectedFinish(null)} title="Add Replacement Sample" theme={theme}>
                {selectedFinish && (
                    <div className="space-y-5">
                        {/* Visual mapping preview */}
                        <div className="flex items-center justify-center gap-5 py-3">
                            {/* Old finish */}
                            <div className="flex flex-col items-center gap-2">
                                <FinishSwatch
                                    image={getLocalFinishImagePath(selectedFinish.OldFinish)}
                                    alt={selectedFinish.OldFinish}
                                    size={56}
                                />
                                <div className="text-center">
                                    <p className="text-xs font-semibold leading-tight" style={{ color: theme.colors.textSecondary }}>
                                        {formatFinishName(selectedFinish.OldFinish)}
                                    </p>
                                    <p className="text-[11px] mt-0.5" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>
                                        Discontinued
                                    </p>
                                </div>
                            </div>

                            <ArrowRight className="w-4 h-4 flex-shrink-0 mt-[-20px]" style={{ color: theme.colors.textSecondary }} />

                            {/* New finish */}
                            <div className="flex flex-col items-center gap-2">
                                <FinishSwatch
                                    image={getLocalFinishImagePath(selectedFinish.NewFinishName)}
                                    alt={selectedFinish.NewFinishName}
                                    size={56}
                                />
                                <div className="text-center">
                                    <p className="text-xs font-semibold leading-tight" style={{ color: theme.colors.textPrimary }}>
                                        {formatFinishName(selectedFinish.NewFinishName)}
                                    </p>
                                    <p className="text-[11px] mt-0.5" style={{ color: theme.colors.accent }}>
                                        Replacement
                                    </p>
                                </div>
                            </div>
                        </div>

                        <p className="text-[13px] text-center leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                            Add a sample of <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{formatFinishName(selectedFinish.NewFinishName)}</span> to your cart?
                        </p>

                        {/* Action buttons — pill style per JSI design system */}
                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={() => setSelectedFinish(null)}
                                className="flex-1 font-semibold py-2.5 rounded-full text-[13px] transition-all duration-150"
                                style={{
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : theme.colors.subtle,
                                    color: theme.colors.textPrimary,
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : theme.colors.subtle; }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleOrderClick}
                                className="flex-1 font-semibold py-2.5 rounded-full text-[13px] flex items-center justify-center gap-2 transition-all duration-150"
                                style={{
                                    backgroundColor: theme.colors.accent,
                                    color: theme.colors.accentText,
                                    boxShadow: 'none',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
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
