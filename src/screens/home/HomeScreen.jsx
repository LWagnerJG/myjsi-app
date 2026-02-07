// Enhanced HomeScreen with Dealer Dashboard design and reconfiguration functionality
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { allApps, DEFAULT_HOME_APPS } from '../../data.jsx';
import { ORDER_DATA } from '../orders/data.js';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { HomeSearchInput } from '../../components/common/SearchInput.jsx';
import { QuickActionDropdown } from '../../components/common/QuickActionDropdown.jsx';
import { RequestQuoteModal } from '../../components/common/RequestQuoteModal.jsx';
import { DESIGN_TOKENS, isDarkTheme } from '../../design-system/tokens.js';
import { Check, Plus, X, Settings as SettingsIcon, GripVertical, Lock, Paperclip, MessageCircle, Megaphone, Package, Calendar, DollarSign, Zap, ChevronRight } from 'lucide-react';
import { LEAD_TIMES_DATA } from '../resources/lead-times/data.js';
import { ANNOUNCEMENTS } from '../community/data.js';
import { motion, useAnimation } from 'framer-motion';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    KeyboardSensor,
    MeasuringStrategy,
    closestCenter,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    SortableContext,
    rectSortingStrategy,
    useSortable,
    arrayMove,
    sortableKeyboardCoordinates,
    defaultAnimateLayoutChanges
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Badge data for specific app routes
const APP_BADGES = {
    'sales': { value: '$1.2M', label: 'YTD', color: '#4A7C59' },
    'projects': { value: '24', label: 'Open', color: '#5B7B8C' }
};

const MIN_PINNED_APPS = 3;
const MAX_PINNED_APPS = 12;
const NON_REMOVABLE_APPS = new Set(['resources']);
const EXCLUDED_ROUTES = new Set(['settings', 'feedback', 'help', 'contracts', 'members', 'resources/dealer_registration']);

const areArraysEqual = (a, b) => {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};

const getCommunityAuthorSafe = (post) => {
    if (!post) return 'Community';
    if (typeof post.user === 'string') return post.user;
    if (typeof post.name === 'string') return post.name;
    if (typeof post.author === 'string') return post.author;
    if (post.user?.name) return post.user.name;
    if (post.user?.firstName || post.user?.lastName) {
        return `${post.user?.firstName || ''} ${post.user?.lastName || ''}`.trim();
    }
    return 'Community';
};

const getCommunityTextSafe = (post) => {
    if (!post) return 'New update available';
    if (typeof post.text === 'string') return post.text;
    if (typeof post.content === 'string') return post.content;
    if (typeof post.message === 'string') return post.message;
    if (typeof post.title === 'string') return post.title;
    return 'New update available';
};

