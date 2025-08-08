import React, { useState, useMemo } from 'react';
import { ChevronDown, CheckCircle2, Circle, Hourglass, MapPin } from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { ORDER_DATA, STATUS_COLORS } from './data.js';

const LineItemCard = ({ lineItem, theme, isExpanded, onToggleExpand, formatTitleCase }) => (
    <div
        className="rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${theme.colors.border}`, backgroundColor: theme.colors.surface }}
    >
        <button
            onClick={onToggleExpand}
            className="w-full px-4 py-3 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
        >
            <div className="flex justify-between items-center">
                <div className="min-w-0">
                    <p className="font-semibold text-base truncate" style={{ color: theme.colors.textPrimary }}>
                        {formatTitleCase(lineItem.name)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                        Model: {lineItem.model} • Qty: {lineItem.quantity}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="font-bold text-base whitespace-nowrap" style={{ color: theme.colors.textPrimary }}>
                        ${lineItem.extNet?.toLocaleString()}
                    </p>
                    <ChevronDown
                        className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        style={{ color: theme.colors.textSecondary }}
                    />
                </div>
            </div>
        </button>

        {isExpanded && (
            <div className="px-4 pb-4 pt-3 border-t space-y-3" style={{ borderColor: theme.colors.border }}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-medium text-xs" style={{ color: theme.colors.textSecondary }}>
                            Unit Net
                        </p>
                        <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                            ${lineItem.net?.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="font-medium text-xs" style={{ color: theme.colors.textSecondary }}>
                            Extended Net
                        </p>
                        <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                            ${lineItem.extNet?.toLocaleString()}
                        </p>
                    </div>
                </div>

                {lineItem.specs?.length > 0 && (
                    <div className="rounded-xl p-3" style={{ backgroundColor: theme.colors.subtle }}>
                        <p className="font-medium text-xs mb-2" style={{ color: theme.colors.textSecondary }}>
                            Specifications
                        </p>
                        <div className="space-y-1">
                            {lineItem.specs.map((spec, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <span style={{ color: theme.colors.textSecondary }}>{spec.label}</span>
                                    <span className="font-medium" style={{ color: theme.colors.textPrimary }}>
                                        {spec.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
);

export const OrderDetailScreen = ({ theme, onNavigate, currentScreen }) => {
    const [expandedLineItem, setExpandedLineItem] = useState(null);
    const orderId = currentScreen.split('/')[1];
    const order = useMemo(() => ORDER_DATA.find(o => o.orderNumber === orderId), [orderId]);

    const orderStages = useMemo(
        () => [
            { name: 'Order Entry', date: order?.date },
            { name: 'Acknowledged', date: new Date(new Date(order?.date).getTime() + 2 * 24 * 60 * 60 * 1000) },
            { name: 'In Production', date: 'Current' },
            { name: 'Shipping', date: order?.shipDate },
            { name: 'Delivered', date: null }
        ],
        [order]
    );

    const formatTitleCase = str =>
        str ? str.toLowerCase().replace(/\b(\w)|(LLC)|(IN)\b/g, s => s.toUpperCase()) : '';

    const handleLineItemToggle = id => setExpandedLineItem(prev => (prev === id ? null : id));

    if (!order) {
        return (
            <div className="p-4">
                <PageTitle title="Error" theme={theme} onBack={() => onNavigate('orders')} />
                <GlassCard theme={theme} className="p-8 text-center">
                    <p style={{ color: theme.colors.textPrimary }}>Order not found.</p>
                </GlassCard>
            </div>
        );
    }

    const statusColor = STATUS_COLORS[order.status] || theme.colors.secondary;

    const InfoBlock = ({ label, value, subValue }) => (
        <div>
            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                {label}
            </p>
            <p className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                {value}
            </p>
            {subValue && (
                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                    {subValue}
                </p>
            )}
        </div>
    );

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-hide pt-6">
                <GlassCard theme={theme} className="p-4" style={{ backgroundColor: theme.colors.surface }}>
                    <div className="text-center mb-3">
                        <p className="text-2xl font-bold leading-tight" style={{ color: theme.colors.textPrimary }}>
                            {formatTitleCase(order.details)}
                        </p>
                        <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                            for {formatTitleCase(order.company)}
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: `${statusColor}1a`, color: statusColor, border: `1px solid ${statusColor}55` }}
                            title="Order status color matches the dot color in the orders list"
                        >
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor }} />
                            {order.status}
                        </span>
                    </div>

                    <div
                        className="grid grid-cols-2 gap-x-4 gap-y-4 pt-4 border-t text-center"
                        style={{ borderColor: theme.colors.border }}
                    >
                        <InfoBlock label="Sales Order #" value={order.orderNumber} subValue={`PO# ${order.po}`} />
                        <InfoBlock
                            label="Net Amount"
                            value={`$${order.net?.toLocaleString()}`}
                            subValue={`${order.discount} Discount`}
                        />
                    </div>
                </GlassCard>

                <GlassCard theme={theme} className="p-4" style={{ backgroundColor: theme.colors.surface }}>
                    <h3 className="font-bold text-lg mb-3" style={{ color: theme.colors.textPrimary }}>
                        Order Progress
                    </h3>

                    <div className="space-y-0">
                        {orderStages.map((stage, index) => {
                            const currentIndex = orderStages.findIndex(s => s.name === order.status);
                            const isCompleted = index < currentIndex;
                            const isCurrent = index === currentIndex;
                            const Icon = isCompleted ? CheckCircle2 : isCurrent ? Hourglass : Circle;

                            const dotColor = isCompleted || isCurrent ? statusColor : theme.colors.border;

                            return (
                                <div key={stage.name}>
                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="z-10 p-1.5 rounded-full" style={{ backgroundColor: theme.colors.surface }}>
                                                <Icon className="w-6 h-6" style={{ color: dotColor }} />
                                            </div>
                                            {index < orderStages.length - 1 && (
                                                <div
                                                    className="w-0.5 flex-grow mt-1 h-12"
                                                    style={{
                                                        backgroundColor: isCompleted ? `${statusColor}` : 'transparent',
                                                        borderColor: isCompleted ? 'transparent' : theme.colors.border,
                                                        borderLeftStyle: isCompleted ? 'solid' : 'dashed',
                                                        borderLeftWidth: '2px'
                                                    }}
                                                />
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div
                                                className={`flex justify-between items-center rounded-xl h-10 px-2 ${isCurrent ? '' : ''
                                                    }`}
                                                style={{
                                                    backgroundColor: isCurrent ? `${statusColor}10` : 'transparent',
                                                    border: isCurrent ? `1px solid ${statusColor}33` : '1px solid transparent'
                                                }}
                                            >
                                                <p
                                                    className={`font-semibold ${isCurrent ? 'text-base' : 'text-sm'}`}
                                                    style={{ color: isCurrent ? theme.colors.textPrimary : theme.colors.textSecondary }}
                                                >
                                                    {stage.name}
                                                </p>
                                                <p className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>
                                                    {stage.name === 'Shipping'
                                                        ? `Est. ${new Date(stage.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                                        : isCompleted && stage.date
                                                            ? new Date(stage.date).toLocaleDateString()
                                                            : ''}
                                                </p>
                                            </div>

                                            {stage.name === 'Shipping' && (
                                                <div className="mt-2 pl-2">
                                                    <a
                                                        href={`http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(order.shipTo)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-xl inline-flex gap-2 transition-colors hover:bg-black/5"
                                                        style={{ backgroundColor: theme.colors.subtle }}
                                                    >
                                                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
                                                        <p className="text-xs whitespace-pre-line" style={{ color: theme.colors.textSecondary }}>
                                                            {formatTitleCase(order.shipTo)}
                                                        </p>
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>

                <GlassCard theme={theme} className="p-4" style={{ backgroundColor: theme.colors.surface }}>
                    <div className="pb-2">
                        <h3 className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>
                            Line Items
                        </h3>
                    </div>
                    {order.lineItems?.length > 0 ? (
                        <div className="space-y-3">
                            {order.lineItems.map(item => (
                                <LineItemCard
                                    key={item.line}
                                    lineItem={item}
                                    theme={theme}
                                    isExpanded={expandedLineItem === item.line}
                                    onToggleExpand={() => handleLineItemToggle(item.line)}
                                    formatTitleCase={formatTitleCase}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="p-4 text-center text-sm" style={{ color: theme.colors.textSecondary }}>
                            No line items for this order.
                        </p>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};