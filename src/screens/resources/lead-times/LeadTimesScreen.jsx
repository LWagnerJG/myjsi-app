import React, { useState, useMemo, useRef, useEffect } from 'react';
// Removed PageTitle per request to hide header
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { SearchInput } from '../../../components/common/SearchInput.jsx';
import { Filter } from 'lucide-react';
import { LEAD_TIMES_DATA, LEAD_TIME_CATEGORIES } from './data.js';

export const LeadTimesScreen = ({ theme = {} }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sortFastest, setSortFastest] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');
    const filterMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const rows = useMemo(() => {
        const map = {};
        LEAD_TIMES_DATA.forEach(({ series, type, weeks, image }) => {
            if (!map[series]) {
                map[series] = { types: {} };
            }
            map[series].types[type] = { weeks, image };
        });

        let list = Object.entries(map).map(([series, data]) => ({
            series,
            types: data.types,
        }));

        if (filterCategory === 'upholstered') {
            list = list.filter(r => r.types.Upholstery != null);
        } else if (filterCategory === 'wood') {
            list = list.filter(r => r.types['Wood Seating'] != null);
        } else if (filterCategory === 'casegoods') {
            list = list.filter(r => r.types.Casegoods != null || r.types.Laminate != null || r.types.Veneer != null || r.types.Tables != null);
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
        }
        return list;
    }, [searchTerm, filterCategory, sortFastest]);

    const LVLabel = ({ label }) => (
        <span className="text-[10px] font-bold" style={{ color: theme.colors.textSecondary }}>{label}</span>
    );

    const LeadTimeInfo = ({ typeData, theme }) => (
        <div className="relative w-24 h-24">
            <img
                src={typeData.image}
                alt=""
                className="w-full h-full object-contain"
            />
            <div
                className="absolute bottom-1 right-1 h-8 w-8 flex items-center justify-center rounded-full shadow-md"
                style={{ backgroundColor: theme.colors.subtle }}
            >
                <span className="text-sm font-bold" style={{ color: theme.colors.textSecondary }}>
                    {typeData.weeks}
                </span>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            {/* Search / filter row (header removed) */}
            <div className="px-4 pt-4 pb-4 flex items-center space-x-2">
                <SearchInput
                    className="flex-grow"
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search by series name..."
                    theme={theme}
                />
                <div className="relative">
                    <button onClick={() => setDropdownOpen(o => !o)} className="p-3.5 rounded-full shadow-lg" style={{ backgroundColor: theme.colors.surface }}>
                        <Filter className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
                    </button>
                    {dropdownOpen && (
                        <GlassCard ref={filterMenuRef} theme={theme} className="absolute top-14 right-0 z-10 w-48 p-2">
                            <label className="flex items-center w-full px-2 py-1.5 text-sm rounded-md cursor-pointer" style={{ color: theme.colors.textPrimary }}>
                                <input type="checkbox" checked={sortFastest} onChange={() => setSortFastest(f => !f)} className="form-checkbox h-4 w-4 mr-3" style={{ accentColor: theme.colors.accent }} />
                                Sort by fastest
                            </label>
                            <div className="border-t my-1" style={{ borderColor: theme.colors.border }} />
                            {LEAD_TIME_CATEGORIES.map(opt => (
                                <button
                                    key={opt.key}
                                    onClick={() => { setFilterCategory(opt.key); setDropdownOpen(false); }}
                                    className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${filterCategory === opt.key ? 'font-bold' : ''}`}
                                    style={{ color: theme.colors.textPrimary, backgroundColor: filterCategory === opt.key ? theme.colors.subtle : 'transparent' }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </GlassCard>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-1 space-y-2 scrollbar-hide">
                {rows.map(({ series, types }, idx) => (
                    <GlassCard key={series} theme={theme} className={`px-5 py-3 flex items-center justify-between ${idx===0 ? 'mt-1' : ''}`}>
                        <h3 className="text-xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                            {series}
                        </h3>
                        <div className="flex items-center justify-end space-x-5 w-[16rem]">
                            {types['Upholstery'] && <LeadTimeInfo typeData={types['Upholstery']} theme={theme} />}
                            {types['Seating'] && <LeadTimeInfo typeData={types['Seating']} theme={theme} />}
                            {types['Wood Seating'] && <LeadTimeInfo typeData={types['Wood Seating']} theme={theme} />}
                            {types['Casegoods'] && <LeadTimeInfo typeData={types['Casegoods']} theme={theme} />}
                            {types['Tables'] && <LeadTimeInfo typeData={types['Tables']} theme={theme} />}
                            {types['Laminate'] && (
                                <div className="relative w-24 h-24 text-center">
                                    <LVLabel label="Laminate" />
                                    <img src={types['Laminate'].image} alt="Laminate" className="w-full h-full object-contain" />
                                    <div className="absolute bottom-1 right-1 h-8 w-8 flex items-center justify-center rounded-full shadow-md" style={{ backgroundColor: theme.colors.subtle }}>
                                        <span className="text-sm font-bold" style={{ color: theme.colors.textSecondary }}>
                                            {types['Laminate'].weeks}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {types['Veneer'] && (
                                <div className="relative w-24 h-24 text-center">
                                    <LVLabel label="Veneer" />
                                    <img src={types['Veneer'].image} alt="Veneer" className="w-full h-full object-contain" />
                                    <div className="absolute bottom-1 right-1 h-8 w-8 flex items-center justify-center rounded-full shadow-md" style={{ backgroundColor: theme.colors.subtle }}>
                                        <span className="text-sm font-bold" style={{ color: theme.colors.textSecondary }}>
                                            {types['Veneer'].weeks}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};