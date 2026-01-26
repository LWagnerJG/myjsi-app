import React from 'react';
import { GlassCard } from '../common/GlassCard.jsx';

export const FormSection = ({ title, children, theme }) => (
    <GlassCard theme={theme} className="p-5">
        <h3
            className="text-lg font-bold mb-5 pb-3 border-b"
            style={{
                color: theme.colors.textPrimary,
                borderColor: theme.colors.border,
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                letterSpacing: '-0.02em'
            }}
        >
            {title}
        </h3>
        {children}
    </GlassCard>
);

export const SettingsRow = ({ label, children, isFirst = false, theme }) => (
    <div
        className={`flex items-start justify-between min-h-[60px] py-3 ${!isFirst ? 'border-t' : ''}`}
        style={{ borderColor: theme.colors.border }}
    >
        <label
            className="font-semibold text-sm pt-2"
            style={{
                color: theme.colors.textPrimary,
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif'
            }}
        >
            {label}
        </label>
        {children}
    </div>
);