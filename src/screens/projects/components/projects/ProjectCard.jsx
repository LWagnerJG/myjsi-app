import React from 'react';
import { Building2 } from 'lucide-react';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { getOpportunityCustomerDisplayName } from '../../../../utils/projectLinks.js';

export const ProjectCard = ({ opp, theme, onClick, linkedCustomer, customerLinkSource }) => {
  const dark = isDarkTheme(theme);
  const border = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';
  const displayCustomerName = getOpportunityCustomerDisplayName(opp, linkedCustomer);
  const linkedStatus = linkedCustomer
    ? (customerLinkSource === 'explicit' ? 'Linked' : 'Matched')
    : 'Account';
  const customerStatus = linkedCustomer ? linkedStatus.toLowerCase() : 'profile pending';
  const customerTitle = linkedCustomer
    ? `${displayCustomerName} · ${[linkedCustomer.location?.city, linkedCustomer.location?.state].filter(Boolean).join(', ') || 'Customer profile linked'}`
    : `${displayCustomerName} · Customer profile pending`;

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
        <div className="px-5 pt-4 pb-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[0.9375rem] leading-snug truncate" style={{ color: theme.colors.textPrimary }}>
                {opp.name}
              </p>
              <p className="mt-0.5 text-xs font-medium" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>
                {opp.vertical || 'Active project'}
              </p>
              <div className="mt-2 flex min-w-0 items-center gap-1.5" title={customerTitle}>
                <Building2 className="w-3 h-3 flex-shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.45 }} />
                <span
                  className="truncate text-[0.6875rem] font-medium"
                  style={{ color: theme.colors.textSecondary, opacity: 0.92 }}
                >
                  {displayCustomerName}
                </span>
                <span
                  className="shrink-0 text-[0.5625rem] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: theme.colors.textSecondary, opacity: dark ? 0.42 : 0.5 }}
                >
                  {customerStatus}
                </span>
              </div>
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
        </div>
      </div>
    </button>
  );
};
