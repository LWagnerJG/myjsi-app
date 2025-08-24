import React, { useState, useMemo } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { SearchInput } from '../../../components/common/SearchInput.jsx';
import { Timer, ListOrdered } from 'lucide-react';
import { LEAD_TIMES_DATA } from './data.js';

// Fallback colors if theme tokens missing
const ensureTheme = (theme) => ({
    colors: {
        background: theme?.colors?.background || '#FFFFFF',
        surface: theme?.colors?.surface || 'rgba(255,255,255,0.85)',
        subtle: theme?.colors?.subtle || 'rgba(0,0,0,0.06)',
        border: theme?.colors?.border || 'rgba(0,0,0,0.12)',
        textPrimary: theme?.colors?.textPrimary || '#1F1F1F',
        textSecondary: theme?.colors?.textSecondary || '#555555',
        accent: theme?.colors?.accent || '#8B5E3C',
        shadow: theme?.colors?.shadow || 'rgba(0,0,0,0.08)'
    }
});

const CATEGORY_DEFS = [
    { key: 'upholstered', label: 'Upholstered', match: (r) => r.types.Upholstery != null },
    { key: 'wood', label: 'Wood Seating', match: (r) => r.types['Wood Seating'] != null },
    { key: 'casegoods', label: 'Casegoods', match: (r) => (r.types.Casegoods || r.types.Laminate || r.types.Veneer || r.types.Tables) != null }
];

