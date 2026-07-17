import React, { useRef, useState, useCallback, useLayoutEffect, useEffect } from 'react';
import { motion } from 'framer-motion';
import { isDarkTheme } from '../../design-system/tokens.js';

/**
 * JSI-style Segmented Toggle — the single canonical toggle for the whole app.
 *
 * A single measured pill slides between options with spring physics. The pill
 * is intentionally extended a few px past each button so it sits flush to the
 * track edges and never looks clipped on the first/last option. Supports:
 *  - boolean / number / string values (compared with ===)
 *  - `allowDeselect` (tap the active option to clear)
 *  - per-option `group` sub-labels, `icon`, `iconAfter`, `badge`
 *  - `wrap` for toggles whose labels can't fit on one row
 */
const PILL_BLEED = 3; // px the pill extends past each button, matching track padding

export const SegmentedToggle = ({
  value,
  onChange,
  options,
  size = 'md',
  fullWidth = false,
  wrap = false,
  allowDeselect = false,
  ariaLabel,
  theme,
  className = '',
}) => {
  const dark = theme ? isDarkTheme(theme) : false;
  const containerRef = useRef(null);
  const [pillLayout, setPillLayout] = useState(null);
  const isFirstRender = useRef(true);

  const sizes = {
    smDense: { text: 'text-[0.8125rem]', px: 'px-2.5', gap: 'gap-1', iconSize: 'w-3.5 h-3.5', badgeSize: 'w-4 h-4 text-[0.6875rem]' },
    sm: { text: 'text-[0.8125rem]', px: 'px-3', gap: 'gap-1.5', iconSize: 'w-3.5 h-3.5', badgeSize: 'w-4 h-4 text-[0.6875rem]' },
    md: { text: 'text-[0.9375rem]', px: 'px-5', gap: 'gap-2', iconSize: 'w-4 h-4', badgeSize: 'w-5 h-5 text-xs' },
    lg: { text: 'text-base', px: 'px-6', gap: 'gap-2', iconSize: 'w-5 h-5', badgeSize: 'w-5 h-5 text-xs' },
  };

  const s = sizes[size] || sizes.md;
  const containerBg = theme?.colors?.subtle || '#E3E0D8';
  const selectedText = theme?.colors?.textPrimary || '#1a1a1a';
  const unselectedText = theme?.colors?.textSecondary
    ? (dark ? 'rgba(240,240,240,0.78)' : theme.colors.textSecondary)
    : (dark ? 'rgba(240,240,240,0.78)' : '#6A6762');
  const badgeBg = theme?.colors?.error || '#B85C5C';
  const selectedPillStyle = dark
    ? { backgroundColor: 'rgba(255,255,255,0.14)' }
    : {
        backgroundColor: '#FFFFFF',
        border: '1px solid rgba(255,255,255,0.96)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      };

  // Measure the active button and position the pill. Extends past the button on
  // a single row so the pill is flush to the track edges (no clipped look); on
  // a wrapped row it snaps to the exact button box to avoid overlapping rows.
  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeIndex = options.findIndex(o => o.value === value);
    const btns = container.querySelectorAll('[data-toggle-btn]');
    const btn = btns[activeIndex];
    if (!btn) { setPillLayout(null); return; }
    const tops = Array.from(btns).map(b => b.offsetTop);
    const wrapped = tops.length > 1 && (Math.max(...tops) - Math.min(...tops) > 1);
    setPillLayout(wrapped
      ? { left: btn.offsetLeft, top: btn.offsetTop, width: btn.offsetWidth, height: btn.offsetHeight }
      : { left: btn.offsetLeft - PILL_BLEED, top: 0, width: btn.offsetWidth + PILL_BLEED * 2, height: container.offsetHeight });
  }, [value, options]);

  useLayoutEffect(() => {
    measure();
    requestAnimationFrame(() => { isFirstRender.current = false; });
  }, [measure]);

  useEffect(() => {
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measure]);

  // `wrap` hugs its content (inline-flex) but can spill onto a second row when
  // labels are long, so the track never stretches to an empty full-width bar.
  const layoutClass = wrap
    ? 'inline-flex flex-wrap max-w-full gap-y-1 align-top'
    : fullWidth ? 'flex w-full' : 'inline-flex';

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label={ariaLabel}
      className={`${layoutClass} rounded-[999px] p-[3px] relative ${className}`}
      style={{ backgroundColor: containerBg, minHeight: 'var(--jsi-ctrl-h)', height: wrap ? undefined : 'var(--jsi-ctrl-h)' }}
    >
      {pillLayout && (
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={selectedPillStyle}
          initial={false}
          animate={{ left: pillLayout.left, top: pillLayout.top, width: pillLayout.width, height: pillLayout.height }}
          transition={isFirstRender.current ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      {options.map((opt) => {
        const isSelected = opt.value === value;
        const Icon = opt.icon;
        const IconAfter = opt.iconAfter;
        const badge = opt.badge;

        return (
          <button
            key={String(opt.value)}
            type="button"
            data-toggle-btn
            onClick={() => onChange(allowDeselect && isSelected ? null : opt.value)}
            className={`relative rounded-full ${s.px} ${s.text} flex items-center justify-center transition-colors whitespace-nowrap ${fullWidth ? 'flex-1' : ''} focus-ring`}
            style={{ color: isSelected ? selectedText : unselectedText, minHeight: wrap ? 'calc(var(--jsi-ctrl-h) - 6px)' : undefined }}
            aria-pressed={isSelected}
          >
            <span className={`relative z-10 flex items-center justify-center ${s.gap}`} style={{ fontWeight: 600 }}>
              {opt.group ? (
                <span className="text-[0.5625rem] font-bold uppercase tracking-[0.05em]" style={{ opacity: isSelected ? 0.85 : 0.5 }}>
                  {opt.group}
                </span>
              ) : null}
              {Icon && <Icon className={s.iconSize} />}
              <span className="truncate max-w-[180px]">{opt.label}</span>
              {IconAfter && <IconAfter className={s.iconSize} />}
              {badge != null && badge > 0 && (
                <span
                  className={`${s.badgeSize} rounded-full flex items-center justify-center font-bold ml-1`}
                  style={{ backgroundColor: badgeBg, color: 'white' }}
                >
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};
