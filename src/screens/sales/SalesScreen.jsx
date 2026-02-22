import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Modal } from '../../components/common/Modal';
import { ArrowUp, ArrowDown, TrendingUp, BarChart, Table, ChevronRight, Target, Trophy, Calendar, DollarSign } from 'lucide-react';
import { MONTHLY_SALES_DATA, SALES_VERTICALS_DATA, CUSTOMER_RANK_DATA, INCENTIVE_REWARDS_DATA } from './data.js';
import { ORDER_DATA, STATUS_COLORS } from '../orders/data.js';
import { SalesByVerticalBreakdown } from './components/SalesByVerticalBreakdown.jsx';
import { CountUp } from '../../components/common/CountUp.jsx';
import { motion, AnimatePresence } from 'framer-motion';
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

/* ── Order Detail Modal ──────────────────────────────────────── */

const OrderModal = ({ order, onClose, theme }) => {
  if (!order) return null;
  const c = {
    primary: theme?.colors?.textPrimary || '#353535',
    accent: theme?.colors?.accent || '#353535',
    secondary: theme?.colors?.secondary || '#666666',
  };
  return (
    <Modal show={!!order} onClose={onClose} title={`PO #${order.po}`} theme={theme}>
      <div className="space-y-6 text-sm" style={{ color: c.primary }}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">{formatCompanyName(order.company)}</h3>
            <p className="opacity-60">{order.details}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black" style={{ color: c.accent }}>${order.net.toLocaleString()}</p>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ backgroundColor: (STATUS_COLORS[order.status] || c.secondary) + '20', color: STATUS_COLORS[order.status] || c.secondary }}>
              {order.status}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl" style={{ backgroundColor: theme?.colors?.subtle || 'rgba(0,0,0,0.02)' }}>
          <div><div className="text-[10px] uppercase tracking-widest font-bold opacity-40">Order Date</div><div className="font-bold">{new Date(order.date).toLocaleDateString()}</div></div>
          <div><div className="text-[10px] uppercase tracking-widest font-bold opacity-40">Ship Date</div><div className="font-bold">{new Date(order.shipDate).toLocaleDateString()}</div></div>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-3">Line Items</h4>
          <div className="space-y-3">{order.lineItems?.map(li => (
            <div key={li.line} className="flex justify-between items-center py-2 last:border-0" style={{ borderBottom: `1px solid ${theme?.colors?.border || 'rgba(0,0,0,0.03)'}` }}>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs" style={{ backgroundColor: theme?.colors?.subtle || 'rgba(0,0,0,0.04)' }}>{li.quantity}x</span>
                <span className="font-bold">{li.name}</span>
              </div>
              <span className="font-bold">${li.extNet.toLocaleString()}</span>
            </div>
          ))}</div>
        </div>
      </div>
    </Modal>
  );
};

/* ── Inline text toggle (discrete) ───────────────────────────── */

