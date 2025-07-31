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

    const RankListItem = ({ customer, rank, onClick }) => (
        <button onClick={onClick} className="w-full p-4 flex items-center justify-between transition-colors hover:bg-black/5 dark:hover:bg-white/10 rounded-xl">
            <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: theme.colors.subtle }}>
                    <span className="text-xl font-bold" style={{ color: theme.colors.textSecondary }}>{rank}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg truncate" style={{ color: theme.colors.textPrimary }}>{customer.name}</p>
                </div>
            </div>
            <div className="text-right flex-shrink-0">
                <p className="font-semibold text-lg" style={{ color: theme.colors.accent }}>
                    ${customer[sortKey].toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
            </div>
        </button>
    );

    return (
        <div className="h-full flex flex-col">
            <div className="px-4">
                <PageTitle title="Customer Ranking" theme={theme} />
                <div className="pb-4">
                    <GlassCard theme={theme} className="p-1">
                        <ToggleButtonGroup
                            value={sortKey}
                            onChange={setSortKey}
                            options={[{ label: 'By Sales', value: 'sales' }, { label: 'By Bookings', value: 'bookings' }]}
                            theme={theme}
                        />
                    </GlassCard>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 space-y-4 py-4">
                    <GlassCard theme={theme} className="overflow-hidden">
                        <div className="grid grid-cols-3 gap-4 p-4 pb-3 border-b" style={{ borderColor: theme.colors.subtle }}>
                            <div className="text-left" style={{ color: theme.colors.textSecondary, fontWeight: 'bold' }}>Series</div>
                            <div className="text-right" style={{ color: theme.colors.textSecondary, fontWeight: 'bold' }}>Bookings</div>
                            <div className="text-right" style={{ color: theme.colors.textSecondary, fontWeight: 'bold' }}>Sales</div>
                        </div>
                    </GlassCard>

                    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-3 scrollbar-hide">
                        <GlassCard theme={theme} className="p-2">
                            {sortedCustomers.map((customer, index) => (
                                <React.Fragment key={customer.id}>
                                    {index > 0 && <div className="border-t mx-3" style={{ borderColor: theme.colors.subtle }}></div>}
                                    <RankListItem
                                        customer={customer}
                                        rank={index + 1}
                                        onClick={() => handleOpenModal(customer)}
                                    />
                                </React.Fragment>
                            ))}
                        </GlassCard>
                    </div>
                </div>
            </div>

            <Modal show={!!modalData} onClose={handleCloseModal} title={`${modalData?.name || ''}`} theme={theme}>
                <div className="space-y-3">
                    <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                        {modalData?.email}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="font-semibold" style={{ color: theme.colors.textPrimary }}>Sales</div>
                            <div className="text-xs" style={{ color: theme.colors.textSecondary }}>${modalData?.sales?.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="font-semibold" style={{ color: theme.colors.textPrimary }}>Bookings</div>
                            <div className="text-xs" style={{ color: theme.colors.textSecondary }}>${modalData?.bookings?.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="pt-3 border-t" style={{ borderColor: theme.colors.subtle }}>
                        <h4 className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>Recent Orders</h4>
                        {modalData?.orders && modalData.orders.length > 0 ? (
                            <div className="space-y-2">
                                {modalData.orders.map((order) => (
                                    <div key={order.id} className="flex justify-between items-center text-sm">
                                        <span style={{ color: theme.colors.textPrimary }}>{order.name}</span>
                                        <span className="font-semibold" style={{ color: theme.colors.accent }}>${order.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>No recent orders.</p>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};
