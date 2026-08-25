import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactDOM from 'react-dom';
import { AlertTriangle, Check, CloudOff, Loader2, RefreshCw, Wifi, X } from 'lucide-react';
import {
    DESIGN_TOKENS,
    isDarkTheme,
    sectionCardSurface,
    subtleBg,
    subtleBorder,
} from '../../../design-system/tokens.js';
import { NETWORK_LABELS, NETWORK_MODES } from '../receivingLogic.js';

export const SectionCard = ({ theme, children, className = '', style = {}, as: Tag = 'div', ...rest }) => (
    <Tag className={`px-4 py-4 sm:px-5 ${className}`} style={{ ...sectionCardSurface(theme), ...style }} {...rest}>
        {children}
    </Tag>
);

export const SectionHeading = ({ theme, children, action }) => (
    <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-[0.9375rem] font-semibold tracking-[-0.01em]" style={{ color: theme.colors.textPrimary }}>
            {children}
        </h2>
        {action || null}
    </div>
);

export const Caption = ({ theme, children, className = '' }) => (
    <p className={`text-[0.6875rem] font-medium ${className}`} style={{ color: theme.colors.textSecondary }}>
        {children}
    </p>
);

export const DemoBadge = ({ theme, label = 'Demo data' }) => (
    <span
        className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.06em]"
        style={{ backgroundColor: theme.colors.infoLight, color: theme.colors.info }}
    >
        {label}
    </span>
);

export const InfoRow = ({ theme, label, value, mono = false }) => (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
        <span className="text-[0.75rem] flex-shrink-0" style={{ color: theme.colors.textSecondary }}>{label}</span>
        <span
            className={`text-[0.8125rem] font-semibold text-right ${mono ? 'tabular-nums' : ''}`}
            style={{ color: theme.colors.textPrimary }}
        >
            {value}
        </span>
    </div>
);

export const CountTile = ({ theme, label, value, tone }) => {
    const color = tone || theme.colors.textPrimary;
    return (
        <div
            className="flex flex-col items-center justify-center rounded-2xl px-2 py-3 min-h-[64px]"
            style={{ backgroundColor: subtleBg(theme), border: subtleBorder(theme) }}
        >
            <span className="text-[1.375rem] font-bold leading-none tabular-nums" style={{ color }}>{value}</span>
            <span className="mt-1 text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-center" style={{ color: theme.colors.textSecondary }}>
                {label}
            </span>
        </div>
    );
};

