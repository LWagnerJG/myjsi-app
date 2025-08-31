import React, { useEffect, useState } from 'react';
import { CheckCircle, Mic } from 'lucide-react';
import { GlassCard } from '../common/GlassCard.jsx';

export const SuccessToast = ({ message, show, theme }) => {
    const [render, setRender] = useState(show);
    const [phase, setPhase] = useState(show ? 'enter' : 'exit');

    useEffect(() => {
        if (show) {
            setRender(true);
            requestAnimationFrame(() => setPhase('enter'));
        } else if (render) {
            setPhase('exit');
            const t = setTimeout(() => setRender(false), 260); // match css duration
            return () => clearTimeout(t);
        }
    }, [show, render]);

    if (!render) return null;
    return (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto success-toast-${phase}`}>
            <GlassCard theme={theme} className="px-6 py-3 flex items-center space-x-3 relative overflow-visible">
                <span className="absolute inset-0 rounded-[inherit] pointer-events-none toast-pulse" />
                <CheckCircle className="w-6 h-6 flex-shrink-0" style={{ color: theme.colors.accent }} />
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