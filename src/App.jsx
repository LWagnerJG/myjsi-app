import React, { useState, useMemo, useCallback, useEffect, useRef, Suspense } from 'react';
import { lightTheme, darkTheme } from './data/index.js';
import { DEFAULT_HOME_APPS, allApps } from './data.jsx';
import { INITIAL_OPPORTUNITIES, MY_PROJECTS_DATA, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS, EMPTY_LEAD, STAGES } from './screens/projects/data.js';
import { INITIAL_POSTS, INITIAL_POLLS, INITIAL_WINS, SUBREDDIT_POSTS } from './screens/community/data.js';
import { INITIAL_MEMBERS } from './screens/members/data.js';
import { DEALER_DIRECTORY_DATA } from './screens/resources/dealer-directory/data.js';

import { AppHeader, ProfileMenu, SCREEN_MAP, VoiceModal, SuccessToast } from './ui.jsx';
import { OrderDetailScreen } from './screens/orders/index.js';
import { Modal } from './components/common/Modal.jsx';
import { ResourceDetailScreen } from './screens/utility/UtilityScreens.jsx';
import { ProductComparisonScreen, CompetitiveAnalysisScreen, SalesScreen, SamplesScreen } from './config/screenMap.js';
import { CreateContentModal } from './screens/community/CreateContentModal.jsx';
import { AnimatedScreenWrapper } from './components/common/AnimatedScreenWrapper.jsx';
import { ProjectsScreen } from './screens/projects/ProjectsScreen.jsx';
import { usePersistentState } from './hooks/usePersistentState.js';
import { ToastHost } from './components/common/ToastHost.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';
import { ScreenSkeleton } from './components/common/ScreenSkeleton.jsx';

// Lazy load less-frequently visited resource feature screens for bundle splitting
const CommissionRatesScreen = React.lazy(() => import('./screens/resources/commission-rates/index.js'));
const LeadTimesScreen = React.lazy(() => import('./screens/resources/lead-times/index.js'));
const ContractsScreen = React.lazy(() => import('./screens/resources/contracts/index.js'));
const DealerDirectoryScreen = React.lazy(() => import('./screens/resources/dealer-directory/index.js'));
const DiscontinuedFinishesScreen = React.lazy(() => import('./screens/resources/discontinued-finishes/index.js'));
const TradeshowsScreen = React.lazy(() => import('./screens/resources/tradeshows/index.js'));
const SampleDiscountsScreen = React.lazy(() => import('./screens/resources/sample-discounts/index.js'));
const LoanerPoolScreen = React.lazy(() => import('./screens/resources/loaner-pool/index.js'));
const InstallInstructionsScreen = React.lazy(() => import('./screens/resources/install-instructions/index.js'));
const NewDealerSignUpScreen = React.lazy(() => import('./screens/resources/new-dealer-signup/index.js'));
const PresentationsScreen = React.lazy(() => import('./screens/resources/presentations/index.js'));
const RequestFieldVisitScreen = React.lazy(() => import('./screens/resources/request-field-visit/index.js'));
const SearchFabricsScreen = React.lazy(() => import('./screens/resources/search-fabrics/index.js'));
const RequestComYardageScreen = React.lazy(() => import('./screens/resources/request-com-yardage/index.js'));
const SocialMediaScreen = React.lazy(() => import('./screens/resources/social-media/index.js'));
const ComColRequest = React.lazy(() => import('./screens/resources/search-fabrics/ComColRequest.jsx').then(m => ({ default: m.ComColRequest })));

// Centralized legacy -> canonical slug mapping for resource feature routes
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
    'commission_rates': 'commission-rates'
    // 'new-dealer-signup' already canonical; no alias needed
};

function normalizeResourceSlug(raw) {
    // Only transform single segment slugs (ignore nested paths like search-fabrics/...)
    if (!raw || raw.includes('/')) return raw;
    return RESOURCE_SLUG_ALIASES[raw] || raw;
}

