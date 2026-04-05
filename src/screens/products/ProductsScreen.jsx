import React, {
    useState,
    useMemo,
    useCallback,
    useRef
} from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { SegmentedToggle } from '../../components/common/GroupedToggle.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import {
    List,
    Grid,
    ArrowRight,
    Package,
    ChevronRight
} from 'lucide-react';
import { PRODUCTS_CATEGORIES_DATA, PRODUCT_DATA, FABRICS_DATA, JSI_MODELS, JSI_SERIES } from './data.js';
import { usePersistentState } from '../../hooks/usePersistentState.js';

// ─── Clean card helpers ───────────────────────────────────────────────────────────────
const cardStyle = (dark) => ({
    backgroundColor: dark ? '#2A2A2A' : '#FFFFFF',
    border: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.06)',
    boxShadow: 'none',
});

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
                    ...cardStyle(dark),
                    padding: 0,
                }}
            >
                <div className="p-5 pb-3 min-h-[148px]">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                            {category.name}
                        </h2>
                        <ChevronRight className="w-5 h-5 opacity-40" style={{ color: theme.colors.textSecondary }} />
                    </div>
                    <div className="w-full md:max-w-[430px] ml-0 md:ml-auto grid grid-cols-3 gap-3">
                        {category.images?.map((img, i) => (
                            <div
                                key={i}
                                className="w-full h-[86px] rounded-2xl overflow-hidden"
                            >
                                <img
                                    src={img}
                                    alt={`${category.name} ${i + 1}`}
                                    className="w-full h-full object-contain object-center mix-blend-multiply scale-[1.04] hover:scale-[1.1] transition-transform duration-500"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                {category.description && (
                    <div
                        className="px-5 py-2.5 text-xs font-medium"
                        style={{
                            color: theme.colors.textSecondary,
                            borderTop: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.05)',
                        }}
                    >
                        {category.description}
                    </div>
                )}
            </div>
        );
    }

    // List view
    return (
        <div
            onClick={handleClick}
            className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${className}`}
            style={{ ...cardStyle(dark) }}
        >
            <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: 'transparent' }}
                    >
                        <img
                            src={category.images?.[0]}
                            alt={category.name}
                            className="w-full h-full object-contain mix-blend-multiply"
                            loading="lazy"
                        />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[15px]" style={{ color: theme.colors.textPrimary }}>
                            {category.name}
                        </h3>
                        {category.description && (
                            <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                                {category.description}
                            </p>
                        )}
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-40" style={{ color: theme.colors.textSecondary }} />
            </div>
        </div>
    );
});
CategoryCard.displayName = 'CategoryCard';

// ─── View mode toggle — glass button ─────────────────────────────────────────
const ViewModeToggle = React.memo(({ viewMode, onToggle, theme }) => {
    const dark = isDarkTheme(theme);
    const isGrid = viewMode === 'grid';
    const actionLabel = isGrid ? 'Switch to List' : 'Switch to Tiles';
    return (
        <button
            onClick={onToggle}
            className="h-12 px-4 rounded-full transition-all duration-200 active:scale-95 hover:scale-[1.02] inline-flex items-center gap-2.5"
            style={{
                ...cardStyle(dark),
                minWidth: 156,
            }}
            aria-label={actionLabel}
            title={actionLabel}
        >
            {isGrid ? <List className="w-4.5 h-4.5" style={{ color: theme.colors.textPrimary }} /> : <Grid className="w-4.5 h-4.5" style={{ color: theme.colors.textPrimary }} />}
            <span className="text-[12px] font-semibold leading-none whitespace-nowrap" style={{ color: theme.colors.textPrimary }}>
                {actionLabel}
            </span>
        </button>
    );
});
ViewModeToggle.displayName = 'ViewModeToggle';

// ─── Search header ──────────────────────────────────────────────────────────
const StickyHeader = React.memo(({
    theme,
    viewMode,
    onToggleViewMode,
    searchTerm,
    onSearchChange,
    placeholder,
    showViewToggle,
}) => (
    <div
        className="flex-shrink-0 px-4 sm:px-5 pt-4 pb-3"
        style={{ backgroundColor: theme.colors.background }}
    >
        <div className="flex items-center gap-3">
            <StandardSearchBar
                value={searchTerm}
                onChange={onSearchChange}
                placeholder={placeholder}
                theme={theme}
                className="flex-grow"
            />
            {showViewToggle && (
                <ViewModeToggle
                    viewMode={viewMode}
                    onToggle={onToggleViewMode}
                    theme={theme}
                />
            )}
        </div>
    </div>
));
StickyHeader.displayName = 'StickyHeader';

// ─── Empty state ────────────────────────────────────────────────────────────
const EmptyState = React.memo(({ searchTerm, theme, onClearSearch }) => {
    const dark = isDarkTheme(theme);
    return (
        <div className="rounded-[24px] p-10 text-center" style={{ ...cardStyle(dark) }}>
            <Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
            <p className="font-semibold text-lg mb-2" style={{ color: theme.colors.textPrimary }}>
                No Products Found
            </p>
            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                No products match "{searchTerm}"
            </p>
            <button
                type="button"
                onClick={onClearSearch}
                className="mt-4 px-4 py-2 rounded-full text-xs font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{
                    color: theme.colors.textPrimary,
                    border: `1px solid ${theme.colors.border}`,
                }}
            >
                Clear Search
            </button>
        </div>
    );
});
EmptyState.displayName = 'EmptyState';

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
            <span className="font-medium text-[15px] truncate" style={{ color: theme.colors.textPrimary }}>
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
            <div className="rounded-[24px] p-10 text-center" style={{ ...cardStyle(dark) }}>
                <Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
                <p className="font-semibold text-lg mb-2" style={{ color: theme.colors.textPrimary }}>
                    No Series Found
                </p>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    No series match "{searchTerm}"
                </p>
                <button
                    type="button"
                    onClick={onClearSearch}
                    className="mt-4 px-4 py-2 rounded-full text-xs font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    style={{
                        color: theme.colors.textPrimary,
                        border: `1px solid ${theme.colors.border}`,
                    }}
                >
                    Clear Search
                </button>
            </div>
        );
    }

    return (
        <div
            className="rounded-[20px] overflow-hidden"
            style={{
                backgroundColor: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
            }}
        >
            {groupedSeries.map(([letter, seriesList], gi) => (
                <div key={letter}>
                    {/* Letter section header */}
                    <div
                        className="px-4 py-1.5"
                        style={{
                            backgroundColor: dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.04)',
                            borderBottom: `1px solid ${theme.colors.border}`,
                        }}
                    >
                        <span
                            className="text-xs font-bold tracking-widest uppercase"
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
    const [viewMode, setViewMode] = usePersistentState('pref.products.viewMode', 'grid');
    const [productView, setProductView] = usePersistentState('pref.products.productView', 'categories');
    const scrollContainerRef = useRef(null);
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
            <div className="max-w-5xl mx-auto w-full">
                <StickyHeader
                    theme={theme}
                    viewMode={activeViewMode}
                    onToggleViewMode={toggleViewMode}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    placeholder={activeProductView === 'families' ? 'Search series...' : 'Search products...'}
                    showViewToggle={activeProductView !== 'families'}
                />
                <div className="px-4 sm:px-5 pb-3">
                    <SegmentedToggle
                        value={activeProductView}
                        onChange={handleViewChange}
                        options={productViewOptions}
                        theme={theme}
                        size="md"
                    />
                </div>
            </div>
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-4 sm:px-5 lg:px-8 pb-8 scrollbar-hide"
            >
                <div className="max-w-5xl mx-auto w-full">
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
                        <EmptyState searchTerm={searchTerm} theme={theme} onClearSearch={clearSearch} />
                    ) : (
                        <div className={activeViewMode === 'grid' ? 'grid grid-cols-1 xl:grid-cols-2 gap-4' : 'space-y-2'} style={{ paddingTop: 4 }}>
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
                </div>
            </div>
        </div>
    );
};
