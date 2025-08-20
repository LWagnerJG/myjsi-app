import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { lightTheme, darkTheme } from './data/index.js';
import { INITIAL_OPPORTUNITIES, MY_PROJECTS_DATA, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS, EMPTY_LEAD } from './screens/projects/data.js';
import { INITIAL_POSTS, INITIAL_POLLS } from './screens/community/data.js';
import { INITIAL_MEMBERS } from './screens/members/data.js';
// Import dealer directory data from the screen-specific location
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

// resource feature screens (folder barrels)
import CommissionRatesScreen from './screens/resources/commission-rates/index.js';
import LeadTimesScreen from './screens/resources/lead-times/index.js';
import ContractsScreen from './screens/resources/contracts/index.js';
import DealerDirectoryScreen from './screens/resources/dealer-directory/index.js';
import DiscontinuedFinishesScreen from './screens/resources/discontinued-finishes/index.js';
import DesignDaysScreen from './screens/resources/design-days/index.js';
import SampleDiscountsScreen from './screens/resources/sample-discounts/index.js';
import LoanerPoolScreen from './screens/resources/loaner-pool/index.js';
import InstallInstructionsScreen from './screens/resources/install-instructions/index.js';
import NewDealerSignUpScreen from './screens/resources/new-dealer-signup/index.js';
import PresentationsScreen from './screens/resources/presentations/index.js';
import RequestFieldVisitScreen from './screens/resources/request-field-visit/index.js';
import SearchFabricsScreen from './screens/resources/search-fabrics/index.js';
import RequestComYardageScreen from './screens/resources/request-com-yardage/index.js';
import SocialMediaScreen from './screens/resources/social-media/index.js';

