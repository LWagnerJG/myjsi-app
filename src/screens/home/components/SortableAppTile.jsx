// Extracted from HomeScreen.jsx — Draggable app tile for home screen grid
import React from 'react';
import { useSortable, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Lock } from 'lucide-react';
import { APP_ICON_COLORS } from '../utils/homeUtils.js';

export const SortableAppTile = React.memo(({ id, app, colors, onRemove, isRemoveDisabled = false, isRemoveLocked = false, isOverlay = false }) => {
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
        backgroundColor: `${colors.tileSurface || colors.surface}`,
        boxShadow: isOverlay ? '0 8px 24px rgba(0,0,0,0.1)' : (isDragging ? '0 4px 12px rgba(0,0,0,0.08)' : 'none'),
        opacity: isDragging ? 0.9 : 1,
        zIndex: isDragging ? 20 : 'auto',
        touchAction: 'none',
        width: '100%',
        minWidth: 0,
        minHeight: 88
    };

    const iconColor = APP_ICON_COLORS[app.route] || colors.accent;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative flex flex-col items-center justify-center gap-1.5 p-2.5 sm:p-3 rounded-2xl cursor-grab active:cursor-grabbing"
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
                    className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white flex items-center justify-center shadow-sm z-10 transition-all ${isRemoveDisabled ? 'bg-gray-300 cursor-not-allowed' : 'hover:scale-110'}`}
                    style={!isRemoveDisabled ? { backgroundColor: '#B85C5C' } : undefined}
                    aria-label={`Remove ${app.name}`}
                    aria-disabled={isRemoveDisabled}
                >
                    <X className="w-3 h-3" />
                </button>
            )}

            {!isOverlay && isRemoveLocked && (
                <div
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-sm z-10"
                    style={{ backgroundColor: colors.tileSurface, border: '1px solid rgba(0,0,0,0.08)' }}
                    aria-label={`${app.name} is pinned`}
                >
                    <Lock className="w-2.5 h-2.5" style={{ color: colors.textSecondary, opacity: 0.5 }} />
                </div>
            )}

            <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${iconColor}10` }}
            >
                <app.icon className="w-[18px] h-[18px] sm:w-5 sm:h-5" style={{ color: iconColor }} />
            </div>

            <span
                className="text-xs sm:text-[13px] font-semibold tracking-tight text-center leading-tight line-clamp-2 w-full px-0.5"
                style={{ color: colors.textPrimary }}
            >
                {app.name}
            </span>
        </div>
    );
});

SortableAppTile.displayName = 'SortableAppTile';
