import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '../../components/common/Modal';
import { ArrowUp, ArrowDown, TrendingUp, Award, DollarSign, BarChart, Table, ChevronRight } from 'lucide-react';
import { MONTHLY_SALES_DATA, SALES_VERTICALS_DATA, CUSTOMER_RANK_DATA } from './data.js';
import { ORDER_DATA, STATUS_COLORS } from '../orders/data.js';
import { SalesByVerticalBreakdown } from './components/SalesByVerticalBreakdown.jsx';
import { CountUp } from '../../components/common/CountUp.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../components/common/GlassCard.jsx';

const formatCompanyName = (name = '') => name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
const monthNameToNumber = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

const SALES_TOP_ACTIONS = [
  { value: 'rewards', label: 'Dealer Rewards', icon: Award, route: 'incentive-rewards' },
  { value: 'comms', label: 'Commissions', icon: DollarSign, route: 'commissions' },
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
        <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-black/[0.02]">
          <div><div className="text-[10px] uppercase tracking-widest font-bold opacity-40">Order Date</div><div className="font-bold">{new Date(order.date).toLocaleDateString()}</div></div>
          <div><div className="text-[10px] uppercase tracking-widest font-bold opacity-40">Ship Date</div><div className="font-bold">{new Date(order.shipDate).toLocaleDateString()}</div></div>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-3">Line Items</h4>
          <div className="space-y-3">{order.lineItems?.map(li => (
            <div key={li.line} className="flex justify-between items-center py-2 border-b border-black/[0.03] last:border-0">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center font-bold text-xs">{li.quantity}x</span>
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

export const SalesScreen = ({ theme, onNavigate }) => {
  const [monthlyView, setMonthlyView] = useState('chart');
  const [chartDataType, setChartDataType] = useState('bookings');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [numRecentOrders, setNumRecentOrders] = useState(4);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [topTab, setTopTab] = useState(null);
  const formatCurrency = useCallback((n) => `$${Number(n || 0).toLocaleString()}`, []);

  // Safe color extraction
  const colors = useMemo(() => ({
    background: theme?.colors?.background || '#F0EDE8',
    surface: theme?.colors?.surface || '#FFFFFF',
    accent: theme?.colors?.accent || '#353535',
    textPrimary: theme?.colors?.textPrimary || '#353535',
    textSecondary: theme?.colors?.textSecondary || '#666666',
    border: theme?.colors?.border || '#E3E0D8'
  }), [theme]);

  const { totalBookings, totalSales } = useMemo(() => ({
    totalBookings: MONTHLY_SALES_DATA.reduce((a, m) => a + m.bookings, 0),
    totalSales: MONTHLY_SALES_DATA.reduce((a, m) => a + m.sales, 0)
  }), []);

  const { percentToGoal, aheadOfPace, deltaLabel } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1); const next = new Date(now.getFullYear() + 1, 0, 1);
    const totalDays = (next - start) / 86400000; const dayOfYear = Math.floor((now - start) / 86400000) + 1;
    const yearPct = (dayOfYear / totalDays) * 100;
    const goalPct = (MONTHLY_SALES_DATA.reduce((a, m) => a + m.bookings, 0) / 7000000) * 100;
    return { percentToGoal: goalPct, aheadOfPace: (goalPct - yearPct) >= 0, deltaLabel: `${Math.abs(goalPct - yearPct).toFixed(1)}%` };
  }, []);

  const recentOrders = useMemo(() => ORDER_DATA.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, numRecentOrders), [numRecentOrders]);
  const topLeaders = useMemo(() => [...CUSTOMER_RANK_DATA].sort((a, b) => (b.bookings || 0) - (a.bookings || 0)).slice(0, 3), []);
  const activeTotal = chartDataType === 'bookings' ? totalBookings : totalSales;
  const progressPct = Math.min(100, (activeTotal / 7000000) * 100);

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide" style={{ backgroundColor: colors.background }}>
      <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-8 lg:space-y-10 max-w-2xl lg:max-w-5xl 2xl:max-w-6xl mx-auto w-full pb-20">

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
          {SALES_TOP_ACTIONS.map((opt) => {
            const isActive = topTab === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setTopTab(opt.value);
                  onNavigate(opt.route);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all border"
                style={{
                  backgroundColor: isActive ? colors.accent : colors.surface,
                  color: isActive ? colors.surface : colors.textSecondary,
                  borderColor: colors.border,
                  boxShadow: isActive ? '0 8px 18px rgba(0,0,0,0.10)' : 'none'
                }}
              >
                <opt.icon className="w-4 h-4" />
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Hero Section - Total Ordered/Invoiced + Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] xl:grid-cols-[1.8fr_1fr] gap-6 lg:gap-8 items-start">
          <GlassCard theme={theme} className="p-7 sm:p-8 overflow-hidden relative" variant="elevated">
            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60">
                    {chartDataType === 'bookings' ? 'Total Bookings' : 'Total Sales'}
                  </p>
                  <div className="text-4xl font-black tracking-tight">
                    {formatCurrency(activeTotal)}
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full p-[3px] shrink-0" style={{ backgroundColor: colors.border }}>
                  <button
                    onClick={() => setChartDataType('bookings')}
                    className={`rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-all ${chartDataType === 'bookings' ? 'shadow-sm' : ''}`}
                    style={{
                      backgroundColor: chartDataType === 'bookings' ? colors.surface : 'transparent',
                      color: chartDataType === 'bookings' ? colors.textPrimary : colors.textSecondary
                    }}
                  >
                    Bookings
                  </button>
                  <button
                    onClick={() => setChartDataType('sales')}
                    className={`rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-all ${chartDataType === 'sales' ? 'shadow-sm' : ''}`}
                    style={{
                      backgroundColor: chartDataType === 'sales' ? colors.surface : 'transparent',
                      color: chartDataType === 'sales' ? colors.textPrimary : colors.textSecondary
                    }}
                  >
                    Sales
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold opacity-70">Progress to Goal</div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${aheadOfPace ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {aheadOfPace ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {deltaLabel} {aheadOfPace ? 'Ahead' : 'Behind'}
                  </div>
                </div>
                <div className="h-3 w-full bg-black/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} className="h-full bg-black rounded-full shadow-[0_0_20px_rgba(0,0,0,0.2)]" />
                </div>
                <div className="text-xs font-semibold opacity-50">{progressPct.toFixed(1)}% of $7M goal</div>
              </div>

              <div className="pt-2">
                <div className="h-20 flex items-end gap-2">
                  {MONTHLY_SALES_DATA.map((m) => {
                    const val = chartDataType === 'bookings' ? m.bookings : m.sales;
                    const max = Math.max(...MONTHLY_SALES_DATA.map(d => chartDataType === 'bookings' ? d.bookings : d.sales));
                    const pct = (val / max) * 100;
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-black/5 rounded-md overflow-hidden">
                          <div className="w-full" style={{ height: `${Math.max(8, (pct / 100) * 64)}px`, background: colors.accent, opacity: 0.2 }} />
                        </div>
                        <span className="text-[9px] font-bold opacity-40">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          </GlassCard>

          <div className="grid grid-cols-1 gap-4 min-w-[260px]">
            <GlassCard theme={theme} className="p-6 space-y-3" variant="elevated">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <TrendingUp className="w-4 h-4" /> Leaderboard
                </div>
                <button onClick={() => onNavigate('customer-rank')} className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-black text-white">View</button>
              </div>
              <div className="space-y-2">
                {topLeaders.map((leader, idx) => (
                  <div key={leader.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-black/5 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                      <span className="font-semibold truncate">{leader.name}</span>
                    </div>
                    <span className="font-semibold tabular-nums">{formatCurrency(leader.bookings)}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Data Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-8">

          {/* Recent Orders */}
          <GlassCard theme={theme} className="p-7 sm:p-8 space-y-6" variant="elevated">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Recent Activity</h3>
              <button onClick={() => onNavigate('orders')} className="text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 flex items-center gap-1">All Orders <ChevronRight className="w-3 h-3" /></button>
            </div>
            <div className="space-y-2">
              {recentOrders.map((order, i) => (
                <motion.button
                  key={order.orderNumber}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedOrder(order)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-black/[0.02] active:scale-[0.98] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center font-black text-[10px] group-hover:bg-black group-hover:text-white transition-colors">PO</div>
                    <div className="text-left">
                      <p className="text-sm font-bold truncate max-w-[140px]">{formatCompanyName(order.company)}</p>
                      <p className="text-[10px] font-semibold opacity-40 uppercase tracking-widest">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black">${order.net.toLocaleString()}</p>
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{order.status}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </GlassCard>

          {/* Invoiced by Vertical */}
          <GlassCard theme={theme} className="p-7 sm:p-8 space-y-4" variant="elevated">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Invoiced by Vertical</h3>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">YTD</span>
            </div>
            <SalesByVerticalBreakdown
              theme={theme}
              data={SALES_VERTICALS_DATA.map(v => ({ name: v.label, value: v.value, color: v.color }))}
            />
          </GlassCard>
        </div>

        {/* Monthly Chart */}
        <GlassCard theme={theme} className="p-7 sm:p-8 space-y-6 hidden sm:block" variant="elevated">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full p-[3px]" style={{ backgroundColor: colors.border }}>
              <button
                onClick={() => setChartDataType('bookings')}
                className={`rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-all ${chartDataType === 'bookings' ? 'shadow-sm' : ''}`}
                style={{
                  backgroundColor: chartDataType === 'bookings' ? colors.surface : 'transparent',
                  color: chartDataType === 'bookings' ? colors.textPrimary : colors.textSecondary
                }}
              >
                Bookings
              </button>
              <button
                onClick={() => setChartDataType('sales')}
                className={`rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-all ${chartDataType === 'sales' ? 'shadow-sm' : ''}`}
                style={{
                  backgroundColor: chartDataType === 'sales' ? colors.surface : 'transparent',
                  color: chartDataType === 'sales' ? colors.textPrimary : colors.textSecondary
                }}
              >
                Sales
              </button>
            </div>
            <button onClick={() => setMonthlyView(v => v === 'chart' ? 'table' : 'chart')} className="p-2 rounded-lg bg-black/5 hover:bg-black/10 transition-colors">
              {monthlyView === 'chart' ? <Table className="w-4 h-4" /> : <BarChart className="w-4 h-4" />}
            </button>
          </div>

          {monthlyView === 'chart' ? (
            <div className="h-64 flex items-end gap-2 overflow-hidden px-2">
              {MONTHLY_SALES_DATA.map((m) => {
                const val = chartDataType === 'bookings' ? m.bookings : m.sales;
                const max = Math.max(...MONTHLY_SALES_DATA.map(d => chartDataType === 'bookings' ? d.bookings : d.sales));
                const pct = (val / max) * 100;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-3 group px-0.5">
                    <div className="w-full relative flex items-end justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(6, pct)}%` }}
                        className="w-full rounded-t-lg transition-colors relative"
                        style={{ backgroundColor: colors.accent, opacity: 0.18 }}
                      />
                      <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black">${(val / 1000).toFixed(0)}k</div>
                    </div>
                    <span className="text-[10px] font-bold opacity-30 group-hover:opacity-100 transition-opacity">{m.month}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: colors.border }}>
              {MONTHLY_SALES_DATA.map((m) => {
                const val = chartDataType === 'bookings' ? m.bookings : m.sales;
                return (
                  <div key={m.month} className="flex items-center justify-between py-3 text-sm">
                    <span className="font-semibold" style={{ color: colors.textPrimary }}>{m.month}</span>
                    <span className="font-semibold tabular-nums" style={{ color: colors.textSecondary }}>{formatCurrency(val)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

      </div>

      <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} theme={theme} />
    </div>
  );
};

