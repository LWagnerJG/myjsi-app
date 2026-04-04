// Extracted from HomeScreen.jsx — Draggable app tile for home screen grid
import React from 'react';
import { useSortable, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Lock } from 'lucide-react';
import { APP_ICON_COLORS } from '../utils/homeUtils.js';

export const SortableAppTile = React.memo(({ id, app, colors, isDark = false, onRemove, isRemoveDisabled = false, isRemoveLocked = false, isOverlay = false }) => {
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
        backgroundColor: colors.tileSurface || colors.surface,
        backdropFilter: 'blur(16px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.5)',
        border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.60)',
        boxShadow: isOverlay ? '0 8px 24px rgba(0,0,0,0.1)' : (isDragging ? '0 4px 12px rgba(0,0,0,0.08)' : 'none'),
        opacity: isDragging ? 0.9 : 1,
        zIndex: isDragging ? 20 : 'auto',
        touchAction: 'none',
        width: '100%',
        minWidth: 0,
        minHeight: 88,
        // Fixed px values so tile size never scales with Dynamic Type
        gap: 6,
        padding: '10px 10px',
    };

    const iconColor = APP_ICON_COLORS[app.route] || colors.accent;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative flex flex-col items-center justify-center rounded-[16px] cursor-grab active:cursor-grabbing"
            role="listitem"
            aria-label={`${app.name} app tile${isDragging ? ', dragging' : ''}`}
        >
            <div className="absolute top-1.5 left-1.5 opacity-20" aria-hidden="true">
                <GripVertical className="w-3 h-3" style={{ color: colors.textSecondary }} />
            </div>

            {!isOverlay && !isRemoveLocked && (
                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isRemoveDisabled) onRemove(app.route);
                    }}
                    className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center z-10 transition-all ${isRemoveDisabled ? 'cursor-not-allowed' : 'hover:scale-110 active:scale-90'}`}
                    style={{
                        backgroundColor: isRemoveDisabled ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)') : 'rgba(184,92,92,0.85)',
                        color: isRemoveDisabled ? colors.textSecondary : '#fff',
                    }}
                    aria-label={`Remove ${app.name}`}
                    aria-disabled={isRemoveDisabled}
                >
                    <X className="w-2.5 h-2.5" />
                </button>
            )}

            {!isOverlay && isRemoveLocked && (
                <div
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center z-10"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}
                    aria-label={`${app.name} is pinned`}
                >
                    <Lock className="w-2 h-2" style={{ color: colors.textSecondary, opacity: 0.4 }} />
                </div>
            )}

            <div
                className="rounded-[10px] flex items-center justify-center"
                style={{ width: 40, height: 40, backgroundColor: `${iconColor}10`, flexShrink: 0 }}
            >
                <app.icon style={{ width: 20, height: 20, color: iconColor }} />
            </div>

            <span
                className="font-semibold tracking-tight text-center leading-tight line-clamp-2 w-full px-0.5"
                style={{ color: colors.textPrimary, fontSize: 13 }}
            >
                {app.name}
            </span>
        </div>
    );
});

SortableAppTile.displayName = 'SortableAppTile';
