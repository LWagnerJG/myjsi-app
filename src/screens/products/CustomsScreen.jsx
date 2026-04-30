import React, { useCallback, useMemo, useState } from 'react';
import { Send, Share2, Sparkles } from 'lucide-react';
import { Modal } from '../../components/common/Modal.jsx';
import { ScreenTopChrome } from '../../components/common/ScreenTopChrome.jsx';
import { useToast } from '../../components/common/ToastHost.jsx';
import { cardSurface, fieldTileSurface, isDarkTheme } from '../../design-system/tokens.js';
import { CUSTOMS_CATEGORIES, CUSTOM_OPPORTUNITIES } from './data.js';

const PriceBadge = ({ children, theme, dark, onLight }) => (
    <span
        className="inline-flex items-center rounded-full px-3 py-1 text-[0.72rem] font-semibold tracking-[0.04em] backdrop-blur-md"
        style={{
            backgroundColor: onLight
                ? 'rgba(0,0,0,0.62)'
                : (dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)'),
            color: onLight ? '#FFFFFF' : theme.colors.textPrimary,
        }}
    >
        {children}
    </span>
);

const GalleryCard = React.memo(({ item, theme, dark, onOpen }) => (
    <button
        type="button"
        onClick={() => onOpen(item)}
        className="group relative w-full text-left rounded-[24px] overflow-hidden transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.99]"
        style={{ ...cardSurface(theme), padding: 0 }}
    >
        <div className="relative aspect-[4/5] overflow-hidden">
            <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                loading="lazy"
            />
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 38%, rgba(0,0,0,0.78) 100%)',
                }}
            />
            <div className="absolute left-3 top-3">
                <PriceBadge theme={theme} dark={dark} onLight>{item.priceLabel}</PriceBadge>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <div className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-white/70">
                    {CUSTOMS_CATEGORIES.find((c) => c.id === item.category)?.label || ''}
                </div>
                <div className="mt-1 text-[1.15rem] font-semibold tracking-[-0.02em] leading-tight">
                    {item.title}
                </div>
            </div>
        </div>
    </button>
));
GalleryCard.displayName = 'GalleryCard';

const FilterChip = ({ active, label, onClick, theme, dark }) => (
    <button
        type="button"
        onClick={onClick}
        className="rounded-full px-3.5 py-1.5 text-[0.78rem] font-semibold whitespace-nowrap transition-colors"
        style={{
            backgroundColor: active ? theme.colors.textPrimary : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
            color: active ? (dark ? '#111111' : '#FFFFFF') : theme.colors.textSecondary,
        }}
    >
        {label}
    </button>
);

const InquireForm = ({ item, theme, dark, onClose }) => {
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const toast = useToast();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!message.trim()) return;
        setSubmitting(true);
        // Simulated submission — wire to real backend later.
        await new Promise((resolve) => setTimeout(resolve, 350));
        setSubmitting(false);
        toast?.push('Inquiry sent to the customs team', { ttl: 2400 });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-[18px] p-3 text-[0.8rem]" style={fieldTileSurface(theme)}>
                <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{item.title}</span>
                <span style={{ color: theme.colors.textSecondary }}> · {item.priceLabel}</span>
            </div>
            <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                placeholder="What would you change, scale, or detail differently? Include scope, finish direction, or quantity if helpful."
                className="w-full rounded-[18px] p-3.5 text-[0.92rem] leading-relaxed outline-none resize-none"
                style={{
                    ...fieldTileSurface(theme),
                    color: theme.colors.textPrimary,
                    border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                }}
                autoFocus
            />
            <div className="flex items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full px-4 py-2 text-[0.82rem] font-semibold"
                    style={{ color: theme.colors.textSecondary }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!message.trim() || submitting}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.82rem] font-semibold transition-opacity disabled:opacity-50"
                    style={{
                        backgroundColor: theme.colors.textPrimary,
                        color: dark ? '#111111' : '#FFFFFF',
                    }}
                >
                    <Send className="w-3.5 h-3.5" />
                    {submitting ? 'Sending…' : 'Send inquiry'}
                </button>
            </div>
        </form>
    );
};

