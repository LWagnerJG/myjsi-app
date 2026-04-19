import React, {
    useState,
    useMemo,
    useCallback,
    useRef
} from 'react';
import { EmptyState as SharedEmptyState } from '../../components/common/EmptyState.jsx';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { SegmentedToggle } from '../../components/common/GroupedToggle.jsx';
import { TabContent } from '../../components/common/TabContent.jsx';
import { isDarkTheme, cardSurface } from '../../design-system/tokens.js';
import {
    List,
    Grid,
    Package,
    ChevronRight
} from 'lucide-react';
import { PRODUCTS_CATEGORIES_DATA, JSI_SERIES } from './data.js';
import { usePersistentState } from '../../hooks/usePersistentState.js';

// ─── Clean card helpers ───────────────────────────────────────────────────────────────
const cardStyle = (dark, theme) => cardSurface(theme || { colors: { surface: dark ? '#2A2A2A' : '#FFFFFF', border: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.03)' } });

const normalizeSeriesKey = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Curated family thumbnails for "Our Families" rows.
// Uses true cutout/white-space product imagery where available.
const SERIES_THUMBNAILS = Object.freeze({
    'addison': '/category-images/casegood-images/api_vision.jpg',
    'americana': '/category-images/swivel-images/api_americana.jpg',
    'ansen': '/category-images/guest-images/jsi_knox_comp_00020.jpg',
    'anthology': '/category-images/casegood-images/api_anthology.jpg',
    'arwyn': '/category-images/guest-images/jsi_arwyn_comp_00032.jpg',
    'avini': '/category-images/guest-images/jsi_avini_comp_00007.jpg',
    'bespace': '/category-images/lounge-images/api_bespace.jpg',
    'boston': '/category-images/swivel-images/api_boston.jpg',
    'bourne': '/category-images/guest-images/jsi_bourne_comp_00002_k6eFRce.jpg',
    'brogan': '/category-images/casegood-images/api_brogan.jpg',
    'bryn': '/category-images/guest-images/jsi_bryn_comp_00023.jpg',
    'caav': '/category-images/lounge-images/api_caav.jpg',
    'class act': '/category-images/swivel-images/api_protocol.jpg',
    'collective motion': '/category-images/guest-images/jsi_collectivemotion_comp_00014.jpg',
    'connect': '/category-images/training-images/api_connect.jpg',
    'copilot': '/category-images/swivel-images/api_proxy.jpg',
    'cosgrove': '/category-images/swivel-images/api_cosgrove.jpg',
    'draft': '/category-images/training-images/api_draft.jpg',
    'encore': '/category-images/lounge-images/api_boston.jpg',
    'finale': '/category-images/casegood-images/api_finale.jpg',
    'finn': '/category-images/lounge-images/api_finn.jpg',
    'finn nu': '/category-images/lounge-images/api_finn-nu.jpg',
    'flux': '/category-images/casegood-images/api_flux-private-office.jpg',
    'forge': '/category-images/bench-images/api_native.jpg',
    'garvey rs': '/category-images/swivel-images/api_garvey-r5.jpg',
    'gatsby': '/category-images/casegood-images/api_wellington.jpg',
    'harbor': '/category-images/guest-images/jsi_harbor_comp_00010_7pPSeR6.jpg',
    'henley': '/category-images/guest-images/jsi_henley_comp_00001.jpg',
    'hoopz': '/category-images/lounge-images/api_caav.jpg',
    'indie': '/category-images/lounge-images/api_indie.jpg',
    'jude': '/category-images/lounge-images/api_jude.jpg',
    'kindera': '/category-images/lounge-images/api_bourne.jpg',
    'knox': '/category-images/swivel-images/api_knox.jpg',
    'kyla': '/category-images/guest-images/jsi_harbor_comp_00010_7pPSeR6.jpg',
    'lincoln': '/category-images/casegood-images/api_walden.jpg',
    'lok': '/category-images/training-images/api_lok-training.jpg',
    'mackey': '/category-images/casegood-images/api_brogan.jpg',
    'madison': '/category-images/swivel-images/api_madison.jpg',
    'millie': '/category-images/guest-images/jsi_millie_comp_00005_g77W9GX.jpg',
    'mittle': '/category-images/guest-images/jsi_boston_comp_0007_jBfEUNr.jpg',
    'moto': '/category-images/conference-images/api_moto.jpg',
    'native': '/category-images/bench-images/api_native.jpg',
    'native benches': '/category-images/bench-images/api_native.jpg',
    'newton': '/category-images/swivel-images/api_newton.jpg',
    'nosh': '/category-images/training-images/api_nosh.jpg',
    'oxley': '/category-images/bench-images/api_oxley.jpg',
    'pillows': '/category-images/lounge-images/api_caav.jpg',
    'poet': '/category-images/lounge-images/api_poet.jpg',
    'privacy': '/category-images/training-images/api_connect.jpg',
    'prost': '/category-images/training-images/api_nosh.jpg',
    'protocol': '/category-images/swivel-images/api_protocol.jpg',
    'proxy': '/category-images/swivel-images/api_proxy.jpg',
    'ramona': '/category-images/guest-images/jsi_ramona_comp_rotation_ra2581f_00001.jpg',
    'reef': '/category-images/conference-images/api_reef.jpg',
    'ria': '/category-images/guest-images/jsi_ria_comp_00007.jpg',
    'romy': '/category-images/guest-images/jsi_ria_comp_00007.jpg',
    'satisse': '/category-images/lounge-images/api_satisse.jpg',
    'scroll': '/category-images/conference-images/api_reef.jpg',
    'somna': '/category-images/lounge-images/api_indie.jpg',
    'sosa': '/category-images/guest-images/jsi_sosa_comp_00020.jpg',
    'teekan': '/category-images/lounge-images/api_teekan.jpg',
    'totem': '/category-images/guest-images/jsi_totem_comp_00003.jpg',
    'trail': '/category-images/training-images/api_lok-training.jpg',
    'trinity': '/category-images/casegood-images/api_vision.jpg',
    'vision': '/category-images/casegood-images/api_vision.jpg',
    'walden': '/category-images/casegood-images/api_walden.jpg',
    'wellington': '/category-images/casegood-images/api_wellington.jpg',
    'wink': '/category-images/guest-images/jsi_wink_comp_00070.jpg',
    'ziva': '/category-images/conference-images/api_reef.jpg',
});

const getSeriesThumbnail = (series) => (
    SERIES_THUMBNAILS[normalizeSeriesKey(series)] || '/category-images/casegood-images/api_vision.jpg'
);

// ─── Category Card — glass surface ──────────────────────────────────────────
const CategoryCard = React.memo(({
    category,
    theme,
    viewMode,
    onClick,
    className = ''
}) => {
    const dark = isDarkTheme(theme);
    const handleClick = useCallback(() => onClick(category), [category, onClick]);

    if (viewMode === 'grid') {
        return (
            <div
                onClick={handleClick}
                className={`rounded-[24px] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${className}`}
                style={{
                    ...cardStyle(dark, theme),
                    padding: 0,
                }}
            >
                <div className="p-4 pb-3">
                    <div className="flex items-center justify-between mb-2.5">
                        <h2 className="text-[0.9375rem] font-semibold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                            {category.name}
                        </h2>
                        <ChevronRight className="w-4 h-4 opacity-30" style={{ color: theme.colors.textSecondary }} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {category.images?.slice(0, 2).map((img, i) => (
                            <div
                                key={i}
                                className="w-full aspect-[4/3] rounded-xl overflow-hidden"
                                style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}
                            >
                                <img
                                    src={img}
                                    alt={`${category.name} ${i + 1}`}
                                    className="w-full h-full object-contain object-center mix-blend-multiply hover:scale-[1.06] transition-transform duration-500"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={handleClick}
            className={`rounded-[24px] overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.005] active:scale-[0.99] ${className}`}
            style={{ ...cardStyle(dark, theme) }}
        >
            <div className="p-3 flex items-center gap-3.5">
                <div
                    className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}
                >
                    <img
                        src={category.images?.[0]}
                        alt={category.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                        loading="lazy"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[0.9375rem]" style={{ color: theme.colors.textPrimary }}>
                        {category.name}
                    </h3>
                    {category.description && (
                        <p className="text-[0.8125rem] mt-0.5" style={{ color: theme.colors.textSecondary }}>
                            {category.description}
                        </p>
                    )}
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-30" style={{ color: theme.colors.textSecondary }} />
            </div>
        </div>
    );
});
CategoryCard.displayName = 'CategoryCard';

// ─── View mode toggle — matches Orders' filter-row icon button (h-10 pill) ──
const ViewModeToggle = React.memo(({ viewMode, onToggle, theme }) => {
    const dark = isDarkTheme(theme);
    const isGrid = viewMode === 'grid';
    const actionLabel = isGrid ? 'Switch to List' : 'Switch to Tiles';
    return (
        <button
            onClick={onToggle}
            className="h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center active:scale-95 transition border"
            style={{
                backgroundColor: dark ? 'rgba(255,255,255,0.10)' : theme.colors.surface,
                borderColor: dark ? 'rgba(255,255,255,0.12)' : theme.colors.border,
            }}
            aria-label={actionLabel}
            title={actionLabel}
        >
            {isGrid
                ? <List className="w-[18px] h-[18px]" style={{ color: theme.colors.textPrimary }} />
                : <Grid className="w-[18px] h-[18px]" style={{ color: theme.colors.textPrimary }} />
            }
        </button>
    );
});
ViewModeToggle.displayName = 'ViewModeToggle';

// ─── Series Row ─────────────────────────────────────────────────────────────
const SeriesRow = React.memo(({ series, theme, isLast, onClick }) => (
    <button
        onClick={() => onClick(series)}
        className="w-full flex items-center justify-between px-4 md:px-5 py-3.5 md:py-4 text-left transition-colors hover:opacity-80 active:opacity-60"
        style={{
            backgroundColor: 'transparent',
            borderBottom: isLast ? 'none' : `1px solid ${theme.colors.border}`,
        }}
    >
        <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-9 md:w-14 md:h-10 flex-shrink-0 overflow-hidden">
                <img
                    src={getSeriesThumbnail(series)}
                    alt={series}
                    className="w-full h-full object-contain object-left mix-blend-multiply"
                    loading="lazy"
                />
            </div>
            <span className="font-medium text-[0.9375rem] truncate" style={{ color: theme.colors.textPrimary }}>
                {series}
            </span>
        </div>
        <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
    </button>
));
SeriesRow.displayName = 'SeriesRow';

// ─── Families (series) view ──────────────────────────────────────────────────
const FamiliesView = React.memo(({ groupedSeries, theme, onSeriesClick, searchTerm, onClearSearch }) => {
    const dark = isDarkTheme(theme);

    if (groupedSeries.length === 0) {
        return (
            <div className="rounded-[24px]" style={{ ...cardStyle(dark, theme) }}>
                <SharedEmptyState
                    icon={Package}
                    title="No series found"
                    description={`No series match "${searchTerm}".`}
                    action={{ label: 'Clear Search', onClick: onClearSearch }}
                    theme={theme}
                />
            </div>
        );
    }

    return (
        <div
            className="rounded-[24px] overflow-hidden"
            style={{
                ...cardStyle(dark, theme),
            }}
        >
            {groupedSeries.map(([letter, seriesList], gi) => (
                <div key={letter}>
                    <div
                        className="px-4 pt-2 pb-1.5"
                        style={{
                            backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)',
                            borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}`,
                        }}
                    >
                        <span
                            className="text-[0.6875rem] font-semibold tracking-wide uppercase leading-none"
                            style={{ color: theme.colors.accent }}
                        >
                            {letter}
                        </span>
                    </div>
                    {seriesList.map((s, si) => (
                        <SeriesRow
                            key={s}
                            series={s}
                            theme={theme}
                            dark={dark}
                            onClick={onSeriesClick}
                            isLast={si === seriesList.length - 1 && gi === groupedSeries.length - 1}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
});
FamiliesView.displayName = 'FamiliesView';

// ─── Main screen ────────────────────────────────────────────────────────────
export const ProductsScreen = ({ theme, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = usePersistentState('pref.products.viewMode', 'list');
    const [productView, setProductView] = usePersistentState('pref.products.productView', 'categories');
    const scrollContainerRef = useRef(null);
    const dark = isDarkTheme(theme);
    const bgRgb = dark ? '26,26,26' : '240,237,232';
    const activeViewMode = viewMode === 'list' ? 'list' : 'grid';
    const activeProductView = productView === 'families' ? 'families' : 'categories';

    const productViewOptions = [
        { value: 'categories', label: 'Categories' },
        { value: 'families', label: 'Our Families' }
    ];

    const filteredCategories = useMemo(() => {
        if (!searchTerm.trim()) return PRODUCTS_CATEGORIES_DATA || [];
        const lowerSearch = searchTerm.toLowerCase();
        return PRODUCTS_CATEGORIES_DATA.filter(category =>
            category.name.toLowerCase().includes(lowerSearch) ||
            category.description?.toLowerCase().includes(lowerSearch)
        );
    }, [searchTerm]);

    const groupedSeries = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase().trim();
        const filtered = lowerSearch
            ? JSI_SERIES.filter(s => s.toLowerCase().includes(lowerSearch))
            : JSI_SERIES;
        const groups = {};
        filtered.forEach(series => {
            const letter = series[0].toUpperCase();
            if (!groups[letter]) groups[letter] = [];
            groups[letter].push(series);
        });
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    }, [searchTerm]);

    const handleCategoryClick = useCallback((category) => {
        if (category.nav) onNavigate(category.nav);
    }, [onNavigate]);

    const handleSeriesClick = useCallback((series) => {
        const slug = series.toLowerCase().replace(/\s+/g, '-');
        onNavigate(`products/series/${slug}`);
    }, [onNavigate]);

    const toggleViewMode = useCallback(() => {
        setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'));
    }, [setViewMode]);

    const handleViewChange = useCallback((v) => {
        setProductView(v);
        setSearchTerm('');
    }, [setProductView]);

    const handleSearchChange = useCallback((valueOrEvent) => {
        const value = typeof valueOrEvent === 'string'
            ? valueOrEvent
            : valueOrEvent?.target?.value || '';
        setSearchTerm(value);
    }, []);

    const clearSearch = useCallback(() => setSearchTerm(''), []);

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto scrollbar-hide"
            >
                <div className="max-w-5xl mx-auto w-full">
                    <div className="sticky top-0 z-20" style={{ backgroundColor: theme.colors.background }}>
                        <div className="px-4 sm:px-5 pt-3 pb-2 flex flex-col gap-2.5">
                            <StandardSearchBar
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder={activeProductView === 'families' ? 'Search series...' : 'Search products...'}
                                theme={theme}
                            />
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <SegmentedToggle
                                        value={activeProductView}
                                        onChange={handleViewChange}
                                        options={productViewOptions}
                                        theme={theme}
                                        size="sm"
                                    />
                                </div>
                                {activeProductView !== 'families' && (
                                    <ViewModeToggle
                                        viewMode={activeViewMode}
                                        onToggle={toggleViewMode}
                                        theme={theme}
                                    />
                                )}
                            </div>
                        </div>
                        <div
                            aria-hidden="true"
                            className="pointer-events-none h-2"
                            style={{
                                backdropFilter: 'blur(4px) saturate(1.05)',
                                WebkitBackdropFilter: 'blur(4px) saturate(1.05)',
                                background: `linear-gradient(to bottom,
                                    rgba(${bgRgb},0.42) 0%,
                                    rgba(${bgRgb},0.18) 58%,
                                    rgba(${bgRgb},0.04) 84%,
                                    rgba(${bgRgb},0) 100%)`,
                            }}
                        />
                    </div>
                </div>

                <div className="px-4 sm:px-5 lg:px-8 pt-0 pb-8">
                    <div className="max-w-5xl mx-auto w-full">
                        <TabContent activeKey={activeProductView === 'families' ? 'families' : 'other'}>
                        {activeProductView === 'families' ? (
                            <div className="w-full mx-auto xl:max-w-[980px] 2xl:max-w-[920px]">
                                <FamiliesView
                                    groupedSeries={groupedSeries}
                                    theme={theme}
                                    onSeriesClick={handleSeriesClick}
                                    searchTerm={searchTerm}
                                    onClearSearch={clearSearch}
                                />
                            </div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="rounded-[24px]" style={{ ...cardStyle(isDarkTheme(theme), theme) }}>
                                <SharedEmptyState
                                    icon={Package}
                                    title="No products found"
                                    description={`No products match "${searchTerm}".`}
                                    action={{ label: 'Clear Search', onClick: clearSearch }}
                                    theme={theme}
                                />
                            </div>
                        ) : (
                            <div className={activeViewMode === 'grid' ? 'grid grid-cols-2 gap-2.5' : 'space-y-2'} style={{ paddingTop: 4 }}>
                                {filteredCategories.map((category) => (
                                    <CategoryCard
                                        key={category.name}
                                        category={category}
                                        theme={theme}
                                        viewMode={activeViewMode}
                                        onClick={handleCategoryClick}
                                        className={activeViewMode === 'grid' ? 'h-full' : ''}
                                    />
                                ))}
                            </div>
                        )}
                        </TabContent>
                    </div>
                </div>
            </div>
        </div>
    );
};
