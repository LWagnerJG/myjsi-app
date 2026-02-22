import React, { useState, useRef, useEffect, useCallback } from 'react';

export const ProbabilitySlider = ({ value, onChange, theme, showLabel = true }) => {
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef(null);

    const updateFromClientX = useCallback((clientX) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const overshoot = 12; // allow dragging past left edge
        const x = clientX - rect.left;
        const pctRaw = ((x + overshoot) / (rect.width + overshoot)) * 100;
        const pct = Math.max(0, Math.min(100, pctRaw));
        let snapped = Math.round(pct / 5) * 5; // 0,5,10,...
        // Enforce 5% min for UX (never display 0%)
        if (snapped < 5) snapped = 5;
        onChange(snapped);
    }, [onChange]);

    const pointerDown = useCallback((clientX) => { setIsDragging(true); updateFromClientX(clientX); }, [updateFromClientX]);
    const onMouseDown = useCallback((e) => pointerDown(e.clientX), [pointerDown]);
    const onTouchStart = useCallback((e) => pointerDown(e.touches[0].clientX), [pointerDown]);
    const onMove = useCallback((clientX) => { if (isDragging) updateFromClientX(clientX); }, [isDragging, updateFromClientX]);
    const onMouseMove = useCallback((e) => onMove(e.clientX), [onMove]);
    const onTouchMove = useCallback((e) => onMove(e.touches[0].clientX), [onMove]);
    const endDrag = useCallback(() => setIsDragging(false), []);

    useEffect(() => {
        if (!isDragging) return;
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mouseup', endDrag, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchend', endDrag, { passive: true });
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', endDrag);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', endDrag);
        };
    }, [isDragging, onMouseMove, onTouchMove, endDrag]);

    const safeValue = typeof value === 'number' ? Math.max(5, Math.min(100, value)) : 50;

    return (
        <div className="space-y-2 w-full select-none">
            {showLabel && (
                <label className="text-sm font-semibold px-3" style={{ color: theme.colors.textSecondary }}>
                    Win Probability
                </label>
            )}
            <div className="relative pt-4 pb-2 px-2" onMouseDown={onMouseDown} onTouchStart={onTouchStart}>
                <div ref={sliderRef} className="relative h-2 rounded-full" style={{ backgroundColor: theme.colors.border }}>
                    <div className="absolute top-0 left-0 h-full rounded-full" style={{ backgroundColor: theme.colors.accent, width: `${safeValue}%` }} />
                    <div className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${safeValue}%` }}>
                        <div className="px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap shadow-lg border" style={{ backgroundColor: theme.colors.surface || '#fff', color: theme.colors.textPrimary, borderColor: theme.colors.border }}>{safeValue}%</div>
                    </div>
                </div>
            </div>
        </div>
    );
};