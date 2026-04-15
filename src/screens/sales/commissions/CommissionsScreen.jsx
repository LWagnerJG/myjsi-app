import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { COMMISSIONS_DATA, COMMISSION_YEARS } from './data.js';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { subtleBg } from '../../../design-system/tokens.js';
import { formatCurrency, formatCurrencyCompact } from '../../../utils/format.js';

export const CommissionsScreen = ({ theme }) => {
  const [openId, setOpenId] = useState(null);

  const colors = useMemo(() => ({
    textPrimary: theme?.colors?.textPrimary || '#353535',
    textSecondary: theme?.colors?.textSecondary || '#666666',
  }), [theme]);

  const toggle = useCallback((id) => setOpenId(p => p === id ? null : id), []);
  const dividerStyle = { borderColor: subtleBg(theme, 1.35) };

  return (
    <div className="min-h-full" style={{ backgroundColor: theme.colors.background }}>
      <div className="px-4 sm:px-6 pb-8 space-y-6 max-w-2xl mx-auto w-full" style={{ paddingTop: 'calc(var(--app-header-offset, 72px) + env(safe-area-inset-top, 0px) + 16px)' }}>

        {COMMISSION_YEARS.map((yr) => {
          const months = COMMISSIONS_DATA[yr] || [];
          const yearTotal = months.reduce((s, m) => s + m.amount, 0);

          return (
            <div key={yr} className="space-y-2">
              {/* Year label + total */}
              <div className="flex items-baseline justify-between px-1">
                <span className="text-[0.8125rem] font-bold tracking-tight" style={{ color: colors.textPrimary, opacity: 0.45 }}>
                  {yr}
                </span>
                <span className="text-[0.75rem] font-semibold tabular-nums" style={{ color: colors.textSecondary, opacity: 0.45 }}>
                  {formatCurrency(yearTotal)}
                </span>
              </div>

              {/* Month rows */}
              <GlassCard theme={theme} className="overflow-hidden" variant="elevated">
                {months.map((m, idx) => {
                  const isOpen = openId === m.id;
                  const paidDate = new Date(m.issuedDate);
                  const paidStr = paidDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                  return (
                    <div key={m.id}>
                      {idx > 0 && <div className="mx-5" style={{ borderTop: `1px solid ${subtleBg(theme, 1.35)}` }} />}

                      <button
                        onClick={() => toggle(m.id)}
                        className="w-full px-5 py-3 flex items-center gap-3 text-left"
                      >
                        <span className="text-sm font-bold flex-1" style={{ color: colors.textPrimary }}>{m.month}</span>
                        <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: colors.textPrimary }}>
                          {formatCurrency(m.amount)}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          style={{ color: colors.textSecondary, opacity: 0.35 }}
                        />
                      </button>

                      {/* Expanded */}
                      <div className={`transition-all duration-200 ease-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="px-5 pb-4 pt-0.5">
                          <p className="text-[0.6875rem] font-medium mb-2" style={{ color: colors.textSecondary }}>
                            Paid {paidStr}
                          </p>

                          <div className="divide-y" style={dividerStyle}>
                            {m.details?.[0]?.invoices?.map((inv, ii) => {
                              const rate = inv.netAmount
                                ? ((inv.commission / inv.netAmount) * 100).toFixed(1)
                                : inv.rate;

                              return (
                                <div key={ii} className="py-2.5 flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="text-[0.8125rem] font-semibold truncate" style={{ color: colors.textPrimary }}>
                                      {inv.dealer}
                                    </div>
                                    <div className="text-[0.6875rem] font-medium flex items-center gap-2 mt-0.5" style={{ color: colors.textSecondary }}>
                                      <span>{inv.so}</span>
                                      <span>·</span>
                                      <span>Net {formatCurrencyCompact(inv.netAmount)}</span>
                                      <span>·</span>
                                      <span>{rate}%</span>
                                    </div>
                                  </div>
                                  <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: colors.textPrimary }}>
                                    {formatCurrency(inv.commission)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </GlassCard>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommissionsScreen;
