import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { isDarkTheme, subtleBg } from '../../../design-system/tokens.js';
import { JSIActionButton, JSIActionButtonGroup } from '../../../components/common/JSIButtons.jsx';
import {
    ChevronDown,
    Download,
    ExternalLink,
    Scale,
    Share2,
} from 'lucide-react';
import { useCompanyResource } from '../../../hooks/useCompanyResource.js';
import { LEAD_TIMES_DATA } from '../lead-times/data.js';
import { getLeadTimeImageSources } from '../lead-times/cloudinaryImages.js';
import {
    createWeightRatingsSeries,
    toWeightRatingSlug,
    WEIGHT_FAILURE_TEST_LBS,
    WEIGHT_LIMIT_LBS,
    WEIGHT_RATINGS_BIFMA_POINTS,
    WEIGHT_RATINGS_CERTIFICATION_NOTE,
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

const getRouteSeriesSlug = (currentScreen) => {
    if (!currentScreen) return null;
    const parts = currentScreen.split('/');
    if (parts[0] !== 'resources' || parts[1] !== 'weight-ratings') return null;
    return parts[2] || null;
};

const getOnePagerUrl = (slug) => `${window.location.origin}/${WEIGHT_RATINGS_ROUTE}/${slug}`;

const normalizeEntry = (entry) => {
    const series = String(entry?.series || '').trim();
    return {
        ...entry,
        series,
        slug: entry?.slug || toWeightRatingSlug(series),
        weightLimit: entry?.weightLimit || WEIGHT_LIMIT_LBS,
        failureTestLbs: entry?.failureTestLbs || WEIGHT_FAILURE_TEST_LBS,
        supportedTypes: Array.isArray(entry?.supportedTypes) && entry.supportedTypes.length ? entry.supportedTypes : ['Seating'],
        certificationNote: entry?.certificationNote || WEIGHT_RATINGS_CERTIFICATION_NOTE,
    };
};

const WeightRatingImage = ({ entry, theme, isDark, className = 'w-11 h-11 rounded-xl' }) => {
    const imageSources = getLeadTimeImageSources(entry, entry.series);
    const sourceKey = imageSources.join('|');
    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
        setImageIndex(0);
    }, [sourceKey]);

    const imageSrc = imageSources[imageIndex];

    return (
        <div
            className={`${className} overflow-hidden flex items-center justify-center flex-shrink-0`}
            style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : subtleBg(theme, 1.45),
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.04)'
            }}
        >
            {imageSrc ? (
                <img
                    src={imageSrc}
                    onError={() => setImageIndex((index) => index + 1)}
                    alt={entry.series}
                    loading="lazy"
                    className="w-full h-full object-contain"
                    style={isDark ? { filter: 'brightness(0.92) contrast(1.04)' } : undefined}
                />
            ) : (
                <Scale className="w-5 h-5 opacity-35" style={{ color: theme.colors.textSecondary }} aria-hidden="true" />
            )}
        </div>
    );
};

const MetricBlock = ({ label, value, accent, theme }) => (
    <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: subtleBg(theme, 1.55) }}>
        <p className="text-[0.625rem] font-bold uppercase tracking-[0.08em] mb-1" style={{ color: theme.colors.textSecondary, opacity: 0.48 }}>
            {label}
        </p>
        <p className="text-[1.15rem] font-black tabular-nums leading-none" style={{ color: accent ? theme.colors.accent : theme.colors.textPrimary }}>
            {value}
        </p>
    </div>
);

