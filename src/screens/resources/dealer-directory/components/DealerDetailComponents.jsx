import React from 'react';

const fmtK = (n) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${Math.round(n / 1000)}K`;
    return `$${n.toLocaleString()}`;
};

/* ── Horizontal bar (series breakdown) ──────────────── */
export const HBar = ({ label, value, maxValue, color, isDark, colors, rank }) => {
    const pct = Math.min((value / maxValue) * 100, 100);
    return (
        <div className="flex items-center gap-2.5 py-[9px]">
            {rank != null && (
                <span
                    className="text-[0.6875rem] font-black w-4 text-center flex-shrink-0 tabular-nums"
                    style={{ color: colors.textSecondary, opacity: 0.35 }}
                >
                    {rank}
                </span>
            )}
            <span
                className="text-[0.8125rem] font-semibold w-[90px] flex-shrink-0 truncate"
                style={{ color: colors.textPrimary }}
            >
                {label}
            </span>
            <div
                className="flex-1 rounded-full overflow-hidden"
                style={{ height: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)' }}
            >
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: color || colors.accent, opacity: 0.8 }}
                />
            </div>
            <span
                className="text-xs font-bold w-14 text-right flex-shrink-0 tabular-nums"
                style={{ color: colors.textSecondary }}
            >
                {fmtK(value)}
            </span>
        </div>
    );
};

/* ── Donut chart ─────────────────────────────────────── */
export const DonutChart = ({ data, size = 100, strokeWidth = 18, colors: themeColors }) => {
    const total = data.reduce((s, d) => s + d.value, 0);
    const r = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * r;
    const cx = size / 2, cy = size / 2;
    let offset = circumference * 0.25; // start at top

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
            {data.map((d, i) => {
                const pct = d.value / total;
                const dash = pct * circumference;
                const gap = circumference - dash;
                const el = (
                    <circle
                        key={i}
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={d.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                );
                offset -= dash;
                return el;
            })}
            <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="central"
                fontSize="15" fontWeight="900" fill={themeColors?.textPrimary || '#353535'}>
                {data.length}
            </text>
            <text x={cx} y={cy + 9} textAnchor="middle" dominantBaseline="central"
                fontSize="7.5" fontWeight="700" fill={themeColors?.textSecondary || '#999'} letterSpacing="0.6">
                VERTICALS
            </text>
        </svg>
    );
};

/* ── Spark bars (monthly trend) ──────────────────────── */
export const SparkBars = ({ data, colors, isDark }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data.map(d => d.amount));
    return (
        <div className="flex items-end gap-[3px]" style={{ height: 72 }}>
            {data.map((d, i) => {
                const hPct = Math.max((d.amount / max) * 100, 4);
                const isLast = i === data.length - 1;
                return (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                        <div className="w-full flex justify-center" style={{ height: 54 }}>
                            <div
                                className="rounded-t transition-all duration-500"
                                style={{
                                    width: '68%',
                                    maxWidth: 22,
                                    height: `${hPct}%`,
                                    backgroundColor: colors.accent,
                                    opacity: isLast ? 1 : (isDark ? 0.28 : 0.2),
                                    alignSelf: 'flex-end',
                                    borderRadius: '3px 3px 0 0',
                                    boxShadow: isLast
                                        ? (isDark ? '0 6px 12px rgba(0,0,0,0.35)' : '0 6px 12px rgba(53,53,53,0.14)')
                                        : 'none',
                                }}
                            />
                        </div>
                        <span
                            className="text-[0.5625rem] font-semibold leading-none"
                            style={{
                                color: isLast ? colors.textPrimary : colors.textSecondary,
                                opacity: isLast ? 0.88 : 0.52,
                            }}
                        >
                            {d.month}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
