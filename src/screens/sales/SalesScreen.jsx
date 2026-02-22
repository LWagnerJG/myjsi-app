import React, { useMemo, useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, TrendingUp, ChevronRight, Target, Trophy, Calendar, DollarSign } from 'lucide-react';
import { MONTHLY_SALES_DATA, SALES_VERTICALS_DATA, CUSTOMER_RANK_DATA, INCENTIVE_REWARDS_DATA } from './data.js';
import { ORDER_DATA, STATUS_COLORS } from '../orders/data.js';
import { SalesByVerticalBreakdown } from './components/SalesByVerticalBreakdown.jsx';
import { CountUp } from '../../components/common/CountUp.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
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

/* ── Inline text toggle (discrete) ───────────────────────────── */

const InlineToggle = ({ options, value, onChange, colors }) => (
  <div className="inline-flex items-center gap-0.5 rounded-full p-[2px]" style={{ backgroundColor: colors.border }}>
    {options.map(opt => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className="rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-all"
        style={{
          backgroundColor: value === opt.value ? colors.surface : 'transparent',
          color: value === opt.value ? colors.textPrimary : colors.textSecondary,
          opacity: value === opt.value ? 1 : 0.5,
          boxShadow: value === opt.value ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

/* ── Main Screen ─────────────────────────────────────────────── */

export const SalesScreen = ({ theme, onNavigate }) => {
  const [chartDataType, setChartDataType] = useState('bookings');
  const [hoveredBar, setHoveredBar] = useState(null);
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

  /* ── render ── */

  /* shared tile header */
  const TileHeader = ({ icon: Icon, title, action, onAction, badge }) => (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 opacity-40" />}
        <h3 className="text-[15px] font-bold">{title}</h3>
        {badge && (
          <span className="text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ backgroundColor: subtle(isDark, 1.5), color: colors.textSecondary }}>{badge}</span>
        )}
      </div>
      {action && (
        <span className="text-xs font-bold uppercase tracking-widest opacity-30 group-hover:opacity-60 flex items-center gap-0.5 transition-opacity">
          {action} <ChevronRight className="w-3.5 h-3.5" />
        </span>
      )}
    </div>
  );

  /* shared content row */
  const tileRowCls = "flex items-center justify-between py-2.5 px-3.5 rounded-xl";
  const tileRowBg = subtle(isDark);

  return (
    <div className="min-h-full app-header-offset" style={{ backgroundColor: colors.background }}>
      <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-4 space-y-4 lg:space-y-5 max-w-5xl mx-auto w-full">

        {/* ── Hero KPI + sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] xl:grid-cols-[1.8fr_1fr] gap-4 lg:gap-5 items-stretch">

          {/* Main KPI card */}
          <GlassCard theme={theme} className="p-5" variant="elevated">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-40">
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
                <InlineToggle options={toggleOpts} value={chartDataType} onChange={setChartDataType} colors={colors} />
              </div>

              {/* Progress to goal */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold opacity-50">
                    <Target className="w-3.5 h-3.5" /> Progress to Goal
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest"
                    style={{
                      backgroundColor: aheadOfPace ? (isDark ? 'rgba(107,155,122,0.15)' : 'rgba(74,124,89,0.08)') : (isDark ? 'rgba(200,112,112,0.15)' : 'rgba(184,92,92,0.08)'),
                      color: aheadOfPace ? (isDark ? '#6B9B7A' : '#4A7C59') : (isDark ? '#C87070' : '#B85C5C'),
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

              {/* Mini sparkline */}
              <div className="h-14 flex items-end gap-1">
                {MONTHLY_SALES_DATA.map((m, i) => {
                  const val = chartDataType === 'bookings' ? m.bookings : m.sales;
                  const pct = (val / chartMax) * 100;
                  const isHovered = hoveredBar === `mini-${i}`;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1 cursor-default"
                      onMouseEnter={() => setHoveredBar(`mini-${i}`)} onMouseLeave={() => setHoveredBar(null)}>
                      <div className="w-full relative">
                        {isHovered && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[11px] font-bold whitespace-nowrap" style={{ color: colors.textPrimary }}>
                            ${(val / 1000).toFixed(0)}k
                          </div>
                        )}
                        <div className="w-full rounded-sm" style={{
                          height: ready ? `${Math.max(4, (pct / 100) * 48)}px` : '0px',
                          backgroundColor: colors.accent,
                          opacity: isHovered ? (isDark ? 0.6 : 0.4) : (isDark ? 0.3 : 0.18),
                          transition: `height 0.4s ease-out ${0.1 + i * 0.025}s, opacity 0.15s`,
                        }} />
                      </div>
                      <span className="text-[11px] font-semibold" style={{ opacity: isHovered ? 0.7 : 0.3, transition: 'opacity 0.15s' }}>{m.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>

          {/* Sidebar cards */}
          <div className="grid grid-cols-1 grid-rows-2 gap-4">
            {/* Leaderboard */}
            <button onClick={() => onNavigate('customer-rank')} className="w-full h-full text-left group">
              <GlassCard theme={theme} className="p-5 h-full flex flex-col" variant="elevated">
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
              </GlassCard>
            </button>

            {/* Dealer Rewards */}
            <button onClick={() => onNavigate('incentive-rewards')} className="w-full h-full text-left group">
              <GlassCard theme={theme} className="p-5 h-full flex flex-col" variant="elevated">
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
                        <div className="py-2 px-3.5 rounded-xl" style={{ backgroundColor: tileRowBg }}>
                          <div className="text-[11px] font-bold uppercase tracking-wider opacity-30 mb-1.5">Top Sales</div>
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
                        <div className="py-2 px-3.5 rounded-xl" style={{ backgroundColor: tileRowBg }}>
                          <div className="text-[11px] font-bold uppercase tracking-wider opacity-30 mb-1.5">Top Design</div>
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
              </GlassCard>
            </button>
          </div>
        </div>

        {/* ── Data sections ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 lg:gap-5">
          {/* Recent Activity */}
          <button onClick={() => onNavigate('orders')} className="w-full text-left group">
            <GlassCard theme={theme} className="p-5" variant="elevated">
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
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0"
                          style={{ backgroundColor: subtle(isDark, 2) }}>
                          PO
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-sm font-semibold truncate max-w-[170px]">{formatCompanyName(order.company)}</p>
                          <p className="text-xs opacity-40 tabular-nums">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2 space-y-0.5">
                        <p className="text-sm font-bold tabular-nums">${order.net.toLocaleString()}</p>
                        <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: sc + '14', color: sc }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </button>

          {/* Invoiced by Vertical */}
          <GlassCard theme={theme} className="p-5" variant="elevated">
            <TileHeader title="Invoiced by Vertical" badge="YTD" />
            <SalesByVerticalBreakdown theme={theme} data={SALES_VERTICALS_DATA.map(v => ({ name: v.label, value: v.value, color: v.color }))} />
          </GlassCard>
        </div>

        {/* ── Commissions Preview ── */}
        {commissionsSnapshot && (
          <button onClick={() => onNavigate('commissions')} className="w-full text-left group">
            <GlassCard theme={theme} className="p-5" variant="elevated">
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
                      <div key={name} className="py-2 px-3.5 rounded-xl min-w-0" style={{ backgroundColor: tileRowBg }}>
                        <div className="text-xs opacity-35 truncate mb-0.5">{name}</div>
                        <div className="text-sm font-bold tabular-nums">{formatCurrency(amount)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          </button>
        )}
      </div>

    </div>
  );
};

