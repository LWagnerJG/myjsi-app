import React, {
    useState,
    useRef,
    useMemo,
    useCallback,
    useEffect,
    useLayoutEffect,
} from 'react';

import ReactDOM from 'react-dom'; // for createPortal

import {
    DROPDOWN_MAX_HEIGHT,
    DROPDOWN_PORTAL_HEIGHT,
    DROPDOWN_MIN_WIDTH,
    DROPDOWN_SIDE_PADDING,
    DROPDOWN_GAP,
} from './constants/dropdown.js';

import { DropdownPortal } from './DropdownPortal.jsx';
import { REWARDS_DATA } from './data.jsx';

import * as Data from './data.jsx';

import {
    AlertCircle,
    Armchair,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    BarChart2,
    Briefcase,
    Bus,
    Calendar,
    Camera,
    CheckCircle,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Clock,
    Copy,
    Database,
    DollarSign,
    ExternalLink,
    FileText,
    Film,
    Filter,
    Heart,
    HelpCircle,
    Home,
    Hourglass,
    Image,
    List,
    LogOut,
    MapPin,
    MessageSquare,
    Mic,
    Minus,
    MonitorPlay,
    Moon,
    MoreVertical,
    Package,
    Paperclip,
    Palette,
    Percent,
    PieChart,
    Play,
    Plus,
    RotateCw,
    Save,
    Search,
    Send,
    Server,
    Settings,
    Share2,
    ShoppingCart,
    Square, // Add this
    Sun,
    Trophy,
    User,
    UserPlus,
    UserX,
    Users,
    Video,
    Wrench,
    X,
    ImageIcon,
    Pencil,
    Trash2,
} from 'lucide-react';


export const useDropdownPosition = (elementRef) => {
    const [direction, setDirection] = useState('down');

    const checkPosition = useCallback(() => {
        if (!elementRef.current) return;

        const rect = elementRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        const flip = spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > DROPDOWN_MAX_HEIGHT;
        setDirection(flip ? 'up' : 'down');
    }, [elementRef]);

    useEffect(() => {
        checkPosition();                     // run once
        window.addEventListener('resize', checkPosition);
        return () => window.removeEventListener('resize', checkPosition);
    }, [checkPosition]);

    return [direction, checkPosition];     // <-- BOTH values
};

