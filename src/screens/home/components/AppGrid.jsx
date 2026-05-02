import React from 'react';
import { Check, Plus, Settings2, ChevronRight } from 'lucide-react';
import {
    DndContext,
    DragOverlay,
    MeasuringStrategy,
    closestCenter,
} from '@dnd-kit/core';
import {
    SortableContext,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableAppTile } from './SortableAppTile.jsx';
import { getAppBadge, APP_ICON_COLORS, MIN_PINNED_APPS, NON_REMOVABLE_APPS } from '../utils/homeUtils.js';

export const AppGrid = ({
    isEditMode,
    setIsEditMode,
    currentApps,
    availableApps,
    safeHomeApps,
    setActiveDragId,
    activeApp,
    sensors,
    handleReorder,
    toggleApp,
    onUpdateHomeApps,
    onNavigate,
    colors,
    isDark,
    appGridCols,
    recentOrders,
    posts,
    leadTimeFavoritesData,
    samplesCartCount,
    opportunities,
    replacementRequests
}) => {
    if (isEditMode) {
        const editGridApps = currentApps.filter(a => a.route !== 'resources');
        const editResourcesApp = currentApps.find(a => a.route === 'resources');
        const editResourcesIconColor = APP_ICON_COLORS['resources'] || colors.accent;
        // Resources is excluded from dragging — only movable apps are sortable
        const sortableIds = safeHomeApps.filter(r => r !== 'resources');

        return (
            <>
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
                <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
                    <div className={`grid gap-2.5 sm:gap-3 ${appGridCols.edit}`}>
                        {editGridApps.map((app) => (
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

                {/* Done CTA */}
                {onUpdateHomeApps && (
                    <div className="flex justify-center pt-3">
                        <button
                            onClick={() => setIsEditMode(false)}
                            aria-label="Done customizing"
                            className="flex items-center gap-2 px-6 py-2 rounded-full transition-all active:scale-95"
                            style={{
                                backgroundColor: colors.accent,
                                color: colors.accentText || (isDark ? '#000' : '#fff'),
                            }}
                        >
                            <Check className="w-3.5 h-3.5" />
                            <span className="text-sm font-bold tracking-wide">Done</span>
                        </button>
                    </div>
                )}

                {/* Available apps — discrete list */}
                <AvailableAppsList
                    availableApps={availableApps}
                    toggleApp={toggleApp}
                    colors={colors}
                    isDark={isDark}
                />

                <DragOverlay>
                    {activeApp ? (
                        <div style={{ width: 88 }}>
                            <div
                                className="relative flex flex-col items-center justify-center gap-1.5 p-2.5 sm:p-3 rounded-2xl"
                                style={{
                                    backgroundColor: colors.tileSurface,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                    minHeight: 88,
                                }}
                            >
                                <div
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${(APP_ICON_COLORS[activeApp.route] || colors.accent)}10` }}
                                >
                                    <activeApp.icon className="w-[18px] h-[18px] sm:w-5 sm:h-5" style={{ color: APP_ICON_COLORS[activeApp.route] || colors.accent }} />
                                </div>
                                <span
                                    className="text-[0.8125rem] sm:text-sm font-semibold tracking-tight text-center leading-tight line-clamp-2 w-full px-0.5"
                                    style={{ color: colors.textPrimary }}
                                >
                                    {activeApp.name}
                                </span>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
            </>
        );
    }

    const gridApps = currentApps.filter(a => a.route !== 'resources');
    const resourcesApp = currentApps.find(a => a.route === 'resources');
    const resourcesIconColor = APP_ICON_COLORS['resources'] || colors.accent;

    // Customize goes in the grid when it fills a row cleanly, or when total
    // would be exactly 4 (so we get a clean 2×2 instead of 3-wide with orphan).
    const wouldBeWithCustomize = gridApps.length + 1;
    const customizeInGrid = onUpdateHomeApps && (
        wouldBeWithCustomize === 4 || gridApps.length % 3 !== 0
    );
    const itemsInGrid = gridApps.length + (customizeInGrid ? 1 : 0);
    const GRID_COLS_MAP = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-2', 5: 'grid-cols-3 sm:grid-cols-5', 6: 'grid-cols-3', 7: 'grid-cols-3 sm:grid-cols-4', 8: 'grid-cols-3 sm:grid-cols-4', 9: 'grid-cols-3' };
    const gridColsClass = GRID_COLS_MAP[itemsInGrid] || 'grid-cols-3 sm:grid-cols-4';

    return (
        <>
            <div className={`grid gap-2.5 sm:gap-3 ${gridColsClass}`}>
                {gridApps.map((app) => {
                    const badge = getAppBadge(app.route, recentOrders, posts, leadTimeFavoritesData, samplesCartCount, opportunities, replacementRequests);
                    const iconColor = APP_ICON_COLORS[app.route] || colors.accent;
                    return (
                        <button
                            key={app.route}
                            onClick={() => onNavigate(app.route)}
                            aria-label={`Open ${app.name}`}
                            className="relative flex flex-col items-center justify-center rounded-2xl transition-all active:scale-95 group gap-1.5 p-2.5 sm:p-3"
                            style={{
                                minHeight: 88,
                                backgroundColor: colors.tileSurface,
                                border: isDark ? '1px solid rgba(255,255,255,0.10)' : 'none',
                            }}
                        >
                            <div
                                className="rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 w-9 h-9 sm:w-10 sm:h-10"
                                style={{ backgroundColor: `${iconColor}10` }}
                            >
                                <app.icon className="w-[18px] h-[18px] sm:w-5 sm:h-5" style={{ color: iconColor }} />
                            </div>
                            <span className="text-[0.8125rem] sm:text-sm font-semibold tracking-tight text-center leading-tight line-clamp-2 px-0.5" style={{ color: colors.textPrimary }}>
                                {app.name}
                            </span>
                            {badge && (
                                <div
                                    className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full font-bold"
                                    style={{
                                        fontSize: '0.625rem',
                                        backgroundColor: `${badge.color}20`,
                                        color: badge.color,
                                        border: `1px solid ${badge.color}35`,
                                    }}
                                >
                                    {badge.value}
                                </div>
                            )}
                        </button>
                    );
                })}

                {/* Customize ghost tile — only when it fills a row cleanly */}
                {customizeInGrid && (
                    <button
                        onClick={() => setIsEditMode(true)}
                        aria-label="Customize home apps"
                        className="relative flex flex-col items-center justify-center rounded-2xl transition-all active:scale-95 gap-1.5 p-2.5 sm:p-3"
                        style={{
                            minHeight: 88,
                            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)',
                        }}
                    >
                        <div
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                        >
                            <Settings2 className="w-[18px] h-[18px] sm:w-5 sm:h-5" style={{ color: colors.textSecondary, opacity: 0.32 }} />
                        </div>
                        <span className="text-[0.8125rem] sm:text-sm font-semibold tracking-tight" style={{ color: colors.textSecondary, opacity: 0.32 }}>
                            Customize
                        </span>
                    </button>
                )}
            </div>

            {/* Resources — wide bar below the grid */}
            {resourcesApp && (
                <button
                    onClick={() => onNavigate('resources')}
                    aria-label="Open Resources"
                    className="w-full flex items-center gap-3 px-3.5 mt-2.5 sm:mt-3 rounded-2xl transition-all active:scale-[0.98] group"
                    style={{
                        height: 56,
                        backgroundColor: colors.tileSurface,
                        border: isDark ? '1px solid rgba(255,255,255,0.10)' : 'none',
                    }}
                >
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                        style={{ backgroundColor: `${resourcesIconColor}12` }}
                    >
                        <resourcesApp.icon className="w-[18px] h-[18px]" style={{ color: resourcesIconColor }} />
                    </div>
                    <span className="text-[0.8125rem] font-semibold" style={{ color: colors.textPrimary }}>Resources</span>
                    <ChevronRight className="w-4 h-4 ml-auto opacity-20 group-hover:opacity-40 transition-opacity" style={{ color: colors.textSecondary }} />
                </button>
            )}

            {/* Customize pill — fallback when it can't fill a grid row cleanly */}
            {onUpdateHomeApps && !customizeInGrid && (
                <div className="flex justify-center mt-2">
                    <button
                        onClick={() => setIsEditMode(true)}
                        aria-label="Customize home apps"
                        className="flex items-center gap-2 px-5 py-2 rounded-full transition-all active:scale-95"
                        style={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                            color: colors.textSecondary,
                        }}
                    >
                        <Settings2 className="w-3.5 h-3.5" style={{ opacity: 0.45 }} />
                        <span className="text-xs font-semibold" style={{ opacity: 0.45 }}>Customize</span>
                    </button>
                </div>
            )}
        </>
    );
};

/* ── Available apps to add ──── */
const AvailableAppsList = ({ availableApps, toggleApp, colors, isDark }) => {
    if (availableApps.length === 0) {
        return (
            <div className="text-center py-3">
                <span className="text-[0.625rem] font-semibold uppercase tracking-widest" style={{ color: colors.textSecondary, opacity: 0.35 }}>All apps added</span>
            </div>
        );
    }

    return (
        <div className="pt-3">
            <p className="text-[0.625rem] font-bold uppercase tracking-widest px-0.5 mb-2" style={{ color: colors.textSecondary, opacity: 0.38 }}>
                Add to Home
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                {availableApps.map((app) => (
                    <button
                        key={app.route}
                        onClick={() => toggleApp(app.route)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.97]"
                        style={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            color: colors.textSecondary,
                        }}
                    >
                        <Plus className="w-3 h-3 shrink-0" style={{ opacity: 0.3 }} />
                        <span className="truncate text-left">{app.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
