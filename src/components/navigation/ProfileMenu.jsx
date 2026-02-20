import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Settings, User, HelpCircle, LogOut, Moon, Sun } from 'lucide-react';
import { isDarkTheme, DESIGN_TOKENS } from '../../design-system/tokens.js';

export const ProfileMenu = ({ show, onClose, onNavigate, theme, anchorRef, isDarkMode, onToggleTheme }) => {
    const isDark = isDarkTheme(theme);
    const [pos, setPos] = useState(null);
    const menuRef = useRef(null);

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

    useEffect(() => {
        if (show && menuRef.current) {
            const firstItem = menuRef.current.querySelector('[role="menuitem"]');
            if (firstItem) firstItem.focus();
        }
    }, [show]);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
            anchorRef?.current?.focus();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const items = Array.from(menuRef.current.querySelectorAll('[role="menuitem"]'));
            const index = items.indexOf(document.activeElement);
            let nextIndex = e.key === 'ArrowDown' ? index + 1 : index - 1;
            if (nextIndex >= items.length) nextIndex = 0;
            if (nextIndex < 0) nextIndex = items.length - 1;
            items[nextIndex]?.focus();
        }
    };

    if (!show || !pos) return null;
    
    const menuItems = [
        { label: 'Settings', action: () => { onNavigate('settings'); onClose(); }, icon: Settings },
        { label: 'App Users', action: () => { onNavigate('members'); onClose(); }, icon: User },
        { label: 'Dark Mode', action: onToggleTheme, icon: isDarkMode ? Sun : Moon, toggle: true },
        { label: 'Help', action: () => { onNavigate('help'); onClose(); }, icon: HelpCircle },
        { label: 'Log Out', action: () => { onNavigate('logout'); onClose(); }, icon: LogOut, danger: true },
    ];

    const hoverBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';

    return createPortal(
        <div className="fixed inset-0 pointer-events-auto" style={{ zIndex: DESIGN_TOKENS.zIndex.popover, animation: 'profileMenuBgFade 200ms ease-out' }} onClick={onClose}>
            <style>{`
                @keyframes profileMenuBgFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes profileMenuSlideIn { from { opacity: 0; transform: scale(0.92) translateY(-6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                @keyframes profileMenuItemStagger { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
            <div 
                ref={menuRef}
                role="menu"
                aria-label="Profile Menu"
                className="absolute w-52 p-1.5 rounded-2xl space-y-0.5 outline-none" 
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
                style={{
                    top: pos.top,
                    right: pos.right,
                    backgroundColor: isDark ? '#282828' : '#FFFFFF',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
                    boxShadow: DESIGN_TOKENS.shadows.modal,
                    animation: 'profileMenuSlideIn 200ms cubic-bezier(0.16,1,0.3,1)',
                    transformOrigin: 'top right',
                }}
            >
                {menuItems.map((item, idx) => (
                    <button 
                        key={item.label} 
                        role="menuitem"
                        onClick={item.action} 
                        className="w-full text-left flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        style={{ color: item.danger ? '#B85C5C' : theme.colors.textPrimary, animation: `profileMenuItemStagger 250ms cubic-bezier(0.16,1,0.3,1) ${idx * 30}ms both` }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = hoverBg}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <item.icon className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: item.danger ? '#B85C5C' : theme.colors.textSecondary }} />
                        <span className="flex-1">{item.label}</span>
                        {item.toggle && (
                            <div className="w-9 h-5 rounded-full relative transition-colors duration-200 flex-shrink-0"
                                style={{ backgroundColor: isDarkMode ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)') }}>
                                <div className="absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200"
                                    style={{
                                        backgroundColor: isDarkMode ? theme.colors.accentText : '#fff',
                                        transform: isDarkMode ? 'translateX(17px)' : 'translateX(2px)',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                                    }} />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>,
        document.body
    );
};