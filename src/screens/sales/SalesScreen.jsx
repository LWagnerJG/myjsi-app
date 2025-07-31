import React, { useMemo, useState, useCallback } from 'react';
import { PageTitle } from '../../components/common/PageTitle';
import { GlassCard } from '../../components/common/GlassCard';
import { ToggleButtonGroup } from '../../components/common/ToggleButtonGroup';
import { Modal } from '../../components/common/Modal';
import { ArrowUp, ArrowRight, Plus, ArrowLeft } from 'lucide-react';
import * as Data from '../../data';

// Helper Components & Functions
const formatMillion = (num) => `${(num / 1000000).toFixed(1)}M`;
const formatCompanyName = (name) => name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

const monthNameToNumber = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
};

const MonthlyBarChart = ({ data, theme, onMonthSelect }) => {
    const maxValue = Math.max(...data.map(d => d.bookings));
    return (
        <div className="space-y-4">
            {data.map((item, index) => (
                <div key={item.month} className="grid grid-cols-[3rem,1fr,auto] items-center gap-x-4 text-sm">
                    <span className="font-semibold" style={{ color: theme.colors.textSecondary }}>{item.month}</span>
                    <div className="h-2.5 rounded-full" style={{ backgroundColor: theme.colors.border }}>
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${((item.bookings || 0) / maxValue) * 100}%`,
                                backgroundColor: theme.colors.accent
                            }}
                        />
                    </div>
                    <button 
                        onClick={() => onMonthSelect(item)}
                        className="font-semibold text-right hover:underline" 
                        style={{ color: theme.colors.textPrimary }}
                    >
                        ${(item.bookings || 0).toLocaleString()}
                    </button>
                </div>
            ))}
        </div>
    );
};

const DonutChart = ({ data, theme }) => (
    <div className="h-60" style={{ backgroundColor: theme.colors.subtle }}>
        <p className="text-center p-4" style={{ color: theme.colors.textSecondary }}>Donut Chart</p>
    </div>
);

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
            // Assuming 'net' contributes to bookings. You might need to adjust this logic
            // based on your data definitions for 'bookings' vs 'sales'.
            customers[order.company].bookings += order.net;
            // Add sales logic if available in order data
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
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [numRecentOrders, setNumRecentOrders] = useState(3);
    const [selectedMonth, setSelectedMonth] = useState(null);

    const { totalBookings, totalSales } = useMemo(() => {
        const bookings = MONTHLY_SALES_DATA.reduce((acc, m) => acc + m.bookings, 0);
        const sales = MONTHLY_SALES_DATA.reduce((acc, m) => acc + m.sales, 0);
        return { totalBookings: bookings, totalSales: sales };
    }, [MONTHLY_SALES_DATA]);

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

    const CardHeader = ({ title, children }) => (
        <div className="flex justify-between items-center px-4 pt-4 pb-3 border-b" style={{ borderColor: theme.colors.border }}>
            <h3 className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>{title}</h3>
            {children}
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            <div className="sticky top-0 z-10 backdrop-blur-md" style={{ backgroundColor: `${theme.colors.background}e0` }}>
                <PageTitle title="Sales Dashboard" theme={theme}>
                    <button
                        onClick={() => onNavigate('new-lead')}
                        className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                        style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                    >
                        <span>New Lead</span>
                        <Plus className="w-4 h-4" />
                    </button>
                </PageTitle>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 space-y-4 py-4">
                    <GlassCard theme={theme} className="overflow-hidden">
                        <CardHeader title="Progress to Goal">
                            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.colors.accent + '1A', color: theme.colors.accent }}>
                                <ArrowUp className="w-3 h-3" />
                                <span className="text-xs font-bold">+3.1%</span>
                            </div>
                        </CardHeader>
                        <div className="p-4">
                            <p className="text-5xl font-bold" style={{ color: theme.colors.accent }}>
                                {percentToGoal.toFixed(1)}%
                            </p>
                            <p className="text-sm font-semibold mt-1 mb-3" style={{ color: theme.colors.textPrimary }}>
                                ${formatMillion(totalBookings)} of ${formatMillion(goal)}
                            </p>
                            <div className="relative w-full h-4 rounded-full" style={{ backgroundColor: theme.colors.border }}>
                                <div className="h-full rounded-full" style={{ width: `${percentToGoal}%`, backgroundColor: theme.colors.accent }}></div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard theme={theme} className="overflow-hidden">
                        <CardHeader title={selectedMonth ? `Customer Breakdown for ${selectedMonth.month}` : "Monthly Performance"} />
                        <div className="p-4">
                            {selectedMonth ? (
                                <CustomerMonthlyBreakdown 
                                    monthData={selectedMonth}
                                    orders={ORDER_DATA}
                                    theme={theme}
                                    onBack={handleBackToMonthly}
                                />
                            ) : (
                                <>
                                    <ToggleButtonGroup
                                        value={monthlyView}
                                        onChange={setMonthlyView}
                                        options={[{ label: 'Chart', value: 'chart' }, { label: 'Table', value: 'table' }]}
                                        theme={theme}
                                    />
                                    <div className="mt-4">
                                        {monthlyView === 'chart' ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>Sales Overview</p>
                                                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Last updated: {new Date().toLocaleDateString()}</p>
                                                </div>
                                                <MonthlyBarChart data={MONTHLY_SALES_DATA} theme={theme} onMonthSelect={handleMonthSelect} />
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <div className="font-semibold" style={{ color: theme.colors.textSecondary }}>Total Bookings</div>
                                                        <div className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>${totalBookings.toLocaleString()}</div>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold" style={{ color: theme.colors.textSecondary }}>Total Sales</div>
                                                        <div className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>${totalSales.toLocaleString()}</div>
                                                    </div>
                                                </div>
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
                                    </div>
                                </>
                            )}
                        </div>
                    </GlassCard>

                    <GlassCard theme={theme} className="overflow-hidden">
                        <CardHeader title="Recent Orders" />
                        <div className="p-4">
                            <div className="space-y-2">
                                {displayedRecentOrders.map(order => (
                                    <div key={order.orderNumber} className="p-3 rounded-lg transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5" onClick={() => handleShowOrderDetails(order)}>
                                        <div className="flex justify-between text-sm" style={{ color: theme.colors.textSecondary }}>
                                            <div>{new Date(order.date).toLocaleDateString()}</div>
                                            <div className="font-semibold" style={{ color: theme.colors.textPrimary }}>${order.net.toLocaleString()}</div>
                                        </div>
                                        <div className="font-bold" style={{ color: theme.colors.textPrimary }}>{formatCompanyName(order.company)}</div>
                                        <div className="flex flex-wrap gap-2 text-xs mt-1">
                                            <span className="px-3 py-1 rounded-full" style={{
                                                backgroundColor: (STATUS_COLORS[order.status] || theme.colors.secondary) + '20',
                                                color: STATUS_COLORS[order.status] || theme.colors.secondary
                                            }}>
                                                {order.status}
                                            </span>
                                            <span className="px-3 py-1 rounded-full" style={{ backgroundColor: theme.colors.accent + '20', color: theme.colors.accent }}>
                                                {order.vertical}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {numRecentOrders < allRecentOrders.length && (
                                <button
                                    onClick={handleShowMoreOrders}
                                    className="w-full mt-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
                                    style={{ color: theme.colors.textPrimary }}
                                >
                                    Show More Orders
                                </button>
                            )}
                        </div>
                    </GlassCard>

                    <GlassCard theme={theme} className="overflow-hidden">
                        <CardHeader title="Sales by Vertical" />
                        <div className="p-4">
                            <DonutChart data={SALES_VERTICALS_DATA} theme={theme} />
                        </div>
                    </GlassCard>
                </div>
            </div>

            <OrderModal order={selectedOrder} onClose={handleCloseModal} theme={theme} />
        </div>
    );
};