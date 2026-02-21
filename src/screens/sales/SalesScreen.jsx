import React, { useMemo, useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { ArrowUp, ArrowDown, TrendingUp, Award, DollarSign, BarChart, Table, ChevronRight, Target, Trophy, Calendar } from 'lucide-react';
import { MONTHLY_SALES_DATA, SALES_VERTICALS_DATA, CUSTOMER_RANK_DATA, INCENTIVE_REWARDS_DATA } from './data.js';
import { ORDER_DATA, STATUS_COLORS } from '../orders/data.js';
import { SalesByVerticalBreakdown } from './components/SalesByVerticalBreakdown.jsx';
import { CountUp } from '../../components/common/CountUp.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import { formatCurrency, formatCompanyName } from '../../utils/format.js';

const SALES_TOP_ACTIONS = [
  { value: 'rewards', label: 'Dealer Rewards', icon: Award, route: 'incentive-rewards' },
  { value: 'comms', label: 'Commissions', icon: DollarSign, route: 'commissions' },
];

// Rank colors — gold/silver/bronze in JSI earth tones
const RANK_STYLES = [
  { bg: 'rgba(196, 149, 106, 0.18)', color: '#8B7355', icon: '🥇' },
  { bg: 'rgba(160, 152, 144, 0.15)', color: '#7A7268', icon: '🥈' },
  { bg: 'rgba(196, 149, 106, 0.10)', color: '#A09080', icon: '🥉' },
];

const OrderModal = ({ order, onClose, theme }) => {
  if (!order) return null;
  const colors = {
    primary: theme?.colors?.textPrimary || '#353535',
    accent: theme?.colors?.accent || '#353535',
    secondary: theme?.colors?.secondary || '#666666'
  };

  return (
    <Modal show={!!order} onClose={onClose} title={`PO #${order.po}`} theme={theme}>
      <div className="space-y-6 text-sm" style={{ color: colors.primary }}>
        <div className="flex justify-between items-start">
          <div><h3 className="text-xl font-bold">{formatCompanyName(order.company)}</h3><p className="opacity-60">{order.details}</p></div>
          <div className="text-right">
            <p className="text-2xl font-black" style={{ color: colors.accent }}>${order.net.toLocaleString()}</p>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: (STATUS_COLORS[order.status] || colors.secondary) + '20', color: STATUS_COLORS[order.status] || colors.secondary }}>{order.status}</span>
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

// Segmented toggle pill used in hero & monthly chart
const SegmentedPill = ({ options, value, onChange, colors }) => (
  <div className="inline-flex items-center gap-1 rounded-full p-[3px]" style={{ backgroundColor: colors.border }}>
    {options.map(opt => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-all ${value === opt.value ? 'shadow-sm' : ''}`}
        style={{
          backgroundColor: value === opt.value ? colors.surface : 'transparent',
          color: value === opt.value ? colors.textPrimary : colors.textSecondary
        }}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

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

  const { totalBookings, totalSales } = useMemo(() => ({
    totalBookings: MONTHLY_SALES_DATA.reduce((a, m) => a + m.bookings, 0),
    totalSales: MONTHLY_SALES_DATA.reduce((a, m) => a + m.sales, 0)
  }), []);

  const { aheadOfPace, deltaLabel, progressPct } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1); const next = new Date(now.getFullYear() + 1, 0, 1);
    const totalDays = (next - start) / 86400000; const dayOfYear = Math.floor((now - start) / 86400000) + 1;
    const yearPct = (dayOfYear / totalDays) * 100;
    const total = chartDataType === 'bookings' ? totalBookings : totalSales;
    const goalPct = (total / 7000000) * 100;
    return {
      aheadOfPace: (goalPct - yearPct) >= 0,
      deltaLabel: `${Math.abs(goalPct - yearPct).toFixed(1)}%`,
      progressPct: Math.min(100, goalPct),
    };
  }, [chartDataType, totalBookings, totalSales]);

  const recentOrders = useMemo(() => [...ORDER_DATA].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5), []);
  const topLeaders = useMemo(() => [...CUSTOMER_RANK_DATA].sort((a, b) => (b.bookings || 0) - (a.bookings || 0)).slice(0, 3), []);
  const activeTotal = chartDataType === 'bookings' ? totalBookings : totalSales;

  // Hoist max calculations out of render loops
  const chartMax = useMemo(() => Math.max(...MONTHLY_SALES_DATA.map(d => chartDataType === 'bookings' ? d.bookings : d.sales)), [chartDataType]);

  // Delay internal animations until after screen transition settles
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 280); return () => clearTimeout(t); }, []);

  const rewardsSnapshot = useMemo(() => {
    const entries = Object.entries(INCENTIVE_REWARDS_DATA || {});
    if (!entries.length) return null;
    const parseKey = (key = '') => {
      const [y, q] = key.split('-Q');
      return { y: parseInt(y, 10) || 0, q: parseInt(q, 10) || 0 };
    };
    entries.sort((a, b) => {
      const pa = parseKey(a[0]);
      const pb = parseKey(b[0]);
      return pa.y === pb.y ? pa.q - pb.q : pa.y - pb.y;
    });
    const [key, data] = entries[entries.length - 1];
    const sales = data?.sales || [];
    const top = [...sales].sort((a, b) => (b.amount || 0) - (a.amount || 0))[0];
    const total = sales.reduce((s, r) => s + (r.amount || 0), 0);
    return { key, top, total };
  }, []);

  const chartToggleOpts = [
    { value: 'bookings', label: 'Bookings' },
    { value: 'sales', label: 'Sales' },
  ];

  const statusColor = (status) => STATUS_COLORS[status] || colors.textSecondary;

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide app-header-offset" style={{ backgroundColor: colors.background, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 lg:space-y-8 max-w-5xl mx-auto w-full pb-20 lg:pb-12">

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
          {SALES_TOP_ACTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onNavigate(opt.route)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all border"
              style={{ backgroundColor: colors.surface, color: colors.textSecondary, borderColor: colors.border }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.color = colors.textPrimary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.textSecondary; }}
            >
              <opt.icon className="w-4 h-4" />
              {opt.label}
            </button>
          ))}
        </div>

        {/* Hero Section - Main KPI + Side Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] xl:grid-cols-[1.8fr_1fr] gap-5 lg:gap-6 items-stretch">
          <GlassCard theme={theme} className="p-6 sm:p-8 overflow-hidden relative" variant="elevated">
            <div className="relative z-10 space-y-5">
              {/* Header row */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-50">
                    {chartDataType === 'bookings' ? 'Total Bookings' : 'Total Sales'}
                  </p>
                  <div className="text-4xl sm:text-[42px] font-black tracking-tight leading-none">
                    <CountUp
                      value={activeTotal}
                      prefix="$"
                      duration={0.8}
                      format={(v) => `$${Math.round(v).toLocaleString()}`}
                    />
                  </div>
                </div>
                <SegmentedPill options={chartToggleOpts} value={chartDataType} onChange={setChartDataType} colors={colors} />
              </div>

              {/* Progress to Goal */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold opacity-70">
                    <Target className="w-3.5 h-3.5" /> Progress to Goal
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" style={{ backgroundColor: aheadOfPace ? (isDark ? 'rgba(107,155,122,0.2)' : 'rgba(74,124,89,0.12)') : (isDark ? 'rgba(200,112,112,0.2)' : 'rgba(184,92,92,0.12)'), color: aheadOfPace ? (isDark ? '#6B9B7A' : '#4A7C59') : (isDark ? '#C87070' : '#B85C5C') }}>
                    {aheadOfPace ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {deltaLabel} {aheadOfPace ? 'Ahead' : 'Behind'}
                  </div>
                </div>
                <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: colors.accent,
                      width: ready ? `${progressPct}%` : '0%',
                      transition: 'width 0.6s ease-out',
                    }}
                  />
                </div>
                <div className="text-[11px] font-semibold opacity-45 tabular-nums">{progressPct.toFixed(1)}% of $7M goal</div>
              </div>

              {/* Mini sparkline bar chart */}
              <div className="pt-1">
                <div className="h-16 flex items-end gap-1.5">
                  {MONTHLY_SALES_DATA.map((m, i) => {
                    const val = chartDataType === 'bookings' ? m.bookings : m.sales;
                    const pct = (val / chartMax) * 100;
                    const isHovered = hoveredBar === `mini-${i}`;
                    return (
                      <div
                        key={m.month}
                        className="flex-1 flex flex-col items-center gap-1.5 cursor-default"
                        onMouseEnter={() => setHoveredBar(`mini-${i}`)}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        <div className="w-full relative">
                          {isHovered && (
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold whitespace-nowrap" style={{ color: colors.textPrimary }}>
                              ${(val / 1000).toFixed(0)}k
                            </div>
                          )}
                          <div
                            className="w-full rounded-md"
                            style={{
                              height: ready ? `${Math.max(6, (pct / 100) * 52)}px` : '0px',
                              backgroundColor: colors.accent,
                              opacity: isHovered ? (isDark ? 0.65 : 0.45) : (isDark ? 0.4 : 0.25),
                              transition: `height 0.4s ease-out ${i * 30}ms, opacity 0.15s`,
                            }}
                          />
                        </div>
                        <span className="text-[9px] font-bold" style={{ opacity: isHovered ? 0.8 : 0.35 }}>{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Sidebar cards */}
          <div className="grid grid-cols-1 gap-4 min-w-[260px]">
            {/* Leaderboard */}
            <GlassCard theme={theme} className="p-5 space-y-3" variant="elevated">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <TrendingUp className="w-4 h-4" /> Leaderboard
                </div>
                <button
                  onClick={() => onNavigate('customer-rank')}
                  className="px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border"
                  style={{ backgroundColor: 'transparent', color: colors.textSecondary, borderColor: colors.border }}
                  onMouseEnter={e => { e.currentTarget.style.color = colors.textPrimary; e.currentTarget.style.borderColor = colors.textSecondary; }}
                  onMouseLeave={e => { e.currentTarget.style.color = colors.textSecondary; e.currentTarget.style.borderColor = colors.border; }}
                >
                  View
                </button>
              </div>
              <div className="space-y-1.5">
                {topLeaders.map((leader, idx) => {
                  const rank = RANK_STYLES[idx] || RANK_STYLES[2];
                  return (
                    <div
                      key={leader.id}
                      className="flex items-center justify-between text-xs py-2 px-3 rounded-xl transition-colors"
                      style={{
                        backgroundColor: rank.bg,
                        opacity: ready ? 1 : 0,
                        transform: ready ? 'translateX(0)' : 'translateX(-8px)',
                        transition: `opacity 0.25s ease ${idx * 60}ms, transform 0.25s ease ${idx * 60}ms`,
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-sm" aria-label={`Rank ${idx + 1}`}>{rank.icon}</span>
                        <span className="font-semibold truncate">{leader.name}</span>
                      </div>
                      <span className="font-bold tabular-nums shrink-0 ml-2">{formatCurrency(leader.bookings)}</span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Dealer Rewards */}
            <GlassCard theme={theme} className="p-5 space-y-3" variant="elevated">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Trophy className="w-4 h-4" /> Dealer Rewards
                </div>
                <button
                  onClick={() => onNavigate('incentive-rewards')}
                  className="px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border"
                  style={{ backgroundColor: 'transparent', color: colors.textSecondary, borderColor: colors.border }}
                  onMouseEnter={e => { e.currentTarget.style.color = colors.textPrimary; e.currentTarget.style.borderColor = colors.textSecondary; }}
                  onMouseLeave={e => { e.currentTarget.style.color = colors.textSecondary; e.currentTarget.style.borderColor = colors.border; }}
                >
                  View
                </button>
              </div>
              {rewardsSnapshot ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-3 rounded-xl text-xs" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 opacity-50" />
                      <span className="font-semibold">{rewardsSnapshot.key}</span>
                    </div>
                    <span className="font-bold tabular-nums" style={{ color: isDark ? '#6B9B7A' : '#4A7C59' }}>{formatCurrency(rewardsSnapshot.total)}</span>
                  </div>
                  {rewardsSnapshot.top && (
                    <div className="flex items-center justify-between py-2 px-3 rounded-xl text-xs" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}>
                      <span className="font-medium truncate" style={{ color: colors.textSecondary }}>Top: {rewardsSnapshot.top.name}</span>
                      <span className="font-bold tabular-nums shrink-0 ml-2">{formatCurrency(rewardsSnapshot.top.amount)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-xs" style={{ color: colors.textSecondary }}>No rewards data yet.</span>
              )}
            </GlassCard>
          </div>
        </div>

        {/* Data Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5 lg:gap-6">

          {/* Recent Activity */}
          <GlassCard theme={theme} className="p-6 sm:p-7 space-y-4" variant="elevated">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Recent Activity</h3>
              <button
                onClick={() => onNavigate('orders')}
                className="text-[11px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 flex items-center gap-1 transition-opacity"
              >
                All Orders <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1">
              {recentOrders.map((order, i) => {
                const sc = statusColor(order.status);
                return (
                  <button
                    key={order.orderNumber}
                    onClick={() => setSelectedOrder(order)}
                    className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl active:scale-[0.98] transition-all group"
                    style={{
                      opacity: ready ? 1 : 0,
                      transition: `opacity 0.2s ease ${i * 40}ms`,
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0"
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.045)' }}
                      >
                        PO
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-[13px] font-bold truncate max-w-[180px]">{formatCompanyName(order.company)}</p>
                        <p className="text-[10px] font-medium opacity-40 tabular-nums">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2 space-y-1">
                      <p className="text-[13px] font-black tabular-nums">${order.net.toLocaleString()}</p>
                      <span
                        className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: sc + '18', color: sc }}
                      >
                        {order.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Invoiced by Vertical */}
          <GlassCard theme={theme} className="p-6 sm:p-7 space-y-4" variant="elevated">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Invoiced by Vertical</h3>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: colors.textSecondary }}>YTD</span>
            </div>
            <SalesByVerticalBreakdown
              theme={theme}
              data={SALES_VERTICALS_DATA.map(v => ({ name: v.label, value: v.value, color: v.color }))}
            />
          </GlassCard>
        </div>

        {/* Monthly Chart */}
        <GlassCard theme={theme} className="p-6 sm:p-7 space-y-5 hidden sm:block" variant="elevated">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold">Monthly Trend</h3>
              <SegmentedPill options={chartToggleOpts} value={chartDataType} onChange={setChartDataType} colors={colors} />
            </div>
            <button
              onClick={() => setMonthlyView(v => v === 'chart' ? 'table' : 'chart')}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
              aria-label={monthlyView === 'chart' ? 'Switch to table view' : 'Switch to chart view'}
            >
              {monthlyView === 'chart' ? <Table className="w-4 h-4" /> : <BarChart className="w-4 h-4" />}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {monthlyView === 'chart' ? (
              <motion.div
                key="chart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-[220px] flex items-end gap-3 overflow-hidden px-1 pb-1"
              >
                {MONTHLY_SALES_DATA.map((m, i) => {
                  const val = chartDataType === 'bookings' ? m.bookings : m.sales;
                  const pct = (val / chartMax) * 100;
                  const isHovered = hoveredBar === `chart-${i}`;
                  return (
                    <div
                      key={m.month}
                      className="flex-1 flex flex-col items-center gap-2.5 cursor-default"
                      onMouseEnter={() => setHoveredBar(`chart-${i}`)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <div className="w-full h-44 relative flex items-end justify-center">
                        <div
                          className="w-full rounded-lg relative"
                          style={{
                            height: ready ? `${Math.max(4, pct)}%` : '0%',
                            backgroundColor: colors.accent,
                            opacity: isHovered ? (isDark ? 0.7 : 0.5) : (isDark ? 0.4 : 0.28),
                            transition: `height 0.4s ease-out ${i * 30}ms, opacity 0.15s`,
                          }}
                        />
                        {isHovered && (
                          <div
                            className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black whitespace-nowrap px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: colors.accent, color: isDark ? '#1A1A1A' : '#FFFFFF' }}
                          >
                            ${(val / 1000).toFixed(0)}k
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold" style={{ opacity: isHovered ? 0.9 : 0.35, transition: 'opacity 0.15s' }}>{m.month}</span>
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {MONTHLY_SALES_DATA.map((m, i) => {
                  const val = chartDataType === 'bookings' ? m.bookings : m.sales;
                  const pct = (val / chartMax) * 100;
                  return (
                    <div
                      key={m.month}
                      className="flex items-center gap-4 py-3"
                      style={{ borderBottom: i < MONTHLY_SALES_DATA.length - 1 ? `1px solid ${colors.border}` : 'none' }}
                    >
                      <span className="w-10 text-xs font-bold" style={{ color: colors.textPrimary }}>{m.month}</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colors.accent, opacity: isDark ? 0.5 : 0.35, transition: 'width 0.4s ease' }} />
                      </div>
                      <span className="text-xs font-bold tabular-nums w-20 text-right" style={{ color: colors.textPrimary }}>{formatCurrency(val)}</span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

      </div>

      <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} theme={theme} />
    </div>
  );
};

