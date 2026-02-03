import React, {
    useState,
    useMemo,
    useCallback,
    useRef
} from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { SearchInput } from '../../components/common/SearchInput.jsx';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { SegmentedToggle } from '../../components/common/GroupedToggle.jsx';
import {
    List,
    Grid,
    ArrowRight,
    Package,
    Armchair,
    Filter
} from 'lucide-react';
import { PRODUCTS_CATEGORIES_DATA, PRODUCT_DATA, FABRICS_DATA, JSI_MODELS } from './data.js';

const CategoryCard = React.memo(({
    category,
    theme,
    viewMode,
    onClick,
    className = ''
}) => {
    const handleClick = useCallback(() => {
        onClick(category);
    }, [category, onClick]);

    if (viewMode === 'grid') {
        return (
            <GlassCard
                theme={theme}
                className={`p-4 overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${className}`}
                onClick={handleClick}
            >
                <h2 className="text-2xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
                    {category.name}
                </h2>
                <div className={`flex space-x-3 -mb-2 justify-end pr-2`}>
                    {category.images?.map((img, index) => (
                        <div key={index} className="overflow-hidden rounded-md w-24 h-20 flex-shrink-0 bg-neutral-100">
                            <img
                                src={img}
                                alt={`${category.name} example ${index + 1}`}
                                className="w-full h-full object-cover object-center scale-[1.25] hover:scale-[1.35] transition-transform duration-500"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </GlassCard>
        );
    }
    return (
        <GlassCard
            theme={theme}
            className={`p-3 cursor-pointer transform transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${className}`}
            onClick={handleClick}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <img
                        src={category.images?.[0]}
                        alt={category.name}
                        className="w-12 h-12 rounded-md object-cover"
                        loading="lazy"
                    />
                    <h3 className="font-semibold text-lg" style={{ color: theme.colors.textPrimary }}>
                        {category.name}
                    </h3>
                </div>
                <ArrowRight className="w-5 h-5" style={{ color: theme.colors.secondary }} />
            </div>
        </GlassCard>
    );
});
CategoryCard.displayName = 'CategoryCard';

const ViewModeToggle = React.memo(({ viewMode, onToggle, theme }) => (
    <button
        onClick={onToggle}
        className="p-3.5 rounded-full transition-all duration-200 transform active:scale-90"
        style={{
            backgroundColor: theme.colors.surface,
            border: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)'
        }}
        aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
    >
        {viewMode === 'grid' ? (
            <List className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
        ) : (
            <Grid className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
        )}
    </button>
));
ViewModeToggle.displayName = 'ViewModeToggle';

const StickyHeader = React.memo(({
    theme,
    viewMode,
    onToggleViewMode,
    searchTerm,
    onSearchChange
}) => (
    <div
        className="flex-shrink-0"
        style={{
            backgroundColor: theme.colors.background,
            padding: '8px 16px 16px 16px'
        }}
    >
        <div className="flex items-center space-x-3">
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

const EmptyState = React.memo(({ searchTerm, theme }) => (
    <GlassCard theme={theme} className="p-8 text-center">
        <Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
        <p className="font-semibold text-lg mb-2" style={{ color: theme.colors.textPrimary }}>
            No Products Found
        </p>
        <p style={{ color: theme.colors.textSecondary }}>
            No products match your search for "{searchTerm}"
        </p>
    </GlassCard>
));
EmptyState.displayName = 'EmptyState';

export const ProductsScreen = ({ theme, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [productView, setProductView] = useState('categories'); // 'categories' | 'families'
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
        if (category.nav) {
            onNavigate(category.nav);
        }
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
                {/* Categories / Families Toggle */}
                <div className="px-4 pb-4">
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
                className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-4 scrollbar-hide"
            >
                <div className="max-w-5xl mx-auto w-full">
                    {filteredCategories.length === 0 ? (
                        <EmptyState searchTerm={searchTerm} theme={theme} />
                    ) : (
                        <div className={viewMode === 'grid' ? 'space-y-6' : 'space-y-2'} style={{ paddingTop: '8px' }}>
                            {filteredCategories.map(category => (
                                <CategoryCard
                                    key={category.name}
                                    category={category}
                                    theme={theme}
                                    viewMode={viewMode}
                                    onClick={handleCategoryClick}
                                    className={category.name === 'Benches' ? 'mt-4' : ''}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};