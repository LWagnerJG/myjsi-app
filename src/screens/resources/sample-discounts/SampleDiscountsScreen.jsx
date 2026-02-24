import React, { useCallback } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { Copy } from 'lucide-react';
import { SAMPLE_POLICIES } from './data.js';

export const SampleDiscountsScreen = ({ theme, setSuccessMessage }) => {
    const text = theme.colors.textPrimary;
    const sub = theme.colors.textSecondary;
    const accent = theme.colors.accent;

    const handleCopy = useCallback((ssa) => {
        const full = `SSA ${ssa}`;
        const doSet = (msg) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(''), 1200); };
        if (!navigator.clipboard) {
            try { const ta = document.createElement('textarea'); ta.value = full; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); doSet('SSA# Copied!'); } catch { doSet('Copy failed'); }
            return;
        }
        navigator.clipboard.writeText(full).then(() => doSet('SSA# Copied!')).catch(() => doSet('Copy failed'));
    }, [setSuccessMessage]);

    return (
        <div className="flex flex-col h-full app-header-offset">
            {/* Header */}
            <div className="px-5 pt-5 pb-3">
                <h1
                    className="text-3xl font-bold tracking-tight"
                    style={{ color: text, letterSpacing: '-0.02em' }}
                >
                    Sample Policies
                </h1>
            </div>

            {/* Policy cards */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pb-8">
                <div className="space-y-2.5">
                    {SAMPLE_POLICIES.map((policy) => (
                        <GlassCard key={policy.id} theme={theme}>
                            <div className="flex items-center gap-4 px-4 py-3.5">
                                {/* Discount badge — fixed width for alignment */}
                                <div
                                    className="flex-shrink-0 w-[62px] py-2 rounded-2xl text-center"
                                    style={{ backgroundColor: accent + '0A' }}
                                >
                                    <span className="text-[22px] font-extrabold leading-none" style={{ color: accent }}>
                                        {policy.discount}%
                                    </span>
                                    <p className="text-[7px] font-bold uppercase tracking-[0.1em] mt-0.5" style={{ color: accent, opacity: 0.45 }}>
                                        Off List
                                    </p>
                                </div>

                                {/* Title + SSA + notes */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-[15px] leading-snug" style={{ color: text }}>
                                        {policy.title}
                                    </h3>
                                    {policy.subtitle && (
                                        <p className="text-[11px] mt-px font-medium leading-snug" style={{ color: sub, opacity: 0.65 }}>
                                            {policy.subtitle}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <button
                                            onClick={() => handleCopy(policy.ssa)}
                                            className="inline-flex items-center gap-1 px-2 py-[3px] rounded-md text-[11px] font-semibold transition-all active:scale-95"
                                            style={{ backgroundColor: theme.colors.subtle, color: text }}
                                        >
                                            {policy.ssa}
                                            <Copy className="w-2.5 h-2.5" style={{ color: sub, opacity: 0.4 }} />
                                        </button>
                                        {policy.notes.length > 0 && (
                                            <span className="text-[10px] font-medium" style={{ color: sub, opacity: 0.5 }}>
                                                {policy.notes.join('  ·  ')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </div>
    );
};
