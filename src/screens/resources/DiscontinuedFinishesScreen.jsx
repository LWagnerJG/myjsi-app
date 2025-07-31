import React, { useState, useMemo, useEffect } from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { SearchInput } from '../../components/common/SearchInput.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { ArrowRight, Hourglass } from 'lucide-react';
import * as Data from '../../data.jsx';

export const DiscontinuedFinishesScreen = ({ theme, onNavigate, onUpdateCart }) => {
    const [finishes, setFinishes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFinish, setSelectedFinish] = useState(null);

    useEffect(() => {
        // Use static data from DISCONTINUED_FINISHES instead of API call
        const staticFinishes = Data.DISCONTINUED_FINISHES.map((finish, index) => ({
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
        
        // Find the finish data that matches
        const finishData = Data.DISCONTINUED_FINISHES.find(f => 
            f.oldName === finishName || f.newName === finishName
        );
        
        if (finishData && finishData.newImage) {
            return finishData.newImage;
        }
        
        return '';
    };

    const formatFinishName = (name) => {
        if (!name) return '';
        return name.split(' ').map((word, index) =>
            index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()
        ).join(' ');
    };

    const groupedFinishes = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase().trim();
        const filtered = finishes.filter(finish => {
            const oldFinishName = finish.OldFinish || '';
            const category = typeof finish.Category === 'string'
                ? finish.Category
                : finish.Category?.Value || '';
            return (
                oldFinishName.toLowerCase().includes(lowercasedFilter) ||
                (finish.NewFinishName || '').toLowerCase().includes(lowercasedFilter) ||
                category.toLowerCase().includes(lowercasedFilter)
            );
        });
        return filtered.reduce((acc, finish) => {
            const category = typeof finish.Category === 'string'
                ? finish.Category
                : finish.Category?.Value || '';
            const categoryKey = category || 'Uncategorized';
            if (!acc[categoryKey]) acc[categoryKey] = [];
            acc[categoryKey].push(finish);
            return acc;
        }, {});
    }, [searchTerm, finishes]);

    const handleOrderClick = () => {
        if (!selectedFinish) return;
        const newItem = {
            id: `sample-${selectedFinish.NewFinishName.toLowerCase().replace(/\s/g, '-')}`,
            name: formatFinishName(selectedFinish.NewFinishName),
            category: typeof selectedFinish.Category === 'string'
                ? selectedFinish.Category
                : selectedFinish.Category?.Value || '',
            image: getLocalFinishImagePath(selectedFinish.NewFinishName),
        };
        if (onUpdateCart) {
            onUpdateCart(newItem, 1);
        }
        setSelectedFinish(null);
        if (onNavigate) {
            onNavigate('samples');
        }
    };

    const FinishRow = ({ finish, isLast }) => {
        const oldFinishLocalImageUrl = getLocalFinishImagePath(finish.OldFinish);
        const newFinishLocalImageUrl = getLocalFinishImagePath(finish.NewFinishName);

        return (
            <button
                onClick={() => setSelectedFinish(finish)}
                className={`w-full text-left p-3 transition-colors hover:bg-black/5 rounded-2xl ${!isLast ? 'border-b' : ''}`}
                style={{ borderColor: theme.colors.subtle }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 w-[45%]">
                        <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden" style={{ border: `1px solid ${theme.colors.border}`, backgroundColor: theme.colors.subtle }}>
                            {oldFinishLocalImageUrl ? (
                                <img src={oldFinishLocalImageUrl} alt={finish.OldFinish} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-sm truncate" style={{ color: theme.colors.textPrimary }}>{formatFinishName(finish.OldFinish)}</p>
                            <p className="font-mono text-xs" style={{ color: theme.colors.textSecondary }}>{finish.OldVeneerCode}</p>
                        </div>
                    </div>

                    <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />

                    <div className="flex items-center space-x-4 w-[45%]">
                        <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden" style={{ border: `1px solid ${theme.colors.border}`, backgroundColor: theme.colors.subtle }}>
                            {newFinishLocalImageUrl ? (
                                <img src={newFinishLocalImageUrl} alt={finish.NewFinishName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full" />
                            )}
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
            <PageTitle title="Discontinued Finishes" theme={theme} />
            <div className="px-4 pt-2 pb-4 sticky top-0 z-10" style={{ backgroundColor: `${theme.colors.background}e0`, backdropFilter: 'blur(10px)' }}>
                <SearchInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or category..."
                    theme={theme}
                />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
                {isLoading ? (
                    <div className="text-center p-8"><Hourglass className="w-8 h-8 animate-spin mx-auto" style={{ color: theme.colors.accent }} /></div>
                ) : Object.keys(groupedFinishes).length > 0 ? (
                    Object.entries(groupedFinishes).map(([category, finishItems]) => (
                        <section key={category} className="mb-6">
                            <h2 className="text-2xl font-bold capitalize mb-3 px-1" style={{ color: theme.colors.textPrimary }}>
                                {category}
                            </h2>
                            <GlassCard theme={theme} className="p-2 space-y-1">
                                {finishItems.map((finish, index) => (
                                    <FinishRow
                                        key={finish.id || index}
                                        finish={finish}
                                        isLast={index === finishItems.length - 1}
                                    />
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
            <Modal show={!!selectedFinish} onClose={() => setSelectedFinish(null)} title="Order Sample" theme={theme}>
                {selectedFinish && (
                    <>
                        <p style={{ color: theme.colors.textPrimary }}>
                            Would you like to order a sample of the new replacement finish, <span className="font-bold">{formatFinishName(selectedFinish?.NewFinishName)}</span>?
                        </p>
                        <div className="flex justify-end space-x-3 pt-4 mt-4 border-t" style={{ borderColor: theme.colors.border }}>
                            <button onClick={() => setSelectedFinish(null)} className="font-bold py-2 px-5 rounded-lg" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>Cancel</button>
                            <button onClick={handleOrderClick} className="font-bold py-2 px-5 rounded-lg text-white" style={{ backgroundColor: theme.colors.accent }}>Order Sample</button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};
