import React, { useState, useMemo, useCallback, useEffect, useRef, Suspense } from 'react';
import { lightTheme, darkTheme } from './data/index.js';
import { DEFAULT_HOME_APPS, allApps } from './data.jsx';
import { INITIAL_OPPORTUNITIES, MY_PROJECTS_DATA, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS, EMPTY_LEAD, STAGES } from './screens/projects/data.js';
import { INITIAL_POSTS, INITIAL_POLLS } from './screens/community/data.js';
import { INITIAL_MEMBERS } from './screens/members/data.js';
import { DEALER_DIRECTORY_DATA } from './screens/resources/dealer-directory/data.js';

import { AppHeader, ProfileMenu, SCREEN_MAP, VoiceModal, SuccessToast } from './ui.jsx';
import { OrderDetailScreen } from './screens/orders/index.js';
import { SalesScreen } from './screens/sales/SalesScreen.jsx';
import { Modal } from './components/common/Modal.jsx';
import { ResourceDetailScreen } from './screens/utility/UtilityScreens.jsx';
import { ProductComparisonScreen, CompetitiveAnalysisScreen } from './screens/products/index.js';
import { SamplesScreen } from './screens/samples/index.js';
import { CreateContentModal } from './screens/community/CreateContentModal.jsx';
import { AnimatedScreenWrapper } from './components/common/AnimatedScreenWrapper.jsx';
import { ProjectsScreen } from './screens/projects/ProjectsScreen.jsx';
import { usePersistentState } from './hooks/usePersistentState.js';
import { ToastHost } from './components/common/ToastHost.jsx';

// Lazy load less-frequently visited resource feature screens for bundle splitting
const CommissionRatesScreen = React.lazy(() => import('./screens/resources/commission-rates/index.js'));
const LeadTimesScreen = React.lazy(() => import('./screens/resources/lead-times/index.js'));
const ContractsScreen = React.lazy(() => import('./screens/resources/contracts/index.js'));
const DealerDirectoryScreen = React.lazy(() => import('./screens/resources/dealer-directory/index.js'));
const DiscontinuedFinishesScreen = React.lazy(() => import('./screens/resources/discontinued-finishes/index.js'));
const DesignDaysScreen = React.lazy(() => import('./screens/resources/design-days/index.js'));
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

const ScreenRouter = ({ screenKey, projectsScreenRef, SuspenseFallback, ...rest }) => {
    if (!screenKey) return null;
    const parts = screenKey.split('/');
    const base = parts[0];

    if (base === 'projects') return <ProjectsScreen ref={projectsScreenRef} {...rest} />;

    // Samples routes (cart first)
    if (screenKey === 'samples/cart') return <SamplesScreen {...rest} initialCartOpen />;
    if (base === 'samples') return <SamplesScreen {...rest} />;

    // Feature screens (lazy) inside Suspense to isolate fallback flicker per screen
    const lazyWrap = (Comp) => (
        <Suspense fallback={SuspenseFallback}> <Comp {...rest} /> </Suspense>
    );

    // Resource route normalization (support legacy underscore routes)
    if (base === 'resources') {
        const slug = parts.slice(1).join('/');
        // Map underscore legacy to hyphen
        const normalized = slug
            .replace('discontinued_finishes', 'discontinued-finishes')
            .replace('design_days', 'design-days')
            .replace('sample_discounts', 'sample-discounts')
            .replace('loaner_pool', 'loaner-pool')
            .replace('install_instructions', 'install-instructions')
            .replace('request_field_visit', 'request-field-visit')
            .replace('social_media', 'social-media')
            .replace('dealer_directory', 'dealer-directory')
            .replace('commission_rates', 'commission-rates')
            .replace('new-dealer-signup', 'new-dealer-signup');

        switch (normalized) {
            case 'commission-rates': return lazyWrap(CommissionRatesScreen);
            case 'lead-times': return lazyWrap(LeadTimesScreen);
            case 'contracts': return lazyWrap(ContractsScreen);
            case 'dealer-directory': return lazyWrap(DealerDirectoryScreen);
            case 'discontinued-finishes': return lazyWrap(DiscontinuedFinishesScreen);
            case 'design-days': return lazyWrap(DesignDaysScreen);
            case 'sample-discounts': return lazyWrap(SampleDiscountsScreen);
            case 'loaner-pool': return lazyWrap(LoanerPoolScreen);
            case 'install-instructions': return lazyWrap(InstallInstructionsScreen);
            case 'presentations': return lazyWrap(PresentationsScreen);
            case 'request-field-visit': return lazyWrap(RequestFieldVisitScreen);
            case 'new-dealer-signup': return lazyWrap(NewDealerSignUpScreen);
            case 'social-media': return lazyWrap(SocialMediaScreen);
            case 'search-fabrics': return lazyWrap(SearchFabricsScreen);
            case 'request-com-yardage': return lazyWrap(RequestComYardageScreen);
            case 'comcol-request': return lazyWrap(ComColRequest);
            default: break; // fall through to generic resource detail if not a feature screen
        }
    }

    if (base === 'products' && parts[1] === 'category' && parts.length === 3) {
        return <ProductComparisonScreen {...rest} categoryId={parts[2]} />;
    }
    if (base === 'products' && parts[1] === 'category' && parts[3] === 'competition') {
        return <CompetitiveAnalysisScreen {...rest} categoryId={parts[2]} />;
    }

    if (base === 'orders' && parts.length > 1) return <OrderDetailScreen {...rest} />;
    if (base === 'resources' && parts.length > 1) return <ResourceDetailScreen {...rest} />;

    const ScreenComponent = SCREEN_MAP[base] || SalesScreen;
    return <ScreenComponent {...rest} />;
};

