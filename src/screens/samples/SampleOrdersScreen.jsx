import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isDarkTheme, cardSurface } from '../../design-system/tokens.js';
import { Package, Truck, CheckCircle2, Clock, Mail, ChevronRight, User, MapPin, X, Send, Copy, Check, ExternalLink, PackageCheck, CircleDot, Circle } from 'lucide-react';
import { SegmentedToggle } from '../../components/common/GroupedToggle.jsx';
import { getUnifiedBackdropStyle, UNIFIED_BACKDROP_TRANSITION, UNIFIED_MODAL_Z } from '../../components/common/modalUtils.js';
import { INITIAL_SAMPLE_ORDERS } from './sampleOrders.js';

const STATUS_CONFIG = {
    'processing': { label: 'Processing', color: '#D4A843', icon: Clock, bg: (dk) => dk ? 'rgba(212,168,67,0.12)' : 'rgba(212,168,67,0.08)' },
    'in-transit': { label: 'In Transit', color: '#5B7B8C', icon: Truck, bg: (dk) => dk ? 'rgba(91,123,140,0.12)' : 'rgba(91,123,140,0.08)' },
    'delivered': { label: 'Delivered', color: '#4A7C59', icon: CheckCircle2, bg: (dk) => dk ? 'rgba(74,124,89,0.12)' : 'rgba(74,124,89,0.08)' },
};

