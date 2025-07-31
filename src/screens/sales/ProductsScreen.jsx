import React from 'react';
import { PageTitle } from '../common/PageTitle';
import { GlassCard } from '../common/GlassCard';

export const ProductsScreen = ({ theme }) => (
    <div className="p-4">
        <PageTitle title="Products" theme={theme} />
        <GlassCard theme={theme} className="p-8 text-center">
            <p style={{ color: theme.colors.textPrimary }}>Products catalog coming soon.</p>
        </GlassCard>
    </div>
);
