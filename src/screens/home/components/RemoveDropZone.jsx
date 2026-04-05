import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export const RemoveDropZone = ({ children, isDark, isActive }) => {
    const { setNodeRef, isOver } = useDroppable({ id: '__remove_zone__' });
    const highlight = isActive && isOver;
    return (
        <div
            ref={setNodeRef}
            className="rounded-2xl transition-all duration-200"
            style={{
                padding: highlight ? 12 : 8,
                backgroundColor: highlight
                    ? (isDark ? 'rgba(184,92,92,0.15)' : 'rgba(184,92,92,0.08)')
                    : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.02)'),
                border: highlight
                    ? '2px dashed rgba(184,92,92,0.5)'
                    : `1px dashed ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
            }}
        >
            {highlight && (
                <p className="text-xs font-semibold text-center mb-2" style={{ color: 'var(--theme-error)' }}>
                    Drop here to remove
                </p>
            )}
            {children}
        </div>
    );
};
