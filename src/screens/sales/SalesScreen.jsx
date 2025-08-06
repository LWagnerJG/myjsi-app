import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { ArrowUp, Plus, ArrowLeft, TrendingUp, Award, DollarSign, BarChart } from 'lucide-react';
import * as Data from '../../data';

const formatMillion = (num) => `${(num / 1000000).toFixed(1)}M`;
const formatCompanyName = (name) => name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
const monthNameToNumber = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
};

const MonthlyBarChart = ({ data, theme, onMonthSelect, dataType = 'bookings' }) => {
    const maxValue = Math.max(...data.map(d => dataType === 'bookings' ? d.bookings : d.sales));
    return (
        <div className="space-y-4">
            {data.map((item, index) => {
                const value = dataType === 'bookings' ? item.bookings : item.sales;
                return (
                    <div key={item.month} className="grid grid-cols-[3rem,1fr,auto] items-center gap-x-4 text-sm">
                        <span className="font-semibold" style={{ color: theme.colors.textSecondary }}>{item.month}</span>
                        <div className="h-3 rounded-full" style={{ backgroundColor: theme.colors.border }}>
                            <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                    width: `${((value || 0) / maxValue) * 100}%`,
                                    backgroundColor: theme.colors.accent
                                }}
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

const DonutChart = React.memo(({ data, theme }) => {
    const chartData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        const colors = [
            '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', theme.colors.primary, theme.colors.accent,
        ];
        return data.map((item, index) => ({
            label: item.vertical || item.label || `Vertical ${index + 1}`,
            value: item.value || item.sales || item.amount || 0,
            color: colors[index % colors.length]
        })).filter(item => item.value > 0);
    }, [data, theme]);

    const total = chartData.reduce((acc, item) => acc + item.value, 0);

    if (total === 0 || chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-40">
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>No sales data available</p>
            </div>
        );
    }

    let cumulative = 0;
    const size = 160;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
            <div className="relative mx-auto" style={{ width: size, height: size }}>
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
                        <div className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                            ${(total / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Total</div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col space-y-3">
                {chartData.map((item) => {
                    const percentage = ((item.value / total) * 100).toFixed(1);
                    return (
                        <div key={item.label} className="flex items-center space-x-3">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                            <div className="flex-1 flex justify-between items-center min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: theme.colors.textPrimary }}>
                                    {item.label}
                                </p>
                                <div className="text-right flex-shrink-0 ml-2">
                                    <p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
                                        ${item.value.toLocaleString()}
                                    </p>
                                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                        {percentage}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
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
        return orders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate.getMonth() === monthNumber;
        });
    }, [monthData, orders]);
    const customerData = useMemo(() => {
        const customers = {};
        monthlyOrders.forEach(order => {
            if (!customers[order.company]) {
                customers[order.company] = { bookings: 0, sales: 0, company: order.company };
            }
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
                        <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{
                            backgroundColor: (Data.STATUS_COLORS[order.status] || theme.colors.secondary) + '20',
                            color: Data.STATUS_COLORS[order.status] || theme.colors.secondary
                        }}>
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
    const { MONTHLY_SALES_DATA, ORDER_DATA, SALES_VERTICALS_DATA, STATUS_COLORS } = Data;
    const [monthlyView, setMonthlyView] = useState('chart');
    const [chartDataType, setChartDataType] = useState('bookings');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [numRecentOrders, setNumRecentOrders] = useState(5);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollContainerRef = useRef(null);
    const loadMoreRef = useRef(null);

    const handleScroll = useCallback(() => {
        if (scrollContainerRef.current) {
            setIsScrolled(scrollContainerRef.current.scrollTop > 10);
        }
    }, []);

    const { totalBookings, totalSales } = useMemo(() => {
        const bookings = MONTHLY_SALES_DATA.reduce((acc, m) => acc + m.bookings, 0);
        const sales = MONTHLY_SALES_DATA.reduce((acc, m) => acc + m.sales, 0);
        return { totalBookings: bookings, totalSales: sales };
    }, [MONTHLY_SALES_DATA]);

    const salesByVertical = useMemo(() => {
        if (SALES_VERTICALS_DATA && Array.isArray(SALES_VERTICALS_DATA) && SALES_VERTICALS_DATA.length > 0) {
            return SALES_VERTICALS_DATA;
        }
        const verticalSales = {};
        ORDER_DATA.forEach(order => {
            if (order.vertical && order.net) {
                verticalSales[order.vertical] = (verticalSales[order.vertical] || 0) + order.net;
            }
        });
        return Object.entries(verticalSales)
            .map(([vertical, value]) => ({ vertical, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
    }, [SALES_VERTICALS_DATA, ORDER_DATA]);

    const allRecentOrders = useMemo(() => {
        return ORDER_DATA
            .filter(o => o.date && o.net)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [ORDER_DATA]);

    const displayedRecentOrders = useMemo(() => {
        return allRecentOrders.slice(0, numRecentOrders);
    }, [allRecentOrders, numRecentOrders]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && numRecentOrders < allRecentOrders.length) {
                    setNumRecentOrders(prev => prev + 5);
                }
            },
            { threshold: 1.0 }
        );

        const currentRef = loadMoreRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [loadMoreRef, numRecentOrders, allRecentOrders.length]);

    const goal = 7000000;
    const percentToGoal = useMemo(() => (totalBookings / goal) * 100, [totalBookings, goal]);
    const handleShowOrderDetails = useCallback(order => setSelectedOrder(order), []);
    const handleCloseModal = useCallback(() => setSelectedOrder(null), []);
    const handleMonthSelect = useCallback(month => setSelectedMonth(month), []);
    const handleBackToMonthly = useCallback(() => setSelectedMonth(null), []);

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
                <div className="px-4 py-3">
                    <div className="flex justify-between items-center w-full gap-2">
                        <button
                            onClick={() => onNavigate('new-lead')}
                            className="flex-shrink-0 flex items-center space-x-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                            style={{
                                backgroundColor: theme.colors.accent,
                                color: 'white'
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Lead</span>
                        </button>
                        <div className="flex-shrink min-w-0 flex items-center rounded-full border p-1" style={{
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border
                        }}>
                            <button
                                onClick={() => onNavigate('incentive-rewards')}
                                className="text-xs px-2 py-1.5 rounded-full transition-all flex items-center space-x-1 whitespace-nowrap hover:bg-black/5"
                                style={{ color: theme.colors.textSecondary }}
                            >
                                <Award className="w-3.5 h-3.5" />
                                <span className="font-medium">Rewards</span>
                            </button>
                            <button
                                onClick={() => onNavigate('customer-rank')}
                                className="text-xs px-2 py-1.5 rounded-full transition-all flex items-center space-x-1 whitespace-nowrap hover:bg-black/5"
                                style={{ color: theme.colors.textSecondary }}
                            >
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span className="font-medium">Ranking</span>
                            </button>
                            <button
                                onClick={() => onNavigate('commissions')}
                                className="text-xs px-2 py-1.5 rounded-full transition-all flex items-center space-x-1 whitespace-nowrap hover:bg-black/5"
                                style={{ color: theme.colors.textSecondary }}
                            >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span className="font-medium">Comms</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto scrollbar-hide"
            >
                <div className="px-4 space-y-4 pt-2 pb-4 max-w-6xl mx-auto">
                    <div className="p-6 rounded-[2.5rem] shadow-sm border" style={{
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border
                    }}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>Progress to Goal</h3>
                            <div className="flex items-center space-x-1 px-3 py-1 rounded-full" style={{
                                backgroundColor: theme.colors.accent + '20',
                                color: theme.colors.accent
                            }}>
                                <ArrowUp className="w-3 h-3" />
                                <span className="text-xs font-bold">+3.1%</span>
                            </div>
                        </div>
                        <p className="text-5xl font-bold mb-2" style={{ color: theme.colors.accent }}>
                            {percentToGoal.toFixed(1)}%
                        </p>
                        <p className="text-sm font-semibold mb-4" style={{ color: theme.colors.textPrimary }}>
                            ${formatMillion(totalBookings)} of ${formatMillion(goal)}
                        </p>
                        <div className="relative w-full h-3 rounded-full" style={{ backgroundColor: theme.colors.border }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${percentToGoal}%`, backgroundColor: theme.colors.accent }}
                            />
                        </div>
                    </div>
                    <div className="p-6 rounded-[2.5rem] shadow-sm border" style={{
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border
                    }}>
                        {selectedMonth ? (
                            <CustomerMonthlyBreakdown
                                monthData={selectedMonth}
                                orders={ORDER_DATA}
                                theme={theme}
                                onBack={handleBackToMonthly}
                            />
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
                                        <div className="flex items-center rounded-full border p-1" style={{
                                            backgroundColor: theme.colors.subtle,
                                            borderColor: theme.colors.border
                                        }}>
                                            <button
                                                onClick={() => setMonthlyView('chart')}
                                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5`}
                                                style={{
                                                    backgroundColor: monthlyView === 'chart' ? theme.colors.accent : 'transparent',
                                                    color: monthlyView === 'chart' ? 'white' : theme.colors.textSecondary
                                                }}
                                            >
                                                <BarChart className="w-3.5 h-3.5" />
                                                <span>Chart</span>
                                            </button>
                                            <button
                                                onClick={() => setMonthlyView('table')}
                                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5`}
                                                style={{
                                                    backgroundColor: monthlyView === 'table' ? theme.colors.accent : 'transparent',
                                                    color: monthlyView === 'table' ? 'white' : theme.colors.textSecondary
                                                }}
                                            >
                                                Table
                                            </button>
                                        </div>
                                        {monthlyView === 'chart' && (
                                            <div className="flex items-center rounded-full border p-1" style={{
                                                backgroundColor: theme.colors.subtle,
                                                borderColor: theme.colors.border
                                            }}>
                                                <button
                                                    onClick={() => setChartDataType('bookings')}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all`}
                                                    style={{
                                                        backgroundColor: chartDataType === 'bookings' ? theme.colors.accent : 'transparent',
                                                        color: chartDataType === 'bookings' ? 'white' : theme.colors.textSecondary
                                                    }}
                                                >
                                                    Bookings
                                                </button>
                                                <button
                                                    onClick={() => setChartDataType('sales')}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all`}
                                                    style={{
                                                        backgroundColor: chartDataType === 'sales' ? theme.colors.accent : 'transparent',
                                                        color: chartDataType === 'sales' ? 'white' : theme.colors.textSecondary
                                                    }}
                                                >
                                                    Sales
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    {monthlyView === 'chart' ? (
                                        <MonthlyBarChart
                                            data={MONTHLY_SALES_DATA}
                                            theme={theme}
                                            onMonthSelect={handleMonthSelect}
                                            dataType={chartDataType}
                                        />
                                    ) : (
                                        <MonthlyTable
                                            data={MONTHLY_SALES_DATA}
                                            theme={theme}
                                            onMonthSelect={handleMonthSelect}
                                        />
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div className="p-6 rounded-[2.5rem] shadow-sm border" style={{
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border
                        }}>
                            <h3 className="font-bold text-xl mb-4" style={{ color: theme.colors.textPrimary }}>Sales by Vertical</h3>
                            <DonutChart data={salesByVertical} theme={theme} />
                        </div>
                        <div className="p-6 rounded-[2.5rem] shadow-sm border" style={{
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border
                        }}>
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
                                            <span className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                                {new Date(order.date).toLocaleDateString()}
                                            </span>
                                            <span className="text-lg font-bold" style={{ color: theme.colors.accent }}>
                                                ${order.net.toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="font-semibold mb-2 truncate" style={{ color: theme.colors.textPrimary }}>
                                            {formatCompanyName(order.company)}
                                        </p>
                                        <div>
                                            <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                                                backgroundColor: (STATUS_COLORS[order.status] || theme.colors.secondary) + '20',
                                                color: STATUS_COLORS[order.status] || theme.colors.secondary
                                            }}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {numRecentOrders < allRecentOrders.length && (
                                <div ref={loadMoreRef} className="h-1" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <OrderModal order={selectedOrder} onClose={handleCloseModal} theme={theme} />
        </div>
    );
};