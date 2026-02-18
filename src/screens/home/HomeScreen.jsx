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
import { Check, Plus, X, Settings as SettingsIcon, GripVertical, Lock, Paperclip, MessageCircle, Megaphone, Package, Calendar, DollarSign, Zap, ChevronRight, ChevronDown } from 'lucide-react';
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
        backgroundColor: `${colors.tileSurface || colors.surface}`,
        boxShadow: isOverlay ? '0 8px 24px rgba(0,0,0,0.1)' : (isDragging ? '0 4px 12px rgba(0,0,0,0.08)' : 'none'),
        opacity: isDragging ? 0.9 : 1,
        zIndex: isDragging ? 20 : 'auto',
        touchAction: 'none', // Critical for pointer interactions
        width: '100%',
        minWidth: 0,
        minHeight: 104
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl cursor-grab active:cursor-grabbing"
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
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-1" 
                style={{ backgroundColor: `${colors.accent}10` }}
            >
                <app.icon className="w-5 h-5" style={{ color: colors.accent }} />
            </div>

            {/* App Name */}
            <span 
                className="text-[11px] font-semibold tracking-tight text-center leading-tight line-clamp-2 w-full px-1" 
                style={{ color: colors.textPrimary }}
            >
                {app.name}
            </span>
        </div>
    );
});

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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all active:scale-95"
                style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                    color: colors.textSecondary,
                    border: `1px solid ${colors.border}`,
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
        if (!hasEnteredRef.current) return;
        // Only allow turning OFF (clicking switches to light mode)
        setLampLightReady(false);
        lampAnim.start(
            { y: -50, opacity: 0 },
            { duration: 0.38, ease: [0.4, 0, 0.7, 0.2] }
        ).then(() => {
            setLampOn(false);
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

    const hoverBg = isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.03]';
    const subtleBg = isDark ? 'bg-white/[0.08]' : 'bg-black/5';

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
    }, [colors, leadTimeFavoritesData, communityPosts, onNavigate, recentOrders, hoverBg, subtleBg]);

    return (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide app-header-offset" style={{ backgroundColor: colors.background, position: 'relative', overflowX: 'hidden' }}>

            {/* ── Indie Sconce – only visible in dark mode, portalled to body ── */}
            {isDarkMode && ReactDOM.createPortal(
            <div
                className="select-none"
                style={{
                    position: 'fixed',
                    top: 0,
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
                {/* Perspective wrapper — gentle 3D tilt */}
                <div style={{ perspective: '800px' }}>
                <div style={{ transform: 'rotateY(18deg) rotateX(-3deg)', transformStyle: 'preserve-3d' }}>
                <motion.div
                    initial={{ y: -70, opacity: 0, rotate: 0 }}
                    animate={lampAnim}
                    style={{ transformOrigin: '75% 0%' }}
                >
                    <svg width="54" height="68" viewBox="0 0 140 190" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            {/* Fabric shade gradient - light grey linen, light from upper-left */}
                            <linearGradient id="shadeFabric" x1="0.05" y1="0" x2="0.95" y2="1">
                                <stop offset="0%" stopColor="#DDDAD6"/>
                                <stop offset="25%" stopColor="#D4D1CC"/>
                                <stop offset="55%" stopColor="#C9C6C1"/>
                                <stop offset="100%" stopColor="#BDBAB4"/>
                            </linearGradient>
                            {/* Right-side shadow to show shade is 3D */}
                            <linearGradient id="shadeShadow" x1="0" y1="0.5" x2="1" y2="0.5">
                                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                                <stop offset="65%" stopColor="rgba(0,0,0,0)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,0.06)" />
                            </linearGradient>
                            {/* Wood dowel */}
                            <linearGradient id="woodMount" x1="0.5" y1="0" x2="0.5" y2="1">
                                <stop offset="0%" stopColor="#E6DCBA"/>
                                <stop offset="50%" stopColor="#D9CCA4"/>
                                <stop offset="100%" stopColor="#CCBE90"/>
                            </linearGradient>
                            <filter id="lampShadow" x="-12%" y="-6%" width="124%" height="116%">
                                <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
                                <feOffset dx="0" dy="1.5" result="offsetBlur"/>
                                <feFlood floodColor="rgba(0,0,0,0.08)" result="color"/>
                                <feComposite in2="offsetBlur" operator="in"/>
                                <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
                            </filter>
                        </defs>

                        {/* Vertical wooden dowel — thin birch, visible above shade & below */}
                        <rect x="97" y="42" width="5.5" height="132" rx="2.75" fill="url(#woodMount)"/>
                        <line x1="99" y1="44" x2="99" y2="170" stroke="rgba(185,160,115,0.12)" strokeWidth="0.4"/>

                        {/* Dark metal hook arm — goes up from dowel, curves right, hooks right-and-down */}
                        <path d="M100 42 L100 22 C100 10 109 4 118 4" stroke="#3A3D41" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        {/* Hook curl — curls to the right and downward like a shepherd's crook */}
                        <path d="M118 4 C128 4 134 10 134 18 C134 26 129 30 124 30" stroke="#3A3D41" strokeWidth="3.8" strokeLinecap="round" fill="none"/>

                        {/* Tapered fabric shade — narrower top, wider bottom, near-straight sides with very subtle curve */}
                        <g filter="url(#lampShadow)">
                            {/* Main shade body */}
                            <path d="M58 68 L104 68 C106 86 112 114 118 144 L38 144 C44 114 50 86 58 68 Z" fill="url(#shadeFabric)"/>
                            {/* 3D shadow on right side */}
                            <path d="M58 68 L104 68 C106 86 112 114 118 144 L38 144 C44 114 50 86 58 68 Z" fill="url(#shadeShadow)"/>
                            {/* Outline */}
                            <path d="M58 68 L104 68 C106 86 112 114 118 144 L38 144 C44 114 50 86 58 68 Z" stroke="rgba(160,155,148,0.22)" strokeWidth="0.6" fill="none"/>
                            {/* Subtle horizontal fabric weave texture */}
                            <line x1="55" y1="82" x2="109" y2="82" stroke="rgba(160,155,148,0.05)" strokeWidth="0.4"/>
                            <line x1="52" y1="96" x2="112" y2="96" stroke="rgba(160,155,148,0.05)" strokeWidth="0.4"/>
                            <line x1="48" y1="110" x2="115" y2="110" stroke="rgba(160,155,148,0.04)" strokeWidth="0.4"/>
                            <line x1="45" y1="124" x2="117" y2="124" stroke="rgba(160,155,148,0.04)" strokeWidth="0.4"/>
                            <line x1="42" y1="138" x2="118" y2="138" stroke="rgba(160,155,148,0.03)" strokeWidth="0.4"/>
                        </g>

                        {/* Top rim */}
                        <ellipse cx="81" cy="68" rx="23" ry="2" fill="rgba(205,200,194,0.35)"/>
                        {/* Bottom rim */}
                        <ellipse cx="78" cy="144" rx="40" ry="2.8" fill="rgba(185,180,172,0.25)"/>

                        {/* Hanging cord */}
                        <path d="M78 147 C78 158 77.5 168 77 186" stroke="#2F3136" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
                    </svg>
                </motion.div>
                </div>
                </div>

                {/* Light effects — warm layered glow beneath shade */}
                {/* Primary light cone */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: lampLightReady && lampOn ? 1 : 0 }}
                    transition={{ duration: 2.2, ease: [0.15, 0.85, 0.3, 1] }}
                    style={{ position: 'absolute', top: 58, left: '44%', transform: 'translateX(-50%)',
                        width: 96, height: 460,
                        background: 'radial-gradient(ellipse 36% 50% at 50% 0%, rgba(255,225,170,0.14) 0%, rgba(255,212,155,0.05) 35%, rgba(255,200,145,0.012) 60%, transparent 82%)',
                        pointerEvents: 'none', filter: 'blur(3px)' }} />
                {/* Secondary warm halo around shade bottom */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: lampLightReady && lampOn ? 0.7 : 0 }}
                    transition={{ duration: 2.0, ease: [0.15, 0.85, 0.3, 1], delay: 0.3 }}
                    style={{ position: 'absolute', top: 50, left: '44%', transform: 'translateX(-50%)',
                        width: 72, height: 20, borderRadius: '50%',
                        background: 'radial-gradient(ellipse at 50% 80%, rgba(255,228,185,0.16) 0%, rgba(255,218,165,0.04) 55%, transparent 78%)',
                        pointerEvents: 'none', filter: 'blur(4px)' }} />
                {/* Subtle ambient glow */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: lampLightReady && lampOn ? 0.45 : 0 }}
                    transition={{ duration: 2.6, ease: [0.15, 0.85, 0.3, 1], delay: 0.5 }}
                    style={{ position: 'absolute', top: 30, left: '44%', transform: 'translateX(-50%)',
                        width: 130, height: 80, borderRadius: '50%',
                        background: 'radial-gradient(ellipse at 50% 70%, rgba(255,235,200,0.06) 0%, transparent 70%)',
                        pointerEvents: 'none', filter: 'blur(8px)' }} />
            </div>,
            document.body
            )}

            <div className="px-4 sm:px-6 lg:px-8 pt-0 sm:pt-1 pb-36 space-y-5 lg:space-y-7 max-w-5xl mx-auto w-full" style={{ position: 'relative', zIndex: 2 }}>

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
                    <div className="flex items-center justify-between px-0.5">
                        <div className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: colors.textSecondary, opacity: 0.55 }}>
                            Core Apps
                        </div>
                        {onUpdateHomeApps && (
                            <button
                                onClick={() => setIsEditMode(!isEditMode)}
                                title={isEditMode ? 'Exit edit mode' : 'Customize home apps'}
                                aria-label={isEditMode ? 'Exit edit mode' : 'Customize home apps'}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold transition-all active:scale-95"
                                style={{
                                    backgroundColor: isEditMode ? colors.textPrimary : `${colors.tileSurface}CC`,
                                    color: isEditMode ? '#FFFFFF' : colors.textSecondary,
                                    border: 'none'
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
                                        <span>Edit Layout</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                    {isEditMode && (
                        <div
                            className="text-[10px] font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-2"
                            style={{ color: colors.textSecondary, backgroundColor: `${colors.tileSurface}` }}
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
                                            className="relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl"
                                            style={{
                                                backgroundColor: colors.tileSurface,
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                                width: '100%',
                                                minWidth: 0,
                                                minHeight: 104
                                            }}
                                        >
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center mb-0.5"
                                                style={{ backgroundColor: `${colors.accent}10` }}
                                            >
                                                <activeApp.icon className="w-5 h-5" style={{ color: colors.accent }} />
                                            </div>
                                            <span
                                                className="text-[11px] font-semibold tracking-tight text-center leading-tight line-clamp-2 w-full px-1"
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
                                        className="relative flex flex-col items-center justify-center rounded-2xl transition-all active:scale-95 group gap-1.5 p-3"
                                        style={{
                                            minHeight: 104,
                                            backgroundColor: colors.tileSurface,
                                            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                                            boxShadow: 'none',
                                            width: '100%',
                                            minWidth: 0
                                        }}
                                    >
                                        <div
                                            className="rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 w-10 h-10"
                                            style={{ backgroundColor: `${colors.accent}10` }}
                                        >
                                            <app.icon className="w-5 h-5" style={{ color: colors.accent }} />
                                        </div>
                                        <span className="text-[11px] font-semibold tracking-tight text-center leading-tight line-clamp-2 px-1" style={{ color: colors.textPrimary }}>
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
                                            backgroundColor: colors.tileSurface,
                                            borderColor: 'transparent',
                                            width: '100%',
                                            minWidth: 0
                                        }}
                                    >
                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.accent}10` }}>
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
                        className="p-6 cursor-pointer transition-shadow"
                        style={{ borderRadius: 24, backgroundColor: colors.tileSurface, border: 'none', boxShadow: colors.tileShadow }}
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
                                <FeaturePicker
                                    value={homeFeatureMode}
                                    onChange={setHomeFeatureMode}
                                    options={homeFeatureOptions}
                                    colors={colors}
                                    isDark={isDark}
                                />
                            ) : (
                                <button
                                    onClick={() => {
                                        if (homeFeatureMode === 'community') onNavigate('community');
                                        else if (homeFeatureMode === 'lead-times') onNavigate('resources/lead-times');
                                        else if (homeFeatureMode === 'products') onNavigate('products');
                                        else if (homeFeatureMode === 'projects') onNavigate('projects');
                                        else onNavigate('orders');
                                    }}
                                    className="text-[11px] font-semibold uppercase tracking-widest flex items-center gap-1 transition-opacity hover:opacity-60"
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
                        className="p-6 hidden lg:block cursor-pointer transition-shadow"
                        style={{ borderRadius: 24, backgroundColor: colors.tileSurface, border: 'none', boxShadow: colors.tileShadow }}
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
                                <FeaturePicker
                                    value={secondaryFeatureMode}
                                    onChange={setSecondaryFeatureMode}
                                    options={homeFeatureOptions}
                                    colors={colors}
                                    isDark={isDark}
                                />
                            ) : (
                                <button
                                    onClick={() => {
                                        if (secondaryFeatureMode === 'community') onNavigate('community');
                                        else if (secondaryFeatureMode === 'lead-times') onNavigate('resources/lead-times');
                                        else if (secondaryFeatureMode === 'products') onNavigate('products');
                                        else if (secondaryFeatureMode === 'projects') onNavigate('projects');
                                        else onNavigate('orders');
                                    }}
                                    className="text-[11px] font-semibold uppercase tracking-widest flex items-center gap-1 transition-opacity hover:opacity-60"
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
            </div>

            {/* Sticky glassy feedback bar — above bottom nav */}
            <div
                className="fixed inset-x-0 z-[28] px-5 sm:px-7 lg:px-10 pointer-events-none"
                style={{ bottom: 82 }}
            >
                <button
                    onClick={() => onNavigate('feedback')}
                    className="max-w-5xl mx-auto pointer-events-auto flex items-center justify-between px-5 py-2.5 w-full transition-all active:scale-[0.99]"
                    style={{
                        backdropFilter: 'blur(48px)',
                        WebkitBackdropFilter: 'blur(48px)',
                        backgroundColor: isDark ? 'rgba(18,18,18,0.14)' : 'rgba(250,248,245,0.14)',
                        border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.07)',
                        borderRadius: 999,
                        display: 'flex',
                    }}
                >
                    <p className="text-[11px] opacity-30" style={{ color: colors.textPrimary }}>
                        Help us improve MyJSI
                    </p>
                    <span
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold"
                        style={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.06)',
                            color: colors.textPrimary,
                        }}
                    >
                        Share Feedback
                        <ChevronRight className="w-3 h-3 opacity-40" />
                    </span>
                </button>
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


