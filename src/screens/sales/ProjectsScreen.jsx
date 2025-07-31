import React from 'react';
import { PageTitle } from '../common/PageTitle';
import { GlassCard } from '../common/GlassCard';

export const ProjectsScreen = ({ theme }) => (
    <div className="p-4">
        <PageTitle title="Projects" theme={theme} />
        <GlassCard theme={theme} className="p-8 text-center">
            <p style={{ color: theme.colors.textPrimary }}>Projects management coming soon.</p>
        </GlassCard>
    </div>
);
