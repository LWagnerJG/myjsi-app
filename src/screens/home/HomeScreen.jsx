// Enhanced HomeScreen with Dealer Dashboard design and reconfiguration functionality
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { allApps, DEFAULT_HOME_APPS } from '../../data.jsx';
import { ORDER_DATA } from '../orders/data.js';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { HomeSearchInput } from '../../components/common/SearchInput.jsx';
import { QuickActionDropdown } from '../../components/common/QuickActionDropdown.jsx';
import { RequestQuoteModal } from '../../components/common/RequestQuoteModal.jsx';
import { DESIGN_TOKENS } from '../../design-system/tokens.js';
import { Check, Plus, X, Settings as SettingsIcon, GripVertical, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    KeyboardSensor,
    MeasuringStrategy,
    closestCenter,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    SortableContext,
    rectSortingStrategy,
    useSortable,
    arrayMove,
    sortableKeyboardCoordinates,
    defaultAnimateLayoutChanges
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Badge data for specific app routes
const APP_BADGES = {
    'sales': { value: '$1.2M', label: 'YTD', color: '#4A7C59' },
    'projects': { value: '24', label: 'Open', color: '#5B7B8C' }
};

const MIN_PINNED_APPS = 3;
const MAX_PINNED_APPS = 12;
const NON_REMOVABLE_APPS = new Set(['resources']);
const EXCLUDED_ROUTES = new Set(['settings', 'feedback', 'help', 'contracts', 'members', 'resources/dealer_registration']);

const areArraysEqual = (a, b) => {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};

const SortableAppTile = ({ id, app, colors, onRemove, isRemoveDisabled = false, isRemoveLocked = false, isOverlay = false }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        animateLayoutChanges: (args) => {
            if (isOverlay) return false;
            return defaultAnimateLayoutChanges({
                ...args,
                isSorting: true
            });
        }
    });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? undefined : transition,
        backgroundColor: `${colors.surface}`,
        borderColor: isDragging ? colors.accent : colors.border,
        boxShadow: isOverlay ? '0 18px 32px rgba(0,0,0,0.16)' : (isDragging ? '0 8px 16px rgba(0,0,0,0.1)' : DESIGN_TOKENS.shadows.card),
        opacity: isDragging ? 0.9 : 1,
        zIndex: isDragging ? 20 : 'auto',
        touchAction: 'none', // Critical for pointer interactions
        width: '100%',
        minWidth: 0,
        minHeight: 96
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative flex flex-col items-center justify-center gap-1 p-2.5 rounded-2xl border cursor-grab active:cursor-grabbing"
        >
            {/* Draggable Indicator (Subtle) */}
            <div className="absolute top-2 left-2 opacity-30">
                <GripVertical className="w-3 h-3" style={{ color: colors.textSecondary }} />
            </div>

            {/* Remove Button */}
            {!isOverlay && !isRemoveLocked && (
                <button
                    // Stop propagation so clicking X doesn't start a drag
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isRemoveDisabled) onRemove(app.route);
                    }}
                    className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-white flex items-center justify-center shadow-md z-10 transition-all ${isRemoveDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 hover:scale-110'}`}
                    aria-label="Remove app"
                    aria-disabled={isRemoveDisabled}
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}

            {!isOverlay && isRemoveLocked && (
                <div
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center shadow-md z-10"
                    aria-label="Pinned app"
                >
                    <Lock className="w-3.5 h-3.5" />
                </div>
            )}

            {/* App Icon */}
            <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center mb-0.5" 
                style={{ backgroundColor: `${colors.accent}12` }}
            >
                <app.icon className="w-4 h-4" style={{ color: colors.accent }} />
            </div>

            {/* App Name */}
            <span 
                className="text-[10px] font-bold tracking-tight text-center leading-3 line-clamp-2 w-full px-1" 
                style={{ color: colors.textPrimary }}
            >
                {app.name}
            </span>
        </div>
    );
};