const TYPE_BADGE = {
    'dealer': { label: 'Dealer', color: '#4A7C59' },
    'design': { label: 'Design', color: '#5B7B8C' },
    'end-user': { label: 'End User', color: '#8B7355' },
    'personal': { label: 'Personal', color: '#8B8680' },
};

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function formatFullDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
function relativeDate(iso) {
    const now = new Date();
    const d = new Date(iso);
    const days = Math.floor((now - d) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return formatDate(iso);
}

// ─── Follow-up email builder ────────────────────────────────────────────────
function buildFollowUp(order) {
    const first = order.orderedBy.name.split(' ')[0];
    const itemNames = order.items.map(i => i.name).join(', ');
    const subject = `Quick question about your recent samples`;
    const body = `Hey ${first},\n\nI saw that you recently ordered some samples (${itemNames}) and just wanted to check in — hope everything looked great! Let me know if there's anything I can help with or if you'd like to see any other finishes.\n\nTalk soon,\nLuke`;
    return { subject, body, to: order.orderedBy.email, first };
}

// ─── Follow-up preview modal ────────────────────────────────────────────────
const FollowUpModal = ({ order, theme, onClose }) => {
    const dk = isDarkTheme(theme);
    const { subject, body, to, first } = buildFollowUp(order);
    const mailtoHref = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    return (
        <motion.div
            className="fixed inset-0 flex items-end justify-center"
            style={{ zIndex: UNIFIED_MODAL_Z }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={UNIFIED_BACKDROP_TRANSITION}
        >
            {/* Backdrop */}
            <motion.div
                className="absolute inset-0"
                style={getUnifiedBackdropStyle(dk)}
                onClick={onClose}
            />
            {/* Sheet */}
            <motion.div
                className="relative w-full max-w-lg mx-4 mb-6 rounded-3xl overflow-hidden"
                style={{
                    backgroundColor: dk ? '#2A2A2A' : '#FFFFFF',
                    boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
                }}
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <div>
                        <p className="text-base font-bold" style={{ color: theme.colors.textPrimary }}>
                            Follow up with {first}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>{to}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                        style={{ backgroundColor: dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }}
                    >
                        <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                    </button>
                </div>

                {/* Email preview */}
                <div className="mx-5 mb-4 rounded-2xl p-4" style={{
                    backgroundColor: dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
                }}>
                    <div className="flex items-center gap-2 mb-3 pb-2.5" style={{ borderBottom: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` }}>
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
                        <span className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>Subject:</span>
                        <span className="text-xs" style={{ color: theme.colors.textPrimary }}>{subject}</span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: theme.colors.textPrimary }}>
                        {body}
                    </p>
                </div>

                {/* CTA */}
                <div className="px-5 pb-5">
                    <a
                        href={mailtoHref}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold active:scale-[0.98] transition-all"
                        style={{ backgroundColor: theme.colors.accent || '#353535', color: '#fff' }}
                        onClick={onClose}
                    >
                        <Send className="w-4 h-4" />
                        Open in Email
                    </a>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ─── Fulfillment step data builder ──────────────────────────────────────────
const FULFILLMENT_STEPS = [
    { key: 'placed',      label: 'Order Placed',      Icon: Package },
    { key: 'processing',  label: 'Processing',        Icon: Clock },
    { key: 'picked-up',   label: 'Picked Up',         Icon: PackageCheck },
    { key: 'in-transit',  label: 'In Transit',        Icon: Truck },
    { key: 'delivered',   label: 'Delivered',          Icon: CheckCircle2 },
];

function buildFulfillmentSteps(order) {
    const statusMap = {
        'processing': 1,   // placed + processing active
        'in-transit': 3,   // placed + processing + picked-up + in-transit active
        'delivered':  4,   // all complete
    };
    const activeIdx = statusMap[order.status] ?? 0;

    // Generate simulated timestamps working backwards from known dates
    const orderDate = new Date(order.date);
    const deliveredDate = order.deliveredDate ? new Date(order.deliveredDate) : null;
    const etaDate = order.eta ? new Date(order.eta) : null;

    return FULFILLMENT_STEPS.map((step, i) => {
        const completed = i <= activeIdx;
        const isCurrent = i === activeIdx;
        let timestamp = null;
        let detail = null;

        if (i === 0) {
            timestamp = orderDate;
        } else if (i === 1 && completed) {
            // Processing started shortly after order
            timestamp = new Date(orderDate.getTime() + 2 * 60 * 60 * 1000); // +2h
            detail = 'Jasper, IN';
        } else if (i === 2 && completed) {
            // Picked up next business day
            timestamp = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000);
            detail = `${order.carrier || 'UPS'} · Jasper, IN`;
        } else if (i === 3) {
            if (completed && !deliveredDate) {
                // In transit now
                detail = `${order.carrier || 'UPS'} · Est. ${etaDate ? formatDate(order.eta) : 'TBD'}`;
            } else if (completed && deliveredDate) {
                timestamp = new Date(deliveredDate.getTime() - 24 * 60 * 60 * 1000);
                detail = `${order.carrier || 'UPS'}`;
            } else if (isCurrent) {
                detail = `${order.carrier || 'UPS'} · Est. ${etaDate ? formatDate(order.eta) : 'TBD'}`;
            }
        } else if (i === 4 && completed && deliveredDate) {
            timestamp = deliveredDate;
            detail = order.address?.split(',').slice(-2).join(',').trim();
        }

        return { ...step, completed, isCurrent, timestamp, detail };
    });
}

// ─── Tracking modal ────────────────────────────────────────────────────────
const TrackingModal = ({ order, theme, onClose }) => {
    const dk = isDarkTheme(theme);
    const c = theme.colors;
    const [copied, setCopied] = useState(false);

    const steps = useMemo(() => buildFulfillmentSteps(order), [order]);

    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG['processing'];

    const carrierUrl = order.carrier === 'FedEx'
        ? `https://www.fedex.com/fedextrack/?trknbr=${order.tracking}`
        : `https://www.ups.com/track?tracknum=${order.tracking}`;

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(order.tracking);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = order.tracking;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [order.tracking]);

    const fmtTime = (d) => {
        if (!d) return '';
        const date = d instanceof Date ? d : new Date(d);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    return (
        <motion.div
            className="fixed inset-0 flex items-end justify-center"
            style={{ zIndex: UNIFIED_MODAL_Z }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={UNIFIED_BACKDROP_TRANSITION}
        >
            {/* Backdrop */}
            <motion.div
                className="absolute inset-0"
                style={getUnifiedBackdropStyle(dk)}
                onClick={onClose}
            />
            {/* Sheet */}
            <motion.div
                className="relative w-full max-w-lg mx-4 mb-6 rounded-3xl overflow-hidden"
                style={{
                    backgroundColor: dk ? '#2A2A2A' : '#FFFFFF',
                    boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
                    maxHeight: 'calc(100dvh - 80px)',
                }}
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            >
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100dvh - 80px)' }}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-5 pb-1">
                        <div>
                            <p className="text-base font-bold" style={{ color: c.textPrimary }}>
                                Track Package
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: c.textSecondary }}>
                                {order.shipTo} · {order.id}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                            style={{ backgroundColor: dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }}
                        >
                            <X className="w-4 h-4" style={{ color: c.textSecondary }} />
                        </button>
                    </div>

                    {/* Status banner */}
                    <div className="mx-5 mt-3 mb-1 rounded-2xl px-4 py-3 flex items-center gap-3"
                        style={{ backgroundColor: status.bg(dk), border: `1px solid ${status.color}20` }}>
                        <status.icon className="w-5 h-5 flex-shrink-0" style={{ color: status.color }} />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold" style={{ color: status.color }}>
                                {status.label}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: c.textSecondary }}>
                                {order.status === 'delivered' && order.deliveredDate
                                    ? `Delivered ${formatFullDate(order.deliveredDate)}`
                                    : order.eta
                                        ? `Estimated delivery ${formatDate(order.eta)}`
                                        : 'Tracking updates will appear here'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Fulfillment timeline */}
                    <div className="px-5 py-4">
                        <div className="flex flex-col">
                            {steps.map((step, i) => {
                                const isLast = i === steps.length - 1;
                                const StepIcon = step.Icon;
                                const iconColor = step.completed ? status.color : dk ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
                                const lineColor = step.completed && !isLast
                                    ? status.color
                                    : dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

                                return (
                                    <div key={step.key} className="flex gap-3" style={{ minHeight: isLast ? 'auto' : 52 }}>
                                        {/* Timeline column */}
                                        <div className="flex flex-col items-center flex-shrink-0" style={{ width: 28 }}>
                                            <div
                                                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                                style={{
                                                    backgroundColor: step.completed ? `${status.color}18` : 'transparent',
                                                    border: step.completed ? 'none' : `1.5px solid ${dk ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)'}`,
                                                }}
                                            >
                                                {step.completed ? (
                                                    step.isCurrent ? (
                                                        <CircleDot className="w-3.5 h-3.5" style={{ color: iconColor }} />
                                                    ) : (
                                                        <Check className="w-3.5 h-3.5" style={{ color: iconColor }} />
                                                    )
                                                ) : (
                                                    <Circle className="w-3 h-3" style={{ color: iconColor }} />
                                                )}
                                            </div>
                                            {!isLast && (
                                                <div
                                                    className="flex-1"
                                                    style={{
                                                        width: 2,
                                                        minHeight: 24,
                                                        backgroundColor: lineColor,
                                                        borderRadius: 1,
                                                        opacity: step.completed ? 0.5 : 0.6,
                                                    }}
                                                />
                                            )}
                                        </div>

                                        {/* Content column */}
                                        <div className="flex-1 min-w-0 pb-2" style={{ marginTop: -1 }}>
                                            <p
                                                className={`text-[0.8125rem] leading-tight ${step.completed ? 'font-semibold' : 'font-medium'}`}
                                                style={{
                                                    color: step.completed ? c.textPrimary : c.textSecondary,
                                                    opacity: step.completed ? 1 : 0.5,
                                                }}
                                            >
                                                {step.label}
                                            </p>
                                            {step.timestamp && (
                                                <p className="text-[0.6875rem] mt-0.5" style={{ color: c.textSecondary, opacity: 0.7 }}>
                                                    {fmtTime(step.timestamp)}
                                                </p>
                                            )}
                                            {step.detail && (
                                                <p className="text-[0.6875rem] mt-0.5" style={{ color: c.textSecondary, opacity: 0.5 }}>
                                                    {step.detail}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tracking number + copy */}
                    <div className="mx-5 mb-4">
                        <div
                            className="rounded-xl flex items-center justify-between px-3.5 py-3"
                            style={{
                                backgroundColor: dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                                border: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
                            }}
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-[0.625rem] font-bold uppercase tracking-[0.1em]" style={{ color: c.textSecondary, opacity: 0.5 }}>
                                    {order.carrier || 'UPS'} Tracking
                                </p>
                                <p className="text-sm font-mono mt-0.5 truncate" style={{ color: c.textPrimary }}>
                                    {order.tracking}
                                </p>
                            </div>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold active:scale-95 transition-all flex-shrink-0 ml-3"
                                style={{
                                    backgroundColor: copied
                                        ? `${status.color}15`
                                        : dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                    color: copied ? status.color : c.textPrimary,
                                }}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    {copied ? (
                                        <motion.span key="check" className="flex items-center gap-1.5"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.8, opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                            Copied
                                        </motion.span>
                                    ) : (
                                        <motion.span key="copy" className="flex items-center gap-1.5"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.8, opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                            Copy
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-5 pb-5 flex gap-2.5">
                        <a
                            href={carrierUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold active:scale-[0.98] transition-all"
                            style={{ backgroundColor: c.accent || '#353535', color: '#fff' }}
                        >
                            <ExternalLink className="w-4 h-4" />
                            View on {order.carrier || 'UPS'}
                        </a>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ─── Order card ─────────────────────────────────────────────────────────────
const OrderCard = ({ order, theme, expanded, onToggle, onFollowUp, onTrack }) => {
    const dk = isDarkTheme(theme);
    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG['processing'];
    const badge = TYPE_BADGE[order.shipToType] || TYPE_BADGE['personal'];
    const StatusIcon = status.icon;
    const totalItems = order.items.reduce((s, i) => s + i.qty, 0);

    return (
        <div
            className="rounded-2xl overflow-hidden transition-all"
            style={{ ...cardSurface(theme) }}
        >
            {/* Summary row */}
            <button
                onClick={onToggle}
                className="w-full text-left px-4 py-3.5 transition-colors active:opacity-80"
            >
                <div className="flex items-start gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: status.bg(dk) }}
                    >
                        <StatusIcon className="w-[18px] h-[18px]" style={{ color: status.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-[0.9375rem] truncate" style={{ color: theme.colors.textPrimary }}>
                                {order.shipTo}
                            </p>
                            <span
                                className="text-[0.5625rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: `${badge.color}12`, color: badge.color }}
                            >
                                {badge.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs" style={{ color: theme.colors.textSecondary }}>{relativeDate(order.date)}</span>
                            <span className="text-xs opacity-40" style={{ color: theme.colors.textSecondary }}>·</span>
                            <span className="text-xs" style={{ color: theme.colors.textSecondary }}>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                            {!order.orderedBy.isCurrentUser && (
                                <>
                                    <span className="text-xs opacity-40" style={{ color: theme.colors.textSecondary }}>·</span>
                                    <span className="text-xs flex items-center gap-1" style={{ color: theme.colors.textSecondary }}>
                                        <User className="w-2.5 h-2.5" /> {order.orderedBy.name.split(' ')[0]}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 mt-1">
                        <span
                            className="text-[0.6875rem] font-semibold px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: status.bg(dk), color: status.color }}
                        >
                            {status.label}
                        </span>
                        <motion.div
                            animate={{ rotate: expanded ? 90 : 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        >
                            <ChevronRight className="w-4 h-4" style={{ color: theme.colors.textSecondary, opacity: 0.4 }} />
                        </motion.div>
                    </div>
                </div>
            </button>

            {/* Expanded detail */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 flex flex-col gap-3">
                            {/* Divider */}
                            <div style={{ height: 1, backgroundColor: dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }} />

                            {/* Items */}
                            <div className="flex flex-col gap-1">
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between py-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }} />
                                            <span className="text-sm" style={{ color: theme.colors.textPrimary }}>{item.name}</span>
                                            <span className="text-[0.6875rem]" style={{ color: theme.colors.textSecondary }}>{item.code}</span>
                                        </div>
                                        <span className="text-sm font-semibold tabular-nums" style={{ color: theme.colors.textSecondary }}>×{item.qty}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Details */}
                            <div className="flex flex-col gap-1.5 pt-1">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
                                    <span className="text-xs" style={{ color: theme.colors.textSecondary }}>{order.address}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 flex-shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
                                    <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                        Ordered {formatFullDate(order.date)}
                                        {order.deliveredDate && ` · Delivered ${formatDate(order.deliveredDate)}`}
                                        {order.eta && order.status !== 'delivered' && ` · ETA ${formatDate(order.eta)}`}
                                    </span>
                                </div>
                                {order.id && (
                                    <div className="flex items-center gap-2">
                                        <Package className="w-3 h-3 flex-shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
                                        <span className="text-xs font-mono" style={{ color: theme.colors.textSecondary }}>{order.id}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2 pt-1">
                                {order.tracking && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onTrack(order); }}
                                        className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full active:scale-95 transition-all"
                                        style={{ background: dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', color: theme.colors.textPrimary }}
                                    >
                                        <Truck className="w-3 h-3" />
                                        Track Package
                                    </button>
                                )}
                                {!order.orderedBy.isCurrentUser && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onFollowUp(order); }}
                                        className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full active:scale-95 transition-all"
                                        style={{ background: dk ? 'rgba(74,124,89,0.15)' : 'rgba(74,124,89,0.08)', color: '#4A7C59' }}
                                    >
                                        <Mail className="w-3 h-3" />
                                        Follow Up
                                    </button>
                                )}
                            </div>

                            {/* "Ordered by someone else" banner */}
                            {!order.orderedBy.isCurrentUser && (
                                <div
                                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl mt-0.5"
                                    style={{ backgroundColor: dk ? 'rgba(212,168,67,0.08)' : 'rgba(212,168,67,0.05)', border: `1px solid ${dk ? 'rgba(212,168,67,0.12)' : 'rgba(212,168,67,0.10)'}` }}
                                >
                                    <User className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#D4A843' }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold" style={{ color: theme.colors.textPrimary }}>
                                            Ordered by {order.orderedBy.name}
                                        </p>
                                        <p className="text-[0.6875rem] mt-0.5" style={{ color: theme.colors.textSecondary }}>
                                            This request came from an external contact
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Main screen ────────────────────────────────────────────────────────────
export const SampleOrdersScreen = ({ theme, sampleOrders = INITIAL_SAMPLE_ORDERS }) => {
    const [expandedId, setExpandedId] = useState(null);
    const [tab, setTab] = useState('current');
    const [followUpOrder, setFollowUpOrder] = useState(null);
    const [trackingOrder, setTrackingOrder] = useState(null);

    const currentOrders = useMemo(() =>
        [...(Array.isArray(sampleOrders) ? sampleOrders : [])]
            .filter((order) => order.status !== 'delivered')
            .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [sampleOrders]);
    const pastOrders = useMemo(() =>
        [...(Array.isArray(sampleOrders) ? sampleOrders : [])]
            .filter((order) => order.status === 'delivered')
            .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [sampleOrders]);

    const orders = tab === 'current' ? currentOrders : pastOrders;

    const tabOptions = [
        { value: 'current', label: `Current (${currentOrders.length})` },
        { value: 'past', label: `Past (${pastOrders.length})` },
    ];

    const handleFollowUp = useCallback((order) => setFollowUpOrder(order), []);
    const handleTrack = useCallback((order) => setTrackingOrder(order), []);

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
            {/* Header */}
            <div className="px-4 pt-4 pb-1">
                <h1 className="text-[1.375rem] font-black tracking-tight" style={{ color: theme.colors.textPrimary }}>
                    Sample Orders
                </h1>
                <p className="text-sm mt-0.5" style={{ color: theme.colors.textSecondary }}>
                    {sampleOrders.length} orders · {currentOrders.length} active
                </p>
            </div>

            {/* Toggle */}
            <div className="px-4 pt-3 pb-3">
                <SegmentedToggle
                    value={tab}
                    onChange={setTab}
                    options={tabOptions}
                    theme={theme}
                    size="sm"
                />
            </div>

            {/* Orders list */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-10">
                <div className="max-w-content mx-auto w-full flex flex-col gap-2.5">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tab}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18 }}
                            className="flex flex-col gap-2.5"
                        >
                            {orders.map(order => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    theme={theme}
                                    expanded={expandedId === order.id}
                                    onToggle={() => setExpandedId(prev => prev === order.id ? null : order.id)}
                                    onFollowUp={handleFollowUp}
                                    onTrack={handleTrack}
                                />
                            ))}
                            {orders.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 gap-3">
                                    <Package className="w-10 h-10" style={{ color: theme.colors.textSecondary, opacity: 0.25 }} />
                                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                        {tab === 'current' ? 'No active orders right now' : 'No past orders yet'}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Follow-up modal */}
            <AnimatePresence>
                {followUpOrder && (
                    <FollowUpModal
                        order={followUpOrder}
                        theme={theme}
                        onClose={() => setFollowUpOrder(null)}
                    />
                )}
            </AnimatePresence>

            {/* Tracking modal */}
            <AnimatePresence>
                {trackingOrder && (
                    <TrackingModal
                        order={trackingOrder}
                        theme={theme}
                        onClose={() => setTrackingOrder(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
