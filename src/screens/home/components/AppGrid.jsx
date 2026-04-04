import React, { useState, useEffect } from 'react';
import { Check, Plus, Settings2, Info } from 'lucide-react';
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
                    handleReorder(event);
                    setActiveDragId(null);
                }}
                onDragCancel={() => setActiveDragId(null)}
            >
                <SortableContext items={safeHomeApps} strategy={rectSortingStrategy}>
                    <div className={`grid gap-[10px] sm:gap-[12px] ${appGridCols.view}`}>
                        {currentApps.map((app) => (
                            <SortableAppTile
                                key={app.route}
                                id={app.route}
                                app={app}
                                colors={colors}
                                isDark={isDark}
                                onRemove={toggleApp}
                                isRemoveDisabled={safeHomeApps.length <= MIN_PINNED_APPS}
                                isRemoveLocked={NON_REMOVABLE_APPS.has(app.route)}
                            />
                        ))}
                    </div>
                </SortableContext>

                {/* Done CTA — compact, right-aligned */}
                {onUpdateHomeApps && (
                    <div className="flex justify-end pt-2 pb-0 pr-0.5">
                        <button
                            onClick={() => setIsEditMode(false)}
                            aria-label="Done customizing"
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all active:scale-95"
                            style={{
                                backgroundColor: colors.accent,
                                color: colors.accentText || (isDark ? '#000' : '#fff'),
                            }}
                        >
                            <Check className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-bold tracking-wide">Done</span>
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
                                className="relative flex flex-col items-center justify-center rounded-[16px]"
                                style={{
                                    gap: 6,
                                    padding: '10px 10px',
                                    backgroundColor: colors.tileSurface,
                                    backdropFilter: 'blur(16px) saturate(1.5)',
                                    WebkitBackdropFilter: 'blur(16px) saturate(1.5)',
                                    border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.60)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                    minHeight: 88,
                                }}
                            >
                                <div
                                    className="rounded-[10px] flex items-center justify-center"
                                    style={{ width: 40, height: 40, backgroundColor: `${(APP_ICON_COLORS[activeApp.route] || colors.accent)}10` }}
                                >
                                    <activeApp.icon style={{ width: 20, height: 20, color: APP_ICON_COLORS[activeApp.route] || colors.accent }} />
                                </div>
                                <span
                                    className="font-semibold tracking-tight text-center leading-tight line-clamp-2 w-full px-0.5"
                                    style={{ color: colors.textPrimary, fontSize: 13 }}
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

    return (
        <>
            <div className={`grid gap-[10px] sm:gap-[12px] ${appGridCols.view}`}>
                {currentApps.map((app) => {
                    const badge = getAppBadge(app.route, recentOrders, posts, leadTimeFavoritesData, samplesCartCount);
                    const iconColor = APP_ICON_COLORS[app.route] || colors.accent;
                    return (
                        <button
                            key={app.route}
                            onClick={() => onNavigate(app.route)}
                            aria-label={`Open ${app.name}`}
                            className="relative flex flex-col items-center justify-center rounded-[16px] transition-all active:scale-95 group"
                            style={{
                                minHeight: 88,
                                gap: 6,
                                padding: '10px 10px',
                                backgroundColor: colors.tileSurface,
                                backdropFilter: 'blur(16px) saturate(1.5)',
                                WebkitBackdropFilter: 'blur(16px) saturate(1.5)',
                                border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.60)',
                            }}
                        >
                            <div
                                className="rounded-[10px] flex items-center justify-center transition-transform group-hover:scale-105"
                                style={{ width: 40, height: 40, backgroundColor: `${iconColor}10`, flexShrink: 0 }}
                            >
                                <app.icon style={{ width: 20, height: 20, color: iconColor }} />
                            </div>
                            <span className="font-semibold tracking-tight text-center leading-tight line-clamp-2 w-full px-0.5"
                                style={{ color: colors.textPrimary, fontSize: 13 }}>
                                {app.name}
                            </span>
                            {badge && (
                                <div
                                    className="absolute rounded-full font-bold"
                                    style={{
                                        top: 6, right: 6,
                                        padding: '1px 6px',
                                        fontSize: 10,
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
                <span className="text-[11px] font-medium" style={{ color: colors.textSecondary, opacity: 0.5 }}>All apps added</span>
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
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)',
                    }}
                >
                    <Plus className="w-2.5 h-2.5" style={{ opacity: 0.7 }} />
                </div>
                <p className="text-[10px] font-semibold tracking-[0.02em]">
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
                                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-2xl text-[12px] font-semibold transition-all active:scale-[0.97]"
                                style={{
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                                    color: colors.textSecondary,
                                    border: isActive
                                        ? `1px solid ${colors.accent}30`
                                        : `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`,
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
                                <p className="text-[10px] font-medium px-3 pt-1 pb-0.5 truncate" style={{ color: colors.textSecondary, opacity: 0.6 }}>
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
