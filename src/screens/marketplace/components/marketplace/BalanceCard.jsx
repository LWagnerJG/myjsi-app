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
      <div className="p-5 sm:p-6">
        <div className="min-w-0">
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em]" style={{ color: theme.colors.textSecondary, opacity: 0.9 }}>
            {eyebrow}
          </p>
          <h2 className="text-[1.375rem] font-black tracking-tight mt-2.5" style={{ color: theme.colors.textPrimary }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm mt-1.5 max-w-lg leading-relaxed" style={{ color: theme.colors.textSecondary }}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-end justify-between gap-3 mt-5">
          <div className="min-w-0">
            <p className="text-[0.625rem] font-bold uppercase tracking-[0.16em]" style={{ color: theme.colors.textSecondary }}>
              {metricLabel}
            </p>
            <p className="text-[2rem] sm:text-[2.4rem] font-black tracking-[-0.05em] leading-none mt-1.5" style={{ color: palette.brand }}>
              {resolvedMetric}
            </p>
          </div>
          {metricCaption && (
            <p className="text-xs leading-relaxed text-right max-w-[11rem] pb-1" style={{ color: theme.colors.textSecondary }}>
              {metricCaption}
            </p>
          )}
        </div>

        {stats.length > 0 && (
          <div className="flex mt-5 pt-4" style={{ borderTop: `1px solid ${palette.hairline}` }}>
            {stats.map((stat, index) => (
              <React.Fragment key={stat.label}>
                {index > 0 && (
                  <div className="self-stretch mx-3 sm:mx-4" style={{ width: 1, backgroundColor: palette.hairline }} />
                )}
                <div className="flex-1 min-w-0">
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
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
};
