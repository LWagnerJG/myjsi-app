import React from 'react';
import { Mail, Phone, ChevronDown, Trash2, Shield, Check } from 'lucide-react';
import { GlassCard } from '../../../../components/common/GlassCard.jsx';
import { Avatar, RoleDropdown, PermToggle } from './SharedComponents.jsx';
import { PERMISSION_LABELS, REP_ROLES, getRoleLabel, isAdminRole } from '../../data.js';
import { isDarkTheme } from '../../../../design-system/tokens.js';

export const MemberCard = ({ theme, user, expanded, onToggle, onChangeRole, onTogglePerm, onRequestDelete, isDesktop, isDirty, onSave }) => {
    if (!user || !user.permissions) return null;
    const admin = isAdminRole(user.role);
    const roleLabel = getRoleLabel(user.role);
    const dark = isDarkTheme(theme);
    const subtleBorder = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';

    return (
        <GlassCard theme={theme} className="p-0 overflow-hidden">
            {/* Collapsed header row */}
            <button type="button" onClick={onToggle} className="w-full text-left">
                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <Avatar firstName={user.firstName} lastName={user.lastName} size="md" />
                        <div className="min-w-0">
                            <span className="text-[0.9375rem] font-semibold block truncate" style={{ color: theme.colors.textPrimary }}>
                                {user.firstName} {user.lastName}
                            </span>
                            <span className="text-[0.8125rem] block truncate mt-0.5" style={{ color: theme.colors.textSecondary }}>
                                {isDesktop ? user.email : roleLabel}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {isDesktop && (
                            <span
                                className="text-xs font-medium px-2.5 py-1 rounded-full"
                                style={{
                                    backgroundColor: admin ? `${theme.colors.accent}12` : (dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)'),
                                    color: admin ? theme.colors.accent : theme.colors.textSecondary,
                                }}
                            >
                                {roleLabel}
                            </span>
                        )}
                        {expanded && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onRequestDelete(); }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-opacity hover:opacity-70"
                                style={{ color: theme.colors.error, backgroundColor: `${theme.colors.error}0E` }}
                                title="Remove user"
                            >
                                <Trash2 className="w-3 h-3" /> Remove
                            </button>
                        )}
                        <ChevronDown
                            className="w-4 h-4 transition-transform duration-200"
                            style={{ color: theme.colors.textSecondary, transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}
                        />
                    </div>
                </div>
            </button>

            {/* Expanded panel */}
            {expanded && (
                <div style={{ borderTop: `1px solid ${subtleBorder}` }}>
                    <div className="px-4 sm:px-5 py-4 space-y-4">

                        {/* Contact links */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                            {user.email && (
                                <a
                                    href={`mailto:${user.email}`}
                                    className="inline-flex items-center gap-1.5 text-[0.8125rem] hover:opacity-70 transition-opacity"
                                    style={{ color: theme.colors.textSecondary }}
                                >
                                    <Mail className="w-3.5 h-3.5" /> {user.email}
                                </a>
                            )}
                            {user.phone && (
                                <a
                                    href={`tel:${user.phone}`}
                                    className="inline-flex items-center gap-1.5 text-[0.8125rem] hover:opacity-70 transition-opacity"
                                    style={{ color: theme.colors.textSecondary }}
                                >
                                    <Phone className="w-3.5 h-3.5" /> {user.phone}
                                </a>
                            )}
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <p className="text-[0.6875rem] font-bold uppercase tracking-wider" style={{ color: theme.colors.textSecondary, opacity: 0.55 }}>Role</p>
                            <RoleDropdown value={user.role} roles={REP_ROLES} onChange={onChangeRole} theme={theme} />
                        </div>

                        {/* Permissions */}
                        {!admin ? (
                            <div className="space-y-2">
                                <p className="text-[0.6875rem] font-bold uppercase tracking-wider" style={{ color: theme.colors.textSecondary, opacity: 0.55 }}>Permissions</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                                        <PermToggle
                                            key={key}
                                            permKey={key}
                                            label={label}
                                            enabled={!!user.permissions[key]}
                                            onToggle={() => onTogglePerm(key)}
                                            theme={theme}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-[0.8125rem] flex items-center gap-1.5" style={{ color: theme.colors.textSecondary }}>
                                <Shield className="w-3.5 h-3.5 shrink-0" style={{ color: theme.colors.accent }} />
                                Full access to all features.
                            </p>
                        )}

                        {/* Save button */}
                        {isDirty && (
                            <div className="flex justify-end pt-1">
                                <button
                                    onClick={onSave}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[0.8125rem] font-semibold transition-all active:scale-95"
                                    style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
                                >
                                    <Check className="w-3.5 h-3.5" /> Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </GlassCard>
    );
};
