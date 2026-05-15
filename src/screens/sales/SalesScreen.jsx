import React, { useMemo, useState, useEffect } from 'react';
import { ChevronRight, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MONTHLY_SALES_DATA_BY_YEAR,
  ANNUAL_GOALS_BY_YEAR,
  SALES_VERTICALS_DATA,
  CUSTOMER_RANK_DATA,
  INCENTIVE_REWARDS_DATA,
  BACKLOG_DATA,
} from './data.js';
import { ORDER_DATA, STATUS_COLORS } from '../orders/data.js';
import { VERTICAL_COLORS } from '../../constants/verticals.js';
import { SalesByVerticalBreakdown } from './components/SalesByVerticalBreakdown.jsx';
import { CountUp } from '../../components/common/CountUp.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { isDarkTheme, subtleBg } from '../../design-system/tokens.js';
import { formatCurrency, formatCompanyName, formatCurrencyCompact } from '../../utils/format.js';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3];

const BACKLOG_STATUS_COLORS = {
  'In Production':   '#4A7C59',
  'Scheduled':       '#5B7B8C',
  'Pending Release': '#C4956A',
};

const parseQuarterKey = (key = '') => {
  const [y, q] = key.split('-Q');
  return { y: parseInt(y, 10) || 0, q: parseInt(q, 10) || 0 };
};

const sortQuarterEntries = (entries) =>
  [...entries].sort((a, b) => {
    const pa = parseQuarterKey(a[0]), pb = parseQuarterKey(b[0]);
    return pa.y === pb.y ? pa.q - pb.q : pa.y - pb.y;
  });

