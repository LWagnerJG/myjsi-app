import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '../../components/common/Modal';
import { ArrowUp, ArrowDown, TrendingUp, Award, DollarSign, BarChart, Table, MoreHorizontal, ChevronRight } from 'lucide-react';
import { MONTHLY_SALES_DATA, SALES_VERTICALS_DATA } from './data.js';
import { ORDER_DATA, STATUS_COLORS } from '../orders/data.js';
import { SalesByVerticalBreakdown } from './components/SalesByVerticalBreakdown.jsx';
import { CountUp } from '../../components/common/CountUp.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { PillButton } from '../../components/common/JSIButtons.jsx';

const formatCompanyName = (name = '') => name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
const monthNameToNumber = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

const SegmentedTabs = ({ theme, active, onChange }) => {
  const tabs = useMemo(() => [
    { key: 'rewards', label: 'Rewards', Icon: Award },
    { key: 'ranking', label: 'Ranking', Icon: TrendingUp },
    { key: 'comms', label: 'Commissions', Icon: DollarSign },
  ], []);
  const wrapRef = useRef(null);
  const btnRefs = useRef([]);
  const [u, setU] = useState({ left: 0, width: 0, ready: false });

  const recalc = useCallback(() => {
    const i = tabs.findIndex(t => t.key === active); if (i === -1) { setU(o => ({ ...o, ready: false })); return; }
    const el = btnRefs.current[i]; const wrap = wrapRef.current; if (!el || !wrap) return;
    const wl = wrap.getBoundingClientRect().left; const { left, width } = el.getBoundingClientRect();
    setU({ left: left - wl, width, ready: true });
  }, [active, tabs]);

  useEffect(() => { recalc(); }, [recalc]);
  useEffect(() => { const r = () => recalc(); window.addEventListener('resize', r); return () => window.removeEventListener('resize', r); }, [recalc]);

  return (
    <div ref={wrapRef} className="relative w-full flex bg-white/50 backdrop-blur-lg rounded-full p-1 border border-black/[0.03]">
      {u.ready && <motion.div layout className="absolute inset-y-1 rounded-full bg-white shadow-sm" style={{ left: u.left, width: u.width, zIndex: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 30 }} />}
      {tabs.map((t, i) => {
        const selected = t.key === active; return (
          <button key={t.key} ref={el => btnRefs.current[i] = el} onClick={() => onChange(selected ? null : t.key)} className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-colors ${selected ? 'text-black' : 'text-black/40 hover:text-black/60'}`}>
            <t.Icon className="w-3.5 h-3.5" />{t.label}
          </button>
        );
      })}
    </div>
  );
};

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

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide" style={{ backgroundColor: colors.background }}>
      <div className="px-6 py-6 space-y-6 max-w-2xl mx-auto w-full pb-24">

        {/* Navigation Tabs */}
        <div className="max-w-md">
          <SegmentedTabs theme={theme} active={topTab} onChange={k => { setTopTab(k); if (k) onNavigate(`customer-${k}`); }} />
        </div>

        {/* Hero Section - Progress to Goal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard theme={theme} className="md:col-span-2 p-8 overflow-hidden relative" variant="elevated">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black">Performance</h3>
                  <p className="text-sm font-semibold opacity-60">Year-to-date Progress</p>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${aheadOfPace ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {aheadOfPace ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {deltaLabel} {aheadOfPace ? 'Ahead' : 'Behind'}
                </div>
              </div>

              <div className="mt-12 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-5xl font-black tracking-tighter">${(totalBookings / 1000000).toFixed(1)}M<span className="text-lg opacity-20 ml-2">/ $7M Goal</span></span>
                  <span className="text-2xl font-bold opacity-40">{percentToGoal.toFixed(0)}%</span>
                </div>
                <div className="h-4 w-full bg-black/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${percentToGoal}%` }} className="h-full bg-black rounded-full shadow-[0_0_20px_rgba(0,0,0,0.2)]" />
                </div>
              </div>
            </div>
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          </GlassCard>

          <GlassCard theme={theme} className="p-8 flex flex-col justify-between bg-black text-white border-0" variant="elevated">
            <div className="space-y-1">
              <Award className="w-8 h-8 mb-4 text-white" />
              <h4 className="text-xl font-bold text-white leading-tight">Elite Circle Rewards</h4>
              <p className="text-sm opacity-60">You're 12k away from Platinum status.</p>
            </div>
            <button onClick={() => onNavigate('incentive-rewards')} className="w-full bg-white text-black py-4 rounded-full font-bold text-sm hover:scale-[1.02] active:scale-95 transition-transform">View Rewards</button>
          </GlassCard>
        </div>

        {/* Data Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Recent Orders */}
          <GlassCard theme={theme} className="p-8 space-y-6" variant="elevated">
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

          {/* Sales Chart */}
          <GlassCard theme={theme} className="p-8 space-y-6" variant="elevated">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button onClick={() => setChartDataType('bookings')} className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-colors ${chartDataType === 'bookings' ? 'bg-black text-white' : 'opacity-40 hover:opacity-60'}`}>Bookings</button>
                <button onClick={() => setChartDataType('sales')} className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-colors ${chartDataType === 'sales' ? 'bg-black text-white' : 'opacity-40 hover:opacity-60'}`}>Sales</button>
              </div>
              <button onClick={() => setMonthlyView(v => v === 'chart' ? 'table' : 'chart')} className="p-2 rounded-lg bg-black/5 hover:bg-black/10 transition-colors">
                {monthlyView === 'chart' ? <Table className="w-4 h-4" /> : <BarChart className="w-4 h-4" />}
              </button>
            </div>

            <div className="h-64 flex items-end gap-2 overflow-hidden px-2">
              {MONTHLY_SALES_DATA.map((m, i) => {
                const val = chartDataType === 'bookings' ? m.bookings : m.sales;
                const max = Math.max(...MONTHLY_SALES_DATA.map(d => chartDataType === 'bookings' ? d.bookings : d.sales));
                const pct = (val / max) * 100;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-3 group px-0.5">
                    <div className="w-full relative flex items-end justify-center">
                      <motion.div initial={{ height: 0 }} animate={{ height: `${pct}%` }} className="w-full bg-black/5 group-hover:bg-black rounded-t-lg transition-colors relative" />
                      <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black">${(val / 1000).toFixed(0)}k</div>
                    </div>
                    <span className="text-[10px] font-bold opacity-30 group-hover:opacity-100 transition-opacity">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Footer info or quick action */}
        <div className="flex justify-center mt-4">
          <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
            <MoreHorizontal className="w-4 h-4" />
            Configure Dashboard Layout
          </button>
        </div>
      </div>

      <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} theme={theme} />
    </div>
  );
};

