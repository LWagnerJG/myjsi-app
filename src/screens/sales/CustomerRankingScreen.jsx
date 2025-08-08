// CustomerRankingScreen.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { Modal } from '../../components/common/Modal';
import { CUSTOMER_RANK_DATA } from './data.js';

export const CustomerRankingScreen = ({ theme }) => {
    const [sortKey, setSortKey] = useState('sales');
    const [modalData, setModalData] = useState(null);

    const sortedCustomers = useMemo(() => {
        return [...CUSTOMER_RANK_DATA].sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
    }, [sortKey]);

    const handleOpenModal = useCallback((customer) => setModalData(customer), []);
    const handleCloseModal = useCallback(() => setModalData(null), []);

    const Segmented = () => (
        <div
            className="inline-flex p-1 rounded-full"
            style={{
                backgroundColor: theme.colors.subtle,
                border: `1px solid ${theme.colors.border}`
            }}
        >
            {[
                { label: 'By Sales', value: 'sales' },
                { label: 'By Bookings', value: 'bookings' }
            ].map((opt) => {
                const active = sortKey === opt.value;
                return (
                    <button
                        key={opt.value}
                        onClick={() => setSortKey(opt.value)}
                        className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                        style={{
                            backgroundColor: active ? theme.colors.accent : 'transparent',
                            color: active ? '#fff' : theme.colors.textPrimary
                        }}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );

    const rankBadgeStyle = (rank) => {
        const styles = {
            1: { ring: '#E8C767', fill: '#F7E8AD' }, // gold
            2: { ring: '#C8CDD3', fill: '#ECEFF2' }, // silver
            3: { ring: '#D9A079', fill: '#F4D1BE' }  // bronze
        };
        const s = styles[rank];
        if (!s) {
            return {
                backgroundColor: theme.colors.subtle,
                border: `1px solid ${theme.colors.border}`
            };
        }
        return {
            background: `radial-gradient(100% 100% at 50% 0%, ${s.fill} 0%, #fff 100%)`,
            border: `1px solid ${s.ring}`,
            boxShadow: `0 0 0 2px ${s.ring}33 inset`
        };
    };

    const RankListItem = ({ customer, rank, onClick }) => (
        <button
            onClick={onClick}
            className="w-full px-4 py-3 text-left transition-colors hover:bg-black/5 rounded-xl"
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className={`flex items-center justify-center flex-shrink-0 font-bold ${rank <= 3 ? 'w-9 h-9 text-sm' : 'w-8 h-8 text-sm'
                            } rounded-full`}
                        style={rankBadgeStyle(rank)}
                    >
                        {rank}
                    </div>

                    <div className="min-w-0">
                        <p className="font-semibold truncate" style={{ color: theme.colors.textPrimary }}>
                            {customer.name}
                        </p>
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                            {sortKey === 'sales' ? 'Sales' : 'Bookings'}
                        </p>
                    </div>
                </div>

                <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg whitespace-nowrap" style={{ color: theme.colors.accent }}>
                        ${customer[sortKey].toLocaleString()}
                    </p>
                </div>
            </div>
        </button>
    );

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: theme.colors.background }}>
            <div className="px-4 pt-4">
                <Segmented />
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 pb-4 pt-3">
                    <GlassCard theme={theme} className="overflow-hidden">
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

            <Modal show={!!modalData} onClose={handleCloseModal} title={modalData?.name || ''} theme={theme}>
                {modalData && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="rounded-2xl p-3" style={{ backgroundColor: theme.colors.subtle }}>
                                <div className="text-xl font-bold" style={{ color: theme.colors.accent }}>
                                    ${modalData.sales?.toLocaleString()}
                                </div>
                                <div className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                                    Sales
                                </div>
                            </div>
                            <div className="rounded-2xl p-3" style={{ backgroundColor: theme.colors.subtle }}>
                                <div className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
                                    ${modalData.bookings?.toLocaleString()}
                                </div>
                                <div className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                                    Bookings
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-3" style={{ borderColor: theme.colors.subtle }}>
                            <h4 className="font-semibold text-sm mb-2" style={{ color: theme.colors.textPrimary }}>
                                Recent Orders
                            </h4>
                            <div className="space-y-2">
                                {modalData.orders.map((order, i) => (
                                    <div
                                        key={`${order.projectName}-${i}`}
                                        className="flex items-center justify-between text-sm rounded-xl px-3 py-2"
                                        style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
                                    >
                                        <span className="truncate" style={{ color: theme.colors.textPrimary }}>
                                            {order.projectName}
                                        </span>
                                        <span className="font-semibold" style={{ color: theme.colors.accent }}>
                                            ${order.amount.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