const ScreenRouter = ({ screenKey, projectsScreenRef, ...rest }) => {
    if (!screenKey) return null;

    const parts = screenKey.split('/');
    const base = parts[0];

    if (base === 'projects') return <ProjectsScreen ref={projectsScreenRef} {...rest} />;

    if (screenKey === 'resources/commission-rates') return <CommissionRatesScreen {...rest} />;
    if (screenKey === 'resources/lead-times') return <LeadTimesScreen {...rest} />;
    if (screenKey === 'resources/contracts') return <ContractsScreen {...rest} />;
    if (screenKey === 'resources/dealer-directory') return <DealerDirectoryScreen {...rest} />;
    if (screenKey === 'resources/discontinued_finishes') return <DiscontinuedFinishesScreen {...rest} />;
    if (screenKey === 'resources/design_days') return <DesignDaysScreen {...rest} />;
    if (screenKey === 'resources/sample_discounts') return <SampleDiscountsScreen {...rest} />;
    if (screenKey === 'resources/loaner_pool') return <LoanerPoolScreen {...rest} />;
    if (screenKey === 'resources/install_instructions') return <InstallInstructionsScreen {...rest} />;
    if (screenKey === 'resources/presentations') return <PresentationsScreen {...rest} />;
    if (screenKey === 'resources/request_field_visit') return <RequestFieldVisitScreen {...rest} />;
    if (screenKey === 'resources/dealer_registration') return <NewDealerSignUpScreen {...rest} />;
    if (screenKey === 'resources/social_media') return <SocialMediaScreen {...rest} />;

    if (screenKey === 'fabrics/search_form') return <SearchFabricsScreen {...rest} />;
    if (screenKey === 'fabrics/com_request') return <RequestComYardageScreen {...rest} />;

    if (base === 'samples') return <SamplesScreen {...rest} />;
    if (screenKey === 'samples/cart') return <SamplesScreen {...rest} initialCartOpen />;
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
    const [navigationHistory, setNavigationHistory] = useState(['home']);
    const [lastNavigationDirection, setLastNavigationDirection] = useState('forward');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [userSettings, setUserSettings] = useState({
        id: 1,
        firstName: 'Luke',
        lastName: 'Wagner',
        homeAddress: '5445 N Deerwood Lake Rd, Jasper, IN 47546',
    });
    const [voiceMessage, setVoiceMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [cart, setCart] = useState({});
    const [alertInfo, setAlertInfo] = useState({ show: false, message: '' });

    const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
    const [myProjects, setMyProjects] = useState(MY_PROJECTS_DATA);
    const [selectedProject, setSelectedProject] = useState(null);
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [currentUserId, setCurrentUserId] = useState(1);

    // Community state
    const [posts, setPosts] = useState(INITIAL_POSTS);
    const [polls, setPolls] = useState(INITIAL_POLLS);
    const [likedPosts, setLikedPosts] = useState({});
    const [pollChoices, setPollChoices] = useState({});
    const [showCreateContentModal, setShowCreateContentModal] = useState(false);

    const [dealerDirectory, setDealerDirectory] = useState(DEALER_DIRECTORY_DATA);
    const [designFirms, setDesignFirms] = useState(INITIAL_DESIGN_FIRMS);
    const [dealers, setDealers] = useState(INITIAL_DEALERS);
    const [newLeadData, setNewLeadData] = useState(EMPTY_LEAD);

    const projectsScreenRef = useRef(null);

    const currentScreen = navigationHistory[navigationHistory.length - 1];
    const currentTheme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

    useEffect(() => {
        const setAppHeight = () => {
            document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
        };
        setAppHeight();
        window.addEventListener('resize', setAppHeight);
        window.addEventListener('orientationchange', setAppHeight);
        return () => {
            window.removeEventListener('resize', setAppHeight);
            window.removeEventListener('orientationchange', setAppHeight);
        };
    }, []);

    useEffect(() => {
        document.body.style.backgroundColor = currentTheme.colors.background;
    }, [currentTheme.colors.background]);

    const handleNavigate = useCallback((screen) => {
        setLastNavigationDirection('forward');
        setNavigationHistory((prev) => [...prev, screen]);
    }, []);

    const handleBack = useCallback(() => {
        if (currentScreen === 'projects' && projectsScreenRef.current?.clearSelection) {
            const handled = projectsScreenRef.current.clearSelection();
            if (handled) return;
        }
        if (navigationHistory.length > 1) {
            setLastNavigationDirection('backward');
            setNavigationHistory((prev) => prev.slice(0, -1));
        }
    }, [navigationHistory.length, currentScreen]);

    const handleHome = useCallback(() => {
        setLastNavigationDirection('backward');
        setNavigationHistory(['home']);
    }, []);

    const handleVoiceActivate = useCallback((message) => {
        setVoiceMessage(message);
        setTimeout(() => setVoiceMessage(''), 1500);
    }, []);

    const handleAskAI = useCallback((query) => {
        setVoiceMessage(`AI Search: ${query}`);
        setTimeout(() => setVoiceMessage(''), 2500);
    }, []);

    const handleUpdateCart = useCallback((item, change) => {
        setCart((prev) => {
            const next = { ...prev };
            const id = String(item.id);
            const curr = next[id] || 0;
            const qty = curr + change;
            if (qty > 0) next[id] = qty;
            else delete next[id];
            return next;
        });
    }, []);

    // ---- Community handlers (optimistic & synchronous) ----
    const handleToggleLike = useCallback((postId) => {
        setLikedPosts((prev) => {
            const isLiked = !!prev[postId];
            const next = { ...prev };
            if (isLiked) delete next[postId];
            else next[postId] = true;

            // update likes on the source posts array immediately
            setPosts((prevPosts) =>
                prevPosts.map((p) =>
                    p.id === postId ? { ...p, likes: Math.max(0, (p.likes || 0) + (isLiked ? -1 : 1)) } : p,
                ),
            );
            return next;
        });
    }, []);

    const handleAddComment = useCallback((postId, text) => {
        const now = Date.now();
        setPosts((prev) =>
            prev.map((p) =>
                p.id === postId
                    ? {
                        ...p,
                        comments: [...(p.comments || []), { id: now, name: 'You', text }],
                    }
                    : p,
            ),
        );
    }, []);

    const handlePollVote = useCallback((pollId, optionId) => {
        setPollChoices((prev) => ({ ...prev, [pollId]: optionId }));
        // optional: update vote counts optimistically
        setPolls((prev) =>
            prev.map((pl) =>
                pl.id !== pollId
                    ? pl
                    : {
                        ...pl,
                        options: pl.options.map((o) =>
                            o.id === optionId ? { ...o, votes: (o.votes || 0) + 1 } : o,
                        ),
                    },
            ),
        );
    }, []);

    const handleCreatePost = useCallback((payload) => {
        if (payload.type === 'poll') {
            setPolls((prev) => [payload, ...prev]);
        } else {
            // normalize to post
            const post = {
                id: payload.id,
                type: 'post',
                user: payload.user,
                text: payload.text ?? payload.content ?? '',
                image: payload.image || null,
                images: payload.images || [],
                likes: payload.likes ?? 0,
                comments: payload.comments || [],
                timeAgo: 'now',
                createdAt: payload.createdAt || Date.now(),
            };
            setPosts((prev) => [post, ...prev]);
        }
        setShowCreateContentModal(false);
        setSuccessMessage('Posted!');
        setTimeout(() => setSuccessMessage(''), 1500);
    }, []);

    const handleShowAlert = useCallback((message) => setAlertInfo({ show: true, message }), []);
    const handleNewLeadChange = useCallback((updates) => {
        setNewLeadData((prev) => ({ ...prev, ...updates }));
    }, []);

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

        // community
        posts,
        polls,
        likedPosts,
        pollChoices,
        onToggleLike: handleToggleLike,
        onAddComment: handleAddComment,
        onPollVote: handlePollVote,
        openCreateContentModal: () => setShowCreateContentModal(true),

        // samples/cart
        cart,
        setCart,
        onUpdateCart: handleUpdateCart,

        // directories
        dealerDirectory,
        designFirms,
        setDesignFirms,
        dealers,
        setDealers,

        // new lead
        newLeadData,
        onNewLeadChange: handleNewLeadChange,

        // theming
        isDarkMode,
        onToggleTheme: () => setIsDarkMode((d) => !d),
    };

    return (
        <div
            className="h-screen-safe w-screen font-sans flex flex-col relative"
            style={{ backgroundColor: currentTheme.colors.background, '--background-color': currentTheme.colors.background }}
        >
            <AppHeader
                theme={currentTheme}
                userName={userSettings.firstName}
                showBack={navigationHistory.length > 1}
                handleBack={handleBack}
                onHomeClick={handleHome}
                onProfileClick={() => setShowProfileMenu((p) => !p)}
                isDarkMode={isDarkMode}
            />

            <div className="flex-1 pt-[76px] overflow-hidden" style={{ backgroundColor: currentTheme.colors.background }}>
                <AnimatedScreenWrapper
                    screenKey={currentScreen}
                    direction={lastNavigationDirection}
                    onSwipeBack={navigationHistory.length > 1 ? handleBack : null}
                >
                    <ScreenRouter screenKey={currentScreen} projectsScreenRef={projectsScreenRef} {...screenProps} />
                </AnimatedScreenWrapper>
            </div>

            {showProfileMenu && (
                <ProfileMenu show={showProfileMenu} onClose={() => setShowProfileMenu(false)} onNavigate={handleNavigate} theme={currentTheme} />
            )}
            <VoiceModal message={voiceMessage} show={!!voiceMessage} theme={currentTheme} />
            <SuccessToast message={successMessage} show={!!successMessage} theme={currentTheme} />

            {/* Composer modal */}
            <CreateContentModal
                show={showCreateContentModal}
                onClose={() => setShowCreateContentModal(false)}
                theme={currentTheme}
                onCreatePost={handleCreatePost}
            />

            <Modal show={alertInfo.show} onClose={() => setAlertInfo({ show: false, message: '' })} title="Alert" theme={currentTheme}>
                <p>{alertInfo.message}</p>
            </Modal>
        </div>
    );
}

export default App;
