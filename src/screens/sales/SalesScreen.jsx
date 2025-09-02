import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '../../components/common/Modal';
import { ArrowUp, ArrowDown, TrendingUp, Award, DollarSign, BarChart, Table } from 'lucide-react';
import { MONTHLY_SALES_DATA, SALES_VERTICALS_DATA } from './data.js';
import { ORDER_DATA, STATUS_COLORS } from '../orders/data.js';
import { SalesByVerticalBreakdown } from './components/SalesByVerticalBreakdown.jsx';
import { CountUp } from '../../components/common/CountUp.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../components/common/GlassCard.jsx';

const formatCompanyName = (name='') => name.split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ');
const monthNameToNumber = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };

const SegmentedTabs = ({ theme, active, onChange }) => {
  const tabs = useMemo(()=>[
    { key:'rewards', label:'Rewards', Icon:Award },
    { key:'ranking', label:'Ranking', Icon:TrendingUp },
    { key:'comms', label:'Commissions', Icon:DollarSign },
  ],[]);
  const wrapRef = useRef(null);
  const btnRefs = useRef([]);
  const [u,setU] = useState({left:0,width:0,ready:false});
  const recalc = useCallback(()=>{
    const i = tabs.findIndex(t=>t.key===active); if(i===-1){setU(o=>({...o,ready:false}));return;}
    const el = btnRefs.current[i]; const wrap = wrapRef.current; if(!el||!wrap) return;
    const wl = wrap.getBoundingClientRect().left; const { left,width } = el.getBoundingClientRect();
    setU({ left:left-wl, width, ready:true });
  },[active,tabs]);
  useEffect(()=>{recalc();},[recalc]);
  useEffect(()=>{const r=()=>recalc(); window.addEventListener('resize',r); return()=>window.removeEventListener('resize',r);},[recalc]);
  return (
    <div ref={wrapRef} className="relative w-full flex" style={{ borderBottom:`1px solid ${theme.colors.border}` }}>
      {u.ready && <motion.div layout className="absolute bottom-0 h-[3px] rounded-full" style={{ left:u.left, width:u.width, background:theme.colors.accent }} transition={{ type:'spring', stiffness:220, damping:30 }} />}
      {tabs.map((t,i)=>{const selected=t.key===active;return(
        <button key={t.key} ref={el=>btnRefs.current[i]=el} onClick={()=>onChange(selected?null:t.key)} className="flex-1 flex items-center justify-center gap-2 h-12 font-semibold text-sm tracking-wide" style={{ color:selected?theme.colors.textPrimary:theme.colors.textSecondary }}>
          <t.Icon className="w-4 h-4" style={{ color:selected?theme.colors.accent:theme.colors.textSecondary }} />{t.label}
        </button>
      );})}
    </div>
  );
};

const MonthlyBarChart = ({ data, theme, onMonthSelect, dataType='bookings' }) => {
  const max = Math.max(...data.map(d=>dataType==='bookings'?d.bookings:d.sales));
  return (
    <div className="space-y-4">
      {data.map((m,idx)=>{ const val = dataType==='bookings'?m.bookings:m.sales; const pct = Math.min(99.4,(val/max)*100); return (
        <div key={m.month} className="grid grid-cols-[3rem,1fr,auto] items-center gap-x-4 text-sm">
          <span className="font-semibold" style={{ color:theme.colors.textSecondary }}>{m.month}</span>
          <div className="h-3 rounded-full relative overflow-hidden" style={{ backgroundColor:theme.colors.border }}>
            <motion.div className="absolute inset-y-0 left-0 rounded-full" initial={{ width:0 }} animate={{ width:pct+'%' }} transition={{ duration:0.5, delay:idx*0.03, ease:[0.4,0,0.2,1] }} style={{ backgroundColor:theme.colors.accent }} />
          </div>
          <button onClick={()=>onMonthSelect(m)} className="font-semibold text-right hover:underline" style={{ color:theme.colors.textPrimary }}>${val.toLocaleString()}</button>
        </div>
      );})}
    </div>
  );
};

