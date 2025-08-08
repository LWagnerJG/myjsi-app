import React, { useState, useMemo, useCallback } from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Plus, ArrowRight, Package } from 'lucide-react';
import { PRODUCT_DATA } from './data.js';
import { PRODUCT_COMPARISON_CONSTANTS } from './comparison-data.js';

// Product selection tabs component - enhanced for better visual design
const ProductTabs = React.memo(({ 
    products, 
    activeProduct, 
    onProductSelect, 
    theme,
    categoryName
}) => {
    // Special sizing for Benches category
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

                {/* Add New Product Button */}
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

// Enhanced product hero section with large product image and pricing table
const ProductHero = React.memo(({ 
    product, 
    categoryData,
    theme, 
    categoryId, 
    onNavigate 
}) => {
    const handleCompetitionClick = useCallback(() => {
        onNavigate(`products/category/${categoryId}/competition`);
    }, [categoryId, onNavigate]);

    return (
        <div className="space-y-4">
            {/* Large product image */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg group">
                <img 
                    src={product.image} 
                    alt={product.name} 
                    loading="lazy"
                    className="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                {/* Product name overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                    <h2 className="text-3xl font-bold text-white mb-2">{product.name}</h2>
                    <p className="text-xl font-semibold text-white">
                        ${product.price?.toLocaleString() || 'TBD'}
                    </p>
                    <button
                        onClick={handleCompetitionClick}
                        className="flex items-center space-x-2 mt-3 px-4 py-2 rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-100 bg-white/20 backdrop-blur-sm text-white border border-white/30"
                    >
                        <span>Competition</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* JSI Products pricing table */}
            <GlassCard theme={theme} className="px-6 py-4 space-y-1">
                {/* Table Header */}
                <div className="grid grid-cols-2 gap-4 pb-2 text-sm font-semibold border-b" style={{ borderColor: theme.colors.border }}>
                    <div style={{ color: theme.colors.textSecondary }}>Series</div>
                    <div className="text-right" style={{ color: theme.colors.textSecondary }}>List $</div>
                </div>

                {/* Main product row (highlighted) */}
                <div className="grid grid-cols-2 gap-4 py-3 rounded-lg" style={{ backgroundColor: theme.colors.subtle }}>
                    <div className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                        {product.name}
                    </div>
                    <div className="font-bold text-lg text-right" style={{ color: theme.colors.accent }}>
                        ${product.price?.toLocaleString() || 'TBD'}
                    </div>
                </div>

                {/* Other products in category */}
                {categoryData.products
                    .filter(p => p.id !== product.id)
                    .map(otherProduct => (
                        <div key={otherProduct.id} className="grid grid-cols-2 gap-4 py-3 border-t" style={{ borderColor: theme.colors.border }}>
                            <div className="font-medium" style={{ color: theme.colors.textSecondary }}>
                                {otherProduct.name}
                            </div>
                            <div className="font-medium text-right" style={{ color: theme.colors.textSecondary }}>
                                ${otherProduct.price?.toLocaleString() || 'TBD'}
                            </div>
                        </div>
                    ))}
            </GlassCard>
        </div>
    );
});

ProductHero.displayName = 'ProductHero';

// Error boundary component
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

// Main product comparison screen - enhanced to match reference design
export const ProductComparisonScreen = ({ categoryId, onNavigate, theme }) => {
    const categoryData = PRODUCT_DATA?.[categoryId];
    const [activeProduct, setActiveProduct] = useState(categoryData?.products?.[0]);

    // Memoized handlers
    const handleProductSelect = useCallback((product) => {
        setActiveProduct(product);
    }, []);

    const handleBackToProducts = useCallback(() => {
        onNavigate('products');
    }, [onNavigate]);

    // Early return for invalid data
    if (!categoryData) {
        return (
            <ErrorState
                title="Category Not Found"
                message="The requested product category does not exist."
                onBack={handleBackToProducts}
                theme={theme}
            />
        );
    }

    return (
        <div className="flex flex-col h-full">
            <PageTitle title={categoryData.name} theme={theme} onBack={handleBackToProducts} />
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="p-4 space-y-4">
                    <ProductTabs
                        products={categoryData.products}
                        activeProduct={activeProduct}
                        onProductSelect={handleProductSelect}
                        theme={theme}
                        categoryName={categoryData.name}
                    />

                    <ProductHero
                        product={activeProduct}
                        categoryData={categoryData}
                        theme={theme}
                        categoryId={categoryId}
                        onNavigate={onNavigate}
                    />
                </div>
            </div>
        </div>
    );
};