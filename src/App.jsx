import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
    INITIAL_OPPORTUNITIES,
    MY_PROJECTS_DATA,
    INITIAL_POSTS,
    INITIAL_POLLS,
    DEALER_DIRECTORY_DATA,
    INITIAL_DESIGN_FIRMS,
    INITIAL_DEALERS,
    EMPTY_LEAD,
    lightTheme,
    darkTheme
} from './data/index.js';
import { INITIAL_MEMBERS } from './screens/members/data.js';

import { AppHeader, ProfileMenu, SCREEN_MAP, VoiceModal, SuccessToast, NewLeadScreen } from './ui.jsx';
import { OrderDetailScreen } from './screens/orders/index.js';
import { SalesScreen } from './screens/sales/SalesScreen.jsx';
import { Modal } from './components/common/Modal.jsx';
import { ResourceDetailScreen } from './screens/utility/UtilityScreens.jsx';
import { ProductComparisonScreen, CompetitiveAnalysisScreen } from './screens/products/index.js';
import { CartScreen } from './screens/samples/index.js';
import { AddNewInstallScreen } from './screens/projects/index.js';
import { CreateContentModal } from './screens/community/index.js';
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

    if (screenKey === 'samples/cart') return <CartScreen {...rest} />;

    if (base === 'products' && parts[1] === 'category' && parts.length === 3) {
        return <ProductComparisonScreen {...rest} categoryId={parts[2]} />;
    }
    if (base === 'products' && parts[1] === 'category' && parts[3] === 'competition') {
        return <CompetitiveAnalysisScreen {...rest} categoryId={parts[2]} />;
    }

    if (base === 'orders' && parts.length > 1) return <OrderDetailScreen {...rest} />;

    if (base === 'resources' && parts.length > 1) return <ResourceDetailScreen {...rest} />;

    const ScreenComponent = SCREEN_MAP[base];
    if (!ScreenComponent) return <div>Screen not found: {screenKey}</div>;

    return <ScreenComponent {...rest} />;
};

function App() {
    const [navigationHistory, setNavigationHistory] = useState(['home']);
    const [lastNavigationDirection, setLastNavigationDirection] = useState('forward');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [userSettings, setUserSettings] = useState({ id: 1, firstName: 'Luke', lastName: 'Wagner', homeAddress: '5445 N Deerwood Lake Rd, Jasper, IN 47546' });
    const [voiceMessage, setVoiceMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [cart, setCart] = useState({});
    const [alertInfo, setAlertInfo] = useState({ show: false, message: '' });

    const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
    const [myProjects, setMyProjects] = useState(MY_PROJECTS_DATA);
    const [selectedProject, setSelectedProject] = useState(null);
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [currentUserId, setCurrentUserId] = useState(1);
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
        setCart((prevCart) => {
            const next = { ...prevCart };
            const curr = next[item.id] || 0;
            const qty = curr + change;
            if (qty > 0) next[item.id] = qty;
            else delete next[item.id];
            return next;
        });
    }, []);

    const handleToggleLike = useCallback((postId) => {
        setLikedPosts((prev) => {
            const isLiked = !!prev[postId];
            const next = { ...prev };
            if (isLiked) delete next[postId];
            else next[postId] = true;
            setPosts((prevPosts) =>
                prevPosts.map((post) => (post.id === postId ? { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1 } : post))
            );
            return next;
        });
    }, []);

    const handlePollVote = useCallback((pollId, optionId) => setPollChoices((prev) => ({ ...prev, [pollId]: optionId })), []);
    const handleAddItem = useCallback((type, obj) => {
        const newItem = { ...obj, id: Date.now() };
        if (type === 'post') setPosts((prev) => [newItem, ...prev]);
        if (type === 'poll') setPolls((prev) => [newItem, ...prev]);
        setShowCreateContentModal(false);
    }, []);
    const handleAddDealer = useCallback(
        (newDealerData) => {
            const newDealer = {
                id: dealerDirectory.length + 1,
                name: newDealerData.dealerName,
                address: 'N/A',
                bookings: 0,
                sales: 0,
                salespeople: [],
                designers: [],
                administration: [{ name: newDealerData.email, status: 'pending' }],
                installers: [],
                recentOrders: [],
                dailyDiscount: newDealerData.dailyDiscount
            };
            setDealerDirectory((prev) => [newDealer, ...prev]);
        },
        [dealerDirectory.length]
    );
    const handleAddNewInstall = useCallback(
        (newInstall) => {
            setMyProjects((prev) => [{ id: `proj${prev.length + 1}_${Date.now()}`, ...newInstall }, ...prev]);
            handleBack();
        },
        [handleBack]
    );
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
        setSelectedProject,
        members,
        setMembers,
        currentUserId,
        posts,
        polls,
        likedPosts,
        onToggleLike: handleToggleLike,
        pollChoices,
        onPollVote: handlePollVote,
        openCreateContentModal: () => setShowCreateContentModal(true),
        cart,
        setCart,
        onUpdateCart: handleUpdateCart,
        dealerDirectory,
        handleAddDealer,
        onAddInstall: handleAddNewInstall,
        newLeadData,
        onNewLeadChange: handleNewLeadChange,
        designFirms,
        setDesignFirms,
        dealers,
        setDealers,
        isDarkMode,
        onToggleTheme: () => setIsDarkMode((d) => !d),
        onSuccess: (submittedLead) => {
            setOpportunities((prev) => [
                ...prev,
                {
                    id: prev.length + 1,
                    name: submittedLead.project,
                    stage: submittedLead.projectStatus,
                    value: `$${parseInt(String(submittedLead.estimatedList).replace(/[^0-9]/g, '') || '0').toLocaleString()}`,
                    company: submittedLead.dealer,
                    ...submittedLead
                }
            ]);
            handleNavigate('projects');
            setSuccessMessage('Lead Created!');
            setNewLeadData(EMPTY_LEAD);
            setTimeout(() => setSuccessMessage(''), 2000);
        }
    };

    return (
        <div
            className="h-screen-safe w-screen font-sans flex flex-col relative"
            style={{
                backgroundColor: currentTheme.colors.background,
                '--background-color': currentTheme.colors.background
            }}
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
            <div className="flex-1 pt-[104px] overflow-hidden" style={{ backgroundColor: currentTheme.colors.background }}>
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
            {showCreateContentModal && <CreateContentModal close={() => setShowCreateContentModal(false)} theme={currentTheme} onAdd={handleAddItem} />}
            <Modal show={alertInfo.show} onClose={() => setAlertInfo({ show: false, message: '' })} title="Alert" theme={currentTheme}>
                <p>{alertInfo.message}</p>
            </Modal>
        </div>
    );
}

export default App;
