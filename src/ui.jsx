import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
    AlertCircle, Armchair, ArrowLeft, ArrowRight, BarChart2, Briefcase, Bus,
    Calendar, Camera, CheckCircle, ChevronDown, ChevronLeft, ChevronRight,
    ChevronUp, Clock, Copy, Database, DollarSign, FileText, Film, Filter,
    HelpCircle, Home, Hourglass, List, LogOut, MapPin, MessageSquare, Mic,
    Minus, MonitorPlay, Moon, MoreVertical, Package, Palette,
    Paperclip, Percent, PieChart, Play, Plus, RotateCw, Save, Search, Send,
    Server, Settings, Share2, ShoppingCart, Sun, Trophy, User, UserPlus,
    UserX, Users, Video, Wrench, X
} from 'lucide-react';
import * as Data from './data.jsx';

export const GlassCard = React.memo(
    React.forwardRef(({ children, className = '', theme, ...props }, ref) => (
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
    ))
);

export const PageTitle = React.memo(({ title, theme, onBack, children }) => (
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

export const Button = React.memo(({ children, className = '', theme, ...props }) => (
    <button
        className={`px-4 py-2 rounded-lg font-semibold ${className}`}
        style={
            theme
                ? { backgroundColor: theme.colors.accent, color: '#fff' }
                : undefined
        }
        {...props}
    >
        {children}
    </button>
))

export const Card = ({ children, ...props }) => (
    <GlassCard {...props}>{children}</GlassCard>
)

export const useDropdownPosition = (ref) => {
    const [dropDirection, setDropDirection] = useState('down');

    const checkPosition = useCallback(() => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            // A typical dropdown panel is around 200-250px high
            if (spaceBelow < 250 && rect.top > 260) {
                setDropDirection('up');
            } else {
                setDropDirection('down');
            }
        }
    }, [ref]);

    return [dropDirection, checkPosition];
};

