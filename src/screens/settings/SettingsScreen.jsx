import React, { useState, useRef, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { User, Bell, Palette, ChevronDown } from 'lucide-react';

const Toggle = ({ checked, onChange, theme }) => (
    <button
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full transition-all duration-200 relative`}
        style={{ backgroundColor: checked ? theme.colors.accent : theme.colors.border }}
    >
        <div
            className="w-5 h-5 bg-white rounded-full transition-transform duration-200 absolute top-0.5"
            style={{ 
                transform: checked ? 'translateX(26px)' : 'translateX(2px)',
                left: 0
            }}
        />
    </button>
);

const Select = ({ value, onChange, options, theme }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);
    const current = options.find(o => o.value === value)?.label || 'Select…';
    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-sm"
                style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
            >
                <span>{current}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: theme.colors.textSecondary }} />
            </button>
            {open && (
                <div className="absolute z-[9999] mt-1 w-full">
                    <GlassCard theme={theme} className="p-1">
                        {options.map(o => (
                            <button
                                key={o.value}
                                onClick={() => { onChange(o.value); setOpen(false); }}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5 text-sm"
                                style={{ color: theme.colors.textPrimary }}
                            >
                                {o.label}
                            </button>
                        ))}
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export const SettingsScreen = ({ theme, isDarkMode, onToggleTheme }) => {
    const [firstName, setFirstName] = useState('Luke');
    const [lastName, setLastName] = useState('Wagner');
    const [shirtSize, setShirtSize] = useState('L');

    const [notif, setNotif] = useState({
        newOrder: true,
        samplesShipped: true,
        leadTimeChange: true,
        communityPost: false,
        replacementApproved: true,
        commissionPosted: true,
        orderUpdate: true
    });

    const notifList = [
        { key: 'newOrder', label: 'New order placed' },
        { key: 'orderUpdate', label: 'Order status update' },
        { key: 'samplesShipped', label: 'Samples shipped' },
        { key: 'leadTimeChange', label: 'Lead time change' },
        { key: 'replacementApproved', label: 'Replacement approved' },
        { key: 'commissionPosted', label: 'Commission posted' },
        { key: 'communityPost', label: 'New JSI community post' }
    ];

    const appVersion = 'v0.9.3';

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto px-4 pb-16 space-y-6 pt-4 scrollbar-hide">
                <GlassCard theme={theme} className="p-0">
                    <div className="p-4 border-b" style={{ borderColor: theme.colors.subtle }}>
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5" style={{ color: theme.colors.accent }} />
                            <h2 className="font-bold" style={{ color: theme.colors.textPrimary }}>Account</h2>
                        </div>
                    </div>
                    <div className="p-4 grid grid-cols-1 gap-3">
                        <div>
                            <label className="block text-xs mb-1" style={{ color: theme.colors.textSecondary }}>First Name</label>
                            <input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl text-sm"
                                style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                                placeholder="First name"
                            />
                        </div>
                        <div>
                            <label className="block text-xs mb-1" style={{ color: theme.colors.textSecondary }}>Last Name</label>
                            <input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl text-sm"
                                style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                                placeholder="Last name"
                            />
                        </div>
                        <div>
                            <label className="block text-xs mb-1" style={{ color: theme.colors.textSecondary }}>T-Shirt Size</label>
                            <Select
                                value={shirtSize}
                                onChange={setShirtSize}
                                options={[
                                    { value: 'XS', label: 'XS' },
                                    { value: 'S', label: 'S' },
                                    { value: 'M', label: 'M' },
                                    { value: 'L', label: 'L' },
                                    { value: 'XL', label: 'XL' },
                                    { value: 'XXL', label: 'XXL' }
                                ]}
                                theme={theme}
                            />
                        </div>
                    </div>
                </GlassCard>

                <GlassCard theme={theme} className="p-0">
                    <div className="p-4 border-b" style={{ borderColor: theme.colors.subtle }}>
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5" style={{ color: theme.colors.accent }} />
                            <h2 className="font-bold" style={{ color: theme.colors.textPrimary }}>Push Notifications</h2>
                        </div>
                    </div>
                    <div className="p-2">
                        {notifList.map((n, i) => (
                            <div
                                key={n.key}
                                className={`flex items-center justify-between px-2 py-3 ${i < notifList.length - 1 ? 'border-b' : ''}`}
                                style={{ borderColor: theme.colors.subtle }}
                            >
                                <span className="text-sm" style={{ color: theme.colors.textPrimary }}>{n.label}</span>
                                <Toggle
                                    checked={!!notif[n.key]}
                                    onChange={(v) => setNotif((prev) => ({ ...prev, [n.key]: v }))}
                                    theme={theme}
                                />
                            </div>
                        ))}
                    </div>
                </GlassCard>

                <GlassCard theme={theme} className="p-0">
                    <div className="p-4 border-b" style={{ borderColor: theme.colors.subtle }}>
                        <div className="flex items-center gap-2">
                            <Palette className="w-5 h-5" style={{ color: theme.colors.accent }} />
                            <h2 className="font-bold" style={{ color: theme.colors.textPrimary }}>Appearance</h2>
                        </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                        <span className="text-sm" style={{ color: theme.colors.textPrimary }}>Dark mode</span>
                        <Toggle checked={isDarkMode} onChange={onToggleTheme} theme={theme} />
                    </div>
                </GlassCard>

                <div className="pt-2 text-center text-[10px]" style={{ color: theme.colors.textSecondary }}>
                    {appVersion}
                </div>
            </div>
        </div>
    );
};
