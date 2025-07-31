import React from 'react';
import { CheckCircle, Mic } from 'lucide-react';
import { GlassCard } from '../common/GlassCard.jsx';

export const SuccessToast = ({ message, show, theme }) => {
    if (!show) return null;
    return (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
            <GlassCard theme={theme} className="px-6 py-3 flex items-center space-x-3">
                <CheckCircle className="w-6 h-6" style={{ color: theme.colors.accent }} />
                <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                    {message}
                </span>
            </GlassCard>
        </div>
    );
};

export const VoiceModal = ({ message, show, theme }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <GlassCard theme={theme} className="px-8 py-6 flex items-center space-x-4 shadow-2xl">
                <Mic className="w-7 h-7" style={{ color: theme.colors.accent }} />
                <span className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
                    {message}
                </span>
            </GlassCard>
        </div>
    );
};