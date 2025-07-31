import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { SearchInput } from '../../components/common/SearchInput.jsx';
import { Filter } from 'lucide-react';
import { LEAD_TIMES_DATA } from '../../data.jsx';

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
        <span className="text-xs font-bold" style={{ color: theme.colors.textSecondary }}>{label}</span>
    );

    const LeadTimeInfo = ({ typeData, theme }) => (
        <div className="relative w-28 h-28">
            <img
                src={typeData.image}
                alt=""
                className="w-full h-full object-contain"
            />
            <div
                className="absolute bottom-1 right-1 h-9 w-9 flex items-center justify-center rounded-full shadow-md"
                style={{ backgroundColor: theme.colors.subtle }}
            >
                <span className="text-lg font-bold" style={{ color: theme.colors.textSecondary }}>
                    {typeData.weeks}
                </span>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            <PageTitle title="Lead Times" theme={theme} />

            <div className="px-4 pb-4 flex items-center space-x-2">
                <SearchInput
                    className="flex-grow"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search by series name…"
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
                            {[{ key: 'all', label: 'All' }, { key: 'upholstered', label: 'Upholstered' }, { key: 'wood', label: 'Wood Seating' }, { key: 'casegoods', label: 'Casegoods' }].map(opt => (
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

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 scrollbar-hide">
                {rows.map(({ series, types }) => (
                    <GlassCard key={series} theme={theme} className="px-6 py-2 flex items-center justify-between min-h-[9rem]">
                        <h3 className="text-2xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                            {series}
                        </h3>
                        <div className="flex items-center justify-end space-x-6 w-[17rem]">
                            {types['Upholstery'] && <LeadTimeInfo typeData={types['Upholstery']} theme={theme} />}
                            {types['Seating'] && <LeadTimeInfo typeData={types['Seating']} theme={theme} />}
                            {types['Wood Seating'] && <LeadTimeInfo typeData={types['Wood Seating']} theme={theme} />}
                            {types['Casegoods'] && <LeadTimeInfo typeData={types['Casegoods']} theme={theme} />}
                            {types['Tables'] && <LeadTimeInfo typeData={types['Tables']} theme={theme} />}
                            {types['Laminate'] && (
                                <div className="relative w-28 h-28 text-center">
                                    <LVLabel label="Laminate" />
                                    <img src={types['Laminate'].image} alt="Laminate" className="w-full h-full object-contain" />
                                    <div className="absolute bottom-1 right-1 h-9 w-9 flex items-center justify-center rounded-full shadow-md" style={{ backgroundColor: theme.colors.subtle }}>
                                        <span className="text-lg font-bold" style={{ color: theme.colors.textSecondary }}>
                                            {types['Laminate'].weeks}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {types['Veneer'] && (
                                <div className="relative w-28 h-28 text-center">
                                    <LVLabel label="Veneer" />
                                    <img src={types['Veneer'].image} alt="Veneer" className="w-full h-full object-contain" />
                                    <div className="absolute bottom-1 right-1 h-9 w-9 flex items-center justify-center rounded-full shadow-md" style={{ backgroundColor: theme.colors.subtle }}>
                                        <span className="text-lg font-bold" style={{ color: theme.colors.textSecondary }}>
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