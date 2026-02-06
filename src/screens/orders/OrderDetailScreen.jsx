import React, { useState, useMemo } from 'react';
import { ChevronDown, CheckCircle2, Circle, Hourglass, MapPin, FileText, Share2, X } from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { ORDER_DATA, STATUS_COLORS } from './data.js';

/* ---------------- Line Item Row (minimal design) ---------------- */
const LineItemRow = ({ item, expanded, onToggle, theme, formatTitleCase, isLast }) => {
    return (
        <div className="select-none" style={{ borderBottom: isLast ? 'none' : `1px solid ${theme.colors.border}` }}>
            <button onClick={onToggle} className="w-full text-left py-3 flex items-start gap-3 group focus:outline-none">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                        <p className="font-medium truncate" style={{ color: theme.colors.textPrimary }}>{formatTitleCase(item.name)}</p>
                        <p className="font-semibold text-sm whitespace-nowrap" style={{ color: theme.colors.textPrimary }}>${item.extNet?.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] mt-1" style={{ color: theme.colors.textSecondary }}>
                        <span>{item.model}</span>
                        <span className="opacity-40">|</span>
                        <span>Qty {item.quantity}</span>
                    </div>
                </div>
                <div className={`flex items-center justify-center w-6 h-6 rounded-md transition-transform ${expanded ? 'rotate-180' : ''}`}> 
                    <ChevronDown className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                </div>
            </button>
            {expanded && (
                <div className="pb-4 pt-1 pl-0.5 pr-1 text-xs space-y-3" style={{ color: theme.colors.textSecondary }}>
                    <div className="flex gap-6">
                        <div>
                            <p className="text-[11px] uppercase tracking-wide" style={{ color: theme.colors.textSecondary }}>Unit</p>
                            <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>${item.net?.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase tracking-wide" style={{ color: theme.colors.textSecondary }}>Extended</p>
                            <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>${item.extNet?.toLocaleString()}</p>
                        </div>
                    </div>
                    {item.specs?.length > 0 && (
                        <div>
                            <p className="text-[11px] uppercase tracking-wide mb-1" style={{ color: theme.colors.textSecondary }}>Specs</p>
                            <div className="space-y-1">
                                {item.specs.map((s,i)=>(
                                    <div key={i} className="flex items-center justify-between text-[11px]">
                                        <span>{s.label}</span>
                                        <span className="font-medium" style={{ color: theme.colors.textPrimary }}>{s.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const OrderDetailScreen = ({ theme, onNavigate, currentScreen }) => {
    const [expanded, setExpanded] = useState(null);
    const [showAck, setShowAck] = useState(false);
    const orderId = currentScreen.split('/')[1];
    const order = useMemo(() => ORDER_DATA.find(o => o.orderNumber === orderId), [orderId]);

    const orderStages = useMemo(() => {
        if (!order) return [];
        return [
            { name: 'Order Entry', date: order.date },
            { name: 'Acknowledged', date: order.ackDate || (order.date ? new Date(new Date(order.date).getTime()+2*86400000).toISOString() : null) },
            { name: 'In Production', date: 'Current' },
            { name: 'Shipping', date: order.shipDate },
            { name: 'Delivered', date: null }
        ];
    }, [order]);

    const formatTitleCase = str => str ? str.toLowerCase().replace(/\b(\w)|(LLC)|(IN)\b/g, s => s.toUpperCase()) : '';
    const toggleRow = id => setExpanded(p => p === id ? null : id);

    if (!order) {
        return (
            <div className="p-4">
                <PageTitle title="Error" theme={theme} onBack={() => onNavigate('orders')} />
                <GlassCard theme={theme} className="p-8 text-center"><p style={{ color: theme.colors.textPrimary }}>Order not found.</p></GlassCard>
            </div>
        );
    }

    const statusColor = STATUS_COLORS[order.status] || theme.colors.secondary;
    const currentIndex = orderStages.findIndex(s => s.name === order.status);
    const ackIndex = orderStages.findIndex(s => s.name === 'Acknowledged');
    const ackCompleted = currentIndex >= ackIndex && ackIndex !== -1;

    const InfoBlock = ({ label, value, subValue }) => (
        <div>
            <p className="text-[11px] uppercase tracking-wide font-medium" style={{ color: theme.colors.textSecondary }}>{label}</p>
            <p className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{value}</p>
            {subValue && <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{subValue}</p>}
        </div>
    );

    const ackUrl = order.ackUrl;
    const shareAck = () => { if (navigator.share) navigator.share({ title: `Acknowledgment ${order.orderNumber}`, url: ackUrl }).catch(()=>{}); else window.open(ackUrl,'_blank','noopener'); };

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-6 scrollbar-hide">
                <div className="max-w-5xl mx-auto w-full space-y-4">
                <GlassCard theme={theme} className="p-5" style={{ backgroundColor: theme.colors.surface }}>
                    <div className="text-center mb-4">
                        <h1 className="text-2xl font-bold leading-tight" style={{ color: theme.colors.textPrimary }}>{formatTitleCase(order.details)}</h1>
                        <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>for {formatTitleCase(order.company)}</p>
                    </div>
                    <div className="flex items-center justify-center mb-6">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${statusColor}1a`, color: statusColor, border: `1px solid ${statusColor}55` }}>
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor }} /> {order.status}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t" style={{ borderColor: theme.colors.border }}>
                        <InfoBlock label="Sales Order #" value={order.orderNumber} subValue={`PO# ${order.po}`} />
                        <InfoBlock label="Net Amount" value={`$${order.net.toLocaleString()}`} subValue={`${order.discount} Discount`} />
                    </div>
                </GlassCard>

                <GlassCard theme={theme} className="p-5" style={{ backgroundColor: theme.colors.surface }}>
                    <h3 className="font-bold mb-5" style={{ color: theme.colors.textPrimary }}>Order Progress</h3>
                    <div>
                        {orderStages.map((stage, idx) => {
                            const isCompleted = idx < currentIndex;
                            const isCurrent = idx === currentIndex;
                            const Icon = isCompleted ? CheckCircle2 : isCurrent ? Hourglass : Circle;
                            const accent = STATUS_COLORS[stage.name] || statusColor;
                            const isAckStage = stage.name === 'Acknowledged';
                            const rawDate = stage.date && stage.date !== 'Current' ? new Date(stage.date) : null;
                            const dateStr = rawDate ? rawDate.toLocaleDateString('en-US',{month:'numeric',day:'numeric',year:'numeric'}) : (stage.name === 'Shipping' && stage.date ? new Date(stage.date).toLocaleDateString('en-US',{month:'numeric',day:'numeric',year:'numeric'}) : '');
                            const isShippingStage = stage.name === 'Shipping';
                            return (
                                <div key={stage.name} className="flex gap-4 relative">
                                    <div className="flex flex-col items-center">
                                        <div className="w-7 flex items-center justify-center">
                                            <div className={`rounded-full flex items-center justify-center transition-colors ${isCurrent ? 'ring-2' : ''}`} style={{ width: 26, height: 26, backgroundColor: isCompleted ? accent+'22' : isCurrent ? accent+'18' : 'transparent', boxShadow: isCurrent ? `0 0 0 2px ${accent}33` : 'none' }}>
                                                <Icon className="w-4 h-4" style={{ color: isCompleted || isCurrent ? accent : theme.colors.border }} />
                                            </div>
                                        </div>
                                        {idx < orderStages.length - 1 && (
                                            <div className="flex-1 w-px mt-1 mb-0" style={{ background: isCompleted ? accent : theme.colors.border, opacity: isCompleted ? 0.5 : 0.25 }} />
                                        )}
                                    </div>
                                    <div className="flex-1 pb-6 pt-0.5 relative">
                                        <div className={isShippingStage ? 'relative pr-16' : 'flex items-start justify-between'}>
                                            <div className="relative w-full">
                                                <div className="flex items-center gap-2">
                                                    <p className={`font-semibold tracking-wide ${isCurrent ? 'text-base' : 'text-sm'}`} style={{ color: isCurrent ? theme.colors.textPrimary : theme.colors.textSecondary }}>{stage.name}</p>
                                                    {isCurrent && <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }} />}
                                                </div>
                                                {isAckStage && ackCompleted && ackUrl && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button onClick={()=>setShowAck(true)} className="flex items-center gap-1.5 pl-2 pr-3 py-1 rounded-full text-[11px] font-medium border transition" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.textPrimary }}>
                                                            <FileText className="w-3.5 h-3.5" /> View Ack
                                                        </button>
                                                        <button onClick={shareAck} className="flex items-center gap-1.5 p-1.5 rounded-full border transition" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }} title="Share Acknowledgment">
                                                            <Share2 className="w-3.5 h-3.5" style={{ color: theme.colors.textPrimary }} />
                                                        </button>
                                                    </div>
                                                )}
                                                {isShippingStage && order.shipTo && (
                                                    <div className="mt-1">
                                                        <div className="flex gap-2 items-start text-xs sm:text-sm leading-relaxed pr-12">
                                                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
                                                            <span className="whitespace-pre-line" style={{ color: theme.colors.textPrimary }}>{formatTitleCase(order.shipTo)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {!isShippingStage && (
                                                <p className="text-[11px] font-medium mt-0.5" style={{ color: theme.colors.textSecondary }}>{dateStr}</p>
                                            )}
                                            {isShippingStage && (
                                                <p className="text-[11px] font-medium mt-0.5 absolute top-0 right-0" style={{ color: theme.colors.textSecondary }}>{dateStr}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>

                <GlassCard theme={theme} className="p-5" style={{ backgroundColor: theme.colors.surface }}>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold" style={{ color: theme.colors.textPrimary }}>Line Items</h3>
                        <p className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>{order.lineItems.length} Items</p>
                    </div>
                    <div className="mt-3">
                        {order.lineItems.map((li, i) => (
                            <LineItemRow key={li.line} item={li} expanded={expanded===li.line} onToggle={()=>toggleRow(li.line)} theme={theme} formatTitleCase={formatTitleCase} isLast={i===order.lineItems.length-1} />
                        ))}
                    </div>
                </GlassCard>
                </div>
            </div>

            {showAck && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=>setShowAck(false)} />
                    <div className="relative w-full max-w-2xl h-[70vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}>
                        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: theme.colors.border }}>
                            <h3 className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>Acknowledgment � {order.orderNumber}</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={shareAck} className="p-2 rounded-full" style={{ backgroundColor: theme.colors.subtle }} aria-label="Share acknowledgment"><Share2 className="w-4 h-4" style={{ color: theme.colors.textPrimary }} /></button>
                                <button onClick={()=>setShowAck(false)} className="p-2 rounded-full" style={{ backgroundColor: theme.colors.subtle }} aria-label="Close"><X className="w-4 h-4" style={{ color: theme.colors.textPrimary }} /></button>
                            </div>
                        </div>
                        <iframe title="Acknowledgment PDF" src={ackUrl} className="flex-1 w-full" style={{ background: '#fff' }} />
                    </div>
                </div>
            )}
        </div>
    );
};