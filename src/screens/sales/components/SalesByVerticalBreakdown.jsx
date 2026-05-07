import React, { useMemo } from 'react';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { formatCurrencyCompact } from '../../../utils/format.js';

// Internal coords are always 200×200; the SVG scales via its container.
const R = 72;
const CX = 100;
const CY = 100;
const STROKE = 30;
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

export const SalesByVerticalBreakdown = ({ data = [], theme, palette }) => {
  const dark = isDarkTheme(theme);

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

  return (
    <div className="w-full" aria-label={`Sales by vertical, total ${formatCurrencyCompact(grandTotal)}`}>
      {/* Mobile: stacked (donut centered + 2-col legend)
          sm+:    side-by-side (donut left, legend right) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">

        {/* Donut — 140px on mobile, 160px on sm+ */}
        <div className="self-center flex-shrink-0 w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] relative">
          <svg width="100%" height="100%" viewBox="0 0 200 200"
            style={{ transform: 'rotate(-90deg)' }} aria-hidden="true"
          >
            <circle cx={CX} cy={CY} r={R} fill="none"
              stroke={dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
              strokeWidth={STROKE}
            />
            {segments.map(seg => (
              <circle key={seg.name}
                cx={CX} cy={CY} r={R} fill="none"
                stroke={seg.color} strokeWidth={STROKE}
                strokeDasharray={seg.dashArray}
                strokeDashoffset={seg.dashOffset}
                strokeLinecap="butt"
              />
            ))}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-base sm:text-lg font-black tabular-nums leading-tight"
              style={{ color: theme.colors.textPrimary }}>
              {formatCurrencyCompact(grandTotal)}
            </span>
            <span className="text-[0.5625rem] font-semibold uppercase tracking-widest mt-0.5"
              style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>
              Total
            </span>
          </div>
        </div>

        {/* Legend
            Mobile: 2-column grid (dot + name + value)
            sm+: single column with % visible */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-1 gap-x-3 gap-y-0">
          {prepared.map(row => (
            <div key={row.name} className="flex items-center gap-2 py-[5px]">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
              <span className="text-xs flex-1 font-medium truncate" style={{ color: theme.colors.textPrimary }}>
                {row.name}
              </span>
              <span className="hidden sm:block text-[0.625rem] tabular-nums flex-shrink-0"
                style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>
                {row.pct.toFixed(0)}%
              </span>
              <span className="text-xs font-semibold tabular-nums flex-shrink-0 ml-1"
                style={{ color: theme.colors.textPrimary }}>
                {formatCurrencyCompact(row.value)}
              </span>
            </div>
          ))}
        </div>

      </div>

      <div className="sr-only" aria-live="polite">
        {prepared.map(r => `${r.name} ${formatCurrencyCompact(r.value)} ${r.pct.toFixed(1)} percent`).join('. ')}
      </div>
    </div>
  );
};

export default SalesByVerticalBreakdown;
