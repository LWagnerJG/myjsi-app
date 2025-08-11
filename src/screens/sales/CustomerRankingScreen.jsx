// CustomerRankingScreen.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { Modal } from '../../components/common/Modal';
import { CUSTOMER_RANK_DATA } from './data.js';

export const CustomerRankingScreen = ({ theme }) => {
    const [sortKey, setSortKey] = useState('sales');
    const [modalData, setModalData] = useState(null);

    const sorted = useMemo(() => {
        const arr = [...CUSTOMER_RANK_DATA].sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
        return arr.map((c, i) => ({ ...c, rank: i + 1 }));
    }, [sortKey]);

    const maxValue = useMemo(() => Math.max(...sorted.map((c) => c[sortKey] || 0), 1), [sorted, sortKey]);

    const open = useCallback((c) => setModalData(c), []);
    const close = useCallback(() => setModalData(null), []);

    const Segmented = () => (
        <div
            className="inline-flex items-center p-1 rounded-full"
            style={{ backgroundColor: theme.colors.subtle, border: `1px solid ${theme.colors.border}` }}
        >
            {[
                { label: 'By Sales', value: 'sales' },
                { label: 'By Bookings', value: 'bookings' },
            ].map((opt) => {
                const active = sortKey === opt.value;
                return (
                    <button
                        key={opt.value}
                        onClick={() => setSortKey(opt.value)}
                        className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                        style={{
                            backgroundColor: active ? theme.colors.accent : 'transparent',
                            color: active ? '#fff' : theme.colors.textPrimary,
                            boxShadow: active ? `0 6px 24px ${theme.colors.shadow}` : 'none',
                        }}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );

    const rankBadgeStyle = (rank) => {
        const medal = {
            1: { ring: '#E8C767', fill: '#F7E8AD' },
            2: { ring: '#C8CDD3', fill: '#ECEFF2' },
            3: { ring: '#D9A079', fill: '#F4D1BE' },
        }[rank];
        if (!medal)
            return {
                backgroundColor: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
            };
        return {
            background: `radial-gradient(100% 100% at 50% 0%, ${medal.fill} 0%, #fff 100%)`,
            border: `1px solid ${medal.ring}`,
            boxShadow: `0 0 0 2px ${medal.ring}33 inset`,
        };
    };

    const Item = ({ c }) => {
        const pct = Math.min(100, Math.round(((c[sortKey] || 0) / maxValue) * 100));
        return (
            <button
                onClick={() => open(c)}
                className="w-full text-left rounded-2xl px-3 py-3 transition-colors hover:bg-black/5"
                style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div
                            className={`flex items-center justify-center flex-shrink-0 font-bold rounded-full ${c.rank <= 3 ? 'w-9 h-9 text-sm' : 'w-8 h-8 text-xs'
                                }`}
                            style={rankBadgeStyle(c.rank)}
                        >
                            {c.rank}
                        </div>
                        <div className="min-w-0">
                            <div
                                className="font-semibold truncate"
                                style={{ color: theme.colors.textPrimary }}
                            >
                                {c.name}
                            </div>
                            <div className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
                                {sortKey === 'sales' ? 'Sales' : 'Bookings'}
                            </div>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <div
                            className="font-extrabold text-lg tabular-nums"
                            style={{ color: theme.colors.accent }}
                        >
                            ${Number(c[sortKey] || 0).toLocaleString()}
                        </div>
                    </div>
                </div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.subtle }}>
                    <div
                        className="h-full rounded-full"
                        style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${theme.colors.accent} 0%, ${theme.colors.accent}AA 100%)`,
                        }}
                    />
                </div>
            </button>
        );
    };

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: theme.colors.background }}>
            <div className="px-4 pt-4">
                <Segmented />
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 pt-3 pb-6">
                    <GlassCard theme={theme} className="p-2 rounded-[24px]" style={{ backgroundColor: '#fff', boxShadow: `0 4px 12px ${theme.colors.shadow}` }}>
                        <div className="divide-y" style={{ borderColor: theme.colors.subtle }}>
                            {sorted.map((c) => (
                                <Item key={c.id} c={c} />
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>

            <Modal show={!!modalData} onClose={close} title={modalData?.name || ''} theme={theme}>
                {!!modalData && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                                style={rankBadgeStyle(modalData.rank)}
                            >
                                {modalData.rank}
                            </div>
                            <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                {sortKey === 'sales' ? 'Sales' : 'Bookings'}
                            </div>
                            <div
                                className="ml-auto font-extrabold text-xl tabular-nums"
                                style={{ color: theme.colors.accent }}
                            >
                                ${Number(modalData[sortKey] || 0).toLocaleString()}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div
                                className="rounded-2xl p-3 text-center"
                                style={{ backgroundColor: theme.colors.subtle, border: `1px solid ${theme.colors.border}` }}
                            >
                                <div className="text-xs" style={{ color: theme.colors.textSecondary }}>Sales</div>
                                <div className="text-xl font-bold" style={{ color: theme.colors.accent }}>
                                    ${Number(modalData.sales || 0).toLocaleString()}
                                </div>
                            </div>
                            <div
                                className="rounded-2xl p-3 text-center"
                                style={{ backgroundColor: theme.colors.subtle, border: `1px solid ${theme.colors.border}` }}
                            >
                                <div className="text-xs" style={{ color: theme.colors.textSecondary }}>Bookings</div>
                                <div className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
                                    ${Number(modalData.bookings || 0).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-3" style={{ borderColor: theme.colors.subtle }}>
                            <div className="font-semibold text-sm mb-2" style={{ color: theme.colors.textPrimary }}>
                                Recent Orders
                            </div>
                            <div className="space-y-2">
                                {(modalData.orders || []).map((o, i) => (
                                    <div
                                        key={`${o.projectName}-${i}`}
                                        className="flex items-center justify-between text-sm rounded-xl px-3 py-2"
                                        style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
                                    >
                                        <span className="truncate" style={{ color: theme.colors.textPrimary }}>
                                            {o.projectName}
                                        </span>
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
