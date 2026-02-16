// screens/members/MembersScreen.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { StyledSelect } from '../../components/forms/StyledSelect.jsx';
import { PillButton, PrimaryButton, SecondaryButton } from '../../components/common/JSIButtons.jsx';
import {
    Mail,
    Phone,
    ChevronDown,
    ChevronUp,
    Trash2,
    Shield,
    User as UserIcon,
} from 'lucide-react';

import {
    INITIAL_MEMBERS,
    PERMISSION_LABELS,
    USER_TITLES,
    USER_ROLES,
    PERMISSION_DESCRIPTIONS,
} from './data.js';

const DropdownMenu = ({ options, onSelect, theme }) => {
    return (
        <GlassCard
            theme={theme}
            className="absolute top-20 right-2 w-48 p-2 space-y-1 z-30"
        >
            {options.map((option) => (
                <button
                    key={option.label}
                    onClick={() => onSelect(option.value)}
                    className="w-full text-left flex items-center px-3 py-2 rounded-lg transition-colors"
                    style={{ color: theme.colors.textPrimary }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.colors.hoverLight || 'rgba(0,0,0,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <option.icon className="w-4 h-4 mr-3" style={{ color: theme.colors.secondary }} />
                    {option.label}
                </button>
            ))}
        </GlassCard>
    );
};

/* ===========================
   Error Boundary (unchanged)
   =========================== */
class MembersErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, info) {
        console.error('Members screen error:', error, info);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-4">
                    <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        There was an error loading the members screen.
                    </p>
                    <PrimaryButton
                        theme={{ colors: { accent: '#353535' } }}
                        onClick={() => this.setState({ hasError: false, error: null })}
                        size="default"
                    >
                        Try Again
                    </PrimaryButton>
                </div>
            );
        }
        return this.props.children;
    }
}

/* =======================
   Permission pill toggle
   ======================= */
