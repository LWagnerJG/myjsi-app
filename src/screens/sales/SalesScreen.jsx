import React, { useMemo, useState, useCallback } from 'react';
import { Modal } from '../../components/common/Modal';
import { ArrowUp, Plus, ArrowLeft, TrendingUp, Award, DollarSign, BarChart } from 'lucide-react';
import * as Data from '../../data';

// Helper Components & Functions
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
            theme.colors.primary,
            theme.colors.accent,
            theme.colors.secondary,
            '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
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
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    No sales data available
                </p>
            </div>
        );
    }
    let cumulative = 0;
    const size = 160;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    return (
        <div className="flex items-center justify-center space-x-8">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={theme.colors.subtle}
                        strokeWidth={strokeWidth}
                    />
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
                        <div className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
                            ${(total / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                            Total
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3 max-w-xs">
                {chartData.map((item, index) => {
                    const percentage = ((item.value / total) * 100).toFixed(1);
                    return (
                        <div key={item.label} className="flex items-center space-x-3">
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: item.color }}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate" style={{ color: theme.colors.textPrimary }}>
                                    {item.label}
                                </p>
                                <div className="flex items-center space-x-2">
                                    <p className="text-sm" style={{ color: theme.colors.accent }}>
                                        ${item.value.toLocaleString()}
                                    </p>
                                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                        ({percentage}%)
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
const MonthlyTable = ({ data, theme, totalBookings, totalSales, onMonthSelect }) => (
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
        <div className="grid grid-cols-3 font-bold pt-2">
            <div className="p-2">Total</div>
            <div className="p-2 text-right">${totalBookings.toLocaleString()}</div>
            <div className="p-2 text-right">${totalSales.toLocaleString()}</div>
        </div>
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
// Main Screen Component
export const SalesScreen = ({ theme, onNavigate }) => {
    const { MONTHLY_SALES_DATA, ORDER_DATA, SALES_VERTICALS_DATA, STATUS_COLORS } = Data;
    const [monthlyView, setMonthlyView] = useState('chart');
    const [chartDataType, setChartDataType] = useState('bookings');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [numRecentOrders, setNumRecentOrders] = useState(3);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollContainerRef = React.useRef(null);

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
    const handleShowMoreOrders = useCallback(() => {
        setNumRecentOrders(8);
    }, []);
    const goal = 7000000;
    const percentToGoal = useMemo(() => (totalBookings / goal) * 100, [totalBookings, goal]);
    const handleShowOrderDetails = useCallback(order => setSelectedOrder(order), []);
    const handleCloseModal = useCallback(() => setSelectedOrder(null), []);
    const handleMonthSelect = useCallback(month => setSelectedMonth(month), []);
    const handleBackToMonthly = useCallback(() => setSelectedMonth(null), []);
    return (
        <div className="flex flex-col h-full">
            {/* Header with adjusted sizes for mobile */}
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
                        {/* Adjusted secondary buttons with more roundedness */}
                        <div className="flex items-center rounded-3xl border p-1" style={{
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border
                        }}>
                            <button
                                onClick={() => onNavigate('incentive-rewards')}
                                className="text-xs px-2 py-1 rounded-2xl transition-all flex items-center space-x-1 hover:bg-black/5"
                                style={{ color: theme.colors.textSecondary }}
                            >
                                <Award className="w-3 h-3" />
                                <span className="font-medium">Rewards</span>
                            </button>
                            <button
                                onClick={() => onNavigate('customer-rank')}
                                className="text-xs px-2 py-1 rounded-2xl transition-all flex items-center space-x-1 hover:bg-black/5"
                                style={{ color: theme.colors.textSecondary }}
                            >
                                <TrendingUp className="w-3 h-3" />
                                <span className="font-medium">Rankings</span>
                            </button>
                            <button
                                onClick={() => onNavigate('commissions')}
                                className="text-xs px-2 py-1 rounded-2xl transition-all flex items-center space-x-1 hover:bg-black/5"
                                style={{ color: theme.colors.textSecondary }}
                            >
                                <DollarSign className="w-3 h-3" />
                                <span className="font-medium">Commissions</span>
                            </button>
                        </div>
                        {/* Adjusted New Lead button with more roundedness and right-aligned margin */}
                        <button
                            onClick={() => onNavigate('new-lead')}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-3xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 flex-shrink-0 ml-auto"
                            style={{
                                backgroundColor: theme.colors.accent,
                                color: 'white'
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Lead</span>
                        </button>
                    </div>
                </div>
            </div>
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto scrollbar-hide pt-2"
            >
                <div className="px-4 space-y-4 py-4 max-w-6xl mx-auto">
                    {/* Progress to Goal with more roundedness */}
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
                    {/* Monthly Performance with cleaner, more rounded toggles */}
                    <div className="p-4 rounded-[2.5rem] shadow-sm border" style={{
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
                                {/* Cleaned up, more rounded toggle controls with swapped positions */}
                                <div className="flex flex-wrap items-center justify-between mb-4 space-x-2 gap-y-2">
                                    {/* Data type toggle - more rounded, only for chart */}
                                    {monthlyView === 'chart' && (
                                        <div className="flex items-center rounded-3xl border p-1" style={{
                                            backgroundColor: theme.colors.subtle,
                                            borderColor: theme.colors.border
                                        }}>
                                            <button
                                                onClick={() => setChartDataType('bookings')}
                                                className={`px-3 py-1 rounded-2xl text-xs font-medium transition-all`}
                                                style={{
                                                    backgroundColor: chartDataType === 'bookings' ? theme.colors.accent : 'transparent',
                                                    color: chartDataType === 'bookings' ? 'white' : theme.colors.textSecondary
                                                }}
                                            >
                                                Bookings
                                            </button>
                                            <button
                                                onClick={() => setChartDataType('sales')}
                                                className={`px-3 py-1 rounded-2xl text-xs font-medium transition-all`}
                                                style={{
                                                    backgroundColor: chartDataType === 'sales' ? theme.colors.accent : 'transparent',
                                                    color: chartDataType === 'sales' ? 'white' : theme.colors.textSecondary
                                                }}
                                            >
                                                Sales
                                            </button>
                                        </div>
                                    )}
                                    {/* View toggle - more rounded */}
                                    <div className="flex items-center rounded-3xl border p-1" style={{
                                        backgroundColor: theme.colors.subtle,
                                        borderColor: theme.colors.border
                                    }}>
                                        <button
                                            onClick={() => setMonthlyView('chart')}
                                            className={`px-3 py-1 rounded-2xl text-xs font-medium transition-all flex items-center space-x-1`}
                                            style={{
                                                backgroundColor: monthlyView === 'chart' ? theme.colors.accent : 'transparent',
                                                color: monthlyView === 'chart' ? 'white' : theme.colors.textSecondary
                                            }}
                                        >
                                            <BarChart className="w-3 h-3" />
                                            <span>Chart</span>
                                        </button>
                                        <button
                                            onClick={() => setMonthlyView('table')}
                                            className={`px-3 py-1 rounded-2xl text-xs font-medium transition-all`}
                                            style={{
                                                backgroundColor: monthlyView === 'table' ? theme.colors.accent : 'transparent',
                                                color: monthlyView === 'table' ? 'white' : theme.colors.textSecondary
                                            }}
                                        >
                                            Table
                                        </button>
                                    </div>
                                </div>
                                {monthlyView === 'chart' ? (
                                    <div className="space-y-3">
                                        <div className="mb-2">
                                            <h3 className="font-bold text-xl mb-1" style={{ color: theme.colors.textPrimary }}>
                                                {chartDataType === 'bookings' ? 'Bookings' : 'Sales'}
                                            </h3>
                                            <p className="text-2xl font-bold" style={{ color: theme.colors.accent }}>
                                                ${(chartDataType === 'bookings' ? totalBookings : totalSales).toLocaleString()}
                                            </p>
                                        </div>
                                        <MonthlyBarChart
                                            data={MONTHLY_SALES_DATA}
                                            theme={theme}
                                            onMonthSelect={handleMonthSelect}
                                            dataType={chartDataType}
                                        />
                                    </div>
                                ) : (
                                    <MonthlyTable
                                        data={MONTHLY_SALES_DATA}
                                        theme={theme}
                                        totalBookings={totalBookings}
                                        totalSales={totalSales}
                                        onMonthSelect={handleMonthSelect}
                                    />
                                )}
                            </>
                        )}
                    </div>
                    {/* Two-column layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Recent Orders */}
                        <div className="p-6 rounded-[2.5rem] shadow-sm border" style={{
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border
                        }}>
                            <h3 className="font-bold text-xl mb-5" style={{ color: theme.colors.textPrimary }}>Recent Orders</h3>
                            <div className="space-y-2">
                                {displayedRecentOrders.map(order => (
                                    <div key={order.orderNumber} className="flex items-center justify-between p-3 rounded-3xl transition-all cursor-pointer hover:shadow-sm border"
                                        style={{ borderColor: theme.colors.border + '80', backgroundColor: theme.colors.background }}
                                        onClick={() => handleShowOrderDetails(order)}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                                    {new Date(order.date).toLocaleDateString()}
                                                </span>
                                                <span className="text-lg font-bold" style={{ color: theme.colors.accent }}>
                                                    ${order.net.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="font-semibold mb-1 truncate" style={{ color: theme.colors.textPrimary }}>
                                                {formatCompanyName(order.company)}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                                                    backgroundColor: (STATUS_COLORS[order.status] || theme.colors.secondary) + '20',
                                                    color: STATUS_COLORS[order.status] || theme.colors.secondary
                                                }}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {numRecentOrders < allRecentOrders.length && (
                                <button
                                    onClick={handleShowMoreOrders}
                                    className="w-full mt-4 py-3 rounded-3xl text-sm font-semibold transition-all duration-200 border hover:shadow-sm"
                                    style={{
                                        color: theme.colors.textPrimary,
                                        backgroundColor: theme.colors.subtle,
                                        borderColor: theme.colors.border
                                    }}
                                >
                                    Show More Orders
                                </button>
                            )}
                        </div>
                        {/* Sales by Vertical */}
                        <div className="p-6 rounded-[2.5rem] shadow-sm border" style={{
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border
                        }}>
                            <h3 className="font-bold text-xl mb-4" style={{ color: theme.colors.textPrimary }}>Sales by Vertical</h3>
                            <DonutChart data={salesByVertical} theme={theme} />
                        </div>
                    </div>
                </div>
            </div>
            <OrderModal order={selectedOrder} onClose={handleCloseModal} theme={theme} />
        </div>
    );
};