import React from 'react';
import { GlassCard } from './GlassCard';

export const Card = ({ children, ...props }) => (
    <GlassCard {...props}>{children}</GlassCard>
);
