import React from 'react';

const fmtK = (n) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${Math.round(n / 1000)}K`;
    return `$${n.toLocaleString()}`;
};

export const HBar = ({ label, value, maxValue, color, isDark, colors, rank }) => {
    const pct = Math.min((value / maxValue) * 100, 100);
    return (
        <div className="flex items-center gap-2 py-1">
            {rank != null && (
                <span className="text-[11px] font-black w-4 text-center flex-shrink-0" style={{ color: colors.textSecondary, opacity: 0.5 }}>{rank}</span>
            )}
            <span className="text-[12px] font-semibold w-24 flex-shrink-0 truncate" style={{ color: colors.textPrimary }}>{label}</span>
            <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color || colors.accent, opacity: 0.75 }} />
            </div>
            <span className="text-[11px] font-bold w-14 text-right flex-shrink-0" style={{ color: colors.textSecondary }}>{fmtK(value)}</span>
        </div>
    );
};

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
            <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="central"
                fontSize="13" fontWeight="900" fill={themeColors?.textPrimary || '#353535'}>
                {data.length}
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="central"
                fontSize="8" fontWeight="600" fill={themeColors?.textSecondary || '#999'} letterSpacing="0.5">
                VERTICALS
            </text>
        </svg>
    );
};

export const SparkBars = ({ data, colors, isDark }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data.map(d => d.amount));
    return (
        <div className="flex items-end gap-[3px]" style={{ height: 64 }}>
            {data.map((d, i) => {
                const hPct = Math.max((d.amount / max) * 100, 4);
                const isLast = i === data.length - 1;
                return (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
                        <div className="w-full flex justify-center" style={{ height: 48 }}>
                            <div
                                className="rounded-t transition-all duration-500"
                                style={{
                                    width: '70%',
                                    maxWidth: 20,
                                    height: `${hPct}%`,
                                    backgroundColor: isLast ? colors.accent : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(53,53,53,0.10)'),
                                    alignSelf: 'flex-end',
                                }}
                            />
                        </div>
                        <span className="text-[9px] font-semibold leading-none" style={{ color: colors.textSecondary, opacity: 0.6 }}>{d.month}</span>
                    </div>
                );
            })}
        </div>
    );
};

export const StatChip = ({ label, value, isDark, colors, accent }) => (
    <div className="flex-1 min-w-0 py-2.5 px-3 rounded-2xl" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(53,53,53,0.025)' }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: colors.textSecondary, opacity: 0.55 }}>{label}</p>
        <p className="text-lg font-black tracking-tight leading-tight" style={{ color: accent || colors.textPrimary }}>{value}</p>
    </div>
);

export const SectionLabel = ({ icon: Icon, title, colors, right }) => (
    <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
            {Icon && <Icon className="w-3.5 h-3.5" style={{ color: colors.accent, opacity: 0.7 }} />}
            <h2 className="text-[13px] font-bold tracking-tight uppercase" style={{ color: colors.textSecondary, opacity: 0.7 }}>{title}</h2>
        </div>
        {right}
    </div>
);
