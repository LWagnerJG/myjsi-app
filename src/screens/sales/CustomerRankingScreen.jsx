import React, { useMemo, useState, useCallback } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { Modal } from '../../components/common/Modal';
import { SegmentedToggle } from '../../components/common/GroupedToggle';
import { CUSTOMER_RANK_DATA } from './data.js';

const RANKING_TAB_OPTIONS = [
    { value: 'sales', label: 'Sales' },
    { value: 'bookings', label: 'Bookings' }
];

export const CustomerRankingScreen = ({ theme }) => {
    const [tab, setTab] = useState('sales');
    const [modalData, setModalData] = useState(null);

    const rows = useMemo(() => {
        const list = [...CUSTOMER_RANK_DATA].sort((a, b) => (b[tab] || 0) - (a[tab] || 0));
        return list.map((c, i) => ({ ...c, rank: i + 1 }));
    }, [tab]);

    const maxVal = useMemo(() => Math.max(...rows.map(r => r[tab] || 0), 1), [rows, tab]);

    const open = useCallback((c) => setModalData(c), []);
    const close = useCallback(() => setModalData(null), []);

    const medalStyle = (rank) => {
        const map = {
            1: { ring: '#E8C767', fill: '#F7E8AD' },
            2: { ring: '#C8CDD3', fill: '#ECEFF2' },
            3: { ring: '#D9A079', fill: '#F4D1BE' },
        }[rank];
        if (!map) return { backgroundColor: '#F5F5F5', border: `1px solid ${theme.colors.border}`, color: theme.colors.textSecondary };
        return {
            background: `radial-gradient(120% 120% at 50% 0%, ${map.fill} 0%, #fff 90%)`,
            border: `1px solid ${map.ring}`,
            boxShadow: `0 0 0 2px ${map.ring}33 inset`,
            color: theme.colors.textPrimary,
        };
    };

    const Row = ({ c, i }) => {
        const pct = Math.min(100, Math.round(((c[tab] || 0) / maxVal) * 100));
        return (
            <button onClick={() => open(c)} className="w-full text-left">
                <div className={`grid grid-cols-[36px,1fr,auto] items-center gap-3 px-3 ${i === 0 ? 'pt-3' : 'pt-5'} pb-5`}
                    style={{ borderTop: i === 0 ? 'none' : `1px solid ${theme.colors.subtle}` }}>
                    <div className="h-9 w-9 rounded-full text-xs font-semibold flex items-center justify-center" style={medalStyle(c.rank)}>
                        {c.rank}
                    </div>
                    <div className="min-w-0">
                        <div className="font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{c.name}</div>
                        <div className="mt-2 h-1.5 rounded-full" style={{ backgroundColor: theme.colors.subtle }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: theme.colors.accent }} />
                        </div>
                    </div>
                    <div className="pl-2 text-right">
                        <div className="text-lg font-extrabold tabular-nums" style={{ color: theme.colors.accent }}>
                            ${Number(c[tab] || 0).toLocaleString()}
                        </div>
                        <div className="text-[11px]" style={{ color: theme.colors.textSecondary }}>{tab === 'sales' ? 'Sales' : 'Bookings'}</div>
                    </div>
                </div>
            </button>
        );
    };

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: theme.colors.background }}>
            {/* Tab Toggle */}
            <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2 max-w-5xl mx-auto w-full">
                <SegmentedToggle
                    value={tab}
                    onChange={setTab}
                    options={RANKING_TAB_OPTIONS}
                    theme={theme}
                    size="sm"
                />
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {/* Push card downward with extra top padding */}
                <div className="px-4 pt-5 pb-8">
                    <GlassCard
                        theme={theme}
                        className="rounded-[22px] overflow-hidden"
                        style={{ backgroundColor: '#fff', boxShadow: `0 6px 18px ${theme.colors.shadow}` }}
                    >
                        {rows.map((c, i) => (
                            <Row key={c.id} c={c} i={i} />
                        ))}
                    </GlassCard>
                </div>
            </div>

            <Modal show={!!modalData} onClose={close} title={modalData?.name || ''} theme={theme}>
                {!!modalData && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                                {tab === 'sales' ? 'Sales' : 'Bookings'}
                            </div>
                            <div className="text-2xl font-extrabold tabular-nums" style={{ color: theme.colors.accent }}>
                                ${Number(modalData[tab] || 0).toLocaleString()}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl p-3 text-center" style={{ backgroundColor: theme.colors.subtle, border: `1px solid ${theme.colors.border}` }}>
                                <div className="text-xs" style={{ color: theme.colors.textSecondary }}>Sales</div>
                                <div className="text-xl font-bold" style={{ color: theme.colors.accent }}>
                                    ${Number(modalData.sales || 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="rounded-2xl p-3 text-center" style={{ backgroundColor: theme.colors.subtle, border: `1px solid ${theme.colors.border}` }}>
                                <div className="text-xs" style={{ color: theme.colors.textSecondary }}>Bookings</div>
                                <div className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
                                    ${Number(modalData.bookings || 0).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-3" style={{ borderColor: theme.colors.subtle }}>
                            <div className="font-semibold text-sm mb-2" style={{ color: theme.colors.textPrimary }}>Recent Orders</div>
                            <div className="space-y-2">
                                {(modalData.orders || []).map((o, i) => (
                                    <div key={`${o.projectName}-${i}`} className="flex items-center justify-between text-sm rounded-xl px-3 py-2"
                                        style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}>
                                        <span className="truncate" style={{ color: theme.colors.textPrimary }}>{o.projectName}</span>
                                        <span className="font-semibold" style={{ color: theme.colors.accent }}>
                                            ${Number(o.amount || 0).toLocaleString()}
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
