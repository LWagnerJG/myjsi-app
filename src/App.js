import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { User, MousePointer, PieChart, RotateCw, Palette, DollarSign, Database, MessageSquare, ArrowRight, Search, Briefcase, Package, X, ChevronDown, Sun, Moon, Camera, LogOut, HelpCircle, ShoppingCart, CheckCircle, Plus, Minus, ArrowLeft, BarChart2, List, Home, Hourglass, Armchair, Server, MoreVertical, UserPlus, UserX, Trophy, ChevronUp } from 'lucide-react';

// ===================================================================================
// THEME & STYLING - JSI Branded 2025 "Glassmorphism"
// ===================================================================================

const lightTheme = {
  colors: {
    background: '#F0EFEF', // Light stone gray
    surface: 'rgba(255, 255, 255, 0.95)', // Whiter, more opaque surface for modals
    primary: '#2A2A2A', // JSI Charcoal
    secondary: '#7A7A7A', // Medium Gray
    accent: '#B99962', // JSI Gold
    accentHover: '#A38551',
    subtle: 'rgba(230, 230, 230, 0.7)', // Slightly more opaque subtle elements
    textPrimary: '#2A2A2A',
    textSecondary: '#7A7A7A',
    border: 'rgba(255, 255, 255, 0.9)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    highlight: 'rgba(255, 255, 255, 0.5)',
    embossShadow: 'rgba(180, 180, 180, 0.4)'
  },
  backdropFilter: 'blur(10px) saturate(150%)',
};

const darkTheme = {
  colors: {
    background: '#212529', // Softer dark gray
    surface: 'rgba(70, 70, 70, 0.7)', 
    primary: '#F5F5F5',
    secondary: '#A0A0A0', 
    accent: '#D4B37F',
    accentHover: '#E0C49A',
    subtle: 'rgba(50, 50, 50, 0.6)',
    textPrimary: '#F5F5F5',
    textSecondary: '#A0A0A0',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.2)',
    highlight: 'rgba(255, 255, 255, 0.1)',
    embossShadow: 'rgba(0, 0, 0, 0.3)'
  },
  backdropFilter: 'blur(16px) saturate(180%)',
};


// ===================================================================================
// CONSTANTS
// ===================================================================================
const MENU_ITEMS = [ { id: 'orders', icon: MousePointer, label: 'Orders' }, { id: 'products', icon: Armchair, label: 'Products' }, { id: 'sales', icon: PieChart, label: 'Sales' }, { id: 'lead-times', icon: RotateCw, label: 'Lead Times' }, { id: 'projects', icon: Briefcase, label: 'Projects' }, { id: 'fabrics', icon: Palette, label: 'Fabrics' }, { id: 'resources', icon: Database, label: 'Resources' }, { id: 'samples', icon: Package, label: 'Samples' }, { id: 'replacements', icon: RotateCw, label: 'Replacements' }, ];
const ORDER_DATA = [ 
    { date: 'THU, JUN 12, 2025', amount: '$43,034.00', company: 'BUSINESS FURNITURE LLC', details: 'MSD of Lawrence Township - LECC', orderNumber: '444353-00', po: 'S65473-7', net: 31250.00, reward: 'Jennifer Franklin (1%)', shipDate: '8/25/2025', status: 'In Production', shipTo: 'BUSINESS FURNITURE LLC\n4102 MEGHAN BEELER COURT\nSOUTH BEND, IN 46628', discount: '61.20%', lineItems: [
        {line: '001', name: 'STORAGE CABINET', model: 'VST2430SC', quantity: 1, net: 739.60, extNet: 739.6, options: 'None'},
        {line: '002', name: 'CUSTOM UNIT - LAMINATE', model: 'CUSTOM-CGL', quantity: 1, net: 734.00, extNet: 734.00, options: 'Special Size'},
        {line: '003', name: 'DESK CHAIR', model: 'BRY2001', quantity: 5, net: 450.00, extNet: 2250.00, options: 'Custom Fabric'},
        {line: '004', name: 'CONFERENCE TABLE', model: 'TBCONF8', quantity: 1, net: 2500.00, extNet: 2500.00, options: 'Power module'},
    ]},
    { date: 'THU, JUN 12, 2025', amount: '$1,250.50', company: 'CORPORATE DESIGN INC', details: 'ONEMAIN FINANCIAL', orderNumber: '442365-00', po: 'S65473-8', net: 950.00, reward: 'John Doe (1.5%)', shipDate: '8/28/2025', status: 'Shipped', shipTo: 'CORPORATE DESIGN INC\n123 MAIN STREET\nEVANSVILLE, IN 47708', discount: '24.03%', lineItems: [{line: '001', name: 'SIDE TABLE', model: 'SIDETBL-SM', quantity: 2, net: 475.00, extNet: 950.00, options: 'None'}] },
    { date: 'WED, JUN 11, 2025', amount: '$643.80', company: 'CORPORATE DESIGN INC', details: 'ONE MAIN FINANCIAL', orderNumber: '449518-00', po: 'S65473-9', net: 500.00, reward: 'Jennifer Franklin (1%)', shipDate: '9/02/2025', status: 'In Production', shipTo: 'CORPORATE DESIGN INC\n123 MAIN STREET\nEVANSVILLE, IN 47708', discount: '22.34%', lineItems: [] },
    { date: 'WED, JUN 11, 2025', amount: '$3,415.20', company: 'ONE ELEVEN DESIGN', details: 'CENTLIVRE, LLC', orderNumber: '449645-00', po: 'S65474-1', net: 2800.00, reward: 'Jane Smith (1%)', shipDate: '9/05/2025', status: 'Pending', shipTo: 'ONE ELEVEN DESIGN\n456 OAK AVENUE\nFORT WAYNE, IN 46802', discount: '18.01%', lineItems: [] },
    { date: 'TUE, JUN 10, 2025', amount: '$137,262.94', company: 'BUSINESS FURNISHINGS', details: 'MONREAU SEMINARY', orderNumber: '450080-00', po: 'S65474-2', net: 112000.00, reward: 'Jennifer Franklin (1%)', shipDate: '9/15/2025', status: 'In Production', shipTo: 'BUSINESS FURNISHINGS LLC\n4102 MEGHAN BEELER COURT\nSOUTH BEND, IN 46628', discount: '18.40%', lineItems: [] },
    { date: '', amount: '', company: 'SHARP SCHOOL SERVICES INC', details: 'MARSHALL COMMUNITY BUILDING', orderNumber: '442137'},
    { date: '', amount: '', company: 'SHARP SCHOOL SERVICES INC', details: '', orderNumber: '440738'},
];
const LEAD_TIMES_DATA = [
    { series: "Standard Seating", products: [{ type: "All Series", weeks: "6-8" }] },
    { series: "Standard Casegoods & Tables", products: [ { type: "Veneer", weeks: "8-10" }, { type: "Laminate", weeks: "6-8" } ]},
    { series: "Arwyn", products: [{ type: "Seating", weeks: "6-8" }] },
    { series: "Satisse", products: [ { type: "Seating", weeks: "8-10" }, { type: "Carts", weeks: "8-10" } ]},
    { series: "Forge", products: [{ type: "Laminate", weeks: "6-8" }] },
    { series: "Kindera", products: [{ type: "Seating", weeks: "8-10" }] },
    { series: "Somna", products: [{ type: "Seating", weeks: "8-10" }] },
];

const FABRICS_DATA = [ { name: 'Luxe Weave', manufacturer: 'Momentum' }, { name: 'Origin', manufacturer: 'Momentum' }, { name: 'Origin', manufacturer: 'Maharam' }, { name: 'Origin', manufacturer: 'Architex' }, { name: 'Climb', manufacturer: 'Maharam' }, { name: 'Rigid', manufacturer: 'Maharam' }, { name: 'Heritage Tweed', manufacturer: 'Traditions' } ];
const RESOURCES_CATEGORIES = ["Commission Rates", "Contracts", "Dealer Registration", "Design Days", "Discontinued Finishes", "Install Instructions", "Loaner Pool", "Presentations", "Sample Discounts"];
const LOANER_POOL_PRODUCTS = [
    { id: 'br2301', name: 'Bryn', model: 'BR2301', img: 'https://placehold.co/100x100/E3DBC8/7A7A7A?text=Chair' },
    { id: 'cv4501', name: 'Caav', model: 'CV4501', img: 'https://placehold.co/100x100/D9CDBA/7A7A7A?text=Sofa' },
    { id: 'kn2301', name: 'Knox', model: 'KN2301', img: 'https://placehold.co/100x100/A9886C/7A7A7A?text=Stool' },
    { id: 'wk4501', name: 'Wink', model: 'WK4501', img: 'https://placehold.co/100x100/966642/7A7A7A?text=Chair' },
];
const INITIAL_OPPORTUNITIES = [ { id: 1, name: 'New Office Furnishings', stage: 'Discovery', discount: '5%', value: '$50,000', company: 'ABC Corporation', contact: 'John Smith', poTimeframe: '30-60 days' }, { id: 2, name: 'Lobby Refresh', stage: 'Specifying', value: '$75,000', company: 'XYZ Industries', contact: 'Jane Doe', poTimeframe: '60-90 days' }, ];
const STAGES = ['Discovery', 'Specifying', 'Decision/Bidding', 'PO Expected', 'Won', 'Lost'];
const STAGE_COLORS = { 'Discovery': `bg-blue-200 text-blue-900`, 'Specifying': `bg-green-200 text-green-900`, 'Decision/Bidding': `bg-orange-200 text-orange-900`, 'PO Expected': `bg-purple-200 text-purple-900`, 'Won': `bg-emerald-200 text-emerald-900`, 'Lost': `bg-red-200 text-red-900`, };
const EMPTY_OPPORTUNITY = { name: '', company: '', contact: '', email: '', phone: '', value: '', stage: 'Discovery', projectType: '', timeline: '', notes: '', poTimeframe: '30-60 days' };
const YTD_SALES_DATA = [ { label: 'Total Sales', current: 3666132, previous: 2900104, goal: 7000000 }, { label: 'Education', current: 1250000, previous: 1045589, goal: 2500000 }, { label: 'Health', current: 980000, previous: 850000, goal: 2000000 }, ];
const MONTHLY_SALES_DATA = [ { month: 'Jan', bookings: 1259493, sales: 506304 }, { month: 'Feb', bookings: 497537, sales: 553922 }, { month: 'Mar', bookings: 397684, sales: 365601 }, { month: 'Apr', bookings: 554318, sales: 696628 }, { month: 'May', bookings: 840255, sales: 1340018 }, { month: 'Jun', bookings: 116846, sales: 36823 }, ];
const SALES_VERTICALS_DATA = [ { label: 'Healthcare', value: 2900104, color: '#B99962' }, { label: 'Higher Ed', value: 1045589, color: '#7A7A7A' }, { label: 'K12', value: 1045589, color: '#A0A0A0' }, { label: 'Corporate', value: 1045589, color: '#2A2A2A' }, { label: 'Government', value: 1045589, color: '#CCCCCC' }, ];

