import React from 'react';
import { Wallet } from 'lucide-react';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { formatElliottBucks } from '../../data.js';

export const BalanceCard = ({
  balance,
  theme,
  eyebrow = 'ElliottBucks balance',
  title = 'LWYD Marketplace',
  subtitle = 'Redeem for exclusive LWYD merchandise.',
  stats = [],
}) => {
  const isDark = isDarkTheme(theme);

  return (
    <div
      className="rounded-[28px] p-5 sm:p-6 relative overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(145deg, #202020 0%, #2A2A2A 45%, #353535 100%)'
          : 'linear-gradient(145deg, #2C2C2C 0%, #353535 42%, #4E4B47 100%)',
      }}
    >
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 48%, rgba(255,255,255,0) 100%)' }} />
      <div className="absolute -top-10 -right-8 w-36 h-36 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
      <div className="absolute top-16 right-10 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
      <div className="absolute -bottom-10 -left-8 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }} />

      <div className="relative z-10 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center border border-white/10 bg-white/10">
                <Wallet className="w-4 h-4 text-white/70" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">{eyebrow}</p>
            </div>

            <h2 className="text-[26px] sm:text-[30px] font-semibold text-white tracking-[-0.02em] mt-4">
              {title}
            </h2>
            <p className="text-sm leading-relaxed text-white/65 mt-1 max-w-md">
              {subtitle}
            </p>
          </div>

          <div className="rounded-3xl px-4 py-4 sm:min-w-[190px] border border-white/10 bg-white/10 backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Available now</p>
            <p className="text-3xl sm:text-[34px] font-bold text-white tracking-[-0.03em] mt-2">
              {formatElliottBucks(balance)}
            </p>
            <p className="text-xs text-white/55 mt-1">Ready to redeem across the full collection.</p>
          </div>
        </div>

        {stats.length > 0 && (
          <div className={`grid gap-3 ${stats.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl px-4 py-3 border border-white/10 bg-white/[0.08] backdrop-blur-sm"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/48">
                  {stat.label}
                </p>
                <p className="text-base sm:text-lg font-semibold text-white mt-1">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
