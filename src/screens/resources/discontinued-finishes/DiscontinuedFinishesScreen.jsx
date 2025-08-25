import React, { useState, useMemo, useEffect } from 'react';
// Removed PageTitle import per requirement to hide header
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { SearchInput } from '../../../components/common/SearchInput.jsx';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { Modal } from '../../../components/common/Modal.jsx';
import { ArrowRight, Hourglass } from 'lucide-react';
import { DISCONTINUED_FINISHES } from './data.js';
// Import samples data to map new finishes to real sample products
import { SAMPLE_PRODUCTS } from '../../samples/data.js';

export const DiscontinuedFinishesScreen = ({ theme, onNavigate, onUpdateCart }) => {
    const [finishes, setFinishes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFinish, setSelectedFinish] = useState(null);

    useEffect(() => {
        const staticFinishes = DISCONTINUED_FINISHES.map((finish, index) => ({
            id: index + 1,
            OldFinish: finish.oldName,
            NewFinishName: finish.newName,
            Category: finish.category,
            OldVeneerCode: finish.veneer,
            NewVeneerCode: finish.veneer,
            OldSolidCode: finish.solid,
            NewSolidCode: finish.solid
        }));
        setFinishes(staticFinishes);
        setIsLoading(false);
    }, []);

    const getLocalFinishImagePath = (finishName) => {
        if (!finishName) return '';
        const finishData = DISCONTINUED_FINISHES.find(f => f.oldName === finishName || f.newName === finishName);
        return finishData?.newImage || '';
    };

    const formatFinishName = (name) => !name ? '' : name.split(' ').map((w,i)=> i===0 ? w.charAt(0).toUpperCase()+w.slice(1).toLowerCase(): w.toLowerCase()).join(' ');

    const groupedFinishes = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase().trim();
        const filtered = finishes.filter(finish => {
            const cat = typeof finish.Category === 'string' ? finish.Category : finish.Category?.Value || '';
            return (
                (finish.OldFinish||'').toLowerCase().includes(lowercasedFilter) ||
                (finish.NewFinishName||'').toLowerCase().includes(lowercasedFilter) ||
                cat.toLowerCase().includes(lowercasedFilter)
            );
        });
        return filtered.reduce((acc, f) => {
            const cat = typeof f.Category === 'string' ? f.Category : f.Category?.Value || 'Uncategorized';
            (acc[cat] = acc[cat] || []).push(f);
            return acc;
        }, {});
    }, [searchTerm, finishes]);

    const handleOrderClick = () => {
        if (!selectedFinish) return;
        // Match sample product by name (case-insensitive)
        const targetName = (selectedFinish.NewFinishName || '').toLowerCase();
        const sampleMatch = SAMPLE_PRODUCTS.find(p => (p.name || '').toLowerCase() === targetName);
        const newItem = sampleMatch || {
            id: `sample-${targetName.replace(/\s+/g,'-')}`,
            name: formatFinishName(selectedFinish.NewFinishName),
            category: 'finishes',
            image: getLocalFinishImagePath(selectedFinish.NewFinishName)
        };
        if (onUpdateCart) onUpdateCart(newItem, 1);
        setSelectedFinish(null);
        onNavigate && onNavigate('samples/cart'); // open cart immediately
    };

    const FinishRow = ({ finish, isLast }) => {
        const oldImg = getLocalFinishImagePath(finish.OldFinish);
        const newImg = getLocalFinishImagePath(finish.NewFinishName);
        return (
            <button
                onClick={() => setSelectedFinish(finish)}
                className={`w-full text-left p-3 transition-colors hover:bg-black/5 rounded-2xl ${!isLast ? 'border-b' : ''}`}
                style={{ borderColor: theme.colors.subtle }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 w-[45%]">
                        <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden" style={{ border: `1px solid ${theme.colors.border}`, backgroundColor: theme.colors.subtle }}>
                            {oldImg ? <img src={oldImg} alt={finish.OldFinish} className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-sm truncate" style={{ color: theme.colors.textPrimary }}>{formatFinishName(finish.OldFinish)}</p>
                            <p className="font-mono text-xs" style={{ color: theme.colors.textSecondary }}>{finish.OldVeneerCode}</p>
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex items-center space-x-4 w-[45%]">
                        <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden" style={{ border: `1px solid ${theme.colors.border}`, backgroundColor: theme.colors.subtle }}>
                            {newImg ? <img src={newImg} alt={finish.NewFinishName} className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-sm truncate" style={{ color: theme.colors.textPrimary }}>{formatFinishName(finish.NewFinishName)}</p>
                            <p className="font-mono text-xs" style={{ color: theme.colors.textSecondary }}>{finish.NewVeneerCode || finish.NewSolidCode || finish.OldSolidCode}</p>
                        </div>
                    </div>
                </div>
            </button>
        );
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header removed per request; keep search bar pinned */}
            <div className="px-4 pt-3 pb-3 sticky top-0 z-10" style={{ backgroundColor: `${theme.colors.background}e0`, backdropFilter: 'blur(10px)' }}>
                <StandardSearchBar
                    value={searchTerm}
                    onChange={(val) => setSearchTerm(val)}
                    placeholder="Search discontinued or replacement..."
                    theme={theme}
                />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
                {isLoading ? (
                    <div className="text-center p-8"><Hourglass className="w-8 h-8 animate-spin mx-auto" style={{ color: theme.colors.accent }} /></div>
                ) : Object.keys(groupedFinishes).length > 0 ? (
                    Object.entries(groupedFinishes).map(([category, finishItems]) => (
                        <section key={category} className="mb-6">
                            <h2 className="text-xl font-bold capitalize mb-3 px-1" style={{ color: theme.colors.textPrimary }}>
                                {category}
                            </h2>
                            <GlassCard theme={theme} className="p-2 space-y-1">
                                {finishItems.map((finish, index) => (
                                    <FinishRow key={finish.id || index} finish={finish} isLast={index === finishItems.length - 1} />
                                ))}
                            </GlassCard>
                        </section>
                    ))
                ) : (
                    <GlassCard theme={theme} className="p-8 text-center mt-4">
                        <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>No Results Found</p>
                        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Could not find any finishes matching "{searchTerm}".</p>
                    </GlassCard>
                )}
            </div>
            <Modal show={!!selectedFinish} onClose={() => setSelectedFinish(null)} title="Add Replacement Finish" theme={theme}>
                {selectedFinish && (
                    <>
                        <p style={{ color: theme.colors.textPrimary }}>
                            Add a sample of the replacement finish <span className="font-bold">{formatFinishName(selectedFinish?.NewFinishName)}</span> to your samples cart?
                        </p>
                        <div className="flex justify-end space-x-3 pt-4 mt-4 border-t" style={{ borderColor: theme.colors.border }}>
                            <button onClick={() => setSelectedFinish(null)} className="font-bold py-2 px-5 rounded-lg" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>Cancel</button>
                            <button onClick={handleOrderClick} className="font-bold py-2 px-5 rounded-lg text-white" style={{ backgroundColor: theme.colors.accent }}>Add to Cart</button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};