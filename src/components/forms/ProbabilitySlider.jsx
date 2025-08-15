import React, { useState, useRef } from 'react';

export const ProbabilitySlider = ({ value, onChange, theme, showLabel = true, max = 100, step = 5, min = 0 }) => {
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef(null);

    const clamp = (v) => Math.min(max, Math.max(min, v));
    const snap = (v) => Math.round(v / step) * step;

    const updateFromClientX = (clientX) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const pct = (x / rect.width) * (max - min) + min; // scale to custom max
        const snapped = clamp(snap(pct));
        onChange(snapped);
    };

    const onMouseDown = (e) => { setIsDragging(true); updateFromClientX(e.clientX); };
    const onMouseMove = (e) => { if (isDragging) updateFromClientX(e.clientX); };
    const onMouseUp = () => setIsDragging(false);
    const onTouchStart = (e) => { setIsDragging(true); updateFromClientX(e.touches[0].clientX); };
    const onTouchMove = (e) => { if (isDragging) updateFromClientX(e.touches[0].clientX); };
    const onTouchEnd = () => setIsDragging(false);

    React.useEffect(() => {
        if (!isDragging) return;
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mouseup', onMouseUp, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchend', onTouchEnd, { passive: true });
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [isDragging]);

    // Percent for fill/handle relative to max
    const percent = ((value - min) / (max - min)) * 100;

    return (
        <div className="space-y-2 w-full">
            {showLabel && (
                <label className="text-sm font-semibold px-3" style={{ color: theme.colors.textSecondary }}>
                    Win Probability
                </label>
            )}
            <div className="relative pt-4 pb-2 px-2">
                <div
                    ref={sliderRef}
                    className="relative h-2 rounded-full cursor-pointer"
                    style={{ backgroundColor: theme.colors.border || '#d1d5db' }}
                    onMouseDown={onMouseDown}
                    onTouchStart={onTouchStart}
                >
                    <div
                        className="absolute top-0 left-0 h-full rounded-full"
                        style={{ backgroundColor: theme.colors.accent || '#3b82f6', width: `${percent}%` }}
                    />
                    <div
                        className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${percent}%` }}
                    >
                        <div
                            className="px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap shadow-lg border"
                            style={{ color: theme.colors.textPrimary || '#374151', backgroundColor: '#ffffff', borderColor: theme.colors.border || '#d1d5db' }}
                        >
                            {value}%
                        </div>
                    </div>
                </div>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(clamp(snap(parseInt(e.target.value, 10))))}
                    className="sr-only"
                    aria-label="Win Probability Slider"
                />
            </div>
        </div>
    );
};