export const HomeScreen = ({ theme, onNavigate, onAskAI, onVoiceActivate, homeApps, onUpdateHomeApps, userSettings }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeDragId, setActiveDragId] = useState(null);
    const [showQuoteModal, setShowQuoteModal] = useState(false);

    // Handle quick action selection from dropdown
    const handleQuickAction = useCallback((actionId) => {
        switch (actionId) {
            case 'quote':
                setShowQuoteModal(true);
                break;
            case 'upload':
                // Could trigger a file upload modal or navigate
                console.log('Upload action');
                break;
            case 'spec':
                // Navigate to spec check or open modal
                onNavigate?.('resources');
                break;
            case 'feedback':
                onNavigate?.('feedback');
                break;
            default:
                break;
        }
    }, [onNavigate]);

    // Safe theme color extraction with fallbacks
    const colors = useMemo(() => ({
        background: theme?.colors?.background || '#F0EDE8',
        surface: theme?.colors?.surface || '#FFFFFF',
        accent: theme?.colors?.accent || '#353535',
        textPrimary: theme?.colors?.textPrimary || '#353535',
        textSecondary: theme?.colors?.textSecondary || '#666666',
        border: theme?.colors?.border || '#E3E0D8'
    }), [theme]);

    const allAppRoutes = useMemo(() => new Set(allApps.map(app => app.route)), []);

    const normalizeHomeApps = useCallback((list) => {
        const baseList = Array.isArray(list) ? list : [];
        const unique = baseList.filter((route, index) => baseList.indexOf(route) === index);
        const known = unique.filter(route => allAppRoutes.has(route));
        const withResources = known.includes('resources') ? known : ['resources', ...known];
        return withResources.length ? withResources : DEFAULT_HOME_APPS;
    }, [allAppRoutes]);

    // Ensure homeApps is always a valid array
    const safeHomeApps = useMemo(() => {
        return normalizeHomeApps(homeApps);
    }, [homeApps, normalizeHomeApps]);

    useEffect(() => {
        if (!onUpdateHomeApps) return;
        if (!Array.isArray(homeApps)) return;
        const normalized = normalizeHomeApps(homeApps);
        if (!areArraysEqual(homeApps, normalized)) {
            onUpdateHomeApps(normalized);
        }
    }, [homeApps, normalizeHomeApps, onUpdateHomeApps]);

    const currentApps = useMemo(() => {
        return safeHomeApps.map(route => allApps.find(a => a.route === route)).filter(Boolean);
    }, [safeHomeApps]);

    const availableApps = useMemo(() => {
        return allApps.filter(app => !safeHomeApps.includes(app.route) && !EXCLUDED_ROUTES.has(app.route));
    }, [safeHomeApps]);

    const toggleApp = useCallback((route) => {
        if (!onUpdateHomeApps) return; // Guard against missing prop
        if (NON_REMOVABLE_APPS.has(route)) return; // Resources is always pinned
        if (safeHomeApps.includes(route)) {
            if (safeHomeApps.length > MIN_PINNED_APPS) {
                onUpdateHomeApps(safeHomeApps.filter(r => r !== route));
            }
        } else {
            if (safeHomeApps.length < MAX_PINNED_APPS) {
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
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleReorder = useCallback((event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        if (!onUpdateHomeApps) return;
        const oldIndex = safeHomeApps.indexOf(active.id);
        const newIndex = safeHomeApps.indexOf(over.id);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
        onUpdateHomeApps(arrayMove(safeHomeApps, oldIndex, newIndex));
    }, [onUpdateHomeApps, safeHomeApps]);

    const activeApp = useMemo(() => {
        return allApps.find(app => app.route === activeDragId) || null;
    }, [activeDragId]);

    const todayLabel = useMemo(() => {
        const now = new Date();
        return now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    }, []);

    const recentOrders = useMemo(() => {
        return [...ORDER_DATA].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    }, []);

    return (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide app-header-offset" style={{ backgroundColor: colors.background }}>
            <div className="px-4 sm:px-6 lg:px-8 pt-1 sm:pt-2 pb-24 space-y-6 lg:space-y-8 max-w-5xl mx-auto w-full">

                {/* Header Section */}
                <div className="space-y-1 hidden sm:block">
                    <h2 className="text-4xl font-light tracking-tight" style={{ color: colors.textPrimary }}>Dashboard</h2>
                    <div className="text-sm font-normal" style={{ color: colors.textSecondary }}>{todayLabel}</div>
                </div>

                {/* Search / Spotlight */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-transparent rounded-full" />
                    <GlassCard
                        theme={theme}
                        className="relative z-10 px-5 flex items-center"
                        style={{
                            borderRadius: 9999,
                            height: 56,
                            paddingTop: 0,
                            paddingBottom: 0,
                            background: 'rgba(255, 255, 255, 0.75)',
                            border: '1px solid rgba(255, 255, 255, 0.7)',
                            boxShadow: 'none'
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
                        {/* Quick Actions Dropdown (Plus button) */}
                        <QuickActionDropdown 
                            theme={theme}
                            onActionSelect={handleQuickAction}
                            className="ml-2"
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
                                title={isEditMode ? 'Exit edit mode' : 'Customize home apps'}
                                aria-label={isEditMode ? 'Exit edit mode' : 'Customize home apps'}
                                className="flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all active:scale-95"
                                style={{
                                    backgroundColor: isEditMode ? colors.textPrimary : `${colors.surface}80`,
                                    color: isEditMode ? '#FFFFFF' : colors.textSecondary,
                                    border: `1px solid ${isEditMode ? colors.textPrimary : `${colors.border}B3`}`
                                }}
                            >
                                {isEditMode ? (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Done</span>
                                    </>
                                ) : (
                                    <>
                                        <GripVertical className="w-3.5 h-3.5" />
                                        <span>Reorder</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                    {isEditMode && (
                        <div
                            className="text-[10px] font-medium px-2.5 py-1 rounded-full border inline-flex items-center gap-2"
                            style={{ color: colors.textSecondary, borderColor: `${colors.border}B3`, backgroundColor: `${colors.surface}A6` }}
                        >
                            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.textSecondary }} />
                            Drag to reorder. Keep at least 3 apps pinned. Resources stays pinned.
                        </div>
                    )}

                    {isEditMode ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging } }}
                            onDragStart={(event) => setActiveDragId(event.active?.id || null)}
                            onDragEnd={(event) => {
                                handleReorder(event);
                                setActiveDragId(null);
                            }}
                            onDragCancel={() => setActiveDragId(null)}
                        >
                            <SortableContext items={safeHomeApps} strategy={rectSortingStrategy}>
                                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                                    {currentApps.map((app) => (
                                        <SortableAppTile
                                            key={app.route}
                                            id={app.route}
                                            app={app}
                                            colors={colors}
                                            onRemove={toggleApp}
                                            isRemoveDisabled={safeHomeApps.length <= MIN_PINNED_APPS}
                                            isRemoveLocked={NON_REMOVABLE_APPS.has(app.route)}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                            <DragOverlay>
                                {activeApp ? (
                                    <div className="w-[96px] sm:w-[104px] lg:w-[112px]">
                                        <div
                                            className="relative flex flex-col items-center justify-center gap-1 p-2.5 rounded-2xl border"
                                            style={{
                                                backgroundColor: colors.surface,
                                                borderColor: colors.accent,
                                                boxShadow: '0 18px 32px rgba(0,0,0,0.16)',
                                                width: '100%',
                                                minWidth: 0,
                                                minHeight: 96
                                            }}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-xl flex items-center justify-center mb-0.5"
                                                style={{ backgroundColor: `${colors.accent}12` }}
                                            >
                                                <activeApp.icon className="w-4 h-4" style={{ color: colors.accent }} />
                                            </div>
                                            <span
                                                className="text-[10px] font-bold tracking-tight text-center leading-3 line-clamp-2 w-full px-1"
                                                style={{ color: colors.textPrimary }}
                                            >
                                                {activeApp.name}
                                            </span>
                                        </div>
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
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
                                                className="absolute top-2 right-2 px-1.5 py-[1px] rounded-full text-[9px] font-bold border"
                                                style={{ 
                                                    backgroundColor: `${badge.color}15`, // Very subtle transparent background 
                                                    color: badge.color,
                                                    borderColor: `${badge.color}30`
                                                }}
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
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
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

            {/* Request Quote Modal */}
            <RequestQuoteModal
                show={showQuoteModal}
                onClose={() => setShowQuoteModal(false)}
                theme={theme}
                onSubmit={(data) => {
                    console.log('Quote request submitted:', data);
                    // Handle quote submission - could send to API
                }}
            />
        </div>
    );
};


