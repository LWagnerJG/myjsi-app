import React from 'react';
import { MENU_ITEMS } from '../data.js';
import { MessageSquare } from 'lucide-react';

// A self-contained card component for this screen
const GlassCard = ({ children, onClick }) => (
    <div
        onClick={onClick}
        className="bg-white/80 backdrop-blur-sm border border-black/5 rounded-3xl shadow-lg p-4 cursor-pointer"
    >
        {children}
    </div>
);

function HomeScreen() {
    return (
        <div className="p-4 pt-8">
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Ask me anything..."
                    className="w-full p-4 pl-12 text-lg rounded-full border-2 border-gray-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {MENU_ITEMS.map((item) => (
                    <GlassCard key={item.id}>
                        <div className="h-24 flex flex-col justify-between">
                            <item.icon className="w-7 h-7 text-gray-500" strokeWidth={1.5} />
                            <span className="text-xl font-bold text-gray-800">{item.label}</span>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <div className="mt-4">
                <GlassCard>
                    <div className="h-20 flex items-center justify-center space-x-3">
                        <MessageSquare className="w-7 h-7 text-gray-500" strokeWidth={1.5} />
                        <span className="text-xl font-bold text-gray-800">Give Feedback</span>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}

export default HomeScreen;