const SortableAppTile = React.memo(({ id, app, colors, onRemove, isRemoveDisabled = false, isRemoveLocked = false, isOverlay = false }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        animateLayoutChanges: (args) => {
            if (isOverlay) return false;
            return defaultAnimateLayoutChanges({
                ...args,
                isSorting: true
            });
        }
    });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? undefined : transition,
        backgroundColor: `${colors.surface}`,
        borderColor: isDragging ? colors.accent : colors.border,
        boxShadow: isOverlay ? '0 18px 32px rgba(0,0,0,0.16)' : (isDragging ? '0 8px 16px rgba(0,0,0,0.1)' : DESIGN_TOKENS.shadows.card),
        opacity: isDragging ? 0.9 : 1,
        zIndex: isDragging ? 20 : 'auto',
        touchAction: 'none', // Critical for pointer interactions
        width: '100%',
        minWidth: 0,
        minHeight: 96
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative flex flex-col items-center justify-center gap-1 p-2.5 rounded-2xl border cursor-grab active:cursor-grabbing"
        >
            {/* Draggable Indicator (Subtle) */}
            <div className="absolute top-2 left-2 opacity-30">
                <GripVertical className="w-3 h-3" style={{ color: colors.textSecondary }} />
            </div>

            {/* Remove Button */}
            {!isOverlay && !isRemoveLocked && (
                <button
                    // Stop propagation so clicking X doesn't start a drag
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isRemoveDisabled) onRemove(app.route);
                    }}
                    className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-white flex items-center justify-center shadow-md z-10 transition-all ${isRemoveDisabled ? 'bg-gray-300 cursor-not-allowed' : 'hover:scale-110'}`}
                    style={!isRemoveDisabled ? { backgroundColor: '#B85C5C' } : undefined}
                    aria-label="Remove app"
                    aria-disabled={isRemoveDisabled}
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}

            {!isOverlay && isRemoveLocked && (
                <div
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center shadow-md z-10"
                    aria-label="Pinned app"
                >
                    <Lock className="w-3.5 h-3.5" />
                </div>
            )}

            {/* App Icon */}
            <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center mb-0.5" 
                style={{ backgroundColor: `${colors.accent}12` }}
            >
                <app.icon className="w-4 h-4" style={{ color: colors.accent }} />
            </div>

            {/* App Name */}
            <span 
                className="text-[10px] font-bold tracking-tight text-center leading-3 line-clamp-2 w-full px-1" 
                style={{ color: colors.textPrimary }}
            >
                {app.name}
            </span>
        </div>
    );
});

export const HomeScreen = ({ theme, onNavigate, onVoiceActivate, homeApps, onUpdateHomeApps, homeResetKey, posts, isDarkMode, onToggleTheme }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeDragId, setActiveDragId] = useState(null);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatAttachments, setChatAttachments] = useState([]);
    const [isBotThinking, setIsBotThinking] = useState(false);
    const chatFileInputRef = useRef(null);
    const botReplyTimeoutRef = useRef(null);
    const [homeFeatureMode, setHomeFeatureMode] = useState('activity');
    const [secondaryFeatureMode, setSecondaryFeatureMode] = useState('community');
    const [leadTimeFavorites, setLeadTimeFavorites] = useState([]);
    const prevHomeResetKeyRef = useRef(homeResetKey);

    // Handle quick action selection from dropdown
    const handleQuickAction = useCallback((actionId) => {
        switch (actionId) {
            case 'quote':
                setShowQuoteModal(true);
                break;
            case 'upload':
                // Could trigger a file upload modal or navigate
                console.log('Upload action');
                break;
            case 'spec':
                // Navigate to spec check or open modal
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
    const [lampOn, setLampOn] = useState(false);
    const lampAnim = useAnimation();
    const hasEnteredRef = useRef(false);

    // Entrance: drop from above, hook on, then auto-on
    useEffect(() => {
        lampAnim.start(
            { y: 0, opacity: 1, rotate: [0, 3, -2, 1, 0] },
            {
                y: { duration: 1.2, ease: [0.22, 0.68, 0.35, 1] },
                opacity: { duration: 0.5, ease: 'easeOut' },
                rotate: { duration: 1.6, delay: 1.0, ease: [0.25, 0.1, 0.25, 1], times: [0, 0.25, 0.55, 0.8, 1] },
            }
        ).then(() => { hasEnteredRef.current = true; });
        const t = setTimeout(() => setLampOn(true), 2800);
        return () => clearTimeout(t);
    }, []);

    // Toggle: slide up to hide / slide down to show + switch theme
    useEffect(() => {
        if (!hasEnteredRef.current) return;
        if (lampOn) {
            // Turn on: switch to dark mode, then slide shade down
            if (!isDarkMode && onToggleTheme) onToggleTheme();
            lampAnim.start({ y: 0, opacity: 1, rotate: 0 }, { type: 'spring', stiffness: 120, damping: 18, mass: 0.6 });
        } else {
            // Turn off: quick smooth slide up, then switch to light mode
            lampAnim.start(
                { y: -60, opacity: 0 },
                { duration: 0.28, ease: [0.5, 0, 0.84, 0] }
            ).then(() => {
                if (isDarkMode && onToggleTheme) onToggleTheme();
            });
        }
    }, [lampOn]);
    const colors = useMemo(() => ({
        background: theme?.colors?.background || '#F0EDE8',
        surface: theme?.colors?.surface || '#FFFFFF',
        accent: theme?.colors?.accent || '#353535',
        textPrimary: theme?.colors?.textPrimary || '#353535',
        textSecondary: theme?.colors?.textSecondary || '#666666',
        border: theme?.colors?.border || '#E3E0D8'
    }), [theme]);

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
                setIsChatOpen(false);
                setSearchQuery('');
                setChatMessages([]);
            }
        }
    }, [homeResetKey, isChatOpen]);

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


    const appendChatTurn = useCallback((text, attachments = []) => {
        const trimmed = text?.trim();
        if (!trimmed) return;
        const now = Date.now();
        setChatMessages((prev) => ([
            ...prev,
            { id: `u-${now}`, role: 'user', text: trimmed, attachments }
        ]));
        if (botReplyTimeoutRef.current) {
            clearTimeout(botReplyTimeoutRef.current);
        }
        setIsBotThinking(true);

        // Generate contextual reply based on query content
        const lower = trimmed.toLowerCase();
        let reply = '';
        if (lower.includes('lead time') || lower.includes('leadtime')) {
            reply = 'You can check current lead times under Resources → Lead Times. Most standard series ship in 4-6 weeks, and Quick Ship items are available in 10 business days.';
        } else if (lower.includes('order') || lower.includes('po ')) {
            reply = 'You can track all your orders from the Orders screen. Use the search bar to find a specific PO number, or filter by status.';
        } else if (lower.includes('sample')) {
            reply = 'Head to the Samples screen to browse and request product samples. You can add items to your cart and submit a request.';
        } else if (lower.includes('commission') || lower.includes('rate')) {
            reply = 'Commission rate information is available under Resources → Commission Rates. Rates vary by product category and dealer tier.';
        } else if (lower.includes('product') || lower.includes('finish') || lower.includes('fabric')) {
            reply = 'Check out the Products screen to browse all JSI product lines, finishes, and fabrics. You can compare products side-by-side too.';
        } else if (lower.includes('project') || lower.includes('lead') || lower.includes('pipeline')) {
            reply = 'Your project pipeline is in the Projects screen. You can add new leads, track existing projects, and manage installs there.';
        } else if (lower.includes('help') || lower.includes('support')) {
            reply = 'For support, visit the Help screen or submit feedback through the Feedback form. You can also contact your JSI rep directly.';
        } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            reply = 'Hello! I\'m Elliott, your JSI assistant. How can I help you today? I can help with orders, lead times, products, samples, and more.';
        } else {
            reply = `I can help with that! Here are some things I can assist with:\n\n• **Orders** — Track POs and shipments\n• **Lead Times** — Check current production schedules\n• **Products** — Browse finishes, fabrics, and specs\n• **Samples** — Request product samples\n• **Projects** — Manage your pipeline\n\nTry asking me about any of these topics!`;
        }

        botReplyTimeoutRef.current = setTimeout(() => {
            setChatMessages((prev) => ([
                ...prev,
                { id: `a-${now}`, role: 'assistant', text: reply }
            ]));
            setIsBotThinking(false);
        }, 700);
    }, []);

    useEffect(() => {
        return () => {
            if (botReplyTimeoutRef.current) {
                clearTimeout(botReplyTimeoutRef.current);
            }
        };
    }, []);

    // Escape key to close chat
    useEffect(() => {
        if (!isChatOpen) return;
        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsChatOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isChatOpen]);

    const openChatFromQuery = useCallback((query) => {
        const trimmed = query?.trim();
        if (!trimmed) return;
        setIsChatOpen(true);
        appendChatTurn(trimmed.replace(/^\?\s*/, ''), []);
        setSearchQuery('');
    }, [appendChatTurn]);

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

    const handleChatSubmit = useCallback((e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        appendChatTurn(chatInput, chatAttachments);
        setChatInput('');
        setChatAttachments([]);
        if (chatFileInputRef.current) {
            chatFileInputRef.current.value = '';
        }
    }, [appendChatTurn, chatAttachments, chatInput]);

    const handleChatFilePick = useCallback(() => {
        chatFileInputRef.current?.click();
    }, []);

    const handleChatFilesSelected = useCallback((event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;
        const mapped = files.map((file) => ({
            id: `${file.name}-${file.size}-${file.lastModified}`,
            name: file.name,
            size: file.size
        }));
        setChatAttachments((prev) => ([...prev, ...mapped]));
    }, []);

    const handleRemoveAttachment = useCallback((id) => {
        setChatAttachments((prev) => prev.filter((file) => file.id !== id));
    }, []);

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

    const latestCommunityPost = communityPosts[0] || null;


    const homeFeatureOptions = useMemo(() => ([
        { id: 'activity', label: 'Recent Activity' },
        { id: 'community', label: 'Community' },
        { id: 'lead-times', label: 'Lead Times' },
        { id: 'announcements', label: 'Announcements' },
        { id: 'products', label: 'Products' },
        { id: 'projects', label: 'Projects' }
    ]), []);

    const leadTimeFavoritesData = useMemo(() => {
        if (!leadTimeFavorites.length) return [];
        return LEAD_TIMES_DATA.filter(item => leadTimeFavorites.includes(item.series))
            .slice(0, 6);
    }, [leadTimeFavorites]);

    const recentOrders = useMemo(() => {
        return [...ORDER_DATA].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    }, []);

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
                                style={{ border: `1px solid ${colors.border}` }}
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
                                            <div className="text-[10px] mt-1 opacity-50" style={{ color: colors.textSecondary }}>
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
                            >
                                <div className="text-left">
                                    <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{item.series}</div>
                                    <div className="text-[10px] uppercase tracking-widest opacity-60" style={{ color: colors.textSecondary }}>{item.type}</div>
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
                                style={{ border: `1px solid ${colors.border}`, borderLeft: `3px solid ${accentColor}` }}
                            >
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>{ann.title}</div>
                                    <div className="text-[10px] mt-0.5 line-clamp-1" style={{ color: colors.textSecondary }}>{ann.subtitle || ann.text}</div>
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
                    <button onClick={() => onNavigate('products')} className={`w-full p-4 rounded-2xl text-left ${hoverBg} transition-colors`} style={{ border: `1px solid ${colors.border}` }}>
                        <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Browse Products</div>
                        <div className="text-xs" style={{ color: colors.textSecondary }}>Explore finishes and specs</div>
                    </button>
                </div>
            );
        }

        if (mode === 'projects') {
            return (
                <div className="space-y-3">
                    <button onClick={() => onNavigate('projects')} className={`w-full p-4 rounded-2xl text-left ${hoverBg} transition-colors`} style={{ border: `1px solid ${colors.border}` }}>
                        <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Project Pipeline</div>
                        <div className="text-xs" style={{ color: colors.textSecondary }}>View leads and installs</div>
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {recentOrders.map((order) => (
                    <button
                        key={order.orderNumber}
                        onClick={() => onNavigate('orders')}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl ${hoverBg} transition-colors`}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-xl ${subtleBg} flex items-center justify-center text-[10px] font-bold`} style={{ color: colors.textPrimary }}>PO</div>
                            <div className="text-left min-w-0">
                                <div className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>{order.company}</div>
                                <div className="text-[10px] uppercase tracking-widest opacity-50" style={{ color: colors.textSecondary }}>
                                    {new Date(order.date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold" style={{ color: colors.textPrimary }}>${order.net.toLocaleString()}</div>
                            <div className="text-[10px] uppercase tracking-widest opacity-50" style={{ color: colors.textSecondary }}>{order.status}</div>
                        </div>
                    </button>
                ))}
            </div>
        );
    }, [colors, isDark, leadTimeFavoritesData, communityPosts, onNavigate, recentOrders]);

    const hoverBg = isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.03]';
    const subtleBg = isDark ? 'bg-white/[0.08]' : 'bg-black/5';

    return (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide app-header-offset" style={{ backgroundColor: colors.background, position: 'relative', overflowX: 'hidden' }}>

            {/* ── Lampshade – portalled to body ── */}
            {ReactDOM.createPortal(
            <div
                className="select-none"
                style={{
                    position: 'fixed',
                    top: 3,
                    right: '30%',
                    zIndex: 35,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                }}
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); setLampOn(prev => !prev); }}
                title={lampOn ? 'Turn light off' : 'Turn light on'}
            >
                <motion.div
                    initial={{ y: -80, opacity: 0, rotate: 0 }}
                    animate={lampAnim}
                    style={{ transformOrigin: '78% 0%', transform: 'rotateY(25deg)' }}
                >
                    {/*
                        Classic empire/cone lampshade:
                        Narrow at top, wide at bottom, straight tapered sides.
                        viewBox 120x160, rendered 44x58.
                    */}
                    <svg width="44" height="46" viewBox="0 0 120 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            {/* Off: muted unlit fabric */}
                            <linearGradient id="shOff" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={isDark ? '#9A9894' : '#E4E2DE'} />
                                <stop offset="100%" stopColor={isDark ? '#807E7C' : '#D4D2CE'} />
                            </linearGradient>
                            {/* On: warm backlit fabric */}
                            <linearGradient id="shOn" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={isDark ? '#FFF8EE' : '#FEFCF8'} />
                                <stop offset="25%" stopColor={isDark ? '#FFF4E2' : '#FDFAF2'} />
                                <stop offset="60%" stopColor={isDark ? '#FCECD0' : '#F8F2E8'} />
                                <stop offset="100%" stopColor={isDark ? '#EDD9B5' : '#F0EAE0'} />
                            </linearGradient>
                            {/* Left-to-right shading for 3D cone form */}
                            <linearGradient id="shCone" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="rgba(0,0,0,0.08)" />
                                <stop offset="15%" stopColor="rgba(0,0,0,0.02)" />
                                <stop offset="40%" stopColor="rgba(255,255,255,0.03)" />
                                <stop offset="60%" stopColor="rgba(255,255,255,0.01)" />
                                <stop offset="85%" stopColor="rgba(0,0,0,0.06)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,0.14)" />
                            </linearGradient>
                            {/* Hotspot glow – concentrated near bulb center */}
                            <radialGradient id="bulbG" cx="0.5" cy="0.35" r="0.45">
                                <stop offset="0%" stopColor={isDark ? 'rgba(255,240,200,0.55)' : 'rgba(255,245,215,0.22)'} />
                                <stop offset="30%" stopColor={isDark ? 'rgba(255,225,170,0.3)' : 'rgba(255,235,190,0.1)'} />
                                <stop offset="65%" stopColor={isDark ? 'rgba(255,215,150,0.08)' : 'rgba(255,225,175,0.03)'} />
                                <stop offset="100%" stopColor="rgba(255,215,150,0)" />
                            </radialGradient>
                            {/* Bottom light pool – warm ellipse beneath shade */}
                            <radialGradient id="btmPool" cx="0.5" cy="0" r="1">
                                <stop offset="0%" stopColor={isDark ? 'rgba(255,220,160,0.55)' : 'rgba(255,225,170,0.22)'} />
                                <stop offset="35%" stopColor={isDark ? 'rgba(255,205,140,0.2)' : 'rgba(255,215,155,0.08)'} />
                                <stop offset="70%" stopColor={isDark ? 'rgba(255,195,125,0.06)' : 'rgba(255,210,150,0.02)'} />
                                <stop offset="100%" stopColor="rgba(255,200,130,0)" />
                            </radialGradient>
                            {/* Warm inner rim glow */}
                            <radialGradient id="rimGlow" cx="0.5" cy="1" r="0.8">
                                <stop offset="0%" stopColor={isDark ? 'rgba(255,225,170,0.35)' : 'rgba(255,230,180,0.12)'} />
                                <stop offset="100%" stopColor="rgba(255,210,150,0)" />
                            </radialGradient>
                        </defs>

                        {/* ─── Brass mount hook (wider) ─── */}
                        <rect x="87" y="4" width="12" height="11" rx="2"
                            fill={isDark ? '#D9C484' : '#D4BE7A'}
                        />
                        {/* Hook highlight */}
                        <rect x="89" y="5" width="4" height="9" rx="1"
                            fill={isDark ? 'rgba(255,240,200,0.15)' : 'rgba(255,245,220,0.2)'}
                        />

                        {/* ─── Brass arm (wider) ─── */}
                        <rect x="89" y="13" width="7" height="107" rx="1.5"
                            fill={isDark ? '#CEAE6A' : '#C9A960'}
                        />
                        {/* Arm center highlight */}
                        <rect x="91" y="15" width="2.5" height="103" rx="0.5"
                            fill={isDark ? 'rgba(255,235,190,0.12)' : 'rgba(255,240,200,0.15)'}
                        />

                        {/* ─── Brass bracket (wider) ─── */}
                        <rect x="50" y="27" width="43" height="4" rx="1.5"
                            fill={isDark ? '#CEAE6A' : '#C9A960'}
                        />
                        {/* Bracket highlight */}
                        <rect x="52" y="28" width="39" height="1.5" rx="0.5"
                            fill={isDark ? 'rgba(255,235,190,0.1)' : 'rgba(255,240,200,0.12)'}
                        />

                        {/* ─── CONE SHADE (off) ─── */}
                        {/* Empire shape: narrow top, wide bottom, shorter */}
                        <path
                            d="M36,30 L84,30 L110,110 L10,110 Z"
                            fill="url(#shOff)"
                            stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}
                            strokeWidth="0.5"
                            strokeLinejoin="round"
                        />

                        {/* ─── CONE SHADE (on – fades in) ─── */}
                        <motion.path
                            d="M36,30 L84,30 L110,110 L10,110 Z"
                            fill="url(#shOn)"
                            strokeWidth="0.5"
                            strokeLinejoin="round"
                            stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: lampOn ? 1 : 0 }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        />

                        {/* 3D cone depth */}
                        <path d="M36,30 L84,30 L110,110 L10,110 Z" fill="url(#shCone)" />

                        {/* Bulb glow through fabric */}
                        <motion.path
                            d="M36,30 L84,30 L110,110 L10,110 Z"
                            fill="url(#bulbG)"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: lampOn ? 1 : 0 }}
                            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                        />

                        {/* Top rim */}
                        <motion.ellipse cx="60" cy="30" rx="26" ry="5"
                            animate={{ fill: lampOn ? (isDark ? '#FFF5E6' : '#FAF7F2') : (isDark ? '#8A8884' : '#DDDBD7') }}
                            transition={{ duration: 0.6 }}
                            stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}
                            strokeWidth="0.5"
                        />
                        {/* Inner opening */}
                        <motion.ellipse cx="60" cy="30" rx="22" ry="3"
                            animate={{ fill: lampOn ? (isDark ? '#FFE8C4' : '#F0E8DA') : (isDark ? '#5A5855' : '#CCC9C4') }}
                            transition={{ duration: 0.6 }}
                        />
                        {/* Bulb visible through top */}
                        <motion.ellipse cx="60" cy="31" rx="12" ry="1.5"
                            fill={isDark ? 'rgba(255,235,190,0.6)' : 'rgba(255,240,200,0.3)'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: lampOn ? 1 : 0 }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        />

                        {/* Bottom rim */}
                        <ellipse cx="60" cy="110" rx="52" ry="4"
                            fill={isDark ? '#E2DED8' : '#EDEBE7'}
                            stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
                            strokeWidth="0.5"
                        />
                        {/* Bottom band */}
                        <rect x="12" y="107" width="96" height="4" rx="0"
                            fill={isDark ? '#E8E5E0' : '#F0EEED'}
                            opacity="0.6"
                        />

                        {/* Bottom light pool */}
                        <motion.ellipse cx="60" cy="118" rx="44" ry="9"
                            fill="url(#btmPool)"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: lampOn ? 1 : 0 }}
                            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                        />

                        {/* Inner rim warm glow – visible when on */}
                        <motion.ellipse cx="60" cy="110" rx="48" ry="6"
                            fill="url(#rimGlow)"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: lampOn ? 1 : 0 }}
                            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                        />
                    </svg>
                </motion.div>

                {/* ══ LIGHT EFFECTS ══ */}

                {/* Layer 1 — Core beam: tight warm column directly under shade opening */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: lampOn ? 1 : 0 }}
                    transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        position: 'absolute',
                        top: 44,
                        left: '44%',
                        transform: 'translateX(-50%)',
                        width: 100,
                        height: 600,
                        background: isDark
                            ? 'radial-gradient(ellipse 38% 42% at 50% 0%, rgba(255,228,178,0.22) 0%, rgba(255,215,160,0.09) 25%, rgba(255,205,148,0.03) 50%, rgba(255,200,140,0.008) 70%, transparent 88%)'
                            : 'radial-gradient(ellipse 38% 42% at 50% 0%, rgba(255,232,188,0.09) 0%, rgba(255,222,170,0.035) 28%, rgba(255,215,158,0.01) 52%, transparent 75%)',
                        pointerEvents: 'none',
                        filter: 'blur(3px)',
                    }}
                />

                {/* Layer 2 — Primary cone: visible V-beam, wider spread */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: lampOn ? 1 : 0 }}
                    transition={{ duration: 3, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        position: 'absolute',
                        top: 44,
                        left: '44%',
                        transform: 'translateX(-50%)',
                        width: 200,
                        height: 550,
                        background: isDark
                            ? 'conic-gradient(from 180deg at 50% 0%, transparent 31%, rgba(255,218,162,0.06) 40%, rgba(255,222,170,0.12) 47%, rgba(255,225,175,0.14) 50%, rgba(255,222,170,0.12) 53%, rgba(255,218,162,0.06) 60%, transparent 69%)'
                            : 'conic-gradient(from 180deg at 50% 0%, transparent 33%, rgba(255,224,175,0.035) 42%, rgba(255,228,180,0.06) 50%, rgba(255,224,175,0.035) 58%, transparent 67%)',
                        pointerEvents: 'none',
                        maskImage: 'linear-gradient(to bottom, white 0%, white 50%, transparent 95%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, white 0%, white 50%, transparent 95%)',
                        filter: 'blur(6px)',
                    }}
                />

                {/* Layer 3 — Ambient wash: very soft wide glow */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: lampOn ? 1 : 0 }}
                    transition={{ duration: 3.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        position: 'absolute',
                        top: 40,
                        left: '44%',
                        transform: 'translateX(-50%)',
                        width: 340,
                        height: 480,
                        background: isDark
                            ? 'radial-gradient(ellipse 58% 45% at 50% 8%, rgba(255,215,158,0.07) 0%, rgba(255,205,142,0.025) 35%, rgba(255,200,135,0.008) 60%, transparent 80%)'
                            : 'radial-gradient(ellipse 58% 45% at 50% 8%, rgba(255,225,172,0.03) 0%, rgba(255,218,160,0.01) 38%, transparent 68%)',
                        pointerEvents: 'none',
                        filter: 'blur(10px)',
                    }}
                />

                {/* Layer 4 — Far ambient halo (dark mode) */}
                {isDark && (
                    <motion.div
                        animate={{ opacity: lampOn ? 1 : 0 }}
                        transition={{ duration: 4, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            position: 'absolute',
                            top: 20,
                            left: '44%',
                            transform: 'translateX(-50%)',
                            width: 500,
                            height: 400,
                            background: 'radial-gradient(ellipse 50% 40% at 50% 18%, rgba(255,218,162,0.035) 0%, rgba(255,210,150,0.012) 40%, rgba(255,205,142,0.004) 60%, transparent 80%)',
                            pointerEvents: 'none',
                            filter: 'blur(14px)',
                        }}
                    />
                )}

                {/* Layer 5 — Upward ceiling bounce */}
                {isDark && (
                    <motion.div
                        animate={{ opacity: lampOn ? 0.7 : 0 }}
                        transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            position: 'absolute',
                            top: -12,
                            left: '44%',
                            transform: 'translateX(-50%)',
                            width: 100,
                            height: 28,
                            borderRadius: '50%',
                            background: 'radial-gradient(ellipse at 50% 100%, rgba(255,230,185,0.12) 0%, rgba(255,220,168,0.04) 45%, transparent 70%)',
                            pointerEvents: 'none',
                            filter: 'blur(4px)',
                        }}
                    />
                )}
            </div>,
            document.body
            )}

            <div className="px-4 sm:px-6 lg:px-8 pt-0 sm:pt-1 pb-20 space-y-4 lg:space-y-6 max-w-5xl mx-auto w-full" style={{ position: 'relative', zIndex: 2 }}>

                {/* Header Section */}
                <div className="space-y-0.5 hidden sm:block">
                    <h2 className="text-3xl font-semibold tracking-tight" style={{ color: colors.textPrimary }}>Dashboard</h2>
                    <div className="text-[13px] font-medium" style={{ color: colors.textSecondary }}>{todayLabel}</div>
                </div>

                {/* Search / Spotlight */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-transparent rounded-full" />
                    <GlassCard
                        theme={theme}
                        className="relative z-10 px-5 flex items-center"
                        style={{
                            borderRadius: 9999,
                            height: 56,
                            paddingTop: 0,
                            paddingBottom: 0,
                            backgroundColor: isDark ? 'rgba(26,26,26,0.78)' : 'rgba(255,255,255,0.78)',
                            backgroundImage: isDark
                                ? 'linear-gradient(180deg, rgba(30,30,30,0.86) 0%, rgba(22,22,22,0.72) 100%)'
                                : 'linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.72) 100%)',
                            border: isDark ? `1px solid rgba(255,255,255,0.08)` : 'none',
                            boxShadow: 'none'
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
                            <GlassCard theme={theme} className="p-2" style={{ borderRadius: 20 }}>
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
                                                <div className="text-[11px]" style={{ color: colors.textSecondary }}>{app.route}</div>
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
                                            <div className="text-[11px]" style={{ color: colors.textSecondary }}>
                                                {searchQuery.trim()}
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </GlassCard>
                        </div>
                    )}
                </div>

                {/* Reconfigurable Apps section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-end">
                        {onUpdateHomeApps && (
                            <button
                                onClick={() => setIsEditMode(!isEditMode)}
                                title={isEditMode ? 'Exit edit mode' : 'Customize home apps'}
                                aria-label={isEditMode ? 'Exit edit mode' : 'Customize home apps'}
                                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all active:scale-95"
                                style={{
                                    backgroundColor: isEditMode ? colors.textPrimary : `${colors.surface}80`,
                                    color: isEditMode ? '#FFFFFF' : colors.textSecondary,
                                    border: `1px solid ${isEditMode ? colors.textPrimary : `${colors.border}B3`}`
                                }}
                            >
                                {isEditMode ? (
                                    <>
                                        <Check className="w-3 h-3" />
                                        <span>Done</span>
                                    </>
                                ) : (
                                    <>
                                        <GripVertical className="w-3 h-3" />
                                        <span>Edit</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                    {isEditMode && (
                        <div
                            className="text-[10px] font-medium px-2.5 py-1 rounded-full border inline-flex items-center gap-2"
                            style={{ color: colors.textSecondary, borderColor: `${colors.border}B3`, backgroundColor: `${colors.surface}A6` }}
                        >
                            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.textSecondary }} />
                            Drag to reorder. Keep at least 3 apps pinned. Resources stays pinned.
                        </div>
                    )}

                    {isEditMode ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging } }}
                            onDragStart={(event) => setActiveDragId(event.active?.id || null)}
                            onDragEnd={(event) => {
                                handleReorder(event);
                                setActiveDragId(null);
                            }}
                            onDragCancel={() => setActiveDragId(null)}
                        >
                            <SortableContext items={safeHomeApps} strategy={rectSortingStrategy}>
                                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
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
                                </div>
                            </SortableContext>
                            <DragOverlay>
                                {activeApp ? (
                                    <div className="w-[96px] sm:w-[104px] lg:w-[112px]">
                                        <div
                                            className="relative flex flex-col items-center justify-center gap-1 p-2.5 rounded-2xl border"
                                            style={{
                                                backgroundColor: colors.surface,
                                                borderColor: colors.accent,
                                                boxShadow: '0 18px 32px rgba(0,0,0,0.16)',
                                                width: '100%',
                                                minWidth: 0,
                                                minHeight: 96
                                            }}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-xl flex items-center justify-center mb-0.5"
                                                style={{ backgroundColor: `${colors.accent}12` }}
                                            >
                                                <activeApp.icon className="w-4 h-4" style={{ color: colors.accent }} />
                                            </div>
                                            <span
                                                className="text-[10px] font-bold tracking-tight text-center leading-3 line-clamp-2 w-full px-1"
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
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                            {currentApps.map((app) => {
                                const badge = APP_BADGES[app.route];
                                return (
                                    <motion.button
                                        key={app.route}
                                        onClick={() => onNavigate(app.route)}
                                        aria-label={`Open ${app.name}`}
                                        className="relative flex flex-col items-center justify-center rounded-2xl transition-all active:scale-95 group gap-1 p-2.5 hover:shadow-xl"
                                        style={{
                                            minHeight: 96,
                                            backgroundColor: colors.surface,
                                            border: `1px solid ${colors.border}`,
                                            boxShadow: DESIGN_TOKENS.shadows.card,
                                            width: '100%',
                                            minWidth: 0
                                        }}
                                    >
                                        <div
                                            className="rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 w-8 h-8"
                                            style={{ backgroundColor: `${colors.accent}12` }}
                                        >
                                            <app.icon className="w-4 h-4" style={{ color: colors.accent }} />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-tight text-center" style={{ color: colors.textPrimary }}>
                                            {app.name}
                                        </span>
                                        {badge && (
                                            <div 
                                                className="absolute top-2 right-2 px-1.5 py-[1px] rounded-full text-[9px] font-bold border"
                                                style={{ 
                                                    backgroundColor: `${badge.color}15`, // Very subtle transparent background 
                                                    color: badge.color,
                                                    borderColor: `${badge.color}30`
                                                }}
                                            >
                                                {badge.value}
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}

                    {isEditMode && (
                        <div className="space-y-2">
                            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.textSecondary }}>Add Apps</div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                                {availableApps.map((app) => (
                                    <motion.button
                                        layout
                                        key={app.route}
                                        onClick={() => toggleApp(app.route)}
                                        className={`flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-xl border border-dashed ${isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.02]'} transition-all active:scale-95`}
                                        style={{
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border,
                                            width: '100%',
                                            minWidth: 0
                                        }}
                                    >
                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center border border-dashed" style={{ borderColor: colors.border }}>
                                            <Plus className="w-3 h-3 opacity-40" style={{ color: colors.textSecondary }} />
                                        </div>
                                        <span className="text-[9px] font-semibold" style={{ color: colors.textSecondary }}>{app.name}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Home feature card(s) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <GlassCard
                        theme={theme}
                        className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                        style={{ borderRadius: 24 }}
                        onClick={(e) => {
                            if (e.target.closest('button, a, select')) return;
                            if (homeFeatureMode === 'community') onNavigate('community');
                            else if (homeFeatureMode === 'lead-times') onNavigate('resources/lead-times');
                            else if (homeFeatureMode === 'products') onNavigate('products');
                            else if (homeFeatureMode === 'projects') onNavigate('projects');
                            else onNavigate('orders');
                        }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                                {homeFeatureOptions.find(o => o.id === homeFeatureMode)?.label || 'Recent Activity'}
                            </h4>
                            {isEditMode ? (
                                <select
                                    value={homeFeatureMode}
                                    onChange={(e) => setHomeFeatureMode(e.target.value)}
                                    className="text-[11px] font-semibold rounded-full px-3 py-1"
                                    style={{
                                        backgroundColor: `${colors.surface}CC`,
                                        color: colors.textSecondary,
                                        border: `1px solid ${colors.border}`
                                    }}
                                >
                                    {homeFeatureOptions.map(option => (
                                        <option key={option.id} value={option.id}>{option.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <button
                                    onClick={() => {
                                        if (homeFeatureMode === 'community') onNavigate('community');
                                        else if (homeFeatureMode === 'lead-times') onNavigate('resources/lead-times');
                                        else if (homeFeatureMode === 'products') onNavigate('products');
                                        else if (homeFeatureMode === 'projects') onNavigate('projects');
                                        else onNavigate('orders');
                                    }}
                                    className="text-[11px] font-semibold uppercase tracking-widest transition-opacity flex items-center gap-1"
                                    style={{ color: colors.textSecondary }}
                                >
                                    Open
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        {renderHomeFeatureContent(homeFeatureMode)}
                    </GlassCard>

                    <GlassCard
                        theme={theme}
                        className="p-6 hidden lg:block cursor-pointer hover:shadow-lg transition-shadow"
                        style={{ borderRadius: 24 }}
                        onClick={(e) => {
                            if (e.target.closest('button, a, select')) return;
                            if (secondaryFeatureMode === 'community') onNavigate('community');
                            else if (secondaryFeatureMode === 'lead-times') onNavigate('resources/lead-times');
                            else if (secondaryFeatureMode === 'products') onNavigate('products');
                            else if (secondaryFeatureMode === 'projects') onNavigate('projects');
                            else onNavigate('orders');
                        }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                                {homeFeatureOptions.find(o => o.id === secondaryFeatureMode)?.label || 'Community'}
                            </h4>
                            {isEditMode ? (
                                <select
                                    value={secondaryFeatureMode}
                                    onChange={(e) => setSecondaryFeatureMode(e.target.value)}
                                    className="text-[11px] font-semibold rounded-full px-3 py-1"
                                    style={{
                                        backgroundColor: `${colors.surface}CC`,
                                        color: colors.textSecondary,
                                        border: `1px solid ${colors.border}`
                                    }}
                                >
                                    {homeFeatureOptions.map(option => (
                                        <option key={option.id} value={option.id}>{option.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <button
                                    onClick={() => {
                                        if (secondaryFeatureMode === 'community') onNavigate('community');
                                        else if (secondaryFeatureMode === 'lead-times') onNavigate('resources/lead-times');
                                        else if (secondaryFeatureMode === 'products') onNavigate('products');
                                        else if (secondaryFeatureMode === 'projects') onNavigate('projects');
                                        else onNavigate('orders');
                                    }}
                                    className="text-[11px] font-semibold uppercase tracking-widest transition-opacity flex items-center gap-1"
                                    style={{ color: colors.textSecondary }}
                                >
                                    Open
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        {renderHomeFeatureContent(secondaryFeatureMode)}
                    </GlassCard>
                </div>

                {/* Feedback CTA */}
                <div className="mt-4 lg:mt-5">
                    <button
                        onClick={() => onNavigate('feedback')}
                        className="w-full px-5 py-4 flex items-center justify-between rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                        style={{
                            backgroundColor: isDark ? 'rgba(40,40,40,0.72)' : 'rgba(255,255,255,0.72)',
                            backdropFilter: 'blur(20px) saturate(150%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.04)'
                        }}
                    >
                        <div className="space-y-0.5 text-left">
                            <h4 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Feedback</h4>
                            <p className="text-xs" style={{ color: colors.textSecondary }}>Improve the MyJSI app experience.</p>
                        </div>
                        <div
                            className="px-4 py-2 rounded-full text-xs font-semibold flex-shrink-0"
                            style={{
                                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(53,53,53,0.06)',
                                color: colors.textPrimary
                            }}
                        >
                            Send
                        </div>
                    </button>
                </div>
            </div>

            {/* Request Quote Modal */}
            <RequestQuoteModal
                show={showQuoteModal}
                onClose={() => setShowQuoteModal(false)}
                theme={theme}
                onSubmit={(data) => {
                    console.log('Quote request submitted:', data);
                    // Handle quote submission - could send to API
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
                                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
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
                                                            className="text-[10px] px-2 py-1 rounded-full"
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
                                            className="flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px]"
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
};


