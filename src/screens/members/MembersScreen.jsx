// screens/members/MembersScreen.jsx
// Clean user management — My Team + Dealers tabs
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Search,
    Users,
    Building2,
    UserPlus,
    X,
} from 'lucide-react';

import {
    INITIAL_MEMBERS,
    INITIAL_DEALER_COMPANIES,
    REP_ROLES,
    isAdminRole,
    PERMISSION_LABELS,
} from './data.js';

import { MembersErrorBoundary } from './components/members/MembersErrorBoundary.jsx';
import { ConfirmModal } from './components/members/SharedComponents.jsx';
import { InviteModal } from './components/members/InviteModal.jsx';
import { MemberCard } from './components/members/MemberCard.jsx';
import { DealerCompanyCard } from './components/members/DealerCompanyCard.jsx';

/* ===========================
   Hooks
   =========================== */
const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(() =>
        typeof window !== 'undefined' ? window.matchMedia(query).matches : false
    );
    useEffect(() => {
        const mql = window.matchMedia(query);
        const handler = (e) => setMatches(e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, [query]);
    return matches;
};

/* ==================
   Main Screen
   ================== */
const MembersScreenContent = ({ theme }) => {
    const [tab, setTab] = useState('team');
    const [original, setOriginal] = useState(INITIAL_MEMBERS);
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [expandedId, setExpandedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [showInvite, setShowInvite] = useState(false);
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    const toggle = useCallback((id) => setExpandedId(prev => prev === id ? null : id), []);

    const isUserDirty = useCallback((user) => {
        const orig = original.find(o => o.id === user.id);
        if (!orig) return true; // newly invited user
        return user.role !== orig.role || JSON.stringify(user.permissions) !== JSON.stringify(orig.permissions);
    }, [original]);

    const saveUser = useCallback((id) => {
        const user = members.find(m => m.id === id);
        if (!user) return;
        setOriginal(prev => {
            const exists = prev.find(o => o.id === id);
            return exists ? prev.map(o => o.id === id ? { ...user } : o) : [...prev, { ...user }];
        });
    }, [members]);

    const updateUser = useCallback((id, updater) => {
        setMembers(prev => prev.map(m => m.id === id ? (typeof updater === 'function' ? updater(m) : { ...m, ...updater }) : m));
    }, []);

    const onChangeRole = useCallback((id, role) => {
        updateUser(id, (m) => {
            if (isAdminRole(role)) {
                const allTrue = {};
                Object.keys(PERMISSION_LABELS).forEach(k => allTrue[k] = true);
                return { ...m, role, permissions: allTrue };
            }
            return { ...m, role };
        });
    }, [updateUser]);

    const onTogglePerm = useCallback((id, key) => {
        updateUser(id, (m) => {
            const next = { ...m.permissions, [key]: !m.permissions[key] };
            return { ...m, permissions: next };
        });
    }, [updateUser]);

    const requestDelete = useCallback((user) => {
        setConfirmDelete({ id: user.id, name: `${user.firstName} ${user.lastName}` });
    }, []);

    const executeDelete = useCallback(() => {
        if (!confirmDelete) return;
        setMembers(prev => prev.filter(m => m.id !== confirmDelete.id));
        setOriginal(prev => prev.filter(o => o.id !== confirmDelete.id));
        setExpandedId(prev => prev === confirmDelete.id ? null : prev);
        setConfirmDelete(null);
    }, [confirmDelete]);

    const handleInvite = useCallback((invitee) => {
        const newUser = {
            id: `user-${Date.now()}`,
            firstName: invitee.firstName,
            lastName: invitee.lastName,
            email: invitee.email,
            phone: invitee.phone || '',
            role: invitee.role,
            permissions: isAdminRole(invitee.role)
                ? Object.fromEntries(Object.keys(PERMISSION_LABELS).map(k => [k, true]))
                : Object.fromEntries(Object.keys(PERMISSION_LABELS).map(k => [k, false])),
        };
        setMembers(prev => [...prev, newUser]);
        setOriginal(prev => [...prev, { ...newUser }]);
    }, []);

    const switchTab = useCallback((t) => {
        setTab(t);
        setExpandedId(null);
        setSearchQuery('');
    }, []);

    // Search only applies to dealers tab
    const filteredDealers = useMemo(() => {
        if (!searchQuery.trim()) return INITIAL_DEALER_COMPANIES;
        const q = searchQuery.toLowerCase();
        return INITIAL_DEALER_COMPANIES.filter(d =>
            d.name.toLowerCase().includes(q) ||
            d.city?.toLowerCase().includes(q) ||
            d.users.some(u => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q))
        );
    }, [searchQuery]);

    const tabs = [
        { key: 'team', label: 'My Team', count: members.length },
        { key: 'dealers', label: 'Dealers', count: INITIAL_DEALER_COMPANIES.length },
    ];

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 sm:px-6 lg:px-8 pb-24 lg:pb-12 max-w-2xl lg:max-w-5xl mx-auto w-full">

                    {/* Header */}
                    <div className="pt-6 pb-3 sm:pt-8">
                        <div className="flex items-center justify-between gap-4">
                            <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                                App Users
                            </h1>
                            {tab === 'team' && (
                                <button onClick={() => setShowInvite(true)}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-transform duration-100 active:scale-95"
                                    style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}>
                                    <UserPlus className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Invite</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 mb-4"
                        style={{ borderBottom: `1.5px solid ${theme.colors.border}` }}>
                        {tabs.map(t => (
                            <button
                                key={t.key}
                                onClick={() => switchTab(t.key)}
                                className="relative px-4 py-2.5 text-sm font-medium transition-colors duration-150"
                                style={{ color: tab === t.key ? theme.colors.textPrimary : theme.colors.textSecondary }}
                            >
                                <span className="flex items-center gap-1.5">
                                    {t.label}
                                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                                        style={{
                                            backgroundColor: tab === t.key ? `${theme.colors.accent}12` : theme.colors.subtle,
                                            color: tab === t.key ? theme.colors.accent : theme.colors.textSecondary,
                                        }}>
                                        {t.count}
                                    </span>
                                </span>
                                {tab === t.key && (
                                    <div className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                                        style={{ backgroundColor: theme.colors.accent }} />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Search — only on dealers tab */}
                    {tab === 'dealers' && (
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: theme.colors.textSecondary }} />
                            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search dealers..."
                                className="w-full pl-9 pr-9 py-2 rounded-full text-sm outline-none transition-all duration-150"
                                style={{ backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, border: `1.5px solid ${theme.colors.border}` }}
                                onFocus={e => e.target.style.borderColor = theme.colors.accent}
                                onBlur={e => e.target.style.borderColor = theme.colors.border} />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <X className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Tab content */}
                    {tab === 'team' ? (
                        members.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                {members.map(u => (
                                    <MemberCard key={u.id} theme={theme} user={u}
                                        expanded={expandedId === u.id}
                                        onToggle={() => toggle(u.id)}
                                        onChangeRole={(role) => onChangeRole(u.id, role)}
                                        onTogglePerm={(key) => onTogglePerm(u.id, key)}
                                        onRequestDelete={() => requestDelete(u)}
                                        isDesktop={isDesktop}
                                        isDirty={isUserDirty(u)}
                                        onSave={() => saveUser(u.id)} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 text-center" style={{ color: theme.colors.textSecondary }}>
                                <Users className="w-10 h-10 mx-auto mb-3 opacity-25" />
                                <p className="text-sm">No team members yet</p>
                            </div>
                        )
                    ) : (
                        filteredDealers.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                {filteredDealers.map(d => (
                                    <DealerCompanyCard key={d.id} company={d}
                                        expanded={expandedId === d.id}
                                        onToggle={() => toggle(d.id)}
                                        theme={theme} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 text-center" style={{ color: theme.colors.textSecondary }}>
                                <Building2 className="w-10 h-10 mx-auto mb-3 opacity-25" />
                                <p className="text-sm">{searchQuery ? 'No dealers match' : 'No dealers signed up yet'}</p>
                            </div>
                        )
                    )}


                </div>
            </div>

            {/* Remove confirmation modal */}
            <ConfirmModal
                open={!!confirmDelete}
                title="Remove team member"
                message={confirmDelete ? `${confirmDelete.name} will lose access to this app. This can't be undone.` : ''}
                confirmLabel="Remove"
                onConfirm={executeDelete}
                onCancel={() => setConfirmDelete(null)}
                theme={theme}
            />

            {/* Invite modal */}
            <InviteModal
                open={showInvite}
                onClose={() => setShowInvite(false)}
                onInvite={handleInvite}
                theme={theme}
                roles={REP_ROLES}
            />
        </div>
    );
};

export const MembersScreen = (props) => (
    <MembersErrorBoundary>
        <MembersScreenContent {...props} />
    </MembersErrorBoundary>
);
