import React, { useMemo } from 'react';
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
                className="group w-full p-4 text-left rounded-3xl transition-all duration-200 hover:shadow-md active:scale-[0.98] border-0 flex items-center space-x-4"
                style={{ backgroundColor: theme.colors.surface }}
            >
                <div 
                    className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                    style={{ backgroundColor: theme.colors.subtle }}
                >
                    <IconComponent 
                        className="w-6 h-6" 
                        style={{ color: theme.colors.accent }} 
                        strokeWidth={1.5}
                    />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-base" style={{ color: theme.colors.textPrimary }}>
                        {item.label}
                    </h4>
                </div>
            </button>
        );
    };

    const CategorySection = ({ category }) => {
        const CategoryIcon = getCategoryIcon(category.category);
        
        return (
            <div className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center space-x-3 px-2">
                    <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: theme.colors.subtle }}
                    >
                        <CategoryIcon className="w-5 h-5" style={{ color: theme.colors.accent }} />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>
                            {category.category}
                        </h3>
                    </div>
                </div>
                
                {/* Grid of Resource Cards */}
                <div className="grid grid-cols-2 gap-3">
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
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4 space-y-8 scrollbar-hide">
                {resourceCategories.map((category) => (
                    <CategorySection 
                        key={category.category}
                        category={category}
                    />
                ))}
            </div>
        </div>
    );
};
