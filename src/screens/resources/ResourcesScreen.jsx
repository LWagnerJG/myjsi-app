import React, { useMemo } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { 
    Database, Search, Share2, FileText, DollarSign, Calendar, Percent,
    Palette, Package, Users, MapPin, MonitorPlay, Wrench, Clock
} from 'lucide-react';
import * as Data from '../../data.jsx';

export const ResourcesScreen = ({ theme, onNavigate }) => {
    const resourceCategories = useMemo(() => {
        return Data.RESOURCES_DATA || [];
    }, []);

    const getResourceIcon = (label) => {
        if (label.includes('Lead Times')) return Clock;
        if (label.includes('Commission') || label.includes('Discount')) return DollarSign;
        if (label.includes('Contract')) return FileText;
        if (label.includes('Social')) return Share2;
        if (label.includes('Percent') || label.includes('Sample')) return Percent;
        if (label.includes('Search Fabrics')) return Search;
        if (label.includes('Discontinued')) return Palette;
        if (label.includes('Loaner')) return Package;
        if (label.includes('Dealer')) return Users;
        if (label.includes('Field Visit')) return MapPin;
        if (label.includes('Presentations')) return MonitorPlay;
        if (label.includes('Install')) return Wrench;
        if (label.includes('Design Days')) return Calendar;
        return Database;
    };

    const ResourceListItem = ({ item }) => {
        const IconComponent = getResourceIcon(item.label);
        return (
            <button
                onClick={() => onNavigate(item.nav)}
                className="w-full p-4 text-left rounded-2xl transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98]"
                style={{ 
                    backgroundColor: theme.colors.surface,
                }}
            >
                <div className="flex items-center space-x-4">
                    <IconComponent 
                        className="w-6 h-6" 
                        style={{ color: theme.colors.accent }} 
                        strokeWidth={1.5}
                    />
                    <span className="font-semibold text-base" style={{ color: theme.colors.textPrimary }}>
                        {item.label}
                    </span>
                </div>
            </button>
        );
    };

    const CategorySection = ({ category }) => (
        <GlassCard theme={theme} className="overflow-hidden">
            <div className="px-4 pt-4 pb-3">
                <h3 className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>
                    {category.category}
                </h3>
            </div>
            <div className="p-2 space-y-1">
                {category.items?.map((item) => (
                    <ResourceListItem 
                        key={item.nav} 
                        item={item} 
                    />
                ))}
            </div>
        </GlassCard>
    );

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
                <div className="space-y-4">
                    {resourceCategories.map((category) => (
                        <CategorySection 
                            key={category.category}
                            category={category}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
