import React, { useMemo } from 'react';

// Simplified / clean vertical breakdown (no inline chips, consistent layout)
export const SalesByVerticalBreakdown = ({ data = [], theme, showOverview = true, palette }) => {
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

  const overview = showOverview ? (
    <div className="flex w-full h-[3px] overflow-hidden rounded-full mb-4" style={{ background: theme.colors.subtle }} aria-hidden="true">
      {prepared.map(seg => (
        <div key={seg.name} className="h-full" style={{ flex: seg.pct, background: seg.color, minWidth: seg.pct < 1 ? 3 : undefined }} />
      ))}
    </div>
  ) : null;

  return (
    <div className="w-full" aria-label={`Sales by vertical total ${fmtMoney(grandTotal)}`}>
      {overview}
      <ol className="divide-y" style={{ borderColor: theme.colors.border }}>
        {prepared.map(row => {
          const rel = (row.value / maxValue) * 100; // relative to max for bar length
          const pctStr = row.pct >= 10 ? row.pct.toFixed(1) : row.pct.toFixed(2);
          return (
            <li key={row.name} className="grid grid-cols-[160px_1fr_auto_auto] gap-4 items-center py-3">
              {/* Label */}
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: row.color }} />
                <span className="text-xs font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{row.name}</span>
              </div>
              {/* Bar track */}
              <div className="relative h-2 rounded-full overflow-hidden" style={{ background: theme.colors.subtle }} aria-hidden="true">
                <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${rel}%`, background: row.color, opacity: .85, transition: 'width 480ms cubic-bezier(.4,.2,.2,1)' }} />
              </div>
              {/* Value */}
              <div className="text-xs font-semibold tabular-nums text-right" style={{ color: theme.colors.textPrimary }}>
                {fmtMoney(row.value)}
              </div>
              {/* Percent */}
              <div className="text-[11px] font-medium tabular-nums text-right" style={{ color: theme.colors.textSecondary }}>
                {pctStr}%
              </div>
            </li>
          );
        })}
      </ol>
      <div className="sr-only" aria-live="polite">{prepared.map(r => `${r.name} ${fmtMoney(r.value)} ${r.pct.toFixed(1)} percent`).join('. ')}</div>
    </div>
  );
};

// Helpers
function fmtMoney(n) { const abs = Math.abs(n); if (abs >= 1e9) return `$${(n / 1e9).toFixed(abs >= 10e9 ? 0 : 1)}B`; if (abs >= 1e6) return `$${(n / 1e6).toFixed(abs >= 10e6 ? 0 : 1)}M`; if (abs >= 1e3) return `$${(n / 1e3).toFixed(abs >= 10e3 ? 0 : 1)}K`; return `$${n.toFixed(0)}`; }
const BASE_PALETTE = ['#55A868', '#C44E52', '#8172B2', '#CCB04C', '#4C72B0', '#8C8C8C'];
function hashColor(name = '', override) { if (name === 'Other') return '#8C8C8C'; const palette = (override && override.length) ? override : BASE_PALETTE; let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0; return palette[h % (palette.length - 1)]; }
export default SalesByVerticalBreakdown;
