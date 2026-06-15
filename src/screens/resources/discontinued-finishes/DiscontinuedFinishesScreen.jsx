import React, { useEffect, useMemo, useState } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { Modal } from '../../../components/common/Modal.jsx';
import { ShoppingCart, Palette, CalendarDays, ArrowRight } from 'lucide-react';
import { EmptyState } from '../../../components/common/EmptyState.jsx';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { SAMPLE_PRODUCTS } from '../../samples/data.js';
import { ScreenTopChrome } from '../../../components/common/ScreenTopChrome.jsx';
import { getDiscontinuedFinishesSeed, loadDiscontinuedFinishes } from './repository.js';

const MetaChip = ({ icon: Icon, children, theme, isDark }) => (
    <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.6875rem] font-semibold"
        style={{
            color: theme.colors.textSecondary,
            opacity: 0.82,
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.76)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
        }}
    >
        {Icon ? <Icon className="w-3 h-3" /> : null}
        <span>{children}</span>
    </span>
);

export const DiscontinuedFinishesScreen = ({ theme, onNavigate, onUpdateCart }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFinish, setSelectedFinish] = useState(null);
    const [dataset, setDataset] = useState(() => getDiscontinuedFinishesSeed());
    const isDark = isDarkTheme(theme);
    const text = theme.colors.textPrimary;
    const sub = theme.colors.textSecondary;
    const accent = theme.colors.accent;

    useEffect(() => {
        let isCancelled = false;

        loadDiscontinuedFinishes().then((nextDataset) => {
            if (!isCancelled) {
                setDataset(nextDataset);
            }
        });

        return () => {
            isCancelled = true;
        };
    }, []);

    /* ── Connector chip between the two swatches ── */
    const Connector = ({ size = 28 }) => (
        <div
            className="flex items-center justify-center flex-shrink-0 rounded-full"
            style={{
                width: size,
                height: size,
                color: accent,
                backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
            }}
        >
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.25} />
        </div>
    );
    const finishes = dataset.records;

    const grouped = useMemo(() => {
        const q = searchTerm.toLowerCase().trim();
        const filtered = finishes.filter(f =>
            f.oldName.toLowerCase().includes(q) ||
            f.newName.toLowerCase().includes(q) ||
            f.category.toLowerCase().includes(q) ||
            (f.labReference || '').toLowerCase().includes(q) ||
            (f.discontinuedLabel || '').toLowerCase().includes(q) ||
            (f.sourceSummary || '').toLowerCase().includes(q)
        );
        const g = filtered.reduce((acc, f) => {
            (acc[f.category] = acc[f.category] || []).push(f);
            return acc;
        }, {});
        return dataset.categoryOrder.filter(c => g[c]).map(c => [c, g[c]]);
    }, [searchTerm, finishes, dataset.categoryOrder]);

    const handleOrderClick = () => {
        if (!selectedFinish) return;
        const targetName = (selectedFinish.newName || '').toLowerCase();
        const sampleMatch = selectedFinish.replacementSampleId
            ? SAMPLE_PRODUCTS.find((product) => product.id === selectedFinish.replacementSampleId)
            : SAMPLE_PRODUCTS.find((product) => (product.name || '').toLowerCase() === targetName);
        const newItem = sampleMatch || {
            id: `sample-${targetName.replace(/\s+/g, '-')}`,
            name: selectedFinish.newName,
            category: 'finishes',
            image: selectedFinish.replacementImage,
        };
        if (onUpdateCart) onUpdateCart(newItem, 1);
        setSelectedFinish(null);
        onNavigate && onNavigate('samples/cart');
    };

    /* ── Swatch ── */
    const Swatch = ({ image, alt, size = 40, tone }) => (
        <div
            className="flex-shrink-0 overflow-hidden"
            style={{
                width: size,
                height: size,
                borderRadius: 12,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                backgroundColor: tone || (isDark ? '#3C3C3C' : theme.colors.subtle),
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
    const hoverSurface = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.025)';
    const FinishRow = ({ finish }) => {
        return (
            <button
                type="button"
                onClick={() => setSelectedFinish(finish)}
                className="group w-full text-left focus:outline-none rounded-2xl transition-all duration-200 active:scale-[0.985]"
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hoverSurface; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
                <div
                    className="items-center px-3 py-3 sm:px-3.5"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)',
                        gap: 8,
                        alignItems: 'center',
                    }}
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        <Swatch image="" alt={finish.oldName} tone={finish.legacySwatchTone} />
                        <div className="min-w-0">
                            <p className="font-semibold text-[0.8125rem] leading-tight truncate" style={{ color: text }}>
                                {finish.oldName}
                            </p>
                            <p className="text-[0.625rem] font-medium mt-0.75 flex flex-wrap gap-x-1.5 gap-y-0.5" style={{ color: sub }}>
                                {finish.discontinuedLabel && (
                                    <span style={{ opacity: 0.74 }}>Disc. {finish.discontinuedLabel}</span>
                                )}
                                {finish.labReference && (
                                    <span style={{ opacity: 0.52 }}>Lab {finish.labReference}</span>
                                )}
                                {finish.sourceCodesSummary && (
                                    <span style={{ opacity: 0.52 }}>Codes {finish.sourceCodesSummary}</span>
                                )}
                            </p>
                        </div>
                    </div>

                    <Connector />

                    <div className="flex items-center gap-2.5 min-w-0">
                        <Swatch image={finish.replacementImage} alt={finish.newName} tone={finish.legacySwatchTone} />
                        <div className="min-w-0">
                            <p className="font-semibold text-[0.8125rem] leading-tight truncate" style={{ color: text }}>
                                {finish.newName}
                            </p>
                            <p className="text-[0.625rem] font-medium mt-0.75" style={{ color: accent, opacity: 0.62 }}>
                                Replacement
                            </p>
                        </div>
                    </div>
                </div>
            </button>
        );
    };

    return (
        <div className="h-full flex flex-col app-header-offset">
            <ScreenTopChrome theme={theme} contentClassName="pt-3 pb-3">
                <StandardSearchBar
                    value={searchTerm}
                    onChange={(val) => setSearchTerm(val)}
                    placeholder="Search by finish name..."
                    theme={theme}
                />
            </ScreenTopChrome>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8 scrollbar-hide">
                <div className="max-w-content mx-auto w-full">
                {grouped.length > 0 ? (
                    <div className="space-y-5 mt-1">
                        {grouped.map(([category, items]) => (
                            <section key={category}>
                                <div className="flex items-center justify-between gap-3 mb-2 px-0.5">
                                    <h2
                                        className="text-[0.6875rem] font-bold uppercase tracking-[0.1em]"
                                        style={{ color: sub, opacity: 0.55 }}
                                    >
                                        {category}
                                    </h2>
                                    <span className="text-[0.6875rem] font-semibold" style={{ color: sub, opacity: 0.6 }}>
                                        {items.length} finishes
                                    </span>
                                </div>
                                <GlassCard theme={theme} className="overflow-hidden" style={{ padding: 6 }}>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 lg:gap-1.5">
                                        {items.map((finish) => (
                                            <FinishRow key={finish.id} finish={finish} />
                                        ))}
                                    </div>
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
            </div>

            {/* Modal */}
            <Modal show={!!selectedFinish} onClose={() => setSelectedFinish(null)} title="Add Replacement Sample" theme={theme}>
                {selectedFinish && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-center gap-6 py-4">
                            <div className="flex flex-col items-center gap-2">
                                <Swatch image="" alt={selectedFinish.oldName} size={52} tone={selectedFinish.legacySwatchTone} />
                                <div className="text-center">
                                    <p className="text-xs font-semibold" style={{ color: sub }}>{selectedFinish.oldName}</p>
                                    <p className="text-[0.625rem] mt-0.5 font-medium" style={{ color: sub, opacity: 0.5 }}>Discontinued</p>
                                </div>
                            </div>
                            <div className="flex-shrink-0 -mt-5">
                                <Connector size={32} />
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Swatch image={selectedFinish.replacementImage} alt={selectedFinish.newName} size={52} tone={selectedFinish.legacySwatchTone} />
                                <div className="text-center">
                                    <p className="text-xs font-semibold" style={{ color: text }}>{selectedFinish.newName}</p>
                                    <p className="text-[0.625rem] mt-0.5 font-medium" style={{ color: accent }}>Replacement</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2">
                            {selectedFinish.discontinuedLabel && (
                                <MetaChip icon={CalendarDays} theme={theme} isDark={isDark}>
                                    {`Disc. ${selectedFinish.discontinuedLabel}`}
                                </MetaChip>
                            )}
                            {selectedFinish.labReference && (
                                <MetaChip theme={theme} isDark={isDark}>
                                    {`Lab ${selectedFinish.labReference}`}
                                </MetaChip>
                            )}
                            {selectedFinish.sourceCodesSummary && (
                                <MetaChip theme={theme} isDark={isDark}>
                                    {`Codes ${selectedFinish.sourceCodesSummary}`}
                                </MetaChip>
                            )}
                            {selectedFinish.sourceSection && (
                                <MetaChip theme={theme} isDark={isDark}>
                                    {selectedFinish.sourceSection}
                                </MetaChip>
                            )}
                            {selectedFinish.sourceSummary && (
                                <MetaChip theme={theme} isDark={isDark}>
                                    {selectedFinish.sourceSummary}
                                </MetaChip>
                            )}
                        </div>

                        <p className="text-[0.8125rem] text-center leading-relaxed" style={{ color: sub }}>
                            Add a sample of <span className="font-semibold" style={{ color: text }}>{selectedFinish.newName}</span> to your cart?
                        </p>

                        <div className="flex gap-3 pt-1">
                            <button
                                type="button"
                                onClick={() => setSelectedFinish(null)}
                                className="flex-1 font-semibold py-2.5 rounded-full text-[0.8125rem] motion-tap active:scale-[0.98] transition-all"
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : theme.colors.subtle, color: text }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
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
