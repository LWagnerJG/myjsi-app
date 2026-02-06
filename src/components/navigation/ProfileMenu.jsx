import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Settings, User, HelpCircle, LogOut } from 'lucide-react';
import { isDarkTheme, DESIGN_TOKENS } from '../../design-system/tokens.js';

export const ProfileMenu = ({ show, onClose, onNavigate, theme, anchorRef }) => {
    const isDark = isDarkTheme(theme);
    const [pos, setPos] = useState(null);

    useEffect(() => {
        if (!show || !anchorRef?.current) { setPos(null); return; }
        const update = () => {
            const r = anchorRef.current.getBoundingClientRect();
            setPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
        };
        update();
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
        return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
    }, [show, anchorRef]);

    if (!show || !pos) return null;
    
    const menuItems = [
        { label: 'Settings', action: () => { onNavigate('settings'); onClose(); }, icon: Settings },
        { label: 'App Users', action: () => { onNavigate('members'); onClose(); }, icon: User },
        { label: 'Help', action: () => { onNavigate('help'); onClose(); }, icon: HelpCircle },
        { label: 'Log Out', action: () => { onNavigate('logout'); onClose(); }, icon: LogOut, danger: true },
    ];

    const hoverBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';

    return createPortal(
        <div className="fixed inset-0 pointer-events-auto" style={{ zIndex: DESIGN_TOKENS.zIndex.popover }} onClick={onClose}>
            <div 
                className="absolute w-52 p-1.5 rounded-2xl space-y-0.5" 
                onClick={(e) => e.stopPropagation()}
                style={{
                    top: pos.top,
                    right: pos.right,
                    backgroundColor: isDark ? 'rgba(40,40,40,0.88)' : 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(24px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
                    boxShadow: DESIGN_TOKENS.shadows.modal
                }}
            >
                {menuItems.map(item => (
                    <button 
                        key={item.label} 
                        onClick={item.action} 
                        className="w-full text-left flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                        style={{ color: item.danger ? '#B85C5C' : theme.colors.textPrimary }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = hoverBg}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <item.icon className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: item.danger ? '#B85C5C' : theme.colors.textSecondary }} />
                        {item.label}
                    </button>
                ))}
            </div>
        </div>,
        document.body
    );
};