function App() {
    // Persistent preferences / cart
    const [isDarkMode, setIsDarkMode] = usePersistentState('pref.darkMode', false);
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
    const [navigationHistory, setNavigationHistory] = useState(['home']);
    const [lastNavigationDirection, setLastNavigationDirection] = useState('forward');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [voiceMessage, setVoiceMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [alertInfo, setAlertInfo] = useState({ show: false, message: '' });

    // Domain state
    const [userSettings, setUserSettings] = useState({ id: 1, firstName: 'Luke', lastName: 'Wagner', homeAddress: '5445 N Deerwood Lake Rd, Jasper, IN 47546' });
    const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
    const [myProjects, setMyProjects] = useState(MY_PROJECTS_DATA);
    const [projectsTabOverride, setProjectsTabOverride] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [currentUserId] = useState(1);

    // Community
    const [posts, setPosts] = useState(INITIAL_POSTS);
    const [polls, setPolls] = useState(INITIAL_POLLS);
    const [likedPosts, setLikedPosts] = useState({});
    const [pollChoices, setPollChoices] = useState({});
    const [showCreateContentModal, setShowCreateContentModal] = useState(false);

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

    useEffect(() => { document.body.style.backgroundColor = currentTheme.colors.background; }, [currentTheme.colors.background]);

    const handleNavigate = useCallback((screen) => {
        setLastNavigationDirection('forward');
        setNavigationHistory((prev) => [...prev, screen]);
    }, []);

    const handleBack = useCallback(() => {
        if (currentScreen === 'projects' && projectsScreenRef.current?.clearSelection) {
            const handled = projectsScreenRef.current.clearSelection();
            if (handled) return;
        }
        setNavigationHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
        setLastNavigationDirection('backward');
    }, [currentScreen]);

    const handleHome = useCallback(() => { setNavigationHistory(['home']); setLastNavigationDirection('backward'); }, []);

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
    const handleNewLeadChange = useCallback((updates) => setNewLeadData((prev) => ({ ...prev, ...updates })), []);

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
        if (filtered.length === 8) setHomeApps(filtered);
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
        onUpdateHomeApps: handleUpdateHomeApps
    };

    const suspenseFallback = (
        <div className="flex items-center justify-center w-full h-full text-sm" style={{ color: currentTheme.colors.textSecondary }}>
            Loading…
        </div>
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
            />
            <div className="flex-1 pt-[76px] overflow-hidden" style={{ backgroundColor: currentTheme.colors.background }}>
                <AnimatedScreenWrapper screenKey={currentScreen} direction={lastNavigationDirection} onSwipeBack={navigationHistory.length > 1 ? handleBack : null}>
                    <ScreenRouter screenKey={currentScreen} projectsScreenRef={projectsScreenRef} SuspenseFallback={suspenseFallback} {...screenProps} />
                </AnimatedScreenWrapper>
            </div>
            {showProfileMenu && (
                <ProfileMenu show={showProfileMenu} onClose={() => setShowProfileMenu(false)} onNavigate={handleNavigate} theme={currentTheme} />
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
