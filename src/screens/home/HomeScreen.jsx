// Enhanced HomeScreen with Dealer Dashboard design and reconfiguration functionality
import React, { useState, useCallback, useMemo, useEffect, useRef, useDeferredValue } from 'react';
import { allApps, DEFAULT_HOME_APPS } from '../../constants/apps.js';
import { ORDER_DATA } from '../orders/data.js';
import { RequestQuoteModal } from '../../components/common/RequestQuoteModal.jsx';
import { SpecCheckRequestModal } from '../../components/common/SpecCheckRequestModal.jsx';
import { getHomeChromePillStyles, HOME_CHROME_PILL_HEIGHT } from '../../design-system/homeChrome.js';
import { isDarkTheme } from '../../design-system/tokens.js';
import { usePersistentState } from '../../hooks/usePersistentState.js';
import { MessageSquarePlus } from 'lucide-react';
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
import { createProjectDraft, projectNameMatches } from '../../utils/projectHelpers.js';
import { useHomeChat } from './hooks/useHomeChat.js';
import { useIndieSconce } from './hooks/useIndieSconce.js';
import { RfpDropModal } from '../rfp/RfpDropModal.jsx';
import {
    MIN_PINNED_APPS,
    MAX_PINNED_APPS,
    NON_REMOVABLE_APPS,
    EXCLUDED_ROUTES,
    areArraysEqual
} from './utils/homeUtils.js';


