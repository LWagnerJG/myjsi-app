import React from 'react';
import { GlassCard } from './GlassCard.jsx';

// Essential UI Components
export const Card = ({ children, ...props }) => <GlassCard {...props}>{children}</GlassCard>;

export const Icon = ({ uri, size = 24, className = "" }) => (
    <img src={uri} alt="icon" className={className} style={{ width: size, height: size }} />
);