const MonthlyTable = ({ data, theme, onMonthSelect }) => (
  <div className="text-sm" style={{ color:theme.colors.textPrimary }}>
    <div className="grid grid-cols-3 font-bold border-b" style={{ borderColor:theme.colors.border }}>
      <div className="p-2">Month</div><div className="p-2 text-right">Bookings</div><div className="p-2 text-right">Sales</div>
    </div>
    {data.map(m=> (
      <div key={m.month} className="grid grid-cols-3 border-b cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor:theme.colors.subtle }} onClick={()=>onMonthSelect(m)}>
        <div className="p-2 font-semibold">{m.month}</div>
        <div className="p-2 text-right">${m.bookings.toLocaleString()}</div>
        <div className="p-2 text-right">${m.sales.toLocaleString()}</div>
      </div>
    ))}
  </div>
);

const CustomerMonthlyBreakdown = ({ monthData, orders, theme, onBack }) => {
  const monthlyOrders = useMemo(()=>{ const num = monthNameToNumber[monthData.month]; if(num===undefined) return []; return orders.filter(o=>new Date(o.date).getMonth()===num); },[monthData,orders]);
  const customerData = useMemo(()=>{ const map={}; monthlyOrders.forEach(o=>{ if(!map[o.company]) map[o.company]={ company:o.company, bookings:0 }; map[o.company].bookings+=o.net;}); return Object.values(map).sort((a,b)=>b.bookings-a.bookings); },[monthlyOrders]);
  return (
    <div>
      <button onClick={onBack} className="flex items-center space-x-2 text-sm font-semibold mb-4" style={{ color:theme.colors.textSecondary }}>Back to Monthly Overview</button>
      <div className="text-sm" style={{ color:theme.colors.textPrimary }}>
        <div className="grid grid-cols-2 font-bold border-b" style={{ borderColor:theme.colors.border }}><div className="p-2">Customer</div><div className="p-2 text-right">Bookings</div></div>
        {customerData.map(c=> (
          <div key={c.company} className="grid grid-cols-2 border-b" style={{ borderColor:theme.colors.subtle }}>
            <div className="p-2 font-semibold">{formatCompanyName(c.company)}</div>
            <div className="p-2 text-right">${c.bookings.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const OrderModal = ({ order, onClose, theme }) => {
  if(!order) return null;
  return (
    <Modal show={!!order} onClose={onClose} title={`PO #${order.po}`} theme={theme}>
      <div className="space-y-4 text-sm" style={{ color:theme.colors.textPrimary }}>
        <div><h3 className="font-bold">{formatCompanyName(order.company)}</h3><p style={{ color:theme.colors.textSecondary }}>{order.details}</p></div>
        <div className="grid grid-cols-2 gap-4">
          <div><div className="font-semibold" style={{ color:theme.colors.textSecondary }}>Order Date</div><div>{new Date(order.date).toLocaleDateString()}</div></div>
          <div><div className="font-semibold" style={{ color:theme.colors.textSecondary }}>Ship Date</div><div>{new Date(order.shipDate).toLocaleDateString()}</div></div>
          <div><div className="font-semibold" style={{ color:theme.colors.textSecondary }}>Net Amount</div><div className="font-bold" style={{ color:theme.colors.accent }}>${order.net.toLocaleString()}</div></div>
          <div><div className="font-semibold" style={{ color:theme.colors.textSecondary }}>Status</div><span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor:(STATUS_COLORS[order.status]||theme.colors.secondary)+'20', color:STATUS_COLORS[order.status]||theme.colors.secondary }}>{order.status}</span></div>
        </div>
        <div>
          <h4 className="font-bold border-t pt-3 mt-3" style={{ borderColor:theme.colors.subtle }}>Line Items</h4>
          <div className="space-y-2 mt-2">{order.lineItems?.map(li=> (
            <div key={li.line} className="flex justify-between"><span>{li.quantity}x {li.name}</span><span className="font-semibold">${li.extNet.toLocaleString()}</span></div>
          ))}</div>
        </div>
      </div>
    </Modal>
  );
};

export const SalesScreen = ({ theme, onNavigate }) => {
  const [monthlyView,setMonthlyView]=useState('chart');
  const [chartDataType,setChartDataType]=useState('bookings');
  const [selectedOrder,setSelectedOrder]=useState(null);
  const [numRecentOrders,setNumRecentOrders]=useState(3);
  const [selectedMonth,setSelectedMonth]=useState(null);
  const [isScrolled,setIsScrolled]=useState(false);
  const [topTab,setTopTab]=useState(null);
  const [showTrendInfo,setShowTrendInfo]=useState(false);
  const [trendPos,setTrendPos]=useState({ top:0,right:0 });
  const trendButtonRef = useRef(null);
  const popoverRef = useRef(null);
  const scrollRef = useRef(null);

  const handleScroll = useCallback(()=>{ if(scrollRef.current) setIsScrolled(scrollRef.current.scrollTop>10); },[]);

  const { totalBookings, totalSales } = useMemo(()=>({
    totalBookings: MONTHLY_SALES_DATA.reduce((a,m)=>a+m.bookings,0),
    totalSales: MONTHLY_SALES_DATA.reduce((a,m)=>a+m.sales,0)
  }),[]);

  const { yearProgressPercent, percentToGoal, deltaLabel, aheadOfPace } = useMemo(()=>{
    const now=new Date();
    const start=new Date(now.getFullYear(),0,1); const next=new Date(now.getFullYear()+1,0,1);
    const totalDays=(next-start)/86400000; const dayOfYear=Math.floor((now-start)/86400000)+1;
    const yearPct=(dayOfYear/totalDays)*100;
    const goalPct=(MONTHLY_SALES_DATA.reduce((a,m)=>a+m.bookings,0)/7000000)*100;
    const delta=goalPct-yearPct; // positive ahead
    return { yearProgressPercent:yearPct, percentToGoal:goalPct, deltaLabel:`${Math.abs(delta).toFixed(1)}%`, aheadOfPace: delta>=0 };
  },[]);

  const salesByVertical = useMemo(()=> (SALES_VERTICALS_DATA?.length? SALES_VERTICALS_DATA.map(v=>({ name:v.label||v.vertical, value:v.value, color:v.color })) : []),[]);
  const allRecentOrders = useMemo(()=> ORDER_DATA.filter(o=>o.date&&o.net).sort((a,b)=>new Date(b.date)-new Date(a.date)),[]);
  const displayedRecent = useMemo(()=> allRecentOrders.slice(0,numRecentOrders),[allRecentOrders,numRecentOrders]);
  const goal = 7000000;

  const handleTabChange = useCallback(k=>{ setTopTab(k); if(k==='rewards') onNavigate('incentive-rewards'); if(k==='ranking') onNavigate('customer-rank'); if(k==='comms') onNavigate('commissions'); },[onNavigate]);
  const showMoreOrders = ()=> setNumRecentOrders(n=> Math.min(allRecentOrders.length, n===3?8:n+5));

  const openTrend = useCallback((e)=>{ const el=e?.currentTarget||trendButtonRef.current; if(!el) return; const r=el.getBoundingClientRect(); setTrendPos({ top:r.bottom+8, right:Math.max(8, window.innerWidth-r.right) }); setShowTrendInfo(true); },[]);

  useEffect(()=>{ if(!showTrendInfo) return; const handler=(e)=>{ const inBtn=trendButtonRef.current && trendButtonRef.current.contains(e.target); const inPop=popoverRef.current && popoverRef.current.contains(e.target); if(!inBtn && !inPop) setShowTrendInfo(false); }; window.addEventListener('mousedown',handler); window.addEventListener('touchstart',handler); return ()=>{ window.removeEventListener('mousedown',handler); window.removeEventListener('touchstart',handler); }; },[showTrendInfo]);

  const prefersReduced = typeof window!=='undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="flex flex-col h-full">
      <div className={`sticky top-0 z-10 transition-all duration-300 ${isScrolled?'shadow-md':''}`} style={{ backgroundColor:theme.colors.background, backdropFilter:isScrolled?'blur(12px)':'none' }}>
        <div className="px-4 pt-0 pb-0 flex flex-col max-w-6xl mx-auto w-full">
          <SegmentedTabs theme={theme} active={topTab} onChange={handleTabChange} />
        </div>
      </div>

      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 space-y-4 pt-0 pb-4 max-w-6xl mx-auto">
          <GlassCard theme={theme} className="p-6 mt-5" variant="elevated">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-xl" style={{ color:theme.colors.textPrimary }}>Progress to Goal</h3>
              <button ref={trendButtonRef} type="button" className="flex items-center gap-1 px-3 py-1 rounded-full cursor-pointer select-none font-semibold text-xs shadow-sm focus:outline-none focus:ring" onClick={e=> showTrendInfo? setShowTrendInfo(false): openTrend(e)} style={aheadOfPace? { background:'#34D399', color:'#064E3B' } : { background:'#F87171', color:'#7F1D1D' }}>
                {aheadOfPace? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                <span>{deltaLabel}</span>
              </button>
            </div>
            <div className="flex items-end gap-3 mb-3">
              <p className="text-5xl leading-none font-bold" style={{ color:theme.colors.accent }}><CountUp value={percentToGoal} decimals={1} suffix="%" /></p>
            </div>
            <div className="relative w-full h-6 rounded-full mb-2" style={{ backgroundColor:theme.colors.border }}>
              <motion.div className="h-full rounded-full" initial={{ width:0 }} animate={{ width:percentToGoal+'%' }} transition={prefersReduced? { duration:0 } : { type:'spring', stiffness:140, damping:22 }} style={{ backgroundColor:theme.colors.accent }} />
              {(()=>{ const current=(totalBookings/1000000).toFixed(1); const goalM=(goal/1000000).toFixed(1); const safe=Math.max(percentToGoal,5); return (<>
                <span className="absolute top-1/2 -translate-y-1/2 font-bold text-sm px-1" style={{ left:`${safe}%`, transform:'translate(-100%, -50%)', color:'#fff' }}>${current}M</span>
                <span className="absolute top-1/2 -translate-y-1/2 font-semibold text-sm" style={{ right:'2%', color:theme.colors.textSecondary }}>${goalM}M</span>
              </>); })()}
            </div>
            <p className="text-[11px] font-medium" style={{ color:theme.colors.textSecondary }}>Year elapsed: {yearProgressPercent.toFixed(1)}%</p>
          </GlassCard>

          <GlassCard theme={theme} className="p-6" variant="elevated">
            {selectedMonth? (
              <CustomerMonthlyBreakdown monthData={selectedMonth} orders={ORDER_DATA} theme={theme} onBack={()=>setSelectedMonth(null)} />
            ):(
              <>
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div className="flex items-center bg-transparent rounded-full border overflow-hidden" style={{ borderColor:theme.colors.border }}>
                    <button onClick={()=>setChartDataType('bookings')} className="px-4 py-2 text-sm font-semibold" style={{ backgroundColor:chartDataType==='bookings'?theme.colors.accent:'transparent', color:chartDataType==='bookings'?'#fff':theme.colors.textSecondary }}>Bookings</button>
                    <button onClick={()=>setChartDataType('sales')} className="px-4 py-2 text-sm font-semibold" style={{ backgroundColor:chartDataType==='sales'?theme.colors.accent:'transparent', color:chartDataType==='sales'?'#fff':theme.colors.textSecondary }}>Sales</button>
                  </div>
                  <div className="flex items-start gap-2">
                    <button onClick={()=>setMonthlyView(v=>v==='chart'?'table':'chart')} className="p-3 rounded-full shadow-sm" style={{ backgroundColor:theme.colors.subtle, color:theme.colors.textPrimary, border:`1px solid ${theme.colors.border}` }} aria-label={monthlyView==='chart'?'Show table view':'Show chart view'}>
                      {monthlyView==='chart'? <Table className="w-5 h-5" /> : <BarChart className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="mt-6">
                  {monthlyView==='chart'? <MonthlyBarChart data={MONTHLY_SALES_DATA} theme={theme} onMonthSelect={setSelectedMonth} dataType={chartDataType} /> : <MonthlyTable data={MONTHLY_SALES_DATA} theme={theme} onMonthSelect={setSelectedMonth} />}
                </div>
                <div className="mt-5 flex justify-end">
                  <p className="text-sm font-semibold" style={{ color:theme.colors.textSecondary }}>
                    {chartDataType==='bookings'? 'Total Bookings: ':'Total Sales: '}<span style={{ color:theme.colors.textPrimary }}>${(chartDataType==='bookings'? totalBookings: totalSales).toLocaleString()}</span>
                  </p>
                </div>
              </>
            )}
          </GlassCard>

          <GlassCard theme={theme} className="p-6 space-y-4" variant="elevated">
            <h3 className="font-bold text-xl" style={{ color:theme.colors.textPrimary }}>Recent Orders</h3>
            <div>
              {displayedRecent.map((order,i)=>(
                <motion.div key={order.orderNumber} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35, delay:i*0.04, ease:[0.4,0,0.2,1] }} className="py-4 border-b last:border-b-0 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 px-1 rounded-lg transition-colors" style={{ borderColor:theme.colors.subtle }} onClick={()=>setSelectedOrder(order)}>
                  <div className="flex items-center justify-between mb-1"><span className="text-xs font-medium" style={{ color:theme.colors.textSecondary }}>{new Date(order.date).toLocaleDateString()}</span><span className="text-base font-bold" style={{ color:theme.colors.accent }}>${order.net.toLocaleString()}</span></div>
                  <p className="font-semibold text-sm mb-2 truncate" style={{ color:theme.colors.textPrimary }}>{formatCompanyName(order.company)}</p>
                  <span className="px-2 py-1 rounded-full text-[10px] font-medium" style={{ backgroundColor:(STATUS_COLORS[order.status]||theme.colors.secondary)+'20', color:STATUS_COLORS[order.status]||theme.colors.secondary }}>{order.status}</span>
                </motion.div>
              ))}
              {numRecentOrders < allRecentOrders.length && <button onClick={showMoreOrders} className="w-full text-center text-xs font-semibold mt-2 py-3 hover:underline" style={{ color:theme.colors.accent }}>Show 5 More</button>}
            </div>
          </GlassCard>

          <GlassCard theme={theme} className="p-6" variant="elevated">
            <h3 className="font-bold text-xl mb-4" style={{ color:theme.colors.textPrimary }}>Sales by Vertical (YTD)</h3>
            <SalesByVerticalBreakdown data={salesByVertical} theme={theme} showOverview palette={['#55A868','#C44E52','#8172B2','#CCB04C','#4C72B0','#8C8C8C']} />
          </GlassCard>
        </div>
      </div>

      <OrderModal order={selectedOrder} onClose={()=>setSelectedOrder(null)} theme={theme} />

      <AnimatePresence>
        {showTrendInfo && createPortal(
          <motion.div ref={popoverRef} initial={{ opacity:0, scale:0.96, y:4 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.96, y:4 }} transition={{ duration:0.2, ease:[0.4,0,0.2,1] }} className="rounded-2xl shadow-xl text-[11px]" style={{ position:'fixed', top:trendPos.top, right:trendPos.right, width:240, zIndex:9999, backgroundColor:theme.colors.background, border:`1px solid ${theme.colors.border}`, padding:16 }}>
            <p className="font-semibold mb-1" style={{ color: aheadOfPace?'#065F46':'#7F1D1D' }}>{aheadOfPace? 'Ahead of linear pace':'Behind linear pace'} {deltaLabel}</p>
            <p style={{ color:theme.colors.textSecondary, lineHeight:'1.25rem' }}>Progress: {percentToGoal.toFixed(1)}%<br />Time Elapsed: {yearProgressPercent.toFixed(1)}%</p>
          </motion.div>, document.body)
        }
      </AnimatePresence>
    </div>
  );
};