export const LeadTimesScreen = ({ theme = {} }) => {
    const safeTheme = ensureTheme(theme);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortFastest, setSortFastest] = useState(false); // toggle between fastest vs alphabetical
    const [selectedCats, setSelectedCats] = useState(() => new Set()); // multi-select

    const toggleCategory = (key) => {
        setSelectedCats(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    const rows = useMemo(() => {
        const map = {};
        LEAD_TIMES_DATA.forEach(({ series, type, weeks, image }) => {
            if (!map[series]) map[series] = { types: {} };
            map[series].types[type] = { weeks, image };
        });
        let list = Object.entries(map).map(([series, data]) => ({ series, types: data.types }));

        if (selectedCats.size > 0) {
            list = list.filter(r => {
                for (const cat of selectedCats) {
                    const def = CATEGORY_DEFS.find(c => c.key === cat);
                    if (def && def.match(r)) return true;
                }
                return false;
            });
        }

        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(r => r.series.toLowerCase().includes(q));
        }

        if (sortFastest) {
            list.sort((a, b) => {
                const aMin = Math.min(...Object.values(a.types).map(t => t.weeks));
                const bMin = Math.min(...Object.values(b.types).map(t => t.weeks));
                return aMin - bMin;
            });
        } else {
            list.sort((a, b) => a.series.localeCompare(b.series));
        }
        return list;
    }, [searchTerm, selectedCats, sortFastest]);

    const LVLabel = ({ label }) => (
        <span className="text-[10px] font-bold" style={{ color: safeTheme.colors.textSecondary }}>{label}</span>
    );

    const LeadTimeInfo = ({ typeData }) => (
        <div className="relative w-24 h-24">
            <img src={typeData.image} alt="" className="w-full h-full object-contain" />
            <div className="absolute bottom-1 right-1 h-8 w-8 flex items-center justify-center rounded-full shadow-md" style={{ backgroundColor: safeTheme.colors.subtle }}>
                <span className="text-sm font-bold" style={{ color: safeTheme.colors.textSecondary }}>{typeData.weeks}</span>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: safeTheme.colors.background }}>
            {/* Top banner */}
            <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
                {/* Category multi-select buttons */}
                <div className="flex w-full gap-3">
                    {CATEGORY_DEFS.map(def => {
                        const active = selectedCats.has(def.key);
                        return (
                            <button
                                key={def.key}
                                onClick={() => toggleCategory(def.key)}
                                className={`flex-1 relative px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${active ? 'shadow-sm' : ''}`}
                                style={{
                                    backgroundColor: active ? safeTheme.colors.accent : safeTheme.colors.surface,
                                    color: active ? '#FFFFFF' : safeTheme.colors.textPrimary,
                                    border: `1px solid ${active ? safeTheme.colors.accent : safeTheme.colors.border}`
                                }}
                                aria-pressed={active}
                            >
                                {def.label}
                            </button>
                        );
                    })}
                </div>
                {/* Search + sort toggle */}
                <div className="flex items-center gap-3">
                    <SearchInput
                        variant="header"
                        className="flex-grow"
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search series..."
                        theme={safeTheme}
                        aria-label="Search series"
                    />
                    <button
                        onClick={() => setSortFastest(f => !f)}
                        className={`p-4 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
                        aria-label={sortFastest ? 'Sort alphabetically' : 'Sort by fastest lead time'}
                        title={sortFastest ? 'Alphabetical order' : 'Fastest lead time'}
                        style={{
                            backgroundColor: safeTheme.colors.surface,
                            color: sortFastest ? safeTheme.colors.accent : safeTheme.colors.textPrimary,
                            borderColor: sortFastest ? safeTheme.colors.accent : safeTheme.colors.border
                        }}
                    >
                        {sortFastest ? <ListOrdered className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Vertical list of cards (original styling) */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2 space-y-2 scrollbar-hide">
                {rows.map(({ series, types }, idx) => (
                    <GlassCard key={series} theme={safeTheme} className={`px-5 py-3 flex items-center justify-between ${idx===0 ? 'mt-1' : ''}`}>
                        <h3 className="text-xl font-bold tracking-tight" style={{ color: safeTheme.colors.textPrimary }}>
                            {series}
                        </h3>
                        <div className="flex items-center justify-end space-x-5 w-[16rem]">
                            {types['Upholstery'] && <LeadTimeInfo typeData={types['Upholstery']} />}
                            {types['Seating'] && <LeadTimeInfo typeData={types['Seating']} />}
                            {types['Wood Seating'] && <LeadTimeInfo typeData={types['Wood Seating']} />}
                            {types['Casegoods'] && <LeadTimeInfo typeData={types['Casegoods']} />}
                            {types['Tables'] && <LeadTimeInfo typeData={types['Tables']} />}
                            {types['Laminate'] && (
                                <div className="relative w-24 h-24 text-center">
                                    <LVLabel label="Laminate" />
                                    <img src={types['Laminate'].image} alt="Laminate" className="w-full h-full object-contain" />
                                    <div className="absolute bottom-1 right-1 h-8 w-8 flex items-center justify-center rounded-full shadow-md" style={{ backgroundColor: safeTheme.colors.subtle }}>
                                        <span className="text-sm font-bold" style={{ color: safeTheme.colors.textSecondary }}>
                                            {types['Laminate'].weeks}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {types['Veneer'] && (
                                <div className="relative w-24 h-24 text-center">
                                    <LVLabel label="Veneer" />
                                    <img src={types['Veneer'].image} alt="Veneer" className="w-full h-full object-contain" />
                                    <div className="absolute bottom-1 right-1 h-8 w-8 flex items-center justify-center rounded-full shadow-md" style={{ backgroundColor: safeTheme.colors.subtle }}>
                                        <span className="text-sm font-bold" style={{ color: safeTheme.colors.textSecondary }}>
                                            {types['Veneer'].weeks}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                ))}
                {rows.length === 0 && (
                    <GlassCard theme={safeTheme} className="p-8 flex flex-col items-center justify-center text-center gap-2">
                        <p className="text-sm font-medium" style={{ color: safeTheme.colors.textPrimary }}>No series match your filters.</p>
                        <p className="text-xs" style={{ color: safeTheme.colors.textSecondary }}>Adjust category, search, or sorting to see results.</p>
                    </GlassCard>
                )}
            </div>
        </div>
    );
};