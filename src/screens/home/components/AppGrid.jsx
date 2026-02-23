import React from 'react';
import { Check, Plus, Settings2 } from 'lucide-react';
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
import { RemoveDropZone } from './RemoveDropZone.jsx';
import { getAppBadge, MIN_PINNED_APPS, NON_REMOVABLE_APPS } from '../utils/homeUtils.js';

export const AppGrid = ({
    isEditMode,
    setIsEditMode,
    currentApps,
    availableApps,
    safeHomeApps,
    activeDragId,
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
    samplesCartCount
}) => {
    if (isEditMode) {
        return (
            <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging } }}
                onDragStart={(event) => setActiveDragId(event.active?.id || null)}
                onDragEnd={(event) => {
                    const { active, over } = event;
                    // If dropped on the remove zone, remove the app
                    if (over?.id === '__remove_zone__' && active?.id) {
                        if (!NON_REMOVABLE_APPS.has(active.id) && safeHomeApps.length > MIN_PINNED_APPS) {
                            onUpdateHomeApps(safeHomeApps.filter(r => r !== active.id));
                        }
                    } else {
                        handleReorder(event);
                    }
                    setActiveDragId(null);
                }}
                onDragCancel={() => setActiveDragId(null)}
            >
                <SortableContext items={safeHomeApps} strategy={rectSortingStrategy}>
                    <div className={`grid gap-1.5 sm:gap-2 ${appGridCols.edit}`}>
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

                {/* Add / Remove zone */}
                <div className="space-y-1.5 pt-3">
                    <div className="text-xs font-medium px-0.5" style={{ color: colors.textSecondary, opacity: 0.5 }}>Tap to add apps to your home</div>
                    <RemoveDropZone isDark={isDark} isActive={!!activeDragId}>
                        <div className={`grid gap-1.5 ${appGridCols.edit}`}>
                            {availableApps.map((app) => (
                                <button
                                    key={app.route}
                                    onClick={() => toggleApp(app.route)}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(53,53,53,0.07)',
                                        color: colors.textSecondary,
                                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                                    }}
                                >
                                    <Plus className="w-3 h-3 opacity-50 shrink-0" />
                                    <span className="truncate text-left">{app.name}</span>
                                </button>
                            ))}
                            {availableApps.length === 0 && (
                                <span className="text-xs py-1 col-span-full text-center" style={{ color: colors.textSecondary, opacity: 0.5 }}>All apps added</span>
                            )}
                        </div>
                    </RemoveDropZone>
                </div>

                <DragOverlay>
                    {activeApp ? (
                        <div style={{ width: 104 }}>
                            <div
                                className="relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl"
                                style={{
                                    backgroundColor: colors.tileSurface,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                    minHeight: 104,
                                }}
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-0.5"
                                    style={{ backgroundColor: `${colors.accent}10` }}
                                >
                                    <activeApp.icon className="w-5 h-5" style={{ color: colors.accent }} />
                                </div>
                                <span
                                    className="text-xs font-semibold tracking-tight text-center leading-tight line-clamp-2 w-full px-1"
                                    style={{ color: colors.textPrimary }}
                                >
                                    {activeApp.name}
                                </span>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Done CTA */}
            {onUpdateHomeApps && (
                <div className="flex justify-center pt-3 pb-1">
                    <button
                        onClick={() => setIsEditMode(false)}
                        aria-label="Done customizing"
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full transition-all active:scale-95"
                        style={{
                            backgroundColor: colors.accent,
                            color: isDark ? '#000' : '#fff',
                        }}
                    >
                        <Check className="w-4 h-4" />
                        <span className="text-xs font-bold tracking-wide">Done</span>
                    </button>
                </div>
            )}
            </>
        );
    }

    return (
        <>
            <div className={`grid gap-1.5 sm:gap-2 ${appGridCols.view}`}>
                {currentApps.map((app) => {
                    const badge = getAppBadge(app.route, recentOrders, posts, leadTimeFavoritesData, samplesCartCount);
                    return (
                        <button
                            key={app.route}
                            onClick={() => onNavigate(app.route)}
                            aria-label={`Open ${app.name}`}
                            className="relative flex flex-col items-center justify-center rounded-2xl transition-all active:scale-95 group gap-1.5 p-2.5 sm:p-3"
                            style={{
                                minHeight: 88,
                                backgroundColor: colors.tileSurface,
                                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                            }}
                        >
                            <div
                                className="rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 w-9 h-9 sm:w-10 sm:h-10"
                                style={{ backgroundColor: `${colors.accent}10` }}
                            >
                                <app.icon className="w-[18px] h-[18px] sm:w-5 sm:h-5" style={{ color: colors.accent }} />
                            </div>
                            <span className="text-xs sm:text-[13px] font-semibold tracking-tight text-center leading-tight line-clamp-2 px-0.5" style={{ color: colors.textPrimary }}>
                                {app.name}
                            </span>
                            {badge && (
                                <div
                                    className="absolute top-1.5 right-1.5 px-1.5 py-[1px] rounded-full text-[10px] font-bold"
                                    style={{
                                        backgroundColor: `${badge.color}18`,
                                        color: badge.color,
                                        border: `1px solid ${badge.color}30`,
                                    }}
                                >
                                    {badge.value}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
            {/* Customize CTA */}
            {onUpdateHomeApps && (
                <div className="flex justify-center pt-2.5 pb-1">
                    <button
                        onClick={() => setIsEditMode(true)}
                        aria-label="Customize home apps"
                        className="flex items-center gap-2 px-5 py-2 rounded-full transition-all active:scale-95"
                        style={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                            color: colors.textSecondary,
                        }}
                    >
                        <Settings2 className="w-3.5 h-3.5" style={{ opacity: 0.6 }} />
                        <span className="text-[11px] font-bold tracking-wide">Customize</span>
                    </button>
                </div>
            )}
        </>
    );
};
