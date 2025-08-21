import React, { useMemo, useEffect } from 'react';
import {
    Database, Search, Share2, FileText, DollarSign, Calendar, Percent,
    Palette, Package, Users, MapPin, MonitorPlay, Wrench, Clock, ChevronRight
} from 'lucide-react';
import { RESOURCES_DATA } from './data.js';
import { GlassCard } from '../../components/common/GlassCard.jsx';

const sublabelMap = {
    'Lead Times': 'Production estimates',
    'Discontinued Finishes Database': 'Legacy surface archive',
    'Request COM Yardage': 'Fabric yardage form',
    'Search Fabrics': 'Textile library',
    'Commission Rates': 'Rep commission by discount',
    'Contracts': 'Information and discounts',
    'Dealer Directory': 'Partner contact finder',
    'Sample Discounts': 'Demo pricing overview',
    'Install Instructions': 'Assembly guidance and videos',
    'Loaner Pool': 'Search sample chairs',
    'Request Field Visit': 'Onsite tech scheduling',
    'Social Media': 'Brand share kit',
    'Presentations': 'Slide deck library',
    'Design Days': 'Event schedule and agenda',
    'New Dealer Sign-Up': 'Sign up new dealers'
};

export const ResourcesScreen = ({ theme, onNavigate }) => {
    const resourceCategories = useMemo(() => RESOURCES_DATA || [], []);

    useEffect(() => {
        if (document.getElementById('resources-no-scrollbar-style')) return;
        const style = document.createElement('style');
        style.id = 'resources-no-scrollbar-style';
        style.innerHTML = `.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } .no-scrollbar::-webkit-scrollbar { display: none; }`;
        document.head.appendChild(style);
    }, []);

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
        const sub = sublabelMap[item.label] || 'Tool';
        const borderTop = isFirst ? 'transparent' : theme.colors.border;
        return (
            <li>
                <button
                    onClick={() => onNavigate(item.nav)}
                    className="group w-full pl-2 pr-2 py-3 text-left flex items-center transition-colors duration-150"
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
                    <div className="flex-1 ml-6">
                        <h4 className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
                            {item.label}
                        </h4>
                        <p className="text-xs truncate" style={{ color: theme.colors.textSecondary }}>
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

    const CategoryCard = ({ category, isFirst }) => (
        <section className={isFirst ? 'mt-6' : 'pt-8'}>
            <GlassCard theme={theme} className="px-6 py-4">
                <h3 className="text-lg font-semibold text-center mb-3" style={{ color: theme.colors.textPrimary }}>
                    {category.category}
                </h3>
                <ul className="pb-1">
                    {category.items?.map((item, idx) => (
                        <Row key={item.nav} item={item} isFirst={idx === 0} />
                    ))}
                </ul>
            </GlassCard>
        </section>
    );

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-2 pb-6">
                {resourceCategories.map((cat, i) => (
                    <CategoryCard key={cat.category} category={cat} isFirst={i === 0} />
                ))}
            </div>
        </div>
    );
};
