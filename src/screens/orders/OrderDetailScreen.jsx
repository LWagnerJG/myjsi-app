import React, { useState, useMemo } from 'react';
import { ChevronDown, CheckCircle, Circle, Hourglass, MapPin } from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import * as Data from '../../data.jsx';

const LineItemCard = ({ lineItem, theme, isExpanded, onToggleExpand, formatTitleCase }) => (
    <div className="border rounded-2xl overflow-hidden" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}>
        <button
            onClick={onToggleExpand}
            className="w-full p-4 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
        >
            <div className="flex justify-between items-center">
                <div className="flex-1">
                    <p className="font-semibold text-base" style={{ color: theme.colors.textPrimary }}>
                        {formatTitleCase(lineItem.name)}
                    </p>
                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                        Model: {lineItem.model} • Qty: {lineItem.quantity}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <p className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>
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
            <div className="p-4 border-t space-y-3" style={{ borderColor: theme.colors.border }}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-semibold" style={{ color: theme.colors.textSecondary }}>Unit Net</p>
                        <p style={{ color: theme.colors.textPrimary }}>${lineItem.net?.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="font-semibold" style={{ color: theme.colors.textSecondary }}>Extended Net</p>
                        <p style={{ color: theme.colors.textPrimary }}>${lineItem.extNet?.toLocaleString()}</p>
                    </div>
                </div>

                {lineItem.specs && lineItem.specs.length > 0 && (
                    <div className="space-y-1">
                        <p className="font-semibold text-sm mb-2" style={{ color: theme.colors.textSecondary }}>Specifications</p>
                        <div className="space-y-1">
                            {lineItem.specs.map((spec, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                    <span style={{ color: theme.colors.textSecondary }}>{spec.label}:</span>
                                    <span className="font-medium" style={{ color: theme.colors.textPrimary }}>{spec.value}</span>
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
    const order = useMemo(() => Data.ORDER_DATA.find(o => o.orderNumber === orderId), [orderId]);
    
    const orderStages = useMemo(() => [
        { name: 'Order Entry', date: order?.date },
        { name: 'Acknowledged', date: new Date(new Date(order?.date).getTime() + 2 * 24 * 60 * 60 * 1000) },
        { name: 'In Production', date: 'Current' },
        { name: 'Shipping', date: order?.shipDate },
        { name: 'Delivered', date: null },
    ], [order]);
    
    const formatTitleCase = (str) => str ? str.toLowerCase().replace(/\b(\w)|(LLC)|(IN)\b/g, s => s.toUpperCase()) : '';
    const handleLineItemToggle = (lineItemId) => setExpandedLineItem(prevId => (prevId === lineItemId ? null : lineItemId));

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

    const InfoBlock = ({ label, value, subValue }) => (
        <div>
            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{label}</p>
            <p className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>{value}</p>
            {subValue && <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{subValue}</p>}
        </div>
    );

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-hide pt-6">
                <GlassCard theme={theme} className="p-4" style={{ backgroundColor: theme.colors.surface }}>
                    <div className="text-center mb-4">
                        <p className="text-3xl font-bold" style={{ color: theme.colors.textPrimary }}>
                            {formatTitleCase(order.details)}
                        </p>
                        <p className="text-base" style={{ color: theme.colors.textSecondary }}>
                            for {formatTitleCase(order.company)}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-4 border-t text-center" style={{ borderColor: theme.colors.border }}>
                        <InfoBlock 
                            label="Sales Order #" 
                            value={order.orderNumber} 
                            subValue={`PO# ${order.po}`} 
                        />
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
                            let IconComponent = isCompleted ? CheckCircle : (isCurrent ? Hourglass : Circle);
                            let iconColor = isCompleted || isCurrent ? theme.colors.accent : theme.colors.border;
                            
                            return (
                                <div key={stage.name}>
                                    <div className="flex items-start space-x-4">
                                        <div className="flex flex-col items-center">
                                            <div className="z-10 p-1.5 rounded-full" style={{ backgroundColor: theme.colors.surface }}>
                                                <IconComponent className="w-6 h-6" style={{ color: iconColor }} />
                                            </div>
                                            {index < orderStages.length - 1 && (
                                                <div 
                                                    className="w-0.5 flex-grow mt-1 h-12" 
                                                    style={{ 
                                                        backgroundColor: isCompleted ? theme.colors.accent : 'transparent', 
                                                        borderColor: isCompleted ? 'transparent' : theme.colors.border, 
                                                        borderLeftStyle: isCompleted ? 'solid' : 'dashed', 
                                                        borderLeftWidth: '2px' 
                                                    }} 
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`flex justify-between items-center rounded-lg h-10 ${isCurrent ? 'bg-black/5 -ml-2 pl-2' : ''}`}>
                                                <p 
                                                    className={`font-bold ${isCurrent ? 'text-lg' : ''}`} 
                                                    style={{ color: isCurrent ? theme.colors.textPrimary : theme.colors.textSecondary }}
                                                >
                                                    {stage.name}
                                                </p>
                                                <p className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
                                                    {stage.name === 'Shipping' ? `Est. ${new Date(stage.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                                                    {isCompleted && stage.date ? new Date(stage.date).toLocaleDateString() : ''}
                                                </p>
                                            </div>
                                            {stage.name === 'Shipping' && (
                                                <div className="mt-2 pl-2">
                                                    <a 
                                                        href={`http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(order.shipTo)}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="p-2 rounded-lg flex space-x-2 transition-colors hover:bg-black/5 inline-flex"
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
                            {order.lineItems.map((item) => (
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