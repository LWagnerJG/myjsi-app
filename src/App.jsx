import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { lightTheme, darkTheme, INITIAL_MEMBERS, INITIAL_OPPORTUNITIES, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS } from './data.jsx';
import {
    AppHeader, ProfileMenu, SCREEN_MAP, OrderModal, Modal, SuccessToast, PageTitle,
    ResourceDetailScreen, CartScreen, VoiceModal, ProductComparisonScreen,
    CompetitiveAnalysisScreen, PlaceholderScreen, FabricsScreen
} from './ui.jsx';
import * as Data from './data.jsx';

function App() {
    // --- CORE APP STATE ---
    const [navigationHistory, setNavigationHistory] = useState(['home']);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [alertInfo, setAlertInfo] = useState({ show: false, message: '' });
    const [voiceMessage, setVoiceMessage] = useState('');
    const [swipeTranslateX, setSwipeTranslateX] = useState(0); // New state for swipe animation
    const [isAnimatingBack, setIsAnimatingBack] = useState(false); // New state to control animation timing

    // --- SCREEN-SPECIFIC STATE ---
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [currentUserId, setCurrentUserId] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
    const [designFirms, setDesignFirms] = useState(INITIAL_DESIGN_FIRMS);
    const [dealers, setDealers] = useState(INITIAL_DEALERS);
    const [userSettings, setUserSettings] = useState({
        id: 1,
        firstName: 'Luke',
        lastName: 'Miller',
        email: 'luke.wagner@example.com',
        homeAddress: '5445 N Deerwood Lake Rd, Jasper, IN 47546',
        tShirtSize: 'L',
        permissions: { salesData: true, commissions: true, projects: true, customerRanking: true, dealerRewards: true, submittingReplacements: true }
    });
    const [cart, setCart] = useState({});

    // --- GESTURE & AI STATE ---
    const touchStartX = useRef(0);
    const [aiResponse, setAiResponse] = useState('');
    const [isAILoading, setIsAILoading] = useState(false);
    const [showAIDropdown, setShowAIDropdown] = useState(false);

    // --- DERIVED STATE ---
    const currentScreen = navigationHistory[navigationHistory.length - 1];
    const previousScreen = navigationHistory[navigationHistory.length - 2]; // Get the previous screen for potential animation
    const currentTheme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

    // --- SIDE EFFECTS ---
    useEffect(() => {
        const preventDefault = (e) => e.preventDefault();
        // Lock scrolling on home screen for mobile
        if (currentScreen === 'home') {
            document.body.addEventListener('touchmove', preventDefault, { passive: false });
        } else {
            document.body.removeEventListener('touchmove', preventDefault);
        }
        return () => document.body.removeEventListener('touchmove', preventDefault);
    }, [currentScreen]);

    useEffect(() => {
        setMembers(prevMembers => prevMembers.map(member =>
            member.id === currentUserId
                ? { ...member, firstName: userSettings.firstName, lastName: userSettings.lastName, email: userSettings.email }
                : member
        ));
    }, [userSettings, currentUserId]);


    // --- HANDLERS ---
    const handleNavigate = useCallback((screen) => {
        setNavigationHistory(prev => [...prev, screen]);
        setShowProfileMenu(false);
        setSwipeTranslateX(0); // Reset animation state on new navigation
        setIsAnimatingBack(false);
    }, []);

    const handleHome = useCallback(() => {
        setNavigationHistory(['home']);
        setShowProfileMenu(false);
        setSwipeTranslateX(0); // Reset animation state on home navigation
        setIsAnimatingBack(false);
    }, []);

    const handleBack = useCallback(() => {
        if (navigationHistory.length > 1) {
            setIsAnimatingBack(true); // Start animation
            setSwipeTranslateX(window.innerWidth); // Animate current screen off to the right
            setTimeout(() => {
                setNavigationHistory(prev => prev.slice(0, -1));
                setSwipeTranslateX(0); // Reset for next screen
                setIsAnimatingBack(false); // End animation state
            }, 300); // Match CSS transition duration
        }
    }, [navigationHistory.length]);

    const handleSaveSettings = useCallback(() => { setSuccessMessage("Settings Saved!"); setTimeout(() => setSuccessMessage(""), 2000); handleBack(); }, [handleBack]);
    const handleNewLeadSuccess = useCallback((newLead) => {
        const newOpportunity = {
            id: opportunities.length + 1,
            name: newLead.project,
            stage: newLead.projectStatus,
            value: `$${parseInt(String(newLead.estimatedList).replace(/[^0-9]/g, '')).toLocaleString()}`,
            company: newLead.dealer,
        };
        setOpportunities(prev => [...prev, newOpportunity]);
        handleNavigate('projects');
        setSuccessMessage("Lead Created!");
        setTimeout(() => setSuccessMessage(""), 2000);
    }, [opportunities, handleNavigate]);
    const handleShowAlert = useCallback((message) => { setAlertInfo({ show: true, message }); }, []);
    const handleShowVoiceModal = useCallback((message) => { setVoiceMessage(message); setTimeout(() => setVoiceMessage(''), 1200); }, []);
    const handleUpdateCart = useCallback((item, change) => {
        setCart(prev => {
            const newCart = { ...prev };
            const currentQty = newCart[item.id] || 0;
            const newQty = currentQty + change;
            if (newQty > 0) newCart[item.id] = newQty;
            else delete newCart[item.id];
            return newCart;
        });
    }, []);
    const handleAskAI = useCallback(async (prompt) => {
        if (!prompt) return;
        setShowAIDropdown(true);
        setIsAILoading(true);
        setTimeout(() => {
            setAiResponse(`This is a simulated AI response for: "${prompt}"`);
            setIsAILoading(false);
        }, 1500);
    }, []);
    const handleCloseAIDropdown = useCallback(() => { setShowAIDropdown(false); }, []);

    // Gesture handler for swiping back
    const handleTouchStart = (e) => {
        // Only consider touches from the far left edge of the screen
        if (e.targetTouches[0].clientX < 50) {
            touchStartX.current = e.targetTouches[0].clientX;
            // Optionally, prevent default to avoid scrolling while swiping
            // e.preventDefault();
        } else {
            touchStartX.current = 0; // Reset if not a left-edge swipe
        }
    };

    const handleTouchMove = (e) => {
        if (touchStartX.current === 0 || isAnimatingBack) return; // Only track valid swipes and not during animation
        const currentTouchX = e.targetTouches[0].clientX;
        const diffX = currentTouchX - touchStartX.current;

        // Only allow positive movement (swiping right)
        if (diffX > 0) {
            setSwipeTranslateX(diffX);
            // Optionally, prevent default to avoid scrolling while swiping
            // e.preventDefault();
        }
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === 0 || isAnimatingBack) return; // Only process valid swipes and not during animation

        const touchEndX = e.changedTouches[0].clientX;
        const swipeDistance = touchEndX - touchStartX.current;

        // Threshold for a successful "back" swipe
        if (swipeDistance > 75 && navigationHistory.length > 1) {
            handleBack(); // Trigger the animated back navigation
        } else {
            // If swipe not long enough, snap back to original position
            setSwipeTranslateX(0);
        }
        touchStartX.current = 0; // Reset
    };

    // --- RENDER LOGIC ---
    // renderScreen now takes an optional 'isCurrent' prop to differentiate the rendering context
    const renderScreen = (screenKey, isCurrent = true) => {
        const screenParts = screenKey.split('/');
        const baseScreenKey = screenParts[0];

        const commonProps = {
            theme: currentTheme,
            onNavigate: handleNavigate,
            setSuccessMessage,
            showAlert: handleShowAlert,
            handleBack, // This handleBack now includes animation
            userSettings,
            currentScreen: screenKey, // Pass the full screen key
        };

        if (baseScreenKey === 'products' && screenParts[1] === 'category' && screenParts[2]) {
            return <ProductComparisonScreen {...commonProps} categoryId={screenParts[2]} />;
        }
        if (baseScreenKey === 'products' && screenParts[1] === 'competitive-analysis' && screenParts[2]) {
            return <CompetitiveAnalysisScreen {...commonProps} categoryId={screenParts[2]} />;
        }
        if (baseScreenKey === 'resources' && screenParts.length > 1) {
            return <ResourceDetailScreen {...commonProps} />;
        }
        if (screenKey === 'samples/cart') {
            return <CartScreen {...commonProps} cart={cart} setCart={setCart} onUpdateCart={handleUpdateCart} />;
        }

        const ScreenComponent = SCREEN_MAP[baseScreenKey];
        if (!ScreenComponent) return <PlaceholderScreen {...commonProps} category="Page Not Found" />;

        switch (baseScreenKey) {
            case 'home':
                return <ScreenComponent {...commonProps} onAskAI={handleAskAI} showAIDropdown={showAIDropdown} aiResponse={aiResponse} isAILoading={isAILoading} onCloseAIDropdown={handleCloseAIDropdown} onVoiceActivate={handleShowVoiceModal} />;
            case 'fabrics':
                return <ScreenComponent {...commonProps} />;
            case 'orders':
                return <ScreenComponent {...commonProps} setSelectedOrder={setSelectedOrder} />;
            case 'samples':
                return <ScreenComponent {...commonProps} cart={cart} onUpdateCart={handleUpdateCart} />;
            case 'settings':
                return <ScreenComponent {...commonProps} setUserSettings={setUserSettings} onSave={handleSaveSettings} />;
            case 'members':
                return <ScreenComponent {...commonProps} members={members} setMembers={setMembers} currentUserId={currentUserId} />;
            case 'projects':
                return <ScreenComponent {...commonProps} opportunities={opportunities} />;
            case 'new-lead':
                return <ScreenComponent {...commonProps} onSuccess={handleNewLeadSuccess} designFirms={designFirms} setDesignFirms={setDesignFirms} dealers={dealers} setDealers={setDealers} />;
            default:
                return <ScreenComponent {...commonProps} />;
        }
    };

    return (
        <div
            className="h-screen w-screen font-sans flex flex-col relative overflow-hidden" // Added relative and overflow-hidden
            style={{ backgroundColor: currentTheme.colors.background }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove} // Add touch move handler
            onTouchEnd={handleTouchEnd}
        >
            <AppHeader
                theme={currentTheme}
                userName={userSettings.firstName}
                isHome={currentScreen === 'home'}
                showBack={navigationHistory.length > 1}
                handleBack={handleBack}
                isDarkMode={isDarkMode}
                onToggleDark={() => setIsDarkMode(d => !d)}
                onHomeClick={handleHome}
                onProfileClick={() => setShowProfileMenu(p => !p)}
            />

            {/* Container for the current screen, animated on swipe */}
            {/* The pt-[72px] is based on AppHeader height. Adjust if AppHeader height changes. */}
            <div
                className={`absolute inset-0 pt-[72px] transition-transform duration-300 ${currentScreen === 'home' ? 'overflow-hidden' : 'overflow-y-auto'} scrollbar-hide`}
                style={{
                    backgroundColor: currentTheme.colors.background, // Ensure background covers the screen
                    transform: `translateX(${swipeTranslateX}px)`
                }}
            >
                {renderScreen(currentScreen, true)}
            </div>

            {/* Render the previous screen slightly off-screen for the reveal effect */}
            {navigationHistory.length > 1 && (
                <div
                    className={`absolute inset-0 pt-[72px] transition-transform duration-300 ${previousScreen === 'home' ? 'overflow-hidden' : 'overflow-y-auto'} scrollbar-hide`}
                    style={{
                        backgroundColor: currentTheme.colors.background,
                        transform: `translateX(${swipeTranslateX - window.innerWidth}px)` // Position to the left, ready to be revealed
                    }}
                >
                    {renderScreen(previousScreen, false)}
                </div>
            )}


            <div className="absolute inset-0 pointer-events-none">
                {showProfileMenu && <ProfileMenu show={showProfileMenu} onClose={() => setShowProfileMenu(false)} onNavigate={handleNavigate} toggleTheme={() => setIsDarkMode(d => !d)} theme={currentTheme} isDarkMode={isDarkMode} />}
                {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} theme={currentTheme} />}
                <Modal show={alertInfo.show} onClose={() => setAlertInfo({ show: false, message: '' })} title="Alert" theme={currentTheme}><p>{alertInfo.message}</p></Modal>
                <SuccessToast message={successMessage} show={!!successMessage} theme={currentTheme} />
                <VoiceModal message={voiceMessage} show={!!voiceMessage} theme={currentTheme} />
            </div>
        </div>
    );
}

export default App;