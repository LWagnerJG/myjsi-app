import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { Percent, Copy, Hourglass } from 'lucide-react';
import { SAMPLE_DISCOUNTS_DATA, DISCOUNT_CATEGORIES } from './data.js';

export const SampleDiscountsScreen = ({ theme, setSuccessMessage }) => {
    const [discounts, setDiscounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        const fetchDiscounts = async () => {
            const powerAutomateURL = import.meta.env.VITE_SAMPLE_DISCOUNTS_URL;
            if (!powerAutomateURL) {
                setDiscounts(SAMPLE_DISCOUNTS_DATA || []);
                setIsLoading(false);
                return;
            }
            try {
                let response;
                try {
                    response = await fetch(powerAutomateURL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
                } catch {
                    response = await fetch(powerAutomateURL, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
                }
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const txt = await response.text();
                let data; try { data = JSON.parse(txt); } catch { throw new Error('Bad JSON'); }
                if (Array.isArray(data)) setDiscounts(data);
                else if (data.value && Array.isArray(data.value)) setDiscounts(data.value);
                else if (data.body && Array.isArray(data.body)) setDiscounts(data.body);
                else if (data.d && Array.isArray(data.d)) setDiscounts(data.d);
                else if (data.results && Array.isArray(data.results)) setDiscounts(data.results);
                else setDiscounts(SAMPLE_DISCOUNTS_DATA || []);
            } catch (e) {
                setDiscounts(SAMPLE_DISCOUNTS_DATA || []);
                setError('Using local data');
            } finally { setIsLoading(false); }
        };
        fetchDiscounts();
    }, []);

    const handleCopy = useCallback((textToCopy) => {
        const doSet = (msg) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(''), 1200); };
        if (!navigator.clipboard) {
            try { const ta = document.createElement('textarea'); ta.value = textToCopy; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); doSet('SSA# Copied!'); } catch { doSet('Copy failed'); }
            return;
        }
        navigator.clipboard.writeText(textToCopy).then(() => doSet('SSA# Copied!')).catch(() => doSet('Copy failed'));
    }, [setSuccessMessage]);

    const categories = useMemo(() => DISCOUNT_CATEGORIES, []); // placeholder retained if filters added later

    const filteredDiscounts = useMemo(() => {
        let filtered = discounts;
        if (selectedCategory !== 'all') filtered = filtered.filter(i => i.category === selectedCategory);
        if (searchTerm) { const term = searchTerm.toLowerCase(); filtered = filtered.filter(i => (i.productLine || i.Title || '').toLowerCase().includes(term)); }
        return filtered;
    }, [discounts, selectedCategory, searchTerm]);

    if (isLoading) {
        return (
            <div className="flex flex-col h-full app-header-offset">
                <div className="flex-1 flex items-center justify-center">
                    <Hourglass className="w-8 h-8 animate-spin" style={{ color: theme.colors.accent }} />
                </div>
            </div>
        );
    }

    if (filteredDiscounts.length === 0) {
        return (
            <div className="flex flex-col h-full px-5 app-header-offset">
                <GlassCard theme={theme} className="p-6 text-center">
                    <Percent className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.accent }} />
                    <h3 className="font-bold text-lg mb-2" style={{ color: theme.colors.textPrimary }}>No Discounts Found</h3>
                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{searchTerm ? 'Try adjusting your search terms.' : 'No sample discounts available.'}</p>
                    {error && <p className="text-sm mt-2" style={{ color: '#dc2626' }}>{error}</p>}
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full app-header-offset">
            <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pb-6">
                <div className="space-y-3">{/* tighter spacing */}
                    {filteredDiscounts.map((discount) => {
                        const discountPercent = discount.Discount || discount.sampleDiscount;
                        const title = discount.Title || discount.productLine;
                        const ssaNumber = discount.SSANumber || discount.id;
                        const commissionInfoRaw = discount.CommissionInfo || discount.commissionInfo || '';
                        const isNoCommission = /no commission/i.test(commissionInfoRaw) || commissionInfoRaw === '';
                        const commissionDisplay = isNoCommission ? 'No commission' : commissionInfoRaw;
                        return (
                            <GlassCard key={ssaNumber || discount.id} theme={theme} className="relative p-5 flex items-stretch gap-5 rounded-[24px]">
                                {/* Copy button */}
                                {ssaNumber && (
                                    <button onClick={() => handleCopy(ssaNumber)} aria-label="Copy SSA" className="absolute top-2.5 right-2.5 p-2 rounded-full hover:scale-105 active:scale-95 transition bg-black/5 dark:bg-white/10">
                                        <Copy className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                    </button>
                                )}
                                {/* Discount block */}
                                <div className="flex-shrink-0 w-24 text-center flex flex-col justify-center">
                                    <p className="text-4xl font-extrabold tracking-tight leading-none" style={{ color: theme.colors.accent }}>{discountPercent}%</p>
                                    <p className="text-[10px] mt-1 font-semibold uppercase tracking-wide" style={{ color: theme.colors.textSecondary }}>Off List</p>
                                </div>
                                {/* Vertical divider (discrete) */}
                                <div className="w-px my-1" style={{ background: theme.colors.border, opacity: .35 }} />
                                {/* Details */}
                                <div className="flex-1 min-w-0 space-y-2 self-center">
                                    <h3 className="font-semibold text-[15px]" style={{ color: theme.colors.textPrimary }}>{title}</h3>
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                        {ssaNumber && (
                                            <span onClick={() => handleCopy(ssaNumber)} className="inline-flex items-center gap-1 px-2 py-1 rounded-full cursor-pointer select-none" style={{ background: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}>
                                                SSA {ssaNumber}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ background: theme.colors.accent + '14', color: theme.colors.textPrimary, border: `1px solid ${theme.colors.accent}33` }}>{commissionDisplay}</span>
                                    </div>
                                    {discount.description && (
                                        <p className="text-xs leading-snug" style={{ color: theme.colors.textSecondary }}>{discount.description}</p>
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