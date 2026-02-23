import React from 'react';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { Wallet } from 'lucide-react';
import { formatElliottBucks } from '../../data.js';

export const BalanceCard = ({ balance, theme }) => {
  const isDark = isDarkTheme(theme);
  return (
    <div
      className="rounded-3xl p-5 relative overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #2A2A2A 0%, #353535 100%)'
          : 'linear-gradient(135deg, #353535 0%, #4A4A4A 100%)',
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }} />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-4 h-4 text-white/60" />
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">ElliottBucks Balance</p>
        </div>
        <p className="text-4xl font-bold text-white tracking-tight">
          {formatElliottBucks(balance)}
        </p>
        <p className="text-xs text-white/50 mt-1">Redeem for exclusive LWYD merchandise</p>
      </div>
    </div>
  );
};
