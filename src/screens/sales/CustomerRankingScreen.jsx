import React, { useState, useMemo, useCallback } from 'react';
import { PageTitle } from '../../components/common/PageTitle';
import { GlassCard } from '../../components/common/GlassCard';
import { ToggleButtonGroup } from '../../components/common/ToggleButtonGroup';
import { Modal } from '../../components/common/Modal';
import * as Data from '../../data';

export const CustomerRankingScreen = ({ theme, onNavigate }) => {
    const [sortKey, setSortKey] = useState('sales');
    const [modalData, setModalData] = useState(null);

    const sortedCustomers = useMemo(() => {
        return [...Data.CUSTOMER_RANK_DATA].sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
    }, [sortKey]);

    const handleOpenModal = useCallback((customer) => {
        if (customer.orders && customer.orders.length > 0) {
            setModalData(customer);
        }
    }, []);
    
    const handleCloseModal = useCallback(() => setModalData(null), []);

    const RankListItem = ({ customer, rank, onClick }) => {
        const hasOrders = customer.orders && customer.orders.length > 0;

        return (
            <button 
                onClick={onClick} 
                disabled={!hasOrders}
                className={`w-full p-4 flex items-center justify-between transition-colors rounded-lg ${
                    hasOrders 
                        ? 'hover:bg-black/5 dark:hover:bg-white/10' 
                        : 'opacity-50 cursor-not-allowed'
                }`}
            >
                <div className="flex items-center space-x-3">
                    <div 
                        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold"
                        style={{ 
                            backgroundColor: rank <= 3 ? theme.colors.accent + '20' : theme.colors.subtle,
                            color: rank <= 3 ? theme.colors.accent : theme.colors.textSecondary
                        }}
                    >
                        {rank}
                    </div>
                    <div className="text-left">
                        <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                            {customer.name}
                        </p>
                        {customer.email && (
                            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                {customer.email}
                            </p>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold" style={{ color: theme.colors.accent }}>
                        ${customer[sortKey].toLocaleString()}
                    </p>
                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                        {sortKey === 'sales' ? 'Sales' : 'Bookings'}
                    </p>
                </div>
            </button>
        );
    };

    return (
        <div className="h-full flex flex-col">
            <div className="px-4 pb-4">
                <PageTitle title="Customer Rankings" theme={theme} />
                
                <GlassCard theme={theme} className="p-1 mb-4">
                    <ToggleButtonGroup
                        value={sortKey}
                        onChange={setSortKey}
                        options={[
                            { label: 'By Sales', value: 'sales' }, 
                            { label: 'By Bookings', value: 'bookings' }
                        ]}
                        theme={theme}
                    />
                </GlassCard>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 pb-4">
                    <GlassCard theme={theme} className="overflow-hidden">
                        <div className="p-4 border-b" style={{ borderColor: theme.colors.subtle }}>
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                Tap on any customer to view order details
                            </p>
                        </div>
                        
                        <div className="divide-y" style={{ borderColor: theme.colors.subtle }}>
                            {sortedCustomers.map((customer, index) => (
                                <RankListItem
                                    key={customer.id}
                                    customer={customer}
                                    rank={index + 1}
                                    onClick={() => handleOpenModal(customer)}
                                />
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>

            <Modal 
                show={!!modalData} 
                onClose={handleCloseModal} 
                title={modalData?.name || ''} 
                theme={theme}
            >
                {modalData && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-xl font-bold" style={{ color: theme.colors.accent }}>
                                    ${modalData.sales?.toLocaleString()}
                                </div>
                                <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Sales</div>
                            </div>
                            <div>
                                <div className="text-xl font-bold" style={{ color: theme.colors.primary }}>
                                    ${modalData.bookings?.toLocaleString()}
                                </div>
                                <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Bookings</div>
                            </div>
                        </div>

                        {modalData.email && (
                            <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                {modalData.email}
                            </div>
                        )}

                        <div className="border-t pt-4" style={{ borderColor: theme.colors.subtle }}>
                            <h4 className="font-semibold text-sm mb-2" style={{ color: theme.colors.textPrimary }}>
                                Recent Orders
                            </h4>
                            {modalData.orders && modalData.orders.length > 0 ? (
                                <div className="space-y-2">
                                    {modalData.orders.map((order, index) => (
                                        <div key={order.id || index} className="flex justify-between items-center text-sm">
                                            <span style={{ color: theme.colors.textPrimary }}>
                                                {order.name}
                                            </span>
                                            <span className="font-semibold" style={{ color: theme.colors.accent }}>
                                                ${order.amount.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                    No recent orders
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
