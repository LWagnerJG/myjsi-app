import React, { useCallback, useMemo, useState } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { isDarkTheme, subtleBg } from '../../../design-system/tokens.js';
import { PrimaryButton, SecondaryButton } from '../../../components/common/JSIButtons.jsx';
import {
    ArrowLeft,
    Download,
    ExternalLink,
    Share2,
} from 'lucide-react';
import {
    WEIGHT_FAILURE_TEST_LBS,
    WEIGHT_LIMIT_LBS,
    WEIGHT_RATINGS_BIFMA_POINTS,
    WEIGHT_RATINGS_CERTIFICATION_NOTE,
    WEIGHT_RATINGS_FALLBACK_IMAGE,
    WEIGHT_RATINGS_ROUTE,
    WEIGHT_RATINGS_SERIES,
    WEIGHT_RATINGS_SOURCE_LINKS
} from './data.js';

const ensureTheme = (theme) => ({
    colors: {
        background: theme?.colors?.background || '#FFFFFF',
        surface: theme?.colors?.surface || 'rgba(255,255,255,0.85)',
        subtle: theme?.colors?.subtle || 'rgba(0,0,0,0.06)',
        border: theme?.colors?.border || 'rgba(0,0,0,0.12)',
        textPrimary: theme?.colors?.textPrimary || '#1F1F1F',
        textSecondary: theme?.colors?.textSecondary || '#555555',
        accent: theme?.colors?.accent || '#8B5E3C',
        accentText: theme?.colors?.accentText || '#FFFFFF'
    }
});

const imageFallback = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = WEIGHT_RATINGS_FALLBACK_IMAGE;
};

const getRouteSeriesSlug = (currentScreen) => {
    if (!currentScreen) return null;
    const parts = currentScreen.split('/');
    if (parts[0] !== 'resources' || parts[1] !== 'weight-ratings') return null;
    return parts[2] || null;
};

const getOnePagerUrl = (slug) => `${window.location.origin}/${WEIGHT_RATINGS_ROUTE}/${slug}`;

