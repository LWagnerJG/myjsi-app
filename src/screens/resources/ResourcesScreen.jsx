import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
    Database, Search, Share2, FileText, DollarSign, Calendar, Percent,
    Palette, Package, Users, MapPin, MonitorPlay, Wrench, Clock, ChevronRight, Gift, Scale, Plane
} from 'lucide-react';
import { RESOURCES_DATA } from './data.js';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { allApps, DEFAULT_HOME_APPS } from '../../constants/apps.js';

const sublabelMap = {
    'Lead Times': 'Production estimates',
    'Weight Ratings': 'Seating load limits',
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
    'Tour Visit': 'Facility travel planning',
    'Social Media': 'Brand share kit',
    'Presentations': 'Slide deck library',
    'Tradeshows': 'Select and view show info',
    'New Dealer Sign-Up': 'Sign up new dealers',
    'LWYD Marketplace': 'Rewards shop',
    'New Project': 'Start a new project or lead',
};

const CORE_LABELS = {
    orders: 'Orders',
    sales: 'Sales',
    products: 'Products',
    projects: 'Projects',
    'new-lead': 'New Project',
    community: 'Community',
    samples: 'Samples',
    replacements: 'Replacements'
    // intentionally omit 'resources' to avoid recursion (cannot surface Resources inside itself if removed)
};

const CORE_APP_CATEGORY_MAP = {
    orders: 'Sales & Rep Tools',
    sales: 'Sales & Rep Tools',
    projects: 'Sales & Rep Tools',
    'new-lead': 'Sales & Rep Tools',
    community: 'Marketing & Communication',
    products: 'Product & Finish Resources',
    samples: 'Dealer & Field Support',
    replacements: 'Dealer & Field Support',
};

const CORE_APP_SUBLABELS = {
    orders: 'Order tracking and status',
    sales: 'Revenue and performance view',
    products: 'Main product application',
    projects: 'Pipeline and project management',
    'new-lead': 'Start a new project or lead',
    community: 'Team and dealer conversations',
    samples: 'Sample ordering workflow',
    replacements: 'Replacement request workflow',
};

export const ResourcesScreen = ({ theme, onNavigate, homeApps }) => {
    const routeIconMap = useMemo(
        () => new Map(allApps.map((app) => [app.route, app.icon])),
        []
    );

    // Compute hidden home apps (apps removed from home but part of default set, excluding 'resources')
    const hiddenCoreItems = useMemo(() => {
        const currentSet = new Set(homeApps || []);
        return DEFAULT_HOME_APPS
            .filter(r => r !== 'resources' && !currentSet.has(r))
            .map((route) => ({
                label: CORE_LABELS[route] || route,
                nav: route,
                sublabel: CORE_APP_SUBLABELS[route] || 'Application',
                resourceCategory: CORE_APP_CATEGORY_MAP[route] || 'Sales & Rep Tools',
            }));
    }, [homeApps]);

    const resourceCategories = useMemo(() => {
        const categoryMap = new Map(
            (RESOURCES_DATA || []).map((category) => [
                category.category,
                {
                    ...category,
                    items: [...(category.items || [])],
                },
            ])
        );

        hiddenCoreItems.forEach((item) => {
            const targetCategory = categoryMap.get(item.resourceCategory);
            if (!targetCategory) return;
            if (targetCategory.items.some((entry) => entry.nav === item.nav)) return;
            targetCategory.items.push(item);
            targetCategory.items.sort((a, b) => a.label.localeCompare(b.label));
        });

        return Array.from(categoryMap.values());
    }, [hiddenCoreItems]);

    // scrollbar hiding is handled by the 'scrollbar-hide' Tailwind utility class

    const getResourceIcon = (item) => {
        const coreIcon = routeIconMap.get(item.nav);
        if (coreIcon) return coreIcon;

        const label = item.label;
        if (label.includes('Lead Times')) return Clock;
        if (label.includes('Weight Ratings')) return Scale;
        if (label.includes('Commission')) return DollarSign;
        if (label.includes('Contract')) return FileText;
        if (label.includes('Social')) return Share2;
        if (label.includes('Sample')) return Percent;
        if (label.includes('Search Fabrics')) return Search;
        if (label.includes('Discontinued')) return Palette;
        if (label.includes('Loaner')) return Package;
        if (label.includes('Dealer')) return Users;
        if (label.includes('Field Visit')) return MapPin;
        if (label.includes('Tour Visit')) return Plane;
        if (label.includes('Presentations')) return MonitorPlay;
        if (label.includes('Install')) return Wrench;
        if (label.includes('Tradeshow')) return Calendar;
        if (label.includes('Tradeshows')) return Calendar;
        if (label.includes('Marketplace')) return Gift;
        return Database;
    };

    const Row = ({ item, isFirst }) => {
        const Icon = getResourceIcon(item);
        const sub = item.sublabel || sublabelMap[item.label] || 'Tool';
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
                        <h4 className="font-semibold text-[0.8125rem]" style={{ color: theme.colors.textPrimary }}>
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

    const CategoryCard = ({ category }) => (
        <GlassCard theme={theme} className="px-6 py-4">
            <h3 className="text-[0.9375rem] font-semibold text-center mb-3" style={{ color: theme.colors.textPrimary }}>
                {category.category}
            </h3>
            <ul className="pb-1">
                {category.items?.map((item, idx) => (
                    <Row key={item.nav+item.label} item={item} isFirst={idx === 0} />
                ))}
            </ul>
        </GlassCard>
    );

    /* ---------- responsive 2-col when wide enough ---------- */
    const containerRef = useRef(null);
    const [wide, setWide] = useState(false);

    const measure = useCallback(() => {
        if (!containerRef.current) return;
        setWide(containerRef.current.offsetWidth >= 640);
    }, []);

    useEffect(() => {
        measure();
        const ro = new ResizeObserver(measure);
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [measure]);

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-6">
                <div ref={containerRef} className="max-w-4xl mx-auto w-full">
                    <div
                        className="mt-6"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: wide ? '1fr 1fr' : '1fr',
                            gap: wide ? '20px' : '24px',
                            alignItems: 'start'
                        }}
                    >
                        {resourceCategories.map((cat) => (
                            <CategoryCard key={cat.category} category={cat} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
