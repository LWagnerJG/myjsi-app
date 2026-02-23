import React from 'react';
import { MapPin, ChevronDown, Calendar } from 'lucide-react';
import { GlassCard } from '../../../../components/common/GlassCard.jsx';
import { CompanyAvatar, Avatar } from './SharedComponents.jsx';
import { getRoleLabel } from '../../data.js';

export const DealerCompanyCard = ({ company, expanded, onToggle, theme }) => {
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
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
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

