import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { PageTitle } from '../../../components/common/PageTitle.jsx';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { Percent, Clock, Package, CheckCircle, Copy, Hourglass } from 'lucide-react';
import { SAMPLE_DISCOUNTS_DATA, DISCOUNT_CATEGORIES, SAMPLE_DISCOUNT_RANGES } from './data.js';

export const SampleDiscountsScreen = ({ theme, setSuccessMessage }) => {
    const [discounts, setDiscounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        const fetchDiscounts = async () => {
            const powerAutomateURL = import.meta.env.VITE_SAMPLE_DISCOUNTS_URL;
            console.log("Power Automate URL:", powerAutomateURL);
            if (!powerAutomateURL) {
                console.error("Sample Discounts URL is not configured.");
                setDiscounts(SAMPLE_DISCOUNTS_DATA || []);
                setIsLoading(false);
                return;
            }
            try {
                let response;
                try {
                    response = await fetch(powerAutomateURL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({})
                    });
                } catch (err) {
                    console.log('First attempt failed, trying without body...');
                    response = await fetch(powerAutomateURL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                }
                console.log('Response status:', response.status);
                if (response.status === 401) {
                    throw new Error('Authentication failed. Please check API credentials.');
                }
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`HTTP error! status: ${response.status} - ${response.statusText}`);
                    throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
                }
                const responseText = await response.text();
                console.log('Raw response:', responseText);
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('Failed to parse JSON:', parseError);
                    throw new Error('Invalid JSON response from server');
                }
                console.log("Parsed API Response:", data);
                if (Array.isArray(data)) {
                    setDiscounts(data);
                } else if (data.value && Array.isArray(data.value)) {
                    setDiscounts(data.value);
                } else if (data.body && Array.isArray(data.body)) {
                    setDiscounts(data.body);
                } else if (data.d && Array.isArray(data.d)) {
                    setDiscounts(data.d);
                } else if (data.results && Array.isArray(data.results)) {
                    setDiscounts(data.results);
                } else {
                    console.log("Unexpected response format:", data);
                    setDiscounts(SAMPLE_DISCOUNTS_DATA || []);
                }
            } catch (e) {
                console.error("Failed to fetch discounts:", e);
                setDiscounts(SAMPLE_DISCOUNTS_DATA || []);
                if (e.message.includes('Authentication failed')) {
                    setError("Authentication error. Using local data.");
                } else if (e.message.includes('Failed to fetch')) {
                    setError("Network error. Using local data.");
                } else {
                    setError("Could not load API data. Using local data.");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchDiscounts();
    }, []);

    const handleCopy = useCallback((textToCopy) => {
        if (!navigator.clipboard) {
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setSuccessMessage("SSA# Copied!");
            setTimeout(() => setSuccessMessage(""), 1200);
            return;
        }
        navigator.clipboard.writeText(textToCopy).then(() => {
            setSuccessMessage("SSA# Copied!");
            setTimeout(() => setSuccessMessage(""), 1200);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            setSuccessMessage("Copy failed. Please try again.");
            setTimeout(() => setSuccessMessage(""), 1200);
        });
    }, [setSuccessMessage]);

    const categories = useMemo(() => DISCOUNT_CATEGORIES, []);

    const filteredDiscounts = useMemo(() => {
        let filtered = discounts;
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                (item.productLine || item.Title || '').toLowerCase().includes(term) ||
                (item.category || '').toLowerCase().includes(term) ||
                (item.description || '').toLowerCase().includes(term)
            );
        }
        return filtered;
    }, [discounts, selectedCategory, searchTerm]);

    if (isLoading) {
        return (
            <div className="flex flex-col h-full">
                <PageTitle title="Sample Discounts" theme={theme} />
                <div className="text-center p-8">
                    <Hourglass className="w-8 h-8 animate-spin mx-auto" style={{ color: theme.colors.accent }} />
                </div>
            </div>
        );
    }

    if (filteredDiscounts.length === 0) {
        return (
            <div className="flex flex-col h-full">
                <PageTitle title="Sample Discounts" theme={theme} />
                <div className="px-4 pb-4 space-y-4">
                    <GlassCard theme={theme} className="p-6 text-center">
                        <Percent className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.accent }} />
                        <h3 className="font-bold text-lg mb-2" style={{ color: theme.colors.textPrimary }}>
                            No Discounts Found
                        </h3>
                        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                            {searchTerm ? 'Try adjusting your search terms.' : 'No sample discounts available.'}
                        </p>
                        {error && (
                            <p className="text-sm mt-2" style={{ color: '#dc2626' }}>
                                {error}
                            </p>
                        )}
                    </GlassCard>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <PageTitle title="Sample Discounts" theme={theme} />
            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-6 pb-6">
                <div className="space-y-6">
                    {filteredDiscounts.map((discount) => {
                        const discountPercent = discount.Discount || discount.sampleDiscount;
                        const title = discount.Title || discount.productLine;
                        const ssaNumber = discount.SSANumber || discount.id;
                        const commissionInfo = discount.CommissionInfo ||
                            `${discount.leadTime || 0} weeks lead time • Min qty: ${discount.minOrderQty || 1}`;
                        return (
                            <GlassCard key={ssaNumber || discount.id} theme={theme} className="p-5 flex items-center space-x-5 rounded-2xl shadow-md">
                                <div className="flex-shrink-0 w-20 text-center">
                                    <p className="text-4xl font-bold" style={{ color: theme.colors.accent }}>
                                        {discountPercent}%
                                    </p>
                                    <p className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>
                                        Off List
                                    </p>
                                </div>
                                <div className="flex-1 space-y-2 border-l pl-5" style={{ borderColor: theme.colors.subtle }}>
                                    <h3 className="font-bold text-base text-center" style={{ color: theme.colors.textPrimary }}>
                                        {title}
                                    </h3>
                                    {ssaNumber && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium" style={{ color: theme.colors.textPrimary }}>
                                                SSA: {ssaNumber}
                                            </span>
                                            <button
                                                onClick={() => handleCopy(ssaNumber)}
                                                className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 ml-2 transition-colors"
                                                aria-label="Copy SSA Number"
                                            >
                                                <Copy className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="text-sm text-center" style={{ color: theme.colors.textSecondary }}>
                                        {commissionInfo}
                                    </div>
                                    {discount.description && (
                                        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                            {discount.description}
                                        </p>
                                    )}
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};