export const CustomsScreen = ({ theme }) => {
    const dark = isDarkTheme(theme);
    const toast = useToast();
    const [activeCategory, setActiveCategory] = useState('all');
    const [selected, setSelected] = useState(null);
    const [inquireFor, setInquireFor] = useState(null);

    const items = useMemo(() => (
        activeCategory === 'all'
            ? CUSTOM_OPPORTUNITIES
            : CUSTOM_OPPORTUNITIES.filter((item) => item.category === activeCategory)
    ), [activeCategory]);

    const handleShare = useCallback(async (item) => {
        const shareData = {
            title: `${item.title} — JSI Customs`,
            text: `${item.title} · ${item.priceLabel}\n${item.summary}`,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
                return;
            }
            await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
            toast?.push('Copied to clipboard', { ttl: 2000 });
        } catch {
            /* user-cancelled share — no-op */
        }
    }, [toast]);

    return (
        <div
            className="flex flex-col h-full app-header-offset"
            style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}
        >
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <ScreenTopChrome theme={theme} fade={false} contentClassName="pt-4 pb-3">
                    <div className="space-y-4">
                        <div>
                            <div
                                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em]"
                                style={{ backgroundColor: `${theme.colors.accent}14`, color: theme.colors.accent }}
                            >
                                <Sparkles className="w-3 h-3" />
                                <span>Customs Library</span>
                            </div>
                            <h1 className="mt-2 text-[1.85rem] sm:text-[2.25rem] font-semibold tracking-[-0.03em] leading-[1.05]">
                                Browse what we&rsquo;ve built before.
                            </h1>
                            <p className="mt-1.5 text-[0.92rem] leading-relaxed max-w-xl" style={{ color: theme.colors.textSecondary }}>
                                Photography-first concepts with rough budget cues. Tap any image for the brief, then inquire or share.
                            </p>
                        </div>

                        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
                            {CUSTOMS_CATEGORIES.map((cat) => (
                                <FilterChip
                                    key={cat.id}
                                    active={activeCategory === cat.id}
                                    label={cat.label}
                                    onClick={() => setActiveCategory(cat.id)}
                                    theme={theme}
                                    dark={dark}
                                />
                            ))}
                        </div>
                    </div>
                </ScreenTopChrome>

                <div className="px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="max-w-content mx-auto w-full">
                        {items.length === 0 ? (
                            <div className="rounded-[24px] p-8 text-center" style={cardSurface(theme)}>
                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                    No custom concepts in this category yet.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pt-2">
                                {items.map((item) => (
                                    <GalleryCard
                                        key={item.id}
                                        item={item}
                                        theme={theme}
                                        dark={dark}
                                        onOpen={setSelected}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                show={!!selected}
                onClose={() => setSelected(null)}
                title={selected?.title}
                theme={theme}
                maxWidth="max-w-2xl"
            >
                {selected ? (
                    <div className="space-y-4">
                        <div className="aspect-[16/10] rounded-[20px] overflow-hidden">
                            <img
                                src={selected.image}
                                alt={selected.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <PriceBadge theme={theme} dark={dark}>{selected.priceLabel}</PriceBadge>
                            <span
                                className="rounded-full px-3 py-1 text-[0.72rem] font-medium"
                                style={{
                                    backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                    color: theme.colors.textSecondary,
                                }}
                            >
                                {CUSTOMS_CATEGORIES.find((c) => c.id === selected.category)?.label}
                            </span>
                        </div>

                        <p className="text-[0.98rem] leading-relaxed" style={{ color: theme.colors.textPrimary }}>
                            {selected.summary}
                        </p>
                        <p className="text-[0.88rem] leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                            {selected.details}
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => handleShare(selected)}
                                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.82rem] font-semibold"
                                style={{
                                    backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                    color: theme.colors.textPrimary,
                                }}
                            >
                                <Share2 className="w-3.5 h-3.5" />
                                Share
                            </button>
                            <button
                                type="button"
                                onClick={() => { setInquireFor(selected); setSelected(null); }}
                                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.82rem] font-semibold"
                                style={{
                                    backgroundColor: theme.colors.textPrimary,
                                    color: dark ? '#111111' : '#FFFFFF',
                                }}
                            >
                                <Send className="w-3.5 h-3.5" />
                                Inquire
                            </button>
                        </div>
                    </div>
                ) : null}
            </Modal>

            <Modal
                show={!!inquireFor}
                onClose={() => setInquireFor(null)}
                title="Inquire about this concept"
                theme={theme}
                maxWidth="max-w-lg"
            >
                {inquireFor ? (
                    <InquireForm
                        item={inquireFor}
                        theme={theme}
                        dark={dark}
                        onClose={() => setInquireFor(null)}
                    />
                ) : null}
            </Modal>
        </div>
    );
};

export default CustomsScreen;
