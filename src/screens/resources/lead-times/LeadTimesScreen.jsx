import React, { useState, useMemo } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { Timer, ListOrdered, Zap, X, ExternalLink } from 'lucide-react';
import { LEAD_TIMES_DATA, QUICKSHIP_SERIES } from './data.js';
import { isDarkTheme } from '../../../design-system/tokens.js';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';

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

// QuickShip Modal Component
const QuickShipModal = ({ isOpen, onClose, seriesName, theme }) => {
    if (!isOpen) return null;
    
    const handleLearnMore = () => {
        window.open('https://www.jsifurniture.com/products/quickship-program/', '_blank');
    };
    
    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-sm rounded-3xl p-6 shadow-2xl"
                style={{ backgroundColor: theme.colors.surface }}
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-full transition-colors"
                    style={{ backgroundColor: theme.colors.subtle }}
                >
                    <X className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                </button>
                
                <div className="flex justify-center mb-4">
                    <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#D4AF3720' }}
                    >
                        <Zap className="w-8 h-8" style={{ color: '#D4AF37' }} fill="#D4AF37" />
                    </div>
                </div>
                
                <h2 className="text-xl font-bold text-center mb-2" style={{ color: theme.colors.textPrimary }}>
                    QuickShip Program
                </h2>
                
                <p className="text-center text-sm font-medium mb-4" style={{ color: theme.colors.accent }}>
                    {seriesName} Series
                </p>
                
                <p className="text-sm text-center mb-6 leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                    This series is available through our <strong>12 business day QuickShip program</strong>. 
                    Select models and finishes ship faster to meet your project deadlines.
                </p>
                
                <button
                    onClick={handleLearnMore}
                    className="w-full py-3 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    style={{ backgroundColor: theme.colors.quickShip, color: theme.colors.accentText }}
                >
                    <span>View QuickShip Details</span>
                    <ExternalLink className="w-4 h-4" />
                </button>
                
                <p className="text-xs text-center mt-4" style={{ color: theme.colors.textSecondary }}>
                    Click to see available models, finishes, and program details on jsifurniture.com
                </p>
            </div>
        </div>
    );
};

// QuickShip Badge Component - inline pill style
const QuickShipBadge = ({ onClick, isDark }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full transition-all hover:opacity-80 active:scale-95"
        style={{
            backgroundColor: isDark ? 'rgba(212,175,55,0.12)' : 'rgba(212,175,55,0.08)',
            border: `1px solid ${isDark ? 'rgba(212,175,55,0.2)' : 'rgba(154,138,120,0.15)'}`,
        }}
        title="QuickShip Available"
    >
        <Zap className="w-3 h-3" style={{ color: isDark ? '#D4AF37' : '#9A8A78' }} fill={isDark ? '#D4AF37' : '#9A8A78'} />
        <span className="text-[10px] font-bold tracking-wide" style={{ color: isDark ? '#D4AF37' : '#9A8A78' }}>QuickShip</span>
    </button>
);

