import React, { useMemo } from 'react';
import {
    Database, Search, Share2, FileText, DollarSign, Calendar, Percent,
    Palette, Package, Users, MapPin, MonitorPlay, Wrench, Clock, ChevronRight
} from 'lucide-react';
import { RESOURCES_DATA } from './data.js';
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
    const resourceCategories = useMemo(() => RESOURCES_DATA || [], []);

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

    const Row = ({ item, isFirst }) => {
        const Icon = getResourceIcon(item.label);
        const sub = sublabelMap[item.label] || 'Access resource';

        const borderTop = isFirst ? 'transparent' : theme.colors.border;

        return (
            <li>
                <button
                    onClick={() => onNavigate(item.nav)}
                    className="group w-full py-3 text-left flex items-center transition-colors duration-150"
                    style={{
                        backgroundColor: 'transparent',
                        borderTop: `1px solid ${borderTop}`,
                        borderBottom: '1px solid transparent'
                    }}
                >
                    <div
                        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                        style={{ backgroundColor: theme.colors.subtle }}
                    >
                        <Icon className="w-5 h-5" style={{ color: theme.colors.accent }} strokeWidth={1.5} />
                    </div>

                    <div className="flex-1 ml-4">
                        <h4 className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
                            {item.label}
                        </h4>
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                            {sub}
                        </p>
                    </div>

                    <ChevronRight
                        className="w-5 h-5 ml-2 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                        style={{ color: theme.colors.border }}
                    />
                </button>
            </li>
        );
    };

    const CategoryCard = ({ category, isFirst }) => {
        return (
            <section className={isFirst ? '' : 'pt-6'}>
                <GlassCard theme={theme} className="p-2">
                    <h3
                        className="text-lg font-semibold text-center mb-2"
                        style={{ color: theme.colors.textPrimary }}
                    >
                        {category.category}
                    </h3>
                    <ul>
                        {category.items?.map((item, idx) => (
                            <Row key={item.nav} item={item} isFirst={idx === 0} />
                        ))}
                    </ul>
                </GlassCard>
            </section>
        );
    };

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4">
                {resourceCategories.map((cat, i) => (
                    <CategoryCard key={cat.category} category={cat} isFirst={i === 0} />
                ))}
            </div>
        </div>
    );
};