const INITIAL_MEMBERS = [
    { id: 1, firstName: 'Luke', lastName: 'Miller', email: 'luke.miller@example.com', title: 'Admin', role: 'Admin', permissions: { salesData: true, commissions: true, projects: true, customerRanking: true, dealerRewards: true, submittingReplacements: true } },
    { id: 2, firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@example.com', title: 'Admin', role: 'Admin', permissions: { salesData: true, commissions: true, projects: true, customerRanking: true, dealerRewards: true, submittingReplacements: true } },
    { id: 3, firstName: 'Michael', lastName: 'Jones', email: 'michael.jones@example.com', title: 'Sales', role: 'User', permissions: { salesData: true, commissions: true, projects: false, customerRanking: true, dealerRewards: false, submittingReplacements: false } },
    { id: 4, firstName: 'Jessica', lastName: 'Williams', email: 'jessica.williams@example.com', title: 'Designer', role: 'User', permissions: { salesData: false, commissions: false, projects: true, customerRanking: false, dealerRewards: false, submittingReplacements: true } },
    { id: 5, firstName: 'David', lastName: 'Brown', email: 'david.brown@example.com', title: 'Sales', role: 'User', permissions: { salesData: true, commissions: true, projects: false, customerRanking: true, dealerRewards: false, submittingReplacements: false } },
];
const PERMISSION_LABELS = {
    salesData: "Sales Data",
    commissions: "Commissions",
    dealerRewards: "Dealer Rewards",
    customerRanking: "Customer Ranking",
    projects: "Projects",
    submittingReplacements: "Submitting Replacements"
};
const USER_TITLES = ["Sales", "Designer", "Sales/Designer", "Administration"];
const EMPTY_USER = { firstName: '', lastName: '', email: '', title: 'Sales', role: 'User', permissions: { salesData: true, commissions: false, projects: true, customerRanking: true, dealerRewards: true, submittingReplacements: true } };

const CUSTOMER_RANK_DATA = [
    { id: 1, name: 'Business Furniture LLC', bookings: 450000, sales: 435000, orders: [{projectName: 'Lawrence Township LECC', amount: 43034}, {projectName: 'Monreau Seminary', amount: 137262}] },
    { id: 2, name: 'Corporate Design Inc', bookings: 380000, sales: 395000, orders: [{projectName: 'OneMain Financial HQ', amount: 1250}, {projectName: 'OneMain Financial Branch', amount: 643}] },
    { id: 3, name: 'OfficeWorks', bookings: 510000, sales: 490000, orders: [{projectName: 'Main Office Remodel', amount: 510000}] },
    { id: 4, name: 'LOTH Inc.', bookings: 320000, sales: 310000, orders: [] },
    { id: 5, name: 'One Eleven Design', bookings: 280000, sales: 275000, orders: [{projectName: 'Centlivre, LLC', amount: 3415}] },
    { id: 6, name: 'RJE Business Interiors', bookings: 470000, sales: 465000, orders: [] },
    { id: 7, name: 'Sharp School Services', bookings: 190000, sales: 185000, orders: [] },
    { id: 8, name: 'Braden Business Systems', bookings: 210000, sales: 205000, orders: [] },
    { id: 9, name: 'Schroeder\'s', bookings: 150000, sales: 140000, orders: [] },
    { id: 10, name: 'CVC', bookings: 230000, sales: 220000, orders: [] },
];

const SAMPLE_CATEGORIES = [{id: 'tfl', name: 'TFL'}, {id: 'hpl', name: 'HPL'}, {id: 'veneer', name: 'Veneer'}, {id: 'metal', name: 'Metal'}, {id: 'paint', name: 'Paint'}, {id: 'fabric', name: 'Fabric'}];
const SAMPLE_PRODUCTS = [ {id: 1, name: 'Belair', category: 'veneer', color: '#E3DBC8'}, {id: 2, name: 'Egret', category: 'veneer', color: '#D9CDBA'}, {id: 3, name: 'Clay', category: 'veneer', color: '#A9886C'}, {id: 4, name: 'Outback', category: 'veneer', color: '#966642'}, {id: 5, name: 'Forged', category: 'metal', color: '#5A5A5A'}, {id: 6, name: 'Carbon', category: 'metal', color: '#3E3E3E'}, {id: 7, name: 'Cotton', category: 'fabric', color: '#F0F0F0'}, {id: 8, name: 'Linen', category: 'fabric', color: '#EAE0D3'}, ];
const HOME_ADDRESS = "11406 Wolf Dancer Pass W #103\nFishers, IN, 46037";
const JSI_MODELS = [
    { id: 'VST2430SC', name: 'Storage Cabinet', series: 'Vision', isUpholstered: false },
    { id: 'BRY2001', name: 'Desk Chair', series: 'Bryn', isUpholstered: true },
    { id: 'TBCONF8', name: 'Conference Table', series: 'Tablet', isUpholstered: false },
    { id: 'SIDETBL-SM', name: 'Side Table', series: 'Americana', isUpholstered: false },
    { id: 'LNGCHR-OTT', name: 'Lounge Chair', series: 'Caav', isUpholstered: true },
];
const COMMISSION_DATA = {
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
const DAILY_DISCOUNT_OPTIONS = ["50 (50)","50/5 (52.5)","50/8 (54)","50/10 (55)","50/10/5 (57.25)"];
const DISCONTINUED_FINISHES = {
    maple: [
        { oldName: "ALE MEDIUM", veneer: "#3610", solid: "#3610", oldColor: "#d3b48c", newName: "PILSNER", newColor: "#e6d3b1" },
        { oldName: "BUTTERSCOTCH", veneer: "#3381", solid: "#3381", oldColor: "#a96e41", newName: "OUTBACK", newColor: "#966642" },
        { oldName: "VENETIAN", veneer: "#3593", solid: "#3593", oldColor: "#5e3a2f", newName: "BRICKDUST", newColor: "#744334" }
    ],
    cherry: [
        { oldName: "BOURBON MEDIUM", veneer: "#3581", solid: "#3683", oldColor: "#744334", newName: "OUTBACK", newColor: "#966642" },
        { oldName: "BRIGHTON MEDIUM", veneer: "#3611", solid: "#3684", oldColor: "#5e3a2f", newName: "BRICKDUST", newColor: "#744334" }
    ]
};
const PRODUCT_DATA = {
    swivels: {
        title: "Swivels",
        data: [
            { id: 'cosgrove', name: 'Cosgrove', listPrice: 1187, image: 'https://webresources.jsifurniture.com/production/uploads/jsi_cosgrove_comp_faux_highback_00007.jpg', features: { Casters: { price: 0, image: 'https://placehold.co/100x100/EEE/333?text=Caster1' }, 'Arm Caps': { price: 0, image: 'https://placehold.co/100x100/EEE/333?text=Arm1' } } },
            { id: 'arwyn', name: 'Arwyn', listPrice: 1483, image: 'https://webresources.jsifurniture.com/production/uploads/jsi_arwynconference_comp_0001_7U1AfYF.jpg', features: { Casters: { price: 0, image: 'https://placehold.co/100x100/EEE/333?text=Caster1' }, 'Arm Caps': { price: 100, image: 'https://placehold.co/100x100/DDD/333?text=Arm2' } } },
            { id: 'newton', name: 'Newton', listPrice: 1601, image: 'https://placehold.co/150x150/CCC/333?text=Newton', features: { Casters: { price: 377, image: 'https://placehold.co/100x100/CCC/333?text=Caster2' }, 'Arm Caps': { price: 100, image: 'https://placehold.co/100x100/DDD/333?text=Arm2' } } },
            { id: 'proxy', name: 'Proxy', listPrice: 1680, image: 'https://placehold.co/150x150/BBB/333?text=Proxy', features: { Casters: { price: 377, image: 'https://placehold.co/100x100/CCC/333?text=Caster2' }, 'Arm Caps': { price: 120, image: 'https://placehold.co/100x100/BBB/333?text=Arm3' } } }
        ]
    },
    'bar-stools': {
        title: 'Bar Stools',
        data: [
            { id: 'knox', name: 'Knox', listPrice: 850, image: 'https://placehold.co/150x150/EEE/333?text=Knox', features: { 'Foot Ring': { price: 50, image: 'https://placehold.co/100x100/EEE/333?text=Ring' }}},
            { id: 'indy', name: 'Indy', listPrice: 920, image: 'https://placehold.co/150x150/DDD/333?text=Indy', features: { 'Foot Ring': { price: 50, image: 'https://placehold.co/100x100/EEE/333?text=Ring' }}},
        ]
    },
    casegoods: {
        title: 'Casegoods',
        data: [
            { id: 'vision', name: 'Vision', listPrice: 3200, image: 'https://placehold.co/150x150/EEE/333?text=Vision', features: { 'Storage': { price: 400, image: 'https://placehold.co/100x100/EEE/333?text=Storage' }, 'Power': { price: 250, image: 'https://placehold.co/100x100/EEE/333?text=Power' }}},
            { id: 'tablet', name: 'Tablet', listPrice: 4500, image: 'https://placehold.co/150x150/DDD/333?text=Tablet', features: { 'Storage': { price: 550, image: 'https://placehold.co/100x100/DDD/333?text=Storage2' }, 'Power': { price: 300, image: 'https://placehold.co/100x100/DDD/333?text=Power2' }}}
        ]
    },
    'coffee-tables': {
        title: 'Coffee Tables',
        data: [
             { id: 'poet', name: 'Poet', listPrice: 950, image: 'https://placehold.co/150x150/EEE/333?text=Poet', features: { 'Surface': { price: 0, image: 'https://placehold.co/100x100/EEE/333?text=Laminate' }, 'Base': { price: 0, image: 'https://placehold.co/100x100/EEE/333?text=Wood' }}},
             { id: 'denver', name: 'Denver', listPrice: 1250, image: 'https://placehold.co/150x150/DDD/333?text=Denver', features: { 'Surface': { price: 150, image: 'https://placehold.co/100x100/DDD/333?text=Veneer' }, 'Base': { price: 100, image: 'https://placehold.co/100x100/DDD/333?text=Metal' }}},
        ]
    },
    conference: {
        title: 'Conference',
        data: [
            { id: 'tablet-conf', name: 'Tablet', listPrice: 5500, image: 'https://placehold.co/150x150/EEE/333?text=Tablet', features: { 'Power/Data': { price: 800, image: 'https://placehold.co/100x100/EEE/333?text=Power' }}},
            { id: 'vision-conf', name: 'Vision', listPrice: 7200, image: 'https://placehold.co/150x150/DDD/333?text=Vision', features: { 'Power/Data': { price: 1200, image: 'https://placehold.co/100x100/DDD/333?text=Power2' }}},
        ]
    },
    'counter-stools': {
        title: 'Counter Stools',
        data: [
            { id: 'knox-c', name: 'Knox', listPrice: 820, image: 'https://placehold.co/150x150/EEE/333?text=Knox', features: { 'Upholstery': { price: 100, image: 'https://placehold.co/100x100/EEE/333?text=Fabric' }}},
        ]
    },
    'end-tables': {
        title: 'End Tables',
        data: [
             { id: 'poet-end', name: 'Poet', listPrice: 750, image: 'https://placehold.co/150x150/EEE/333?text=Poet', features: { 'Surface': { price: 0, image: 'https://placehold.co/100x100/EEE/333?text=Laminate' }}},
             { id: 'denver-end', name: 'Denver', listPrice: 950, image: 'https://placehold.co/150x150/DDD/333?text=Denver', features: { 'Surface': { price: 120, image: 'https://placehold.co/100x100/DDD/333?text=Veneer' }}},
        ]
    },
    'guest-chairs': {
        title: 'Guest Chairs',
        data: [
             { id: 'arwyn-guest', name: 'Arwyn', listPrice: 1100, image: 'https://placehold.co/150x150/EEE/333?text=Arwyn', features: { 'Arms': { price: 0, image: 'https://placehold.co/100x100/EEE/333?text=Arm' }}},
             { id: 'bryn-guest', name: 'Bryn', listPrice: 1350, image: 'https://placehold.co/150x150/DDD/333?text=Bryn', features: { 'Arms': { price: 150, image: 'https://placehold.co/100x100/DDD/333?text=WoodArm' }}},
        ]
    },
    lounge: {
        title: 'Lounge',
        data: [
            { id: 'caav-lounge', name: 'Caav', listPrice: 2100, image: 'https://placehold.co/150x150/EEE/333?text=Caav', features: { 'Tablet Arm': { price: 300, image: 'https://placehold.co/100x100/EEE/333?text=Tablet' }}},
            { id: 'welli-lounge', name: 'Welli', listPrice: 2800, image: 'https://placehold.co/150x150/DDD/333?text=Welli', features: { 'Tablet Arm': { price: 350, image: 'https://placehold.co/100x100/DDD/333?text=Tablet' }}},
        ]
    }
};

const PRODUCTS_CATEGORIES_DATA = Object.entries(PRODUCT_DATA).map(([key, value]) => ({
    name: value.title,
    nav: `products/category/${key}`,
    images: value.data.length > 0 ? value.data.slice(0,2).map(p => p.image) : ['https://placehold.co/100x100/EEE/777?text=JSI']
})).sort((a,b) => a.name.localeCompare(b.name));

const CASEGOODS_COMPETITIVE_DATA = {
    typicals: [
        { id: 'typical1', name: 'Typical 1', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_000007.jpg', basePrice: {tfl: 6756, veneer: 9894} },
        { id: 'typical2', name: 'Typical 2', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_000009.jpg', basePrice: {tfl: 7123, veneer: 10562} },
        { id: 'typical3', name: 'Typical 3', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_000002.jpg', basePrice: {tfl: 8234, veneer: 11521} },
        { id: 'typical4', name: 'Typical 4', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_000008.jpg', basePrice: {tfl: 6980, veneer: 10100} },
        { id: 'typical5', name: 'Typical 5', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_0023_6DHmfyb.jpg', basePrice: {tfl: 9100, veneer: 12800} },
        { id: 'typical6', name: 'Typical 6', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_000001_dkm0wsV.jpg', basePrice: {tfl: 7550, veneer: 10950} },
    ],
    competitors: [
        { name: 'Kimball Priority', tfl: 1.09, veneer: 1.11 },
        { name: 'OFS Pulse', tfl: 1.18, veneer: null },
        { name: 'OFS Impulse', tfl: null, veneer: 1.22 },
        { name: 'Indiana Canvas', tfl: 1.19, veneer: 1.01 },
    ]
};



// ===================================================================================
// REUSABLE UI COMPONENTS
// ===================================================================================

const AppHeader = React.memo(({ onHomeClick, theme, onProfileClick, isHome, handleBack, showBack }) => ( 
    <div style={{ backgroundColor: theme.colors.surface, backdropFilter: theme.backdropFilter, WebkitBackdropFilter: theme.backdropFilter }} 
         className="p-4 flex justify-between items-center sticky top-0 z-20">
        
        {/* Left side: Always show logo, with optional back button */}
        <div className="flex items-center space-x-2">
            {showBack && (
                <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                    <ArrowLeft className="w-5 h-5" style={{color: theme.colors.textSecondary}} />
                </button>
            )}
            <button onClick={onHomeClick} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="text-2xl font-light italic" style={{color: theme.colors.textPrimary}}>My</div>
                <div style={{borderColor: theme.colors.primary}} className="border-2 rounded-md p-1 flex items-center justify-center">
                    <div style={{borderColor: theme.colors.primary}} className="w-5 h-4 border-2 rounded-sm relative">
                        <div style={{borderColor: theme.colors.primary}} className="absolute top-[-1px] left-[5px] w-[6px] h-[4px] border rounded-t-sm"></div>
                    </div>
                </div>
                <div className="text-2xl font-light tracking-wider" style={{color: theme.colors.textPrimary}}>JSI</div>
            </button>
        </div>

        {/* Right side: Greeting (on home screen) and Profile Icon */}
        <div className="flex items-center space-x-4">
             {isHome && (
                <div className="text-xl font-bold" style={{color: theme.colors.textPrimary}}>Hey, Luke!</div>
            )}
            <button onClick={onProfileClick} className="w-9 h-9 rounded-full flex items-center justify-center" style={{backgroundColor: theme.colors.subtle}}>
                <User className="w-5 h-5" style={{color: theme.colors.secondary}} />
            </button>
        </div>
    </div> 
));

const PageTitle = React.memo(({ title, theme, children }) => ( 
    <div className="px-4 pt-6 pb-4 flex justify-between items-center">
        <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight" style={{color: theme.colors.textPrimary}}>{title}</h1>
        </div>
        {children}
    </div> 
));

const FormInput = React.memo(({ type = 'text', value, onChange, placeholder, options, className = "", theme, readOnly = false }) => {
    const inputClass = `w-full px-4 py-3 border rounded-lg focus:ring-2 text-base ${readOnly ? 'opacity-70' : ''}`;
    const styles = { backgroundColor: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary, ringColor: theme.colors.accent, '--placeholder-color': theme.colors.textSecondary, };

    return (
        <div className={className}>
            {type === 'select' ? (
                <select value={value} onChange={onChange} className={inputClass} style={styles} disabled={readOnly}>
                    {options.map(opt => typeof opt === 'string' ? <option key={opt} value={opt}>{opt}</option> : <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            ) : type === 'textarea' ? (
                <textarea value={value} onChange={onChange} className={inputClass} style={styles} rows="4" placeholder={placeholder} readOnly={readOnly} />
            ) : type === 'search' ? (
                 <div className="relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{color: theme.colors.textSecondary}}/>
                     <input type="text" value={value} onChange={onChange} className={`${inputClass} pl-12`} style={styles} placeholder={placeholder} readOnly={readOnly}/>
                 </div>
            ) : (
                <input type={type} value={value} onChange={onChange} className={inputClass} style={styles} placeholder={placeholder} readOnly={readOnly}/>
            )}
        </div>
    );
});

const SearchInput = React.memo(({ onSubmit, value, onChange, placeholder, theme, className }) => ( <form onSubmit={onSubmit} className={`relative ${className}`}><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5" style={{color: theme.colors.textSecondary}} /></div><input type="text" placeholder={placeholder} value={value} onChange={onChange} className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 text-base" style={{ backgroundColor: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary, ringColor: theme.colors.accent, }}/> </form>));
const GlassCard = ({ children, className = '', theme, ...props }) => ( <div className={`rounded-2xl border shadow-lg transition-all duration-300 ${className}`} style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, boxShadow: `0 4px 30px ${theme.colors.shadow}, inset 1px 1px 1px ${theme.colors.highlight}, inset -1px -1px 1px ${theme.colors.embossShadow}`, backdropFilter: theme.backdropFilter, WebkitBackdropFilter: theme.backdropFilter, }} {...props}>{children}</div> );

// ===================================================================================
// LAYOUT COMPONENT
// ===================================================================================


const PageLayout = ({ children, theme }) => (
    <div className="h-full flex flex-col">
        {children}
    </div>
);


// ===================================================================================
// SCREEN COMPONENTS
// ===================================================================================

const HomeScreen = ({ onNavigate, theme, onAskAI, searchTerm, onSearchTermChange, showAIDropdown, aiResponse, isAILoading, onCloseAIDropdown }) => { 
    const handleSearch = (e) => { 
        e.preventDefault(); 
        onAskAI(searchTerm);
    }; 
    return ( 
        <div className="flex-1 overflow-y-auto scrollbar-hide rounded-t-[40px] -mt-8 pt-8" style={{backgroundColor: theme.colors.background}}>
            <div className="px-4 pt-4 pb-4 relative z-10">
                <SearchInput placeholder="Ask me anything..." theme={theme} value={searchTerm} onChange={(e) => onSearchTermChange(e.target.value)} onSubmit={handleSearch}/>
                {showAIDropdown && (
                    <GlassCard theme={theme} className="absolute top-full w-full mt-2 p-4">
                       {isAILoading ? (
                            <div className="flex items-center justify-center p-4">
                                <Hourglass className="w-6 h-6 animate-spin" style={{color: theme.colors.accent}}/>
                                <p className="ml-3" style={{color: theme.colors.textPrimary}}>Thinking...</p>
                            </div>
                        ) : (
                            <p style={{color: theme.colors.textPrimary}}>{aiResponse}</p>
                        )}
                    </GlassCard>
                )}
            </div>
            <div className="px-4 grid grid-cols-2 gap-4">{MENU_ITEMS.map((item) => ( <GlassCard key={item.id} theme={theme} className="p-4 flex flex-col items-start justify-end h-36 hover:border-white/50 cursor-pointer" onClick={() => onNavigate(item.id)}><item.icon className="w-7 h-7 mb-2" style={{color: theme.colors.accent}} strokeWidth={2} /><span className="text-lg font-semibold tracking-tight" style={{color: theme.colors.textPrimary}}>{item.label}</span></GlassCard>))}</div>
            <div className="p-4 mt-2"><GlassCard theme={theme} className="p-1"><button onClick={() => onNavigate('feedback')} className="w-full p-3 rounded-xl flex items-center justify-center"><MessageSquare className="w-6 h-6 mr-3" style={{color: theme.colors.accent}} strokeWidth={2}/><span className="text-md font-semibold tracking-tight" style={{color: theme.colors.textPrimary}}>Give Feedback</span></button></GlassCard></div>
            {showAIDropdown && (<div className="absolute inset-0 bg-transparent z-0" onClick={onCloseAIDropdown} />)}
        </div>
    ); 
};

const SalesProgressBar = ({ label, current, previous, goal, theme }) => { const currentPercentage = (current / goal) * 100; const previousPercentage = (previous / goal) * 100; return (<div><div className="flex justify-between items-baseline mb-1"><p className="font-semibold" style={{color: theme.colors.textPrimary}}>{label}</p></div><div className="relative w-full h-2 rounded-full mb-1" style={{backgroundColor: theme.colors.subtle}}><div className="h-2 rounded-full" style={{width: `${currentPercentage}%`, backgroundColor: theme.colors.accent}}></div><div className="absolute top-[-4px] h-4 w-0.5" style={{ left: `${previousPercentage}%`, backgroundColor: theme.colors.secondary }}><span className="absolute -top-4 -translate-x-1/2 text-xs font-mono" style={{color: theme.colors.secondary}}>2024</span></div></div><p className="text-sm font-semibold" style={{color: theme.colors.textSecondary}}>${current.toLocaleString()}</p></div>) };
const DonutChart = ({ data, theme }) => { const total = data.reduce((acc, item) => acc + item.value, 0); if (total === 0) return null; let cumulative = 0; const size = 150; const strokeWidth = 20; const radius = (size - strokeWidth) / 2; const circumference = 2 * Math.PI * radius; return (<div className="flex items-center space-x-4"><div className="relative" style={{width: size, height: size}}><svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={theme.colors.subtle} strokeWidth={strokeWidth} /><g transform={`rotate(-90 ${size/2} ${size/2})`}>{data.map((item, index) => { const dasharray = (circumference * item.value) / total; const dashoffset = circumference * (1 - (cumulative / total)); cumulative += item.value; return (<circle key={index} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={item.color} strokeWidth={strokeWidth} strokeDasharray={`${dasharray} ${circumference}`} strokeDashoffset={-circumference + dashoffset}/>)})}</g></svg></div><div className="space-y-2">{data.map(item => (<div key={item.label} className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: item.color}}></div><div><p className="text-sm font-semibold" style={{color: theme.colors.textPrimary}}>{item.label}</p><p className="text-xs" style={{color: theme.colors.textSecondary}}>${item.value.toLocaleString()}</p></div></div>))}</div></div>); };

const MonthlyBarChart = ({ data, theme }) => {
    const maxVal = Math.max(...data.flatMap(d => [d.bookings, d.sales]));
    return (
        <div>
            <div className="flex justify-end space-x-4 mb-2 text-xs font-semibold">
                <div className="flex items-center"><div className="w-3 h-3 rounded-sm mr-1.5" style={{backgroundColor: theme.colors.secondary}}></div><span style={{color: theme.colors.textSecondary}}>Bookings</span></div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-sm mr-1.5" style={{backgroundColor: theme.colors.accent}}></div><span style={{color: theme.colors.textSecondary}}>Sales</span></div>
            </div>
            <div className="flex justify-between h-40">
                {data.map(month => (
                    <div key={month.month} className="flex flex-col items-center justify-end w-full">
                         <div className="flex w-full h-full items-end justify-center space-x-1">
                             <div className="w-1/2 rounded-t-md" style={{height: `${(month.bookings / maxVal) * 100}%`, backgroundColor: theme.colors.secondary}}></div>
                             <div className="w-1/2 rounded-t-md" style={{height: `${(month.sales / maxVal) * 100}%`, backgroundColor: theme.colors.accent}}></div>
                         </div>
                         <p className="text-xs font-bold mt-2" style={{color: theme.colors.textSecondary}}>{month.month}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

const MonthlyTable = ({ data, theme, totalBookings, totalSales }) => (
    <div className="space-y-3">
        <div className="grid grid-cols-3 items-center text-xs font-bold" style={{color: theme.colors.textSecondary}}>
            <p></p>
            <p className="text-right">Bookings</p>
            <p className="text-right">Sales</p>
        </div>
        {data.map(month => (
            <div key={month.month} className="grid grid-cols-3 items-center text-sm">
                <p className="font-semibold" style={{color: theme.colors.textPrimary}}>{month.month}</p>
                <p className="text-right" style={{color: theme.colors.textSecondary}}>${month.bookings.toLocaleString()}</p>
                <p className="text-right font-semibold" style={{color: theme.colors.accent}}>${month.sales.toLocaleString()}</p>
            </div>
        ))}
        <div className="grid grid-cols-3 items-center text-sm font-bold border-t pt-2" style={{borderColor: theme.colors.border}}>
            <p style={{color: theme.colors.textPrimary}}>Total</p>
            <p className="text-right" style={{color: theme.colors.textSecondary}}>${totalBookings.toLocaleString()}</p>
            <p className="text-right" style={{color: theme.colors.accent}}>${totalSales.toLocaleString()}</p>
        </div>
    </div>
);

const SalesScreen = ({ onHomeClick, theme, onProfileClick, onNavigate }) => { 
    const [monthlyView, setMonthlyView] = useState('table');
    const totalBookings = MONTHLY_SALES_DATA.reduce((acc, month) => acc + month.bookings, 0);
    const totalSales = MONTHLY_SALES_DATA.reduce((acc, month) => acc + month.sales, 0);
    const goal = 7000000;
    const percentToGoal = (totalBookings / goal) * 100;

    return (
        <>
            <PageTitle title="Sales Dashboard" theme={theme}/>
            <div className="px-4 space-y-4 pb-4">
                 <GlassCard theme={theme} className="p-4">
                    <p className="text-sm font-semibold" style={{color: theme.colors.textSecondary}}>Progress to Goal</p>
                    <p className="text-4xl font-bold my-2" style={{color: theme.colors.accent}}>{percentToGoal.toFixed(1)}%</p>
                    <div className="relative w-full h-2.5 rounded-full" style={{backgroundColor: theme.colors.subtle}}>
                        <div className="h-2.5 rounded-full" style={{width: `${percentToGoal}%`, backgroundColor: theme.colors.accent}}></div>
                    </div>
                </GlassCard>
                <GlassCard theme={theme} className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <p className="text-sm font-semibold" style={{color: theme.colors.textSecondary}}>Bookings</p>
                            <p className="text-2xl font-bold" style={{color: theme.colors.textPrimary}}>${(totalBookings/1000000).toFixed(2)}M</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold" style={{color: theme.colors.textSecondary}}>Backlog</p>
                            <p className="text-2xl font-bold" style={{color: theme.colors.textPrimary}}>$1.43M</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard theme={theme} className="p-4"><div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg" style={{color: theme.colors.textPrimary}}>Monthly Performance</h3><button onClick={() => setMonthlyView(v => v === 'chart' ? 'table' : 'chart')} className="p-1.5 rounded-md" style={{backgroundColor: theme.colors.subtle}}>{monthlyView === 'chart' ? <List className="w-4 h-4" style={{color: theme.colors.secondary}}/> : <BarChart2 className="w-4 h-4" style={{color: theme.colors.secondary}}/>}</button></div>{monthlyView === 'chart' ? <MonthlyBarChart data={MONTHLY_SALES_DATA} theme={theme} /> : <MonthlyTable data={MONTHLY_SALES_DATA} theme={theme} totalBookings={totalBookings} totalSales={totalSales} />}</GlassCard>
                <GlassCard theme={theme} className="p-4"><h3 className="font-bold text-lg mb-4" style={{color: theme.colors.textPrimary}}>Verticals Breakdown</h3><DonutChart data={SALES_VERTICALS_DATA} theme={theme}/></GlassCard>
                <GlassCard theme={theme} className="p-1"><button onClick={() => onNavigate('customer-rank')} className="w-full p-3 rounded-xl flex items-center justify-between"><span className="text-md font-semibold tracking-tight" style={{color: theme.colors.textPrimary}}>View Customer Rank</span><ArrowRight className="w-5 h-5" style={{color: theme.colors.secondary}} /></button></GlassCard>
                <GlassCard theme={theme} className="p-1"><button onClick={() => alert("Viewing Commissions page...")} className="w-full p-3 rounded-xl flex items-center justify-between"><span className="text-md font-semibold tracking-tight" style={{color: theme.colors.textPrimary}}>View Commissions</span><ArrowRight className="w-5 h-5" style={{color: theme.colors.secondary}} /></button></GlassCard>
            </div>
        </>
    );
};
const OrdersScreen = ({ onHomeClick, theme, onProfileClick, setSelectedOrder }) => { const [searchTerm, setSearchTerm] = useState(''); const filteredOrders = useMemo(() => ORDER_DATA.filter(order => order.company.toLowerCase().includes(searchTerm.toLowerCase()) || (order.details && order.details.toLowerCase().includes(searchTerm.toLowerCase())) || order.orderNumber.includes(searchTerm)), [searchTerm]); const groupedOrders = useMemo(() => { return filteredOrders.reduce((acc, order) => { const date = order.date || 'No Date'; if (!acc[date]) { acc[date] = { orders: [], total: 0 }; } acc[date].orders.push(order); if(order.amount) { acc[date].total += parseFloat(order.amount.replace(/[^0-9.-]+/g,"")); } return acc; }, {}); }, [filteredOrders]); 
    return (
        <>
            <PageTitle title="Orders" theme={theme}/>
            <div className="px-4 pb-4"><SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by company, details..." theme={theme} /></div>
            <div className="px-4 space-y-4 pb-4">{Object.entries(groupedOrders).map(([date, group]) => (<div key={date}>{date !== 'No Date' && (<div className="flex justify-between items-center mb-2 px-1"><p className="font-bold" style={{color: theme.colors.textPrimary}}>{date}</p><p className="font-bold text-lg" style={{color: theme.colors.accent}}>${group.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p></div>)}<div className="space-y-3">{group.orders.map((order) => (<GlassCard key={order.orderNumber} theme={theme} className="overflow-hidden cursor-pointer" onClick={() => setSelectedOrder(order)}><div className="p-4 flex justify-between items-center"><div><p className="font-semibold" style={{color: theme.colors.textPrimary}}>{order.details || order.company}</p><p className="text-sm" style={{color: theme.colors.textSecondary}}>#{order.orderNumber}</p></div>{order.amount && <p className="font-semibold text-lg" style={{color: theme.colors.textPrimary}}>{order.amount}</p>}</div></GlassCard>))}</div></div>))}</div>
        </>
    ); 
};
const LeadTimesScreen = ({ onHomeClick, theme, onProfileClick }) => ( 
    <>
        <PageTitle title="Lead Times" theme={theme} />
        <div className="px-4 space-y-3 pb-4">
            {LEAD_TIMES_DATA.map(item => (
                <GlassCard key={item.series} theme={theme} className="p-4">
                    <h3 className="font-bold text-lg mb-2" style={{color: theme.colors.textPrimary}}>{item.series}</h3>
                    <div className="flex space-x-6">
                        {item.products.map(product => (
                            <div key={product.type} className="text-center">
                                <p className="font-bold text-3xl" style={{color: theme.colors.accent}}>{product.weeks}</p>
                                <p className="text-sm" style={{color: theme.colors.textSecondary}}>{product.type}</p>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            ))}
             <p className="text-xs text-center p-4" style={{color: theme.colors.textSecondary}}>Custom items will add an additional two weeks to standard lead time.</p>
        </div>
    </>
);
const ReplacementsScreen = ({ onHomeClick, theme, onProfileClick }) => { const [scannedData, setScannedData] = useState(null); const [notes, setNotes] = useState(''); const [isScanning, setIsScanning] = useState(false); const handleScan = () => { setIsScanning(true); setTimeout(() => { setScannedData({ so: 'SO-450080', lineItem: '001' }); setIsScanning(false); }, 1500); }; 
    return (
        <>
            <PageTitle title="Request Replacement" theme={theme}/>
            <div className="px-4 pb-4 space-y-4">
                <GlassCard theme={theme} className="p-4">
                    {!scannedData && (<button onClick={handleScan} disabled={isScanning} className="w-full flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed transition-colors" style={{borderColor: theme.colors.accent, color: theme.colors.accent}}><Camera className={`w-12 h-12 mb-2 ${isScanning ? 'animate-pulse' : ''}`}/><span className="font-semibold">{isScanning ? 'Scanning...' : 'Scan QR Code'}</span></button>)}
                    <div className="space-y-4">
                        <FormInput label="Sales Order (SO)" value={scannedData?.so || ''} readOnly theme={theme}/>
                        <FormInput label="Line Item" value={scannedData?.lineItem || ''} readOnly theme={theme}/>
                        <FormInput label="Notes" type="textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Describe the issue..." theme={theme} readOnly={!scannedData}/>
                    </div>
                </GlassCard>
                <button className="w-full font-bold py-3 px-6 rounded-lg transition-colors" style={{backgroundColor: theme.colors.accent, color: '#FFFFFF'}} onClick={() => alert('Replacement Request Submitted (Demo)')} disabled={!scannedData}>Submit Request</button>
            </div>
        </> 
    ); 
};
const FeedbackScreen = ({ onHomeClick, theme, onProfileClick }) => { const [subject, setSubject] = useState(''); const [message, setMessage] = useState(''); 
    return (
        <>
            <PageTitle title="Feedback" theme={theme} />
            <div className="px-4 pb-4 space-y-4">
                <FormInput label="Subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Feature Request" theme={theme}/>
                <FormInput label="Message" type="textarea" value={message} onChange={e => setMessage(e.target.value)} placeholder="Your detailed feedback..." theme={theme} />
                <button className="w-full font-bold py-3 px-6 rounded-lg transition-colors" style={{backgroundColor: theme.colors.accent, color: '#FFFFFF'}} onClick={() => alert('Feedback Submitted (Demo)')}>Submit Feedback</button>
            </div>
        </> 
    )
};
const ProjectsScreen = ({ onHomeClick, setShowNewOpportunityModal, theme, onProfileClick }) => { const [projectsTab, setProjectsTab] = useState('pipeline'); const [selectedPipelineStage, setSelectedPipelineStage] = useState('Discovery'); const filteredOpportunities = useMemo(() => INITIAL_OPPORTUNITIES.filter(opp => opp.stage === selectedPipelineStage), [selectedPipelineStage]); 
    return (
        <>
            <PageTitle title="Projects" theme={theme}>
                <button onClick={() => setShowNewOpportunityModal(true)} className="p-2 rounded-full -mr-2" style={{backgroundColor: theme.colors.accent}}>
                    <Plus className="w-5 h-5 text-white" />
                </button>
            </PageTitle>
            <div className="px-4"><GlassCard theme={theme} className="p-1 flex space-x-1"><button onClick={() => setProjectsTab('pipeline')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${projectsTab === 'pipeline' ? 'shadow-sm' : ''}`} style={{backgroundColor: projectsTab === 'pipeline' ? theme.colors.surface : 'transparent', color: theme.colors.textPrimary}}>Pipeline</button><button onClick={() => setProjectsTab('my-projects')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${projectsTab === 'my-projects' ? 'shadow-sm' : ''}`} style={{backgroundColor: projectsTab === 'my-projects' ? theme.colors.surface : 'transparent', color: theme.colors.textPrimary}}>My Projects</button></GlassCard></div>
            <div className="flex space-x-2 overflow-x-auto p-4 scrollbar-hide">{STAGES.map(stage => (<button key={stage} onClick={() => setSelectedPipelineStage(stage)} className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors`} style={{backgroundColor: selectedPipelineStage === stage ? theme.colors.primary : theme.colors.subtle, color: selectedPipelineStage === stage ? theme.colors.surface : theme.colors.textSecondary}}>{stage}</button>))}</div>
            <div className="px-4 space-y-4 pb-4">{projectsTab === 'pipeline' && filteredOpportunities.map(opp => (<GlassCard key={opp.id} theme={theme} className="overflow-hidden"><div className="p-4"><div className="flex justify-between items-start"><h3 className="font-bold text-lg" style={{color: theme.colors.textPrimary}}>{opp.name}</h3><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${STAGE_COLORS[opp.stage]}`}>{opp.stage}</span></div><p className="text-sm" style={{color: theme.colors.textSecondary}}>{opp.company}</p><p className="font-semibold text-2xl my-2" style={{color: theme.colors.textPrimary}}>{opp.value}</p></div></GlassCard>))}{projectsTab === 'my-projects' && (<GlassCard theme={theme} className="p-8 text-center"><p style={{color: theme.colors.textSecondary}}>"My Projects" section coming soon.</p></GlassCard>)}</div>
        </>
    );
};

const MembersScreen = ({ theme, members, setMembers }) => {
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUser, setNewUser] = useState(EMPTY_USER);
    const [userToRemove, setUserToRemove] = useState(null);

    const admins = members.filter(m => m.role === 'Admin');
    const users = members.filter(m => m.role === 'User');
    
    // New labels order
    const orderedPermissionLabels = {
        salesData: "Sales Data",
        commissions: "Commissions",
        dealerRewards: "Dealer Rewards",
        customerRanking: "Customer Ranking",
        projects: "Projects",
        submittingReplacements: "Submitting Replacements"
    };

    const handleToggleExpand = (userId) => {
        setExpandedUserId(prev => (prev === userId ? null : userId));
    };
    
    const handleUpdateUser = (userId, field, value) => {
        setMembers(prev => prev.map(m => m.id === userId ? { ...m, [field]: value } : m));
    };

    const handleUpdateRole = (userId, newRole) => {
        setMembers(prev => prev.map(m => (m.id === userId ? { ...m, role: newRole } : m)));
        setExpandedUserId(null); // Collapse card after action
    };

    const handleConfirmRemove = (user) => {
        setUserToRemove(user);
    };
    
    const executeRemoveUser = () => {
        if(userToRemove) {
            setMembers(prev => prev.filter(m => m.id !== userToRemove.id));
            setUserToRemove(null);
            setExpandedUserId(null);
        }
    };

    const handleTogglePermission = (e, userId, permissionKey) => {
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
    };
    
    const handleAddUser = (e) => {
        e.preventDefault();
        if(newUser.firstName && newUser.lastName && newUser.email) {
            const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
            setMembers(prev => [...prev, {...newUser, id: newId}]);
            setShowAddUserModal(false);
            setNewUser(EMPTY_USER);
        } else {
            console.error("Please fill out all fields.");
        }
    };
    
    const handleNewUserChange = (field, value) => {
       let newPermissions = { ...newUser.permissions };
       if (field === 'title') {
           if (value === 'Sales') {
               newPermissions = { salesData: true, commissions: false, projects: true, customerRanking: true, dealerRewards: true, submittingReplacements: true };
           } else if (value === 'Designer') {
               newPermissions = { salesData: false, commissions: false, projects: true, customerRanking: false, dealerRewards: false, submittingReplacements: true };
           }
       }
        setNewUser(prev => ({...prev, [field]: value, permissions: newPermissions }));
    };

    const MemberCard = ({ user }) => (
        <GlassCard theme={theme} className="p-0 overflow-hidden transition-all">
            <div className="p-4 cursor-pointer" onClick={() => handleToggleExpand(user.id)}>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-bold" style={{color: theme.colors.textPrimary}}>{user.firstName} {user.lastName}</p>
                        {user.role !== 'Admin' && <p className="text-sm" style={{color: theme.colors.textSecondary}}>{user.title}</p>}
                    </div>
                     <ChevronDown className={`w-5 h-5 transition-transform ${expandedUserId === user.id ? 'rotate-180' : ''}`} style={{color: theme.colors.secondary}}/>
                </div>
            </div>
            {expandedUserId === user.id && (
                <div className="bg-black/5 dark:bg-white/5">
                    {user.role === 'User' && (
                         <div className="p-4 border-t space-y-4" style={{borderColor: theme.colors.subtle}}>
                            <FormInput 
                                type="select"
                                value={user.title}
                                onChange={(e) => handleUpdateUser(user.id, 'title', e.target.value)}
                                options={USER_TITLES.map(t => ({ value: t, label: t }))}
                                theme={theme}
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
                                            onToggle={(e) => handleTogglePermission(e, user.id, key)}
                                            theme={theme}
                                        />
                                    );
                               })}
                            </div>
                        </div>
                    )}
                     <div className="p-4 border-t space-y-3" style={{borderColor: theme.colors.subtle}}>
                         <button onClick={() => handleUpdateRole(user.id, user.role === 'Admin' ? 'User' : 'Admin')} className="w-full text-center p-2.5 rounded-lg font-semibold" style={{backgroundColor: theme.colors.accent, color: 'white'}}>
                            {user.role === 'Admin' ? 'Make User' : 'Make Admin'}
                         </button>
                         <button onClick={() => handleConfirmRemove(user)} className="w-full text-center p-2.5 rounded-lg font-semibold bg-red-500/10 text-red-500">
                           Remove User
                         </button>
                    </div>
                </div>
            )}
        </GlassCard>
    );
    
    const PermissionToggle = ({ label, isEnabled, onToggle, theme, disabled }) => {
        const titleText = disabled ? "Requires Sales Data access" : "";
        return (
            <div title={titleText} className={`flex items-center justify-between text-sm ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`} onClick={disabled ? undefined : onToggle}>
                <span style={{color: theme.colors.textSecondary}}>{label}</span>
                <div className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`} style={{backgroundColor: isEnabled ? theme.colors.accent : theme.colors.subtle}}>
                    <span className={`inline-block w-3.5 h-3.5 transform bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
            </div>
        );
    };

    return (
        <>
            <PageTitle title="Members" theme={theme}>
                <button onClick={() => setShowAddUserModal(true)} className="p-2 rounded-full" style={{backgroundColor: theme.colors.accent}}>
                    <Plus className="w-5 h-5 text-white" />
                </button>
            </PageTitle>
            <div className="px-4 space-y-6 pb-4">
                 <div>
                    <h3 className="font-bold text-xl mb-3 px-1" style={{color: theme.colors.textPrimary}}>Administrators</h3>
                    <div className="space-y-3">
                        {admins.map(member => (
                             <MemberCard key={member.id} user={member} />
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-xl mb-3 px-1" style={{color: theme.colors.textPrimary}}>Users</h3>
                    <div className="space-y-3">
                        {users.map(member => (
                            <MemberCard key={member.id} user={member} />
                        ))}
                    </div>
                </div>
            </div>
            
             <Modal show={showAddUserModal} onClose={() => setShowAddUserModal(false)} title="Add New User" theme={theme}>
                 <form onSubmit={handleAddUser} className="space-y-4">
                    <FormInput value={newUser.firstName} onChange={e => handleNewUserChange('firstName', e.target.value)} placeholder="First Name" theme={theme} />
                    <FormInput value={newUser.lastName} onChange={e => handleNewUserChange('lastName', e.target.value)} placeholder="Last Name" theme={theme} />
                    <FormInput type="email" value={newUser.email} onChange={e => handleNewUserChange('email', e.target.value)} placeholder="Email" theme={theme} />
                    <FormInput type="select" options={[{value: '', label: 'Select a Title'}, ...USER_TITLES.map(t => ({value: t, label: t}))]} value={newUser.title} onChange={e => handleNewUserChange('title', e.target.value)} theme={theme}/>
                    <div className="pt-2">
                        <button type="submit" className="w-full text-white font-bold py-3 px-6 rounded-lg transition-colors" style={{backgroundColor: theme.colors.accent}}>Create User</button>
                    </div>
                 </form>
            </Modal>
             <Modal show={!!userToRemove} onClose={() => setUserToRemove(null)} title="Remove User" theme={theme}>
                    <p style={{color: theme.colors.textPrimary}}>Are you sure you want to remove <span className="font-bold">{userToRemove?.firstName} {userToRemove?.lastName}</span>?</p>
                    <p className="text-sm" style={{color: theme.colors.textSecondary}}>This action is permanent and will delete the user from the MyJSI app.</p>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button onClick={() => setUserToRemove(null)} className="font-bold py-2 px-5 rounded-lg" style={{backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary}}>Cancel</button>
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

    const requestSort = (key) => {
        let direction = 'descending';
        if (sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = 'ascending';
        }
        setSortConfig({ key, direction });
    };
    
    const handleOpenModal = (customer) => {
        setModalData(customer);
    };

    const handleCloseModal = () => {
        setModalData(null);
    };

    const getTrophyColor = (index) => {
        if (sortConfig.direction === 'descending') {
            if (index === 0) return '#FFD700'; // Gold
            if (index === 1) return '#C0C0C0'; // Silver
            if (index === 2) return '#CD7F32'; // Bronze
        }
        return 'transparent'; // No color for others
    };

    const SortableHeader = ({ sortKey, children }) => {
        const isSorted = sortConfig.key === sortKey;
        const textStyle = {
            fontWeight: isSorted ? 'bold' : 'normal',
            textDecoration: isSorted ? 'underline' : 'none',
        };
        const SortIcon = sortConfig.direction === 'ascending' ? ChevronUp : ChevronDown;

        return (
            <div className="flex items-center justify-end cursor-pointer" onClick={() => requestSort(sortKey)} >
                {isSorted && <SortIcon className="w-4 h-4 mr-1"/>}
                <span style={textStyle}>{children}</span>
            </div>
        )
    };
    
    const topThree = sortedCustomers.slice(0, 3);
    const theRest = sortedCustomers.slice(3);


    return (
        <>
            <PageTitle title="Customer Ranking" theme={theme} />
            <div className="px-4 pb-4 space-y-6">
                
                {/* Podium Section */}
                <div className="flex items-end justify-center space-x-2">
                    {/* 2nd Place */}
                    {topThree[1] && (
                        <div className="text-center w-1/4">
                             <Trophy className="mx-auto w-8 h-8" fill="#C0C0C0" color="#A0A0A0"/>
                             <p className="font-bold text-sm truncate" style={{color: theme.colors.textPrimary}}>{topThree[1].name}</p>
                             <p className="text-xs" style={{color: theme.colors.textSecondary}}>${topThree[1][sortConfig.key].toLocaleString()}</p>
                        </div>
                    )}
                     {/* 1st Place */}
                    {topThree[0] && (
                        <div className="text-center w-1/3 order-first sm:order-none">
                            <Trophy className="mx-auto w-10 h-10" fill="#FFD700" color="#D4B37F"/>
                            <p className="font-bold text-md truncate" style={{color: theme.colors.textPrimary}}>{topThree[0].name}</p>
                            <p className="text-sm font-semibold" style={{color: theme.colors.accent}}>${topThree[0][sortConfig.key].toLocaleString()}</p>
                        </div>
                    )}
                     {/* 3rd Place */}
                    {topThree[2] && (
                         <div className="text-center w-1/4">
                             <Trophy className="mx-auto w-8 h-8" fill="#CD7F32" color="#A9886C"/>
                             <p className="font-bold text-sm truncate" style={{color: theme.colors.textPrimary}}>{topThree[2].name}</p>
                             <p className="text-xs" style={{color: theme.colors.textSecondary}}>${topThree[2][sortConfig.key].toLocaleString()}</p>
                        </div>
                    )}
                </div>

                {/* Leaderboard List */}
                <GlassCard theme={theme} className="p-4">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-2 text-sm font-bold pb-2 border-b" style={{borderColor: theme.colors.subtle, color: theme.colors.textSecondary}}>
                        <div className="col-span-1">#</div>
                        <div className="col-span-5">Name</div>
                        <div className="col-span-3"><SortableHeader sortKey="bookings">Bookings</SortableHeader></div>
                        <div className="col-span-3"><SortableHeader sortKey="sales">Sales</SortableHeader></div>
                    </div>
                    {/* Body */}
                    <div className="space-y-1 pt-2">
                        {theRest.map((customer, index) => (
                            <div key={customer.id} className="grid grid-cols-12 gap-2 items-center text-sm p-2 rounded-lg cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{backgroundColor: index % 2 === 1 ? 'rgba(0,0,0,0.03)' : 'transparent'}} onClick={() => handleOpenModal(customer)}>
                                <div className="col-span-1 font-semibold" style={{color: theme.colors.textSecondary}}>{index + 4}</div>
                                <div className="col-span-5 font-semibold truncate" style={{color: theme.colors.textPrimary}}>{customer.name}</div>
                                <div className="col-span-3 text-right font-mono" style={{color: theme.colors.textSecondary}}>${customer.bookings.toLocaleString()}</div>
                                <div className="col-span-3 text-right font-mono font-semibold" style={{color: theme.colors.accent}}>
                                    ${customer.sales.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
            
            <Modal show={!!modalData} onClose={handleCloseModal} title="" theme={theme}>
                <div className="space-y-3">
                    {modalData?.orders.length > 0 ? modalData.orders.map((order, index) => (
                        <div key={index} className="flex justify-between items-center text-sm border-b pb-2" style={{borderColor: theme.colors.subtle}}>
                            <span style={{color: theme.colors.textPrimary}}>{order.projectName}</span>
                            <span className="font-semibold" style={{color: theme.colors.accent}}>${order.amount.toLocaleString()}</span>
                        </div>
                    )) : (
                        <p style={{color: theme.colors.textSecondary}}>No specific orders to display for this total.</p>
                    )}
                </div>
                 <div className="text-right font-bold pt-3 border-t mt-3" style={{borderColor: theme.colors.border, color: theme.colors.textPrimary}}>
                    Total: ${modalData?.sales.toLocaleString()}
                </div>
            </Modal>
        </>
    );
};


const SamplesScreen = ({ onHomeClick, theme, onProfileClick, onNavigate, cart, onUpdateCart, onSetCart }) => {
    const [selectedCategory, setSelectedCategory] = useState('veneer');
    const handleUpdateCart = (item, change) => { onUpdateCart(item, change); };
    const addCategoryToCart = (category) => { const categoryItems = SAMPLE_PRODUCTS.filter(p => p.category === category); const newCart = {...cart}; categoryItems.forEach(item => { if (!newCart[item.id]) { newCart[item.id] = 1; } }); onSetCart(newCart); };
    const filteredProducts = SAMPLE_PRODUCTS.filter(p => p.category === selectedCategory);
    const totalCartItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

    return (
        <>
            <PageTitle title="Samples" theme={theme}>
                <div className="relative">
                    <button onClick={() => onNavigate('samples/cart')} className="p-2 rounded-full"><ShoppingCart className="w-7 h-7" style={{color: theme.colors.textPrimary}} /></button>
                    {totalCartItems > 0 && <div className="absolute -top-1 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{backgroundColor: theme.colors.accent}}>{totalCartItems}</div>}
                </div>
            </PageTitle>
            <div className="px-4 space-y-2 pb-4">
                <p className="text-sm font-semibold" style={{color: theme.colors.textSecondary}}>FULL SETS</p>
                <div className="flex flex-wrap gap-2">
                    {SAMPLE_CATEGORIES.map(cat => {
                        const count = Object.keys(cart).filter(id => SAMPLE_PRODUCTS.find(p=>p.id == id)?.category === cat.id).length;
                        return (<button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-2 text-sm font-semibold rounded-lg relative transition-colors ${selectedCategory === cat.id ? 'text-white' : ''}`} style={{backgroundColor: selectedCategory === cat.id ? theme.colors.primary : theme.colors.subtle, color: selectedCategory === cat.id ? theme.colors.surface : theme.colors.textSecondary}}>
                            {cat.name}
                            {count > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{backgroundColor: theme.colors.accent}}>{count}</div>}
                        </button>)
                    })}
                </div>
                <GlassCard theme={theme} className="p-1 w-full mt-2"><button onClick={() => addCategoryToCart(selectedCategory)} className="w-full p-3 rounded-xl flex items-center justify-center"><span className="text-md font-semibold tracking-tight" style={{color: theme.colors.textPrimary}}>Add Complete Set</span></button></GlassCard>
            </div>
            <div className="px-4 grid grid-cols-2 gap-4 pb-4">
                {filteredProducts.map(product => {
                    const quantity = cart[product.id] || 0;
                    return (<div key={product.id} className="text-center">
                        <GlassCard theme={theme} className="relative aspect-square w-full rounded-2xl p-1" style={{borderColor: quantity > 0 ? theme.colors.accent : 'transparent', borderWidth: '2px'}}>
                            <div className="w-full h-full rounded-xl" style={{backgroundColor: product.color}}></div>
                             {quantity === 0 ? (
                                 <button onClick={() => handleUpdateCart(product, 1)} className="absolute inset-0"></button>
                            ) : (
                                 <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24">
                                     <GlassCard theme={theme} className="p-1 flex justify-between items-center">
                                         <button onClick={() => handleUpdateCart(product, -1)} className="w-7 h-7 flex items-center justify-center rounded-md" style={{backgroundColor: theme.colors.subtle}}><Minus className="w-4 h-4" style={{color: theme.colors.textSecondary}} /></button>
                                         <span className="font-bold text-lg" style={{color: theme.colors.textPrimary}}>{quantity}</span>
                                         <button onClick={() => handleUpdateCart(product, 1)} className="w-7 h-7 flex items-center justify-center rounded-md" style={{backgroundColor: theme.colors.subtle}}><Plus className="w-4 h-4" style={{color: theme.colors.textSecondary}} /></button>
                                     </GlassCard>
                                 </div>
                            )}
                        </GlassCard>
                        <p className="mt-2 font-semibold text-sm" style={{color: theme.colors.textPrimary}}>{product.name}</p>
                    </div>)
                })}
            </div>
        </>
    );
};

const CartScreen = ({ theme, onNavigate, onBack, cart, setCart }) => {
    const [address, setAddress] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
   
    const handleSubmit = () => {
        setIsSubmitted(true);
        setTimeout(() => {
            setCart({});
            onNavigate('home');
        }, 2000);
    }
   
    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <GlassCard theme={theme} className="p-8 flex flex-col items-center justify-center">
                    <CheckCircle className="w-16 h-16 mb-4" style={{color: theme.colors.accent}}/>
                    <h2 className="text-2xl font-bold" style={{color: theme.colors.textPrimary}}>Ordered!</h2>
                </GlassCard>
            </div>
        )
    }

    return (
        <>
            <PageTitle title="Cart" theme={theme} onBack={onBack} />
            <div className="px-4 space-y-4 pb-4">
                <GlassCard theme={theme} className="p-4 space-y-2">
                    <h3 className="font-bold" style={{color: theme.colors.textPrimary}}>Selected Samples</h3>
                    {Object.keys(cart).length > 0 ? Object.entries(cart).map(([id, quantity]) => {
                        const product = SAMPLE_PRODUCTS.find(p => p.id == id)
                        return (
                            <div key={id} className="flex justify-between items-center text-sm">
                                <span style={{color: theme.colors.textPrimary}}>{product.name}</span>
                                <span style={{color: theme.colors.textSecondary}}>x {quantity}</span>
                            </div>
                        )
                    }) : <p className="text-sm" style={{color: theme.colors.textSecondary}}>Your cart is empty.</p>}
                </GlassCard>
                <GlassCard theme={theme} className="p-4 space-y-2">
                     <h3 className="font-bold" style={{color: theme.colors.textPrimary}}>Ship To</h3>
                     <div className="relative">
                         <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows="3" placeholder="Search Address..." className="w-full p-2 pr-10 border rounded-lg" style={{backgroundColor: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary}}></textarea>
                         <button onClick={() => setAddress(HOME_ADDRESS)} className="absolute top-2 right-2 p-1 rounded-full" style={{backgroundColor: theme.colors.surface}}><Home className="w-5 h-5" style={{color: theme.colors.secondary}}/></button>
                     </div>
                </GlassCard>
                <button onClick={handleSubmit} disabled={Object.keys(cart).length === 0 || !address.trim()} className="w-full font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50" style={{backgroundColor: theme.colors.accent, color: '#FFFFFF'}}>Submit</button>
            </div>
        </>
    );
};

const ResourcesScreen = ({ onHomeClick, theme, onProfileClick, onNavigate, currentScreen }) => {
    const subScreen = currentScreen.split('/')[1];
   
    return (
        <>
            {subScreen ? (
                <ResourceDetailScreen category={subScreen.replace(/_/g, ' ')} theme={theme} onNavigate={onNavigate} />
            ) : (
                <>
                    <PageTitle title="Resources" theme={theme} />
                    <div className="px-4 space-y-3 pb-4">
                        {RESOURCES_CATEGORIES.map(category => (
                            <GlassCard key={category} theme={theme} className="p-1">
                                <button onClick={() => onNavigate(`resources/${category.toLowerCase().replace(/ /g, '_')}`)} className="w-full p-3 rounded-xl flex items-center justify-between">
                                    <span className="text-md font-semibold tracking-tight" style={{color: theme.colors.textPrimary}}>{category}</span>
                                    <ArrowRight className="w-5 h-5" style={{color: theme.colors.secondary}} />
                                </button>
                            </GlassCard>
                        ))}
                    </div>
                </>
            )}
        </>
    );
};

const ResourceDetailScreen = ({ category, theme, onNavigate }) => {
    if (category === 'loaner pool') {
        return <LoanerPoolScreen theme={theme} onNavigate={onNavigate} />;
    }
    if (category === 'commission rates') {
        return <CommissionRatesScreen theme={theme} onNavigate={onNavigate} />;
    }
    if (category === 'contracts') {
        return <ContractsScreen theme={theme} onNavigate={onNavigate} />;
    }
    if (category === 'dealer registration') {
        return <DealerRegistrationScreen theme={theme} onNavigate={onNavigate} />;
    }
    if (category === 'discontinued finishes') {
        return <DiscontinuedFinishesScreen theme={theme} onNavigate={onNavigate} />;
    }
    return (<div className="px-4 pb-4">
        <PageTitle title={category.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())} theme={theme} />
        <GlassCard theme={theme} className="p-8 text-center"><p style={{ color: theme.colors.textPrimary }}>Content for {category} will be available soon.</p></GlassCard>
    </div>)
};

const CommissionRatesScreen = ({ theme }) => {
    const AccordionItem = ({ title, data }) => {
        const [isOpen, setIsOpen] = useState(true);

        return (
            <GlassCard theme={theme} className="p-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex justify-between items-center"
                >
                    <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{title}</h3>
                    <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: theme.colors.secondary }} />
                </button>
                {isOpen && (
                    <div className="mt-3 space-y-2 text-sm">
                         <div className="grid grid-cols-3 gap-2 font-bold" style={{color: theme.colors.textSecondary}}>
                            <p>Discounts</p>
                            <p className="text-center">Rep Comm.</p>
                            <p className="text-right">Spiff</p>
                        </div>
                        {data.map((row, index) => (
                            <div key={index} className="grid grid-cols-3 gap-2 items-center border-t pt-2" style={{borderColor: theme.colors.subtle}}>
                                <p className="font-semibold" style={{color: theme.colors.textPrimary}}>{row.discount}</p>
                                <p className="text-center text-lg font-bold" style={{color: theme.colors.accent}}>{row.rep}</p>
                                <div className="text-right">
                                    {typeof row.spiff === 'object' ? (
                                        <>
                                            <p className="font-semibold" style={{color: theme.colors.textPrimary}}>{row.spiff.value}</p>
                                            <p className="text-xs" style={{color: theme.colors.textSecondary}}>{row.spiff.note}</p>
                                        </>
                                    ) : (
                                        <p className="font-semibold" style={{color: theme.colors.textPrimary}}>{row.spiff}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>
        );
    };

    const CommissionSplitVisual = ({ data }) => (
        <GlassCard theme={theme} className="p-4">
             <h3 className="font-bold text-lg mb-3" style={{color: theme.colors.textPrimary}}>Commission Split</h3>
             <div className="w-full flex h-8 rounded-lg overflow-hidden">
                <div className="flex items-center justify-center" style={{width: `${data[0].percentage}%`, backgroundColor: theme.colors.accent}}>
                    <span className="font-bold text-white text-sm">{data[0].percentage}%</span>
                </div>
                 <div className="flex items-center justify-center" style={{width: `${data[1].percentage}%`, backgroundColor: theme.colors.subtle}}>
                    <span className="font-bold text-sm" style={{color: theme.colors.textPrimary}}>{data[1].percentage}%</span>
                </div>
             </div>
             <div className="flex justify-between mt-2 text-sm">
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: theme.colors.accent}}></div>
                    <span style={{color: theme.colors.textSecondary}}>{data[0].territory}</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: theme.colors.subtle}}></div>
                    <span style={{color: theme.colors.textSecondary}}>{data[1].territory}</span>
                </div>
             </div>
        </GlassCard>
    );

    return (
        <div className="px-4 pb-4 space-y-6">
            <PageTitle title="Commission" theme={theme} />
            <CommissionSplitVisual data={COMMISSION_DATA.split} theme={theme} />
            <AccordionItem title="Standard Rates" data={COMMISSION_DATA.standard} theme={theme} />
            <AccordionItem title="Contract Rates" data={COMMISSION_DATA.contract} theme={theme} />
        </div>
    );
};

const ContractsScreen = ({ theme }) => {
    const ContractCard = ({ contract }) => (
        <GlassCard theme={theme} className="p-4 flex flex-col space-y-3">
            <h2 className="text-3xl font-bold" style={{ color: theme.colors.textPrimary }}>{contract.name}</h2>
            <div className="text-sm space-y-2">
                {contract.tiers.map((tier, i) => (
                    <div key={i} className="border-t pt-2" style={{borderColor: theme.colors.subtle}}>
                        <p className="font-bold" style={{color: theme.colors.textPrimary}}>{tier.off}</p>
                        <ul className="list-disc list-inside pl-2" style={{color: theme.colors.textSecondary}}>
                            <li>{tier.dealer}</li>
                            <li>{tier.rep}</li>
                        </ul>
                    </div>
                ))}
            </div>
            {contract.margin && (
                 <div className="text-sm border-t pt-2" style={{borderColor: theme.colors.subtle}}>
                    <p className="font-bold" style={{color: theme.colors.textPrimary}}>Dealer margin discount:</p>
                     {contract.margin.map((m, i) => <p key={i} style={{color: theme.colors.textSecondary}}>{m}</p>)}
                </div>
            )}
            {contract.note && <p className="text-sm" style={{color: theme.colors.textSecondary}}>{contract.note}</p>}

            <div className="pt-2">
                <button 
                    onClick={() => window.open(contract.url, '_blank')}
                    className="w-full font-bold py-2.5 px-5 rounded-lg transition-colors text-white" 
                    style={{backgroundColor: theme.colors.accent}}
                >
                    Link to Contract
                </button>
            </div>
        </GlassCard>
    );

    return (
         <div className="px-4 pb-4 space-y-6">
            <PageTitle title="Contracts" theme={theme} />
            <ContractCard contract={CONTRACTS_DATA.omnia} />
            <ContractCard contract={CONTRACTS_DATA.tips} />
            <ContractCard contract={CONTRACTS_DATA.premier} />
        </div>
    );
};

const DealerRegistrationScreen = ({ theme, onNavigate }) => {
    const [dealerName, setDealerName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [dailyDiscount, setDailyDiscount] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (dealerName && adminEmail && dailyDiscount) {
            setIsSubmitted(true);
            setTimeout(() => {
                onNavigate('home');
            }, 1500);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <GlassCard theme={theme} className="p-8 flex flex-col items-center justify-center">
                    <CheckCircle className="w-16 h-16 mb-4" style={{color: theme.colors.accent}}/>
                    <h2 className="text-2xl font-bold" style={{color: theme.colors.textPrimary}}>Submitted!</h2>
                </GlassCard>
            </div>
        );
    }
   
    return (
        <div className="px-4 pb-4">
            <PageTitle title="Dealer Registration" theme={theme} />
            <form onSubmit={handleSubmit} className="space-y-6">
                <GlassCard theme={theme} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{color: theme.colors.textSecondary}}>Dealer Name</label>
                        <FormInput value={dealerName} onChange={(e) => setDealerName(e.target.value)} placeholder="Enter dealer name" theme={theme} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{color: theme.colors.textSecondary}}>Admin Email</label>
                        <FormInput type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="Enter admin email" theme={theme} />
                    </div>
                     <div>
                        <label className="block text-sm font-semibold mb-1" style={{color: theme.colors.textSecondary}}>Daily Discount</label>
                        <FormInput 
                            type="select" 
                            value={dailyDiscount} 
                            onChange={(e) => setDailyDiscount(e.target.value)}
                            options={[{value: '', label: 'Select Option'}, ...DAILY_DISCOUNT_OPTIONS.map(opt => ({value: opt, label: opt}))]} 
                            theme={theme}
                        />
                    </div>
                </GlassCard>
                <button 
                    type="submit"
                    className="w-full font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                    style={{backgroundColor: theme.colors.accent, color: '#FFFFFF'}}
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

    const filteredFinishes = useMemo(() => {
        if (!searchTerm.trim()) {
            return DISCONTINUED_FINISHES;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        const filtered = {};
        for (const species in DISCONTINUED_FINISHES) {
            const matches = DISCONTINUED_FINISHES[species].filter(
                finish => finish.oldName.toLowerCase().includes(lowercasedFilter) || 
                          finish.newName.toLowerCase().includes(lowercasedFilter)
            );
            if (matches.length > 0) {
                filtered[species] = matches;
            }
        }
        return filtered;
    }, [searchTerm]);

    const FinishCard = ({ finish }) => (
        <GlassCard theme={theme} className="p-4">
            <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                    <div className="w-16 h-16 mx-auto rounded-lg mb-2" style={{ backgroundColor: finish.oldColor }} />
                    <p className="font-bold" style={{ color: theme.colors.textPrimary }}>{finish.oldName}</p>
                    <p className="text-xs" style={{color: theme.colors.textSecondary}}>Veneer: {finish.veneer}</p>
                    <p className="text-xs" style={{color: theme.colors.textSecondary}}>Solid: {finish.solid}</p>
                </div>

                <div className="flex-shrink-0 px-2">
                    <ArrowRight className="w-6 h-6" style={{ color: theme.colors.secondary }} />
                </div>
               
                <div className="flex-1 text-center">
                    <div className="w-16 h-16 mx-auto rounded-lg mb-2" style={{ backgroundColor: finish.newColor }} />
                    <p className="font-bold" style={{ color: theme.colors.textPrimary }}>{finish.newName}</p>
                </div>
            </div>
        </GlassCard>
    );

    return (
        <div className="px-4 pb-4">
            <PageTitle title="Discontinued Finishes" theme={theme} />
            <div className="sticky top-[72px] bg-opacity-0 py-2">
                <SearchInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by finish name..."
                    theme={theme}
                />
            </div>
            <div className="space-y-6 pt-4">
                {Object.entries(filteredFinishes).map(([species, finishes]) => (
                    <div key={species}>
                        <h2 className="text-xl font-bold capitalize mb-2" style={{color: theme.colors.textPrimary}}>{species}</h2>
                        <div className="space-y-3">
                            {finishes.map((finish, index) => <FinishCard key={index} finish={finish} />)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProductsScreen = ({ onNavigate, theme }) => {
    return (
        <>
            <PageTitle title="Products" theme={theme} />
            <div className="space-y-4 px-4 pb-4">
                {PRODUCTS_CATEGORIES_DATA.map(category => (
                    <GlassCard key={category.name} theme={theme} className="p-4 overflow-hidden" onClick={() => onNavigate(category.nav)}>
                         <h2 className="text-2xl font-bold mb-2" style={{color: theme.colors.textPrimary}}>{category.name}</h2>
                         <div className="flex space-x-2 -mb-2">
                             {category.images.map((img, index) => (
                                 <img key={index} 
                                     src={img} 
                                     className={`rounded-md object-cover ${category.images.length === 1 && category.name !== 'Swivels' ? 'w-2/3 h-32' : 'w-16 h-16'}`} 
                                     onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100/EEE/333?text=Image+Error'; }}
                                 />
                             ))}
                         </div>
                    </GlassCard>
                ))}
            </div>
        </>
    );
};

const ProductComparisonScreen = ({ categoryId, onNavigate, theme }) => {
    const category = PRODUCT_DATA[categoryId];
    const [selectedIndex, setSelectedIndex] = useState(0);
    const scrollRef = useRef(null);

    useEffect(() => {
        if(scrollRef.current) {
            const selectedElement = scrollRef.current.children[selectedIndex];
            if(selectedElement) {
                selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [selectedIndex]);
   
    if(!category || !category.data || category.data.length === 0){
        return <PlaceholderScreen theme={theme} category={category?.title || "Products"} />
    }

    const selectedProduct = category.data[selectedIndex];
    const nextProduct = category.data[selectedIndex + 1];

    const FeatureRow = ({ label, current, next }) => (
        <GlassCard theme={theme} className="p-3">
             <p className="text-sm font-bold mb-2" style={{color: theme.colors.textSecondary}}>{label}</p>
             <div className="grid grid-cols-2 gap-4 items-center">
                 <div className="text-center">
                     <img src={current.image} className="w-16 h-16 rounded-lg mx-auto mb-1 object-cover" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100/EEE/333?text=Error'; }} />
                     <p className="text-sm font-semibold" style={{color: theme.colors.textPrimary}}>+${current.price}</p>
                 </div>
                 {next ? (
                     <div className="text-center">
                         <img src={next.image} className="w-16 h-16 rounded-lg mx-auto mb-1 object-cover" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100/EEE/333?text=Error'; }}/>
                         <p className="text-sm font-semibold" style={{color: theme.colors.textPrimary}}>+${next.price}</p>
                     </div>
                 ) : (
                     <div className="text-center h-full flex items-center justify-center">
                         <p className="text-sm" style={{color: theme.colors.textSecondary}}>N/A</p>
                     </div>
                 )}
             </div>
        </GlassCard>
    );

    return (
        <>
            <PageTitle title={category.title} theme={theme} />
            <div className="flex-1 flex flex-col">
                <div className="pl-4">
                    <div ref={scrollRef} className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4">
                        {category.data.map((product, index) => (
                            <button key={product.id} onClick={() => setSelectedIndex(index)} className={`flex-shrink-0 text-center p-2 rounded-2xl transition-all ${selectedIndex === index ? 'shadow-lg' : ''}`} style={{backgroundColor: selectedIndex === index ? theme.colors.surface : 'transparent'}}>
                                <img src={product.image} className="w-24 h-24 rounded-lg object-cover" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x150/EEE/333?text=Image+Error'; }}/>
                                <p className="font-bold mt-2" style={{color: theme.colors.textPrimary}}>{product.name}</p>
                                <p className="text-sm font-semibold" style={{color: theme.colors.accent}}>${product.listPrice.toLocaleString()}</p>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="px-4 pt-4 space-y-3">
                    {Object.keys(selectedProduct.features).map(featureKey => (
                       <FeatureRow 
                          key={featureKey} 
                          label={featureKey.charAt(0).toUpperCase() + featureKey.slice(1)} 
                          current={selectedProduct.features[featureKey]} 
                          next={nextProduct?.features[featureKey]}
                       />
                    ))}
                </div>
                 <div className="p-4 mt-auto space-y-3">
                    <GlassCard theme={theme} className="p-1">
                        <button onClick={() => onNavigate('products')} className="w-full p-3 rounded-xl flex items-center justify-center">
                            <span className="text-md font-semibold tracking-tight" style={{color: theme.colors.textPrimary}}>Other Categories</span>
                        </button>
                    </GlassCard>
                    <GlassCard theme={theme} className="p-1">
                        <button onClick={() => onNavigate(categoryId === 'casegoods' ? 'products/competitive-analysis/casegoods' : 'products/competitive-analysis')} className="w-full p-3 rounded-xl flex items-center justify-between">
                             <span className="text-md font-semibold tracking-tight" style={{color: theme.colors.textPrimary}}>Competitive Analysis</span>
                             <ArrowRight className="w-5 h-5" style={{color: theme.colors.secondary}} />
                        </button>
                    </GlassCard>
                </div>
            </div>
        </>
    );
};

const CompetitiveAnalysisScreen = ({ theme, onNavigate }) => {
    const [selectedTypical, setSelectedTypical] = useState(CASEGOODS_COMPETITIVE_DATA.typicals[0]);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [newManufacturer, setNewManufacturer] = useState('');
    const [newSeries, setNewSeries] = useState('');
    const [isRequestSubmitted, setIsRequestSubmitted] = useState(false);

    const handleRequestSubmit = (e) => {
        e.preventDefault();
        if (newManufacturer && newSeries) {
            setIsRequestSubmitted(true);
            setTimeout(() => {
                setShowRequestModal(false);
                setIsRequestSubmitted(false);
                setNewManufacturer('');
                setNewSeries('');
            }, 1000);
        }
    };
   
    return (
        <div className="px-4 pb-4">
            <PageTitle title="Vision" theme={theme} />
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-4">
                {CASEGOODS_COMPETITIVE_DATA.typicals.map(typical => (
                    <button key={typical.id} onClick={() => setSelectedTypical(typical)} className="flex-shrink-0 text-center space-y-1">
                        <img 
                           src={typical.image}
                           className={`w-20 h-20 rounded-lg object-cover border-2 ${selectedTypical.id === typical.id ? 'border-blue-500' : 'border-transparent'}`}
                           onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100/EEE/333?text=Error'; }}
                        />
                    </button>
                ))}
            </div>
            <img src={selectedTypical.image} className="w-full h-48 object-cover rounded-lg my-4" />
            <GlassCard theme={theme} className="p-4">
                <div className="grid grid-cols-3 font-bold text-sm mb-2" style={{color: theme.colors.textSecondary}}>
                    <p>Series</p>
                    <p className="text-right">TFL</p>
                    <p className="text-right">Veneer</p>
                </div>
                <div className="space-y-2">
                    {[{name: 'Vision', tfl: selectedTypical.basePrice.tfl, veneer: selectedTypical.basePrice.veneer},...CASEGOODS_COMPETITIVE_DATA.competitors].map(row => (
                        <div key={row.name} className="grid grid-cols-3 text-sm border-t pt-2" style={{borderColor: theme.colors.subtle}}>
                           <p className="font-semibold" style={{color: theme.colors.textPrimary}}>{row.name}</p>
                           <p className="text-right" style={{color: theme.colors.textPrimary}}>{row.tfl ? `$${(row.name === 'Vision' ? row.tfl : Math.round(selectedTypical.basePrice.tfl * row.tfl)).toLocaleString()}` : 'N/A'}</p>
                           <p className="text-right" style={{color: theme.colors.textPrimary}}>{row.veneer ? `$${(row.name === 'Vision' ? row.veneer : Math.round(selectedTypical.basePrice.veneer * row.veneer)).toLocaleString()}` : 'N/A'}</p>
                        </div>
                    ))}
                </div>
            </GlassCard>
            <div className="pt-4">
                <button 
                  className="w-full text-sm font-semibold p-2 rounded-lg"
                  style={{backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary}}
                  onClick={() => setShowRequestModal(true)}
                >
                    Request New
                </button>
            </div>
            <Modal show={showRequestModal} onClose={() => setShowRequestModal(false)} title="Request Competitor" theme={theme}>
                {isRequestSubmitted ? (
                    <div className="flex flex-col items-center justify-center p-4">
                        <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                        <p style={{color: theme.colors.textPrimary}}>Submitted!</p>
                    </div>
                ) : (
                    <form onSubmit={handleRequestSubmit} className="space-y-4">
                        <FormInput label="Manufacturer" value={newManufacturer} onChange={(e) => setNewManufacturer(e.target.value)} placeholder="Enter manufacturer name" theme={theme}/>
                        <FormInput label="Series" value={newSeries} onChange={(e) => setNewSeries(e.target.value)} placeholder="Enter series name" theme={theme}/>
                        <button type="submit" className="w-full font-bold py-3 px-6 rounded-lg transition-colors" style={{backgroundColor: theme.colors.accent, color: '#FFFFFF'}}>Request</button>
                    </form>
                )}
            </Modal>
        </div>
    );
};


const PlaceholderScreen = ({ theme, category }) => (
    <div className="px-4 pb-4">
        <PageTitle title={category || "Coming Soon"} theme={theme} />
        <GlassCard theme={theme} className="p-8 text-center">
            <p style={{ color: theme.colors.textPrimary }}>
                This section is under construction.
            </p>
        </GlassCard>
    </div>
);


const LoanerPoolScreen = ({ theme, onNavigate }) => {
    const [loanerSearch, setLoanerSearch] = useState('');
    const [selectedLoaners, setSelectedLoaners] = useState([]);
    const [address, setAddress] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const handleToggleLoaner = (id) => { setSelectedLoaners(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); };
    const filteredLoaners = LOANER_POOL_PRODUCTS.filter(p => p.name.toLowerCase().includes(loanerSearch.toLowerCase()) || p.model.toLowerCase().includes(loanerSearch.toLowerCase()));
   
    const handleSubmit = () => {
        setIsSubmitted(true);
        setTimeout(() => {
            onNavigate('home');
        }, 2000);
    }
   
    if (isSubmitted) {
        return (<div className="flex flex-col items-center justify-center h-full">
                <GlassCard theme={theme} className="p-8 flex flex-col items-center justify-center">
                    <CheckCircle className="w-16 h-16 mb-4" style={{color: theme.colors.accent}}/>
                    <h2 className="text-2xl font-bold" style={{color: theme.colors.textPrimary}}>Requested!</h2>
                </GlassCard>
            </div>);
    }

    return (<div>
        <PageTitle title="Loaner Pool" theme={theme}/>
        <div className="px-4 pb-4"><SearchInput value={loanerSearch} onChange={(e) => setLoanerSearch(e.target.value)} placeholder="Search product..." theme={theme}/></div>
        <div className="px-4 space-y-2 pb-4">
            <div className="grid grid-cols-3 gap-x-4 px-2 text-xs font-bold" style={{color: theme.colors.textSecondary}}><p>Name</p><p>Img</p><p className="text-right">Select</p></div>
            {filteredLoaners.map(item => (
                <GlassCard key={item.id} theme={theme} className="p-2 flex items-center justify-between">
                    <div>
                        <p className="font-bold" style={{color: theme.colors.textPrimary}}>{item.name}</p>
                        <p className="text-xs" style={{color: theme.colors.textSecondary}}>{item.model}</p>
                    </div>
                    <img src={item.img} alt={item.name} className="w-12 h-12 rounded-lg" />
                    <input type="checkbox" checked={selectedLoaners.includes(item.id)} onChange={() => handleToggleLoaner(item.id)} className="w-6 h-6 rounded-md" style={{accentColor: theme.colors.accent}}/>
                </GlassCard>
            ))}
        </div>
        <div className="px-4 space-y-4 pb-4 sticky bottom-0">
             <GlassCard theme={theme} className="p-4 space-y-2">
                <h3 className="font-bold" style={{color: theme.colors.textPrimary}}>Ship To</h3>
                <div className="relative">
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows="3" placeholder="Search Address..." className="w-full p-2 pr-10 border rounded-lg" style={{backgroundColor: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary}}></textarea>
                    <button onClick={() => setAddress(HOME_ADDRESS)} className="absolute top-2 right-2 p-1 rounded-full" style={{backgroundColor: theme.colors.surface}}><Home className="w-5 h-5" style={{color: theme.colors.secondary}}/></button>
                </div>
             </GlassCard>
             <button className="w-full font-bold py-3 px-6 rounded-lg transition-colors" style={{backgroundColor: theme.colors.accent, color: '#FFFFFF'}} onClick={handleSubmit} disabled={selectedLoaners.length === 0 || !address.trim()}>Request</button>
        </div>
    </div>);
}


const FabricsScreen = ({ onHomeClick, theme, onProfileClick, onNavigate, currentScreen }) => {
    const subScreen = currentScreen.split('/')[1];

    if (subScreen === 'search_form') {
        return <FabricSearchForm onHomeClick={onHomeClick} theme={theme} onProfileClick={onProfileClick}/>;
    }
   
    if (subScreen === 'com_request') {
        return <COMYardageRequestScreen onHomeClick={onHomeClick} theme={theme} onProfileClick={onProfileClick}/>;
    }

    return (
        <>
            <PageTitle title="Fabrics" theme={theme} />
            <div className="px-4 space-y-4 pb-4">
                <GlassCard theme={theme} className="p-1"><button onClick={() => onNavigate('fabrics/search_form')} className="w-full p-3 rounded-xl flex items-center justify-between"><span className="text-md font-semibold tracking-tight" style={{color: theme.colors.textPrimary}}>Search Database</span><ArrowRight className="w-5 h-5" style={{color: theme.colors.secondary}} /></button></GlassCard>
                <GlassCard theme={theme} className="p-1"><button onClick={() => onNavigate('fabrics/com_request')} className="w-full p-3 rounded-xl flex items-center justify-between"><span className="text-md font-semibold tracking-tight" style={{color: theme.colors.textPrimary}}>Request COM Yardage</span><ArrowRight className="w-5 h-5" style={{color: theme.colors.secondary}} /></button></GlassCard>
            </div>
        </>
    );
};

const FabricSearchForm = ({ onHomeClick, onBack, theme, onProfileClick }) => {
    const [formState, setFormState] = useState({ supplier: '', pattern: '', jsiSeries: '', grade: 'all', textile: 'all', tackable: 'any', status: 'approved' });
    const handleFormChange = (field, value) => { setFormState(prev => ({...prev, [field]: value})); };
    const FormRow = ({ label, children, theme }) => ( <div className="space-y-1"> <label className="block text-sm font-medium" style={{color: theme.colors.textSecondary}}>{label}</label> {children} </div> );
    const ToggleButtonGroup = ({ options, selected, onChange, theme }) => ( <div className="flex rounded-lg p-1" style={{backgroundColor: theme.colors.subtle}}>{options.map(opt => (<button key={opt.value} onClick={() => onChange(opt.value)} className="flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors" style={{backgroundColor: selected === opt.value ? theme.colors.surface : 'transparent', color: selected === opt.value ? theme.colors.accent : theme.colors.textSecondary, boxShadow: selected === opt.value ? `0 1px 3px ${theme.colors.shadow}` : 'none' }}>{opt.label}</button>))}</div> );
    return (
        <>
            <PageTitle title="Search Database" theme={theme}/>
            <div className="px-4 pb-4 space-y-4">
                <GlassCard theme={theme} className="p-4 space-y-4">
                    <FormRow label="Supplier" theme={theme}><FormInput type="search" value={formState.supplier} onChange={e => handleFormChange('supplier', e.target.value)} placeholder="Search Supplier" theme={theme}/></FormRow>
                    <FormRow label="Pattern" theme={theme}><FormInput type="search" value={formState.pattern} onChange={e => handleFormChange('pattern', e.target.value)} placeholder="Search Pattern" theme={theme}/></FormRow>
                    <FormRow label="JSI Series" theme={theme}><FormInput type="search" value={formState.jsiSeries} onChange={e => handleFormChange('jsiSeries', e.target.value)} placeholder="Search JSI Series" theme={theme}/></FormRow>
                    <FormRow label="Grade" theme={theme}><FormInput type="select" value={formState.grade} onChange={e => handleFormChange('grade', e.target.value)} options={[{value: 'all', label: 'All'},{value: 'A', label: 'A'},{value: 'B', label: 'B'}]} theme={theme}/></FormRow>
                    <FormRow label="Textile" theme={theme}><FormInput type="select" value={formState.textile} onChange={e => handleFormChange('textile', e.target.value)} options={[{value: 'all', label: 'All'}, {value: 'Woven', label: 'Woven'}, {value: 'Knit', label: 'Knit'}]} theme={theme}/></FormRow>
                </GlassCard>
                <button className="w-full font-bold py-3 px-6 rounded-lg transition-colors" style={{backgroundColor: theme.colors.accent, color: '#FFFFFF'}} onClick={() => alert('Retrieving fabrics...')}>Retrieve</button>
            </div>
        </>
    );
}

const COMYardageRequestScreen = ({ onHomeClick, onBack, theme, onProfileClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModels, setSelectedModels] = useState([]);
   
    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        return JSI_MODELS.filter(model => model.isUpholstered && (model.name.toLowerCase().includes(searchTerm.toLowerCase()) || model.id.toLowerCase().includes(searchTerm.toLowerCase())))
    }, [searchTerm]);

    const addModel = (model) => {
        if (!selectedModels.find(m => m.id === model.id)) {
            setSelectedModels(prev => [...prev, {...model, quantity: 1, fabric: '', fabricSearch: '', showFabricSearch: false}]);
        }
        setSearchTerm('');
    };

    const updateModel = (modelId, updates) => {
        setSelectedModels(prev => prev.map(m => m.id === modelId ? {...m, ...updates} : m));
    };
   
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchResults.length > 0) {
            addModel(searchResults[0]);
        }
    }
   
    return (
        <div className="flex flex-col h-full p-4">
            <PageTitle title="COM Yard Request" theme={theme}/>
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
                            <button key={model.id} onClick={() => addModel(model)} className="block w-full text-left p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5" style={{color: theme.colors.textPrimary}}>
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
                                 <p className="font-semibold" style={{color: theme.colors.textPrimary}}>{model.id}</p>
                                 <p className="text-sm" style={{color: theme.colors.textSecondary}}>{model.series}</p>
                             </div>
                             <div className="flex items-center space-x-2">
                                <button onClick={() => updateModel(model.id, { quantity: Math.max(1, model.quantity - 1) })} className="p-1 rounded-full" style={{backgroundColor: theme.colors.subtle}}><Minus className="w-4 h-4" style={{color: theme.colors.secondary}}/></button>
                                 <span className="font-bold w-8 text-center" style={{color: theme.colors.textPrimary}}>{model.quantity}</span>
                                <button onClick={() => updateModel(model.id, { quantity: model.quantity + 1 })} className="p-1 rounded-full" style={{backgroundColor: theme.colors.subtle}}><Plus className="w-4 h-4" style={{color: theme.colors.secondary}}/></button>
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
                                         {model.fabricSearch && <div className="absolute w-full mt-1 z-10 p-2 space-y-1" style={{backgroundColor: theme.colors.surface}} >
                                             {FABRICS_DATA.filter(f => f.name.toLowerCase().includes(model.fabricSearch.toLowerCase())).map(f => (
                                                 <button key={`${f.name}-${f.manufacturer}`} onClick={() => updateModel(model.id, { fabric: `${f.manufacturer}, ${f.name}`, showFabricSearch: false, fabricSearch: '' })} className="block w-full text-left p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5" style={{color: theme.colors.textPrimary}}>{f.manufacturer}, {f.name}</button>
                                             ))}
                                         </div>}
                                     </div>
                                 ) : (
                                     <button onClick={() => updateModel(model.id, { showFabricSearch: true })} className="w-full text-left text-sm p-2 rounded-md font-semibold flex items-center justify-between" style={{backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary}}>
                                         <span>{model.fabric ? `Fabric: ${model.fabric}` : 'Search Fabric'}</span>
                                         <Hourglass className="w-4 h-4" style={{color: theme.colors.secondary}}/>
                                     </button>
                                 )}
                             </div>
                        )}
                    </GlassCard>
                ))}
            </div>
            <div className="pt-4">
                <button onClick={() => alert('COM Yardage Request Submitted (Demo)')} disabled={selectedModels.length === 0} className="w-full font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50" style={{backgroundColor: theme.colors.accent, color: '#FFFFFF'}}>Submit</button>
            </div>
        </div>
    );
};

const Modal = ({ show, onClose, title, children, theme }) => { 
    if (!show) return null; 
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-end justify-center z-50 transition-opacity duration-300" 
            style={{opacity: show ? 1 : 0}}
            onClick={onClose}
        >
            <div 
                style={{backgroundColor: theme.colors.surface, backdropFilter: theme.backdropFilter, WebkitBackdropFilter: theme.backdropFilter, borderColor: theme.colors.border, boxShadow: `0 4px 30px ${theme.colors.shadow}`}} 
                className="rounded-t-2xl w-full max-w-sm max-h-[90vh] flex flex-col transition-transform duration-300" 
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className="flex justify-between items-center p-4 border-b" style={{borderColor: theme.colors.border}}>
                        <h2 className="text-xl font-bold" style={{color: theme.colors.textPrimary}}>{title}</h2>
                        <button onClick={onClose} className="p-1 rounded-full transition-colors" style={{backgroundColor: theme.colors.subtle}}>
                            <X className="w-5 h-5" style={{color: theme.colors.textSecondary}} />
                        </button>
                    </div>
                )}
                <div className="p-6 overflow-y-auto space-y-4 scrollbar-hide">{children}</div>
            </div>
        </div>
    ); 
};

const ProfileMenu = ({ show, onClose, onNavigate, toggleTheme, theme, isDarkMode }) => {
    if (!show) return null;
    const menuItems = [
        { label: 'Dark Mode', action: toggleTheme, icon: isDarkMode ? Sun : Moon },
        { label: 'Members', action: () => onNavigate('members'), icon: User },
        { label: 'Help', action: () => alert('Help coming soon!'), icon: HelpCircle },
        { label: 'Log Out', action: () => alert('Logged out!'), icon: LogOut },
    ];
    return (
        <div className="fixed inset-0 z-30" onClick={onClose}>
            <GlassCard theme={theme} className="absolute top-16 right-4 w-48 p-2 space-y-1">
                {menuItems.map(item => (
                    <button key={item.label} onClick={item.action} className="w-full text-left flex items-center px-3 py-2 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10" style={{color: theme.colors.textPrimary}}>
                        <item.icon className="w-4 h-4 mr-3" style={{color: theme.colors.secondary}} />{item.label}
                    </button>
                ))}
            </GlassCard>
        </div>
    );
};

// ===================================================================================
// MAIN APP COMPONENT
// ===================================================================================

const scrollbarHideStyle = ` .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } `;

const SCREEN_MAP = { home: HomeScreen, products: ProductsScreen, orders: OrdersScreen, sales: SalesScreen, 'lead-times': LeadTimesScreen, projects: ProjectsScreen, fabrics: FabricsScreen, resources: ResourcesScreen, samples: SamplesScreen, replacements: ReplacementsScreen, feedback: FeedbackScreen, members: MembersScreen, 'customer-rank': CustomerRankScreen };

function App() {
  const [navigationHistory, setNavigationHistory] = useState(['home']);
  const currentScreen = navigationHistory[navigationHistory.length - 1];
 
  const [showNewOpportunityModal, setShowNewOpportunityModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cart, setCart] = useState({});
 
  const [newOpportunity, setNewOpportunity] = useState(EMPTY_OPPORTUNITY);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [members, setMembers] = useState(INITIAL_MEMBERS);

  // State for AI Chat
  const [searchTerm, setSearchTerm] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [showAIDropdown, setShowAIDropdown] = useState(false);

  const touchStartX = useRef(0);

  const toggleTheme = useCallback(() => setIsDarkMode(prev => !prev), []);
  const currentTheme = isDarkMode ? darkTheme : lightTheme;
 
  const handleNavigate = useCallback((screen) => { setNavigationHistory(prev => [...prev, screen]); setShowProfileMenu(false); }, []);
  const handleBack = useCallback(() => { if (navigationHistory.length > 1) { setNavigationHistory(prev => prev.slice(0, -1)); } }, [navigationHistory.length]);
  const handleHome = useCallback(() => { setNavigationHistory(['home']); setShowProfileMenu(false); }, []);

  const handleTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = (e) => { const touchEndX = e.changedTouches[0].clientX; if (touchStartX.current < 50 && touchEndX - touchStartX.current > 75) { handleBack(); } touchStartX.current = 0; };
 
  const handleSetSelectedOrder = (order) => {
    setSelectedOrder(order);
  }

  const handleCreateOpportunity = useCallback(() => { if (newOpportunity.name && newOpportunity.company && newOpportunity.value) { alert(`Creating opportunity: ${newOpportunity.name}`); setNewOpportunity(EMPTY_OPPORTUNITY); setShowNewOpportunityModal(false); } }, [newOpportunity]);
  const updateNewOpportunity = useCallback((field, value) => { setNewOpportunity(prev => ({ ...prev, [field]: value })); }, []);
  
  const handleCloseAIDropdown = () => {
      setShowAIDropdown(false);
      setSearchTerm('');
  };

  const handleAskAI = async (prompt) => {
    if (!prompt.trim()) return;

    setShowAIDropdown(true);
    setIsAILoading(true);
    setAiResponse('');

    let websiteContext = "No relevant website information was found for this query.";

    // This block is a placeholder for a real backend API call that would use tools.
    // In a real application, this logic would live on a server.
    try {
        // Here, we simulate a web search. A real implementation would use a google_search tool.
        // For the purpose of this demo, we'll hardcode the result for the specific query.
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
  };
 
  const renderScreen = () => {
      const commonProps = {
          onNavigate: handleNavigate,
          onHomeClick: handleHome,
          theme: currentTheme,
          onProfileClick: () => setShowProfileMenu(prev => !prev),
          setShowNewOpportunityModal,
          members,
          setMembers,
          currentScreen,
          setSelectedOrder: handleSetSelectedOrder,
          cart,
          onUpdateCart: (item, change) => setCart(prev => { const newCart = {...prev}; const currentQty = newCart[item.id] || 0; const newQty = currentQty + change; if (newQty > 0) { newCart[item.id] = newQty; } else { delete newCart[item.id]; } return newCart; }),
          setCart: setCart,
          onAskAI: handleAskAI, 
          searchTerm,
          onSearchTermChange: setSearchTerm,
          showAIDropdown,
          aiResponse,
          isAILoading,
          onCloseAIDropdown: handleCloseAIDropdown,
          handleBack,
      };
     
      const screenParts = currentScreen.split('/');
      const screenType = screenParts[0];
     
      let Content;

      if (screenType === 'home') {
          Content = <HomeScreen {...commonProps} />;
      } else if (screenType === 'products') {
        const subScreen = screenParts[1];
        if (subScreen === 'category') {
            const categoryId = screenParts[2];
            Content = <ProductComparisonScreen {...commonProps} categoryId={categoryId} />;
        } else if (subScreen === 'competitive-analysis') {
            Content = <CompetitiveAnalysisScreen {...commonProps} />;
        } else {
            Content = <ProductsScreen {...commonProps} />;
        }
      } else if (screenType === 'resources') {
          const subScreen = screenParts[1];
          if(subScreen) {
              Content = <ResourceDetailScreen category={subScreen.replace(/_/g, ' ')} theme={currentTheme} onNavigate={handleNavigate} />;
          } else {
              Content = <ResourcesScreen {...commonProps} />;
          }
      } else if (currentScreen.startsWith('samples/cart')) {
          Content = <CartScreen {...commonProps} />
      } else {
          const ScreenComponent = SCREEN_MAP[screenType];
          Content = ScreenComponent ? <ScreenComponent {...commonProps} /> : <HomeScreen {...commonProps} />;
      }
     
      const hasBackButton = navigationHistory.length > 1;

      return (
        <PageLayout theme={currentTheme}>
            <AppHeader onHomeClick={handleHome} theme={currentTheme} onProfileClick={commonProps.onProfileClick} handleBack={handleBack} showBack={hasBackButton} isHome={screenType === 'home'} />
            <div className="flex-1 rounded-t-[40px] -mt-8 pt-6 overflow-y-auto scrollbar-hide">
                {Content}
            </div>
        </PageLayout>
      );
  }

  return (
    <>
      <style>{`
      body { font-family: 'Inter', sans-serif; }
      ${scrollbarHideStyle}
      `}</style>
      <div style={{backgroundColor: currentTheme.colors.background}} className="font-sans flex items-center justify-center min-h-screen">
          <div 
            className="w-full max-w-sm h-[812px] rounded-[40px] shadow-2xl overflow-hidden relative border-8 flex flex-col" 
            style={{borderColor: isDarkMode ? '#000000' : '#FFFFFF', backgroundColor: currentTheme.colors.background}}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {renderScreen()}
            
            <ProfileMenu show={showProfileMenu} onClose={() => setShowProfileMenu(false)} onNavigate={handleNavigate} toggleTheme={toggleTheme} theme={currentTheme} isDarkMode={isDarkMode} />
           
            <Modal show={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Order Details" theme={currentTheme}>
              {selectedOrder && <div onClick={(e) => e.stopPropagation()} className="space-y-4">
                  <p className="font-bold text-lg" style={{color: currentTheme.colors.textPrimary}}>{selectedOrder.company} - {selectedOrder.details}</p>
                  {selectedOrder.status && <div className="text-center py-2 rounded-md font-semibold" style={{backgroundColor: currentTheme.colors.accent, color: isDarkMode ? darkTheme.colors.primary : '#FFFFFF'}}>{selectedOrder.status}</div>}
                   <GlassCard theme={currentTheme} className="p-4 space-y-2">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm" style={{color: currentTheme.colors.textPrimary}}>
                           <div><p className="font-semibold" style={{color: currentTheme.colors.textSecondary}}>SO:</p><p>{selectedOrder.orderNumber}</p></div>
                           <div><p className="font-semibold" style={{color: currentTheme.colors.textSecondary}}>PO:</p><p>{selectedOrder.po}</p></div>
                           <div><p className="font-semibold" style={{color: currentTheme.colors.textSecondary}}>NET:</p><p>${selectedOrder.net?.toLocaleString(undefined, {minimumFractionDigits: 2})}</p></div>
                           <div><p className="font-semibold" style={{color: currentTheme.colors.textSecondary}}>REWARD:</p><p>{selectedOrder.reward}</p></div>
                           <div><p className="font-semibold" style={{color: currentTheme.colors.textSecondary}}>SHIP DATE:</p><p>{selectedOrder.shipDate}</p></div>
                            <div><p className="font-semibold" style={{color: currentTheme.colors.textSecondary}}>DISCOUNT:</p><p>{selectedOrder.discount}</p></div>
                      </div>
                   </GlassCard>
                  {selectedOrder.shipTo && <GlassCard theme={currentTheme} className="p-4 space-y-1">
                      <p className="font-bold text-sm" style={{color: currentTheme.colors.textSecondary}}>SHIP TO:</p>
                      <p className="whitespace-pre-wrap text-sm" style={{color: currentTheme.colors.textPrimary}}>{selectedOrder.shipTo}</p>
                  </GlassCard>}
                  {(selectedOrder.lineItems && selectedOrder.lineItems.length > 0) && (
                       <div className="space-y-3 pt-2 border-t" style={{borderColor: currentTheme.colors.border}}>
                           <div className="flex justify-between items-center"><h3 className="font-bold text-lg" style={{color: currentTheme.colors.textPrimary}}>Line Items</h3> <GlassCard theme={currentTheme} className="p-1 px-3"><button className="text-sm font-semibold" style={{color: currentTheme.colors.textPrimary}}>PACK QTY: 0</button></GlassCard></div>
                           {(selectedOrder.lineItems || []).map(item => (
                               <div key={item.line} className="text-sm border-b pb-2" style={{borderColor: currentTheme.colors.subtle}}>
                                   <p className="font-bold" style={{color: currentTheme.colors.accent}}>LINE {item.line} <ArrowRight className="inline w-4 h-4"/></p>
                                   <p style={{color: currentTheme.colors.textPrimary}}>{item.name}</p>
                                   <p><span style={{color: currentTheme.colors.textSecondary}}>MODEL:</span> {item.model}</p>
                                   <p><span style={{color: currentTheme.colors.textSecondary}}>QUANTITY:</span> {item.quantity}</p>
                                   <p><span style={{color: currentTheme.colors.textSecondary}}>NET:</span> ${item.net.toFixed(2)}</p>
                                   <p><span style={{color: currentTheme.colors.textSecondary}}>EXT. NET:</span> ${item.extNet.toFixed(2)}</p>
                                   <p><span style={{color: currentTheme.colors.textSecondary}}>OPTIONS:</span> {item.options}</p>
                               </div>
                           ))}
                       </div>
                  )}
              </div>}
            </Modal>
            <Modal show={showNewOpportunityModal} onClose={() => setShowNewOpportunityModal(false)} title="New Opportunity" theme={currentTheme}>
                <div onClick={(e) => e.stopPropagation()}>
                    <FormInput label="Opportunity Name" value={newOpportunity.name} onChange={e => updateNewOpportunity('name', e.target.value)} theme={currentTheme} />
                    <FormInput label="Company" value={newOpportunity.company} onChange={e => updateNewOpportunity('company', e.target.value)} theme={currentTheme} />
                    <FormInput label="Contact" value={newOpportunity.contact} onChange={e => updateNewOpportunity('contact', e.target.value)} theme={currentTheme} />
                    <FormInput label="Value ($)" type="number" value={newOpportunity.value} onChange={(e) => updateNewOpportunity('value', e.target.value)} theme={currentTheme} />
                    <FormInput label="Stage" type="select" options={STAGES} value={newOpportunity.stage} onChange={(e) => updateNewOpportunity('stage', e.target.value)} theme={currentTheme}/>
                    <div className="pt-4"><button onClick={handleCreateOpportunity} className="w-full text-white font-bold py-3 px-6 rounded-lg transition-colors" style={{backgroundColor: currentTheme.colors.accent, color: '#FFFFFF', '&:hover': {backgroundColor: currentTheme.colors.accentHover}}}>Create Opportunity</button></div>
                </div>
            </Modal>
          </div>
      </div>
    </>
  );
};

export default App;