const PillToggle = ({ label, enabled, onToggle, theme, disabled }) => {
    return (
        <button
            type="button"
            onClick={disabled ? undefined : onToggle}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                } ${enabled ? 'shadow-sm' : ''}`}
            style={{
                backgroundColor: enabled ? theme.colors.accent : theme.colors.subtle,
                color: enabled ? '#fff' : theme.colors.textPrimary,
                border: `1px solid ${enabled ? theme.colors.accent : theme.colors.border}`,
            }}
            title={PERMISSION_DESCRIPTIONS?.[label] || ''}
            aria-pressed={enabled}
        >
            {label}
        </button>
    );
};

/* =================
   Member row (tile)
   ================= */
const MemberRow = ({
    theme,
    user,
    expanded,
    onToggle,
    onChangeField,
    onTogglePerm,
    onDelete,
}) => {
    if (!user || !user.permissions) return null;

    return (
        <GlassCard theme={theme} className="p-0 rounded-[24px]">
            <button
                type="button"
                onClick={onToggle}
                className="w-full px-4 py-4 text-left rounded-[24px]"
                style={{ backgroundColor: 'transparent' }}
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: theme.colors.subtle }}
                        >
                            <UserIcon className="w-5 h-5" style={{ color: theme.colors.accent }} />
                        </div>
                        <div className="min-w-0">
                            <div className="font-semibold truncate" style={{ color: theme.colors.textPrimary }}>
                                {(user.firstName || '') + ' ' + (user.lastName || '')}
                            </div>
                            <div className="text-xs mt-0.5 truncate flex items-center gap-1 opacity-80" style={{ color: theme.colors.textSecondary }}>
                                <Mail className="w-3.5 h-3.5" />
                                {user.email || ''}
                            </div>
                        </div>
                    </div>
                    {expanded ? (
                        <ChevronUp className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                    ) : (
                        <ChevronDown className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                    )}
                </div>
            </button>

            {expanded && (
                <div className="px-4 pb-4 pt-2 space-y-4">
                    {/* Contact bits */}
                    {user.phone && (
                        <div className="flex items-center gap-2 text-sm" style={{ color: theme.colors.textSecondary }}>
                            <Phone className="w-4 h-4" />
                            {user.phone}
                        </div>
                    )}

                    {/* Role & Title using StyledSelect */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <StyledSelect
                            label="Role"
                            value={user.role || 'User'}
                            onChange={(e) => onChangeField('role', e.target.value)}
                            options={USER_ROLES}
                            theme={theme}
                        />
                        <StyledSelect
                            label="Title"
                            value={user.title || 'Sales'}
                            onChange={(e) => onChangeField('title', e.target.value)}
                            options={USER_TITLES}
                            theme={theme}
                        />
                    </div>

                    {/* Permissions */}
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

                    <div className="pt-1">
                        <PillButton
                            theme={theme}
                            isSelected={false}
                            size="compact"
                            onClick={() => {
                                if (window.confirm(`Delete ${user.firstName} ${user.lastName}? This cannot be undone.`)) {
                                    onDelete();
                                }
                            }}
                            className="inline-flex items-center gap-2"
                            style={{ backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#fecaca' }}
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete User
                        </PillButton>
                    </div>
                </div>
            )}
        </GlassCard>
    );
};

/* ==================
   Screen component
   ================== */
const MembersScreenContent = ({ theme }) => {
    const [original, setOriginal] = useState(INITIAL_MEMBERS);
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [expandedId, setExpandedId] = useState(null);
    const [dirty, setDirty] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleToggleExpand = useCallback((id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    }, []);

    const updateUser = useCallback((id, updater) => {
        setMembers((prev) =>
            prev.map((m) => (m.id === id ? (typeof updater === 'function' ? updater(m) : { ...m, ...updater }) : m))
        );
        setDirty(true);
    }, []);

    const onChangeField = useCallback((id, field, value) => {
        updateUser(id, { [field]: value });
    }, [updateUser]);

    const onTogglePerm = useCallback((id, key) => {
        updateUser(id, (m) => {
            const next = { ...m.permissions, [key]: !m.permissions[key] };
            if (key === 'salesData' && !next.salesData) {
                next.commissions = false;
                next.dealerRewards = false;
                next.customerRanking = false;
            }
            return { ...m, permissions: next };
        });
    }, [updateUser]);

    const onDelete = useCallback((id) => {
        setMembers((prev) => prev.filter((m) => m.id !== id));
        setExpandedId((prev) => (prev === id ? null : prev));
        setDirty(true);
    }, []);

    const saveAll = useCallback(() => {
        // TODO: replace with API
        console.log('Saved members:', members);
        setOriginal(members);
        setDirty(false);
    }, [members]);

    const cancelAll = useCallback(() => {
        setMembers(original);
        setDirty(false);
        setExpandedId(null);
    }, [original]);

    const admins = useMemo(() => members.filter((m) => m.role === 'Admin'), [members]);
    const users = useMemo(() => members.filter((m) => m.role !== 'Admin'), [members]);

    const dropdownOptions = [
        { label: 'Settings', value: 'settings', icon: Shield },
        { label: 'Help', value: 'help', icon: Mail },
        { label: 'Log Out', value: 'logout', icon: Trash2 },
    ];

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
            <div className="relative">
                <button
                    onClick={() => setShowDropdown((prev) => !prev)}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center border transition-colors"
                    style={{ backgroundColor: theme.colors.subtle, borderColor: theme.colors.border }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.colors.hoverLight || 'rgba(0,0,0,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.colors.subtle}
                >
                    <UserIcon className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                </button>
                {showDropdown && (
                    <DropdownMenu
                        options={dropdownOptions}
                        onSelect={(value) => {
                            console.log('Selected:', value);
                            setShowDropdown(false);
                        }}
                        theme={theme}
                    />
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4 space-y-6 scrollbar-hide">
                {/* Administrators */}
                {admins.length > 0 && (
                    <section>
                        <div className="mb-3 flex items-center gap-2">
                            <Shield className="w-5 h-5" style={{ color: theme.colors.accent }} />
                            <h2 className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
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
                    </section>
                )}

                {/* Users */}
                <section>
                    <h2 className="text-lg font-bold mb-3" style={{ color: theme.colors.textPrimary }}>
                        Users
                    </h2>
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
                </section>
            </div>

            {dirty && (
                <div
                    className="fixed left-0 right-0 z-20 px-4 py-3"
                    style={{
                        bottom: '96px',
                        backgroundColor: theme.colors.surface,
                        borderTop: `1px solid ${theme.colors.border}`,
                    }}
                >
                    <div className="max-w-screen-md mx-auto flex items-center gap-2">
                        <SecondaryButton
                            theme={theme}
                            onClick={cancelAll}
                            size="default"
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            theme={theme}
                            onClick={saveAll}
                            size="default"
                        >
                            Save changes
                        </PrimaryButton>
                    </div>
                </div>
            )}
        </div>
    );
};

export const MembersScreen = (props) => (
    <MembersErrorBoundary>
        <MembersScreenContent {...props} />
    </MembersErrorBoundary>
);