const InlineToggle = ({ options, value, onChange, colors }) => (
  <div className="inline-flex items-center gap-0.5 rounded-full p-[2px]" style={{ backgroundColor: colors.border }}>
    {options.map(opt => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all"
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
  const [monthlyView, setMonthlyView] = useState('chart');
  const [chartDataType, setChartDataType] = useState('bookings');
  const [selectedOrder, setSelectedOrder] = useState(null);
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
    const top = [...sales].sort((a, b) => (b.amount || 0) - (a.amount || 0))[0];
    const totalSalesR = sales.reduce((s, r) => s + (r.amount || 0), 0);
    const totalDesignR = designers.reduce((s, r) => s + (r.amount || 0), 0);
    return { key, top, totalSalesR, totalDesignR, totalAll: totalSalesR + totalDesignR, salesCount: sales.length, designersCount: designers.length };
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

  const statusColor = useCallback((status) => STATUS_COLORS[status] || colors.textSecondary, [colors.textSecondary]);

  /* ── animation gate — wait for screen slide-in ── */

  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 300); return () => clearTimeout(t); }, []);

  /* ── render ── */

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide app-header-offset" style={{ backgroundColor: colors.background, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 lg:space-y-6 max-w-5xl mx-auto w-full pb-6">

        {/* ── Hero KPI + sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] xl:grid-cols-[1.8fr_1fr] gap-5 lg:gap-6 items-stretch">

          {/* Main KPI card */}
          <GlassCard theme={theme} className="p-6 sm:p-7" variant="elevated">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-40">
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
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
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
                <div className="text-[10px] font-semibold opacity-35 tabular-nums">{progressPct.toFixed(1)}% of $7M goal</div>
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
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold whitespace-nowrap" style={{ color: colors.textPrimary }}>
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
                      <span className="text-[8px] font-semibold" style={{ opacity: isHovered ? 0.7 : 0.3, transition: 'opacity 0.15s' }}>{m.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>

          {/* Sidebar cards */}
          <div className="grid grid-cols-1 gap-4">
            {/* Leaderboard */}
            <GlassCard theme={theme} className="p-5 space-y-3" variant="elevated">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <TrendingUp className="w-3.5 h-3.5 opacity-50" /> Leaderboard
                </div>
                <button onClick={() => onNavigate('customer-rank')}
                  className="text-[10px] font-bold uppercase tracking-widest opacity-35 hover:opacity-80 flex items-center gap-0.5 transition-opacity">
                  View All <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1">
                {topLeaders.map((leader, idx) => (
                  <div key={leader.id} className="flex items-center justify-between text-xs py-2 px-3 rounded-xl"
                    style={{
                      backgroundColor: subtle(isDark),
                      opacity: ready ? 1 : 0,
                      transform: ready ? 'none' : 'translateX(-4px)',
                      transition: `opacity 0.3s ease ${0.05 + idx * 0.05}s, transform 0.3s ease ${0.05 + idx * 0.05}s`,
                    }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                        style={{ backgroundColor: subtle(isDark, 2), color: colors.textSecondary }}>
                        {idx + 1}
                      </span>
                      <span className="font-semibold truncate">{leader.name}</span>
                    </div>
                    <span className="font-bold tabular-nums shrink-0 ml-2">{formatCurrency(leader.bookings)}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Dealer Rewards */}
            <GlassCard theme={theme} className="p-5 space-y-3" variant="elevated">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Trophy className="w-3.5 h-3.5 opacity-50" /> Dealer Rewards
                </div>
                <button onClick={() => onNavigate('incentive-rewards')}
                  className="text-[10px] font-bold uppercase tracking-widest opacity-35 hover:opacity-80 flex items-center gap-0.5 transition-opacity">
                  Details <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {rewardsSnapshot ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-3 rounded-xl text-xs" style={{ backgroundColor: subtle(isDark) }}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 opacity-35" />
                      <span className="font-semibold">{rewardsSnapshot.key}</span>
                    </div>
                    <span className="font-bold tabular-nums">{formatCurrency(rewardsSnapshot.totalAll)}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="flex-1 py-1.5 px-2.5 rounded-xl text-center" style={{ backgroundColor: subtle(isDark) }}>
                      <div className="text-[9px] font-medium opacity-35 mb-0.5">Sales ({rewardsSnapshot.salesCount})</div>
                      <div className="text-[11px] font-bold tabular-nums">{formatCurrency(rewardsSnapshot.totalSalesR)}</div>
                    </div>
                    <div className="flex-1 py-1.5 px-2.5 rounded-xl text-center" style={{ backgroundColor: subtle(isDark) }}>
                      <div className="text-[9px] font-medium opacity-35 mb-0.5">Design ({rewardsSnapshot.designersCount})</div>
                      <div className="text-[11px] font-bold tabular-nums">{formatCurrency(rewardsSnapshot.totalDesignR)}</div>
                    </div>
                  </div>
                  {rewardsSnapshot.top && (
                    <div className="text-[9px] font-medium opacity-30 px-1">
                      Top: {rewardsSnapshot.top.name} — {formatCurrency(rewardsSnapshot.top.amount)}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs opacity-40">No rewards data yet.</p>
              )}
            </GlassCard>
          </div>
        </div>

        {/* ── Data sections ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5 lg:gap-6">
          {/* Recent Activity */}
          <GlassCard theme={theme} className="p-5 sm:p-6 space-y-3" variant="elevated">
            <div className="flex justify-between items-center">
              <h3 className="text-[15px] font-bold">Recent Activity</h3>
              <button onClick={() => onNavigate('orders')}
                className="text-[10px] font-bold uppercase tracking-widest opacity-35 hover:opacity-80 flex items-center gap-0.5 transition-opacity">
                All Orders <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-0.5">
              {recentOrders.map((order, i) => {
                const sc = statusColor(order.status);
                return (
                  <button key={order.orderNumber} onClick={() => setSelectedOrder(order)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl active:scale-[0.98] transition-all"
                    style={{ opacity: ready ? 1 : 0, transition: `opacity 0.25s ease ${0.08 + i * 0.03}s` }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = subtle(isDark, 1.5)}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-[9px] shrink-0"
                        style={{ backgroundColor: subtle(isDark, 1.8) }}>
                        PO
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-[13px] font-bold truncate max-w-[170px]">{formatCompanyName(order.company)}</p>
                        <p className="text-[10px] font-medium opacity-35 tabular-nums">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2 space-y-0.5">
                      <p className="text-[13px] font-black tabular-nums">${order.net.toLocaleString()}</p>
                      <span className="inline-block text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: sc + '14', color: sc }}>
                        {order.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Invoiced by Vertical */}
          <GlassCard theme={theme} className="p-5 sm:p-6 space-y-3" variant="elevated">
            <div className="flex justify-between items-center">
              <h3 className="text-[15px] font-bold">Invoiced by Vertical</h3>
              <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ backgroundColor: subtle(isDark, 1.5), color: colors.textSecondary }}>YTD</span>
            </div>
            <SalesByVerticalBreakdown theme={theme} data={SALES_VERTICALS_DATA.map(v => ({ name: v.label, value: v.value, color: v.color }))} />
          </GlassCard>
        </div>

        {/* ── Monthly Trend (desktop) ── */}
        <GlassCard theme={theme} className="p-5 sm:p-6 space-y-4 hidden sm:block" variant="elevated">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-[15px] font-bold">Monthly Trend</h3>
              <InlineToggle options={toggleOpts} value={chartDataType} onChange={setChartDataType} colors={colors} />
            </div>
            <button onClick={() => setMonthlyView(v => v === 'chart' ? 'table' : 'chart')}
              className="p-1.5 rounded-lg transition-colors" style={{ backgroundColor: subtle(isDark, 1.5) }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = subtle(isDark, 3)}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = subtle(isDark, 1.5)}
              aria-label={monthlyView === 'chart' ? 'Table view' : 'Chart view'}>
              {monthlyView === 'chart' ? <Table className="w-3.5 h-3.5 opacity-50" /> : <BarChart className="w-3.5 h-3.5 opacity-50" />}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {monthlyView === 'chart' ? (
              <motion.div key="chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                className="min-h-[200px] flex items-end gap-2.5 overflow-hidden px-1 pb-1">
                {MONTHLY_SALES_DATA.map((m, i) => {
                  const val = chartDataType === 'bookings' ? m.bookings : m.sales;
                  const pct = (val / chartMax) * 100;
                  const isHovered = hoveredBar === `chart-${i}`;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-2 cursor-default"
                      onMouseEnter={() => setHoveredBar(`chart-${i}`)} onMouseLeave={() => setHoveredBar(null)}>
                      <div className="w-full h-40 relative flex items-end justify-center">
                        <div className="w-full rounded-lg"
                          style={{
                            height: ready ? `${Math.max(4, pct)}%` : '0%',
                            backgroundColor: colors.accent,
                            opacity: isHovered ? (isDark ? 0.6 : 0.4) : (isDark ? 0.3 : 0.2),
                            transition: `height 0.4s ease-out ${i * 0.025}s, opacity 0.15s`,
                          }} />
                        {isHovered && (
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black whitespace-nowrap px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: colors.accent, color: isDark ? '#1A1A1A' : '#FFF' }}>
                            ${(val / 1000).toFixed(0)}k
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] font-semibold" style={{ opacity: isHovered ? 0.8 : 0.3, transition: 'opacity 0.15s' }}>{m.month}</span>
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {MONTHLY_SALES_DATA.map((m, i) => {
                  const val = chartDataType === 'bookings' ? m.bookings : m.sales;
                  const pct = (val / chartMax) * 100;
                  return (
                    <div key={m.month} className="flex items-center gap-3 py-2.5"
                      style={{ borderBottom: i < MONTHLY_SALES_DATA.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                      <span className="w-9 text-[11px] font-bold" style={{ color: colors.textPrimary }}>{m.month}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: subtle(isDark, 1.5) }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colors.accent, opacity: isDark ? 0.4 : 0.25, transition: 'width 0.4s ease' }} />
                      </div>
                      <span className="text-[11px] font-bold tabular-nums w-20 text-right">{formatCurrency(val)}</span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* ── Commissions Preview ── */}
        {commissionsSnapshot && (
          <button onClick={() => onNavigate('commissions')} className="w-full text-left group">
            <GlassCard theme={theme} className="p-5 sm:p-6" variant="elevated">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: subtle(isDark, 1.5) }}>
                    <DollarSign className="w-4 h-4 opacity-50" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold leading-tight">Commissions</h3>
                    <p className="text-[10px] font-medium opacity-35">{commissionsSnapshot.year} · {commissionsSnapshot.quartersReported} quarter{commissionsSnapshot.quartersReported !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-black tabular-nums">{formatCurrency(commissionsSnapshot.ytdTotal)}</span>
                  <ChevronRight className="w-4 h-4 opacity-25 group-hover:opacity-60 transition-opacity" />
                </div>
              </div>

              {commissionsSnapshot.topEarners.length > 0 && (
                <div className="flex gap-1.5 mt-3 overflow-hidden">
                  {commissionsSnapshot.topEarners.map(([name, amount]) => (
                    <div key={name} className="flex-1 min-w-0 py-1.5 px-2.5 rounded-xl" style={{ backgroundColor: subtle(isDark) }}>
                      <div className="text-[9px] font-medium opacity-35 truncate mb-0.5">{name}</div>
                      <div className="text-[11px] font-bold tabular-nums">{formatCurrency(amount)}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-[10px] font-bold uppercase tracking-widest opacity-25 group-hover:opacity-50 flex items-center gap-1 mt-3 transition-opacity">
                View all commissions <ChevronRight className="w-3 h-3" />
              </div>
            </GlassCard>
          </button>
        )}
      </div>

      <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} theme={theme} />
    </div>
  );
};

