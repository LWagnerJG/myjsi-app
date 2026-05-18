import React, { useMemo, useState, useEffect, useRef } from 'react';
import { BarChart3, ChevronDown, ChevronRight, Package, Table2 } from 'lucide-react';
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
import { SalesByVerticalBreakdown } from './components/SalesByVerticalBreakdown.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { isDarkTheme, subtleBg } from '../../design-system/tokens.js';
import { formatCurrency, formatCompanyName, formatCurrencyCompact } from '../../utils/format.js';
import { useCompanyResource } from '../../hooks/useCompanyResource.js';

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

export const SalesScreen = ({ theme, onNavigate }) => {
  const { data: ordersData } = useCompanyResource('orders', ORDER_DATA);
  const [chartDataType, setChartDataType] = useState('bookings');
  const [showTableView, setShowTableView] = useState(true);
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
    () => [...ordersData].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [ordersData],
  );
  const recentOrders = useMemo(() => {
    if (!selectedVertical) return allOrdersSorted.slice(0, 5);
    return allOrdersSorted.filter(o => o.vertical === selectedVertical);
  }, [selectedVertical, allOrdersSorted]);

  const verticalColor = useMemo(() => {
    if (!selectedVertical) return null;
    return SALES_VERTICALS_DATA.find(v => v.label === selectedVertical)?.color || null;
  }, [selectedVertical]);

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
    return { key, topSales, topDesigners, totalSalesR, totalDesignR, totalAll: totalSalesR + totalDesignR };
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
    return { ytdTotal: sorted.reduce((s, [, v]) => s + v, 0), topEarners: sorted.slice(0, 3) };
  }, []);

  const monthlyRows = useMemo(() => (
    activeMonthlyData.map(entry => ({
      month: entry.month,
      value: chartDataType === 'bookings' ? entry.bookings : entry.sales,
    }))
  ), [activeMonthlyData, chartDataType]);

  const monthlyColumns = useMemo(() => {
    const columnCount = monthlyRows.length > 6 ? 2 : 1;
    const itemsPerColumn = Math.ceil(monthlyRows.length / columnCount);
    return Array.from({ length: columnCount }, (_, i) =>
      monthlyRows.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn)
    ).filter(col => col.length > 0);
  }, [monthlyRows]);

  const topSalesLeader  = rewardsSnapshot?.topSales?.[0]     || null;
  const topDesignLeader = rewardsSnapshot?.topDesigners?.[0] || null;

  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 300); return () => clearTimeout(t); }, []);

  // Year-picker dropdown — branded, with outside-click + Escape handling
  const [yearOpen, setYearOpen] = useState(false);
  const yearRef = useRef(null);
  useEffect(() => {
    if (!yearOpen) return;
    const onDown = (e) => { if (yearRef.current && !yearRef.current.contains(e.target)) setYearOpen(false); };
    const onKey  = (e) => { if (e.key === 'Escape') setYearOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown',   onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown',   onKey);
    };
  }, [yearOpen]);

  const TileHeader = ({ title, action, detail }) => (
    <div className="flex items-center justify-between gap-3 mb-3">
      <h3 className="text-[0.9375rem] font-bold truncate" style={{ color: colors.textPrimary }}>{title}</h3>
      {(action || detail) && (
        <div className="flex items-center gap-2 shrink-0">
          {detail && <span className="text-sm font-bold tabular-nums" style={{ color: colors.textPrimary }}>{detail}</span>}
          {action && <ChevronRight className="w-3.5 h-3.5" style={{ color: colors.textSecondary, opacity: 0.45 }} />}
        </div>
      )}
    </div>
  );

  const flatRowCls   = "flex items-center justify-between gap-3 py-2.5";
  const dividerStyle = { borderColor: subtleBg(theme, 1.35) };

  return (
    <div className="min-h-full app-header-offset overflow-x-hidden" style={{ backgroundColor: colors.background, color: colors.textPrimary }}>
      <div className="min-w-0 px-4 sm:px-6 lg:px-8 pt-5 pb-6 space-y-4 max-w-content mx-auto w-full">

        {/* ── Hero KPI card ── */}
        <GlassCard theme={theme} className="min-w-0 overflow-hidden" variant="elevated">
          <div className="p-4 sm:p-5 flex flex-col gap-3">

            {/* Big number + Backlog caption + year dropdown */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex flex-col gap-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${selectedYear}-${chartDataType}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                    className="text-[2rem] sm:text-[2.6rem] font-black leading-none tracking-tight tabular-nums"
                  >
                    {formatCurrency(activeTotal)}
                  </motion.div>
                </AnimatePresence>

                {/* Discrete Backlog inline caption */}
                <div className="flex items-center gap-1.5 text-[0.6875rem] font-semibold leading-none">
                  <span
                    className="uppercase tracking-[0.08em]"
                    style={{ color: colors.textSecondary, opacity: 0.5 }}
                  >
                    Backlog
                  </span>
                  <span
                    className="tabular-nums"
                    style={{ color: colors.textPrimary, opacity: 0.75 }}
                  >
                    {formatCurrencyCompact(BACKLOG_DATA.total)}
                  </span>
                </div>
              </div>

              {/* Branded year picker — pill trigger + soft popover */}
              <div ref={yearRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setYearOpen(o => !o)}
                  className="inline-flex items-center gap-1.5 rounded-full py-1.5 pl-3 pr-2.5 text-[0.75rem] font-bold transition active:scale-95"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : subtleBg(theme, 1.9),
                    color: colors.textPrimary,
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={yearOpen}
                  aria-label={`Year: ${selectedYear}`}
                >
                  <span className="tabular-nums">{selectedYear}</span>
                  <motion.span
                    animate={{ rotate: yearOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className="inline-flex"
                  >
                    <ChevronDown className="w-3.5 h-3.5" style={{ opacity: 0.55 }} />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {yearOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0,  scale: 1 }}
                      exit={{    opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                      role="listbox"
                      className="absolute right-0 top-full mt-1.5 z-50 min-w-[5.5rem] rounded-2xl p-1 origin-top-right"
                      style={{
                        backgroundColor: colors.surface,
                        border: `1px solid ${subtleBg(theme, 1.8)}`,
                        boxShadow: isDark
                          ? '0 10px 28px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.3)'
                          : '0 12px 28px rgba(53,53,53,0.12), 0 2px 6px rgba(53,53,53,0.06)',
                      }}
                    >
                      {YEAR_OPTIONS.map(y => {
                        const isActive = y === selectedYear;
                        return (
                          <li key={y} role="option" aria-selected={isActive}>
                            <button
                              type="button"
                              onClick={() => { setSelectedYear(y); setYearOpen(false); }}
                              className="relative w-full text-left px-3 py-1.5 rounded-xl text-[0.75rem] font-bold tabular-nums transition-colors"
                              style={{
                                color: isActive ? (isDark ? '#fff' : colors.accent) : colors.textSecondary,
                              }}
                            >
                              {isActive && (
                                <motion.span
                                  layoutId="year-active-pill"
                                  className="absolute inset-0 rounded-xl"
                                  style={{ backgroundColor: subtleBg(theme, 2.2) }}
                                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                                />
                              )}
                              <span className="relative z-10">{y}</span>
                            </button>
                          </li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Progress bar */}
            <div
              className="relative w-full h-6 rounded-full overflow-hidden"
              style={{ backgroundColor: subtleBg(theme, 1.8) }}
            >
              <span
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[0.5625rem] font-bold tabular-nums pointer-events-none select-none"
                style={{ color: colors.textSecondary, opacity: 0.28, zIndex: 0 }}
              >
                {formatCurrencyCompact(activeGoal)} goal
              </span>
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full flex items-center justify-end pr-3"
                style={{ backgroundColor: colors.accent }}
                animate={{ width: ready ? `${Math.max(progressPct, 3)}%` : '0%' }}
                transition={{ duration: 0.9, ease: [0.34, 1.0, 0.64, 1], delay: 0.25 }}
              >
                <AnimatePresence>
                  {ready && progressPct > 14 && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.65, duration: 0.2 }}
                      className="text-[0.5625rem] font-black tabular-nums select-none"
                      style={{ color: isDark ? colors.accent : '#fff' }}
                    >
                      {progressPct.toFixed(0)}%
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Toggle controls — unified surface treatment */}
            <div className="flex items-center gap-2">
              <div
                className="inline-flex h-8 shrink-0 items-center rounded-full p-0.5"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : subtleBg(theme, 1.9) }}
                role="group"
                aria-label="Sales metric"
              >
                {[{ value: 'bookings', label: 'Bookings' }, { value: 'sales', label: 'Sales' }].map(opt => {
                  const selected = chartDataType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setChartDataType(opt.value)}
                      className="relative inline-flex h-7 items-center justify-center rounded-full px-3.5 text-[0.75rem] font-bold transition-colors"
                      aria-pressed={selected}
                      style={{ color: selected ? (isDark ? '#fff' : colors.accent) : colors.textSecondary }}
                    >
                      {selected && (
                        <motion.span
                          layoutId="metric-pill"
                          className="absolute inset-0 rounded-full"
                          style={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.14)' : colors.surface,
                            boxShadow: isDark ? 'none' : '0 1px 3px rgba(53,53,53,0.08), 0 1px 2px rgba(53,53,53,0.04)',
                          }}
                          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                        />
                      )}
                      <span className="relative z-10">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setShowTableView(v => !v)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition active:scale-95"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : subtleBg(theme, 1.9),
                  color: colors.textPrimary,
                }}
                aria-label={showTableView ? 'Switch to chart view' : 'Switch to table view'}
              >
                {showTableView
                  ? <BarChart3 className="h-3.5 w-3.5" />
                  : <Table2   className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Chart / Table */}
            <AnimatePresence mode="wait">
              {showTableView ? (
                <motion.div
                  key="table"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 min-h-0"
                >
                  {monthlyRows.length === 0 ? (
                    <p className="text-sm py-4 text-center" style={{ color: colors.textSecondary, opacity: 0.4 }}>
                      No data for {selectedYear}
                    </p>
                  ) : (
                    <div className={`grid h-full min-h-0 ${monthlyColumns.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                      {monthlyColumns.map((column, colIdx) => (
                        <div
                          key={`col-${colIdx}`}
                          className={`flex flex-col ${monthlyColumns.length > 1 && colIdx > 0 ? 'sm:border-l' : ''}`}
                          style={monthlyColumns.length > 1 && colIdx > 0 ? { borderColor: subtleBg(theme, 1.35) } : undefined}
                        >
                          {column.map((row, rowIdx) => (
                            <div
                              key={row.month}
                              className={`flex min-h-[3.125rem] flex-1 items-center justify-between gap-3 ${monthlyColumns.length > 1 ? (colIdx === 0 ? 'sm:pr-5' : 'sm:pl-5') : ''}`}
                              style={{ borderBottom: rowIdx === column.length - 1 ? 'none' : `1px solid ${subtleBg(theme, 1.35)}` }}
                            >
                              <span className="text-[0.8125rem] font-semibold" style={{ color: colors.textSecondary }}>{row.month}</span>
                              <span className="text-[0.8125rem] font-bold tabular-nums" style={{ color: colors.textPrimary }}>{formatCurrency(row.value)}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="chart"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-end gap-1.5 h-[100px]"
                >
                  {activeMonthlyData.length === 0 ? (
                    <p className="text-sm w-full text-center" style={{ color: colors.textSecondary, opacity: 0.4 }}>
                      No data for {selectedYear}
                    </p>
                  ) : (
                    activeMonthlyData.map((m, i) => {
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
                                opacity: isDark ? 1 : (0.18 + (pct / 100) * 0.28),
                                transition: `height 0.5s ease-out ${0.05 + i * 0.03}s`,
                              }}
                            />
                          </div>
                          <span className="text-[0.5rem] font-semibold tracking-wide" style={{ color: colors.textSecondary, opacity: 0.5 }}>
                            {m.month}
                          </span>
                        </div>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </GlassCard>

        {/* ── Leaderboard + Rewards (2-col) ── */}
        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={() => onNavigate('customer-rank')} className="w-full h-full text-left">
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

          <button type="button" onClick={() => onNavigate('incentive-rewards')} className="w-full h-full text-left">
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
                      <span className="text-[0.5625rem] font-semibold tabular-nums" style={{ color: colors.textSecondary, opacity: 0.4 }}>
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
          className="min-w-0 overflow-hidden"
          variant="elevated"
          style={{
            borderLeft: `4px solid ${verticalColor || 'transparent'}`,
            transition: 'border-color 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div className="px-5 pt-5 pb-4">
            <TileHeader title="Invoiced by Vertical" />
            <SalesByVerticalBreakdown
              theme={theme}
              data={SALES_VERTICALS_DATA.map(v => ({ name: v.label, value: v.value, color: v.color }))}
              selectedVertical={selectedVertical}
              onSelectVertical={setSelectedVertical}
            />
          </div>

          <div className="mx-5" style={{ borderTop: `1px solid ${subtleBg(theme, 1.6)}` }} />

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
                type="button"
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

        {/* ── Commissions — simplified single-row tile ── */}
        {commissionsSnapshot && (
          <button type="button" onClick={() => onNavigate('commissions')} className="w-full text-left">
            <GlassCard theme={theme} className="p-4" variant="elevated">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[0.625rem] font-semibold uppercase tracking-widest" style={{ color: colors.textSecondary, opacity: 0.45 }}>Commissions</p>
                  <p className="text-xl font-black tabular-nums tracking-tight leading-tight mt-0.5">{formatCurrencyCompact(commissionsSnapshot.ytdTotal)}</p>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0" style={{ color: colors.textSecondary, opacity: 0.35 }} />
              </div>
            </GlassCard>
          </button>
        )}

      </div>
    </div>
  );
};