export const HomeScreen = React.memo(({
    theme,
    onNavigate,
    onVoiceActivate,
    homeApps,
    onUpdateHomeApps,
    homeResetKey,
    posts,
    isDarkMode,
    onToggleTheme,
    cart,
    opportunities = [],
    myProjects = [],
    setMyProjects,
    members,
    currentUserId,
    setSuccessMessage,
}) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeDragId, setActiveDragId] = useState(null);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [showSpecCheckModal, setShowSpecCheckModal] = useState(false);
    const [rfpDropFile, setRfpDropFile] = useState(null);
    const [showRfpDropModal, setShowRfpDropModal] = useState(false);
    const rfpFileInputRef = useRef(null);

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

    const [homeFeatureMode, setHomeFeatureMode] = usePersistentState('pref.homeFeatureMode.primary', 'activity');
    const [secondaryFeatureMode, setSecondaryFeatureMode] = usePersistentState('pref.homeFeatureMode.secondary', 'community');
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
                rfpFileInputRef.current?.click();
                break;
            case 'spec':
                setShowSpecCheckModal(true);
                break;
            case 'feedback':
                onNavigate?.('feedback');
                break;
            default:
                break;
        }
    }, [onNavigate]);

    const handleSpecCheckSubmit = useCallback((payload) => {
        const typedProjectName = (payload?.projectInput || '').trim();
        const selectedProject = payload?.selectedProject || null;

        let targetProject = selectedProject;
        if (!targetProject && typedProjectName) {
            const existing = (myProjects || []).find((project) => projectNameMatches(project, typedProjectName));

            if (existing) {
                targetProject = existing;
            } else {
                const newProject = createProjectDraft(typedProjectName, {
                    location: 'Location TBD',
                    image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_install_0000010.jpg',
                    specCheckRequests: [],
                });
                targetProject = newProject;
                if (typeof setMyProjects === 'function') {
                    setMyProjects((prev) => [newProject, ...(prev || [])]);
                }
            }
        }

        if (targetProject && typeof setMyProjects === 'function') {
            setMyProjects((prev) => (prev || []).map((project) => {
                if (String(project.id) !== String(targetProject.id)) return project;
                const nextRequest = {
                    id: `spec_${Date.now()}`,
                    notes: payload?.notes || '',
                    files: (payload?.files || []).map((file) => ({ name: file.name, size: file.size, type: file.type })),
                    createdAt: Date.now(),
                };
                return {
                    ...project,
                    specCheckRequests: [nextRequest, ...(project.specCheckRequests || [])],
                };
            }));
        }

        setShowSpecCheckModal(false);
        onNavigate?.('projects', { tab: 'my-projects' });
        if (typeof setSuccessMessage === 'function') {
            setSuccessMessage('Spec check request submitted');
            setTimeout(() => setSuccessMessage(''), 1600);
        }
    }, [myProjects, onNavigate, setMyProjects, setSuccessMessage]);

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
        tileSurface: isDark ? 'rgba(42,42,42,0.82)' : 'rgba(255,255,255,0.78)',
        tileShadow: 'none',
        accent: theme?.colors?.accent || '#353535',
        textPrimary: theme?.colors?.textPrimary || '#353535',
        textSecondary: theme?.colors?.textSecondary || '#666666',
        border: theme?.colors?.border || '#E3E0D8'
    }), [theme, isDark]);

    const allAppRoutes = useMemo(() => new Set(allApps.map(app => app.route)), []);
    const homeEligibleRoutes = useMemo(
        () => new Set(allApps.filter((app) => app.homeEligible !== false).map((app) => app.route)),
        []
    );

    const normalizeHomeApps = useCallback((list) => {
        const baseList = Array.isArray(list) ? list : [];
        const unique = baseList.filter((route, index) => baseList.indexOf(route) === index);
        const known = unique.filter(route => allAppRoutes.has(route) && homeEligibleRoutes.has(route));
        const withResources = known.includes('resources') ? known : ['resources', ...known];
        return withResources.length ? withResources : DEFAULT_HOME_APPS;
    }, [allAppRoutes, homeEligibleRoutes]);

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
        return allApps.filter(
            (app) => app.homeEligible !== false && !safeHomeApps.includes(app.route) && !EXCLUDED_ROUTES.has(app.route)
        );
    }, [safeHomeApps]);

    // Defer the filter so keystrokes feel instant even on slow devices
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const spotlightResults = useMemo(() => {
        const query = deferredSearchQuery.trim().toLowerCase();
        if (!query) return [];
        return allApps
            .filter(app => {
                const name = app.name?.toLowerCase() || '';
                const route = app.route?.toLowerCase() || '';
                return name.includes(query) || route.includes(query);
            })
            .slice(0, 6);
    }, [deferredSearchQuery]);

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

    const handleRfpFileDrop = useCallback((file) => {
        setRfpDropFile(file);
        setShowRfpDropModal(true);
    }, []);

    const handleRfpAccept = useCallback(() => {
        setShowRfpDropModal(false);
        onNavigate?.('rfp-responder', { preloadedFile: rfpDropFile });
        setRfpDropFile(null);
    }, [onNavigate, rfpDropFile]);

    const handleRfpDismiss = useCallback(() => {
        setShowRfpDropModal(false);
        setRfpDropFile(null);
    }, []);

    const handleRfpFilePick = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file) {
            setRfpDropFile(file);
            setShowRfpDropModal(true);
        }
        // Reset so the same file can be re-selected
        e.target.value = '';
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
        return now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
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

    // Smart grid: always 3 cols on mobile, scale up on sm+ to fill rows evenly
    const appGridCols = useMemo(() => {
        const count = currentApps.length;
        // Mobile is always 3 cols. sm+ picks the best column count to avoid orphans.
        const GRID_MAP = {
            3: 'grid-cols-3',                             // 1×3
            4: 'grid-cols-3 sm:grid-cols-4',              // mobile 3+1, sm 1×4
            5: 'grid-cols-3 sm:grid-cols-5',              // mobile 3+2, sm 1×5
            6: 'grid-cols-3',                             // 2×3 at all sizes
            7: 'grid-cols-3 sm:grid-cols-4',              // mobile 3+3+1, sm 4+3
            8: 'grid-cols-3 sm:grid-cols-4',              // mobile 3+3+2, sm 2×4
            9: 'grid-cols-3',                             // 3×3 at all sizes
        };
        return {
            view: GRID_MAP[count] || 'grid-cols-3 sm:grid-cols-4',
            edit: 'grid-cols-3 sm:grid-cols-4',
        };
    }, [currentApps.length]);

    const hoverBg = isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]';
    const chromePillStyles = getHomeChromePillStyles(isDark);



    return (
        <div data-home-scroll-container="true" className="flex flex-col h-full scrollbar-hide app-header-offset overflow-y-auto" style={{ backgroundColor: colors.background, position: 'relative', overflowX: 'hidden' }}>

            {/* ── Indie Sconce – only visible in dark mode, portalled to body ── */}
            <IndieSconce
                isDarkMode={isDarkMode}
                lampRight={lampRight}
                handleLampClick={handleLampClick}
                lampAnim={lampAnim}
                lampLightReady={lampLightReady}
                lampOn={lampOn}
            />

            {/* Mobile sticky feedback bar — fixed to viewport bottom, hidden on sm+ */}
            {!isEditMode && (
                <div
                    className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center px-4"
                    style={{
                        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                        paddingTop: 12,
                        background: isDark
                            ? 'linear-gradient(to top, rgba(26,26,26,0.94) 60%, rgba(26,26,26,0))'
                            : 'linear-gradient(to top, rgba(240,237,232,0.96) 60%, rgba(240,237,232,0))',
                        pointerEvents: 'none',
                    }}
                >
                    <button
                        onClick={() => onNavigate('feedback')}
                        className="flex items-center gap-2 px-5 rounded-full transition-all active:scale-[0.97]"
                        style={{
                            ...chromePillStyles,
                            height: HOME_CHROME_PILL_HEIGHT,
                            color: colors.textSecondary,
                            pointerEvents: 'auto',
                        }}
                    >
                        <MessageSquarePlus className="w-4 h-4" />
                        <span className="text-[13px] font-semibold">Share Feedback</span>
                    </button>
                </div>
            )}

            <div
                className="px-4 sm:px-6 lg:px-8 flex flex-col max-w-5xl mx-auto w-full gap-4 sm:gap-6 py-4 sm:py-6 pb-20 sm:pb-6"
                style={{
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
                    onRfpFileDrop={handleRfpFileDrop}
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
                    opportunities={opportunities}
                    recentOrders={recentOrders}
                    hoverBg={hoverBg}
                />

                {/* Feedback CTA — desktop inline only; mobile uses sticky bar below */}
                {!isEditMode && (
                    <div className="hidden sm:flex flex-col items-center gap-2 pb-2">
                        <button
                            onClick={() => onNavigate('feedback')}
                            className="flex items-center gap-2 px-5 rounded-full transition-all active:scale-[0.97] hover:opacity-80"
                            style={{
                                ...chromePillStyles,
                                height: HOME_CHROME_PILL_HEIGHT,
                                color: colors.textSecondary,
                            }}
                        >
                            <MessageSquarePlus className="w-4 h-4" />
                            <span className="text-[13px] font-semibold">Share Feedback</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Request Quote Modal */}
            <RequestQuoteModal
                show={showQuoteModal}
                onClose={() => setShowQuoteModal(false)}
                theme={theme}
                members={members}
                currentUserId={currentUserId}
                onSubmit={(data) => {
                    // TODO: wire to quote submission API
                    if (import.meta.env.DEV) console.log('Quote request submitted:', data);
                }}
            />
            <SpecCheckRequestModal
                show={showSpecCheckModal}
                onClose={() => setShowSpecCheckModal(false)}
                theme={theme}
                myProjects={myProjects}
                onSubmit={handleSpecCheckSubmit}
            />

            <RfpDropModal
                show={showRfpDropModal}
                onClose={handleRfpDismiss}
                onAccept={handleRfpAccept}
                file={rfpDropFile}
                theme={theme}
            />

            {/* Hidden file input for Upload a File quick action */}
            <input
                ref={rfpFileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleRfpFilePick}
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
