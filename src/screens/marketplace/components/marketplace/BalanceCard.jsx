import React from 'react';
import { GlassCard } from '../../../../components/common/GlassCard.jsx';
import { formatElliottBucks } from '../../data.js';

export const BalanceCard = ({
  balance,
  theme,
  eyebrow = 'Available balance',
  title = 'LWYD Marketplace',
  subtitle,
  stats = [],
}) => {
  return (
    <GlassCard theme={theme} className="p-5 sm:p-6">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: theme.colors.textSecondary }}>
              {eyebrow}
            </p>
            <h2 className="text-lg font-semibold mt-2" style={{ color: theme.colors.textPrimary }}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs mt-1 max-w-md" style={{ color: theme.colors.textSecondary }}>
                {subtitle}
              </p>
            )}
          </div>

          <div className="rounded-2xl px-4 py-3 shrink-0" style={{ backgroundColor: theme.colors.subtle }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: theme.colors.textSecondary }}>
              Balance
            </p>
            <p className="text-2xl font-semibold tracking-[-0.03em] mt-1" style={{ color: theme.colors.textPrimary }}>
              {formatElliottBucks(balance)}
            </p>
          </div>
        </div>

        {stats.length > 0 && (
          <div className={`grid gap-3 ${stats.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl px-4 py-3"
                style={{ backgroundColor: theme.colors.subtle }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: theme.colors.textSecondary }}>
                  {stat.label}
                </p>
                <p className="text-base sm:text-lg font-semibold mt-1" style={{ color: theme.colors.textPrimary }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
};
