import React from 'react';
import { PageTitle } from '../common/PageTitle';
import { GlassCard } from '../common/GlassCard';

export const ResourcesScreen = ({ theme }) => (
    <div className="p-4">
        <PageTitle title="Resources" theme={theme} />
        <GlassCard theme={theme} className="p-8 text-center">
            <p style={{ color: theme.colors.textPrimary }}>Resources library coming soon.</p>
        </GlassCard>
    </div>
);
