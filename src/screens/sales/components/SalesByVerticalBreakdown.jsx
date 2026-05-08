import React, { useMemo } from 'react';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { formatCurrencyCompact } from '../../../utils/format.js';

const R = 72;
const CX = 100;
const CY = 100;
const STROKE = 30;
const STROKE_SELECTED = 36;
const CIRC = 2 * Math.PI * R;
const GAP = (3 / 360) * CIRC;

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

  return (
    <div className="w-full" aria-label={`Sales by vertical, total ${formatCurrencyCompact(grandTotal)}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">

        {/* Donut */}
        <div className="self-center flex-shrink-0 w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] relative">
          <svg width="100%" height="100%" viewBox="0 0 200 200"
            style={{ transform: 'rotate(-90deg)' }} aria-hidden="true"
          >
            <circle cx={CX} cy={CY} r={R} fill="none"
              stroke={dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
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
                  style={{
                    opacity: dimmed ? 0.25 : 1,
                    transition: 'opacity 200ms ease, stroke-width 200ms ease',
                    cursor: onSelectVertical ? 'pointer' : 'default',
                  }}
                />
              );
            })}
          </svg>

          {/* Center — shows selected vertical name or grand total */}
          <button
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ cursor: hasSelection ? 'pointer' : 'default', pointerEvents: hasSelection ? 'auto' : 'none' }}
            onClick={() => onSelectVertical?.(null)}
            aria-label={hasSelection ? 'Clear vertical filter' : undefined}
          >
            {hasSelection ? (
              <>
                <span className="text-[0.625rem] font-bold uppercase tracking-widest text-center px-2 leading-snug"
                  style={{ color: prepared.find(p => p.name === selectedVertical)?.color }}>
                  {selectedVertical}
                </span>
                <span className="text-[0.5625rem] mt-1 font-medium"
                  style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>
                  tap to clear
                </span>
              </>
            ) : (
              <>
                <span className="text-base sm:text-lg font-black tabular-nums leading-tight"
                  style={{ color: theme.colors.textPrimary }}>
                  {formatCurrencyCompact(grandTotal)}
                </span>
                <span className="text-[0.5625rem] font-semibold uppercase tracking-widest mt-0.5"
                  style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>
                  Total
                </span>
              </>
            )}
          </button>
        </div>

        {/* Legend */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-1 gap-x-3 gap-y-0">
          {prepared.map(row => {
            const isSelected = row.name === selectedVertical;
            const dimmed = hasSelection && !isSelected;
            return (
              <button
                key={row.name}
                onClick={() => handleToggle(row.name)}
                className="flex items-center gap-2 py-[5px] rounded-lg px-1 -mx-1 transition-all active:scale-[0.98]"
                style={{
                  opacity: dimmed ? 0.35 : 1,
                  transition: 'opacity 200ms ease',
                  cursor: onSelectVertical ? 'pointer' : 'default',
                  backgroundColor: isSelected ? `${row.color}12` : 'transparent',
                }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: row.color, transform: isSelected ? 'scale(1.35)' : 'scale(1)', transition: 'transform 200ms ease' }} />
                <span className="text-xs flex-1 font-medium truncate text-left"
                  style={{ color: isSelected ? row.color : theme.colors.textPrimary, fontWeight: isSelected ? 700 : 500, transition: 'color 200ms ease' }}>
                  {row.name}
                </span>
                <span className="hidden sm:block text-[0.625rem] tabular-nums flex-shrink-0"
                  style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>
                  {row.pct.toFixed(0)}%
                </span>
                <span className="text-xs font-semibold tabular-nums flex-shrink-0 ml-1"
                  style={{ color: isSelected ? row.color : theme.colors.textPrimary }}>
                  {formatCurrencyCompact(row.value)}
                </span>
              </button>
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