export const PortalNativeSelect = ({
    label,
    value,
    onChange,
    options,
    placeholder,
    theme,
    required,
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [pos, setPos] = React.useState({ top: 0, left: 0, width: 0 });
    const wrapRef = React.useRef(null);
    const dropRef = React.useRef(null);
    const calcPos = React.useCallback(() => { if (!wrapRef.current) return; const r = wrapRef.current.getBoundingClientRect(); const vw = window.innerWidth; const vh = window.innerHeight; const h = DROPDOWN_PORTAL_HEIGHT; const w = Math.max(r.width, DROPDOWN_MIN_WIDTH); let top = r.bottom + DROPDOWN_GAP; if (top + h > vh) top = r.top - h - DROPDOWN_GAP; let left = r.left; if (left + w > vw - DROPDOWN_SIDE_PADDING) left = vw - w - DROPDOWN_SIDE_PADDING; if (left < DROPDOWN_SIDE_PADDING) left = DROPDOWN_SIDE_PADDING; setPos({ top, left, width: w }); }, []);
    const toggleOpen = () => { if (!isOpen) calcPos(); setIsOpen(o => !o); };
    React.useEffect(() => { const away = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && dropRef.current && !dropRef.current.contains(e.target) && setIsOpen(false); document.addEventListener('mousedown', away); return () => document.removeEventListener('mousedown', away); }, []);
    React.useEffect(() => { if (!isOpen) return; const handler = () => calcPos(); window.addEventListener('resize', handler); window.addEventListener('scroll', handler, true); return () => { window.removeEventListener('resize', handler); window.removeEventListener('scroll', handler, true); }; }, [isOpen, calcPos]);
    const selectedLabel = React.useMemo(() => { if (!Array.isArray(options)) return placeholder; return options.find((o) => o.value === value)?.label || placeholder; }, [options, value, placeholder]);
    const handleSelect = (v) => { onChange({ target: { value: v } }); setIsOpen(false); };
    return (
        <>
            <div ref={wrapRef} className="relative space-y-2">
                {/* FIX: Updated label style to text-sm and px-3 */}
                {label && (<label className="block text-sm font-semibold px-3" style={{ color: theme.colors.textSecondary }}>{label}</label>)}
                <button type="button" onClick={toggleOpen} aria-expanded={isOpen} aria-required={required} className="w-full px-4 py-3 border rounded-full text-base text-left flex justify-between items-center" style={{ backgroundColor: theme.colors.subtle, borderColor: theme.colors.border, color: value ? theme.colors.textPrimary : theme.colors.textSecondary, }}>
                    <span className="pr-6">{selectedLabel}</span>
                    <ChevronDown className={`absolute right-4 w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color: theme.colors.textSecondary }} />
                </button>
            </div>
            {isOpen && (<DropdownPortal parentRef={wrapRef} onClose={() => setIsOpen(false)}><div ref={dropRef} className="z-[9999] pointer-events-auto" style={{ top: pos.top, left: pos.left, width: pos.width }}><GlassCard theme={theme} className="p-1.5 max-h-60 overflow-y-auto scrollbar-hide rounded-2xl shadow-lg">{options.map((opt) => (<button key={opt.value} type="button" onClick={() => handleSelect(opt.value)} className="block w-full text-left py-2.5 px-3.5 text-sm rounded-lg transition-colors" style={{ backgroundColor: opt.value === value ? theme.colors.primary : 'transparent', color: opt.value === value ? theme.colors.surface : theme.colors.textPrimary, fontWeight: opt.value === value ? 600 : 400, }}>{opt.label}</button>))}</GlassCard></div></DropdownPortal>)}
        </>
    );
};

export const GlassCard = React.memo(
    React.forwardRef(({ children, className = '', theme, ...props }, ref) => (
        <div
            ref={ref}
            className={`rounded-[2.25rem] border shadow-lg transition-all duration-300 ${className}`}
            style={{
                backgroundColor: theme.colors.surface, // This line makes the card's background white
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

export const IncentiveRewardsScreen = ({ theme }) => {
    const generateTimePeriods = useCallback(() => {
        const periods = [];
        const currentYear = new Date().getFullYear();

        for (let year = currentYear; year >= currentYear - 2; year--) { // Last 3 years
            periods.push({ value: `${year}`, label: `${year}` }); // Add full year
            for (let q = 4; q >= 1; q--) {
                // Only add future quarters for the current year if they are in the past
                if (year === currentYear && q > Math.floor(new Date().getMonth() / 3) + 1) {
                    continue;
                }
                periods.push({ value: `${year}-Q${q}`, label: `Q${q} ${year}` });
            }
        }
        return periods;
    }, []);

    const timePeriods = useMemo(generateTimePeriods, [generateTimePeriods]);
    const [selectedPeriod, setSelectedPeriod] = useState(timePeriods[0].value);

    const rewardsData = useMemo(() => {
        const isAnnual = !selectedPeriod.includes('Q');
        if (isAnnual) {
            const year = selectedPeriod;
            const cumulativeData = { sales: [], designers: [] };
            const salesMap = new Map();
            const designersMap = new Map();

            for (let q = 1; q <= 4; q++) {
                const periodKey = `${year}-Q${q}`;
                if (REWARDS_DATA[periodKey]) { // Fixed typo here
                    REWARDS_DATA[periodKey].sales.forEach(person => { // Fixed typo here
                        salesMap.set(person.name, (salesMap.get(person.name) || 0) + person.amount);
                    });
                    REWARDS_DATA[periodKey].designers.forEach(person => { // Fixed typo here
                        designersMap.set(person.name, (designersMap.get(person.name) || 0) + person.amount);
                    });
                }
            }

            salesMap.forEach((amount, name) => cumulativeData.sales.push({ name, amount }));
            designersMap.forEach((amount, name) => cumulativeData.designers.push({ name, amount }));

            return cumulativeData;
        }
        return REWARDS_DATA[selectedPeriod] || { sales: [], designers: [] }; // Fixed typo here
    }, [selectedPeriod]);

    const sortedSales = [...(rewardsData.sales || [])].sort((a, b) => b.amount - a.amount);
    const sortedDesigners = [...(rewardsData.designers || [])].sort((a, b) => b.amount - a.amount);

    return (
        <>
            <PageTitle title="Rewards" theme={theme}>
                <div className="w-36"> {/* Added a div to control dropdown width */}
                    <PortalNativeSelect
                        value={selectedPeriod}
                        onChange={e => setSelectedPeriod(e.target.value)}
                        options={timePeriods}
                        theme={theme}
                        placeholder="Select Period"
                    />
                </div>
            </PageTitle>
            <div className="px-4 space-y-4 pb-4">
                <GlassCard theme={theme} className="p-4">
                    <h3 className="font-bold text-xl mb-2" style={{ color: theme.colors.textPrimary }}>Sales</h3>
                    <div className="space-y-2">
                        {sortedSales.length > 0 ? sortedSales.map(person => (
                            <div key={person.name} className="flex justify-between items-center text-sm">
                                <span style={{ color: theme.colors.textPrimary }}>{person.name}</span>
                                <span className="font-semibold" style={{ color: theme.colors.accent }}>${person.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        )) : <p className="text-sm" style={{ color: theme.colors.textSecondary }}>No sales rewards for this period.</p>}
                    </div>
                </GlassCard>

                <GlassCard theme={theme} className="p-4">
                    <h3 className="font-bold text-xl mb-2" style={{ color: theme.colors.textPrimary }}>Designers</h3>
                    <div className="space-y-2">
                        {sortedDesigners.length > 0 ? sortedDesigners.map(person => (
                            <div key={person.name} className="flex justify-between items-center text-sm">
                                <span style={{ color: theme.colors.textPrimary }}>{person.name}</span>
                                <span className="font-semibold" style={{ color: theme.colors.accent }}>${person.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        )) : <p className="text-sm" style={{ color: theme.colors.textSecondary }}>No designer rewards for this period.</p>}
                    </div>
                </GlassCard>
            </div>
        </>
    );
};


export const AutoCompleteCombobox = ({
    label,
    options = [],
    value,
    onChange, // handles raw input text changes
    onSelect, // handles selection of an item from the filtered list
    onAddNew,
    placeholder = '',
    theme,
    dropdownClassName = '', // Added prop for custom dropdown styling
    resetOnSelect = false, // New prop to clear input on selection
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
    const wrapRef = useRef(null);
    const dropRef = useRef(null);

    const filtered = useMemo(() => {
        const q = (value || '').toLowerCase();
        if (!q) return options;
        return options.filter(o => o.toLowerCase().includes(q));
    }, [value, options]);

    const calcPos = useCallback(() => {
        if (!wrapRef.current) return;
        const r = wrapRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        // Adjusted height calculation to consider available space and dynamic content
        const contentHeight = filtered.length * 44 + (onAddNew && value ? 44 : 0) + 20; // Estimate height based on items + 'add new' button + padding
        const h = Math.min(contentHeight, vh * 0.4); // Cap height at 40% of viewport height
        const w = Math.max(r.width, DROPDOWN_MIN_WIDTH);
        let top = r.bottom + DROPDOWN_GAP;
        if (top + h > vh - DROPDOWN_SIDE_PADDING) top = r.top - h - DROPDOWN_GAP; // Flip upwards if not enough space below
        let left = r.left;
        if (left + w > vw - DROPDOWN_SIDE_PADDING) left = vw - w - DROPDOWN_SIDE_PADDING;
        if (left < DROPDOWN_SIDE_PADDING) left = DROPDOWN_SIDE_PADDING;
        setPos({ top, left, width: w, height: h });
    }, [filtered, onAddNew, value]);

    useEffect(() => {
        if (!isOpen) return;
        const handler = () => calcPos();
        window.addEventListener('resize', handler);
        window.addEventListener('scroll', handler, true);
        return () => {
            window.removeEventListener('resize', handler);
            window.removeEventListener('scroll', handler, true);
        };
    }, [isOpen, calcPos]);

    useEffect(() => {
        const away = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target) && dropRef.current && !dropRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', away);
        return () => document.removeEventListener('mousedown', away);
    }, []);

    const handleSelectOption = (opt) => {
        onSelect?.(opt); // Use optional chaining for onSelect
        setIsOpen(false);
        if (resetOnSelect) {
            onChange(''); // Clear the input if resetOnSelect is true
        } else {
            onChange(opt); // Set the input value to the selected option if not resetting
        }
    };

    const handleAdd = () => {
        if (!value) return;
        onAddNew?.(value);
        setIsOpen(false);
        onChange(''); // Clear the input after adding new item
    };

    return (
        <div ref={wrapRef} className="space-y-2">
            {/* FIX: Updated label style to text-sm and px-3 */}
            {label && (
                <label className="block text-sm font-semibold px-3" style={{ color: theme.colors.textSecondary }}>
                    {label}
                </label>
            )}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                <input
                    type="text"
                    value={value || ''}
                    onFocus={() => { calcPos(); setIsOpen(true); }}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-4 py-3 border rounded-full text-base"
                    style={{ backgroundColor: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                />
            </div>

            {isOpen && (
                <DropdownPortal parentRef={wrapRef} onClose={() => setIsOpen(false)}>
                    <div ref={dropRef} className={`fixed z-[9999] pointer-events-auto ${dropdownClassName}`} style={{ top: pos.top, left: pos.left, width: pos.width }}>
                        <GlassCard theme={theme} className="p-1.5 overflow-y-auto scrollbar-hide rounded-2xl shadow-lg" style={{ maxHeight: pos.height, backgroundColor: '#FFFFFF' }}>
                            {filtered.length > 0 && filtered.map((opt) => (
                                <button key={opt} type="button" onClick={() => handleSelectOption(opt)} className="block w-full text-left py-2.5 px-3.5 text-sm rounded-lg hover:bg-black/5" style={{ color: theme.colors.textPrimary }}>
                                    {opt}
                                </button>
                            ))}
                            {onAddNew && value && !options.some(o => o.toLowerCase() === value.toLowerCase()) && (
                                <button type="button" onClick={handleAdd} className="block w-full text-left py-2.5 px-3.5 text-sm mt-1 rounded-lg font-semibold" style={{ color: theme.colors.accent }}>
                                    + Add "{value}"
                                </button>
                            )}
                        </GlassCard>
                    </div>
                </DropdownPortal>
            )}
        </div>
    );
};

export const ToggleButtonGroup = ({ value, onChange, options, theme }) => {
    // Find the index of the currently selected option
    const selectedIndex = options.findIndex((opt) => opt.value === value);

    return (
        <div
            className="w-full flex p-1 rounded-full relative"
            style={{ backgroundColor: theme.colors.subtle }}
        >
            {/* This is the "sliding pill" that moves to the selected option */}
            <div
                className="absolute top-1 bottom-1 rounded-full transition-transform duration-300 ease-in-out"
                style={{
                    width: `calc(${100 / options.length}% - 4px)`,
                    backgroundColor: theme.colors.surface,
                    // This transform calculates the correct position for the pill
                    transform: `translateX(calc(${selectedIndex * 100}% + ${selectedIndex * 4}px))`,
                    boxShadow: `0 1px 4px ${theme.colors.shadow}`,
                    border: `1px solid ${theme.colors.border}`,
                }}
            />

            {/* These are the transparent buttons that sit on top */}
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className="flex-1 py-2 px-1 text-center text-sm font-semibold rounded-full transition-colors duration-300 relative z-10"
                    style={{
                        color: opt.value === value ? theme.colors.accent : theme.colors.textSecondary,
                    }}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
};

const {
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
    INITIAL_OPPORTUNITIES,
    STAGES,
    STAGE_COLORS,
    SAMPLE_CATEGORIES,
    SAMPLE_PRODUCTS,
    MENU_ITEMS,
    ORDER_DATA,
    YTD_SALES_DATA,
    MONTHLY_SALES_DATA,
    SALES_VERTICALS_DATA,
    INITIAL_POSTS,
    INITIAL_WINS,
    INITIAL_POLLS,
    INITIAL_MEMBERS,
    PERMISSION_LABELS,
    USER_TITLES,
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

export const LeadTimesScreen = ({ theme = {} }) => {
    // State and hooks
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

    const rows = useMemo(() => {
        const map = {};
        // Process data to group types under each series
        LEAD_TIMES_DATA.forEach(({ series, type, weeks, image }) => {
            if (!map[series]) {
                map[series] = { types: {} };
            }
            // Store the weeks and the specific image for each type
            map[series].types[type] = { weeks, image };
        });

        let list = Object.entries(map).map(([series, data]) => ({
            series,
            types: data.types,
        }));

        // Filtering and sorting logic
        if (filterCategory === 'upholstered') {
            list = list.filter(r => r.types.Upholstery != null);
        } else if (filterCategory === 'wood') {
            list = list.filter(r => r.types['Wood Seating'] != null);
        } else if (filterCategory === 'casegoods') {
            list = list.filter(r => r.types.Casegoods != null || r.types.Laminate != null || r.types.Veneer != null || r.types.Tables != null);
        }
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(r => r.series.toLowerCase().includes(q));
        }
        if (sortFastest) {
            list.sort((a, b) => {
                const aMin = Math.min(...Object.values(a.types).map(t => t.weeks));
                const bMin = Math.min(...Object.values(b.types).map(t => t.weeks));
                return aMin - bMin;
            });
        }
        return list;
    }, [searchTerm, filterCategory, sortFastest]);

    const LVLabel = ({ label }) => (
        <span className="text-xs font-bold" style={{ color: theme.colors.textSecondary }}>{label}</span>
    );

    // Updated component with a light grey circle for the number
    const LeadTimeInfo = ({ typeData, theme }) => (
        <div className="relative w-28 h-28">
            <img
                src={typeData.image}
                alt=""
                className="w-full h-full object-contain"
            />
            <div
                className="absolute bottom-1 right-1 h-9 w-9 flex items-center justify-center rounded-full shadow-md"
                style={{ backgroundColor: theme.colors.subtle }}
            >
                <span className="text-lg font-bold" style={{ color: theme.colors.textSecondary }}>
                    {typeData.weeks}
                </span>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            <PageTitle title="Lead Times" theme={theme} />

            <div className="px-4 pb-4 flex items-center space-x-2">
                <SearchInput className="flex-grow" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by series name…" theme={theme} />
                <div className="relative">
                    <button onClick={() => setDropdownOpen(o => !o)} className="p-3.5 rounded-lg" style={{ backgroundColor: theme.colors.subtle }}>
                        <Filter className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
                    </button>
                    {dropdownOpen && (
                        <GlassCard ref={filterMenuRef} theme={theme} className="absolute top-14 right-0 z-10 w-48 p-2">
                            <label className="flex items-center w-full px-2 py-1.5 text-sm rounded-md cursor-pointer" style={{ color: theme.colors.textPrimary }}>
                                <input type="checkbox" checked={sortFastest} onChange={() => setSortFastest(f => !f)} className="form-checkbox h-4 w-4 mr-3" style={{ color: theme.colors.accent }} />
                                Sort by fastest
                            </label>
                            <div className="border-t my-1" style={{ borderColor: theme.colors.subtle }} />
                            {[{ key: 'all', label: 'All' }, { key: 'upholstered', label: 'Upholstered' }, { key: 'wood', label: 'Wood Seating' }, { key: 'casegoods', label: 'Casegoods' }].map(opt => (
                                <button
                                    key={opt.key}
                                    onClick={() => { setFilterCategory(opt.key); setDropdownOpen(false); }}
                                    className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${filterCategory === opt.key ? 'font-bold' : ''}`}
                                    style={{ color: theme.colors.textPrimary, backgroundColor: filterCategory === opt.key ? theme.colors.subtle : 'transparent' }}
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
                    <GlassCard key={series} theme={theme} className="px-6 py-2 flex items-center justify-between min-h-[9rem]">
                        <h3 className="text-2xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                            {series}
                        </h3>
                        {/* This container now has a fixed width and justifies its content to the right */}
                        <div className="flex items-center justify-end space-x-6 w-[17rem]">
                            {types['Upholstery'] && <LeadTimeInfo typeData={types['Upholstery']} theme={theme} />}
                            {types['Seating'] && <LeadTimeInfo typeData={types['Seating']} theme={theme} />}
                            {types['Wood Seating'] && <LeadTimeInfo typeData={types['Wood Seating']} theme={theme} />}
                            {types['Casegoods'] && <LeadTimeInfo typeData={types['Casegoods']} theme={theme} />}
                            {types['Tables'] && <LeadTimeInfo typeData={types['Tables']} theme={theme} />}
                            {types['Laminate'] && (
                                <div className="relative w-28 h-28 text-center">
                                    <LVLabel label="Laminate" />
                                    <img src={types['Laminate'].image} alt="Laminate" className="w-full h-full object-contain" />
                                    <div className="absolute bottom-1 right-1 h-9 w-9 flex items-center justify-center rounded-full shadow-md" style={{ backgroundColor: theme.colors.subtle }}>
                                        <span className="text-lg font-bold" style={{ color: theme.colors.textSecondary }}>
                                            {types['Laminate'].weeks}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {types['Veneer'] && (
                                <div className="relative w-28 h-28 text-center">
                                    <LVLabel label="Veneer" />
                                    <img src={types['Veneer'].image} alt="Veneer" className="w-full h-full object-contain" />
                                    <div className="absolute bottom-1 right-1 h-9 w-9 flex items-center justify-center rounded-full shadow-md" style={{ backgroundColor: theme.colors.subtle }}>
                                        <span className="text-lg font-bold" style={{ color: theme.colors.textSecondary }}>
                                            {types['Veneer'].weeks}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
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

export const GroupedToggle = ({ value, onChange, options, theme }) => {
  return (
    <div
      className="w-full flex rounded-full p-1.5"
      style={{ backgroundColor: theme.colors.subtle }}
    >
      {options.map((opt, idx) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="flex-1 relative py-3 px-2 text-center text-base font-bold rounded-full transition-all duration-200 ease-out"
          style={{
            color:
              value === opt.value
                ? theme.colors.accent
                : theme.colors.textSecondary,
            backgroundColor:
              value === opt.value
                ? theme.colors.surface
                : 'transparent',
            boxShadow:
              value === opt.value
                ? `0 2px 8px ${theme.colors.shadow}`
                : 'none',
            border:
              value === opt.value
                ? `1px solid ${theme.colors.border}`
                : '1px solid transparent',
          }}
        >
          {opt.label}
        </button>
      ))}
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

export const DiscontinuedFinishesScreen = ({ theme, onNavigate, onUpdateCart }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFinish, setSelectedFinish] = useState(null);

    const formatFinishName = (name) => {
        if (!name) return '';
        return name.split(' ').map((word, index) =>
            index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()
        ).join(' ');
    };

    const groupedFinishes = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase().trim();
        const filtered = Data.DISCONTINUED_FINISHES.filter(finish =>
            finish.oldName.toLowerCase().includes(lowercasedFilter) ||
            finish.newName.toLowerCase().includes(lowercasedFilter) ||
            finish.category.toLowerCase().includes(lowercasedFilter)
        );

        return filtered.reduce((acc, finish) => {
            const { category } = finish;
            if (!acc[category]) acc[category] = [];
            acc[category].push(finish);
            return acc;
        }, {});
    }, [searchTerm]);

    const handleOrderClick = () => {
        if (!selectedFinish) return;
        const newItem = {
            id: `sample-${selectedFinish.newName.toLowerCase().replace(/\s/g, '-')}`,
            name: formatFinishName(selectedFinish.newName),
            category: selectedFinish.category,
            color: selectedFinish.newColor,
        };
        onUpdateCart(newItem, 1);
        setSelectedFinish(null);
        onNavigate('samples');
    };

    // A new sub-component for rendering each row cleanly
    const FinishRow = ({ finish, isLast }) => (
        <button
            onClick={() => setSelectedFinish(finish)}
            className={`w-full text-left p-3 transition-colors hover:bg-black/5 rounded-2xl ${!isLast ? 'border-b' : ''}`}
            style={{ borderColor: theme.colors.subtle }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 w-[45%]">
                    <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: finish.oldColor, border: `1px solid ${theme.colors.border}` }} />
                    <div className="min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: theme.colors.textPrimary }}>{formatFinishName(finish.oldName)}</p>
                        <p className="font-mono text-xs" style={{ color: theme.colors.textSecondary }}>{finish.veneer}</p>
                    </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex items-center space-x-4 w-[45%]">
                    <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: finish.newColor, border: `1px solid ${theme.colors.border}` }} />
                    <div className="min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: theme.colors.textPrimary }}>{formatFinishName(finish.newName)}</p>
                        <p className="font-mono text-xs" style={{ color: theme.colors.textSecondary }}>{finish.veneer}</p>
                    </div>
                </div>
            </div>
        </button>
    );

    return (
        <div className="h-full flex flex-col">
            <PageTitle title="Discontinued Finishes" theme={theme} />
            <div className="px-4 pt-2 pb-4 sticky top-0 z-10" style={{ backgroundColor: `${theme.colors.background}e0`, backdropFilter: 'blur(10px)' }}>
                <SearchInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or category..."
                    theme={theme}
                />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
                {Object.keys(groupedFinishes).length > 0 ? (
                    Object.entries(groupedFinishes).map(([category, finishes]) => (
                        <section key={category} className="mb-6">
                            <h2 className="text-2xl font-bold capitalize mb-3 px-1" style={{ color: theme.colors.textPrimary }}>
                                {category}
                            </h2>
                            <GlassCard theme={theme} className="p-2 space-y-1">
                                {finishes.map((finish, index) => (
                                    <FinishRow
                                        key={`${finish.oldName}-${index}`}
                                        finish={finish}
                                        isLast={index === finishes.length - 1}
                                    />
                                ))}
                            </GlassCard>
                        </section>
                    ))
                ) : (
                    <GlassCard theme={theme} className="p-8 text-center mt-4">
                        <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>No Results Found</p>
                        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Could not find any finishes matching "{searchTerm}".</p>
                    </GlassCard>
                )}
            </div>
            <Modal show={!!selectedFinish} onClose={() => setSelectedFinish(null)} title="Order Sample" theme={theme}>
                <p style={{ color: theme.colors.textPrimary }}>
                    Would you like to order a sample of the new replacement finish, <span className="font-bold">{formatFinishName(selectedFinish?.newName)}</span>?
                </p>
                <div className="flex justify-end space-x-3 pt-4 mt-4 border-t" style={{ borderColor: theme.colors.border }}>
                    <button onClick={() => setSelectedFinish(null)} className="font-bold py-2 px-5 rounded-lg" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>Cancel</button>
                    <button onClick={handleOrderClick} className="font-bold py-2 px-5 rounded-lg text-white" style={{ backgroundColor: theme.colors.accent }}>Order Sample</button>
                </div>
            </Modal>
        </div>
    );
};

export const DesignDaysScreen = ({ theme }) => {
    // Hard-coded schedule and transport data from the site
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
                    Join us June 9–11, 2025 at 345 N Morgan, 6th Floor, for Design Days. Our showroom will be filled with new launches, design moments, and plenty of surprises to spark connection, creativity, and joy.
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
                {/* FIX: The `index` variable is now correctly defined for the key prop */}
                {schedule.map((block, index) => (
                    <GlassCard key={index} theme={theme} className="p-4 space-y-2">
                        <p className="font-medium" style={{ color: theme.colors.textSecondary }}>
                            {block.days.join(' and ')}
                        </p>
                        {block.events.map((evt, eventIndex) => (
                            <p key={eventIndex} style={{ color: theme.colors.textPrimary }}>{evt}</p>
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
                {/* FIX: The `index` variable is now correctly defined for the key prop */}
                {transport.map(({ icon: Icon, title, desc }, index) => (
                    <GlassCard key={index} theme={theme} className="p-4 flex items-start space-x-3">
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
                    Step into stillness. Win a 4-day, 3-night escape for two to Iceland—a boutique stay at Eyja Hotel, spa day at Blue Lagoon, plus a $1,000 flight voucher. Must be present to enter. Stop by our showroom for details.
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

export const ContractsScreen = ({ theme, setSuccessMessage }) => {
    const [activeContract, setActiveContract] = useState('omnia');

    const contracts = useMemo(() => ({
        omnia: CONTRACTS_DATA.omnia,
        tips: CONTRACTS_DATA.tips,
        premier: CONTRACTS_DATA.premier,
    }), []);

    // A new, highly-styled component to display the details of the selected contract
    const ContractDetails = ({ contract, theme }) => {

        const handleShare = async () => {
            const shareText = `Check out the JSI ${contract.name} contract details.`;
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: `${contract.name} Contract Details`,
                        text: shareText,
                        url: window.location.href,
                    });
                } catch (error) {
                    console.error('Error sharing:', error);
                }
            } else {
                navigator.clipboard.writeText(shareText);
                setSuccessMessage("Content copied to clipboard!");
                setTimeout(() => setSuccessMessage(""), 2000);
            }
        };

        return (
            <GlassCard theme={theme} className="p-4 space-y-5 animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-center px-2">
                    <h2 className="text-3xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                        {contract.name}
                    </h2>
                    <button onClick={handleShare} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                        <Share2 className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    </button>
                </div>

                {/* Tiers */}
                <div className="space-y-3">
                    {contract.tiers.map((tier, i) => (
                        <div key={i} className="rounded-2xl p-4 flex items-center space-x-4" style={{ backgroundColor: theme.colors.subtle }}>
                            <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-full border-4" style={{ borderColor: theme.colors.accent, color: theme.colors.accent }}>
                                <span className="text-4xl font-bold tracking-tighter">{tier.off.split(' ')[0]}</span>
                                <span className="text-xs font-bold uppercase tracking-wider -mt-1">OFF</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                                    {tier.off.substring(tier.off.indexOf("(") + 1, tier.off.lastIndexOf(")"))}
                                </p>
                                <div className="mt-2 pt-2 border-t" style={{ borderColor: theme.colors.border }}>
                                    <div className="flex justify-between text-sm">
                                        <span style={{ color: theme.colors.textSecondary }}>Dealer commission</span>
                                        <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{tier.dealer.replace(' dealer commission', '')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span style={{ color: theme.colors.textSecondary }}>Rep commission</span>
                                        <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{tier.rep.replace(' rep commission', '')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Margin/Notes Section */}
                {(contract.margin || contract.note) && (
                    <div className="text-sm space-y-3 pt-3 border-t" style={{ borderColor: theme.colors.subtle }}>
                        {contract.margin && (
                            <div className="px-2">
                                <p className="font-bold mb-1" style={{ color: theme.colors.textPrimary }}>
                                    Dealer Margin Discount
                                </p>
                                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                    {contract.margin.join('  •  ')}
                                </p>
                            </div>
                        )}
                        {contract.note && (
                            <p className="italic px-2" style={{ color: theme.colors.textSecondary }}>
                                {contract.note}
                            </p>
                        )}
                    </div>
                )}

                {/* Link Button */}
                <div className="pt-2">
                    <button
                        onClick={() => window.open(contract.url, '_blank')}
                        className="w-full font-bold py-3 px-5 rounded-full flex items-center justify-center space-x-2 transition-transform hover:scale-105 active:scale-95"
                        style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                    >
                        <span>View Full Contract</span>
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </GlassCard>
        );
    }

    return (
        <div className="px-4 py-6 space-y-4">
            <ToggleButtonGroup
                value={activeContract}
                onChange={setActiveContract}
                options={[
                    { label: "Omnia", value: "omnia" },
                    { label: "TIPS", value: "tips" },
                    { label: "Premier", value: "premier" },
                ]}
                theme={theme}
            />

            <ContractDetails contract={contracts[activeContract]} theme={theme} />
        </div>
    );
};

const EditablePersonRow = ({ person, theme, onUpdateRole, onRemovePerson }) => {
    const [isEditing, setIsEditing] = useState(false); // State to control editing mode

    const roleOptions = useMemo(() => [
        { label: 'Administrator', value: 'Administrator' },
        { label: 'Admin/Sales Support', value: 'Admin/Sales Support' },
        { label: 'Sales', value: 'Sales' },
        { label: 'Designer', value: 'Designer' },
        { label: 'Sales/Designer', value: 'Sales/Designer' },
        { label: 'Installer', value: 'Installer' }
    ], []);

    const handleRoleChange = (e) => {
        onUpdateRole(person.name, e.target.value);
        setIsEditing(false); // Close editing mode after selection
    };

    return (
        <button
            onClick={() => setIsEditing(!isEditing)} // Make the whole row clickable to toggle editing
            className="w-full flex flex-col items-start px-3 py-2 rounded-full transition-all duration-200"
            style={{
                backgroundColor: isEditing ? theme.colors.subtle : 'transparent', // Subtle background when editing, transparent when not
            }}
        >
            <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-base" style={{ color: theme.colors.textPrimary }}>
                    {person.name}
                </span>
                {person.status === 'pending' && <Hourglass className="w-3 h-3 text-amber-500 ml-2" />}
            </div>

            {isEditing && (
                <div className="flex items-center space-x-2 animate-fade-in w-full mt-2">
                    <PortalNativeSelect
                        label="" // Keep label empty for subliminal style
                        value={person.roleLabel}
                        onChange={handleRoleChange}
                        options={roleOptions}
                        theme={theme}
                        placeholder="Change Role"
                    />
                    <button onClick={(e) => { e.stopPropagation(); onRemovePerson(person.name); }} className="p-2 rounded-full hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                </div>
            )}
        </button>
    );
};


const PopoverPortal = ({ anchorEl, onClose, children }) => {
    const popoverRef = useRef(null);
    const [position, setPosition] = useState({ top: -9999, left: -9999 });

    // This effect calculates the correct position next to the clicked element
    useLayoutEffect(() => {
        if (anchorEl && popoverRef.current) {
            const anchorRect = anchorEl.getBoundingClientRect();
            const popoverRect = popoverRef.current.getBoundingClientRect();

            let top = anchorRect.bottom + 8;
            let left = anchorRect.right - popoverRect.width;

            // Prevent vertical overflow
            if (top + popoverRect.height > window.innerHeight - 20) {
                top = anchorRect.top - popoverRect.height - 8;
            }
            // Prevent horizontal overflow
            if (left < 20) {
                left = 20;
            }
            if (left + popoverRect.width > window.innerWidth - 20) {
                left = window.innerWidth - popoverRect.width - 20;
            }

            setPosition({ top, left });
        }
    }, [anchorEl]);

    // Handles closing the menu when clicking outside of it
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target) && !anchorEl.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [anchorEl, onClose]);

    return ReactDOM.createPortal(
        <div ref={popoverRef} className="fixed z-[1001] animate-fade-in" style={{ top: position.top, left: position.left }}>
            {children}
        </div>,
        document.body
    );
};

export const DealerDirectoryScreen = ({ theme, showAlert, setSuccessMessage, dealers }) => {
    const [localDealers, setLocalDealers] = useState(dealers);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDealer, setSelectedDealer] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'name' });
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const filterMenuRef = useRef(null);
    const [pendingDiscountChange, setPendingDiscountChange] = useState(null);
    const [showAddPersonModal, setShowAddPersonModal] = useState(false);
    const [newPerson, setNewPerson] = useState({ firstName: '', lastName: '', email: '', role: 'Sales' });

    const [menuState, setMenuState] = useState({ open: false, person: null, top: 0, left: 0 });
    const modalContentRef = useRef(null);

    useEffect(() => {
        setLocalDealers(dealers);
    }, [dealers]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) setShowFilterMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sortedAndFilteredDealers = useMemo(() => {
        return localDealers
            .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || (d.address && d.address.toLowerCase().includes(searchTerm.toLowerCase())))
            .sort((a, b) => {
                if (sortConfig.key === 'name') return a.name.localeCompare(b.name);
                return (b[sortConfig.key] || 0) - (a[sortConfig.key] || 0);
            });
    }, [localDealers, searchTerm, sortConfig]);

    const confirmDiscountChange = () => {
        if (!pendingDiscountChange) return;
        const { dealerId, newDiscount } = pendingDiscountChange;
        setLocalDealers(curr => curr.map(d => d.id === dealerId ? { ...d, dailyDiscount: newDiscount } : d));
        setSelectedDealer(prev => prev && prev.id === dealerId ? { ...prev, dailyDiscount: newDiscount } : prev);
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

        const roleKeyMap = { 'Administrator': 'administration', 'Admin/Sales Support': 'administration', 'Sales': 'salespeople', 'Designer': 'designers', 'Sales/Designer': 'salespeople', 'Installer': 'installers' };
        const targetRoleKey = roleKeyMap[role] || 'salespeople';
        const person = { name: `${firstName} ${lastName}`, email: email, status: 'pending', roleLabel: role };
        const updatedDealer = { ...selectedDealer, [targetRoleKey]: [...(selectedDealer[targetRoleKey] || []), person] };
        setLocalDealers(curr => curr.map(d => d.id === selectedDealer.id ? updatedDealer : d));
        setSelectedDealer(updatedDealer);
        setShowAddPersonModal(false);
        setNewPerson({ firstName: '', lastName: '', email: '', role: 'Sales' });
        setSuccessMessage(`Invitation sent to ${email}`);
        setTimeout(() => setSuccessMessage(""), 2000);
    };

    const handleUpdatePersonRole = useCallback((personToUpdate, newRoleLabel) => {
        if (!selectedDealer) return;
        const roleKeyMap = { 'Administrator': 'administration', 'Admin/Sales Support': 'administration', 'Sales': 'salespeople', 'Designer': 'designers', 'Sales/Designer': 'salespeople', 'Installer': 'installers' };
        const newCategoryKey = roleKeyMap[newRoleLabel];
        let personFound = false;
        const tempDealer = JSON.parse(JSON.stringify(selectedDealer));

        for (const category of ['salespeople', 'designers', 'administration', 'installers']) {
            const personIndex = (tempDealer[category] || []).findIndex(p => p.name === personToUpdate.name);
            if (personIndex > -1) {
                const person = tempDealer[category][personIndex];
                person.roleLabel = newRoleLabel;
                if (category !== newCategoryKey) {
                    tempDealer[category].splice(personIndex, 1);
                    if (!tempDealer[newCategoryKey]) tempDealer[newCategoryKey] = [];
                    tempDealer[newCategoryKey].push(person);
                }
                personFound = true;
                break;
            }
        }

        if (personFound) {
            setLocalDealers(prev => prev.map(d => d.id === tempDealer.id ? tempDealer : d));
            setSelectedDealer(tempDealer);
            setSuccessMessage("Role Updated!");
            setTimeout(() => setSuccessMessage(""), 1000);
        }
        setMenuState({ open: false, person: null, top: 0, left: 0 });
    }, [selectedDealer, setLocalDealers]);

    const handleRemovePerson = useCallback((personName) => {
        if (!selectedDealer) return;
        const updatedDealer = { ...selectedDealer };
        ['salespeople', 'designers', 'administration', 'installers'].forEach(category => {
            if (updatedDealer[category]) {
                updatedDealer[category] = updatedDealer[category].filter(p => p.name !== personName);
            }
        });
        setLocalDealers(prev => prev.map(d => d.id === updatedDealer.id ? updatedDealer : d));
        setSelectedDealer(updatedDealer);
        setMenuState({ open: false, person: null, top: 0, left: 0 });
        setSuccessMessage("Person Removed!");
        setTimeout(() => setSuccessMessage(""), 1000);
    }, [selectedDealer, setLocalDealers]);

    const handleMenuOpen = (event, person) => {
        event.stopPropagation();
        const button = event.currentTarget;
        const container = modalContentRef.current;
        if (!container) return;
        const buttonRect = button.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const top = buttonRect.top - containerRect.top + button.offsetHeight;
        const left = buttonRect.left - containerRect.left + button.offsetWidth - 224;
        setMenuState({ open: true, person: person, top, left });
    };

    const handleMenuClose = () => setMenuState({ open: false, person: null, top: 0, left: 0 });
    const ModalSectionHeader = ({ title }) => <p className="font-bold text-lg pt-4 pb-2" style={{ color: theme.colors.textPrimary }}>{title}</p>;
    const roleOptions = useMemo(() => [
        { label: 'Administrator', value: 'Administrator' }, { label: 'Admin/Sales Support', value: 'Admin/Sales Support' },
        { label: 'Sales', value: 'Sales' }, { label: 'Designer', value: 'Designer' },
        { label: 'Sales/Designer', value: 'Sales/Designer' }, { label: 'Installer', value: 'Installer' }
    ], []);

    const StaffSection = ({ title, members }) => (
        <div>
            <ModalSectionHeader title={title} />
            {members && members.length > 0 ? (
                <div className="border-t" style={{ borderColor: theme.colors.subtle }}>
                    {members.map(m => (
                        <div key={m.name} className="flex justify-between items-center py-2 px-2 border-b" style={{ borderColor: theme.colors.subtle }}>
                            <div>
                                <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>{m.name}</p>
                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                    {m.status === 'pending' ? <span className="font-semibold text-amber-500">Pending Invitation</span> : m.email}
                                </p>
                            </div>
                            <button onClick={(e) => handleMenuOpen(e, m)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                                <MoreVertical className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : <p className="text-sm px-2 py-1" style={{ color: theme.colors.textSecondary }}>None listed.</p>}
        </div>
    );

    return (
        <>
            <PageTitle title="Dealer Directory" theme={theme} />
            <div className="px-4 pb-4 flex items-center space-x-2">
                <SearchInput className="flex-grow" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name or city..." theme={theme} />
                <div className="relative">
                    <button onClick={() => setShowFilterMenu(f => !f)} className="p-3.5 rounded-lg" style={{ backgroundColor: theme.colors.subtle }}><Filter className="w-5 h-5" style={{ color: theme.colors.textPrimary }} /></button>
                    {showFilterMenu && (<GlassCard ref={filterMenuRef} theme={theme} className="absolute top-14 right-0 z-10 w-40 p-2"><button onClick={() => handleSort('name')} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${sortConfig.key === 'name' ? 'font-bold' : ''}`} style={{ color: theme.colors.textPrimary, backgroundColor: sortConfig.key === 'name' ? theme.colors.subtle : 'transparent' }}> A-Z </button><button onClick={() => handleSort('sales')} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${sortConfig.key === 'sales' ? 'font-bold' : ''}`} style={{ color: theme.colors.textPrimary, backgroundColor: sortConfig.key === 'sales' ? theme.colors.subtle : 'transparent' }}> By Sales </button><button onClick={() => handleSort('bookings')} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${sortConfig.key === 'bookings' ? 'font-bold' : ''}`} style={{ color: theme.colors.textPrimary, backgroundColor: sortConfig.key === 'bookings' ? theme.colors.subtle : 'transparent' }}> By Bookings </button></GlassCard>)}
                </div>
            </div>
            <div className="px-4 space-y-3 pb-4">
                {sortedAndFilteredDealers.map(dealer => (<GlassCard key={dealer.id} theme={theme} className="p-4 cursor-pointer hover:border-gray-400/50" onClick={() => { setSelectedDealer(dealer); }}><div className="flex justify-between items-start"><div><h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{dealer.name}</h3><p className="text-sm" style={{ color: theme.colors.textSecondary }}>{dealer.address}</p></div><div className="text-right flex-shrink-0 ml-2"><p className="text-xs font-semibold capitalize" style={{ color: theme.colors.textSecondary }}>{sortConfig.key}</p><p className="font-bold" style={{ color: theme.colors.textPrimary }}>${(dealer[sortConfig.key === 'name' ? 'bookings' : sortConfig.key] || 0).toLocaleString()}</p></div></div></GlassCard>))}
            </div>

            <Modal show={!!selectedDealer} onClose={() => setSelectedDealer(null)} title={selectedDealer?.name || ''} theme={theme}>
                {selectedDealer && (
                    <div ref={modalContentRef} className="relative">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{selectedDealer.address}</p>
                            <button onClick={() => setShowAddPersonModal(true)} className="p-2 -mr-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><UserPlus className="w-5 h-5" style={{ color: theme.colors.accent }} /></button>
                        </div>

                        {/* Daily Discount section is restored here */}
                        <div className="space-y-2">
                            <ModalSectionHeader title="Daily Discount" />
                            <PortalNativeSelect
                                label=""
                                theme={theme}
                                value={selectedDealer.dailyDiscount}
                                onChange={e => setPendingDiscountChange({ dealerId: selectedDealer.id, newDiscount: e.target.value })}
                                options={Data.DAILY_DISCOUNT_OPTIONS.map(opt => ({ label: opt, value: opt }))}
                            />
                        </div>

                        {/* The staff list is now in a single column */}
                        <div className="space-y-4">
                            <StaffSection title="Salespeople" members={selectedDealer.salespeople} />
                            <StaffSection title="Designers" members={selectedDealer.designers} />
                            <StaffSection title="Administration" members={selectedDealer.administration} />
                            <StaffSection title="Installers" members={selectedDealer.installers} />
                        </div>

                        {menuState.open && (
                            <>
                                <div className="absolute inset-0 z-10 -m-6" onClick={handleMenuClose} />
                                <div className="absolute z-20 animate-fade-in" style={{ top: menuState.top, left: menuState.left }}>
                                    <GlassCard theme={theme} className="p-1 w-56">
                                        <div className="px-2 py-1 text-xs font-bold uppercase" style={{ color: theme.colors.textSecondary }}>Change Role</div>
                                        {roleOptions.map(opt => (
                                            <button key={opt.value} onClick={() => handleUpdatePersonRole(menuState.person, opt.value)} className="w-full flex justify-between items-center text-left py-2 px-2 text-sm font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                                                <span style={{ color: menuState.person.roleLabel === opt.value ? theme.colors.accent : theme.colors.textPrimary }}>{opt.label}</span>
                                                {menuState.person.roleLabel === opt.value && <CheckCircle className="w-4 h-4" style={{ color: theme.colors.accent }} />}
                                            </button>
                                        ))}
                                        <div className="border-t my-1 mx-2" style={{ borderColor: theme.colors.subtle }} />
                                        <button onClick={() => handleRemovePerson(menuState.person.name)} className="w-full flex items-center text-left py-2 px-2 text-sm font-semibold rounded-lg text-red-600 hover:bg-red-500/10">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Remove Person
                                        </button>
                                    </GlassCard>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>

            <Modal show={!!pendingDiscountChange} onClose={() => setPendingDiscountChange(null)} title="Confirm Change" theme={theme}><p style={{ color: theme.colors.textPrimary }}>Are you sure you want to change the daily discount to <span className="font-bold">{pendingDiscountChange?.newDiscount}</span>?</p><div className="flex justify-end space-x-3 pt-4"><button onClick={() => setPendingDiscountChange(null)} className="font-bold py-2 px-5 rounded-lg" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>Cancel</button><button onClick={confirmDiscountChange} className="font-bold py-2 px-5 rounded-lg text-white" style={{ backgroundColor: theme.colors.accent }}>Save</button></div></Modal>
            <Modal show={showAddPersonModal} onClose={() => setShowAddPersonModal(false)} title="Add New Person" theme={theme}><form onSubmit={handleAddPerson} className="space-y-4"><FormInput label="First Name" value={newPerson.firstName} onChange={e => setNewPerson(p => ({ ...p, firstName: e.target.value }))} theme={theme} required /><FormInput label="Last Name" value={newPerson.lastName} onChange={e => setNewPerson(p => ({ ...p, lastName: e.target.value }))} theme={theme} required /><FormInput label="Email" type="email" value={newPerson.email} onChange={e => setNewPerson(p => ({ ...p, email: e.target.value }))} theme={theme} required /><PortalNativeSelect label="Role" value={newPerson.role} onChange={e => setNewPerson(p => ({ ...p, role: e.target.value }))} theme={theme} options={roleOptions} /><div className="pt-2 text-center"><p className="text-xs mb-2" style={{ color: theme.colors.textSecondary }}>This will send an invitation to the user to join the MyJSI app.</p><button type="submit" className="w-full font-bold py-3 px-6 rounded-full text-white" style={{ backgroundColor: theme.colors.accent }} > Send Invite </button></div></form></Modal>
        </>
    );
};

const CommissionRatesScreen = ({ theme }) => {
    const rows = useMemo(() => {
        const tag = (d, isContract = false) => ({ ...d, isContract });
        return [
            ...COMMISSION_RATES_TABLE_DATA.standard.map(d => tag(d)),
            ...COMMISSION_RATES_TABLE_DATA.contract.map(d => tag(d, true)),
        ];
    }, []);

    const split = { specifying: 70, ordering: 30 };

    const { subtle, surface, accent, secondary, textPrimary, textSecondary } =
        theme.colors;
    const zebra = i => (i % 2 ? surface : 'transparent');
    const contractBg = `${accent}1A`;

    return (
        <div className="px-4 pb-8 space-y-4">
            <PageTitle title="Commission Rates" theme={theme} />

            <GlassCard
                theme={theme}
                className="p-0 overflow-hidden rounded-2xl shadow ring-1 ring-black/5"
            >
                <table className="w-full text-sm">
                    <thead>
                        <tr
                            style={{ backgroundColor: subtle, color: textPrimary }}
                            className="uppercase text-[11px] tracking-wide"
                        >
                            <th className="py-2.5 pl-4 text-left">Discounts</th>
                            <th className="py-2.5 text-center">Rep&nbsp;Comm.</th>
                            <th className="py-2.5 pr-4 text-right">Spiff</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr
                                key={r.discount}
                                style={{ backgroundColor: r.isContract ? contractBg : zebra(i) }}
                            >
                                <td
                                    className="py-2.5 pl-4 font-medium break-all"
                                    style={{ color: textPrimary }}
                                >
                                    {r.discount}
                                </td>
                                <td
                                    className="py-2.5 text-center font-semibold"
                                    style={{ color: accent }}
                                >
                                    {r.rep}
                                </td>
                                <td className="py-2.5 pr-4 text-right">
                                    <span className="font-medium" style={{ color: textPrimary }}>
                                        {typeof r.spiff === 'object' ? r.spiff.value : r.spiff}
                                    </span>
                                    {typeof r.spiff === 'object' && (
                                        <div
                                            className="text-[11px] italic"
                                            style={{ color: textSecondary }}
                                        >
                                            {r.spiff.note}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </GlassCard>

            <GlassCard
                theme={theme}
                className="p-6 rounded-2xl shadow ring-1 ring-black/5"
            >
                <h3
                    className="mb-3 font-bold uppercase text-center tracking-wide text-[12px]"
                    style={{ color: textSecondary }}
                >
                    Commission Split
                </h3>

                <div className="w-full h-6 flex rounded-full overflow-hidden ring-1 ring-black/5">
                    <div
                        className="flex items-center pl-2 text-[11px] font-semibold text-white"
                        style={{
                            width: `${split.specifying}%`,
                            backgroundColor: accent,
                        }}
                    >
                        {split.specifying}%
                    </div>
                    <div
                        className="flex items-center justify-end pr-2 text-[11px] font-semibold text-white"
                        style={{
                            width: `${split.ordering}%`,
                            backgroundColor: secondary,
                        }}
                    >
                        {split.ordering}%
                    </div>
                </div>

                <div className="mt-2 flex justify-between text-[12px] font-medium">
                    <span style={{ color: textSecondary }}>Specifying</span>
                    <span style={{ color: textSecondary }}>Ordering</span>
                </div>
            </GlassCard>
        </div>
    );
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
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        options={years.map(y => ({ value: y, label: y }))}
                        theme={theme}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 scrollbar-hide">
                {monthlyData.map((check, index) => (
                    <GlassCard
                        key={check.month}
                        theme={theme}
                        className="p-4 cursor-pointer hover:border-gray-400/50" // Apply card styling to the whole month section
                    >
                        <div
                            onClick={() => toggleMonth(check.month)}
                            className="flex justify-between items-center"
                        >
                            <div className="flex-1">
                                <div className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{check.month}</div>
                                <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Paid: {new Date(check.issuedDate).toLocaleDateString()}</div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="font-bold text-lg" style={{ color: theme.colors.accent }}>${check.amount.toLocaleString()}</span>
                                <ChevronDown className={`w-5 h-5 transition-transform ${expandedMonth === check.month ? 'rotate-180' : ''}`} style={{ color: theme.colors.textSecondary }} />
                            </div>
                        </div>

                        {expandedMonth === check.month && check.details && (
                            <div className="mt-4 pt-4 border-t animate-fade-in" style={{ borderColor: theme.colors.border }}> {/* Add top border for separation */}
                                {check.details.map((detail, dIndex) => {
                                    if (detail.invoices) {
                                        const totalCommission = detail.invoices.reduce((sum, inv) => sum + inv.commission, 0);
                                        const totalNetAmount = detail.invoices.reduce((sum, inv) => sum + inv.netAmount, 0);
                                        const avgRate = totalNetAmount > 0 ? ((totalCommission / totalNetAmount) * 100).toFixed(1) : '0.0';

                                        return (
                                            <div key={dIndex} className="space-y-2"> {/* Reduced space-y for tighter rows */}
                                                <div className="text-left font-semibold py-2 px-3" style={{ color: theme.colors.textSecondary, backgroundColor: theme.colors.subtle }}>
                                                    <div className="grid grid-cols-[2.5fr,1fr,1fr,0.8fr] gap-x-2"> {/* Adjusted grid for headers */}
                                                        <div>SO # / Project</div>
                                                        <div className="text-right">Net</div>
                                                        <div className="text-right">Comm.</div>
                                                        <div className="text-right">Rate</div>
                                                    </div>
                                                </div>
                                                {detail.invoices.map((inv, iIndex) => {
                                                    const commissionRate = inv.netAmount ? ((inv.commission / inv.netAmount) * 100).toFixed(1) : '0.0';
                                                    return (
                                                        <div
                                                            key={iIndex}
                                                            // Removed onClick handler as project name is now static
                                                            className={`transition-all duration-200 group relative p-3 rounded-xl`} // Changed to rounded-xl
                                                            style={{
                                                                marginTop: '0.25rem', // Small margin to separate rounded rows
                                                                marginBottom: '0.25rem',
                                                                backgroundColor: iIndex % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.03)' // Very light zebra striping
                                                            }}
                                                        >
                                                            <div className="grid grid-cols-[2.5fr,1fr,1fr,0.8fr] gap-x-2 items-center text-sm"> {/* Adjusted grid and font size */}
                                                                <div className="relative">
                                                                    <div className="font-medium break-words" style={{ color: theme.colors.textPrimary }}>{inv.so || inv.invoice}</div> {/* Changed to font-medium */}
                                                                    {/* Project name is now a static subtitle */}
                                                                    {inv.project && (
                                                                        <div className="text-xs mt-1 break-words" style={{ color: theme.colors.textSecondary }}>{inv.project}</div>
                                                                    )}
                                                                    {/* Removed ChevronDown icon */}
                                                                </div>
                                                                <div className="text-right font-medium" style={{ color: theme.colors.textPrimary }}>${inv.netAmount.toLocaleString()}</div> {/* Changed to font-medium */}
                                                                <div className="text-right font-bold" style={{ color: theme.colors.accent }}>${inv.commission.toLocaleString()}</div>
                                                                <div className="text-right font-medium" style={{ color: theme.colors.textPrimary }}>{commissionRate}%</div> {/* Changed to font-medium */}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {/* Average Rate Row */}
                                                <div className="font-semibold border-t pt-4 mt-4 text-right pr-2" style={{ borderColor: theme.colors.border }}> {/* Adjusted padding and font-semibold */}
                                                    <span style={{ color: theme.colors.textPrimary }}>Avg. Rate:</span>{' '}
                                                    <span className="font-bold" style={{ color: theme.colors.accent }}>{avgRate}%</span> {/* Bolded percentage */}
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
                                            <div key={dIndex} className="pt-4 mt-4 border-t" style={{ borderColor: theme.colors.border }}>
                                                <h4 className="font-bold text-lg mb-3 flex items-center" style={{ color: theme.colors.textPrimary }}>
                                                    <DollarSign className="w-5 h-5 mr-2" style={{ color: theme.colors.accent }} />
                                                    Totals
                                                </h4>
                                                <div className="space-y-2 text-base">
                                                    <div className="flex justify-between items-center">
                                                        <span style={{ color: theme.colors.textSecondary }}>Invoiced Total:</span>
                                                        <span className="font-medium" style={{ color: theme.colors.textPrimary }}>${detail.listTotal.toLocaleString()}</span> {/* Changed to font-medium */}
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span style={{ color: theme.colors.textSecondary }}>Commissioned Value:</span>
                                                        <span className="font-medium" style={{ color: theme.colors.textPrimary }}>${detail.netTotal.toLocaleString()}</span> {/* Changed to font-medium */}
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2 font-semibold" style={{ color: theme.colors.textPrimary }}>
                                                        <span>Commission Amount:</span>
                                                        <span className="text-lg font-bold" style={{ color: theme.colors.accent }}>${detail.commissionTotal.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        )}
                    </GlassCard>
                ))}
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

export const DealerRegistrationScreen = ({ theme, onNavigate, setSuccessMessage, onAddDealer }) => {
    const [dealerName, setDealerName] = useState('');
    const [email, setEmail] = useState('');
    const [dailyDiscount, setDailyDiscount] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // This is the initial submit handler for the main button
    const handleInitialSubmit = (e) => {
        e.preventDefault();
        // It now just opens the confirmation modal
        setShowConfirmModal(true);
    };

    // This function runs only after the user confirms in the modal
    const handleFinalSubmit = () => {
        // Call the new handler passed down from App.jsx
        onAddDealer({ dealerName, email, dailyDiscount });

        setShowConfirmModal(false); // Close the confirmation modal

        // Use the existing success message and navigation system
        setSuccessMessage("Dealer Registration Submitted!");
        setTimeout(() => {
            setSuccessMessage("");
            onNavigate('resources');
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full">
            <PageTitle title="New Dealer Sign-Up" theme={theme} />
            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
                <form onSubmit={handleInitialSubmit} className="space-y-4">
                    <GlassCard theme={theme} className="p-4 space-y-4">
                        <FormInput
                            label="Dealer Name"
                            value={dealerName}
                            onChange={(e) => setDealerName(e.target.value)}
                            placeholder="Enter dealer name"
                            theme={theme}
                            required
                        />
                        <FormInput
                            label="Admin Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter contact email address"
                            theme={theme}
                            required
                        />
                        <PortalNativeSelect
                            label="Daily Discount"
                            value={dailyDiscount}
                            onChange={(e) => setDailyDiscount(e.target.value)}
                            options={Data.DAILY_DISCOUNT_OPTIONS.map(opt => ({ label: opt, value: opt }))}
                            placeholder="Select a discount"
                            theme={theme}
                            required
                        />
                    </GlassCard>
                    <button
                        type="submit"
                        className="w-full font-bold py-3.5 px-6 rounded-full text-white"
                        style={{ backgroundColor: theme.colors.accent }}
                    >
                        Submit Registration
                    </button>
                </form>
            </div>

            {/* --- Confirmation Modal --- */}
            <Modal show={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm Registration" theme={theme}>
                <p style={{ color: theme.colors.textPrimary }}>
                    This will send the credit application and required documentation to the admin email provided:
                    <strong className="block text-center my-3 text-lg">{email}</strong>
                    Are you sure you want to proceed?
                </p>
                <div className="flex justify-end space-x-3 pt-4 mt-4 border-t" style={{ borderColor: theme.colors.border }}>
                    <button
                        type="button"
                        onClick={() => setShowConfirmModal(false)}
                        className="font-bold py-2 px-5 rounded-lg"
                        style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleFinalSubmit}
                        className="font-bold py-2 px-5 rounded-lg text-white"
                        style={{ backgroundColor: theme.colors.accent }}
                    >
                        Submit
                    </button>
                </div>
            </Modal>
        </div>
    );
};


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

            <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4 scrollbar-hide">
                {filteredLoaners.map(item => {
                    const isSelected = selectedLoaners.includes(item.id);
                    return (
                        <GlassCard
                            key={item.id}
                            theme={theme}
                            className="p-3 overflow-hidden cursor-pointer transition-all duration-300"
                            onClick={() => handleToggleLoaner(item.id)}
                            style={{
                                borderWidth: '2px',
                                borderColor: isSelected ? theme.colors.accent : 'transparent',
                                backgroundColor: '#FFFFFF', // Ensures tile is solid white
                            }}
                        >
                            <div className="flex space-x-4 items-start">
                                <img
                                    src={item.img}
                                    alt={item.name}
                                    className="w-24 h-24 object-cover rounded-xl flex-shrink-0" // More rounded border
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{item.name}</h4>
                                    <p className="text-sm font-mono" style={{ color: theme.colors.textSecondary }}>{item.model}</p>

                                    {/* This section now correctly appears only when an item is selected */}
                                    {isSelected && (
                                        <div className="mt-3 pt-3 border-t space-y-1 animate-fade-in" style={{ borderColor: theme.colors.subtle }}>
                                            <h4 className="text-sm font-bold pb-1" style={{ color: theme.colors.textPrimary }}>Specifications</h4>
                                            {Object.entries(item.specs).map(([key, value]) => (
                                                <div key={key} className="grid grid-cols-[auto,1fr] gap-x-3 text-sm">
                                                    <div className="font-medium" style={{ color: theme.colors.textSecondary }}>{key}:</div>
                                                    <div className="font-semibold text-right" style={{ color: theme.colors.textPrimary }}>{value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    );
                })}
            </div>

            <div className="px-4 space-y-3 pt-3 pb-4 sticky bottom-0 border-t" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
                <div className="flex justify-between items-center px-1">
                    <h3 className="font-bold" style={{ color: theme.colors.textPrimary }}>Requested:</h3>
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
        <GlassCard
            theme={theme}
            onClick={() => onSelect(item.id)}
            className="p-2 overflow-hidden cursor-pointer transition-all duration-300"
            style={{
                borderWidth: '2px',
                borderColor: isSelected ? theme.colors.accent : 'transparent'
            }}
        >
            <div className="flex space-x-3 items-start">
                {/* Image */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.img} alt={item.name} className="absolute w-full h-full object-cover" />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>{item.name}</h3>
                    <p className="font-mono text-xs" style={{ color: theme.colors.textSecondary }}>{item.model}</p>
                </div>

                {/* Specs always visible */}
                <div className="w-32 text-right space-y-0.5">
                    <h4 className="text-xs font-bold" style={{ color: theme.colors.textPrimary }}>Specifications</h4>
                    {Object.entries(item.specs).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-[auto,1fr] gap-x-1 text-xs">
                            <div className="font-medium" style={{ color: theme.colors.textSecondary }}>{key}:</div>
                            <div className="font-semibold" style={{ color: theme.colors.textPrimary }}>{value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </GlassCard>
    );
};


export const ResourceDetailScreen = ({ theme, onNavigate, setSuccessMessage, userSettings, showAlert, currentScreen, onUpdateCart, dealerDirectory, handleAddDealer }) => {
    // Extract the specific resource type from the URL-like path
    const category = currentScreen.split('/')[1]?.replace(/[_-]/g, ' ');

    switch (category) {
        // --- Rep Functions ---
        case 'commission rates':
            return <CommissionRatesScreen theme={theme} />;
        case 'loaner pool':
            return <LoanerPoolScreen theme={theme} onNavigate={onNavigate} setSuccessMessage={setSuccessMessage} userSettings={userSettings} />;
        case 'dealer registration':
            return <DealerRegistrationScreen theme={theme} onNavigate={onNavigate} setSuccessMessage={setSuccessMessage} onAddDealer={handleAddDealer} />;
        case 'request field visit':
            return <RequestFieldVisitScreen theme={theme} onNavigate={onNavigate} setSuccessMessage={setSuccessMessage} />;
        case 'sample discounts':
            return <SampleDiscountsScreen theme={theme} setSuccessMessage={setSuccessMessage} />;
        case 'dealer directory':
            return <DealerDirectoryScreen theme={theme} showAlert={showAlert} setSuccessMessage={setSuccessMessage} dealers={dealerDirectory} />;

        // --- Misc. Resources ---
        case 'contracts':
            return <ContractsScreen theme={theme} setSuccessMessage={setSuccessMessage} />;
        case 'design days':
            return <DesignDaysScreen theme={theme} />;
        case 'discontinued finishes':
            return <DiscontinuedFinishesScreen theme={theme} onNavigate={onNavigate} onUpdateCart={onUpdateCart} />;
        case 'install instructions':
            return <InstallInstructionsScreen theme={theme} />;
        case 'lead times':
            return <LeadTimesScreen theme={theme} />;
        case 'social media':
            return <SocialMediaScreen theme={theme} showAlert={showAlert} setSuccessMessage={setSuccessMessage} />;
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

        // --- Fallback for any other resource ---
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
const fabricTypeOptions = ['Type1', 'Type2', 'Type3'];
const tackableOptions = ['Yes', 'No'];

export const FabricSearchForm = ({ theme, showAlert, onNavigate }) => {
    const [form, setForm] = useState({ supplier: '', pattern: '', jsiSeries: '', grade: [], textile: 'Any', tackable: 'Any' }); // Added 'textile' and 'tackable' to form state, default to 'Any'
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    const fabricSuppliers = useMemo(() => ['Arc-Com', 'Camira', 'Carnegie', 'CF Stinson', 'Designtex', 'Guilford of Maine', 'Knoll', 'Kravet', 'Maharam', 'Momentum'], []);
    const fabricPatterns = useMemo(() => ['Astor', 'Caldera', 'Crossgrain', 'Dapper', 'Eco Wool', 'Heritage Tweed', 'Luxe Weave', 'Melange', 'Pixel', 'Prospect'], []);
    const jsiSeriesOptions = useMemo(() => ['Alden', 'Allied', 'Anthology', 'Aria', 'Cincture', 'Convert', 'Midwest', 'Momentum', 'Proton', 'Reveal', 'Symmetry', 'Vision', 'Wink'], []);
    const allGradeOptions = useMemo(() => ['A', 'B', 'C', 'COL', 'COM', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L1', 'L2'], []);
    const textileOptions = useMemo(() => [
        { label: 'Any', value: 'Any' },
        { label: 'Coated', value: 'Coated' },
        { label: 'Fabric', value: 'Fabric' },
        { label: 'Leather', value: 'Leather' },
        { label: 'Panel', value: 'Panel' }
    ], []);
    const tackableOptions = useMemo(() => [
        { label: 'Any', value: 'Any' },
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ], []);

    const updateField = useCallback((field, value) =>
        setForm(f => ({ ...f, [field]: value })), []);

    const toggleGrade = useCallback((grade) => {
        setForm(prevForm => {
            const currentGrades = prevForm.grade;
            if (currentGrades.includes(grade)) {
                return { ...prevForm, grade: currentGrades.filter(g => g !== grade) };
            } else {
                return { ...prevForm, grade: [...currentGrades, grade] };
            }
        });
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
            (!form.pattern || item.pattern === form.pattern) &&
            (form.grade.length === 0 || form.grade.includes(item.grade)) &&
            (form.textile === 'Any' || item.textile === form.textile) && // Filter by textile
            (form.tackable === 'Any' || item.tackable === form.tackable) // Filter by tackable
        );
        setResults(filtered);
    }, [form]);

    const resetSearch = useCallback(() => {
        setForm({ supplier: '', pattern: '', jsiSeries: '', grade: [], textile: 'Any', tackable: 'Any' }); // Reset all fields
        setResults(null);
        setError('');
    }, []);

    return (
        <div className="flex flex-col h-full">
            <PageTitle title="Search Fabrics" theme={theme} />

            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
                {!results ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormSection title="" theme={theme}>
                            {error && <p className="text-sm text-red-500 -mt-2 mb-2 px-1">{error}</p>}

                            <AutoCompleteCombobox label="Supplier" required value={form.supplier} onChange={v => updateField('supplier', v)} options={fabricSuppliers} placeholder="Search Suppliers" theme={theme} dropdownClassName="max-h-72" />
                            <AutoCompleteCombobox label="Pattern" value={form.pattern} onChange={v => updateField('pattern', v)} options={fabricPatterns} placeholder="Search Patterns (Optional)" theme={theme} dropdownClassName="max-h-72" />
                            <AutoCompleteCombobox label="JSI Series" required value={form.jsiSeries} onChange={v => updateField('jsiSeries', v)} options={jsiSeriesOptions} placeholder="Search JSI Series" theme={theme} dropdownClassName="max-h-72" />

                            {/* Grade Selection */}
                            <div>
                                <label className="block text-sm font-semibold px-3 mb-2" style={{ color: theme.colors.textSecondary }}>Grade</label>
                                <div className="flex flex-wrap gap-2 p-1.5 rounded-full" style={{ backgroundColor: theme.colors.subtle }}>
                                    <button
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, grade: [] }))} // Select "Any"
                                        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 border-2`}
                                        style={{
                                            backgroundColor: form.grade.length === 0 ? theme.colors.surface : 'transparent',
                                            color: form.grade.length === 0 ? theme.colors.accent : theme.colors.textSecondary,
                                            borderColor: form.grade.length === 0 ? theme.colors.accent : theme.colors.border,
                                        }}
                                    >
                                        Any
                                    </button>
                                    {allGradeOptions.map(grade => (
                                        <button
                                            key={grade}
                                            type="button"
                                            onClick={() => toggleGrade(grade)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 border-2`}
                                            style={{
                                                backgroundColor: form.grade.includes(grade) ? theme.colors.surface : 'transparent',
                                                color: form.grade.includes(grade) ? theme.colors.accent : theme.colors.textSecondary,
                                                borderColor: form.grade.includes(grade) ? theme.colors.accent : theme.colors.border,
                                            }}
                                        >
                                            {grade}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Textile Selection */}
                            <div>
                                <label className="block text-sm font-semibold px-3 mb-2" style={{ color: theme.colors.textSecondary }}>Textile</label>
                                <ToggleButtonGroup
                                    value={form.textile}
                                    onChange={value => updateField('textile', value)}
                                    options={textileOptions}
                                    theme={theme}
                                />
                            </div>

                            {/* Tackable Selection */}
                            <div>
                                <label className="block text-sm font-semibold px-3 mb-2" style={{ color: theme.colors.textSecondary }}>Tackable</label>
                                <ToggleButtonGroup
                                    value={form.tackable}
                                    onChange={value => updateField('tackable', value)}
                                    options={tackableOptions}
                                    theme={theme}
                                />
                            </div>

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
                                <div><span className="font-medium" style={{ color: theme.colors.textSecondary }}>Grade:</span> {form.grade.length > 0 ? form.grade.join(', ') : 'Any'}</div>
                                <div><span className="font-medium" style={{ color: theme.colors.textSecondary }}>Textile:</span> {form.textile}</div>
                                <div><span className="font-medium" style={{ color: theme.colors.textSecondary }}>Tackable:</span> {form.tackable}</div>
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

export const COMYardageRequestScreen = ({ theme, showAlert, onNavigate, userSettings }) => {
    const [selectedModels, setSelectedModels] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [summary, setSummary] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fabricStrings = useMemo(() =>
        Data.FABRICS_DATA.map(f => `${f.manufacturer}, ${f.name}`), []);

    const modelOptions = useMemo(() =>
        Data.JSI_MODELS.filter(m => m.isUpholstered)
            .map(m => `${m.name} (${m.id})`), []);

    const addModel = rawVal => {
        if (!rawVal) return;
        const match = rawVal.match(/\(([^)]+)\)/);
        const modelId = match ? match[1] : rawVal.trim();
        const model = Data.JSI_MODELS.find(m => m.id === modelId);
        if (!model) return;
        const key = `${modelId}_${Date.now()}`;
        setSelectedModels(prev => [...prev, { ...model, quantity: 1, fabric: '', fabricSearch: '', showFabricSearch: false, key }]);
    };

    const updateModel = (key, updates) =>
        setSelectedModels(prev =>
            prev.map(m => (m.key === key ? { ...m, ...updates } : m)));

    const removeModel = key =>
        setSelectedModels(prev => prev.filter(m => m.key !== key));

    const handleSubmit = () => {
        const incomplete = selectedModels.some(m => !m.fabric.trim() || m.quantity < 1);
        if (incomplete) return showAlert('Please ensure all models have a fabric and a quantity greater than 0.');
        const list = selectedModels
            .map(m => `${m.name} (${m.quantity}x) – ${m.fabric}`)
            .join('\n');
        setSummary(list);
        setShowConfirm(true);
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        const powerAutomateURL = import.meta.env.VITE_POWER_AUTOMATE_URL;

        // This payload sends the data in the correct structured format with a "models" array
        const payload = {
            requester: userSettings.email,
            models: selectedModels.map(m => ({
                name: m.name,
                quantity: m.quantity,
                fabric: m.fabric,
            }))
        };

        try {
            const response = await fetch(powerAutomateURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Server responded with an error.');

            showAlert('COM Yardage Request Submitted!');
            setShowConfirm(false);
            onNavigate('resources');

        } catch (error) {
            console.error('Submission failed:', error);
            showAlert('Submission failed. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <PageTitle title="COM Yardage Request" theme={theme} />
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                <GlassCard theme={theme} className="p-4">
                    <h3 className="font-bold mb-3 text-xl" style={{ color: theme.colors.textPrimary }}>
                        Select Model(s)
                    </h3>
                    {selectedModels.map(m => (
                        <GlassCard key={m.key} theme={theme} className="p-4 mb-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{m.name}</p>
                                    <p className="text-sm font-mono">{m.id}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => removeModel(m.key)}
                                        className="p-1.5 rounded-full hover:bg-red-500/10 transition">
                                        <Trash2 className="w-5 h-5 text-red-500" />
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        value={m.quantity}
                                        onChange={e => {
                                            const newQuantity = parseInt(e.target.value, 10);
                                            updateModel(m.key, { quantity: isNaN(newQuantity) ? '' : newQuantity });
                                        }}
                                        required
                                        className="w-16 text-center py-1.5 px-2 border rounded-md"
                                        style={{
                                            backgroundColor: theme.colors.subtle,
                                            borderColor: theme.colors.border,
                                            color: theme.colors.textPrimary
                                        }}
                                    />
                                </div>
                            </div>
                            <AutoCompleteCombobox
                                value={m.fabric}
                                onChange={v => updateModel(m.key, { fabric: v })}
                                onSelect={v => updateModel(m.key, { fabric: v })}
                                placeholder="Fabric pattern…"
                                options={fabricStrings}
                                theme={theme}
                            />
                        </GlassCard>
                    ))}
                    <AutoCompleteCombobox
                        value="" onChange={() => { }} onSelect={addModel}
                        placeholder="+ Add model" options={modelOptions}
                        theme={theme} resetOnSelect={true} />
                </GlassCard>
                <button
                    onClick={handleSubmit}
                    disabled={selectedModels.length === 0 || selectedModels.some(m => m.quantity < 1)}
                    className="w-full font-bold py-3 rounded-full text-white disabled:opacity-50"
                    style={{ backgroundColor: theme.colors.accent }}>
                    Submit Request
                </button>
            </div>

            <Modal show={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Submission" theme={theme}>
                <div>
                    <p className="text-sm mb-2" style={{ color: theme.colors.textSecondary }}>The following request will be sent:</p>
                    <pre className="text-sm whitespace-pre-wrap p-3 rounded-md mb-4" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>
                        {summary}
                    </pre>
                    <button onClick={handleFinalSubmit} disabled={isSubmitting}
                        className="w-full py-2 rounded-full text-white disabled:opacity-70"
                        style={{ backgroundColor: theme.colors.accent }}>
                        {isSubmitting ? 'Submitting...' : 'Confirm and Send'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export const FabricsScreen = ({ onNavigate, theme, currentScreen, showAlert, userSettings }) => {
    const subScreen = currentScreen.split('/')[1];

    if (subScreen === 'search_form') {
        return <FabricSearchForm theme={theme} showAlert={showAlert} onNavigate={onNavigate} />;
    }

    if (subScreen === 'com_request') {
        return <COMYardageRequestScreen theme={theme} showAlert={showAlert} onNavigate={onNavigate} userSettings={userSettings} />;
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

export const CartScreen = ({ theme, onNavigate, cart, setCart, onUpdateCart, userSettings }) => {
    const [address, setAddress] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const cartItems = useMemo(() => {
        return Object.entries(cart).map(([id, quantity]) => {
            if (id === 'full-jsi-set') {
                return { id, name: 'Full JSI Sample Set', quantity, isSet: true };
            }
            if (id.startsWith('set-')) {
                const categoryId = id.replace('set-', '');
                const categoryName = Data.SAMPLE_CATEGORIES.find(c => c.id === categoryId)?.name || 'Unknown';
                return { id, name: `Complete ${categoryName} Set`, quantity, isSet: true };
            }
            const product = Data.SAMPLE_PRODUCTS.find(p => String(p.id) === id);
            return product ? { ...product, quantity, isSet: false } : null;
        }).filter(Boolean);
    }, [cart]);

    const totalCartItems = useMemo(
        () => Object.values(cart).reduce((sum, qty) => sum + qty, 0),
        [cart]
    );

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
        <div className="flex flex-col h-full">
            <PageTitle title="Cart" theme={theme} />
            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
                <GlassCard theme={theme} className="p-2">
                    <h3 className="font-bold text-xl px-2 pt-2" style={{ color: theme.colors.textPrimary }}>Selected Samples</h3>
                    {cartItems.length > 0 ? (
                        <div className="mt-2">
                            {cartItems.map((item, index) => (
                                <React.Fragment key={item.id}>
                                    {index > 0 && <div className="border-t mx-2" style={{ borderColor: theme.colors.border }}></div>}
                                    <div className="flex items-center space-x-4 p-2">
                                        <div
                                            className="w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center"
                                            style={{
                                                backgroundColor: item.isSet ? theme.colors.subtle : item.color,
                                                border: `1px solid ${theme.colors.border}`
                                            }}
                                        >
                                            {item.isSet && <Package className="w-8 h-8" style={{ color: theme.colors.secondary }} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{item.name}</p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => onUpdateCart(item, -1)} className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                                                {item.quantity === 1 ? <Trash2 className="w-5 h-5 text-red-500" /> : <Minus className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />}
                                            </button>
                                            <span className="font-bold w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => onUpdateCart(item, 1)} className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                                                <Plus className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                                            </button>
                                        </div>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    ) : <p className="text-sm p-4 text-center" style={{ color: theme.colors.textSecondary }}>Your cart is empty.</p>}
                </GlassCard>
            </div>

            {/* --- Sticky Footer --- */}
            <div className="px-4 space-y-3 pt-3 pb-4 border-t" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
                <GlassCard theme={theme} className="p-3 space-y-2">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold px-1" style={{ color: theme.colors.textPrimary }}>Ship To</h3>
                        <button onClick={() => setAddress(userSettings.homeAddress)} className="flex items-center space-x-1.5 text-sm font-semibold p-2 rounded-lg hover:bg-black/5">
                            <Home className="w-4 h-4" style={{ color: theme.colors.secondary }} />
                            <span>Use Home Address</span>
                        </button>
                    </div>
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows="2" placeholder="Enter shipping address..." className="w-full p-2 border rounded-lg" style={{ backgroundColor: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary, resize: 'none' }}></textarea>
                </GlassCard>
                <button onClick={handleSubmit} disabled={Object.keys(cart).length === 0 || !address.trim()} className="w-full font-bold py-3.5 px-6 rounded-full transition-colors disabled:opacity-50" style={{ backgroundColor: theme.colors.accent, color: '#FFFFFF' }}>
                    Submit Order ({totalCartItems} Items)
                </button>
            </div>
        </div>
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

export const PostCard = ({ post, theme, isLiked, onToggleLike }) => {
    const { user, timeAgo, text, image, likes = 0, comments = [] } = post;

    // `liked` state is now a prop `isLiked`
    // `count` state is now based on `likes` prop from `post` object, updated in App.jsx
    const [open, setOpen] = useState(comments && comments.length > 0);
    const [input, setInput] = useState('');
    const [list, setList] = useState(comments);
    const [menu, setMenu] = useState(false);

    const toggleLike = () => {
        onToggleLike(post.id); // Call the prop function to update like status in parent
    };
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
                    <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'fill-current' : 'stroke-2'}`}
                        style={{ color: isLiked ? theme.colors.accent : theme.colors.textSecondary, fill: isLiked ? theme.colors.accent : 'none' }} />
                    <span className="text-sm" style={{ color: theme.colors.textSecondary }}>{likes}</span>
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

export const PollCard = ({ poll, theme, userChoice, onVote }) => {
    const { user, timeAgo, question, options } = poll;
    // `choice` state is now a prop `userChoice`
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
        if (userChoice === null || userChoice === undefined) return 0; // If no user choice, no votes counted for demo
        // In a real app, you'd get updated vote counts from a server.
        // For this demo, we'll just add 1 to the chosen option if the user has chosen it.
        return options.reduce((sum, o) => {
            let voteCount = o.votes;
            if (o.id === userChoice) {
                voteCount += 1;
            }
            return sum + voteCount;
        }, 0);
    }, [userChoice, options]);

    const handleUserVote = (optionId) => {
        if (userChoice === null || userChoice === undefined) { // Only allow voting if no choice has been made
            onVote(poll.id, optionId); // Call the prop function to update choice in parent
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
                    const hasVoted = userChoice !== null && userChoice !== undefined;
                    const voteCount = (userChoice === option.id) ? option.votes + 1 : option.votes;
                    const percentage = hasVoted && totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                    const isChosen = userChoice === option.id;

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleUserVote(option.id)}
                            disabled={hasVoted}
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
    <GlassCard theme={theme} className="p-4 overflow-visible">
        {/* The title is now inside the card, creating the grouped effect */}
        <h3 className="font-bold text-xl mb-4">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </GlassCard>
);

export const CreatePost = () => {
    const [postType, setPostType] = useState('Post');

    return (
        <div className="create-post-container">
            <h2>Create a new post</h2>
            <div className="post-type-selector">
                <button
                    className={postType === 'Post' ? 'active' : ''}
                    onClick={() => setPostType('Post')}
                >
                    Post
                </button>
                <button
                    className={postType === 'Poll' ? 'active' : ''}
                    onClick={() => setPostType('Poll')}
                >
                    Poll
                </button>
            </div>

            <div className="editor-container">
                {postType === 'Post' && <PostEditor />}
                {postType === 'Poll' && <PollEditor />}
            </div>
        </div>
    );
};

export const CreateContentModal = ({ close, theme, onAdd }) => {
    const [type, setType] = useState(null);
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [question, setQ] = useState('');
    const [optA, setA] = useState('');
    const [optB, setB] = useState('');
    const [optC, setC] = useState(''); // Added Option C state
    const [optD, setD] = useState(''); // Added Option D state

    const submit = () => {
        // This is demonstration logic, would be replaced with actual API calls
        if (type === 'post') onAdd('post', { id: Date.now(), user: { name: 'You', avatar: '' }, timeAgo: 'just now', text, image: file ? URL.createObjectURL(file) : null, likes: 0, comments: [], });
        if (type === 'poll') {
            const options = [
                { id: 'a', text: optA || 'Option A', votes: 0 },
                { id: 'b', text: optB || 'Option B', votes: 0 },
            ];
            if (optC) options.push({ id: 'c', text: optC, votes: 0 }); // Add Option C if entered
            if (optD) options.push({ id: 'd', text: optD, votes: 0 }); // Add Option D if entered

            onAdd('poll', { id: Date.now(), user: { name: 'You', avatar: '' }, timeAgo: 'now', question, options });
        }
        close();
    };

    const OptionButton = ({ icon: Icon, title, description, onClick }) => (
        <button onClick={onClick} className="w-full text-left p-4 rounded-2xl flex items-center space-x-4 transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ backgroundColor: theme.colors.subtle }}>
            <div className="p-3 rounded-full" style={{ backgroundColor: theme.colors.surface }}>
                <Icon className="w-6 h-6" style={{ color: theme.colors.accent }} />
            </div>
            <div>
                <p className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{title}</p>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{description}</p>
            </div>
        </button>
    );

    const renderForm = () => {
        switch (type) {
            case 'post':
                return <div className="space-y-4">
                    <h3 className="text-xl font-bold">New Post</h3>
                    <FormInput type="textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Share an update..." theme={theme} />
                    <label className="block"><input type="file" accept="image/*,video/*" hidden onChange={(e) => setFile(e.target.files[0])} /><span className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer" style={{ backgroundColor: theme.colors.subtle }}>{file ? <span>{file.name}</span> : <><Image className="w-4 h-4" /><span>Add Media</span></>}</span></label>
                    <button onClick={submit} className="w-full font-bold py-3 px-6 rounded-full text-white" style={{ backgroundColor: theme.colors.accent }}>Post</button>
                </div>;
            case 'poll':
                return <div className="space-y-4">
                    <h3 className="text-xl font-bold">Create Poll</h3>
                    <FormInput value={question} onChange={(e) => setQ(e.target.value)} placeholder="What's your question?" theme={theme} />
                    <FormInput value={optA} onChange={(e) => setA(e.target.value)} placeholder="Option A" theme={theme} />
                    <FormInput value={optB} onChange={(e) => setB(e.target.value)} placeholder="Option B" theme={theme} />
                    <FormInput value={optC} onChange={(e) => setC(e.target.value)} placeholder="Option C (Optional)" theme={theme} /> {/* Added Optional Option C */}
                    <FormInput value={optD} onChange={(e) => setD(e.target.value)} placeholder="Option D (Optional)" theme={theme} /> {/* Added Optional Option D */}
                    <button onClick={submit} className="w-full font-bold py-3 px-6 rounded-full text-white" style={{ backgroundColor: theme.colors.accent }}>Post Poll</button>
                </div>;
            default:
                return (
                    <div className="space-y-3">
                        <OptionButton icon={MessageSquare} title="Feed Post" description="Share an update or photo" onClick={() => setType('post')} />
                        <OptionButton icon={PieChart} title="Poll" description="Ask a question to the community" onClick={() => setType('poll')} />
                    </div>
                );
        }
    };

    return <Modal show={true} onClose={close} title={type ? "" : "Create..."} theme={theme}>{renderForm()}</Modal>;
};

export const FancySelect = ({ value, onChange, options, placeholder, required, theme }) => (
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

export const FormInput = React.memo(({
    label,
    type = 'text',
    value,
    onChange,
    name,
    placeholder,
    className = "",
    theme,
    readOnly = false,
    required = false,
    icon = null,
}) => {
    const controlledValue = value === undefined || value === null ? '' : value;
    const inputClass = `w-full px-4 py-3 border rounded-full focus:ring-2 text-base outline-none ${icon ? 'pr-10' : ''} ${className}`;
    const styles = {
        backgroundColor: theme.colors.subtle,
        borderColor: theme.colors.border,
        color: readOnly && !controlledValue ? theme.colors.textSecondary : theme.colors.textPrimary,
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
        onChange({ target: { name, value: numericValue } });
    };
    return (
        <div className="space-y-2">
            {/* FIX: Label style updated to text-sm and px-3 */}
            {label && (
                <label className="text-sm font-semibold px-3" style={{ color: theme.colors.textSecondary }}>
                    {label}
                </label>
            )}
            <div className="relative">
                {type === 'currency' ? (<input type="text" name={name} value={formatCurrency(controlledValue)} onChange={handleCurrencyChange} className={inputClass} style={styles} placeholder={placeholder} required={required} />)
                    : type === 'textarea' ? (<textarea name={name} value={controlledValue} onChange={onChange} className="w-full px-4 py-3 border rounded-3xl focus:ring-2 text-base outline-none" style={{ ...styles, resize: 'none' }} rows="4" placeholder={placeholder} readOnly={readOnly} />)
                        : (<input type={type} name={name} value={controlledValue} onChange={onChange} className={inputClass} style={styles} placeholder={placeholder} readOnly={readOnly} required={required} />)}
                {icon && (<div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">{icon}</div>)}
            </div>
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
    // Prevent background from scrolling whenever a modal is open
    React.useEffect(() => {
        if (show) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [show]);

    if (!show) return null;

    // FIX: The entire modal is now rendered in a Portal at the top level of the page.
    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[999] transition-opacity duration-300 pointer-events-auto p-4"
            style={{ opacity: show ? 1 : 0 }}
            onClick={onClose}
        >
            <div
                onClick={e => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl flex flex-col transition-transform duration-300 transform shadow-2xl"
                style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                }}
            >
                {title && (
                    <div
                        className="flex justify-between items-center p-4 border-b flex-shrink-0"
                        style={{ borderColor: theme.colors.border }}
                    >
                        <h2 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                            style={{ backgroundColor: theme.colors.subtle }}
                        >
                            <X className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                        </button>
                    </div>
                )}
                <div
                    className={`${title ? "p-6" : "pt-8 px-6 pb-6"
                        } overflow-y-auto space-y-4 scrollbar-hide`}
                >
                    {children}
                </div>
            </div>
        </div>,
        document.body // This tells React to render the modal at the end of the <body> tag
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

export const lightTheme = {
    colors: {
        background: '#EEEEEC', // The slightly darker page background
        surface: '#FFFFFF',    // Pure white for all component surfaces
        primary: '#003366',
        accent: '#003366',
        secondary: '#7A7A7A',
        textPrimary: '#111111',
        textSecondary: '#555555',
        border: 'rgba(0,0,0,0.08)',
        shadow: 'rgba(0,0,0,0.10)'
    },
    backdropFilter: 'blur(12px)'
};

export const AppHeader = React.memo(({ onHomeClick, isDarkMode, theme, onProfileClick, isHome, handleBack, showBack, userName }) => {
    const filterStyle = isDarkMode ? 'brightness(0) invert(1)' : 'none';

    return (
        <div
            style={{
                backgroundColor: theme.colors.surface,
                backdropFilter: theme.backdropFilter,
                WebkitBackdropFilter: theme.backdropFilter
            }}
            className="mx-auto mt-4 w-[90%] px-6 py-3 flex justify-between items-center sticky top-0 z-20 rounded-full shadow-lg backdrop-blur"
        >
            <div className="flex items-center">
                <button
                    aria-label="Go back"
                    onClick={handleBack}
                    className={`transition-all duration-300 ease-in-out overflow-hidden p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 ${showBack ? 'w-9 -ml-2 mr-2 opacity-100' : 'w-0 ml-0 mr-0 opacity-0'}`}
                    disabled={!showBack}
                >
                    <ArrowLeft className="w-5 h-5 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
                </button>

                <button
                    aria-label="Go to homepage"
                    onClick={onHomeClick}
                    className="hover:opacity-80 transition-opacity"
                >
                    <img src={Data.logoLight} alt="MyJSI Logo" className="h-10 w-auto" style={{ filter: filterStyle }} />
                </button>
            </div>
            <div className="flex items-center space-x-2">
                {/* FIX: The conditional rendering is replaced with dynamic classes for a fade/slide animation */}
                <div
                    className={`transition-all duration-300 ease-in-out text-lg font-normal leading-tight whitespace-nowrap overflow-hidden ${isHome ? 'max-w-[150px] opacity-100' : 'max-w-0 opacity-0'}`}
                    style={{ color: theme.colors.textPrimary }}
                    aria-hidden={!isHome}
                >
                    Hello, {userName}!
                </div>

                <button
                    aria-label="Open profile menu"
                    onClick={onProfileClick}
                    className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ backgroundColor: theme.colors.subtle, borderColor: theme.colors.border }}
                >
                    <User className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                </button>
            </div>
        </div>
    );
});


export const SmartSearch = ({
    theme,
    onNavigate,
    onAskAI,
    onVoiceActivate
}) => {
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
        if (term.length >= 1) {
            const results = Data.allApps
                .filter(app => app.name.toLowerCase().includes(term))
                .sort((a, b) => a.name.localeCompare(b.name));
            setFilteredApps(results);
        } else {
            setFilteredApps([]);
        }
    }, [query, isFocused]);

    useEffect(() => {
        const handleClickOutside = e => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(e.target)
            ) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNavigation = route => {
        onNavigate(route);
        setQuery('');
        setFilteredApps([]);
        setIsFocused(false);
    };

    const handleFormSubmit = e => {
        e.preventDefault();
        if (query.trim() && filteredApps.length === 0) {
            onAskAI(query);
            setQuery('');
            setIsFocused(false);
        }
    };

    const handleVoiceClick = () => {
        onVoiceActivate('Voice Activated');
    };

    return (
        <div ref={searchContainerRef} className="relative z-20">
            <form onSubmit={handleFormSubmit} className="relative">
                <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: theme.colors.textSecondary }}
                />
                <input
                    type="text"
                    placeholder="Ask me anything..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    className="
            w-full
            pl-11 pr-12 py-5
            rounded-full
            text-base
            bg-white
            border-0
            shadow-lg
            focus:ring-0
            outline-none
          "
                    style={{
                        color: theme.colors.textPrimary
                    }}
                />
                <button
                    type="button"
                    onClick={handleVoiceClick}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                    <Mic
                        className="h-5 w-5"
                        style={{ color: theme.colors.textSecondary }}
                    />
                </button>
            </form>

            {isFocused && filteredApps.length > 0 && (
                <GlassCard theme={theme} className="absolute top-full mt-2 w-full p-2 z-50">
                    <ul className="max-h-60 overflow-y-auto scrollbar-hide">
                        {filteredApps.map(app => (
                            <li
                                key={app.route}
                                onMouseDown={() => handleNavigation(app.route)}
                                className="
                  flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg
                  hover:bg-black/5
                "
                                style={{ color: theme.colors.textPrimary }}
                            >
                                <app.icon
                                    className="w-4 h-4"
                                    style={{ color: theme.colors.textSecondary }}
                                />
                                {app.name}
                            </li>
                        ))}
                    </ul>
                </GlassCard>
            )}
        </div>
    );
};


export const HomeScreen = ({ onNavigate, theme, onAskAI, showAIDropdown, aiResponse, isAILoading, onCloseAIDropdown, onVoiceActivate }) => {
    const handleFeedbackClick = useCallback(() => {
        onNavigate('feedback');
    }, [onNavigate]);

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <div className="pt-2 pb-4">
                <div className="relative z-10 w-[90%] mx-auto">
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
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4 scrollbar-hide">
                <div className="grid grid-cols-2 gap-4">
                    {Data.MENU_ITEMS.map((item) => (
                        <div
                            key={item.id}
                            // Padding changed from p-4 to p-6 to move content inward
                            className="group relative p-6 h-32 flex flex-col justify-between cursor-pointer transition-all duration-300 rounded-[2.25rem] shadow-lg hover:shadow-xl hover:-translate-y-1"
                            style={{
                                backgroundColor: theme.colors.surface,
                                // The borderColor property has been removed here to remove the thin grey border.
                            }}
                            onClick={() => onNavigate(item.id)}
                        >
                            <div className="relative">
                                <item.icon className="w-7 h-7" style={{ color: theme.colors.accent }} strokeWidth={1.5} />
                            </div>
                            <div className="relative">
                                <span className="text-xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>{item.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div
                    className="p-1 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    style={{ backgroundColor: theme.colors.surface, /* The borderColor property has been removed here */ }}
                >
                    <button onClick={handleFeedbackClick} className="w-full py-5 px-3 rounded-full flex items-center justify-center space-x-4">
                        <MessageSquare className="w-7 h-7" style={{ color: theme.colors.accent }} strokeWidth={1.5} />
                        <span className="text-xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>Give Feedback</span>
                    </button>
                </div>
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
    const maxValue = Math.max(...data.map(d => d.bookings));
    return (
        <div className="space-y-4">
            {data.map((item, index) => (
                <div key={index} className="grid grid-cols-[3rem,1fr,auto] items-center gap-x-4 text-sm">
                    <span className="font-semibold" style={{ color: theme.colors.textSecondary }}>{item.month}</span>
                    <div className="h-2.5 rounded-full" style={{ backgroundColor: theme.colors.border }}>
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${((item.bookings || 0) / maxValue) * 100}%`,
                                backgroundColor: theme.colors.accent
                            }}
                        />
                    </div>
                    <span className="font-semibold text-right" style={{ color: theme.colors.textPrimary }}>
                        ${(item.bookings || 0).toLocaleString()}
                    </span>
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
                            <p className="text-sm font-normal" style={{ color: theme.colors.textSecondary }}>${item.value.toLocaleString()}</p> {/* Changed font-mono to font-normal and text-xs to text-sm */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});
export function CustomSelect({
    label,
    value,
    onChange,
    options,
    placeholder,
    theme,
    onOpen
}) {
    const [isOpen, setIsOpen] = useState(false)
    const wrapperRef = useRef(null)
    const [dropDirection, checkPosition] = useDropdownPosition(wrapperRef)

    // close on outside click
    useEffect(() => {
        const handler = e => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleOpen = () => {
        checkPosition()
        onOpen?.()
        setIsOpen(o => !o)
    }

    const handleSelect = val => {
        onChange({ target: { value: val } })
        setIsOpen(false)
    }

    const selectedLabel =
        options.find(o => o.value === value)?.label || placeholder

    return (
        <div ref={wrapperRef} className="relative overflow-visible space-y-1">
            {label && (
                <label
                    className="block text-xs font-semibold px-4"
                    style={{ color: theme.colors.textSecondary }}
                >
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={handleOpen}
                className="w-full px-4 py-3 border rounded-lg text-left flex justify-between items-center shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                    backgroundColor: theme.colors.subtle,
                    borderColor: theme.colors.border,
                    color: value
                        ? theme.colors.textPrimary
                        : theme.colors.textSecondary
                }}
            >
                <span className="pr-6">{selectedLabel}</span>
                <ChevronDown
                    className={`absolute right-4 w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                        }`}
                    style={{ color: theme.colors.textSecondary }}
                />
            </button>

            {isOpen && (
                <DropdownPortal parentRef={wrapperRef} onClose={() => setIsOpen(false)}>
                    <div className="p-2 max-h-80 overflow-y-auto scrollbar-hide rounded-2xl shadow-lg bg-white">
                        {options.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleSelect(opt.value)}
                                className="block w-full text-left p-2 rounded-lg hover:bg-gray-100"
                                style={{ color: theme.colors.textPrimary }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </DropdownPortal>
            )}
        </div>
    )
}

export const CustomerRankingScreen = ({ theme, onNavigate }) => {
    const [sortKey, setSortKey] = useState('sales');
    const [modalData, setModalData] = useState(null);

    const sortedCustomers = useMemo(() => {
        // This logic remains the same, sorting the entire list.
        return [...Data.CUSTOMER_RANK_DATA].sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
    }, [sortKey]);

    const handleOpenModal = useCallback((customer) => {
        if (customer.orders && customer.orders.length > 0) {
            setModalData(customer);
        }
    }, []);
    const handleCloseModal = useCallback(() => setModalData(null), []);

    // A single, clean list item component for all ranks.
    const RankListItem = ({ customer, rank, onClick }) => (
        <button onClick={onClick} className="w-full p-4 flex items-center space-x-4 transition-colors hover:bg-black/5 dark:hover:bg-white/10 rounded-xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0" style={{ backgroundColor: theme.colors.subtle }}>
                <span className="text-xl font-bold" style={{ color: theme.colors.textSecondary }}>{rank}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-lg truncate" style={{ color: theme.colors.textPrimary }}>{customer.name}</p>
            </div>
            <div className="text-right">
                <p className="font-semibold text-lg" style={{ color: theme.colors.accent }}>${customer[sortKey].toLocaleString()}</p>
            </div>
        </button>
    );

    return (
        <div className="h-full flex flex-col">
            <div className="px-4">
                <PageTitle title="Customer Ranking" theme={theme} />
                <div className="pb-4">
                    <GlassCard theme={theme} className="p-1">
                        <ToggleButtonGroup
                            value={sortKey}
                            onChange={setSortKey}
                            options={[{ label: 'By Sales', value: 'sales' }, { label: 'By Bookings', value: 'bookings' }]}
                            theme={theme}
                        />
                    </GlassCard>
                </div>
            </div>

            {/* The main scrolling container now holds a single list */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
                <GlassCard theme={theme} className="p-2">
                    {sortedCustomers.map((customer, index) => (
                        <React.Fragment key={customer.id}>
                            {index > 0 && <div className="border-t mx-4" style={{ borderColor: theme.colors.subtle }}></div>}
                            <RankListItem
                                customer={customer}
                                rank={index + 1}
                                onClick={() => handleOpenModal(customer)}
                            />
                        </React.Fragment>
                    ))}
                </GlassCard>
            </div>

            <Modal show={!!modalData} onClose={handleCloseModal} title={`${modalData?.name} - Recent Orders`} theme={theme}>
                <div className="space-y-3">
                    {modalData?.orders?.length > 0 ? modalData.orders.map((order, index) => (
                        <div key={index} className="flex justify-between items-center text-sm border-b pb-2" style={{ borderColor: theme.colors.subtle }}>
                            <span style={{ color: theme.colors.textPrimary }}>{order.projectName}</span>
                            <span className="font-semibold" style={{ color: theme.colors.accent }}>${order.amount.toLocaleString()}</span>
                        </div>
                    )) : (
                        <p style={{ color: theme.colors.textSecondary }}>No specific orders to display for this total.</p>
                    )}
                </div>
            </Modal>
        </div>
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
                <div className="flex justify-between items-start">
                    <div className="pr-4">
                        <h2 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>{order.details || 'Order Details'}</h2>
                        <p className="-mt-1 text-sm" style={{ color: theme.colors.textSecondary }}>{order.company}</p>
                    </div>
                    <button onClick={handleClose} className="text-sm font-medium p-2 -mr-2 flex-shrink-0" style={{ color: theme.colors.textSecondary }}>
                        Close
                    </button>
                </div>

                <div className="text-center py-2 rounded-full font-semibold text-white tracking-wider text-sm" style={{ backgroundColor: statusColor }}>
                    {statusText}
                </div>

                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm border-t border-b py-4" style={{ borderColor: theme.colors.subtle }}>
                    <dt className="font-medium" style={{ color: theme.colors.textSecondary }}>SO:</dt>
                    <dd className="font-mono text-right" style={{ color: theme.colors.textPrimary }}>{order.orderNumber}</dd>
                    {order.po && <>
                        <dt className="font-medium" style={{ color: theme.colors.textSecondary }}>PO:</dt>
                        <dd className="font-mono text-right" style={{ color: theme.colors.textPrimary }}>{order.po}</dd>
                    </>}
                    {order.net && <>
                        <dt className="font-medium" style={{ color: theme.colors.textSecondary }}>NET:</dt>
                        <dd className="font-mono text-right font-semibold" style={{ color: theme.colors.textPrimary }}>${order.net.toLocaleString(undefined, { maximumFractionDigits: 0 })}</dd>
                    </>}
                    {order.reward && <>
                        <dt className="font-medium" style={{ color: theme.colors.textSecondary }}>REWARDS:</dt>
                        <dd className="text-right" style={{ color: theme.colors.textPrimary }}>{order.reward}</dd>
                    </>}
                    {order.shipDate && <>
                        <dt className="font-medium" style={{ color: theme.colors.textSecondary }}>SHIP DATE:</dt>
                        <dd className="text-right font-semibold" style={{ color: theme.colors.textPrimary }}>{formattedShipDate}</dd>
                    </>}
                </dl>

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

                <button onClick={() => setIsExpanded(p => !p)} className="w-full py-3 rounded-full font-medium text-white transition" style={{ backgroundColor: theme.colors.accent }} disabled={!order.lineItems || order.lineItems.length === 0}>
                    {isExpanded ? 'Hide Order Details' : 'Show Order Details'}
                </button>

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

    const filteredOrders = useMemo(() => {
        return Data.ORDER_DATA.filter(order =>
            (order.company?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (order.details?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (order.orderNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (order.po?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const groupedOrders = useMemo(() => {
        const groups = filteredOrders.reduce((acc, order) => {
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
    }, [filteredOrders, dateType]);

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
                    <OrderCalendarView
                        orders={filteredOrders}
                        theme={theme}
                        dateType={dateType}
                        onOrderClick={setSelectedOrder}
                    />
                )}
            </div>
        </div>
    );
};

export const SalesScreen = ({ theme, onNavigate }) => {
    const { MONTHLY_SALES_DATA, ORDER_DATA, SALES_VERTICALS_DATA, STATUS_COLORS } = Data;
    const [monthlyView, setMonthlyView] = useState('chart');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [numRecentOrders, setNumRecentOrders] = useState(3);

    const { totalBookings, totalSales } = useMemo(() => {
        const bookings = Data.MONTHLY_SALES_DATA.reduce((acc, m) => acc + m.bookings, 0);
        const sales = Data.MONTHLY_SALES_DATA.reduce((acc, m) => acc + m.sales, 0);
        return { totalBookings: bookings, totalSales: sales };
    }, []);

    const allRecentOrders = useMemo(() => {
        return Data.ORDER_DATA
            .filter(o => o.date && o.net)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, []);

    const displayedRecentOrders = useMemo(() => {
        return allRecentOrders.slice(0, numRecentOrders);
    }, [allRecentOrders, numRecentOrders]);

    const handleShowMoreOrders = useCallback(() => {
        setNumRecentOrders(8);
    }, []);

    const goal = 7000000;
    const percentToGoal = useMemo(() => (totalBookings / goal) * 100, [totalBookings, goal]);

    const handleShowOrderDetails = useCallback(order => setSelectedOrder(order), []);
    const handleCloseModal = useCallback(() => setSelectedOrder(null), []);

    // Helper to format company names like "OFFICEWORKS INC." to "Officeworks Inc."
    const formatCompanyName = (name) => {
        if (!name) return '';
        return name.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
    };

    // New helper to format large numbers into millions
    const formatMillion = (n) => {
        if (typeof n !== 'number') return '0.00M';
        return `${(n / 1000000).toFixed(2)}M`;
    };

    const CardHeader = ({ title, children }) => (
        <div className="flex justify-between items-center px-4 pt-4 pb-3 border-b" style={{ borderColor: theme.colors.border }}>
            <h3 className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>{title}</h3>
            {children}
        </div>
    );

    const NavigationButton = ({ label, nav }) => (
        <button onClick={() => onNavigate(nav)} className="w-full p-4 rounded-xl flex items-center justify-between transition-colors hover:bg-black/5 dark:hover:bg-white/10">
            <span className="text-md font-semibold tracking-tight" style={{ color: theme.colors.textPrimary }}>{label}</span>
            <ArrowRight className="w-5 h-5" style={{ color: theme.colors.secondary }} />
        </button>
    );

    return (
        <div className="flex flex-col h-full">
            <div
                className="sticky top-0 z-10 backdrop-blur-md"
                style={{ backgroundColor: `${theme.colors.background}e0` }}
            >
                <PageTitle title="Sales Dashboard" theme={theme}>
                    <button
                        onClick={() => onNavigate('new-lead')}
                        className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-transform hover:scale-105 active:scale-95"
                        style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                    >
                        <span>New Lead</span>
                        <Plus className="w-4 h-4" />
                    </button>
                </PageTitle>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 space-y-4 py-4">
                    <GlassCard theme={theme} className="overflow-hidden">
                        <CardHeader title="Progress to Goal">
                            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.colors.accent + '1A', color: theme.colors.accent }}>
                                <ArrowUp className="w-3 h-3" />
                                <span className="text-xs font-bold">+3.1%</span>
                            </div>
                        </CardHeader>
                        <div className="p-4">
                            <p className="text-5xl font-bold" style={{ color: theme.colors.accent }}>
                                {percentToGoal.toFixed(1)}%
                            </p>
                            <p className="text-sm font-semibold mt-1 mb-3" style={{ color: theme.colors.textPrimary }}>
                                ${formatMillion(totalBookings)} of ${formatMillion(goal)}
                            </p>
                            <div className="relative w-full h-4 rounded-full" style={{ backgroundColor: theme.colors.border }}>
                                <div className="h-full rounded-full" style={{ width: `${percentToGoal}%`, backgroundColor: theme.colors.accent }}></div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard theme={theme} className="overflow-hidden">
                        <CardHeader title="Monthly Performance" />
                        <div className="p-4">
                            <ToggleButtonGroup
                                value={monthlyView}
                                onChange={setMonthlyView}
                                options={[{ label: 'Chart', value: 'chart' }, { label: 'Table', value: 'table' }]}
                                theme={theme}
                            />
                            <div className="mt-4">
                                {monthlyView === 'chart'
                                    ? <MonthlyBarChart data={Data.MONTHLY_SALES_DATA} theme={theme} />
                                    : <MonthlyTable
                                        data={Data.MONTHLY_SALES_DATA}
                                        theme={theme}
                                        totalBookings={totalBookings}
                                        totalSales={totalSales}
                                    />}
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard theme={theme} className="overflow-hidden">
                        <CardHeader title="Recent Purchase Orders" />
                        <div className="px-1">
                            {displayedRecentOrders.map((order, index) => (
                                <React.Fragment key={order.orderNumber}>
                                    {index > 0 && <div className="border-t mx-3" style={{ borderColor: theme.colors.border }}></div>}
                                    <button
                                        className="w-full text-left p-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                        onClick={() => handleShowOrderDetails(order)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>{formatCompanyName(order.company)}</p>
                                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>PO #{order.po}</p>
                                                <div className="mt-2">
                                                    <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{
                                                        backgroundColor: (STATUS_COLORS[order.status] || theme.colors.secondary) + '20',
                                                        color: STATUS_COLORS[order.status] || theme.colors.secondary
                                                    }}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-xl" style={{ color: theme.colors.accent }}>{order.amount}</p>
                                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    </button>
                                </React.Fragment>
                            ))}
                        </div>
                        {numRecentOrders === 3 && allRecentOrders.length > 3 && (
                            <div className="text-center p-2 border-t" style={{ borderColor: theme.colors.border }}>
                                <button
                                    onClick={handleShowMoreOrders}
                                    className="font-semibold text-sm py-2 px-4 rounded-full transition-colors"
                                    style={{ backgroundColor: theme.colors.subtle, color: theme.colors.accent }}
                                >
                                    Show five more
                                </button>
                            </div>
                        )}
                    </GlassCard>

                    <GlassCard theme={theme} className="overflow-hidden">
                        <CardHeader title="Verticals Breakdown" />
                        <div className="p-4">
                            <DonutChart data={Data.SALES_VERTICALS_DATA} theme={theme} />
                        </div>
                    </GlassCard>

                    <GlassCard theme={theme} className="p-2">
                        <div className="space-y-1">
                            <NavigationButton label="View Customer Rank" nav="customer-rank" />
                            <div className="border-t mx-3" style={{ borderColor: theme.colors.subtle }} />
                            <NavigationButton label="View Commissions" nav="commissions" />
                            <div className="border-t mx-3" style={{ borderColor: theme.colors.subtle }} />
                            <NavigationButton label="View Incentive Rewards" nav="incentive-rewards" />
                        </div>
                    </GlassCard>
                </div>
            </div>

            {selectedOrder && (
                <OrderModal
                    order={selectedOrder}
                    onClose={handleCloseModal}
                    theme={theme}
                />
            )}
        </div>
    );
};


export const OrderCalendarView = ({ orders, theme, dateType, onOrderClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const ordersByDate = useMemo(() => {
        const map = new Map();
        orders.forEach(order => {
            const dateStr = order[dateType];
            if (dateStr) {
                const date = new Date(dateStr);
                const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                if (!map.has(key)) {
                    map.set(key, []);
                }
                map.get(key).push(order);
            }
        });
        return map;
    }, [orders, dateType]);

    const ordersForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
        return ordersByDate.get(key) || [];
    }, [selectedDate, ordersByDate]);

    const handleDateClick = (day) => {
        const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(newSelectedDate);
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="space-y-4">
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
                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                        const key = `${year}-${month}-${day}`;
                        const hasOrder = ordersByDate.has(key);

                        return (
                            <button
                                key={day}
                                onClick={() => handleDateClick(day)}
                                className={`relative h-10 flex items-center justify-center rounded-full transition-colors duration-200 ${isSelected ? 'bg-blue-600 text-white font-bold' : 'hover:bg-black/5'}`}
                            >
                                <span>{day}</span>
                                {hasOrder && <div className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></div>}
                            </button>
                        );
                    })}
                </div>
            </GlassCard>

            {selectedDate && ordersForSelectedDate.length > 0 && (
                <div className="space-y-3 animate-fade-in">
                    <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                        Orders for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </h3>
                    {ordersForSelectedDate.map(order => (
                        <GlassCard key={order.orderNumber} theme={theme} className="p-4 cursor-pointer hover:border-gray-400/50 flex items-center space-x-4" onClick={() => onOrderClick(order)}>
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: Data.STATUS_COLORS[order.status] || theme.colors.secondary }}></div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{order.details || 'N/A'}</p>
                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{order.company}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="font-semibold text-lg whitespace-nowrap" style={{ color: theme.colors.textPrimary }}>
                                    ${(order.net || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export const ProductsScreen = ({ theme, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollContainerRef = useRef(null);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            // Set state to true if user has scrolled more than 10px
            setIsScrolled(scrollContainerRef.current.scrollTop > 10);
        }
    };

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
        <div className="flex flex-col h-full">
            {/* Sticky Header with conditional styling */}
            <div
                className={`sticky top-0 z-10 transition-all duration-300 ${isScrolled ? 'shadow-md' : 'shadow-none'}`}
                style={{
                    backgroundColor: isScrolled ? `${theme.colors.background}e0` : 'transparent',
                    backdropFilter: isScrolled ? 'blur(12px)' : 'none',
                    WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
                }}
            >
                <PageTitle title="Products" theme={theme}>
                    <button
                        onClick={toggleViewMode}
                        className="p-2 rounded-lg"
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
                    />
                </div>
            </div>

            {/* Scrollable Content */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide -mt-[7.5rem] pt-[7.5rem]"
            >
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
        </div>
    );
};

export const ProbabilitySlider = ({ value, onChange, theme }) => {
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef(null);
    const updateFromClientX = (clientX) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const snapped = Math.round(pct / 5) * 5;
        onChange(snapped);
    };
    const onMouseDown = (e) => { setIsDragging(true); updateFromClientX(e.clientX); };
    const onMouseMove = (e) => { if (isDragging) updateFromClientX(e.clientX); };
    const onMouseUp = () => setIsDragging(false);
    const onTouchStart = (e) => { setIsDragging(true); updateFromClientX(e.touches[0].clientX); };
    const onTouchMove = (e) => { if (isDragging) updateFromClientX(e.touches[0].clientX); };
    const onTouchEnd = () => setIsDragging(false);
    useEffect(() => {
        if (!isDragging) return;
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mouseup', onMouseUp, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchend', onTouchEnd, { passive: true });
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [isDragging, onMouseMove, onMouseUp, onTouchMove, onTouchEnd]);
    return (
        <div className="space-y-2">
            {/* FIX: Label style updated to text-sm and px-3 */}
            <label className="text-sm font-semibold px-3" style={{ color: theme.colors.textSecondary }}>
                Win Probability
            </label>
            <div className="relative pt-4 pb-2 px-2">
                <div ref={sliderRef} className="relative h-2 rounded-full cursor-pointer" style={{ backgroundColor: theme.colors.border || '#d1d5db' }} onMouseDown={onMouseDown} onTouchStart={onTouchStart}>
                    <div className="absolute top-0 left-0 h-full rounded-full" style={{ backgroundColor: theme.colors.accent || '#3b82f6', width: `${value}%` }} />
                    <div className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${value}%` }}><div className="px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap shadow-lg border" style={{ color: theme.colors.textPrimary || '#374151', backgroundColor: '#ffffff', borderColor: theme.colors.border || '#d1d5db' }}>{value}%</div></div>
                </div>
                <input type="range" min="0" max="100" step="5" value={value} onChange={(e) => onChange(Math.round(parseInt(e.target.value) / 5) * 5)} className="sr-only" aria-label="Win Probability Slider" />
            </div>
        </div>
    );
};

export const NewLeadScreen = ({
    theme,
    onSuccess,
    designFirms,
    setDesignFirms,
    dealers,
    setDealers,
}) => {
    /* -------- state -------- */
    const [newLead, setNewLead] = useState({
        ...Data.EMPTY_LEAD,
        winProbability: 50,
        isContract: false,
        contractType: '',
        jsiSpecServicesType: 'New Quote',
        jsiRevisionQuoteNumber: '',
        jsiPastProjectInfo: '',
    });

    /* -------- helpers -------- */
    const updateField = useCallback((field, value) =>
        setNewLead(prev => ({ ...prev, [field]: value })), []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newLead.projectStatus) {
            alert('Please select a Project Stage before submitting.');
            return;
        }
        onSuccess(newLead);
    };

    /* products --------------------------------------------------- */
    const addProduct = useCallback((series) => {
        if (!series) return;
        setNewLead(prev => ({ ...prev, products: [...prev.products, { series, hasGlassDoors: false, materials: [], hasWoodBack: false, polyColor: '' }] }));
    }, []);

    const removeProduct = useCallback((idx) => setNewLead(prev => ({ ...prev, products: prev.products.filter((_, i) => i !== idx) })), []);
    const updateProductOption = (pi, key, value) => setNewLead(prev => ({ ...prev, products: prev.products.map((p, i) => i === pi ? { ...p, [key]: value } : p) }));
    const availableSeries = useMemo(() => Data.JSI_PRODUCT_SERIES.filter(s => !newLead.products.some(p => p.series === s)), [newLead.products]);

    /* competitors ------------------------------------------------ */
    const toggleCompetitor = useCallback((c) => setNewLead(prev => { const list = prev.competitors || []; const next = list.includes(c) ? list.filter(x => x !== c) : [...list, c]; return { ...prev, competitors: next }; }), []);

    /* lightweight sub-component for the two checkboxes ------------- */
    const CheckboxRow = ({ label, checked, onChange }) => (
        <div className="flex items-center justify-between text-sm px-3 py-2 rounded-full" style={{ backgroundColor: theme.colors.subtle }}>
            <label className="font-semibold" style={{ color: theme.colors.textSecondary }}>{label}</label>
            <input type="checkbox" className="h-5 w-5 rounded-md border-2" style={{ accentColor: theme.colors.accent, borderColor: theme.colors.border }} checked={checked} onChange={onChange} />
        </div>
    );

    /* -------- render -------- */
    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <PageTitle title="Create New Lead" theme={theme} />
            <div className="flex-1 px-4 pb-4 pt-4 space-y-4" style={{ overflow: 'visible' }}>
                <FormSection title="Project Details" theme={theme}>
                    <FormInput required label="Project Name" value={newLead.project} onChange={e => updateField('project', e.target.value)} placeholder="e.g., Acme Corp Headquarters" theme={theme} />
                    <PortalNativeSelect required label="Project Stage" value={newLead.projectStatus} onChange={e => updateField('projectStatus', e.target.value)} options={Data.STAGES.map(s => ({ label: s, value: s }))} placeholder="Select stage" theme={theme} />
                    <PortalNativeSelect required label="Vertical" value={newLead.vertical} onChange={e => updateField('vertical', e.target.value)} options={Data.VERTICALS.map(v => ({ label: v, value: v }))} placeholder="Select vertical" theme={theme} />
                    {newLead.vertical === 'Other (Please specify)' && (<div className="pl-4 animate-fade-in"><FormInput required value={newLead.otherVertical} onChange={e => updateField('otherVertical', e.target.value)} placeholder="Specify the vertical..." theme={theme} /></div>)}
                </FormSection>

                <FormSection title="Stakeholders" theme={theme}>
                    <AutoCompleteCombobox label="A&D Firm" required value={newLead.designFirm} onSelect={val => updateField('designFirm', val)} onChange={val => updateField('designFirm', val)} placeholder="Search or add a design firm..." options={designFirms} onAddNew={(f) => setDesignFirms(p => [...new Set([f, ...p])])} theme={theme} />
                    <AutoCompleteCombobox label="Dealer" required value={newLead.dealer} onSelect={val => updateField('dealer', val)} onChange={val => updateField('dealer', val)} placeholder="Search or add a dealer..." options={dealers} onAddNew={(d) => setDealers(p => [...new Set([d, ...p])])} theme={theme} />
                </FormSection>

                <FormSection title="Competition & Products" theme={theme}>
                    <div className="space-y-4">
                        <CheckboxRow label="Bid?" checked={!!newLead.isBid} onChange={e => updateField('isBid', e.target.checked)} />
                        <CheckboxRow label="Competition?" checked={!!newLead.competitionPresent} onChange={e => updateField('competitionPresent', e.target.checked)} />
                    </div>
                    {newLead.competitionPresent && (<div className="space-y-2 pt-4 border-t mt-4" style={{ borderColor: theme.colors.subtle }}><div className="p-2 flex flex-wrap gap-2 rounded-2xl" style={{ backgroundColor: theme.colors.subtle }}>{Data.COMPETITORS.filter(c => c !== 'None').map(c => (<button key={c} type="button" onClick={() => toggleCompetitor(c)} className="px-3 py-1.5 text-sm rounded-full font-medium transition-colors border" style={{ backgroundColor: newLead.competitors.includes(c) ? theme.colors.accent : theme.colors.surface, color: newLead.competitors.includes(c) ? theme.colors.surface : theme.colors.textPrimary, borderColor: newLead.competitors.includes(c) ? theme.colors.accent : theme.colors.border }}>{c}</button>))}</div></div>)}
                    <div className="pt-4 mt-2 space-y-3">
                        <div className="flex items-center justify-between px-3">
                            <label className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>Products</label>
                            <div className="w-1/2">{availableSeries.length > 0 && (<PortalNativeSelect value="" onChange={(e) => addProduct(e.target.value)} placeholder="+ Add" options={availableSeries.map(series => ({ label: series, value: series }))} theme={theme} />)}</div>
                        </div>
                        <div className="space-y-3">{newLead.products.map((p, idx) => (<div key={idx} className="space-y-2"><div className="flex items-center justify-between py-2 pl-4 pr-2 rounded-full" style={{ backgroundColor: theme.colors.subtle }}><span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{p.series}</span><button type="button" onClick={() => removeProduct(idx)} className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-red-500/10"><X className="w-5 h-5 text-red-500" /></button></div>{(p.series === 'Vision' || p.series === 'Knox' || p.series === 'Wink' || p.series === 'Hoopz') && (<div className="pl-4 animate-fade-in">{p.series === 'Vision' && <VisionOptions theme={theme} product={p} productIndex={idx} onUpdate={updateProductOption} />}{p.series === 'Knox' && <KnoxOptions theme={theme} product={p} productIndex={idx} onUpdate={updateProductOption} />}{(p.series === 'Wink' || p.series === 'Hoopz') && <WinkHoopzOptions theme={theme} product={p} productIndex={idx} onUpdate={updateProductOption} />}</div>)}</div>))}</div>
                    </div>
                </FormSection>

                <FormSection title="Financials & Timeline" theme={theme}>
                    <FormInput label="Estimated List Price" required type="currency" value={newLead.estimatedList} onChange={e => updateField('estimatedList', e.target.value)} placeholder="$0" theme={theme} />
                    <ProbabilitySlider value={newLead.winProbability} onChange={v => updateField('winProbability', v)} theme={theme} />
                    <PortalNativeSelect label="Discount" value={newLead.discount} onChange={e => updateField('discount', e.target.value)} options={Data.DISCOUNT_OPTIONS.map(d => ({ label: d, value: d }))} placeholder="Select a Discount" theme={theme} />
                    <PortalNativeSelect label="PO Timeframe" required value={newLead.poTimeframe} onChange={e => updateField('poTimeframe', e.target.value)} options={Data.PO_TIMEFRAMES.map(t => ({ label: t, value: t }))} placeholder="Select a Timeframe" theme={theme} />
                    <CheckboxRow label="Contract?" checked={!!newLead.isContract} onChange={e => updateField('isContract', e.target.checked)} />
                    {newLead.isContract && (<div className="animate-fade-in"><PortalNativeSelect required placeholder="Select a Contract" value={newLead.contractType} onChange={e => updateField('contractType', e.target.value)} options={Data.CONTRACT_OPTIONS.map(c => ({ label: c, value: c }))} theme={theme} /></div>)}
                </FormSection>

                <FormSection title="Services & Notes" theme={theme}>
                    <CheckboxRow label="JSI Spec Services Required?" checked={!!newLead.jsiSpecServices} onChange={e => updateField('jsiSpecServices', e.target.checked)} />
                    {newLead.jsiSpecServices && (<div className="animate-fade-in pt-4 space-y-4 border-t" style={{ borderColor: theme.colors.subtle }}><ToggleButtonGroup value={newLead.jsiSpecServicesType} onChange={(val) => updateField('jsiSpecServicesType', val)} options={[{ label: 'New Quote', value: 'New Quote' }, { label: 'Revision', value: 'Revision' }, { label: 'Past Project', value: 'Past Project' }]} theme={theme} />{newLead.jsiSpecServicesType === 'Revision' && (<FormInput label="Revision Quote #" value={newLead.jsiRevisionQuoteNumber} onChange={(e) => updateField('jsiRevisionQuoteNumber', e.target.value)} placeholder="Enter original quote #" theme={theme} required />)}{newLead.jsiSpecServicesType === 'Past Project' && (<FormInput label="Past Project Info" value={newLead.jsiPastProjectInfo} onChange={(e) => updateField('jsiPastProjectInfo', e.target.value)} placeholder="Enter past project name or #" theme={theme} required />)}</div>)}
                    <div className="pt-2"><FormInput label="Other Notes" type="textarea" value={newLead.notes} onChange={e => updateField('notes', e.target.value)} placeholder="Enter details..." theme={theme} /></div>
                </FormSection>

                <div className="pt-4 pb-4"><button type="submit" className="w-full text-white font-bold py-3.5 rounded-full" style={{ backgroundColor: theme.colors.accent }}>Submit Lead</button></div>
            </div>
        </form>
    );
};

export const KnoxOptions = ({ theme, product, productIndex, onUpdate }) => {
    return (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>Wood back?</label>
                <input
                    type="checkbox"
                    className="h-5 w-5 rounded-md border-2"
                    style={{ accentColor: theme.colors.accent, borderColor: theme.colors.border }}
                    checked={!!product.hasWoodBack}
                    onChange={(e) => onUpdate(productIndex, 'hasWoodBack', e.target.checked)}
                />
            </div>
        </div>
    );
};

export const VisionOptions = ({ theme, product, productIndex, onUpdate }) => {
    // This handler will now manage both Laminates and Veneers
    const handleMaterialToggle = (material) => {
        const currentMaterials = product.materials || [];
        const nextMaterials = currentMaterials.includes(material)
            ? currentMaterials.filter(m => m !== material)
            : [...currentMaterials, material];
        // The 'material' field is updated with the new array of selected materials.
        onUpdate(productIndex, 'materials', nextMaterials);
    };

    // A small sub-component for rendering the toggle buttons
    const MaterialButtonGroup = ({ label, options }) => (
        <div>
            <p className="text-sm font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>{label}</p>
            <div className="flex flex-wrap gap-2">
                {options.map(opt => {
                    const isSelected = product.materials?.includes(opt);
                    return (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => handleMaterialToggle(opt)}
                            className="px-3 py-1.5 text-sm rounded-full font-medium transition-colors border"
                            style={{
                                backgroundColor: isSelected ? theme.colors.accent : theme.colors.surface,
                                color: isSelected ? theme.colors.surface : theme.colors.textPrimary,
                                borderColor: isSelected ? theme.colors.accent : theme.colors.border,
                            }}
                        >
                            {opt}
                        </button>
                    )
                })}
            </div>
        </div>
    );

    return (
        <div className="space-y-4 mt-3 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
            {/* Cleaner Checkbox Layout */}
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: theme.colors.background }}>
                <label className="font-semibold" style={{ color: theme.colors.textPrimary }}>Glass Doors?</label>
                <input
                    type="checkbox"
                    className="h-5 w-5 rounded-md border-2"
                    style={{ accentColor: theme.colors.accent, borderColor: theme.colors.border }}
                    checked={!!product.hasGlassDoors}
                    onChange={(e) => onUpdate(productIndex, 'hasGlassDoors', e.target.checked)}
                />
            </div>

            {/* Grouped Toggle Buttons for Materials */}
            <div className="space-y-4">
                <MaterialButtonGroup label="Laminate" options={Data.JSI_LAMINATES} />
                <MaterialButtonGroup label="Veneer" options={Data.JSI_VENEERS} />
            </div>
        </div>
    );
};

export const WinkHoopzOptions = ({ theme, product, productIndex, onUpdate }) => {
    return (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
            {/* Swapped NativeSelect for the working PortalNativeSelect */}
            <PortalNativeSelect
                label="Select poly"
                value={product.polyColor}
                onChange={(e) => onUpdate(productIndex, 'polyColor', e.target.value)}
                placeholder="Select a poly color"
                theme={theme}
                options={Data.JSI_POLY_COLORS.map(c => ({ value: c, label: c }))}
            />
        </div>
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
            {/* The main PageTitle has been removed */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-hide">
                {Data.RESOURCES_DATA.map(category => (
                    <GlassCard key={category.category} theme={theme} className="p-4">
                        {/* The header font size is now larger (text-2xl) */}
                        <h2 className="text-2xl font-bold mb-2 pb-3 border-b" style={{ color: theme.colors.textPrimary, borderColor: theme.colors.subtle }}>
                            {category.category}
                        </h2>
                        <div className="space-y-1">
                            {category.items.map((item, index) => {
                                const Icon = resourceIcons[item.label] || Database;
                                return (
                                    <React.Fragment key={item.nav}>
                                        {index > 0 && <div className="border-t mx-3" style={{ borderColor: theme.colors.subtle }} />}
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
                ))}
            </div>
        </div>
    );
};

export const ProjectDetailModal = ({ opportunity, onClose, theme, onUpdate }) => {
    const [editedOpp, setEditedOpp] = useState(null);

    useEffect(() => {
        // When a new opportunity is selected, populate the form state
        if (opportunity) {
            setEditedOpp({
                ...opportunity,
                // Ensure value is a plain number for the currency input
                value: parseInt(String(opportunity.value).replace(/[^0-9]/g, ''))
            });
        }
    }, [opportunity]);

    if (!editedOpp) return null;

    const handleChange = (field, value) => {
        setEditedOpp(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onUpdate(editedOpp);
        onClose();
    };

    return (
        <Modal show={!!opportunity} onClose={onClose} title="Edit Project Details" theme={theme}>
            <div className="space-y-4">
                <FormInput
                    label="Project Name"
                    value={editedOpp.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    theme={theme}
                />
                {/* FIX: Replaced NativeSelect with PortalNativeSelect */}
                <PortalNativeSelect
                    label="Stage"
                    value={editedOpp.stage}
                    onChange={(e) => handleChange('stage', e.target.value)}
                    options={Data.STAGES.map(s => ({ value: s, label: s }))}
                    placeholder="Select Stage"
                    theme={theme}
                />
                <FormInput
                    label="Company"
                    value={editedOpp.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    theme={theme}
                />
                <FormInput
                    label="Value"
                    type="currency"
                    value={editedOpp.value}
                    onChange={(e) => handleChange('value', e.target.value)}
                    theme={theme}
                />
                {/* FIX: Replaced NativeSelect with PortalNativeSelect */}
                <PortalNativeSelect
                    label="PO Timeframe"
                    value={editedOpp.poTimeframe}
                    onChange={(e) => handleChange('poTimeframe', e.target.value)}
                    options={Data.PO_TIMEFRAMES.map(t => ({ value: t, label: t }))}
                    placeholder="Select Timeframe"
                    theme={theme}
                />
                <FormInput
                    label="Discount"
                    value={editedOpp.discount}
                    onChange={(e) => handleChange('discount', e.target.value)}
                    theme={theme}
                />
                <ProbabilitySlider
                    value={editedOpp.winProbability || 50}
                    onChange={(val) => handleChange('winProbability', val)}
                    theme={theme}
                />
                <div className="flex justify-end space-x-3 pt-4 border-t" style={{ borderColor: theme.colors.subtle }}>
                    <button onClick={onClose} className="px-4 py-2 rounded-lg font-semibold" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 rounded-lg font-semibold text-white" style={{ backgroundColor: theme.colors.accent }}>Save</button>
                </div>
            </div>
        </Modal>
    );
};

export const ProjectsScreen = ({
    onNavigate,
    theme,
    opportunities,
    setSelectedOpportunity,
    myProjects,
    setSelectedProject
}) => {
    const [projectsTab, setProjectsTab] = useState('pipeline');
    const [selectedPipelineStage, setSelectedPipelineStage] = useState('Discovery');
    const [productSearch, setProductSearch] = useState(''); // State for the product search input

    const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const stageButtonRefs = useRef([]);

    useEffect(() => {
        const stageIndex = Data.STAGES.findIndex(s => s === selectedPipelineStage);
        const buttonEl = stageButtonRefs.current[stageIndex];
        if (buttonEl) {
            setPillStyle({
                left: buttonEl.offsetLeft,
                width: buttonEl.offsetWidth,
                opacity: 1,
            });
        }
    }, [selectedPipelineStage]);

    const handleAddClick = () => {
        if (projectsTab === 'pipeline') {
            onNavigate('new-lead');
        } else {
            onNavigate('add-new-install');
        }
    };

    const addProduct = useCallback((series) => {
        if (!series) return;
        setNewLead(prev => ({
            ...prev,
            products: [...prev.products, { series, hasGlassDoors: false, material: '' }],
        }));
    }, []);

    const availableSeries = useMemo(
        () => Data.JSI_PRODUCT_SERIES.filter(s =>
            !opportunities.flatMap(o => o.products || []).some(p => p.series === s)
        ),
        [opportunities]
    );

    const filteredOpportunities = useMemo(() => {
        if (!opportunities) return [];
        return opportunities.filter(opp => opp.stage === selectedPipelineStage);
    }, [selectedPipelineStage, opportunities]);

    return (
        <div className="h-full flex flex-col">
            <PageTitle title="Projects" theme={theme}>
                <button
                    onClick={handleAddClick}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                >
                    <div className="relative h-5 w-[110px] flex items-center justify-center">
                        <span className={`absolute transition-opacity duration-300 ${projectsTab === 'pipeline' ? 'opacity-100' : 'opacity-0'}`}>New Lead</span>
                        <span className={`absolute transition-opacity duration-300 ${projectsTab === 'my-projects' ? 'opacity-100' : 'opacity-0'}`}>Add New Install</span>
                    </div>
                    <Plus className="w-4 h-4" />
                </button>
            </PageTitle>

            <div className="px-4 space-y-3">
                <GlassCard theme={theme} className="relative flex p-1 rounded-full overflow-hidden">
                    <div className="absolute top-1 bottom-1 rounded-full transition-transform duration-300 ease-in-out" style={{ backgroundColor: theme.colors.accent, width: 'calc(50% - 4px)', transform: projectsTab === 'pipeline' ? 'translateX(4px)' : 'translateX(calc(100% + 4px))' }} />
                    <button onClick={() => setProjectsTab('pipeline')} className="flex-1 py-2 text-sm font-semibold rounded-full transition-colors duration-300 relative z-10" style={{ color: projectsTab === 'pipeline' ? theme.colors.surface : theme.colors.textPrimary }}>Pipeline</button>
                    <button onClick={() => setProjectsTab('my-projects')} className="flex-1 py-2 text-sm font-semibold rounded-full transition-colors duration-300 relative z-10" style={{ color: projectsTab === 'my-projects' ? theme.colors.surface : theme.colors.textPrimary }}>My Projects</button>
                </GlassCard>

                {projectsTab === 'pipeline' && (
                    <GlassCard theme={theme} className="p-1">
                        <div className="relative flex space-x-2 overflow-x-auto scrollbar-hide">
                            <div className="absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-in-out" style={{ backgroundColor: theme.colors.accent, left: pillStyle.left, width: pillStyle.width, opacity: pillStyle.opacity }} />
                            {Data.STAGES.map((stage, index) => (
                                <button key={stage} ref={el => (stageButtonRefs.current[index] = el)} onClick={() => setSelectedPipelineStage(stage)} className="relative z-10 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors flex-shrink-0" style={{ color: selectedPipelineStage === stage ? theme.colors.surface : theme.colors.textSecondary }}>
                                    {stage}
                                </button>
                            ))}
                        </div>
                    </GlassCard>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-3 scrollbar-hide">
                {projectsTab === 'pipeline' ? (
                    filteredOpportunities.length > 0 ? (
                        filteredOpportunities.map(opp => (
                            <GlassCard key={opp.id} theme={theme} className="overflow-hidden p-4 cursor-pointer hover:border-gray-400/50" onClick={() => setSelectedOpportunity(opp)}>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{opp.name}</h3>
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${Data.STAGE_COLORS[opp.stage]}`}>{opp.stage}</span>
                                </div>
                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{opp.company}</p>
                                <p className="font-semibold text-2xl my-2" style={{ color: theme.colors.textPrimary }}>{opp.value}</p>
                            </GlassCard>
                        ))
                    ) : (
                        <p className="text-center text-sm p-8" style={{ color: theme.colors.textSecondary }}>No projects in this stage.</p>
                    )
                ) : (
                    myProjects && myProjects.length > 0 ? (
                        myProjects.map(project => (
                            <GlassCard key={project.id} theme={theme} className="p-0 overflow-hidden cursor-pointer group" onClick={() => setSelectedProject(project)}>
                                <div className="relative aspect-video w-full">
                                    <img src={project.image} alt={project.name} className="absolute h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-4">
                                        <h3 className="text-2xl font-bold text-white tracking-tight">{project.name}</h3>
                                        <p className="text-white/80 font-medium">{project.location}</p>
                                    </div>
                                </div>
                            </GlassCard>
                        ))
                    ) : (
                        <p className="text-center text-sm p-8" style={{ color: theme.colors.textSecondary }}>No projects added yet.</p>
                    )
                )}
            </div>
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

            <GlassCard theme={theme} className="p-4">
                <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
                    {dataSorted.map((p, i) => (
                        <button
                            key={p.id}
                            onClick={() => setIndex(i)}
                            className={`flex-shrink-0 w-24 h-24 rounded-2xl border-2 transition-all duration-150 bg-white overflow-hidden ${i === index ? 'border-blue-500' : 'border-transparent opacity-70'} hover:opacity-100`}
                        >
                            <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover scale-150"
                            />
                        </button>
                    ))}
                </div>
            </GlassCard>

            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <img
                    src={selected.image}
                    alt={selected.name}
                    className="absolute w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                <button
                    onClick={() => onNavigate(`products/competitive-analysis/${categoryId}`)}
                    className="absolute bottom-4 right-4 flex items-center space-x-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md hover:bg-white/60 transition-colors border border-white/50"
                >
                    <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>Competition</span>
                    <ArrowRight className="w-4 h-4" style={{ color: theme.colors.textPrimary }} />
                </button>

                <div className="absolute bottom-4 left-4">
                    <h2 className="text-2xl font-bold text-white drop-shadow-md mb-1">{selected.name}</h2>
                    <p className="text-3xl font-bold text-white drop-shadow-md">{money(selected.basePrice?.list)}</p>
                </div>
            </div>

            <GlassCard theme={theme} className="p-4 space-y-3">
                <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: theme.colors.subtle }}>
                    <span className="font-semibold" style={{ color: theme.colors.textSecondary }}>Series</span>
                    <span className="font-semibold text-right" style={{ color: theme.colors.textSecondary }}>List $</span>
                </div>

                {dataSorted.map(item => {
                    const isSelected = item.id === selected.id;
                    return (
                        <div key={item.id} className="flex justify-between items-center py-1">
                            <span
                                className={isSelected ? 'font-bold text-lg' : 'text-base'}
                                style={{ color: isSelected ? theme.colors.textPrimary : theme.colors.textSecondary }}
                            >
                                {item.name}
                            </span>
                            <span
                                className={isSelected ? 'font-bold text-lg' : 'text-base'}
                                style={{ color: isSelected ? theme.colors.accent : theme.colors.textSecondary }}
                            >
                                {money(item.basePrice?.list)}
                            </span>
                        </div>
                    );
                })}
            </GlassCard>
        </div>
    );
};

export const CompetitiveAnalysisScreen = ({ theme, currentScreen, setSuccessMessage }) => {
    const categoryId = currentScreen?.split('/')?.[2] || 'casegoods';
    const data = Data.COMPETITIVE_DATA?.[categoryId];

    // State for the new modal and form
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [newCompetitor, setNewCompetitor] = useState({ manufacturer: '', series: '', notes: '' });
    const [attachment, setAttachment] = useState(null);

    if (!data?.typicals?.length) {
        return <PlaceholderScreen theme={theme} category="Competitive Analysis" />;
    }

    const [selected, setSelected] = React.useState(data.typicals[0]);

    // Format categoryId for the title (e.g., "casegoods" -> "Casegoods Analysis")
    const heading = (categoryId.charAt(0).toUpperCase() + categoryId.slice(1)) + ' Analysis';

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

    const sortedCompetitors = React.useMemo(() => {
        const ourPrice = getPrice(selected, 'lam'); // Using laminate as the baseline for sorting
        return data.competitors
            .map(c => ({
                ...c,
                price: Math.round(ourPrice * c.factor),
                adv: pctAdv(ourPrice, Math.round(ourPrice * c.factor)),
            }))
            .sort((a, b) => b.adv - a.adv);
    }, [selected, data.competitors]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setNewCompetitor(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
        }
    };

    const handleSubmitRequest = (e) => {
        e.preventDefault();
        console.log({ ...newCompetitor, attachment });

        setSuccessMessage('Request sent to the sales team!');
        setShowRequestModal(false);
        setNewCompetitor({ manufacturer: '', series: '', notes: '' });
        setAttachment(null);
    };

    const AdvantageChip = ({ value }) => (
        <span className={`px-2.5 py-1 text-sm font-bold rounded-full ${value > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {value > 0 ? `+${value}%` : `${value}%`}
        </span>
    );

    return (
        <div className="flex flex-col h-full">
            <PageTitle title={heading} theme={theme} />

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-hide">
                <GlassCard theme={theme} className="p-4">
                    <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
                        {data.typicals.map(t => (
                            <button key={t.id} onClick={() => setSelected(t)}
                                className={`flex-shrink-0 w-24 h-24 rounded-2xl border-2 transition-all duration-150 p-1 bg-white overflow-hidden
                                    ${selected.id === t.id ? 'border-blue-500' : 'border-transparent opacity-70'} hover:opacity-100`}>
                                <img src={t.image} alt={t.name} className="w-full h-full object-cover scale-150" />
                            </button>
                        ))}
                    </div>
                </GlassCard>

                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg group">
                    <img src={selected.image} alt={selected.name} loading="lazy"
                        className="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    {/* The dark overlay div that was here has been removed */}
                </div>

                <GlassCard theme={theme} className="px-6 py-4 space-y-1">
                    {/* Table Header */}
                    <div className="grid grid-cols-3 gap-4 pb-2 text-sm font-semibold border-b" style={{ borderColor: theme.colors.border }}>
                        <div style={{ color: theme.colors.textSecondary }}>Series</div>
                        <div className="text-right" style={{ color: theme.colors.textSecondary }}>Laminate</div>
                        <div className="text-right" style={{ color: theme.colors.textSecondary }}>Adv.</div>
                    </div>

                    {/* JSI Row */}
                    <div className="grid grid-cols-3 gap-4 py-3 rounded-lg" style={{ backgroundColor: theme.colors.subtle }}>
                        <div className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{selected.name}</div>
                        <div className="font-bold text-lg text-right" style={{ color: theme.colors.textPrimary }}>{money(getPrice(selected, 'lam'))}</div>
                        <div />
                    </div>

                    {/* Competitor Rows */}
                    {sortedCompetitors.map(c => (
                        <div key={c.name} className="grid grid-cols-3 gap-4 py-3 border-t" style={{ borderColor: theme.colors.border }}>
                            <div className="font-medium" style={{ color: theme.colors.textSecondary }}>{c.name}</div>
                            <div className="font-medium text-right" style={{ color: theme.colors.textSecondary }}>{money(c.price)}</div>
                            <div className="text-right"><AdvantageChip value={c.adv} /></div>
                        </div>
                    ))}
                </GlassCard>

                <div className="pt-2">
                    <button
                        onClick={() => setShowRequestModal(true)}
                        className="w-full font-bold py-3.5 px-6 rounded-full text-white"
                        style={{ backgroundColor: theme.colors.accent }}
                    >
                        Request New Competitor
                    </button>
                </div>
            </div>

            <Modal show={showRequestModal} onClose={() => setShowRequestModal(false)} title="Request New Competitor" theme={theme}>
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                    <FormInput
                        label="Manufacturer"
                        name="manufacturer"
                        value={newCompetitor.manufacturer}
                        onChange={handleFormChange}
                        placeholder="Enter manufacturer..."
                        theme={theme}
                        required
                    />
                    <FormInput
                        label="Series"
                        name="series"
                        value={newCompetitor.series}
                        onChange={handleFormChange}
                        placeholder="Enter series..."
                        theme={theme}
                        required
                    />
                    <FormInput
                        label="Notes"
                        name="notes"
                        type="textarea"
                        value={newCompetitor.notes}
                        onChange={handleFormChange}
                        placeholder="Any details are helpful. Links to the product page are especially valuable."
                        theme={theme}
                    />
                    <div>
                        <label
                            htmlFor="file-upload"
                            className="w-full flex items-center justify-center space-x-2 py-3 rounded-full cursor-pointer"
                            style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
                        >
                            <Paperclip className="w-4 h-4" />
                            <span className="font-semibold text-sm">
                                {attachment ? attachment.name : 'Add Attachment'}
                            </span>
                        </label>
                        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="w-full font-bold py-3 px-6 rounded-full text-white" style={{ backgroundColor: theme.colors.accent }}>
                            Submit Request
                        </button>
                    </div>
                </form>
            </Modal>
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

export const CommunityScreen = ({ theme, onNavigate, openCreateContentModal, posts, polls, likedPosts, onToggleLike, pollChoices, onPollVote }) => {
    const [tab, setTab] = useState('feed');

    const combinedFeed = useMemo(() => {
        // The feed now only combines posts and sorts them.
        return [...posts].sort((a, b) => b.id - a.id);
    }, [posts]);

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex items-center justify-between px-4">
                <PageTitle title="Community" theme={theme} />
                <button
                    onClick={openCreateContentModal}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-transform hover:scale-105 active:scale-95"
                    style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                >
                    <span>Create Post</span>
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-2 border-b border-[rgba(0,0,0,0.06)] mx-4 mt-2">
                {['feed', 'polls'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`py-2 w-full text-center text-sm font-medium capitalize ${tab === t ? 'border-b-2' : ''}`}
                        style={{
                            color: tab === t ? theme.colors.accent : theme.colors.textSecondary,
                            borderColor: tab === t ? theme.colors.accent : 'transparent',
                        }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6 pt-6 space-y-6 max-w-md mx-auto scrollbar-hide">
                {tab === 'feed' && combinedFeed.map((item) => (
                    <PostCard
                        key={`post-${item.id}`}
                        post={item}
                        theme={theme}
                        isLiked={!!likedPosts[item.id]} // Pass whether this post is liked
                        onToggleLike={onToggleLike} // Pass the like toggle handler
                    />
                ))}
                {tab === 'polls' && polls.map((p) => (
                    <PollCard
                        key={`poll-${p.id}`}
                        poll={p}
                        theme={theme}
                        userChoice={pollChoices[p.id]} // Pass the user's choice for this poll
                        onVote={onPollVote} // Pass the poll vote handler
                    />
                ))}
            </div>
        </div>
    );
};

export const SamplesScreen = ({ theme, onNavigate, cart, onUpdateCart, userSettings }) => {
    const [selectedCategory, setSelectedCategory] = useState('tfl');

    // Manage category slider pill
    const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const buttonRefs = useRef([]);
    const containerRef = useRef(null);

    useEffect(() => {
        const idx = Data.SAMPLE_CATEGORIES.findIndex(c => c.id === selectedCategory);
        const btn = buttonRefs.current[idx];
        if (btn) setPillStyle({ left: btn.offsetLeft, width: btn.offsetWidth, opacity: 1 });
    }, [selectedCategory]);

    // Handlers
    const handleAddSetToCart = useCallback(() => {
        const categoryName = Data.SAMPLE_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Unknown';
        onUpdateCart(
            { id: `set-${selectedCategory}`, name: `Complete ${categoryName} Set` },
            1
        );
    }, [selectedCategory, onUpdateCart]);

    const handleOrderFullSet = useCallback(
        () => onUpdateCart({ id: 'full-jsi-set', name: 'Full JSI Sample Set' }, 1),
        [onUpdateCart]
    );

    const totalCartItems = useMemo(
        () => Object.values(cart).reduce((sum, qty) => sum + qty, 0),
        [cart]
    );

    const filteredProducts = useMemo(
        () => Data.SAMPLE_PRODUCTS.filter(p => p.category === selectedCategory),
        [selectedCategory]
    );

    const setInCartQuantity = cart[`set-${selectedCategory}`] || 0;

    return (
        <>
            <PageTitle title="Samples" theme={theme}>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleOrderFullSet}
                        className="px-4 py-2 rounded-full text-sm font-semibold transition-transform hover:scale-105 active:scale-95"
                        style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                    >
                        Order Full JSI Sample Set
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

            <div className="px-4 mb-4">
                <GlassCard theme={theme} className="p-1">
                    <div
                        ref={containerRef}
                        className="relative flex space-x-2 overflow-x-auto scrollbar-hide whitespace-nowrap"
                    >
                        <div
                            className="absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-in-out"
                            style={{
                                backgroundColor: theme.colors.accent,
                                left: pillStyle.left,
                                width: pillStyle.width,
                                opacity: pillStyle.opacity
                            }}
                        />
                        {Data.SAMPLE_CATEGORIES.map((cat, index) => (
                            <button
                                key={cat.id}
                                ref={el => (buttonRefs.current[index] = el)}
                                onClick={() => setSelectedCategory(cat.id)}
                                className="relative z-10 px-4 py-2 rounded-full font-semibold text-sm transition-colors duration-300"
                                style={{
                                    color:
                                        selectedCategory === cat.id
                                            ? theme.colors.surface
                                            : theme.colors.textPrimary
                                }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </GlassCard>
            </div>

            <div className="px-4 mb-4">
                <div className="relative">
                    <button
                        onClick={handleAddSetToCart}
                        className="w-full py-2.5 rounded-full text-sm font-semibold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
                        style={{
                            backgroundColor: theme.colors.accent,
                        }}
                    >
                        Add Complete {Data.SAMPLE_CATEGORIES.find(c => c.id === selectedCategory)?.name} Set
                    </button>
                    {setInCartQuantity > 0 && (
                        <div
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow"
                            style={{
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.accent,
                                border: `1px solid ${theme.colors.border}`
                            }}
                        >
                            {setInCartQuantity}
                        </div>
                    )}
                </div>
            </div>

            <div className="px-4 grid grid-cols-2 gap-4 pb-4">
                {filteredProducts.map(product => {
                    const quantity = cart[product.id] || 0;
                    return (
                        <div
                            key={product.id}
                            className="relative w-full aspect-square rounded-2xl overflow-hidden transition-colors"
                            style={{
                                border: `2px solid ${quantity > 0 ? theme.colors.accent : theme.colors.border}`,
                                backgroundColor: product.color
                            }}
                        >
                            <div
                                className="absolute top-2 left-2 bg-white bg-opacity-75 px-2 py-1 rounded text-xs font-semibold"
                                style={{ color: theme.colors.textPrimary }}
                            >
                                {product.name}
                            </div>

                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28">
                                <GlassCard theme={theme} className="p-1 flex justify-around items-center">
                                    {quantity === 0 ? (
                                        <button onClick={() => onUpdateCart(product, 1)} className="w-full h-7 flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
                                            <Plus className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                                        </button>
                                    ) : (
                                        <>
                                            <button onClick={(e) => { e.stopPropagation(); onUpdateCart(product, -1); }} className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                                                {quantity === 1 ? (
                                                    <Trash2 className="w-5 h-5 text-red-500" />
                                                ) : (
                                                    <Minus className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                                                )}
                                            </button>
                                            <span className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                                                {quantity}
                                            </span>
                                            <button onClick={(e) => { e.stopPropagation(); onUpdateCart(product, 1); }} className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                                                <Plus className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                                            </button>
                                        </>
                                    )}
                                </GlassCard>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export const ReplacementsScreen = ({ theme, setSuccessMessage, onNavigate }) => {
    const [formData, setFormData] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef(null);

    const handleEnterManually = () => {
        setFormData({ so: '', lineItem: '', notes: '' });
    };

    const handleScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setFormData({ so: 'SO-450080', lineItem: '001', notes: '' });
            setIsScanning(false);
        }, 1500);
    };

    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
    }, []);

    const handleFileChange = e => e.target.files && setAttachments(p => [...p, ...Array.from(e.target.files)]);
    const removeAttachment = photoIndex => setAttachments(p => p.filter((_, idx) => idx !== photoIndex));

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
                <GlassCard theme={theme} className="p-4">
                    {!formData ? (
                        <div className="text-center space-y-4">
                            <button onClick={handleScan} disabled={isScanning} className="w-full flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed hover:bg-white/5 transition-colors" style={{ borderColor: theme.colors.accent, color: theme.colors.accent }}>
                                <Camera className={`w-12 h-12 mb-2 ${isScanning ? 'animate-pulse' : ''}`} />
                                <span className="font-semibold">{isScanning ? 'Scanning...' : 'Scan QR Code'}</span>
                            </button>
                            <div className="flex items-center my-4">
                                <div className="flex-grow border-t" style={{ borderColor: theme.colors.subtle }} />
                                <span className="mx-4 text-xs uppercase" style={{ color: theme.colors.textSecondary }}>Or</span>
                                <div className="flex-grow border-t" style={{ borderColor: theme.colors.subtle }} />
                            </div>
                            <button onClick={handleEnterManually} className="font-semibold py-2 px-4 hover:underline transition-colors" style={{ color: theme.colors.accent }}>
                                Enter Details Manually
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <FormInput label="Sales Order" name="so" value={formData.so} onChange={handleFormChange} theme={theme} />
                            <FormInput label="Line Item" name="lineItem" value={formData.lineItem} onChange={handleFormChange} theme={theme} />
                            <FormInput type="textarea" label="Notes" name="notes" value={formData.notes} onChange={handleFormChange} placeholder="Describe the issue or parts needed..." theme={theme} />

                            {/* Redesigned Photo Upload Section */}
                            <div>
                                <label className="text-xs font-semibold px-1" style={{ color: theme.colors.textSecondary }}>Photos</label>
                                <div className="mt-1 p-4 rounded-3xl min-h-[120px] flex flex-wrap gap-3" style={{ backgroundColor: theme.colors.subtle }}>
                                    {attachments.map((file, idx) => (
                                        <div key={idx} className="relative w-20 h-20">
                                            <img src={URL.createObjectURL(file)} alt={`preview-${idx}`} className="w-full h-full object-cover rounded-lg shadow-md" />
                                            <button onClick={() => removeAttachment(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => fileInputRef.current.click()} className="w-20 h-20 flex flex-col items-center justify-center rounded-lg border-2 border-dashed" style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}>
                                        <ImageIcon className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-semibold">Add Photo</span>
                                    </button>
                                </div>
                                <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                            </div>

                            <button onClick={handleSubmit} className="mt-8 w-full py-3.5 rounded-full font-bold transition-colors text-white" style={{ backgroundColor: theme.colors.accent }}>
                                Submit Request
                            </button>
                        </div>
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

export const MyProjectDetailModal = ({ project, onClose, theme }) => {
    if (!project) return null;

    return (
        <Modal show={!!project} onClose={onClose} title="" theme={theme}>
            <div className="space-y-4">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                    <img
                        src={project.image}
                        alt={project.name}
                        className="absolute w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-3xl font-bold text-white drop-shadow-md">{project.name}</h2>
                        <p className="text-lg font-medium text-white/90 drop-shadow-md">{project.location}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-full font-bold py-3 px-6 rounded-full text-white"
                    style={{ backgroundColor: theme.colors.accent }}
                >
                    Close
                </button>
            </div>
        </Modal>
    );
};

export const AddNewInstallScreen = ({ theme, setSuccessMessage, onAddInstall, onBack }) => {
    const [projectName, setProjectName] = useState('');
    const [location, setLocation] = useState('');
    const [photos, setPhotos] = useState([]);
    const fileInputRef = useRef(null);
    const [predictions, setPredictions] = useState([]);
    const [showPredictions, setShowPredictions] = useState(false);
    const autocompleteService = useRef(null);

    useEffect(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
        }
    }, []);

    const handleLocationChange = (e) => {
        const value = e.target.value;
        setLocation(value);
        if (autocompleteService.current && value) {
            autocompleteService.current.getPlacePredictions({
                input: value,
                types: ['(cities)']
            }, (preds) => {
                setPredictions(preds || []);
                setShowPredictions(true);
            });
        } else {
            setPredictions([]);
            setShowPredictions(false);
        }
    };

    const handleSelectPrediction = (prediction) => {
        setLocation(prediction.description);
        setPredictions([]);
        setShowPredictions(false);
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setPhotos(p => [...p, ...Array.from(e.target.files)]);
        }
    };

    const removePhoto = (photoIndex) => {
        setPhotos(p => p.filter((_, idx) => idx !== photoIndex));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (projectName && location && photos.length > 0) {
            const newInstall = {
                name: projectName,
                location: location,
                image: URL.createObjectURL(photos[0])
            };
            onAddInstall(newInstall);
        } else {
            alert('Please fill out all fields and add at least one photo.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <PageTitle title="Add New Install" theme={theme} />
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-hide">
                <GlassCard theme={theme} className="p-4 space-y-4">
                    <FormInput
                        label="Project Name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="e.g., Acme Corp HQ"
                        theme={theme}
                        required
                    />
                    <div className="relative">
                        <FormInput
                            label="Location"
                            value={location}
                            onChange={handleLocationChange}
                            placeholder="e.g., Jasper, IN" // Updated placeholder
                            theme={theme}
                            required
                        />
                        {showPredictions && predictions.length > 0 && (
                            <GlassCard theme={theme} className="absolute w-full mt-1 z-10 p-1">
                                {predictions.map(p => (
                                    <button
                                        key={p.place_id}
                                        type="button"
                                        onClick={() => handleSelectPrediction(p)}
                                        className="block w-full text-left p-2 rounded-md hover:bg-black/5"
                                        style={{ color: theme.colors.textPrimary }}
                                    >
                                        {p.description}
                                    </button>
                                ))}
                            </GlassCard>
                        )}
                    </div>
                    {/* Redesigned Photo Upload Section */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                            {photos.map((file, idx) => (
                                <div key={idx} className="relative aspect-square">
                                    <img src={URL.createObjectURL(file)} alt={`preview-${idx}`} className="w-full h-full object-cover rounded-xl shadow-md" />
                                    <button type="button" onClick={() => removePhoto(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={() => fileInputRef.current.click()} className="w-full flex items-center justify-center space-x-2 py-3 rounded-full" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>
                            <ImageIcon className="w-5 h-5" />
                            <span className="font-semibold">Add Photo</span>
                        </button>
                        <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>
                </GlassCard>
                <div className="pt-2">
                    <button type="submit" className="w-full font-bold py-3.5 px-6 rounded-full text-white" style={{ backgroundColor: theme.colors.accent }}>
                        Submit Install
                    </button>
                </div>
            </div>
        </form>
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
    'customer-rank': CustomerRankingScreen,
    'commissions': CommissionsScreen,
    'incentive-rewards': IncentiveRewardsScreen,
    resources: ResourcesScreen,
    fabrics: FabricsScreen,
    'fabrics/search_form': SearchFormScreen,
    'fabrics/com_request': COMRequestScreen,
    'resources/commission_rates': CommissionRatesScreen,
    'resources/loaner_pool': LoanerPoolScreen,
    'resources/dealer_registration': DealerRegistrationScreen,
    'resources/request_field_visit': RequestFieldVisitScreen,
    'resources/sample_discounts': SampleDiscountsScreen,
    'resources/dealer_directory': DealerDirectoryScreen,
    'resources/contracts': ContractsScreen,
    'resources/design_days': DesignDaysScreen,
    'resources/discontinued_finishes': DiscontinuedFinishesScreen,
    'resources/install_instructions': InstallInstructionsScreen,
    'resources/lead-times': LeadTimesScreen,
    'resources/presentations': PresentationsScreen,
    'resources/social_media': SocialMediaScreen,
    projects: ProjectsScreen,
    AddNewInstallScreen: AddNewInstallScreen,
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
    'add-new-install': AddNewInstallScreen,
};

export {
    Avatar,
    SuccessToast,
    MonthlyBarChart,
    MonthlyTable,
    RecentPOsCard,
    Modal,
    SearchFormScreen,
    COMRequestScreen,

    // “Rep Functions” screens
    RequestFieldVisitScreen,

    InstallInstructionsScreen,
    PresentationsScreen,
    SocialMediaScreen,

    // Other app screens
    SettingsScreen,
    HelpScreen,
    LogoutScreen,
    FeedbackScreen,

    // The navigation map
    SCREEN_MAP,
};
