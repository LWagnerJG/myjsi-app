import React, { useMemo } from 'react';
import { formatCurrencyCompact } from '../../../utils/format.js';

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
      <div className="space-y-2.5">
        {prepared.map((row, idx) => {
          const rel = (row.value / maxValue) * 100;
          const barOpacity = Math.max(0.4, 0.8 - idx * 0.07);
          return (
            <div key={row.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[0.8125rem] font-semibold" style={{ color: theme.colors.textPrimary }}>{row.name}</span>
                <span className="text-[0.8125rem] font-semibold tabular-nums" style={{ color: theme.colors.textPrimary }}>
                  {formatCurrencyCompact(row.value)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: theme.colors.subtle }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${rel}%`, background: row.color, opacity: barOpacity, transition: 'width 480ms cubic-bezier(.4,.2,.2,1)' }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="sr-only" aria-live="polite">{prepared.map(r => `${r.name} ${formatCurrencyCompact(r.value)} ${r.pct.toFixed(1)} percent`).join('. ')}</div>
    </div>
  );
};

// Helpers
const BASE_PALETTE = ['#4A7C59', '#5B7B8C', '#C4956A', '#B85C5C', '#7A8C6E', '#8B8680'];
function hashColor(name = '', override) { if (name === 'Other') return '#8B8680'; const palette = (override && override.length) ? override : BASE_PALETTE; let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0; return palette[h % (palette.length - 1)]; }
export default SalesByVerticalBreakdown;
