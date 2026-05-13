import React, { useMemo, useState, useEffect } from 'react';
import { BarChart3, ChevronRight, Table2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MONTHLY_SALES_DATA, SALES_VERTICALS_DATA, CUSTOMER_RANK_DATA, INCENTIVE_REWARDS_DATA } from './data.js';
import { ORDER_DATA, STATUS_COLORS } from '../orders/data.js';
import { SalesByVerticalBreakdown } from './components/SalesByVerticalBreakdown.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';

import { isDarkTheme, subtleBg } from '../../design-system/tokens.js';
import { formatCurrency, formatCompanyName } from '../../utils/format.js';
import { useCompanyResource } from '../../hooks/useCompanyResource.js';


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

  const allOrdersSorted = useMemo(() => [...ordersData].sort((a, b) => new Date(b.date) - new Date(a.date)), [ordersData]);
  const recentOrders = useMemo(() => {
    if (!selectedVertical) return allOrdersSorted.slice(0, 5);
    return allOrdersSorted.filter(o => o.vertical === selectedVertical);
  }, [selectedVertical, allOrdersSorted]);
  const verticalColor = useMemo(() => {
    if (!selectedVertical) return null;
    return SALES_VERTICALS_DATA.find(v => v.label === selectedVertical)?.color || null;
  }, [selectedVertical]);

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

  const monthlyRows = useMemo(() => (
    MONTHLY_SALES_DATA.map((entry) => ({
      month: entry.month,
      value: chartDataType === 'bookings' ? entry.bookings : entry.sales,
    }))
  ), [chartDataType]);

  const monthlyColumns = useMemo(() => {
    const columnCount = monthlyRows.length > 6 ? 2 : 1;
    const itemsPerColumn = Math.ceil(monthlyRows.length / columnCount);

    return Array.from({ length: columnCount }, (_, index) => (
      monthlyRows.slice(index * itemsPerColumn, (index + 1) * itemsPerColumn)
    )).filter((column) => column.length > 0);
  }, [monthlyRows]);

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
              {/* KPI header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[2.15rem] sm:text-[2.6rem] font-black tracking-tight leading-none">
                    {formatCurrency(activeTotal)}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <div
                    className="inline-flex h-8 shrink-0 items-center rounded-full p-[3px] sm:h-9 sm:p-1"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.075)' : '#E6E8E3' }}
                    role="group"
                    aria-label="Sales metric"
                  >
                    {toggleOpts.map((opt) => {
                      const selected = chartDataType === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setChartDataType(opt.value)}
                          className="h-[26px] rounded-full px-2.5 text-[0.75rem] font-semibold transition-all sm:h-7 sm:px-3 sm:text-[0.8125rem]"
                          aria-pressed={selected}
                          style={{
                            backgroundColor: selected ? colors.accent : 'transparent',
                            color: selected ? (theme?.colors?.accentText || '#FFFFFF') : colors.textSecondary,
                            boxShadow: selected && !isDark ? '0 4px 12px rgba(53,53,53,0.18)' : 'none',
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTableView((current) => !current)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition active:scale-95 sm:h-9 sm:w-9"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : colors.surface,
                      borderColor: isDark ? 'rgba(255,255,255,0.12)' : colors.border,
                      color: colors.textPrimary,
                    }}
                    aria-label={showTableView ? 'Switch to chart view' : 'Switch to table view'}
                    title={showTableView ? 'Switch to chart view' : 'Switch to table view'}
                  >
                    {showTableView ? (
                      <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : (
                      <Table2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
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

              {/* Monthly detail */}
              {showTableView ? (
                <div className="flex-1 min-h-0 pt-1">
                  <div className={`grid h-full min-h-0 ${monthlyColumns.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                    {monthlyColumns.map((column, columnIndex) => (
                      <div
                        key={`monthly-column-${columnIndex}`}
                        className={`flex h-full min-h-0 flex-col ${monthlyColumns.length > 1 && columnIndex > 0 ? 'sm:border-l' : ''}`}
                        style={monthlyColumns.length > 1 && columnIndex > 0 ? { borderColor: subtleBg(theme, 1.35) } : undefined}
                      >
                        {column.map((row, rowIndex) => {
                          const isLast = rowIndex === column.length - 1;
                          const rowPadding = monthlyColumns.length > 1
                            ? columnIndex === 0
                              ? 'sm:pr-5'
                              : 'sm:pl-5'
                            : '';

                          return (
                            <div
                              key={row.month}
                              className={`flex min-h-[3.125rem] flex-1 items-center justify-between gap-3 ${rowPadding}`}
                              style={{ borderBottom: isLast ? 'none' : `1px solid ${subtleBg(theme, 1.35)}` }}
                            >
                              <span className="text-[0.8125rem] font-semibold" style={{ color: colors.textSecondary }}>
                                {row.month}
                              </span>
                              <span className="text-[0.8125rem] font-bold tabular-nums" style={{ color: colors.textPrimary }}>
                                {formatCurrency(row.value)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
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
        {/* ── Vertical Breakdown + Live Orders ── unified interactive card ── */}
        <GlassCard theme={theme} className="overflow-hidden" variant="elevated"
          style={{
            borderLeft: `4px solid ${verticalColor || 'transparent'}`,
            transition: 'border-color 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}>

          {/* Donut section */}
          <div className="px-5 pt-5 pb-4">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-widest mb-4"
              style={{ color: colors.textSecondary, opacity: 0.45 }}>
              Invoiced by Vertical
            </p>
            <SalesByVerticalBreakdown
              theme={theme}
              data={SALES_VERTICALS_DATA.map(v => ({ name: v.label, value: v.value, color: v.color }))}
              selectedVertical={selectedVertical}
              onSelectVertical={setSelectedVertical}
            />
          </div>

          {/* Divider */}
          <div className="mx-5" style={{ borderTop: `1px solid ${subtleBg(theme, 1.6)}` }} />

          {/* Orders section — animates when vertical changes */}
          <div className="px-5 pt-4 pb-5">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.h3
                    key={selectedVertical || 'activity'}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
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

            {/* Order rows — keyed by vertical so they re-mount and stagger in */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedVertical || 'all'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                {recentOrders.length > 0 ? (
                  <div className="space-y-0 divide-y" style={flatRowsDivider}>
                    {recentOrders.map((order, i) => {
                      const sc = STATUS_COLORS[order.status] || '#8B8680';
                      return (
                        <motion.div
                          key={order.orderNumber}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: i * 0.045,
                            duration: 0.28,
                            ease: [0.34, 1.2, 0.64, 1],
                          }}
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
                            <p className="text-sm font-bold tabular-nums" style={{ color: colors.textPrimary }}>
                              ${order.net.toLocaleString()}
                            </p>
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
                    style={{ color: colors.textSecondary, opacity: 0.45 }}
                  >
                    No orders tagged to {selectedVertical}
                  </motion.p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </GlassCard>

        {/* ── Commissions Preview ── */}
        {commissionsSnapshot && (
          <button onClick={() => onNavigate('sales/commissions')} className="w-full text-left group">
            <GlassCard theme={theme} className="p-5" variant="elevated">
              <TileHeader title="Commissions" action detail={formatCurrency(commissionsSnapshot.ytdTotal)} />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-widest" style={{ color: colors.textSecondary, opacity: 0.45 }}>
                    {commissionsSnapshot.year} YTD
                  </p>
                  <p className="text-sm font-medium mt-1" style={{ color: colors.textSecondary, opacity: 0.7 }}>
                    View monthly commission payouts
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textSecondary, opacity: 0.5 }}>
                  Open
                </span>
              </div>
            </GlassCard>
          </button>
        )}
      </div>

    </div>
  );
};

