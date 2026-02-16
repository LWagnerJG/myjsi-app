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
import { motion } from 'framer-motion';
import { PRODUCTS_CATEGORIES_DATA, PRODUCT_DATA, FABRICS_DATA, JSI_MODELS } from './data.js';

// ─── Clean card helpers ───────────────────────────────────────────────────────────────
const cardStyle = (dark) => ({
    backgroundColor: dark ? '#2A2A2A' : '#FFFFFF',
    border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
    boxShadow: 'none',
});

// ─── Category Card — glass surface ──────────────────────────────────────────
const CategoryCard = React.memo(({
    category,
    theme,
    viewMode,
    onClick,
    index = 0,
    className = ''
}) => {
    const dark = isDarkTheme(theme);
    const handleClick = useCallback(() => onClick(category), [category, onClick]);

    if (viewMode === 'grid') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.45, ease: [0.22, 0.8, 0.12, 0.99] }}
                onClick={handleClick}
                className={`rounded-[24px] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.015] active:scale-[0.985] ${className}`}
                style={{
                    ...cardStyle(dark),
                    padding: 0,
                }}
            >
                <div className="p-5 pb-3">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                            {category.name}
                        </h2>
                        <ChevronRight className="w-5 h-5 opacity-40" style={{ color: theme.colors.textSecondary }} />
                    </div>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide -mr-2">
                        {category.images?.map((img, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 w-[100px] h-[80px] rounded-2xl overflow-hidden"
                                style={{
                                    backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                                }}
                            >
                                <img
                                    src={img}
                                    alt={`${category.name} ${i + 1}`}
                                    className="w-full h-full object-cover object-center scale-[1.2] hover:scale-[1.3] transition-transform duration-500"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                {category.description && (
                    <div
                        className="px-5 py-2.5 text-[12px] font-medium"
                        style={{
                            color: theme.colors.textSecondary,
                            borderTop: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)',
                        }}
                    >
                        {category.description}
                    </div>
                )}
            </motion.div>
        );
    }

    // List view
    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35 }}
            onClick={handleClick}
            className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${className}`}
            style={{ ...cardStyle(dark) }}
        >
            <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}
                    >
                        <img
                            src={category.images?.[0]}
                            alt={category.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[15px]" style={{ color: theme.colors.textPrimary }}>
                            {category.name}
                        </h3>
                        {category.description && (
                            <p className="text-[11px] mt-0.5" style={{ color: theme.colors.textSecondary }}>
                                {category.description}
                            </p>
                        )}
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-40" style={{ color: theme.colors.textSecondary }} />
            </div>
        </motion.div>
    );
});
CategoryCard.displayName = 'CategoryCard';

// ─── View mode toggle — glass button ─────────────────────────────────────────
const ViewModeToggle = React.memo(({ viewMode, onToggle, theme }) => {
    const dark = isDarkTheme(theme);
    return (
        <button
            onClick={onToggle}
            className="p-3 rounded-full transition-all duration-200 active:scale-90 hover:scale-105"
            style={{
                ...cardStyle(dark),
                padding: '12px',
            }}
            aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
        >
            {viewMode === 'grid' ? (
                <List className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
            ) : (
                <Grid className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
            )}
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
    onSearchChange
}) => (
    <div
        className="flex-shrink-0 px-4 sm:px-5 pt-2 pb-3"
        style={{ backgroundColor: theme.colors.background }}
    >
        <div className="flex items-center gap-3">
            <StandardSearchBar
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Search products..."
                theme={theme}
                className="flex-grow"
            />
            <ViewModeToggle
                viewMode={viewMode}
                onToggle={onToggleViewMode}
                theme={theme}
            />
        </div>
    </div>
));
StickyHeader.displayName = 'StickyHeader';

// ─── Empty state ────────────────────────────────────────────────────────────
const EmptyState = React.memo(({ searchTerm, theme }) => {
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
        </div>
    );
});
EmptyState.displayName = 'EmptyState';

// ─── Main screen ────────────────────────────────────────────────────────────
export const ProductsScreen = ({ theme, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [productView, setProductView] = useState('categories');
    const scrollContainerRef = useRef(null);

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

    const handleCategoryClick = useCallback((category) => {
        if (category.nav) onNavigate(category.nav);
    }, [onNavigate]);

    const toggleViewMode = useCallback(() => {
        setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    }, []);

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    return (
        <div className="flex flex-col h-full app-header-offset">
            <div className="max-w-5xl mx-auto w-full">
                <StickyHeader
                    theme={theme}
                    viewMode={viewMode}
                    onToggleViewMode={toggleViewMode}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                />
                <div className="px-4 sm:px-5 pb-3">
                    <SegmentedToggle
                        value={productView}
                        onChange={setProductView}
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
                    {filteredCategories.length === 0 ? (
                        <EmptyState searchTerm={searchTerm} theme={theme} />
                    ) : (
                        <div className={viewMode === 'grid' ? 'space-y-4' : 'space-y-2'} style={{ paddingTop: 4 }}>
                            {filteredCategories.map((category, i) => (
                                <CategoryCard
                                    key={category.name}
                                    category={category}
                                    theme={theme}
                                    viewMode={viewMode}
                                    onClick={handleCategoryClick}
                                    index={i}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};