import React, { useState, useMemo, useCallback } from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Plus, Package } from 'lucide-react';
import { PRODUCT_DATA } from './data.js';
import { PRODUCT_COMPARISON_CONSTANTS, COMPETITION_METRICS } from './comparison-data.js';

// Product selection tabs component (reused from comparison screen)
const ProductTabs = React.memo(({ 
    products, 
    activeProduct, 
    onProductSelect, 
    theme,
    categoryName
}) => {
    const isBenches = categoryName?.toLowerCase() === 'benches';
    const tabSize = isBenches ? PRODUCT_COMPARISON_CONSTANTS.TAB_SIZES.benches : PRODUCT_COMPARISON_CONSTANTS.TAB_SIZES.default;
    
    return (
        <GlassCard theme={theme} className="p-4">
            <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
                {products.map(product => (
                    <button
                        key={product.id}
                        onClick={() => onProductSelect(product)}
                        className={`flex-shrink-0 ${tabSize} rounded-2xl border-2 transition-all duration-150 p-1 overflow-hidden transform active:scale-95 ${
                            activeProduct.id === product.id 
                                ? 'border-blue-500' 
                                : 'border-transparent opacity-70'
                        } hover:opacity-100`}
                        style={{ backgroundColor: theme.colors.surface }}
                    >
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover rounded-xl scale-150" 
                        />
                    </button>
                ))}

                <button className={`flex-shrink-0 ${tabSize} rounded-2xl border-2 transition-all duration-150 p-1 overflow-hidden transform active:scale-95`} style={{ backgroundColor: theme.colors.subtle, borderColor: theme.colors.border }}>
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <Plus className="w-6 h-6" style={{ color: theme.colors.accent }} />
                        <span className="text-xs font-semibold" style={{ color: theme.colors.textPrimary }}>Add Product</span>
                    </div>
                </button>
            </div>
        </GlassCard>
    );
});

ProductTabs.displayName = 'ProductTabs';

// Competitive analysis metrics with advantage display
const CompetitiveMetrics = React.memo(({ 
    jsiProduct,
    categoryData,
    theme 
}) => {
    if (!categoryData.competition || categoryData.competition.length === 0) {
        return (
            <GlassCard theme={theme} className="p-8 text-center">
                <p style={{ color: theme.colors.textSecondary }}>
                    No competitive data available for this category.
                </p>
            </GlassCard>
        );
    }

    const AdvantageChip = ({ value }) => (
        <span className={`px-2.5 py-1 text-sm font-bold rounded-full ${
            value > 0 
                ? COMPETITION_METRICS.displayFormat.advantage.positive
                : COMPETITION_METRICS.displayFormat.advantage.negative
        }`}>
            {value > 0 ? `+${value}%` : `${value}%`}
        </span>
    );

    return (
        <GlassCard theme={theme} className="px-6 py-4 space-y-1">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 pb-2 text-sm font-semibold border-b" style={{ borderColor: theme.colors.border }}>
                <div style={{ color: theme.colors.textSecondary }}>Series</div>
                <div className="text-right" style={{ color: theme.colors.textSecondary }}>Laminate</div>
                <div className="text-right" style={{ color: theme.colors.textSecondary }}>Adv.</div>
            </div>

            {/* JSI Row (highlighted) */}
            <div className="grid grid-cols-3 gap-4 py-3 rounded-lg" style={{ backgroundColor: theme.colors.subtle }}>
                <div className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                    {jsiProduct.name}
                </div>
                <div className="font-bold text-lg text-right" style={{ color: theme.colors.textPrimary }}>
                    ${jsiProduct.price?.toLocaleString() || 'TBD'}
                </div>
                <div />
            </div>

            {/* Competitor Rows */}
            {categoryData.competition.map(competitor => (
                <div key={competitor.id} className="grid grid-cols-3 gap-4 py-3 border-t" style={{ borderColor: theme.colors.border }}>
                    <div className="font-medium" style={{ color: theme.colors.textSecondary }}>
                        {competitor.name}
                    </div>
                    <div className="font-medium text-right" style={{ color: theme.colors.textSecondary }}>
                        {competitor.laminate}
                    </div>
                    <div className="text-right">
                        <AdvantageChip value={parseInt(competitor.adv?.replace(/[^-\d]/g, '') || 0)} />
                    </div>
                </div>
            ))}
        </GlassCard>
    );
});

CompetitiveMetrics.displayName = 'CompetitiveMetrics';

// Error state component
const ErrorState = React.memo(({ 
    title = "Not Found", 
    message = "The requested item does not exist.", 
    onBack, 
    theme 
}) => (
    <div className="p-4">
        <PageTitle title={title} theme={theme} onBack={onBack} />
        <GlassCard theme={theme} className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
            <p style={{ color: theme.colors.textPrimary }}>{message}</p>
        </GlassCard>
    </div>
));

ErrorState.displayName = 'ErrorState';

// Enhanced competitive analysis screen
export const CompetitiveAnalysisScreen = ({ categoryId, onNavigate, theme }) => {
    const categoryData = PRODUCT_DATA?.[categoryId];
    const [activeProduct, setActiveProduct] = useState(categoryData?.products?.[0]);

    // Memoized handlers
    const handleProductSelect = useCallback((product) => {
        setActiveProduct(product);
    }, []);

    const handleBackToCategory = useCallback(() => {
        onNavigate(`products/category/${categoryId}`);
    }, [categoryId, onNavigate]);

    // Early return for invalid data
    if (!categoryData) {
        return (
            <ErrorState
                title="No Competition Data"
                message="No competitive analysis data available for this category."
                onBack={handleBackToCategory}
                theme={theme}
            />
        );
    }

    return (
        <div className="flex flex-col h-full">
            <PageTitle 
                title={`${categoryData.name} Analysis`} 
                theme={theme} 
                onBack={handleBackToCategory} 
            />
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="p-4 space-y-4">
                    <ProductTabs
                        products={categoryData.products}
                        activeProduct={activeProduct}
                        onProductSelect={handleProductSelect}
                        theme={theme}
                        categoryName={categoryData.name}
                    />

                    {/* Large product image */}
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg group">
                        <img 
                            src={activeProduct.image} 
                            alt={activeProduct.name} 
                            loading="lazy"
                            className="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                        />
                    </div>

                    <CompetitiveMetrics
                        jsiProduct={activeProduct}
                        categoryData={categoryData}
                        theme={theme}
                    />
                </div>
            </div>
        </div>
    );
};