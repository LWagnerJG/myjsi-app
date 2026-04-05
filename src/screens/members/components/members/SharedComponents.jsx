import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Building2, AlertTriangle, Shield, ChevronDown, Check } from 'lucide-react';
import { getAvatarColor } from './utils.js';
import { getRoleLabel, isAdminRole, PERMISSION_DESCRIPTIONS } from '../../data.js';
import { getUnifiedBackdropStyle, UNIFIED_MODAL_Z } from '../../../../components/common/modalUtils.js';

export const Avatar = ({ firstName, lastName, size = 'md' }) => {
    const initials = `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
    const bg = getAvatarColor(`${firstName}${lastName}`);
    const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
    return (
        <div className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold flex-shrink-0 select-none`}
            style={{ backgroundColor: bg, color: '#fff' }}>
            {initials}
        </div>
    );
};

export const CompanyAvatar = ({ name }) => {
    const bg = getAvatarColor(name);
    return (
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${bg}18` }}>
            <Building2 className="w-5 h-5" style={{ color: bg }} />
        </div>
    );
};

export const ConfirmModal = ({ open, title, message, confirmLabel, onConfirm, onCancel, theme }) => {
    if (!open) return null;
    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: UNIFIED_MODAL_Z }}>
            {/* backdrop */}
            <div className="absolute inset-0" style={getUnifiedBackdropStyle(true)} onClick={onCancel} />
            {/* card */}
            <div className="relative w-full max-w-sm rounded-2xl p-5 space-y-4"
                style={{
                    backgroundColor: theme.colors.surface,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
                    border: `1px solid ${theme.colors.border}`,
                }}>
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: theme.colors.errorLight }}>
                        <AlertTriangle className="w-4.5 h-4.5" style={{ color: theme.colors.error }} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{title}</h3>
                        <p className="text-xs mt-1 leading-relaxed" style={{ color: theme.colors.textSecondary }}>{message}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                    <button onClick={onCancel}
                        className="px-4 py-1.5 rounded-full text-xs font-medium transition-opacity hover:opacity-80"
                        style={{ color: theme.colors.textSecondary, border: `1.5px solid ${theme.colors.border}` }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm}
                        className="px-4 py-1.5 rounded-full text-xs font-semibold transition-opacity hover:opacity-90"
                        style={{ backgroundColor: 'var(--theme-error, #B85C5C)', color: '#fff' }}>
                        {confirmLabel || 'Remove'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const RoleDropdown = ({ value, roles, onChange, theme }) => {
    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);
    const menuRef = useRef(null);
    const [pos, setPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            const inBtn = btnRef.current?.contains(e.target);
            const inMenu = menuRef.current?.contains(e.target);
            if (!inBtn && !inMenu) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    useEffect(() => {
        if (!open || !btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        setPos({ top: rect.bottom + 4, left: rect.left });
    }, [open]);

    const currentLabel = getRoleLabel(value);

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                onClick={() => setOpen(!open)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
                style={{
                    backgroundColor: isAdminRole(value) ? `${theme.colors.accent}10` : theme.colors.subtle,
                    color: theme.colors.textPrimary,
                    border: `1.5px solid ${open ? theme.colors.accent : theme.colors.border}`,
                }}
            >
                {isAdminRole(value) && <Shield className="w-3 h-3" style={{ color: theme.colors.accent }} />}
                {currentLabel}
                <ChevronDown className="w-3 h-3 transition-transform duration-150"
                    style={{ color: theme.colors.textSecondary, transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
            </button>
            {open && createPortal(
                <>
                    <div className="fixed inset-0 z-[70]" onClick={() => setOpen(false)} />
                    <div
                        ref={menuRef}
                        className="fixed z-[71] py-1 rounded-xl min-w-[200px]"
                        style={{
                            top: pos.top,
                            left: pos.left,
                            backgroundColor: theme.colors.surface,
                            border: `1px solid ${theme.colors.border}`,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                        }}
                    >
                        {roles.map(r => (
                            <button
                                key={r.value}
                                onClick={() => { onChange(r.value); setOpen(false); }}
                                className="w-full text-left px-3.5 py-2 text-sm transition-colors flex items-center justify-between hover:bg-black/[0.03] dark:hover:bg-white/[0.08]"
                                style={{ color: theme.colors.textPrimary }}
                            >
                                <span className="flex items-center gap-2">
                                    {isAdminRole(r.value) && <Shield className="w-3 h-3" style={{ color: theme.colors.accent }} />}
                                    {r.label}
                                </span>
                                {r.value === value && <Check className="w-3.5 h-3.5" style={{ color: theme.colors.accent }} />}
                            </button>
                        ))}
                    </div>
                </>,
                document.body
            )}
        </>
    );
};

export const PermToggle = ({ permKey, label, enabled, onToggle, theme, disabled }) => (
    <button
        type="button"
        onClick={disabled ? undefined : onToggle}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
        style={{
            backgroundColor: enabled ? theme.colors.accent : 'transparent',
            color: enabled ? theme.colors.accentText : theme.colors.textSecondary,
            border: `1.5px solid ${enabled ? theme.colors.accent : theme.colors.border}`,
        }}
        title={PERMISSION_DESCRIPTIONS?.[permKey] || ''}
        aria-pressed={enabled}
    >
        {label}
    </button>
);