const WeightRatingDetails = ({
    entry,
    theme,
    dividerColor,
    openPrintableOnePager,
    shareOnePager,
    isDark
}) => (
    <div className="px-4 pb-4">
        <div
            className="rounded-2xl px-4 py-4 space-y-4"
            style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.035)' : 'rgba(250,249,246,0.9)',
                border: `1px solid ${theme.colors.border}`
            }}
        >
            <div className="flex items-start gap-3">
                <WeightRatingImage entry={entry} theme={theme} isDark={isDark} className="w-16 h-16 rounded-2xl" />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {entry.supportedTypes.map((type) => (
                            <span
                                key={type}
                                className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.625rem] font-semibold"
                                style={{ backgroundColor: subtleBg(theme, 1.7), color: theme.colors.textSecondary }}
                            >
                                {type}
                            </span>
                        ))}
                    </div>
                    <p className="text-[0.8125rem] leading-relaxed" style={{ color: theme.colors.textPrimary }}>
                        {entry.certificationNote}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <MetricBlock label="Published" value={`${entry.weightLimit} lbs`} theme={theme} />
                <MetricBlock label="Internal" value={`${entry.failureTestLbs}+ lbs`} accent theme={theme} />
            </div>

            <div className="space-y-2">
                {WEIGHT_RATINGS_BIFMA_POINTS.map((point, index) => (
                    <div key={point} className="flex items-start gap-2.5">
                        <span
                            className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[0.625rem] font-bold"
                            style={{ backgroundColor: subtleBg(theme, 1.8), color: theme.colors.textSecondary }}
                        >
                            {index + 1}
                        </span>
                        <p className="text-[0.75rem] leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                            {point}
                        </p>
                    </div>
                ))}
            </div>

            <JSIActionButtonGroup>
                <JSIActionButton
                    type="button"
                    onClick={() => shareOnePager(entry)}
                    theme={theme}
                    icon={<Share2 className="w-3.5 h-3.5" />}
                >
                    Share
                </JSIActionButton>
                <JSIActionButton
                    type="button"
                    onClick={() => openPrintableOnePager(entry)}
                    theme={theme}
                    icon={<Download className="w-3.5 h-3.5" />}
                >
                    PDF
                </JSIActionButton>
            </JSIActionButtonGroup>

            <div style={{ borderTop: `1px solid ${dividerColor}` }}>
                {WEIGHT_RATINGS_SOURCE_LINKS.map((link, index) => (
                    <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-3 py-3"
                        style={{ borderTop: index > 0 ? `1px solid ${dividerColor}` : 'none' }}
                    >
                        <span className="text-[0.75rem] font-semibold" style={{ color: theme.colors.textPrimary }}>
                            {link.label}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
                    </a>
                ))}
            </div>
        </div>
    </div>
);

