// Enhanced HomeScreen with Dealer Dashboard design and reconfiguration functionality
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { allApps, DEFAULT_HOME_APPS } from '../../data.jsx';
import { ORDER_DATA } from '../orders/data.js';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { HomeSearchInput } from '../../components/common/SearchInput.jsx';
import { QuickActionDropdown } from '../../components/common/QuickActionDropdown.jsx';
import { RequestQuoteModal } from '../../components/common/RequestQuoteModal.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import { Check, Plus, X, Paperclip, MessageCircle, Megaphone, Package, Calendar, DollarSign, Zap, ChevronRight, ChevronDown, Gift, Settings2 } from 'lucide-react';
import { LEAD_TIMES_DATA } from '../resources/lead-times/data.js';
import { ANNOUNCEMENTS } from '../community/data.js';
import { MARKETPLACE_PRODUCTS, INITIAL_BALANCE, formatElliottBucks } from '../marketplace/data.js';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { hapticMedium } from '../../utils/haptics.js';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    KeyboardSensor,
    MeasuringStrategy,
    closestCenter,
    useSensor,
    useSensors,
    useDroppable
} from '@dnd-kit/core';
import {
    SortableContext,
    rectSortingStrategy,
    arrayMove,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

// Extracted modules
import { SortableAppTile } from './components/SortableAppTile.jsx';
import { useHomeChat } from './hooks/useHomeChat.js';
import {
    getAppBadge,
    MIN_PINNED_APPS,
    MAX_PINNED_APPS,
    NON_REMOVABLE_APPS,
    EXCLUDED_ROUTES,
    areArraysEqual,
    getCommunityAuthorSafe,
    getCommunityTextSafe,
} from './utils/homeUtils.js';

// Droppable "remove" zone — lives inside the DndContext
const RemoveDropZone = ({ children, isDark, colors, isActive }) => {
    const { setNodeRef, isOver } = useDroppable({ id: '__remove_zone__' });
    const highlight = isActive && isOver;
    return (
        <div
            ref={setNodeRef}
            className="rounded-2xl transition-all duration-200"
            style={{
                padding: highlight ? 12 : 8,
                backgroundColor: highlight
                    ? (isDark ? 'rgba(184,92,92,0.15)' : 'rgba(184,92,92,0.08)')
                    : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                border: highlight
                    ? '2px dashed rgba(184,92,92,0.5)'
                    : `1px dashed ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
            }}
        >
            {highlight && (
                <p className="text-xs font-semibold text-center mb-2" style={{ color: '#B85C5C' }}>
                    Drop here to remove
                </p>
            )}
            {children}
        </div>
    );
};

// Custom feature card picker — replaces native <select> in edit mode
const FeaturePicker = ({ value, onChange, options, colors, isDark }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const current = options.find(o => o.id === value);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(p => !p); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 animate-pulse-subtle"
                style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(53,53,53,0.08)',
                    color: colors.textPrimary,
                    border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(53,53,53,0.20)'}`,
                }}
            >
                {current?.label}
                <ChevronDown className="w-3 h-3 opacity-60" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {open && (
                <div
                    className="absolute right-0 top-full mt-2 w-44 rounded-2xl overflow-hidden z-30 py-1.5"
                    style={{
                        backgroundColor: isDark ? 'rgba(36,36,36,0.96)' : 'rgba(252,250,248,0.98)',
                        border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.08)',
                        boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 8px 32px rgba(0,0,0,0.12)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                    }}
                >
                    {options.map(opt => (
                        <button
                            key={opt.id}
                            onClick={(e) => { e.stopPropagation(); onChange(opt.id); setOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-[13px] transition-colors"
                            style={{
                                backgroundColor: opt.id === value
                                    ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)')
                                    : 'transparent',
                                color: opt.id === value ? colors.textPrimary : colors.textSecondary,
                                fontWeight: opt.id === value ? 600 : 400,
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const HomeScreen = React.memo(({ theme, onNavigate, onVoiceActivate, homeApps, onUpdateHomeApps, homeResetKey, posts, isDarkMode, onToggleTheme, cart }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeDragId, setActiveDragId] = useState(null);
    const [showQuoteModal, setShowQuoteModal] = useState(false);

    // Chat logic extracted to custom hook
    const {
        isChatOpen, setIsChatOpen,
        chatMessages, chatInput, setChatInput,
        chatAttachments, isBotThinking,
        chatFileInputRef,
        openChatFromQuery, handleChatSubmit,
        handleChatFilePick, handleChatFilesSelected,
        handleRemoveAttachment, resetChat,
    } = useHomeChat();

    const [homeFeatureMode, setHomeFeatureMode] = useState('activity');
    const [secondaryFeatureMode, setSecondaryFeatureMode] = useState('community');
    const [leadTimeFavorites, setLeadTimeFavorites] = useState([]);
    const prevHomeResetKeyRef = useRef(homeResetKey);

    // Handle quick action selection from dropdown
    const handleQuickAction = useCallback((actionId) => {
        switch (actionId) {
            case 'presentation-builder':
                onNavigate?.('presentations', { openBuilder: true });
                break;
            case 'quote':
                setShowQuoteModal(true);
                break;
            case 'upload':
                // TODO: implement upload action
                break;
            case 'spec':
                onNavigate?.('resources');
                break;
            case 'feedback':
                onNavigate?.('feedback');
                break;
            default:
                break;
        }
    }, [onNavigate]);

    // Safe theme color extraction with fallbacks
    const isDark = isDarkTheme(theme);
    const [lampOn, setLampOn] = useState(isDarkMode);
    const [lampLightReady, setLampLightReady] = useState(false);
    const lampAnim = useAnimation();
    const hasEnteredRef = useRef(false);
    const [lampRight, setLampRight] = useState('30%');

    // Sync lampOn when isDarkMode changes externally (e.g. from settings)
    useEffect(() => {
        setLampOn(isDarkMode);
        if (!isDarkMode) {
            setLampLightReady(false);
            hasEnteredRef.current = false;
        }
    }, [isDarkMode]);

    // Entrance animation when dark mode activates
    useEffect(() => {
        if (isDarkMode) {
            hasEnteredRef.current = false;
            setLampLightReady(false);
            lampAnim.set({ y: -70, opacity: 0, rotate: 0 });
            lampAnim.start(
                { y: 0, opacity: 1 },
                {
                    y: { duration: 0.9, ease: [0.16, 0.77, 0.29, 0.98] },
                    opacity: { duration: 0.5, ease: 'easeOut' },
                }
            ).then(() => {
                return lampAnim.start(
                    { rotate: [0, 2.0, -1.4, 0.8, -0.35, 0.12, 0] },
                    { rotate: { duration: 1.6, ease: [0.25, 0.1, 0.25, 1], times: [0, 0.15, 0.32, 0.50, 0.68, 0.84, 1] } }
                );
            }).then(() => {
                hasEnteredRef.current = true;
                setLampLightReady(true);
            });
        }
    }, [isDarkMode, lampAnim]);

    // Dynamically position lamp to the left of the greeting message
    useEffect(() => {
        const updateLampPosition = () => {
            const el = document.querySelector('[data-greeting-anchor]');
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const rightPx = window.innerWidth - rect.left + 8;
            setLampRight(`${rightPx}px`);
        };
        const raf = requestAnimationFrame(() => {
            updateLampPosition();
            setTimeout(updateLampPosition, 400);
        });
        window.addEventListener('resize', updateLampPosition);
        const el = document.querySelector('[data-greeting-anchor]');
        let ro = null;
        if (el) {
            ro = new ResizeObserver(updateLampPosition);
            ro.observe(el);
        }
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', updateLampPosition);
            ro?.disconnect();
        };
    }, []);

    // Toggle lamp off → slide up, then switch to light mode
    const handleLampClick = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        hapticMedium();
        // Allow click immediately — cancel any running entrance animation
        setLampLightReady(false);
        lampAnim.stop();
        lampAnim.start(
            { y: -50, opacity: 0 },
            { duration: 0.38, ease: [0.4, 0, 0.7, 0.2] }
        ).then(() => {
            setLampOn(false);
            hasEnteredRef.current = false;
            if (isDarkMode && onToggleTheme) onToggleTheme();
        });
    }, [isDarkMode, onToggleTheme, lampAnim]);
    const colors = useMemo(() => ({
        background: theme?.colors?.background || '#F0EDE8',
        surface: theme?.colors?.surface || '#FFFFFF',
        tileSurface: isDark ? '#2A2A2A' : (theme?.colors?.surface || '#FFFFFF'),
        tileShadow: 'none',
        accent: theme?.colors?.accent || '#353535',
        textPrimary: theme?.colors?.textPrimary || '#353535',
        textSecondary: theme?.colors?.textSecondary || '#666666',
        border: theme?.colors?.border || '#E3E0D8'
    }), [theme, isDark]);

    const allAppRoutes = useMemo(() => new Set(allApps.map(app => app.route)), []);

    const normalizeHomeApps = useCallback((list) => {
        const baseList = Array.isArray(list) ? list : [];
        const unique = baseList.filter((route, index) => baseList.indexOf(route) === index);
        const known = unique.filter(route => allAppRoutes.has(route));
        const withResources = known.includes('resources') ? known : ['resources', ...known];
        return withResources.length ? withResources : DEFAULT_HOME_APPS;
    }, [allAppRoutes]);

    // Ensure homeApps is always a valid array
    const safeHomeApps = useMemo(() => {
        return normalizeHomeApps(homeApps);
    }, [homeApps, normalizeHomeApps]);

    useEffect(() => {
        if (!onUpdateHomeApps) return;
        if (!Array.isArray(homeApps)) return;
        const normalized = normalizeHomeApps(homeApps);
        if (!areArraysEqual(homeApps, normalized)) {
            onUpdateHomeApps(normalized);
        }
    }, [homeApps, normalizeHomeApps, onUpdateHomeApps]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('leadTimeFavorites');
            const parsed = raw ? JSON.parse(raw) : [];
            setLeadTimeFavorites(Array.isArray(parsed) ? parsed : []);
        } catch {
            setLeadTimeFavorites([]);
        }
    }, []);

    // Close chat only when homeResetKey actually changes (e.g., clicking MyJSI logo)
    useEffect(() => {
        if (prevHomeResetKeyRef.current !== homeResetKey) {
            prevHomeResetKeyRef.current = homeResetKey;
            if (isChatOpen) {
                resetChat();
                setSearchQuery('');
            }
        }
    }, [homeResetKey, isChatOpen, resetChat]);

    const currentApps = useMemo(() => {
        return safeHomeApps.map(route => allApps.find(a => a.route === route)).filter(Boolean);
    }, [safeHomeApps]);

    const availableApps = useMemo(() => {
        return allApps.filter(app => !safeHomeApps.includes(app.route) && !EXCLUDED_ROUTES.has(app.route));
    }, [safeHomeApps]);

    const spotlightResults = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return [];
        return allApps
            .filter(app => {
                const name = app.name?.toLowerCase() || '';
                const route = app.route?.toLowerCase() || '';
                return name.includes(query) || route.includes(query);
            })
            .slice(0, 6);
    }, [searchQuery]);

    const toggleApp = useCallback((route) => {
        if (!onUpdateHomeApps) return; // Guard against missing prop
        if (NON_REMOVABLE_APPS.has(route)) return; // Resources is always pinned
        if (safeHomeApps.includes(route)) {
            if (safeHomeApps.length > MIN_PINNED_APPS) {
                onUpdateHomeApps(safeHomeApps.filter(r => r !== route));
            }
        } else {
            if (safeHomeApps.length < MAX_PINNED_APPS) {
                onUpdateHomeApps([...safeHomeApps, route]);
            }
        }
    }, [safeHomeApps, onUpdateHomeApps]);

    const handleSearchSubmit = useCallback((val) => {
        const trimmed = val?.trim();
        if (!trimmed) return;
        const isChatIntent = trimmed.startsWith('?') || trimmed.toLowerCase().startsWith('ask ');
        if (isChatIntent || spotlightResults.length === 0) {
            openChatFromQuery(trimmed);
        } else {
            onNavigate?.(spotlightResults[0].route);
        }
        setSearchQuery('');
    }, [onNavigate, openChatFromQuery, spotlightResults]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleReorder = useCallback((event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        if (!onUpdateHomeApps) return;
        const oldIndex = safeHomeApps.indexOf(active.id);
        const newIndex = safeHomeApps.indexOf(over.id);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
        onUpdateHomeApps(arrayMove(safeHomeApps, oldIndex, newIndex));
    }, [onUpdateHomeApps, safeHomeApps]);

    const activeApp = useMemo(() => {
        return allApps.find(app => app.route === activeDragId) || null;
    }, [activeDragId]);

    const todayLabel = useMemo(() => {
        const now = new Date();
        return now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    }, []);

    const communityPosts = useMemo(() => {
        if (!Array.isArray(posts) || posts.length === 0) return [];
        return posts.slice(0, 3);
    }, [posts]);

    const homeFeatureOptions = useMemo(() => ([
        { id: 'activity', label: 'Recent Activity' },
        { id: 'community', label: 'Community' },
        { id: 'lead-times', label: 'Lead Times' },
        { id: 'announcements', label: 'Announcements' },
        { id: 'products', label: 'Products' },
        { id: 'projects', label: 'Projects' },
        { id: 'marketplace', label: 'LWYD Marketplace' },
    ]), []);

    const leadTimeFavoritesData = useMemo(() => {
        if (!leadTimeFavorites.length) return [];
        return LEAD_TIMES_DATA.filter(item => leadTimeFavorites.includes(item.series))
            .slice(0, 6);
    }, [leadTimeFavorites]);

    // Smart title-case: respects acronyms (LLC, INC, MSD, LECC, etc.),
    // keeps already-mixed-case words, lowercases small words mid-sentence
    const smartTitleCase = useCallback((str) => {
        if (!str) return '';
        // If it's already mixed case (has both upper and lower), return as-is
        if (str !== str.toUpperCase() && str !== str.toLowerCase()) return str;
        const ALWAYS_UPPER = new Set(['LLC', 'INC', 'LP', 'LLP', 'PC', 'PA', 'NA', 'DBA', 'MSD', 'LECC', 'II', 'III', 'IV']);
        const SMALL_WORDS = new Set(['of', 'the', 'and', 'in', 'at', 'to', 'for', 'a', 'an', 'on', 'by', 'or']);
        return str.split(' ').map((word, i) => {
            const clean = word.replace(/[^A-Za-z]/g, '');
            if (ALWAYS_UPPER.has(clean.toUpperCase())) return word.toUpperCase();
            if (i > 0 && SMALL_WORDS.has(clean.toLowerCase()) && word.length <= 3) return word.toLowerCase();
            // Title-case: first letter up, rest lower
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    }, []);

    const recentOrders = useMemo(() => {
        return [...ORDER_DATA].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    }, []);

    // Shared route lookup for feature card modes
    const FEATURE_ROUTES = useMemo(() => ({
        community: 'community',
        'lead-times': 'resources/lead-times',
        products: 'products',
        projects: 'projects',
        marketplace: 'marketplace',
    }), []);
    const navigateFeature = useCallback((mode) => {
        onNavigate(FEATURE_ROUTES[mode] || 'orders');
    }, [onNavigate, FEATURE_ROUTES]);

    const samplesCartCount = useMemo(() => Object.values(cart || {}).reduce((sum, qty) => sum + qty, 0), [cart]);

    // Smart grid: pick responsive Tailwind classes that create balanced rows
    // Static class names so Tailwind JIT can detect them at build time
    // 3 cols on phone (standard mobile pattern), scales up for tablet/desktop
    const GRID_COL_CLASSES = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-3 sm:grid-cols-4',
        5: 'grid-cols-3 sm:grid-cols-5',
        6: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6',
    };
    const appGridCols = useMemo(() => {
        const count = currentApps.length;
        const editCount = count + 1; // +1 for the Done tile
        const calcCols = (n) => {
            if (n <= 2) return 2;
            if (n <= 4) return n;
            if (n % 4 === 0) return 4;   // 8→4, 12→4
            if (n % 3 === 0) return 3;   // 6→3, 9→3
            if (n % 5 === 0) return 5;   // 5→5, 10→5
            if (n <= 10) return Math.ceil(n / 2);  // 7→4
            return Math.ceil(n / 3);
        };
        const viewCols = calcCols(count);
        return {
            cols: viewCols,
            view: GRID_COL_CLASSES[viewCols] || 'grid-cols-3 sm:grid-cols-4',
            edit: GRID_COL_CLASSES[calcCols(editCount)] || 'grid-cols-3 sm:grid-cols-4',
        };
    }, [currentApps.length]);

    const hoverBg = isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.03]';

    const renderHomeFeatureContent = useCallback((mode) => {
        if (mode === 'community') {
            return (
                <div className="space-y-3">
                    {communityPosts.length > 0 ? (
                        communityPosts.map((post) => (
                            <button
                                key={post.id}
                                onClick={() => {
                                    onNavigate(`community/post/${post.id}`);
                                }}
                                className={`w-full p-3 rounded-2xl text-left ${hoverBg} transition-colors`}
                                style={{ border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}
                            >
                                <div className="flex items-start gap-3">
                                    {(() => {
                                        const image = post.image || (Array.isArray(post.images) ? post.images[0] : null);
                                        return image ? (
                                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                                <img src={image} alt="Community" className="w-full h-full object-cover" />
                                            </div>
                                        ) : null;
                                    })()}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                            {getCommunityAuthorSafe(post)}
                                        </div>
                                        <div className="text-xs line-clamp-2 mt-0.5" style={{ color: colors.textSecondary }}>
                                            {getCommunityTextSafe(post)}
                                        </div>
                                        {post.timeAgo && (
                                            <div className="text-[11px] mt-1 opacity-50" style={{ color: colors.textSecondary }}>
                                                {post.timeAgo}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="text-sm" style={{ color: colors.textSecondary }}>
                            No community posts yet.
                        </div>
                    )}
                </div>
            );
        }

        if (mode === 'lead-times') {
            return (
                <div className="space-y-3">
                    {leadTimeFavoritesData.length > 0 ? (
                        leadTimeFavoritesData.map((item) => (
                            <button
                                key={`${item.series}-${item.type}`}
                                onClick={() => onNavigate('resources/lead-times')}
                                className={`w-full flex items-center justify-between p-3 rounded-2xl ${hoverBg} transition-colors`}
                                style={{ border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}
                            >
                                <div className="text-left">
                                    <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{item.series}</div>
                                    <div className="text-[11px] uppercase tracking-widest opacity-60" style={{ color: colors.textSecondary }}>{item.type}</div>
                                </div>
                                <div className="text-sm font-bold" style={{ color: colors.textPrimary }}>{item.weeks} wks</div>
                            </button>
                        ))
                    ) : (
                        <div className="text-sm" style={{ color: colors.textSecondary }}>
                            Select lead time favorites in Settings to see them here.
                        </div>
                    )}
                </div>
            );
        }

        if (mode === 'announcements') {
            const ANN_ICONS = { 'product-launch': Package, 'pricing': DollarSign, 'event': Calendar, 'operations': Zap };
            const ANN_COLORS = { 'product-launch': '#4A7C59', 'pricing': '#5B7B8C', 'event': '#C4956A', 'operations': '#353535' };
            return (
                <div className="space-y-2">
                    {ANNOUNCEMENTS.slice(0, 3).map((ann) => {
                        const Icon = ANN_ICONS[ann.category] || Megaphone;
                        const accentColor = ANN_COLORS[ann.category] || '#353535';
                        return (
                            <button
                                key={ann.id}
                                onClick={() => ann.actionRoute ? onNavigate(ann.actionRoute) : onNavigate('community')}
                                className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left ${hoverBg} transition-colors`}
                                style={{ border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)', borderLeft: `3px solid ${accentColor}` }}
                            >
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>{ann.title}</div>
                                    <div className="text-[11px] mt-0.5 line-clamp-1" style={{ color: colors.textSecondary }}>{ann.subtitle || ann.text}</div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 mt-1 flex-shrink-0 opacity-30" style={{ color: colors.textSecondary }} />
                            </button>
                        );
                    })}
                </div>
            );
        }

        if (mode === 'products') {
            return (
                <div className="space-y-3">
                    <button onClick={() => onNavigate('products')} className={`w-full p-3 rounded-2xl text-left ${hoverBg} transition-colors`} style={{ border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                        <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Browse Products</div>
                        <div className="text-xs" style={{ color: colors.textSecondary }}>Explore finishes and specs</div>
                    </button>
                </div>
            );
        }

        if (mode === 'projects') {
            return (
                <div className="space-y-3">
                    <button onClick={() => onNavigate('projects')} className={`w-full p-3 rounded-2xl text-left ${hoverBg} transition-colors`} style={{ border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                        <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Project Pipeline</div>
                        <div className="text-xs" style={{ color: colors.textSecondary }}>View leads and installs</div>
                    </button>
                </div>
            );
        }

        if (mode === 'marketplace') {
            const featured = MARKETPLACE_PRODUCTS.slice(0, 3);
            return (
                <div className="space-y-3">
                    {/* Balance hero */}
                    <button
                        onClick={() => onNavigate('marketplace')}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl ${hoverBg} transition-colors`}
                        style={{
                            background: isDark
                                ? 'linear-gradient(135deg, rgba(53,53,53,0.6) 0%, rgba(60,60,60,0.6) 100%)'
                                : 'linear-gradient(135deg, #353535 0%, #494949 100%)',
                        }}
                    >
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}>
                            <Gift className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-bold text-white">{formatElliottBucks(INITIAL_BALANCE)} available</div>
                            <div className="text-[11px] text-white/60">ElliottBucks balance</div>
                        </div>
                        <ChevronRight className="w-4 h-4 ml-auto text-white/40" />
                    </button>
                    {/* Featured products */}
                    {featured.map(p => (
                        <button
                            key={p.id}
                            onClick={() => onNavigate('marketplace')}
                            className={`w-full flex items-center justify-between p-3 rounded-2xl ${hoverBg} transition-colors`}
                            style={{ border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="text-left min-w-0">
                                    <div className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>{p.name}</div>
                                    <div className="text-[11px]" style={{ color: colors.textSecondary }}>{formatElliottBucks(p.price)}</div>
                                </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-30" style={{ color: colors.textSecondary }} />
                        </button>
                    ))}
                </div>
            );
        }

        return (
            <div className="divide-y" style={{ borderColor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }}>
                {recentOrders.map((order) => {
                    const statusColor = {
                        'Order Entry': '#6B7280',
                        'Acknowledged': '#C4956A',
                        'In Production': '#6366F1',
                        'Shipping': '#06B6D4',
                        'Delivered': '#4A7C59',
                    }[order.status] || colors.textSecondary;
                    return (
                    <button
                        key={order.orderNumber}
                        onClick={() => onNavigate(`orders/${order.orderNumber}`)}
                        className={`w-full flex items-center gap-3 py-3.5 px-1 ${hoverBg} transition-colors`}
                    >
                        {/* Status dot */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${statusColor}14` }}>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
                        </div>
                        {/* Project + Dealer */}
                        <div className="text-left min-w-0 flex-1">
                            <div className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>{smartTitleCase(order.details)}</div>
                            <div className="text-xs truncate" style={{ color: colors.textSecondary }}>{smartTitleCase(order.company)}</div>
                        </div>
                        {/* Amount + Status */}
                        <div className="text-right flex-shrink-0">
                            <div className="text-sm font-bold tabular-nums" style={{ color: colors.textPrimary }}>${order.net.toLocaleString()}</div>
                            <div className="text-[11px] font-medium" style={{ color: statusColor }}>{order.status}</div>
                        </div>
                    </button>
                    );
                })}
            </div>
        );
    }, [colors, leadTimeFavoritesData, communityPosts, onNavigate, recentOrders, hoverBg, smartTitleCase]);

    return (
        <div className="flex flex-col h-full overflow-hidden scrollbar-hide app-header-offset" style={{ backgroundColor: colors.background, position: 'relative', overflowX: 'hidden', '--section-gap': 'clamp(12px, 2.2vh, 28px)' }}>

            {/* ── Indie Sconce – only visible in dark mode, portalled to body ── */}
            {isDarkMode && ReactDOM.createPortal(
            <div
                className="select-none"
                style={{
                    position: 'fixed',
                    top: 6,
                    right: lampRight,
                    zIndex: 35,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                }}
                onClick={handleLampClick}
                title="Turn light off"
            >
                {/* Perspective wrapper — subtle 3D depth */}
                <div style={{ perspective: '800px' }}>
                <div style={{ transform: 'rotateY(8deg) rotateX(-2deg)', transformStyle: 'preserve-3d' }}>
                <motion.div
                    initial={{ y: -70, opacity: 0, rotate: 0 }}
                    animate={lampAnim}
                    style={{ transformOrigin: '80% 0%' }}
                >
                    <svg width="40" height="42" viewBox="0 0 150 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="shadeFabric" x1="0.05" y1="0" x2="0.95" y2="1">
                                <stop offset="0%" stopColor="#DDDAD6"/>
                                <stop offset="25%" stopColor="#D4D1CC"/>
                                <stop offset="55%" stopColor="#C9C6C1"/>
                                <stop offset="100%" stopColor="#BDBAB4"/>
                            </linearGradient>
                            <linearGradient id="shadeShadow" x1="0" y1="0.5" x2="1" y2="0.5">
                                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                                <stop offset="65%" stopColor="rgba(0,0,0,0)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,0.06)" />
                            </linearGradient>
                            <radialGradient id="shadeInnerGlow" cx="0.5" cy="0.85" r="0.6" fx="0.5" fy="0.9">
                                <stop offset="0%" stopColor="rgba(255,220,165,0.12)"/>
                                <stop offset="60%" stopColor="rgba(255,210,150,0.05)"/>
                                <stop offset="100%" stopColor="rgba(255,200,140,0)"/>
                            </radialGradient>
                            <linearGradient id="woodMount" x1="0.5" y1="0" x2="0.5" y2="1">
                                <stop offset="0%" stopColor="#D9C998"/>
                                <stop offset="50%" stopColor="#CCBB86"/>
                                <stop offset="100%" stopColor="#BFB078"/>
                            </linearGradient>
                            <filter id="lampShadow" x="-12%" y="-6%" width="124%" height="116%">
                                <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
                                <feOffset dx="0" dy="1.5" result="offsetBlur"/>
                                <feFlood floodColor="rgba(0,0,0,0.08)" result="color"/>
                                <feComposite in2="offsetBlur" operator="in"/>
                                <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
                            </filter>
                        </defs>

                        {/* Wooden dowel — just past shade bottom */}
                        <rect x="78" y="6" width="9" height="112" rx="4.5" fill="url(#woodMount)"/>
                        <rect x="78" y="6" width="9" height="112" rx="4.5" fill="none" stroke="rgba(140,120,75,0.18)" strokeWidth="0.6"/>
                        <line x1="82.5" y1="8" x2="82.5" y2="116" stroke="rgba(185,160,115,0.08)" strokeWidth="0.5"/>

                        {/* Small metal hook — compact curve tucked against top edge */}
                        <path d="M82.5 8 L82.5 0 C82.5 -4 88 -6 94 -5 C98 -4 99 0 97 4"
                              stroke="#505660" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

                        {/* Metal ferrule collar at hook-dowel junction */}
                        <ellipse cx="82.5" cy="8" rx="6.5" ry="2.2" fill="#4A4E54"/>
                        <ellipse cx="82.5" cy="8" rx="6.5" ry="2.2" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4"/>

                        {/* Shade — straight trapezoid, tilted down-left */}
                        <g transform="rotate(3, 76, 60)">
                            <g filter="url(#lampShadow)">
                                <path d="M42 28 L108 28 L126 108 L12 108 Z" fill="url(#shadeFabric)"/>
                                <path d="M42 28 L108 28 L126 108 L12 108 Z" fill="url(#shadeShadow)"/>
                                <path d="M42 28 L108 28 L126 108 L12 108 Z" fill="url(#shadeInnerGlow)"/>
                                <path d="M42 28 L108 28 L126 108 L12 108 Z" stroke="rgba(160,155,148,0.22)" strokeWidth="0.6" fill="none"/>
                                <line x1="44" y1="44" x2="110" y2="44" stroke="rgba(160,155,148,0.04)" strokeWidth="0.4"/>
                                <line x1="36" y1="60" x2="117" y2="60" stroke="rgba(160,155,148,0.04)" strokeWidth="0.4"/>
                                <line x1="28" y1="76" x2="122" y2="76" stroke="rgba(160,155,148,0.03)" strokeWidth="0.4"/>
                                <line x1="20" y1="92" x2="127" y2="92" stroke="rgba(160,155,148,0.03)" strokeWidth="0.4"/>
                            </g>
                            {/* Top rim */}
                            <ellipse cx="75" cy="28" rx="33" ry="2.2" fill="rgba(205,200,194,0.35)"/>
                            {/* Bottom rim */}
                            <ellipse cx="69" cy="108" rx="57" ry="3.2" fill="rgba(200,190,175,0.30)"/>
                            <ellipse cx="69" cy="108.5" rx="55" ry="1.2" fill="rgba(255,235,200,0.10)"/>
                        </g>
                    </svg>
                </motion.div>
                </div>
                </div>

                {/* Light effects — warm layered glow beneath shade */}
                {/* Primary light cone — starts at shade bottom */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: lampLightReady && lampOn ? 1 : 0 }}
                    transition={{ duration: 2.2, ease: [0.15, 0.85, 0.3, 1] }}
                    style={{ position: 'absolute', top: 35, left: '50%', transform: 'translateX(-50%)',
                        width: 0, height: 0,
                        borderLeft: '36px solid transparent', borderRight: '36px solid transparent',
                        borderTop: '300px solid rgba(255,225,170,0.045)',
                        pointerEvents: 'none', filter: 'blur(16px)' }} />
                {/* Warm inner glow — tighter cone */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: lampLightReady && lampOn ? 0.8 : 0 }}
                    transition={{ duration: 1.8, ease: [0.15, 0.85, 0.3, 1], delay: 0.15 }}
                    style={{ position: 'absolute', top: 35, left: '50%', transform: 'translateX(-50%)',
                        width: 0, height: 0,
                        borderLeft: '18px solid transparent', borderRight: '18px solid transparent',
                        borderTop: '200px solid rgba(255,218,165,0.055)',
                        pointerEvents: 'none', filter: 'blur(10px)' }} />
                {/* Hot spot glow at shade opening */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: lampLightReady && lampOn ? 0.7 : 0 }}
                    transition={{ duration: 2.0, ease: [0.15, 0.85, 0.3, 1], delay: 0.3 }}
                    style={{ position: 'absolute', top: 33, left: '50%', transform: 'translateX(-50%)',
                        width: 38, height: 10, borderRadius: '50%',
                        background: 'radial-gradient(ellipse at 50% 80%, rgba(255,232,195,0.18) 0%, rgba(255,218,165,0.06) 50%, transparent 80%)',
                        pointerEvents: 'none', filter: 'blur(3px)' }} />
                {/* Subtle ambient halo */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: lampLightReady && lampOn ? 0.4 : 0 }}
                    transition={{ duration: 2.6, ease: [0.15, 0.85, 0.3, 1], delay: 0.5 }}
                    style={{ position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)',
                        width: 80, height: 40, borderRadius: '50%',
                        background: 'radial-gradient(ellipse at 50% 70%, rgba(255,235,200,0.06) 0%, transparent 70%)',
                        pointerEvents: 'none', filter: 'blur(8px)' }} />
            </div>,
            document.body
            )}

            <div
                className="px-4 sm:px-6 lg:px-8 flex flex-col flex-1 min-h-0 max-w-5xl mx-auto w-full"
                style={{
                    paddingTop: 'var(--section-gap)',
                    paddingBottom: 'var(--section-gap)',
                    gap: 'var(--section-gap)',
                    position: 'relative',
                    zIndex: 2,
                }}
            >

                {/* Header + Search — side-by-side on lg, stacked otherwise */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
                    {/* Header Section */}
                    <div className="space-y-0.5 hidden sm:block sm:shrink-0">
                        <h2 className="text-3xl font-semibold tracking-tight whitespace-nowrap" style={{ color: colors.textPrimary }}>Dashboard</h2>
                        <div className="text-[13px] font-medium whitespace-nowrap" style={{ color: colors.textSecondary }}>{todayLabel}</div>
                    </div>

                    {/* Search / Spotlight */}
                    <div className="relative group sm:flex-1 sm:min-w-0">
                        <div className="absolute inset-0 bg-transparent rounded-full" />
                        <GlassCard
                            theme={theme}
                            className="relative z-10 px-5 flex items-center"
                            style={{
                                borderRadius: 9999,
                                height: 56,
                                paddingTop: 0,
                                paddingBottom: 0,
                                backgroundColor: colors.tileSurface,
                                border: 'none',
                                boxShadow: colors.tileShadow
                            }}
                        >
                            <HomeSearchInput
                                value={searchQuery}
                                onChange={setSearchQuery}
                                onSubmit={handleSearchSubmit}
                                onVoiceClick={() => onVoiceActivate && onVoiceActivate('Voice search active')}
                                theme={theme}
                                className="w-full"
                            />
                            {/* Quick Actions Dropdown (Plus button) */}
                            <QuickActionDropdown 
                                theme={theme}
                                onActionSelect={handleQuickAction}
                                className="ml-2"
                            />
                        </GlassCard>

                    {searchQuery.trim() && (
                        <div className="absolute left-0 right-0 top-full mt-2 z-20">
                            <GlassCard theme={theme} className="p-2" style={{ borderRadius: 20, backgroundColor: colors.tileSurface, border: 'none', boxShadow: colors.tileShadow }}>
                                <div className="space-y-1">
                                    {spotlightResults.map((app) => (
                                        <button
                                            key={app.route}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                onNavigate?.(app.route);
                                                setSearchQuery('');
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${hoverBg} transition-colors`}
                                        >
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.accent}12` }}>
                                                <app.icon className="w-4 h-4" style={{ color: colors.accent }} />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{app.name}</div>
                                                <div className="text-xs" style={{ color: colors.textSecondary }}>{app.route}</div>
                                            </div>
                                        </button>
                                    ))}

                                    <button
                                        onMouseDown={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            openChatFromQuery(searchQuery);
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${hoverBg} transition-colors`}
                                    >
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.accent}12` }}>
                                            <MessageCircle className="w-4 h-4" style={{ color: colors.accent }} />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Ask Elliott Bot</div>
                                            <div className="text-xs" style={{ color: colors.textSecondary }}>
                                                {searchQuery.trim()}
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </GlassCard>
                        </div>
                    )}
                    </div>
                </div>

                {/* App grid */}
                <div className="relative">
                    {isEditMode ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging } }}
                            onDragStart={(event) => setActiveDragId(event.active?.id || null)}
                            onDragEnd={(event) => {
                                const { active, over } = event;
                                // If dropped on the remove zone, remove the app
                                if (over?.id === '__remove_zone__' && active?.id) {
                                    if (!NON_REMOVABLE_APPS.has(active.id) && safeHomeApps.length > MIN_PINNED_APPS) {
                                        onUpdateHomeApps(safeHomeApps.filter(r => r !== active.id));
                                    }
                                } else {
                                    handleReorder(event);
                                }
                                setActiveDragId(null);
                            }}
                            onDragCancel={() => setActiveDragId(null)}
                        >
                            <SortableContext items={safeHomeApps} strategy={rectSortingStrategy}>
                                <div className={`grid gap-1.5 sm:gap-2 ${appGridCols.edit}`}>
                                    {currentApps.map((app) => (
                                        <SortableAppTile
                                            key={app.route}
                                            id={app.route}
                                            app={app}
                                            colors={colors}
                                            onRemove={toggleApp}
                                            isRemoveDisabled={safeHomeApps.length <= MIN_PINNED_APPS}
                                            isRemoveLocked={NON_REMOVABLE_APPS.has(app.route)}
                                        />
                                    ))}
                                    {/* Done button as last grid tile */}
                                    <button
                                        onClick={() => setIsEditMode(false)}
                                        className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-all active:scale-95 shadow-sm"
                                        style={{
                                            minHeight: 104,
                                            backgroundColor: colors.accent,
                                            color: isDark ? '#000' : '#fff',
                                        }}
                                    >
                                        <Check className="w-5 h-5" style={{ color: isDark ? '#000' : '#fff' }} />
                                        <span className="text-xs font-bold tracking-tight" style={{ color: isDark ? '#000' : '#fff' }}>Done</span>
                                    </button>
                                </div>
                            </SortableContext>

                            {/* Add / Remove zone */}
                            <div className="space-y-1.5 pt-3">
                                <div className="text-xs font-medium px-0.5" style={{ color: colors.textSecondary, opacity: 0.5 }}>Tap to add apps to your home</div>
                                <RemoveDropZone isDark={isDark} colors={colors} isActive={!!activeDragId}>
                                    <div className={`grid gap-1.5 ${appGridCols.edit}`}>
                                        {availableApps.map((app) => (
                                            <button
                                                key={app.route}
                                                onClick={() => toggleApp(app.route)}
                                                className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                                                style={{
                                                    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(53,53,53,0.07)',
                                                    color: colors.textSecondary,
                                                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                                                }}
                                            >
                                                <Plus className="w-3 h-3 opacity-50 shrink-0" />
                                                <span className="truncate">{app.name}</span>
                                            </button>
                                        ))}
                                        {availableApps.length === 0 && (
                                            <span className="text-xs py-1 col-span-full text-center" style={{ color: colors.textSecondary, opacity: 0.5 }}>All apps added</span>
                                        )}
                                    </div>
                                </RemoveDropZone>
                            </div>

                            <DragOverlay>
                                {activeApp ? (
                                    <div style={{ width: 104 }}>
                                        <div
                                            className="relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl"
                                            style={{
                                                backgroundColor: colors.tileSurface,
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                                minHeight: 104,
                                            }}
                                        >
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center mb-0.5"
                                                style={{ backgroundColor: `${colors.accent}10` }}
                                            >
                                                <activeApp.icon className="w-5 h-5" style={{ color: colors.accent }} />
                                            </div>
                                            <span
                                                className="text-xs font-semibold tracking-tight text-center leading-tight line-clamp-2 w-full px-1"
                                                style={{ color: colors.textPrimary }}
                                            >
                                                {activeApp.name}
                                            </span>
                                        </div>
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    ) : (
                        <>
                        <div className={`grid gap-1.5 sm:gap-2 ${appGridCols.view}`}>
                            {currentApps.map((app) => {
                                const badge = getAppBadge(app.route, recentOrders, posts, leadTimeFavoritesData, samplesCartCount);
                                return (
                                    <button
                                        key={app.route}
                                        onClick={() => onNavigate(app.route)}
                                        aria-label={`Open ${app.name}`}
                                        className="relative flex flex-col items-center justify-center rounded-2xl transition-all active:scale-95 group gap-1.5 p-2.5 sm:p-3"
                                        style={{
                                            minHeight: 88,
                                            backgroundColor: colors.tileSurface,
                                            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                                        }}
                                    >
                                        <div
                                            className="rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 w-9 h-9 sm:w-10 sm:h-10"
                                            style={{ backgroundColor: `${colors.accent}10` }}
                                        >
                                            <app.icon className="w-[18px] h-[18px] sm:w-5 sm:h-5" style={{ color: colors.accent }} />
                                        </div>
                                        <span className="text-xs sm:text-[13px] font-semibold tracking-tight text-center leading-tight line-clamp-2 px-0.5" style={{ color: colors.textPrimary }}>
                                            {app.name}
                                        </span>
                                        {badge && (
                                            <div
                                                className="absolute top-1.5 right-1.5 px-1.5 py-[1px] rounded-full text-[10px] font-bold"
                                                style={{
                                                    backgroundColor: `${badge.color}18`,
                                                    color: badge.color,
                                                    border: `1px solid ${badge.color}30`,
                                                }}
                                            >
                                                {badge.value}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {/* Compact edit strip — positioned inside the section gap, not adding height */}
                        {onUpdateHomeApps && (
                            <button
                                onClick={() => setIsEditMode(true)}
                                aria-label="Customize home apps"
                                className="absolute right-0 flex items-center gap-1.5 transition-opacity hover:opacity-60 active:opacity-40"
                                style={{ bottom: 'calc(var(--section-gap) * -0.5)', transform: 'translateY(50%)' }}
                            >
                                <Settings2 className="w-3 h-3" style={{ color: colors.textSecondary, opacity: 0.35 }} />
                                <span className="text-[9.5px] font-medium" style={{ color: colors.textSecondary, opacity: 0.35 }}>Customize</span>
                            </button>
                        )}
                        </>
                    )}
                </div>

                {/* Home feature card(s) — flex-grow to fill remaining space */}
                <div className="grid grid-cols-1 sm:grid-cols-2 flex-1 min-h-0" style={{ gap: 'var(--section-gap)' }}>
                    <GlassCard
                        theme={theme}
                        className={`flex flex-col cursor-pointer transition-all duration-300 overflow-hidden ${isEditMode ? 'ring-2 ring-dashed' : ''}`}
                        style={{
                            borderRadius: 24,
                            backgroundColor: colors.tileSurface,
                            padding: 0,
                            border: isEditMode
                                ? `2px dashed ${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(53,53,53,0.20)'}`
                                : 'none',
                            boxShadow: isEditMode ? 'none' : colors.tileShadow,
                        }}
                        onClick={(e) => {
                            if (isEditMode) return;
                            if (e.target.closest('button, a, select')) return;
                            navigateFeature(homeFeatureMode);
                        }}
                    >
                        <div className="flex items-center justify-between px-6 pt-5 pb-3 flex-shrink-0">
                            <h4 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                                {homeFeatureOptions.find(o => o.id === homeFeatureMode)?.label || 'Recent Activity'}
                            </h4>
                            {isEditMode ? (
                                <FeaturePicker
                                    value={homeFeatureMode}
                                    onChange={setHomeFeatureMode}
                                    options={homeFeatureOptions}
                                    colors={colors}
                                    isDark={isDark}
                                />
                            ) : (
                                <button
                                    onClick={() => navigateFeature(homeFeatureMode)}
                                    className="text-[9.5px] font-medium flex items-center gap-0.5 transition-opacity hover:opacity-60"
                                    style={{ color: colors.textSecondary, opacity: 0.35 }}
                                >
                                    Open
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        {isEditMode && (
                            <p className="text-[11px] font-medium mb-3 px-6 flex items-center gap-1" style={{ color: colors.accent, opacity: 0.7 }}>
                                <ChevronDown className="w-3 h-3" /> Use the dropdown above to change this card's content
                            </p>
                        )}
                        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-6 pb-5">
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={homeFeatureMode}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.2 }}
                              >
                                {renderHomeFeatureContent(homeFeatureMode)}
                              </motion.div>
                            </AnimatePresence>
                        </div>
                    </GlassCard>

                    <GlassCard
                        theme={theme}
                        className={`hidden sm:flex flex-col cursor-pointer transition-all duration-300 overflow-hidden`}
                        style={{
                            borderRadius: 24,
                            backgroundColor: colors.tileSurface,
                            padding: 0,
                            border: isEditMode
                                ? `2px dashed ${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(53,53,53,0.20)'}`
                                : 'none',
                            boxShadow: isEditMode ? 'none' : colors.tileShadow,
                        }}
                        onClick={(e) => {
                            if (isEditMode) return;
                            if (e.target.closest('button, a, select')) return;
                            navigateFeature(secondaryFeatureMode);
                        }}
                    >
                        <div className="flex items-center justify-between px-6 pt-5 pb-3 flex-shrink-0">
                            <h4 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                                {homeFeatureOptions.find(o => o.id === secondaryFeatureMode)?.label || 'Community'}
                            </h4>
                            {isEditMode ? (
                                <FeaturePicker
                                    value={secondaryFeatureMode}
                                    onChange={setSecondaryFeatureMode}
                                    options={homeFeatureOptions}
                                    colors={colors}
                                    isDark={isDark}
                                />
                            ) : (
                                <button
                                    onClick={() => navigateFeature(secondaryFeatureMode)}
                                    className="text-[9.5px] font-medium flex items-center gap-0.5 transition-opacity hover:opacity-60"
                                    style={{ color: colors.textSecondary, opacity: 0.35 }}
                                >
                                    Open
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        {isEditMode && (
                            <p className="text-[11px] font-medium mb-3 px-6 flex items-center gap-1" style={{ color: colors.accent, opacity: 0.7 }}>
                                <ChevronDown className="w-3 h-3" /> Use the dropdown above to change this card's content
                            </p>
                        )}
                        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-6 pb-5">
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={secondaryFeatureMode}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.2 }}
                              >
                                {renderHomeFeatureContent(secondaryFeatureMode)}
                              </motion.div>
                            </AnimatePresence>
                        </div>
                    </GlassCard>
                </div>

                {/* Glassy feedback bar — in flow, not fixed */}
                {!isEditMode && (
                    <button
                        onClick={() => onNavigate('feedback')}
                        className="flex-shrink-0 flex items-center justify-between px-5 h-12 w-full rounded-full transition-all active:scale-[0.99] mb-2"
                        style={{
                            backgroundColor: colors.tileSurface,
                            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                            borderRadius: 9999,
                        }}
                    >
                        <span className="text-[9.5px] font-medium" style={{ color: colors.textSecondary, opacity: 0.35 }}>Help us improve MyJSI</span>
                        <span className="flex items-center gap-0.5 text-[9.5px] font-medium" style={{ color: colors.textSecondary, opacity: 0.35 }}>
                            Share Feedback <ChevronRight className="w-3 h-3" />
                        </span>
                    </button>
                )}
            </div>

            {/* Request Quote Modal */}
            <RequestQuoteModal
                show={showQuoteModal}
                onClose={() => setShowQuoteModal(false)}
                theme={theme}
                onSubmit={(data) => {
                    // TODO: wire to quote submission API
                    if (import.meta.env.DEV) console.log('Quote request submitted:', data);
                }}
            />

            {isChatOpen && (
                <div
                    className="fixed inset-0 z-[999] flex items-center justify-center"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Elliott Bot"
                >
                    <div
                        className="w-full h-full flex flex-col"
                        style={{ backgroundColor: colors.background }}
                    >
                        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b" style={{ borderColor: colors.border }}>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center"
                                    style={{
                                        background: 'linear-gradient(135deg, #E8D1C2, #D3A891)',
                                        border: `1px solid ${colors.border}`
                                    }}
                                    aria-hidden="true"
                                >
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 9.2c0-3.1 2.7-5.6 6-5.6s6 2.5 6 5.6v2.6c0 3.1-2.7 5.6-6 5.6s-6-2.5-6-5.6V9.2z" fill="#F4E1D3" />
                                        <path d="M6.2 9.2c1.2-2.6 3.6-4.1 5.8-4.1 2.2 0 4.6 1.5 5.8 4.1" stroke="#B6B0A8" strokeWidth="1.6" strokeLinecap="round" />
                                        <circle cx="9.3" cy="10.3" r="0.8" fill="#6B4B3E" />
                                        <circle cx="14.7" cy="10.3" r="0.8" fill="#6B4B3E" />
                                        <path d="M8.2 12.6c1.4 1.2 6.2 1.2 7.6 0" stroke="#6B4B3E" strokeWidth="1.1" strokeLinecap="round" />
                                        <path d="M7.6 10.1h3.6" stroke="#6B4B3E" strokeWidth="0.9" strokeLinecap="round" />
                                        <path d="M12.8 10.1h3.6" stroke="#6B4B3E" strokeWidth="0.9" strokeLinecap="round" />
                                        <circle cx="12" cy="10.1" r="0.5" fill="#6B4B3E" />
                                        <path d="M6.4 17.2l3.4-2.3 2.2 1.5-2.2 1.5-3.4-2.3z" fill="#2E6BE6" />
                                        <path d="M17.6 17.2l-3.4-2.3-2.2 1.5 2.2 1.5 3.4-2.3z" fill="#E64A8B" />
                                        <circle cx="12" cy="16.6" r="0.9" fill="#FFD166" />
                                    </svg>
                                </div>
                                <div className="leading-tight">
                                    <div className="text-lg font-semibold" style={{ color: colors.textPrimary }}>Elliott Bot</div>
                                    <div className="text-xs" style={{ color: colors.textSecondary }}>Helpful assistant</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.03]'}`}
                                aria-label="Close chat"
                            >
                                <X className="w-5 h-5" style={{ color: colors.textSecondary }} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4" ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}>
                            {chatMessages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                                    <div
                                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                                        style={{
                                            background: 'linear-gradient(135deg, #E8D1C2, #D3A891)',
                                            border: `1px solid ${colors.border}`
                                        }}
                                    >
                                        <MessageCircle className="w-7 h-7" style={{ color: '#6B4B3E' }} />
                                    </div>
                                    <p className="text-sm font-semibold mb-1" style={{ color: colors.textPrimary }}>
                                        Hi, I'm Elliott!
                                    </p>
                                    <p className="text-xs" style={{ color: colors.textSecondary }}>
                                        Ask me about orders, lead times, products, samples, or anything else about JSI.
                                    </p>
                                </div>
                            ) : (
                                chatMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className="px-4 py-3 rounded-2xl text-sm max-w-[75%] space-y-2"
                                            style={{
                                                backgroundColor: msg.role === 'user' ? colors.textPrimary : colors.surface,
                                                color: msg.role === 'user' ? '#FFFFFF' : colors.textPrimary,
                                                border: msg.role === 'user' ? 'none' : `1px solid ${colors.border}`
                                            }}
                                        >
                                            <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                                                __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            }} />
                                            {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {msg.attachments.map((file) => (
                                                        <span
                                                            key={file.id}
                                                            className="text-[11px] px-2 py-1 rounded-full"
                                                            style={{
                                                                backgroundColor: msg.role === 'user' ? 'rgba(255,255,255,0.2)' : `${colors.border}66`,
                                                                color: msg.role === 'user' ? '#FFFFFF' : colors.textSecondary
                                                            }}
                                                        >
                                                            {file.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                            {isBotThinking && (
                                <div className="flex justify-start">
                                    <div
                                        className="px-4 py-3 rounded-2xl text-sm"
                                        style={{
                                            backgroundColor: colors.surface,
                                            color: colors.textSecondary,
                                            border: `1px solid ${colors.border}`
                                        }}
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: colors.textSecondary }} />
                                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: colors.textSecondary }} />
                                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: colors.textSecondary }} />
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t px-5 py-4" style={{ borderColor: colors.border }}>
                            {chatAttachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {chatAttachments.map((file) => (
                                        <div
                                            key={file.id}
                                            className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs"
                                            style={{ backgroundColor: `${colors.surface}CC`, border: `1px solid ${colors.border}`, color: colors.textSecondary }}
                                        >
                                            <span className="truncate max-w-[200px]">{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAttachment(file.id)}
                                                className="hover:opacity-80"
                                                aria-label="Remove attachment"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                                <input
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-3 rounded-full text-sm outline-none"
                                    style={{
                                        backgroundColor: colors.surface,
                                        color: colors.textPrimary,
                                        border: `1px solid ${colors.border}`
                                    }}
                                    aria-label="Chat message"
                                />
                                <input
                                    ref={chatFileInputRef}
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleChatFilesSelected}
                                />
                                <button
                                    type="button"
                                    onClick={handleChatFilePick}
                                    className="w-11 h-11 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: `${colors.surface}CC`, border: `1px solid ${colors.border}`, color: colors.textSecondary }}
                                    aria-label="Add attachment"
                                >
                                    <Paperclip className="w-4 h-4" />
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-3 rounded-full text-sm font-semibold transition-all active:scale-95"
                                    style={{ backgroundColor: colors.textPrimary, color: colors.accentText }}
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
});
HomeScreen.displayName = 'HomeScreen';
