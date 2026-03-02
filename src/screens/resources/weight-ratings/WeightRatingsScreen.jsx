import React, { useCallback, useMemo, useState } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import {
    ArrowLeft,
    ChevronRight,
    Download,
    ExternalLink,
    Scale,
    Share2
} from 'lucide-react';
import {
    WEIGHT_LIMIT_LBS,
    WEIGHT_RATINGS_BIFMA_POINTS,
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
    const [searchTerm, setSearchTerm] = useState('');

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
        const text = `${series.series} seating is rated up to ${WEIGHT_LIMIT_LBS} lbs and tested to applicable ANSI/BIFMA seating standards.`;

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
<div class="box">
<strong>Certification Summary</strong>
<p>JSI seating is tested to applicable ANSI/BIFMA seating standards for commercial use.</p>
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

    const DetailView = ({ series }) => (
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3 scrollbar-hide">
            <button
                type="button"
                onClick={goToList}
                className="mt-2 mb-1 inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: safeTheme.colors.textSecondary }}
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Weight Ratings
            </button>

            <GlassCard theme={safeTheme} className="p-4 rounded-3xl">
                <div className="flex items-center gap-4">
                    <img
                        src={series.image || WEIGHT_RATINGS_FALLBACK_IMAGE}
                        onError={imageFallback}
                        alt={series.series}
                        className="w-24 h-24 rounded-2xl object-cover"
                    />
                    <div className="min-w-0">
                        <h2 className="text-2xl font-bold leading-tight" style={{ color: safeTheme.colors.textPrimary }}>
                            {series.series}
                        </h2>
                        <div
                            className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                            style={{ backgroundColor: safeTheme.colors.subtle, color: safeTheme.colors.textPrimary }}
                        >
                            <Scale className="w-3.5 h-3.5" />
                            {WEIGHT_LIMIT_LBS} lbs (seating)
                        </div>
                    </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed" style={{ color: safeTheme.colors.textSecondary }}>
                    JSI tests seating to applicable ANSI/BIFMA requirements for commercial durability and safety.
                </p>

                <ul className="mt-3 space-y-1.5">
                    {WEIGHT_RATINGS_BIFMA_POINTS.map((point) => (
                        <li key={point} className="text-sm" style={{ color: safeTheme.colors.textSecondary }}>
                            • {point}
                        </li>
                    ))}
                </ul>

                <div className="mt-4 flex flex-wrap gap-2">
                    {WEIGHT_RATINGS_SOURCE_LINKS.map((link) => (
                        <a
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                            style={{
                                backgroundColor: safeTheme.colors.subtle,
                                color: safeTheme.colors.textSecondary,
                                border: `1px solid ${safeTheme.colors.border}`
                            }}
                        >
                            {link.label}
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    ))}
                </div>
            </GlassCard>

            <GlassCard theme={safeTheme} className="p-4 rounded-3xl">
                <h3 className="text-sm font-semibold" style={{ color: safeTheme.colors.textPrimary }}>
                    Share One-Pager
                </h3>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: safeTheme.colors.textSecondary }}>
                    Share now and print/save as PDF until a downloadable PDF is finalized.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => shareOnePager(series)}
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
                        style={{ backgroundColor: safeTheme.colors.accent, color: safeTheme.colors.accentText }}
                    >
                        <Share2 className="w-3.5 h-3.5" />
                        Share One-Pager
                    </button>
                    <button
                        type="button"
                        onClick={() => openPrintableOnePager(series)}
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold border"
                        style={{
                            borderColor: safeTheme.colors.border,
                            color: safeTheme.colors.textPrimary,
                            backgroundColor: safeTheme.colors.surface
                        }}
                    >
                        <Download className="w-3.5 h-3.5" />
                        Print / Save PDF
                    </button>
                </div>
            </GlassCard>
        </div>
    );

    if (selectedSlug && !selectedSeries) {
        return (
            <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: safeTheme.colors.background }}>
                <div className="flex-1 overflow-y-auto px-4 pb-6">
                    <GlassCard theme={safeTheme} className="mt-4 p-6 rounded-3xl text-center">
                        <p className="text-sm font-semibold" style={{ color: safeTheme.colors.textPrimary }}>
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
                    <GlassCard theme={safeTheme} className="p-4 rounded-3xl">
                        <h2 className="text-base font-bold" style={{ color: safeTheme.colors.textPrimary }}>
                            Seating Weight Ratings
                        </h2>
                        <p className="mt-1 text-xs" style={{ color: safeTheme.colors.textSecondary }}>
                            All listed seating series are rated to {WEIGHT_LIMIT_LBS} lbs. Casegoods are not included.
                        </p>
                    </GlassCard>

                    {filteredSeries.map((entry) => (
                        <button
                            key={entry.slug}
                            type="button"
                            onClick={() => openSeries(entry.slug)}
                            className="w-full"
                        >
                            <GlassCard theme={safeTheme} className="w-full px-4 py-3 rounded-3xl text-left">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={entry.image || WEIGHT_RATINGS_FALLBACK_IMAGE}
                                        onError={imageFallback}
                                        alt={entry.series}
                                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold truncate" style={{ color: safeTheme.colors.textPrimary }}>
                                            {entry.series}
                                        </h3>
                                    </div>
                                    <div className="text-right mr-1">
                                        <p className="text-[10px] uppercase tracking-wide" style={{ color: safeTheme.colors.textSecondary }}>
                                            Limit
                                        </p>
                                        <p className="text-sm font-semibold" style={{ color: safeTheme.colors.textPrimary }}>
                                            {entry.weightLimit} lbs
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: safeTheme.colors.textSecondary }} />
                                </div>
                            </GlassCard>
                        </button>
                    ))}

                    {filteredSeries.length === 0 && (
                        <GlassCard theme={safeTheme} className="p-6 rounded-3xl text-center">
                            <p className="text-sm font-medium" style={{ color: safeTheme.colors.textPrimary }}>
                                No matching series
                            </p>
                        </GlassCard>
                    )}
                </div>
            )}
        </div>
    );
};
