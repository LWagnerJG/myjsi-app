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

import { Combobox as AutoCompleteCombobox, Listbox } from '@headlessui/react';

import PageTitle from './PageTitle';
import GlassCard from './GlassCard';
import FormInput from './FormInput';
import OrderModal from './OrderModal';
import CommissionRatesScreen from './CommissionRatesScreen';


const logoLight = 'https://i.imgur.com/qskYhB0.png';

const lightTheme = {
    colors: {
        background: '#F3F2EF',
        surface: 'rgba(255,255,255,0.92)',
        primary: '#003366',
        accent: '#003366',
        accentHover: '#002244',
        secondary: '#7A7A7A',
        subtle: '#E6E4DC',
        textPrimary: '#111111',
        textSecondary: '#555555',
        border: 'rgba(0,0,0,0.05)',
        shadow: 'rgba(0,0,0,0.10)',
        card: 'rgba(255,255,255,0.92)',
    },
    backdropFilter: 'blur(12px)',
};

const darkTheme = {
    colors: {
        background: '#1E1E1E',
        surface: 'rgba(40,40,40,0.85)',
        primary: '#BBBBBB',
        accent: '#BBBBBB',
        accentHover: '#EEEEEE',
        secondary: '#999999',
        subtle: '#2A2A2A',
        textPrimary: '#F5F5F5',
        textSecondary: '#CCCCCC',
        border: 'rgba(255,255,255,0.08)',
        shadow: 'rgba(0,0,0,0.25)',
        card: 'rgba(60,60,60,0.85)',
    },
    backdropFilter: 'blur(12px)',
};

if (!document.getElementById('jsi-global-css')) {
    const s = document.createElement('style');
    s.id = 'jsi-global-css';
    s.innerHTML = `
    :root{
      font-family:"Inter var",system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
      font-size:15px;
      --stone:#E6E4DC;
    }
    body{background:#F3F2EF;color:#111;margin:0;}
    h1,h2,h3,h4,h5,h6{font-weight:600;letter-spacing:-0.01em;margin:0;}
    .hero-title{font-size:3rem;line-height:1;font-weight:800;}
    .section-band{background:var(--stone);}
    .chip{font-variant-numeric:tabular-nums;font-size:.75rem;padding:.125rem .5rem;border-radius:.75rem;display:inline-flex;align-items:center;font-weight:500}
    .chip.pos{background:#16a34a20;color:#16a34a;}
    .chip.neg{background:#dc262620;color:#dc2626;}
    .chip.neu{background:#bfbfbf20;color:#6b7280;}
  `;
    document.head.appendChild(s);
}



const MY_PROJECTS_DATA = [
    { id: 'proj1', name: 'Acme Corp HQ', location: 'Indianapolis, IN', image: 'https://placehold.co/400x300/D9CDBA/2A2A2A?text=Install+1' },
    { id: 'proj2', name: 'Tech Park Offices', location: 'Fishers, IN', image: 'https://placehold.co/400x300/E3DBC8/2A2A2A?text=Install+2' },
    { id: 'proj3', name: 'Community Hospital', location: 'Carmel, IN', image: 'https://placehold.co/400x300/A9886C/FFFFFF?text=Install+3' },
    { id: 'proj4', name: 'Downtown Library', location: 'Indianapolis, IN', image: 'https://placehold.co/400x300/966642/FFFFFF?text=Install+4' },
];

const MENU_ITEMS = [
    { id: 'orders', icon: MousePointer, label: 'Orders' },
    { id: 'sales', icon: PieChart, label: 'Sales' },
    { id: 'products', icon: Armchair, label: 'Products' },
    { id: 'resources', icon: Database, label: 'Resources' },
    { id: 'projects', icon: Briefcase, label: 'Projects' },
    { id: 'community', icon: MessageSquare, label: 'Community' },
    { id: 'samples', icon: Package, label: 'Samples' },
    { id: 'replacements', icon: RotateCw, label: 'Replacements' },
];

const ORDER_DATA = [
    {
        date: '2025-06-12T14:30:00Z', amount: '$43,034.00', company: 'BUSINESS FURNITURE LLC', details: 'MSD of Lawrence Township - LECC', orderNumber: '444353-00', po: 'S65473-7', net: 31250.00, reward: 'Jennifer Franklin (1%)', shipDate: '8/25/2025', status: 'In Production', shipTo: 'BUSINESS FURNITURE LLC\n4102 MEGHAN BEELER COURT\nSOUTH BEND, IN 46628', discount: '61.20%', packQty: 8, lineItems: [
            {
                line: '001', name: 'CROSSOVER SWIVEL CONFERENCE', model: 'AW6007C', quantity: 8, net: 902.10, extNet: 7216.80, options: 'None', specs: [
                    { label: 'MIDBACK-SWIVELBASE', value: 'ARWYNSERIES-MODELAW6007C' },
                    { label: 'CONTROLMECHANISM', value: 'SWIVELTILT' },
                    { label: 'CASTERDETAILS', value: 'BLACKCASTER' },
                    { label: 'UPH.INFO', value: '(JSOMC)MAYERLUDLOWCHESTNUT-GRADEC' },
                    { label: 'TAG', value: '#410CONFERENCEROOM/COLORCODEBLACK' }
                ]
            },
            { line: '002', name: 'CUSTOM UNIT - LAMINATE', model: 'CUSTOM-CGL', quantity: 1, net: 734.00, extNet: 734.00, options: 'Special Size', specs: [] },
            { line: '003', name: 'STRAIGHT ARM SWIVEL CHAIR', model: 'KN3000UUS', quantity: 2, net: 658.44, extNet: 1316.87, options: 'Custom Fabric', specs: [] },
        ]
    },
    { date: '2025-06-12T10:15:00Z', amount: '$1,250.50', company: 'CORPORATE DESIGN INC', details: 'ONEMAIN FINANCIAL', orderNumber: '442365-00', po: 'S65473-8', net: 950.00, reward: 'John Doe (1.5%)', shipDate: '8/28/2025', status: 'Shipped', shipTo: 'CORPORATE DESIGN INC\n123 MAIN STREET\nEVANSVILLE, IN 47708', discount: '24.03%', packQty: 0, lineItems: [{ line: '001', name: 'SIDE TABLE', model: 'SIDETBL-SM', quantity: 2, net: 475.00, extNet: 950.00, options: 'None', specs: [] }] },
    { date: '2025-06-11T16:45:00Z', amount: '$643.80', company: 'CORPORATE DESIGN INC', details: 'ONE MAIN FINANCIAL', orderNumber: '449518-00', po: 'S65473-9', net: 500.00, reward: 'Jennifer Franklin (1%)', shipDate: '9/02/2025', status: 'In Production', packQty: 1, shipTo: 'CORPORATE DESIGN INC\n123 MAIN STREET\nEVANSVILLE, IN 47708', discount: '22.34%', lineItems: [] },
    { date: '2025-06-11T09:00:00Z', amount: '$3,415.20', company: 'ONE ELEVEN DESIGN', details: 'CENTLIVRE, LLC', orderNumber: '449645-00', po: 'S65474-1', net: 2800.00, reward: 'Jane Smith (1%)', shipDate: '9/05/2025', status: 'Pending', packQty: 0, shipTo: 'ONE ELEVEN DESIGN\n456 OAK AVENUE\nFORT WAYNE, IN 46802', discount: '18.01%', lineItems: [] },
    { date: '2025-06-10T11:20:00Z', amount: '$137,262.94', company: 'BUSINESS FURNISHINGS', details: 'MONREAU SEMINARY', orderNumber: '450080-00', po: 'S65474-2', net: 112000.00, reward: 'Jennifer Franklin (1%)', shipDate: '9/15/2025', status: 'In Production', packQty: 25, shipTo: 'BUSINESS FURNISHINGS LLC\n4102 MEGHAN BEELER COURT\nSOUTH BEND, IN 46628', discount: '18.40%', lineItems: [] },
    { date: '2025-06-09T15:00:00Z', amount: '$12,500.00', company: 'LOTH INC.', details: 'CINCINNATI OFFICE REFRESH', orderNumber: '450111-00', po: 'S65475-1', net: 10500.00, reward: 'Jane Smith (1%)', shipDate: '9/18/2025', status: 'In Production', packQty: 3, shipTo: 'LOTH INC.\n9876 DESIGN DRIVE\nCINCINNATI, OH 45242', discount: '16.00%', lineItems: [] },
    { date: '2025-06-09T13:45:00Z', amount: '$8,200.00', company: 'OFFICEWORKS', details: 'DOWNTOWN LAW FIRM', orderNumber: '450222-00', po: 'S65476-2', net: 7000.00, reward: 'John Doe (1.5%)', shipDate: '9/20/2025', status: 'Pending', packQty: 0, shipTo: 'OFFICEWORKS\n5678 COMMERCE BLVD\nINDIANAPOLIS, IN 46250', discount: '14.63%', lineItems: [] },
    { date: '2025-06-06T10:05:00Z', amount: '$21,880.00', company: 'RJE BUSINESS INTERIORS', details: 'TECH STARTUP EXPANSION', orderNumber: '450333-00', po: 'S65477-3', net: 18000.00, reward: 'Jennifer Franklin (1%)', shipDate: '9/22/2025', status: 'Shipped', packQty: 0, shipTo: 'RJE BUSINESS INTERIORS\n1234 PROJECT PLACE\nINDIANAPOLIS, IN 46202', discount: '17.73%', lineItems: [] },
    { date: '2025-06-05T17:30:00Z', amount: '$5,120.00', company: 'INDY OFFICE SOLUTIONS', details: 'EXECUTIVE SUITE CHAIRS', orderNumber: '450444-00', po: 'S65478-4', net: 4100.00, reward: 'Jane Smith (1%)', shipDate: '9/25/2025', status: 'In Production', packQty: 2, shipTo: 'INDY OFFICE SOLUTIONS\n101 SOLUTION ST\nINDIANAPOLIS, IN 46204', discount: '19.92%', lineItems: [] },
    { date: '', amount: '', company: 'SHARP SCHOOL SERVICES INC', details: 'MARSHALL COMMUNITY BUILDING', orderNumber: '442137' },
    { date: '', amount: '', company: 'SHARP SCHOOL SERVICES INC', details: '', orderNumber: '440738' },
];
const LEAD_TIMES_DATA = [
    { series: "Standard Seating", products: [{ type: "All Series", weeks: "6-8" }], category: "wood seating" },
    { series: "Standard Casegoods & Tables", products: [{ type: "Veneer", weeks: "8-10" }, { type: "Laminate", weeks: "6-8" }], category: "casegoods" },
    { series: "Arwyn", products: [{ type: "Seating", weeks: "6-8" }], category: "upholstered" },
    { series: "Satisse", products: [{ type: "Seating", weeks: "8-10" }, { type: "Carts", weeks: "8-10" }], category: "upholstered" },
    { series: "Forge", products: [{ type: "Laminate", weeks: "6-8" }], category: "casegoods" },
    { series: "Kindera", products: [{ type: "Seating", weeks: "8-10" }], category: "upholstered" },
    { series: "Somna", products: [{ type: "Seating", weeks: "8-10" }], category: "upholstered" },
];

const FABRICS_DATA = [{ name: 'Luxe Weave', manufacturer: 'Momentum' }, { name: 'Origin', manufacturer: 'Momentum' }, { name: 'Origin', manufacturer: 'Maharam' }, { name: 'Origin', manufacturer: 'Architex' }, { name: 'Climb', manufacturer: 'Maharam' }, { name: 'Rigid', manufacturer: 'Maharam' }, { name: 'Heritage Tweed', manufacturer: 'Traditions' }];

const LineItemCard = React.memo(({ lineItem, theme }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <GlassCard theme={theme} className="p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex justify-between items-center">
                <p className="font-bold tracking-wider" style={{ color: theme.colors.textPrimary }}>LINE {lineItem.line}</p>
                <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} style={{ color: theme.colors.textSecondary }} />
            </div>

            <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>{lineItem.name}</p>

            <div className="grid grid-cols-3 gap-x-4 text-sm mt-2">
                <div>
                    <p className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>MODEL</p>
                    <p style={{ color: theme.colors.textPrimary }}>{lineItem.model}</p>
                </div>
                <div>
                    <p className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>QTY</p>
                    <p style={{ color: theme.colors.textPrimary }}>{lineItem.quantity}</p>
                </div>
                <div>
                    <p className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>NET</p>
                    <p style={{ color: theme.colors.textPrimary }}>${lineItem.extNet.toLocaleString()}</p>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t mt-4 pt-4 space-y-2 text-sm" style={{ borderColor: theme.colors.subtle }}>
                    <p className="font-bold text-xs" style={{ color: theme.colors.textSecondary }}>OPTIONS:</p>
                    {lineItem.specs.length > 0 ? lineItem.specs.map(spec => (
                        <div key={spec.label}>
                            <p className="font-semibold" style={{ color: theme.colors.textSecondary }}>{spec.label}</p>
                            <p className="font-mono text-xs" style={{ color: theme.colors.textPrimary }}>{spec.value}</p>
                        </div>
                    )) : <p className="text-xs" style={{ color: theme.colors.textSecondary }}>No specific options.</p>}
                </div>
            )}
        </GlassCard>
    );
});

const allApps = [
    { name: 'Samples', route: 'samples' },
    { name: 'Request Replacement', route: 'replacements' },
    { name: 'Community', route: 'community' },
    { name: 'Lead Times', route: 'lead-times' },
    { name: 'Products', route: 'products' },
    { name: 'Orders', route: 'orders' },
    { name: 'Sales', route: 'sales' },
    { name: 'Projects', route: 'projects' },
    { name: 'Resources', route: 'resources' },
    { name: 'Dealer Directory', route: 'resources/dealer_directory' },
    { name: 'Commission Rates', route: 'resources/commission_rates' },
    { name: 'Contracts', route: 'resources/contracts' },
    { name: 'Loaner Pool', route: 'resources/loaner_pool' },
    { name: 'Discontinued Finishes', route: 'resources/discontinued_finishes' },
    { name: 'Sample Discounts', route: 'resources/sample_discounts' },
    { name: 'Social Media', route: 'resources/social_media' },
    { name: 'Customer Ranking', route: 'customer-rank' },
    { name: 'Commissions', route: 'commissions' },
    { name: 'Members', route: 'members' },
    { name: 'Settings', route: 'settings' },
    { name: 'Help', route: 'help' },
    { name: 'Feedback', route: 'feedback' },
];

const RecentPOsCard = React.memo(({ orders, theme, onOrderClick }) => {
    // State now tracks the number of visible items, starting with 4
    const [visibleCount, setVisibleCount] = useState(4);

    // Formats the date to a "Month Day, Time" format (e.g., "Jun 12, 2:30 PM")
    const formatTimestamp = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Slice the orders array based on the current visible count
    const ordersToShow = orders.slice(0, visibleCount);

    return (
        <GlassCard theme={theme} className="p-4 transition-all duration-300 hover:border-white/20">
            <h3 className="font-bold text-lg mb-2" style={{ color: theme.colors.textPrimary }}>Recent POs</h3>
            <div className="space-y-1">
                {ordersToShow.map((order) => (
                    <button
                        key={order.orderNumber}
                        onClick={() => onOrderClick(order)}
                        className="w-full text-left p-3 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    >
                        <div className="grid grid-cols-12 items-center gap-2">
                            {/* Project Name and Timestamp */}
                            <div className="col-span-9 truncate">
                                <p className="font-semibold text-sm truncate" style={{ color: theme.colors.textPrimary }}>{order.details || order.company}</p>
                                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{formatTimestamp(order.date)}</p>
                            </div>
                            {/* Net Amount */}
                            <div className="col-span-3 text-right">
                                <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>${order.net.toLocaleString()}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* The "Show More" button now only shows if there are more items to display */}
            {orders.length > visibleCount && (
                <div className="border-t mt-2 pt-2" style={{ borderColor: theme.colors.subtle }}>
                    <button
                        onClick={() => setVisibleCount(prevCount => prevCount + 5)}
                        className="w-full text-center text-sm font-semibold p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                        style={{ color: theme.colors.textSecondary }}
                    >
                        +5 more
                    </button>
                </div>
            )}
        </GlassCard>
    );
});

const SmartSearch = ({ theme, onNavigate, onAskAI, showAlert }) => {
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
            const results = allApps
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
        showAlert('Voice search activated.');
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
                <ul className="absolute top-full mt-2 w-full rounded-lg shadow-xl bg-[color:theme(colors.background)] z-50">
                    {filteredApps.map(app => (
                        <li
                            key={app.route}
                            onMouseDown={() => handleNavigation(app.route)}
                            className="flex items-center gap-2 cursor-pointer px-3 py-2 hover:bg-[color:theme(colors.hover)]"
                            style={{ color: theme.colors.textPrimary }}
                        >
                            <ChevronRight className="w-4 h-4 text-[color:theme(colors.textSecondary)]" />
                            {app.name}
                        </li>
                    ))}
                </ul>
            )}


        </div>
    );
};