export const WeightRatingsScreen = ({
    theme = {},
    currentScreen,
    initialSeriesSlug,
    onNavigate,
    setSuccessMessage
}) => {
    const safeTheme = ensureTheme(theme);
    const dark = isDarkTheme(theme);
    const [searchTerm, setSearchTerm] = useState('');

    const dividerColor = dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.04)';
    const softPanel = subtleBg(safeTheme, 1.6);

    const feedback = useCallback((message) => {
        if (!setSuccessMessage) return;
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 1600);
    }, [setSuccessMessage]);

    const selectedSlug = useMemo(() => {
        if (initialSeriesSlug) return initialSeriesSlug;
        return getRouteSeriesSlug(currentScreen);
    }, [currentScreen, initialSeriesSlug]);

    const selectedSeries = useMemo(
        () => WEIGHT_RATINGS_SERIES.find((entry) => entry.slug === selectedSlug) || null,
        [selectedSlug]
    );

    const filteredSeries = useMemo(() => {
        if (!searchTerm.trim()) return WEIGHT_RATINGS_SERIES;
        const q = searchTerm.toLowerCase();
        return WEIGHT_RATINGS_SERIES.filter((entry) => entry.series.toLowerCase().includes(q));
    }, [searchTerm]);

    const openSeries = useCallback((slug) => {
        onNavigate?.(`${WEIGHT_RATINGS_ROUTE}/${slug}`);
    }, [onNavigate]);

    const goToList = useCallback(() => {
        onNavigate?.(WEIGHT_RATINGS_ROUTE);
    }, [onNavigate]);

    const shareOnePager = useCallback(async (series) => {
        const url = getOnePagerUrl(series.slug);
        const title = `${series.series} Weight Rating`;
        const text = `${series.series} seating is rated to ${WEIGHT_LIMIT_LBS} lbs for ANSI/BIFMA certification and internally tested through failure beyond ${WEIGHT_FAILURE_TEST_LBS} lbs.`;

        if (navigator.share) {
            try {
                await navigator.share({ title, text, url });
                feedback('One-pager shared');
                return;
            } catch (_) {
                // fall through to clipboard
            }
        }

        try {
            await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
            feedback('One-pager copied to clipboard');
        } catch (_) {
            feedback('Unable to share on this device');
        }
    }, [feedback]);

    const openPrintableOnePager = useCallback((series) => {
        const onePagerWindow = window.open('', '_blank', 'width=900,height=1100');
        if (!onePagerWindow) {
            feedback('Pop-up blocked. Please allow pop-ups to print.');
            return;
        }

        const today = new Date().toLocaleDateString();
        const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${series.series} Weight Rating One-Pager</title>
<style>
body { font-family: Arial, sans-serif; color: #222; margin: 32px; }
h1 { margin: 0 0 8px; font-size: 28px; }
h2 { margin: 0; font-size: 18px; color: #555; }
.badge { display: inline-block; margin-top: 16px; padding: 10px 16px; border-radius: 999px; background: #f2efe8; font-weight: 700; }
.box { margin-top: 24px; border: 1px solid #ddd; border-radius: 12px; padding: 16px; }
ul { margin: 8px 0 0; padding-left: 20px; }
li { margin-bottom: 6px; }
.meta { margin-top: 24px; color: #666; font-size: 12px; }
</style>
</head>
<body>
<h1>${series.series}</h1>
<h2>JSI Seating Weight Rating</h2>
<div class="badge">Weight Limit: ${WEIGHT_LIMIT_LBS} lbs</div>
<div class="badge">Internal Failure Testing: ${WEIGHT_FAILURE_TEST_LBS}+ lbs</div>
<div class="box">
<strong>Certification Summary</strong>
<p>${WEIGHT_RATINGS_CERTIFICATION_NOTE}</p>
<ul>
${WEIGHT_RATINGS_BIFMA_POINTS.map((point) => `<li>${point}</li>`).join('')}
</ul>
</div>
<div class="meta">Generated: ${today}</div>
</body>
</html>`;

        onePagerWindow.document.write(html);
        onePagerWindow.document.close();
        onePagerWindow.focus();
        setTimeout(() => onePagerWindow.print(), 250);
    }, [feedback]);

    /* ── Detail View ──────────────────────────────────── */
    const DetailView = ({ series }) => (
        <div className="flex-1 overflow-y-auto px-4 pt-3 pb-8 space-y-4 scrollbar-hide">
            <GlassCard theme={safeTheme} className="rounded-[24px] overflow-hidden" variant="elevated">
                <div className="p-5 sm:p-6 space-y-5">
                    <div className="flex items-start gap-4">
                        <div
                            className="w-20 h-20 rounded-[20px] overflow-hidden flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: softPanel }}
                        >
                            <img
                                src={series.image || WEIGHT_RATINGS_FALLBACK_IMAGE}
                                onError={imageFallback}
                                alt={series.series}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[0.625rem] font-bold uppercase tracking-[0.08em] mb-1.5" style={{ color: safeTheme.colors.textSecondary, opacity: 0.5 }}>
                                Seating Weight Rating
                            </p>
                            <h2 className="text-[1.5rem] font-black tracking-tight leading-tight" style={{ color: safeTheme.colors.textPrimary }}>
                                {series.series}
                            </h2>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {series.supportedTypes?.map((type) => (
                                    <span
                                        key={type}
                                        className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.625rem] font-semibold"
                                        style={{ backgroundColor: softPanel, color: safeTheme.colors.textSecondary }}
                                    >
                                        {type}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-[18px] px-4 py-3.5" style={{ backgroundColor: softPanel }}>
                            <p className="text-[0.625rem] font-bold uppercase tracking-[0.08em] mb-1" style={{ color: safeTheme.colors.textSecondary, opacity: 0.46 }}>
                                Published Rating
                            </p>
                            <p className="text-[1.25rem] font-black tabular-nums leading-none" style={{ color: safeTheme.colors.textPrimary }}>
                                {WEIGHT_LIMIT_LBS} lbs
                            </p>
                        </div>
                        <div className="rounded-[18px] px-4 py-3.5" style={{ backgroundColor: softPanel }}>
                            <p className="text-[0.625rem] font-bold uppercase tracking-[0.08em] mb-1" style={{ color: safeTheme.colors.textSecondary, opacity: 0.46 }}>
                                Failure Testing
                            </p>
                            <p className="text-[1.25rem] font-black tabular-nums leading-none" style={{ color: safeTheme.colors.accent }}>
                                {WEIGHT_FAILURE_TEST_LBS}+ lbs
                            </p>
                        </div>
                    </div>

                    <div className="rounded-[20px] p-4" style={{ backgroundColor: softPanel, border: `1px solid ${safeTheme.colors.border}` }}>
                        <p className="text-[0.8125rem] leading-relaxed" style={{ color: safeTheme.colors.textPrimary }}>
                            {WEIGHT_RATINGS_CERTIFICATION_NOTE}
                        </p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <SecondaryButton
                            type="button"
                            onClick={() => shareOnePager(series)}
                            theme={safeTheme}
                            className="h-11 !py-0 px-5 text-[0.8125rem]"
                        >
                            <span className="inline-flex items-center gap-2">
                                <Share2 className="w-3.5 h-3.5" />
                                Share One-Pager
                            </span>
                        </SecondaryButton>
                        <PrimaryButton
                            type="button"
                            onClick={() => openPrintableOnePager(series)}
                            theme={safeTheme}
                            className="h-11 !py-0 px-5 text-[0.8125rem]"
                            icon={<Download className="w-3.5 h-3.5" />}
                        >
                            Print / Save PDF
                        </PrimaryButton>
                    </div>
                </div>
            </GlassCard>

            <GlassCard theme={safeTheme} className="rounded-[24px] overflow-hidden" variant="elevated">
                <div className="px-5 sm:px-6 py-4" style={{ borderBottom: `1px solid ${dividerColor}` }}>
                    <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em]" style={{ color: safeTheme.colors.textSecondary, opacity: 0.5 }}>
                        ANSI/BIFMA Scope
                    </p>
                </div>
                <div className="px-5 sm:px-6 py-3.5">
                    <div className="space-y-3">
                        {WEIGHT_RATINGS_BIFMA_POINTS.map((point, index) => (
                            <div key={point} className="flex items-start gap-3">
                                <span
                                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[0.625rem] font-bold"
                                    style={{ backgroundColor: softPanel, color: safeTheme.colors.textSecondary }}
                                >
                                    {index + 1}
                                </span>
                                <p className="text-[0.8125rem] leading-relaxed pt-0.5" style={{ color: safeTheme.colors.textSecondary }}>
                                    {point}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </GlassCard>

            <GlassCard theme={safeTheme} className="rounded-[24px] overflow-hidden" variant="elevated">
                <div className="px-5 sm:px-6 py-4" style={{ borderBottom: `1px solid ${dividerColor}` }}>
                    <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em]" style={{ color: safeTheme.colors.textSecondary, opacity: 0.5 }}>
                        Reference Links
                    </p>
                </div>
                <div>
                    {WEIGHT_RATINGS_SOURCE_LINKS.map((link, index) => (
                        <a
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4"
                            style={{ borderTop: index > 0 ? `1px solid ${dividerColor}` : 'none' }}
                        >
                            <div className="min-w-0">
                                <p className="text-[0.8125rem] font-semibold" style={{ color: safeTheme.colors.textPrimary }}>
                                    {link.label}
                                </p>
                                <p className="text-[0.6875rem] mt-1" style={{ color: safeTheme.colors.textSecondary, opacity: 0.7 }}>
                                    Opens official certification reference
                                </p>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" style={{ color: safeTheme.colors.textSecondary, opacity: 0.5 }} />
                        </a>
                    ))}
                </div>
            </GlassCard>
        </div>
    );

    if (selectedSlug && !selectedSeries) {
        return (
            <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: safeTheme.colors.background }}>
                <div className="flex-1 overflow-y-auto px-4 pb-6">
                    <GlassCard theme={safeTheme} className="mt-4 rounded-[22px] overflow-hidden p-6 text-center">
                        <p className="text-[0.8125rem] font-semibold" style={{ color: safeTheme.colors.textPrimary }}>
                            Series not found
                        </p>
                        <button
                            type="button"
                            onClick={goToList}
                            className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
                            style={{ backgroundColor: safeTheme.colors.accent, color: safeTheme.colors.accentText }}
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to list
                        </button>
                    </GlassCard>
                </div>
            </div>
        );
    }

    /* ── List View ────────────────────────────────────── */
    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: safeTheme.colors.background }}>
            {!selectedSeries && (
                <div className="px-4 pt-3 pb-2">
                    <StandardSearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search seating series..."
                        theme={safeTheme}
                        aria-label="Search seating series"
                    />
                </div>
            )}

            {selectedSeries ? (
                <DetailView series={selectedSeries} />
            ) : (
                <div className="flex-1 overflow-y-auto px-4 pb-6 pt-1 space-y-3 scrollbar-hide">

                    {filteredSeries.length > 0 ? (
                        <GlassCard theme={safeTheme} className="rounded-[22px] overflow-hidden mt-1">
                            {/* Column headers */}
                            <div
                                className="flex items-center px-4 py-2.5"
                                style={{ borderBottom: `1px solid ${safeTheme.colors.border}` }}
                            >
                                <span className="flex-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em]" style={{ color: safeTheme.colors.textSecondary, opacity: 0.5 }}>
                                    Series
                                </span>
                                <span className="text-[0.6875rem] font-bold uppercase tracking-[0.08em]" style={{ color: safeTheme.colors.textSecondary, opacity: 0.5 }}>
                                    Limit
                                </span>
                            </div>

                            {filteredSeries.map((entry, i) => (
                                <button
                                    key={entry.slug}
                                    type="button"
                                    onClick={() => openSeries(entry.slug)}
                                    className="w-full text-left"
                                    style={{ borderBottom: i < filteredSeries.length - 1 ? `1px solid ${dividerColor}` : 'none' }}
                                >
                                    <div className="flex items-center gap-3 px-4 py-2.5">
                                        <img
                                            src={entry.image || WEIGHT_RATINGS_FALLBACK_IMAGE}
                                            onError={imageFallback}
                                            alt={entry.series}
                                            className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                                        />
                                        <span className="flex-1 text-[0.8125rem] font-semibold truncate" style={{ color: safeTheme.colors.textPrimary }}>
                                            {entry.series}
                                        </span>
                                        <span className="text-[0.8125rem] font-bold tabular-nums" style={{ color: safeTheme.colors.accent }}>
                                            {entry.weightLimit} lbs
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </GlassCard>
                    ) : (
                        <GlassCard theme={safeTheme} className="mt-1 rounded-[22px] p-6 text-center">
                            <p className="text-[0.8125rem] font-medium" style={{ color: safeTheme.colors.textPrimary }}>
                                No matching series
                            </p>
                        </GlassCard>
                    )}
                </div>
            )}
        </div>
    );
};
