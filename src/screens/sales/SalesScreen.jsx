import React, { useMemo, useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, TrendingUp, ChevronRight, Trophy, Calendar, DollarSign } from 'lucide-react';
import { SegmentedToggle } from '../../components/common/GroupedToggle.jsx';
import { MONTHLY_SALES_DATA, SALES_VERTICALS_DATA, CUSTOMER_RANK_DATA, INCENTIVE_REWARDS_DATA } from './data.js';
import { ORDER_DATA, STATUS_COLORS } from '../orders/data.js';
import { SalesByVerticalBreakdown } from './components/SalesByVerticalBreakdown.jsx';
import { CountUp } from '../../components/common/CountUp.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import { formatCurrency, formatCompanyName } from '../../utils/format.js';

/* ── helpers ─────────────────────────────────────────────────── */

const subtle = (isDark, strength = 1) =>
  isDark ? `rgba(255,255,255,${(0.04 * strength).toFixed(3)})` : `rgba(0,0,0,${(0.025 * strength).toFixed(4)})`;

const parseQuarterKey = (key = '') => {
  const [y, q] = key.split('-Q');
  return { y: parseInt(y, 10) || 0, q: parseInt(q, 10) || 0 };
};

const sortQuarterEntries = (entries) =>
  [...entries].sort((a, b) => {
    const pa = parseQuarterKey(a[0]), pb = parseQuarterKey(b[0]);
    return pa.y === pb.y ? pa.q - pb.q : pa.y - pb.y;
  });

/* ── Main Screen ─────────────────────────────────────────────── */

