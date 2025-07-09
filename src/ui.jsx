import React, {
    useState,
    useRef,
    useMemo,
    useCallback,
    useEffect
} from 'react';

import {
    User,
    MousePointer,
    PieChart,
    RotateCw,
    Palette,
    DollarSign,
    Database,
    MessageSquare,
    Heart,
    MoreVertical,
    Image,
    Video,
    ArrowRight,
    Search,
    Briefcase,
    Package,
    X,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    Sun,
    Moon,
    Camera,
    LogOut,
    HelpCircle,
    ShoppingCart,
    CheckCircle,
    Plus,
    Minus,
    ArrowLeft,
    BarChart2,
    List,
    Home,
    Hourglass,
    Armchair,
    Server,
    UserPlus,
    UserX,
    Trophy,
    ChevronUp,
    Mic,
    AlertCircle,
    Settings,
    Paperclip,
    Copy,
    Save,
    Send,
    Share2,
    Film,
    Filter,
    Play,
    Calendar,
    MapPin,
    Clock,
    Bus,
} from 'lucide-react';

// ui.jsx
import * as Data from './data.js';

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
    DAILY_DISCOUNT_OPTIONS
} = Data;

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



const SampleDiscountsScreen = ({ theme, onNavigate }) => {
    return (
        <>
            {/* Back button */}
            <button
                onClick={() => onNavigate('resources')}
                className="mb-4 flex items-center text-sm font-medium px-4 py-2"
                style={{ color: theme.colors.textPrimary }}
            >
                <ArrowLeft className="w-4 h-4 mr-1" style={{ color: theme.colors.textSecondary }} />
                Back to Resources
            </button>

            {/* Title */}
            <PageTitle title="Sample Discounts" theme={theme} />

            <div className="px-4 space-y-4 pb-4">
                {SAMPLE_DISCOUNTS_DATA.map((discount, index) => (
                    <GlassCard key={index} theme={theme} className="p-4">
                        <h3 className="font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
                            {discount.title}
                        </h3>
                        <div>
                            <p className="text-sm mb-1" style={{ color: theme.colors.textSecondary }}>
                                <span className="font-medium">SSA:</span> {discount.ssa}
                            </p>
                            <p className="text-sm mb-1" style={{ color: theme.colors.textSecondary }}>
                                <span className="font-medium">Discount:</span> {discount.off}
                            </p>
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                <span className="font-medium">Commission:</span> {discount.commission}
                            </p>
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

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

const LoanerPoolScreen = ({
    theme,
    onNavigate,
    setSuccessMessage,
    userSettings
}) => {
    const [loanerSearch, setLoanerSearch] = useState('');
    const [selectedLoaners, setSelectedLoaners] = useState([]);
    const [address, setAddress] = useState('');

    const handleToggleLoaner = (id) => {
        setSelectedLoaners(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const filteredLoaners = LOANER_POOL_PRODUCTS.filter(
        p =>
            p.name.toLowerCase().includes(loanerSearch.toLowerCase()) ||
            p.model.toLowerCase().includes(loanerSearch.toLowerCase())
    );

    const handleSubmit = () => {
        setSuccessMessage('Loaner Request Submitted!');
        setTimeout(() => {
            setSuccessMessage('');
            onNavigate('home');
        }, 1200);
    };

    return (
        <>
            <PageTitle title="Loaner Pool" theme={theme} />

            <div className="px-4 pt-4 pb-4">
                <SearchInput
                    value={loanerSearch}
                    onChange={e => setLoanerSearch(e.target.value)}
                    placeholder="Search Loaner…"
                    theme={theme}
                />
            </div>

            <div className="px-4 space-y-3 pb-4">
                {filteredLoaners.map(item => {
                    const isSelected = selectedLoaners.includes(item.id);
                    return (
                        <GlassCard
                            key={item.id}
                            theme={theme}
                            className="p-3 flex items-center justify-between cursor-pointer border-2 transition-all"
                            style={{ borderColor: isSelected ? theme.colors.accent : 'transparent' }}
                            onClick={() => handleToggleLoaner(item.id)}
                        >
                            <div>
                                <p className="font-bold" style={{ color: theme.colors.textPrimary }}>
                                    {item.name}
                                </p>
                                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                    {item.model}
                                </p>
                            </div>
                            <img
                                src={item.img}
                                alt={item.name}
                                className="w-16 h-16 rounded-lg"
                            />
                        </GlassCard>
                    );
                })}
            </div>

            <div className="px-4 space-y-4 pb-4 sticky bottom-0 bg-white">
                <GlassCard theme={theme} className="p-4 space-y-2">
                    <h3 className="font-bold" style={{ color: theme.colors.textPrimary }}>
                        Ship To
                    </h3>
                    <div className="relative">
                        <textarea
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            style={{
                                backgroundColor: theme.colors.subtle,
                                borderColor: theme.colors.border,
                                color: theme.colors.textPrimary
                            }}
                        />
                        <button
                            onClick={() => setAddress(userSettings.homeAddress)}
                            className="absolute top-2 right-2 p-1 rounded-full"
                            style={{ backgroundColor: theme.colors.surface }}
                        >
                            <Home className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                        </button>
                    </div>
                </GlassCard>

                <button
                    onClick={handleSubmit}
                    disabled={selectedLoaners.length === 0 || !address.trim()}
                    className="w-full font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                    style={{ backgroundColor: theme.colors.accent, color: '#FFF' }}
                >
                    Request
                </button>
            </div>
        </>
    );
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

const SearchFormScreen = () => {
    const [form, setForm] = useState({
        supplier: '',
        pattern: '',
        jsiSeries: '',
        grade: [],
        fabricType: [],
        tackable: []
    });
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [showGradeOptions, setShowGradeOptions] = useState(false);
    const [showFabricOptions, setShowFabricOptions] = useState(false);
    const [showTackableOptions, setShowTackableOptions] = useState(false);

    const [fabricSuppliers, setFabricSuppliers] = useState([]);
    const [fabricPatterns, setFabricPatterns] = useState([]);
    const [jsiSeriesOptions, setJsiSeriesOptions] = useState([]);

    useEffect(() => {
        // TODO: fetch lists for suppliers, patterns, and series
        // e.g. API.getSuppliers().then(setFabricSuppliers);
    }, []);

    const updateField = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
    };

    const updateMulti = (field, value) => {
        setForm(f => {
            const list = f[field];
            const updated = list.includes(value)
                ? list.filter(x => x !== value)
                : [...list, value];
            return { ...f, [field]: updated };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.supplier || !form.jsiSeries) {
            setError('Please fill in required fields');
            return;
        }
        setError('');
        // TODO: call search API
        // const data = await API.searchJSI(form);
        // setResults(data);
    };

    const resetSearch = () => {
        setResults(null);
        setForm({ supplier: '', pattern: '', jsiSeries: '', grade: [], fabricType: [], tackable: [] });
        setShowGradeOptions(false);
        setShowFabricOptions(false);
        setShowTackableOptions(false);
        setError('');
    };

    return (
        <div className="px-4 py-6">
            {!results ? (
                <Card className="p-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <p className="text-sm text-destructive">{error}</p>}

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
                            <p className="mb-2 font-medium">Grade</p>
                            <div className="flex flex-wrap gap-2">
                                {!showGradeOptions ? (
                                    <Button variant="filled" onClick={() => setShowGradeOptions(true)}>Any</Button>
                                ) : (
                                    <>
                                        <Button variant="outline" onClick={() => { updateField('grade', []); setShowGradeOptions(false); }}>Any</Button>
                                        {gradeOptions.map(g => (
                                            <Button
                                                key={g}
                                                variant={form.grade.includes(g) ? 'filled' : 'outline'}
                                                onClick={() => updateMulti('grade', g)}
                                            >{g}</Button>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 font-medium">Fabric Type</p>
                            <div className="flex flex-wrap gap-2">
                                {!showFabricOptions ? (
                                    <Button variant="filled" onClick={() => setShowFabricOptions(true)}>Any</Button>
                                ) : (
                                    <>
                                        <Button variant="outline" onClick={() => { updateField('fabricType', []); setShowFabricOptions(false); }}>Any</Button>
                                        {fabricTypeOptions.map(type => (
                                            <Button
                                                key={type}
                                                variant={form.fabricType.includes(type) ? 'filled' : 'outline'}
                                                onClick={() => updateMulti('fabricType', type)}
                                            >{type}</Button>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 font-medium">Tackable</p>
                            <div className="flex flex-wrap gap-2">
                                {!showTackableOptions ? (
                                    <Button variant="filled" onClick={() => setShowTackableOptions(true)}>Any</Button>
                                ) : (
                                    <>
                                        <Button variant="outline" onClick={() => { updateField('tackable', []); setShowTackableOptions(false); }}>Any</Button>
                                        {tackableOptions.map(t => (
                                            <Button
                                                key={t}
                                                variant={form.tackable.includes(t) ? 'filled' : 'outline'}
                                                onClick={() => updateMulti('tackable', t)}
                                            >{t}</Button>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>

                        <Button type="submit" className="w-full">Search</Button>
                    </form>
                </Card>
            ) : (
                <div className="space-y-6">
                    <Card className="p-4">
                        <p className="font-semibold text-lg">Results: {results.length}</p>
                        <div className="mt-2 space-y-1 text-sm">
                            <div><span className="font-medium">Supplier:</span> {form.supplier}</div>
                            {form.pattern && <div><span className="font-medium">Pattern:</span> {form.pattern}</div>}
                            <div><span className="font-medium">Series:</span> {form.jsiSeries}</div>
                        </div>
                    </Card>
                    <div className="space-y-4">
                        {results.map((r, i) => (
                            <Card key={i} className="p-4">
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
                    <Button onClick={resetSearch} className="w-full">New Search</Button>
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
};

const ProfileMenu = ({ show, onClose, onNavigate, toggleTheme, theme, isDarkMode }) => {
    if (!show) return null;
    const menuItems = [
        { label: isDarkMode ? 'Light Mode' : 'Dark Mode', action: () => { toggleTheme(); onClose(); }, icon: isDarkMode ? Sun : Moon },
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
    <GlassCard
        theme={theme}
        className="p-4 space-y-4 mb-6"
        style={{ backgroundColor: theme.colors.surface }}
    >
        <h2
            className="font-bold text-lg"
            style={{ color: theme.colors.textPrimary }}
        >
            {title}
        </h2>
        {children}
    </GlassCard>
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


const GlassCard = React.memo(
    React.forwardRef(({ children, className = '', theme, ...props }, ref) => (
        <div
            ref={ref}
            className={`rounded-[1.75rem] border shadow-lg transition-all duration-300 ${className}`}
            style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                boxShadow: `0 4px 30px ${theme.colors.shadow}`,
                backdropFilter: theme.backdropFilter,
                WebkitBackdropFilter: theme.backdropFilter
            }}
            {...props}
        >
            {children}
        </div>
    ))
);

const PageTitle = React.memo(({ title, theme, onBack, children }) => (
    <div className="px-4 pt-6 pb-4 flex justify-between items-center">
        <div className="flex-1 flex items-center space-x-2">
            {onBack && (
                <button
                    onClick={onBack}
                    className="p-2 ml-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                >
                    <ArrowLeft
                        className="w-5 h-5"
                        style={{ color: theme.colors.textSecondary }}
                    />
                </button>
            )}
            <h1
                className="text-3xl font-bold tracking-tight"
                style={{ color: theme.colors.textPrimary }}
            >
                {title}
            </h1>
        </div>
        {children}
    </div>
));

const FormInput = React.memo(({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    options,
    className = '',
    theme,
    readOnly = false,
    required = false
}) => {
    const inputClass = `w-full px-4 py-3 border rounded-lg focus:ring-2 text-base outline-none ${className}`;
    const styles = {
        backgroundColor: theme.colors.background,  // light beige
        borderColor: theme.colors.border,      // visible border
        color: theme.colors.textPrimary,
        ringColor: theme.colors.accent,
        '--placeholder-color': theme.colors.textSecondary
    };

    return (
        <div className="space-y-1">
            {label && (
                <label
                    className="text-xs font-semibold px-1"
                    style={{ color: theme.colors.textSecondary }}
                >
                    {label}{required && <> <span className="text-red-500">*</span></>}
                </label>
            )}

            {type === 'select' ? (
                <select
                    required={required}
                    value={value || ''}
                    onChange={onChange}
                    className={inputClass}
                    style={styles}
                >
                    <option value="" disabled hidden>
                        {placeholder}
                    </option>
                    {options.map(o =>
                        typeof o === 'string' ? (
                            <option key={o} value={o}>{o}</option>
                        ) : (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        )
                    )}
                </select>
            ) : type === 'textarea' ? (
                <textarea
                    value={value}
                    onChange={onChange}
                    className={inputClass}
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
                    <div className="text-lg font-normal leading-tight" style={{ color: theme.colors.textPrimary }}>Hello, {userName}!</div>
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

const DonutChart = ({ data, theme }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="space-y-3">
            {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: item.color || theme.colors.accent }}
                        />
                        <span style={{ color: theme.colors.textPrimary }}>{item.label}</span>
                    </div>
                    <div className="text-right">
                        <div className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                            {item.value}%
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const OrderModal = ({ order, onClose, onShowDetails, theme }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <GlassCard theme={theme} className="w-full max-w-md">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
                        Order Details
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                    >
                        <X className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    </button>
                </div>

                <div className="space-y-3">
                    <div>
                        <span className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>
                            Company:
                        </span>
                        <div style={{ color: theme.colors.textPrimary }}>{order.company}</div>
                    </div>

                    <div>
                        <span className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>
                            PO Number:
                        </span>
                        <div style={{ color: theme.colors.textPrimary }}>{order.po}</div>
                    </div>

                    <div>
                        <span className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>
                            Amount:
                        </span>
                        <div className="text-xl font-bold" style={{ color: theme.colors.accent }}>
                            {order.amount}
                        </div>
                    </div>

                    <div>
                        <span className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>
                            Date:
                        </span>
                        <div style={{ color: theme.colors.textPrimary }}>
                            {new Date(order.date).toLocaleDateString()}
                        </div>
                    </div>

                    {order.shipDate && (
                        <div>
                            <span className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>
                                Ship Date:
                            </span>
                            <div style={{ color: theme.colors.textPrimary }}>{order.shipDate}</div>
                        </div>
                    )}
                </div>

                <div className="flex space-x-3 mt-6">
                    <button
                        onClick={onShowDetails}
                        className="flex-1 py-2 px-4 rounded-lg font-semibold text-white"
                        style={{ backgroundColor: theme.colors.accent }}
                    >
                        View All Orders
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 px-4 rounded-lg font-semibold border"
                        style={{
                            color: theme.colors.textPrimary,
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.subtle
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </GlassCard>
    </div>
);
const SalesScreen = ({ theme, onNavigate }) => {
  const { MONTHLY_SALES_DATA, ORDER_DATA, SALES_VERTICALS_DATA } = Data;
  const [monthlyView, setMonthlyView] = useState('table');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { totalBookings, totalSales } = useMemo(() => {
    const bookings = Data.MONTHLY_SALES_DATA.reduce((acc, m) => acc + m.bookings, 0);
    const sales    = Data.MONTHLY_SALES_DATA.reduce((acc, m) => acc + m.sales,   0);
    return { totalBookings: bookings, totalSales: sales };
  }, []);

  const recentOrders = useMemo(() => {
    return Data.ORDER_DATA
      .filter(o => o.date && o.net)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 9);
  }, []);

  const goal           = 7000000;
  const percentToGoal  = useMemo(() => (totalBookings / goal) * 100, [totalBookings]);

  const handleToggleView       = useCallback(() => setMonthlyView(v => v === 'chart' ? 'table' : 'chart'), []);
  const handleShowOrderDetails = useCallback(order => setSelectedOrder(order), []);
  const handleCloseModal       = useCallback(() => setSelectedOrder(null), []);
  const handleCustomerRankNav  = useCallback(() => onNavigate('customer-rank'), [onNavigate]);
  const handleCommissionsNav   = useCallback(() => onNavigate('commissions'),  [onNavigate]);
  const handleRewardsNav       = useCallback(() => onNavigate('incentive-rewards'), [onNavigate]);

  return (
    <>
      <PageTitle title="Sales Dashboard" theme={theme}>
        <button
          onClick={() => onNavigate('new-lead')}
          className="p-2 rounded-full -mr-2 transition-transform hover:scale-110 active:scale-95"
          style={{ backgroundColor: theme.colors.accent }}
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </PageTitle>

      <div className="px-4 space-y-4 pb-4">
        <GlassCard theme={theme} className="p-4 hover:border-white/20 transition-all duration-300">
          <p className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>
            Progress to Goal
          </p>
          <p className="text-4xl font-bold my-2" style={{ color: theme.colors.accent }}>
            {percentToGoal.toFixed(1)}%
          </p>
          <div className="relative w-full h-2.5 rounded-full" style={{ backgroundColor: theme.colors.subtle }}>
            <div
              className="h-2.5 rounded-full"
              style={{ width: `${percentToGoal}%`, backgroundColor: theme.colors.accent }}
            />
          </div>
        </GlassCard>

        <GlassCard theme={theme} className="p-4 hover:border-white/20 transition-all duration-300">
          <div className="flex justify-between items-center mb-2">
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

        <GlassCard theme={theme} className="p-1">
          <button
            onClick={handleCustomerRankNav}
            className="w-full p-3 rounded-xl flex items-center justify-between"
          >
            <span className="text-md font-semibold" style={{ color: theme.colors.textPrimary }}>
              View Customer Rank
            </span>
            <ArrowRight className="w-5 h-5" style={{ color: theme.colors.secondary }} />
          </button>
        </GlassCard>

        <GlassCard theme={theme} className="p-1">
          <button
            onClick={handleCommissionsNav}
            className="w-full p-3 rounded-xl flex items-center justify-between"
          >
            <span className="text-md font-semibold" style={{ color: theme.colors.textPrimary }}>
              View Commissions
            </span>
            <ArrowRight className="w-5 h-5" style={{ color: theme.colors.secondary }} />
          </button>
        </GlassCard>

        <GlassCard theme={theme} className="p-1">
          <button
            onClick={handleRewardsNav}
            className="w-full p-3 rounded-xl flex items-center justify-between"
          >
            <span className="text-md font-semibold" style={{ color: theme.colors.textPrimary }}>
              View Incentive Rewards
            </span>
            <ArrowRight className="w-5 h-5" style={{ color: theme.colors.secondary }} />
          </button>
        </GlassCard>
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


const OrdersScreen = ({ theme, onNavigate }) => (
    <>
        <PageTitle
            title="Orders"
            theme={theme}
        />
        <div className="p-4 space-y-4 overflow-y-auto">
            {Data.ORDER_DATA.map(order => (
                <GlassCard
                    key={order.orderNumber}
                    theme={theme}
                    className="p-4"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <div
                                className="font-semibold text-lg"
                                style={{ color: theme.colors.textPrimary }}
                            >
                                {order.company}
                            </div>
                            <div
                                className="text-sm"
                                style={{ color: theme.colors.textSecondary }}
                            >
                                PO #{order.po} • {new Date(order.date).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold" style={{ color: theme.colors.accent }}>
                                {order.amount}
                            </div>
                            <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                Ship {order.shipDate || '—'}
                            </div>
                        </div>
                    </div>
                </GlassCard>
            ))}
        </div>
    </>
);




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

    const updateField = useCallback((field, value) => {
        setNewLead(prev => ({ ...prev, [field]: value }));
    }, []);

    // --- PRODUCT HANDLERS ---
    const addSeries = useCallback(series => {
        setNewLead(prev => ({
            ...prev,
            products: [
                ...prev.products,
                { series, materials: [], glassDoors: false }
            ]
        }));
    }, []);

    const removeSeries = useCallback(idx => {
        setNewLead(prev => ({
            ...prev,
            products: prev.products.filter((_, i) => i !== idx)
        }));
    }, []);

    const toggleMaterial = useCallback((idx, mat) => {
        setNewLead(prev => {
            const prods = [...prev.products];
            const mats = prods[idx].materials.includes(mat)
                ? prods[idx].materials.filter(m => m !== mat)
                : [...prods[idx].materials, mat];
            prods[idx] = { ...prods[idx], materials: mats };
            return { ...prev, products: prods };
        });
    }, []);

    const toggleGlass = useCallback(idx => {
        setNewLead(prev => {
            const prods = [...prev.products];
            prods[idx] = { ...prods[idx], glassDoors: !prods[idx].glassDoors };
            return { ...prev, products: prods };
        });
    }, []);

    // --- OTHER DERIVED DATA ---
    const availableSeries = useMemo(
        () => JSI_PRODUCT_SERIES.filter(s => !newLead.products.some(p => p.series === s)),
        [newLead.products]
    );

    const DISCOUNT_LIST = useMemo(
        () => ['Undecided Discount', ...DISCOUNT_OPTIONS.filter(d => d !== 'Undecided')],
        []
    );

    const handleSubmit = e => {
        e.preventDefault();
        onSuccess(newLead);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <PageTitle title="Create New Lead" theme={theme} />

            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4 space-y-6 scrollbar-hide">
                {/* Project Details */}
                <FormSection title="Project Details" theme={theme}>
                    <input
                        required
                        type="text"
                        placeholder="Enter Project Name"
                        value={newLead.project}
                        onChange={e => updateField('project', e.target.value)}
                        className="w-full px-4 py-3 border rounded-full focus:ring-2 text-base outline-none"
                        style={{
                            backgroundColor: theme.colors.subtle,
                            borderColor: 'transparent',
                            color: theme.colors.textPrimary,
                            ringColor: theme.colors.accent,
                        }}
                    />
                    <FancySelect
                        required
                        placeholder="Select Design Firm"
                        options={designFirms}
                        value={newLead.designFirm}
                        onChange={e => updateField('designFirm', e.target.value)}
                        theme={theme}
                    />
                    <FancySelect
                        required
                        placeholder="Select Dealer"
                        options={dealers}
                        value={newLead.dealer}
                        onChange={e => updateField('dealer', e.target.value)}
                        theme={theme}
                    />
                </FormSection>

                {/* Summary */}
                <FormSection title="Summary" theme={theme}>
                    {/* your ProbabilitySlider here, unchanged */}
                </FormSection>

                {/* Status / Vertical / List / Timeframe */}
                <FormSection title="Project Status" theme={theme}>
                    <FancySelect
                        required
                        placeholder="Select Stage"
                        options={STAGES}
                        value={newLead.projectStatus}
                        onChange={e => updateField('projectStatus', e.target.value)}
                        theme={theme}
                    />
                </FormSection>
                <FormSection title="Vertical" theme={theme}>
                    <FancySelect
                        required
                        placeholder="Select Vertical"
                        options={VERTICALS}
                        value={newLead.vertical}
                        onChange={e => updateField('vertical', e.target.value)}
                        theme={theme}
                    />
                </FormSection>
                <FormSection title="Estimated List" theme={theme}>
                    <input
                        required
                        type="text"
                        placeholder="Enter Estimated List"
                        value={newLead.estimatedList}
                        onChange={e => updateField('estimatedList', e.target.value)}
                        className="w-full px-4 py-3 border rounded-full focus:ring-2 text-base outline-none"
                        style={{
                            backgroundColor: theme.colors.subtle,
                            borderColor: 'transparent',
                            color: theme.colors.textPrimary,
                            ringColor: theme.colors.accent,
                        }}
                    />
                </FormSection>
                <FormSection title="PO Timeframe" theme={theme}>
                    <FancySelect
                        required
                        placeholder="Select PO Timeframe"
                        options={PO_TIMEFRAMES}
                        value={newLead.poTimeframe}
                        onChange={e => updateField('poTimeframe', e.target.value)}
                        theme={theme}
                    />
                </FormSection>

                {/* Competition Present */}
                <FormSection title="Competition?" theme={theme}>
                    <FancySelect
                        options={['Yes', 'No']}
                        placeholder="Competition Present?"
                        value={newLead.competitionPresent ? 'Yes' : 'No'}
                        onChange={e => {
                            const present = e.target.value === 'Yes';
                            updateField('competitionPresent', present);
                            if (!present) updateField('competitors', []);
                        }}
                        theme={theme}
                    />
                </FormSection>

                {/* Products Section */}
                <FormSection title="Competition & Products" theme={theme}>
                    <div className="space-y-4">
                        {newLead.products.map((p, idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-lg p-4 border border-gray-200 space-y-2"
                                style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">{p.series}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSeries(idx)}
                                        className="p-1 rounded-full hover:bg-red-100"
                                    >
                                        <X className="w-4 h-4" style={{ color: theme.colors.error || '#E53E3E' }} />
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {VISION_MATERIALS.map(mat => (
                                        <button
                                            key={mat}
                                            type="button"
                                            onClick={() => toggleMaterial(idx, mat)}
                                            className={`px-3 py-1 text-xs rounded-full ${p.materials.includes(mat)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-700'
                                                }`}
                                        >
                                            {mat}
                                        </button>
                                    ))}
                                </div>

                                <label className="flex items-center space-x-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={p.glassDoors}
                                        onChange={() => toggleGlass(idx)}
                                        className="form-checkbox"
                                    />
                                    <span>Glass Doors?</span>
                                </label>
                            </div>
                        ))}

                        {/* Add New Series */}
                        {availableSeries.length > 0 && (
                            <FancySelect
                                placeholder="Add a Product Series..."
                                options={availableSeries}
                                value={''}
                                onChange={e => addSeries(e.target.value)}
                                theme={theme}
                            />
                        )}
                    </div>
                </FormSection>

                {/* Discount */}
                <FormSection title="Discount" theme={theme}>
                    <FancySelect
                        required
                        placeholder="Select Discount"
                        options={DISCOUNT_LIST}
                        value={newLead.discount}
                        onChange={e => updateField('discount', e.target.value)}
                        theme={theme}
                    />
                </FormSection>

                {/* Notes */}
                <FormSection title="Additional Notes" theme={theme}>
                    <textarea
                        rows={3}
                        placeholder="Enter details…"
                        value={newLead.notes}
                        onChange={e => updateField('notes', e.target.value)}
                        className="w-full p-3 rounded-lg outline-none"
                        style={{
                            backgroundColor: theme.colors.subtle,
                            color: theme.colors.textPrimary
                        }}
                    />
                </FormSection>
            </div>

            <button
                type="submit"
                className="w-full py-3 text-white font-semibold rounded-b-lg"
                style={{ backgroundColor: theme.colors.accent }}
            >
                Submit Lead
            </button>
        </form>
    );
};


const ResourcesScreen = ({ theme, onNavigate }) => {
    return (
        <>
            <PageTitle title="Resources" theme={theme} />

            <div className="px-4 space-y-6 pb-4">
                {Data.RESOURCES_DATA.map(category => (
                    <div key={category.category}>
                        <h2
                            className="text-xl font-bold mb-2 px-1"
                            style={{ color: theme.colors.textPrimary }}
                        >
                            {category.category}
                        </h2>

                        <div className="space-y-3">
                            {category.items.map(item => (
                                <GlassCard
                                    key={item.label}
                                    theme={theme}
                                    className="p-1"
                                >
                                    <button
                                        onClick={() => onNavigate(item.nav)}
                                        className="w-full p-3 rounded-xl flex items-center justify-between"
                                    >
                                        <span
                                            className="text-md font-semibold tracking-tight"
                                            style={{ color: theme.colors.textPrimary }}
                                        >
                                            {item.label}
                                        </span>
                                        <ArrowRight
                                            className="w-5 h-5"
                                            style={{ color: theme.colors.secondary }}
                                        />
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

            {/* --- UPDATED TOGGLE BUTTON --- */}
            <div className="px-4">
                <GlassCard theme={theme} className="p-1 flex relative">
                    {/* Sliding Highlight Element */}
                    <div
                        className="absolute top-1 bottom-1 w-[calc(50%-0.25rem)] h-auto rounded-full transition-all duration-300 ease-in-out"
                        style={{
                            backgroundColor: theme.colors.primary,
                            transform: projectsTab === 'pipeline' ? 'translateX(0.25rem)' : 'translateX(calc(100% + 0.25rem))'
                        }}
                    />

                    {/* Buttons are now transparent and sit on top of the highlight */}
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
                <>
                    <div className="flex space-x-2 overflow-x-auto p-4 scrollbar-hide">
                        {STAGES.map(stage => (
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
                    <div className="px-4 space-y-4 pb-4">
                        {filteredOpportunities.map(opp => (
                            <GlassCard key={opp.id} theme={theme} className="overflow-hidden">
                                <div className="p-4">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{opp.name}</h3>
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${STAGE_COLORS[opp.stage]}`}>{opp.stage}</span>
                                    </div>
                                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{opp.company}</p>
                                    <p className="font-semibold text-2xl my-2" style={{ color: theme.colors.textPrimary }}>{opp.value}</p>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </>
            ) : (
                <div className="px-4 pt-4 pb-4 grid grid-cols-2 gap-4">
                    {Data.MY_PROJECTS_DATA.map(project => (
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

    // Top-level Resources menu
    resources: ResourcesScreen,

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
    // Reusable UI bits
    Avatar,
    PostCard,
    WinsCard,
    CreateContentModal,
    GlassCard,
    PageTitle,
    FormInput,
    SearchInput,
    SuccessToast,
    AppHeader,
    ProfileMenu,
    MonthlyBarChart,
    MonthlyTable,
    RecentPOsCard,
    DonutChart,
    OrderModal,
    PollCard,

    // Top‐level screens
    HomeScreen,
    SalesScreen,
    OrdersScreen,
    ProductsScreen,
    ResourcesScreen,

    // Fabrics screens
    SearchFormScreen,
    COMRequestScreen,

    // “Rep Functions” screens
    CommissionRatesScreen,
    LoanerPoolScreen,
    DealerRegistrationScreen,
    RequestFieldVisitScreen,
    SampleDiscountsScreen,
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
    ProjectsScreen,
    CommunityScreen,
    SamplesScreen,
    CartScreen,
    NewLeadScreen,
    ReplacementsScreen,
    SettingsScreen,
    MembersScreen,
    HelpScreen,
    LogoutScreen,
    FeedbackScreen,

    // The navigation map
    SCREEN_MAP,
};
