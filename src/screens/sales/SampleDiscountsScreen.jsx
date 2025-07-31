import React, { useState, useMemo } from 'react';
import { PageTitle } from '../../components/common/PageTitle';
import { GlassCard } from '../../components/common/GlassCard';
import { ToggleButtonGroup } from '../../components/common/ToggleButtonGroup';
import { Search, Package } from 'lucide-react';
import { SAMPLE_DISCOUNTS_DATA } from '../../data';

export const SampleDiscountsScreen = ({ theme }) => {
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = useMemo(() => {
        const cats = [...new Set(SAMPLE_DISCOUNTS_DATA.map(item => item.category))];
        return [{ label: 'All Categories', value: 'all' }, ...cats.map(cat => ({ label: cat, value: cat }))];
    }, []);

    const filteredItems = useMemo(() => {
        let items = SAMPLE_DISCOUNTS_DATA;
        
        if (selectedCategory !== 'all') {
            items = items.filter(item => item.category === selectedCategory);
        }
        
        if (searchQuery) {
            items = items.filter(item => 
                item.productLine.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        return items;
    }, [selectedCategory, searchQuery]);

    const DiscountCard = ({ item, theme }) => (
        <GlassCard theme={theme} className="p-4">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                        {item.productLine}
                    </h3>
                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                        {item.category}
                    </p>
                </div>
                <Package className="w-6 h-6 ml-2" style={{ color: theme.colors.accent }} />
            </div>
            
            <p className="text-sm mb-4" style={{ color: theme.colors.textPrimary }}>
                {item.description}
            </p>
            
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
                            Standard Discount
                        </p>
                        <p className="text-lg font-bold" style={{ color: theme.colors.accent }}>
                            {item.standardDiscount}%
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
                            Sample Discount
                        </p>
                        <p className="text-lg font-bold" style={{ color: theme.colors.secondary }}>
                            {item.sampleDiscount}%
                        </p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
                            Min Order Qty
                        </p>
                        <p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
                            {item.minOrderQty} units
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
                            Lead Time
                        </p>
                        <p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
                            {item.leadTime} days
                        </p>
                    </div>
                </div>
                
                <div className="pt-3 border-t" style={{ borderColor: theme.colors.border }}>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>
                            Status
                        </span>
                        <span 
                            className="px-2 py-1 rounded-full text-xs font-bold"
                            style={{
                                backgroundColor: item.active ? '#dcfce7' : '#fee2e2',
                                color: item.active ? '#16a34a' : '#dc2626'
                            }}
                        >
                            {item.active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>
                            Valid Until
                        </span>
                        <span className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
                            {new Date(item.validUntil).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
        </GlassCard>
    );

    const DiscountTable = ({ items, theme }) => (
        <GlassCard theme={theme} className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b" style={{ borderColor: theme.colors.border }}>
                            <th className="text-left p-4 font-semibold" style={{ color: theme.colors.textSecondary }}>
                                Product Line
                            </th>
                            <th className="text-left p-4 font-semibold" style={{ color: theme.colors.textSecondary }}>
                                Category
                            </th>
                            <th className="text-right p-4 font-semibold" style={{ color: theme.colors.textSecondary }}>
                                Standard %
                            </th>
                            <th className="text-right p-4 font-semibold" style={{ color: theme.colors.textSecondary }}>
                                Sample %
                            </th>
                            <th className="text-right p-4 font-semibold" style={{ color: theme.colors.textSecondary }}>
                                Min Qty
                            </th>
                            <th className="text-right p-4 font-semibold" style={{ color: theme.colors.textSecondary }}>
                                Lead Time
                            </th>
                            <th className="text-center p-4 font-semibold" style={{ color: theme.colors.textSecondary }}>
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: theme.colors.subtle }}>
                                <td className="p-4">
                                    <div className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                                        {item.productLine}
                                    </div>
                                    <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                        {item.description}
                                    </div>
                                </td>
                                <td className="p-4" style={{ color: theme.colors.textPrimary }}>
                                    {item.category}
                                </td>
                                <td className="p-4 text-right font-semibold" style={{ color: theme.colors.accent }}>
                                    {item.standardDiscount}%
                                </td>
                                <td className="p-4 text-right font-semibold" style={{ color: theme.colors.secondary }}>
                                    {item.sampleDiscount}%
                                </td>
                                <td className="p-4 text-right" style={{ color: theme.colors.textPrimary }}>
                                    {item.minOrderQty}
                                </td>
                                <td className="p-4 text-right" style={{ color: theme.colors.textPrimary }}>
                                    {item.leadTime}d
                                </td>
                                <td className="p-4 text-center">
                                    <span 
                                        className="px-2 py-1 rounded-full text-xs font-bold"
                                        style={{
                                            backgroundColor: item.active ? '#dcfce7' : '#fee2e2',
                                            color: item.active ? '#16a34a' : '#dc2626'
                                        }}
                                    >
                                        {item.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );

    return (
        <>
            <PageTitle title="Sample Discounts" theme={theme}>
                <div className="flex items-center space-x-4">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 rounded-lg border text-sm"
                        style={{
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border,
                            color: theme.colors.textPrimary
                        }}
                    >
                        {categories.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ToggleButtonGroup
                        value={viewMode}
                        onChange={setViewMode}
                        options={[
                            { label: 'Grid', value: 'grid' },
                            { label: 'Table', value: 'table' }
                        ]}
                        theme={theme}
                    />
                </div>
            </PageTitle>

            <div className="px-4 space-y-4 pb-4">
                {/* Search Bar */}
                <GlassCard theme={theme} className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                        <input
                            type="text"
                            placeholder="Search product lines, categories, or descriptions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                            style={{
                                backgroundColor: theme.colors.subtle,
                                borderColor: theme.colors.border,
                                color: theme.colors.textPrimary
                            }}
                        />
                    </div>
                </GlassCard>

                {/* Results */}
                {filteredItems.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredItems.map((item) => (
                                <DiscountCard key={item.id} item={item} theme={theme} />
                            ))}
                        </div>
                    ) : (
                        <DiscountTable items={filteredItems} theme={theme} />
                    )
                ) : (
                    <GlassCard theme={theme} className="p-8 text-center">
                        <Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
                        <p style={{ color: theme.colors.textPrimary }}>
                            No sample discounts found matching your criteria.
                        </p>
                    </GlassCard>
                )}
            </div>
        </>
    );
};