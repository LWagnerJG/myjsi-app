import React, { useState, useMemo, useCallback } from 'react';

// Import themes and data from the data file
import { lightTheme, darkTheme } from './data.js';

import { AppHeader, HomeScreen, SCREEN_MAP } from './ui.jsx';

import { User } from 'lucide-react'; // Import icon needed for the header

function App() {
    // All your state and logic goes here
    const [navigationHistory, setNavigationHistory] = useState(['home']);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [userSettings] = useState({ firstName: 'Luke' });

    const currentScreen = navigationHistory[navigationHistory.length - 1];
    const currentTheme = useMemo(() => isDarkMode ? darkTheme : lightTheme, [isDarkMode]);

    const handleNavigate = useCallback((screen) => {
        setNavigationHistory(prev => [...prev, screen]);
    }, []);

    const handleHome = useCallback(() => {
        setNavigationHistory(['home']);
    }, []);

    // This function decides which screen component to show
    const renderScreen = () => {
        const ContentComponent = SCREEN_MAP[currentScreen];
        if (ContentComponent) {
            // Pass the necessary functions and state to the screen component
            return <ContentComponent onNavigate={handleNavigate} theme={currentTheme} />;
        }
        return <div className="p-8 text-center font-semibold">Page Not Found</div>;
    };

    return (
        <div style={{ backgroundColor: currentTheme.colors.background }} className="h-screen w-screen font-sans flex flex-col">
            <AppHeader
                onHomeClick={handleHome}
                theme={currentTheme}
                userName={userSettings.firstName}
                isDarkMode={isDarkMode}
            // Add other props like handleBack if needed later
            />
            <main className="flex-1 overflow-y-auto scrollbar-hide">
                {renderScreen()}
            </main>
        </div>
    );
}

export default App;