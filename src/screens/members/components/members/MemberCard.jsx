import React from 'react';
import { Mail, Phone, ChevronDown, Trash2, Shield, Check } from 'lucide-react';
import { GlassCard } from '../../../../components/common/GlassCard.jsx';
import { Avatar, RoleDropdown, PermToggle } from './SharedComponents.jsx';
import { PERMISSION_LABELS, REP_ROLES, getRoleLabel, isAdminRole } from '../../data.js';

export const MemberCard = ({ theme, user, expanded, onToggle, onChangeRole, onTogglePerm, onRequestDelete, isDesktop, isDirty, onSave }) => {
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
                        {expanded && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onRequestDelete(); }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-opacity hover:opacity-70"
                                style={{ color: '#B85C5C' }}
                                title="Remove user"
                            >
                                <Trash2 className="w-3 h-3" /> Remove
                            </button>
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
                            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>Role</div>
                            <RoleDropdown value={user.role} roles={REP_ROLES} onChange={onChangeRole} theme={theme} />
                        </div>

                        {!admin && (
                            <div className="space-y-1.5">
                                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>Permissions</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                                        <PermToggle key={key} permKey={key} label={label} enabled={!!user.permissions[key]} onToggle={() => onTogglePerm(key)} theme={theme} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {admin && (
                            <p className="text-xs flex items-center gap-1.5" style={{ color: theme.colors.textSecondary }}>
                                <Shield className="w-3.5 h-3.5" style={{ color: theme.colors.accent }} />
                                Full access to all features.
                            </p>
                        )}

                        {isDirty && (
                            <div className="flex justify-end pt-2">
                                <button onClick={onSave}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 active:scale-95"
                                    style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}>
                                    <Check className="w-3 h-3" /> Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </GlassCard>
    );
};