export const SalesScreen = ({ theme, onNavigate }) => {
  const [chartDataType, setChartDataType] = useState('bookings');
  const [hoveredBar, setHoveredBar] = useState(null);
  const isDark = isDarkTheme(theme);
  const bdr = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

  const colors = useMemo(() => ({
    background: theme?.colors?.background || '#F0EDE8',
    surface: theme?.colors?.surface || '#FFFFFF',
    accent: theme?.colors?.accent || '#353535',
    textPrimary: theme?.colors?.textPrimary || '#353535',
    textSecondary: theme?.colors?.textSecondary || '#666666',
    border: theme?.colors?.border || '#E3E0D8',
    subtle: theme?.colors?.subtle || 'rgba(0,0,0,0.03)',
  }), [theme]);

  /* ── derived data (all static, compute once) ── */

  const { totalBookings, totalSales } = useMemo(() => ({
    totalBookings: MONTHLY_SALES_DATA.reduce((a, m) => a + m.bookings, 0),
    totalSales: MONTHLY_SALES_DATA.reduce((a, m) => a + m.sales, 0),
  }), []);

  const activeTotal = chartDataType === 'bookings' ? totalBookings : totalSales;

  const { aheadOfPace, deltaLabel, progressPct } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const next = new Date(now.getFullYear() + 1, 0, 1);
    const yearPct = ((Math.floor((now - start) / 86400000) + 1) / ((next - start) / 86400000)) * 100;
    const goalPct = ((chartDataType === 'bookings' ? totalBookings : totalSales) / 7_000_000) * 100;
    return {
      aheadOfPace: goalPct >= yearPct,
      deltaLabel: `${Math.abs(goalPct - yearPct).toFixed(1)}%`,
      progressPct: Math.min(100, goalPct),
    };
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

  const statusColor = (status) => STATUS_COLORS[status] || colors.textSecondary;

  /* ── animation gate — wait for screen slide-in ── */

  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 300); return () => clearTimeout(t); }, []);

  /* ── toggle theme override — stronger container bg so it reads on white card ── */
  const toggleTheme = useMemo(() => ({
    ...theme,
    colors: {
      ...theme.colors,
      subtle: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)',
    },
  }), [theme, isDark]);

  /* ── render ── */

  /* shared tile header */
  const TileHeader = ({ icon: Icon, title, action, badge }) => (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 opacity-40" />}
        <h3 className="text-[15px] font-bold">{title}</h3>
        {badge && (
          <span className="text-[11px] font-bold uppercase tracking-[0.07em] px-2 py-0.5 rounded-full"
            style={{ backgroundColor: subtle(isDark, 1.5), color: colors.textSecondary }}>{badge}</span>
        )}
      </div>
      {action && (
        <span className="text-xs font-bold uppercase tracking-[0.07em] opacity-50 group-hover:opacity-70 flex items-center gap-0.5 transition-opacity">
          {action} <ChevronRight className="w-3.5 h-3.5" />
        </span>
      )}
    </div>
  );

  /* shared content row */
  const tileRowCls = "flex items-center justify-between py-2.5 px-3.5 rounded-[12px]";
  const tileRowBg = subtle(isDark, 2);

  return (
    <div className="min-h-full" style={{ backgroundColor: colors.background }}>
      <div className="px-4 sm:px-6 lg:px-8 pb-4 space-y-4 lg:space-y-5 max-w-5xl mx-auto w-full" style={{ paddingTop: 'calc(var(--app-header-offset, 72px) + env(safe-area-inset-top, 0px) + 16px)' }}>

        {/* ── Hero KPI + sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] xl:grid-cols-[1.8fr_1fr] gap-4 lg:gap-5">

          {/* Main KPI card */}
          <div className="rounded-[22px] overflow-hidden p-5 h-full" style={{ backgroundColor: colors.surface, border: `1px solid ${bdr}` }}>
            <div className="h-full flex flex-col gap-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.07em] opacity-40">
                    {chartDataType === 'bookings' ? 'Total Bookings' : 'Total Sales'}
                  </p>
                  <div className="text-4xl sm:text-[42px] font-black tracking-tight leading-none" style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.4s ease' }}>
                    {ready ? (
                      <CountUp value={activeTotal} prefix="$" duration={0.6} format={(v) => `$${Math.round(v).toLocaleString()}`} />
                    ) : (
                      <span style={{ color: 'transparent' }}>$0</span>
                    )}
                  </div>
                </div>
                <SegmentedToggle options={toggleOpts} value={chartDataType} onChange={setChartDataType} theme={toggleTheme} size="sm" />
              </div>

              {/* Progress to goal */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold opacity-40">Progress to Goal</span>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-[0.07em]"
                    style={{
                      backgroundColor: aheadOfPace ? (isDark ? 'rgba(107,155,122,0.15)' : 'rgba(74,124,89,0.08)') : (isDark ? 'rgba(200,112,112,0.15)' : 'rgba(184,92,92,0.08)'),
                      color: aheadOfPace ? theme.colors.success : theme.colors.error,
                    }}>
                    {aheadOfPace ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {deltaLabel} {aheadOfPace ? 'Ahead' : 'Behind'}
                  </div>
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: subtle(isDark, 1.5) }}>
                  <div className="h-full rounded-full" style={{ backgroundColor: colors.accent, width: ready ? `${progressPct}%` : '0%', transition: 'width 0.7s ease-out 0.1s' }} />
                </div>
                <div className="text-xs font-semibold opacity-35 tabular-nums">{progressPct.toFixed(1)}% of $7M goal</div>
              </div>

              {/* Sparkline — flex-1 fills remaining card height on desktop */}
              <div className="flex flex-col gap-1.5 flex-1 min-h-[112px]">
                {/* Chart caption — shows hovered bar value, otherwise the peak bar value */}
                <div className="flex items-baseline justify-between" style={{ minHeight: 18 }}>
                  <span className="text-[12px] font-bold tabular-nums" style={{ color: colors.textPrimary, opacity: hoveredBar != null ? 1 : 0.45, transition: 'opacity 0.15s' }}>
                    {(() => {
                      if (hoveredBar != null) {
                        const idx = parseInt(hoveredBar.replace('mini-', ''), 10);
                        const m = MONTHLY_SALES_DATA[idx];
                        if (!m) return null;
                        const val = chartDataType === 'bookings' ? m.bookings : m.sales;
                        return `${m.month}  $${(val / 1000).toFixed(0)}k`;
                      }
                      const peakIdx = MONTHLY_SALES_DATA.reduce((best, m, i) => {
                        const v = chartDataType === 'bookings' ? m.bookings : m.sales;
                        const bv = chartDataType === 'bookings' ? MONTHLY_SALES_DATA[best].bookings : MONTHLY_SALES_DATA[best].sales;
                        return v > bv ? i : best;
                      }, 0);
                      const peak = MONTHLY_SALES_DATA[peakIdx];
                      const val = chartDataType === 'bookings' ? peak.bookings : peak.sales;
                      return `${peak.month}  $${(val / 1000).toFixed(0)}k`;
                    })()}
                  </span>
                  <span className="text-[11px] font-semibold opacity-30">
                    {hoveredBar != null ? 'selected' : 'peak'}
                  </span>
                </div>
                {/* Bars */}
                <div className="flex items-end gap-1.5 flex-1">
                  {MONTHLY_SALES_DATA.map((m, i) => {
                    const val = chartDataType === 'bookings' ? m.bookings : m.sales;
                    const pct = (val / chartMax) * 100;
                    const isHovered = hoveredBar === `mini-${i}`;
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-1 cursor-default h-full"
                        onMouseEnter={() => setHoveredBar(`mini-${i}`)} onMouseLeave={() => setHoveredBar(null)}>
                        <div className="w-full rounded-md" style={{
                          height: ready ? `${Math.max(8, pct)}%` : '0%',
                          backgroundColor: colors.accent,
                          opacity: isHovered ? (isDark ? 0.8 : 0.65) : (isDark ? 0.4 : 0.28),
                          transition: `height 0.4s ease-out ${0.1 + i * 0.025}s, opacity 0.15s`,
                        }} />
                        <span className="text-[11px] font-semibold" style={{ opacity: isHovered ? 0.8 : 0.35, transition: 'opacity 0.15s' }}>{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar cards */}
          <div className="grid grid-cols-1 grid-rows-2 gap-4">
            {/* Leaderboard */}
            <button onClick={() => onNavigate('customer-rank')} className="w-full h-full text-left group">
              <div className="rounded-[22px] overflow-hidden p-5 h-full flex flex-col" style={{ backgroundColor: colors.surface, border: `1px solid ${bdr}` }}>
                <TileHeader icon={TrendingUp} title="Leaderboard" action="View All" />
                <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                  {topLeaders.map((leader, idx) => (
                    <div key={leader.id} className={tileRowCls}
                      style={{
                        backgroundColor: tileRowBg,
                        opacity: ready ? 1 : 0,
                        transform: ready ? 'none' : 'translateX(-4px)',
                        transition: `opacity 0.3s ease ${0.05 + idx * 0.05}s, transform 0.3s ease ${0.05 + idx * 0.05}s`,
                      }}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                          style={{ backgroundColor: subtle(isDark, 2), color: colors.textSecondary }}>
                          {idx + 1}
                        </span>
                        <span className="text-sm font-semibold truncate">{leader.name}</span>
                      </div>
                      <span className="text-sm font-bold tabular-nums shrink-0 ml-2">{formatCurrency(leader.bookings)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </button>

            {/* Dealer Rewards */}
            <button onClick={() => onNavigate('incentive-rewards')} className="w-full h-full text-left group">
              <div className="rounded-[22px] overflow-hidden p-5 h-full flex flex-col" style={{ backgroundColor: colors.surface, border: `1px solid ${bdr}` }}>
                <TileHeader icon={Trophy} title="Dealer Rewards" action="Details" />
                {rewardsSnapshot ? (
                  <div className="flex-1 flex flex-col justify-center space-y-1.5">
                    <div className={tileRowCls} style={{ backgroundColor: tileRowBg }}>
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 opacity-35" />
                        <span className="text-sm font-semibold">{rewardsSnapshot.key}</span>
                      </div>
                      <span className="text-sm font-bold tabular-nums">{formatCurrency(rewardsSnapshot.totalAll)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {rewardsSnapshot.topSales.length > 0 && (
                        <div className="py-2 px-3.5 rounded-[12px]" style={{ backgroundColor: tileRowBg }}>
                          <div className="text-[11px] font-bold uppercase tracking-[0.07em] opacity-30 mb-1.5">Top Sales</div>
                          <div className="space-y-1.5">
                            {rewardsSnapshot.topSales.map((p) => (
                              <div key={p.name}>
                                <div className="text-sm font-semibold truncate">{p.name}</div>
                                <div className="text-xs tabular-nums opacity-50">{formatCurrency(p.amount)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {rewardsSnapshot.topDesigners.length > 0 && (
                        <div className="py-2 px-3.5 rounded-[12px]" style={{ backgroundColor: tileRowBg }}>
                          <div className="text-[11px] font-bold uppercase tracking-[0.07em] opacity-30 mb-1.5">Top Design</div>
                          <div className="space-y-1.5">
                            {rewardsSnapshot.topDesigners.map((p) => (
                              <div key={p.name}>
                                <div className="text-sm font-semibold truncate">{p.name}</div>
                                <div className="text-xs tabular-nums opacity-50">{formatCurrency(p.amount)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm opacity-40 flex-1 flex items-center">No rewards data yet.</p>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* ── Data sections ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 lg:gap-5">
          {/* Recent Activity */}
          <button onClick={() => onNavigate('orders')} className="w-full text-left group">
            <div className="rounded-[22px] overflow-hidden p-5" style={{ backgroundColor: colors.surface, border: `1px solid ${bdr}` }}>
              <TileHeader title="Recent Activity" action="All Orders" />
              <div className="space-y-1.5">
                {recentOrders.map((order, i) => {
                  const sc = statusColor(order.status);
                  return (
                    <div key={order.orderNumber} className={tileRowCls}
                      style={{
                        backgroundColor: tileRowBg,
                        opacity: ready ? 1 : 0,
                        transition: `opacity 0.25s ease ${0.08 + i * 0.03}s`,
                      }}>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{formatCompanyName(order.company)}</p>
                        <p className="text-xs opacity-40 tabular-nums">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2 space-y-0.5">
                        <p className="text-sm font-bold tabular-nums">${order.net.toLocaleString()}</p>
                        <span className="inline-block text-[11px] font-bold uppercase tracking-[0.07em] px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: sc + '14', color: sc }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </button>

          {/* Invoiced by Vertical */}
          <div className="rounded-[22px] overflow-hidden p-5" style={{ backgroundColor: colors.surface, border: `1px solid ${bdr}` }}>
            <TileHeader title="Invoiced by Vertical" badge="YTD" />
            <SalesByVerticalBreakdown theme={theme} data={SALES_VERTICALS_DATA.map(v => ({ name: v.label, value: v.value, color: v.color }))} />
          </div>
        </div>

        {/* ── Commissions Preview ── */}
        {commissionsSnapshot && (
          <button onClick={() => onNavigate('commissions')} className="w-full text-left group">
            <div className="rounded-[22px] overflow-hidden p-5" style={{ backgroundColor: colors.surface, border: `1px solid ${bdr}` }}>
              <TileHeader icon={DollarSign} title="Commissions" action="View All" />
              <div className="space-y-2.5">
                <div className={tileRowCls} style={{ backgroundColor: tileRowBg }}>
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 opacity-35" />
                    <span className="text-sm font-semibold">{commissionsSnapshot.year} · {commissionsSnapshot.quartersReported}Q reported</span>
                  </div>
                  <span className="text-base font-black tabular-nums">{formatCurrency(commissionsSnapshot.ytdTotal)}</span>
                </div>
                {commissionsSnapshot.topEarners.length > 0 && (
                  <div className="grid grid-cols-3 gap-1.5">
                    {commissionsSnapshot.topEarners.map(([name, amount]) => (
                      <div key={name} className="py-2 px-3.5 rounded-[12px] min-w-0" style={{ backgroundColor: tileRowBg }}>
                        <div className="text-xs opacity-35 truncate mb-0.5">{name}</div>
                        <div className="text-sm font-bold tabular-nums">{formatCurrency(amount)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </button>
        )}
      </div>

    </div>
  );
};
