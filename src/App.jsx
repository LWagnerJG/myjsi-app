import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { lightTheme, darkTheme } from './data.js';
import { AppHeader, ProfileMenu, SCREEN_MAP, VoiceModal, Modal, SuccessToast, PageTitle } from './ui.jsx';
import * as Data from './data.js';

function App() {
    // --- STATE ---
    const [navigationHistory, setNavigationHistory] = useState(['home']);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [cart, setCart] = useState({});
    const [opportunities, setOpportunities] = useState(Data.INITIAL_OPPORTUNITIES);
    const [designFirms, setDesignFirms] = useState(Data.INITIAL_DESIGN_FIRMS);
    const [dealers, setDealers] = useState(Data.INITIAL_DEALERS);
    const [userSettings, setUserSettings] = useState({
        id: 1,
        firstName: 'Luke',
        lastName: 'Wagner',
        email: 'luke.wagner@example.com',
        homeAddress: '5445 N Deerwood Lake Rd, Jasper, IN 47546',
        tShirtSize: 'L'
    });
    const [voiceMessage, setVoiceMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [alertInfo, setAlertInfo] = useState({ show: false, message: '' });

    // --- DERIVED STATE ---
    const currentScreen = navigationHistory[navigationHistory.length - 1];
    const currentTheme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

    // --- HANDLERS ---
    const handleNavigate = useCallback((screen) => { setNavigationHistory(prev => [...prev, screen]); setShowProfileMenu(false); }, []);
    const handleHome = useCallback(() => { setNavigationHistory(['home']); setShowProfileMenu(false); }, []);
    const handleBack = useCallback(() => { if (navigationHistory.length > 1) { setNavigationHistory(prev => prev.slice(0, -1)); } }, [navigationHistory]);
    const handleShowAlert = useCallback((message) => { setAlertInfo({ show: true, message }); }, []);
    const handleShowVoiceModal = useCallback((message) => { setVoiceMessage(message); setTimeout(() => setVoiceMessage(''), 1000); }, []);
    const handleNewLeadSuccess = useCallback(newLead => { setOpportunities(prev => [...prev, newLead]); handleNavigate('projects'); }, [handleNavigate]);
    const handleUpdateCart = useCallback((item, change) => {
        setCart(prev => {
            const next = { ...prev };
            const qty = (next[item.id] || 0) + change;
            if (qty > 0) next[item.id] = qty;
            else delete next[item.id];
            return next;
        });
    }, []);

    // --- RENDER LOGIC ---
    const renderScreen = () => {
        const ScreenComponent = SCREEN_MAP[currentScreen.split('/')[0]];

        if (!ScreenComponent) {
            return <PageTitle title="Not Found" theme={currentTheme} />;
        }

        // This new logic explicitly passes the correct props to each screen
        const props = {
            theme: currentTheme,
            onNavigate: handleNavigate,
            setSuccessMessage,
            showAlert: handleShowAlert,
        };

        switch (currentScreen) {
            case 'projects':
                return <ScreenComponent {...props} opportunities={opportunities} />;
            case 'samples':
            case 'samples/cart':
                return <ScreenComponent {...props} cart={cart} onUpdateCart={handleUpdateCart} userSettings={userSettings} />;
            case 'settings':
                return <ScreenComponent {...props} userSettings={userSettings} setUserSettings={setUserSettings} onSave={() => { setSuccessMessage("Settings Saved!"); setTimeout(() => setSuccessMessage(''), 2000); handleBack(); }} />;
            case 'new-lead':
                return <ScreenComponent {...props} onSuccess={handleNewLeadSuccess} designFirms={designFirms} setDesignFirms={setDesignFirms} dealers={dealers} setDealers={setDealers} />;
            case 'home':
                return <ScreenComponent {...props} onVoiceActivate={handleShowVoiceModal} />;
            default:
                return <ScreenComponent {...props} />;
        }
    };

    return (
        <div
            className="h-screen w-screen font-sans flex flex-col"
            style={{ backgroundColor: currentTheme.colors.background }}
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
                onProfileClick={() => setShowProfileMenu(true)}
            />

            <main className={`flex-1 overflow-y-auto scrollbar-hide`}>
                {renderScreen()}
            </main>

            <div className="absolute inset-0 pointer-events-none">
                {showProfileMenu && (
                    <ProfileMenu
                        show={showProfileMenu}
                        onClose={() => setShowProfileMenu(false)}
                        onNavigate={handleNavigate}
                        toggleTheme={() => setIsDarkMode(d => !d)}
                        theme={currentTheme}
                        isDarkMode={isDarkMode}
                    />
                )}
                <Modal show={alertInfo.show} onClose={() => setAlertInfo({ show: false, message: '' })} title="Alert" theme={currentTheme}>
                    <p>{alertInfo.message}</p>
                </Modal>
                <SuccessToast message={successMessage} show={!!successMessage} theme={currentTheme} />
                <VoiceModal message={voiceMessage} show={!!voiceMessage} theme={currentTheme} />
            </div>
        </div>
    );
}

export default App;