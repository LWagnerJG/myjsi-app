import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Mail, Phone, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import {
    INITIAL_MEMBERS,
    PERMISSION_LABELS,
    USER_TITLES,
    USER_ROLES,
    EMPTY_USER,
    PERMISSION_DESCRIPTIONS
} from './data.js';

const PillToggle = ({ label, enabled, onToggle, theme, disabled }) => {
    return (
        <button
            type="button"
            onClick={disabled ? undefined : onToggle}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${enabled ? 'shadow-sm' : ''
                } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            style={{
                backgroundColor: enabled ? theme.colors.accent : theme.colors.subtle,
                color: enabled ? '#fff' : theme.colors.textPrimary,
                border: `1px solid ${enabled ? theme.colors.accent : theme.colors.border}`
            }}
            title={PERMISSION_DESCRIPTIONS?.[label] || ''}
            aria-pressed={enabled}
        >
            {label}
        </button>
    );
};

const InlineSelect = ({ value, onChange, options, theme, placeholder = 'Select…' }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const clickAway = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', clickAway);
        return () => document.removeEventListener('mousedown', clickAway);
    }, []);
    const current = options.find((o) => o.value === value)?.label || placeholder;
    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full px-3 py-2 rounded-xl text-sm flex justify-between items-center"
                style={{
                    backgroundColor: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.textPrimary
                }}
            >
                <span className="truncate">{current}</span>
                <ChevronDown
                    className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
                    style={{ color: theme.colors.textSecondary }}
                />
            </button>
            {open && (
                <div className="absolute z-10 mt-1 w-full">
                    <GlassCard theme={theme} className="p-1 max-h-56 overflow-y-auto">
                        {options.map((o) => (
                            <button
                                key={o.value}
                                type="button"
                                onClick={() => {
                                    onChange(o.value);
                                    setOpen(false);
                                }}
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

const MemberRow = ({
    theme,
    user,
    expanded,
    onToggle,
    onChangeField,
    onTogglePerm,
    onDelete
}) => {
    return (
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: theme.colors.border }}>
            <button
                type="button"
                onClick={onToggle}
                className="w-full px-4 py-3 text-left bg-white/50 backdrop-blur hover:bg-white/70 transition-colors"
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="font-semibold truncate" style={{ color: theme.colors.textPrimary }}>
                            {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs mt-0.5 truncate" style={{ color: theme.colors.textSecondary }}>
                            {user.email}
                        </div>
                    </div>
                    {expanded ? (
                        <ChevronUp className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    ) : (
                        <ChevronDown className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    )}
                </div>
            </button>

            {expanded && (
                <div className="px-4 pt-3 pb-4 space-y-4" style={{ backgroundColor: theme.colors.surface }}>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                            <span style={{ color: theme.colors.textSecondary }}>{user.email}</span>
                        </div>
                        {user.phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                <span style={{ color: theme.colors.textSecondary }}>{user.phone}</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <div className="text-xs mb-1" style={{ color: theme.colors.textSecondary }}>
                                Role
                            </div>
                            <InlineSelect
                                value={user.role}
                                onChange={(val) => onChangeField('role', val)}
                                options={USER_ROLES.map((r) => ({ value: r, label: r }))}
                                theme={theme}
                            />
                        </div>
                        <div>
                            <div className="text-xs mb-1" style={{ color: theme.colors.textSecondary }}>
                                Title
                            </div>
                            <InlineSelect
                                value={user.title}
                                onChange={(val) => onChangeField('title', val)}
                                options={USER_TITLES.map((t) => ({ value: t, label: t }))}
                                theme={theme}
                            />
                        </div>
                    </div>

                    {user.role !== 'Admin' && (
                        <div className="space-y-2">
                            <div className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
                                Permissions
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
                                    const locked =
                                        !user.permissions.salesData &&
                                        ['commissions', 'dealerRewards', 'customerRanking'].includes(key);
                                    return (
                                        <PillToggle
                                            key={key}
                                            label={label}
                                            enabled={!!user.permissions[key]}
                                            disabled={locked}
                                            onToggle={() => onTogglePerm(key)}
                                            theme={theme}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                if (window.confirm(`Delete ${user.firstName} ${user.lastName}? This cannot be undone.`)) {
                                    onDelete();
                                }
                            }}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold"
                            style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                        >
                            <Trash2 className="w-4 h-4" /> Delete User
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const MembersScreen = ({ theme }) => {
    const [original, setOriginal] = useState(INITIAL_MEMBERS);
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [expandedId, setExpandedId] = useState(null);
    const [dirty, setDirty] = useState(false);

    const handleToggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

    const updateUser = (id, updater) => {
        setMembers((prev) =>
            prev.map((m) => (m.id === id ? (typeof updater === 'function' ? updater(m) : { ...m, ...updater }) : m))
        );
        setDirty(true);
    };

    const onChangeField = (id, field, value) => updateUser(id, { [field]: value });

    const onTogglePerm = (id, key) =>
        updateUser(id, (m) => {
            const next = { ...m.permissions, [key]: !m.permissions[key] };
            if (key === 'salesData' && !next.salesData) {
                next.commissions = false;
                next.dealerRewards = false;
                next.customerRanking = false;
            }
            return { ...m, permissions: next };
        });

    const onDelete = (id) => {
        setMembers((prev) => prev.filter((m) => m.id !== id));
        if (expandedId === id) setExpandedId(null);
        setDirty(true);
    };

    const saveAll = () => {
        // replace with API call later
        console.log('Saved members:', members);
        setOriginal(members);
        setDirty(false);
    };

    const cancelAll = () => {
        setMembers(original);
        setDirty(false);
        setExpandedId(null);
    };

    const admins = useMemo(() => members.filter((m) => m.role === 'Admin'), [members]);
    const users = useMemo(() => members.filter((m) => m.role !== 'Admin'), [members]);

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4 space-y-6 scrollbar-hide">
                {admins.length > 0 && (
                    <GlassCard theme={theme} className="p-3">
                        <div className="px-1 pb-2">
                            <h2 className="font-bold" style={{ color: theme.colors.textPrimary }}>
                                Administrators
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {admins.map((u) => (
                                <MemberRow
                                    key={u.id}
                                    theme={theme}
                                    user={u}
                                    expanded={expandedId === u.id}
                                    onToggle={() => handleToggleExpand(u.id)}
                                    onChangeField={(field, val) => onChangeField(u.id, field, val)}
                                    onTogglePerm={(key) => onTogglePerm(u.id, key)}
                                    onDelete={() => onDelete(u.id)}
                                />
                            ))}
                        </div>
                    </GlassCard>
                )}

                <GlassCard theme={theme} className="p-3">
                    <div className="px-1 pb-2">
                        <h2 className="font-bold" style={{ color: theme.colors.textPrimary }}>
                            Users
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {users.map((u) => (
                            <MemberRow
                                key={u.id}
                                theme={theme}
                                user={u}
                                expanded={expandedId === u.id}
                                onToggle={() => handleToggleExpand(u.id)}
                                onChangeField={(field, val) => onChangeField(u.id, field, val)}
                                onTogglePerm={(key) => onTogglePerm(u.id, key)}
                                onDelete={() => onDelete(u.id)}
                            />
                        ))}
                    </div>
                </GlassCard>
            </div>

            {dirty && (
                <div
                    className="fixed bottom-0 left-0 right-0 z-20 px-4 py-3"
                    style={{
                        backgroundColor: theme.colors.surface,
                        borderTop: `1px solid ${theme.colors.border}`,
                        backdropFilter: 'blur(8px)'
                    }}
                >
                    <div className="max-w-screen-md mx-auto flex items-center gap-2">
                        <button
                            type="button"
                            onClick={cancelAll}
                            className="px-4 py-2 rounded-full font-semibold text-sm"
                            style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={saveAll}
                            className="px-5 py-2 rounded-full font-semibold text-sm text-white"
                            style={{ backgroundColor: theme.colors.accent }}
                        >
                            Save changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
