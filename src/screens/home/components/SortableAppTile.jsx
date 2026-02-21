// Extracted from HomeScreen.jsx — Draggable app tile for home screen grid
import React from 'react';
import { useSortable, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Lock } from 'lucide-react';

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
        minHeight: 104
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl cursor-grab active:cursor-grabbing"
            role="listitem"
            aria-label={`${app.name} app tile${isDragging ? ', dragging' : ''}`}
        >
            <div className="absolute top-2 left-2 opacity-30" aria-hidden="true">
                <GripVertical className="w-3 h-3" style={{ color: colors.textSecondary }} />
            </div>

            {!isOverlay && !isRemoveLocked && (
                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isRemoveDisabled) onRemove(app.route);
                    }}
                    className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-white flex items-center justify-center shadow-md z-10 transition-all ${isRemoveDisabled ? 'bg-gray-300 cursor-not-allowed' : 'hover:scale-110'}`}
                    style={!isRemoveDisabled ? { backgroundColor: '#B85C5C' } : undefined}
                    aria-label={`Remove ${app.name}`}
                    aria-disabled={isRemoveDisabled}
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}

            {!isOverlay && isRemoveLocked && (
                <div
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center shadow-md z-10"
                    aria-label={`${app.name} is pinned`}
                >
                    <Lock className="w-3.5 h-3.5" />
                </div>
            )}

            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
                style={{ backgroundColor: `${colors.accent}10` }}
            >
                <app.icon className="w-5 h-5" style={{ color: colors.accent }} />
            </div>

            <span
                className="text-xs font-semibold tracking-tight text-center leading-tight line-clamp-2 w-full px-1"
                style={{ color: colors.textPrimary }}
            >
                {app.name}
            </span>
        </div>
    );
});

SortableAppTile.displayName = 'SortableAppTile';