const RESOURCES_DATA = [
    {
        category: "Fabrics",
        items: [
            { label: "Search Database", nav: "fabrics/search_form" },
            { label: "Request COM Yardage", nav: "fabrics/com_request" }
        ]
    },
    {
        category: "Rep Functions",
        items: [
            { label: "Commission Rates", nav: "resources/commission_rates" },
            { label: "Loaner Pool", nav: "resources/loaner_pool" },
            { label: "New Dealer Sign-Up", nav: "resources/dealer_registration" },
            { label: "Request Field Visit", nav: "resources/request_field_visit" },
            { label: "Sample Discounts", nav: "resources/sample_discounts" },
            { label: "Dealer Directory", nav: "resources/dealer_directory" }
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Misc.",
        items: [
            { label: "Contracts", nav: "resources/contracts" },
            { label: "Design Days", nav: "resources/design_days" },
            { label: "Discontinued Finishes Database", nav: "resources/discontinued_finishes" },
            { label: "Install Instructions", nav: "resources/install_instructions" },
            { label: "Presentations", nav: "resources/presentations" },
            { label: "Social Media", nav: "resources/social_media" },
            { label: "Lead Times", nav: "lead-times" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    }
];

const RequestFieldVisitScreen = ({ theme, setSuccessMessage, onNavigate }) => {
    const [currentDate, setCurrentDate] = useState(new Date('2025-07-04T12:00:00Z'));
    const [selectedDate, setSelectedDate] = useState(null);
    const [soNumber, setSoNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [address, setAddress] = useState('');
    const [photos, setPhotos] = useState([]);
    const fileInputRef = useRef(null);

    const twoWeeksFromNow = useMemo(() => {
        const today = new Date('2025-07-04T12:00:00Z');
        today.setDate(today.getDate() + 14);
        return today;
    }, []);

    const handleDateClick = (day) => {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayOfWeek = clickedDate.getDay();

        if (clickedDate >= twoWeeksFromNow && dayOfWeek > 0 && dayOfWeek < 6) {
            setSelectedDate(clickedDate);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setPhotos(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (selectedDate && soNumber && notes && address && photos.length > 0) {
            setSuccessMessage("Field visit requested!");
            setTimeout(() => {
                setSuccessMessage("");
                onNavigate('home');
            }, 2000);
        } else {
            alert("Please fill out all fields and add at least one photo.");
        }
    };

    const renderCalendar = () => {
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
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={`${d}-${i}`}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 mt-2">
                    {blanks.map((_, i) => <div key={`blank-${i}`}></div>)}
                    {days.map(day => {
                        const date = new Date(year, month, day);
                        const dayOfWeek = date.getDay();
                        const isAvailable = date >= twoWeeksFromNow && dayOfWeek > 0 && dayOfWeek < 6;
                        const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
                        return (
                            <button
                                key={day}
                                onClick={() => handleDateClick(day)}
                                disabled={!isAvailable}
                                className={`relative h-10 w-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${isSelected ? 'ring-2 ring-offset-2 scale-110' : 'hover:bg-black/5'}`}
                                style={{ borderColor: theme.colors.accent, color: isSelected ? 'white' : theme.colors.textPrimary, backgroundColor: isSelected ? theme.colors.accent : 'transparent' }}
                            >
                                {day}
                                {isAvailable && !isSelected && <span className="absolute bottom-1.5 h-1.5 w-1.5 bg-green-400 rounded-full"></span>}
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
                            <FormInput label="Sales Order #" value={soNumber} onChange={(e) => setSoNumber(e.target.value)} placeholder="Enter SO#" theme={theme} required />
                            <FormInput label="Address for Visit" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter full address" theme={theme} required />
                            <FormInput type="textarea" label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What went wrong or what is needed?" theme={theme} required />

                            <div>
                                <label className="text-xs font-semibold px-1" style={{ color: theme.colors.textSecondary }}>Photos</label>
                                <div className="mt-1 grid grid-cols-3 gap-2">
                                    {photos.map((photo, index) => (
                                        <div key={index} className="relative aspect-square">
                                            <img src={URL.createObjectURL(photo)} alt={`upload-preview-${index}`} className="w-full h-full object-cover rounded-lg" />
                                            <button onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={() => fileInputRef.current.click()} className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg" style={{ borderColor: theme.colors.subtle, color: theme.colors.textSecondary }}>
                                        <Camera className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-semibold">Add Photo</span>
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                        </GlassCard>
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedDate || !soNumber || !address || !notes || photos.length === 0}
                            className="w-full font-bold py-3 px-6 rounded-full text-white transition-opacity disabled:opacity-50"
                            style={{ backgroundColor: theme.colors.accent }}
                        >
                            Submit Request
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

const SOCIAL_MEDIA_POSTS = [
    { id: 1, type: 'image', url: 'https://placehold.co/400x500/E3DBC8/2A2A2A?text=JSI+Seating', caption: 'Comfort meets design. ✨ Discover the new Arwyn series, perfect for any modern workspace. #JSIFurniture #OfficeDesign #ModernWorkplace' },
    { id: 2, type: 'image', url: 'https://placehold.co/400x500/D9CDBA/2A2A2A?text=Vision+Casegoods', caption: 'Functionality at its finest. The Vision casegoods line offers endless configuration possibilities. #Casegoods #OfficeInspo #JSI' },
    { id: 3, type: 'video', url: 'https://placehold.co/400x500/A9886C/FFFFFF?text=Lounge+Tour+(Video)', caption: 'Take a closer look at the luxurious details of our Caav lounge collection. #LoungeSeating #ContractFurniture #HospitalityDesign' },
    { id: 4, type: 'image', url: 'https://placehold.co/400x500/966642/FFFFFF?text=Forge+Tables', caption: 'Gather around. The Forge table series brings a rustic yet refined look to collaborative spaces. #MeetingTable #Collaboration #JSI' },
];

const LOANER_POOL_PRODUCTS = [
    { id: 'br2301', name: 'Bryn', model: 'BR2301', img: 'https://placehold.co/100x100/E3DBC8/7A7A7A?text=Chair' },
    { id: 'cv4501', name: 'Caav', model: 'CV4501', img: 'https://placehold.co/100x100/D9CDBA/7A7A7A?text=Sofa' },
    { id: 'kn2301', name: 'Knox', model: 'KN2301', img: 'https://placehold.co/100x100/A9886C/7A7A7A?text=Stool' },
    { id: 'wk4501', name: 'Wink', model: 'WK4501', img: 'https://placehold.co/100x100/966642/7A7A7A?text=Chair' },
];
const INITIAL_OPPORTUNITIES = [{ id: 1, name: 'New Office Furnishings', stage: 'Discovery', discount: '5%', value: '$50,000', company: 'ABC Corporation', contact: 'John Smith', poTimeframe: '30-60 days' }, { id: 2, name: 'Lobby Refresh', stage: 'Specifying', value: '$75,000', company: 'XYZ Industries', contact: 'Jane Doe', poTimeframe: '60-90 days' },];
const STAGES = ['Discovery', 'Specifying', 'Decision/Bidding', 'PO Expected', 'Won', 'Lost'];
const STAGE_COLORS = { 'Discovery': `bg-blue-200 text-blue-900`, 'Specifying': `bg-green-200 text-green-900`, 'Decision/Bidding': `bg-orange-200 text-orange-900`, 'PO Expected': `bg-purple-200 text-purple-900`, 'Won': `bg-emerald-200 text-emerald-900`, 'Lost': `bg-red-200 text-red-900`, };

const EMPTY_LEAD = { project: '', designFirm: '', dealer: '', winProbability: '', projectStatus: '', vertical: '', estimatedList: '', poTimeframe: '', competitors: [], competitionPresent: false, discount: 'Undecided', products: [], notes: '', jsiSpecServices: false, jsiQuoteNumber: '', isContract: false, contractType: '' }; const VERTICALS = ['Healthcare', 'Higher Ed', 'K12', 'Corporate', 'Government', 'Hospitality'];
const URGENCY_LEVELS = ['Low', 'Medium', 'High'];
const PO_TIMEFRAMES = ['Within 30 Days', '30-60 Days', '60-90 Days', '90+ Days', 'Early 2026', 'Late 2026', '2027 or beyond'];
const COMPETITORS = ['None', 'Kimball', 'OFS', 'Indiana Furniture', 'National', 'Haworth', 'MillerKnoll', 'Steelcase', 'Versteel', 'Krug', 'Lazyboy', 'DarRan', 'Hightower', 'Allsteel'];
const DISCOUNT_OPTIONS = ['Undecided', '50/20 (60.00%)', '50/20/1 (60.4%)', '50/20/2 (60.80%)', '50/20/4 (61.60%)', '50/20/2/3 (61.98%)', '50/20/5 (62.00%)', '50/20/3 (61.20%)', '50/20/6 (62.40%)', '50/25 (62.50%)', '50/20/5/2 (62.76%)', '50/20/7 (62.80%)', '50/20/8 (63.20%)', '50/10/10/10 (63.55%)', '50/20/9 (63.6%)', '50/20/10 (64.00%)', '50/20/8/3 (64.30%)', '50/20/10/3 (65.08%)', '50/20/10/5 (65.80%)', '50/20/15 (66.00%)'];
const JSI_PRODUCT_SERIES = ['Arwyn', 'Bryn', 'Caav', 'Connect', 'Hoopz', 'Indie', 'Jude', 'Kindera', 'Lok', 'Poet', 'Teekan', 'Vision', 'Wink', 'Ziva'].sort();
const VISION_MATERIALS = ['TFL', 'HPL', 'Veneer'];
const WIN_PROBABILITY_OPTIONS = ['20%', '40%', '60%', '80%', '100%'];
const INITIAL_DESIGN_FIRMS = ['N/A', 'Undecided', 'McGee Designhouse', 'Ratio', 'CSO', 'IDO', 'Studio M'];
const INITIAL_DEALERS = ['Undecided', 'Business Furniture', 'COE', 'OfficeWorks', 'RJE'];


const YTD_SALES_DATA = [{ label: 'Total Sales', current: 3666132, previous: 2900104, goal: 7000000 }, { label: 'Education', current: 1250000, previous: 1045589, goal: 2500000 }, { label: 'Health', current: 980000, previous: 850000, goal: 2000000 },];
const MONTHLY_SALES_DATA = [{ month: 'Jan', bookings: 1259493, sales: 506304 }, { month: 'Feb', bookings: 497537, sales: 553922 }, { month: 'Mar', bookings: 397684, sales: 365601 }, { month: 'Apr', bookings: 554318, sales: 696628 }, { month: 'May', bookings: 840255, sales: 1340018 }, { month: 'Jun', bookings: 116846, sales: 36823 },];
const SALES_VERTICALS_DATA = [{ label: 'Healthcare', value: 2900104, color: '#B99962' }, { label: 'Higher Ed', value: 1045589, color: '#7A7A7A' }, { label: 'K12', value: 1045589, color: '#A0A0A0' }, { label: 'Corporate', value: 1045589, color: '#2A2A2A' }, { label: 'Government', value: 1045589, color: '#CCCCCC' },];

const INITIAL_MEMBERS = [
    { id: 1, firstName: 'Luke', lastName: 'Miller', email: 'luke.miller@example.com', title: 'Admin', role: 'Admin', permissions: { salesData: true, commissions: true, projects: true, customerRanking: true, dealerRewards: true, submittingReplacements: true } },
    { id: 2, firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@example.com', title: 'Admin', role: 'Admin', permissions: { salesData: true, commissions: true, projects: true, customerRanking: true, dealerRewards: true, submittingReplacements: true } },
    { id: 3, firstName: 'Michael', lastName: 'Jones', email: 'michael.jones@example.com', title: 'Sales', role: 'User', permissions: { salesData: true, commissions: true, projects: false, customerRanking: true, dealerRewards: false, submittingReplacements: false } },
    { id: 4, firstName: 'Jessica', lastName: 'Williams', email: 'jessica.williams@example.com', title: 'Designer', role: 'User', permissions: { salesData: false, commissions: false, projects: true, customerRanking: false, dealerRewards: false, submittingReplacements: true } },
    { id: 5, firstName: 'David', lastName: 'Brown', email: 'david.brown@example.com', title: 'Sales', role: 'User', permissions: { salesData: true, commissions: true, projects: false, customerRanking: true, dealerRewards: false, submittingReplacements: false } },
];
const PERMISSION_LABELS = {
    salesData: "Sales Data",
    customerRanking: "Customer Ranking",
    projects: "Projects",
    commissions: "Commissions",
    dealerRewards: "Dealer Rewards",
    submittingReplacements: "Submitting Replacements"
};
const USER_TITLES = ["Sales", "Designer", "Sales/Designer", "Administration"];
const EMPTY_USER = { firstName: '', lastName: '', email: '', title: 'Sales', role: 'User', permissions: { salesData: true, commissions: false, projects: true, customerRanking: true, dealerRewards: true, submittingReplacements: true } };

const CUSTOMER_RANK_DATA = [
    { id: 1, name: 'Business Furniture LLC', bookings: 450000, sales: 435000, orders: [{ projectName: 'Lawrence Township LECC', amount: 43034 }, { projectName: 'Monreau Seminary', amount: 137262 }] },
    { id: 2, name: 'Corporate Design Inc', bookings: 380000, sales: 395000, orders: [{ projectName: 'OneMain Financial HQ', amount: 1250 }, { projectName: 'OneMain Financial Branch', amount: 643 }] },
    { id: 3, name: 'OfficeWorks', bookings: 510000, sales: 490000, orders: [{ projectName: 'Main Office Remodel', amount: 510000 }] },
    { id: 4, name: 'LOTH Inc.', bookings: 320000, sales: 310000, orders: [] },
    { id: 5, name: 'One Eleven Design', bookings: 280000, sales: 275000, orders: [{ projectName: 'Centlivre, LLC', amount: 3415 }] },
    { id: 6, name: 'RJE Business Interiors', bookings: 470000, sales: 465000, orders: [] },
    { id: 7, name: 'Sharp School Services', bookings: 190000, sales: 185000, orders: [] },
    { id: 8, name: 'Braden Business Systems', bookings: 210000, sales: 205000, orders: [] },
    { id: 9, name: 'Schroeder\'s', bookings: 150000, sales: 140000, orders: [] },
    { id: 10, name: 'CVC', bookings: 230000, sales: 220000, orders: [] },
];

const SAMPLE_CATEGORIES = [
    { id: 'tfl', name: 'TFL' },
    { id: 'hpl', name: 'HPL' },
    { id: 'veneer', name: 'Veneer' },
    { id: 'solid-wood', name: 'Solid Wood' },
    { id: 'paint', name: 'Paint' },
    { id: 'metal', name: 'Metal' },
    { id: 'solid-surface', name: 'Solid Surface' },
    { id: 'glass', name: 'Glass' },
    { id: 'plastic', name: 'Plastic' },
    { id: 'poly', name: 'Poly' },
    { id: 'specialty', name: 'Specialty' },
];
const SAMPLE_PRODUCTS = [{ id: 1, name: 'Belair', category: 'veneer', color: '#E3DBC8' }, { id: 2, name: 'Egret', category: 'veneer', color: '#D9CDBA' }, { id: 3, name: 'Clay', category: 'veneer', color: '#A9886C' }, { id: 4, name: 'Outback', category: 'veneer', color: '#966642' }, { id: 5, name: 'Forged', category: 'metal', color: '#5A5A5A' }, { id: 6, name: 'Carbon', category: 'metal', color: '#3E3E3E' }, { id: 7, name: 'Cotton', category: 'fabric', color: '#F0F0F0' }, { id: 8, name: 'Linen', category: 'fabric', color: '#EAE0D3' },];

const JSI_MODELS = [
    { id: 'VST2430SC', name: 'Storage Cabinet', series: 'Vision', isUpholstered: false },
    { id: 'BRY2001', name: 'Desk Chair', series: 'Bryn', isUpholstered: true },
    { id: 'TBCONF8', name: 'Conference Table', series: 'Tablet', isUpholstered: false },
    { id: 'SIDETBL-SM', name: 'Side Table', series: 'Americana', isUpholstered: false },
    { id: 'LNGCHR-OTT', name: 'Lounge Chair', series: 'Caav', isUpholstered: true },
];
const generateCommissionData = () => {
    const data = {};
    const currentYear = new Date().getFullYear();
    const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    for (let year = currentYear; year >= currentYear - 2; year--) {
        data[year] = [];
        for (let i = 0; i < 12; i++) {
            if (year === currentYear && i > new Date().getMonth()) {
                continue;
            }
            const amount = Math.floor(Math.random() * (50000 - 30000 + 1)) + 30000;
            const issuedDate = `${year}-${String(i + 1).padStart(2, '0')}-22`;
            data[year].push({
                month: months[i],
                fullMonth: new Date(issuedDate).toLocaleString('default', { month: 'long' }),
                amount,
                issuedDate
            });
        }
    }
    return data;
};

const COMMISSIONS_CHECKS_DATA = generateCommissionData();
const COMMISSION_RATES_TABLE_DATA = {
    standard: [
        { discount: '5/10', rep: '12%', spiff: '3%' },
        { discount: '50/10/5', rep: '11%', spiff: '3%' },
        { discount: '50/20', rep: '10%', spiff: '3%' },
        { discount: '50/20/1', rep: '9%', spiff: '3%' },
        { discount: '50/20/2', rep: '9%', spiff: '3%' },
        { discount: '50/20/3', rep: '8%', spiff: '3%' },
        { discount: '50/20/4', rep: '8%', spiff: '3%' },
        { discount: '50/20/5', rep: '7%', spiff: '3%' },
        { discount: '50/20/6', rep: '7%', spiff: '3%' },
        { discount: '50/20/7', rep: '6%', spiff: '3%' },
        { discount: '50/20/8', rep: '6%', spiff: '3%' },
        { discount: '50/20/9', rep: '6%', spiff: '3%' },
        { discount: '50/20/10', rep: '5%', spiff: { value: '3%', note: '*if > $100k net' } },
    ],
    contract: [
        { discount: 'GSA', rep: '5%', spiff: '3%' },
        { discount: 'Omnia', rep: '3.8-3.9%', spiff: '2.5%' },
        { discount: 'Premier', rep: '4.1-4.3%', spiff: '2%' },
        { discount: 'TIPS', rep: '3.6-3.8%', spiff: 'N/A' },
    ],
    split: [
        { territory: 'Specifying', percentage: 70 },
        { territory: 'Ordering', percentage: 30 },
    ]
};


const CONTRACTS_DATA = {
    omnia: {
        name: "Omnia",
        tiers: [
            { off: "54% off (Dock Delivery)", dealer: "15% dealer commission", rep: "3.91% rep commission" },
            { off: "53% off (Dock Delivery)", dealer: "17% dealer commission", rep: "3.83% rep commission" },
            { off: "52% off (Dock Delivery)", dealer: "18% dealer commission", rep: "3.75% rep commission" },
        ],
        margin: ["54/15 = 60.90%", "53/17 = 60.99%", "52/18 = 60.64%"],
        url: "https://webresources.jsifurniture.com/production/uploads/j_contracts_tcpn.pdf"
    },
    tips: {
        name: "TIPS",
        tiers: [
            { off: "51% off (Delivery and Installed)", dealer: "24% dealer commission", rep: "3.67% rep commission" },
            { off: "53% off (Dock Delivery)", dealer: "20% dealer commission", rep: "3.83% rep commission" },
        ],
        note: "Spiff is not allowed.",
        url: "https://webresources.jsifurniture.com/production/uploads/jsi_contracts_tips_taps.pdf"
    },
    premier: {
        name: "Premier",
        tiers: [
            { off: "56% off (up to $500k)", dealer: "14% dealer commission", rep: "4.09% rep commission" },
            { off: "57% off ($500k-750k)", dealer: "13% dealer commission", rep: "4.19% rep commission" },
            { off: "58% off ($750k+)", dealer: "12% dealer commission", rep: "4.29% rep commission" },
        ],
        url: "https://webresources.jsifurniture.com/production/uploads/jsi_contracts_premier.pdf"
    }
};
const DAILY_DISCOUNT_OPTIONS = ["50 (50)", "50/5 (52.5)", "50/8 (54)", "50/10 (55)", "50/10/5 (57.25)"];
const DEALER_DIRECTORY_DATA = [
    { id: 1, name: 'Business Furniture LLC', address: '4102 Meghan Beeler Court, South Bend, IN 46628', bookings: 450000, sales: 435000, salespeople: [{ name: 'Alan Bird', status: 'active' }, { name: 'Deb Butler', status: 'active' }], designers: [{ name: 'Jen Franklin', status: 'active' }], administration: [{ name: 'Luke Miller', status: 'active' }], installers: [{ name: 'Installer A', status: 'active' }], recentOrders: [{ id: '444353-00', amount: 43034, shippedDate: '2025-05-12' }, { id: '450080-00', amount: 137262, shippedDate: '2025-06-02' }], dailyDiscount: '50/20 (60.00%)' },
    { id: 2, name: 'Corporate Design Inc', address: '123 Main Street, Evansville, IN 47708', bookings: 380000, sales: 395000, salespeople: [{ name: 'Jason Beehler', status: 'active' }], designers: [], administration: [], installers: [{ name: 'Installer B', status: 'active' }, { name: 'Installer C', status: 'active' }], recentOrders: [{ id: '442365-00', amount: 1250, shippedDate: '2025-05-18' }, { id: '449518-00', amount: 643, shippedDate: '2025-06-10' }], dailyDiscount: '50/20 (60.00%)' },
    { id: 3, name: 'OfficeWorks', address: '5678 Commerce Blvd, Indianapolis, IN 46250', bookings: 510000, sales: 490000, salespeople: [{ name: 'Andrea Kirkland', status: 'active' }], designers: [{ name: 'Jessica Williams', status: 'active' }], administration: [{ name: 'Sarah Chen', status: 'active' }], installers: [{ name: 'Installer D', status: 'active' }], recentOrders: [{ id: '449645-00', amount: 510000, shippedDate: '2025-06-15' }], dailyDiscount: '50/20 (60.00%)' },
    { id: 4, name: 'LOTH Inc.', address: '9876 Design Drive, Cincinnati, OH 45242', bookings: 320000, sales: 310000, salespeople: [{ name: 'Michael Jones', status: 'active' }], designers: [], administration: [], installers: [], dailyDiscount: '50/20 (60.00%)' },
    { id: 5, name: 'One Eleven Design', address: '456 Oak Avenue, Fort Wayne, IN 46802', bookings: 280000, sales: 275000, salespeople: [{ name: 'David Brown', status: 'active' }], designers: [{ name: 'Sarah Chen', status: 'active' }], administration: [], installers: [], dailyDiscount: '50/20 (60.00%)' },
    { id: 6, name: 'RJE Business Interiors', address: '1234 Project Place, Indianapolis, IN 46202', bookings: 470000, sales: 465000, salespeople: [{ name: 'Alan Bird', status: 'active' }], designers: [], administration: [], installers: [{ name: 'Installer E', status: 'active' }], dailyDiscount: '50/20 (60.00%)' },
    { id: 7, name: 'Sharp School Services', address: '555 Education Rd, Elkhart, IN 46514', bookings: 190000, sales: 185000, salespeople: [{ name: 'Deb Butler', status: 'active' }], designers: [], administration: [], installers: [], dailyDiscount: '50/20 (60.00%)' },
    { id: 8, name: 'Braden Business Systems', address: '777 Systems Way, Fishers, IN 46037', bookings: 210000, sales: 205000, salespeople: [{ name: 'Jason Beehler', status: 'active' }], designers: [{ name: 'Jen Franklin', status: 'active' }], administration: [], installers: [], dailyDiscount: '50/20 (60.00%)' },
    { id: 9, 'name': 'Schroeder\'s', address: '888 Office Park, Fort Wayne, IN 46805', bookings: 150000, sales: 140000, salespeople: [{ name: 'Andrea Kirkland', status: 'active' }], designers: [], administration: [], installers: [], dailyDiscount: '50/20 (60.00%)' },
    { id: 10, 'name': 'CVC', address: '999 Corporate Dr, Evansville, IN 47715', bookings: 230000, sales: 220000, salespeople: [{ name: 'Michael Jones', status: 'active' }], designers: [], administration: [{ name: 'Luke Miller', status: 'active' }], installers: [], dailyDiscount: '50/20 (60.00%)' },
    { id: 11, 'name': 'Indy Office Solutions', address: '101 Solution St, Indianapolis, IN 46204', bookings: 600000, sales: 580000, salespeople: [{ name: 'David Brown', status: 'active' }], designers: [{ name: 'Sarah Chen', status: 'active' }], administration: [], installers: [{ name: 'Installer A', status: 'active' }, { name: 'Installer D', status: 'active' }], dailyDiscount: '50/20 (60.00%)' },
    { id: 12, 'name': 'Fort Wayne Furnishings', address: '202 Supply Ave, Fort Wayne, IN 46808', bookings: 120000, sales: 115000, salespeople: [{ name: 'Alan Bird', status: 'active' }], designers: [], administration: [], installers: [], dailyDiscount: '50/20 (60.00%)' },
    { id: 13, 'name': 'South Bend Interiors', address: '303 Design Plaza, South Bend, IN 46601', bookings: 330000, sales: 325000, salespeople: [{ name: 'Deb Butler', status: 'active' }], designers: [{ name: 'Jen Franklin', status: 'active' }], administration: [], installers: [{ name: 'Installer B', status: 'active' }], dailyDiscount: '50/20 (60.00%)' },
    { id: 14, 'name': 'Hoosier Desks', address: '404 State Rd, Bloomington, IN 47401', bookings: 95000, sales: 90000, salespeople: [{ name: 'Jason Beehler', status: 'active' }], designers: [], administration: [], installers: [], dailyDiscount: '50/20 (60.00%)' },
    { id: 15, 'name': 'Circle City Commercial', address: '505 Monument Circle, Indianapolis, IN 46204', bookings: 750000, sales: 720000, salespeople: [{ name: 'Andrea Kirkland', status: 'active' }, { name: 'Michael Jones', status: 'active' }], designers: [{ name: 'Jessica Williams', status: 'active' }], administration: [{ name: 'Sarah Chen', status: 'active' }], installers: [{ name: 'Installer C', status: 'active' }, { name: 'Installer E', status: 'active' }], dailyDiscount: '50/20 (60.00%)' }
];

const DISCONTINUED_FINISHES = [
    { category: "Maple", oldName: "ALE MEDIUM", veneer: "#3610", solid: "#3610", oldColor: "#d3b48c", newName: "PILSNER", newColor: "#e6d3b1" },
    { category: "Maple", oldName: "BUTTERSCOTCH", veneer: "#3381", solid: "#3381", oldColor: "#a96e41", newName: "OUTBACK", newColor: "#966642" },
    { category: "Maple", oldName: "VENETIAN", veneer: "#3593", solid: "#3593", oldColor: "#5e3a2f", newName: "BRICKDUST", newColor: "#744334" },
    { category: "Cherry", oldName: "BOURBON MEDIUM", veneer: "#3581", solid: "#3683", oldColor: "#744334", newName: "OUTBACK", newColor: "#966642" },
    { category: "Cherry", oldName: "BRIGHTON MEDIUM", veneer: "#3611", solid: "#3684", oldColor: "#5e3a2f", newName: "BRICKDUST", newColor: "#744334" },
    { category: "Oak", oldName: "GOLDEN OAK", veneer: "#3321", solid: "#3321", oldColor: "#c68e41", newName: "DUNE", newColor: "#d1b38b" },
    { category: "Oak", oldName: "TRADITIONAL OAK", veneer: "#3351", solid: "#3351", oldColor: "#a46e3a", newName: "FAWN", newColor: "#c8a57a" },
    { category: "Walnut", oldName: "NATURAL WALNUT", veneer: "#3401", solid: "#3401", oldColor: "#6b4a39", newName: "NATURAL", newColor: "#6f4f3a" },
    { category: "Laminate", oldName: "KENSINGTON MAPLE", veneer: "N/A", solid: "N/A", oldColor: "#d8b48b", newName: "HARD ROCK MAPLE", newColor: "#dcb992" },
    { category: "Laminate", oldName: "WINDSOR CHERRY", veneer: "N/A", solid: "N/A", oldColor: "#8b4b3b", newName: "WILD CHERRY", newColor: "#8f5245" },
];

const PRODUCT_DATA = {
    'bar-stools': {
        title: 'Bar Stools',
        data: [
            { id: 'poet-bar', name: 'Poet', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_poet_stool_0001.jpg', basePrice: { list: 780 } },
            { id: 'knox-bar', name: 'Knox', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_knox_comp_00002.jpg', basePrice: { list: 850 } },
            { id: 'indie-bar', name: 'Indie', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_indie_comp_00003.jpg', basePrice: { list: 920 } },
            { id: 'jude-bar', name: 'Jude', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_jude_comp_0002.jpg', basePrice: { list: 1050 } },
            { id: 'chicago-bar', name: 'Chicago', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_chicago_comp_0002.jpg', basePrice: { list: 890 } },
        ],
    },

    'counter-stools': {
        title: 'Counter Stools',
        data: [
            { id: 'poet-counter', name: 'Poet', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_poet_stool_0002.jpg', basePrice: { list: 750 } },
            { id: 'knox-counter', name: 'Knox', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_knox_comp_00001.jpg', basePrice: { list: 820 } },
            { id: 'indie-counter', name: 'Indie', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_indie_comp_00002.jpg', basePrice: { list: 890 } },
            { id: 'jude-counter', name: 'Jude', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_jude_comp_0001.jpg', basePrice: { list: 1020 } },
            { id: 'chicago-counter', name: 'Chicago', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_chicago_comp_0001.jpg', basePrice: { list: 860 } },
        ],
    },

    swivels: {
        title: 'Swivel Chairs',
        data: [
            { id: 'cosgrove', name: 'Cosgrove', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_cosgrove_comp_0008.jpg', basePrice: { list: 1187 } },
            { id: 'arwyn', name: 'Arwyn', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_arwyn_comp_0001.jpg', basePrice: { list: 1395 } },
            { id: 'newton', name: 'Newton', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_newton_comp_00001.jpg', basePrice: { list: 1520 } },
            { id: 'proxy', name: 'Proxy', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_proxy_comp_0001_Y7gA7sE.jpg', basePrice: { list: 1675 } },
            { id: 'derby', name: 'Derby', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_derby_comp_0002.jpg', basePrice: { list: 1450 } },
        ],
    },

    'guest-chairs': {
        title: 'Guest Chairs',
        data: [
            { id: 'indie-guest', name: 'Indie', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_indie_comp_00001.jpg', basePrice: { list: 850 } },
            { id: 'jude-guest', name: 'Jude', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_jude_comp_0003.jpg', basePrice: { list: 980 } },
            { id: 'arwyn-guest', name: 'Arwyn', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_arwyn_comp_0003.jpg', basePrice: { list: 1100 } },
            { id: 'wink-guest', name: 'Wink', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_wink_comp_0001.jpg', basePrice: { list: 1200 } },
            { id: 'bryn-guest', name: 'Bryn', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_bryn_comp_0004.jpg', basePrice: { list: 1350 } },
            { id: 'hoopz-guest', name: 'Hoopz', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_hoopz_comp_0001.jpg', basePrice: { list: 1150 } },
        ],
    },

    lounge: {
        title: 'Lounge',
        data: [
            { id: 'caav', name: 'Caav', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_caav_comp_0005.jpg', basePrice: { list: 2100 } },
            { id: 'kindera', name: 'Kindera', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_kindera_comp_00001.jpg', basePrice: { list: 2400 } },
            { id: 'symmetry', name: 'Symmetry', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_symmetry_comp_0001.jpg', basePrice: { list: 2650 } },
            { id: 'welli', name: 'Welli', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_welli_comp_0003.jpg', basePrice: { list: 2800 } },
            { id: 'satisse', name: 'Satisse', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_satisse_comp_0002.jpg', basePrice: { list: 3200 } },
            { id: 'somna', name: 'Somna', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_somna_comp_0001.jpg', basePrice: { list: 2900 } },
        ],
    },

    'coffee-tables': {
        title: 'Coffee Tables',
        data: [
            { id: 'poet-coffee', name: 'Poet', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_poet_config_002.jpg', basePrice: { list: 950 } },
            { id: 'zephyr-coffee', name: 'Zephyr', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_zephyr_config_003.jpg', basePrice: { list: 1100 } },
            { id: 'denver-coffee', name: 'Denver', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_denver_config_001.jpg', basePrice: { list: 1250 } },
            { id: 'teekan-coffee', name: 'Teekan', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_teekan_config_0001.jpg', basePrice: { list: 1400 } },
            { id: 'connect-coffee', name: 'Connect', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_connect_config_0001.jpg', basePrice: { list: 1550 } },
        ],
    },

    'end-tables': {
        title: 'End Tables',
        data: [
            { id: 'poet-end', name: 'Poet', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_poet_config_001.jpg', basePrice: { list: 750 } },
            { id: 'zephyr-end', name: 'Zephyr', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_zephyr_config_004.jpg', basePrice: { list: 850 } },
            { id: 'denver-end', name: 'Denver', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_denver_config_002.jpg', basePrice: { list: 950 } },
            { id: 'teekan-end', name: 'Teekan', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_teekan_config_0002.jpg', basePrice: { list: 1100 } },
            { id: 'connect-end', name: 'Connect', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_connect_config_0002.jpg', basePrice: { list: 1250 } },
        ],
    },

    conference: {
        title: 'Conference Tables',
        data: [
            { id: 'moto-conf', name: 'Moto', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_moto_config_0003.jpg', basePrice: { list: 4800 } },
            { id: 'tablet-conf', name: 'Tablet', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_tablet_config_0001.jpg', basePrice: { list: 5500 } },
            { id: 'forge-conf', name: 'Forge', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_forge_config_0001.jpg', basePrice: { list: 6000 } },
            { id: 'alden-conf', name: 'Alden', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_alden_config_0001.jpg', basePrice: { list: 6500 } },
            { id: 'vision-conf', name: 'Vision', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_000006.jpg', basePrice: { list: 7200 } },
        ],
    },

    casegoods: {
        title: 'Casegoods',
        data: [
            { id: 'moto-1', name: 'Moto', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_moto_config_0002.jpg', basePrice: { list: 4200 } },
            { id: 'flux-1', name: 'Flux', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_flux_config_00008.jpg', basePrice: { list: 5800 } },
            { id: 'alden-1', name: 'Alden', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_alden_config_0002.jpg', basePrice: { list: 6500 } },
            { id: 'vision-1', name: 'Vision', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_000002.jpg', basePrice: { list: 7200 } },
            { id: 'vision-2', name: 'Vision', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_000007.jpg', basePrice: { list: 7200 } },
        ],
    },
};

const PRODUCTS_CATEGORIES_DATA = Object.entries(PRODUCT_DATA).map(([key, value]) => ({
    name: value.title,
    nav: `products/category/${key}`,
    images: value.data.length > 0 ? value.data.slice(0, 2).map(p => p.image) : ['https://placehold.co/100x100/EEE/777?text=JSI']
})).sort((a, b) => a.name.localeCompare(b.name));

const CASEGOODS_COMPETITIVE_DATA = {
    typicals: [
        {
            id: 'vision-1',
            name: 'Vision',
            image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_000002.jpg',
            url: 'https://www.jsifurniture.com/product/vision',
            basePrice: { laminate: 7200, veneer: 8600 },
        },
        {
            id: 'vision-2',
            name: 'Vision',
            image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_000007.jpg',
            url: 'https://www.jsifurniture.com/product/vision',
            basePrice: { laminate: 7200, veneer: 8600 },
        },
        {
            id: 'vision-3',
            name: 'Vision',
            image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_000009.jpg',
            url: 'https://www.jsifurniture.com/product/vision',
            basePrice: { laminate: 7200, veneer: 8600 },
        },
        {
            id: 'vision-4',
            name: 'Vision',
            image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_00000012.jpg',
            url: 'https://www.jsifurniture.com/product/vision',
            basePrice: { laminate: 7200, veneer: 8600 },
        },
        {
            id: 'vision-5',
            name: 'Vision',
            image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_0023_6DHmfyb.jpg',
            url: 'https://www.jsifurniture.com/product/vision',
            basePrice: { laminate: 7200, veneer: 8600 },
        },
        {
            id: 'flux-1',
            name: 'Flux',
            image: 'https://webresources.jsifurniture.com/production/uploads/jsi_flux_config_00008.jpg',
            url: 'https://www.jsifurniture.com/product/flux',
            basePrice: { laminate: 5800, veneer: 7200 },
        },
    ],
    competitors: [
        { name: 'Kimball Priority', factor: 1.15 },
        { name: 'OFS Pulse', factor: 1.10 },
        { name: 'Indiana Canvas', factor: 0.95 },
    ],
};


const SWIVELS_COMPETITIVE_DATA = {
    typicals: [
        { id: 'cosgrove', name: 'Cosgrove', image: 'https://placehold.co/200x150?text=Cosgrove', basePrice: { list: 1187 } },
        { id: 'arwyn', name: 'Arwyn', image: 'https://placehold.co/200x150?text=Arwyn', basePrice: { list: 1395 } },
        { id: 'newton', name: 'Newton', image: 'https://placehold.co/200x150?text=Newton', basePrice: { list: 1520 } },
        { id: 'proxy', name: 'Proxy', image: 'https://placehold.co/200x150?text=Proxy', basePrice: { list: 1675 } },
    ],
    competitors: [
        { name: 'Kimball Eon', factor: 1.10 },
        { name: 'National Fringe', factor: 1.05 },
        { name: 'OFS Eleven', factor: 1.18 },
    ],
};

const BARSTOOLS_COMPETITIVE_DATA = {
    typicals: [
        { id: 'knox', name: 'Knox', image: 'https://placehold.co/200x150?text=Knox', basePrice: { list: 850 } },
        { id: 'indy', name: 'Indy', image: 'https://placehold.co/200x150?text=Indy', basePrice: { list: 920 } },
    ],
    competitors: [
        { name: 'Hightower Toro', factor: 1.12 },
        { name: 'Versteel Quanta', factor: 1.14 },
    ],
};

const COUNTERSTOOLS_COMPETITIVE_DATA = {
    typicals: [
        { id: 'knox-c', name: 'Knox-C', image: 'https://placehold.co/200x150?text=Knox+C', basePrice: { list: 820 } },
    ],
    competitors: [
        { name: 'National Fringe', factor: 1.05 },
        { name: 'OFS Hula', factor: 1.13 },
    ],
};

const GUESTCHAIRS_COMPETITIVE_DATA = {
    typicals: [
        { id: 'arwyn-guest', name: 'Arwyn', image: 'https://placehold.co/200x150?text=Arwyn', basePrice: { list: 1100 } },
        { id: 'bryn-guest', name: 'Bryn', image: 'https://placehold.co/200x150?text=Bryn', basePrice: { list: 1350 } },
    ],
    competitors: [
        { name: 'Kimball Villa', factor: 1.08 },
        { name: 'Indiana Natta', factor: 0.97 },
    ],
};

const LOUNGE_COMPETITIVE_DATA = {
    typicals: [
        { id: 'caav', name: 'Caav', image: 'https://placehold.co/200x150?text=Caav', basePrice: { list: 2100 } },
        { id: 'welli', name: 'Welli', image: 'https://placehold.co/200x150?text=Welli', basePrice: { list: 2800 } },
    ],
    competitors: [
        { name: 'Allsteel Rise', factor: 1.22 },
        { name: 'Haworth Cabana', factor: 1.30 },
    ],
};

const COFFEETABLES_COMPETITIVE_DATA = {
    typicals: [
        { id: 'poet-c', name: 'Poet', image: 'https://placehold.co/200x150?text=Poet', basePrice: { list: 950 } },
        { id: 'denver-c', name: 'Denver', image: 'https://placehold.co/200x150?text=Denver', basePrice: { list: 1250 } },
    ],
    competitors: [
        { name: 'Versteel Elara', factor: 1.18 },
        { name: 'National Epic', factor: 1.06 },
    ],
};

const ENDTABLES_COMPETITIVE_DATA = {
    typicals: [
        { id: 'poet-e', name: 'Poet (End)', image: 'https://placehold.co/200x150?text=Poet+End', basePrice: { list: 750 } },
        { id: 'denver-e', name: 'Denver (End)', image: 'https://placehold.co/200x150?text=Denver+End', basePrice: { list: 950 } },
    ],
    competitors: [
        { name: 'OFS Eleven', factor: 1.12 },
        { name: 'Indiana Oasis', factor: 0.98 },
    ],
};

const CONFERENCE_COMPETITIVE_DATA = {
    typicals: [
        { id: 'tablet-conf', name: 'Tablet', image: 'https://placehold.co/200x150?text=Tablet', basePrice: { list: 5500 } },
        { id: 'vision-conf', name: 'Vision', image: 'https://placehold.co/200x150?text=Vision', basePrice: { list: 7200 } },
    ],
    competitors: [
        { name: 'Kimball Priority', factor: 1.15 },
        { name: 'Versteel Quanta', factor: 1.10 },
    ],
};

const COMPETITIVE_DATA = {
    casegoods: CASEGOODS_COMPETITIVE_DATA,
    swivels: SWIVELS_COMPETITIVE_DATA,
    'bar-stools': BARSTOOLS_COMPETITIVE_DATA,
    'counter-stools': COUNTERSTOOLS_COMPETITIVE_DATA,
    'guest-chairs': GUESTCHAIRS_COMPETITIVE_DATA,
    lounge: LOUNGE_COMPETITIVE_DATA,
    'coffee-tables': COFFEETABLES_COMPETITIVE_DATA,
    'end-tables': ENDTABLES_COMPETITIVE_DATA,
    conference: CONFERENCE_COMPETITIVE_DATA,
};


const SAMPLE_DISCOUNTS_DATA = [
    { title: "Rep Showroom/Samples", ssa: "RT-711576", off: "85% Off", commission: "No commission" },
    { title: "Dealer Showroom Samples", ssa: "DR-228919", off: "75% Off", commission: "No commission" },
    { title: "Designer Samples", ssa: "WE-304039", off: "75% Off", commission: "No commission" },
    { title: "Personal Use Samples", ssa: "DF-022745", off: "75% Off", commission: "No commission" }
];

const REWARDS_DATA = {
    '2025-Q2': {
        sales: [{ name: "Alan Bird", amount: 1034.21 }, { name: "Deb Butler", amount: 520.32 }, { name: "Jason Beehler", amount: 44.21 }, { name: "Andrea Kirkland", amount: 20.00 },],
        designers: [{ name: "Jen Franklin", amount: 12.10 }]
    },
    '2025-Q1': {
        sales: [{ name: "Deb Butler", amount: 845.12 }, { name: "Alan Bird", amount: 730.50 }, { name: "Andrea Kirkland", amount: 55.00 }, { name: "Jason Beehler", amount: 32.80 },],
        designers: [{ name: "Jen Franklin", amount: 25.50 }]
    },
    '2024-Q4': {
        sales: [{ name: "Alan Bird", amount: 1200.00 }, { name: "Deb Butler", amount: 950.00 }, { name: "Jason Beehler", amount: 75.00 }, { name: "Andrea Kirkland", amount: 30.00 },],
        designers: [{ name: "Jen Franklin", amount: 40.00 }]
    },
    '2024-Q3': {
        sales: [],
        designers: []
    },
    '2024-Q2': {
        sales: [{ name: "Deb Butler", amount: 1100.30 }, { name: "Alan Bird", amount: 1050.11 }, { name: "Andrea Kirkland", amount: 60.00 }, { name: "Jason Beehler", amount: 50.15 },],
        designers: [{ name: "Jen Franklin", amount: 75.00 }]
    },
    '2024-Q1': {
        sales: [{ name: "Alan Bird", amount: 962.21 }, { name: "Deb Butler", amount: 720.60 }, { name: "Jason Beehler", amount: 65.80 }, { name: "Andrea Kirkland", amount: 30.00 },],
        designers: [{ name: "Jen Franklin", amount: 35.00 }]
    },
    '2023-Q4': {
        sales: [],
        designers: []
    },
    '2023-Q3': {
        sales: [],
        designers: []
    },
    '2023-Q2': {
        sales: [],
        designers: []
    },
    '2023-Q1': {
        sales: [],
        designers: []
    },
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

const AppHeader = React.memo(({
    onHomeClick,
    isDarkMode,
    theme,
    onProfileClick,
    isHome,
    handleBack,
    showBack,
    userName
}) => {
    const filterStyle = isDarkMode ? 'brightness(0) invert(1)' : 'none';

    return (
        <div
            style={{
                backgroundColor: theme.colors.surface,
                backdropFilter: theme.backdropFilter,
                WebkitBackdropFilter: theme.backdropFilter
            }}
            className="mx-auto mt-8 w-[90%] px-6 py-3 flex justify-between items-center sticky top-0 z-20 rounded-full shadow-md backdrop-blur"
        >
            <div className="flex items-center space-x-2">
                {showBack && (
                    <button
                        onClick={handleBack}
                        className="p-2 -ml-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                    >
                        <ArrowLeft
                            className="w-5 h-5"
                            style={{ color: theme.colors.textSecondary }}
                        />
                    </button>
                )}
                <button
                    onClick={onHomeClick}
                    className="hover:opacity-80 transition-opacity"
                >
                    <img
                        src={logoLight}
                        alt="MyJSI Logo"
                        className="h-10 w-auto"
                        style={{
                            filter: filterStyle,
                            marginLeft: '0.5rem'
                        }}
                    />
                </button>
            </div>

            <div className="flex items-center space-x-4">
                {isHome && (
                    <div
                        className="text-lg font-normal leading-tight"
                        style={{ color: theme.colors.textPrimary }}
                    >
                        Hey, {userName}!
                    </div>
                )}
                <button
                    onClick={onProfileClick}
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.colors.subtle }}
                >
                    <User
                        className="w-5 h-5"
                        style={{ color: theme.colors.secondary }}
                    />
                </button>
            </div>
        </div>
    );
});



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

const GlassCard = React.memo(React.forwardRef(({ children, className = '', theme, ...props }, ref) => (
    <div
        ref={ref}
        className={`rounded-[1.75rem] border shadow-lg transition-all duration-300 ${className}`}
        style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            boxShadow: `0 4px 30px ${theme.colors.shadow}, inset 1px 1px 1px ${theme.colors.highlight}, inset -1px -1px 1px ${theme.colors.embossShadow}`,
            backdropFilter: theme.backdropFilter,
            WebkitBackdropFilter: theme.backdropFilter,
        }}
        {...props}
    >
        {children}
    </div>
)));

const PageLayout = ({ children, theme }) => (
    <div className="h-full flex flex-col">
        {children}
    </div>
);

const HomeScreen = ({ onNavigate, theme, onAskAI, searchTerm, onSearchTermChange, showAIDropdown, aiResponse, isAILoading, onCloseAIDropdown, showAlert }) => {
    const handleFeedbackClick = useCallback(() => {
        onNavigate('feedback');
    }, [onNavigate]);

    return (
        <div className="flex flex-col h-full rounded-t-[40px] -mt-8 pt-8" style={{ backgroundColor: theme.colors.background }}>
            <div className="px-4 pt-4 pb-2 relative z-10">
                <SmartSearch
                    theme={theme}
                    onNavigate={onNavigate}
                    onAskAI={onAskAI}
                    showAlert={showAlert}
                />
                {showAIDropdown && (
                    <GlassCard theme={theme} className="absolute top-full w-full mt-2 p-4">
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
                    {MENU_ITEMS.map((item) => (
                        <GlassCard
                            key={item.id}
                            theme={theme}
                            className="
                                group relative p-4 h-32 flex flex-col justify-between 
                                cursor-pointer transition-all duration-300 hover:border-white/20
                            "
                            onClick={() => onNavigate(item.id)}
                        >
                            <div
                                className="absolute top-0 left-0 w-full h-full rounded-[1.75rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ background: `radial-gradient(circle at 20% 25%, ${theme.colors.subtle}00 0%, ${theme.colors.subtle} 100%)` }}
                            ></div>

                            <div className="relative">
                                <item.icon className="w-7 h-7" style={{ color: theme.colors.textSecondary }} strokeWidth={2} />
                            </div>

                            <div className="relative">
                                <span className="text-xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>{item.label}</span>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                <GlassCard theme={theme} className="p-1">
                    <button onClick={handleFeedbackClick} className="w-full h-20 p-3 rounded-xl flex items-center justify-center space-x-4">
                        <MessageSquare className="w-7 h-7" style={{ color: theme.colors.textSecondary }} strokeWidth={2} />
                        <span className="text-xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>Give Feedback</span>
                    </button>
                </GlassCard>
            </div>

            {showAIDropdown && (<div className="absolute inset-0 bg-transparent z-0" onClick={onCloseAIDropdown} />)}
        </div>
    );
};

const SalesProgressBar = React.memo(({ label, current, previous, goal, theme }) => { const currentPercentage = (current / goal) * 100; const previousPercentage = (previous / goal) * 100; return (<div><div className="flex justify-between items-baseline mb-1"><p className="font-semibold" style={{ color: theme.colors.textPrimary }}>{label}</p></div><div className="relative w-full h-2 rounded-full mb-1" style={{ backgroundColor: theme.colors.subtle }}><div className="h-2 rounded-full" style={{ width: `${currentPercentage}%`, backgroundColor: theme.colors.accent }}></div><div className="absolute top-[-4px] h-4 w-0.5" style={{ left: `${previousPercentage}%`, backgroundColor: theme.colors.secondary }}><span className="absolute -top-4 -translate-x-1/2 text-xs font-mono" style={{ color: theme.colors.secondary }}>2024</span></div></div><p className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>${current.toLocaleString()}</p></div>) });
const DonutChart = React.memo(({ data, theme }) => { const total = data.reduce((acc, item) => acc + item.value, 0); if (total === 0) return null; let cumulative = 0; const size = 150; const strokeWidth = 20; const radius = (size - strokeWidth) / 2; const circumference = 2 * Math.PI * radius; return (<div className="flex items-center space-x-4"><div className="relative" style={{ width: size, height: size }}><svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={theme.colors.subtle} strokeWidth={strokeWidth} /><g transform={`rotate(-90 ${size / 2} ${size / 2})`}>{data.map((item, index) => { const dasharray = (circumference * item.value) / total; const dashoffset = circumference * (1 - (cumulative / total)); cumulative += item.value; return (<circle key={index} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={item.color} strokeWidth={strokeWidth} strokeDasharray={`${dasharray} ${circumference}`} strokeDashoffset={-circumference + dashoffset} />) })}</g></svg></div><div className="space-y-2">{data.map(item => (<div key={item.label} className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div><div><p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{item.label}</p><p className="text-xs" style={{ color: theme.colors.textSecondary }}>${item.value.toLocaleString()}</p></div></div>))}</div></div>); });

const MonthlyBarChart = React.memo(({ data, theme }) => {
    const maxVal = useMemo(() => Math.max(...data.flatMap(d => [d.bookings, d.sales])), [data]);
    return (
        <div>
            <div className="flex justify-end space-x-4 mb-2 text-xs font-semibold">
                <div className="flex items-center"><div className="w-3 h-3 rounded-sm mr-1.5" style={{ backgroundColor: theme.colors.secondary }}></div><span style={{ color: theme.colors.textSecondary }}>Bookings</span></div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-sm mr-1.5" style={{ backgroundColor: theme.colors.accent }}></div><span style={{ color: theme.colors.textSecondary }}>Sales</span></div>
            </div>
            <div className="flex justify-between h-40">
                {data.map(month => (
                    <div key={month.month} className="flex flex-col items-center justify-end w-full">
                        <div className="flex w-full h-full items-end justify-center space-x-1">
                            <div className="w-1/2 rounded-t-md" style={{ height: `${(month.bookings / maxVal) * 100}%`, backgroundColor: theme.colors.secondary }}></div>
                            <div className="w-1/2 rounded-t-md" style={{ height: `${(month.sales / maxVal) * 100}%`, backgroundColor: theme.colors.accent }}></div>
                        </div>
                        <p className="text-xs font-bold mt-2" style={{ color: theme.colors.textSecondary }}>{month.month}</p>
                    </div>
                ))}
            </div>
        </div>
    )
});

const MonthlyTable = React.memo(({ data, theme, totalBookings, totalSales }) => (
    <div className="space-y-3">
        <div className="grid grid-cols-3 items-center text-xs font-bold" style={{ color: theme.colors.textSecondary }}>
            <p></p>
            <p className="text-right">Bookings</p>
            <p className="text-right">Sales</p>
        </div>
        {data.map(month => (
            <div key={month.month} className="grid grid-cols-3 items-center text-sm">
                <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>{month.month}</p>
                <p className="text-right" style={{ color: theme.colors.textSecondary }}>${month.bookings.toLocaleString()}</p>
                <p className="text-right font-semibold" style={{ color: theme.colors.accent }}>${month.sales.toLocaleString()}</p>
            </div>
        ))}
        <div className="grid grid-cols-3 items-center text-sm font-bold border-t pt-2" style={{ borderColor: theme.colors.border }}>
            <p style={{ color: theme.colors.textPrimary }}>Total</p>
            <p className="text-right" style={{ color: theme.colors.textSecondary }}>${totalBookings.toLocaleString()}</p>
            <p className="text-right" style={{ color: theme.colors.accent }}>${totalSales.toLocaleString()}</p>
        </div>
    </div>
));

const SalesScreen = ({ theme, onNavigate }) => {
    const [monthlyView, setMonthlyView] = useState('table');
    const [selectedOrder, setSelectedOrder] = useState(null); // State for the modal

    const { totalBookings, totalSales } = useMemo(() => {
        const bookings = MONTHLY_SALES_DATA.reduce((acc, month) => acc + month.bookings, 0);
        const sales = MONTHLY_SALES_DATA.reduce((acc, month) => acc + month.sales, 0);
        return { totalBookings: bookings, totalSales: sales };
    }, []);

    const recentOrders = useMemo(() => {
        return ORDER_DATA
            .filter(order => order.date && order.net)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 9); // Changed from 4 to 9 to provide more data
    }, []);

    const goal = 7000000;
    const percentToGoal = useMemo(() => (totalBookings / goal) * 100, [totalBookings, goal]);

    const handleToggleView = useCallback(() => setMonthlyView(v => v === 'chart' ? 'table' : 'chart'), []);
    const handleCustomerRankNav = useCallback(() => onNavigate('customer-rank'), [onNavigate]);
    const handleCommissionsNav = useCallback(() => onNavigate('commissions'), [onNavigate]);
    const handleRewardsNav = useCallback(() => onNavigate('incentive-rewards'), [onNavigate]);
    const handleShowOrderDetails = useCallback((order) => setSelectedOrder(order), []);
    const handleCloseModal = useCallback(() => setSelectedOrder(null), []);

    return (
        <>
            <PageTitle title="Sales Dashboard" theme={theme}>
                <button onClick={() => onNavigate('new-lead')} className="p-2 rounded-full -mr-2 transition-transform hover:scale-110 active:scale-95" style={{ backgroundColor: theme.colors.accent }}>
                    <Plus className="w-5 h-5 text-white" />
                </button>
            </PageTitle>

            <div className="px-4 space-y-4 pb-4">
                <GlassCard theme={theme} className="p-4 transition-all duration-300 hover:border-white/20">
                    <p className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>Progress to Goal</p>
                    <p className="text-4xl font-bold my-2" style={{ color: theme.colors.accent }}>{percentToGoal.toFixed(1)}%</p>
                    <div className="relative w-full h-2.5 rounded-full" style={{ backgroundColor: theme.colors.subtle }}>
                        <div className="h-2.5 rounded-full" style={{ width: `${percentToGoal}%`, backgroundColor: theme.colors.accent }}></div>
                    </div>
                </GlassCard>

                <GlassCard theme={theme} className="p-4 transition-all duration-300 hover:border-white/20">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <p className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>Bookings</p>
                            <p className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>${(totalBookings / 1000000).toFixed(2)}M</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>Backlog</p>
                            <p className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>$1.43M</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard theme={theme} className="p-4 transition-all duration-300 hover:border-white/20">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>Monthly Performance</h3>
                        <button onClick={handleToggleView} className="p-1.5 rounded-md" style={{ backgroundColor: theme.colors.subtle }}>
                            {monthlyView === 'chart' ? <List className="w-4 h-4" style={{ color: theme.colors.secondary }} /> : <BarChart2 className="w-4 h-4" style={{ color: theme.colors.secondary }} />}
                        </button>
                    </div>
                    {monthlyView === 'chart' ? <MonthlyBarChart data={MONTHLY_SALES_DATA} theme={theme} /> : <MonthlyTable data={MONTHLY_SALES_DATA} theme={theme} totalBookings={totalBookings} totalSales={totalSales} />}
                </GlassCard>

                <RecentPOsCard orders={recentOrders} theme={theme} onOrderClick={handleShowOrderDetails} />

                <GlassCard theme={theme} className="p-4 transition-all duration-300 hover:border-white/20">
                    <h3 className="font-bold text-lg mb-4" style={{ color: theme.colors.textPrimary }}>Verticals Breakdown</h3>
                    <DonutChart data={SALES_VERTICALS_DATA} theme={theme} />
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

const OrdersScreen = ({ theme, setSelectedOrder }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredOrders = useMemo(() =>
        ORDER_DATA.filter(order =>
            order.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.details && order.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
            order.orderNumber.includes(searchTerm)
        ),
        [searchTerm]
    );

    const groupedOrders = useMemo(() => {
        return filteredOrders.reduce((acc, order) => {
            // This is the updated logic.
            // It formats the full timestamp into a consistent date string for grouping.
            const date = order.date
                ? new Date(order.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }).toUpperCase()
                : 'No Date';

            if (!acc[date]) {
                acc[date] = { orders: [], total: 0 };
            }
            acc[date].orders.push(order);
            if (order.amount) {
                const amountValue = parseFloat(order.amount.replace(/[^0-9.-]+/g, ""));
                if (!isNaN(amountValue)) {
                    acc[date].total += amountValue;
                }
            }
            return acc;
        }, {});
    }, [filteredOrders]);

    return (
        <>
            <PageTitle title="Orders" theme={theme} />
            <div className="px-4 pt-4 pb-4"><SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by company, details..." theme={theme} /></div>
            <div className="px-4 space-y-4 pb-4">
                {Object.entries(groupedOrders).map(([date, group]) => (
                    <div key={date}>
                        {date !== 'No Date' && (
                            <div className="flex justify-between items-center mb-2 px-1">
                                <p className="font-bold" style={{ color: theme.colors.textPrimary }}>{date}</p>
                                <p className="font-bold text-lg" style={{ color: theme.colors.accent }}>${group.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                        )}
                        <div className="space-y-3">
                            {group.orders.map((order) => (
                                <GlassCard key={order.orderNumber} theme={theme} className="overflow-hidden cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                    <div className="p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>{order.details || order.company}</p>
                                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>#{order.orderNumber}</p>
                                        </div>
                                        {order.amount && <p className="font-semibold text-lg" style={{ color: theme.colors.textPrimary }}>{order.amount}</p>}
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

const LeadTimesScreen = ({ theme, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('series');
    const [filterBy, setFilterBy] = useState('all');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const filterMenuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
                setShowFilterMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [filterMenuRef]);

    const filteredAndSortedData = useMemo(() => {
        const parseWeeks = (weeks) => {
            return parseInt(weeks.split('-')[0]);
        };

        return LEAD_TIMES_DATA
            .filter(item => item.series.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(item => filterBy === 'all' || item.category === filterBy)
            .sort((a, b) => {
                if (sortBy === 'time') {
                    const timeA = Math.min(...a.products.map(p => parseWeeks(p.weeks)));
                    const timeB = Math.min(...b.products.map(p => parseWeeks(p.weeks)));
                    return timeA - timeB;
                }
                return a.series.localeCompare(b.series);
            });
    }, [searchTerm, sortBy, filterBy]);

    const FilterMenu = () => (
        <GlassCard ref={filterMenuRef} theme={theme} className="absolute top-14 right-4 z-10 w-48 p-2" style={{
            backgroundColor: theme.colors.surface.replace('1)', '0.85)'),
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}>
            <div className="p-2 space-y-1">
                <p className="text-xs font-bold" style={{ color: theme.colors.textSecondary }}>SORT BY</p>
                <button onClick={() => setSortBy('series')} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${sortBy === 'series' ? 'font-bold' : ''}`} style={{ color: theme.colors.textPrimary, backgroundColor: sortBy === 'series' ? theme.colors.subtle : 'transparent' }}>Series</button>
                <button onClick={() => setSortBy('time')} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${sortBy === 'time' ? 'font-bold' : ''}`} style={{ color: theme.colors.textPrimary, backgroundColor: sortBy === 'time' ? theme.colors.subtle : 'transparent' }}>Time</button>
            </div>
            <div className="p-2 space-y-1 border-t" style={{ borderColor: theme.colors.border }}>
                <p className="text-xs font-bold" style={{ color: theme.colors.textSecondary }}>FILTER</p>
                <button onClick={() => setFilterBy('all')} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${filterBy === 'all' ? 'font-bold' : ''}`} style={{ color: theme.colors.textPrimary, backgroundColor: filterBy === 'all' ? theme.colors.subtle : 'transparent' }}>All</button>
                <button onClick={() => setFilterBy('upholstered')} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${filterBy === 'upholstered' ? 'font-bold' : ''}`} style={{ color: theme.colors.textPrimary, backgroundColor: filterBy === 'upholstered' ? theme.colors.subtle : 'transparent' }}>Upholstered</button>
                <button onClick={() => setFilterBy('wood seating')} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${filterBy === 'wood seating' ? 'font-bold' : ''}`} style={{ color: theme.colors.textPrimary, backgroundColor: filterBy === 'wood seating' ? theme.colors.subtle : 'transparent' }}>Wood Seating</button>
                <button onClick={() => setFilterBy('casegoods')} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${filterBy === 'casegoods' ? 'font-bold' : ''}`} style={{ color: theme.colors.textPrimary, backgroundColor: filterBy === 'casegoods' ? theme.colors.subtle : 'transparent' }}>Casegoods</button>
            </div>
        </GlassCard>
    );

    return (
        <>
            <PageTitle title="Lead Times" theme={theme} />
            <div className="px-4 pb-4 flex items-center space-x-2">
                <SearchInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search series..."
                    theme={theme}
                    className="flex-grow"
                />
                <div className="relative">
                    <button onClick={() => setShowFilterMenu(prev => !prev)} className="p-3.5 rounded-lg" style={{ backgroundColor: theme.colors.subtle }}>
                        <Filter className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
                    </button>
                    {showFilterMenu && <FilterMenu />}
                </div>
            </div>
            <div className="px-4 space-y-3 pb-4">
                {filteredAndSortedData.map(item => (
                    <GlassCard key={item.series} theme={theme} className="p-4">
                        <h3 className="font-bold text-lg mb-2" style={{ color: theme.colors.textPrimary }}>{item.series}</h3>
                        <div className="flex space-x-6">
                            {item.products.map(product => (
                                <div key={product.type} className="text-center">
                                    <p className="font-bold text-3xl" style={{ color: theme.colors.accent }}>{product.weeks}</p>
                                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{product.type}</p>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                ))}
                <p className="text-xs text-center p-4" style={{ color: theme.colors.textSecondary }}>Custom items will add an additional two weeks to standard lead time.</p>
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
const ProjectsScreen = ({ onNavigate, theme, opportunities }) => {
    const [projectsTab, setProjectsTab] = useState('pipeline');
    const [selectedPipelineStage, setSelectedPipelineStage] = useState('Discovery');

    const filteredOpportunities = useMemo(() => opportunities.filter(opp => opp.stage === selectedPipelineStage), [selectedPipelineStage, opportunities]);

    return (
        <>
            <PageTitle title="Projects" theme={theme}>
                <button onClick={() => onNavigate('new-lead')} className="p-2 rounded-full -mr-2" style={{ backgroundColor: theme.colors.accent }}>
                    <Plus className="w-5 h-5 text-white" />
                </button>
            </PageTitle>
            <div className="px-4">
                <GlassCard theme={theme} className="p-1 flex">
                    <button onClick={() => setProjectsTab('pipeline')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors`} style={{ backgroundColor: projectsTab === 'pipeline' ? theme.colors.primary : 'transparent', color: projectsTab === 'pipeline' ? theme.colors.surface : theme.colors.textPrimary }}>Pipeline</button>
                    <button onClick={() => setProjectsTab('my-projects')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors`} style={{ backgroundColor: projectsTab === 'my-projects' ? theme.colors.primary : 'transparent', color: projectsTab === 'my-projects' ? theme.colors.surface : theme.colors.textPrimary }}>My Projects</button>
                </GlassCard>
            </div>

            {projectsTab === 'pipeline' ? (
                <>
                    <div className="flex space-x-2 overflow-x-auto p-4 scrollbar-hide">{STAGES.map(stage => (<button key={stage} onClick={() => setSelectedPipelineStage(stage)} className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors`} style={{ backgroundColor: selectedPipelineStage === stage ? theme.colors.primary : 'transparent', color: selectedPipelineStage === stage ? theme.colors.surface : theme.colors.textSecondary }}>{stage}</button>))}</div>
                    <div className="px-4 space-y-4 pb-4">{filteredOpportunities.map(opp => (<GlassCard key={opp.id} theme={theme} className="overflow-hidden"><div className="p-4"><div className="flex justify-between items-start"><h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{opp.name}</h3><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${STAGE_COLORS[opp.stage]}`}>{opp.stage}</span></div><p className="text-sm" style={{ color: theme.colors.textSecondary }}>{opp.company}</p><p className="font-semibold text-2xl my-2" style={{ color: theme.colors.textPrimary }}>{opp.value}</p></div></GlassCard>))}</div>
                </>
            ) : (
                <div className="px-4 pt-4 pb-4 grid grid-cols-2 gap-4">
                    {MY_PROJECTS_DATA.map(project => (
                        <GlassCard key={project.id} theme={theme} className="p-2 space-y-2 cursor-pointer">
                            <img src={project.image} alt={project.name} className="w-full h-24 object-cover rounded-lg" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/EEE/333?text=Error'; }} />
                            <div>
                                <p className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>{project.name}</p>
                                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{project.location}</p>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </>
    );
};

const PermissionToggle = React.memo(({ label, isEnabled, onToggle, theme, disabled }) => {
    const titleText = disabled ? "Requires Sales Data access" : "";
    return (
        <div title={titleText} className={`flex items-center justify-between text-sm ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`} onClick={disabled ? undefined : onToggle}>
            <span style={{ color: theme.colors.textSecondary }}>{label}</span>
            <div className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`} style={{ backgroundColor: isEnabled ? theme.colors.accent : theme.colors.subtle }}>
                <span className={`inline-block w-3.5 h-3.5 transform bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
        </div>
    );
});


const MembersScreen = ({ theme, members, setMembers, currentUserId }) => {
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUser, setNewUser] = useState(EMPTY_USER);
    const [userToRemove, setUserToRemove] = useState(null);

    const admins = useMemo(() => members.filter(m => m.role === 'Admin'), [members]);
    const users = useMemo(() => members.filter(m => m.role === 'User'), [members]);

    const orderedPermissionLabels = useMemo(() => ({
        salesData: "Sales Data",
        customerRanking: "Customer Ranking",
        projects: "Projects",
        commissions: "Commissions",
        dealerRewards: "Dealer Rewards",
        submittingReplacements: "Submitting Replacements"
    }), []);

    const handleToggleExpand = useCallback((userId) => {
        setExpandedUserId(prev => (prev === userId ? null : userId));
    }, []);

    const handleUpdateUser = useCallback((userId, field, value) => {
        setMembers(prev => prev.map(m => m.id === userId ? { ...m, [field]: value } : m));
    }, [setMembers]);

    const handleUpdateRole = useCallback((userId, newRole) => {
        setMembers(prev => prev.map(m => (m.id === userId ? { ...m, role: newRole } : m)));
        setExpandedUserId(null);
    }, [setMembers]);

    const handleConfirmRemove = useCallback((user) => {
        setUserToRemove(user);
    }, []);

    const executeRemoveUser = useCallback(() => {
        if (userToRemove) {
            setMembers(prev => prev.filter(m => m.id !== userToRemove.id));
            setUserToRemove(null);
            setExpandedUserId(null);
        }
    }, [userToRemove, setMembers]);

    const handleTogglePermission = useCallback((e, userId, permissionKey) => {
        e.stopPropagation();
        setMembers(prevMembers =>
            prevMembers.map(member => {
                if (member.id === userId) {
                    const newPermissions = { ...member.permissions, [permissionKey]: !member.permissions[permissionKey] };
                    if (permissionKey === 'salesData' && !newPermissions.salesData) {
                        newPermissions.commissions = false;
                        newPermissions.dealerRewards = false;
                        newPermissions.customerRanking = false;
                    }
                    return { ...member, permissions: newPermissions };
                }
                return member;
            })
        );
    }, [setMembers]);

    const handleAddUser = useCallback((e) => {
        e.preventDefault();
        if (newUser.firstName && newUser.lastName && newUser.email) {
            const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
            setMembers(prev => [...prev, { ...newUser, id: newId }]);
            setShowAddUserModal(false);
            setNewUser(EMPTY_USER);
        } else {
            console.error("Please fill out all fields.");
        }
    }, [newUser, members, setMembers]);

    const handleNewUserChange = useCallback((field, value) => {
        let newPermissions = { ...newUser.permissions };
        if (field === 'title') {
            if (value === 'Sales') {
                newPermissions = { salesData: true, commissions: false, projects: true, customerRanking: true, dealerRewards: true, submittingReplacements: true };
            } else if (value === 'Designer') {
                newPermissions = { salesData: false, commissions: false, projects: true, customerRanking: false, dealerRewards: false, submittingReplacements: true };
            }
        }
        setNewUser(prev => ({ ...prev, [field]: value, permissions: newPermissions }));
    }, [newUser]);

    const MemberCard = React.memo(({ user, theme, expanded, onToggleExpand, onUpdateUser, onUpdateRole, onConfirmRemove, onTogglePermission, orderedPermissionLabels, USER_TITLES, isCurrentUser }) => (
        <GlassCard theme={theme} className="p-0 overflow-hidden transition-all">
            <div className="p-4 cursor-pointer" onClick={() => onToggleExpand(user.id)}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <p className="font-bold" style={{ color: theme.colors.textPrimary }}>{user.firstName} {user.lastName}</p>
                        {isCurrentUser && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.colors.accent, color: 'white' }}>You</span>}
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} style={{ color: theme.colors.secondary }} />
                </div>
                {user.role !== 'Admin' && <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>{user.title}</p>}
            </div>
            {expanded && (
                <div className="bg-black/5 dark:bg-white/5">
                    {user.role === 'User' && (
                        <div className="p-4 border-t space-y-4" style={{ borderColor: theme.colors.subtle }}>
                            <FormInput
                                type="select"
                                value={user.title}
                                onChange={(e) => onUpdateUser(user.id, 'title', e.target.value)}
                                options={USER_TITLES.map(t => ({ value: t, label: t }))}
                                theme={theme}
                                placeholder="User Title"
                            />
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                {Object.entries(orderedPermissionLabels).map(([key, label]) => {
                                    const isDisabled = !user.permissions.salesData && ['commissions', 'dealerRewards', 'customerRanking'].includes(key);
                                    return (
                                        <PermissionToggle
                                            key={key}
                                            label={label}
                                            isEnabled={user.permissions[key]}
                                            disabled={isDisabled}
                                            onToggle={(e) => onTogglePermission(e, user.id, key)}
                                            theme={theme}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    <div className="p-4 border-t space-y-3" style={{ borderColor: theme.colors.subtle }}>
                        <button onClick={() => onUpdateRole(user.id, user.role === 'Admin' ? 'User' : 'Admin')} className="w-full text-center p-2.5 rounded-lg font-semibold" style={{ backgroundColor: theme.colors.accent, color: 'white' }}>
                            {user.role === 'Admin' ? 'Make User' : 'Make Admin'}
                        </button>
                        <button onClick={() => onConfirmRemove(user)} className="w-full text-center p-2.5 rounded-lg font-semibold bg-red-500/10 text-red-500">
                            Remove User
                        </button>
                    </div>
                </div>
            )}
        </GlassCard>
    ));

    return (
        <>
            <PageTitle title="Members" theme={theme}>
                <button onClick={() => setShowAddUserModal(true)} className="p-2 rounded-full" style={{ backgroundColor: theme.colors.accent }}>
                    <Plus className="w-5 h-5 text-white" />
                </button>
            </PageTitle>
            <div className="px-4 space-y-6 pb-4">
                <div>
                    <h3 className="font-bold text-xl mb-3 px-1" style={{ color: theme.colors.textPrimary }}>Administrators</h3>
                    <div className="space-y-3">
                        {admins.map(member => (
                            <MemberCard key={member.id} user={member} theme={theme} expanded={expandedUserId === member.id} onToggleExpand={handleToggleExpand} onUpdateUser={handleUpdateUser} onUpdateRole={handleUpdateRole} onConfirmRemove={handleConfirmRemove} onTogglePermission={handleTogglePermission} orderedPermissionLabels={orderedPermissionLabels} USER_TITLES={USER_TITLES} isCurrentUser={member.id === currentUserId} />
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-xl mb-3 px-1" style={{ color: theme.colors.textPrimary }}>Users</h3>
                    <div className="space-y-3">
                        {users.map(member => (
                            <MemberCard key={member.id} user={member} theme={theme} expanded={expandedUserId === member.id} onToggleExpand={handleToggleExpand} onUpdateUser={handleUpdateUser} onUpdateRole={handleUpdateRole} onConfirmRemove={handleConfirmRemove} onTogglePermission={handleTogglePermission} orderedPermissionLabels={orderedPermissionLabels} USER_TITLES={USER_TITLES} isCurrentUser={member.id === currentUserId} />
                        ))}
                    </div>
                </div>
            </div>

            <Modal show={showAddUserModal} onClose={() => setShowAddUserModal(false)} title="Add New User" theme={theme}>
                <form onSubmit={handleAddUser} className="space-y-4">
                    <FormInput label="First Name" value={newUser.firstName} onChange={e => handleNewUserChange('firstName', e.target.value)} placeholder="First Name" theme={theme} />
                    <FormInput label="Last Name" value={newUser.lastName} onChange={e => handleNewUserChange('lastName', e.target.value)} placeholder="Last Name" theme={theme} />
                    <FormInput type="email" label="Email" value={newUser.email} onChange={e => handleNewUserChange('email', e.target.value)} placeholder="Email" theme={theme} />
                    <FormInput type="select" label="Title" options={USER_TITLES.map(t => ({ value: t, label: t }))} value={newUser.title} onChange={e => handleNewUserChange('title', e.target.value)} theme={theme} placeholder="Select a Title" />
                    <div className="pt-2">
                        <button type="submit" className="w-full text-white font-bold py-3 px-6 rounded-lg transition-colors" style={{ backgroundColor: theme.colors.accent }}>Create User</button>
                    </div>
                </form>
            </Modal>
            <Modal show={!!userToRemove} onClose={() => setUserToRemove(null)} title="Remove User" theme={theme}>
                <p style={{ color: theme.colors.textPrimary }}>Are you sure you want to remove <span className="font-bold">{userToRemove?.firstName} {userToRemove?.lastName}</span>?</p>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>This action is permanent and will delete the user from the MyJSI app.</p>
                <div className="flex justify-end space-x-3 pt-4">
                    <button onClick={() => setUserToRemove(null)} className="font-bold py-2 px-5 rounded-lg" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>Cancel</button>
                    <button onClick={executeRemoveUser} className="font-bold py-2 px-5 rounded-lg bg-red-600 text-white">Remove User</button>
                </div>
            </Modal>
        </>
    );
};

const CustomerRankScreen = ({ theme }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'sales', direction: 'descending' });
    const [modalData, setModalData] = useState(null);

    const sortedCustomers = useMemo(() => {
        let sortableItems = [...CUSTOMER_RANK_DATA];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [sortConfig]);

    const requestSort = useCallback((key) => {
        setSortConfig(currentConfig => {
            let direction = 'descending';
            if (currentConfig.key === key && currentConfig.direction === 'descending') {
                direction = 'ascending';
            }
            return { key, direction };
        });
    }, []);

    const handleOpenModal = useCallback((customer) => {
        setModalData(customer);
    }, []);

    const handleCloseModal = useCallback(() => {
        setModalData(null);
    }, []);

    const SortableHeader = React.memo(({ sortKey, children }) => {
        const isSorted = sortConfig.key === sortKey;
        const SortIcon = sortConfig.direction === 'ascending' ? ChevronUp : ChevronDown;

        return (
            <div className="flex items-center justify-end cursor-pointer" onClick={() => requestSort(sortKey)} >
                {isSorted && <SortIcon className="w-4 h-4 mr-1" />}
                <span style={{ fontWeight: isSorted ? 'bold' : 'normal', textDecoration: isSorted ? 'underline' : 'none', }}>{children}</span>
            </div>
        )
    });

    const { topThree, theRest } = useMemo(() => ({
        topThree: sortedCustomers.slice(0, 3),
        theRest: sortedCustomers.slice(3)
    }), [sortedCustomers]);

    return (
        <>
            <PageTitle title="Customer Ranking" theme={theme} />
            <div className="px-4 pb-4 space-y-6">

                <div className="flex items-end justify-center space-x-2">
                    {topThree[1] && (
                        <div className="text-center w-1/4">
                            <Trophy className="mx-auto w-8 h-8" fill="#C0C0C0" color="#A0A0A0" />
                            <p className="font-bold text-sm truncate" style={{ color: theme.colors.textPrimary }}>{topThree[1].name}</p>
                            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>${topThree[1][sortConfig.key].toLocaleString()}</p>
                        </div>
                    )}
                    {topThree[0] && (
                        <div className="text-center w-1/3 order-first sm:order-none">
                            <Trophy className="mx-auto w-10 h-10" fill="#FFD700" color="#D4B37F" />
                            <p className="font-bold text-md truncate" style={{ color: theme.colors.textPrimary }}>{topThree[0].name}</p>
                            <p className="text-sm font-semibold" style={{ color: theme.colors.accent }}>${topThree[0][sortConfig.key].toLocaleString()}</p>
                        </div>
                    )}
                    {topThree[2] && (
                        <div className="text-center w-1/4">
                            <Trophy className="mx-auto w-8 h-8" fill="#CD7F32" color="#A9886C" />
                            <p className="font-bold text-sm truncate" style={{ color: theme.colors.textPrimary }}>{topThree[2].name}</p>
                            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>${topThree[2][sortConfig.key].toLocaleString()}</p>
                        </div>
                    )}
                </div>

                <GlassCard theme={theme} className="p-4">
                    <div className="grid grid-cols-12 gap-2 text-sm font-bold pb-2 border-b" style={{ borderColor: theme.colors.subtle, color: theme.colors.textSecondary }}>
                        <div className="col-span-1">#</div>
                        <div className="col-span-5">Name</div>
                        <div className="col-span-3"><SortableHeader sortKey="bookings">Bookings</SortableHeader></div>
                        <div className="col-span-3"><SortableHeader sortKey="sales">Sales</SortableHeader></div>
                    </div>
                    <div className="space-y-1 pt-2">
                        {theRest.map((customer, index) => (
                            <div key={customer.id} className="grid grid-cols-12 gap-2 items-center text-sm p-2 rounded-lg cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ backgroundColor: index % 2 === 1 ? 'rgba(0,0,0,0.03)' : 'transparent' }} onClick={() => handleOpenModal(customer)}>
                                <div className="col-span-1 font-semibold" style={{ color: theme.colors.textSecondary }}>{index + 4}</div>
                                <div className="col-span-5 font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{customer.name}</div>
                                <div className="col-span-3 text-right font-mono" style={{ color: theme.colors.textSecondary }}>${customer.bookings.toLocaleString()}</div>
                                <div className="col-span-3 text-right font-mono font-semibold" style={{ color: theme.colors.accent }}>
                                    ${customer.sales.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            <Modal show={!!modalData} onClose={handleCloseModal} title={modalData?.name || ""} theme={theme}>
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
                <div className="text-right font-bold pt-3 border-t mt-3" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}>
                    Total: ${modalData?.sales.toLocaleString()}
                </div>
            </Modal>
        </>
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
        const fullSetItem = {
            id: 'full-jsi-set',
            name: 'Full JSI Sample Set'
        };
        onUpdateCart(fullSetItem, 1);
    }, [onUpdateCart]);

    const totalCartItems = useMemo(() => Object.values(cart).reduce((sum, qty) => sum + qty, 0), [cart]);
    const filteredProducts = useMemo(() => SAMPLE_PRODUCTS.filter(p => p.category === selectedCategory), [selectedCategory]);

    return (
        <>
            <PageTitle title="Samples" theme={theme}>
                <div className="flex items-center space-x-2">
                    <button onClick={handleOrderFullSet} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>
                        Order Full JSI Set
                    </button>
                    <div className="relative">
                        <button onClick={() => onNavigate('samples/cart')} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                            <ShoppingCart className="w-7 h-7" style={{ color: theme.colors.textPrimary }} />
                        </button>
                        {totalCartItems > 0 && <div className="absolute -top-1 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: theme.colors.accent }}>{totalCartItems}</div>}
                    </div>
                </div>
            </PageTitle>

            <div className="px-4 space-y-4 pb-4">
                <div className="overflow-hidden rounded-xl" style={{ backgroundColor: theme.colors.surface }}>
                    <div className="flex space-x-2 p-1 overflow-x-auto scrollbar-hide">
                        {SAMPLE_CATEGORIES.map(cat => (
                            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex-shrink-0 px-3 py-2 text-sm font-semibold rounded-lg transition-colors w-28`}>
                                <span className="p-2 rounded-md" style={{
                                    backgroundColor: selectedCategory === cat.id ? theme.colors.subtle : 'transparent',
                                    color: selectedCategory === cat.id ? theme.colors.accent : theme.colors.textSecondary
                                }}>
                                    {cat.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <GlassCard theme={theme} className="p-3 flex items-center justify-between">
                    <span className="font-bold" style={{ color: theme.colors.textPrimary }}>
                        {`Complete ${SAMPLE_CATEGORIES.find(c => c.id === selectedCategory)?.name || ''} Set`}
                    </span>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setSetQuantity(q => Math.max(1, q - 1))} className="w-7 h-7 flex items-center justify-center rounded-md" style={{ backgroundColor: theme.colors.subtle }}><Minus className="w-4 h-4" style={{ color: theme.colors.textSecondary }} /></button>
                        <span className="font-bold text-lg w-8 text-center" style={{ color: theme.colors.textPrimary }}>{setQuantity}</span>
                        <button onClick={() => setSetQuantity(q => q + 1)} className="w-7 h-7 flex items-center justify-center rounded-md" style={{ backgroundColor: theme.colors.subtle }}><Plus className="w-4 h-4" style={{ color: theme.colors.textSecondary }} /></button>
                        <button onClick={handleAddSetToCart} className="font-bold py-1.5 px-4 rounded-md text-white" style={{ backgroundColor: theme.colors.accent }}>Add</button>
                    </div>
                </GlassCard>
            </div>

            <div className="px-4 grid grid-cols-2 gap-4 pb-4">
                {filteredProducts.map(product => {
                    const quantity = cart[product.id] || 0;
                    return (<div key={product.id} className="text-center">
                        <GlassCard theme={theme} className="relative aspect-square w-full rounded-2xl p-1" style={{ borderColor: quantity > 0 ? theme.colors.accent : 'transparent', borderWidth: '2px' }}>
                            <div className="w-full h-full rounded-xl" style={{ backgroundColor: product.color }}></div>
                            {quantity === 0 ? (
                                <button onClick={() => onUpdateCart(product, 1)} className="absolute inset-0"></button>
                            ) : (
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24">
                                    <GlassCard theme={theme} className="p-1 flex justify-between items-center">
                                        <button onClick={() => onUpdateCart(product, -1)} className="w-7 h-7 flex items-center justify-center rounded-md" style={{ backgroundColor: theme.colors.subtle }}><Minus className="w-4 h-4" style={{ color: theme.colors.textSecondary }} /></button>
                                        <span className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{quantity}</span>
                                        <button onClick={() => onUpdateCart(product, 1)} className="w-7 h-7 flex items-center justify-center rounded-md" style={{ backgroundColor: theme.colors.subtle }}><Plus className="w-4 h-4" style={{ color: theme.colors.textSecondary }} /></button>
                                    </GlassCard>
                                </div>
                            )}
                        </GlassCard>
                        <p className="mt-2 font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>{product.name}</p>
                    </div>)
                })}
            </div>
        </>
    );
};

const CartScreen = ({ theme, onNavigate, handleBack, cart, setCart, onUpdateCart, userSettings }) => {
    const [address, setAddress] = useState('');
    const [predictions, setPredictions] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const autocompleteService = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const Maps_API_KEY = 'AIzaSyBnNqlHE8XC92q10IUCQgXx-aiOKpCS7Ac';

        if (window.google && window.google.maps) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${Maps_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        script.onload = () => {
            if (window.google && window.google.maps) {
                autocompleteService.current = new window.google.maps.places.AutocompleteService();
            }
        };

        return () => {
            const existingScript = document.head.querySelector(`script[src*="maps.googleapis.com"]`);
            if (existingScript) {
            }
        };
    }, []);

    const handleAddressChange = (e) => {
        const value = e.target.value;
        setAddress(value);
        if (autocompleteService.current && value) {
            autocompleteService.current.getPlacePredictions({ input: value }, (predictions, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setPredictions(predictions);
                } else {
                    setPredictions([]);
                }
            });
        } else {
            setPredictions([]);
        }
    };

    const handleSelectPrediction = (prediction) => {
        setAddress(prediction.description);
        setPredictions([]);
    };

    const cartItems = useMemo(() => {
        return Object.entries(cart).map(([id, quantity]) => {
            if (id === 'full-jsi-set') {
                return { id, name: 'Full JSI Sample Set', quantity };
            }
            if (id.startsWith('set-')) {
                const categoryId = id.replace('set-', '');
                const categoryName = SAMPLE_CATEGORIES.find(c => c.id === categoryId)?.name || 'Unknown';
                return { id, name: `Complete ${categoryName} Set`, quantity };
            }
            const product = SAMPLE_PRODUCTS.find(p => String(p.id) === id);
            return product ? { ...product, quantity } : null;
        }).filter(Boolean);
    }, [cart]);

    const handleSubmit = useCallback(() => {
        setIsSubmitted(true);
        setTimeout(() => {
            setCart({});
            onNavigate('home');
        }, 1000);
    }, [setCart, onNavigate])

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <GlassCard theme={theme} className="p-8 flex flex-col items-center justify-center">
                    <CheckCircle className="w-16 h-16 mb-4" style={{ color: theme.colors.accent }} />
                    <h2 className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>Ordered!</h2>
                </GlassCard>
            </div>
        )
    }

    return (
        <>
            <PageTitle title="Cart" theme={theme} />
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
                        <input
                            ref={inputRef}
                            type="text"
                            value={address}
                            onChange={handleAddressChange}
                            placeholder="Start typing your address..."
                            className="w-full p-2 pr-10 border rounded-lg" style={{ backgroundColor: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                        />
                        <button onClick={() => setAddress(userSettings.homeAddress)} className="absolute top-2 right-2 p-1 rounded-full" style={{ backgroundColor: theme.colors.surface }}><Home className="w-5 h-5" style={{ color: theme.colors.secondary }} /></button>
                        {predictions.length > 0 && (
                            <GlassCard theme={theme} className="absolute w-full mt-1 z-10 p-1">
                                {predictions.map(prediction => (
                                    <button
                                        key={prediction.place_id}
                                        onClick={() => handleSelectPrediction(prediction)}
                                        className="block w-full text-left p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
                                        style={{ color: theme.colors.textSecondary }}
                                    >
                                        {prediction.description}
                                    </button>
                                ))}
                            </GlassCard>
                        )}
                    </div>
                </GlassCard>
                <button onClick={handleSubmit} disabled={Object.keys(cart).length === 0 || !address.trim()} className="w-full font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50" style={{ backgroundColor: theme.colors.accent, color: '#FFFFFF' }}>Submit</button>
            </div>
        </>
    );
};

const ResourcesScreen = ({ theme, onNavigate }) => {
    return (
        <>
            <PageTitle title="Resources" theme={theme} />
            <div className="px-4 space-y-6 pb-4">
                {RESOURCES_DATA.map(category => (
                    <div key={category.category}>
                        <h2 className="text-xl font-bold mb-2 px-1" style={{ color: theme.colors.textPrimary }}>{category.category}</h2>
                        <div className="space-y-3">
                            {category.items.map(item => (
                                <GlassCard key={item.label} theme={theme} className="p-1">
                                    <button onClick={() => onNavigate(item.nav)} className="w-full p-3 rounded-xl flex items-center justify-between">
                                        <span className="text-md font-semibold tracking-tight" style={{ color: theme.colors.textPrimary }}>{item.label}</span>
                                        <ArrowRight className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                                    </button>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

const INSTALL_INSTRUCTIONS_DATA = [
    { id: 'arwyn', name: 'Arwyn', type: 'Seating', videoUrl: 'https://placehold.co/1600x900/2A2A2A/FFF?text=Video', pdfUrl: 'https://www.jsifurniture.com/resources/documents/type/11', thumbnail: 'https://webresources.jsifurniture.com/production/uploads/jsi_arwyn_comp_0001.jpg' },
    { id: 'bryn', name: 'Bryn', type: 'Seating', videoUrl: 'https://placehold.co/1600x900/2A2A2A/FFF?text=Video', pdfUrl: 'https://www.jsifurniture.com/resources/documents/type/11', thumbnail: 'https://webresources.jsifurniture.com/production/uploads/jsi_bryn_comp_0004.jpg' },
    { id: 'caav', name: 'Caav', type: 'Lounge', videoUrl: 'https://placehold.co/1600x900/2A2A2A/FFF?text=Video', pdfUrl: 'https://www.jsifurniture.com/resources/documents/type/11', thumbnail: 'https://webresources.jsifurniture.com/production/uploads/jsi_caav_comp_0005.jpg' },
    { id: 'vision', name: 'Vision', type: 'Casegoods', videoUrl: 'https://placehold.co/1600x900/2A2A2A/FFF?text=Video', pdfUrl: 'https://www.jsifurniture.com/resources/documents/type/11', thumbnail: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_000002.jpg' },
    { id: 'forge', name: 'Forge', type: 'Tables', videoUrl: 'https://placehold.co/1600x900/2A2A2A/FFF?text=Video', pdfUrl: 'https://www.jsifurniture.com/resources/documents/type/11', thumbnail: 'https://webresources.jsifurniture.com/production/uploads/jsi_forge_config_0001.jpg' },
    { id: 'flux', name: 'Flux', type: 'Casegoods', videoUrl: 'https://placehold.co/1600x900/2A2A2A/FFF?text=Video', pdfUrl: 'https://www.jsifurniture.com/resources/documents/type/11', thumbnail: 'https://webresources.jsifurniture.com/production/uploads/jsi_flux_config_00008.jpg' },
    { id: 'tablet', name: 'Tablet', type: 'Tables', videoUrl: 'https://placehold.co/1600x900/2A2A2A/FFF?text=Video', pdfUrl: 'https://www.jsifurniture.com/resources/documents/type/11', thumbnail: 'https://webresources.jsifurniture.com/production/uploads/jsi_tablet_config_0001.jpg' },
];

const InstallInstructionsScreen = ({ theme }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSeries, setSelectedSeries] = useState(null);

    const groupedInstructions = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase().trim();
        const filtered = INSTALL_INSTRUCTIONS_DATA.filter(item =>
            item.name.toLowerCase().includes(lowercasedFilter)
        );

        return filtered.reduce((acc, item) => {
            const { type } = item;
            if (!acc[type]) acc[type] = [];
            acc[type].push(item);
            return acc;
        }, {});
    }, [searchTerm]);

    if (selectedSeries) {
        return (
            <div className="flex flex-col h-full">
                <PageTitle title={selectedSeries.name} theme={theme} />
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-hide">
                    <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden flex items-center justify-center">
                        <img src={selectedSeries.videoUrl} alt={`${selectedSeries.name} video placeholder`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center cursor-pointer">
                            <Play className="w-8 h-8 text-white" fill="white" />
                        </div>
                    </div>
                    <a href={selectedSeries.pdfUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <GlassCard theme={theme} className="p-4 flex items-center justify-between hover:border-gray-400/50">
                            <div className="flex items-center space-x-3">
                                <Paperclip className="w-6 h-6" style={{ color: theme.colors.accent }} />
                                <span className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>Download PDF Instructions</span>
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
            <div className="px-4 pt-2 pb-4 sticky top-0 z-10 bg-opacity-80 backdrop-blur-md" style={{ backgroundColor: theme.colors.background.substring(0, 7) + 'd0' }}>
                <SearchInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by series name..."
                    theme={theme}
                />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
                {Object.entries(groupedInstructions).map(([type, items]) => (
                    <section key={type} className="mb-8">
                        <h2 className="text-2xl font-bold capitalize mb-4 px-1" style={{ color: theme.colors.textPrimary }}>{type}</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {items.map(item => (
                                <div key={item.id} onClick={() => setSelectedSeries(item)} className="cursor-pointer space-y-2">
                                    <GlassCard theme={theme} className="aspect-square p-2 overflow-hidden hover:border-gray-400/50">
                                        <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                                    </GlassCard>
                                    <p className="font-semibold text-center text-sm" style={{ color: theme.colors.textPrimary }}>{item.name}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
};

const PRESENTATIONS_DATA = {
    'arwyn': {
        name: 'Arwyn Series',
        slides: [
            'https://placehold.co/1600x900/A9886C/FFFFFF?text=Arwyn%20-%20Slide%201',
            'https://placehold.co/1600x900/A9886C/FFFFFF?text=Arwyn%20-%20Slide%202',
            'https://placehold.co/1600x900/A9886C/FFFFFF?text=Arwyn%20-%20Slide%203',
        ]
    },
    'vision': {
        name: 'Vision Series',
        slides: [
            'https://placehold.co/1600x900/7A7A7A/FFFFFF?text=Vision%20-%20Slide%201',
            'https://placehold.co/1600x900/7A7A7A/FFFFFF?text=Vision%20-%20Slide%202',
            'https://placehold.co/1600x900/7A7A7A/FFFFFF?text=Vision%20-%20Slide%203',
            'https://placehold.co/1600x900/7A7A7A/FFFFFF?text=Vision%20-%20Slide%204',
        ]
    },
    // Add other series presentations here...
};

const PresentationViewerScreen = ({ theme, onBack, seriesId }) => {
    const presentation = PRESENTATIONS_DATA[seriesId] || { name: 'Not Found', slides: ['https://placehold.co/1600x900/E3DBC8/2A2A2A?text=Presentation%20Not%20Found'] };
    const [currentSlide, setCurrentSlide] = useState(0);

    const goToNext = () => {
        setCurrentSlide(prev => (prev === presentation.slides.length - 1 ? 0 : prev + 1));
    };

    const goToPrev = () => {
        setCurrentSlide(prev => (prev === 0 ? presentation.slides.length - 1 : prev - 1));
    };

    return (
        <div className="flex flex-col h-full">
            <PageTitle title={presentation.name} theme={theme} onBack={onBack} />
            <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4">
                <div className="relative w-full aspect-video rounded-2xl bg-black shadow-lg overflow-hidden">
                    <img src={presentation.slides[currentSlide]} alt={`Slide ${currentSlide + 1}`} className="w-full h-full object-contain" />
                    {/* Navigation Arrows */}
                    <button onClick={goToPrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white hover:bg-black/50 transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={goToNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white hover:bg-black/50 transition-colors">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-2 right-3 px-2 py-1 rounded-full bg-black/40 text-white text-xs font-semibold">
                        {currentSlide + 1} / {presentation.slides.length}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PresentationSeriesListScreen = ({ theme, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSeries = useMemo(() => {
        if (!searchTerm.trim()) return JSI_PRODUCT_SERIES;
        return JSI_PRODUCT_SERIES.filter(series =>
            series.toLowerCase().includes(searchTerm.toLowerCase().trim())
        );
    }, [searchTerm]);

    return (
        <div className="h-full flex flex-col">
            <PageTitle title="By Series" theme={theme} />
            <div className="px-4 pt-2 pb-4">
                <SearchInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search series..."
                    theme={theme}
                />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 scrollbar-hide">
                {filteredSeries.map(series => (
                    <GlassCard key={series} theme={theme} className="p-1">
                        <button
                            onClick={() => onNavigate(`resources/presentations/view/${series.toLowerCase()}`)}
                            className="w-full p-3 rounded-xl flex items-center justify-between"
                        >
                            <span className="text-md font-semibold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                                {series}
                            </span>
                            <ArrowRight className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                        </button>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

const PresentationsScreen = ({ theme, onNavigate }) => {
    // This now navigates to the new list screen
    const handleNavigateBySeries = () => onNavigate('resources/presentations/by_series_list');
    // This remains a placeholder
    const handleNavigateByType = () => onNavigate('resources/presentations/by_type');


    const PresentationButton = ({ title, imageUrl, onClick }) => (
        <div onClick={onClick} className="cursor-pointer group">
            <GlassCard theme={theme} className="p-2 overflow-hidden transition-all duration-300 group-hover:border-gray-400/50 group-hover:scale-[1.02] active:scale-[0.98]">
                <div className="relative aspect-video w-full rounded-xl bg-gray-200 overflow-hidden">
                    <img src={imageUrl} alt={`${title} presentation preview`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent" />
                    <h3 className="absolute bottom-3 left-4 text-2xl font-bold text-white tracking-tight">{title}</h3>
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
        function handleClickOutside(event) {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
                setShowFilterMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [filterMenuRef]);

    const sortedAndFilteredDealers = useMemo(() => {
        return [...dealers]
            .filter(dealer =>
                dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dealer.address.toLowerCase().includes(searchTerm.toLowerCase())
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

        setDealers(currentDealers =>
            currentDealers.map(d => d.id === dealerId ? { ...d, dailyDiscount: newDiscount } : d)
        );
        setSelectedDealer(prev => prev ? { ...prev, dailyDiscount: newDiscount } : null);
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
        const { firstName, lastName, email, role } = newPerson;
        if (!firstName || !lastName || !email || !role || !selectedDealer) return;

        const newPersonObject = { name: `${firstName} ${lastName}`, status: 'pending' };

        const updatedDealers = dealers.map(d => {
            if (d.id === selectedDealer.id) {
                const updatedRoleList = [...d[role], newPersonObject];
                return { ...d, [role]: updatedRoleList };
            }
            return d;
        });

        setDealers(updatedDealers);
        setSelectedDealer(updatedDealers.find(d => d.id === selectedDealer.id));
        setShowAddPersonModal(false);
        setNewPerson({ firstName: '', lastName: '', email: '', role: 'salespeople' });
        setSuccessMessage(`Invitation sent to ${email}`);
        setTimeout(() => setSuccessMessage(""), 2000);
    }

    const ModalSectionHeader = ({ title }) => <p className="font-bold text-sm" style={{ color: theme.colors.textSecondary }}>{title}</p>;

    const StaffSection = ({ title, members, theme }) => (
        <div>
            <h4 className="font-semibold" style={{ color: theme.colors.textPrimary }}>{title}</h4>
            <div className="text-sm space-y-1 mt-1">
                {members && members.length > 0 ? (
                    members.map(member => (
                        <div key={member.name} className="flex items-center" style={{ color: theme.colors.textSecondary }}>
                            {member.name}
                            {member.status === 'pending' && <Hourglass className="w-3 h-3 ml-2 text-amber-500" />}
                        </div>
                    ))
                ) : <p className="text-sm" style={{ color: theme.colors.textSecondary }}>None listed.</p>}
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or city..."
                    theme={theme}
                />
                <div className="relative">
                    <button onClick={() => setShowFilterMenu(prev => !prev)} className="p-3.5 rounded-lg" style={{ backgroundColor: theme.colors.subtle }}>
                        <Filter className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
                    </button>
                    {showFilterMenu && (
                        <GlassCard ref={filterMenuRef} theme={theme} className="absolute top-14 right-0 z-10 w-40 p-2">
                            <button onClick={() => handleSort('name')} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${sortConfig.key === 'name' ? 'font-bold' : ''}`} style={{ color: theme.colors.textPrimary, backgroundColor: sortConfig.key === 'name' ? theme.colors.subtle : 'transparent' }}>A-Z</button>
                            <button onClick={() => handleSort('sales')} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${sortConfig.key === 'sales' ? 'font-bold' : ''}`} style={{ color: theme.colors.textPrimary, backgroundColor: sortConfig.key === 'sales' ? theme.colors.subtle : 'transparent' }}>By Sales</button>
                            <button onClick={() => handleSort('bookings')} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${sortConfig.key === 'bookings' ? 'font-bold' : ''}`} style={{ color: theme.colors.textPrimary, backgroundColor: sortConfig.key === 'bookings' ? theme.colors.subtle : 'transparent' }}>By Bookings</button>
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
                                <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{dealer.name}</h3>
                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{dealer.address}</p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                                <p className="text-xs font-semibold capitalize" style={{ color: theme.colors.textSecondary }}>{sortConfig.key}</p>
                                <p className="font-bold" style={{ color: theme.colors.textPrimary }}>${dealer[sortConfig.key === 'name' ? 'bookings' : sortConfig.key].toLocaleString()}</p>
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
                                <h2 className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>{selectedDealer.name}</h2>
                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{selectedDealer.address}</p>
                            </div>
                            <button onClick={() => setShowAddPersonModal(true)} className="p-2 -mr-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
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
                                    onChange={(e) => setPendingDiscountChange({ dealerId: selectedDealer.id, newDiscount: e.target.value })}
                                    options={DAILY_DISCOUNT_OPTIONS.map(opt => ({ label: opt, value: opt }))}
                                />
                            </div>
                            <div>
                                <ModalSectionHeader title="Recent Orders" />
                                {selectedDealer.recentOrders && selectedDealer.recentOrders.length > 0 ? (
                                    <div className="space-y-2 mt-2">
                                        {selectedDealer.recentOrders.map(order => (
                                            <div key={order.id} className="flex justify-between items-center text-sm p-2 rounded-md" style={{ backgroundColor: theme.colors.subtle }}>
                                                <div>
                                                    <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>#{order.id}</span>
                                                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Shipped: {new Date(order.shippedDate).toLocaleDateString()}</p>
                                                </div>
                                                <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>${order.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>No recent orders.</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <StaffSection title="Salespeople" members={selectedDealer.salespeople} theme={theme} />
                            <StaffSection title="Designers" members={selectedDealer.designers} theme={theme} />
                            <StaffSection title="Administration" members={selectedDealer.administration} theme={theme} />
                            <StaffSection title="Installers" members={selectedDealer.installers} theme={theme} />
                        </div>
                    </div>
                )}
            </Modal>

            <Modal show={!!pendingDiscountChange} onClose={() => setPendingDiscountChange(null)} title="Confirm Change" theme={theme}>
                <p style={{ color: theme.colors.textPrimary }}>Are you sure you want to change the daily discount to <span className="font-bold">{pendingDiscountChange?.newDiscount}</span>?</p>
                <div className="flex justify-end space-x-3 pt-4">
                    <button onClick={() => setPendingDiscountChange(null)} className="font-bold py-2 px-5 rounded-lg" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>Cancel</button>
                    <button onClick={confirmDiscountChange} className="font-bold py-2 px-5 rounded-lg text-white" style={{ backgroundColor: theme.colors.accent }}>Save</button>
                </div>
            </Modal>

            <Modal show={showAddPersonModal} onClose={() => setShowAddPersonModal(false)} title="Add New Person" theme={theme}>
                <form onSubmit={handleAddPerson} className="space-y-4">
                    <FormInput label="First Name" value={newPerson.firstName} onChange={(e) => setNewPerson(p => ({ ...p, firstName: e.target.value }))} theme={theme} required />
                    <FormInput label="Last Name" value={newPerson.lastName} onChange={(e) => setNewPerson(p => ({ ...p, lastName: e.target.value }))} theme={theme} required />
                    <FormInput label="Email" type="email" value={newPerson.email} onChange={(e) => setNewPerson(p => ({ ...p, email: e.target.value }))} theme={theme} required />
                    <FormInput label="Role" type="select" value={newPerson.role} onChange={(e) => setNewPerson(p => ({ ...p, role: e.target.value }))} theme={theme} options={[{ label: 'Salesperson', value: 'salespeople' }, { label: 'Designer', value: 'designers' }, { label: 'Administration', value: 'administration' }, { label: 'Installer', value: 'installers' }]} />
                    <div className="pt-2 text-center">
                        <p className="text-xs mb-2" style={{ color: theme.colors.textSecondary }}>This will send an invitation to the user to join the MyJSI app.</p>
                        <button type="submit" className="w-full font-bold py-3 px-6 rounded-lg text-white" style={{ backgroundColor: theme.colors.accent }}>Send Invite</button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

const ResourceDetailScreen = ({ category, theme, onNavigate, setSuccessMessage, userSettings, showAlert, currentScreen }) => {
    if (category === 'presentations') {
        const pathParts = currentScreen.split('/'); // e.g., ['resources', 'presentations', 'view', 'arwyn']
        const subScreen = pathParts[2];
        const seriesId = pathParts[3];

        if (subScreen === 'view' && seriesId) {
            return <PresentationViewerScreen theme={theme} seriesId={seriesId} onBack={() => onNavigate('resources/presentations/by_series_list')} />;
        }
        if (subScreen === 'by_series_list') {
            return <PresentationSeriesListScreen theme={theme} onNavigate={onNavigate} />;
        }
        return <PresentationsScreen theme={theme} onNavigate={onNavigate} />;
    }
    if (category === 'dealer directory') {
        return <DealerDirectoryScreen theme={theme} showAlert={showAlert} setSuccessMessage={setSuccessMessage} />;
    }
    if (category === 'loaner pool') {
        return <LoanerPoolScreen theme={theme} onNavigate={onNavigate} setSuccessMessage={setSuccessMessage} userSettings={userSettings} />;
    }
    if (category === 'commission_rates') {
        return <CommissionRatesScreen theme={theme} onNavigate={onNavigate} />;
    }
    if (category === 'contracts') {
        return <ContractsScreen theme={theme} onNavigate={onNavigate} />;
    }
    if (category === 'dealer registration') {
        return <DealerRegistrationScreen theme={theme} onNavigate={onNavigate} setSuccessMessage={setSuccessMessage} />;
    }
    if (category === 'discontinued finishes') {
        return <DiscontinuedFinishesScreen theme={theme} onNavigate={onNavigate} />;
    }
    if (category === 'sample discounts') {
        return <SampleDiscountsScreen theme={theme} onNavigate={onNavigate} />;
    }
    if (category === 'social media') {
        return <SocialMediaScreen theme={theme} showAlert={showAlert} setSuccessMessage={setSuccessMessage} />;
    }
    if (category === 'request field visit') {
        return <RequestFieldVisitScreen theme={theme} onNavigate={onNavigate} setSuccessMessage={setSuccessMessage} />;
    }
    if (category === 'install instructions') {
        return <InstallInstructionsScreen theme={theme} />;
    }
    return (<div className="px-4 pt-4 pb-4">
        <PageTitle title={category.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())} theme={theme} />
        <GlassCard theme={theme} className="p-8 text-center"><p style={{ color: theme.colors.textPrimary }}>Content for {category} will be available soon.</p></GlassCard>
    </div>)
};

const CommissionsScreen = ({ theme }) => {
    const years = useMemo(() => Object.keys(COMMISSIONS_CHECKS_DATA).sort((a, b) => b - a), []);
    const [selectedYear, setSelectedYear] = useState(years[0]);
    const [viewMode, setViewMode] = useState('list');

    const dataForYear = useMemo(() => COMMISSIONS_CHECKS_DATA[selectedYear] || [], [selectedYear]);

    const CommissionBarChart = React.memo(({ data, theme }) => {
        const maxAmount = useMemo(() => Math.max(...data.map(d => d.amount), 0), [data]);
        return (
            <div className="flex justify-between h-48 items-end space-x-1 px-2">
                {data.map(item => (
                    <div key={`${item.fullMonth}-${selectedYear}`} className="flex flex-col items-center w-full">
                        <div
                            className="w-full rounded-t-md"
                            style={{
                                height: `${(item.amount / maxAmount) * 100}%`,
                                backgroundColor: theme.colors.accent
                            }}
                        ></div>
                        <p className="text-xs font-bold mt-2" style={{ color: theme.colors.textSecondary }}>{item.month}</p>
                    </div>
                ))}
            </div>
        );
    });

    const CommissionList = React.memo(({ data, theme }) => (
        <div className="space-y-2">
            {data.map(item => (
                <GlassCard key={`${item.fullMonth}-${selectedYear}`} theme={theme} className="p-3">
                    <div className="grid grid-cols-3 items-center">
                        <p className="font-bold" style={{ color: theme.colors.textPrimary }}>{item.fullMonth}</p>
                        <p className="text-right font-semibold text-lg" style={{ color: theme.colors.accent }}>${item.amount.toLocaleString()}</p>
                        <p className="text-right text-xs" style={{ color: theme.colors.textSecondary }}>Issued: {new Date(item.issuedDate).toLocaleDateString()}</p>
                    </div>
                </GlassCard>
            ))}
        </div>
    ));

    return (
        <>
            <PageTitle title="Commissions" theme={theme} />
            <div className="px-4 space-y-4 pb-4">
                <GlassCard theme={theme} className="p-2">
                    <div className="flex justify-around">
                        {years.map(year => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(year)}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${selectedYear === year ? 'shadow-sm' : ''}`}
                                style={{
                                    backgroundColor: selectedYear === year ? theme.colors.surface : 'transparent',
                                    color: selectedYear === year ? theme.colors.accent : theme.colors.textPrimary
                                }}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </GlassCard>
                <GlassCard theme={theme} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{selectedYear} Summary</h3>
                        <button onClick={() => setViewMode(v => v === 'chart' ? 'list' : 'chart')} className="p-1.5 rounded-md" style={{ backgroundColor: theme.colors.subtle }}>
                            {viewMode === 'chart' ? <List className="w-4 h-4" style={{ color: theme.colors.secondary }} /> : <BarChart2 className="w-4 h-4" style={{ color: theme.colors.secondary }} />}
                        </button>
                    </div>
                    {viewMode === 'chart' ? <CommissionBarChart data={dataForYear} theme={theme} /> : <CommissionList data={dataForYear} theme={theme} />}
                </GlassCard>
            </div>
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

const ContractsScreen = ({ theme }) => {
    const ContractCard = React.memo(({ contract, theme }) => (
        <GlassCard theme={theme} className="p-4 flex flex-col space-y-3">
            <h2 className="text-3xl font-bold" style={{ color: theme.colors.textPrimary }}>{contract.name}</h2>
            <div className="text-sm space-y-2">
                {contract.tiers.map((tier, i) => (
                    <div key={i} className="border-t pt-2" style={{ borderColor: theme.colors.subtle }}>
                        <p className="font-bold" style={{ color: theme.colors.textPrimary }}>{tier.off}</p>
                        <ul className="list-disc list-inside pl-2" style={{ color: theme.colors.textSecondary }}>
                            <li>{tier.dealer}</li>
                            <li>{tier.rep}</li>
                        </ul>
                    </div>
                ))}
            </div>
            {contract.margin && (
                <div className="text-sm border-t pt-2" style={{ borderColor: theme.colors.subtle }}>
                    <p className="font-bold" style={{ color: theme.colors.textPrimary }}>Dealer margin discount:</p>
                    {contract.margin.map((m, i) => <p key={i} style={{ color: theme.colors.textSecondary }}>{m}</p>)}
                </div>
            )}
            {contract.note && <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{contract.note}</p>}

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

const DealerRegistrationScreen = ({ theme, onNavigate, setSuccessMessage }) => {
    const [dealerName, setDealerName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [dailyDiscount, setDailyDiscount] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (dealerName && adminEmail && dailyDiscount) {
            setSuccessMessage("Dealer Registration Submitted!");
            setTimeout(() => {
                setSuccessMessage("");
                onNavigate('home');
            }, 1200);
        }
    };

    return (
        <div className="px-4 pt-4 pb-4">
            <PageTitle title="New Dealer Sign-Up" theme={theme} />
            <form onSubmit={handleSubmit} className="space-y-6">
                <GlassCard theme={theme} className="p-4 space-y-4">
                    <FormInput label="Dealer Name" value={dealerName} onChange={(e) => setDealerName(e.target.value)} placeholder="Enter dealer name" theme={theme} />
                    <FormInput label="Admin Email" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="Enter admin email" theme={theme} />
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: theme.colors.textSecondary }}>Daily Discount</label>
                        <FormInput
                            type="select"
                            value={dailyDiscount}
                            onChange={(e) => setDailyDiscount(e.target.value)}
                            options={[{ value: '', label: 'Select Option' }, ...DAILY_DISCOUNT_OPTIONS.map(opt => ({ value: opt, label: opt }))]}
                            theme={theme}
                        />
                    </div>
                </GlassCard>
                <button
                    type="submit"
                    className="w-full font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                    style={{ backgroundColor: theme.colors.accent, color: '#FFFFFF' }}
                    disabled={!dealerName || !adminEmail || !dailyDiscount}
                >
                    Submit
                </button>
            </form>
        </div>
    );
};

const DiscontinuedFinishesScreen = ({ theme }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const groupedFinishes = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase().trim();
        if (!lowercasedFilter) {
            return DISCONTINUED_FINISHES.reduce((acc, finish) => {
                const { category } = finish;
                if (!acc[category]) acc[category] = [];
                acc[category].push(finish);
                return acc;
            }, {});
        }

        return DISCONTINUED_FINISHES
            .filter(finish =>
                finish.oldName.toLowerCase().includes(lowercasedFilter) ||
                finish.newName.toLowerCase().includes(lowercasedFilter) ||
                finish.category.toLowerCase().includes(lowercasedFilter)
            )
            .reduce((acc, finish) => {
                const { category } = finish;
                if (!acc[category]) acc[category] = [];
                acc[category].push(finish);
                return acc;
            }, {});
    }, [searchTerm]);

    const highlightText = (text, highlight) => {
        const cleanHighlight = highlight.trim();
        if (!cleanHighlight) {
            return <span>{text}</span>;
        }
        const regex = new RegExp(`(${cleanHighlight})`, 'gi');
        return (
            <span>
                {text.split(regex).map((part, i) =>
                    regex.test(part) ? (
                        <mark key={i} className="bg-transparent font-bold" style={{ color: theme.colors.accent }}>{part}</mark>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                )}
            </span>
        );
    };

    const FinishInfo = ({ finish, nameKey, colorKey }) => (
        <div className="flex-1 text-center space-y-2">
            <div className="w-20 h-20 mx-auto rounded-2xl shadow-inner border" style={{ backgroundColor: finish[colorKey], borderColor: theme.colors.border }} />
            <p className="font-bold text-sm h-10 flex items-center justify-center" style={{ color: theme.colors.textPrimary }}>
                {highlightText(finish[nameKey], searchTerm)}
            </p>
            {finish.veneer !== "N/A" && (
                <div className="text-xs font-mono tracking-tighter" style={{ color: theme.colors.textSecondary }}>
                    <p>Veneer: {finish.veneer}</p>
                    <p>Solid: {finish.solid}</p>
                </div>
            )}
        </div>
    );

    const FinishCard = React.memo(({ finish }) => (
        <GlassCard theme={theme} className="p-4 transition-all duration-300">
            <div className="flex items-center justify-between">
                <FinishInfo finish={finish} nameKey="oldName" colorKey="oldColor" />
                <div className="flex-shrink-0 px-2">
                    <ArrowRight className="w-6 h-6" style={{ color: theme.colors.secondary }} />
                </div>
                <FinishInfo finish={finish} nameKey="newName" colorKey="newColor" />
            </div>
        </GlassCard>
    ));

    return (
        <div className="h-full flex flex-col">
            <PageTitle title="Discontinued Finishes" theme={theme} />
            <div className="px-4 pt-2 pb-4 sticky top-0 z-10 bg-opacity-80 backdrop-blur-md" style={{ backgroundColor: theme.colors.background.substring(0, 7) + 'd0' }}>
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
                        <section key={category} className="mb-8">
                            <h2 className="text-2xl font-bold capitalize mb-4 px-1" style={{ color: theme.colors.textPrimary }}>
                                {highlightText(category, searchTerm)}
                            </h2>
                            <div className="space-y-4">
                                {finishes.map((finish, index) => <FinishCard key={`${finish.oldName}-${index}`} finish={finish} />)}
                            </div>
                        </section>
                    ))
                ) : (
                    <GlassCard theme={theme} className="p-8 text-center mt-4">
                        <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>No Results Found</p>
                        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Could not find any finishes matching "{searchTerm}".</p>
                    </GlassCard>
                )}
            </div>
        </div>
    );
};

const SampleDiscountsScreen = ({ theme, setSuccessMessage }) => {

    const handleCopy = useCallback((textToCopy) => {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            if (setSuccessMessage) {
                setSuccessMessage("SSA# Copied!");
                setTimeout(() => setSuccessMessage(""), 1200);
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        document.body.removeChild(textArea);
    }, [setSuccessMessage]);

    return (
        <>
            <PageTitle title="Sample Discounts" theme={theme} />
            <div className="px-4 space-y-4 pb-4">
                {SAMPLE_DISCOUNTS_DATA.map(discount => (
                    <GlassCard key={discount.ssa} theme={theme} className="p-4 flex items-center space-x-4">
                        <div className="flex-shrink-0 w-24 text-center">
                            <p className="text-5xl font-bold" style={{ color: theme.colors.accent }}>{discount.off.match(/\d+/)[0]}%</p>
                            <p className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>Off List</p>
                        </div>
                        <div className="flex-1 space-y-3 border-l pl-4" style={{ borderColor: theme.colors.subtle }}>
                            <h3 className="font-bold text-lg text-center pb-2 border-b" style={{ color: theme.colors.textPrimary, borderColor: theme.colors.subtle }}>{discount.title}</h3>
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


const ProductsScreen = ({ onNavigate, theme }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');

    const filteredCategories = useMemo(() => {
        if (!searchTerm.trim()) return PRODUCTS_CATEGORIES_DATA;

        const lowerSearch = searchTerm.toLowerCase();
        return PRODUCTS_CATEGORIES_DATA.filter(category =>
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
const ProductComparisonScreen = ({ categoryId, onNavigate, theme }) => {
    const category = PRODUCT_DATA?.[categoryId];

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

const CompetitiveAnalysisScreen = ({ theme, currentScreen }) => {
    const categoryId = currentScreen?.split('/')?.[2] || 'casegoods';
    const data = COMPETITIVE_DATA?.[categoryId];
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
        (PRODUCT_DATA?.[categoryId]?.title ?? categoryId)
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

const PlaceholderScreen = ({ theme, category }) => (
    <div className="px-4 pt-4 pb-4">
        <PageTitle title={category || "Coming Soon"} theme={theme} />
        <GlassCard theme={theme} className="p-8 text-center">
            <p style={{ color: theme.colors.textPrimary }}>
                This section is under construction.
            </p>
        </GlassCard>
    </div>
);


const LoanerPoolScreen = ({ theme, onNavigate, setSuccessMessage, userSettings }) => {
    const [loanerSearch, setLoanerSearch] = useState('');
    const [selectedLoaners, setSelectedLoaners] = useState([]);
    const [address, setAddress] = useState('');
    const handleToggleLoaner = (id) => { setSelectedLoaners(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); };
    const filteredLoaners = LOANER_POOL_PRODUCTS.filter(p => p.name.toLowerCase().includes(loanerSearch.toLowerCase()) || p.model.toLowerCase().includes(loanerSearch.toLowerCase()));

    const handleSubmit = () => {
        setSuccessMessage("Loaner Request Submitted!");
        setTimeout(() => {
            setSuccessMessage("");
            onNavigate('home');
        }, 1200);
    }

    return (<div>
        <PageTitle title="Loaner Pool" theme={theme} />
        <div className="px-4 pt-4 pb-4"><SearchInput value={loanerSearch} onChange={(e) => setLoanerSearch(e.target.value)} placeholder="Search product..." theme={theme} /></div>
        <div className="px-4 space-y-3 pb-4">
            {filteredLoaners.map(item => {
                const isSelected = selectedLoaners.includes(item.id);
                return (
                    <GlassCard
                        key={item.id}
                        theme={theme}
                        className={`p-3 flex items-center justify-between cursor-pointer border-2 transition-all`}
                        style={{ borderColor: isSelected ? theme.colors.accent : 'transparent' }}
                        onClick={() => handleToggleLoaner(item.id)}
                    >
                        <div>
                            <p className="font-bold" style={{ color: theme.colors.textPrimary }}>{item.name}</p>
                            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{item.model}</p>
                        </div>
                        <img src={item.img} alt={item.name} className="w-16 h-16 rounded-lg" />
                    </GlassCard>
                )
            })}
        </div>
        <div className="px-4 space-y-4 pb-4 sticky bottom-0">
            <GlassCard theme={theme} className="p-4 space-y-2">
                <h3 className="font-bold" style={{ color: theme.colors.textPrimary }}>Ship To</h3>
                <div className="relative">
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows="3" placeholder="Enter shipping address..." className="w-full p-2 pr-10 border rounded-lg" style={{ backgroundColor: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary }}></textarea>
                    <button onClick={() => setAddress(userSettings.homeAddress)} className="absolute top-2 right-2 p-1 rounded-full" style={{ backgroundColor: theme.colors.surface }}><Home className="w-5 h-5" style={{ color: theme.colors.secondary }} /></button>
                </div>
            </GlassCard>
            <button className="w-full font-bold py-3 px-6 rounded-lg transition-colors" style={{ backgroundColor: theme.colors.accent, color: '#FFFFFF' }} onClick={handleSubmit} disabled={selectedLoaners.length === 0 || !address.trim()}>Request</button>
        </div>
    </div>);
}


const FabricsScreen = ({ onNavigate, theme, currentScreen, showAlert }) => {
    const subScreen = currentScreen.split('/')[1];

    if (subScreen === 'search_form') {
        return <FabricSearchForm theme={theme} showAlert={showAlert} />;
    }

    if (subScreen === 'com_request') {
        return <COMYardageRequestScreen theme={theme} showAlert={showAlert} />;
    }

    return (
        <>
            <PageTitle title="Fabrics" theme={theme} />
            <div className="px-4 space-y-4 pb-4">
                <GlassCard theme={theme} className="p-1"><button onClick={() => onNavigate('fabrics/search_form')} className="w-full p-3 rounded-xl flex items-center justify-between"><span className="text-md font-semibold tracking-tight" style={{ color: theme.colors.textPrimary }}>Search Database</span><ArrowRight className="w-5 h-5" style={{ color: theme.colors.secondary }} /></button></GlassCard>
                <GlassCard theme={theme} className="p-1"><button onClick={() => onNavigate('fabrics/com_request')} className="w-full p-3 rounded-xl flex items-center justify-between"><span className="text-md font-semibold tracking-tight" style={{ color: theme.colors.textPrimary }}>Request COM Yardage</span><ArrowRight className="w-5 h-5" style={{ color: theme.colors.secondary }} /></button></GlassCard>
            </div>
        </>
    );
};

const ToggleButtonGroup = ({ value, onChange, options, theme }) => (
    <div
        className="w-full flex p-1 rounded-full"
        style={{ backgroundColor: theme.colors.subtle }}
    >
        {options.map((opt) => (
            <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className="flex-1 rounded-full py-2 px-1 text-center text-xs font-bold transition-colors duration-300"
                style={{
                    backgroundColor:
                        opt === value ? theme.colors.surface : 'transparent',
                    color: opt === value ? theme.colors.accent : theme.colors.textSecondary,
                    boxShadow: opt === value ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
            >
                {opt}
            </button>
        ))}
    </div>
);

const Combobox = ({ label, value, onChange, placeholder, options, onAddNew, theme, required, zIndex }) => {
    const [inputValue, setInputValue] = useState(value);
    const [showOptions, setShowOptions] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        setInputValue(value);
    }, [value]);
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    const filteredOptions = options.filter(option => option.toLowerCase().includes(inputValue.toLowerCase()));

    const handleSelect = (option) => {
        onChange(option);
        setInputValue(option);
        setShowOptions(false);
    };

    const handleAddNew = () => {
        if (inputValue && !options.includes(inputValue)) {
            onAddNew(inputValue);
        }
        onChange(inputValue);
        setShowOptions(false);
    }

    return (
        <div className={`relative ${zIndex}`} ref={wrapperRef}>
            <input
                required={required}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onFocus={() => setShowOptions(true)}
                placeholder={placeholder}
                className="w-full px-4 py-3 border rounded-full focus:ring-2 text-base outline-none"
                style={{ backgroundColor: theme.colors.subtle, borderColor: 'transparent', color: theme.colors.textPrimary, ringColor: theme.colors.accent }}
            />
            {showOptions && (
                <GlassCard theme={theme} className="absolute w-full mt-1 z-10 p-2 max-h-48 overflow-y-auto">
                    {filteredOptions.map(option => (
                        <button type="button" key={option} onClick={() => handleSelect(option)} className="block w-full text-left p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5" style={{ color: theme.colors.textPrimary }}>
                            {option}
                        </button>
                    ))}
                    {inputValue && !options.includes(inputValue) && (
                        <button type="button" onClick={handleAddNew} className="block w-full text-left p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 font-semibold" style={{ color: theme.colors.accent }}>
                            Add "{inputValue}"
                        </button>
                    )}
                </GlassCard>
            )}
        </div>
    )
}


const AutoCompleteCombobox = ({
    label,
    placeholder,
    value,
    onChange,
    options,
}) => {
    const [query, setQuery] = useState(value ?? '');
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        return q === ''
            ? options
            : options.filter((opt) => opt.toLowerCase().includes(q));
    }, [query, options]);

    useEffect(() => {
        const handleOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        window.addEventListener('mousedown', handleOutside);
        return () => window.removeEventListener('mousedown', handleOutside);
    }, []);

    const handleSelect = (opt) => {
        setQuery(opt);
        onChange?.(opt);
        setOpen(false);
    };

    return (
        <div ref={containerRef} className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <div className="relative">
                <input
                    className="w-full rounded-md bg-gray-100 py-2 px-3 shadow-inner outline-none focus:ring-2 focus:ring-blue-600/40 dark:bg-gray-800 dark:text-gray-100"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange?.(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                />
                {open && filtered.length > 0 && (
                    <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 dark:bg-gray-800">
                        {filtered.map((opt) => (
                            <li
                                key={opt}
                                onMouseDown={() => handleSelect(opt)}
                                className="cursor-pointer select-none px-3 py-2 text-sm text-gray-700 hover:bg-blue-600/10 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
                            >
                                {opt}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const useDebouncedState = (initial, delay = 0) => {
    const [value, setValue] = useState(initial);
    const timer = useRef();
    const setDebounced = (v) => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setValue(v), delay);
    };
    return [value, setDebounced];
};

const FabricSearchForm = () => {
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
            const arr = has
                ? f[field].filter(x => x !== value)
                : [...f[field], value];
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
        if (filtered.length === 0
            && form.supplier === 'Arc-Com' && form.jsiSeries === 'Alden') {
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
        <div className="mt-20 px-6">
            {!results ? (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-lg shadow-lg p-6 space-y-6"
                >
                    {error && <div className="text-sm text-red-600">{error}</div>}

                    <AutoCompleteCombobox
                        label="Supplier *"
                        placeholder="Search Supplier"
                        value={form.supplier}
                        onChange={v => updateField('supplier', v)}
                        options={fabricSuppliers}
                    />

                    <AutoCompleteCombobox
                        label="Pattern"
                        placeholder="Search Pattern"
                        value={form.pattern}
                        onChange={v => updateField('pattern', v)}
                        options={fabricPatterns}
                    />

                    <AutoCompleteCombobox
                        label="JSI Series *"
                        placeholder="Search JSI Series"
                        value={form.jsiSeries}
                        onChange={v => updateField('jsiSeries', v)}
                        options={jsiSeriesOptions}
                    />

                    <div>
                        <label className="block mb-1 font-medium">Grade</label>
                        <div className="flex flex-wrap gap-2">
                            {!showGradeOptions
                                ? <button
                                    type="button"
                                    onClick={() => setShowGradeOptions(true)}
                                    className="px-3 py-1 rounded-full bg-primary text-white"
                                >Any</button>
                                : <>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setForm(f => ({ ...f, grade: [] }));
                                            setShowGradeOptions(false);
                                        }}
                                        className="px-3 py-1 rounded-full bg-gray-200 text-gray-700"
                                    >Any</button>
                                    {['A', 'B', 'C', 'COL', 'COM', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L1', 'L2']
                                        .map(g => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => updateMulti('grade', g)}
                                                className={`px-3 py-1 rounded-full ${form.grade.includes(g)
                                                        ? 'bg-primary text-white'
                                                        : 'bg-gray-200 text-gray-700'
                                                    }`}
                                            >{g}</button>
                                        ))}
                                </>
                            }
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Fabric Type</label>
                        <div className="flex flex-wrap gap-2">
                            {!showFabricOptions
                                ? <button
                                    type="button"
                                    onClick={() => setShowFabricOptions(true)}
                                    className="px-3 py-1 rounded-full bg-primary text-white"
                                >Any</button>
                                : <>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setForm(f => ({ ...f, fabricType: [] }));
                                            setShowFabricOptions(false);
                                        }}
                                        className="px-3 py-1 rounded-full bg-gray-200 text-gray-700"
                                    >Any</button>
                                    {['Coated', 'Fabric', 'Leather', 'Panel'].map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => updateMulti('fabricType', t)}
                                            className={`px-3 py-1 rounded-full ${form.fabricType.includes(t)
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-200 text-gray-700'
                                                }`}
                                        >{t}</button>
                                    ))}
                                </>
                            }
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Tackable</label>
                        <div className="flex flex-wrap gap-2">
                            {!showTackableOptions
                                ? <button
                                    type="button"
                                    onClick={() => setShowTackableOptions(true)}
                                    className="px-3 py-1 rounded-full bg-primary text-white"
                                >Any</button>
                                : <>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setForm(f => ({ ...f, tackable: [] }));
                                            setShowTackableOptions(false);
                                        }}
                                        className="px-3 py-1 rounded-full bg-gray-200 text-gray-700"
                                    >Any</button>
                                    {['Yes', 'No'].map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => updateMulti('tackable', t.toLowerCase())}
                                            className={`px-3 py-1 rounded-full ${form.tackable.includes(t.toLowerCase())
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-200 text-gray-700'
                                                }`}
                                        >{t}</button>
                                    ))}
                                </>
                            }
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary py-3 rounded-full text-white font-semibold"
                    >Search</button>
                </form>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-lg p-4">
                        <div className="font-semibold text-lg mb-2">Results: {results.length}</div>
                        <div className="text-sm space-y-1">
                            <div><span className="font-medium">Supplier:</span> {form.supplier}</div>
                            {!!form.pattern && <div><span className="font-medium">Pattern:</span> {form.pattern}</div>}
                            <div><span className="font-medium">Series:</span> {form.jsiSeries}</div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {results.map((r, i) => (
                            <div key={i} className="bg-white rounded-lg shadow p-4">
                                <div className="text-primary font-semibold mb-2">Approved</div>
                                <div className="text-sm space-y-1">
                                    <div><span className="font-medium">Supplier:</span> {r.supplier}</div>
                                    <div><span className="font-medium">Pattern:</span> {r.pattern}</div>
                                    <div><span className="font-medium">Grade:</span> {r.grade}</div>
                                    <div><span className="font-medium">Tackable:</span> {r.tackable}</div>
                                    <div><span className="font-medium">Textile:</span> {r.textile || 'Not Specified'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={resetSearch}
                        className="mt-6 w-full bg-primary py-3 rounded-full text-white font-semibold"
                    >New Search</button>
                </div>
            )}
        </div>
    );
};



const COMYardageRequestScreen = ({ theme, showAlert }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModels, setSelectedModels] = useState([]);

    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        return JSI_MODELS.filter(model => model.isUpholstered && (model.name.toLowerCase().includes(searchTerm.toLowerCase()) || model.id.toLowerCase().includes(searchTerm.toLowerCase())))
    }, [searchTerm]);

    const addModel = (model) => {
        if (!selectedModels.find(m => m.id === model.id)) {
            setSelectedModels(prev => [...prev, { ...model, quantity: 1, fabric: '', fabricSearch: '', showFabricSearch: false }]);
        }
        setSearchTerm('');
    };

    const updateModel = (modelId, updates) => {
        setSelectedModels(prev => prev.map(m => m.id === modelId ? { ...m, ...updates } : m));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchResults.length > 0) {
            addModel(searchResults[0]);
        }
    }

    return (
        <div className="flex flex-col h-full p-4">
            <PageTitle title="COM Yard Request" theme={theme} />
            <div className="relative mb-4">
                <SearchInput
                    onSubmit={handleSearchSubmit}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search model(s)..."
                    theme={theme}
                />
                {searchResults.length > 0 && searchTerm && (
                    <GlassCard theme={theme} className="absolute w-full mt-1 z-10 p-2 space-y-1">
                        {searchResults.map(model => (
                            <button key={model.id} onClick={() => addModel(model)} className="block w-full text-left p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5" style={{ color: theme.colors.textPrimary }}>
                                {model.name} ({model.id})
                            </button>
                        ))}
                    </GlassCard>
                )}
            </div>
            <div className="flex-grow space-y-3 overflow-y-auto scrollbar-hide">
                {selectedModels.map(model => (
                    <GlassCard key={model.id} theme={theme} className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>{model.id}</p>
                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{model.series}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => updateModel(model.id, { quantity: Math.max(1, model.quantity - 1) })} className="p-1 rounded-full" style={{ backgroundColor: theme.colors.subtle }}><Minus className="w-4 h-4" style={{ color: theme.colors.secondary }} /></button>
                                <span className="font-bold w-8 text-center" style={{ color: theme.colors.textPrimary }}>{model.quantity}</span>
                                <button onClick={() => updateModel(model.id, { quantity: model.quantity + 1 })} className="p-1 rounded-full" style={{ backgroundColor: theme.colors.subtle }}><Plus className="w-4 h-4" style={{ color: theme.colors.secondary }} /></button>
                            </div>
                        </div>
                        {model.isUpholstered && (
                            <div>
                                {model.showFabricSearch ? (
                                    <div className="relative">
                                        <SearchInput
                                            placeholder="Search fabric pattern..."
                                            theme={theme}
                                            value={model.fabricSearch}
                                            onChange={(e) => updateModel(model.id, { fabricSearch: e.target.value })}
                                        />
                                        {model.fabricSearch && <div className="absolute w-full mt-1 z-10 p-2 space-y-1" style={{ backgroundColor: theme.colors.surface }} >
                                            {FABRICS_DATA.filter(f => f.name.toLowerCase().includes(model.fabricSearch.toLowerCase())).map(f => (
                                                <button key={`${f.name}-${f.manufacturer}`} onClick={() => updateModel(model.id, { fabric: `${f.manufacturer}, ${f.name}`, showFabricSearch: false, fabricSearch: '' })} className="block w-full text-left p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5" style={{ color: theme.colors.textPrimary }}>{f.manufacturer}, {f.name}</button>
                                            ))}
                                        </div>}
                                    </div>
                                ) : (
                                    <button onClick={() => updateModel(model.id, { showFabricSearch: true })} className="w-full text-left text-sm p-2 rounded-md font-semibold flex items-center justify-between" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>
                                        <span>{model.fabric ? `Fabric: ${model.fabric}` : 'Search Fabric'}</span>
                                        <Hourglass className="w-4 h-4" style={{ color: theme.colors.secondary }} />
                                    </button>
                                )}
                            </div>
                        )}
                    </GlassCard>
                ))}
            </div>
            <div className="pt-4">
                <button onClick={() => showAlert('COM Yardage Request Submitted (Demo)')} disabled={selectedModels.length === 0} className="w-full font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50" style={{ backgroundColor: theme.colors.accent, color: '#FFFFFF' }}>Submit</button>
            </div>
        </div>
    );
};

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

const OrderModal = React.memo(({ order, onClose, theme }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // When the modal closes, reset the expanded state
    const handleClose = () => {
        setIsExpanded(false);
        onClose();
    };

    // Safely determine the status color, defaulting to a primary color if status is missing
    const statusColor = {
        'In Production': theme.colors.accent,
        'Shipped': '#10B981',
        'Pending': theme.colors.secondary
    }[order?.status] || theme.colors.primary;

    // A guard to prevent rendering if no order is selected
    if (!order) return null;

    // Provide a default fallback for the status text
    const statusText = (order.status || 'N/A').toUpperCase();

    return (
        <Modal show={!!order} onClose={handleClose} title="" theme={theme}>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                        {order.company}
                    </h2>
                    <button onClick={handleClose} className="p-1 rounded-full -mr-2" style={{ backgroundColor: theme.colors.subtle }}>
                        <X className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    </button>
                </div>
                {order.details && (
                    <p className="-mt-3 text-sm" style={{ color: theme.colors.textSecondary }}>
                        {order.details}
                    </p>
                )}

                <span
                    className="inline-block w-full text-center py-2 rounded-lg font-semibold text-white"
                    style={{ backgroundColor: statusColor }}
                >
                    {/* FIX IS HERE: Using the safe statusText variable */}
                    {statusText}
                </span>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <dt className="font-medium" style={{ color: theme.colors.textSecondary }}>SO:</dt>
                    <dd style={{ color: theme.colors.textPrimary }}>{order.orderNumber}</dd>
                    {order.po && <>
                        <dt className="font-medium" style={{ color: theme.colors.textSecondary }}>PO:</dt>
                        <dd style={{ color: theme.colors.textPrimary }}>{order.po}</dd>
                    </>}
                    {order.net && <>
                        <dt className="font-medium" style={{ color: theme.colors.textSecondary }}>NET:</dt>
                        <dd style={{ color: theme.colors.textPrimary }}>${order.net.toLocaleString()}</dd>
                    </>}
                    {order.reward && <>
                        <dt className="font-medium" style={{ color: theme.colors.textSecondary }}>REWARDS:</dt>
                        <dd style={{ color: theme.colors.textPrimary }}>{order.reward}</dd>
                    </>}
                    {order.shipDate && <>
                        <dt className="font-medium" style={{ color: theme.colors.textSecondary }}>SHIP DATE:</dt>
                        <dd style={{ color: theme.colors.textPrimary }}>{order.shipDate}</dd>
                    </>}
                </dl>

                <div className="border-t pt-4 space-y-3" style={{ borderColor: theme.colors.subtle }}>
                    {order.discount &&
                        <div className="flex justify-between items-center">
                            <span className="font-medium" style={{ color: theme.colors.textSecondary }}>Discount:</span>
                            <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{order.discount}</span>
                        </div>
                    }
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full py-3 rounded-full font-medium text-white transition"
                        style={{ backgroundColor: theme.colors.accent }}
                        disabled={!order.lineItems || order.lineItems.length === 0}
                    >
                        {isExpanded ? 'Hide Order Details' : 'Show Order Details'}
                    </button>
                </div>

                {isExpanded && (
                    <div className="space-y-4 pt-4 border-t" style={{ borderColor: theme.colors.subtle }}>
                        <div className="flex items-center justify-between text-center px-4 py-2 rounded-lg" style={{ backgroundColor: theme.colors.subtle }}>
                            <p className="text-xs font-bold" style={{ color: theme.colors.textSecondary }}>PACK QTY REMAINING</p>
                            <p className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>{order.packQty ?? 0}</p>
                        </div>

                        <div className="space-y-3">
                            {(order.lineItems && order.lineItems.length > 0) ? (
                                order.lineItems.map(item => <LineItemCard key={item.line} lineItem={item} theme={theme} />)
                            ) : (
                                <p className="text-center text-sm" style={{ color: theme.colors.textSecondary }}>No line items for this order.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
});


const ProfileMenu = ({ show, onClose, onNavigate, toggleTheme, theme, isDarkMode }) => {
    if (!show) return null;
    const menuItems = [
        { label: isDarkMode ? 'Light Mode' : 'Dark Mode', action: toggleTheme, icon: isDarkMode ? Sun : Moon },
        { label: 'Settings', action: () => onNavigate('settings'), icon: Settings },
        { label: 'Members', action: () => onNavigate('members'), icon: User },
        { label: 'Help', action: () => onNavigate('help'), icon: HelpCircle },
        { label: 'Log Out', action: () => onNavigate('logout'), icon: LogOut },
    ];
    return (
        <div className="absolute inset-0 z-30 pointer-events-auto" onClick={onClose}>
            <GlassCard theme={theme} className="absolute top-24 right-4 w-48 p-2 space-y-1" onClick={(e) => e.stopPropagation()}>
                {menuItems.map(item => (
                    <button key={item.label} onClick={item.action} className="w-full text-left flex items-center px-3 py-2 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10" style={{ color: theme.colors.textPrimary }}>
                        <item.icon className="w-4 h-4 mr-3" style={{ color: theme.colors.secondary }} />{item.label}
                    </button>
                ))}
            </GlassCard>
        </div>
    );
};

const IncentiveRewardsScreen = ({ theme }) => {
    const generateTimePeriods = () => {
        const periods = [];
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= currentYear - 2; year--) {
            periods.push({ value: `${year}`, label: `${year}` });
            for (let q = 4; q >= 1; q--) {
                if (year === currentYear && q > Math.floor(new Date().getMonth() / 3) + 1) continue;
                periods.push({ value: `${year}-Q${q}`, label: `Q${q} ${year}` });
            }
        }
        return periods;
    };

    const timePeriods = useMemo(generateTimePeriods, []);
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
                if (REWARDS_DATA[periodKey]) {
                    REWARDS_DATA[periodKey].sales.forEach(person => {
                        salesMap.set(person.name, (salesMap.get(person.name) || 0) + person.amount);
                    });
                    REWARDS_DATA[periodKey].designers.forEach(person => {
                        designersMap.set(person.name, (designersMap.get(person.name) || 0) + person.amount);
                    });
                }
            }

            salesMap.forEach((amount, name) => cumulativeData.sales.push({ name, amount }));
            designersMap.forEach((amount, name) => cumulativeData.designers.push({ name, amount }));

            return cumulativeData;
        }
        return REWARDS_DATA[selectedPeriod] || { sales: [], designers: [] };
    }, [selectedPeriod]);

    const sortedSales = [...(rewardsData.sales || [])].sort((a, b) => b.amount - a.amount);
    const sortedDesigners = [...(rewardsData.designers || [])].sort((a, b) => b.amount - a.amount);

    return (
        <>
            <PageTitle title="Rewards" theme={theme} />
            <div className="px-4 space-y-4 pb-4">
                <FormInput
                    type="select"
                    value={selectedPeriod}
                    onChange={e => setSelectedPeriod(e.target.value)}
                    options={timePeriods}
                    theme={theme}
                />

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


const FormSection = ({ title, children, theme }) => (
    <div className="space-y-4">
        <h3 className="font-bold text-xl px-1" style={{ color: theme.colors.textPrimary }}>{title}</h3>
        <GlassCard theme={theme} className="p-4 space-y-4">
            {children}
        </GlassCard>
    </div>
);

const NewLeadScreen = ({
    theme,
    onSuccess,
    designFirms,
    setDesignFirms,
    dealers,
    setDealers,
}) => {
    const [newLead, setNewLead] = useState({
        ...EMPTY_LEAD,
        winProbability: 50,
        jsiSpecServicesType: 'New Quote',
        jsiRevisionQuoteNumber: '',
        jsiPastProjectInfo: '',
    });

    const updateNewLead = useCallback((field, value) => {
        setNewLead((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSuccess(newLead);
    };

    const displayedCompetitors = newLead.competitionPresent
        ? COMPETITORS.filter((c) => c !== 'None')
        : [];

    const DISCOUNT_LIST = useMemo(
        () => ['Undecided Discount', ...DISCOUNT_OPTIONS.filter((d) => d !== 'Undecided')],
        []
    );

    const CONTRACT_OPTIONS = ["GSA", "GSA (MJP)", "Omnia Partners", "Premier Healthcare Alliance L.P.", "TIPS", "GSA TEAM"];

    const FancySelect = ({ value, onChange, options, placeholder, required }) => (
        <div
            className="relative w-full rounded-full overflow-hidden"
            style={{ backgroundColor: theme.colors.subtle }}
        >
            <select
                required={required}
                value={value}
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

    const ProbabilitySlider = ({ value, onChange }) => (
        <div className="relative w-full h-8 select-none pt-2">
            <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={value}
                onInput={(e) => onChange(+e.target.value)}
                className="w-full h-2 mt-3 cursor-pointer appearance-none rounded-full bg-gray-300 outline-none accent-current"
                style={{ accentColor: theme.colors.accent }}
            />
            <div
                className="absolute top-[17px] -translate-x-1/2 flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-bold pointer-events-none shadow"
                style={{
                    left: `${value}%`,
                    backgroundColor: theme.colors.accent,
                    color: '#FFF',
                }}
            >
                {value}%
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <PageTitle title="Create New Lead" theme={theme} />

            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4 space-y-6 scrollbar-hide">
                <FormSection title="Project Details" theme={theme}>
                    <input
                        required
                        type="text"
                        value={newLead.project}
                        onChange={(e) => updateNewLead('project', e.target.value)}
                        placeholder="Enter Project Name"
                        className="w-full px-4 py-3 border rounded-full focus:ring-2 text-base outline-none"
                        style={{ backgroundColor: theme.colors.subtle, borderColor: 'transparent', color: theme.colors.textPrimary, ringColor: theme.colors.accent }}
                    />

                    <FancySelect
                        required
                        placeholder="Select Vertical"
                        value={newLead.vertical}
                        onChange={(e) => updateNewLead('vertical', e.target.value)}
                        options={VERTICALS}
                    />

                    <FancySelect
                        required
                        placeholder="Select Project Stage"
                        value={newLead.projectStatus}
                        onChange={(e) => updateNewLead('projectStatus', e.target.value)}
                        options={STAGES}
                    />
                </FormSection>

                <div className="relative z-20">
                    <FormSection title="Stakeholders" theme={theme}>
                        <Combobox
                            required
                            value={newLead.designFirm}
                            onChange={(val) => updateNewLead('designFirm', val)}
                            placeholder="Search/Enter A&D Firm"
                            options={designFirms}
                            onAddNew={(f) => setDesignFirms((p) => [...new Set([...p, f])])}
                            theme={theme}
                        />

                        <Combobox
                            required
                            value={newLead.dealer}
                            onChange={(val) => updateNewLead('dealer', val)}
                            placeholder="Search/Enter Dealer"
                            options={dealers}
                            onAddNew={(d) => setDealers((p) => [...new Set([...p, d])])}
                            theme={theme}
                        />
                    </FormSection>
                </div>

                <FormSection title="Financials & Timeline" theme={theme}>
                    <FormInput
                        required
                        type="currency"
                        label=""
                        value={newLead.estimatedList}
                        onChange={(e) => updateNewLead('estimatedList', e.target.value)}
                        placeholder="$0"
                        theme={theme}
                        className="rounded-full"
                    />

                    <label className="text-xs font-semibold px-3">
                        Win Probability
                    </label>
                    <ProbabilitySlider
                        value={newLead.winProbability}
                        onChange={(v) => updateNewLead('winProbability', v)}
                    />

                    <FancySelect
                        required
                        placeholder="Select Discount"
                        value={newLead.discount}
                        onChange={(e) => updateNewLead('discount', e.target.value)}
                        options={DISCOUNT_LIST}
                    />

                    <FancySelect
                        required
                        placeholder="Select PO Timeframe"
                        value={newLead.poTimeframe}
                        onChange={(e) => updateNewLead('poTimeframe', e.target.value)}
                        options={PO_TIMEFRAMES}
                    />

                    <div className="flex items-center justify-between text-sm px-3 pt-2">
                        <span style={{ color: theme.colors.textSecondary }}>Contract?</span>
                        <input
                            type="checkbox"
                            className="h-5 w-5 rounded"
                            style={{ accentColor: theme.colors.accent }}
                            checked={newLead.isContract}
                            onChange={(e) => updateNewLead('isContract', e.target.checked)}
                        />
                    </div>

                    {newLead.isContract && (
                        <div className="pt-2">
                            <FancySelect
                                required
                                placeholder="Select a Contract"
                                value={newLead.contractType}
                                onChange={(e) => updateNewLead('contractType', e.target.value)}
                                options={CONTRACT_OPTIONS}
                            />
                        </div>
                    )}

                </FormSection>

                <FormSection title="Competition & Products" theme={theme}>
                    <div className="flex items-center justify-between text-sm px-3">
                        <span style={{ color: theme.colors.textSecondary }}>Competition?</span>
                        <input
                            type="checkbox"
                            className="h-5 w-5 rounded"
                            style={{ accentColor: theme.colors.accent }}
                            checked={newLead.competitionPresent}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                updateNewLead('competitionPresent', checked);
                                if (!checked) updateNewLead('competitors', []);
                            }}
                        />
                    </div>

                    {newLead.competitionPresent && (
                        <FormInput
                            required
                            type="select"
                            isMulti
                            label="Competitors"
                            value={newLead.competitors}
                            options={displayedCompetitors.map((c) => ({ value: c, label: c }))}
                            onMultiChange={(c) => {
                                const next = newLead.competitors.includes(c)
                                    ? newLead.competitors.filter((i) => i !== c)
                                    : [...newLead.competitors, c];
                                updateNewLead('competitors', next);
                            }}
                            theme={theme}
                        />
                    )}

                    <div className="space-y-2 pt-2">
                        <label
                            className="text-xs font-semibold px-3"
                            style={{ color: theme.colors.textSecondary }}
                        >
                            Products
                        </label>

                        {newLead.products.map((p, idx) => (
                            <div
                                key={idx}
                                className="p-3 rounded-2xl"
                                style={{ backgroundColor: theme.colors.subtle }}
                            >
                                <div className="flex justify-between items-center">
                                    <p
                                        className="font-semibold"
                                        style={{ color: theme.colors.textPrimary }}
                                    >
                                        {p.series}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateNewLead(
                                                'products',
                                                newLead.products.filter((_, i) => i !== idx)
                                            )
                                        }
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                {p.series === 'Vision' && (
                                    <div
                                        className="pt-3 mt-3 border-t"
                                        style={{ borderColor: theme.colors.border }}
                                    >
                                        <FormInput
                                            type="select"
                                            isMulti
                                            label="Materials"
                                            value={p.materials || []}
                                            options={VISION_MATERIALS.map((m) => ({ value: m, label: m }))}
                                            onMultiChange={(m) => {
                                                const curr = p.materials || [];
                                                const next = curr.includes(m)
                                                    ? curr.filter((i) => i !== m)
                                                    : [...curr, m];
                                                updateNewLead(
                                                    'products',
                                                    newLead.products.map((prod, i) =>
                                                        i === idx ? { ...prod, materials: next } : prod
                                                    )
                                                );
                                            }}
                                            theme={theme}
                                        />

                                        <div className="flex items-center justify-between text-sm mt-3 px-1">
                                            <span style={{ color: theme.colors.textSecondary }}>
                                                Glass Doors?
                                            </span>
                                            <input
                                                type="checkbox"
                                                className="h-5 w-5 rounded"
                                                style={{ accentColor: theme.colors.accent }}
                                                checked={!!p.glassDoors}
                                                onChange={(e) =>
                                                    updateNewLead(
                                                        'products',
                                                        newLead.products.map((prod, i) =>
                                                            i === idx
                                                                ? { ...prod, glassDoors: e.target.checked }
                                                                : prod
                                                        )
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <FancySelect
                            placeholder="Add a Product..."
                            value=""
                            onChange={(e) =>
                                updateNewLead('products', [
                                    ...newLead.products,
                                    { series: e.target.value, materials: [], glassDoors: false },
                                ])
                            }
                            options={JSI_PRODUCT_SERIES.filter(s => !newLead.products.map(p => p.series).includes(s))}
                        />
                    </div>
                </FormSection>

                <FormSection title="Services & Notes" theme={theme}>
                    <div className="flex items-center justify-between text-sm px-3">
                        <span style={{ color: theme.colors.textSecondary }}>
                            JSI Spec Services Required?
                        </span>
                        <input
                            type="checkbox"
                            className="h-5 w-5 rounded"
                            style={{ accentColor: theme.colors.accent }}
                            checked={!!newLead.jsiSpecServices}
                            onChange={(e) =>
                                updateNewLead('jsiSpecServices', e.target.checked)
                            }
                        />
                    </div>

                    {newLead.jsiSpecServices && (
                        <div className="pt-2 space-y-4">
                            <ToggleButtonGroup
                                value={newLead.jsiSpecServicesType}
                                onChange={(val) => updateNewLead('jsiSpecServicesType', val)}
                                options={['New Quote', 'Revision', 'Past Project']}
                                theme={theme}
                            />

                            {newLead.jsiSpecServicesType === 'Revision' && (
                                <div>
                                    <label className="text-xs font-semibold px-3" style={{ color: theme.colors.textSecondary }}>Quote</label>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <div className="flex-grow flex items-center rounded-full" style={{ backgroundColor: theme.colors.subtle }}>
                                            <span className="pl-4 pr-1 font-semibold" style={{ color: theme.colors.textSecondary }}>JG</span>
                                            <input
                                                required
                                                value={newLead.jsiRevisionQuoteNumber}
                                                onChange={(e) => updateNewLead('jsiRevisionQuoteNumber', e.target.value)}
                                                placeholder="25-2342"
                                                className="w-full bg-transparent py-3 pr-4 text-base outline-none focus:ring-0"
                                                style={{ color: theme.colors.textPrimary }}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => updateNewLead('jsiRevisionQuoteNumber', 'Unknown')}
                                            className="py-3 px-4 rounded-full text-xs font-bold"
                                            style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textSecondary }}>
                                            Unknown
                                        </button>
                                    </div>
                                </div>
                            )}

                            {newLead.jsiSpecServicesType === 'Past Project' && (
                                <input
                                    required
                                    value={newLead.jsiPastProjectInfo}
                                    onChange={(e) => updateNewLead('jsiPastProjectInfo', e.target.value)}
                                    placeholder="Enter past project name or quote #"
                                    className="w-full px-4 py-3 border rounded-full focus:ring-2 text-base outline-none"
                                    style={{ backgroundColor: theme.colors.subtle, borderColor: 'transparent', color: theme.colors.textPrimary, ringColor: theme.colors.accent }}
                                />
                            )}
                        </div>
                    )}


                    <FormInput
                        type="textarea"
                        label="Other Notes"
                        value={newLead.notes}
                        onChange={(e) => updateNewLead('notes', e.target.value)}
                        placeholder="Enter details..."
                        theme={theme}
                        className="rounded-2xl"
                    />
                </FormSection>

                <div className="pt-4 pb-4">
                    <button
                        type="submit"
                        className="w-full text-white font-bold py-3.5 rounded-full"
                        style={{ backgroundColor: theme.colors.accent }}
                    >
                        Submit Lead
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

const SettingsScreen = ({ theme, onSave, userSettings, setUserSettings }) => {
    const [localSettings, setLocalSettings] = useState(userSettings);

    const handleChange = (field, value) => {
        setLocalSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setUserSettings(localSettings);
        onSave();
    };

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
                    <FormInput type="select" label="T-Shirt Size" value={localSettings.tShirtSize} onChange={(e) => handleChange('tShirtSize', e.target.value)} options={['S', 'M', 'L', 'XL', 'XXL']} theme={theme} />
                </FormSection>
                <div className="pt-4 pb-4">
                    <button type="submit" className="w-full text-white font-bold py-3 px-6 rounded-lg transition-colors" style={{ backgroundColor: theme.colors.accent }}>Save Changes</button>
                </div>
            </div>
        </form>
    )
}

const SocialMediaScreen = ({ theme, showAlert, setSuccessMessage }) => {

    const copyToClipboard = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            setSuccessMessage("Caption Copied!");
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (err) {
            showAlert('Failed to copy text.');
        }
        document.body.removeChild(textArea);
    };

    const saveMedia = (post) => {
        showAlert(`Media for "${post.caption.substring(0, 20)}..." saved to device.`);
    }

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
                                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: theme.colors.subtle }}>
                                    <Film className="w-12 h-12" style={{ color: theme.colors.secondary }} />
                                </div>
                            )}
                        </div>
                        <p className="text-xs px-1" style={{ color: theme.colors.textSecondary }}>{post.caption}</p>
                        <div className="grid grid-cols-2 gap-1 pt-1">
                            <button onClick={() => copyToClipboard(post.caption)} className="flex items-center justify-center text-xs font-semibold p-2 rounded-md" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>
                                <Copy className="w-3 h-3 mr-1.5" />
                                Copy
                            </button>
                            <button onClick={() => saveMedia(post)} className="flex items-center justify-center text-xs font-semibold p-2 rounded-md" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>
                                <Save className="w-3 h-3 mr-1.5" />
                                Save
                            </button>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </>
    );
}

const CommunityHome = ({ theme }) => {
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


const Avatar = ({ src, alt, theme }) => {
    const [err, setErr] = useState(false);

    if (err || !src) {
        return (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
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



const PollCard = ({ poll, theme }) => {
    const { user, timeAgo, question, options } = poll;
    const [choice, setChoice] = useState(null);
    const total = options.reduce((s, o) => s + o.votes, 0);
    const [menu, setMenu] = useState(false);

    const sharePoll = async () => {
        setMenu(false);
        const msg = `${question}\n${window.location.href}`;
        if (navigator.share && window.isSecureContext) {
            try { await navigator.share({ title: 'JSI Poll', text: question, url: window.location.href }); return; } catch { }
        }
        try { await navigator.clipboard.writeText(msg); alert('Link copied!'); return; } catch { }
        alert('Copy failed.');
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
                            <button onClick={sharePoll} className="flex items-center w-full px-4 py-2 text-sm hover:bg-[rgba(0,0,0,0.03)]">
                                <Share2 className="w-4 h-4 mr-2" /> Share
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{question}</p>

            <div className="space-y-2">
                {options.map((o) => {
                    const pct = Math.round((o.votes / total) * 100);
                    const chosen = choice === o.id;
                    const showPct = choice !== null;
                    return (
                        <button key={o.id} onClick={() => setChoice(o.id)}
                            className={`w-full flex justify-between items-center px-4 py-2 rounded-lg transition-colors ${chosen ? 'ring-2 ring-offset-2' : ''}`}
                            style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary, borderColor: theme.colors.accent }}>
                            <span>{o.text}</span>
                            {showPct && <span className="font-medium">{pct}%</span>}
                        </button>
                    );
                })}
            </div>
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


const scrollbarHideStyle = ` .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } `;

const SCREEN_MAP = { home: HomeScreen, products: ProductsScreen, orders: OrdersScreen, sales: SalesScreen, community: CommunityHome, projects: ProjectsScreen, fabrics: FabricsScreen, 'lead-times': LeadTimesScreen, resources: ResourcesScreen, samples: SamplesScreen, replacements: ReplacementsScreen, feedback: FeedbackScreen, members: MembersScreen, 'customer-rank': CustomerRankScreen, commissions: CommissionsScreen, 'commission-rates': CommissionRatesScreen, 'incentive-rewards': IncentiveRewardsScreen, 'new-lead': NewLeadScreen, help: HelpScreen, settings: SettingsScreen };

function App() {
    const [navigationHistory, setNavigationHistory] = useState(['home']);
    const currentScreen = navigationHistory[navigationHistory.length - 1];

    // Centralized state
    const [currentUserId] = useState(1); // Designate user with ID 1 as the current user
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cart, setCart] = useState({});
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
    const [successMessage, setSuccessMessage] = useState('');
    const [alertInfo, setAlertInfo] = useState({ show: false, message: '' });
    const [userSettings, setUserSettings] = useState({
        id: 1,
        firstName: 'Luke',
        lastName: 'Miller',
        email: 'luke.miller@example.com',
        homeAddress: '11406 Wolf Dancer Pass W #103\nFishers, IN, 46037',
        tShirtSize: 'L'
    });


    const [designFirms, setDesignFirms] = useState(INITIAL_DESIGN_FIRMS);
    const [dealers, setDealers] = useState(INITIAL_DEALERS);

    // State for AI Chat
    const [searchTerm, setSearchTerm] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isAILoading, setIsAILoading] = useState(false);
    const [showAIDropdown, setShowAIDropdown] = useState(false);
    const [filteredApps, setFilteredApps] = useState([]);


    const touchStartX = useRef(0);

    useEffect(() => {
        setMembers(prevMembers => prevMembers.map(member =>
            member.id === currentUserId
                ? { ...member, firstName: userSettings.firstName, lastName: userSettings.lastName, email: userSettings.email }
                : member
        ));
    }, [userSettings, currentUserId]);

    useEffect(() => {
        if (searchTerm.trim() !== '') {
            const lowerCaseQuery = searchTerm.toLowerCase();
            const results = allApps.filter(app =>
                app.name.toLowerCase().includes(lowerCaseQuery)
            );
            setFilteredApps(results);
        } else {
            setFilteredApps([]);
        }
    }, [searchTerm]);

    const toggleTheme = useCallback(() => setIsDarkMode(prev => !prev), []);
    const currentTheme = useMemo(() => isDarkMode ? darkTheme : lightTheme, [isDarkMode]);

    const handleNavigate = useCallback((screen) => { setNavigationHistory(prev => [...prev, screen]); setShowProfileMenu(false); }, []);
    const handleBack = useCallback(() => { if (navigationHistory.length > 1) { setNavigationHistory(prev => prev.slice(0, -1)); } }, [navigationHistory.length]);
    const handleHome = useCallback(() => { setNavigationHistory(['home']); setShowProfileMenu(false); }, []);

    const handleTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX; };
    const handleTouchEnd = (e) => { const touchEndX = e.changedTouches[0].clientX; if (touchStartX.current < 50 && touchEndX - touchStartX.current > 75) { handleBack(); } touchStartX.current = 0; };

    const handleSetSelectedOrder = useCallback((order) => {
        setSelectedOrder(order);
    }, []);

    const handleShowAlert = useCallback((message) => {
        setAlertInfo({ show: true, message });
    }, []);

    const handleCreateLead = useCallback((newLeadData) => {
        if (newLeadData.project && newLeadData.estimatedList && newLeadData.projectStatus && newLeadData.vertical && newLeadData.poTimeframe && newLeadData.urgency && (!newLeadData.competitionPresent || newLeadData.competitors.length > 0) && newLeadData.products.length > 0) {
            const newOpportunity = {
                id: opportunities.length + 2, // to avoid key collision with initial opportunities
                name: newLeadData.project,
                stage: newLeadData.projectStatus,
                value: `$${parseInt(String(newLeadData.estimatedList).replace(/[^0-9]/g, '')).toLocaleString()}`,
                company: newLeadData.dealer,
                contact: newLeadData.designFirm,
                poTimeframe: newLeadData.poTimeframe,
                manufacturingNotes: newLeadData.products.map(p => `${p.series}${p.series === 'Vision' ? ` (${(p.materials || []).join(', ')}, Glass: ${p.glassDoors ? 'Y' : 'N'})` : ''}`).join('; ')
            };
            setOpportunities(prev => [...prev, newOpportunity]);

            if (!designFirms.includes(newLeadData.designFirm)) {
                setDesignFirms(prev => [...new Set([...prev, newLeadData.designFirm])]);
            }
            if (!dealers.includes(newLeadData.dealer)) {
                setDealers(prev => [...new Set([...prev, newLeadData.dealer])]);
            }

            handleNavigate('projects'); // Navigate back to projects screen after creation
            setSuccessMessage("Lead Created!");
            setTimeout(() => setSuccessMessage(""), 2000);

        } else {
            handleShowAlert("Please fill out all required fields.");
        }
    }, [opportunities, designFirms, dealers, handleShowAlert, handleNavigate]);

    const handleUpdateCart = useCallback((item, change) => {
        setCart(prev => {
            const newCart = { ...prev };
            const currentQty = newCart[item.id] || 0;
            const newQty = currentQty + change;
            if (newQty > 0) {
                newCart[item.id] = newQty;
            } else {
                delete newCart[item.id];
            }
            return newCart;
        });
    }, []);

    const handleCloseAIDropdown = useCallback(() => {
        setShowAIDropdown(false);
        setSearchTerm('');
    }, []);

    const handleSaveSettings = useCallback(() => {
        setSuccessMessage("Settings Saved!");
        setTimeout(() => setSuccessMessage(""), 2000);
        handleBack();
    }, [handleBack]);

    const handleAskAI = useCallback(async (prompt) => {
        if (!prompt.trim()) return;

        setShowAIDropdown(true);
        setIsAILoading(true);
        setAiResponse('');

        let websiteContext = "No relevant website information was found for this query.";

        try {
            if (prompt.toLowerCase().includes("how long has jsi been making furniture")) {
                websiteContext = `JSI is a brand of the parent company Jasper Group, which was founded in 1929 and has a long heritage of quality woodworking.`;
            }
        } catch (searchError) {
            console.error("Web search simulation failed:", searchError);
            websiteContext = "Could not perform website search at this time.";
        }


        const context = `
        You are an AI assistant for the furniture company JSI.
        Your knowledge is strictly limited to the information provided below.
        Prioritize information from the "WEBSITE CONTEXT" first, then "IN-APP DATA".
        Answer concisely in two sentences or less based only on the provided data.
        If you don't know the answer from the context, say so.
        Current Date: ${new Date().toDateString()}

        WEBSITE CONTEXT:
        ${websiteContext}

        IN-APP DATA:
        LEAD TIMES: ${JSON.stringify(LEAD_TIMES_DATA)}
        FABRIC OPTIONS: ${JSON.stringify(FABRICS_DATA)}
        PRODUCT MODELS: ${JSON.stringify(JSI_MODELS)}
    `;

        try {
            const chatHistory = [{ role: "user", parts: [{ text: `${context}\n\nQuestion: "${prompt}"` }] }];
            const payload = { contents: chatHistory };
            const apiKey = ""; // This will be handled by the environment
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const result = await response.json();

            let text = "Sorry, I couldn't find an answer based on the available data. Please try a different question.";
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                text = result.candidates[0].content.parts[0].text;
            }

            setAiResponse(text);

        } catch (error) {
            console.error("AI API call failed:", error);
            setAiResponse("There was an error connecting to the AI assistant. Please check the console for details.");
        } finally {
            setIsAILoading(false);
        }
    }, []);

    const renderScreen = () => {
        const commonProps = {
            onNavigate: handleNavigate,
            onHomeClick: handleHome,
            theme: currentTheme,
            onProfileClick: () => setShowProfileMenu(prev => !prev),
            members,
            setMembers,
            opportunities,
            setOpportunities,
            currentScreen,
            setSelectedOrder,
            cart,
            onUpdateCart: handleUpdateCart,
            setCart,
            onAskAI: handleAskAI,
            searchTerm,
            onSearchTermChange: setSearchTerm,
            showAIDropdown,
            aiResponse,
            isAILoading,
            onCloseAIDropdown: handleCloseAIDropdown,
            handleBack,
            setSuccessMessage,
            showAlert: handleShowAlert,
            onSuccess: handleCreateLead,
            designFirms,
            setDesignFirms,
            dealers,
            setDealers,
            userSettings,
            setUserSettings,
            onSave: handleSaveSettings,
            currentUserId,
            filteredApps,
        };

        if (currentScreen === 'logout') {
            return <PlaceholderScreen theme={currentTheme} category="Logged Out" />;
        }

        const screenParts = currentScreen.split('/');
        const screenType = screenParts[0];

        let ContentComponent;

        if (screenType === 'products' && screenParts[1] === 'category' && screenParts[2]) {
            return <ProductComparisonScreen {...commonProps} categoryId={screenParts[2]} />;
        }
        if (screenType === 'products' && screenParts[1] === 'competitive-analysis') {
            return <CompetitiveAnalysisScreen {...commonProps} />;
        }
        if (screenType === 'resources' && screenParts[1]) {
            return <ResourceDetailScreen {...commonProps} category={screenParts[1].replace(/_/g, ' ')} />;
        }
        if (screenType === 'fabrics' && screenParts[1]) {
            return <FabricsScreen {...commonProps} />;
        }
        if (currentScreen === 'samples/cart') {
            return <CartScreen {...commonProps} />;
        }

        ContentComponent = SCREEN_MAP[screenType];

        if (ContentComponent) {
            return <ContentComponent {...commonProps} />;
        }

        return <PlaceholderScreen theme={currentTheme} category="Page Not Found" />;
    };

    return (
        <div
            style={{ backgroundColor: currentTheme.colors.background }}
            className="h-screen w-screen font-sans overflow-hidden flex flex-col"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <style>{scrollbarHideStyle}</style>
            <AppHeader
                onHomeClick={handleHome}
                theme={currentTheme}
                onProfileClick={() => setShowProfileMenu(true)}
                isHome={currentScreen === 'home'}
                handleBack={handleBack}
                showBack={navigationHistory.length > 1}
                userName={userSettings.firstName}
                isDarkMode={isDarkMode}
            />
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {renderScreen()}
            </div>

            <div className="absolute inset-0 pointer-events-none">
                {showProfileMenu && <ProfileMenu
                    show={showProfileMenu}
                    onClose={() => setShowProfileMenu(false)}
                    onNavigate={handleNavigate}
                    toggleTheme={toggleTheme}
                    theme={currentTheme}
                    isDarkMode={isDarkMode}
                />}
                {selectedOrder && (
                    <OrderModal
                        order={selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                        theme={currentTheme}
                    />
                )}
                <Modal show={alertInfo.show} onClose={() => setAlertInfo({ show: false, message: '' })} title="Alert" theme={currentTheme}>
                    <div className="flex items-center">
                        <AlertCircle className="w-8 h-8 mr-4" style={{ color: currentTheme.colors.accent }} />
                        <p style={{ color: currentTheme.colors.textPrimary }}>{alertInfo.message}</p>
                    </div>
                </Modal>
                <SuccessToast message={successMessage} show={!!successMessage} theme={currentTheme} />
            </div>
        </div>
    );
}



export default App;