import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { lightTheme, darkTheme, INITIAL_MEMBERS, INITIAL_OPPORTUNITIES, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS } from './data.jsx';
import { AppHeader, ProfileMenu, SCREEN_MAP, OrderModal, Modal, SuccessToast, PageTitle } from './ui.jsx';
import * as Data from './data.jsx';

function App() {
    // --- STATE ---
    const [navigationHistory, setNavigationHistory] = useState(['home']);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [alertInfo, setAlertInfo] = useState({ show: false, message: '' });
    const [voiceMessage, setVoiceMessage] = useState('');

    // State for specific screens
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
    const [aiResponse, setAiResponse] = useState('');
    const [isAILoading, setIsAILoading] = useState(false);
    const [showAIDropdown, setShowAIDropdown] = useState(false);

    // Ref for swipe-to-go-back gesture
    const touchStartX = useRef(0);

    // --- DERIVED STATE ---
    const currentScreen = navigationHistory[navigationHistory.length - 1];
    const currentTheme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

    // --- HANDLERS ---
    const handleNavigate = useCallback((screen) => { setNavigationHistory(prev => [...prev, screen]); }, []);
    const handleHome = useCallback(() => { setNavigationHistory(['home']); }, []);
    const handleBack = useCallback(() => { if (navigationHistory.length > 1) { setNavigationHistory(prev => prev.slice(0, -1)); } }, [navigationHistory.length]);
    const handleSaveSettings = useCallback(() => { setSuccessMessage("Settings Saved!"); setTimeout(() => setSuccessMessage(""), 2000); handleBack(); }, [handleBack]);
    const handleNewLeadSuccess = useCallback((newLead) => { setOpportunities(prev => [...prev, newLead]); handleNavigate('projects'); }, [handleNavigate]);
    const handleShowAlert = useCallback((message) => { setAlertInfo({ show: true, message }); }, []);
    const handleShowVoiceModal = useCallback((message) => { setVoiceMessage(message); setTimeout(() => setVoiceMessage(''), 1000); }, []);
    const handleAskAI = useCallback(async (prompt) => {
        if (!prompt) return;
        setShowAIDropdown(true);
        setIsAILoading(true);
        setTimeout(() => {
            setAiResponse(`This is a simulated response for: "${prompt}"`);
            setIsAILoading(false);
        }, 1500);
    }, []);
    const handleCloseAIDropdown = useCallback(() => { setShowAIDropdown(false); }, []);

    // RESTORED: Handlers for the swipe-to-go-back gesture
    const handleTouchStart = (e) => {
        if (e.targetTouches[0].clientX < 50) {
            touchStartX.current = e.targetTouches[0].clientX;
        } else {
            touchStartX.current = 0;
        }
    };
    const handleTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        if (touchStartX.current > 0 && touchEndX - touchStartX.current > 75) {
            handleBack();
        }
        touchStartX.current = 0;
    };

    const renderScreen = () => {
        const screenKey = currentScreen.split('/')[0];
        const ScreenComponent = SCREEN_MAP[screenKey];

        if (!ScreenComponent) return <PageTitle title="Not Found" theme={currentTheme} />;

        const props = { theme: currentTheme, onNavigate: handleNavigate, setSuccessMessage, showAlert: handleShowAlert };

        switch (screenKey) {
            case 'home':
                return <ScreenComponent {...props} onAskAI={handleAskAI} showAIDropdown={showAIDropdown} aiResponse={aiResponse} isAILoading={isAILoading} onCloseAIDropdown={handleCloseAIDropdown} onVoiceActivate={handleShowVoiceModal} />;
            case 'orders':
                return <ScreenComponent {...props} setSelectedOrder={setSelectedOrder} />;
            case 'settings':
                return <ScreenComponent {...props} userSettings={userSettings} setUserSettings={setUserSettings} onSave={handleSaveSettings} />;
            case 'members':
                return <ScreenComponent {...props} members={members} setMembers={setMembers} currentUserId={currentUserId} />;
            case 'projects':
                return <ScreenComponent {...props} opportunities={opportunities} />;
            case 'new-lead':
                return <ScreenComponent {...props} onSuccess={handleNewLeadSuccess} designFirms={designFirms} setDesignFirms={setDesignFirms} dealers={dealers} setDealers={setDealers} />;
            default:
                return <ScreenComponent {...props} />;
        }
    };

    return (
        <div
            className="h-screen w-screen font-sans flex flex-col"
            style={{ backgroundColor: currentTheme.colors.background }}
            // RESTORED: Touch handlers for swipe gesture
            onTouchStart={handleTouchStart}
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

            {/* FIXED: This main element now correctly disables scrolling ONLY on the home screen */}
            <main className={`flex-1 ${currentScreen === 'home' ? 'overflow-hidden' : 'overflow-y-auto'} scrollbar-hide`}>
                {renderScreen()}
            </main>

            <div className="absolute inset-0 pointer-events-none">
                {showProfileMenu && <ProfileMenu show={showProfileMenu} onClose={() => setShowProfileMenu(false)} onNavigate={handleNavigate} toggleTheme={() => setIsDarkMode(d => !d)} theme={currentTheme} isDarkMode={isDarkMode} />}
                {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} theme={currentTheme} />}
                <Modal show={alertInfo.show} onClose={() => setAlertInfo({ show: false, message: '' })} title="Alert" theme={currentTheme}><p>{alertInfo.message}</p></Modal>
                <SuccessToast message={successMessage} show={!!successMessage} theme={currentTheme} />
            </div>
        </div>
    );
}

export default App;