// Enhanced HomeScreen with Dealer Dashboard design and reconfiguration functionality
import React, { useState, useCallback, useMemo } from 'react';
import { allApps, DEFAULT_HOME_APPS } from '../../data.jsx';
import { ORDER_DATA } from '../orders/data.js';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { HomeSearchInput } from '../../components/common/SearchInput.jsx';
import { DESIGN_TOKENS, JSI_COLORS } from '../../design-system/tokens.js';
import { Check, Plus, X, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Badge data for specific app routes
const APP_BADGES = {
    'sales': { value: '$1.2M', label: 'YTD', color: '#4A7C59' },
    'projects': { value: '24', label: 'Open', color: '#5B7B8C' }
};

export const HomeScreen = ({ theme, onNavigate, onAskAI, onVoiceActivate, homeApps, onUpdateHomeApps, userSettings }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Safe theme color extraction with fallbacks
    const colors = useMemo(() => ({
        background: theme?.colors?.background || '#F0EDE8',
        surface: theme?.colors?.surface || '#FFFFFF',
        accent: theme?.colors?.accent || '#353535',
        textPrimary: theme?.colors?.textPrimary || '#353535',
        textSecondary: theme?.colors?.textSecondary || '#666666',
        border: theme?.colors?.border || '#E3E0D8'
    }), [theme]);

    // Ensure homeApps is always a valid array
    const safeHomeApps = useMemo(() => {
        return Array.isArray(homeApps) && homeApps.length > 0 ? homeApps : DEFAULT_HOME_APPS;
    }, [homeApps]);

    const currentApps = useMemo(() => {
        return safeHomeApps.map(route => allApps.find(a => a.route === route)).filter(Boolean);
    }, [safeHomeApps]);

    const availableApps = useMemo(() => {
        return allApps.filter(app => !safeHomeApps.includes(app.route));
    }, [safeHomeApps]);

    const toggleApp = useCallback((route) => {
        if (!onUpdateHomeApps) return; // Guard against missing prop
        if (safeHomeApps.includes(route)) {
            if (safeHomeApps.length > 4) {
                onUpdateHomeApps(safeHomeApps.filter(r => r !== route));
            }
        } else {
            if (safeHomeApps.length < 12) {
                onUpdateHomeApps([...safeHomeApps, route]);
            }
        }
    }, [safeHomeApps, onUpdateHomeApps]);

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const handleSearchSubmit = useCallback((val) => {
        if (onAskAI && val && val.trim()) {
            onAskAI(val);
        }
    }, [onAskAI]);

    const todayLabel = useMemo(() => {
        const now = new Date();
        return now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    }, []);

    const recentOrders = useMemo(() => {
        return [...ORDER_DATA].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    }, []);

    return (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide" style={{ backgroundColor: colors.background }}>
            <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-24 space-y-6 lg:space-y-8 max-w-2xl lg:max-w-5xl 2xl:max-w-6xl mx-auto w-full">

                {/* Header Section */}
                <div className="space-y-1">
                    <p className="text-sm font-semibold uppercase tracking-widest opacity-60" style={{ color: colors.textSecondary }}>{getTimeGreeting()}</p>
                    <h2 className="text-4xl font-bold" style={{ color: colors.textPrimary }}>Dashboard</h2>
                    <div className="text-sm" style={{ color: colors.textSecondary }}>{todayLabel}</div>
                </div>

                {/* Search / Spotlight */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-black/5 blur-xl group-focus-within:bg-black/10 transition-colors rounded-full" />
                    <GlassCard theme={theme} className="relative z-10 px-5" style={{ borderRadius: 9999, height: 56, paddingTop: 0, paddingBottom: 0 }}>
                        <HomeSearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            onSubmit={handleSearchSubmit}
                            onVoiceClick={() => onVoiceActivate && onVoiceActivate('Voice search active')}
                            theme={theme}
                            className="w-full"
                        />
                    </GlassCard>
                </div>

                {/* Reconfigurable Apps section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-widest" style={{ color: colors.textSecondary }}>Quick Access</h3>
                        {onUpdateHomeApps && (
                            <button
                                onClick={() => setIsEditMode(!isEditMode)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all`}
                                style={{
                                    backgroundColor: isEditMode ? colors.accent : 'transparent',
                                    color: isEditMode ? '#FFFFFF' : colors.textSecondary,
                                    border: isEditMode ? '1px solid transparent' : `1px solid ${colors.border}`,
                                    boxShadow: 'none'
                                }}
                            >
                                {isEditMode ? <><Check className="w-4 h-4" /> Done</> : <><SettingsIcon className="w-4 h-4" /> Reconfigure</>}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {currentApps.map((app) => {
                                const badge = APP_BADGES[app.route];
                                return (
                                <motion.button
                                    layout
                                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    key={app.route}
                                    onClick={() => isEditMode ? null : onNavigate(app.route)}
                                    className={`relative flex flex-col items-center justify-center rounded-3xl transition-all active:scale-95 group ${isEditMode ? 'gap-2 p-4 sm:p-5' : 'gap-3 p-6'}`}
                                    style={{
                                        minHeight: isEditMode ? 112 : 140,
                                        backgroundColor: colors.surface,
                                        border: `1px solid ${colors.border}`,
                                        boxShadow: DESIGN_TOKENS.shadows.card
                                    }}
                                >
                                    <div
                                        className={`rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${isEditMode ? 'w-10 h-10' : 'w-12 h-12'}`}
                                        style={{ backgroundColor: `${colors.accent}12` }}
                                    >
                                        <app.icon className={`${isEditMode ? 'w-5 h-5' : 'w-6 h-6'}`} style={{ color: colors.accent }} />
                                    </div>
                                    <span className="text-sm font-bold tracking-tight text-center" style={{ color: colors.textPrimary }}>{app.name}</span>
                                    
                                    {/* Badge for Sales/Projects */}
                                    {badge && !isEditMode && (
                                        <div 
                                            className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold"
                                            style={{ backgroundColor: badge.color, color: '#FFFFFF' }}
                                        >
                                            {badge.value}
                                        </div>
                                    )}

                                    {isEditMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleApp(app.route); }}
                                            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-transform"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </motion.button>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {isEditMode && (
                        <div className="space-y-2">
                            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.textSecondary }}>Add Apps</div>
                            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                                {availableApps.map((app) => (
                                    <motion.button
                                        layout
                                        key={app.route}
                                        onClick={() => toggleApp(app.route)}
                                        className="flex-shrink-0 flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-dashed hover:opacity-100 transition-all active:scale-95"
                                        style={{
                                            minWidth: 120,
                                            backgroundColor: `${colors.surface}80`,
                                            borderColor: colors.border
                                        }}
                                    >
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-dashed" style={{ borderColor: colors.border }}>
                                            <Plus className="w-5 h-5 opacity-40" style={{ color: colors.textSecondary }} />
                                        </div>
                                        <span className="text-xs font-semibold opacity-60" style={{ color: colors.textSecondary }}>{app.name}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <GlassCard theme={theme} className="p-6" style={{ borderRadius: 24 }}>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold" style={{ color: colors.textPrimary }}>Recent Activity</h4>
                        <button onClick={() => onNavigate('orders')} className="text-xs font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">View All</button>
                    </div>
                    <div className="space-y-3">
                        {recentOrders.map((order) => (
                            <button
                                key={order.orderNumber}
                                onClick={() => onNavigate('orders')}
                                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-black/[0.03] transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center text-[10px] font-bold">PO</div>
                                    <div className="text-left min-w-0">
                                        <div className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>{order.company}</div>
                                        <div className="text-[10px] uppercase tracking-widest opacity-50" style={{ color: colors.textSecondary }}>
                                            {new Date(order.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold" style={{ color: colors.textPrimary }}>${order.net.toLocaleString()}</div>
                                    <div className="text-[10px] uppercase tracking-widest opacity-50" style={{ color: colors.textSecondary }}>{order.status}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </GlassCard>

                {/* Feedback CTA (sticky bottom) */}
                <div className="mt-6 lg:mt-8 sticky bottom-4">
                    <GlassCard
                        theme={theme}
                        className="p-6 flex items-center justify-between"
                        style={{ borderRadius: 24, backgroundColor: colors.accent }}
                    >
                        <div className="space-y-1">
                            <h4 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Feedback?</h4>
                            <p className="text-sm opacity-60" style={{ color: '#FFFFFF' }}>Help us improve your dashboard.</p>
                        </div>
                        <button
                            onClick={() => onNavigate('feedback')}
                            className="px-6 py-3 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
                            style={{ backgroundColor: '#FFFFFF', color: colors.accent }}
                        >
                            Send Feedback
                        </button>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};


