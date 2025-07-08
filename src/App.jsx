import React, { useState, useMemo, useCallback } from 'react';
import { lightTheme, darkTheme } from './data.js';
import { SCREEN_MAP } from './ui.jsx';
import { User } from 'lucide-react';

function App() {
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

    const renderScreen = () => {
        const ContentComponent = SCREEN_MAP[currentScreen];
        if (ContentComponent) {
            return <ContentComponent onNavigate={handleNavigate} theme={currentTheme} />;
        }
        return <div className="p-8 text-center">Page Not Found</div>;
    };

    return (
        <div style={{ backgroundColor: currentTheme.colors.background }} className="h-screen w-screen font-sans flex flex-col">
            <header className="p-4 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-4 mx-4 rounded-full shadow-md z-10">
                <img src="https://i.imgur.com/qskYhB0.png" alt="Logo" onClick={handleHome} className="h-10 cursor-pointer" />
                <div className="flex items-center space-x-2">
                    <span style={{ color: currentTheme.colors.textPrimary }}>Hey, {userSettings.firstName}!</span>
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User size={18} color={currentTheme.colors.textSecondary} />
                    </div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto scrollbar-hide">
                {renderScreen()}
            </main>
        </div>
    );
}

export default App;