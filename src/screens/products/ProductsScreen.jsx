import React, {
    useState,
    useMemo,
    useCallback,
    useRef,
    useEffect,
    useLayoutEffect
} from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { SearchInput } from '../../components/common/SearchInput.jsx';
import {
    List,
    BarChart2,
    ArrowRight,
    Package,
    Armchair,
    Grid,
    Filter
} from 'lucide-react';
import * as Data from '../../data.jsx';

// Memoized category card component for better performance
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
                <div className="flex space-x-2 -mb-2">
                    {category.images?.map((img, index) => (
                        <img
                            key={index}
                            src={img}
                            alt={`${category.name} example ${index + 1}`}
                            className={`rounded-md object-cover transition-opacity ${category.images.length === 1 && category.name !== 'Swivels'
                                    ? 'w-2/3 h-32'
                                    : 'w-16 h-16'
                                }`}
                            loading="lazy"
                        />
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

// Toggle button component
const ViewModeToggle = React.memo(({ viewMode, onToggle, theme }) => (
    <button
        onClick={onToggle}
        className="p-2 rounded-lg transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5 transform active:scale-95"
        style={{ backgroundColor: theme.colors.subtle }}
        aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
    >
        {viewMode === 'grid' ? (
            <List className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
        ) : (
            <BarChart2 className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
        )}
    </button>
));
ViewModeToggle.displayName = 'ViewModeToggle';

// Sticky header component
const StickyHeader = React.memo(({
    isScrolled,
    theme,
    viewMode,
    onToggleViewMode,
    searchTerm,
    onSearchChange
}) => (
    <div
        className={`sticky top-0 z-10 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''
            }`}
        style={{
            backgroundColor: isScrolled ? `${theme.colors.background}e0` : 'transparent',
            backdropFilter: isScrolled ? 'blur(12px)' : 'none',
            WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
            borderBottom: `1px solid ${isScrolled ? theme.colors.border + '40' : 'transparent'}`,
        }}
    >
        <div className="p-4 flex items-center space-x-2">
            <SearchInput
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Search products..."
                theme={theme}
                className="flex-grow rounded-full"
                style={{ borderRadius: '50px' }}
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

// Empty state component
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
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollContainerRef = useRef(null);

    // Scroll handler with throttling for better performance
    const handleScroll = useCallback(() => {
        if (scrollContainerRef.current) {
            setIsScrolled(scrollContainerRef.current.scrollTop > 10);
        }
    }, []);

    // Memoized filtered categories with better search logic
    const filteredCategories = useMemo(() => {
        if (!searchTerm.trim()) return Data.PRODUCTS_CATEGORIES_DATA || [];

        const lowerSearch = searchTerm.toLowerCase();
        return Data.PRODUCTS_CATEGORIES_DATA.filter(category =>
            category.name.toLowerCase().includes(lowerSearch) ||
            category.description?.toLowerCase().includes(lowerSearch)
        );
    }, [searchTerm]);

    // Optimized category click handler
    const handleCategoryClick = useCallback((category) => {
        if (category.nav) {
            onNavigate(category.nav);
        }
    }, [onNavigate]);

    // View mode toggle handler
    const toggleViewMode = useCallback(() => {
        setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    }, []);

    // Search input change handler
    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    return (
        <div className="flex flex-col h-full">
            <StickyHeader
                isScrolled={isScrolled}
                theme={theme}
                viewMode={viewMode}
                onToggleViewMode={toggleViewMode}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
            />
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide"
            >
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
    );
};