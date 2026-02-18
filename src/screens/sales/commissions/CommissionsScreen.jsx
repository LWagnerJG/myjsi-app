import React, { useState, useMemo, useCallback } from 'react';
import { GlassCard } from '../../../components/common/GlassCard';
import { ChevronDown, TrendingUp, ChevronDown as ChevronDownSm } from 'lucide-react';
import { COMMISSIONS_DATA, COMMISSION_YEARS } from './data.js';
import { isDarkTheme } from '../../../design-system/tokens.js';

const fmtMoney = (n) => `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const getMonthDateRange = (year, monthIndex) => {
  const startDate = new Date(year, monthIndex, 1);
  const endDate = new Date(year, monthIndex + 1, 0);
  const fmt = (d, opts) => d.toLocaleDateString(undefined, opts);
  return `${fmt(startDate, { month: 'short', day: 'numeric' })} – ${fmt(endDate, { month: 'short', day: 'numeric', year: 'numeric' })}`;
};

export const CommissionsScreen = ({ theme }) => {
  const [year, setYear] = useState(COMMISSION_YEARS[0]);
  const [openId, setOpenId] = useState(null);
  const isDark = isDarkTheme(theme);

  const data = useMemo(() => COMMISSIONS_DATA[year] || [], [year]);
  const total = useMemo(() => data.reduce((s, m) => s + m.amount, 0), [data]);
  const toggle = useCallback((id) => setOpenId(p => p === id ? null : id), []);

  return (
    <div className="h-full flex flex-col app-header-offset" style={{ backgroundColor: theme.colors.background }}>

      {/* Summary header */}
      <div className="px-4 sm:px-6 pt-5 pb-4">
        <GlassCard theme={theme} className="p-5 sm:p-6" variant="elevated">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: theme.colors.textPrimary }}>
                  {fmtMoney(total)}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-widest opacity-40">YTD</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <TrendingUp className="w-3.5 h-3.5 opacity-40" style={{ color: theme.colors.textPrimary }} />
                <span className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>Total Commissions</span>
              </div>
            </div>
            {/* Year selector — styled pill */}
            <div className="relative">
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="appearance-none text-sm font-bold pl-4 pr-8 py-2.5 rounded-full focus:outline-none transition-all cursor-pointer"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                {COMMISSION_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" style={{ color: theme.colors.textPrimary }} />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Monthly rows */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 sm:px-6 pb-8 space-y-2.5">
        {data.map((m) => {
          const isOpen = openId === m.id;
          const paidDate = new Date(m.issuedDate);
          const monthIndex = paidDate.getMonth();
          const yearNum = parseInt(year);
          const dateRange = getMonthDateRange(yearNum, monthIndex);
          const paidStr = paidDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

          return (
            <GlassCard
              key={m.id}
              theme={theme}
              className="overflow-hidden"
              variant="elevated"
            >
              {/* Row header */}
              <button
                onClick={() => toggle(m.id)}
                className="w-full px-5 py-4 flex items-center gap-3 text-left"
                onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-bold" style={{ color: theme.colors.textPrimary }}>{m.month}</span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                        color: theme.colors.textSecondary,
                      }}
                    >
                      Paid {paidStr}
                    </span>
                  </div>
                  <div className="text-[11px] mt-1 font-medium" style={{ color: theme.colors.textSecondary }}>
                    {dateRange}
                  </div>
                </div>
                <span className="text-[17px] font-black tabular-nums shrink-0" style={{ color: theme.colors.textPrimary }}>
                  {fmtMoney(m.amount)}
                </span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  style={{ color: theme.colors.textSecondary, opacity: 0.5 }}
                />
              </button>

              {/* Expandable detail */}
              <div className={`transition-all duration-300 ease-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div
                  className="mx-4 sm:mx-5 mb-4 h-px"
                  style={{ backgroundColor: theme.colors.border }}
                />
                <div className="px-4 sm:px-5 pb-5 space-y-3">

                  {/* Individual invoices */}
                  {m.details?.[0]?.invoices?.map((inv, ii) => {
                    const rateDisplay = inv.netAmount
                      ? ((inv.commission / inv.netAmount) * 100).toFixed(1)
                      : inv.rate;
                    const invDate = new Date(inv.invoiceDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                    return (
                      <div
                        key={ii}
                        className="rounded-2xl p-4 space-y-3"
                        style={{
                          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)',
                          border: `1px solid ${theme.colors.border}`,
                        }}
                      >
                        {/* SO + meta */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="font-bold text-[13px]" style={{ color: theme.colors.textPrimary }}>{inv.so}</div>
                            <div className="text-[11px] font-medium truncate" style={{ color: theme.colors.textSecondary }}>{inv.dealer}</div>
                            <div className="text-[11px] truncate" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>{inv.project}</div>
                          </div>
                          <div className="text-right shrink-0 space-y-1">
                            <div
                              className="text-[11px] font-bold px-2.5 py-1 rounded-full tabular-nums"
                              style={{
                                backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                                color: theme.colors.textSecondary,
                              }}
                            >
                              {rateDisplay}% rate
                            </div>
                            <div className="text-[10px]" style={{ color: theme.colors.textSecondary, opacity: 0.55 }}>{invDate}</div>
                          </div>
                        </div>

                        {/* Numbers */}
                        <div
                          className="grid grid-cols-3 gap-3 pt-3"
                          style={{ borderTop: `1px solid ${theme.colors.border}` }}
                        >
                          <div>
                            <div className="text-[9px] font-semibold uppercase tracking-wider mb-1 opacity-50" style={{ color: theme.colors.textSecondary }}>Invoiced</div>
                            <div className="text-sm font-semibold tabular-nums" style={{ color: theme.colors.textSecondary }}>{fmtMoney(inv.invoicedAmount)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-[9px] font-semibold uppercase tracking-wider mb-1 opacity-50" style={{ color: theme.colors.textSecondary }}>Net</div>
                            <div className="text-sm font-bold tabular-nums" style={{ color: theme.colors.textPrimary }}>{fmtMoney(inv.netAmount)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[9px] font-semibold uppercase tracking-wider mb-1 opacity-50" style={{ color: theme.colors.textSecondary }}>Earned</div>
                            <div className="text-[15px] font-black tabular-nums" style={{ color: theme.colors.textPrimary }}>{fmtMoney(inv.commission)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Monthly totals row */}
                  {m.details?.[1]?.brandTotal && (
                    <div
                      className="rounded-2xl p-4 grid grid-cols-3 gap-3 text-center"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)',
                        border: `1px solid ${theme.colors.border}`,
                      }}
                    >
                      <div>
                        <div className="text-[9px] font-semibold uppercase tracking-wider mb-1.5 opacity-50" style={{ color: theme.colors.textSecondary }}>Invoiced</div>
                        <div className="text-sm font-bold tabular-nums" style={{ color: theme.colors.textSecondary }}>{fmtMoney(m.details[1].listTotal)}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-semibold uppercase tracking-wider mb-1.5 opacity-50" style={{ color: theme.colors.textSecondary }}>Net</div>
                        <div className="text-sm font-bold tabular-nums" style={{ color: theme.colors.textPrimary }}>{fmtMoney(m.details[1].netTotal)}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-semibold uppercase tracking-wider mb-1.5 opacity-50" style={{ color: theme.colors.textSecondary }}>Total Earned</div>
                        <div className="text-base font-black tabular-nums" style={{ color: theme.colors.textPrimary }}>{fmtMoney(m.details[1].commissionTotal)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default CommissionsScreen;