export const StatusPill = ({ theme, label, tone = 'info', icon: Icon, className = '' }) => {
    const color = theme.colors[tone] || theme.colors.textSecondary;
    const bg = theme.colors[`${tone}Light`] || subtleBg(theme);
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold ${className}`}
            style={{ backgroundColor: bg, color }}
        >
            {Icon ? <Icon className="w-3 h-3" aria-hidden="true" /> : null}
            {label}
        </span>
    );
};

/** Primary warehouse-scale action. Kept large for gloved, one-handed use. */
export const BigButton = ({ theme, children, icon: Icon, tone = 'accent', onClick, disabled, type = 'button', className = '', ...rest }) => {
    const dark = isDarkTheme(theme);
    const palette = {
        accent: { bg: theme.colors.accent, fg: theme.colors.accentText },
        neutral: { bg: dark ? 'rgba(255,255,255,0.10)' : '#FFFFFF', fg: theme.colors.textPrimary },
        success: { bg: theme.colors.success, fg: '#FFFFFF' },
        danger: { bg: theme.colors.errorLight, fg: theme.colors.error },
    }[tone] || { bg: theme.colors.accent, fg: theme.colors.accentText };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`w-full min-h-[52px] px-5 rounded-full inline-flex items-center justify-center gap-2 text-[0.9375rem] font-semibold transition active:scale-[0.985] focus-ring disabled:opacity-45 ${className}`}
            style={{
                backgroundColor: palette.bg,
                color: palette.fg,
                border: tone === 'neutral' ? subtleBorder(theme) : 'none',
            }}
            {...rest}
        >
            {Icon ? <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} aria-hidden="true" /> : null}
            {children}
        </button>
    );
};

export const QuietButton = ({ theme, children, icon: Icon, onClick, className = '', ...rest }) => (
    <button
        type="button"
        onClick={onClick}
        className={`min-h-[44px] px-4 rounded-full inline-flex items-center justify-center gap-1.5 text-[0.8125rem] font-semibold transition active:scale-[0.98] focus-ring ${className}`}
        style={{ backgroundColor: subtleBg(theme), color: theme.colors.textPrimary, border: subtleBorder(theme) }}
        {...rest}
    >
        {Icon ? <Icon className="w-4 h-4" aria-hidden="true" /> : null}
        {children}
    </button>
);

export const FilterChip = ({ theme, active, children, onClick, count }) => {
    const dark = isDarkTheme(theme);
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className="min-h-[36px] px-3 rounded-full inline-flex items-center gap-1.5 text-[0.75rem] font-semibold transition active:scale-[0.97] focus-ring whitespace-nowrap"
            style={{
                backgroundColor: active ? theme.colors.accent : (dark ? 'rgba(255,255,255,0.07)' : '#FFFFFF'),
                color: active ? theme.colors.accentText : theme.colors.textPrimary,
                border: active ? 'none' : subtleBorder(theme),
            }}
        >
            {children}
            {count != null ? <span className="tabular-nums opacity-70">{count}</span> : null}
        </button>
    );
};

/** One glanceable chip for connection state plus how much work is waiting. */
export const ConnectionChip = ({ theme, network, queuedCount, failedCount, syncing, onClick }) => {
    const offline = network === NETWORK_MODES.OFFLINE;
    const tone = offline ? 'warning' : failedCount ? 'error' : queuedCount || syncing ? 'info' : 'success';
    const color = theme.colors[tone];
    const bg = theme.colors[`${tone}Light`];
    const Icon = offline ? CloudOff : syncing ? Loader2 : failedCount ? AlertTriangle : queuedCount ? RefreshCw : Wifi;

    let text = NETWORK_LABELS[network] || 'Online';
    if (syncing) text = 'Syncing';
    else if (failedCount) text = `${failedCount} failed`;
    else if (queuedCount) text = `${queuedCount} waiting to sync`;
    else if (!offline) text = 'Synced';

    return (
        <button
            type="button"
            onClick={onClick}
            className="min-h-[36px] inline-flex items-center gap-1.5 rounded-full px-3 text-[0.75rem] font-semibold transition active:scale-[0.97] focus-ring"
            style={{ backgroundColor: bg, color }}
            aria-label={`Connection: ${text}. Open demo connection panel`}
        >
            <Icon className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} aria-hidden="true" />
            {text}
        </button>
    );
};

export const ProgressBar = ({ theme, value, max, tone = 'accent' }) => {
    const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
    return (
        <div
            className="h-2 w-full rounded-full overflow-hidden"
            style={{ backgroundColor: subtleBg(theme, 1.6) }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label="Cartons scanned"
        >
            <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: theme.colors[tone] || theme.colors.accent }}
                animate={{ width: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 220, damping: 32 }}
            />
        </div>
    );
};

/** Full-screen sheet on phones, centered card on desktop. */
export const BottomSheet = ({ theme, open, onClose, title, subtitle, children, footer }) => {
    const dark = isDarkTheme(theme);

    return ReactDOM.createPortal(
        <AnimatePresence>
            {open ? (
                <motion.div
                    className="fixed inset-0 flex items-end sm:items-center justify-center"
                    style={{ zIndex: DESIGN_TOKENS.zIndex.modal, backgroundColor: theme.colors.overlay }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                >
                    <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        className="relative z-10 w-full sm:max-w-lg flex flex-col overflow-hidden"
                        style={{
                            backgroundColor: theme.colors.surface,
                            borderTopLeftRadius: 28,
                            borderTopRightRadius: 28,
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
                            border: dark ? '1px solid rgba(255,255,255,0.06)' : 'none',
                            maxHeight: '92vh',
                        }}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
                    >
                        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
                            <div className="min-w-0">
                                <h2 className="text-[1.0625rem] font-bold tracking-[-0.01em]" style={{ color: theme.colors.textPrimary }}>
                                    {title}
                                </h2>
                                {subtitle ? <Caption theme={theme} className="mt-0.5">{subtitle}</Caption> : null}
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close"
                                className="w-11 h-11 -mr-2 -mt-2 rounded-full flex items-center justify-center flex-shrink-0 focus-ring"
                                style={{ backgroundColor: subtleBg(theme) }}
                            >
                                <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} aria-hidden="true" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pb-4">{children}</div>
                        {footer ? (
                            <div
                                className="px-5 py-4 flex-shrink-0"
                                style={{ borderTop: subtleBorder(theme), paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
                            >
                                {footer}
                            </div>
                        ) : null}
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>,
        document.body
    );
};

export const FieldLabel = ({ theme, children, htmlFor }) => (
    <label htmlFor={htmlFor} className="block text-[0.75rem] font-semibold mb-1.5" style={{ color: theme.colors.textSecondary }}>
        {children}
    </label>
);

export const ChoiceRow = ({ theme, options, value, onChange, ariaLabel }) => (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ariaLabel}>
        {options.map((opt) => {
            const active = opt.value === value;
            return (
                <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onChange(opt.value)}
                    className="min-h-[44px] px-4 rounded-full text-[0.8125rem] font-semibold transition active:scale-[0.98] focus-ring"
                    style={{
                        backgroundColor: active ? theme.colors.accent : subtleBg(theme),
                        color: active ? theme.colors.accentText : theme.colors.textPrimary,
                        border: active ? 'none' : subtleBorder(theme),
                    }}
                >
                    {opt.label}
                </button>
            );
        })}
    </div>
);

export const SuccessTick = ({ theme }) => (
    <span
        className="w-6 h-6 rounded-full inline-flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: theme.colors.successLight }}
    >
        <Check className="w-3.5 h-3.5" style={{ color: theme.colors.success }} aria-hidden="true" />
    </span>
);
