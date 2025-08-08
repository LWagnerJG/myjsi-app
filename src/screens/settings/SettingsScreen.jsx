import React, { useState } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { 
    User, 
    Shield, 
    Bell, 
    Palette, 
    Database, 
    Download, 
    LogOut, 
    ChevronRight 
} from 'lucide-react';

// Permission Toggle Component
const PermissionToggle = ({ label, isEnabled, disabled, onToggle, theme }) => (
    <div className={`flex items-center justify-between ${disabled ? 'opacity-50' : ''}`}>
        <span className="text-sm" style={{ color: theme.colors.textPrimary }}>{label}</span>
        <button
            onClick={onToggle}
            disabled={disabled}
            className={`w-12 h-6 rounded-full transition-all duration-200 transform active:scale-95 ${
                isEnabled ? 'bg-blue-500' : 'bg-gray-300'
            } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
        </button>
    </div>
);

export const SettingsScreen = ({ theme, onNavigate }) => {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [autoSync, setAutoSync] = useState(true);

    const settingsSections = [
        {
            title: "Account",
            items: [
                { label: "Profile Settings", icon: User, action: () => {} },
                { label: "Privacy", icon: Shield, action: () => {} },
                { label: "Security", icon: Shield, action: () => {} }
            ]
        },
        {
            title: "Notifications",
            items: [
                { 
                    label: "Push Notifications", 
                    icon: Bell, 
                    toggle: true, 
                    value: notifications, 
                    onChange: setNotifications 
                }
            ]
        },
        {
            title: "Appearance",
            items: [
                { 
                    label: "Dark Mode", 
                    icon: Palette, 
                    toggle: true, 
                    value: darkMode, 
                    onChange: setDarkMode 
                }
            ]
        },
        {
            title: "Data & Storage",
            items: [
                { 
                    label: "Auto Sync", 
                    icon: Database, 
                    toggle: true, 
                    value: autoSync, 
                    onChange: setAutoSync 
                },
                { label: "Clear Cache", icon: Download, action: () => {} }
            ]
        }
    ];

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <div className="px-4 pt-6 pb-4">
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                    Settings
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6 scrollbar-hide">
                {settingsSections.map((section, sectionIndex) => (
                    <GlassCard key={sectionIndex} theme={theme} className="p-0">
                        <h2 className="font-bold text-xl p-4" style={{ color: theme.colors.textPrimary }}>
                            {section.title}
                        </h2>
                        <div>
                            {section.items.map((item, itemIndex) => (
                                <div 
                                    key={itemIndex}
                                    className={`flex items-center justify-between p-4 ${
                                        itemIndex < section.items.length - 1 ? 'border-b' : ''
                                    }`}
                                    style={{ borderColor: theme.colors.subtle }}
                                >
                                    <div className="flex items-center space-x-3">
                                        <item.icon className="w-5 h-5" style={{ color: theme.colors.accent }} />
                                        <span className="font-medium" style={{ color: theme.colors.textPrimary }}>
                                            {item.label}
                                        </span>
                                    </div>
                                    {item.toggle ? (
                                        <PermissionToggle 
                                            label=""
                                            isEnabled={item.value}
                                            onToggle={() => item.onChange(!item.value)}
                                            theme={theme}
                                        />
                                    ) : (
                                        <ChevronRight className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                ))}

                <div className="pt-4">
                    <button
                        onClick={() => onNavigate('logout')}
                        className="w-full flex items-center justify-center space-x-2 py-3 rounded-full font-semibold transition-all duration-200 transform active:scale-95"
                        style={{ backgroundColor: '#EF4444', color: 'white' }}
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </div>
    );
};