export const LeadTimesScreen = ({ theme = {} }) => {
    const safeTheme = ensureTheme(theme);
    const isDark = isDarkTheme(theme);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortFastest, setSortFastest] = useState(false);
    const [quickShipModal, setQuickShipModal] = useState({ isOpen: false, seriesName: '' });

    const openQuickShipModal = (seriesName) => {
        setQuickShipModal({ isOpen: true, seriesName });
    };

    const closeQuickShipModal = () => {
        setQuickShipModal({ isOpen: false, seriesName: '' });
    };

    const rows = useMemo(() => {
        const map = {};
        LEAD_TIMES_DATA.forEach(({ series, type, weeks, image }) => {
            if (!map[series]) map[series] = { types: {}, isQuickShip: QUICKSHIP_SERIES.includes(series) };
            map[series].types[type] = { weeks, image };
        });
        let list = Object.entries(map).map(([series, data]) => ({ 
            series, 
            types: data.types,
            isQuickShip: data.isQuickShip
        }));

        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(r => r.series.toLowerCase().includes(q));
        }

        if (sortFastest) {
            // Sort by QuickShip first, then by fastest lead time
            list.sort((a, b) => {
                // QuickShip items come first
                if (a.isQuickShip && !b.isQuickShip) return -1;
                if (!a.isQuickShip && b.isQuickShip) return 1;
                // Then sort by fastest lead time
                const aMin = Math.min(...Object.values(a.types).map(t => t.weeks));
                const bMin = Math.min(...Object.values(b.types).map(t => t.weeks));
                return aMin - bMin;
            });
        } else {
            list.sort((a, b) => a.series.localeCompare(b.series));
        }
        return list;
    }, [searchTerm, sortFastest]);

    const LVLabel = ({ label }) => (
        <span className="text-[11px] font-bold" style={{ color: safeTheme.colors.textSecondary }}>{label}</span>
    );

    const LeadTimeInfo = ({ typeData }) => (
        <div className="relative">
            <div
                className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center"
                style={isDark ? { backgroundColor: 'rgba(255,255,255,0.08)' } : undefined}
            >
                <img
                    src={typeData.image}
                    alt=""
                    className="w-full h-full object-contain"
                    style={isDark ? { filter: 'brightness(0.9) contrast(1.05)' } : undefined}
                />
            </div>
            <div
                className="absolute -bottom-1 -right-1 h-7 w-7 flex items-center justify-center rounded-full"
                style={{
                    backgroundColor: isDark ? 'rgba(42,42,42,0.9)' : safeTheme.colors.subtle,
                    border: isDark ? '2px solid rgba(255,255,255,0.1)' : '2px solid rgba(255,255,255,0.8)',
                    boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.1)',
                }}
            >
                <span className="text-xs font-bold" style={{ color: isDark ? '#E8DDD0' : safeTheme.colors.textSecondary }}>{typeData.weeks}</span>
            </div>
        </div>
    );

    return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: safeTheme.colors.background }}>
        {/* Top banner - Search and sort only */}
        <div className="px-4 pt-3 pb-2">
            <div className="flex items-center gap-2">
                <StandardSearchBar
                    className="flex-grow"
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search series..."
                    theme={safeTheme}
                    aria-label="Search series"
                />
                <button
                    onClick={() => setSortFastest(f => !f)}
                    className="p-4 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    aria-label={sortFastest ? 'Sort alphabetically' : 'Sort by fastest lead time'}
                    title={sortFastest ? 'Alphabetical order' : 'Fastest lead time'}
                    style={{
                        backgroundColor: safeTheme.colors.surface || '#ffffff',
                        color: sortFastest ? safeTheme.colors.accent : safeTheme.colors.textPrimary,
                        borderColor: isDark
                            ? (sortFastest ? safeTheme.colors.accent : 'rgba(255,255,255,0.1)')
                            : (sortFastest ? safeTheme.colors.accent : (safeTheme.colors.border || 'rgba(0,0,0,0.10)'))
                    }}
                >
                    {sortFastest ? <ListOrdered className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
                </button>
            </div>
        </div>

            {/* Vertical list of cards */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-1 space-y-3 scrollbar-hide">
                {rows.map(({ series, types, isQuickShip }, idx) => (
                    <GlassCard 
                        key={series} 
                        theme={safeTheme} 
                        className={`relative px-5 pr-6 py-4 flex items-center justify-between rounded-3xl ${idx === 0 ? 'mt-1' : ''}`}
                        style={isDark ? { border: '1px solid rgba(255,255,255,0.08)' } : undefined}
                    >
                        <div className="flex flex-col gap-1.5 shrink-0">
                            <h3 className="text-xl font-bold tracking-tight" style={{ color: safeTheme.colors.textPrimary }}>
                                {series}
                            </h3>
                            {isQuickShip && (
                                <QuickShipBadge onClick={() => openQuickShipModal(series)} isDark={isDark} />
                            )}
                        </div>
                        <div className="flex items-center justify-end space-x-3">
                            {types['Upholstery'] && <LeadTimeInfo typeData={types['Upholstery']} />}
                            {types['Seating'] && <LeadTimeInfo typeData={types['Seating']} />}
                            {types['Wood Seating'] && <LeadTimeInfo typeData={types['Wood Seating']} />}
                            {types['Casegoods'] && <LeadTimeInfo typeData={types['Casegoods']} />}
                            {types['Tables'] && <LeadTimeInfo typeData={types['Tables']} />}
                            {types['Laminate'] && (
                                <div className="relative text-center">
                                    <LVLabel label="Laminate" />
                                    <div
                                        className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center"
                                        style={isDark ? { backgroundColor: 'rgba(255,255,255,0.08)' } : undefined}
                                    >
                                        <img
                                            src={types['Laminate'].image}
                                            alt="Laminate"
                                            className="w-full h-full object-contain"
                                            style={isDark ? { filter: 'brightness(0.9) contrast(1.05)' } : undefined}
                                        />
                                    </div>
                                    <div
                                        className="absolute -bottom-1 -right-1 h-7 w-7 flex items-center justify-center rounded-full"
                                        style={{
                                            backgroundColor: isDark ? 'rgba(42,42,42,0.9)' : safeTheme.colors.subtle,
                                            border: isDark ? '2px solid rgba(255,255,255,0.1)' : '2px solid rgba(255,255,255,0.8)',
                                            boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        <span className="text-xs font-bold" style={{ color: isDark ? '#E8DDD0' : safeTheme.colors.textSecondary }}>
                                            {types['Laminate'].weeks}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {types['Veneer'] && (
                                <div className="relative text-center">
                                    <LVLabel label="Veneer" />
                                    <div
                                        className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center"
                                        style={isDark ? { backgroundColor: 'rgba(255,255,255,0.08)' } : undefined}
                                    >
                                        <img
                                            src={types['Veneer'].image}
                                            alt="Veneer"
                                            className="w-full h-full object-contain"
                                            style={isDark ? { filter: 'brightness(0.9) contrast(1.05)' } : undefined}
                                        />
                                    </div>
                                    <div
                                        className="absolute -bottom-1 -right-1 h-7 w-7 flex items-center justify-center rounded-full"
                                        style={{
                                            backgroundColor: isDark ? 'rgba(42,42,42,0.9)' : safeTheme.colors.subtle,
                                            border: isDark ? '2px solid rgba(255,255,255,0.1)' : '2px solid rgba(255,255,255,0.8)',
                                            boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        <span className="text-xs font-bold" style={{ color: isDark ? '#E8DDD0' : safeTheme.colors.textSecondary }}>
                                            {types['Veneer'].weeks}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                ))}
                {rows.length === 0 && (
                    <GlassCard theme={safeTheme} className="p-8 flex flex-col items-center justify-center text-center gap-2 rounded-3xl">
                        <p className="text-sm font-medium" style={{ color: safeTheme.colors.textPrimary }}>No series match your search.</p>
                        <p className="text-xs" style={{ color: safeTheme.colors.textSecondary }}>Try adjusting your search term.</p>
                    </GlassCard>
                )}
            </div>
            
            {/* QuickShip Modal */}
            <QuickShipModal 
                isOpen={quickShipModal.isOpen}
                onClose={closeQuickShipModal}
                seriesName={quickShipModal.seriesName}
                theme={safeTheme}
            />
        </div>
    );
};