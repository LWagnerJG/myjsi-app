import React, { useState, useRef, useEffect, useCallback } from 'react';
import { isDarkTheme } from '../../design-system/tokens.js';

const STEP = 5;
const clampToStep = (pct) => Math.max(0, Math.min(100, Math.round(pct / STEP) * STEP));

/**
 * Accessible win-probability slider.
 * Pointer drag, track click, and keyboard (arrows / Home / End) all adjust the
 * value in 5% steps. Renders a visible grabbable thumb so it reads as an
 * adjustable control rather than a static progress bar.
 */
export const ProbabilitySlider = ({ value, onChange, theme, showLabel = true, showValueBubble = true, compact = false, ariaLabel = 'Win probability' }) => {
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef(null);
    const isDark = isDarkTheme(theme);

    const updateFromClientX = useCallback((clientX) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const overshoot = 12; // forgiving drag zone past both edges
        const x = clientX - rect.left;
        const pctRaw = ((x + overshoot) / (rect.width + overshoot * 2)) * 100;
        onChange(clampToStep(pctRaw));
    }, [onChange]);

    const pointerDown = useCallback((clientX) => { setIsDragging(true); updateFromClientX(clientX); }, [updateFromClientX]);
    const onMouseDown = useCallback((e) => pointerDown(e.clientX), [pointerDown]);
    const onTouchStart = useCallback((e) => pointerDown(e.touches[0].clientX), [pointerDown]);
    const onMove = useCallback((clientX) => { if (isDragging) updateFromClientX(clientX); }, [isDragging, updateFromClientX]);
    const onMouseMove = useCallback((e) => onMove(e.clientX), [onMove]);
    const onTouchMove = useCallback((e) => { e.preventDefault(); onMove(e.touches[0].clientX); }, [onMove]);
    const endDrag = useCallback(() => setIsDragging(false), []);

    useEffect(() => {
        if (!isDragging) return;
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mouseup', endDrag, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', endDrag, { passive: true });
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', endDrag);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', endDrag);
        };
    }, [isDragging, onMouseMove, onTouchMove, endDrag]);

    const safeValue = typeof value === 'number' ? Math.max(0, Math.min(100, value)) : 50;

    const onKeyDown = useCallback((e) => {
        let next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = safeValue + STEP;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = safeValue - STEP;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = 100;
        if (next == null) return;
        e.preventDefault();
        onChange(clampToStep(next));
    }, [safeValue, onChange]);

    const trackHeight = compact ? 6 : 8;
    const thumbSize = compact ? 18 : 22;

    return (
        <div className="space-y-2 w-full select-none">
            {showLabel && (
                <label className="text-sm font-semibold px-3" style={{ color: theme.colors.textSecondary }}>
                    Win Probability
                </label>
            )}
            <div
                className={`relative ${compact ? 'py-2' : 'pt-4 pb-3 px-2'}`}
                style={{ touchAction: 'none', cursor: isDragging ? 'grabbing' : 'pointer' }}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
            >
                <div
                    ref={sliderRef}
                    role="slider"
                    tabIndex={0}
                    aria-label={ariaLabel}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={safeValue}
                    aria-valuetext={`${safeValue}%`}
                    onKeyDown={onKeyDown}
                    className="relative rounded-full focus-ring"
                    style={{
                        height: trackHeight,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(53,53,53,0.12)',
                    }}
                >
                    <div
                        className="absolute top-0 left-0 h-full rounded-full"
                        style={{ backgroundColor: theme.colors.accent, width: `${safeValue}%` }}
                    />
                    <div
                        aria-hidden="true"
                        className="absolute top-1/2 rounded-full transition-transform duration-100"
                        style={{
                            left: `${safeValue}%`,
                            width: thumbSize,
                            height: thumbSize,
                            transform: `translate(-50%, -50%) scale(${isDragging ? 1.12 : 1})`,
                            backgroundColor: isDark ? '#F4F0EA' : '#FFFFFF',
                            border: `2px solid ${theme.colors.accent}`,
                            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 6px rgba(53,53,53,0.22)',
                            cursor: isDragging ? 'grabbing' : 'grab',
                        }}
                    />
                    {showValueBubble && (
                        <div className="absolute -top-2 -translate-x-1/2 -translate-y-full" style={{ left: `${safeValue}%` }}>
                            <div className="px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap shadow-lg border" style={{ backgroundColor: theme.colors.surface || '#fff', color: theme.colors.textPrimary, borderColor: theme.colors.border }}>{safeValue}%</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
