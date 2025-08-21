import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { ArrowUp, Plus, ArrowLeft, TrendingUp, Award, DollarSign, BarChart, Info } from 'lucide-react';
import { MONTHLY_SALES_DATA, SALES_VERTICALS_DATA } from './data.js';
import { ORDER_DATA, STATUS_COLORS } from '../orders/data.js';

const formatMillion = (num) => `${(num / 1000000).toFixed(1)}M`;
const formatCompanyName = (name) => name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
const monthNameToNumber = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

const TopTabs = ({ theme, active, onChange }) => {
    const tabs = useMemo(() => [
        { key: 'rewards', label: 'Rewards', Icon: Award },
        { key: 'ranking', label: 'Ranking', Icon: TrendingUp },
        { key: 'comms', label: 'Comms', Icon: DollarSign },
    ], []);
    const wrapRef = useRef(null);
    const btnRefs = useRef([]);
    const [u, setU] = useState({ left: 0, width: 0, opacity: 0 });

    const recalc = useCallback(() => {
        const i = tabs.findIndex(t => t.key === active);
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
    }, [active, tabs]);

    useEffect(() => { recalc(); }, [recalc]);
    useEffect(() => { const onR = () => recalc(); window.addEventListener('resize', onR); return () => window.removeEventListener('resize', onR); }, [recalc]);

    return (
        <div
            ref={wrapRef}
            className="relative flex items-center gap-3 px-0 pt-1 pb-1 flex-wrap"
            style={{ maxWidth: '100%' }}
        >
            <div className="absolute left-0 right-0 bottom-0 h-px" style={{ background: theme.colors.border }} />
            <div
                className="absolute bottom-0 h-[2px] rounded transition-[transform,width,opacity] duration-300"
                style={{ background: theme.colors.accent, transform: `translateX(${u.left}px)`, width: u.width, opacity: u.opacity }}
            />
            {tabs.map((t, i) => {
                const selected = active === t.key;
                return (
                    <button
                        key={t.key}
                        ref={el => (btnRefs.current[i] = el)}
                        onClick={() => onChange(t.key)}
                        className="flex items-center gap-1 pb-1 text-xs sm:text-sm font-semibold shrink-0"
                        style={{ color: selected ? theme.colors.accent : theme.colors.textSecondary }}
                    >
                        <t.Icon className="w-3.5 h-3.5" style={{ color: selected ? theme.colors.accent : theme.colors.textSecondary }} />
                        {t.label}
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
                return (
                    <div key={item.month} className="grid grid-cols-[3rem,1fr,auto] items-center gap-x-4 text-sm">
                        <span className="font-semibold" style={{ color: theme.colors.textSecondary }}>{item.month}</span>
                        <div className="h-3 rounded-full" style={{ backgroundColor: theme.colors.border }}>
                            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${((value || 0) / maxValue) * 100}%`, backgroundColor: theme.colors.accent }} />
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

const DonutChart = React.memo(({ data, theme }) => {
    const chartData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280', '#9CA3AF'];
        return data.map((item, index) => ({
            label: item.vertical || item.label || `Vertical ${index + 1}`,
            value: item.value || item.sales || item.amount || 0,
            color: colors[index % colors.length]
        })).filter(item => item.value > 0);
    }, [data]);

    const total = chartData.reduce((acc, item) => acc + item.value, 0);
    if (total === 0 || chartData.length === 0) {
        return <div className="flex items-center justify-center h-40"><p className="text-sm" style={{ color: theme.colors.textSecondary }}>No sales data available</p></div>;
    }

    let cumulative = 0;
    const size = 160;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                        {chartData.map((item, index) => {
                            const dasharray = (circumference * item.value) / total;
                            const dashoffset = circumference * (1 - (cumulative / total));
                            cumulative += item.value;
                            return (
                                <circle
                                    key={index}
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    fill="none"
                                    stroke={item.color}
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={`${dasharray} ${circumference}`}
                                    strokeDashoffset={-circumference + dashoffset}
                                    className="transition-all duration-500"
                                    strokeLinecap="round"
                                />
                            );
                        })}
                    </g>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>${(total / 1000000).toFixed(1)}M</div>
                        <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Total</div>
                    </div>
                </div>
            </div>
            <div className="w-full flex-1 min-w-0">
                <div className="flex flex-col space-y-3">
                    {chartData.map((item) => {
                        const percentage = ((item.value / total) * 100).toFixed(1);
                        return (
                            <div key={item.label} className="flex items-center space-x-3">
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                <div className="flex-1 flex justify-between items-center min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: theme.colors.textPrimary }}>{item.label}</p>
                                    <div className="text-right flex-shrink-0 ml-4">
                                        <p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>${item.value.toLocaleString()}</p>
                                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{percentage}%</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

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
    const trendRef = useRef(null); // ref for delta chip + tooltip

    useEffect(() => {
        if (!showTrendInfo) return; // only bind when open
        const handleClickOutside = (e) => {
            if (trendRef.current && !trendRef.current.contains(e.target)) {
                setShowTrendInfo(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showTrendInfo]);

    const handleScroll = useCallback(() => {
        if (scrollContainerRef.current) setIsScrolled(scrollContainerRef.current.scrollTop > 10);
    }, []);

    const { totalBookings, totalSales } = useMemo(() => {
        const bookings = MONTHLY_SALES_DATA.reduce((acc, m) => acc + m.bookings, 0);
        const sales = MONTHLY_SALES_DATA.reduce((acc, m) => acc + m.sales, 0);
        return { totalBookings: bookings, totalSales: sales };
    }, []);

    // Year progress calculations
    const { yearProgressPercent, deltaVsLinear, deltaLabel } = useMemo(() => {
        const now = new Date();
        const startYear = new Date(now.getFullYear(), 0, 1);
        const startNext = new Date(now.getFullYear() + 1, 0, 1);
        const totalDays = (startNext - startYear) / 86400000;
        const dayOfYear = Math.floor((now - startYear) / 86400000) + 1;
        const yearPct = (dayOfYear / totalDays) * 100;
        const goalPct = MONTHLY_SALES_DATA.reduce((acc, m) => acc + m.bookings, 0) / 7000000 * 100; // uses goal below
        const delta = goalPct - yearPct; // positive = ahead
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
        const io = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && numRecentOrders < allRecentOrders.length) setNumRecentOrders(p => p + 5);
        }, { threshold: 1 });
        const node = loadMoreRef.current;
        if (node) io.observe(node);
        return () => node && io.unobserve(node);
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

    // Toggle options
    const viewToggleOptions = [
        { key: 'chart', label: 'Chart', icon: BarChart },
        { key: 'table', label: 'Table' }
    ];

    const dataToggleOptions = [
        { key: 'bookings', label: 'Bookings' },
        { key: 'sales', label: 'Sales' }
    ];

    return (
        <div className="flex flex-col h-full">
            <div
                className={`sticky top-0 z-10 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}
                style={{
                    backgroundColor: isScrolled ? `${theme.colors.background}e0` : 'transparent',
                    backdropFilter: isScrolled ? 'blur(12px)' : 'none',
                    WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
                    borderBottom: `1px solid ${isScrolled ? theme.colors.border + '40' : 'transparent'}`
                }}
            >
                <div className="px-4 py-2 flex items-center gap-4 flex-wrap">
                    <button
                        onClick={() => onNavigate('new-lead')}
                        className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
                        style={{ backgroundColor: theme.colors.accent, color: '#fff' }}
                    >
                        <Plus className="w-4 h-4" />
                        New Lead
                    </button>
                    <TopTabs theme={theme} active={topTab} onChange={handleTopTabChange} />
                </div>
            </div>

            <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 space-y-4 pt-2 pb-4 max-w-6xl mx-auto">
                    <div className="p-6 rounded-[2.5rem] shadow-sm border relative" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                        <div className="flex justify-between items-start mb-3 relative">
                            <h3 className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>Progress to Goal</h3>
                            <div className="relative" ref={trendRef}>
                                <div className="flex items-center space-x-1 px-3 py-1 rounded-full cursor-pointer select-none" onClick={() => setShowTrendInfo(s => !s)} style={{ backgroundColor: theme.colors.accent + '20', color: theme.colors.accent }}>
                                    <ArrowUp className="w-3 h-3" />
                                    <span className="text-xs font-bold">{deltaLabel}</span>
                                </div>
                                {showTrendInfo && (
                                    <div className="absolute top-full right-0 mt-2 w-56 z-20 p-3 rounded-xl text-[11px] shadow-lg" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}>
                                        <p className="font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>{deltaVsLinear >= 0 ? 'Ahead of pace' : 'Behind pace'} {deltaLabel}</p>
                                        <p style={{ color: theme.colors.textSecondary, lineHeight: '1.25rem' }}>
                                            Goal: {percentToGoal.toFixed(1)}%<br />
                                            Year: {yearProgressPercent.toFixed(1)}%
                                        </p>
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
                                // position label just inside filled bar (shift left by its own width using translate)
                                const safePct = Math.max(percentToGoal, 5); // ensure room
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
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>
                                            {chartDataType === 'bookings' ? 'Bookings' : 'Sales'}
                                        </h3>
                                        <p className="text-base font-semibold mt-1" style={{ color: theme.colors.textSecondary }}>
                                            ${(chartDataType === 'bookings' ? totalBookings : totalSales).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <ToggleGroup 
                                            theme={theme}
                                            options={viewToggleOptions}
                                            value={monthlyView}
                                            onChange={setMonthlyView}
                                        />
                                        {monthlyView === 'chart' && (
                                            <ToggleGroup 
                                                theme={theme}
                                                options={dataToggleOptions}
                                                value={chartDataType}
                                                onChange={setChartDataType}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4">
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
                                    <div
                                        key={order.orderNumber}
                                        className={`p-4 transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 ${index < displayedRecentOrders.length - 1 ? 'border-b' : ''}`}
                                        style={{ borderColor: theme.colors.subtle }}
                                        onClick={() => handleShowOrderDetails(order)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm" style={{ color: theme.colors.textSecondary }}>{new Date(order.date).toLocaleDateString()}</span>
                                            <span className="text-lg font-bold" style={{ color: theme.colors.accent }}>${order.net.toLocaleString()}</span>
                                        </div>
                                        <p className="font-semibold mb-2 truncate" style={{ color: theme.colors.textPrimary }}>{formatCompanyName(order.company)}</p>
                                        <div>
                                            <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: (STATUS_COLORS[order.status] || theme.colors.secondary) + '20', color: STATUS_COLORS[order.status] || theme.colors.secondary }}>
                                                {order.status}
                                            </span>
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
