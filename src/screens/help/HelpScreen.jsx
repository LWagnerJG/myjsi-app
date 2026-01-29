import React, { useState } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { PillButton } from '../../components/common/JSIButtons.jsx';
import { ChevronDown, ChevronUp, Mail, Phone, Info } from 'lucide-react';

const Pill = ({ children, theme }) => (
    <span
        className="px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.surface,
            color: theme.colors.textSecondary,
        }}
    >
        {children}
    </span>
);

const QAItem = ({ q, a, theme, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div
            className="rounded-2xl border"
            style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}
        >
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-3 p-4 rounded-2xl"
            >
                <div className="flex items-center gap-2 text-left">
                    <Info className="w-4 h-4" style={{ color: theme.colors.accent }} />
                    <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                        {q}
                    </span>
                </div>
                {open ? (
                    <ChevronUp className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                ) : (
                    <ChevronDown className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                )}
            </button>
            {open && (
                <div className="px-4 pb-4 -mt-2 text-sm leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                    {a}
                </div>
            )}
        </div>
    );
};

export const HelpScreen = ({ theme, showAlert }) => {
    const faqs = [
        {
            q: 'How do I create a new lead or project?',
            a: 'From the Projects screen, tap New Lead. Fill in the basic details and tap Save. You can edit value, stage, and competitors any time from the project details page.',
        },
        {
            q: 'Where can I see sample finishes and add to cart?',
            a: 'Go to Samples. Tap a tile to add it to the cart. Use the +/- controls on each tile to adjust quantities. The cart drawer appears at the bottom and updates right away.',
        },
        {
            q: 'How do I search the app?',
            a: 'Use the Ask me anything bar on Home. Start typing to jump to areas of the app or submit a quick question.',
        },
        {
            q: 'Can I swipe back to the previous screen?',
            a: 'Yes. Swipe from the left edge to go back, or use the back arrow in the top bar.',
        },
        {
            q: 'How do I switch between light and dark mode?',
            a: 'Open the profile button in the top bar and toggle the theme switch.',
        },
        {
            q: 'My cart did not update. What should I try?',
            a: 'Check your connection and try again. If the issue continues, clear the cart from the drawer and re-add items. You can also contact support below.',
        },
    ];

    const copyEmail = async () => {
        try {
            await navigator.clipboard?.writeText('support@jsi.example.com');
            showAlert?.('Support email copied to clipboard.');
        } catch {
            showAlert?.('Could not copy email. You can type it manually: support@jsi.example.com');
        }
    };

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4 scrollbar-hide">
                

                <GlassCard theme={theme} className="p-4 space-y-3">
                    {faqs.map((item, i) => (
                        <QAItem key={i} q={item.q} a={item.a} theme={theme} defaultOpen={i === 0} />
                    ))}
                </GlassCard>

                <GlassCard theme={theme} className="p-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full" style={{ backgroundColor: theme.colors.subtle }}>
                            <Mail className="w-6 h-6" style={{ color: theme.colors.accent }} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                                Contact Support
                            </h3>
                            <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                                Weekdays 8:00 AM - 5:00 PM (ET)
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <PillButton
                                    type="button"
                                    size="compact"
                                    theme={theme}
                                    onClick={() => window.location.href = 'mailto:support@jsi.example.com?subject=MyJSI%20Support'}
                                >
                                    <Mail className="inline w-4 h-4 mr-1" />
                                    Email support@jsi.example.com
                                </PillButton>

                                <PillButton
                                    type="button"
                                    size="compact"
                                    theme={theme}
                                    onClick={() => window.location.href = 'tel:+18005551234'}
                                >
                                    <Phone className="inline w-4 h-4 mr-1" />
                                    Call (800) 555-1234
                                </PillButton>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
