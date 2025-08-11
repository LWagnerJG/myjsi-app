import React, { useMemo } from 'react';
import {
    Database, Search, Share2, FileText, DollarSign, Calendar, Percent,
    Palette, Package, Users, MapPin, MonitorPlay, Wrench, Clock, ChevronRight
} from 'lucide-react';
import * as Data from '../../data.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';

const sublabelMap = {
    'Lead Times': 'Check current production time estimates',
    'Discontinued Finishes Database': 'Look up archived finishes and fabrics',
    'Request COM Yardage': 'Calculate and request customer materials',
    'Search Fabrics': 'Browse all available JSI textiles',
    'Commission Rates': 'View your current rate sheet',
    'Contracts': 'Access active and pending agreements',
    'Dealer Directory': 'Find contact information for dealers',
    'Sample Discounts': 'View available discounts for samples',
    'Install Instructions': 'Get guides for product installation',
    'Loaner Pool': 'Request or return showroom samples',
    'Field Visit Request': 'Schedule a visit from a JSI representative',
    'Social Media Assets': 'Download approved images and copy',
    'Presentations': 'Access official JSI slideshows & templates'
};

export const ResourcesScreen = ({ theme, onNavigate }) => {
    const resourceCategories = useMemo(() => Data.RESOURCES_DATA || [], []);

    const getResourceIcon = (label) => {
        if (label.includes('Lead Times')) return Clock;
        if (label.includes('Commission')) return DollarSign;
        if (label.includes('Contract')) return FileText;
        if (label.includes('Social')) return Share2;
        if (label.includes('Sample')) return Percent;
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
        const sublabel = sublabelMap[item.label] || 'Access resource';

        return (
            <li>
                <button
                    onClick={() => onNavigate(item.nav)}
                    // TWEAK: Increased roundness to 'rounded-full' for a pill shape.
                    className="group w-full p-3 text-left rounded-full transition-all duration-200 hover:shadow-md active:scale-[0.99] flex items-center border"
                    style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
                >
                    <div
                        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                        // STYLE CHANGE: Simplified style, no more conditional border.
                        style={{ backgroundColor: theme.colors.subtle }}
                    >
                        <IconComponent
                            className="w-5 h-5"
                            style={{ color: theme.colors.accent }}
                            // STYLE CHANGE: Consistent stroke width for all icons.
                            strokeWidth={1.5}
                        />
                    </div>

                    <div className="flex-1 ml-4">
                        <h4 className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
                            {item.label}
                        </h4>
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                            {sublabel}
                        </p>
                    </div>

                    <ChevronRight className="w-5 h-5 ml-2 flex-shrink-0" style={{ color: theme.colors.border }} />
                </button>
            </li>
        );
    };

    const CategorySection = ({ category, isFirst }) => {
        return (
            <div className={`space-y-3 ${!isFirst ? 'pt-5 border-t' : ''}`} style={{ borderColor: theme.colors.border }}>
                <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                    {category.category}
                </h3>

                <ul className="space-y-2">
                    {/* CHANGE: Mapping directly over category.items, as sorting is no longer needed. */}
                    {category.items?.map((item) => (
                        <ResourceListItem
                            key={item.nav}
                            item={item}
                        />
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4 scrollbar-hide">
                <GlassCard theme={theme} className="p-4 space-y-5">
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