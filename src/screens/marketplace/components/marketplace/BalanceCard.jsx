import React from 'react';
import { GlassCard } from '../../../../components/common/GlassCard.jsx';
import { formatElliottBucks } from '../../data.js';
import { getMarketplacePalette } from '../../theme.js';

export const BalanceCard = ({
  balance,
  theme,
  eyebrow = 'Available balance',
  title = 'LWYD Marketplace',
  subtitle,
  stats = [],
  metricLabel = 'Balance',
  metricValue,
  metricCaption,
}) => {
  const palette = getMarketplacePalette(theme);
  const resolvedMetric = metricValue ?? formatElliottBucks(balance);

  return (
    <GlassCard theme={theme} className="overflow-hidden" style={{ boxShadow: palette.shadow }}>
      <div className="p-5 sm:p-6 space-y-5">
        <div className="min-w-0">
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em]" style={{ color: theme.colors.textSecondary, opacity: 0.9 }}>
            {eyebrow}
          </p>
          <h2 className="text-[1.375rem] font-black tracking-tight mt-3" style={{ color: theme.colors.textPrimary }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm mt-1.5 max-w-lg leading-relaxed" style={{ color: theme.colors.textSecondary }}>
              {subtitle}
            </p>
          )}
        </div>

        <div
          className="rounded-[26px] px-4 py-4 sm:px-5 sm:py-5"
          style={{ backgroundColor: palette.panelStrong, border: `1px solid ${palette.border}` }}
        >
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.16em]" style={{ color: theme.colors.textSecondary }}>
            {metricLabel}
          </p>
          <div className="flex items-end justify-between gap-3 mt-2">
            <p className="text-[1.95rem] sm:text-[2.25rem] font-black tracking-[-0.05em] leading-none" style={{ color: theme.colors.textPrimary }}>
              {resolvedMetric}
            </p>
            {metricCaption && (
              <p className="text-xs leading-relaxed text-right max-w-[11rem]" style={{ color: theme.colors.textSecondary }}>
                {metricCaption}
              </p>
            )}
          </div>
        </div>

        {stats.length > 0 && (
          <div className={`grid gap-3 ${stats.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[22px] px-3.5 py-3.5"
                style={{ backgroundColor: palette.panelSubtle, border: `1px solid ${palette.border}` }}
              >
                <p className="text-[0.625rem] font-bold uppercase tracking-[0.16em]" style={{ color: theme.colors.textSecondary }}>
                  {stat.label}
                </p>
                <p className="text-base sm:text-[1.0625rem] font-semibold mt-1.5 leading-tight" style={{ color: stat.valueColor || theme.colors.textPrimary }}>
                  {stat.value}
                </p>
                {stat.caption && (
                  <p className="text-[0.6875rem] mt-1" style={{ color: theme.colors.textSecondary }}>
                    {stat.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
};