export const SalesScreen = ({ theme, onNavigate, opportunities }) => {
  const [chartDataType, setChartDataType] = useState('bookings');
  const [showTableView, setShowTableView] = useState(false);
  const [selectedVertical, setSelectedVertical] = useState(null);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const isDark = isDarkTheme(theme);

  const colors = useMemo(() => ({
    background:    theme?.colors?.background    || '#F0EDE8',
    surface:       theme?.colors?.surface       || '#FFFFFF',
    accent:        theme?.colors?.accent        || '#353535',
    textPrimary:   theme?.colors?.textPrimary   || '#353535',
    textSecondary: theme?.colors?.textSecondary || '#666666',
    border:        theme?.colors?.border        || '#E3E0D8',
    subtle:        theme?.colors?.subtle        || 'rgba(0,0,0,0.03)',
  }), [theme]);

  const activeMonthlyData = useMemo(
    () => MONTHLY_SALES_DATA_BY_YEAR[selectedYear] || [],
    [selectedYear],
  );
  const activeGoal = ANNUAL_GOALS_BY_YEAR[selectedYear] || 7_000_000;

  const { totalBookings, totalSales } = useMemo(() => ({
    totalBookings: activeMonthlyData.reduce((a, m) => a + m.bookings, 0),
    totalSales:    activeMonthlyData.reduce((a, m) => a + m.sales,    0),
  }), [activeMonthlyData]);

  const activeTotal = chartDataType === 'bookings' ? totalBookings : totalSales;

  const progressPct = useMemo(
    () => Math.min(100, (activeTotal / activeGoal) * 100),
    [activeTotal, activeGoal],
  );

  const allOrdersSorted = useMemo(
    () => [...ORDER_DATA].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [],
  );
  const recentOrders = useMemo(() => {
    if (!selectedVertical) return allOrdersSorted.slice(0, 5);
    return allOrdersSorted.filter(o => o.vertical === selectedVertical);
  }, [selectedVertical, allOrdersSorted]);

  const verticalColor = useMemo(() => {
    if (!selectedVertical) return null;
    return SALES_VERTICALS_DATA.find(v => v.label === selectedVertical)?.color || null;
  }, [selectedVertical]);

  const wonPipeline = useMemo(() => {
    if (!Array.isArray(opportunities)) return { total: 0, count: 0 };
    const won = opportunities.filter(o => o.stage === 'Won');
    const total = won.reduce((sum, o) => {
      const raw = typeof o.value === 'string' ? o.value.replace(/[^0-9.]/g, '') : (o.value || 0);
      return sum + (parseFloat(raw) || 0);
    }, 0);
    return { total, count: won.length };
  }, [opportunities]);

  const topLeaders = useMemo(
    () => [...CUSTOMER_RANK_DATA].sort((a, b) => (b.bookings || 0) - (a.bookings || 0)).slice(0, 3),
    [],
  );
  const chartMax = useMemo(
    () => Math.max(...activeMonthlyData.map(d => chartDataType === 'bookings' ? d.bookings : d.sales), 1),
    [activeMonthlyData, chartDataType],
  );

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

  const commissionsSnapshot = useMemo(() => {
    const entries = Object.entries(INCENTIVE_REWARDS_DATA || {});
    if (!entries.length) return null;
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

  const tableRows = useMemo(() => {
    const points = activeMonthlyData.map((entry) => ({
      month: entry.month,
      value: chartDataType === 'bookings' ? entry.bookings : entry.sales,
    }));
    const half = Math.ceil(points.length / 2);
    return points.slice(0, half).map((item, i) => ({ left: item, right: points.slice(half)[i] || null }));
  }, [activeMonthlyData, chartDataType]);

  const topSalesLeader  = rewardsSnapshot?.topSales?.[0]     || null;
  const topDesignLeader = rewardsSnapshot?.topDesigners?.[0] || null;

  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 300); return () => clearTimeout(t); }, []);

  /* shared tile primitives */
  const TileHeader = ({ title, action, detail }) => (
    <div className="flex items-center justify-between gap-3 mb-3">
      <h3 className="text-[0.9375rem] font-bold truncate" style={{ color: colors.textPrimary }}>{title}</h3>
      <div className="flex items-center gap-2 shrink-0">
        {detail && <span className="text-sm font-bold tabular-nums" style={{ color: colors.textPrimary }}>{detail}</span>}
        {action && <ChevronRight className="w-3.5 h-3.5" style={{ color: colors.textSecondary, opacity: 0.4 }} />}
      </div>
    </div>
  );

  const flatRowCls   = "flex items-center justify-between gap-3 py-2.5";
  const dividerStyle = { borderColor: subtleBg(theme, 1.35) };

  return (
    <div className="min-h-full app-header-offset" style={{ backgroundColor: colors.background, color: colors.textPrimary }}>
      <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-6 space-y-4 max-w-content mx-auto w-full">

        {/* ── Hero KPI card ── */}
        <GlassCard theme={theme} className="overflow-hidden" variant="elevated">
          <div className="p-5 flex flex-col gap-4">

            {/* Big number + year selector row */}
            <div className="flex items-start justify-between gap-3">
              <div className="text-[2.6rem] sm:text-[2.9rem] font-black tracking-tight leading-none" style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.4s ease' }}>
                {ready ? (
                  <CountUp value={activeTotal} prefix="$" duration={0.6} format={(v) => `$${Math.round(v).toLocaleString()}`} />
                ) : (
                  <span style={{ color: 'transparent' }}>$0</span>
                )}
              </div>

              {/* Year selector — discreet pill group */}
              <div className="flex items-center gap-0.5 rounded-full p-0.5 mt-1 shrink-0" style={{ backgroundColor: subtleBg(theme, 1.6) }}>
                {YEAR_OPTIONS.map(y => (
                  <button
                    key={y}
                    onClick={() => setSelectedYear(y)}
                    className="relative px-2.5 py-1 rounded-full text-[0.625rem] font-bold transition-colors"
                    style={{
                      color: selectedYear === y ? (isDark ? '#fff' : colors.accent) : colors.textSecondary,
                      opacity: selectedYear === y ? 1 : 0.4,
                    }}
                  >
                    {selectedYear === y && (
                      <motion.span
                        layoutId="year-pill"
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.14)' : colors.surface }}
                        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      />
                    )}
                    <span className="relative z-10">{y}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle controls */}
            <div className="flex items-center gap-3 text-[0.8125rem] font-semibold">
              {[{ value: 'bookings', label: 'Bookings' }, { value: 'sales', label: 'Sales' }].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setChartDataType(opt.value)}
                  className="transition-opacity"
                  style={{ color: colors.textPrimary, opacity: chartDataType === opt.value ? 1 : 0.3 }}
                >
                  {opt.label}
                </button>
              ))}
              <span style={{ color: colors.border }}>|</span>
              {[{ value: 'chart', label: 'Chart' }, { value: 'table', label: 'Table' }].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setShowTableView(opt.value === 'table')}
                  className="transition-opacity"
                  style={{ color: colors.textPrimary, opacity: (showTableView ? 'table' : 'chart') === opt.value ? 1 : 0.3 }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Chart / Table */}
            {showTableView ? (
              <table className="w-full text-[0.75rem]">
                <tbody>
                  {tableRows.map((row, index) => (
                    <tr
                      key={`row-${row.left.month}`}
                      className={index < tableRows.length - 1 ? 'border-b' : ''}
                      style={{ borderColor: subtleBg(theme, 1.35) }}
                    >
                      <td className="py-2 pr-3 font-medium" style={{ color: colors.textSecondary }}>{row.left.month}</td>
                      <td className="py-2 pr-6 text-right font-semibold tabular-nums" style={{ color: colors.textPrimary }}>{formatCurrencyCompact(row.left.value)}</td>
                      {row.right ? (
                        <>
                          <td className="py-2 pr-3 font-medium" style={{ color: colors.textSecondary }}>{row.right.month}</td>
                          <td className="py-2 text-right font-semibold tabular-nums" style={{ color: colors.textPrimary }}>{formatCurrencyCompact(row.right.value)}</td>
                        </>
                      ) : (
                        <><td /><td /></>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-end gap-1.5 h-[100px]">
                {activeMonthlyData.map((m, i) => {
                  const val = chartDataType === 'bookings' ? m.bookings : m.sales;
                  const pct = (val / chartMax) * 100;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
                      <div className="w-full flex items-end flex-1">
                        <div
                          className="w-full rounded-sm"
                          style={{
                            height: ready ? `${Math.max(6, pct)}%` : '0%',
                            backgroundColor: isDark ? 'rgba(245,240,235,0.55)' : colors.accent,
                            opacity: isDark ? 1 : (0.14 + (pct / 100) * 0.32),
                            transition: `height 0.5s ease-out ${0.04 + i * 0.025}s`,
                          }}
                        />
                      </div>
                      <span className="text-[0.5rem] font-semibold tracking-wide" style={{ color: colors.textSecondary, opacity: 0.45 }}>
                        {m.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Progress bar — full-width, flush to card edge ── */}
          <div className="px-5 pb-4">
            {/* Track */}
            <div
              className="relative w-full h-6 rounded-full overflow-hidden"
              style={{ backgroundColor: subtleBg(theme, 1.8) }}
            >
              {/* Goal label inside the empty track */}
              <span
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[0.5625rem] font-bold tabular-nums pointer-events-none select-none"
                style={{ color: colors.textSecondary, opacity: 0.3, zIndex: 0 }}
              >
                {formatCurrencyCompact(activeGoal)} goal
              </span>

              {/* Fill */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full flex items-center justify-end pr-3"
                style={{ backgroundColor: colors.accent, minWidth: ready ? undefined : 0 }}
                animate={{ width: ready ? `${Math.max(progressPct, 4)}%` : '0%' }}
                transition={{ duration: 0.9, ease: [0.34, 1.0, 0.64, 1], delay: 0.35 }}
              >
                {/* % label inside fill — only when wide enough */}
                <AnimatePresence>
                  {ready && progressPct > 14 && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.2 }}
                      className="text-[0.5625rem] font-black tabular-nums select-none"
                      style={{ color: isDark ? colors.accent : '#fff' }}
                    >
                      {progressPct.toFixed(0)}%
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Supplementary label */}
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[0.5625rem] font-semibold" style={{ color: colors.textSecondary, opacity: 0.4 }}>
                {chartDataType === 'bookings' ? 'Bookings' : 'Sales'} · {selectedYear}
              </span>
              <span className="text-[0.5625rem] font-semibold tabular-nums" style={{ color: colors.textSecondary, opacity: 0.4 }}>
                {formatCurrencyCompact(activeTotal)} of {formatCurrencyCompact(activeGoal)}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* ── Sidebar row: Leaderboard + Dealer Rewards ── */}
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => onNavigate('customer-rank')} className="w-full h-full text-left">
            <GlassCard theme={theme} className="p-4 h-full flex flex-col" variant="elevated">
              <TileHeader title="Leaderboard" action />
              <div className="flex-1 divide-y" style={dividerStyle}>
                {topLeaders.map(leader => (
                  <div key={leader.id} className={flatRowCls}>
                    <span className="text-xs font-semibold truncate">{leader.name.split(' ')[0]}</span>
                    <span className="text-xs font-bold tabular-nums shrink-0 ml-1">{formatCurrencyCompact(leader.bookings)}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </button>

          <button onClick={() => onNavigate('incentive-rewards')} className="w-full h-full text-left">
            <GlassCard theme={theme} className="p-4 h-full flex flex-col" variant="elevated">
              <TileHeader title="Rewards" action />
              {rewardsSnapshot ? (
                <div className="flex-1 divide-y" style={dividerStyle}>
                  {topSalesLeader && (
                    <div className={flatRowCls}>
                      <span className="text-xs font-semibold truncate">{topSalesLeader.name.split(' ')[0]}</span>
                      <span className="text-xs font-bold tabular-nums ml-1">{formatCurrencyCompact(topSalesLeader.amount)}</span>
                    </div>
                  )}
                  {topDesignLeader && (
                    <div className={flatRowCls}>
                      <span className="text-xs font-semibold truncate">{topDesignLeader.name.split(' ')[0]}</span>
                      <span className="text-xs font-bold tabular-nums ml-1">{formatCurrencyCompact(topDesignLeader.amount)}</span>
                    </div>
                  )}
                  <div className={flatRowCls}>
                    <span className="text-[0.625rem] font-medium" style={{ color: colors.textSecondary, opacity: 0.5 }}>{rewardsSnapshot.key}</span>
                    <span className="text-xs font-black tabular-nums">{formatCurrencyCompact(rewardsSnapshot.totalAll)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs opacity-40 flex-1 flex items-center">No data yet.</p>
              )}
            </GlassCard>
          </button>
        </div>

        {/* ── Won Pipeline ── */}
        {wonPipeline.count > 0 && (
          <button onClick={() => onNavigate('projects', { tab: 'pipeline', stage: 'Won' })} className="w-full text-left">
            <GlassCard theme={theme} className="p-4" variant="elevated">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.625rem] font-semibold uppercase tracking-widest" style={{ color: colors.textSecondary, opacity: 0.45 }}>Won Pipeline</p>
                  <p className="text-xl font-black tabular-nums tracking-tight leading-tight mt-0.5">{formatCurrencyCompact(wonPipeline.total)}</p>
                  <p className="text-[0.625rem] font-medium mt-0.5" style={{ color: colors.textSecondary, opacity: 0.5 }}>
                    {wonPipeline.count} {wonPipeline.count === 1 ? 'project' : 'projects'} closed
                  </p>
                </div>
                <div className="flex items-center gap-1" style={{ color: colors.textSecondary, opacity: 0.35 }}>
                  <span className="text-xs font-semibold">Pipeline</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </GlassCard>
          </button>
        )}

        {/* ── Backlog ── */}
        <GlassCard theme={theme} className="overflow-hidden" variant="elevated">
          <div className="px-5 pt-5 pb-1 flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.625rem] font-semibold uppercase tracking-widest" style={{ color: colors.textSecondary, opacity: 0.45 }}>Backlog</p>
              <p className="text-xl font-black tabular-nums tracking-tight leading-tight mt-0.5">{formatCurrencyCompact(BACKLOG_DATA.total)}</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ backgroundColor: subtleBg(theme, 1.6) }}>
              <Package className="w-3.5 h-3.5" style={{ color: colors.textSecondary, opacity: 0.5 }} />
              <span className="text-[0.625rem] font-bold" style={{ color: colors.textSecondary, opacity: 0.55 }}>
                {BACKLOG_DATA.items.length} orders
              </span>
            </div>
          </div>

          <div className="px-5 pb-5 mt-3 divide-y" style={dividerStyle}>
            {BACKLOG_DATA.items.slice(0, 6).map((item, i) => {
              const sc = BACKLOG_STATUS_COLORS[item.status] || '#8B8680';
              const vc = VERTICAL_COLORS[item.vertical] || '#8B8680';
              return (
                <motion.div
                  key={`${item.dealer}-${item.project}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25, ease: [0.34, 1.2, 0.64, 1] }}
                  className={flatRowCls}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>
                      {formatCompanyName(item.dealer)}
                    </p>
                    <p className="text-[0.6875rem] mt-0.5 truncate" style={{ color: colors.textSecondary, opacity: 0.5 }}>
                      {item.project}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-bold tabular-nums">{formatCurrencyCompact(item.value)}</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <span
                        className="text-[0.5625rem] font-semibold tabular-nums"
                        style={{ color: colors.textSecondary, opacity: 0.4 }}
                      >
                        {new Date(item.scheduledShip).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: sc }} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>

        {/* ── Vertical Breakdown + Orders (unified interactive card) ── */}
        <GlassCard
          theme={theme}
          className="overflow-hidden"
          variant="elevated"
          style={{
            borderLeft: `4px solid ${verticalColor || 'transparent'}`,
            transition: 'border-color 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Donut */}
          <div className="px-5 pt-5 pb-4">
            <p className="text-[0.625rem] font-semibold uppercase tracking-widest mb-4"
              style={{ color: colors.textSecondary, opacity: 0.4 }}>
              Invoiced by Vertical
            </p>
            <SalesByVerticalBreakdown
              theme={theme}
              data={SALES_VERTICALS_DATA.map(v => ({ name: v.label, value: v.value, color: v.color }))}
              selectedVertical={selectedVertical}
              onSelectVertical={setSelectedVertical}
            />
          </div>

          <div className="mx-5" style={{ borderTop: `1px solid ${subtleBg(theme, 1.6)}` }} />

          {/* Orders */}
          <div className="px-5 pt-4 pb-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.h3
                    key={selectedVertical || 'activity'}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                    className="text-[0.9375rem] font-bold truncate"
                    style={{ color: selectedVertical ? verticalColor : colors.textPrimary }}
                  >
                    {selectedVertical ? `${selectedVertical} Orders` : 'Recent Activity'}
                  </motion.h3>
                </AnimatePresence>
                <AnimatePresence>
                  {selectedVertical && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                      className="text-[0.625rem] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: `${verticalColor}1A`, color: verticalColor }}
                    >
                      {recentOrders.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => onNavigate('orders', selectedVertical ? { vertical: selectedVertical } : {})}
                className="flex items-center gap-1 shrink-0 transition-opacity hover:opacity-60 active:opacity-40"
                style={{ color: selectedVertical ? (verticalColor || colors.textSecondary) : colors.textSecondary }}
              >
                <span className="text-xs font-semibold">All orders</span>
                <ChevronRight className="w-3.5 h-3.5" style={{ opacity: 0.5 }} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedVertical || 'all'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                {recentOrders.length > 0 ? (
                  <div className="divide-y" style={dividerStyle}>
                    {recentOrders.map((order, i) => {
                      const sc = STATUS_COLORS[order.status] || '#8B8680';
                      return (
                        <motion.div
                          key={order.orderNumber}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.045, duration: 0.28, ease: [0.34, 1.2, 0.64, 1] }}
                          className={flatRowCls}
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>
                              {formatCompanyName(order.company)}
                            </p>
                            <p className="text-xs mt-0.5 tabular-nums" style={{ color: colors.textSecondary, opacity: 0.45 }}>
                              {order.details} · {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <p className="text-sm font-bold tabular-nums">${order.net.toLocaleString()}</p>
                            <div className="flex items-center justify-end gap-1.5 mt-0.5">
                              <span className="text-[0.625rem] font-semibold" style={{ color: sc }}>{order.status}</span>
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: sc }} />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm py-5 text-center"
                    style={{ color: colors.textSecondary, opacity: 0.4 }}
                  >
                    No orders tagged to {selectedVertical}
                  </motion.p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </GlassCard>

        {/* ── Commissions ── */}
        {commissionsSnapshot && (
          <button onClick={() => onNavigate('commissions')} className="w-full text-left">
            <GlassCard theme={theme} className="p-4" variant="elevated">
              <TileHeader title="Commissions" action detail={formatCurrencyCompact(commissionsSnapshot.ytdTotal)} />
              <div className="divide-y" style={dividerStyle}>
                {commissionsSnapshot.topEarners.map(([name, amount]) => (
                  <div key={name} className={flatRowCls}>
                    <span className="text-sm font-semibold truncate">{name}</span>
                    <span className="text-sm font-bold tabular-nums ml-2">{formatCurrencyCompact(amount)}</span>
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
