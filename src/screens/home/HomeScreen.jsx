// Enhanced HomeScreen with Dealer Dashboard design and reconfiguration functionality
import React, { useState, useCallback, useMemo } from 'react';
import { allApps, DEFAULT_HOME_APPS } from '../../data.jsx';
import { ORDER_DATA } from '../orders/data.js';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { HomeSearchInput } from '../../components/common/SearchInput.jsx';
import { DESIGN_TOKENS, JSI_COLORS } from '../../design-system/tokens.js';
import { Check, Plus, X, Settings as SettingsIcon, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DndContext,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    SortableContext,
    rectSortingStrategy,
    useSortable,
    arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Badge data for specific app routes
const APP_BADGES = {
    'sales': { value: '$1.2M', label: 'YTD', color: '#4A7C59' },
    'projects': { value: '24', label: 'Open', color: '#5B7B8C' }
};

const SortableAppTile = ({ id, app, colors, onRemove }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        backgroundColor: `${colors.surface}F7`,
        borderColor: colors.border,
        boxShadow: DESIGN_TOKENS.shadows.card,
        opacity: isDragging ? 0.85 : 1,
        zIndex: isDragging ? 10 : 'auto',
        width: '100%',
        minWidth: 0
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl border"
        >
            <div className="flex items-center gap-3 min-w-0">
                <button
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ color: colors.textSecondary }}
                    aria-label="Drag to reorder"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="w-4 h-4" />
                </button>
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${colors.accent}12` }}>
                    <app.icon className="w-4 h-4" style={{ color: colors.accent }} />
                </div>
                <span className="text-sm font-semibold truncate" style={{ color: colors.textPrimary, minWidth: 0 }}>{app.name}</span>
            </div>
            <button
                onClick={() => onRemove(app.route)}
                className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:scale-105 active:scale-90 transition-transform"
                aria-label="Remove"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
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
        const excludedRoutes = new Set(['settings', 'feedback', 'help', 'contracts', 'members']);
        return allApps.filter(app => !safeHomeApps.includes(app.route) && !excludedRoutes.has(app.route));
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


    const handleSearchSubmit = useCallback((val) => {
        if (onAskAI && val && val.trim()) {
            onAskAI(val);
        }
    }, [onAskAI]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
    );

    const handleReorder = useCallback((event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        if (!onUpdateHomeApps) return;
        const oldIndex = safeHomeApps.indexOf(active.id);
        const newIndex = safeHomeApps.indexOf(over.id);
        if (oldIndex === -1 || newIndex === -1) return;
        onUpdateHomeApps(arrayMove(safeHomeApps, oldIndex, newIndex));
    }, [onUpdateHomeApps, safeHomeApps]);

    const todayLabel = useMemo(() => {
        const now = new Date();
        return now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    }, []);

    const recentOrders = useMemo(() => {
        return [...ORDER_DATA].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    }, []);

    return (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide" style={{ backgroundColor: colors.background }}>
            <div className="px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-24 space-y-6 lg:space-y-8 max-w-2xl lg:max-w-5xl 2xl:max-w-6xl mx-auto w-full">

                {/* Header Section */}
                <div className="space-y-1 hidden sm:block">
                    <h2 className="text-4xl font-bold" style={{ color: colors.textPrimary }}>Dashboard</h2>
                    <div className="text-sm" style={{ color: colors.textSecondary }}>{todayLabel}</div>
                </div>

                {/* Search / Spotlight */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-white/40 blur-2xl group-focus-within:bg-white/60 transition-colors rounded-full" />
                    <GlassCard
                        theme={theme}
                        className="relative z-10 px-5"
                        style={{
                            borderRadius: 9999,
                            height: 54,
                            paddingTop: 0,
                            paddingBottom: 0,
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.14) 100%)',
                            boxShadow: '0 10px 24px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.05)',
                            backdropFilter: 'blur(22px) saturate(120%)',
                            WebkitBackdropFilter: 'blur(22px) saturate(120%)'
                        }}
                    >
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
                            <div
                                ref={setNodeRef}
                                style={style}
                                className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl border cursor-grab active:cursor-grabbing"
                                {...attributes}
                                {...listeners}
                            >
                                    color: isEditMode ? '#FFFFFF' : colors.textSecondary,
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center"
                                        style={{ color: colors.textSecondary }}
                                        aria-hidden="true"
                                    >
                    </div>
                                    </div>
                    {isEditMode && (
                        <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                            Drag to reorder. Keep at least 4 apps pinned.
                        </div>
                    )}

                    {isEditMode ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleReorder}
                        >
                            <SortableContext items={safeHomeApps} strategy={rectSortingStrategy}>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {currentApps.map((app) => (
                                        <SortableAppTile
                                            key={app.route}
                                            id={app.route}
                                            app={app}
                                            colors={colors}
                                            onRemove={toggleApp}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                                gap: '0.5rem'
                            }}
                        >
                            {currentApps.map((app) => {
                                const badge = APP_BADGES[app.route];
                                return (
                                    <motion.button
                                        key={app.route}
                                        onClick={() => onNavigate(app.route)}
                                        className="relative flex flex-col items-center justify-center rounded-2xl transition-all active:scale-95 group gap-1 p-2.5 hover:shadow-xl"
                                        style={{
                                            minHeight: 96,
                                            backgroundColor: colors.surface,
                                            border: `1px solid ${colors.border}`,
                                            boxShadow: DESIGN_TOKENS.shadows.card,
                                            width: '100%',
                                            minWidth: 0
                                        }}
                                    >
                                        <div
                                            className="rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 w-8 h-8"
                                            style={{ backgroundColor: `${colors.accent}12` }}
                                        >
                                            <app.icon className="w-4 h-4" style={{ color: colors.accent }} />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-tight text-center" style={{ color: colors.textPrimary }}>
                                            {app.name}
                                        </span>
                                        {badge && (
                                            <div 
                                                className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold"
                                                style={{ backgroundColor: badge.color, color: '#FFFFFF' }}
                                            >
                                                {badge.value}
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}

                    {isEditMode && (
                        <div className="space-y-2">
                            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.textSecondary }}>Add Apps</div>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                                    gap: '0.5rem'
                                }}
                            >
                                {availableApps.map((app) => (
                                    <motion.button
                                        layout
                                        key={app.route}
                                        onClick={() => toggleApp(app.route)}
                                        className="flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-xl border border-dashed hover:bg-black/[0.02] transition-all active:scale-95"
                                        style={{
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border,
                                            width: '100%',
                                            minWidth: 0
                                        }}
                                    >
                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center border border-dashed" style={{ borderColor: colors.border }}>
                                            <Plus className="w-3 h-3 opacity-40" style={{ color: colors.textSecondary }} />
                                        </div>
                                        <span className="text-[9px] font-semibold" style={{ color: colors.textSecondary }}>{app.name}</span>
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
                <div className="mt-5 lg:mt-6 sticky bottom-4">
                    <GlassCard
                        theme={theme}
                        className="px-4 py-3 flex items-center justify-between"
                        style={{ borderRadius: 20, backgroundColor: `${colors.surface}E6`, border: `1px solid ${colors.border}`, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
                    >
                        <div className="space-y-0.5">
                            <h4 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Feedback</h4>
                            <p className="text-xs opacity-70" style={{ color: colors.textSecondary }}>Help us improve your dashboard.</p>
                        </div>
                        <button
                            onClick={() => onNavigate('feedback')}
                            className="px-4 py-2 rounded-full font-semibold text-xs hover:scale-105 active:scale-95 transition-transform"
                            style={{ backgroundColor: colors.textPrimary, color: '#FFFFFF' }}
                        >
                            Send
                        </button>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};


