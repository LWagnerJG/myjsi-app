import React from 'react';
import HomeScreen from './components/HomeScreen';

function App() {
    return (
        <main>
            <header className="p-4 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-4 mx-4 rounded-full shadow-md">
                <img src="https://i.imgur.com/qskYhB0.png" alt="Logo" className="h-10" />
                <div className="flex items-center space-x-2">
                    <span>Hey, Luke!</span>
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                </div>
            </header>

            <HomeScreen />
        </main>
    );
}

export default App;