export const WeightRatingsScreen = ({
    theme = {},
    currentScreen,
    initialSeriesSlug,
    setSuccessMessage
}) => {
    const safeTheme = ensureTheme(theme);
    const isDark = isDarkTheme(theme);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: leadTimesData } = useCompanyResource('lead-times', LEAD_TIMES_DATA);
    const fallbackSeries = useMemo(() => createWeightRatingsSeries(leadTimesData), [leadTimesData]);
    const { data: liveWeightRatingsData } = useCompanyResource('weight-ratings', fallbackSeries.length ? fallbackSeries : WEIGHT_RATINGS_SERIES);

    const seriesList = useMemo(
        () => (Array.isArray(liveWeightRatingsData) ? liveWeightRatingsData.map(normalizeEntry).filter((entry) => entry.series) : []),
        [liveWeightRatingsData]
    );

    const routeExpandedSlug = useMemo(() => {
        if (initialSeriesSlug) return initialSeriesSlug;
        return getRouteSeriesSlug(currentScreen);
    }, [currentScreen, initialSeriesSlug]);
    const [expandedSlug, setExpandedSlug] = useState(routeExpandedSlug || null);

    useEffect(() => {
        setExpandedSlug(routeExpandedSlug || null);
    }, [routeExpandedSlug]);

    const dividerColor = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.05)';

    const feedback = useCallback((message) => {
        if (!setSuccessMessage) return;
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 1600);
    }, [setSuccessMessage]);

    const filteredSeries = useMemo(() => {
        if (!searchTerm.trim()) return seriesList;
        const q = searchTerm.toLowerCase();
        return seriesList.filter((entry) => entry.series.toLowerCase().includes(q));
    }, [searchTerm, seriesList]);

    const toggleSeries = useCallback((slug) => {
        setExpandedSlug((current) => (current === slug ? null : slug));
    }, []);

    const shareOnePager = useCallback(async (series) => {
        const url = getOnePagerUrl(series.slug);
        const title = `${series.series} Weight Rating`;
        const text = `${series.series} seating is rated to ${series.weightLimit} lbs for applicable ANSI/BIFMA commercial seating standards.`;

        if (navigator.share) {
            try {
                await navigator.share({ title, text, url });
                feedback('Weight rating shared');
                return;
            } catch (_) {
                // Clipboard fallback below.
            }
        }

        try {
            await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
            feedback('Weight rating copied');
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
<title>${series.series} Weight Rating</title>
<style>
body { font-family: Arial, sans-serif; color: #222; margin: 32px; }
h1 { margin: 0 0 8px; font-size: 28px; }
h2 { margin: 0; font-size: 18px; color: #555; }
.badge { display: inline-block; margin: 16px 8px 0 0; padding: 10px 16px; border-radius: 999px; background: #f2efe8; font-weight: 700; }
.box { margin-top: 24px; border: 1px solid #ddd; border-radius: 12px; padding: 16px; }
ul { margin: 8px 0 0; padding-left: 20px; }
li { margin-bottom: 6px; }
.meta { margin-top: 24px; color: #666; font-size: 12px; }
</style>
</head>
<body>
<h1>${series.series}</h1>
<h2>JSI Seating Weight Rating</h2>
<div class="badge">Published Rating: ${series.weightLimit} lbs</div>
<div class="badge">Internal Validation: ${series.failureTestLbs}+ lbs</div>
<div class="box">
<strong>Certification Summary</strong>
<p>${series.certificationNote}</p>
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

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: safeTheme.colors.background }}>
            <div className="px-4 pt-3 pb-2">
                <StandardSearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search seating series..."
                    theme={safeTheme}
                    aria-label="Search seating series"
                />
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6 pt-1 scrollbar-hide">
                {filteredSeries.length > 0 ? (
                    <GlassCard theme={safeTheme} className="rounded-[22px] overflow-hidden mt-1">
                        <div
                            className="grid grid-cols-[1fr_auto] items-center px-4 py-2.5"
                            style={{ borderBottom: `1px solid ${safeTheme.colors.border}` }}
                        >
                            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.08em]" style={{ color: safeTheme.colors.textSecondary, opacity: 0.5 }}>
                                Series
                            </span>
                            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.08em]" style={{ color: safeTheme.colors.textSecondary, opacity: 0.5 }}>
                                Rating
                            </span>
                        </div>

                        {filteredSeries.map((entry, index) => {
                            const expanded = expandedSlug === entry.slug;
                            return (
                                <div
                                    key={entry.slug}
                                    style={{ borderTop: index > 0 ? `1px solid ${dividerColor}` : 'none' }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleSeries(entry.slug)}
                                        className="w-full text-left px-4 py-3 transition-colors"
                                        aria-expanded={expanded}
                                    >
                                        <div className="flex items-center gap-3">
                                            <WeightRatingImage entry={entry} theme={safeTheme} isDark={isDark} />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[0.875rem] font-semibold truncate" style={{ color: safeTheme.colors.textPrimary }}>
                                                    {entry.series}
                                                </p>
                                                <p className="mt-0.5 text-[0.6875rem] truncate" style={{ color: safeTheme.colors.textSecondary, opacity: 0.68 }}>
                                                    {entry.supportedTypes.join(' / ')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[0.875rem] font-black tabular-nums whitespace-nowrap" style={{ color: safeTheme.colors.accent }}>
                                                    {entry.weightLimit} lbs
                                                </span>
                                                <ChevronDown
                                                    className="w-4 h-4 transition-transform"
                                                    style={{
                                                        color: safeTheme.colors.textSecondary,
                                                        opacity: 0.55,
                                                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </button>
                                    {expanded && (
                                        <WeightRatingDetails
                                            entry={entry}
                                            theme={safeTheme}
                                            dividerColor={dividerColor}
                                            openPrintableOnePager={openPrintableOnePager}
                                            shareOnePager={shareOnePager}
                                            isDark={isDark}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </GlassCard>
                ) : (
                    <GlassCard theme={safeTheme} className="mt-1 rounded-[22px] p-6 text-center">
                        <p className="text-[0.8125rem] font-medium" style={{ color: safeTheme.colors.textPrimary }}>
                            No matching series
                        </p>
                    </GlassCard>
                )}
            </div>
        </div>
    );
};
