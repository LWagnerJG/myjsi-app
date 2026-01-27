// Enhanced HomeScreen with Dealer Dashboard design and reconfiguration functionality
import React, { useState, useCallback, useMemo } from 'react';
import { allApps, DEFAULT_HOME_APPS } from '../../data.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { HomeSearchInput } from '../../components/common/SearchInput.jsx';
import { DESIGN_TOKENS, JSI_COLORS } from '../../design-system/tokens.js';
import { LayoutGrid, Check, Plus, X, ArrowUpRight, Layout, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SummaryCard = ({ title, value, subValue, icon: Icon, theme }) => (
    <GlassCard theme={theme} className="flex-1 p-5 min-w-[160px]" variant="elevated">
        <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${theme.colors.accent}10` }}>
                <Icon className="w-5 h-5" style={{ color: theme.colors.accent }} />
            </div>
            <ArrowUpRight className="w-4 h-4 opacity-40" />
        </div>
        <div className="space-y-0.5">
            <p className="text-xs font-medium uppercase tracking-wider opacity-60">{title}</p>
            <h4 className="text-2xl font-bold">{value}</h4>
            {subValue && <p className="text-xs font-semibold text-green-600">{subValue}</p>}
        </div>
    </GlassCard>
);

export const HomeScreen = ({ theme, onNavigate, onAskAI, onVoiceActivate, homeApps, onUpdateHomeApps, userSettings }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const currentApps = useMemo(() => {
        const selection = Array.isArray(homeApps) ? homeApps : DEFAULT_HOME_APPS;
        return selection.map(route => allApps.find(a => a.route === route)).filter(Boolean);
    }, [homeApps]);

    const availableApps = useMemo(() => {
        return allApps.filter(app => !homeApps.includes(app.route));
    }, [homeApps]);

    const toggleApp = useCallback((route) => {
        if (homeApps.includes(route)) {
            if (homeApps.length > 4) {
                onUpdateHomeApps(homeApps.filter(r => r !== route));
            }
        } else {
            if (homeApps.length < 12) {
                onUpdateHomeApps([...homeApps, route]);
            }
        }
    }, [homeApps, onUpdateHomeApps]);

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-[#F0EDE8]">
            <div className="px-6 py-6 space-y-8 max-w-5xl mx-auto w-full pb-24">

                {/* Header Section */}
                <div className="space-y-1">
                    <p className="text-sm font-semibold uppercase tracking-widest opacity-60">{getTimeGreeting()}</p>
                    <h2 className="text-4xl font-bold">Welcome, {userSettings?.firstName || 'Luke'}</h2>
                </div>

                {/* Dashboard Summary row */}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    <SummaryCard title="Sales YTD" value="$1.2M" subValue="+12.5%" icon={LayoutGrid} theme={theme} />
                    <SummaryCard title="Open Projects" value="24" subValue="3 New" icon={Layout} theme={theme} />
                    <SummaryCard title="Rewards" value="1,450" subValue="Gold Status" icon={SettingsIcon} theme={theme} />
                </div>

                {/* Search / Spotlight */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-black/5 blur-xl group-focus-within:bg-black/10 transition-colors rounded-full" />
                    <GlassCard theme={theme} className="relative z-10 px-6 h-16 flex items-center bg-white border-0 shadow-lg" style={{ borderRadius: 9999 }}>
                        <HomeSearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            onSubmit={(e) => { e.preventDefault(); onAskAI(searchQuery); }}
                            onVoiceClick={() => onVoiceActivate('Voice search active')}
                            theme={theme}
                            placeholder="Search projects, dealers or resources..."
                            className="w-full bg-transparent border-none focus:ring-0 text-lg"
                        />
                    </GlassCard>
                </div>

                {/* Reconfigurable Apps section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            Core Dashboard
                        </h3>
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${isEditMode ? 'bg-black text-white' : 'bg-white text-black shadow-sm border border-black/5'}`}
                        >
                            {isEditMode ? <><Check className="w-4 h-4" /> Done</> : <><SettingsIcon className="w-4 h-4" /> Reconfigure</>}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <AnimatePresence mode="popLayout">
                            {currentApps.map((app) => (
                                <motion.button
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    key={app.route}
                                    onClick={() => isEditMode ? null : onNavigate(app.route)}
                                    className="relative flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-white border border-black/[0.03] shadow-sm hover:shadow-md transition-all active:scale-95 group"
                                    style={{ minHeight: 140 }}
                                >
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${theme.colors.accent}08` }}>
                                        <app.icon className="w-6 h-6" style={{ color: theme.colors.accent }} />
                                    </div>
                                    <span className="text-sm font-bold tracking-tight text-center">{app.name}</span>

                                    {isEditMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleApp(app.route); }}
                                            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-transform"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </motion.button>
                            ))}
                            {isEditMode && availableApps.map((app) => (
                                <motion.button
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 0.6, scale: 1 }}
                                    key={app.route}
                                    onClick={() => toggleApp(app.route)}
                                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-white/50 border border-dashed border-black/10 hover:bg-white hover:opacity-100 transition-all active:scale-95 group"
                                    style={{ minHeight: 140 }}
                                >
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-dashed border-black/10">
                                        <Plus className="w-6 h-6 opacity-40" />
                                    </div>
                                    <span className="text-sm font-bold opacity-40">{app.name}</span>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Secondary Actions Row */}
                <div className="mt-8">
                    <GlassCard
                        theme={theme}
                        className="p-6 bg-black text-white border-0 flex items-center justify-between"
                        style={{ borderRadius: 24 }}
                    >
                        <div className="space-y-1">
                            <h4 className="text-lg font-bold text-white">Need Support?</h4>
                            <p className="text-sm opacity-60">Reach out to your territory manager</p>
                        </div>
                        <button
                            onClick={() => onNavigate('help')}
                            className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
                        >
                            Get Help
                        </button>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

