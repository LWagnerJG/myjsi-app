import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
    User, MousePointer, PieChart, RotateCw, Palette, DollarSign,
    Database, MessageSquare, Heart, MoreVertical, Image, Video,
    ArrowRight, Search, Briefcase, Package, X, ChevronDown,
    ChevronRight, ChevronLeft, Sun, Moon, Camera, LogOut,
    HelpCircle, ShoppingCart, CheckCircle, Plus, Minus,
    ArrowLeft, BarChart2, List, Home, Hourglass, Armchair,
    Server, UserPlus, UserX, Trophy, ChevronUp, Mic,
    AlertCircle, Settings, Paperclip, Copy, Save, Send,
    Share2, Film, Filter, Play
} from 'lucide-react';
import * as Data from './data.js';

const GlassCard = React.memo(React.forwardRef(({ children, className = '', theme, ...props }, ref) => (
    <div
        ref={ref}
        className={`rounded-[1.75rem] border shadow-lg transition-all duration-300 ${className}`}
        style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            boxShadow: `0 4px 30px ${theme.colors.shadow}`,
            backdropFilter: theme.backdropFilter,
            WebkitBackdropFilter: theme.backdropFilter,
        }}
        {...props}
    >
        {children}
    </div>
)));

const PageTitle = React.memo(({ title, theme, onBack, children }) => (
    <div className="px-4 pt-6 pb-4 flex justify-between items-center">
        <div className="flex-1 flex items-center space-x-2">
            {onBack && (
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                    <ArrowLeft className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                </button>
            )}
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>{title}</h1>
        </div>
        {children}
    </div>
));

