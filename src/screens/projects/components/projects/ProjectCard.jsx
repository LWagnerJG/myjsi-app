import React from 'react';
import { Building2, Clock, Package } from 'lucide-react';
import { cardSurface, cutoutImageWell, METRIC_CAPTION_CLASSNAME, ROW_DENSITY } from '../../../../design-system/tokens.js';
import { StatusChip } from '../../../../components/common/StatusChip.jsx';
import { getOpportunityCustomerDisplayName } from '../../../../utils/projectLinks.js';
import { getLeadTimeImageUrl } from '../../../resources/lead-times/cloudinaryImages.js';
import { formatRelativeTime } from '../../../../utils/format.js';

export const ProjectCard = ({ opp, theme, onClick, linkedCustomer, customerLinkSource }) => {
  const c = theme.colors;
  const displayCustomerName = getOpportunityCustomerDisplayName(opp, linkedCustomer);
  const linkedStatus = linkedCustomer
    ? (customerLinkSource === 'explicit' ? 'Linked' : 'Matched')
    : 'Account';
  const customerTitle = linkedCustomer
    ? `${displayCustomerName} · ${[linkedCustomer.location?.city, linkedCustomer.location?.state].filter(Boolean).join(', ') || 'Customer profile linked'}`
    : `${displayCustomerName} · Customer profile pending`;
  const statusTone = linkedCustomer
    ? (customerLinkSource === 'explicit' ? 'success' : 'active')
    : 'neutral';
  const statusLabel = linkedCustomer ? linkedStatus : 'Profile pending';

  let displayValue = opp.value;
  if (displayValue != null && displayValue !== '') {
    if (typeof displayValue === 'number') displayValue = '$' + displayValue.toLocaleString();
    else if (typeof displayValue === 'string' && !displayValue.trim().startsWith('$')) {
      const num = parseFloat(displayValue.replace(/[^0-9.]/g, ''));
      if (!isNaN(num)) displayValue = '$' + num.toLocaleString();
    }
  } else {
    displayValue = '—';
  }

  const firstSeries = (opp.products || []).find(p => p?.series)?.series;
  const thumb = firstSeries ? getLeadTimeImageUrl({}, firstSeries) : '';
  const modified = opp.updatedAt ? formatRelativeTime(opp.updatedAt) : '';
  const surface = cardSurface(theme);
  const thumbWell = cutoutImageWell(theme, 56);

  return (
    <button type="button" onClick={onClick} className="w-full text-left focus-ring rounded-2xl h-full" style={{ WebkitTapHighlightColor: 'transparent' }}>
      <div
        className="overflow-hidden h-full flex flex-col transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
        style={surface}
      >
        <div className={`px-4 pt-4 pb-3 flex items-start gap-3.5 sm:gap-4 ${ROW_DENSITY.default.py}`} style={{ minHeight: ROW_DENSITY.default.minHeight }}>
          <div
            className="flex-shrink-0 flex items-center justify-center"
            style={thumbWell}
            aria-hidden="true"
          >
            {thumb ? (
              <img src={thumb} alt="" className="w-full h-full object-contain p-1" loading="lazy" />
            ) : (
              <Package className="w-5 h-5" style={{ color: c.textSecondary, opacity: 0.4 }} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="font-semibold text-[0.9375rem] leading-snug line-clamp-2"
              style={{ color: c.textPrimary }}
              title={opp.name}
            >
              {opp.name}
            </p>
            <p className="mt-0.5 text-xs font-medium" style={{ color: c.textSecondary, opacity: 0.7 }}>
              {opp.vertical || 'Active project'}
            </p>
            <div className="mt-2 min-w-0" title={customerTitle}>
              <div className="flex min-w-0 items-center gap-1.5">
                <Building2 className="w-3 h-3 flex-shrink-0" style={{ color: c.textSecondary, opacity: 0.45 }} />
                <span className="min-w-0 flex-1 text-[0.6875rem] font-medium leading-snug line-clamp-2" style={{ color: c.textSecondary, opacity: 0.92 }}>
                  {displayCustomerName}
                </span>
              </div>
              <div className="mt-1.5">
                <StatusChip theme={theme} label={statusLabel} tone={statusTone} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className={METRIC_CAPTION_CLASSNAME} style={{ color: c.textSecondary, opacity: 0.5 }}>
                List
              </span>
              <span className="font-bold text-[0.9375rem] tabular-nums tracking-tight" style={{ color: c.textPrimary }}>
                {displayValue}
              </span>
            </div>
          </div>
        </div>

        {modified ? (
          <div className="mt-auto px-4 py-2 flex items-center gap-1.5" style={{ borderTop: surface.border }}>
            <Clock className="w-3 h-3 flex-shrink-0" style={{ color: c.textSecondary, opacity: 0.45 }} />
            <span className="text-[0.625rem] font-medium" style={{ color: c.textSecondary, opacity: 0.7 }}>
              Modified {modified}
            </span>
          </div>
        ) : null}
      </div>
    </button>
  );
};
