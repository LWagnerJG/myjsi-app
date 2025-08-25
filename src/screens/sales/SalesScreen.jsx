import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { ArrowUp, Plus, ArrowLeft, TrendingUp, Award, DollarSign, BarChart, Info, Table } from 'lucide-react';
import { MONTHLY_SALES_DATA, SALES_VERTICALS_DATA } from './data.js';
import { ORDER_DATA, STATUS_COLORS } from '../orders/data.js';

const formatMillion = (num) => `${(num / 1000000).toFixed(1)}M`;
const formatCompanyName = (name) => name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
const monthNameToNumber = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

// New accessible segmented tabs with sliding highlight
const SegmentedTabs = ({ theme, active, onChange }) => {
    const tabs = useMemo(() => [
        { key: 'rewards', label: 'Rewards', Icon: Award, title: 'View incentive rewards' },
        { key: 'ranking', label: 'Ranking', Icon: TrendingUp, title: 'Customer ranking performance' },
        { key: 'comms', label: 'Comms', Icon: DollarSign, title: 'Commission details' },
    ], []);
    const wrapRef = useRef(null);
    const btnRefs = useRef([]);
    const [u, setU] = useState({ left: 0, width: 0, ready: false });

    const recalc = useCallback(() => {
        const i = tabs.findIndex(t => t.key === active);
        if (i === -1) { setU({ left: 0, width: 0, ready: false }); return; }
        const el = btnRefs.current[i]; const wrap = wrapRef.current; if (!el || !wrap) return;
        const { left: wl } = wrap.getBoundingClientRect();
        const { left, width } = el.getBoundingClientRect();
        setU({ left: left - wl, width, ready: true });
    }, [active, tabs]);

    useEffect(() => { recalc(); }, [recalc]);
    useEffect(() => { const onR = () => recalc(); window.addEventListener('resize', onR); return () => window.removeEventListener('resize', onR); }, [recalc]);

    const handleKey = (e) => {
        if (!['ArrowLeft','ArrowRight'].includes(e.key)) return;
        e.preventDefault();
        const i = tabs.findIndex(t => t.key === active);
        // If none selected start at first / last
        const startIndex = i === -1 ? 0 : i;
        const next = e.key === 'ArrowRight' ? (startIndex + 1) % tabs.length : (startIndex - 1 + tabs.length) % tabs.length;
        onChange(tabs[next].key);
        btnRefs.current[next]?.focus();
    };

    return (
        <div ref={wrapRef} role="tablist" aria-label="Sales navigation" onKeyDown={handleKey} className="select-none flex items-center relative" style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: 9999, padding: '4px 6px', boxShadow: `0 4px 16px ${theme.colors.shadow}`, height: 44 }}>
            {u.ready && (
                <div className="absolute" style={{ top: 4, left: u.left + 6, height: 36, width: u.width - 12, borderRadius: 9999, background: theme.colors.subtle, transition: 'left 260ms cubic-bezier(.4,.2,.2,1), width 260ms cubic-bezier(.4,.2,.2,1)' }} />
            )}
            {tabs.map((t, i) => {
                const selected = t.key === active;
                return (
                    <button
                        key={t.key}
                        role="tab"
                        aria-selected={selected}
                        tabIndex={selected || active === null ? 0 : -1}
                        ref={el => (btnRefs.current[i] = el)}
                        onClick={() => onChange(selected ? null : t.key)}
                        title={t.title}
                        className="relative flex items-center gap-1.5 px-4 h-9 rounded-full font-semibold text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        style={{ color: selected ? theme.colors.textPrimary : theme.colors.textSecondary, zIndex: 2 }}
                    >
                        <t.Icon className="w-4 h-4" style={{ color: selected ? theme.colors.accent : theme.colors.textSecondary }} />
                        <span style={{ letterSpacing: '.25px' }}>{t.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

const ToggleGroup = ({ theme, options, value, onChange, className = "" }) => {
    const wrapRef = useRef(null);
    const btnRefs = useRef([]);
    const [u, setU] = useState({ left: 0, width: 0, opacity: 0 });

    const recalc = useCallback(() => {
        const i = options.findIndex(option => option.key === value);
        if (i === -1) {
            setU({ left: 0, width: 0, opacity: 0 });
            return;
        }
        const el = btnRefs.current[i];
        const wrap = wrapRef.current;
        if (!el || !wrap) return;
        const { left: wl } = wrap.getBoundingClientRect();
        const { left, width } = el.getBoundingClientRect();
        setU({ left: left - wl, width, opacity: 1 });
    }, [value, options]);

    useEffect(() => { recalc(); }, [recalc]);
    useEffect(() => { 
        const onR = () => recalc(); 
        window.addEventListener('resize', onR); 
        return () => window.removeEventListener('resize', onR); 
    }, [recalc]);

    return (
        <div 
            ref={wrapRef}
            className={`relative flex items-center gap-4 px-1 pt-1 pb-2 ${className}`}
            style={{ backgroundColor: theme.colors.surface }}
        >
            <div className="absolute left-0 right-0 bottom-0 h-px" style={{ background: theme.colors.border }} />
            <div
                className="absolute bottom-0 h-[2px] rounded transition-[transform,width,opacity] duration-300"
                style={{ background: theme.colors.accent, transform: `translateX(${u.left}px)`, width: u.width, opacity: u.opacity }}
            />
            {options.map((option, i) => {
                const selected = value === option.key;
                return (
                    <button
                        key={option.key}
                        ref={el => (btnRefs.current[i] = el)}
                        onClick={() => onChange(option.key)}
                        className={`flex items-center gap-1.5 pb-1.5 text-xs font-medium transition-all ${option.icon ? '' : ''}`}
                        style={{ color: selected ? theme.colors.accent : theme.colors.textSecondary }}
                    >
                        {option.icon && <option.icon className="w-3.5 h-3.5" />}
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};

const MonthlyBarChart = ({ data, theme, onMonthSelect, dataType = 'bookings' }) => {
    const maxValue = Math.max(...data.map(d => dataType === 'bookings' ? d.bookings : d.sales));
    return (
        <div className="space-y-4">
            {data.map((item) => {
                const value = dataType === 'bookings' ? item.bookings : item.sales;
                const rawPct = ((value || 0) / maxValue) * 100;
                const pct = Math.min(99.4, rawPct); // prevent full edge clipping / squared right radius
                return (
                    <div key={item.month} className="grid grid-cols-[3rem,1fr,auto] items-center gap-x-4 text-sm">
                        <span className="font-semibold" style={{ color: theme.colors.textSecondary }}>{item.month}</span>
                        <div className="h-3 rounded-full relative overflow-hidden" style={{ backgroundColor: theme.colors.border, padding: 0 }}>
                            <div
                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                                style={{ width: `${pct}%`, backgroundColor: theme.colors.accent }}
                            />
                        </div>
                        <button
                            onClick={() => onMonthSelect(item)}
                            className="font-semibold text-right hover:underline transition-colors"
                            style={{ color: theme.colors.textPrimary }}
                        >
                            ${(value || 0).toLocaleString()}
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

// ================= Responsive Donut Chart with improved labeling ================
const DonutChart = React.memo(({ data, theme }) => {
    const wrapperRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(360);

    // Observe width for responsiveness
    useEffect(() => {
        if (!wrapperRef.current) return;
        const ro = new ResizeObserver(entries => {
            for (const entry of entries) {
                setContainerWidth(Math.max(260, Math.min(560, entry.contentRect.width)));
            }
        });
        ro.observe(wrapperRef.current);
        return () => ro.disconnect();
    }, []);

    const palette = ['#8B5CF6','#10B981','#F59E0B','#EF4444','#6366F1','#0EA5E9','#D946EF','#84CC16','#F472B6','#64748B'];
    const segments = useMemo(() => (Array.isArray(data)? data: []).map((d,i)=>({
        label: d.vertical || d.label || `Seg ${i+1}`,
        value: d.value || d.sales || d.amount || 0,
        color: palette[i%palette.length]
    })).filter(s=>s.value>0).sort((a,b)=>b.value-a.value), [data]);

    const total = segments.reduce((s,d)=>s+d.value,0);
    if(!total) return <div ref={wrapperRef} className="flex items-center justify-center h-40"><p className="text-sm" style={{color:theme.colors.textSecondary}}>No data</p></div>;

    // Geometry
    const size = containerWidth;
    const strokeWidth = Math.min(44, Math.max(18, size * 0.16));
    const radius = (size - strokeWidth)/2;
    const center = size/2;
    const TAU = Math.PI*2;
    const polar = (r,a)=>[center + r*Math.cos(a), center + r*Math.sin(a)];

    // Build arc paths
    let start = -Math.PI/2; // 12 o'clock
    const arcMeta = segments.map((seg, idx) => {
        const sweep = (seg.value/total)*TAU;
        const end = start + sweep;
        const largeArc = sweep>Math.PI?1:0;
        const [sx,sy] = polar(radius,start); const [ex,ey] = polar(radius,end);
        const mid = start + sweep/2;
        const pct = (seg.value/total)*100;
        const pathId = `arc-path-${idx}`;
        // path in forward direction (clockwise). For reversed text we will create an aux path.
        const path = `M ${sx} ${sy} A ${radius} ${radius} 0 ${largeArc} 1 ${ex} ${ey}`;
        start = end;
        return { seg, sweep, startAngle: start - sweep, endAngle: end, mid, pct, pathId, path, largeArc };
    });

    // Determine labeling approach
    const CURVE_PCT_THRESHOLD = 9; // label on arc if large enough
    const MIN_PILL_PCT = 2; // otherwise aggregate into other or show pill if space

    // Optionally aggregate extremely small slices into Other for clarity
    const tinySlices = arcMeta.filter(m => m.pct < MIN_PILL_PCT);
    if (tinySlices.length > 2) {
        const othersValue = tinySlices.reduce((s,m)=>s+m.seg.value,0);
        // remove them and append aggregated
        for (const t of tinySlices) {
            const idx = arcMeta.indexOf(t);
            if (idx>=0) arcMeta.splice(idx,1);
        }
        // rebuild total for display percentages (keep original total for accurate pct)
        const otherPct = (othersValue/total)*100;
        arcMeta.push({
            seg:{ label:'Other', value: othersValue, color: theme.colors.border },
            sweep:(othersValue/total)*TAU,
            startAngle:0, endAngle:0, mid:0, pct:otherPct, pathId:`arc-other`, path:'', largeArc:0, aggregated:true
        });
        // Recompute arcs from scratch to keep continuity
        start = -Math.PI/2;
        arcMeta.forEach(m => {
            const sweep = (m.seg.value/total)*TAU;
            const end = start + sweep; const largeArc = sweep>Math.PI?1:0; const [sx,sy]=polar(radius,start); const [ex,ey]=polar(radius,end);
            m.path = `M ${sx} ${sy} A ${radius} ${radius} 0 ${largeArc} 1 ${ex} ${ey}`;
            m.startAngle = start; m.endAngle=end; m.mid = start + sweep/2; m.sweep=sweep; m.largeArc=largeArc; start=end;
        });
    }

    // Split label strategies
    const arcLabels = arcMeta.filter(m => m.pct >= CURVE_PCT_THRESHOLD);
    const pillLabels = arcMeta.filter(m => m.pct < CURVE_PCT_THRESHOLD);

    // Build reversed text paths for left-side arcs (mid between 90 and 270 deg)
    const textPaths = arcLabels.map((m,i) => {
        const angleDeg = (m.mid*180/Math.PI + 360)%360;
        const needsReverse = angleDeg>90 && angleDeg<270;
        let textPathId = m.pathId + '-text';
        let d = m.path;
        if (needsReverse) {
            // reverse path: swap start/end & sweep flag (use sweep=0 for reverse direction)
            const [sx,sy] = polar(radius,m.endAngle); const [ex,ey] = polar(radius,m.startAngle);
            d = `M ${sx} ${sy} A ${radius} ${radius} 0 ${m.largeArc} 0 ${ex} ${ey}`;
        }
        return { id:textPathId, d, needsReverse, meta:m };
    });

    // Outside pills for small segments (tethered) with collision management
    const outerR = radius + strokeWidth/2 + 6;
    const pillR = outerR + 22;
    const pills = pillLabels.map((m,i)=>{
        const [sx,sy] = polar(outerR,m.mid); const [lx,ly] = polar(pillR,m.mid);
        return { meta:m, sx, sy, lx, ly, right: lx>center };
    });
    pills.sort((a,b)=>a.ly-b.ly); const GAP=18; for(let i=1;i<pills.length;i++){ if(pills[i].ly - pills[i-1].ly < GAP) pills[i].ly = pills[i-1].ly + GAP; }

    const fmtTotal = v => v>=1e6? `$${(v/1e6).toFixed(1)}M` : v>=1e3? `$${(v/1e3).toFixed(1)}K` : `$${v}`;

    return (
        <div ref={wrapperRef} className="relative w-full flex justify-center items-center" style={{minHeight:size}}>
            <svg width={size} height={size}>
                <defs>
                    {textPaths.map(tp => <path key={tp.id} id={tp.id} d={tp.d} fill="none" />)}
                </defs>
                <circle cx={center} cy={center} r={radius} fill="none" stroke={theme.colors.subtle} strokeWidth={strokeWidth} />
                {arcMeta.map(a => <path key={a.pathId} d={a.path} fill="none" stroke={a.seg.color} strokeWidth={strokeWidth} strokeLinecap="round" />)}
                <circle cx={center} cy={center} r={radius - strokeWidth/2} fill={theme.colors.surface} />
                <text x={center} y={center-6} textAnchor="middle" fontSize={11} fontWeight={600} fill={theme.colors.textSecondary}>Sales by Vertical</text>
                <text x={center} y={center+16} textAnchor="middle" fontSize={size<340?20:24} fontWeight={700} fill={theme.colors.textPrimary}>{fmtTotal(total)}</text>

                {textPaths.map(tp => {
                    const { meta } = tp; const pctText = `${meta.seg.label} ${meta.pct.toFixed(1)}%`;
                    // font size scaled by percentage (clamp 10-13)
                    const fs = Math.max(10, Math.min(13, 10 + (meta.pct - CURVE_PCT_THRESHOLD) * 0.25));
                    const textColor = '#fff'; // assume colored background; high contrast ring
                    return (
                        <text key={tp.id + '-label'} fontSize={fs} fontWeight={600} fill={textColor}>
                            <textPath href={`#${tp.id}`} startOffset="50%" textAnchor="middle" alignmentBaseline="middle" dominantBaseline="middle">
                                {pctText}
                            </textPath>
                        </text>
                    );
                })}

                {pills.map(p => {
                    const t = `${p.meta.seg.label} ${p.meta.pct.toFixed(1)}%`;
                    const fs = Math.max(9, Math.min(11, 9 + (p.meta.pct/CURVE_PCT_THRESHOLD)*2));
                    const pad=6; const h=22; const estW = t.length*5 + pad*2; const x = p.right? p.lx : p.lx - estW; const y = p.ly - h/2;
                    return (
                        <g key={'pill-'+p.meta.pathId}>
                            <line x1={p.sx} y1={p.sy} x2={p.lx} y2={p.ly} stroke={p.meta.seg.color} strokeWidth={1.4} />
                            <circle cx={p.sx} cy={p.sy} r={3} fill={p.meta.seg.color} />
                            <rect x={x} y={y} width={estW} height={h} rx={h/2} ry={h/2} fill={theme.colors.surface} stroke={p.meta.seg.color} strokeWidth={1} />
                            <text x={x + estW/2} y={y + h/2 + 3} fontSize={fs} fontWeight={600} textAnchor="middle" fill={theme.colors.textPrimary}>{t}</text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
});

// ================= End DonutChart =================
const MonthlyTable = ({ data, theme, onMonthSelect }) => (
    <div className="text-sm" style={{ color: theme.colors.textPrimary }}>
        <div className="grid grid-cols-3 font-bold border-b" style={{ borderColor: theme.colors.border }}>
            <div className="p-2">Month</div>
            <div className="p-2 text-right">Bookings</div>
            <div className="p-2 text-right">Sales</div>
        </div>
        {data.map(m => (
            <div
                key={m.month}
                className="grid grid-cols-3 border-b cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: theme.colors.subtle }}
                onClick={() => onMonthSelect(m)}
            >
                <div className="p-2 font-semibold">{m.month}</div>
                <div className="p-2 text-right">${m.bookings.toLocaleString()}</div>
                <div className="p-2 text-right">${m.sales.toLocaleString()}</div>
            </div>
        ))}
    </div>
);

const CustomerMonthlyBreakdown = ({ monthData, orders, theme, onBack }) => {
    const monthlyOrders = useMemo(() => {
        const monthNumber = monthNameToNumber[monthData.month];
        if (monthNumber === undefined) return [];
        return orders.filter(order => new Date(order.date).getMonth() === monthNumber);
    }, [monthData, orders]);

    const customerData = useMemo(() => {
        const customers = {};
        monthlyOrders.forEach(order => {
            if (!customers[order.company]) customers[order.company] = { bookings: 0, sales: 0, company: order.company };
            customers[order.company].bookings += order.net;
        });
        return Object.values(customers).sort((a, b) => b.bookings - a.bookings);
    }, [monthlyOrders]);

    return (
        <div>
            <button onClick={onBack} className="flex items-center space-x-2 text-sm font-semibold mb-4" style={{ color: theme.colors.textSecondary }}>
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Monthly Overview</span>
            </button>
            <div className="text-sm" style={{ color: theme.colors.textPrimary }}>
                <div className="grid grid-cols-2 font-bold border-b" style={{ borderColor: theme.colors.border }}>
                    <div className="p-2">Customer</div>
                    <div className="p-2 text-right">Bookings</div>
                </div>
                {customerData.map(c => (
                    <div key={c.company} className="grid grid-cols-2 border-b" style={{ borderColor: theme.colors.subtle }}>
                        <div className="p-2 font-semibold">{formatCompanyName(c.company)}</div>
                        <div className="p-2 text-right">${c.bookings.toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const OrderModal = ({ order, onClose, theme }) => {
    if (!order) return null;
    return (
        <Modal show={!!order} onClose={onClose} title={`PO #${order?.po}`} theme={theme}>
            <div className="space-y-4">
                <div>
                    <h3 className="font-bold" style={{ color: theme.colors.textPrimary }}>{formatCompanyName(order.company)}</h3>
                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{order.details}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <div className="font-semibold" style={{ color: theme.colors.textSecondary }}>Order Date</div>
                        <div style={{ color: theme.colors.textPrimary }}>{new Date(order.date).toLocaleDateString()}</div>
                    </div>
                    <div>
                        <div className="font-semibold" style={{ color: theme.colors.textSecondary }}>Ship Date</div>
                        <div style={{ color: theme.colors.textPrimary }}>{new Date(order.shipDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                        <div className="font-semibold" style={{ color: theme.colors.textSecondary }}>Net Amount</div>
                        <div className="font-bold" style={{ color: theme.colors.accent }}>${order.net.toLocaleString()}</div>
                    </div>
                    <div>
                        <div className="font-semibold" style={{ color: theme.colors.textSecondary }}>Status</div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: (STATUS_COLORS[order.status] || theme.colors.secondary) + '20', color: STATUS_COLORS[order.status] || theme.colors.secondary }}>
                            {order.status}
                        </span>
                    </div>
                </div>
                <div>
                    <h4 className="font-bold border-t pt-3 mt-3" style={{ color: theme.colors.textPrimary, borderColor: theme.colors.subtle }}>Line Items</h4>
                    <div className="space-y-2 mt-2 text-sm">
                        {order.lineItems?.map(item => (
                            <div key={item.line} className="flex justify-between">
                                <span style={{ color: theme.colors.textPrimary }}>{item.quantity}x {item.name}</span>
                                <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>${item.extNet.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export const SalesScreen = ({ theme, onNavigate }) => {
    const [monthlyView, setMonthlyView] = useState('chart');
    const [chartDataType, setChartDataType] = useState('bookings');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [numRecentOrders, setNumRecentOrders] = useState(5);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [topTab, setTopTab] = useState(null);
    const [showTrendInfo, setShowTrendInfo] = useState(false);

    const scrollContainerRef = useRef(null);
    const loadMoreRef = useRef(null);
    const trendRef = useRef(null);

    useEffect(() => {
        if (!showTrendInfo) return;
        const handleClickOutside = (e) => { if (trendRef.current && !trendRef.current.contains(e.target)) setShowTrendInfo(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showTrendInfo]);

    const handleScroll = useCallback(() => { if (scrollContainerRef.current) setIsScrolled(scrollContainerRef.current.scrollTop > 10); }, []);

    const { totalBookings, totalSales } = useMemo(() => {
        const bookings = MONTHLY_SALES_DATA.reduce((acc, m) => acc + m.bookings, 0);
        const sales = MONTHLY_SALES_DATA.reduce((acc, m) => acc + m.sales, 0);
        return { totalBookings: bookings, totalSales: sales };
    }, []);

    const { yearProgressPercent, deltaVsLinear, deltaLabel } = useMemo(() => {
        const now = new Date();
        const startYear = new Date(now.getFullYear(), 0, 1);
        const startNext = new Date(now.getFullYear() + 1, 0, 1);
        const totalDays = (startNext - startYear) / 86400000;
        const dayOfYear = Math.floor((now - startYear) / 86400000) + 1;
        const yearPct = (dayOfYear / totalDays) * 100;
        const goalPct = MONTHLY_SALES_DATA.reduce((acc, m) => acc + m.bookings, 0) / 7000000 * 100;
        const delta = goalPct - yearPct;
        return { yearProgressPercent: yearPct, deltaVsLinear: delta, deltaLabel: `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%` };
    }, []);

    const salesByVertical = useMemo(() => {
        if (SALES_VERTICALS_DATA && Array.isArray(SALES_VERTICALS_DATA) && SALES_VERTICALS_DATA.length > 0) return SALES_VERTICALS_DATA;
        const verticalSales = {};
        ORDER_DATA.forEach(order => { if (order.vertical && order.net) verticalSales[order.vertical] = (verticalSales[order.vertical] || 0) + order.net; });
        return Object.entries(verticalSales).map(([vertical, value]) => ({ vertical, value })).sort((a, b) => b.value - a.value).slice(0, 8);
    }, []);

    const allRecentOrders = useMemo(() => ORDER_DATA.filter(o => o.date && o.net).sort((a, b) => new Date(b.date) - new Date(a.date)), []);
    const displayedRecentOrders = useMemo(() => allRecentOrders.slice(0, numRecentOrders), [allRecentOrders, numRecentOrders]);

    useEffect(() => {
        const io = new IntersectionObserver((entries) => { if (entries[0].isIntersecting && numRecentOrders < allRecentOrders.length) setNumRecentOrders(p => p + 5); }, { threshold: 1 });
        const node = loadMoreRef.current; if (node) io.observe(node); return () => node && io.unobserve(node);
    }, [numRecentOrders, allRecentOrders.length]);

    const goal = 7000000;
    const percentToGoal = useMemo(() => (totalBookings / goal) * 100, [totalBookings, goal]);
    const handleShowOrderDetails = useCallback(order => setSelectedOrder(order), []);
    const handleCloseModal = useCallback(() => setSelectedOrder(null), []);
    const handleMonthSelect = useCallback(month => setSelectedMonth(month), []);
    const handleBackToMonthly = useCallback(() => setSelectedMonth(null), []);

    const handleTopTabChange = useCallback((key) => {
        setTopTab(key);
        if (key === 'rewards') onNavigate('incentive-rewards');
        if (key === 'ranking') onNavigate('customer-rank');
        if (key === 'comms') onNavigate('commissions');
    }, [onNavigate]);

    // Gradient / visual helpers
    const gradientAccent = `linear-gradient(135deg, ${theme.colors.accent} 0%, ${theme.colors.accent}cc 55%, ${theme.colors.accent} 100%)`;
    const accentHover = theme.colors.accent;

    return (
        <div className="flex flex-col h-full">
            <div
                className={`sticky top-0 z-10 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}
                style={{ backgroundColor: isScrolled ? `${theme.colors.background}e0` : 'transparent', backdropFilter: isScrolled ? 'blur(12px)' : 'none', WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none', borderBottom: `1px solid ${isScrolled ? theme.colors.border + '40' : 'transparent'}` }}
            >
                <div className="px-4 py-3 flex flex-wrap items-center gap-4">
                    {/* New Project primary button */}
                    <button
                        onClick={() => onNavigate('new-lead')}
                        className="flex items-center gap-2 px-5 h-11 rounded-full font-semibold text-sm tracking-wide shadow-sm active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-all"
                        style={{
                            background: gradientAccent,
                            color: '#fff',
                            boxShadow: `0 4px 16px ${theme.colors.shadow}`,
                            border: `1px solid ${theme.colors.accent}aa`
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = accentHover)}
                        onMouseLeave={e => (e.currentTarget.style.background = gradientAccent)}
                        aria-label="Create New Project"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Project</span>
                    </button>

                    {/* Segmented navigation */}
                    <SegmentedTabs theme={theme} active={topTab} onChange={handleTopTabChange} />
                </div>
            </div>

            <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 space-y-4 pt-2 pb-4 max-w-6xl mx-auto">
                    <div className="p-6 rounded-[2.5rem] shadow-sm border relative" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                        <div className="flex justify-between items-start mb-3 relative">
                            <h3 className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>Progress to Goal</h3>
                            <div className="relative" ref={trendRef}>
                                <div className="flex items-center space-x-1 px-3 py-1 rounded-full cursor-pointer select-none" onClick={() => setShowTrendInfo(s => !s)} style={{ backgroundColor: theme.colors.subtle, color: theme.colors.accent }}>
                                    <ArrowUp className="w-3 h-3" />
                                    <span className="text-xs font-bold">{deltaLabel}</span>
                                </div>
                                {showTrendInfo && (
                                    <div className="absolute top-full right-0 mt-2 w-56 z-20 p-3 rounded-xl text-[11px] shadow-lg" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}>
                                        <p className="font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>{deltaVsLinear >= 0 ? 'Ahead of pace' : 'Behind pace'} {deltaLabel}</p>
                                        <p style={{ color: theme.colors.textSecondary, lineHeight: '1.25rem' }}>Goal: {percentToGoal.toFixed(1)}%<br />Year: {yearProgressPercent.toFixed(1)}%</p>
                                        <button onClick={() => setShowTrendInfo(false)} className="mt-1 text-[10px] font-semibold underline" style={{ color: theme.colors.accent }}>Close</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-end gap-3 mb-3">
                            <p className="text-5xl leading-none font-bold" style={{ color: theme.colors.accent }}>{percentToGoal.toFixed(1)}%</p>
                        </div>
                        <div className="relative w-full h-6 rounded-full mb-2" style={{ backgroundColor: theme.colors.border }}>
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentToGoal}%`, backgroundColor: theme.colors.accent }} />
                            {(() => {
                                const currentMillions = (totalBookings/1000000).toFixed(1);
                                const goalMillions = (goal/1000000).toFixed(1);
                                const safePct = Math.max(percentToGoal, 5);
                                return (
                                    <>
                                        <span className="absolute top-1/2 -translate-y-1/2 font-bold text-[10px] px-1" style={{ left: `${safePct}%`, transform: 'translate(-100%, -50%)', color: '#fff', whiteSpace: 'nowrap' }}>${currentMillions}M</span>
                                        <span className="absolute top-1/2 -translate-y-1/2 right-1 font-medium text-[10px]" style={{ color: theme.colors.textSecondary }}>${goalMillions}M</span>
                                    </>
                                );
                            })()}
                        </div>
                        <p className="text-[11px] font-medium" style={{ color: theme.colors.textSecondary }}>Year elapsed: {yearProgressPercent.toFixed(1)}%</p>
                    </div>

                    <div className="p-6 rounded-[2.5rem] shadow-sm border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                        {selectedMonth ? (
                            <CustomerMonthlyBreakdown monthData={selectedMonth} orders={ORDER_DATA} theme={theme} onBack={handleBackToMonthly} />
                        ) : (
                            <>
                                <div className="flex justify-between items-start gap-4 flex-wrap">
                                    <div className="flex flex-col">
                                        <div className="flex items-center bg-transparent rounded-full border overflow-hidden" style={{ borderColor: theme.colors.border }}>
                                            <button onClick={() => setChartDataType('bookings')} className="px-4 py-2 text-sm font-semibold transition-colors" style={{ backgroundColor: chartDataType === 'bookings' ? theme.colors.accent : 'transparent', color: chartDataType === 'bookings' ? '#fff' : theme.colors.textSecondary }}>Bookings</button>
                                            <button onClick={() => setChartDataType('sales')} className="px-4 py-2 text-sm font-semibold transition-colors" style={{ backgroundColor: chartDataType === 'sales' ? theme.colors.accent : 'transparent', color: chartDataType === 'sales' ? '#fff' : theme.colors.textSecondary }}>Sales</button>
                                        </div>
                                        <p className="text-base font-semibold mt-3" style={{ color: theme.colors.textSecondary }}>${(chartDataType === 'bookings' ? totalBookings : totalSales).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <button onClick={() => setMonthlyView(v => v === 'chart' ? 'table' : 'chart')} className="p-3 rounded-full shadow-sm transition-colors active:scale-95" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }} aria-label={monthlyView === 'chart' ? 'Show table view' : 'Show chart view'}>
                                            {monthlyView === 'chart' ? (<Table className="w-5 h-5" />) : (<BarChart className="w-5 h-5" />)}
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    {monthlyView === 'chart' ? (
                                        <MonthlyBarChart data={MONTHLY_SALES_DATA} theme={theme} onMonthSelect={handleMonthSelect} dataType={chartDataType} />
                                    ) : (
                                        <MonthlyTable data={MONTHLY_SALES_DATA} theme={theme} onMonthSelect={handleMonthSelect} />
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div className="p-6 rounded-[2.5rem] shadow-sm border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                            <h3 className="font-bold text-xl mb-4" style={{ color: theme.colors.textPrimary }}>Sales by Vertical</h3>
                            <DonutChart data={salesByVertical} theme={theme} />
                        </div>
                        <div className="p-6 rounded-[2.5rem] shadow-sm border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                            <h3 className="font-bold text-xl mb-5" style={{ color: theme.colors.textPrimary }}>Recent Orders</h3>
                            <div className="rounded-3xl border overflow-hidden" style={{ borderColor: theme.colors.border }}>
                                {displayedRecentOrders.map((order, index) => (
                                    <div key={order.orderNumber} className={`p-4 transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 ${index < displayedRecentOrders.length - 1 ? 'border-b' : ''}`} style={{ borderColor: theme.colors.subtle }} onClick={() => handleShowOrderDetails(order)}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm" style={{ color: theme.colors.textSecondary }}>{new Date(order.date).toLocaleDateString()}</span>
                                            <span className="text-lg font-bold" style={{ color: theme.colors.accent }}>${order.net.toLocaleString()}</span>
                                        </div>
                                        <p className="font-semibold mb-2 truncate" style={{ color: theme.colors.textPrimary }}>{formatCompanyName(order.company)}</p>
                                        <div>
                                            <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: (STATUS_COLORS[order.status] || theme.colors.secondary) + '20', color: STATUS_COLORS[order.status] || theme.colors.secondary }}>{order.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {numRecentOrders < allRecentOrders.length && <div ref={loadMoreRef} className="h-1" />}
                        </div>
                    </div>
                </div>
            </div>
            <OrderModal order={selectedOrder} onClose={handleCloseModal} theme={theme} />
        </div>
    );
};