const FormInput = React.memo(({ label, type = 'text', value, onChange, placeholder, options, className = "", theme, readOnly = false, required = false, isMulti, onMultiChange }) => {
    const inputClass = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-0 text-base outline-none`;
    const styles = { backgroundColor: theme.colors.subtle, borderColor: 'transparent', color: theme.colors.textPrimary, ringColor: theme.colors.accent, '--placeholder-color': theme.colors.textSecondary };
    const formatCurrency = (val) => {
        if (!val) return '';
        const numericValue = String(val).replace(/[^0-9]/g, '');
        if (!numericValue) return '$';
        return '$' + new Intl.NumberFormat().format(numericValue);
    };
    const handleCurrencyChange = (e) => {
        let numericValue = e.target.value.replace(/[^0-9]/g, '');
        onChange({ target: { value: numericValue } });
    }
    return (
        <div className={`space-y-1 ${className}`}>
            {label && <label className="text-xs font-semibold px-1" style={{ color: theme.colors.textSecondary }}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>}
            {type === 'select' ? (
                isMulti ? (
                    <div className={`${inputClass} flex flex-wrap gap-2`} style={{ ...styles, padding: '0.5rem' }}>
                        {options.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => onMultiChange(opt.value)}
                                className={`px-2 py-1 text-xs rounded-md transition-colors ${value.includes(opt.value) ? 'text-white' : ''}`}
                                style={{
                                    backgroundColor: value.includes(opt.value) ? theme.colors.accent : theme.colors.background,
                                    color: value.includes(opt.value) ? 'white' : theme.colors.textSecondary
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                ) : (
                    <select value={value || ""} onChange={onChange} className={inputClass} style={{ ...styles, color: value ? theme.colors.textPrimary : theme.colors.textSecondary }} required={required}>
                        <option value="" disabled>{placeholder}</option>
                        {options.map(opt => typeof opt === 'string' ? <option key={opt} value={opt}>{opt}</option> : <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                )
            ) : type === 'textarea' ? (
                <textarea value={value} onChange={onChange} className={inputClass} style={styles} rows="4" placeholder={placeholder} readOnly={readOnly} />
            ) : type === 'currency' ? (
                <div className="relative">
                    <input type="text" value={formatCurrency(value)} onChange={handleCurrencyChange} className={inputClass} style={styles} placeholder={placeholder} readOnly={readOnly} required={required} />
                </div>
            ) : (
                <div className="relative">
                    <input type={type} value={value} onChange={onChange} className={inputClass} style={styles} placeholder={placeholder} readOnly={readOnly} required={required} />
                </div>
            )}
        </div>
    );
});

const SearchInput = React.memo(({ onSubmit, value, onChange, placeholder, theme, className, onVoiceClick }) => (
    <form onSubmit={onSubmit} className={`relative flex items-center ${className || ''}`} >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5" style={{ color: theme.colors.textSecondary }} />
        </div>
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 text-base outline-none"
            style={{ backgroundColor: theme.colors.subtle, borderColor: 'transparent', color: theme.colors.textPrimary, ringColor: theme.colors.accent, }}
        />
        {onVoiceClick && (
            <button type="button" onClick={onVoiceClick} className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <Mic className="h-5 w-5" style={{ color: theme.colors.textSecondary }} />
            </button>
        )}
    </form>
));

const SuccessToast = ({ message, show, theme }) => {
    if (!show) return null;
    return (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
            <GlassCard theme={theme} className="px-6 py-3 flex items-center space-x-3">
                <CheckCircle className="w-6 h-6" style={{ color: theme.colors.accent }} />
                <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{message}</span>
            </GlassCard>
        </div>
    )
}

const AppHeader = React.memo(({ onHomeClick, isDarkMode, theme, onProfileClick, isHome, handleBack, showBack, userName }) => {
    const filterStyle = isDarkMode ? 'brightness(0) invert(1)' : 'none';
    return (
        <div style={{ backgroundColor: theme.colors.surface, backdropFilter: theme.backdropFilter, WebkitBackdropFilter: theme.backdropFilter }} className="mx-auto mt-8 w-[90%] px-6 py-3 flex justify-between items-center sticky top-0 z-20 rounded-full shadow-md backdrop-blur">
            <div className="flex items-center space-x-2">
                {showBack && (
                    <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10" >
                        <ArrowLeft className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    </button>
                )}
                <button onClick={onHomeClick} className="hover:opacity-80 transition-opacity">
                    <img src={Data.logoLight} alt="MyJSI Logo" className="h-10 w-auto" style={{ filter: filterStyle, marginLeft: '0.5rem' }} />
                </button>
            </div>
            <div className="flex items-center space-x-4">
                {isHome && (
                    <div className="text-lg font-normal leading-tight" style={{ color: theme.colors.textPrimary }}>Hey, {userName}!</div>
                )}
                <button onClick={onProfileClick} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.subtle }}>
                    <User className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                </button>
            </div>
        </div>
    );
});

const HomeScreen = ({ onNavigate, theme, onAskAI, searchTerm, onSearchTermChange, showAIDropdown, aiResponse, isAILoading, onCloseAIDropdown, showAlert }) => {
    const handleFeedbackClick = useCallback(() => {
        onNavigate('feedback');
    }, [onNavigate]);

    return (
        <div className="flex flex-col h-full rounded-t-[40px] -mt-8 pt-8" style={{ backgroundColor: theme.colors.background }}>
            <div className="px-4 pt-4 pb-2 relative z-10">
                <input
                    type="text"
                    placeholder="Ask me anything..."
                    className="w-full pl-11 pr-12 py-3 rounded-full text-base border-2 shadow-md transition-colors focus:ring-2"
                    style={{
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.textPrimary,
                        borderColor: theme.colors.border,
                        outline: 'none',
                    }}
                />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                <div className="grid grid-cols-2 gap-4">
                    {Data.MENU_ITEMS.map((item) => (
                        <GlassCard
                            key={item.id}
                            theme={theme}
                            className="group relative p-4 h-32 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:border-white/20"
                            onClick={() => onNavigate(item.id)}
                        >
                            <div className="relative">
                                <item.icon className="w-7 h-7" style={{ color: theme.colors.textSecondary }} strokeWidth={1.5} />
                            </div>
                            <div className="relative">
                                <span className="text-xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>{item.label}</span>
                            </div>
                        </GlassCard>
                    ))}
                </div>
                <GlassCard theme={theme} className="p-1">
                    <button onClick={handleFeedbackClick} className="w-full h-20 p-3 rounded-xl flex items-center justify-center space-x-4">
                        <MessageSquare className="w-7 h-7" style={{ color: theme.colors.textSecondary }} strokeWidth={1.5} />
                        <span className="text-xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>Give Feedback</span>
                    </button>
                </GlassCard>
            </div>
        </div>
    );
};

const SalesScreen = ({ theme, onNavigate }) => {
    return <PageTitle title="Sales" theme={theme} onBack={() => onNavigate('home')} />;
};
const OrdersScreen = ({ theme, onNavigate }) => {
    return <PageTitle title="Orders" theme={theme} onBack={() => onNavigate('home')} />;
};
const ProductsScreen = ({ theme, onNavigate }) => {
    return <PageTitle title="Products" theme={theme} onBack={() => onNavigate('home')} />;
};
const ResourcesScreen = ({ theme, onNavigate }) => {
    return <PageTitle title="Resources" theme={theme} onBack={() => onNavigate('home')} />;
};
const ProjectsScreen = ({ theme, onNavigate }) => {
    return <PageTitle title="Projects" theme={theme} onBack={() => onNavigate('home')} />;
};
const CommunityScreen = ({ theme, onNavigate }) => {
    return <PageTitle title="Community" theme={theme} onBack={() => onNavigate('home')} />;
};
const SamplesScreen = ({ theme, onNavigate }) => {
    return <PageTitle title="Samples" theme={theme} onBack={() => onNavigate('home')} />;
};
const ReplacementsScreen = ({ theme, onNavigate }) => {
    return <PageTitle title="Replacements" theme={theme} onBack={() => onNavigate('home')} />;
};
const FeedbackScreen = ({ theme, onNavigate }) => {
    return <PageTitle title="Feedback" theme={theme} onBack={() => onNavigate('home')} />;
};

const SCREEN_MAP = {
    home: HomeScreen,
    sales: SalesScreen,
    orders: OrdersScreen,
    products: ProductsScreen,
    resources: ResourcesScreen,
    projects: ProjectsScreen,
    community: CommunityScreen,
    samples: SamplesScreen,
    replacements: ReplacementsScreen,
    feedback: FeedbackScreen,
};

export {
    // Reusable Components
    GlassCard,
    PageTitle,
    FormInput,
    SearchInput,
    SuccessToast,
    AppHeader,

    // Full Screen Components
    HomeScreen,
    SalesScreen,
    OrdersScreen,
    ProductsScreen,
    ResourcesScreen,
    ProjectsScreen,
    CommunityScreen,  // Note: you have CommunityScreen, not CommunityHome
    SamplesScreen,
    ReplacementsScreen,
    FeedbackScreen,

    // The Screen Map
    SCREEN_MAP
};