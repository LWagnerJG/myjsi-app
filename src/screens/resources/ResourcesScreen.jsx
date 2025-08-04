import React, { useMemo } from 'react';
import { 
    Database, Search, Share2, FileText, DollarSign, Calendar, Percent,
    Palette, Package, Users, MapPin, MonitorPlay, Wrench, Clock
} from 'lucide-react';
import * as Data from '../../data.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';

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

    const getCategoryIcon = (categoryName) => {
        switch (categoryName) {
            case 'Product & Finish Resources':
                return Palette;
            case 'Sales & Rep Tools':
                return DollarSign;
            case 'Dealer & Field Support':
                return Wrench;
            case 'Marketing & Communication':
                return Share2;
            default:
                return Database;
        }
    };

    const ResourceCard = ({ item }) => {
        const IconComponent = getResourceIcon(item.label);
        
        return (
            <button
                onClick={() => onNavigate(item.nav)}
                className="group w-full p-3 text-left rounded-2xl transition-all duration-200 hover:shadow-md active:scale-[0.98] border-0 flex flex-col items-center justify-center text-center"
                style={{ backgroundColor: theme.colors.surface, minHeight: '80px' }}
            >
                <div 
                    className="w-10 h-10 mb-2 rounded-full flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                    style={{ backgroundColor: theme.colors.subtle }}
                >
                    <IconComponent 
                        className="w-5 h-5" 
                        style={{ color: theme.colors.accent }} 
                        strokeWidth={1.5}
                    />
                </div>
                <h4 className="font-medium text-xs leading-tight" style={{ color: theme.colors.textPrimary }}>
                    {item.label}
                </h4>
            </button>
        );
    };

    const CategorySection = ({ category, isFirst }) => {
        const CategoryIcon = getCategoryIcon(category.category);
        
        return (
            <div className={`space-y-3 ${!isFirst ? 'pt-4 border-t' : ''}`} style={{borderColor: theme.colors.border}}>
                {/* Compact Category Header */}
                <div className="flex items-center space-x-2 px-1">
                    <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: theme.colors.subtle }}
                    >
                        <CategoryIcon className="w-3.5 h-3.5" style={{ color: theme.colors.accent }} />
                    </div>
                    <h3 className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>
                        {category.category}
                    </h3>
                </div>
                
                {/* Compact Grid */}
                <div className="grid grid-cols-2 gap-2">
                    {category.items?.map((item) => (
                        <ResourceCard 
                            key={item.nav} 
                            item={item}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            {/* Content with minimal padding */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 scrollbar-hide">
                <GlassCard theme={theme} className="p-3 space-y-4">
                    {resourceCategories.map((category, index) => (
                        <CategorySection 
                            key={category.category}
                            category={category}
                            isFirst={index === 0}
                        />
                    ))}
                </GlassCard>
            </div>
        </div>
    );
};
