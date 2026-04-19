import React, { useState, useMemo, useCallback, useEffect, useRef, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { lightTheme, darkTheme } from './data/index.js';
import { DEFAULT_HOME_APPS, allApps } from './constants/apps.js';
import { INITIAL_OPPORTUNITIES, MY_PROJECTS_DATA, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS, EMPTY_LEAD, STAGES } from './screens/projects/data.js';
import { INITIAL_POSTS, INITIAL_POLLS, INITIAL_WINS, SUBREDDIT_POSTS } from './screens/community/data.js';
import { INITIAL_MEMBERS } from './screens/members/data.js';
import { DEALER_DIRECTORY_DATA } from './screens/resources/dealer-directory/data.js';

import { AppHeader } from './components/navigation/AppHeader.jsx';
import { ProfileMenu } from './components/navigation/ProfileMenu.jsx';
import { VoiceModal, SuccessToast } from './components/feedback/ToastsAndModals.jsx';
import { SCREEN_MAP, ProductComparisonScreen, CompetitiveAnalysisScreen, SalesScreen, SamplesScreen } from './config/screenMap.js';
import { SERIES_TO_CATEGORY } from './screens/products/data.js';
import { Modal } from './components/common/Modal.jsx';
import { INITIAL_ASSETS } from './screens/library/data.js';
import { AnimatedScreenWrapper } from './components/common/AnimatedScreenWrapper.jsx';
import { usePersistentState } from './hooks/usePersistentState.js';
import { ToastHost } from './components/common/ToastHost.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';
import { ScreenSkeleton } from './components/common/ScreenSkeleton.jsx';
import { submitLeadToExcel } from './utils/submitLeadToExcel.js';

// Lazy load less-frequently visited resource feature screens for bundle splitting
const CommissionRatesScreen = React.lazy(() => import('./screens/resources/commission-rates/index.js'));
const LeadTimesScreen = React.lazy(() => import('./screens/resources/lead-times/index.js'));
const WeightRatingsScreen = React.lazy(() => import('./screens/resources/weight-ratings/index.js'));
const ContractsScreen = React.lazy(() => import('./screens/resources/contracts/index.js'));
const DealerDirectoryScreen = React.lazy(() => import('./screens/resources/dealer-directory/index.js'));
const DealerDetailScreen = React.lazy(() => import('./screens/resources/dealer-directory/DealerDetailScreen.jsx').then(m => ({ default: m.DealerDetailScreen })));
const DiscontinuedFinishesScreen = React.lazy(() => import('./screens/resources/discontinued-finishes/index.js'));
const TradeshowsScreen = React.lazy(() => import('./screens/resources/tradeshows/index.js'));
const SampleDiscountsScreen = React.lazy(() => import('./screens/resources/sample-discounts/index.js'));
const LoanerPoolScreen = React.lazy(() => import('./screens/resources/loaner-pool/index.js'));
const InstallInstructionsScreen = React.lazy(() => import('./screens/resources/install-instructions/index.js'));
const NewDealerSignUpScreen = React.lazy(() => import('./screens/resources/new-dealer-signup/index.js'));
const PresentationsScreen = React.lazy(() => import('./screens/resources/presentations/index.js'));
const RequestFieldVisitScreen = React.lazy(() => import('./screens/resources/request-field-visit/index.js'));
const TourVisitScreen = React.lazy(() => import('./screens/resources/tour-visit/index.js'));
const SearchFabricsScreen = React.lazy(() => import('./screens/resources/search-fabrics/index.js'));
const RequestComYardageScreen = React.lazy(() => import('./screens/resources/request-com-yardage/index.js'));
const SocialMediaScreen = React.lazy(() => import('./screens/resources/social-media/index.js'));
const ComColRequest = React.lazy(() => import('./screens/resources/search-fabrics/ComColRequest.jsx').then(m => ({ default: m.ComColRequest })));
const ProjectsScreen = React.lazy(() => import('./screens/projects/ProjectsScreen.jsx').then(m => ({ default: m.ProjectsScreen })));
const OrderDetailScreen = React.lazy(() => import('./screens/orders/index.js').then(m => ({ default: m.OrderDetailScreen })));
const ResourceDetailScreen = React.lazy(() => import('./screens/utility/UtilityScreens.jsx').then(m => ({ default: m.ResourceDetailScreen })));
const CreateContentModal = React.lazy(() => import('./screens/community/CreateContentModal.jsx').then(m => ({ default: m.CreateContentModal })));
const UploadToLibraryModal = React.lazy(() => import('./screens/library/UploadToLibraryModal.jsx').then(m => ({ default: m.UploadToLibraryModal })));

// Legacy underscore routes aliased to their canonical hyphenated slugs
const RESOURCE_SLUG_ALIASES = {
    'discontinued_finishes': 'discontinued-finishes',
    'design_days': 'tradeshows',
    'design-days': 'tradeshows', // keep supporting older hyphen variant
    'sample_discounts': 'sample-discounts',
    'loaner_pool': 'loaner-pool',
    'install_instructions': 'install-instructions',
    'request_field_visit': 'request-field-visit',
    'social_media': 'social-media',
    'dealer_directory': 'dealer-directory',
    'commission_rates': 'commission-rates',
    'weight_ratings': 'weight-ratings'
    // 'new-dealer-signup' already canonical; no alias needed
};

function normalizeResourceSlug(raw) {
    if (!raw || raw.includes('/')) return raw;
    return RESOURCE_SLUG_ALIASES[raw] || raw;
}

const RESOURCE_FEATURE_SCREENS = {
    'commission-rates': CommissionRatesScreen,
    'lead-times': LeadTimesScreen,
    'weight-ratings': WeightRatingsScreen,
    'contracts': ContractsScreen,
    'dealer-directory': DealerDirectoryScreen,
    'discontinued-finishes': DiscontinuedFinishesScreen,
    'tradeshows': TradeshowsScreen,
    'sample-discounts': SampleDiscountsScreen,
    'loaner-pool': LoanerPoolScreen,
    'install-instructions': InstallInstructionsScreen,
    'presentations': PresentationsScreen,
    'request-field-visit': RequestFieldVisitScreen,
    'tour-visit': TourVisitScreen,
    'new-dealer-signup': NewDealerSignUpScreen,
    'social-media': SocialMediaScreen,
    'search-fabrics': SearchFabricsScreen,
    'request-com-yardage': RequestComYardageScreen,
    'comcol-request': ComColRequest
};

const screenToPath = (screen) => {
    if (!screen || screen === 'home') return '/';
    return `/${encodeURI(screen)}`;
};

const pathToScreen = (pathname) => {
    const trimmed = pathname.replace(/^\/+|\/+$/g, '');
    return trimmed ? decodeURI(trimmed) : 'home';
};

const ScreenRouter = React.memo(({ screenKey, projectsScreenRef, SuspenseFallback, ...rest }) => {
    if (!screenKey) return null;
    const parts = screenKey.split('/');
    const base = parts[0];

    if (base === 'projects' && parts[1]) {
            const oppId = parts[1];
        return (
            <Suspense fallback={SuspenseFallback}>
                <ProjectsScreen ref={projectsScreenRef} {...rest} deepLinkOppId={oppId} />
            </Suspense>
        );
    }
    if (base === 'projects') {
        return (
            <Suspense fallback={SuspenseFallback}>
                <ProjectsScreen ref={projectsScreenRef} {...rest} />
            </Suspense>
        );
    }

    const lazyWrap = (Comp, extraProps) => (
        <Suspense fallback={SuspenseFallback}>
            {React.createElement(Comp, { ...rest, ...extraProps })}
        </Suspense>
    );

    if (screenKey === 'samples/cart') return lazyWrap(SamplesScreen, { initialCartOpen: true });
    if (base === 'samples') return lazyWrap(SamplesScreen);

    if (base === 'new-trip') {
        return lazyWrap(TourVisitScreen);
    }

    if (base === 'resources') {
        const slug = parts.slice(1).join('/');
        const firstSegment = slug.split('/')[0];
        const normalizedFirst = normalizeResourceSlug(firstSegment);
        const normalized = [normalizedFirst, ...slug.split('/').slice(1)].join('/');

        // Tradeshows sub-routes: resources/tradeshows/{brandId}/{showId?}
        if (normalizedFirst === 'tradeshows' && parts.length >= 3) {
            return lazyWrap(TradeshowsScreen, {
                initialBrandId: parts[2],
                initialShowId: parts[3] || null,
            });
        }

        if (normalizedFirst === 'weight-ratings') {
            return lazyWrap(WeightRatingsScreen, {
                initialSeriesSlug: parts[2] || null
            });
        }

        // Direct feature screen match (single segment feature slugs only)
        if (RESOURCE_FEATURE_SCREENS[normalized]) {
            return lazyWrap(RESOURCE_FEATURE_SCREENS[normalized]);
        }
    }

    if (base === 'community' && parts[1] === 'post' && parts[2]) {
        const ScreenComponent = SCREEN_MAP[base] || SalesScreen;
        return (
            <Suspense fallback={SuspenseFallback}>
                <ScreenComponent {...rest} focusPostId={parts[2]} />
            </Suspense>
        );
    }

    if (base === 'products' && parts[1] === 'series' && parts[2]) {
        const match = SERIES_TO_CATEGORY[parts[2]];
        if (match) return lazyWrap(ProductComparisonScreen, { categoryId: match.categoryId, initialProductId: match.productId });
        // Fallback: show products screen if slug not recognized
    }

    if (base === 'products' && parts[1] === 'category' && parts.length === 3) {
        return lazyWrap(ProductComparisonScreen, { categoryId: parts[2] });
    }
    if (base === 'products' && parts[1] === 'category' && (parts[2] === 'competition' || parts[3] === 'competition')) {
        const productId = parts[3] === 'competition' && parts[4] ? parts[4] : null;
        return (
            <Suspense fallback={SuspenseFallback}>
                <CompetitiveAnalysisScreen {...rest} categoryId={parts[2]} productId={productId} />
            </Suspense>
        );
    }

    if (base === 'orders' && parts.length > 1) return lazyWrap(OrderDetailScreen);

    // Dealer directory detail route: resources/dealer-directory/{id}
    if (base === 'resources' && parts[1] === 'dealer-directory' && parts[2]) {
        return lazyWrap(DealerDetailScreen, { screenKey });
    }

    if (base === 'resources' && parts.length > 1) return lazyWrap(ResourceDetailScreen);

    const ScreenComponent = SCREEN_MAP[base] || SalesScreen;
    return (
        <Suspense fallback={SuspenseFallback}>
            <ScreenComponent {...rest} />
        </Suspense>
    );
});
ScreenRouter.displayName = 'ScreenRouter';

function App() {
    const routerNavigate = useNavigate();
    const location = useLocation();

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [cart, setCart] = usePersistentState('samples.cart', {});
    const [homeApps, setHomeApps] = usePersistentState('pref.homeApps', DEFAULT_HOME_APPS);

    // Reset to current default if stored count mismatches (e.g. after adding new apps)
    useEffect(() => {
        if (!Array.isArray(homeApps) || homeApps.length !== DEFAULT_HOME_APPS.length) {
            setHomeApps(DEFAULT_HOME_APPS);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [lastNavigationDirection, setLastNavigationDirection] = useState('forward');
    const [screenParams, setScreenParams] = useState({});
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileBtnRef = useRef(null);
    const [voiceMessage, setVoiceMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [alertInfo, setAlertInfo] = useState({ show: false, message: '' });
    const [homeResetKey, setHomeResetKey] = useState(0);
    const backHandlerRef = useRef(null);

    const [navDepth, setNavDepth] = useState(0);
    const navDepthRef = useRef(navDepth);
    useEffect(() => { navDepthRef.current = navDepth; }, [navDepth]);

    // Track whether the last navigation was initiated by our handleNavigate/handleBack
    const internalNavRef = useRef(false);

    const currentScreen = useMemo(() => pathToScreen(location.pathname), [location.pathname]);

    // Sync navDepth when browser native back/forward triggers a location change
    // without going through handleNavigate/handleBack (e.g. native swipe-back,
    // hardware back button, browser forward/back buttons).
    useEffect(() => {
        if (internalNavRef.current) {
            // This location change was triggered by our code — already handled
            internalNavRef.current = false;
            return;
        }
        // External navigation (native gesture, browser button, etc.)
        // Use 'none' so AnimatedScreenWrapper skips its CSS slide animation —
        // the browser/OS already provided the visual transition.
        const isHome = currentScreen === 'home' || !currentScreen;
        if (isHome) {
            setLastNavigationDirection('none');
            setNavDepth(0);
        } else if (navDepthRef.current === 0) {
            // Navigated to a non-home screen externally (e.g. browser forward)
            setLastNavigationDirection('none');
            setNavDepth(1);
        }
    }, [currentScreen]);

    const screenLabel = useMemo(() => {
        if (!currentScreen || currentScreen === 'home') return 'Home';
        const app = allApps.find(a => a.route === currentScreen.split('/')[0]);
        return app?.name || currentScreen.split('/')[0].replace(/-/g, ' ');
    }, [currentScreen]);

    const [userSettings, setUserSettings] = useState({ id: 1, firstName: 'Luke', lastName: 'Wagner', homeAddress: '5445 N Deerwood Lake Rd, Jasper, IN 47546', shirtSize: 'L' });
    const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
    const [myProjects, setMyProjects] = useState(MY_PROJECTS_DATA);
    const [projectsTabOverride, setProjectsTabOverride] = useState(null);
    const [projectsStageOverride, setProjectsStageOverride] = useState(null);
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [currentUserId] = useState(1);

    const [posts, setPosts] = useState([...INITIAL_POSTS, ...INITIAL_WINS, ...SUBREDDIT_POSTS]);
    const [polls, setPolls] = useState(INITIAL_POLLS);
    const [likedPosts, setLikedPosts] = useState({});
    const [pollChoices, setPollChoices] = useState({});
    const [showCreateContentModal, setShowCreateContentModal] = useState(false);
    const [showLibraryUploadModal, setShowLibraryUploadModal] = useState(false);
    const [libraryAssets, setLibraryAssets] = useState(INITIAL_ASSETS);
    const [savedImageIds, setSavedImageIds] = usePersistentState('library.saved', []);
    const [postUpvotes, setPostUpvotes] = useState({});

    const [dealerDirectory, setDealerDirectory] = useState(DEALER_DIRECTORY_DATA);
    const [designFirms, setDesignFirms] = useState(INITIAL_DESIGN_FIRMS);
    const [dealers, setDealers] = useState(INITIAL_DEALERS);
    const [newLeadData, setNewLeadData] = usePersistentState('draft.newLead', EMPTY_LEAD);

    const projectsScreenRef = useRef(null);

    const currentTheme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

    useEffect(() => {
        const setAppHeight = () => document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
        setAppHeight();
        window.addEventListener('resize', setAppHeight);
        window.addEventListener('orientationchange', setAppHeight);
        return () => {
            window.removeEventListener('resize', setAppHeight);
            window.removeEventListener('orientationchange', setAppHeight);
        };
    }, []);

    useEffect(() => { document.body.style.backgroundColor = currentTheme.colors.background; }, [currentTheme.colors.background]);

    // Sync data-theme attribute on <html> for CSS variable theming
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const handleNavigate = useCallback((screen, params = {}) => {
        internalNavRef.current = true;
        setLastNavigationDirection('forward');
        setScreenParams(params || {});
        if (screen === 'projects') {
            if (params?.tab) setProjectsTabOverride(params.tab);
            if (params?.stage) setProjectsStageOverride(params.stage);
        }
        setNavDepth(d => d + 1);
        routerNavigate(screenToPath(screen));
    }, [routerNavigate]);

    const handleBack = useCallback(() => {
        if (typeof backHandlerRef.current === 'function') {
            const handled = backHandlerRef.current();
            if (handled) {
                return;
            }
        }

        if (navDepth > 0) {
            internalNavRef.current = true;
            setLastNavigationDirection('backward');
            setScreenParams({});
            setNavDepth(d => Math.max(0, d - 1));
            routerNavigate(-1);
        }
    }, [routerNavigate, navDepth]);

    const setBackHandler = useCallback((handler) => {
        backHandlerRef.current = typeof handler === 'function' ? handler : null;
    }, []);

    const handleHome = useCallback(() => {
        internalNavRef.current = true;
        setLastNavigationDirection('backward');
        setNavDepth(0);
        routerNavigate('/', { replace: true });
        setHomeResetKey((prev) => prev + 1);
    }, [routerNavigate]);

    const handleVoiceActivate = useCallback((message) => { setVoiceMessage(message); setTimeout(() => setVoiceMessage(''), 1500); }, []);
    const handleAskAI = useCallback((query) => { setVoiceMessage(`AI Search: ${query}`); setTimeout(() => setVoiceMessage(''), 2500); }, []);

    const handleUpdateCart = useCallback((item, change) => {
        setCart((prev) => {
            const next = { ...prev };
            const id = String(item.id);
            const curr = next[id] || 0;
            const qty = curr + change;
            if (qty > 0) next[id] = qty; else delete next[id];
            return next;
        });
    }, [setCart]);

    const handleToggleLike = useCallback((postId) => {
        setLikedPosts((prev) => {
            const liked = !!prev[postId];
            const next = { ...prev };
            if (liked) delete next[postId]; else next[postId] = true;
            setPosts((p) => p.map(post => post.id === postId ? { ...post, likes: Math.max(0, (post.likes || 0) + (liked ? -1 : 1)) } : post));
            return next;
        });
    }, []);

    const handleAddComment = useCallback((postId, text) => {
        const now = Date.now();
        setPosts((prev) => prev.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), { id: now, name: 'You', text }] } : p));
    }, []);

    const handleUpvote = useCallback((postId) => {
        setPostUpvotes((prev) => {
            const isUp = !!prev[postId];
            const next = { ...prev };
            if (isUp) delete next[postId]; else next[postId] = true;
            setPosts((p) => p.map(post => post.id === postId ? { ...post, upvotes: Math.max(0, (post.upvotes || 0) + (isUp ? -1 : 1)) } : post));
            return next;
        });
    }, []);

    const handleToggleSaveImage = useCallback((assetId) => {
        setSavedImageIds(prev => {
            const set = new Set(Array.isArray(prev) ? prev : []);
            if (set.has(assetId)) set.delete(assetId); else set.add(assetId);
            return [...set];
        });
    }, [setSavedImageIds]);

    const handlePollVote = useCallback((pollId, optionId) => {
        setPollChoices((prev) => ({ ...prev, [pollId]: optionId }));
        setPolls((prev) => prev.map(pl => pl.id !== pollId ? pl : { ...pl, options: pl.options.map(o => o.id === optionId ? { ...o, votes: (o.votes || 0) + 1 } : o) }));
    }, []);

    // Reusable helper – flash a success toast for a fixed duration
    const flashSuccess = useCallback((msg, ms = 1500) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), ms);
    }, []);

    const handleLibraryUpload = useCallback((assets) => {
        setLibraryAssets(prev => [...assets, ...prev]);
        setShowLibraryUploadModal(false);
        flashSuccess(assets.length > 1 ? `${assets.length} images uploaded!` : 'Image uploaded!');
    }, [flashSuccess]);

    const handleCreatePost = useCallback((payload) => {
        if (payload.type === 'poll') setPolls((prev) => [payload, ...prev]); else {
            const post = { id: payload.id, type: 'post', user: payload.user, text: payload.text ?? payload.content ?? '', image: payload.image || null, images: payload.images || [], likes: payload.likes ?? 0, comments: payload.comments || [], timeAgo: 'now', createdAt: payload.createdAt || Date.now() };
            setPosts((prev) => [post, ...prev]);
        }
        setShowCreateContentModal(false); flashSuccess('Posted!');
    }, [flashSuccess]);

    const handleShowAlert = useCallback((message) => setAlertInfo({ show: true, message }), []);
    const handleNewLeadChange = useCallback((updates) => setNewLeadData((prev) => ({ ...prev, ...updates })), [setNewLeadData]);

    const handleLeadSuccess = useCallback((lead) => {
        // Fire-and-forget: send lead data to shared Excel via Power Automate
        submitLeadToExcel(lead);
        // Normalize lead → opportunity: rename `project` → `name` so all opportunities
        // share the same canonical `name` field. Drop the redundant `project` key so
        // consumers don't need `opp.name || opp.project` defensive fallbacks.
        const { project: _project, projectStatus: _projectStatus, ...leadRest } = lead;
        const newOpp = { id: Date.now(), name: lead.project || 'Untitled Project', stage: lead.projectStatus && STAGES.includes(lead.projectStatus) ? lead.projectStatus : STAGES[0], discount: lead.discount || 'Undecided', value: lead.estimatedList || '$0', company: lead.designFirms?.[0] || lead.dealers?.[0] || 'Unknown', contact: lead.contact || '', poTimeframe: lead.poTimeframe || '', ...leadRest };
        setOpportunities(prev => [newOpp, ...prev]); setNewLeadData(EMPTY_LEAD); handleNavigate('projects', { tab: 'pipeline', stage: newOpp.stage }); flashSuccess('Lead Added');
    }, [handleNavigate, setNewLeadData, flashSuccess]);

    const handleAddInstall = useCallback((install) => {
        const enriched = { id: 'inst-' + Date.now(), photos: install.photos || [], standards: [], quotes: [], ...install };
        setMyProjects(prev => [enriched, ...prev]); handleNavigate('projects', { tab: 'my-projects' }); flashSuccess('Install Added');
    }, [handleNavigate, flashSuccess]);

    const handleUpdateHomeApps = useCallback((apps) => {
        if (!Array.isArray(apps)) return;
        const filtered = apps.filter(r => allApps.some(a => a.route === r));
        setHomeApps(filtered);
    }, [setHomeApps]);

    const handleToggleTheme = useCallback(() => setIsDarkMode(d => !d), []);
    const openCreateContentModal = useCallback(() => setShowCreateContentModal(true), []);
    const openLibraryUploadModal = useCallback(() => setShowLibraryUploadModal(true), []);
    const closeLibraryUploadModal = useCallback(() => setShowLibraryUploadModal(false), []);
    const clearProjectsInitialTab = useCallback(() => setProjectsTabOverride(null), []);
    const clearProjectsInitialStage = useCallback(() => setProjectsStageOverride(null), []);
    const toggleProfileMenu = useCallback(() => setShowProfileMenu(p => !p), []);
    const closeProfileMenu = useCallback(() => setShowProfileMenu(false), []);
    const closeCreateContentModal = useCallback(() => setShowCreateContentModal(false), []);
    const closeAlert = useCallback(() => setAlertInfo({ show: false, message: '' }), []);

    const screenProps = useMemo(() => ({
        theme: currentTheme,
        onNavigate: handleNavigate,
        onAskAI: handleAskAI,
        onVoiceActivate: handleVoiceActivate,
        handleBack,
        setBackHandler,
        userSettings,
        setUserSettings,
        setSuccessMessage,
        showAlert: handleShowAlert,
        currentScreen,
        screenParams,
        opportunities,
        setOpportunities,
        myProjects,
        setMyProjects,
        members,
        setMembers,
        currentUserId,
        posts,
        polls,
        likedPosts,
        pollChoices,
        onToggleLike: handleToggleLike,
        onAddComment: handleAddComment,
        onPollVote: handlePollVote,
        openCreateContentModal,
        openLibraryUploadModal,
        libraryAssets,
        savedImageIds,
        onToggleSaveImage: handleToggleSaveImage,
        postUpvotes,
        onUpvote: handleUpvote,
        cart,
        setCart,
        onUpdateCart: handleUpdateCart,
        dealerDirectory,
        setDealerDirectory,
        designFirms,
        setDesignFirms,
        dealers,
        setDealers,
        newLeadData,
        onNewLeadChange: handleNewLeadChange,
        isDarkMode,
        onToggleTheme: handleToggleTheme,
        onSuccess: handleLeadSuccess,
        onAddInstall: handleAddInstall,
        projectsInitialTab: projectsTabOverride,
        clearProjectsInitialTab,
        projectsInitialStage: projectsStageOverride,
        clearProjectsInitialStage,
        homeApps,
        onUpdateHomeApps: handleUpdateHomeApps,
        homeResetKey
    }), [
        currentTheme, handleNavigate, handleAskAI, handleVoiceActivate,
        handleBack, setBackHandler, userSettings, handleShowAlert, currentScreen, screenParams,
        opportunities, myProjects, members, currentUserId,
        posts, polls, likedPosts, pollChoices, handleToggleLike,
        handleAddComment, handlePollVote, openCreateContentModal, openLibraryUploadModal, libraryAssets, savedImageIds,
        handleToggleSaveImage, postUpvotes, handleUpvote, cart, setCart,
        handleUpdateCart, dealerDirectory, setDealerDirectory, designFirms, dealers, newLeadData,
        handleNewLeadChange, isDarkMode, handleToggleTheme, handleLeadSuccess,
        handleAddInstall, projectsTabOverride, clearProjectsInitialTab, projectsStageOverride, clearProjectsInitialStage,
        homeApps, handleUpdateHomeApps, homeResetKey
    ]);

    const suspenseFallback = useMemo(() => (
        <ScreenSkeleton theme={currentTheme} />
    ), [currentTheme]);

    return (
        <ToastHost theme={currentTheme}>
            <div className="h-screen-safe w-screen font-sans flex flex-col relative" style={{ backgroundColor: currentTheme.colors.background }}>
                <div aria-live="polite" aria-atomic="true" className="sr-only">
                    {screenLabel} screen
                </div>
                <AppHeader
                    theme={currentTheme}
                    userName={userSettings.firstName}
                    showBack={navDepth > 0}
                    handleBack={handleBack}
                    onHomeClick={handleHome}
                    onProfileClick={toggleProfileMenu}
                    isDarkMode={isDarkMode}
                    profileBtnRef={profileBtnRef}
                />
                <main className="flex-1 overflow-hidden max-w-content mx-auto w-full" style={{ backgroundColor: currentTheme.colors.background }}>
                    <AnimatedScreenWrapper screenKey={currentScreen} direction={lastNavigationDirection}>
                        <ErrorBoundary screenKey={currentScreen} theme={currentTheme}>
                            <ScreenRouter screenKey={currentScreen} projectsScreenRef={projectsScreenRef} SuspenseFallback={suspenseFallback} {...screenProps} />
                        </ErrorBoundary>
                    </AnimatedScreenWrapper>
                </main>
                {showProfileMenu && (
                    <ProfileMenu show={showProfileMenu} onClose={closeProfileMenu} onNavigate={handleNavigate} theme={currentTheme} anchorRef={profileBtnRef} isDarkMode={isDarkMode} onToggleTheme={handleToggleTheme} />
                )}
                <VoiceModal message={voiceMessage} show={!!voiceMessage} theme={currentTheme} />
                <SuccessToast message={successMessage} show={!!successMessage} theme={currentTheme} />
                {showCreateContentModal && (
                    <Suspense fallback={null}>
                        <CreateContentModal show={showCreateContentModal} onClose={closeCreateContentModal} theme={currentTheme} onCreatePost={handleCreatePost} />
                    </Suspense>
                )}
                {showLibraryUploadModal && (
                    <Suspense fallback={null}>
                        <UploadToLibraryModal show={showLibraryUploadModal} onClose={closeLibraryUploadModal} theme={currentTheme} onUpload={handleLibraryUpload} />
                    </Suspense>
                )}
                <Modal show={alertInfo.show} onClose={closeAlert} title="Alert" theme={currentTheme}>
                    <p>{alertInfo.message}</p>
                </Modal>
            </div>
        </ToastHost>
    );
}

export default App;
