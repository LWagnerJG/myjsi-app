import React, { useState, useEffect } from 'react';
import { Check, Plus, Settings2, Info, ChevronRight } from 'lucide-react';
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

                {/* Resources — static pinned bar, not part of the drag area */}
                {editResourcesApp && (
                    <div
                        className="w-full flex items-center gap-3 px-3.5 mt-2.5 sm:mt-3 rounded-2xl"
                        style={{
                            height: 52,
                            backgroundColor: colors.tileSurface,
                            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
                            opacity: 0.55,
                        }}
                    >
                        <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${editResourcesIconColor}10` }}
                        >
                            <editResourcesApp.icon className="w-[16px] h-[16px]" style={{ color: editResourcesIconColor }} />
                        </div>
                        <span className="text-[0.8125rem] font-semibold" style={{ color: colors.textPrimary }}>Resources</span>
                        <span
                            className="ml-auto text-[0.625rem] font-bold uppercase tracking-widest"
                            style={{ color: colors.textSecondary }}
                        >
                            Always included
                        </span>
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

    // Put Customize in the grid only when it won't sit alone in the last row.
    // gridApps.length % 3 === 0 means adding one more gives remainder 1 → alone.
    const customizeInGrid = onUpdateHomeApps && (gridApps.length % 3 !== 0);
    const itemsInGrid = gridApps.length + (customizeInGrid ? 1 : 0);
    const GRID_COLS_MAP = { 3: 'grid-cols-3', 4: 'grid-cols-3 sm:grid-cols-4', 5: 'grid-cols-3 sm:grid-cols-5', 6: 'grid-cols-3', 7: 'grid-cols-3 sm:grid-cols-4', 8: 'grid-cols-3 sm:grid-cols-4', 9: 'grid-cols-3' };
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
                            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
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
                            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
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
    const [activeRoute, setActiveRoute] = useState(null);

    // Auto-dismiss after 3s
    useEffect(() => {
        if (!activeRoute) return;
        const t = setTimeout(() => setActiveRoute(null), 3000);
        return () => clearTimeout(t);
    }, [activeRoute]);

    if (availableApps.length === 0) {
        return (
            <div className="text-center py-3">
                <span className="text-xs font-medium" style={{ color: colors.textSecondary, opacity: 0.5 }}>All apps added</span>
            </div>
        );
    }

    return (
        <div className="pt-0.5">
            <div
                className="flex items-center gap-1.5 px-1 mb-1"
                style={{ color: colors.textSecondary, opacity: 0.56 }}
            >
                <div
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                    style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.04)',
                        border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.04)',
                    }}
                >
                    <Plus className="w-2.5 h-2.5" style={{ opacity: 0.7 }} />
                </div>
                <p className="text-xs font-semibold tracking-[0.02em]">
                    Tap an app below to add it to Home
                </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {availableApps.map((app) => {
                    const isActive = activeRoute === app.route;
                    return (
                        <div key={app.route}>
                            <button
                                onClick={() => toggleApp(app.route)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all active:scale-[0.97]"
                                style={{
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)',
                                    color: colors.textSecondary,
                                    border: isActive
                                        ? `1px solid ${colors.accent}30`
                                        : `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.04)'}`,
                                }}
                            >
                                <Plus className="w-3.5 h-3.5 opacity-30 shrink-0" />
                                <span className="truncate text-left flex-1">{app.name}</span>
                                {app.desc && (
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setActiveRoute(isActive ? null : app.route);
                                        }}
                                        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all"
                                        style={{
                                            opacity: isActive ? 0.6 : 0.18,
                                            backgroundColor: isActive ? `${colors.accent}12` : 'transparent',
                                        }}
                                    >
                                        <Info className="w-2.5 h-2.5" style={{ color: isActive ? colors.accent : colors.textSecondary }} />
                                    </span>
                                )}
                            </button>
                            {/* Inline description — slides open under this specific pill */}
                            <div
                                className="overflow-hidden transition-all duration-200 ease-out"
                                style={{ maxHeight: isActive ? 28 : 0, opacity: isActive ? 1 : 0 }}
                            >
                                <p className="text-xs font-medium px-3 pt-1 pb-0.5 truncate" style={{ color: colors.textSecondary, opacity: 0.6 }}>
                                    {app.desc}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
