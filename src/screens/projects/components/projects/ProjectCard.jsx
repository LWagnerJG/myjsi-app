import React from 'react';
import { Building2, Users } from 'lucide-react';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { getOpportunityCustomerDisplayName } from '../../../../utils/projectLinks.js';

export const ProjectCard = ({ opp, theme, onClick, linkedCustomer, customerLinkSource, projectContacts = [] }) => {
  const dark = isDarkTheme(theme);
  const border = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';
  const displayCustomerName = getOpportunityCustomerDisplayName(opp, linkedCustomer);
  const linkedStatus = linkedCustomer
    ? (customerLinkSource === 'explicit' ? 'Linked' : 'Matched')
    : 'Account';
  const customerMeta = linkedCustomer
    ? [linkedCustomer.location?.city, linkedCustomer.location?.state].filter(Boolean).join(', ') || 'Customer profile available'
    : 'No customer profile linked yet';
  const primaryContact = opp.contact || (projectContacts[0]?.name ?? 'Add a primary contact');

  let displayValue = opp.value;
  if (displayValue != null) {
    if (typeof displayValue === 'number') displayValue = '$' + displayValue.toLocaleString();
    else if (typeof displayValue === 'string' && !displayValue.trim().startsWith('$')) {
      const num = parseFloat(displayValue.replace(/[^0-9.]/g, ''));
      if (!isNaN(num)) displayValue = '$' + num.toLocaleString();
    }
  }

  return (
    <button onClick={onClick} className="w-full text-left" style={{ WebkitTapHighlightColor: 'transparent' }}>
      <div
        className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
        style={{ backgroundColor: theme.colors.surface, border: `1px solid ${border}` }}
      >
        <div className="px-5 pt-4 pb-4 space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[0.9375rem] leading-snug truncate" style={{ color: theme.colors.textPrimary }}>
                {opp.name}
              </p>
              <p className="mt-0.5 text-xs font-medium" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>
                {opp.vertical || 'Active project'}
              </p>
            </div>
            <div className="text-right shrink-0 pt-0.5">
              <p className="text-[0.625rem] font-semibold uppercase tracking-[0.06em] mb-0.5" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>
                List
              </p>
              <p className="font-bold text-lg tabular-nums tracking-tight leading-none" style={{ color: theme.colors.textPrimary }}>
                {displayValue}
              </p>
            </div>
          </div>

          <div className="rounded-[20px] px-3.5 py-3" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(240,237,232,0.92)' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${theme.colors.accent}15`, color: theme.colors.accent }}>
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[0.625rem] font-semibold uppercase tracking-[0.06em]" style={{ color: theme.colors.textSecondary, opacity: 0.65 }}>
                    Customer
                  </p>
                  <p className="mt-1 text-[0.8125rem] font-semibold truncate" style={{ color: theme.colors.textPrimary }}>
                    {displayCustomerName}
                  </p>
                  <p className="mt-0.5 text-[0.6875rem] truncate" style={{ color: theme.colors.textSecondary }}>
                    {customerMeta}
                  </p>
                </div>
              </div>
              <span className="text-[0.5625rem] font-bold uppercase tracking-[0.08em] px-2 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: linkedCustomer ? `${theme.colors.accent}14` : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.07)'), color: linkedCustomer ? theme.colors.accent : theme.colors.textSecondary }}>
                {linkedStatus}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-[0.6875rem]" style={{ color: theme.colors.textSecondary }}>
            <div className="flex items-center gap-1.5 min-w-0">
              <Users className="w-3 h-3 flex-shrink-0" style={{ opacity: 0.55 }} />
              <span className="truncate">{primaryContact}</span>
            </div>
            <span className="shrink-0">{projectContacts.length} contact{projectContacts.length === 1 ? '' : 's'}</span>
          </div>
        </div>
      </div>
    </button>
  );
};
