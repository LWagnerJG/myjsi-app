import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { formatCurrencyCompact } from '../../../utils/format.js';

const R = 72;
const CX = 100;
const CY = 100;
const STROKE = 28;
const STROKE_SELECTED = 36;
const CIRC = 2 * Math.PI * R;
const GAP = (2.5 / 360) * CIRC;

const BASE_PALETTE = ['#4A7C59', '#5B7B8C', '#C4956A', '#B85C5C', '#7A8C6E', '#8B8680'];
function hashColor(name = '', override) {
  if (name === 'Other') return '#8B8680';
  const p = override?.length ? override : BASE_PALETTE;
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return p[h % (p.length - 1)];
}

export const SalesByVerticalBreakdown = ({ data = [], theme, palette, selectedVertical, onSelectVertical }) => {
  const dark = isDarkTheme(theme);
  const hasSelection = Boolean(selectedVertical);

  const prepared = useMemo(() => {
    if (!Array.isArray(data) || !data.length) return [];
    const total = data.reduce((s, d) => s + (d.value || 0), 0) || 1;
    const sorted = [...data].sort((a, b) => (b.value || 0) - (a.value || 0));
    const MAX = 12;
    let trimmed = sorted.slice(0, MAX);
    if (sorted.length > MAX) {
      const rest = sorted.slice(MAX).reduce((s, d) => s + d.value, 0);
      if (rest > 0) trimmed.push({ name: 'Other', value: rest, color: '#8C8C8C' });
    }
    return trimmed.map(r => ({
      ...r,
      pct: (r.value / total) * 100,
      color: r.color || hashColor(r.name, palette),
    }));
  }, [data, palette]);

  const grandTotal = useMemo(() => prepared.reduce((s, d) => s + (d.value || 0), 0), [prepared]);

  const segments = useMemo(() => {
    let cursor = 0;
    return prepared.map(row => {
      const slot = (row.pct / 100) * CIRC;
      const visible = Math.max(0, slot - GAP);
      const seg = { ...row, dashArray: `${visible} ${CIRC}`, dashOffset: -cursor };
      cursor += slot;
      return seg;
    });
  }, [prepared]);

  if (!prepared.length) return null;

  const handleToggle = (name) => {
    onSelectVertical?.(selectedVertical === name ? null : name);
  };

  const SPRING = { type: 'spring', stiffness: 420, damping: 32 };
  const FADE = { duration: 0.18, ease: [0.4, 0, 0.2, 1] };

  return (
    <div className="w-full" aria-label={`Sales by vertical, total ${formatCurrencyCompact(grandTotal)}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">

        {/* Donut */}
        <div className="self-center flex-shrink-0 w-[148px] h-[148px] sm:w-[164px] sm:h-[164px] relative">
          <svg
            width="100%" height="100%" viewBox="0 0 200 200"
            style={{ transform: 'rotate(-90deg)' }}
            aria-hidden="true"
          >
            {/* Track ring */}
            <circle cx={CX} cy={CY} r={R} fill="none"
              stroke={dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.055)'}
              strokeWidth={STROKE}
            />
            {segments.map(seg => {
              const isSelected = seg.name === selectedVertical;
              const dimmed = hasSelection && !isSelected;
              return (
                <circle
                  key={seg.name}
                  cx={CX} cy={CY} r={R} fill="none"
                  stroke={seg.color}
                  strokeWidth={isSelected ? STROKE_SELECTED : STROKE}
                  strokeDasharray={seg.dashArray}
                  strokeDashoffset={seg.dashOffset}
                  strokeLinecap="butt"
                  onClick={() => handleToggle(seg.name)}
                  style={{
                    opacity: dimmed ? 0.16 : 1,
                    transition: [
                      'opacity 380ms cubic-bezier(0.4, 0, 0.2, 1)',
                      'stroke-width 300ms cubic-bezier(0.34, 1.4, 0.64, 1)',
                    ].join(', '),
                    cursor: onSelectVertical ? 'pointer' : 'default',
                    filter: isSelected ? `drop-shadow(0 0 6px ${seg.color}60)` : 'none',
                    transformOrigin: `${CX}px ${CY}px`,
                  }}
                />
              );
            })}
          </svg>

          {/* Center — crossfades between selection state and total */}
          <button
            className="absolute inset-0 flex items-center justify-center"
            style={{ cursor: hasSelection ? 'pointer' : 'default', pointerEvents: hasSelection ? 'auto' : 'none' }}
            onClick={() => onSelectVertical?.(null)}
            aria-label={hasSelection ? 'Clear vertical filter' : undefined}
          >
            <AnimatePresence mode="wait">
              {hasSelection ? (
                <motion.div
                  key={selectedVertical}
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.82 }}
                  transition={SPRING}
                  className="flex flex-col items-center gap-0.5 px-2"
                >
                  <span
                    className="text-[0.6875rem] font-black uppercase tracking-widest text-center leading-tight"
                    style={{ color: prepared.find(p => p.name === selectedVertical)?.color }}
                  >
                    {selectedVertical}
                  </span>
                  <span
                    className="text-[0.5rem] font-semibold uppercase tracking-wider"
                    style={{ color: theme.colors.textSecondary, opacity: 0.45 }}
                  >
                    tap to clear
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="total"
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.82 }}
                  transition={SPRING}
                  className="flex flex-col items-center gap-0.5"
                >
                  <span
                    className="text-base sm:text-lg font-black tabular-nums leading-tight"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    {formatCurrencyCompact(grandTotal)}
                  </span>
                  <span
                    className="text-[0.5rem] font-semibold uppercase tracking-widest"
                    style={{ color: theme.colors.textSecondary, opacity: 0.4 }}
                  >
                    Total
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Legend */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-1 gap-x-3 gap-y-0">
          {prepared.map((row) => {
            const isSelected = row.name === selectedVertical;
            const dimmed = hasSelection && !isSelected;
            return (
              <motion.button
                key={row.name}
                onClick={() => handleToggle(row.name)}
                className="flex items-center gap-2 py-[5px] rounded-xl px-1.5 -mx-1.5"
                animate={{
                  opacity: dimmed ? 0.28 : 1,
                  backgroundColor: isSelected ? `${row.color}12` : 'rgba(0,0,0,0)',
                }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                style={{ cursor: onSelectVertical ? 'pointer' : 'default' }}
                whileTap={{ scale: 0.97 }}
              >
                <motion.div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  animate={{ scale: isSelected ? 1.45 : 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                  style={{ backgroundColor: row.color }}
                />
                <span
                  className="text-xs flex-1 font-medium truncate text-left"
                  style={{
                    color: isSelected ? row.color : theme.colors.textPrimary,
                    fontWeight: isSelected ? 700 : 500,
                    transition: 'color 220ms ease',
                  }}
                >
                  {row.name}
                </span>
                <span
                  className="hidden sm:block text-[0.625rem] tabular-nums flex-shrink-0"
                  style={{ color: theme.colors.textSecondary, opacity: 0.45 }}
                >
                  {row.pct.toFixed(0)}%
                </span>
                <span
                  className="text-xs font-semibold tabular-nums flex-shrink-0 ml-1"
                  style={{
                    color: isSelected ? row.color : theme.colors.textPrimary,
                    transition: 'color 220ms ease',
                  }}
                >
                  {formatCurrencyCompact(row.value)}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="sr-only" aria-live="polite">
        {prepared.map(r => `${r.name} ${formatCurrencyCompact(r.value)} ${r.pct.toFixed(1)} percent`).join('. ')}
      </div>
    </div>
  );
};

export default SalesByVerticalBreakdown;
