// screens/members/MembersScreen.jsx
// Clean user management — My Team + Dealers tabs
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import {
    Mail,
    Phone,
    ChevronDown,
    Trash2,
    Shield,
    UserPlus,
    Search,
    X,
    Check,
    Users,
    Building2,
    MapPin,
    Calendar,
    AlertTriangle,
} from 'lucide-react';

import {
    INITIAL_MEMBERS,
    INITIAL_DEALER_COMPANIES,
    PERMISSION_LABELS,
    PERMISSION_DESCRIPTIONS,
    REP_ROLES,
    DEALER_ROLES,
    getRoleLabel,
    isAdminRole,
} from './data.js';

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

/* ===========================
   Error Boundary
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
                    <p className="text-sm text-gray-600 mb-4">There was an error loading this screen.</p>
                    <button onClick={() => this.setState({ hasError: false, error: null })}
                        className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                        style={{ backgroundColor: '#353535' }}>
                        Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

/* =======================
   Avatar
   ======================= */
const AVATAR_COLORS = ['#5B7B8C', '#4A7C59', '#C4956A', '#7B6B8A', '#8A6B5C', '#5C7B6A', '#6A8AC4', '#8C5B6B'];
const getAvatarColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const Avatar = ({ firstName, lastName, size = 'md' }) => {
    const initials = `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
    const bg = getAvatarColor(`${firstName}${lastName}`);
    const sizes = { sm: 'w-8 h-8 text-[11px]', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
    return (
        <div className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold flex-shrink-0 select-none`}
            style={{ backgroundColor: bg, color: '#fff' }}>
            {initials}
        </div>
    );
};

/* =======================
   Company avatar
   ======================= */
