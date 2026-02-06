import React from 'react';
import { GlassCard } from './GlassCard.jsx';
import { Loader2 } from 'lucide-react';

// Essential UI Components
export const Card = ({ children, ...props }) => <GlassCard {...props}>{children}</GlassCard>;

export const Icon = ({ uri, size = 24, className = "" }) => (
    <img src={uri} alt="icon" className={className} style={{ width: size, height: size }} />
);

// Reusable loading spinner with theme support
export const LoadingSpinner = ({ theme, size = 'md', className = '', fullScreen = false }) => {
    const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' };
    const sizeClass = sizes[size] || sizes.md;

    const spinner = (
        <Loader2
            className={`animate-spin ${sizeClass} ${className}`}
            style={{ color: theme?.colors?.accent || '#353535' }}
        />
    );

    if (fullScreen) {
        return (
            <div className="flex flex-col h-full app-header-offset">
                <div className="flex-1 flex items-center justify-center">
                    {spinner}
                </div>
            </div>
        );
    }

    return spinner;
};

// Skeleton loader for content placeholders
export const Skeleton = ({ className = '', style = {} }) => (
    <div
        className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`}
        style={style}
    />
);