// Map canonical resource feature slugs to their (lazy) components
const RESOURCE_FEATURE_SCREENS = {
    'commission-rates': CommissionRatesScreen,
    'lead-times': LeadTimesScreen,
    'contracts': ContractsScreen,
    'dealer-directory': DealerDirectoryScreen,
    'discontinued-finishes': DiscontinuedFinishesScreen,
    'tradeshows': TradeshowsScreen,
    'sample-discounts': SampleDiscountsScreen,
    'loaner-pool': LoanerPoolScreen,
    'install-instructions': InstallInstructionsScreen,
    'presentations': PresentationsScreen,
    'request-field-visit': RequestFieldVisitScreen,
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

const ScreenRouter = ({ screenKey, projectsScreenRef, SuspenseFallback, ...rest }) => {
    if (!screenKey) return null;
    const parts = screenKey.split('/');
    const base = parts[0];

    if (base === 'projects') return <ProjectsScreen ref={projectsScreenRef} {...rest} />;

    // Feature screens (lazy) inside Suspense to isolate fallback flicker per screen
    const lazyWrap = (Comp, extraProps) => (
        <Suspense fallback={SuspenseFallback}>
            {React.createElement(Comp, { ...rest, ...extraProps })}
        </Suspense>
    );

    // Samples routes (cart first)
    if (screenKey === 'samples/cart') return lazyWrap(SamplesScreen, { initialCartOpen: true });
    if (base === 'samples') return lazyWrap(SamplesScreen);

    // Resource route normalization (support legacy underscore routes)
    if (base === 'resources') {
        const slug = parts.slice(1).join('/');
        const firstSegment = slug.split('/')[0];
        const normalizedFirst = normalizeResourceSlug(firstSegment);
        const normalized = [normalizedFirst, ...slug.split('/').slice(1)].join('/');

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

    if (base === 'orders' && parts.length > 1) return <OrderDetailScreen {...rest} />;
    if (base === 'resources' && parts.length > 1) return <ResourceDetailScreen {...rest} />;

    // All SCREEN_MAP components may be lazy - wrap in Suspense
    const ScreenComponent = SCREEN_MAP[base] || SalesScreen;
    return (
        <Suspense fallback={SuspenseFallback}>
            <ScreenComponent {...rest} />
        </Suspense>
    );
};

function App() {
    // Persistent preferences / cart
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [cart, setCart] = usePersistentState('samples.cart', {});
    const [homeApps, setHomeApps] = usePersistentState('pref.homeApps', DEFAULT_HOME_APPS);

    // Migrate previously stored 6-app selection to new 8-app default
    useEffect(() => {
        if (!Array.isArray(homeApps) || homeApps.length !== 8) {
            setHomeApps(DEFAULT_HOME_APPS);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Navigation / UI state
    const [navigationHistory, setNavigationHistory] = useState(() => [pathToScreen(window.location.pathname)]);
    const [lastNavigationDirection, setLastNavigationDirection] = useState('forward');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileBtnRef = useRef(null);
    const [voiceMessage, setVoiceMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [alertInfo, setAlertInfo] = useState({ show: false, message: '' });
    const [homeResetKey, setHomeResetKey] = useState(0);

    // Domain state
    const [userSettings, setUserSettings] = useState({ id: 1, firstName: 'Luke', lastName: 'Wagner', homeAddress: '5445 N Deerwood Lake Rd, Jasper, IN 47546' });
    const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
    const [myProjects, setMyProjects] = useState(MY_PROJECTS_DATA);
    const [projectsTabOverride, setProjectsTabOverride] = useState(null);
    const [, setSelectedProject] = useState(null);
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [currentUserId] = useState(1);

    // Community
    const [posts, setPosts] = useState([...INITIAL_POSTS, ...INITIAL_WINS, ...SUBREDDIT_POSTS]);
    const [polls, setPolls] = useState(INITIAL_POLLS);
    const [likedPosts, setLikedPosts] = useState({});
    const [pollChoices, setPollChoices] = useState({});
    const [showCreateContentModal, setShowCreateContentModal] = useState(false);
    const [savedImageIds, setSavedImageIds] = usePersistentState('library.saved', []);
    const [postUpvotes, setPostUpvotes] = useState({});

    // Directories / leads
    const [dealerDirectory] = useState(DEALER_DIRECTORY_DATA);
    const [designFirms, setDesignFirms] = useState(INITIAL_DESIGN_FIRMS);
    const [dealers, setDealers] = useState(INITIAL_DEALERS);
    const [newLeadData, setNewLeadData] = usePersistentState('draft.newLead', EMPTY_LEAD);

    const projectsScreenRef = useRef(null);
    const currentScreen = navigationHistory[navigationHistory.length - 1];

    const currentTheme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

    // mobile vh fix
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

    useEffect(() => {
        const initialScreen = pathToScreen(window.location.pathname);
        const initialStack = Array.isArray(window.history.state?.stack) && window.history.state.stack.length
            ? window.history.state.stack
            : [initialScreen];

        if (!Array.isArray(window.history.state?.stack)) {
            window.history.replaceState({ stack: initialStack }, '', screenToPath(initialScreen));
        }

        setNavigationHistory(initialStack);

        const handlePopState = (event) => {
            const stack = Array.isArray(event.state?.stack) && event.state.stack.length
                ? event.state.stack
                : [pathToScreen(window.location.pathname)];
            setNavigationHistory(stack);
            setLastNavigationDirection('backward');
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => { document.body.style.backgroundColor = currentTheme.colors.background; }, [currentTheme.colors.background]);

    const handleNavigate = useCallback((screen) => {
        setLastNavigationDirection('forward');
        setNavigationHistory((prev) => {
            const next = [...prev, screen];
            window.history.pushState({ stack: next }, '', screenToPath(screen));
            return next;
        });
    }, []);

    const handleBack = useCallback(() => {
        if (currentScreen === 'projects' && projectsScreenRef.current?.clearSelection) {
            const handled = projectsScreenRef.current.clearSelection();
            if (handled) return;
        }
        if (navigationHistory.length > 1) {
            setLastNavigationDirection('backward');
            window.history.back();
        }
    }, [currentScreen, navigationHistory.length]);

    const handleHome = useCallback(() => {
        const next = ['home'];
        setNavigationHistory(next);
        setLastNavigationDirection('backward');
        window.history.pushState({ stack: next }, '', '/');
        setHomeResetKey((prev) => prev + 1);
    }, []);

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

    const handleCreatePost = useCallback((payload) => {
        if (payload.type === 'poll') setPolls((prev) => [payload, ...prev]); else {
            const post = { id: payload.id, type: 'post', user: payload.user, text: payload.text ?? payload.content ?? '', image: payload.image || null, images: payload.images || [], likes: payload.likes ?? 0, comments: payload.comments || [], timeAgo: 'now', createdAt: payload.createdAt || Date.now() };
            setPosts((prev) => [post, ...prev]);
        }
        setShowCreateContentModal(false); setSuccessMessage('Posted!'); setTimeout(() => setSuccessMessage(''), 1500);
    }, []);

    const handleShowAlert = useCallback((message) => setAlertInfo({ show: true, message }), []);
    const handleNewLeadChange = useCallback((updates) => setNewLeadData((prev) => ({ ...prev, ...updates })), [setNewLeadData]);

    const handleLeadSuccess = useCallback((lead) => {
        const newOpp = { id: Date.now(), name: lead.project || 'Untitled Project', stage: lead.projectStatus && STAGES.includes(lead.projectStatus) ? lead.projectStatus : STAGES[0], discount: lead.discount || 'Undecided', value: lead.estimatedList || '$0', company: lead.designFirms?.[0] || lead.dealers?.[0] || 'Unknown', contact: lead.contact || '', poTimeframe: lead.poTimeframe || '', ...lead };
        setOpportunities(prev => [newOpp, ...prev]); setNewLeadData(EMPTY_LEAD); handleNavigate('projects'); setProjectsTabOverride('pipeline'); setSuccessMessage('Lead Added'); setTimeout(() => setSuccessMessage(''), 1500);
    }, [handleNavigate, setNewLeadData]);

    const handleAddInstall = useCallback((install) => {
        const enriched = { id: 'inst-' + Date.now(), photos: install.photos || [], standards: [], quotes: [], ...install };
        setMyProjects(prev => [enriched, ...prev]); handleNavigate('projects'); setProjectsTabOverride('my-projects'); setSuccessMessage('Install Added'); setTimeout(() => setSuccessMessage(''), 1500);
    }, [handleNavigate]);

    const handleUpdateHomeApps = useCallback((apps) => {
        if (!Array.isArray(apps)) return;
        const filtered = apps.filter(r => allApps.some(a => a.route === r));
        setHomeApps(filtered);
    }, [setHomeApps]);


    const screenProps = {
        theme: currentTheme,
        onNavigate: handleNavigate,
        onAskAI: handleAskAI,
        onVoiceActivate: handleVoiceActivate,
        handleBack,
        userSettings,
        setUserSettings,
        setSuccessMessage,
        showAlert: handleShowAlert,
        currentScreen,
        opportunities,
        setOpportunities,
        myProjects,
        setMyProjects,
        setSelectedProject,
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
        openCreateContentModal: () => setShowCreateContentModal(true),
        savedImageIds,
        onToggleSaveImage: handleToggleSaveImage,
        postUpvotes,
        onUpvote: handleUpvote,
        cart,
        setCart,
        onUpdateCart: handleUpdateCart,
        dealerDirectory,
        designFirms,
        setDesignFirms,
        dealers,
        setDealers,
        newLeadData,
        onNewLeadChange: handleNewLeadChange,
        isDarkMode,
        onToggleTheme: () => setIsDarkMode(d => !d),
        onSuccess: handleLeadSuccess,
        onAddInstall: handleAddInstall,
        projectsInitialTab: projectsTabOverride,
        clearProjectsInitialTab: () => setProjectsTabOverride(null),
        homeApps,
        onUpdateHomeApps: handleUpdateHomeApps,
        homeResetKey
    };

    const suspenseFallback = (
        <ScreenSkeleton theme={currentTheme} />
    );

    return (
        <ToastHost theme={currentTheme}>
            <div className="h-screen-safe w-screen font-sans flex flex-col relative" style={{ backgroundColor: currentTheme.colors.background }}>
                <AppHeader
                    theme={currentTheme}
                    userName={userSettings.firstName}
                    showBack={navigationHistory.length > 1}
                    handleBack={handleBack}
                    onHomeClick={handleHome}
                    onProfileClick={() => setShowProfileMenu(p => !p)}
                    isDarkMode={isDarkMode}
                    profileBtnRef={profileBtnRef}
                />
                <div className="flex-1 overflow-hidden" style={{ backgroundColor: currentTheme.colors.background }}>
                    <ErrorBoundary key={currentScreen} theme={currentTheme}>
                        <AnimatedScreenWrapper screenKey={currentScreen} direction={lastNavigationDirection} onSwipeBack={navigationHistory.length > 1 ? handleBack : null}>
                            <ScreenRouter screenKey={currentScreen} projectsScreenRef={projectsScreenRef} SuspenseFallback={suspenseFallback} {...screenProps} />
                        </AnimatedScreenWrapper>
                    </ErrorBoundary>
                </div>
                {showProfileMenu && (
                    <ProfileMenu show={showProfileMenu} onClose={() => setShowProfileMenu(false)} onNavigate={handleNavigate} theme={currentTheme} anchorRef={profileBtnRef} />
                )}
                <VoiceModal message={voiceMessage} show={!!voiceMessage} theme={currentTheme} />
                <SuccessToast message={successMessage} show={!!successMessage} theme={currentTheme} />
                <CreateContentModal show={showCreateContentModal} onClose={() => setShowCreateContentModal(false)} theme={currentTheme} onCreatePost={handleCreatePost} />
                <Modal show={alertInfo.show} onClose={() => setAlertInfo({ show: false, message: '' })} title="Alert" theme={currentTheme}>
                    <p>{alertInfo.message}</p>
                </Modal>
            </div>
        </ToastHost>
    );
}

export default App;
