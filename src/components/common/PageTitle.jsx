import React from 'react';
import { ArrowLeft } from 'lucide-react';

export const PageTitle = React.memo(({ title, theme, onBack, children, showBack = true }) => (
    <div className="px-4 pt-6 pb-4 flex justify-between items-center">
        <div className="flex-1 flex items-center space-x-2">
            {onBack && showBack && (
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                    <ArrowLeft className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                </button>
            )}
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>{title}</h1>
        </div>
        {children}
    </div>
));
