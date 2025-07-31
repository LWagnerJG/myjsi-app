import React from 'react';
import { GlassCard } from '../common/GlassCard.jsx';

export const FormSection = ({ title, children, theme }) => (
    <GlassCard theme={theme} className="p-4">
        <h3 className="text-xl font-bold mb-4 pb-2 border-b" 
            style={{ 
                color: theme.colors.textPrimary, 
                borderColor: theme.colors.border 
            }}>
            {title}
        </h3>
        {children}
    </GlassCard>
);

export const SettingsRow = ({ label, children, isFirst = false, theme }) => (
    <div 
        className={`flex items-center justify-between min-h-[60px] py-2 ${!isFirst ? 'border-t' : ''}`} 
        style={{ borderColor: theme.colors.border }}
    >
        <label className="font-semibold" style={{ color: theme.colors.textPrimary }}>
            {label}
        </label>
        {children}
    </div>
);