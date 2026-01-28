import React from 'react';
import { GlassCard } from '../common/GlassCard.jsx';
import { DESIGN_TOKENS } from '../../design-system/tokens.js';

export const FormSection = ({ title, children, theme }) => (
    <GlassCard theme={theme} className="p-6 lg:p-8">
        <h3
            className="text-xl lg:text-2xl font-bold mb-6 pb-4 border-b"
            style={{
                color: theme.colors.textPrimary,
                borderColor: theme.colors.border,
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                letterSpacing: '-0.02em',
                lineHeight: 1.2
            }}
        >
            {title}
        </h3>
        {children}
    </GlassCard>
);

export const SettingsRow = ({ label, children, isFirst = false, theme, className = '' }) => (
    <div
        className={`settings-row flex flex-col gap-3 py-4 ${!isFirst ? 'border-t border-solid' : ''} ${className}`}
        style={{ borderColor: theme.colors.border }}
    >
        <label
            className="font-semibold text-base"
            style={{
                color: theme.colors.textPrimary,
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                letterSpacing: '-0.01em'
            }}
        >
            {label}
        </label>
        {children}
    </div>
);