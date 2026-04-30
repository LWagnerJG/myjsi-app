import React, { useMemo, useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { MONTHLY_SALES_DATA, SALES_VERTICALS_DATA, CUSTOMER_RANK_DATA, INCENTIVE_REWARDS_DATA } from './data.js';
import { ORDER_DATA } from '../orders/data.js';
import { SalesByVerticalBreakdown } from './components/SalesByVerticalBreakdown.jsx';
import { CountUp } from '../../components/common/CountUp.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';

import { isDarkTheme, subtleBg } from '../../design-system/tokens.js';
import { formatCurrency, formatCompanyName, formatCurrencyCompact } from '../../utils/format.js';


const parseQuarterKey = (key = '') => {
  const [y, q] = key.split('-Q');
  return { y: parseInt(y, 10) || 0, q: parseInt(q, 10) || 0 };
};

const sortQuarterEntries = (entries) =>
  [...entries].sort((a, b) => {
    const pa = parseQuarterKey(a[0]), pb = parseQuarterKey(b[0]);
    return pa.y === pb.y ? pa.q - pb.q : pa.y - pb.y;
  });


export const SalesScreen = ({ theme, onNavigate }) => {
  const [chartDataType, setChartDataType] = useState('bookings');
  const [showTableView, setShowTableView] = useState(false);
  const isDark = isDarkTheme(theme);

  const colors = useMemo(() => ({
    background: theme?.colors?.background || '#F0EDE8',
    surface: theme?.colors?.surface || '#FFFFFF',
    accent: theme?.colors?.accent || '#353535',
    textPrimary: theme?.colors?.textPrimary || '#353535',
    textSecondary: theme?.colors?.textSecondary || '#666666',
    border: theme?.colors?.border || '#E3E0D8',
    subtle: theme?.colors?.subtle || 'rgba(0,0,0,0.03)',
  }), [theme]);


  const { totalBookings, totalSales } = useMemo(() => ({
    totalBookings: MONTHLY_SALES_DATA.reduce((a, m) => a + m.bookings, 0),
    totalSales: MONTHLY_SALES_DATA.reduce((a, m) => a + m.sales, 0),
  }), []);

  const activeTotal = chartDataType === 'bookings' ? totalBookings : totalSales;

  const progressPct = useMemo(() => {
    const goalPct = ((chartDataType === 'bookings' ? totalBookings : totalSales) / 7_000_000) * 100;
    return Math.min(100, goalPct);
  }, [chartDataType, totalBookings, totalSales]);

  const recentOrders = useMemo(() => [...ORDER_DATA].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5), []);
  const topLeaders = useMemo(() => [...CUSTOMER_RANK_DATA].sort((a, b) => (b.bookings || 0) - (a.bookings || 0)).slice(0, 3), []);
  const chartMax = useMemo(() => Math.max(...MONTHLY_SALES_DATA.map(d => chartDataType === 'bookings' ? d.bookings : d.sales)), [chartDataType]);

  /* ── rewards snapshot (latest quarter) ── */

  const rewardsSnapshot = useMemo(() => {
    const entries = Object.entries(INCENTIVE_REWARDS_DATA || {});
    if (!entries.length) return null;
    const sorted = sortQuarterEntries(entries);
    const [key, data] = sorted[sorted.length - 1];
    const sales = data?.sales || [];
    const designers = data?.designers || [];
    const topSales = [...sales].sort((a, b) => (b.amount || 0) - (a.amount || 0)).slice(0, 2);
    const topDesigners = [...designers].sort((a, b) => (b.amount || 0) - (a.amount || 0)).slice(0, 2);
    const totalSalesR = sales.reduce((s, r) => s + (r.amount || 0), 0);
    const totalDesignR = designers.reduce((s, r) => s + (r.amount || 0), 0);
    return { key, topSales, topDesigners, totalSalesR, totalDesignR, totalAll: totalSalesR + totalDesignR, salesCount: sales.length, designersCount: designers.length };
  }, []);

  /* ── commissions snapshot (latest available year with data) ── */

  const commissionsSnapshot = useMemo(() => {
    const entries = Object.entries(INCENTIVE_REWARDS_DATA || {});
    if (!entries.length) return null;
    // Find the latest year that actually has data
    const years = [...new Set(entries.map(([k]) => k.split('-Q')[0]))].sort().reverse();
    const targetYear = years[0];
    if (!targetYear) return null;
    const yearEntries = entries.filter(([k]) => k.startsWith(targetYear));
    const allSales = yearEntries.flatMap(([, d]) => d?.sales || []);
    const byPerson = {};
    allSales.forEach(s => { byPerson[s.name] = (byPerson[s.name] || 0) + s.amount; });
    const sorted = Object.entries(byPerson).sort((a, b) => b[1] - a[1]);
    const ytdTotal = sorted.reduce((s, [, v]) => s + v, 0);
    return { ytdTotal, topEarners: sorted.slice(0, 3), quartersReported: yearEntries.length, year: targetYear };
  }, []);

  const toggleOpts = useMemo(() => [
    { value: 'bookings', label: 'Bookings' },
    { value: 'sales', label: 'Sales' },
  ], []);

  const viewModeOpts = useMemo(() => [
    { value: 'chart', label: 'Chart' },
    { value: 'table', label: 'Table' },
  ], []);

  const tableRows = useMemo(() => {
    const points = MONTHLY_SALES_DATA.map((entry) => ({
      month: entry.month,
      value: chartDataType === 'bookings' ? entry.bookings : entry.sales,
    }));
    const half = Math.ceil(points.length / 2);
    const left = points.slice(0, half);
    const right = points.slice(half);
    return left.map((item, index) => ({
      left: item,
      right: right[index] || null,
    }));
  }, [chartDataType]);



  const topSalesLeader = rewardsSnapshot?.topSales?.[0] || null;
  const topDesignLeader = rewardsSnapshot?.topDesigners?.[0] || null;

  /* ── animation gate — wait for screen slide-in ── */

  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 300); return () => clearTimeout(t); }, []);


  /* shared tile header */
  const TileHeader = ({ title, action, detail }) => (
    <div className="flex items-center justify-between gap-3 mb-3">
      <h3 className="text-[0.9375rem] font-bold truncate" style={{ color: colors.textPrimary }}>{title}</h3>
      <div className="flex items-center gap-2 shrink-0">
        {detail && (
          <span className="text-sm font-bold tabular-nums" style={{ color: colors.textPrimary }}>{detail}</span>
        )}
        {action && (
          <ChevronRight className="w-3.5 h-3.5" style={{ color: colors.textSecondary, opacity: 0.45 }} />
        )}
      </div>
    </div>
  );

  /* shared content row */
  const flatRowCls = "flex items-center justify-between gap-3 py-2.5";
  const flatRowsDivider = { borderColor: subtleBg(theme, 1.35) };

  return (
    <div className="min-h-full app-header-offset" style={{ backgroundColor: colors.background, color: colors.textPrimary }}>
      <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-6 space-y-5 max-w-content mx-auto w-full">

        {/* ── Hero KPI + sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_3fr] gap-5">

          {/* Main KPI card */}
          <GlassCard theme={theme} className="p-5 h-full" variant="elevated">
            <div className="h-full flex flex-col gap-4">
              {/* Metric row — value + delta badge */}
              <div className="flex items-baseline gap-2.5">
                <div className="text-4xl sm:text-[2.6rem] font-black tracking-tight leading-none" style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.4s ease' }}>
                  {ready ? (
                    <CountUp value={activeTotal} prefix="$" duration={0.6} format={(v) => `$${Math.round(v).toLocaleString()}`} />
                  ) : (
                    <span style={{ color: 'transparent' }}>$0</span>
                  )}
                </div>
              </div>

              {/* Controls + Progress */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-[0.8125rem] font-semibold">
                  {toggleOpts.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setChartDataType(opt.value)}
                      className="transition-opacity"
                      style={{
                        color: colors.textPrimary,
                        opacity: chartDataType === opt.value ? 1 : 0.32,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                  <span style={{ color: colors.border }}>|</span>
                  {viewModeOpts.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setShowTableView(opt.value === 'table')}
                      className="transition-opacity"
                      style={{
                        color: colors.textPrimary,
                        opacity: (showTableView ? 'table' : 'chart') === opt.value ? 1 : 0.32,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 h-3.5 rounded-full overflow-hidden" style={{ backgroundColor: subtleBg(theme, 1.5) }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: colors.accent,
                        width: ready ? `${progressPct}%` : '0%',
                        transition: 'width 0.7s ease-out 0.1s',
                      }}
                    />
                  </div>
                  <span className="text-[0.6875rem] font-semibold tabular-nums shrink-0" style={{ color: colors.textSecondary }}>
                    {progressPct.toFixed(0)}%<span style={{ opacity: 0.45 }}>{' of $7M'}</span>
                  </span>
                </div>
              </div>

              {/* Sparkline */}
              {showTableView ? (
                <div className="pt-1">
                  <table className="w-full text-[0.75rem]">
                    <tbody>
                      {tableRows.map((row, index) => (
                        <tr
                          key={`table-row-${row.left.month}`}
                          className={index < tableRows.length - 1 ? 'border-b' : ''}
                          style={{ borderColor: subtleBg(theme, 1.35) }}
                        >
                          <td className="py-2 pr-3 font-medium" style={{ color: colors.textSecondary }}>
                            {row.left.month}
                          </td>
                          <td className="py-2 pr-6 text-right font-semibold tabular-nums" style={{ color: colors.textPrimary }}>
                            {formatCurrencyCompact(row.left.value)}
                          </td>
                          {row.right ? (
                            <>
                              <td className="py-2 pr-3 font-medium" style={{ color: colors.textSecondary }}>
                                {row.right.month}
                              </td>
                              <td className="py-2 text-right font-semibold tabular-nums" style={{ color: colors.textPrimary }}>
                                {formatCurrencyCompact(row.right.value)}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-2" />
                              <td className="py-2" />
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex-1 flex items-end gap-2 min-h-[110px] pt-1">
                  {MONTHLY_SALES_DATA.map((m, i) => {
                    const val = chartDataType === 'bookings' ? m.bookings : m.sales;
                    const pct = (val / chartMax) * 100;
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full">
                        <div className="w-full flex items-end flex-1">
                          <div className="w-full rounded-md" style={{
                            height: ready ? `${Math.max(8, pct)}%` : '0%',
                            backgroundColor: isDark
                              ? 'rgba(245,240,235,0.55)'
                              : colors.accent,
                            opacity: isDark ? 1 : (0.18 + (pct / 100) * 0.28),
                            transition: `height 0.5s ease-out ${0.05 + i * 0.03}s, opacity 0.3s ease`,
                          }} />
                        </div>
                        <span className="text-[0.5625rem] font-semibold tracking-wide" style={{ color: colors.textSecondary, opacity: 0.5 }}>
                          {m.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </GlassCard>

          {/* Sidebar cards */}
          <div className="grid grid-cols-1 gap-5 lg:grid-rows-2">
            {/* Leaderboard */}
            <button onClick={() => onNavigate('customer-rank')} className="w-full h-full text-left group">
              <GlassCard theme={theme} className="p-5 h-full flex flex-col" variant="elevated">
                <TileHeader title="Leaderboard" action />
                <div className="flex-1 divide-y" style={flatRowsDivider}>
                  {topLeaders.map((leader) => (
                    <div key={leader.id} className={flatRowCls}>
                      <span className="text-sm font-semibold truncate">{leader.name}</span>
                      <span className="text-sm font-bold tabular-nums shrink-0 ml-2">{formatCurrency(leader.bookings)}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </button>

            {/* Dealer Rewards */}
            <button onClick={() => onNavigate('incentive-rewards')} className="w-full h-full text-left group">
              <GlassCard theme={theme} className="p-5 h-full flex flex-col" variant="elevated">
                <TileHeader title="Dealer Rewards" action />
                {rewardsSnapshot ? (
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between mb-3">
                      <span className="text-[0.6875rem] font-medium" style={{ color: colors.textSecondary }}>{rewardsSnapshot.key}</span>
                      <span className="text-lg font-black tabular-nums">{formatCurrency(rewardsSnapshot.totalAll)}</span>
                    </div>
                    <div className="divide-y" style={flatRowsDivider}>
                      {topSalesLeader && (
                        <div className={flatRowCls}>
                          <span className="text-sm font-semibold truncate">{topSalesLeader.name}</span>
                          <span className="text-sm font-bold tabular-nums ml-2">{formatCurrency(topSalesLeader.amount)}</span>
                        </div>
                      )}
                      {topDesignLeader && (
                        <div className={flatRowCls}>
                          <span className="text-sm font-semibold truncate">{topDesignLeader.name}</span>
                          <span className="text-sm font-bold tabular-nums ml-2">{formatCurrency(topDesignLeader.amount)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm opacity-40 flex-1 flex items-center">No data yet.</p>
                )}
              </GlassCard>
            </button>
          </div>
        </div>

        {/* ── Data sections ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5">
          {/* Recent Activity */}
          <button onClick={() => onNavigate('orders')} className="w-full text-left group">
            <GlassCard theme={theme} className="p-5" variant="elevated">
              <TileHeader title="Recent Activity" action />
              <div className="divide-y" style={flatRowsDivider}>
                {recentOrders.map((order) => {
                  return (
                    <div key={order.orderNumber} className={flatRowCls}>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{formatCompanyName(order.company)}</p>
                        <p className="text-xs opacity-40 tabular-nums">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-sm font-bold tabular-nums">${order.net.toLocaleString()}</p>
                        <p className="text-[0.6875rem] font-medium" style={{ color: colors.textSecondary }}>
                          {order.status}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </button>

          {/* Invoiced by Vertical */}
          <GlassCard theme={theme} className="p-5" variant="elevated">
            <TileHeader title="Invoiced by Vertical" />
            <SalesByVerticalBreakdown theme={theme} data={SALES_VERTICALS_DATA.map(v => ({ name: v.label, value: v.value, color: v.color }))} />
          </GlassCard>
        </div>

        {/* ── Commissions Preview ── */}
        {commissionsSnapshot && (
          <button onClick={() => onNavigate('commissions')} className="w-full text-left group">
            <GlassCard theme={theme} className="p-5" variant="elevated">
              <TileHeader title="Commissions" action detail={formatCurrency(commissionsSnapshot.ytdTotal)} />
              <div className="divide-y" style={flatRowsDivider}>
                {commissionsSnapshot.topEarners.map(([name, amount]) => (
                  <div key={name} className={flatRowCls}>
                    <span className="text-sm font-semibold truncate">{name}</span>
                    <span className="text-sm font-bold tabular-nums ml-2">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </button>
        )}
      </div>

    </div>
  );
};

