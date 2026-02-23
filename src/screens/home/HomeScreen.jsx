// Enhanced HomeScreen with Dealer Dashboard design and reconfiguration functionality
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { allApps, DEFAULT_HOME_APPS } from '../../constants/apps.js';
import { ORDER_DATA } from '../orders/data.js';
import { RequestQuoteModal } from '../../components/common/RequestQuoteModal.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import { ChevronRight } from 'lucide-react';
import { LEAD_TIMES_DATA } from '../resources/lead-times/data.js';
import {
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

// Extracted modules
import { HomeHeader } from './components/HomeHeader.jsx';
import { AppGrid } from './components/AppGrid.jsx';
import { HomeFeatureCards } from './components/HomeFeatureCards.jsx';
import { IndieSconce } from './components/IndieSconce.jsx';
import { ChatOverlay } from './components/ChatOverlay.jsx';
import { useHomeChat } from './hooks/useHomeChat.js';
import { useIndieSconce } from './hooks/useIndieSconce.js';
import {
    MIN_PINNED_APPS,
    MAX_PINNED_APPS,
    NON_REMOVABLE_APPS,
    EXCLUDED_ROUTES,
    areArraysEqual
} from './utils/homeUtils.js';


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
        chatFileInputRef, appendChatTurn,
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
    
    const {
        lampOn,
        lampLightReady,
        lampAnim,
        lampRight,
        handleLampClick
    } = useIndieSconce(isDarkMode, onToggleTheme);

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

    const recentOrders = useMemo(() => {
        return [...ORDER_DATA].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
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
    const GRID_COL_CLASSES = useMemo(() => ({
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-3 sm:grid-cols-4',
        5: 'grid-cols-3 sm:grid-cols-5',
        6: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6',
    }), []);
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
    }, [currentApps.length, GRID_COL_CLASSES]);

    const hoverBg = isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]';



    return (
        <div className={`flex flex-col h-full scrollbar-hide app-header-offset ${isEditMode ? 'overflow-y-auto' : 'overflow-hidden'}`} style={{ backgroundColor: colors.background, position: 'relative', overflowX: 'hidden', '--section-gap': 'clamp(12px, 2.2vh, 28px)' }}>

            {/* ── Indie Sconce – only visible in dark mode, portalled to body ── */}
            <IndieSconce
                isDarkMode={isDarkMode}
                lampRight={lampRight}
                handleLampClick={handleLampClick}
                lampAnim={lampAnim}
                lampLightReady={lampLightReady}
                lampOn={lampOn}
            />

            <div
                className={`px-4 sm:px-6 lg:px-8 flex flex-col max-w-5xl mx-auto w-full ${isEditMode ? '' : 'flex-1 min-h-0'}`}
                style={{
                    paddingTop: 'var(--section-gap)',
                    paddingBottom: 'var(--section-gap)',
                    gap: 'var(--section-gap)',
                    position: 'relative',
                    zIndex: 2,
                }}
            >

                {/* Header + Search — side-by-side on lg, stacked otherwise */}
                <HomeHeader
                    colors={colors}
                    todayLabel={todayLabel}
                    theme={theme}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    handleSearchSubmit={handleSearchSubmit}
                    onVoiceActivate={onVoiceActivate}
                    handleQuickAction={handleQuickAction}
                    spotlightResults={spotlightResults}
                    onNavigate={onNavigate}
                    openChatFromQuery={openChatFromQuery}
                    hoverBg={hoverBg}
                    isDark={isDark}
                />

                {/* App grid */}
                <div className="relative">
                    <AppGrid
                        isEditMode={isEditMode}
                        setIsEditMode={setIsEditMode}
                        currentApps={currentApps}
                        availableApps={availableApps}
                        safeHomeApps={safeHomeApps}
                        activeDragId={activeDragId}
                        setActiveDragId={setActiveDragId}
                        activeApp={activeApp}
                        sensors={sensors}
                        handleReorder={handleReorder}
                        toggleApp={toggleApp}
                        onUpdateHomeApps={onUpdateHomeApps}
                        onNavigate={onNavigate}
                        colors={colors}
                        isDark={isDark}
                        appGridCols={appGridCols}
                        recentOrders={recentOrders}
                        posts={posts}
                        leadTimeFavoritesData={leadTimeFavoritesData}
                        samplesCartCount={samplesCartCount}
                    />
                </div>

                {/* Home feature card(s) — flex-grow to fill remaining space */}
                <HomeFeatureCards
                    theme={theme}
                    colors={colors}
                    isDark={isDark}
                    isEditMode={isEditMode}
                    homeFeatureMode={homeFeatureMode}
                    setHomeFeatureMode={setHomeFeatureMode}
                    secondaryFeatureMode={secondaryFeatureMode}
                    setSecondaryFeatureMode={setSecondaryFeatureMode}
                    homeFeatureOptions={homeFeatureOptions}
                    navigateFeature={navigateFeature}
                    leadTimeFavoritesData={leadTimeFavoritesData}
                    communityPosts={communityPosts}
                    onNavigate={onNavigate}
                    recentOrders={recentOrders}
                    hoverBg={hoverBg}
                />

                {/* Glassy feedback bar — in flow, not fixed */}
                {!isEditMode && (
                    <button
                        onClick={() => onNavigate('feedback')}
                        className="flex-shrink-0 flex items-center justify-between px-5 w-full rounded-full transition-all active:scale-[0.98] mb-2"
                        style={{
                            height: 56,
                            backgroundColor: colors.tileSurface,
                            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                            borderRadius: 9999,
                        }}
                    >
                        <span className="text-[11px] font-medium" style={{ color: colors.textSecondary }}>Help us improve MyJSI</span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: colors.textPrimary }}>
                            Share Feedback <ChevronRight className="w-3.5 h-3.5" />
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

            <ChatOverlay
                isChatOpen={isChatOpen}
                setIsChatOpen={setIsChatOpen}
                chatMessages={chatMessages}
                chatInput={chatInput}
                setChatInput={setChatInput}
                chatAttachments={chatAttachments}
                isBotThinking={isBotThinking}
                chatFileInputRef={chatFileInputRef}
                handleChatSubmit={handleChatSubmit}
                handleChatFilePick={handleChatFilePick}
                handleChatFilesSelected={handleChatFilesSelected}
                handleRemoveAttachment={handleRemoveAttachment}
                appendChatTurn={appendChatTurn}
                onNavigate={onNavigate}
                colors={colors}
                isDark={isDark}
            />

        </div>
    );
});
HomeScreen.displayName = 'HomeScreen';