const CompanyAvatar = ({ name }) => {
    const bg = getAvatarColor(name);
    return (
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${bg}18` }}>
            <Building2 className="w-5 h-5" style={{ color: bg }} />
        </div>
    );
};

/* =======================
   In-app confirm modal (replaces window.confirm)
   ======================= */
const ConfirmModal = ({ open, title, message, confirmLabel, onConfirm, onCancel, theme }) => {
    if (!open) return null;
    return createPortal(
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
            {/* card */}
            <div className="relative w-full max-w-sm rounded-2xl p-5 space-y-4"
                style={{
                    backgroundColor: theme.colors.surface,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
                    border: `1px solid ${theme.colors.border}`,
                }}>
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#B85C5C12' }}>
                        <AlertTriangle className="w-4.5 h-4.5" style={{ color: '#B85C5C' }} />
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
                        className="px-4 py-1.5 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: '#B85C5C' }}>
                        {confirmLabel || 'Remove'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

/* =======================
   Portal-based role dropdown
   ======================= */
const RoleDropdown = ({ value, roles, onChange, theme }) => {
    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);
    const [pos, setPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
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
                                className="w-full text-left px-3.5 py-2 text-sm transition-colors flex items-center justify-between hover:bg-black/[0.03]"
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

/* =======================
   Permission toggle
   ======================= */
const PermToggle = ({ permKey, label, enabled, onToggle, theme, disabled }) => (
    <button
        type="button"
        onClick={disabled ? undefined : onToggle}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
        style={{
            backgroundColor: enabled ? theme.colors.accent : 'transparent',
            color: enabled ? '#fff' : theme.colors.textSecondary,
            border: `1.5px solid ${enabled ? theme.colors.accent : theme.colors.border}`,
        }}
        title={PERMISSION_DESCRIPTIONS?.[permKey] || ''}
        aria-pressed={enabled}
    >
        {label}
    </button>
);

/* =================
   Member card (rep team)
   ================= */
const MemberCard = ({ theme, user, expanded, onToggle, onChangeRole, onTogglePerm, onRequestDelete, isDesktop }) => {
    if (!user || !user.permissions) return null;
    const admin = isAdminRole(user.role);
    const roleLabel = getRoleLabel(user.role);

    return (
        <GlassCard theme={theme} className="p-0">
            <button type="button" onClick={onToggle} className="w-full text-left">
                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                        <Avatar firstName={user.firstName} lastName={user.lastName} />
                        <div className="min-w-0">
                            <span className="font-semibold text-sm truncate block" style={{ color: theme.colors.textPrimary }}>
                                {user.firstName} {user.lastName}
                            </span>
                            <span className="text-xs mt-0.5 truncate block" style={{ color: theme.colors.textSecondary }}>
                                {isDesktop ? user.email : roleLabel}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {isDesktop && (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: admin ? `${theme.colors.accent}08` : theme.colors.subtle, color: theme.colors.textSecondary }}>
                                {roleLabel}
                            </span>
                        )}
                        <ChevronDown className="w-4 h-4 transition-transform duration-200"
                            style={{ color: theme.colors.textSecondary, transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }} />
                    </div>
                </div>
            </button>

            {expanded && (
                <div style={{ borderTop: `1px solid ${theme.colors.border}` }}>
                    <div className="px-4 sm:px-5 py-4 space-y-4">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                            {user.email && (
                                <a href={`mailto:${user.email}`} className="inline-flex items-center gap-1.5 text-xs hover:opacity-70 transition-opacity" style={{ color: theme.colors.textSecondary }}>
                                    <Mail className="w-3.5 h-3.5" /> {user.email}
                                </a>
                            )}
                            {user.phone && (
                                <a href={`tel:${user.phone}`} className="inline-flex items-center gap-1.5 text-xs hover:opacity-70 transition-opacity" style={{ color: theme.colors.textSecondary }}>
                                    <Phone className="w-3.5 h-3.5" /> {user.phone}
                                </a>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>Role</div>
                            <RoleDropdown value={user.role} roles={REP_ROLES} onChange={onChangeRole} theme={theme} />
                        </div>

                        {!admin && (
                            <div className="space-y-1.5">
                                <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>Permissions</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
                                        const locked = !user.permissions.salesData && ['commissions', 'dealerRewards', 'customerRanking'].includes(key);
                                        return <PermToggle key={key} permKey={key} label={label} enabled={!!user.permissions[key]} disabled={locked} onToggle={() => onTogglePerm(key)} theme={theme} />;
                                    })}
                                </div>
                            </div>
                        )}

                        {admin && (
                            <p className="text-xs flex items-center gap-1.5" style={{ color: theme.colors.textSecondary }}>
                                <Shield className="w-3.5 h-3.5" style={{ color: theme.colors.accent }} />
                                Full access to all features.
                            </p>
                        )}

                        <div className="flex justify-end pt-1">
                            <button onClick={onRequestDelete}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-opacity hover:opacity-80"
                                style={{ color: '#B85C5C' }}>
                                <Trash2 className="w-3 h-3" /> Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </GlassCard>
    );
};

/* =================
   Dealer company card
   ================= */
const DealerCompanyCard = ({ company, expanded, onToggle, theme }) => {
    const userCount = company.users?.length || 0;
    const signedDate = company.signedUp ? new Date(company.signedUp).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null;

    return (
        <GlassCard theme={theme} className="p-0">
            <button type="button" onClick={onToggle} className="w-full text-left">
                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                        <CompanyAvatar name={company.name} />
                        <div className="min-w-0">
                            <span className="font-semibold text-sm truncate block" style={{ color: theme.colors.textPrimary }}>
                                {company.name}
                            </span>
                            <div className="flex items-center gap-3 mt-0.5">
                                {company.city && (
                                    <span className="text-xs truncate flex items-center gap-1" style={{ color: theme.colors.textSecondary }}>
                                        <MapPin className="w-3 h-3" /> {company.city}
                                    </span>
                                )}
                                <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                    {userCount} {userCount === 1 ? 'user' : 'users'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                        style={{ color: theme.colors.textSecondary, transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }} />
                </div>
            </button>

            {expanded && (
                <div style={{ borderTop: `1px solid ${theme.colors.border}` }}>
                    <div className="px-4 sm:px-5 py-4 space-y-3">
                        {signedDate && (
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.colors.textSecondary }}>
                                <Calendar className="w-3 h-3" /> Signed up {signedDate}
                            </div>
                        )}
                        <div className="space-y-2">
                            {company.users.map(u => (
                                <div key={u.id} className="flex items-center gap-3 py-2 px-3 rounded-xl"
                                    style={{ backgroundColor: theme.colors.subtle }}>
                                    <Avatar firstName={u.firstName} lastName={u.lastName} size="sm" />
                                    <div className="min-w-0 flex-1">
                                        <span className="text-sm font-medium truncate block" style={{ color: theme.colors.textPrimary }}>
                                            {u.firstName} {u.lastName}
                                        </span>
                                        <span className="text-xs truncate block" style={{ color: theme.colors.textSecondary }}>
                                            {u.email}
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: theme.colors.surface, color: theme.colors.textSecondary, border: `1px solid ${theme.colors.border}` }}>
                                        {getRoleLabel(u.role)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </GlassCard>
    );
};

/* ==================
   Main Screen
   ================== */
const MembersScreenContent = ({ theme, onNavigate }) => {
    const [tab, setTab] = useState('team');
    const [original, setOriginal] = useState(INITIAL_MEMBERS);
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [expandedId, setExpandedId] = useState(null);
    const [dirty, setDirty] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null); // { id, name }
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    const toggle = useCallback((id) => setExpandedId(prev => prev === id ? null : id), []);

    const updateUser = useCallback((id, updater) => {
        setMembers(prev => prev.map(m => m.id === id ? (typeof updater === 'function' ? updater(m) : { ...m, ...updater }) : m));
        setDirty(true);
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
            if (key === 'salesData' && !next.salesData) {
                next.commissions = false;
                next.dealerRewards = false;
                next.customerRanking = false;
            }
            return { ...m, permissions: next };
        });
    }, [updateUser]);

    const requestDelete = useCallback((user) => {
        setConfirmDelete({ id: user.id, name: `${user.firstName} ${user.lastName}` });
    }, []);

    const executeDelete = useCallback(() => {
        if (!confirmDelete) return;
        setMembers(prev => prev.filter(m => m.id !== confirmDelete.id));
        setExpandedId(prev => prev === confirmDelete.id ? null : prev);
        setDirty(true);
        setConfirmDelete(null);
    }, [confirmDelete]);

    const saveAll = useCallback(() => {
        console.log('Saved members:', members);
        setOriginal(members);
        setDirty(false);
    }, [members]);

    const cancelAll = useCallback(() => {
        setMembers(original);
        setDirty(false);
        setExpandedId(null);
    }, [original]);

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
                <div className="px-4 sm:px-6 lg:px-8 pb-24 lg:pb-12 max-w-2xl mx-auto w-full">

                    {/* Header */}
                    <div className="pt-6 pb-3 sm:pt-8">
                        <div className="flex items-center justify-between gap-4">
                            <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                                App Users
                            </h1>
                            {tab === 'team' && (
                                <button onClick={() => console.log('Invite user')}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-transform duration-100 active:scale-95"
                                    style={{ backgroundColor: theme.colors.accent, color: '#fff' }}>
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
                                    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
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
                            <div className="space-y-2">
                                {members.map(u => (
                                    <MemberCard key={u.id} theme={theme} user={u}
                                        expanded={expandedId === u.id}
                                        onToggle={() => toggle(u.id)}
                                        onChangeRole={(role) => onChangeRole(u.id, role)}
                                        onTogglePerm={(key) => onTogglePerm(u.id, key)}
                                        onRequestDelete={() => requestDelete(u)}
                                        isDesktop={isDesktop} />
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
                            <div className="space-y-2">
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

            {/* Inline save toast — glass pill pinned to bottom */}
            {dirty && createPortal(
                <div className="fixed z-[60] flex justify-center pointer-events-none"
                    style={{ bottom: isDesktop ? '24px' : '108px', left: 0, right: 0 }}>
                    <div className="pointer-events-auto inline-flex items-center gap-3 px-5 py-2.5 rounded-full backdrop-blur-xl"
                        style={{
                            backgroundColor: isDarkTheme(theme) ? 'rgba(40,40,40,0.88)' : 'rgba(255,255,255,0.82)',
                            border: `1px solid ${isDarkTheme(theme) ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        }}>
                        <span className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>Unsaved changes</span>
                        <div className="w-px h-4" style={{ backgroundColor: theme.colors.border }} />
                        <button onClick={cancelAll}
                            className="text-xs font-medium px-3 py-1 rounded-full transition-opacity hover:opacity-70"
                            style={{ color: theme.colors.textSecondary }}>
                            Discard
                        </button>
                        <button onClick={saveAll}
                            className="text-xs font-semibold text-white px-4 py-1.5 rounded-full transition-opacity hover:opacity-90"
                            style={{ backgroundColor: theme.colors.accent }}>
                            Save
                        </button>
                    </div>
                </div>,
                document.body
            )}

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
        </div>
    );
};

export const MembersScreen = (props) => (
    <MembersErrorBoundary>
        <MembersScreenContent {...props} />
    </MembersErrorBoundary>
);
