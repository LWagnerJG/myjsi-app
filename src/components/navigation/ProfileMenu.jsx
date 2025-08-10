import React from 'react';
import { Settings, User, HelpCircle, LogOut } from 'lucide-react';
import { GlassCard } from '../common/GlassCard.jsx';

export const ProfileMenu = ({ show, onClose, onNavigate, theme }) => {
    if (!show) return null;
    
    const menuItems = [
        { label: 'Settings', action: () => { onNavigate('settings'); onClose(); }, icon: Settings },
        { label: 'App Users', action: () => { onNavigate('members'); onClose(); }, icon: User },
        { label: 'Help', action: () => { onNavigate('help'); onClose(); }, icon: HelpCircle },
        { label: 'Log Out', action: () => { onNavigate('logout'); onClose(); }, icon: LogOut },
    ];

    return (
        <div className="fixed inset-0 z-30 pointer-events-auto" onClick={onClose}>
            <GlassCard 
                theme={theme} 
                className="absolute top-20 right-2 w-48 p-2 space-y-1" 
                onClick={(e) => e.stopPropagation()}
            >
                {menuItems.map(item => (
                    <button 
                        key={item.label} 
                        onClick={item.action} 
                        className="w-full text-left flex items-center px-3 py-2 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10" 
                        style={{ color: theme.colors.textPrimary }}
                    >
                        <item.icon className="w-4 h-4 mr-3" style={{ color: theme.colors.secondary }} />
                        {item.label}
                    </button>
                ))}
            </GlassCard>
        </div>
    );
};