export const CommissionsScreen = ({ theme }) => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [expandedMonth, setExpandedMonth] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null); // State for individual row expansion

    const years = Object.keys(Data.COMMISSIONS_DATA).sort((a, b) => b - a);
    const monthlyData = Data.COMMISSIONS_DATA[selectedYear] || [];

    const toggleMonth = (month) => {
        setExpandedMonth(prev => prev === month ? null : month);
        setExpandedRow(null); // Collapse any open row when month changes
    };

    const toggleRow = (rowIndex) => {
        setExpandedRow(prev => prev === rowIndex ? null : rowIndex);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="px-4 pt-6 pb-4 flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>Commissions</h1>
                <div className="flex items-center">
                    <CustomSelect
                        label="Year"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        options={years.map(y => ({ value: y, label: y }))}
                        theme={theme}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 scrollbar-hide">
                {monthlyData.map((check, index) => (
                    <React.Fragment key={check.month}>
                        <GlassCard
                            theme={theme}
                            onClick={() => toggleMonth(check.month)}
                            className="p-4 cursor-pointer hover:border-gray-400/50 flex justify-between items-center"
                        >
                            <div className="flex-1">
                                <div className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{check.month}</div>
                                <div className="text-sm" style={{ color: theme.colors.textSecondary }}>{new Date(check.issuedDate).toLocaleDateString()}</div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="font-bold text-lg" style={{ color: theme.colors.accent }}>${check.amount.toLocaleString()}</span>
                                <ChevronDown className={`w-5 h-5 transition-transform ${expandedMonth === check.month ? 'rotate-180' : ''}`} style={{ color: theme.colors.textSecondary }} />
                            </div>
                        </GlassCard>

                        {expandedMonth === check.month && check.details && (
                            <div className="p-0 animate-fade-in">
                                <GlassCard theme={theme} className="p-4 space-y-6 max-w-md mx-auto my-4">
                                    {check.details.map((detail, dIndex) => {
                                        if (detail.invoices) {
                                            return (
                                                <div key={dIndex} className="space-y-4">
                                                    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${theme.colors.border}` }}>
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="text-left font-semibold" style={{ color: theme.colors.textSecondary, backgroundColor: theme.colors.subtle }}>
                                                                    <th className="py-2 px-2 w-2/5">SO # / Project</th>
                                                                    <th className="py-2 px-2 text-right w-1/5">Net</th>
                                                                    <th className="py-2 px-2 text-right w-1/5">Comm.</th>
                                                                    <th className="py-2 px-2 text-right w-1/5">Rate</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {detail.invoices.map((inv, iIndex) => {
                                                                    const commissionRate = inv.netAmount ? ((inv.commission / inv.netAmount) * 100).toFixed(1) : '0.0';
                                                                    const isRowExpanded = expandedRow === iIndex;
                                                                    return (
                                                                        <tr
                                                                            key={iIndex}
                                                                            onClick={() => toggleRow(iIndex)}
                                                                            className={`cursor-pointer transition-colors ${iIndex % 2 === 0 ? '' : 'bg-black/5 dark:bg-white/5'} hover:bg-black/10 dark:hover:bg-white/10`} // Added hover effect and zebra striping
                                                                        >
                                                                            <td className="py-2 px-2">
                                                                                <div className="font-mono text-xs break-words" style={{ color: theme.colors.textPrimary }}>{inv.so || inv.invoice}</div>
                                                                                {isRowExpanded && inv.project && (
                                                                                    <div className="text-xs mt-1 break-words" style={{ color: theme.colors.textSecondary }}>{inv.project}</div>
                                                                                )}
                                                                            </td>
                                                                            <td className="py-2 px-2 text-right font-mono" style={{ color: theme.colors.textPrimary }}>${inv.netAmount.toLocaleString()}</td>
                                                                            <td className="py-2 px-2 text-right font-bold" style={{ color: theme.colors.accent }}>${inv.commission.toLocaleString()}</td>
                                                                            <td className="py-2 px-2 text-right text-xs" style={{ color: theme.colors.textPrimary }}>{commissionRate}%</td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            );
                                        } else if (detail.customer && detail.total > 0) {
                                            return (
                                                <div key={dIndex} className="flex justify-between items-center text-sm p-3 rounded-lg" style={{ backgroundColor: theme.colors.subtle }}>
                                                    <span className="font-medium" style={{ color: theme.colors.textPrimary }}>{detail.customer}</span>
                                                    <span style={{ color: theme.colors.accent }}>${detail.total.toLocaleString()}</span>
                                                </div>
                                            );
                                        } else if (detail.brandTotal) {
                                            return (
                                                <div key={dIndex} className="p-4 rounded-lg space-y-2" style={{ backgroundColor: theme.colors.subtle }}>
                                                    <h4 className="font-bold text-base flex items-center" style={{ color: theme.colors.textPrimary }}>
                                                        <DollarSign className="w-5 h-5 mr-2" style={{ color: theme.colors.accent }} />
                                                        {detail.brandTotal} Totals
                                                    </h4>
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-medium" style={{ color: theme.colors.textSecondary }}>Invoiced Total:</span>
                                                            <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>${detail.listTotal.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-medium" style={{ color: theme.colors.textSecondary }}>Commissioned Value:</span>
                                                            <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>${detail.netTotal.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: theme.colors.border }}>
                                                            <span className="font-bold" style={{ color: theme.colors.textSecondary }}>Commission Amount:</span>
                                                            <span className="font-bold text-lg" style={{ color: theme.colors.accent }}>${detail.commissionTotal.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </GlassCard>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export const IncentiveRewardsScreen = ({ theme, onNavigate }) => {
    // Placeholder - Logic will be added later
    return <PageTitle title="Incentive Rewards" theme={theme} />;
};

export const CustomSelect = ({ label, value, onChange, options, placeholder, theme, required, onOpen }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const [dropDirection, checkPosition] = useDropdownPosition(wrapperRef);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange({ target: { value: optionValue } });
        setIsOpen(false);
    };

    // This now also calls the new onOpen function if it exists
    const handleOpen = () => {
        checkPosition();
        onOpen?.(); // Trigger the parent's expand function
        setIsOpen(o => !o);
    };

    const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

    return (
        <div className="relative space-y-1" ref={wrapperRef}>
            {label && (
                <label className="block text-xs font-semibold px-4" style={{ color: theme.colors.textSecondary }}>
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={handleOpen}
                className="w-full px-4 py-2 border rounded-full text-sm text-left flex justify-between items-center"
                style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: value ? theme.colors.textPrimary : theme.colors.textSecondary,
                }}
            >
                {selectedLabel}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color: theme.colors.textSecondary }} />
            </button>

            {isOpen && (
                <div className={`absolute w-full z-10 ${dropDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                    <GlassCard theme={theme} className="p-2 max-h-60 overflow-y-auto scrollbar-hide">
                        {options.map(opt => (
                            <button key={opt.value} type="button" onClick={() => handleSelect(opt.value)} className="block w-full text-left p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10" style={{ color: theme.colors.textPrimary }}>
                                {opt.label}
                            </button>
                        ))}
                    </GlassCard>
                </div>
            )}
        </div>
    );
};
export const AutoCompleteCombobox = ({
    label,
    value,
    onChange,
    placeholder,
    options,
    onAddNew,
    theme,
    required,
    zIndex,
    dropdownClassName // New prop to allow custom dropdown styling
}) => {
    const [inputValue, setInputValue] = useState(value || '');
    const [showOptions, setShowOptions] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => setInputValue(value || ''), [value]);

    useEffect(() => {
        function handleClickOutside(e) {
            // FIX: Corrected a typo here that prevented this from working
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowOptions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = options.filter(opt => opt.toLowerCase().includes(inputValue.toLowerCase()));

    const handleSelect = opt => {
        onChange(opt);
        setInputValue(opt);
        setShowOptions(false);
    };

    const handleAdd = () => {
        if (inputValue && !options.includes(inputValue)) onAddNew(inputValue);
        onChange(inputValue);
        setShowOptions(false);
    };

    return (
        <div className={`relative ${zIndex}`} ref={wrapperRef}>
            {label && (
                <label className="block text-xs font-semibold px-4" style={{ color: theme.colors.textSecondary }}>
                    {label}
                </label>
            )}
            <input
                required={required}
                type="text"
                value={inputValue}
                onChange={e => { setInputValue(e.target.value); setShowOptions(true); }}
                onFocus={() => setShowOptions(true)}
                placeholder={placeholder}
                className="w-full px-4 py-3 border rounded-full focus:ring-2 outline-none"
                style={{
                    backgroundColor: theme.colors.subtle,
                    borderColor: theme.colors.border,
                    color: theme.colors.textPrimary,
                    ringColor: theme.colors.accent,
                }}
            />
            {showOptions && (
                // Now uses the dropdownClassName prop, with a default of max-h-48
                <GlassCard
                    theme={theme}
                    className={`absolute w-full mt-1 z-10 p-2 overflow-y-auto scrollbar-hide ${dropdownClassName || 'max-h-48'}`}
                >
                    {filtered.map(opt => (
                        <button key={opt} type="button" onClick={() => handleSelect(opt)} className="block w-full text-left p-2 rounded-md hover:bg-black/5" style={{ color: theme.colors.textPrimary }}>
                            {opt}
                        </button>
                    ))}
                    {onAddNew && inputValue && !options.includes(inputValue) && (
                        <button type="button" onClick={handleAdd} className="block w-full text-left p-2 rounded-md font-semibold hover:bg-black/5" style={{ color: theme.colors.accent }}>
                            Add “{inputValue}”
                        </button>
                    )}
                </GlassCard>
            )}
        </div>
    );
};

export const ToggleButtonGroup = ({ value, onChange, options, theme }) => (
    <div
        className="w-full flex p-1 rounded-full"
        style={{ backgroundColor: theme.colors.subtle }}
    >
        {options.map((opt) => (
            <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className="flex-1 rounded-full py-2 px-1 text-center text-sm font-bold transition-all duration-300"
                style={{
                    backgroundColor: opt.value === value ? theme.colors.surface : 'transparent',
                    color: opt.value === value ? theme.colors.accent : theme.colors.textSecondary,
                    boxShadow: opt.value === value ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
            >
                {opt.label}
            </button>
        ))}
    </div>
);

const {
    // New–Lead form
    EMPTY_LEAD,
    VERTICALS,
    URGENCY_LEVELS,
    PO_TIMEFRAMES,
    COMPETITORS,
    DISCOUNT_OPTIONS,
    JSI_PRODUCT_SERIES,
    JSI_MODELS,
    VISION_MATERIALS,
    WIN_PROBABILITY_OPTIONS,
    INITIAL_DESIGN_FIRMS,
    INITIAL_DEALERS,

    // Projects screen
    INITIAL_OPPORTUNITIES,
    STAGES,
    STAGE_COLORS,

    // Samples + Cart
    SAMPLE_CATEGORIES,
    SAMPLE_PRODUCTS,

    // Home menu + Orders
    MENU_ITEMS,
    ORDER_DATA,

    // Sales screen
    YTD_SALES_DATA,
    MONTHLY_SALES_DATA,
    SALES_VERTICALS_DATA,

    // Community feed
    INITIAL_POSTS,
    INITIAL_WINS,
    INITIAL_POLLS,

    // Members screen
    INITIAL_MEMBERS,
    PERMISSION_LABELS,
    USER_TITLES,

    // …any others you reference…

    // Resources screens
    RESOURCES_DATA,
    LOANER_POOL_PRODUCTS,
    SAMPLE_DISCOUNTS_DATA,
    COMMISSION_RATES_TABLE_DATA,
    DISCONTINUED_FINISHES,
    SOCIAL_MEDIA_POSTS,
    DEALER_DIRECTORY_DATA,
    CONTRACTS_DATA,
    LEAD_TIMES_DATA,
    DAILY_DISCOUNT_OPTIONS,
    INSTALL_INSTRUCTIONS_DATA,
    FABRICS_DATA
} = Data;

const Icon = ({ uri, size = 24, className = "" }) => (
    <img
        src={uri}
        alt="icon"
        className={className}
        style={{ width: size, height: size }}
    />
);

const WoodIcon = ({ color }) => <Icon uri="https://img.icons8.com/ios-glyphs/60/chair.png" />;
const UpholsteryIcon = ({ color }) => <Icon uri="https://img.icons8.com/ios-filled/50/armchair.png" />;
const CasegoodIcon = ({ color }) => <Icon uri="https://img.icons8.com/ios-filled/50/desk.png" />;
const SearchIcon = ({ size, color }) => <Icon uri="https://img.icons8.com/ios-glyphs/60/search--v1.png" size={size} />;
const FilterIcon = ({ size, color }) => <Icon uri="https://img.icons8.com/ios-filled/50/filter--v1.png" size={size} />;

export const SmartSearch = ({ theme, onNavigate, onAskAI, onVoiceActivate }) => {
    const [query, setQuery] = useState('');
    const [filteredApps, setFilteredApps] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const searchContainerRef = useRef(null);

    useEffect(() => {
        if (!isFocused) {
            setFilteredApps([]);
            return;
        }
        const term = query.trim().toLowerCase();
        if (term.length >= 2) {
            const results = Data.allApps
                .filter(app => app.name.toLowerCase().includes(term))
                .sort((a, b) => a.name.localeCompare(b.name));
            setFilteredApps(results);
        } else {
            setFilteredApps([]);
        }
    }, [query, isFocused]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNavigation = (route) => {
        onNavigate(route);
        setQuery('');
        setFilteredApps([]);
        setIsFocused(false);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (query.trim() && filteredApps.length === 0) {
            onAskAI(query);
            setQuery('');
            setIsFocused(false);
        }
    };

    const handleVoiceClick = () => {
        onVoiceActivate('Voice Activated'); // Use the new prop
    };

    return (
        <div ref={searchContainerRef} className="relative z-20">
            <form onSubmit={handleFormSubmit} className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                <input
                    type="text"
                    placeholder="Ask me anything..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    className="w-full pl-11 pr-12 py-3 rounded-full text-base border-2 shadow-md transition-colors focus:ring-2"
                    style={{
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.textPrimary,
                        borderColor: theme.colors.border,
                        outline: 'none',
                    }}
                />
                <button
                    type="button"
                    onClick={handleVoiceClick}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                    <Mic className="h-5 w-5" style={{ color: theme.colors.textSecondary }} />
                </button>
            </form>

            {isFocused && filteredApps.length > 0 && (
                <GlassCard theme={theme} className="absolute top-full mt-2 w-full p-2 z-50">
                    <ul className="max-h-60 overflow-y-auto">
                        {filteredApps.map(app => (
                            <li
                                key={app.route}
                                onMouseDown={() => handleNavigation(app.route)}
                                className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                                style={{ color: theme.colors.textPrimary }}
                            >
                                <app.icon className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                {app.name}
                            </li>
                        ))}
                    </ul>
                </GlassCard>
            )}
        </div>
    );
};
const SocialMediaScreen = ({ theme, showAlert, setSuccessMessage }) => {
    const copyToClipboard = (text) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setSuccessMessage('Caption Copied!');
            setTimeout(() => setSuccessMessage(''), 2000);
        } catch (err) {
            showAlert('Failed to copy text.');
        }
        document.body.removeChild(textArea);
    };

    const saveMedia = (post) => {
        showAlert(`Media for "${post.caption.substring(0, 20)}..." saved to device.`);
    };

    return (
        <>
            <PageTitle title="Social Media" theme={theme} />
            <div className="px-4 pb-4 grid grid-cols-2 gap-4">
                {SOCIAL_MEDIA_POSTS.map(post => (
                    <GlassCard key={post.id} theme={theme} className="p-2 flex flex-col space-y-2">
                        <div className="aspect-w-4 aspect-h-5 w-full rounded-lg overflow-hidden">
                            {post.type === 'image' ? (
                                <img src={post.url} alt={`Social media post ${post.id}`} className="w-full h-full object-cover" />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center"
                                    style={{ backgroundColor: theme.colors.subtle }}
                                >
                                    <Film className="w-12 h-12" style={{ color: theme.colors.secondary }} />
                                </div>
                            )}
                        </div>
                        <p className="text-xs px-1" style={{ color: theme.colors.textSecondary }}>
                            {post.caption}
                        </p>
                        <div className="grid grid-cols-2 gap-1 pt-1">
                            <button
                                onClick={() => copyToClipboard(post.caption)}
                                className="flex items-center justify-center text-xs font-semibold p-2 rounded-md"
                                style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
                            >
                                <Copy className="w-3 h-3 mr-1.5" />
                                Copy
                            </button>
                            <button
                                onClick={() => saveMedia(post)}
                                className="flex items-center justify-center text-xs font-semibold p-2 rounded-md"
                                style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
                            >
                                <Save className="w-3 h-3 mr-1.5" />
                                Save
                            </button>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </>
    );
};

const LineItemCard = React.memo(({ lineItem, index, theme }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <GlassCard theme={theme} className="p-3" style={{ backgroundColor: theme.colors.subtle }}>
            <div className="flex items-start space-x-4">
                <div className="text-sm font-bold text-center w-8 flex-shrink-0" style={{ color: theme.colors.accent }}>
                    <div className="text-xs" style={{ color: theme.colors.textSecondary }}>LINE</div>
                    <div>{index + 1}</div>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{lineItem.name}</p>
                    <div className="flex items-center justify-between text-xs font-mono" style={{ color: theme.colors.textSecondary }}>
                        <span>{lineItem.model}</span>
                        <span>QTY: {lineItem.quantity}</span>
                        <span className="font-sans font-semibold">${lineItem.extNet?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                </div>
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-1">
                    <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} style={{ color: theme.colors.textSecondary }} />
                </button>
            </div>

            {isExpanded && (
                <div className="border-t mt-3 pt-3 space-y-2 text-sm" style={{ borderColor: theme.colors.border }}>
                    <p className="font-bold text-xs" style={{ color: theme.colors.textSecondary }}>SPECIFICATIONS:</p>
                    {lineItem.specs && lineItem.specs.length > 0 ? lineItem.specs.map(spec => (
                        <div key={spec.label}>
                            <p className="font-semibold text-xs" style={{ color: theme.colors.textSecondary }}>{spec.label}</p>
                            <p className="font-mono text-xs" style={{ color: theme.colors.textPrimary }}>{spec.value}</p>
                        </div>
                    )) : <p className="text-xs" style={{ color: theme.colors.textSecondary }}>No specific options.</p>}
                </div>
            )}
        </GlassCard>
    );
});
const LeadTimesScreen = ({ theme = {} }) => {
    // State and hooks remain the same
    const [searchTerm, setSearchTerm] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sortFastest, setSortFastest] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');
    const filterMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // The useMemo hook now correctly filters for all Casegood-related types
    const rows = useMemo(() => {
        const map = {};
        LEAD_TIMES_DATA.forEach(({ series, type, weeks }) => {
            if (!map[series]) map[series] = {};
            map[series][type] = weeks;
        });
        let list = Object.entries(map).map(([series, types]) => ({ series, types }));

        // Category filter
        if (filterCategory === 'upholstered') {
            list = list.filter(r => r.types.Upholstery != null);
        } else if (filterCategory === 'wood') {
            list = list.filter(r => r.types['Wood Seating'] != null);
        } else if (filterCategory === 'casegoods') {
            list = list.filter(r =>
                r.types.Casegoods != null ||
                r.types.Laminate != null ||
                r.types.Veneer != null ||
                r.types.Tables != null
            );
        }

        // Search filter
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(r => r.series.toLowerCase().includes(q));
        }

        // Sort by fastest
        if (sortFastest) {
            list.sort((a, b) => {
                const aMin = Math.min(...Object.values(a.types));
                const bMin = Math.min(...Object.values(b.types));
                return aMin - bMin;
            });
        }

        return list;
    }, [searchTerm, filterCategory, sortFastest]);

    // A small component to render the L/V notations
    const LVLabel = ({ label }) => (
        <span className="text-xs font-bold -mb-1" style={{ color: theme.colors.textSecondary }}>
            {label}
        </span>
    );

    return (
        <div className="flex flex-col h-full">
            <PageTitle title="Lead Times" theme={theme} />

            <div className="px-4 pb-4 flex items-center space-x-2">
                <SearchInput
                    className="flex-grow"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search by series name…"
                    theme={theme}
                />
                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(o => !o)}
                        className="p-3.5 rounded-lg"
                        style={{ backgroundColor: theme.colors.subtle }}
                    >
                        <Filter className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
                    </button>
                    {dropdownOpen && (
                        <GlassCard ref={filterMenuRef} theme={theme} className="absolute top-14 right-0 z-10 w-48 p-2">
                            <label className="flex items-center w-full px-2 py-1.5 text-sm rounded-md cursor-pointer" style={{ color: theme.colors.textPrimary }}>
                                <input
                                    type="checkbox"
                                    checked={sortFastest}
                                    onChange={() => setSortFastest(f => !f)}
                                    className="form-checkbox h-4 w-4 mr-3"
                                    style={{ color: theme.colors.accent }}
                                />
                                Sort by fastest
                            </label>
                            <div className="border-t my-1" style={{ borderColor: theme.colors.subtle }} />
                            {[{ key: 'all', label: 'All' }, { key: 'upholstered', label: 'Upholstered' }, { key: 'wood', label: 'Wood Seating' }, { key: 'casegoods', label: 'Casegoods' }].map(opt => (
                                <button
                                    key={opt.key}
                                    onClick={() => { setFilterCategory(opt.key); setDropdownOpen(false); }}
                                    className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${filterCategory === opt.key ? 'font-bold' : ''}`}
                                    style={{
                                        color: theme.colors.textPrimary,
                                        backgroundColor: filterCategory === opt.key ? theme.colors.subtle : 'transparent'
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </GlassCard>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 scrollbar-hide">
                {rows.map(({ series, types }) => (
                    <GlassCard key={series} theme={theme} className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            {/* --- RENDER LOGIC UPDATED FOR NEW TYPES --- */}
                            {types['Upholstery'] != null && (
                                <div className="flex flex-col items-center w-10 text-center">
                                    <UpholsteryIcon color={theme.colors.accent} />
                                    <span className="mt-1.5 text-sm font-bold">{types.Upholstery}</span>
                                </div>
                            )}
                            {types['Seating'] != null && (
                                <div className="flex flex-col items-center w-10 text-center">
                                    <UpholsteryIcon color={theme.colors.accent} />
                                    <span className="mt-1.5 text-sm font-bold">{types.Seating}</span>
                                </div>
                            )}
                            {types['Wood Seating'] != null && (
                                <div className="flex flex-col items-center w-10 text-center">
                                    <WoodIcon color={theme.colors.accent} />
                                    <span className="mt-1.5 text-sm font-bold">{types['Wood Seating']}</span>
                                </div>
                            )}
                            {types['Casegoods'] != null && (
                                <div className="flex flex-col items-center w-10 text-center">
                                    <CasegoodIcon color={theme.colors.accent} />
                                    <span className="mt-1.5 text-sm font-bold">{types.Casegoods}</span>
                                </div>
                            )}
                            {types['Tables'] != null && (
                                <div className="flex flex-col items-center w-10 text-center">
                                    <CasegoodIcon color={theme.colors.accent} />
                                    <span className="mt-1.5 text-sm font-bold">{types.Tables}</span>
                                </div>
                            )}
                            {types['Laminate'] != null && (
                                <div className="flex flex-col items-center w-10 text-center">
                                    <LVLabel label="L" />
                                    <CasegoodIcon color={theme.colors.accent} />
                                    <span className="mt-1.5 text-sm font-bold">{types.Laminate}</span>
                                </div>
                            )}
                            {types['Veneer'] != null && (
                                <div className="flex flex-col items-center w-10 text-center">
                                    <LVLabel label="V" />
                                    <CasegoodIcon color={theme.colors.accent} />
                                    <span className="mt-1.5 text-sm font-bold">{types.Veneer}</span>
                                </div>
                            )}
                        </div>
                        <span className="font-bold text-lg text-right" style={{ color: theme.colors.textPrimary }}>
                            {series}
                        </span>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};
const PresentationsScreen = ({ theme, onNavigate }) => {
    // Navigate to the series list or a future “by type” screen
    const handleNavigateByType = () =>
        onNavigate('resources/presentations/by_type');
    const handleNavigateBySeries = () =>
        onNavigate('resources/presentations/by_series_list');

    const PresentationButton = ({ title, imageUrl, onClick }) => (
        <div onClick={onClick} className="cursor-pointer group">
            <GlassCard
                theme={theme}
                className="p-2 overflow-hidden transition-all duration-300
                   group-hover:border-gray-400/50
                   group-hover:scale-[1.02]
                   active:scale-[0.98]"
            >
                <div className="relative aspect-video w-full rounded-xl bg-gray-200 overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={`${title} presentation preview`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent" />
                    <h3
                        className="absolute bottom-3 left-4 text-2xl font-bold text-white tracking-tight"
                    >
                        {title}
                    </h3>
                </div>
            </GlassCard>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <PageTitle title="Presentations" theme={theme} />
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                <PresentationButton
                    title="By Type"
                    imageUrl="https://placehold.co/800x450/A9886C/FFFFFF?text=Lounge%0APresentation"
                    onClick={handleNavigateByType}
                />
                <PresentationButton
                    title="By Series"
                    imageUrl="https://placehold.co/800x450/7A7A7A/FFFFFF?text=Vision%0APresentation"
                    onClick={handleNavigateBySeries}
                />
            </div>
        </div>
    );
};
const InstallInstructionsScreen = ({ theme }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSeries, setSelectedSeries] = useState(null);

    const groupedInstructions = useMemo(() => {
        const filter = searchTerm.toLowerCase().trim();
        const filtered = INSTALL_INSTRUCTIONS_DATA.filter(item =>
            item.name.toLowerCase().includes(filter)
        );
        return filtered.reduce((acc, item) => {
            (acc[item.type] = acc[item.type] || []).push(item);
            return acc;
        }, {});
    }, [searchTerm]);

    if (selectedSeries) {
        return (
            <div className="flex flex-col h-full">
                <PageTitle title={selectedSeries.name} theme={theme} />
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-hide">
                    <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden flex items-center justify-center">
                        <img
                            src={selectedSeries.videoUrl}
                            alt={`${selectedSeries.name} video`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center cursor-pointer">
                            <Play className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <a
                        href={selectedSeries.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                    >
                        <GlassCard theme={theme} className="p-4 flex items-center justify-between hover:border-gray-400/50">
                            <div className="flex items-center space-x-3">
                                <Paperclip className="w-6 h-6" style={{ color: theme.colors.accent }} />
                                <span className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                                    Download PDF Instructions
                                </span>
                            </div>
                            <ArrowRight className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                        </GlassCard>
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <PageTitle title="Installation Instructions" theme={theme} />
            <div
                className="px-4 pt-2 pb-4 sticky top-0 z-10 bg-opacity-80 backdrop-blur-md"
                style={{ backgroundColor: theme.colors.background.substring(0, 7) + 'd0' }}
            >
                <SearchInput
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search by series name…"
                    theme={theme}
                />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
                {Object.entries(groupedInstructions).map(([type, items]) => (
                    <section key={type} className="mb-8">
                        <h2
                            className="text-2xl font-bold capitalize mb-4 px-1"
                            style={{ color: theme.colors.textPrimary }}
                        >
                            {type}
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {items.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedSeries(item)}
                                    className="cursor-pointer space-y-2"
                                >
                                    <GlassCard theme={theme} className="aspect-square p-2 overflow-hidden hover:border-gray-400/50">
                                        <img
                                            src={item.thumbnail}
                                            alt={item.name}
                                            className="w-full h-full object-cover rounded-xl"
                                        />
                                    </GlassCard>
                                    <p
                                        className="font-semibold text-center text-sm"
                                        style={{ color: theme.colors.textPrimary }}
                                    >
                                        {item.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
};
const DiscontinuedFinishesScreen = ({ theme }) => {
    const { DISCONTINUED_FINISHES } = Data;
    return (
        <>
            <PageTitle title="Discontinued Finishes" theme={theme} />
            <div className="px-4 pb-4 space-y-4">
                {DISCONTINUED_FINISHES.map((finish, idx) => (
                    <GlassCard key={idx} theme={theme} className="p-4">
                        <p className="font-semibold text-lg" style={{ color: theme.colors.textPrimary }}>
                            {finish.category}
                        </p>
                        <div className="flex items-center mt-2 space-x-6">
                            <div className="flex items-center space-x-2">
                                <span className="w-6 h-6 rounded" style={{ backgroundColor: finish.oldColor }} />
                                <span style={{ color: theme.colors.textSecondary }}>{finish.oldName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="w-6 h-6 rounded" style={{ backgroundColor: finish.newColor }} />
                                <span style={{ color: theme.colors.textSecondary }}>{finish.newName}</span>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </>
    );
};
const DesignDaysScreen = ({ theme }) => {
    // Hard-coded schedule and transport data from the site :contentReference[oaicite:0]{index=0}
    const schedule = [
        {
            days: ['Monday, June 9', 'Tuesday, June 10'],
            events: [
                '9:00am – Coffee Bar + Breakfast Bites',
                '11:30am – Light Lunch',
                '5:00pm – Doors Close',
            ],
        },
        {
            days: ['Wednesday, June 11'],
            events: [
                '9:00am – Doors Open',
                '3:00pm – That’s a Wrap!',
            ],
        },
    ];

    const transport = [
        {
            icon: Bus,
            title: 'Shuttle bus',
            desc: `Two 56-person coach buses in continuous loop (every 15–20 min)
Days: June 9 – 11
Stops: The Mart – Wells & Kinzie → Emily Hotel Welcome Center`,
        },
        {
            icon: Bus,
            title: 'Rickshaw',
            desc: `Electric pedicabs (3–5 person) in loop (every 15–20 min)
Days: June 9 – 11
Stops: The Mart – Wells & Kinzie → Emily Hotel Welcome Center`,
        },
    ];

    return (
        <div className="px-4 pb-6 space-y-6">
            <PageTitle title="Design Days 2025" theme={theme} />

            {/* Intro */}
            <GlassCard theme={theme} className="p-4 space-y-3">
                <p className="font-semibold text-lg" style={{ color: theme.colors.textPrimary }}>
                    Sparking Joy in Fulton Market
                </p>
                <p style={{ color: theme.colors.textSecondary }}>
                    We’re back for our third year in the heart of Fulton Market—and we’re bringing the joy.
                    Join us June 9–11, 2025 at 345 N Morgan, 6th Floor, for Design Days. Our showroom will be filled with new launches, design moments, and plenty of surprises to spark connection, creativity, and joy. :contentReference[oaicite:1]{index = 1}
                </p>
                <a
                    href="https://fultonmarketdesigndays.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-semibold mt-2"
                    style={{ color: theme.colors.accent }}
                >
                    Register now →
                </a>
            </GlassCard>

            {/* Location */}
            <GlassCard theme={theme} className="p-4 flex items-start space-x-3">
                <MapPin className="w-6 h-6" style={{ color: theme.colors.secondary }} />
                <div>
                    <p className="font-bold" style={{ color: theme.colors.textPrimary }}>Showroom Location</p>
                    <p style={{ color: theme.colors.textSecondary }}>
                        345 N Morgan, 6th Floor<br />
                        Chicago, IL 60607
                    </p>
                </div>
            </GlassCard>

            {/* Schedule */}
            <div className="space-y-4">
                <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                    <Calendar className="inline w-5 h-5 mr-1" style={{ color: theme.colors.accent }} />
                    Show Schedule
                </p>
                {schedule.map((block, i) => (
                    <GlassCard key={i} theme={theme} className="p-4 space-y-2">
                        <p className="font-medium" style={{ color: theme.colors.textSecondary }}>
                            {block.days.join(' and ')}
                        </p>
                        {block.events.map((evt, j) => (
                            <p key={j} style={{ color: theme.colors.textPrimary }}>{evt}</p>
                        ))}
                    </GlassCard>
                ))}
            </div>

            {/* Cocktail Hour */}
            <GlassCard theme={theme} className="p-4">
                <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>Cocktail Hour</p>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    Monday, June 9 and Tuesday, June 10 — 3:00pm – Grab a drink (or two)!
                    Sip & socialize in our café lounge or outside on the patio that overlooks the city skyline.
                </p>
            </GlassCard>

            {/* Transport */}
            <div className="space-y-4">
                <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>Need a lift?</p>
                {transport.map(({ icon: Icon, title, desc }, i) => (
                    <GlassCard key={i} theme={theme} className="p-4 flex items-start space-x-3">
                        <Icon className="w-6 h-6" style={{ color: theme.colors.secondary }} />
                        <div>
                            <p className="font-bold" style={{ color: theme.colors.textPrimary }}>{title}</p>
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{desc}</p>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Raffle */}
            <GlassCard theme={theme} className="p-4 space-y-2">
                <p className="font-semibold text-lg" style={{ color: theme.colors.textPrimary }}>
                    Inspired and Unplugged.
                </p>
                <p style={{ color: theme.colors.textSecondary }}>
                    Step into stillness. Win a 4-day, 3-night escape for two to Iceland—a boutique stay at Eyja Hotel, spa day at Blue Lagoon, plus a $1,000 flight voucher. Must be present to enter. Stop by our showroom for details. :contentReference[oaicite:2]{index = 2}
                </p>
                <a
                    href="https://hoteleyja.is"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center font-semibold"
                    style={{ color: theme.colors.accent }}
                >
                    Learn more <Share2 className="w-4 h-4 ml-1" />
                </a>
            </GlassCard>
        </div>
    );
};
const ContractsScreen = ({ theme, onNavigate }) => {
    const ContractCard = React.memo(({ contract, theme }) => (
        <GlassCard theme={theme} className="p-4 flex flex-col space-y-3">
            <h2
                className="text-3xl font-bold"
                style={{ color: theme.colors.textPrimary }}
            >
                {contract.name}
            </h2>

            <div className="text-sm space-y-2">
                {contract.tiers.map((tier, i) => (
                    <div
                        key={i}
                        className="border-t pt-2"
                        style={{ borderColor: theme.colors.subtle }}
                    >
                        <p className="font-bold" style={{ color: theme.colors.textPrimary }}>
                            {tier.off}
                        </p>
                        <ul
                            className="list-disc list-inside pl-2"
                            style={{ color: theme.colors.textSecondary }}
                        >
                            <li>{tier.dealer}</li>
                            <li>{tier.rep}</li>
                        </ul>
                    </div>
                ))}
            </div>

            {contract.margin && (
                <div
                    className="text-sm border-t pt-2"
                    style={{ borderColor: theme.colors.subtle }}
                >
                    <p
                        className="font-bold"
                        style={{ color: theme.colors.textPrimary }}
                    >
                        Dealer margin discount:
                    </p>
                    {contract.margin.map((m, i) => (
                        <p key={i} style={{ color: theme.colors.textSecondary }}>
                            {m}
                        </p>
                    ))}
                </div>
            )}

            {contract.note && (
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    {contract.note}
                </p>
            )}

            <div className="pt-2">
                <button
                    onClick={() => window.open(contract.url, '_blank')}
                    className="w-full font-bold py-2.5 px-5 rounded-lg transition-colors text-white"
                    style={{ backgroundColor: theme.colors.accent }}
                >
                    Link to Contract
                </button>
            </div>
        </GlassCard>
    ));

    return (
        <div className="px-4 pb-4 space-y-6">
            <PageTitle title="Contracts" theme={theme} />
            <ContractCard contract={CONTRACTS_DATA.omnia} theme={theme} />
            <ContractCard contract={CONTRACTS_DATA.tips} theme={theme} />
            <ContractCard contract={CONTRACTS_DATA.premier} theme={theme} />
        </div>
    );
};
const DealerDirectoryScreen = ({ theme, showAlert, setSuccessMessage }) => {
    const [dealers, setDealers] = useState(DEALER_DIRECTORY_DATA);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDealer, setSelectedDealer] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'name' });
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const filterMenuRef = useRef(null);
    const [pendingDiscountChange, setPendingDiscountChange] = useState(null);
    const [showAddPersonModal, setShowAddPersonModal] = useState(false);
    const [newPerson, setNewPerson] = useState({ firstName: '', lastName: '', email: '', role: 'salespeople' });

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) {
                setShowFilterMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sortedAndFilteredDealers = useMemo(() => {
        return dealers
            .filter(d =>
                d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.address.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                if (sortConfig.key === 'name') {
                    return a.name.localeCompare(b.name);
                }
                return b[sortConfig.key] - a[sortConfig.key];
            });
    }, [dealers, searchTerm, sortConfig]);

    const confirmDiscountChange = () => {
        if (!pendingDiscountChange) return;
        const { dealerId, newDiscount } = pendingDiscountChange;
        setDealers(curr =>
            curr.map(d => d.id === dealerId ? { ...d, dailyDiscount: newDiscount } : d)
        );
        setSelectedDealer(prev =>
            prev && prev.id === dealerId ? { ...prev, dailyDiscount: newDiscount } : prev
        );
        setPendingDiscountChange(null);
        setSuccessMessage("Saved!");
        setTimeout(() => setSuccessMessage(""), 1000);
    };

    const handleSort = (key) => {
        setSortConfig({ key });
        setShowFilterMenu(false);
    };

    const handleAddPerson = (e) => {
        e.preventDefault();
        if (!selectedDealer) return;
        const { firstName, lastName, email, role } = newPerson;
        if (!firstName || !lastName || !email) return;

        const person = { name: `${firstName} ${lastName}`, status: 'pending' };
        setDealers(curr =>
            curr.map(d =>
                d.id === selectedDealer.id
                    ? { ...d, [role]: [...d[role], person] }
                    : d
            )
        );
        setSelectedDealer(d =>
            d.id === selectedDealer.id
                ? { ...d, [newPerson.role]: [...d[newPerson.role], person] }
                : d
        );
        setShowAddPersonModal(false);
        setNewPerson({ firstName: '', lastName: '', email: '', role: 'salespeople' });
        setSuccessMessage(`Invitation sent to ${email}`);
        setTimeout(() => setSuccessMessage(""), 2000);
    };

    const ModalSectionHeader = ({ title }) =>
        <p className="font-bold text-sm" style={{ color: theme.colors.textSecondary }}>{title}</p>;

    const StaffSection = ({ title, members }) => (
        <div>
            <h4 className="font-semibold" style={{ color: theme.colors.textPrimary }}>{title}</h4>
            <div className="text-sm space-y-1 mt-1">
                {members.length
                    ? members.map(m => (
                        <div key={m.name} className="flex items-center" style={{ color: theme.colors.textSecondary }}>
                            {m.name}
                            {m.status === 'pending' && <Hourglass className="w-3 h-3 ml-2 text-amber-500" />}
                        </div>
                    ))
                    : <p className="text-sm" style={{ color: theme.colors.textSecondary }}>None listed.</p>
                }
            </div>
        </div>
    );

    return (
        <>
            <PageTitle title="Dealer Directory" theme={theme} />

            <div className="px-4 pb-4 flex items-center space-x-2">
                <SearchInput
                    className="flex-grow"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search by name or city..."
                    theme={theme}
                />
                <div className="relative">
                    <button
                        onClick={() => setShowFilterMenu(f => !f)}
                        className="p-3.5 rounded-lg"
                        style={{ backgroundColor: theme.colors.subtle }}
                    >
                        <Filter className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
                    </button>
                    {showFilterMenu && (
                        <GlassCard ref={filterMenuRef} theme={theme} className="absolute top-14 right-0 z-10 w-40 p-2">
                            <button
                                onClick={() => handleSort('name')}
                                className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${sortConfig.key === 'name' ? 'font-bold' : ''}`}
                                style={{
                                    color: theme.colors.textPrimary,
                                    backgroundColor: sortConfig.key === 'name' ? theme.colors.subtle : 'transparent'
                                }}
                            >
                                A-Z
                            </button>
                            <button
                                onClick={() => handleSort('sales')}
                                className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${sortConfig.key === 'sales' ? 'font-bold' : ''}`}
                                style={{
                                    color: theme.colors.textPrimary,
                                    backgroundColor: sortConfig.key === 'sales' ? theme.colors.subtle : 'transparent'
                                }}
                            >
                                By Sales
                            </button>
                            <button
                                onClick={() => handleSort('bookings')}
                                className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${sortConfig.key === 'bookings' ? 'font-bold' : ''}`}
                                style={{
                                    color: theme.colors.textPrimary,
                                    backgroundColor: sortConfig.key === 'bookings' ? theme.colors.subtle : 'transparent'
                                }}
                            >
                                By Bookings
                            </button>
                        </GlassCard>
                    )}
                </div>
            </div>

            <div className="px-4 space-y-3 pb-4">
                {sortedAndFilteredDealers.map(dealer => (
                    <GlassCard
                        key={dealer.id}
                        theme={theme}
                        className="p-4 cursor-pointer hover:border-gray-400/50"
                        onClick={() => setSelectedDealer(dealer)}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                                    {dealer.name}
                                </h3>
                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                    {dealer.address}
                                </p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                                <p className="text-xs font-semibold capitalize" style={{ color: theme.colors.textSecondary }}>
                                    {sortConfig.key}
                                </p>
                                <p className="font-bold" style={{ color: theme.colors.textPrimary }}>
                                    ${dealer[sortConfig.key === 'name' ? 'bookings' : sortConfig.key].toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <Modal show={!!selectedDealer} onClose={() => setSelectedDealer(null)} title="" theme={theme}>
                {selectedDealer && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                                    {selectedDealer.name}
                                </h2>
                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                    {selectedDealer.address}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddPersonModal(true)}
                                className="p-2 -mr-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                            >
                                <UserPlus className="w-5 h-5" style={{ color: theme.colors.accent }} />
                            </button>
                        </div>

                        <div className="border-t border-b py-4 space-y-4" style={{ borderColor: theme.colors.subtle }}>
                            <div>
                                <ModalSectionHeader title="Daily Discount" />
                                <FormInput
                                    type="select"
                                    theme={theme}
                                    value={selectedDealer.dailyDiscount}
                                    onChange={e => setPendingDiscountChange({
                                        dealerId: selectedDealer.id,
                                        newDiscount: e.target.value
                                    })}
                                    options={DAILY_DISCOUNT_OPTIONS.map(opt => ({ label: opt, value: opt }))}
                                />
                            </div>
                            <div>
                                <ModalSectionHeader title="Recent Orders" />
                                {selectedDealer.recentOrders.length > 0 ? (
                                    <div className="space-y-2 mt-2">
                                        {selectedDealer.recentOrders.map(order => (
                                            <div
                                                key={order.id}
                                                className="flex justify-between items-center text-sm p-2 rounded-md"
                                                style={{ backgroundColor: theme.colors.subtle }}
                                            >
                                                <div>
                                                    <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                                                        #{order.id}
                                                    </span>
                                                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                                        Shipped: {new Date(order.shippedDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                                                    ${order.amount.toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                                        No recent orders.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <StaffSection title="Salespeople" members={selectedDealer.salespeople} />
                            <StaffSection title="Designers" members={selectedDealer.designers} />
                            <StaffSection title="Administration" members={selectedDealer.administration} />
                            <StaffSection title="Installers" members={selectedDealer.installers} />
                        </div>
                    </div>
                )}
            </Modal>

            <Modal show={!!pendingDiscountChange} onClose={() => setPendingDiscountChange(null)} title="Confirm Change" theme={theme}>
                <p style={{ color: theme.colors.textPrimary }}>
                    Are you sure you want to change the daily discount to{' '}
                    <span className="font-bold">{pendingDiscountChange?.newDiscount}</span>?
                </p>
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        onClick={() => setPendingDiscountChange(null)}
                        className="font-bold py-2 px-5 rounded-lg"
                        style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmDiscountChange}
                        className="font-bold py-2 px-5 rounded-lg text-white"
                        style={{ backgroundColor: theme.colors.accent }}
                    >
                        Save
                    </button>
                </div>
            </Modal>

            <Modal show={showAddPersonModal} onClose={() => setShowAddPersonModal(false)} title="Add New Person" theme={theme}>
                <form onSubmit={handleAddPerson} className="space-y-4">
                    <FormInput
                        label="First Name"
                        value={newPerson.firstName}
                        onChange={e => setNewPerson(p => ({ ...p, firstName: e.target.value }))}
                        theme={theme}
                        required
                    />
                    <FormInput
                        label="Last Name"
                        value={newPerson.lastName}
                        onChange={e => setNewPerson(p => ({ ...p, lastName: e.target.value }))}
                        theme={theme}
                        required
                    />
                    <FormInput
                        label="Email"
                        type="email"
                        value={newPerson.email}
                        onChange={e => setNewPerson(p => ({ ...p, email: e.target.value }))}
                        theme={theme}
                        required
                    />
                    <FormInput
                        label="Role"
                        type="select"
                        value={newPerson.role}
                        onChange={e => setNewPerson(p => ({ ...p, role: e.target.value }))}
                        theme={theme}
                        options={[
                            { label: 'Salesperson', value: 'salespeople' },
                            { label: 'Designer', value: 'designers' },
                            { label: 'Admin', value: 'administration' },
                            { label: 'Installer', value: 'installers' }
                        ]}
                    />
                    <div className="pt-2 text-center">
                        <p className="text-xs mb-2" style={{ color: theme.colors.textSecondary }}>
                            This will send an invitation to the user to join the MyJSI app.
                        </p>
                        <button
                            type="submit"
                            className="w-full font-bold py-3 px-6 rounded-lg text-white"
                            style={{ backgroundColor: theme.colors.accent }}
                        >
                            Send Invite
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};
const CommissionRatesScreen = ({ theme, onNavigate }) => {
    return (
        <div className="p-6">
            <PageTitle title="Commission Rates" theme={theme} />
            <div className="mt-4">
                {/* Your commission rates content here */}
                <p>Commission rates content goes here...</p>
            </div>
        </div>
    );
};



export const SampleDiscountsScreen = ({ theme, onNavigate, setSuccessMessage }) => {
    const handleCopy = useCallback((textToCopy) => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setSuccessMessage("SSA# Copied!");
            setTimeout(() => setSuccessMessage(""), 1200);
        });
    }, [setSuccessMessage]);

    return (
        <>
            {/* The redundant "Back to Resources" button has been removed from here */}
            <PageTitle title="Sample Discounts" theme={theme} />

            <div className="px-4 space-y-4 pb-4">
                {Data.SAMPLE_DISCOUNTS_DATA.map((discount) => (
                    <GlassCard key={discount.ssa} theme={theme} className="p-4 flex items-center space-x-4">
                        <div className="flex-shrink-0 w-24 text-center">
                            <p className="text-5xl font-bold" style={{ color: theme.colors.accent }}>{discount.off.match(/\d+/)[0]}%</p>
                            <p className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>Off List</p>
                        </div>
                        <div className="flex-1 space-y-3 border-l pl-4" style={{ borderColor: theme.colors.subtle }}>
                            <h3 className="font-bold text-lg text-center pb-2 border-b" style={{ color: theme.colors.textPrimary, borderColor: theme.colors.subtle }}>
                                {discount.title}
                            </h3>
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>SSA: {discount.ssa}</span>
                                <button onClick={() => handleCopy(discount.ssa)} className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 ml-2">
                                    <Copy className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                </button>
                            </div>
                            <div className="text-sm text-center pt-1 font-medium" style={{ color: theme.colors.textSecondary }}>
                                {discount.commission}
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </>
    );
};
const RequestFieldVisitScreen = ({ theme, setSuccessMessage, onNavigate }) => {
    // --- state ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [soNumber, setSoNumber] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [photos, setPhotos] = useState([]);
    const fileInputRef = useRef(null);

    // two weeks out boundary
    const twoWeeksFromNow = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 14);
        return d;
    }, []);

    // handle picking a date (only weekdays ≥ two weeks away)
    const handleDateClick = (day) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const clicked = new Date(year, month, day);
        const dow = clicked.getDay();
        if (clicked >= twoWeeksFromNow && dow > 0 && dow < 6) {
            setSelectedDate(clicked);
        }
    };

    // file input change
    const handleFileChange = (e) => {
        if (e.target.files) {
            setPhotos(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };
    const removePhoto = (i) => setPhotos(prev => prev.filter((_, idx) => idx !== i));

    // submission
    const handleSubmit = () => {
        if (selectedDate && soNumber && address && notes && photos.length) {
            setSuccessMessage('Field visit requested!');
            setTimeout(() => {
                setSuccessMessage('');
                onNavigate('home');
            }, 1500);
        } else {
            alert('Please fill out all fields and add at least one photo.');
        }
    };

    // render the month calendar
    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const numDays = new Date(year, month + 1, 0).getDate();

        const blanks = Array(firstDay).fill(null);
        const days = Array.from({ length: numDays }, (_, i) => i + 1);

        return (
            <GlassCard theme={theme} className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-full hover:bg-black/10">
                        <ChevronLeft style={{ color: theme.colors.textSecondary }} />
                    </button>
                    <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-full hover:bg-black/10">
                        <ChevronRight style={{ color: theme.colors.textSecondary }} />
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 mt-2">
                    {blanks.map((_, i) => <div key={`b-${i}`} />)}
                    {days.map(day => {
                        const date = new Date(year, month, day);
                        const dow = date.getDay();
                        const isAvail = date >= twoWeeksFromNow && dow > 0 && dow < 6;
                        const isSel = selectedDate?.toDateString() === date.toDateString();
                        return (
                            <button
                                key={day}
                                onClick={() => handleDateClick(day)}
                                disabled={!isAvail}
                                className={`relative h-10 w-10 rounded-full flex items-center justify-center transition ${isSel ? 'ring-2 ring-offset-2 scale-110' : 'hover:bg-black/5 disabled:opacity-40'
                                    }`}
                                style={{
                                    borderColor: theme.colors.accent,
                                    backgroundColor: isSel ? theme.colors.accent : 'transparent',
                                    color: isSel ? '#fff' : theme.colors.textPrimary,
                                }}
                            >
                                {day}
                                {!isSel && isAvail && <span className="absolute bottom-1.5 h-1.5 w-1.5 bg-green-400 rounded-full" />}
                            </button>
                        );
                    })}
                </div>
            </GlassCard>
        );
    };

    return (
        <>
            <PageTitle title="Request Field Visit" theme={theme} />

            <div className="px-4 pb-4 space-y-4">
                {renderCalendar()}

                {selectedDate && (
                    <div className="animate-fade-in space-y-4">
                        <GlassCard theme={theme} className="p-4 space-y-4">
                            <p className="font-bold text-center text-lg" style={{ color: theme.colors.textPrimary }}>
                                Visit Details for {selectedDate.toLocaleDateString()}
                            </p>

                            <FormInput
                                label="Sales Order #"
                                value={soNumber}
                                onChange={e => setSoNumber(e.target.value)}
                                placeholder="Enter SO#"
                                theme={theme}
                                required
                            />

                            <FormInput
                                label="Address for Visit"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                placeholder="Enter full address"
                                theme={theme}
                                required
                            />

                            <FormInput
                                label="Notes"
                                type="textarea"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="What went wrong or what is needed?"
                                theme={theme}
                                required
                            />

                            <div>
                                <label className="text-xs font-semibold px-1" style={{ color: theme.colors.textSecondary }}>
                                    Photos
                                </label>
                                <div className="mt-1 grid grid-cols-3 gap-2">
                                    {photos.map((file, idx) => (
                                        <div key={idx} className="relative aspect-square">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`preview-${idx}`}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                            <button
                                                onClick={() => removePhoto(idx)}
                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg"
                                        style={{ borderColor: theme.colors.subtle, color: theme.colors.textSecondary }}
                                    >
                                        <Camera className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-semibold">Add Photo</span>
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                className="w-full font-bold py-3 px-6 rounded-lg transition-colors"
                                style={{ backgroundColor: theme.colors.accent, color: '#FFFFFF' }}
                            >
                                Submit Request
                            </button>
                        </GlassCard>
                    </div>
                )}
            </div>
        </>
    );
};

const DealerRegistrationScreen = ({ navigation }) => {
    const [dealerName, setDealerName] = useState('');
    const [address, setAddress] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [email, setEmail] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');

    const handleSubmit = () => {
        // TODO: Add validation and API integration
        const registrationData = {
            dealerName,
            address,
            contactNumber,
            email,
            licenseNumber,
        };
        console.log('Registering dealer:', registrationData);
        // Navigate to confirmation or dashboard
        navigation.navigate('Home');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Dealer Registration</Text>

            <TextInput
                style={styles.input}
                placeholder="Dealer Name"
                value={dealerName}
                onChangeText={setDealerName}
            />

            <TextInput
                style={styles.input}
                placeholder="Address"
                value={address}
                onChangeText={setAddress}
            />

            <TextInput
                style={styles.input}
                placeholder="Contact Number"
                keyboardType="phone-pad"
                value={contactNumber}
                onChangeText={setContactNumber}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder="Business License Number"
                value={licenseNumber}
                onChangeText={setLicenseNumber}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'center',
    },
    title: {
        fontSize: '24px',
        marginBottom: '20px',
    },
};
<div style={styles.container}>
    <h1 style={styles.title}>Hello</h1>
    …
</div>

export const LoanerPoolScreen = ({ theme, onNavigate, setSuccessMessage, userSettings }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLoaners, setSelectedLoaners] = useState([]);
    const [address, setAddress] = useState('');
    const [predictions, setPredictions] = useState([]);
    const autocompleteService = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const Maps_API_KEY = 'YOUR_Maps_API_KEY_HERE';
        if (window.google && window.google.maps && window.google.maps.places) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
            return;
        }
        const scriptId = 'google-maps-script';
        if (document.getElementById(scriptId)) return;

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${Maps_API_KEY}&libraries=places`;
        script.async = true;
        document.head.appendChild(script);
        script.onload = () => {
            if (window.google?.maps?.places) {
                autocompleteService.current = new window.google.maps.places.AutocompleteService();
            }
        };
    }, []);

    const handleAddressChange = (e) => {
        const value = e.target.value;
        setAddress(value);
        if (autocompleteService.current && value) {
            autocompleteService.current.getPlacePredictions({ input: value }, (preds) => { setPredictions(preds || []); });
        } else {
            setPredictions([]);
        }
    };

    const handleSelectPrediction = (prediction) => {
        setAddress(prediction.description);
        setPredictions([]);
    };

    const handleToggleLoaner = (id) => {
        setSelectedLoaners(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const filteredLoaners = Data.LOANER_POOL_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = () => {
        setSuccessMessage('Loaner Request Submitted!');
        setTimeout(() => {
            setSuccessMessage('');
            onNavigate('home');
        }, 1200);
    };

    // New logic to get the names of selected items
    const selectedItemNames = useMemo(() =>
        Data.LOANER_POOL_PRODUCTS
            .filter(p => selectedLoaners.includes(p.id))
            .map(p => p.name)
            .join(', '),
        [selectedLoaners]
    );

    return (
        <div className="h-full flex flex-col">
            <PageTitle title="Loaner Pool" theme={theme} />
            <div className="px-4 pt-2 pb-4">
                <SearchInput value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name or model..." theme={theme} />
            </div>

            <div className="flex-1 overflow-y-auto px-4 grid grid-cols-2 gap-4 pb-4 scrollbar-hide">
                {filteredLoaners.map(item => (
                    <LoanerItemCard
                        key={item.id}
                        item={item}
                        isSelected={selectedLoaners.includes(item.id)}
                        onSelect={handleToggleLoaner}
                        theme={theme}
                    />
                ))}
            </div>

            <div className="px-4 space-y-3 pt-3 pb-4 sticky bottom-0 border-t" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
                <div className="flex justify-between items-center px-1">
                    <h3 className="font-bold" style={{ color: theme.colors.textPrimary }}>Requested:</h3>
                    {/* FIX: Show names of requested items instead of a count */}
                    <p className="text-sm font-semibold truncate" style={{ color: theme.colors.textSecondary }}>
                        {selectedLoaners.length > 0 ? selectedItemNames : "No items selected"}
                    </p>
                </div>
                <GlassCard theme={theme} className="p-4 space-y-2">
                    <h3 className="font-bold px-1" style={{ color: theme.colors.textPrimary }}>Ship To</h3>
                    <div className="relative">
                        <textarea ref={inputRef} value={address} onChange={handleAddressChange} rows="2" placeholder="Start typing shipping address..." className="w-full p-3 pr-12 border rounded-2xl" style={{ backgroundColor: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary, resize: 'none' }} />
                        <button onClick={() => setAddress(userSettings.homeAddress)} className="absolute top-3 right-3 p-1 rounded-full" style={{ backgroundColor: theme.colors.surface }}><Home className="w-5 h-5" style={{ color: theme.colors.secondary }} /></button>
                        {predictions.length > 0 && (
                            <GlassCard theme={theme} className="absolute w-full mt-1 z-10 p-1 bottom-full mb-2">
                                {predictions.map(p => (<button key={p.place_id} onClick={() => handleSelectPrediction(p)} className="block w-full text-left p-2 rounded-md hover:bg-black/5" style={{ color: theme.colors.textSecondary }}>{p.description}</button>))}
                            </GlassCard>
                        )}
                    </div>
                </GlassCard>
                <button
                    onClick={handleSubmit}
                    disabled={selectedLoaners.length === 0 || !address.trim()}
                    className="w-full font-bold py-3.5 px-6 rounded-full transition-colors disabled:opacity-50"
                    style={{ backgroundColor: theme.colors.accent, color: '#FFF' }}
                >
                    Submit Request
                </button>
            </div>
        </div>
    );
};
export const LoanerItemCard = ({ item, isSelected, onSelect, theme }) => {
    return (
        <div
            onClick={() => onSelect(item.id)}
            className={`transition-all duration-300 ease-in-out cursor-pointer ${isSelected ? 'scale-100 opacity-100' : 'scale-95 opacity-80 hover:opacity-100'}`}
        >
            <GlassCard
                theme={theme}
                className="p-0 overflow-hidden"
                // FIX: The border is now thicker and uses the theme's accent color for a more obvious selection
                style={{
                    borderWidth: isSelected ? '3px' : '1px',
                    borderColor: isSelected ? theme.colors.accent : theme.colors.border
                }}
            >
                {/* Main Visual Area */}
                <div className="relative aspect-square w-full group">
                    <img src={item.img} alt={item.name} className="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-3 text-white">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <p className="font-mono text-xs opacity-80">{item.model}</p>
                    </div>
                </div>

                {/* Animated Expansion for Specs */}
                <div className={`transition-all duration-500 ease-in-out grid ${isSelected ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                        <div className="p-4 space-y-3 border-t" style={{ borderColor: theme.colors.subtle }}>
                            <h4 className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>Specifications</h4>
                            {/* FIX: Improved UI for formatting specifications */}
                            <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-sm">
                                {Object.entries(item.specs).map(([key, value]) => (
                                    <React.Fragment key={key}>
                                        <div className="font-medium" style={{ color: theme.colors.textSecondary }}>{key}:</div>
                                        <div className="font-semibold text-right" style={{ color: theme.colors.textPrimary }}>{value}</div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};
export const ResourceDetailScreen = ({ theme, onNavigate, setSuccessMessage, userSettings, showAlert, currentScreen }) => {
    // Extract the specific resource type from the URL-like path
    const category = currentScreen.split('/')[1]?.replace(/_/g, ' ');

    switch (category) {
        case 'presentations':
            const pathParts = currentScreen.split('/');
            const subScreen = pathParts[2];
            const seriesId = pathParts[3];

            if (subScreen === 'view' && seriesId) {
                return <PresentationViewerScreen theme={theme} seriesId={seriesId} onBack={() => onNavigate('resources/presentations/by_series_list')} />;
            }
            if (subScreen === 'by_series_list') {
                return <PresentationSeriesListScreen theme={theme} onNavigate={onNavigate} />;
            }
            return <PresentationsScreen theme={theme} onNavigate={onNavigate} />;

        case 'dealer directory':
            return <DealerDirectoryScreen theme={theme} showAlert={showAlert} setSuccessMessage={setSuccessMessage} />;
        case 'loaner pool':
            return <LoanerPoolScreen theme={theme} onNavigate={onNavigate} setSuccessMessage={setSuccessMessage} userSettings={userSettings} />;
        case 'commission rates':
            return <CommissionRatesScreen theme={theme} onNavigate={onNavigate} />;
        case 'contracts':
            return <ContractsScreen theme={theme} onNavigate={onNavigate} />;
        case 'dealer registration':
            return <DealerRegistrationScreen theme={theme} onNavigate={onNavigate} setSuccessMessage={setSuccessMessage} />;
        case 'discontinued finishes':
            return <DiscontinuedFinishesScreen theme={theme} onNavigate={onNavigate} />;
        case 'sample discounts':
            return <SampleDiscountsScreen theme={theme} onNavigate={onNavigate} />;
        case 'social media':
            return <SocialMediaScreen theme={theme} showAlert={showAlert} setSuccessMessage={setSuccessMessage} />;
        case 'request field visit':
            return <RequestFieldVisitScreen theme={theme} onNavigate={onNavigate} setSuccessMessage={setSuccessMessage} />;
        case 'install instructions':
            return <InstallInstructionsScreen theme={theme} />;
        case 'lead times':
            return <LeadTimesScreen theme={theme} />;
        default:
            return (
                <div className="px-4 pt-4 pb-4">
                    <PageTitle title={category?.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()) || "Resource"} theme={theme} />
                    <GlassCard theme={theme} className="p-8 text-center"><p style={{ color: theme.colors.textPrimary }}>Content for this section will be available soon.</p></GlassCard>
                </div>
            );
    }
};


const COMRequestScreen = ({ theme, onNavigate, showAlert }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModels, setSelectedModels] = useState([]);

    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        return JSI_MODELS.filter(
            m =>
                m.isUpholstered &&
                (m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    m.id.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm]);

    const addModel = model => {
        if (!selectedModels.find(m => m.id === model.id)) {
            setSelectedModels(prev => [
                ...prev,
                { ...model, quantity: 1, fabric: '', fabricSearch: '', showFabricSearch: false }
            ]);
        }
        setSearchTerm('');
    };

    const updateModel = (modelId, updates) => {
        setSelectedModels(prev =>
            prev.map(m => (m.id === modelId ? { ...m, ...updates } : m))
        );
    };

    const handleSearchSubmit = e => {
        e.preventDefault();
        if (searchResults.length) addModel(searchResults[0]);
    };

    const handleSubmit = () => {
        showAlert('COM Yardage Request Submitted (Demo)');
        onNavigate('resources');
    };

    return (
        <div className="flex flex-col h-full p-4">
            <button
                onClick={() => onNavigate('resources')}
                className="mb-4 text-sm font-medium flex items-center"
                style={{ color: theme.colors.textPrimary }}
            >
                ← Back to Resources
            </button>

            <Card className="mb-4 p-4">
                <form onSubmit={handleSearchSubmit} className="relative">
                    <SearchInput
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search model(s)…"
                        theme={theme}
                    />
                    {searchResults.length > 0 && searchTerm && (
                        <GlassCard
                            className="absolute w-full mt-1 z-10 p-2 space-y-1"
                            theme={theme}
                        >
                            {searchResults.map(model => (
                                <button
                                    key={model.id}
                                    onClick={() => addModel(model)}
                                    className="w-full text-left p-2 rounded-md hover:bg-black/5"
                                    style={{ color: theme.colors.textPrimary }}
                                >
                                    {model.name} ({model.id})
                                </button>
                            ))}
                        </GlassCard>
                    )}
                </form>
            </Card>

            <div className="flex-grow space-y-3 overflow-y-auto scrollbar-hide">
                {selectedModels.map(model => (
                    <GlassCard key={model.id} className="p-4 space-y-3" theme={theme}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                                    {model.id}
                                </p>
                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                    {model.series}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => updateModel(model.id, { quantity: Math.max(1, model.quantity - 1) })}
                                    className="p-1 rounded-full"
                                    style={{ backgroundColor: theme.colors.subtle }}
                                >
                                    −
                                </button>
                                <span className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                                    {model.quantity}
                                </span>
                                <button
                                    onClick={() => updateModel(model.id, { quantity: model.quantity + 1 })}
                                    className="p-1 rounded-full"
                                    style={{ backgroundColor: theme.colors.subtle }}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="mb-1 font-medium">Fabric</p>
                            <button
                                onClick={() => updateModel(model.id, { showFabricSearch: !model.showFabricSearch })}
                                className="w-full p-2 rounded-md flex items-center justify-between"
                                style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
                            >
                                <span>{model.fabric || 'Search Fabric'}</span>
                                <ArrowRight className="w-4 h-4" style={{ color: theme.colors.secondary }} />
                            </button>
                            {model.showFabricSearch && (
                                <div className="mt-2">
                                    <SearchInput
                                        value={model.fabricSearch}
                                        onChange={e => updateModel(model.id, { fabricSearch: e.target.value })}
                                        placeholder="Type to search fabric…"
                                        theme={theme}
                                    />
                                </div>
                            )}
                        </div>
                    </GlassCard>
                ))}
            </div>

            <div className="pt-4">
                <Button onClick={handleSubmit} disabled={!selectedModels.length} className="w-full">
                    Submit
                </Button>
            </div>
        </div>
    );
};

const gradeOptions = ['A', 'B', 'C', 'COL', 'COM', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L1', 'L2'];
const fabricTypeOptions = ['Type1', 'Type2', 'Type3']; // TODO: replace with real fabric types
const tackableOptions = ['Yes', 'No'];

export const FabricSearchForm = ({ theme, showAlert, onNavigate }) => {
    const [form, setForm] = useState({ supplier: '', pattern: '', jsiSeries: '' });
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    const fabricSuppliers = useMemo(() => ['Arc-Com', 'Camira', 'Carnegie', 'CF Stinson', 'Designtex', 'Guilford of Maine', 'Knoll', 'Kravet', 'Maharam', 'Momentum'], []);
    const fabricPatterns = useMemo(() => ['Astor', 'Caldera', 'Crossgrain', 'Dapper', 'Eco Wool', 'Heritage Tweed', 'Luxe Weave', 'Melange', 'Pixel', 'Prospect'], []);
    const jsiSeriesOptions = useMemo(() => ['Alden', 'Allied', 'Anthology', 'Aria', 'Cincture', 'Convert', 'Midwest', 'Momentum', 'Proton', 'Reveal', 'Symmetry', 'Vision', 'Wink'], []);

    const updateField = useCallback((field, value) => {
        setForm(f => ({ ...f, [field]: value }));
    }, []);

    const handleSubmit = useCallback(e => {
        e.preventDefault();
        if (!form.supplier || !form.jsiSeries) {
            setError('Supplier and JSI Series are required fields.');
            return;
        }
        setError('');
        let filtered = Data.FABRICS_DATA.filter(item =>
            item.supplier === form.supplier &&
            item.series === form.jsiSeries &&
            (!form.pattern || item.pattern === form.pattern)
        );
        setResults(filtered);
    }, [form]);

    const resetSearch = useCallback(() => {
        setForm({ supplier: '', pattern: '', jsiSeries: '' });
        setResults(null);
        setError('');
    }, []);

    return (
        <div className="flex flex-col h-full">
            {/* FIX: The onBack prop has been removed to hide the redundant back arrow */}
            <PageTitle title="Search Fabrics" theme={theme} />

            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
                {!results ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormSection title="" theme={theme}>
                            {error && <p className="text-sm text-red-500 -mt-2 mb-2 px-1">{error}</p>}

                            {/* FIX: Added dropdownClassName to make lists longer */}
                            <AutoCompleteCombobox label="Supplier" required value={form.supplier} onChange={v => updateField('supplier', v)} options={fabricSuppliers} placeholder="Search Suppliers" theme={theme} dropdownClassName="max-h-72" />
                            <AutoCompleteCombobox label="Pattern" value={form.pattern} onChange={v => updateField('pattern', v)} options={fabricPatterns} placeholder="Search Patterns (Optional)" theme={theme} dropdownClassName="max-h-72" />
                            <AutoCompleteCombobox label="JSI Series" required value={form.jsiSeries} onChange={v => updateField('jsiSeries', v)} options={jsiSeriesOptions} placeholder="Search JSI Series" theme={theme} dropdownClassName="max-h-72" />

                        </FormSection>
                        <button type="submit" className="w-full text-white font-bold py-3.5 rounded-full" style={{ backgroundColor: theme.colors.accent }}>Search</button>
                    </form>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        <FormSection title="Results" theme={theme}>
                            <div className="text-sm space-y-1">
                                <div><span className="font-medium" style={{ color: theme.colors.textSecondary }}>Supplier:</span> {form.supplier}</div>
                                {form.pattern && <div><span className="font-medium" style={{ color: theme.colors.textSecondary }}>Pattern:</span> {form.pattern}</div>}
                                <div><span className="font-medium" style={{ color: theme.colors.textSecondary }}>Series:</span> {form.jsiSeries}</div>
                            </div>
                        </FormSection>

                        {results.length > 0 ? results.map((r, i) => (
                            <GlassCard key={i} theme={theme} className="p-4">
                                <p className="text-green-600 font-semibold mb-2">Approved</p>
                                <div className="space-y-1 text-sm">
                                    <div><span className="font-medium" style={{ color: theme.colors.textSecondary }}>Pattern:</span> {r.pattern}</div>
                                    <div><span className="font-medium" style={{ color: theme.colors.textSecondary }}>Grade:</span> {r.grade}</div>
                                    <div><span className="font-medium" style={{ color: theme.colors.textSecondary }}>Tackable:</span> {r.tackable}</div>
                                </div>
                            </GlassCard>
                        )) : (
                            <GlassCard theme={theme} className="p-8 text-center">
                                <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>No Results Found</p>
                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>There are no approved fabrics matching your criteria.</p>
                            </GlassCard>
                        )}

                        <button onClick={resetSearch} className="w-full text-white font-bold py-3.5 rounded-full" style={{ backgroundColor: theme.colors.accent }}>New Search</button>
                    </div>
                )}
            </div>
        </div>
    );
};
export const COMYardageRequestScreen = ({ theme, showAlert, onNavigate }) => {
    const [selectedModels, setSelectedModels] = useState([]);

    const addModel = useCallback((modelId) => {
        if (modelId && !selectedModels.some(m => m.id === modelId)) {
            const modelData = Data.JSI_MODELS.find(m => m.id === modelId);
            if (modelData) {
                setSelectedModels(prev => [...prev, { ...modelData, quantity: 1 }]);
            }
        }
    }, [selectedModels]);

    const updateModel = useCallback((modelId, updates) => {
        setSelectedModels(prev => prev.map(m => (m.id === modelId ? { ...m, ...updates } : m)));
    }, []);

    const removeModel = useCallback((modelId) => {
        setSelectedModels(prev => prev.filter(m => m.id !== modelId));
    }, []);

    const handleSubmit = () => {
        showAlert('COM Yardage Request Submitted (Demo)');
        onNavigate('resources');
    };

    const modelOptions = useMemo(() =>
        Data.JSI_MODELS
            .filter(m => m.isUpholstered && !selectedModels.some(sm => sm.id === m.id))
            .map(m => `${m.name} (${m.id})`),
        [selectedModels]
    );

    return (
        <div className="flex flex-col h-full">
            <PageTitle title="COM Yardage Request" theme={theme} onBack={() => onNavigate('fabrics')} />
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-hide">
                <FormSection title="Selected Models" theme={theme}>
                    {selectedModels.length === 0 && (
                        <p className="text-center text-sm" style={{ color: theme.colors.textSecondary }}>
                            Use the dropdown below to add models to your request.
                        </p>
                    )}
                    {selectedModels.map(model => (
                        <GlassCard key={model.id} className="p-4 space-y-3" style={{ backgroundColor: theme.colors.subtle }}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>{model.name}</p>
                                    <p className="text-sm font-mono" style={{ color: theme.colors.textSecondary }}>{model.id}</p>
                                </div>
                                <button onClick={() => removeModel(model.id)} className="p-1 rounded-full hover:bg-red-500/10"><X className="w-5 h-5 text-red-500" /></button>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>Quantity</label>
                                <div className="flex items-center space-x-2">
                                    <button type="button" onClick={() => updateModel(model.id, { quantity: Math.max(1, model.quantity - 1) })} className="p-1 rounded-full" style={{ backgroundColor: theme.colors.surface }}><Minus className="w-4 h-4" style={{ color: theme.colors.secondary }} /></button>
                                    <span className="font-bold w-8 text-center" style={{ color: theme.colors.textPrimary }}>{model.quantity}</span>
                                    <button type="button" onClick={() => updateModel(model.id, { quantity: model.quantity + 1 })} className="p-1 rounded-full" style={{ backgroundColor: theme.colors.surface }}><Plus className="w-4 h-4" style={{ color: theme.colors.secondary }} /></button>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                    <div className="pt-2">
                        <AutoCompleteCombobox
                            value=""
                            onChange={(val) => {
                                const modelId = val.match(/\(([^)]+)\)/)?.[1];
                                addModel(modelId);
                            }}
                            placeholder="+ Add a Model..."
                            options={modelOptions}
                            theme={theme}
                        />
                    </div>
                </FormSection>

                <div className="pt-4 pb-4">
                    <button onClick={handleSubmit} disabled={selectedModels.length === 0} className="w-full font-bold py-3.5 px-6 rounded-full transition-colors disabled:opacity-50" style={{ backgroundColor: theme.colors.accent, color: '#FFFFFF' }}>
                        Submit Request
                    </button>
                </div>
            </div>
        </div>
    );
};

export const FabricsScreen = ({ onNavigate, theme, currentScreen, showAlert }) => {
    const subScreen = currentScreen.split('/')[1];

    if (subScreen === 'search_form') {
        // FIX: Ensure the theme prop is passed here
        return <FabricSearchForm theme={theme} showAlert={showAlert} onNavigate={onNavigate} />;
    }

    if (subScreen === 'com_request') {
        // FIX: Ensure the theme prop is passed here
        return <COMYardageRequestScreen theme={theme} showAlert={showAlert} onNavigate={onNavigate} />;
    }

    // This is the main menu for the Fabrics section
    return (
        <>
            <PageTitle title="Fabrics" theme={theme} />
            <div className="px-4 space-y-3 pb-4">
                <GlassCard theme={theme} className="p-1">
                    <button onClick={() => onNavigate('fabrics/search_form')} className="w-full p-4 rounded-xl flex items-center justify-between">
                        <span className="text-md font-semibold tracking-tight" style={{ color: theme.colors.textPrimary }}>Search Database</span>
                        <ArrowRight className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                    </button>
                </GlassCard>
                <GlassCard theme={theme} className="p-1">
                    <button onClick={() => onNavigate('fabrics/com_request')} className="w-full p-4 rounded-xl flex items-center justify-between">
                        <span className="text-md font-semibold tracking-tight" style={{ color: theme.colors.textPrimary }}>Request COM Yardage</span>
                        <ArrowRight className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                    </button>
                </GlassCard>
            </div>
        </>
    );
};

const SearchFormScreen = ({ theme }) => {
    const fabricSuppliers = [
        'Arc-Com', 'Camira', 'Carnegie', 'CF Stinson', 'Designtex',
        'Guilford of Maine', 'Knoll', 'Kravet', 'Maharam', 'Momentum'
    ];
    const fabricPatterns = [
        'Astor', 'Caldera', 'Crossgrain', 'Dapper', 'Eco Wool',
        'Heritage Tweed', 'Luxe Weave', 'Melange', 'Pixel', 'Prospect'
    ];
    const jsiSeriesOptions = [
        'Alden', 'Allied', 'Anthology', 'Aria', 'Cincture',
        'Convert', 'Midwest', 'Momentum', 'Proton', 'Reveal',
        'Symmetry', 'Vision', 'Wink'
    ];

    const initialForm = {
        supplier: '',
        pattern: '',
        jsiSeries: '',
        grade: [],
        fabricType: [],
        tackable: []
    };

    const [form, setForm] = useState(initialForm);
    const [showGradeOptions, setShowGradeOptions] = useState(false);
    const [showFabricOptions, setShowFabricOptions] = useState(false);
    const [showTackableOptions, setShowTackableOptions] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    const updateField = useCallback((field, value) => {
        setForm(f => ({ ...f, [field]: value }));
    }, []);

    const updateMulti = useCallback((field, value) => {
        setForm(f => {
            const has = f[field].includes(value);
            const arr = has ? f[field].filter(x => x !== value) : [...f[field], value];
            return { ...f, [field]: arr };
        });
        if (field === 'grade') setShowGradeOptions(true);
        if (field === 'fabricType') setShowFabricOptions(true);
        if (field === 'tackable') setShowTackableOptions(true);
    }, []);

    const handleSubmit = useCallback(e => {
        e.preventDefault();
        if (!form.supplier || !form.jsiSeries) {
            setError('Supplier and Series are required.');
            return;
        }
        setError('');
        let filtered = FABRICS_DATA.filter(item =>
            item.supplier === form.supplier &&
            item.series === form.jsiSeries &&
            (!form.pattern || item.pattern === form.pattern) &&
            (form.grade.length === 0 || form.grade.includes(item.grade)) &&
            (form.fabricType.length === 0 || form.fabricType.includes(item.textile)) &&
            (form.tackable.length === 0 || form.tackable.includes(item.tackable))
        );
        // demo fallback
        if (
            filtered.length === 0 &&
            form.supplier === 'Arc-Com' &&
            form.jsiSeries === 'Alden'
        ) {
            filtered = [{
                supplier: 'Arc-Com',
                pattern: 'Demo',
                grade: 'A',
                tackable: 'yes',
                textile: 'Fabric'
            }];
        }
        setResults(filtered);
    }, [form]);

    const resetSearch = useCallback(() => {
        setForm(initialForm);
        setResults(null);
        setShowGradeOptions(false);
        setShowFabricOptions(false);
        setShowTackableOptions(false);
        setError('');
    }, []);

    return (
        <div className="px-4 py-6">
            {!results ? (
                <Card theme={theme} className="p-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <p className="text-sm text-destructive">{error}</p>}

                        <AutoCompleteCombobox
                            theme={theme}
                            label="Supplier *"
                            placeholder="Search Supplier"
                            value={form.supplier}
                            onChange={v => updateField('supplier', v)}
                            options={fabricSuppliers}
                        />

                        <AutoCompleteCombobox
                            theme={theme}
                            label="Pattern"
                            placeholder="Search Pattern"
                            value={form.pattern}
                            onChange={v => updateField('pattern', v)}
                            options={fabricPatterns}
                        />

                        <AutoCompleteCombobox
                            theme={theme}
                            label="JSI Series *"
                            placeholder="Search JSI Series"
                            value={form.jsiSeries}
                            onChange={v => updateField('jsiSeries', v)}
                            options={jsiSeriesOptions}
                        />

                        <div>
                            <p className="mb-2 font-medium">Grade</p>
                            <div className="flex flex-wrap gap-2">
                                {!showGradeOptions
                                    ? <Button theme={theme} onClick={() => setShowGradeOptions(true)}>Any</Button>
                                    : <>
                                        <Button theme={theme} onClick={() => { updateField('grade', []); setShowGradeOptions(false); }}>Any</Button>
                                        {['A', 'B', 'C', 'COL', 'COM', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L1', 'L2'].map(g => (
                                            <Button
                                                key={g}
                                                theme={theme}
                                                onClick={() => updateMulti('grade', g)}
                                                className={form.grade.includes(g) ? 'bg-accent text-white' : ''}
                                            >{g}</Button>
                                        ))}
                                    </>
                                }
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 font-medium">Fabric Type</p>
                            <div className="flex flex-wrap gap-2">
                                {!showFabricOptions
                                    ? <Button theme={theme} onClick={() => setShowFabricOptions(true)}>Any</Button>
                                    : <>
                                        <Button theme={theme} onClick={() => { updateField('fabricType', []); setShowFabricOptions(false); }}>Any</Button>
                                        {['Coated', 'Fabric', 'Leather', 'Panel'].map(t => (
                                            <Button
                                                key={t}
                                                theme={theme}
                                                onClick={() => updateMulti('fabricType', t)}
                                                className={form.fabricType.includes(t) ? 'bg-accent text-white' : ''}
                                            >{t}</Button>
                                        ))}
                                    </>
                                }
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 font-medium">Tackable</p>
                            <div className="flex flex-wrap gap-2">
                                {!showTackableOptions
                                    ? <Button theme={theme} onClick={() => setShowTackableOptions(true)}>Any</Button>
                                    : <>
                                        <Button theme={theme} onClick={() => { updateField('tackable', []); setShowTackableOptions(false); }}>Any</Button>
                                        {['Yes', 'No'].map(t => (
                                            <Button
                                                key={t}
                                                theme={theme}
                                                onClick={() => updateMulti('tackable', t.toLowerCase())}
                                                className={form.tackable.includes(t.toLowerCase()) ? 'bg-accent text-white' : ''}
                                            >{t}</Button>
                                        ))}
                                    </>
                                }
                            </div>
                        </div>

                        <Button theme={theme} type="submit" className="w-full">Search</Button>
                    </form>
                </Card>
            ) : (
                <div className="space-y-6">
                    <Card theme={theme} className="p-4">
                        <p className="font-semibold text-lg">Results: {results.length}</p>
                        <div className="mt-2 space-y-1 text-sm">
                            <div><span className="font-medium">Supplier:</span> {form.supplier}</div>
                            {form.pattern && <div><span className="font-medium">Pattern:</span> {form.pattern}</div>}
                            <div><span className="font-medium">Series:</span> {form.jsiSeries}</div>
                        </div>
                    </Card>
                    <div className="space-y-4">
                        {results.map((r, i) => (
                            <Card key={i} theme={theme} className="p-4">
                                <p className="text-primary font-semibold mb-2">Approved</p>
                                <div className="space-y-1 text-sm">
                                    <div><span className="font-medium">Supplier:</span> {r.supplier}</div>
                                    <div><span className="font-medium">Pattern:</span> {r.pattern}</div>
                                    <div><span className="font-medium">Grade:</span> {r.grade}</div>
                                    <div><span className="font-medium">Tackable:</span> {r.tackable}</div>
                                    <div><span className="font-medium">Textile:</span> {r.textile || 'Not Specified'}</div>
                                </div>
                            </Card>
                        ))}
                    </div>
                    <Button theme={theme} onClick={resetSearch} className="w-full">New Search</Button>
                </div>
            )}
        </div>
    );
}; 

const Avatar = ({ src, alt, theme }) => {
    const [err, setErr] = useState(false);

    // fallback to initials/icon if the image fails
    if (err || !src) {
        return (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User
                    className="w-5 h-5"
                    style={{ color: theme.colors.textSecondary }}
                />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className="w-10 h-10 rounded-full object-cover"
            onError={() => setErr(true)}
        />
    );
};


export const CartScreen = ({ theme, onNavigate, handleBack, cart, setCart, onUpdateCart, userSettings }) => {
    const [address, setAddress] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const cartItems = useMemo(() => {
        return Object.entries(cart).map(([id, quantity]) => {
            if (id === 'full-jsi-set') {
                return { id, name: 'Full JSI Sample Set', quantity };
            }
            if (id.startsWith('set-')) {
                const categoryId = id.replace('set-', '');
                const categoryName = Data.SAMPLE_CATEGORIES.find(c => c.id === categoryId)?.name || 'Unknown';
                return { id, name: `Complete ${categoryName} Set`, quantity };
            }
            const product = Data.SAMPLE_PRODUCTS.find(p => String(p.id) === id);
            return product ? { ...product, quantity } : null;
        }).filter(Boolean);
    }, [cart]);

    const handleSubmit = useCallback(() => {
        setIsSubmitted(true);
        setTimeout(() => {
            setCart({});
            onNavigate('home');
        }, 1200);
    }, [setCart, onNavigate]);

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <GlassCard theme={theme} className="p-8 flex flex-col items-center justify-center">
                    <CheckCircle className="w-16 h-16 mb-4" style={{ color: theme.colors.accent }} />
                    <h2 className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>Ordered!</h2>
                </GlassCard>
            </div>
        );
    }

    return (
        <>
            <PageTitle title="Cart" theme={theme} onBack={handleBack} />
            <div className="px-4 space-y-4 pb-4">
                <GlassCard theme={theme} className="p-4 space-y-2">
                    <h3 className="font-bold" style={{ color: theme.colors.textPrimary }}>Selected Samples</h3>
                    {cartItems.length > 0 ? cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm py-1">
                            <span style={{ color: theme.colors.textPrimary }}>{item.name}</span>
                            <div className="flex items-center space-x-3">
                                <button onClick={() => onUpdateCart(item, -1)} className="w-6 h-6 flex items-center justify-center rounded-md" style={{ backgroundColor: theme.colors.subtle }}><Minus className="w-4 h-4" style={{ color: theme.colors.textSecondary }} /></button>
                                <span className="font-bold w-4 text-center">{item.quantity}</span>
                                <button onClick={() => onUpdateCart(item, 1)} className="w-6 h-6 flex items-center justify-center rounded-md" style={{ backgroundColor: theme.colors.subtle }}><Plus className="w-4 h-4" style={{ color: theme.colors.textSecondary }} /></button>
                            </div>
                        </div>
                    )) : <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Your cart is empty.</p>}
                </GlassCard>
                <GlassCard theme={theme} className="p-4 space-y-2">
                    <h3 className="font-bold" style={{ color: theme.colors.textPrimary }}>Ship To</h3>
                    <div className="relative">
                        <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows="3" placeholder="Enter shipping address..." className="w-full p-2 pr-10 border rounded-lg" style={{ backgroundColor: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary }}></textarea>
                        <button onClick={() => setAddress(userSettings.homeAddress)} className="absolute top-2 right-2 p-1 rounded-full" style={{ backgroundColor: theme.colors.surface }}><Home className="w-5 h-5" style={{ color: theme.colors.secondary }} /></button>
                    </div>
                </GlassCard>
                <button onClick={handleSubmit} disabled={Object.keys(cart).length === 0 || !address.trim()} className="w-full font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50" style={{ backgroundColor: theme.colors.accent, color: '#FFFFFF' }}>Submit</button>
            </div>
        </>
    );
};

export const ProfileMenu = ({ show, onClose, onNavigate, toggleTheme, theme, isDarkMode }) => {
    if (!show) return null;

    const menuItems = [
        { label: isDarkMode ? 'Light Mode' : 'Dark Mode', action: () => { toggleTheme(); onClose(); }, icon: isDarkMode ? Sun : Moon },
        { label: 'Settings', action: () => onNavigate('settings'), icon: Settings },
        // UPDATED: "Members" is now "App Users"
        { label: 'App Users', action: () => onNavigate('members'), icon: User },
        { label: 'Help', action: () => onNavigate('help'), icon: HelpCircle },
        { label: 'Log Out', action: () => onNavigate('logout'), icon: LogOut },
    ];

    return (
        <div className="fixed inset-0 z-30 pointer-events-auto" onClick={onClose}>
            <GlassCard theme={theme} className="absolute top-24 right-4 w-48 p-2 space-y-1" onClick={(e) => e.stopPropagation()}>
                {menuItems.map(item => (
                    <button key={item.label} onClick={item.action} className="w-full text-left flex items-center px-3 py-2 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10" style={{ color: theme.colors.textPrimary }}>
                        <item.icon className="w-4 h-4 mr-3" style={{ color: theme.colors.secondary }} />
                        {item.label}
                    </button>
                ))}
            </GlassCard>
        </div>
    );
};
const PostCard = ({ post, theme }) => {
    const { user, timeAgo, text, image, likes = 0, comments = [] } = post;

    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(likes);
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [list, setList] = useState(comments);
    const [menu, setMenu] = useState(false);

    const toggleLike = () => { setLiked(!liked); setCount((c) => c + (liked ? -1 : 1)); };
    const addCmt = () => { if (!input.trim()) return; setList([...list, { id: Date.now(), name: 'You', text: input }]); setInput(''); };

    const sharePost = async () => {
        setMenu(false);
        const msg = `${text}\n${window.location.href}`;
        if (navigator.share && window.isSecureContext) {
            try { await navigator.share({ title: 'JSI Community Post', text, url: window.location.href }); return; } catch { }
        }
        try { await navigator.clipboard.writeText(msg); alert('Link copied!'); return; } catch { }
        const t = document.createElement('textarea'); t.value = msg; t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t);
        alert('Link copied!');
    };

    return (
        <GlassCard theme={theme} className="p-5 space-y-4 rounded-2xl shadow-lg">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <Avatar src={user.avatar} alt={user.name} theme={theme} />
                    <div>
                        <p className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>{user.name}</p>
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{timeAgo}</p>
                    </div>
                </div>
                <div className="relative">
                    <button onClick={() => setMenu(!menu)}>
                        <MoreVertical className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    </button>
                    {menu && (
                        <div className="absolute right-0 mt-1 w-28 rounded-lg shadow-lg z-20" style={{ backgroundColor: theme.colors.background }}>
                            <button onClick={sharePost} className="flex items-center w-full px-4 py-2 text-sm hover:bg-[rgba(0,0,0,0.03)]">
                                <Share2 className="w-4 h-4 mr-2" /> Share
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <p className="text-sm" style={{ color: theme.colors.textPrimary }}>{text}</p>
            {image && <img src={image} alt="" className="w-full rounded-xl object-cover max-h-72" style={{ border: `1px solid ${theme.colors.subtle}` }} />}

            <div className="flex items-center space-x-6">
                <button onClick={toggleLike} className="flex items-center space-x-1">
                    <Heart className={`w-5 h-5 transition-colors ${liked ? 'fill-current' : 'stroke-2'}`}
                        style={{ color: liked ? theme.colors.accent : theme.colors.textSecondary, fill: liked ? theme.colors.accent : 'none' }} />
                    <span className="text-sm" style={{ color: theme.colors.textSecondary }}>{count}</span>
                </button>
                <button onClick={() => setOpen(!open)} className="flex items-center space-x-1">
                    <MessageSquare className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    <span className="text-sm" style={{ color: theme.colors.textSecondary }}>{list.length}</span>
                </button>
            </div>

            {open && (
                <div className="space-y-3">
                    {list.map((c) => (
                        <p key={c.id} className="text-sm" style={{ color: theme.colors.textPrimary }}>
                            <span className="font-medium">{c.name}: </span>{c.text}
                        </p>
                    ))}
                    <div className="flex items-center space-x-2">
                        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Add a comment…"
                            className="flex-1 px-3 py-2 text-sm rounded-lg"
                            style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }} />
                        <button onClick={addCmt}><Send className="w-5 h-5" style={{ color: theme.colors.accent }} /></button>
                    </div>
                </div>
            )}
        </GlassCard>
    );
};



const WinsCard = ({ win, theme }) => {
    const { user, timeAgo, title, images } = win;
    const [idx, setIdx] = useState(0);
    const [menu, setMenu] = useState(false);

    const shareWin = async () => {
        setMenu(false);
        const msg = `${title}\n${window.location.href}`;
        if (navigator.share && window.isSecureContext) {
            try { await navigator.share({ title: 'JSI Win', text: title, url: window.location.href }); return; } catch { }
        }
        try { await navigator.clipboard.writeText(msg); alert('Link copied!'); return; } catch { }
        alert('Copy failed.');
    };

    const prev = () => setIdx((idx - 1 + images.length) % images.length);
    const next = () => setIdx((idx + 1) % images.length);

    return (
        <GlassCard theme={theme} className="p-5 space-y-4 rounded-2xl shadow-lg">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <Avatar src={user.avatar} alt={user.name} theme={theme} />
                    <div>
                        <p className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>{user.name}</p>
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{timeAgo}</p>
                    </div>
                </div>

                <div className="relative">
                    <button onClick={() => setMenu(!menu)}>
                        <MoreVertical className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    </button>
                    {menu && (
                        <div className="absolute right-0 mt-1 w-28 rounded-lg shadow-lg z-20"
                            style={{ backgroundColor: theme.colors.background }}>
                            <button onClick={shareWin}
                                className="flex items-center w-full px-4 py-2 text-sm hover:bg-[rgba(0,0,0,0.03)]">
                                <Share2 className="w-4 h-4 mr-2" /> Share
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{title}</p>

            <div className="relative">
                <img
                    src={images[idx]}
                    alt=""
                    className="w-full rounded-xl object-cover max-h-72"
                    style={{ border: `1px solid ${theme.colors.subtle}` }}
                />

                {images.length > 1 && (
                    <>
                        <button onClick={prev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-[rgba(0,0,0,0.45)] hover:bg-[rgba(0,0,0,0.6)] p-2 rounded-full">
                            <ChevronLeft className="w-4 h-4 text-white" />
                        </button>
                        <button onClick={next}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[rgba(0,0,0,0.45)] hover:bg-[rgba(0,0,0,0.6)] p-2 rounded-full">
                            <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                    </>
                )}
            </div>
        </GlassCard>
    );
};

export const PollCard = ({ poll, theme }) => {
    const { user, timeAgo, question, options } = poll;
    const [choice, setChoice] = useState(null);

    // FIX: Re-added the menu state and share functionality.
    const [menu, setMenu] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const sharePoll = async () => {
        setMenu(false);
        const shareData = {
            title: 'JSI Poll',
            text: question,
            url: window.location.href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${question}\n${window.location.href}`);
                alert('Poll link copied to clipboard!');
            }
        } catch (err) {
            console.error("Share failed:", err);
            alert('Could not share at this time.');
        }
    };

    const totalVotes = useMemo(() => {
        if (choice === null) return 0;
        // In a real app, you'd get updated vote counts from a server.
        // For this demo, we'll just add 1 to the chosen option.
        return options.reduce((sum, o) => {
            let voteCount = o.votes;
            if (o.id === choice) {
                voteCount += 1;
            }
            return sum + voteCount;
        }, 0);
    }, [choice, options]);

    const handleVote = (optionId) => {
        if (choice === null) {
            setChoice(optionId);
        }
    };

    return (
        <GlassCard theme={theme} className="p-5 space-y-4 rounded-2xl shadow-lg">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <Avatar src={user.avatar} alt={user.name} theme={theme} />
                    <div>
                        <p className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>{user.name}</p>
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{timeAgo}</p>
                    </div>
                </div>
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setMenu(m => !m)}>
                        <MoreVertical className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    </button>
                    {menu && (
                        <GlassCard theme={theme} className="absolute right-0 mt-1 w-32 p-1 z-20">
                            <button onClick={sharePoll} className="flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10" style={{ color: theme.colors.textPrimary }}>
                                <Share2 className="w-4 h-4 mr-2" style={{ color: theme.colors.textSecondary }} /> Share
                            </button>
                        </GlassCard>
                    )}
                </div>
            </div>

            <p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{question}</p>

            <div className="space-y-2">
                {options.map((option) => {
                    const hasVoted = choice !== null;
                    const voteCount = choice === option.id ? option.votes + 1 : option.votes;
                    const percentage = hasVoted ? Math.round((voteCount / totalVotes) * 100) : 0;
                    const isChosen = choice === option.id;

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleVote(option.id)}
                            disabled={hasVoted}
                            // FIX: Changed from rounded-lg to rounded-full
                            className="w-full text-left p-0.5 rounded-full border transition-all duration-300"
                            style={{
                                cursor: hasVoted ? 'default' : 'pointer',
                                borderColor: isChosen ? theme.colors.accent : theme.colors.border,
                            }}
                        >
                            <div className="relative flex justify-between items-center px-4 py-2">
                                {/* Percentage bar background */}
                                {hasVoted && (
                                    <div
                                        className="absolute left-0 top-0 h-full rounded-full opacity-20 transition-all duration-500"
                                        style={{ width: `${percentage}%`, backgroundColor: theme.colors.accent }}
                                    ></div>
                                )}

                                <span className="relative z-10 font-medium" style={{ color: theme.colors.textPrimary }}>{option.text}</span>
                                {hasVoted && (
                                    <span className="relative z-10 text-sm font-bold" style={{ color: theme.colors.accent }}>{percentage}%</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </GlassCard>
    );
};

const EMPTY_USER = {
    firstName: '',
    lastName: '',
    email: '',
    role: 'User',
    title: '',
    permissions: {
        salesData: false,
        commissions: false,
        projects: false,
        customerRanking: false,
        dealerRewards: false,
        submittingReplacements: false
    }
};

const FormSection = ({ title, theme, children }) => (
    <div className="space-y-4">
        <h3 className="font-bold text-xl px-1" style={{ color: theme.colors.textPrimary }}>{title}</h3>
        <GlassCard theme={theme} className="p-4 space-y-4">
            {children}
        </GlassCard>
    </div>
);

const CreateContentModal = ({ close, pickType, typeChosen, onAdd, theme }) => {
    const type = typeChosen;
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [question, setQ] = useState('');
    const [optA, setA] = useState('');
    const [optB, setB] = useState('');

    const submit = () => {
        const now = 'just now';
        if (type === 'post') {
            onAdd('post', {
                id: Date.now(),
                user: { name: 'You', avatar: '' },
                timeAgo: now,
                text,
                image: file ? URL.createObjectURL(file) : null,
                likes: 0,
                comments: [],
            });
        }
        if (type === 'win') {
            onAdd('win', {
                id: Date.now(),
                user: { name: 'You', avatar: '' },
                timeAgo: now,
                title: text || 'Win!',
                images: [file ? URL.createObjectURL(file) : 'https://picsum.photos/seed/win/800/500'],
            });
        }
        if (type === 'poll') {
            onAdd('poll', {
                id: Date.now(),
                user: { name: 'You', avatar: '' },
                timeAgo: now,
                question,
                options: [
                    { id: 'a', text: optA || 'Option A', votes: 0 },
                    { id: 'b', text: optB || 'Option B', votes: 0 },
                ],
            });
        }
        close();
    };

    return (
        <div className="fixed inset-0 z-30 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="w-full max-w-md bg-white rounded-2xl p-6 space-y-6 relative"
                style={{ color: theme.colors.textPrimary, maxHeight: '90vh', overflowY: 'auto' }}>
                <button onClick={close} className="absolute right-4 top-4">
                    <X className="w-5 h-5" />
                </button>

                {!type && (
                    <>
                        <h3 className="text-lg font-semibold mb-3">Create…</h3>
                        <div className="space-y-3">
                            <button onClick={() => pickType('post')} className="w-full py-3 rounded-lg font-medium"
                                style={{ backgroundColor: theme.colors.subtle }}>Feed Post</button>
                            <button onClick={() => pickType('win')} className="w-full py-3 rounded-lg font-medium"
                                style={{ backgroundColor: theme.colors.subtle }}>Win</button>
                            <button onClick={() => pickType('poll')} className="w-full py-3 rounded-lg font-medium"
                                style={{ backgroundColor: theme.colors.subtle }}>Poll</button>
                        </div>
                    </>
                )}

                {type === 'post' && (
                    <>
                        <h3 className="text-lg font-semibold">New Feed Post</h3>
                        <textarea value={text} onChange={(e) => setText(e.target.value)}
                            rows={4} className="w-full p-3 rounded-lg"
                            style={{ backgroundColor: theme.colors.subtle }} />
                        <label className="block">
                            <input type="file" accept="image/*,video/*" hidden
                                onChange={(e) => setFile(e.target.files[0])} />
                            <span className="mt-3 inline-flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer"
                                style={{ backgroundColor: theme.colors.subtle }}>
                                {file ? <span>{file.name}</span> : <><Image className="w-4 h-4" /><span>Add attachment</span></>}
                            </span>
                        </label>
                        <button onClick={submit} className="w-full py-3 rounded-lg font-medium text-white"
                            style={{ backgroundColor: theme.colors.accent }}>Post</button>
                    </>
                )}

                {type === 'win' && (
                    <>
                        <h3 className="text-lg font-semibold">Share a Win</h3>
                        <textarea value={text} onChange={(e) => setText(e.target.value)}
                            rows={3} className="w-full p-3 rounded-lg"
                            style={{ backgroundColor: theme.colors.subtle }} placeholder="Describe your win…" />
                        <label className="block">
                            <input type="file" accept="image/*,video/*" hidden
                                onChange={(e) => setFile(e.target.files[0])} />
                            <span className="mt-3 inline-flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer"
                                style={{ backgroundColor: theme.colors.subtle }}>
                                {file ? <span>{file.name}</span> : <><Image className="w-4 h-4" /><span>Add photo/video</span></>}
                            </span>
                        </label>
                        <button onClick={submit} className="w-full py-3 rounded-lg font-medium text-white"
                            style={{ backgroundColor: theme.colors.accent }}>Post Win</button>
                    </>
                )}

                {type === 'poll' && (
                    <>
                        <h3 className="text-lg font-semibold">Create Poll</h3>
                        <input value={question} onChange={(e) => setQ(e.target.value)}
                            className="w-full p-3 rounded-lg"
                            style={{ backgroundColor: theme.colors.subtle }} placeholder="Question" />
                        <input value={optA} onChange={(e) => setA(e.target.value)}
                            className="w-full p-3 rounded-lg mt-3"
                            style={{ backgroundColor: theme.colors.subtle }} placeholder="Option A" />
                        <input value={optB} onChange={(e) => setB(e.target.value)}
                            className="w-full p-3 rounded-lg mt-3"
                            style={{ backgroundColor: theme.colors.subtle }} placeholder="Option B" />
                        <button onClick={submit} className="w-full py-3 rounded-lg font-medium text-white mt-4"
                            style={{ backgroundColor: theme.colors.accent }}>Post Poll</button>
                    </>
                )}
            </div>
        </div>
    );
};


const FancySelect = ({ value, onChange, options, placeholder, required, theme }) => (
    <div
        className="relative w-full rounded-full overflow-hidden"
        style={{ backgroundColor: theme.colors.subtle }}
    >
        <select
            required={required}
            value={value || ""}
            onChange={onChange}
            className="w-full py-3 pl-4 pr-10 rounded-full bg-transparent text-base font-medium cursor-pointer appearance-none focus:outline-none focus:ring-2"
            style={{
                color: value ? theme.colors.textPrimary : theme.colors.textSecondary,
                ringColor: theme.colors.accent,
            }}
        >
            <option value="" disabled hidden>
                {placeholder}
            </option>
            {options.map((o) => (
                <option key={o} value={o}>
                    {o}
                </option>
            ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
            <ChevronDown className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
        </div>
    </div>
);

const FormInput = React.memo(({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    options,
    className = "",
    theme,
    readOnly = false,
    required = false,
}) => {
    const inputClass = `w-full px-4 py-3 border rounded-full focus:ring-2 text-base outline-none ${className}`;
    const styles = {
        backgroundColor: theme.colors.subtle,
        borderColor: theme.colors.border, // <-- FIX: Changed from 'transparent'
        color: theme.colors.textPrimary,
        ringColor: theme.colors.accent,
    };

    const formatCurrency = (val) => {
        if (!val) return '';
        const numericValue = String(val).replace(/[^0-9]/g, '');
        if (!numericValue) return '$';
        return '$' + new Intl.NumberFormat('en-US').format(numericValue);
    };

    const handleCurrencyChange = (e) => {
        const numericValue = e.target.value.replace(/[^0-9]/g, '');
        onChange({ target: { value: numericValue } }); // Pass only digits to state
    };

    return (
        <div className="space-y-1">
            {label && (
                <label className="text-xs font-semibold px-4" style={{ color: theme.colors.textSecondary }}>
                    {label} {/* FIX: Removed required asterisk */}
                </label>
            )}
            {type === 'currency' ? (
                <input
                    type="text"
                    value={formatCurrency(value)}
                    onChange={handleCurrencyChange}
                    className={inputClass}
                    style={styles}
                    placeholder={placeholder}
                    required={required}
                />
            ) : type === 'textarea' ? (
                <textarea
                    value={value}
                    onChange={onChange}
                    className={inputClass.replace('rounded-full', 'rounded-2xl')}
                    style={styles}
                    rows="4"
                    placeholder={placeholder}
                    readOnly={readOnly}
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    className={inputClass}
                    style={styles}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    required={required}
                />
            )}
        </div>
    );
});

export const SearchInput = React.memo(({ onSubmit, value, onChange, placeholder, theme, className, onVoiceClick }) => (
    <form onSubmit={onSubmit} className={`relative flex items-center ${className || ''}`} >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5" style={{ color: theme.colors.textSecondary }} />
        </div>
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full pl-12 pr-12 py-3 border rounded-full focus:ring-2 text-base outline-none"
            style={{ backgroundColor: theme.colors.subtle, borderColor: 'transparent', color: theme.colors.textPrimary, ringColor: theme.colors.accent, }}
        />
        {onVoiceClick && (
            <button type="button" onClick={onVoiceClick} className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <Mic className="h-5 w-5" style={{ color: theme.colors.textSecondary }} />
            </button>
        )}
    </form>
));

const Modal = ({ show, onClose, title, children, theme }) => {
    if (!show) return null;
    return (
        <div
            className="absolute inset-0 bg-black bg-opacity-70 flex items-end justify-center z-50 transition-opacity duration-300 pointer-events-auto pt-16"
            style={{ opacity: show ? 1 : 0 }}
            onClick={onClose}
        >
            <div
                style={{ backgroundColor: theme.colors.surface, backdropFilter: theme.backdropFilter, WebkitBackdropFilter: theme.backdropFilter, borderColor: theme.colors.border, boxShadow: `0 4px 30px ${theme.colors.shadow}` }}
                className="rounded-t-2xl w-full max-w-md max-h-full flex flex-col transition-transform duration-300 transform"
                onClick={(e) => e.stopPropagation()}
            >
                {title !== "" && (
                    <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: theme.colors.border }}>
                        <h2 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>{title}</h2>
                        <button onClick={onClose} className="p-1 rounded-full transition-colors" style={{ backgroundColor: theme.colors.subtle }}>
                            <X className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                        </button>
                    </div>
                )}
                <div className={`${title !== "" ? "p-6" : "pt-8 px-6 pb-6"} overflow-y-auto space-y-4 scrollbar-hide`}>{children}</div>
            </div>
        </div>
    );
};

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
        <div style={{ backgroundColor: theme.colors.surface, backdropFilter: theme.backdropFilter, WebkitBackdropFilter: theme.backdropFilter }} className="mx-auto mt-4 w-[90%] px-6 py-3 flex justify-between items-center sticky top-0 z-20 rounded-full shadow-md backdrop-blur">
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
                    <div className="text-lg font-normal leading-tight" style={{ color: theme.colors.textPrimary }}>Hello, {userName}!</div>
                )}
                {/* UPDATED: Added border classes and styles for a defined circle */}
                <button
                    onClick={onProfileClick}
                    className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                    style={{ backgroundColor: theme.colors.subtle, borderColor: theme.colors.border }}
                >
                    <User className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                </button>
            </div>
        </div>
    );
});
export const HomeScreen = ({ onNavigate, theme, onAskAI, showAIDropdown, aiResponse, isAILoading, onCloseAIDropdown, onVoiceActivate }) => {
    const handleFeedbackClick = useCallback(() => {
        onNavigate('feedback');
    }, [onNavigate]);

    return (
        <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: theme.colors.background }}>
            <div className="px-4 pt-4 pb-2 relative z-10">
                <SmartSearch
                    theme={theme}
                    onNavigate={onNavigate}
                    onAskAI={onAskAI}
                    onVoiceActivate={onVoiceActivate}
                />
                {showAIDropdown && (
                    <GlassCard theme={theme} className="absolute top-full w-full mt-2 p-4 left-0">
                        {isAILoading ? (
                            <div className="flex items-center justify-center p-4">
                                <Hourglass className="w-6 h-6 animate-spin" style={{ color: theme.colors.accent }} />
                                <p className="ml-3" style={{ color: theme.colors.textPrimary }}>Thinking...</p>
                            </div>
                        ) : (
                            <p style={{ color: theme.colors.textPrimary }}>{aiResponse}</p>
                        )}
                    </GlassCard>
                )}
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
            {showAIDropdown && (<div className="absolute inset-0 bg-transparent z-0" onClick={onCloseAIDropdown} />)}
        </div>
    );
};
export const PermissionToggle = React.memo(({ label, isEnabled, onToggle, theme, disabled }) => {
    const titleText = disabled ? "Requires Sales Data access" : "";

    // This style object now has a more visible border color for the 'off' state
    const toggleStyle = {
        backgroundColor: isEnabled ? theme.colors.accent : 'transparent',
        borderColor: isEnabled ? theme.colors.accent : 'rgba(0, 0, 0, 0.2)',
    };

    return (
        <div title={titleText} className={`flex items-center justify-between text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} onClick={disabled ? undefined : onToggle}>
            <span style={{ color: theme.colors.textSecondary }}>{label}</span>
            <button
                type="button"
                role="switch"
                aria-checked={isEnabled}
                className="relative inline-flex items-center h-6 w-11 transition-colors duration-200 ease-in-out rounded-full border-2"
                style={toggleStyle}
            >
                <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isEnabled ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
            </button>
        </div>
    );
});
export const VoiceModal = ({ message, show, theme }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <GlassCard theme={theme} className="px-8 py-6 flex items-center space-x-4 shadow-2xl">
                <Mic className="w-7 h-7" style={{ color: theme.colors.accent }} />
                <span className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
                    {message}
                </span>
            </GlassCard>
        </div>
    );
};
const MonthlyBarChart = ({ data, theme }) => {
    const maxValue = Math.max(...data.map(d => Math.max(d.bookings, d.sales)));

    return (
        <div className="space-y-3">
            {data.map((item, index) => (
                <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span style={{ color: theme.colors.textSecondary }}>{item.month}</span>
                        <span style={{ color: theme.colors.textPrimary }}>
                            ${item.bookings?.toLocaleString() || 0}
                        </span>
                    </div>
                    <div className="relative h-6 rounded-full" style={{ backgroundColor: theme.colors.subtle }}>
                        <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                                width: `${((item.bookings || 0) / maxValue) * 100}%`,
                                backgroundColor: theme.colors.accent
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

const MonthlyTable = ({ data, theme, totalBookings, totalSales }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm">
            <thead>
                <tr className="border-b" style={{ borderColor: theme.colors.border }}>
                    <th className="text-left py-2 px-1 font-semibold" style={{ color: theme.colors.textSecondary }}>
                        Month
                    </th>
                    <th className="text-right py-2 px-1 font-semibold" style={{ color: theme.colors.textSecondary }}>
                        Bookings
                    </th>
                    <th className="text-right py-2 px-1 font-semibold" style={{ color: theme.colors.textSecondary }}>
                        Sales
                    </th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={index} className="border-b" style={{ borderColor: theme.colors.border }}>
                        <td className="py-2 px-1" style={{ color: theme.colors.textPrimary }}>
                            {item.month}
                        </td>
                        <td className="text-right py-2 px-1" style={{ color: theme.colors.textPrimary }}>
                            ${(item.bookings || 0).toLocaleString()}
                        </td>
                        <td className="text-right py-2 px-1" style={{ color: theme.colors.textPrimary }}>
                            ${(item.sales || 0).toLocaleString()}
                        </td>
                    </tr>
                ))}
                <tr className="border-t-2 font-bold" style={{ borderColor: theme.colors.accent }}>
                    <td className="py-2 px-1" style={{ color: theme.colors.textPrimary }}>
                        Total
                    </td>
                    <td className="text-right py-2 px-1" style={{ color: theme.colors.accent }}>
                        ${totalBookings.toLocaleString()}
                    </td>
                    <td className="text-right py-2 px-1" style={{ color: theme.colors.accent }}>
                        ${totalSales.toLocaleString()}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
);

const RecentPOsCard = ({ orders, theme, onOrderClick }) => (
    <GlassCard theme={theme} className="p-4 hover:border-white/20 transition-all duration-300">
        <h3 className="font-bold text-lg mb-4" style={{ color: theme.colors.textPrimary }}>
            Recent Purchase Orders
        </h3>
        <div className="space-y-3">
            {orders.map((order, index) => (
                <div
                    key={index}
                    className="flex justify-between items-center p-3 rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    onClick={() => onOrderClick(order)}
                    style={{ backgroundColor: theme.colors.subtle }}
                >
                    <div>
                        <div className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                            {order.company}
                        </div>
                        <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                            PO #{order.po}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold" style={{ color: theme.colors.accent }}>
                            {order.amount}
                        </div>
                        <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                            {new Date(order.date).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </GlassCard>
);

export const DonutChart = React.memo(({ data, theme }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    if (total === 0) return null;

    let cumulative = 0;
    const size = 150;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="flex items-center space-x-6">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={theme.colors.subtle} strokeWidth={strokeWidth} />
                    <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                        {data.map((item, index) => {
                            const dasharray = (circumference * item.value) / total;
                            const dashoffset = circumference * (1 - (cumulative / total));
                            cumulative += item.value;
                            return (
                                <circle
                                    key={index}
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    fill="none"
                                    stroke={item.color}
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={`${dasharray} ${circumference}`}
                                    strokeDashoffset={-circumference + dashoffset}
                                    className="transition-all duration-500"
                                />
                            )
                        })}
                    </g>
                </svg>
            </div>
            <div className="space-y-2">
                {data.map(item => (
                    <div key={item.label} className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                        <div>
                            <p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{item.label}</p>
                            <p className="text-xs font-mono" style={{ color: theme.colors.textSecondary }}>${item.value.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export const CustomerRankScreen = ({ theme, onNavigate }) => {
    const [sortKey, setSortKey] = useState('sales');
    const [modalData, setModalData] = useState(null);

    const sortedCustomers = useMemo(() => {
        return [...Data.CUSTOMER_RANK_DATA].sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
    }, [sortKey]);

    const { topThree, theRest } = useMemo(() => ({
        topThree: sortedCustomers.slice(0, 3),
        theRest: sortedCustomers.slice(3)
    }), [sortedCustomers]);

    const handleOpenModal = useCallback((customer) => {
        if (customer.orders && customer.orders.length > 0) {
            setModalData(customer);
        }
    }, []);
    const handleCloseModal = useCallback(() => setModalData(null), []);

    const PodiumCard = ({ customer, rank, theme }) => {
        const podiumStyles = {
            1: { iconColor: '#FFD700', textColor: theme.colors.accent, order: 'order-2', size: 'w-1/3' },
            2: { iconColor: '#C0C0C0', textColor: theme.colors.textPrimary, order: 'order-1', size: 'w-1/4' },
            3: { iconColor: '#CD7F32', textColor: theme.colors.textPrimary, order: 'order-3', size: 'w-1/4' },
        };
        const style = podiumStyles[rank];

        return (
            <div className={`text-center ${style.order} ${style.size}`}>
                <Trophy className="mx-auto w-10 h-10" fill={style.iconColor} color="rgba(0,0,0,0.3)" />
                <p className="font-bold text-md truncate mt-1" style={{ color: style.textColor }}>{customer.name}</p>
                <p className="text-sm font-semibold" style={{ color: style.textColor }}>${customer[sortKey].toLocaleString()}</p>
            </div>
        );
    };

    return (
        <>
            <PageTitle title="Customer Ranking" theme={theme} />
            <div className="px-4 pb-4 space-y-6">

                {/* Podium for Top 3 */}
                <div className="flex items-end justify-center space-x-2 pt-4">
                    {topThree[1] && <PodiumCard customer={topThree[1]} rank={2} theme={theme} />}
                    {topThree[0] && <PodiumCard customer={topThree[0]} rank={1} theme={theme} />}
                    {topThree[2] && <PodiumCard customer={topThree[2]} rank={3} theme={theme} />}
                </div>

                {/* Sort Controls */}
                <ToggleButtonGroup
                    value={sortKey}
                    onChange={setSortKey}
                    options={[{ label: 'By Sales', value: 'sales' }, { label: 'By Bookings', value: 'bookings' }]}
                    theme={theme}
                />

                {/* Rest of the Ranking List */}
                <div className="space-y-3">
                    {theRest.map((customer, index) => (
                        <GlassCard key={customer.id} theme={theme} className="p-4 cursor-pointer hover:border-gray-400/50" onClick={() => handleOpenModal(customer)}>
                            <div className="flex items-center space-x-4">
                                <div className="font-bold text-lg" style={{ color: theme.colors.textSecondary }}>{index + 4}</div>
                                <div className="flex-1">
                                    <p className="font-bold truncate" style={{ color: theme.colors.textPrimary }}>{customer.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-lg" style={{ color: theme.colors.accent }}>${customer.sales.toLocaleString()}</p>
                                    <p className="text-xs font-mono" style={{ color: theme.colors.textSecondary }}>Bookings: ${customer.bookings.toLocaleString()}</p>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>

            <Modal show={!!modalData} onClose={handleCloseModal} title={`${modalData?.name} - Recent Orders`} theme={theme}>
                <div className="space-y-3">
                    {modalData?.orders.length > 0 ? modalData.orders.map((order, index) => (
                        <div key={index} className="flex justify-between items-center text-sm border-b pb-2" style={{ borderColor: theme.colors.subtle }}>
                            <span style={{ color: theme.colors.textPrimary }}>{order.projectName}</span>
                            <span className="font-semibold" style={{ color: theme.colors.accent }}>${order.amount.toLocaleString()}</span>
                        </div>
                    )) : (
                        <p style={{ color: theme.colors.textSecondary }}>No specific orders to display for this total.</p>
                    )}
                </div>
            </Modal>
        </>
    );
};

export const OrderModal = React.memo(({ order, onClose, theme }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!order) return null;

    const handleClose = () => {
        setIsExpanded(false);
        onClose();
    };

    const statusColor = Data.STATUS_COLORS[order.status] || theme.colors.primary;
    const statusText = (order.status || 'N/A').toUpperCase();
    const formattedShipDate = order.shipDate ? new Date(order.shipDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';

    return (
        <Modal show={!!order} onClose={handleClose} title="" theme={theme}>
            <div className="space-y-4">
                {/* Header: Project name is now the main title */}
                <div className="flex justify-between items-start">
                    <div className="pr-4">
                        <h2 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>{order.details || 'Order Details'}</h2>
                        <p className="-mt-1 text-sm" style={{ color: theme.colors.textSecondary }}>{order.company}</p>
                    </div>
                    <button onClick={handleClose} className="text-sm font-medium p-2 -mr-2 flex-shrink-0" style={{ color: theme.colors.textSecondary }}>
                        Close
                    </button>
                </div>

                {/* Status Bar: Now fully rounded */}
                <div className="text-center py-2 rounded-full font-semibold text-white tracking-wider text-sm" style={{ backgroundColor: statusColor }}>
                    {statusText}
                </div>

                {/* Key Info Grid */}
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm border-t border-b py-4" style={{ borderColor: theme.colors.subtle }}>
                    <dt className="font-medium" style={{ color: theme.colors.textSecondary }}>SO:</dt>
                    <dd className="font-mono text-right" style={{ color: theme.colors.textPrimary }}>{order.orderNumber}</dd>
                    <dt className="font-medium" style={{ color: theme.colors.textSecondary }}>PO:</dt>
                    <dd className="font-mono text-right" style={{ color: theme.colors.textPrimary }}>{order.po}</dd>
                    <dt className="font-medium" style={{ color: theme.colors.textSecondary }}>NET:</dt>
                    <dd className="font-mono text-right font-semibold" style={{ color: theme.colors.textPrimary }}>${order.net?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</dd>
                    <dt className="font-medium" style={{ color: theme.colors.textSecondary }}>REWARDS:</dt>
                    <dd className="text-right" style={{ color: theme.colors.textPrimary }}>{order.reward}</dd>
                    <dt className="font-medium" style={{ color: theme.colors.textSecondary }}>SHIP DATE:</dt>
                    <dd className="text-right font-semibold" style={{ color: theme.colors.textPrimary }}>{formattedShipDate}</dd>
                </dl>

                {/* Shipping and Discount Section */}
                <div className="space-y-3">
                    {order.shipTo && <div>
                        <p className="font-semibold text-xs" style={{ color: theme.colors.textSecondary }}>SHIP TO:</p>
                        <p className="whitespace-pre-line leading-tight text-sm" style={{ color: theme.colors.textPrimary }}>{order.shipTo}</p>
                    </div>}
                    {order.discount && <div className="flex justify-between items-center text-sm pt-3 border-t" style={{ borderColor: theme.colors.subtle }}>
                        <span className="font-medium" style={{ color: theme.colors.textSecondary }}>DISCOUNT:</span>
                        <span className="font-semibold text-base" style={{ color: theme.colors.textPrimary }}>{order.discount}</span>
                    </div>}
                </div>

                {/* Show Details button is now always clickable */}
                <button onClick={() => setIsExpanded(p => !p)} className="w-full py-3 rounded-full font-medium text-white transition" style={{ backgroundColor: theme.colors.accent }}>
                    {isExpanded ? 'Hide Order Details' : 'Show Order Details'}
                </button>

                {/* Animated expansion for line items */}
                <div className={`transition-all duration-500 ease-in-out grid ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                        <div className="space-y-3 pt-4 border-t" style={{ borderColor: theme.colors.subtle }}>
                            {(order.lineItems && order.lineItems.length > 0) ? (
                                order.lineItems.map((item, index) => <LineItemCard key={item.line} lineItem={item} index={index} theme={theme} />)
                            ) : (
                                <p className="text-center text-sm p-4" style={{ color: theme.colors.textSecondary }}>No line items for this order.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
});

export const OrdersScreen = ({ theme, setSelectedOrder }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [dateType, setDateType] = useState('shipDate');
    const [viewMode, setViewMode] = useState('list');
    const [showDateFilter, setShowDateFilter] = useState(false);
    const filterMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) {
                setShowDateFilter(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const groupedOrders = useMemo(() => {
        const filtered = Data.ORDER_DATA.filter(order =>
            (order.company?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (order.details?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (order.orderNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (order.po?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
        const groups = filtered.reduce((acc, order) => {
            const dateStr = order[dateType];
            if (!dateStr || isNaN(new Date(dateStr))) return acc;
            const date = new Date(dateStr);
            const groupKey = date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();
            if (!acc[groupKey]) {
                acc[groupKey] = { orders: [], total: 0 };
            }
            acc[groupKey].orders.push(order);
            acc[groupKey].total += order.net || 0;
            return acc;
        }, {});
        for (const key in groups) {
            groups[key].orders.sort((a, b) => new Date(b[dateType]) - new Date(a[dateType]));
        }
        return groups;
    }, [searchTerm, dateType]);

    const sortedGroupKeys = useMemo(() => {
        if (!groupedOrders) return [];
        return Object.keys(groupedOrders).sort((a, b) => new Date(b) - new Date(a));
    }, [groupedOrders]);

    return (
        <div className="flex flex-col h-full">
            <PageTitle title="Orders" theme={theme} />
            <div className="px-4 pt-2 pb-4 flex items-center space-x-2 sticky top-0 z-10" style={{ backgroundColor: theme.colors.background, backdropFilter: 'blur(12px)' }}>
                <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search Orders..." theme={theme} className="flex-grow" />
                <div className="relative">
                    <button onClick={() => setShowDateFilter(f => !f)} className="p-3.5 rounded-full" style={{ backgroundColor: theme.colors.subtle }}>
                        <Filter className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
                    </button>
                    {showDateFilter && (
                        <GlassCard ref={filterMenuRef} theme={theme} className="absolute top-14 right-0 z-10 w-40 p-2">
                            <button onClick={() => { setDateType('shipDate'); setShowDateFilter(false); }} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${dateType === 'shipDate' ? 'font-bold' : ''}`} style={{ color: theme.colors.textPrimary, backgroundColor: dateType === 'shipDate' ? theme.colors.subtle : 'transparent' }}>Ship Date</button>
                            <button onClick={() => { setDateType('date'); setShowDateFilter(false); }} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${dateType === 'date' ? 'font-bold' : ''}`} style={{ color: theme.colors.textPrimary, backgroundColor: dateType === 'date' ? theme.colors.subtle : 'transparent' }}>PO Date</button>
                        </GlassCard>
                    )}
                </div>
                <button onClick={() => setViewMode(v => v === 'list' ? 'calendar' : 'list')} className="p-3.5 rounded-full" style={{ backgroundColor: viewMode === 'calendar' ? theme.colors.accent : theme.colors.subtle, }}>
                    <Calendar className="w-5 h-5" style={{ color: viewMode === 'calendar' ? 'white' : theme.colors.textPrimary }} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
                {viewMode === 'list' ? (
                    <div className="space-y-6">
                        {sortedGroupKeys.map(dateKey => (
                            <div key={dateKey}>
                                <div className="flex justify-between items-baseline mb-2 px-1 pb-2 border-b" style={{ borderColor: theme.colors.border }}>
                                    <h2 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{dateKey}</h2>
                                    <p className="font-bold text-xl" style={{ color: theme.colors.accent }}>
                                        ${groupedOrders[dateKey].total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    {groupedOrders[dateKey].orders.map((order) => {
                                        const statusColor = Data.STATUS_COLORS[order.status] || theme.colors.secondary;
                                        return (
                                            <GlassCard key={order.orderNumber} theme={theme} className="p-4 cursor-pointer hover:border-gray-400/50 flex items-center space-x-4" onClick={() => setSelectedOrder(order)}>
                                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusColor }}></div>
                                                <div className="flex-1 flex justify-between items-center min-w-0">
                                                    <div className="truncate pr-4">
                                                        <p className="font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{order.details || 'N/A'}</p>
                                                        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{order.company}</p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0 space-y-1">
                                                        {order.net != null && (
                                                            <p className="font-semibold text-lg whitespace-nowrap" style={{ color: theme.colors.textPrimary }}>
                                                                ${order.net.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                            </p>
                                                        )}
                                                        <div className="flex justify-end">
                                                            <span className="text-xs font-mono px-2 py-0.5 rounded-md" style={{ color: theme.colors.textSecondary, backgroundColor: theme.colors.subtle }}>
                                                                {order.orderNumber}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </GlassCard>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <OrderCalendarView orders={filteredOrders} theme={theme} dateType={dateType} />
                )}
            </div>
        </div>
    );
};


const SalesScreen = ({ theme, onNavigate }) => {
    const { MONTHLY_SALES_DATA, ORDER_DATA, SALES_VERTICALS_DATA } = Data;
    const [monthlyView, setMonthlyView] = useState('table');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const { totalBookings, totalSales } = useMemo(() => {
        const bookings = Data.MONTHLY_SALES_DATA.reduce((acc, m) => acc + m.bookings, 0);
        const sales = Data.MONTHLY_SALES_DATA.reduce((acc, m) => acc + m.sales, 0);
        return { totalBookings: bookings, totalSales: sales };
    }, []);

    const recentOrders = useMemo(() => {
        return Data.ORDER_DATA
            .filter(o => o.date && o.net)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 9);
    }, []);

    const goal = 7000000;
    const percentToGoal = useMemo(() => (totalBookings / goal) * 100, [totalBookings]);

    const handleToggleView = useCallback(() => setMonthlyView(v => v === 'chart' ? 'table' : 'chart'), []);
    const handleShowOrderDetails = useCallback(order => setSelectedOrder(order), []);
    const handleCloseModal = useCallback(() => setSelectedOrder(null), []);
    const handleCustomerRankNav = useCallback(() => onNavigate('customer-rank'), [onNavigate]);
    const handleCommissionsNav = useCallback(() => onNavigate('commissions'), [onNavigate]);
    const handleRewardsNav = useCallback(() => onNavigate('incentive-rewards'), [onNavigate]);

    return (
        <>
            <PageTitle title="Sales Dashboard" theme={theme}>
                {/* The button is now inside PageTitle */}
                <button
                    onClick={() => onNavigate('new-lead')}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-transform hover:scale-105 active:scale-95"
                    style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                >
                    <span>New</span>
                    <Plus className="w-4 h-4" />
                </button>
            </PageTitle>

            {/* The extra div for the button has been removed */}
            <div className="px-4 space-y-4 pb-4">
                <GlassCard theme={theme} className="p-4 transition-all duration-300 hover:border-white/20">
                    <p className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>
                        Progress to Goal
                    </p>
                    <p className="text-4xl font-bold my-2" style={{ color: theme.colors.accent }}>
                        {percentToGoal.toFixed(1)}%
                    </p>
                    <div className="relative w-full h-2.5 rounded-full" style={{ backgroundColor: theme.colors.subtle }}>
                        <div className="h-2.5 rounded-full" style={{ width: `${percentToGoal}%`, backgroundColor: theme.colors.accent }}></div>
                    </div>
                </GlassCard>

                <GlassCard theme={theme} className="p-4 hover:border-white/20 transition-all duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                            Monthly Performance
                        </h3>
                        <button
                            onClick={handleToggleView}
                            className="p-1.5 rounded-md"
                            style={{ backgroundColor: theme.colors.subtle }}
                        >
                            {monthlyView === 'chart'
                                ? <List className="w-4 h-4" style={{ color: theme.colors.secondary }} />
                                : <BarChart2 className="w-4 h-4" style={{ color: theme.colors.secondary }} />}
                        </button>
                    </div>
                    {monthlyView === 'chart'
                        ? <MonthlyBarChart data={Data.MONTHLY_SALES_DATA} theme={theme} />
                        : <MonthlyTable
                            data={Data.MONTHLY_SALES_DATA}
                            theme={theme}
                            totalBookings={totalBookings}
                            totalSales={totalSales}
                        />}
                </GlassCard>

                <RecentPOsCard
                    orders={recentOrders}
                    theme={theme}
                    onOrderClick={handleShowOrderDetails}
                />

                <GlassCard theme={theme} className="p-4 hover:border-white/20 transition-all duration-300">
                    <h3 className="font-bold text-lg mb-4" style={{ color: theme.colors.textPrimary }}>
                        Verticals Breakdown
                    </h3>
                    <DonutChart data={Data.SALES_VERTICALS_DATA} theme={theme} />
                </GlassCard>

                <GlassCard theme={theme} className="p-1"><button onClick={handleCustomerRankNav} className="w-full p-3 rounded-xl flex items-center justify-between"><span className="text-md font-semibold tracking-tight" style={{ color: theme.colors.textPrimary }}>View Customer Rank</span><ArrowRight className="w-5 h-5" style={{ color: theme.colors.secondary }} /></button></GlassCard>
                <GlassCard theme={theme} className="p-1"><button onClick={handleCommissionsNav} className="w-full p-3 rounded-xl flex items-center justify-between"><span className="text-md font-semibold tracking-tight" style={{ color: theme.colors.textPrimary }}>View Commissions</span><ArrowRight className="w-5 h-5" style={{ color: theme.colors.secondary }} /></button></GlassCard>
                <GlassCard theme={theme} className="p-1"><button onClick={handleRewardsNav} className="w-full p-3 rounded-xl flex items-center justify-between"><span className="text-md font-semibold tracking-tight" style={{ color: theme.colors.textPrimary }}>View Incentive Rewards</span><ArrowRight className="w-5 h-5" style={{ color: theme.colors.secondary }} /></button></GlassCard>
            </div>

            {selectedOrder && (
                <OrderModal
                    order={selectedOrder}
                    onClose={handleCloseModal}
                    onShowDetails={() => {
                        handleCloseModal();
                        onNavigate('orders');
                    }}
                    theme={theme}
                />
            )}
        </>
    );
};

export const OrderCalendarView = ({ orders, onDateClick, theme, dateType }) => {
    const [currentDate, setCurrentDate] = useState(new Date('2025-07-09T12:00:00Z'));

    const ordersByDate = useMemo(() => {
        const map = new Map();
        orders.forEach(order => {
            const dateStr = order[dateType];
            if (dateStr) {
                const date = new Date(dateStr);
                const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                map.set(key, true);
            }
        });
        return map;
    }, [orders, dateType]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <GlassCard theme={theme} className="p-4">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><ChevronLeft style={{ color: theme.colors.textSecondary }} /></button>
                <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><ChevronRight style={{ color: theme.colors.textSecondary }} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-2">
                {blanks.map((_, i) => <div key={`b-${i}`} />)}
                {days.map(day => {
                    const date = new Date(year, month, day);
                    const today = new Date('2025-07-09T12:00:00Z');
                    const isToday = date.toDateString() === today.toDateString();
                    const key = `${year}-${month}-${day}`;
                    const hasOrder = ordersByDate.has(key);

                    return (
                        <div key={day} className="relative h-10 flex items-center justify-center">
                            <span className={`w-8 h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : ''}`}>
                                {day}
                            </span>
                            {hasOrder && <div className="absolute bottom-1 h-1.5 w-1.5 bg-blue-500 rounded-full"></div>}
                        </div>
                    );
                })}
            </div>
        </GlassCard>
    );
};

const ProductsScreen = ({ theme, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');

    const filteredCategories = useMemo(() => {
        if (!searchTerm.trim()) return Data.PRODUCTS_CATEGORIES_DATA;

        const lowerSearch = searchTerm.toLowerCase();
        return Data.PRODUCTS_CATEGORIES_DATA.filter(category =>
            category.name.toLowerCase().includes(lowerSearch)
        );
    }, [searchTerm]);

    const handleCategoryClick = useCallback((category) => {
        onNavigate(category.nav);
    }, [onNavigate]);

    const toggleViewMode = useCallback(() => {
        setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    }, []);

    return (
        <>
            <PageTitle title="Products" theme={theme}>
                <button
                    onClick={toggleViewMode}
                    className="p-2 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                    style={{ backgroundColor: theme.colors.subtle }}
                >
                    {viewMode === 'grid' ?
                        <List className="w-5 h-5" style={{ color: theme.colors.textSecondary }} /> :
                        <BarChart2 className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    }
                </button>
            </PageTitle>

            <div className="px-4 pb-4">
                <SearchInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    theme={theme}
                    className="mb-4"
                />

                {filteredCategories.length === 0 ? (
                    <GlassCard theme={theme} className="p-8 text-center">
                        <p style={{ color: theme.colors.textSecondary }}>
                            No products found matching "{searchTerm}"
                        </p>
                    </GlassCard>
                ) : viewMode === 'grid' ? (
                    <div className="space-y-4">
                        {filteredCategories.map(category => (
                            <GlassCard
                                key={category.name}
                                theme={theme}
                                className="p-4 overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                onClick={() => handleCategoryClick(category)}
                            >
                                <h2 className="text-2xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
                                    {category.name}
                                </h2>
                                <div className="flex space-x-2 -mb-2">
                                    {category.images.map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt={`${category.name} example ${index + 1}`}
                                            className={`rounded-md object-cover transition-opacity ${category.images.length === 1 && category.name !== 'Swivels'
                                                ? 'w-2/3 h-32'
                                                : 'w-16 h-16'
                                                }`}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://placehold.co/100x100/EEE/333?text=Image+Error';
                                            }}
                                        />
                                    ))}
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredCategories.map(category => (
                            <GlassCard
                                key={category.name}
                                theme={theme}
                                className="p-3 cursor-pointer transform transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                                onClick={() => handleCategoryClick(category)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={category.images[0]}
                                            alt={category.name}
                                            className="w-12 h-12 rounded-md object-cover"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://placehold.co/100x100/EEE/333?text=Error';
                                            }}
                                        />
                                        <h3 className="font-semibold text-lg" style={{ color: theme.colors.textPrimary }}>
                                            {category.name}
                                        </h3>
                                    </div>
                                    <ArrowRight className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export const ProbabilitySlider = ({ value, onChange, theme }) => (
    <div>
        <label className="block text-xs font-semibold px-4" style={{ color: theme.colors.textSecondary }}>
            Win Probability
        </label>
        <div className="relative w-full h-8 select-none pt-4 px-2">
            <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={value}
                onInput={(e) => onChange(parseInt(e.target.value, 10))}
                className="w-full h-2 cursor-pointer appearance-none rounded-full outline-none"
                style={{ background: theme.colors.subtle, accentColor: theme.colors.accent }}
            />
            <div
                className="absolute top-[25px] -translate-x-1/2 flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-bold pointer-events-none shadow"
                style={{
                    left: `${value}%`,
                    backgroundColor: theme.colors.accent,
                    color: '#FFF',
                }}
            >
                {value}%
            </div>
        </div>
    </div>
);

export const NewLeadScreen = ({
    theme,
    onSuccess,
    designFirms,
    setDesignFirms,
    dealers,
    setDealers,
}) => {
    const [newLead, setNewLead] = useState({
        ...Data.EMPTY_LEAD,
        winProbability: 50,
        isContract: false,
        contractType: '',
    });

    const updateField = useCallback((field, value) => { setNewLead(prev => ({ ...prev, [field]: value })); }, []);
    const handleSubmit = (e) => { e.preventDefault(); onSuccess(newLead); };
    const addProduct = useCallback((series) => { if (series) { setNewLead(prev => ({ ...prev, products: [...prev.products, { series }] })); } }, []);
    const removeProduct = useCallback((idx) => { setNewLead(prev => ({ ...prev, products: prev.products.filter((_, i) => i !== idx) })); }, []);
    const toggleCompetitor = useCallback((competitor) => {
        setNewLead(prev => {
            const currentCompetitors = prev.competitors || [];
            const next = currentCompetitors.includes(competitor) ? currentCompetitors.filter(c => c !== competitor) : [...currentCompetitors, competitor];
            return { ...prev, competitors: next };
        });
    }, []);

    const availableSeries = useMemo(() => Data.JSI_PRODUCT_SERIES.filter(s => !newLead.products.some(p => p.series === s)), [newLead.products]);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <PageTitle title="Create New Lead" theme={theme} />

            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4 space-y-6 scrollbar-hide">
                <div className="relative z-50">
                    <FormSection title="Project Details" theme={theme}>
                        <FormInput required label="Project Name" value={newLead.project} onChange={(e) => updateField('project', e.target.value)} placeholder="e.g., Acme Corp Headquarters" theme={theme} />
                        <CustomSelect required label="Project Stage" value={newLead.projectStatus} onChange={(e) => updateField('projectStatus', e.target.value)} options={Data.STAGES.map(s => ({ label: s, value: s }))} placeholder="Select a Stage" theme={theme} />
                        <CustomSelect required label="Vertical" value={newLead.vertical} onChange={(e) => updateField('vertical', e.target.value)} options={Data.VERTICALS.map(v => ({ label: v, value: v }))} placeholder="Select a Vertical" theme={theme} />
                    </FormSection>
                </div>

                <div className="relative z-40">
                    <FormSection title="Stakeholders" theme={theme}>
                        <AutoCompleteCombobox label="A&D Firm" required value={newLead.designFirm} onChange={(val) => updateField('designFirm', val)} placeholder="Search or add a design firm..." options={designFirms} onAddNew={(f) => setDesignFirms((p) => [...new Set([f, ...p])])} theme={theme} />
                        <AutoCompleteCombobox label="Dealer" required value={newLead.dealer} onChange={(val) => updateField('dealer', val)} placeholder="Search or add a dealer..." options={dealers} onAddNew={(d) => setDealers((p) => [...new Set([d, ...p])])} theme={theme} />
                    </FormSection>
                </div>

                <div className="relative z-30">
                    <FormSection title="Financials & Timeline" theme={theme}>
                        <FormInput label="Estimated List Price" required type="currency" value={newLead.estimatedList} onChange={(e) => updateField('estimatedList', e.target.value)} placeholder="$0" theme={theme} />
                        <ProbabilitySlider value={newLead.winProbability} onChange={(v) => updateField('winProbability', v)} theme={theme} />
                        <CustomSelect label="Discount" value={newLead.discount} onChange={(e) => updateField('discount', e.target.value)} options={Data.DISCOUNT_OPTIONS.map(d => ({ label: d, value: d }))} placeholder="Select a Discount" theme={theme} />
                        <CustomSelect label="PO Timeframe" required value={newLead.poTimeframe} onChange={(e) => updateField('poTimeframe', e.target.value)} options={Data.PO_TIMEFRAMES.map(t => ({ label: t, value: t }))} placeholder="Select a Timeframe" theme={theme} />

                        <div className="flex items-center justify-between text-sm px-3 pt-4 border-t mt-4" style={{ borderColor: theme.colors.subtle }}>
                            <label style={{ color: theme.colors.textSecondary }}>Contract?</label>
                            <input type="checkbox" className="h-5 w-5 rounded-md border-2" style={{ accentColor: theme.colors.accent, borderColor: theme.colors.border }} checked={!!newLead.isContract} onChange={(e) => updateField('isContract', e.target.checked)} />
                        </div>

                        {newLead.isContract && (
                            <div className="pt-2 animate-fade-in">
                                <CustomSelect required placeholder="Select a Contract" value={newLead.contractType} onChange={(e) => updateField('contractType', e.target.value)} options={Data.CONTRACT_OPTIONS.map(c => ({ label: c, value: c }))} theme={theme} />
                            </div>
                        )}
                    </FormSection>
                </div>

                <div className="relative z-20">
                    <FormSection title="Competition & Products" theme={theme}>
                        <div className="flex items-center justify-between text-sm px-3">
                            <label style={{ color: theme.colors.textSecondary }}>Competition?</label>
                            <input type="checkbox" className="h-5 w-5 rounded-md border-2" style={{ accentColor: theme.colors.accent, borderColor: theme.colors.border }} checked={!!newLead.competitionPresent} onChange={(e) => updateField('competitionPresent', e.target.checked)} />
                        </div>
                        {newLead.competitionPresent && (
                            <div className="space-y-2 pt-4 border-t" style={{ borderColor: theme.colors.subtle }}>
                                <label className="block text-xs font-semibold px-1" style={{ color: theme.colors.textSecondary }}>Competitors</label>
                                <div className="p-2 flex flex-wrap gap-2 rounded-2xl" style={{ backgroundColor: theme.colors.subtle }}>
                                    {Data.COMPETITORS.filter(c => c !== 'None').map(c => (
                                        <button type="button" key={c} onClick={() => toggleCompetitor(c)} className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors`} style={{ backgroundColor: newLead.competitors.includes(c) ? theme.colors.accent : theme.colors.surface, color: newLead.competitors.includes(c) ? 'white' : theme.colors.textPrimary }}>
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="border-t pt-4 mt-4 space-y-3" style={{ borderColor: theme.colors.border }}>
                            <label className="text-xs font-semibold px-1" style={{ color: theme.colors.textSecondary }}>Products</label>
                            {newLead.products.map((p, idx) => (
                                <div key={idx} className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: theme.colors.subtle }}>
                                    <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{p.series}</span>
                                    <button type="button" onClick={() => removeProduct(idx)} className="p-1 rounded-full hover:bg-red-500/10">
                                        <X className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            ))}
                            {availableSeries.length > 0 && (
                                <AutoCompleteCombobox
                                    value={""}
                                    onChange={(val) => { addProduct(val); }}
                                    placeholder="+ Add a Product..."
                                    options={availableSeries}
                                    theme={theme}
                                />
                            )}
                        </div>
                    </FormSection>
                </div>

                <div className="pt-4 pb-4">
                    <button type="submit" className="w-full text-white font-bold py-3.5 rounded-full" style={{ backgroundColor: theme.colors.accent }}>
                        Submit Lead
                    </button>
                </div>
            </div>
        </form>
    );
};

const resourceIcons = {
    'Search Database': Search,
    'Request COM Yardage': Paperclip,
    'Commission Rates': DollarSign,
    'Dealer Directory': Users,
    'Loaner Pool': Package,
    'New Dealer Sign-Up': UserPlus,
    'Request Field Visit': MapPin,
    'Sample Discounts': Percent,
    'Contracts': FileText,
    'Design Days': Calendar,
    'Discontinued Finishes Database': Palette,
    'Install Instructions': Wrench,
    'Presentations': MonitorPlay,
    'Social Media': Share2,
    'Lead Times': Hourglass,
};

export const ResourcesScreen = ({ theme, onNavigate }) => {
    return (
        <div className="flex flex-col h-full">
            {/* The main PageTitle is removed for a cleaner look, as requested previously */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide">
                {Data.RESOURCES_DATA.map(category => (
                    <div key={category.category}>
                        <h2 className="text-xl font-bold mb-2 px-1" style={{ color: theme.colors.textPrimary }}>
                            {category.category}
                        </h2>
                        <GlassCard theme={theme} className="p-2">
                            <div className="space-y-1">
                                {category.items.map((item, index) => {
                                    const Icon = resourceIcons[item.label] || Database; // Use the icon map
                                    return (
                                        <React.Fragment key={item.nav}>
                                            {index > 0 && <div className="border-t mx-3" style={{ borderColor: theme.colors.subtle }}></div>}
                                            <button
                                                onClick={() => onNavigate(item.nav)}
                                                className="w-full p-3 rounded-xl flex items-center justify-between transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <Icon className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                                                    <span className="text-md font-semibold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                                                        {item.label}
                                                    </span>
                                                </div>
                                                <ArrowRight className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                                            </button>
                                        </React.Fragment>
                                    )
                                })}
                            </div>
                        </GlassCard>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const PRODUCTS_CATEGORIES_DATA = Object.entries(Data.PRODUCT_DATA).map(([key, value]) => {
    const images = [];
    // Ensure we always get two images or placeholders
    for (let i = 0; i < 2; i++) {
        if (value.data[i] && value.data[i].image) {
            images.push(value.data[i].image);
        } else {
            // Fallback placeholder
            images.push('https://placehold.co/100x100/EEE/777?text=JSI');
        }
    }

    return {
        name: value.title,
        nav: `products/category/${key}`,
        images: images,
    };
}).sort((a, b) => a.name.localeCompare(b.name));

export const ProjectsScreen = ({ onNavigate, theme, opportunities }) => {
    const [projectsTab, setProjectsTab] = useState('pipeline');
    const [selectedPipelineStage, setSelectedPipelineStage] = useState('Discovery');

    const filteredOpportunities = useMemo(() => {
        if (!opportunities) return []; // Safety check
        return opportunities.filter(opp => opp.stage === selectedPipelineStage);
    }, [selectedPipelineStage, opportunities]);

    // This determines the text for the button based on the selected tab
    const newButtonText = projectsTab === 'pipeline' ? 'New Lead' : 'Add New Install';

    return (
        <div className="h-full flex flex-col">
            <PageTitle title="Projects" theme={theme}>
                <button
                    onClick={() => onNavigate('new-lead')}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-transform hover:scale-105 active:scale-95"
                    style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                >
                    <span>{newButtonText}</span>
                    <Plus className="w-4 h-4" />
                </button>
            </PageTitle>

            <div className="px-4">
                <GlassCard theme={theme} className="p-1 flex relative">
                    <div
                        className="absolute top-1 bottom-1 w-[calc(50%-0.25rem)] h-auto rounded-full transition-all duration-300 ease-in-out"
                        style={{
                            backgroundColor: theme.colors.primary,
                            transform: projectsTab === 'pipeline' ? 'translateX(0.25rem)' : 'translateX(calc(100% + 0.25rem))'
                        }}
                    />
                    <button
                        onClick={() => setProjectsTab('pipeline')}
                        className="flex-1 py-2 text-sm font-semibold rounded-full transition-colors duration-300 relative z-10"
                        style={{ color: projectsTab === 'pipeline' ? theme.colors.surface : theme.colors.textPrimary }}
                    >
                        Pipeline
                    </button>
                    <button
                        onClick={() => setProjectsTab('my-projects')}
                        className="flex-1 py-2 text-sm font-semibold rounded-full transition-colors duration-300 relative z-10"
                        style={{ color: projectsTab === 'my-projects' ? theme.colors.surface : theme.colors.textPrimary }}
                    >
                        My Projects
                    </button>
                </GlassCard>
            </div>

            {projectsTab === 'pipeline' ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex space-x-2 overflow-x-auto p-4 scrollbar-hide">
                        {Data.STAGES.map(stage => (
                            <button
                                key={stage}
                                onClick={() => setSelectedPipelineStage(stage)}
                                className="px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors"
                                style={{
                                    backgroundColor: selectedPipelineStage === stage ? theme.colors.primary : 'transparent',
                                    color: selectedPipelineStage === stage ? theme.colors.surface : theme.colors.textSecondary
                                }}
                            >
                                {stage}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4 scrollbar-hide">
                        {filteredOpportunities.length > 0 ? filteredOpportunities.map(opp => (
                            <GlassCard key={opp.id} theme={theme} className="overflow-hidden p-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{opp.name}</h3>
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${Data.STAGE_COLORS[opp.stage]}`}>{opp.stage}</span>
                                </div>
                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{opp.company}</p>
                                <p className="font-semibold text-2xl my-2" style={{ color: theme.colors.textPrimary }}>{opp.value}</p>
                            </GlassCard>
                        )) : (
                            <p className="text-center text-sm p-8" style={{ color: theme.colors.textSecondary }}>No projects in this stage.</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-6 scrollbar-hide">
                    {Data.MY_PROJECTS_DATA.map(project => (
                        <GlassCard key={project.id} theme={theme} className="p-0 overflow-hidden cursor-pointer group">
                            <div className="relative aspect-video w-full">
                                <img
                                    src={project.image}
                                    alt={project.name}
                                    className="absolute h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-4">
                                    <h3 className="text-2xl font-bold text-white tracking-tight">{project.name}</h3>
                                    <p className="text-white/80 font-medium">{project.location}</p>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export const ProductComparisonScreen = ({ categoryId, onNavigate, theme }) => {
    const category = Data.PRODUCT_DATA?.[categoryId];
    if (!category || !category.data?.length) {
        return (
            <PlaceholderScreen
                theme={theme}
                category={category?.title || 'Products'}
            />
        );
    }

    const dataSorted = React.useMemo(
        () =>
            [...category.data].sort(
                (a, b) => (a.basePrice?.list || 0) - (b.basePrice?.list || 0)
            ),
        [category.data]
    );
    const [index, setIndex] = useState(0);
    const selected = dataSorted[index];

    const money = (n) => (typeof n === 'number' ? `$${n.toLocaleString()}` : '—');

    return (
        <div className="px-4 pt-4 pb-10 space-y-4">
            <PageTitle title={category.title} theme={theme} />

            <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2">
                    {dataSorted.map((p, i) => (
                        <div
                            key={p.id}
                            className="flex flex-col items-center space-y-2 flex-shrink-0"
                        >
                            <button
                                onClick={() => setIndex(i)}
                                className={`relative w-24 h-24 rounded-xl overflow-hidden transition-all duration-200 ${i === index
                                    ? 'ring-2 ring-offset-2 ring-blue-500 scale-105'
                                    : 'opacity-70 hover:opacity-100'
                                    }`}
                            >
                                <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                            <div className="text-center">
                                <p className="text-xs font-semibold" style={{ color: theme.colors.textPrimary }}>
                                    {p.name}
                                </p>
                                <p className="text-xs font-bold" style={{ color: theme.colors.accent }}>
                                    {money(p.basePrice?.list)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <img
                    src={selected.image}
                    alt={selected.name}
                    className="absolute w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-2xl font-bold text-white mb-1">{selected.name}</h2>
                    <p className="text-3xl font-bold text-white">{money(selected.basePrice?.list)}</p>
                </div>
            </div>

            <GlassCard theme={theme} className="p-4 space-y-4">
                <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: theme.colors.subtle }}>
                        <span className="font-semibold" style={{ color: theme.colors.textSecondary }}>Series</span>
                        <span className="font-semibold text-right" style={{ color: theme.colors.textSecondary }}>List $</span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                        <span className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{selected.name}</span>
                        <span className="font-bold text-lg" style={{ color: theme.colors.accent }}>{money(selected.basePrice?.list)}</span>
                    </div>

                    {dataSorted.filter((_, i) => i !== index).slice(0, 3).map(item => (
                        <div key={item.id} className="flex justify-between items-center py-2 opacity-60">
                            <span style={{ color: theme.colors.textPrimary }}>{item.name}</span>
                            <span style={{ color: theme.colors.textPrimary }}>{money(item.basePrice?.list)}</span>
                        </div>
                    ))}
                </div>
            </GlassCard>

            <GlassCard theme={theme} className="p-1">
                <button
                    onClick={() => onNavigate(`products/competitive-analysis/${categoryId}`)}
                    className="w-full p-4 rounded-xl flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                    <span className="text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>
                        Competitive Analysis
                    </span>
                    <ArrowRight className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                </button>
            </GlassCard>
        </div>
    );
};

export const CompetitiveAnalysisScreen = ({ theme, currentScreen }) => {
    const categoryId = currentScreen?.split('/')?.[2] || 'casegoods';
    const data = Data.COMPETITIVE_DATA?.[categoryId];
    if (!data?.typicals?.length) {
        return <PlaceholderScreen theme={theme} category="Competitive Analysis" />;
    }

    const [selected, setSelected] = React.useState(data.typicals[0]);
    const [sortKey, setSortKey] = React.useState('adv');
    const [expanded, setExpanded] = React.useState(false);

    const money = (n) => {
        if (typeof n !== 'number' || isNaN(n)) return '—';
        return `$${n.toLocaleString()}`;
    };

    const getPrice = (item, type) => {
        if (!item?.basePrice) return 0;
        if (typeof item.basePrice.list === 'number') return item.basePrice.list;
        if (typeof item.basePrice.laminate === 'number' && type === 'lam') return item.basePrice.laminate;
        if (typeof item.basePrice.veneer === 'number' && type === 'ven') return item.basePrice.veneer;
        if (typeof item.basePrice.laminate === 'number') return item.basePrice.laminate;
        return 0;
    };

    const pctAdv = (our, comp) => {
        if (!comp || comp === 0) return 0;
        return Math.round(((comp - our) / comp) * 100);
    };

    const chip = (p) => <span className={`chip ${p > 0 ? 'pos' : p < 0 ? 'neg' : 'neu'}`}>{p > 0 ? `+${p}%` : `${p}%`}</span>;

    const sortRows = React.useMemo(() => {
        const ourLam = getPrice(selected, 'lam');
        const ourVen = getPrice(selected, 'ven') || ourLam;

        return data.competitors
            .map(c => ({
                name: c.name,
                lam: Math.round(ourLam * c.factor),
                ven: Math.round(ourVen * c.factor),
                adv: pctAdv(ourLam, Math.round(ourLam * c.factor)),
            }))
            .sort((a, b) => sortKey === 'adv' ? b.adv - a.adv : a[sortKey] - b[sortKey]);
    }, [selected, sortKey, data.competitors]);

    const heading =
        (Data.PRODUCT_DATA?.[categoryId]?.title ?? categoryId)
            .replace(/-/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase()) + ' Competitive Analysis';

    return (
        <div className="px-6 pt-4 pb-10 space-y-4">
            <h1 className="text-subhead font-semibold">{heading}</h1>

            <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
                {data.typicals.map(t => (
                    <button key={t.id} onClick={() => setSelected(t)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 transition-all duration-150
              ${selected.id === t.id ? 'border-blue-500' : 'border-transparent opacity-70'} hover:scale-105 hover:opacity-100`}>
                        <img src={t.image} alt={t.name} className="w-full h-full object-cover rounded-lg" />
                    </button>
                ))}
            </div>

            <a href={selected.url} target="_blank" rel="noopener noreferrer">
                <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-md group">
                    <img src={selected.image} alt={selected.name} loading="lazy"
                        className="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                </div>
            </a>

            <div className="h-6 section-band" />

            <GlassCard theme={theme} className="p-0 shadow-sm overflow-hidden">
                <div className="grid grid-cols-4 text-sm font-semibold sticky top-0 backdrop-blur bg-white/85 border-b"
                    style={{ borderColor: theme.colors.subtle }}>
                    <button className="text-left py-2 pl-4" onClick={() => setSortKey('name')}>Series</button>
                    <button className="text-left py-2" onClick={() => setSortKey('lam')}>Laminate</button>
                    <button className="text-left py-2" onClick={() => setSortKey('ven')}>Veneer</button>
                    <button className="text-right py-2 pr-4" onClick={() => setSortKey('adv')}>Adv.</button>
                </div>

                <div className="grid grid-cols-4 px-4 py-2 hover:bg-black/5"
                    style={{ fontVariantNumeric: 'tabular-nums' }}>
                    <span>{selected.name}</span>
                    <span>{money(getPrice(selected, 'lam'))}</span>
                    <span>{money(getPrice(selected, 'ven'))}</span>
                    <span />
                </div>

                {(expanded ? sortRows : sortRows.slice(0, 3)).map(r => (
                    <div key={r.name}
                        className="grid grid-cols-4 px-4 py-2 border-t hover:bg-black/5"
                        style={{ borderColor: theme.colors.subtle, fontVariantNumeric: 'tabular-nums' }}>
                        <span>{r.name}</span>
                        <span>{money(r.lam)}</span>
                        <span>{money(r.ven)}</span>
                        <span className="text-right">{chip(r.adv)}</span>
                    </div>
                ))}

                {sortRows.length > 3 && (
                    <button onClick={() => setExpanded(!expanded)}
                        className="w-full text-sm py-2 font-medium border-t"
                        style={{ borderColor: theme.colors.subtle, color: theme.colors.secondary }}>
                        {expanded ? 'Show top 3' : `Show all (${sortRows.length})`}
                    </button>
                )}
            </GlassCard>
        </div>
    );
};

export const PlaceholderScreen = ({ theme, category }) => {
    return (
        <div className="px-4 pt-4 pb-4">
            <PageTitle title={category || "Coming Soon"} theme={theme} />
            <GlassCard theme={theme} className="p-8 text-center">
                <p style={{ color: theme.colors.textPrimary }}>
                    This section is under construction.
                </p>
            </GlassCard>
        </div>
    );
};

const CommunityScreen = ({ theme, onNavigate }) => {
    const [tab, setTab] = useState('feed');
    const [modalOpen, setModal] = useState(false);
    const [modalType, setType] = useState(null);

    const [posts, setPosts] = useState([
        {
            id: 1,
            user: { name: 'Natalie Parker', avatar: '/avatars/natalie.png' },
            timeAgo: 'just now',
            text: 'Great install in Chicago!',
            image: 'https://picsum.photos/seed/chicago/800/500',
            likes: 3,
            comments: [],
        },
    ]);

    const [wins, setWins] = useState([
        {
            id: 1,
            user: { name: 'Laura Chen', avatar: '/avatars/laura.png' },
            timeAgo: 'yesterday',
            title: 'Boston HQ install – success! 🎉',
            images: [
                'https://picsum.photos/seed/boston1/800/500',
                'https://picsum.photos/seed/boston2/800/500',
                'https://picsum.photos/seed/boston3/800/500',
            ],
        },
    ]);

    const [polls, setPolls] = useState([
        {
            id: 1,
            user: { name: 'Doug Shapiro', avatar: '/avatars/doug.png' },
            timeAgo: '1 d',
            question: 'Which Vision base finish do you spec the most?',
            options: [
                { id: 'carbon', text: 'Carbon', votes: 8 },
                { id: 'oak', text: 'Natural Oak', votes: 5 },
                { id: 'white', text: 'Designer White', votes: 12 },
            ],
        },
    ]);

    const addItem = (type, obj) => {
        if (type === 'post') setPosts((arr) => [obj, ...arr]);
        if (type === 'win') setWins((arr) => [obj, ...arr]);
        if (type === 'poll') setPolls((arr) => [obj, ...arr]);
    };

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex items-center justify-between px-4">
                <PageTitle title="Community" theme={theme} />
                <button
                    onClick={() => { setType(null); setModal(true); }}
                    className="p-2 rounded-full"
                    style={{ backgroundColor: theme.colors.accent, color: '#fff' }}
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-3 border-b border-[rgba(0,0,0,0.06)] mx-4 mt-2">
                {['feed', 'wins', 'polls'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`py-2 w-full text-center text-sm font-medium ${tab === t ? 'border-b-2' : ''}`}
                        style={{
                            color: tab === t ? theme.colors.accent : theme.colors.textSecondary,
                            borderColor: tab === t ? theme.colors.accent : 'transparent',
                        }}
                    >
                        {t[0].toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6 pt-6 space-y-6 max-w-md mx-auto">
                {tab === 'feed' && posts.map((p) => <PostCard key={p.id} post={p} theme={theme} />)}
                {tab === 'wins' && wins.map((w) => <WinsCard key={w.id} win={w} theme={theme} />)}
                {tab === 'polls' && polls.map((p) => <PollCard key={p.id} poll={p} theme={theme} />)}
            </div>

            {modalOpen && (
                <CreateContentModal
                    close={() => setModal(false)}
                    pickType={(t) => setType(t)}
                    typeChosen={modalType}
                    onAdd={addItem}
                    theme={theme}
                />
            )}
        </div>
    );
};

const SamplesScreen = ({ theme, onNavigate, cart, onUpdateCart, userSettings }) => {
    const [selectedCategory, setSelectedCategory] = useState('tfl');
    const [setQuantity, setSetQuantity] = useState(1);

    const handleAddSetToCart = useCallback(() => {
        const categoryName = SAMPLE_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Unknown';
        const setItem = {
            id: `set-${selectedCategory}`,
            name: `Complete ${categoryName} Set`,
        };
        onUpdateCart(setItem, setQuantity);
        setSetQuantity(1);
    }, [selectedCategory, setQuantity, onUpdateCart]);

    const handleOrderFullSet = useCallback(() => {
        onUpdateCart({ id: 'full-jsi-set', name: 'Full JSI Sample Set' }, 1);
    }, [onUpdateCart]);

    const totalCartItems = useMemo(
        () => Object.values(cart).reduce((sum, qty) => sum + qty, 0),
        [cart]
    );
    const filteredProducts = useMemo(
        () => SAMPLE_PRODUCTS.filter(p => p.category === selectedCategory),
        [selectedCategory]
    );

    return (
        <>
            <PageTitle title="Samples" theme={theme}>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleOrderFullSet}
                        className="px-4 py-1.5 rounded-full transition"
                        style={{
                            backgroundColor: theme.colors.subtle,
                            color: theme.colors.textPrimary
                        }}
                    >
                        Order Full JSI Set
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => onNavigate('samples/cart')}
                            className="p-2 rounded-full hover:bg-black/10 transition"
                        >
                            <ShoppingCart
                                className="w-7 h-7"
                                style={{ color: theme.colors.textPrimary }}
                            />
                        </button>
                        {totalCartItems > 0 && (
                            <div
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                style={{ backgroundColor: theme.colors.accent }}
                            >
                                {totalCartItems}
                            </div>
                        )}
                    </div>
                </div>
            </PageTitle>

            <div
                className="px-4 py-2 mb-4 overflow-x-auto scrollbar-hide"
                style={{ backgroundColor: theme.colors.surface, borderRadius: '1.5rem' }}
            >
                <div className="flex space-x-2">
                    {SAMPLE_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 transition ${selectedCategory === cat.id
                                    ? 'bg-white shadow rounded-full'
                                    : 'bg-transparent'
                                }`}
                        >
                            <span
                                className="text-sm font-semibold"
                                style={{
                                    color:
                                        selectedCategory === cat.id
                                            ? theme.colors.accent
                                            : theme.colors.textSecondary
                                }}
                            >
                                {cat.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <GlassCard theme={theme} className="mx-4 mb-4 p-4 flex items-center justify-between">
                <span
                    className="font-bold text-base"
                    style={{ color: theme.colors.textPrimary }}
                >
                    Complete {SAMPLE_CATEGORIES.find(c => c.id === selectedCategory)?.name} Set
                </span>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setSetQuantity(q => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition"
                        style={{ backgroundColor: theme.colors.subtle }}
                    >
                        <Minus className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    </button>
                    <span
                        className="w-8 text-center font-bold text-lg"
                        style={{ color: theme.colors.textPrimary }}
                    >
                        {setQuantity}
                    </span>
                    <button
                        onClick={() => setSetQuantity(q => q + 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition"
                        style={{ backgroundColor: theme.colors.subtle }}
                    >
                        <Plus className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    </button>
                    <button
                        onClick={handleAddSetToCart}
                        className="px-6 py-2 rounded-full font-semibold text-white transition"
                        style={{ backgroundColor: theme.colors.accent }}
                    >
                        Add
                    </button>
                </div>
            </GlassCard>

            <div className="px-4 grid grid-cols-2 gap-4 pb-4">
                {filteredProducts.map(product => {
                    const quantity = cart[product.id] || 0;
                    return (
                        <button
                            key={product.id}
                            onClick={() => onUpdateCart(product, 1)}
                            className="relative w-full aspect-square rounded-2xl overflow-hidden transition"
                            style={{
                                border: `2px solid ${quantity > 0 ? theme.colors.accent : theme.colors.border}`,
                                backgroundColor: product.color
                            }}
                        >
                            {quantity > 0 && (
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28">
                                    <GlassCard theme={theme} className="p-1 flex justify-between items-center">
                                        <button
                                            onClick={e => { e.stopPropagation(); onUpdateCart(product, -1); }}
                                            className="w-7 h-7 rounded-full flex items-center justify-center transition"
                                            style={{ backgroundColor: theme.colors.subtle }}
                                        >
                                            <Minus className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                        </button>
                                        <span className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={e => { e.stopPropagation(); onUpdateCart(product, 1); }}
                                            className="w-7 h-7 rounded-full flex items-center justify-center transition"
                                            style={{ backgroundColor: theme.colors.subtle }}
                                        >
                                            <Plus className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                        </button>
                                    </GlassCard>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </>
    );
};



const ReplacementsScreen = ({ theme, setSuccessMessage, onNavigate, showAlert }) => {
    const [formData, setFormData] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef(null);

    const isDarkMode = theme.colors.background === '#1E1E1E';

    const inputBg = isDarkMode ? theme.colors.surface : theme.colors.subtle;
    const inputBorder = theme.colors.border;
    const btnBg = isDarkMode ? theme.colors.textPrimary : theme.colors.accent;
    const btnColor = isDarkMode ? theme.colors.background : '#FFF';

    const handleScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setFormData({ so: 'SO-450080', lineItem: '001', notes: '' });
            setIsScanning(false);
        }, 1500);
    };

    const handleEnterManually = () => setFormData({ so: '', lineItem: '', notes: '' });
    const handleFormChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleFileChange = e => e.target.files && setAttachments(p => [...p, ...Array.from(e.target.files)]);
    const removeAttachment = name => setAttachments(p => p.filter(f => f.name !== name));
    const handleSubmit = () => {
        setSuccessMessage("Replacement Request Submitted!");
        setTimeout(() => {
            setSuccessMessage("");
            onNavigate('home');
        }, 1200);
    };

    return (
        <>
            <PageTitle title="Request Replacement" theme={theme} />
            <div className="px-4 pb-4">
                <GlassCard
                    theme={theme}
                    className="p-4"
                    style={{ backgroundColor: theme.colors.card }}
                >
                    {!formData ? (
                        <div className="text-center space-y-4">
                            <button
                                onClick={handleScan}
                                disabled={isScanning}
                                className="w-full flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed hover:bg-white/5 transition-colors"
                                style={{ borderColor: theme.colors.accent, color: theme.colors.accent }}
                            >
                                <Camera className={`w-12 h-12 mb-2 ${isScanning ? 'animate-pulse' : ''}`} />
                                <span className="font-semibold">
                                    {isScanning ? 'Scanning...' : 'Scan QR Code'}
                                </span>
                            </button>
                            <div className="flex items-center my-4">
                                <div className="flex-grow border-t" style={{ borderColor: theme.colors.subtle }} />
                                <span className="mx-4 text-xs uppercase" style={{ color: theme.colors.textSecondary }}>
                                    Or
                                </span>
                                <div className="flex-grow border-t" style={{ borderColor: theme.colors.subtle }} />
                            </div>
                            <button
                                onClick={handleEnterManually}
                                className="font-semibold py-2 px-4 hover:underline transition-colors"
                                style={{ color: theme.colors.accent }}
                            >
                                Enter Details Manually
                            </button>
                        </div>
                    ) : (
                        <>
                            <FormInput
                                label="Sales Order"
                                name="so"
                                value={formData.so}
                                onChange={handleFormChange}
                                theme={theme}
                                style={{ backgroundColor: inputBg, borderColor: inputBorder, color: theme.colors.textPrimary }}
                            />
                            <FormInput
                                label="Line Item"
                                name="lineItem"
                                value={formData.lineItem}
                                onChange={handleFormChange}
                                theme={theme}
                                style={{ backgroundColor: inputBg, borderColor: inputBorder, color: theme.colors.textPrimary }}
                            />
                            <FormInput
                                type="textarea"
                                label="Notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleFormChange}
                                theme={theme}
                                style={{ backgroundColor: inputBg, borderColor: inputBorder, color: theme.colors.textPrimary }}
                            />

                            {attachments.map(file => (
                                <div key={file.name} className="flex items-center space-x-2 mt-3">
                                    <span className="text-sm" style={{ color: theme.colors.textPrimary }}>
                                        {file.name}
                                    </span>
                                    <button onClick={() => removeAttachment(file.name)}>
                                        <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                    </button>
                                </div>
                            ))}

                            <label className="block mt-6">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    hidden
                                    onChange={handleFileChange}
                                />
                                <span
                                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer"
                                    style={{ backgroundColor: theme.colors.subtle }}
                                >
                                    <Image className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                    <span>Add Attachment</span>
                                </span>
                            </label>

                            <button
                                onClick={handleSubmit}
                                className="mt-8 w-full py-3 rounded-full font-medium transition-colors"
                                style={{ backgroundColor: btnBg, color: btnColor }}
                            >
                                Submit Request
                            </button>
                        </>
                    )}
                </GlassCard>
            </div>
        </>
    );
};

const SettingsScreen = ({ theme, onSave, userSettings, setUserSettings }) => {
    // This local state is now safely initialized with the userSettings prop
    const [localSettings, setLocalSettings] = useState(userSettings);

    const handleChange = (field, value) => {
        setLocalSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setUserSettings(localSettings);
        onSave();
    };

    // The "App Permissions" FormSection and its related logic have been removed.
    return (
        <form onSubmit={handleSubmit}>
            <PageTitle title="Settings" theme={theme} />
            <div className="px-4 pb-4 space-y-6">
                <FormSection title="Personal Information" theme={theme}>
                    <FormInput label="First Name" value={localSettings.firstName} onChange={(e) => handleChange('firstName', e.target.value)} theme={theme} />
                    <FormInput label="Last Name" value={localSettings.lastName} onChange={(e) => handleChange('lastName', e.target.value)} theme={theme} />
                    <FormInput type="email" label="Email" value={localSettings.email} onChange={(e) => handleChange('email', e.target.value)} theme={theme} />
                </FormSection>

                <FormSection title="Preferences" theme={theme}>
                    <FormInput type="textarea" label="Home Address" value={localSettings.homeAddress} onChange={(e) => handleChange('homeAddress', e.target.value)} theme={theme} />
                    <CustomSelect label="T-Shirt Size" value={localSettings.tShirtSize} onChange={(e) => handleChange('tShirtSize', e.target.value)} options={['S', 'M', 'L', 'XL', 'XXL'].map(s => ({ label: s, value: s }))} theme={theme} />
                </FormSection>

                <div className="pt-4 pb-4">
                    <button type="submit" className="w-full text-white font-bold py-3 px-6 rounded-lg transition-colors" style={{ backgroundColor: theme.colors.accent }}>Save Changes</button>
                </div>
            </div>
        </form>
    );
};

export const MemberCard = React.memo(({ user, theme, isCurrentUser, onConfirmPromotion, onConfirmRemove, onUpdateUser, onTogglePermission, onUpdateRole, isExpanded, onToggleExpand, isLast }) => {

    const handleRoleChange = (e) => {
        onUpdateUser(user.id, 'title', e.target.value);
    };

    // This handler now performs the correct action based on the user's role
    const handleActionClick = () => {
        // FIX: If the user is already an Admin, demote them instantly without a modal.
        if (user.role === 'Admin') {
            onUpdateRole(user.id, 'User');
        } else {
            // Otherwise, show the confirmation modal before making them an Admin.
            onConfirmPromotion(user);
        }
    };

    const cardContent = (
        <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <p className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                    {user.firstName} {user.lastName}
                </p>
                {user.status === 'pending' && <Hourglass className="w-4 h-4 text-amber-500" />}
                {isCurrentUser && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.colors.accent, color: 'white' }}>
                        You
                    </span>
                )}
            </div>
            <div className="flex items-center space-x-2">
                {user.role === 'User' ? (
                    <div className="w-40">
                        <CustomSelect
                            value={user.title}
                            onChange={handleRoleChange}
                            options={Data.USER_TITLES.map(t => ({ value: t, label: t }))}
                            theme={theme}
                            onOpen={onToggleExpand}
                        />
                    </div>
                ) : !isCurrentUser && (
                    <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} style={{ color: theme.colors.secondary }} />
                )}
            </div>
        </div>
    );

    return (
        <div className={`transition-all duration-300 ${!isExpanded && !isLast ? 'border-b' : ''}`} style={{ borderColor: theme.colors.subtle }}>
            <button className="w-full text-left disabled:opacity-70 disabled:cursor-not-allowed" onClick={onToggleExpand} disabled={isCurrentUser}>
                {cardContent}
            </button>

            {isExpanded && !isCurrentUser && (
                <div className="bg-black/5 dark:bg-white/5 px-4 pb-4 animate-fade-in">
                    <div className="pt-4 border-t" style={{ borderColor: theme.colors.subtle }}>
                        {user.role === 'User' && (
                            <div className="space-y-3 mb-4">
                                <h4 className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>Permissions</h4>
                                {Object.entries(Data.PERMISSION_LABELS).map(([key, label]) => {
                                    const isDisabled = !user.permissions.salesData && ['commissions', 'dealerRewards', 'customerRanking'].includes(key);
                                    return (
                                        <PermissionToggle key={key} label={label} isEnabled={user.permissions[key]} disabled={isDisabled} onToggle={() => onTogglePermission(user.id, key)} theme={theme} />
                                    );
                                })}
                            </div>
                        )}
                        <div className={`space-y-3 ${user.role === 'User' ? 'pt-4 border-t' : ''}`} style={{ borderColor: theme.colors.subtle }}>
                            <button onClick={handleActionClick} className="w-full text-center p-2.5 rounded-full font-semibold text-white" style={{ backgroundColor: theme.colors.accent }}>
                                {user.role === 'Admin' ? 'Move to User' : 'Make Admin'}
                            </button>
                            <button onClick={() => onConfirmRemove(user)} className="w-full text-center p-2.5 rounded-full font-semibold bg-red-500/10 text-red-500">
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});
export const AddUserModal = ({ show, onClose, onAddUser, theme, roleToAdd }) => {
    const [newUser, setNewUser] = useState(Data.EMPTY_USER);

    useEffect(() => {
        if (show) {
            // Reset form when the modal is opened for a new user
            setNewUser({ ...Data.EMPTY_USER, role: roleToAdd });
        }
    }, [show, roleToAdd]);

    const handleNewUserChange = useCallback((field, value) => {
        setNewUser(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleAddUser = (e) => {
        e.preventDefault();
        if (newUser.firstName && newUser.lastName && newUser.email) {
            onAddUser(newUser);
            // FIX: This now automatically closes the modal upon successful submission
            onClose();
        } else {
            alert("Please fill out all required fields.");
        }
    };

    return (
        <Modal show={show} onClose={onClose} title={`Add New ${roleToAdd}`} theme={theme}>
            <form onSubmit={handleAddUser} className="space-y-4">
                <FormInput required label="First Name" value={newUser.firstName} onChange={e => handleNewUserChange('firstName', e.target.value)} placeholder="First Name" theme={theme} />
                <FormInput required label="Last Name" value={newUser.lastName} onChange={e => handleNewUserChange('lastName', e.target.value)} placeholder="Last Name" theme={theme} />
                <FormInput required type="email" label="Email" value={newUser.email} onChange={e => handleNewUserChange('email', e.target.value)} placeholder="Email" theme={theme} />

                {roleToAdd === 'User' && (
                    <CustomSelect required label="User Title" options={Data.USER_TITLES.map(t => ({ value: t, label: t }))} value={newUser.title} onChange={e => handleNewUserChange('title', e.target.value)} theme={theme} placeholder="Select a Title" />
                )}

                <div className="pt-2 text-center">
                    <p className="text-xs mb-3" style={{ color: theme.colors.textSecondary }}>
                        This will send an invitation to the user to join the MyJSI app.
                    </p>
                    <button
                        type="submit"
                        className="w-full font-bold py-3 px-6 rounded-full text-white"
                        style={{ backgroundColor: theme.colors.accent }}
                    >
                        Send Invite
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export const MembersScreen = ({ theme, members, setMembers, currentUserId, onNavigate }) => {
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [userToRemove, setUserToRemove] = useState(null);
    const [userToPromote, setUserToPromote] = useState(null);
    const [roleToAdd, setRoleToAdd] = useState(null);
    const [expandedUserId, setExpandedUserId] = useState(null);

    const admins = useMemo(() => members.filter(m => m.role === 'Admin'), [members]);
    const users = useMemo(() => members.filter(m => m.role === 'User'), [members]);

    const handleUpdateUser = useCallback((userId, field, value) => { setMembers(prev => prev.map(m => m.id === userId ? { ...m, [field]: value } : m)); }, [setMembers]);
    const handleUpdateRole = useCallback((userId, newRole) => { setMembers(prev => prev.map(m => (m.id === userId ? { ...m, role: newRole } : m))); }, [setMembers]);
    const handleConfirmRemove = useCallback((user) => { setUserToRemove(user); }, []);
    const executeRemoveUser = useCallback(() => { if (userToRemove) { setMembers(prev => prev.filter(m => m.id !== userToRemove.id)); setUserToRemove(null); } }, [userToRemove, setMembers]);
    const handleTogglePermission = useCallback((userId, permissionKey) => {
        setMembers(prevMembers =>
            prevMembers.map(member => {
                if (member.id === userId) {
                    const newPermissions = { ...member.permissions, [permissionKey]: !member.permissions[permissionKey] };
                    if (permissionKey === 'salesData' && !newPermissions.salesData) {
                        newPermissions.commissions = false; newPermissions.dealerRewards = false; newPermissions.customerRanking = false;
                    }
                    return { ...member, permissions: newPermissions };
                }
                return member;
            })
        );
    }, [setMembers]);

    const handleConfirmPromotion = useCallback((user) => { setUserToPromote(user); }, []);
    const executePromotion = useCallback(() => {
        if (userToPromote) {
            handleUpdateRole(userToPromote.id, 'Admin');
            setUserToPromote(null);
        }
    }, [userToPromote, handleUpdateRole]);

    const handleAddUser = (newUser) => {
        const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
        setMembers(prev => [...prev, { ...newUser, id: newId, role: roleToAdd, status: 'pending' }]);
        setShowAddUserModal(false);
    };

    const handleToggleExpand = (userId) => {
        setExpandedUserId(prevId => (prevId === userId ? null : userId));
    };

    return (
        <>
            <div className="px-4 pt-6 pb-4">
                {/* Header is now minimal */}
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>App Users</h1>
            </div>

            <div className="px-4 space-y-6 pb-4">
                <GlassCard theme={theme} className="p-0">
                    <h2 className="font-bold text-2xl p-4" style={{ color: theme.colors.textPrimary }}>Administrators</h2>
                    <div>
                        {admins.map((member, index) => (
                            <MemberCard key={member.id} user={member} theme={theme} isCurrentUser={member.id === currentUserId} onConfirmPromotion={handleConfirmPromotion} onConfirmRemove={handleConfirmRemove} onUpdateRole={handleUpdateRole} isExpanded={expandedUserId === member.id} onToggleExpand={() => handleToggleExpand(member.id)} isLast={index === admins.length - 1} />
                        ))}
                    </div>
                    <div className="p-4 border-t" style={{ borderColor: theme.colors.subtle }}>
                        <button onClick={() => { setRoleToAdd('Admin'); setShowAddUserModal(true); }} className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/10" style={{ color: theme.colors.accent }}>
                            <Plus className="w-4 h-4" />
                            <span>Add Administrator</span>
                        </button>
                    </div>
                </GlassCard>

                <GlassCard theme={theme} className="p-0">
                    <h2 className="font-bold text-2xl p-4" style={{ color: theme.colors.textPrimary }}>Users</h2>
                    <div>
                        {users.map((member, index) => (
                            <MemberCard key={member.id} user={member} theme={theme} isCurrentUser={member.id === currentUserId} onConfirmPromotion={handleConfirmPromotion} onConfirmRemove={handleConfirmRemove} onUpdateUser={handleUpdateUser} onTogglePermission={handleTogglePermission} onUpdateRole={handleUpdateRole} isExpanded={expandedUserId === member.id} onToggleExpand={() => handleToggleExpand(member.id)} isLast={index === users.length - 1} />
                        ))}
                    </div>
                    <div className="p-4 border-t" style={{ borderColor: theme.colors.subtle }}>
                        <button onClick={() => { setRoleToAdd('User'); setShowAddUserModal(true); }} className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/10" style={{ color: theme.colors.accent }}>
                            <Plus className="w-4 h-4" />
                            <span>Add User</span>
                        </button>
                    </div>
                </GlassCard>
            </div>

            {/* All Modals */}
            <AddUserModal show={!!roleToAdd} onClose={() => setRoleToAdd(null)} onAddUser={handleAddUser} theme={theme} roleToAdd={roleToAdd} />
            <Modal show={!!userToRemove} onClose={() => setUserToRemove(null)} title="Delete User" theme={theme}>
                <p style={{ color: theme.colors.textPrimary }}>Are you sure you want to delete <span className="font-bold">{userToRemove?.firstName} {userToRemove?.lastName}</span>?</p>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>This action is permanent.</p>
                <div className="flex justify-end space-x-3 pt-4">
                    <button onClick={() => setUserToRemove(null)} className="font-bold py-2 px-5 rounded-lg" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>Cancel</button>
                    <button onClick={executeRemoveUser} className="font-bold py-2 px-5 rounded-lg bg-red-600 text-white">Delete</button>
                </div>
            </Modal>
            <Modal show={!!userToPromote} onClose={() => setUserToPromote(null)} title="Confirm Role Change" theme={theme}>
                <p style={{ color: theme.colors.textPrimary }}>Are you sure you want to make <span className="font-bold">{userToPromote?.firstName} {userToPromote?.lastName}</span> an Admin?</p>
                <p className="text-sm mt-2" style={{ color: theme.colors.textSecondary }}>This action gives the user full permissions.</p>
                <div className="flex justify-end space-x-3 pt-4 mt-4 border-t" style={{ borderColor: theme.colors.border }}>
                    <button onClick={() => setUserToPromote(null)} className="font-bold py-2 px-5 rounded-lg" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>Cancel</button>
                    <button onClick={executePromotion} className="font-bold py-2 px-5 rounded-lg text-white" style={{ backgroundColor: '#10B981' }}>Make Admin</button>
                </div>
            </Modal>
        </>
    );
};
const HelpScreen = ({ theme }) => (
    <>
        <PageTitle title="Help & Support" theme={theme} />
        <div className="px-4 pb-4 space-y-6">
            <GlassCard theme={theme} className="p-4 space-y-2">
                <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>Frequently Asked Questions</h3>
                <div className="text-sm space-y-3">
                    <div>
                        <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>How do I track an order?</p>
                        <p style={{ color: theme.colors.textSecondary }}>Navigate to the 'Orders' section from the home screen. You can search by order number, company, or project details.</p>
                    </div>
                    <div>
                        <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>Where can I find lead times?</p>
                        <p style={{ color: theme.colors.textSecondary }}>The 'Lead Times' section provides up-to-date estimates for all our product categories.</p>
                    </div>
                    <div>
                        <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>How do I request a replacement part?</p>
                        <p style={{ color: theme.colors.textSecondary }}>Go to the 'Replacements' section and scan the QR code on the product label to begin your request.</p>
                    </div>
                </div>
            </GlassCard>
            <GlassCard theme={theme} className="p-4 space-y-2">
                <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>Contact Support</h3>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    For technical issues or questions not answered here, please email our support team. We're happy to help!
                </p>
                <a href="mailto:myjsiapp@jaspergroup.us.com" className="font-semibold text-center block p-2 rounded-lg" style={{ color: theme.colors.accent, backgroundColor: theme.colors.subtle }}>
                    myjsiapp@jaspergroup.us.com
                </a>
            </GlassCard>
        </div>
    </>
);

const LogoutScreen = ({ theme, onNavigate }) => {
    React.useEffect(() => {
        onNavigate('home');
    }, []);
    return (
        <PageTitle
            title="Logged Out"
            theme={theme}
            onBack={() => onNavigate('home')}
        />
    );
};

const FeedbackScreen = ({ theme, setSuccessMessage, onNavigate }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
        }
    };

    const handleSubmit = () => {
        console.log({ subject, message, attachment });
        setSuccessMessage("Feedback Submitted!");
        setTimeout(() => {
            setSuccessMessage("");
            onNavigate('home');
        }, 1200);
    };

    return (
        <>
            <PageTitle title="Feedback" theme={theme} />
            <div className="px-4 pb-4 space-y-4">
                <FormInput label="Subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Feature Request" theme={theme} />
                <FormInput label="Message" type="textarea" value={message} onChange={e => setMessage(e.target.value)} placeholder="Your detailed feedback..." theme={theme} />
                <div>
                    <label htmlFor="file-upload" className="w-full font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center cursor-pointer" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>
                        <Paperclip className="w-4 h-4 mr-2" />
                        Add Attachment
                    </label>
                    <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                    {attachment && <p className="text-xs text-center mt-2" style={{ color: theme.colors.textSecondary }}>Selected: {attachment.name}</p>}
                </div>
                <button className="w-full font-bold py-3 px-6 rounded-lg transition-colors" style={{ backgroundColor: theme.colors.accent, color: '#FFFFFF' }} onClick={handleSubmit}>Submit Feedback</button>
            </div>
        </>
    );
};

const SCREEN_MAP = {
    home: HomeScreen,
    sales: SalesScreen,
    orders: OrdersScreen,
    products: ProductsScreen,
    'customer-rank': CustomerRankScreen,
    'commissions': CommissionsScreen,
    'incentive-rewards': IncentiveRewardsScreen,
    // Top-level Resources menu
    resources: ResourcesScreen,
    fabrics: FabricsScreen,

    // Fabrics
    'fabrics/search_form': SearchFormScreen,
    'fabrics/com_request': COMRequestScreen,

    // Rep Functions
    'resources/commission_rates': CommissionRatesScreen,
    'resources/loaner_pool': LoanerPoolScreen,
    'resources/dealer_registration': DealerRegistrationScreen,
    'resources/request_field_visit': RequestFieldVisitScreen,
    'resources/sample_discounts': SampleDiscountsScreen,
    'resources/dealer_directory': DealerDirectoryScreen,

    // Misc.
    'resources/contracts': ContractsScreen,
    'resources/design_days': DesignDaysScreen,
    'resources/discontinued_finishes': DiscontinuedFinishesScreen,
    'resources/install_instructions': InstallInstructionsScreen,
    'resources/lead-times': LeadTimesScreen,
    'resources/presentations': PresentationsScreen,
    'resources/social_media': SocialMediaScreen,

    // Other app screens
    projects: ProjectsScreen,
    community: CommunityScreen,
    samples: SamplesScreen,
    'samples/cart': CartScreen,
    'new-lead': NewLeadScreen,
    replacements: ReplacementsScreen,
    settings: SettingsScreen,
    members: MembersScreen,
    help: HelpScreen,
    logout: LogoutScreen,
    feedback: FeedbackScreen,
};

export {
    Avatar,
    PostCard,
    WinsCard,
    CreateContentModal,
    FormInput,
    SuccessToast,
    AppHeader,
    MonthlyBarChart,
    MonthlyTable,
    RecentPOsCard,
    Modal,
   

    // Top‐level screens
    SalesScreen,
    ProductsScreen,

    // Fabrics screens
    SearchFormScreen,
    COMRequestScreen,

    // “Rep Functions” screens
    CommissionRatesScreen,
    DealerRegistrationScreen,
    RequestFieldVisitScreen,
    DealerDirectoryScreen,

    // Misc. resource screens
    ContractsScreen,
    DesignDaysScreen,
    DiscontinuedFinishesScreen,
    InstallInstructionsScreen,
    PresentationsScreen,
    LeadTimesScreen,
    SocialMediaScreen,

    // Other app screens
    CommunityScreen,
    SamplesScreen,
    FancySelect,
    ReplacementsScreen,
    SettingsScreen,
    HelpScreen,
    LogoutScreen,
    FeedbackScreen,

    // The navigation map
    SCREEN_MAP,
};
