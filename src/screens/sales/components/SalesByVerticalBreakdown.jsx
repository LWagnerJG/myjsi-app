import React, { useMemo } from 'react';
import { formatCurrencyCompact } from '../../../utils/format.js';

// Simplified / clean vertical breakdown (no inline chips, consistent layout)
export const SalesByVerticalBreakdown = ({ data = [], theme, palette }) => {
  const prepared = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const total = data.reduce((s, d) => s + (d.value || 0), 0) || 1;
    const sorted = [...data].sort((a, b) => (b.value || 0) - (a.value || 0));
    const MAX = 12;
    let trimmed = sorted.slice(0, MAX);
    if (sorted.length > MAX) {
      const otherVal = sorted.slice(MAX).reduce((s, d) => s + d.value, 0);
      if (otherVal > 0) trimmed.push({ name: 'Other', value: otherVal, color: '#8C8C8C' });
    }
    return trimmed.map(r => ({
      ...r,
      pct: (r.value / total) * 100,
      color: r.color || hashColor(r.name, palette)
    }));
  }, [data, palette]);

  const grandTotal = useMemo(() => prepared.reduce((s, d) => s + (d.value || 0), 0), [prepared]);
  const maxValue = useMemo(() => prepared.reduce((m, r) => Math.max(m, r.value || 0), 0) || 1, [prepared]);

  return (
    <div className="w-full" aria-label={`Sales by vertical total ${formatCurrencyCompact(grandTotal)}`}>
      <ol className="w-full">
        {prepared.map((row, idx) => {
          const rel = (row.value / maxValue) * 100; // relative to max for bar length
          const pctStr = row.pct >= 10 ? row.pct.toFixed(1) : row.pct.toFixed(2);
          // desaturate bar opacity by rank so dominant verticals pop, tail ones recede
          const barOpacity = Math.max(0.35, 0.75 - idx * 0.07);
          return (
            <li key={row.name} className="grid grid-cols-[160px_1fr_auto_auto] gap-4 items-center py-3" style={idx > 0 ? { borderTop: `1px solid ${theme.colors.border}` } : undefined}>
              {/* Label with color dot */}
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.color, opacity: Math.max(0.55, barOpacity) }} />
                <span className="text-xs font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{row.name}</span>
              </div>
              {/* Bar track */}
              <div className="relative h-2 rounded-full overflow-hidden" style={{ background: theme.colors.subtle }} aria-hidden="true">
                <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${rel}%`, background: row.color, opacity: barOpacity, transition: 'width 480ms cubic-bezier(.4,.2,.2,1)' }} />
              </div>
              {/* Value */}
              <div className="text-xs font-semibold tabular-nums text-right" style={{ color: theme.colors.textPrimary }}>
                {formatCurrencyCompact(row.value)}
              </div>
              {/* Percent */}
              <div className="text-xs font-medium tabular-nums text-right" style={{ color: theme.colors.textSecondary }}>
                {pctStr}%
              </div>
            </li>
          );
        })}
      </ol>
      <div className="sr-only" aria-live="polite">{prepared.map(r => `${r.name} ${formatCurrencyCompact(r.value)} ${r.pct.toFixed(1)} percent`).join('. ')}</div>
    </div>
  );
};

// Helpers

const BASE_PALETTE = ['#4A7C59', '#5B7B8C', '#C4956A', '#B85C5C', '#7A8C6E', '#8B8680'];
function hashColor(name = '', override) { if (name === 'Other') return '#8B8680'; const palette = (override && override.length) ? override : BASE_PALETTE; let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0; return palette[h % (palette.length - 1)]; }
export default SalesByVerticalBreakdown;
