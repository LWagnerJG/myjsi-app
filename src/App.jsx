import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { lightTheme, darkTheme, INITIAL_OPPORTUNITIES, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS } from './data.js';
import { AppHeader, ProfileMenu, SCREEN_MAP } from './ui.jsx';

function App() {
    const [navigationHistory, setNavigationHistory] = useState(['home']);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [cart, setCart] = useState({});
    const [designFirms, setDesignFirms] = useState(INITIAL_DESIGN_FIRMS);
    const [dealers, setDealers] = useState(INITIAL_DEALERS);
    const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
    const [userSettings, setUserSettings] = useState({
        id: 1,
        firstName: 'Luke',
        lastName: 'Wagner',
        email: 'luke.wagner@example.com',
        homeAddress: '5445 N Deerwood Lake Rd, Jasper, IN 47546',
        tShirtSize: 'L'
    });
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const currentScreen = navigationHistory[navigationHistory.length - 1];
    const currentTheme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

    // lock body scroll on home, restore elsewhere
    useEffect(() => {
        document.body.style.overflow = currentScreen === 'home' ? 'hidden' : 'auto';
    }, [currentScreen]);

    const handleUpdateCart = useCallback((item, change) => {
        setCart(prev => {
            const next = { ...prev };
            const qty = (next[item.id] || 0) + change;
            if (qty > 0) next[item.id] = qty;
            else delete next[item.id];
            return next;
        });
    }, []);

    const handleNewLeadSuccess = useCallback(newLead => {
        setOpportunities(prev => [...prev, newLead]);
        setNavigationHistory(prev => [...prev, 'projects']);
    }, []);

    const handleNavigate = useCallback(screen => {
        setNavigationHistory(prev => [...prev, screen]);
        setShowProfileMenu(false);
    }, []);

    const handleHome = useCallback(() => {
        setNavigationHistory(['home']);
        setShowProfileMenu(false);
    }, []);

    const handleBack = useCallback(() => {
        setNavigationHistory(prev =>
            prev.length > 1 ? prev.slice(0, -1) : prev
        );
    }, []);

    const extraProps = {
        samples: { cart, onUpdateCart: handleUpdateCart, userSettings },
        'samples/cart': { cart, onUpdateCart: handleUpdateCart, userSettings },
        projects: { opportunities },
        settings: { userSettings, setUserSettings },
        'new-lead': { onSuccess: handleNewLeadSuccess, designFirms, setDesignFirms, dealers, setDealers }
    };

    const Screen = SCREEN_MAP[currentScreen];

    return (
        <div
            className="h-screen w-screen font-sans flex flex-col"
            style={{
                backgroundColor: currentTheme.colors.background,
                transform: 'translateY(-8px)'
            }}
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

            <main
                className={`flex-1 ${currentScreen === 'home'
                        ? 'overflow-hidden'
                        : 'overflow-y-auto scrollbar-hide'
                    }`}
            >
                {Screen ? (
                    <Screen
                        theme={currentTheme}
                        onNavigate={handleNavigate}
                        {...(extraProps[currentScreen] || {})}
                    />
                ) : (
                    <div className="p-8 text-center font-semibold">
                        Page Not Found
                    </div>
                )}
            </main>

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
        </div>
    );
}

export default App;
