import React from 'react';
import { getIcon } from './utils.js';
import { formatElliottBucks } from '../../data.js';
import { formatLongDate } from '../../../../utils/format.js';
import { getMarketplacePalette } from '../../theme.js';

export const TransactionRow = ({ txn, theme, isLast }) => {
  const Icon = getIcon(txn.icon);
  const isCredit = txn.type === 'credit';
  const palette = getMarketplacePalette(theme);

  return (
    <div className={`flex items-center gap-3.5 py-3.5 ${!isLast ? 'border-b' : ''}`} style={{ borderColor: palette.hairline }}>
      <div
        className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: isCredit ? palette.successSoft : palette.errorSoft }}
      >
        <Icon className="w-4 h-4" style={{ color: isCredit ? palette.success : palette.error }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[0.8125rem] font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{txn.description}</p>
        <p className="text-[0.6875rem] mt-0.5" style={{ color: theme.colors.textSecondary }}>
          {formatLongDate(txn.date)}
        </p>
      </div>
      <span className="text-sm font-bold flex-shrink-0 tabular-nums" style={{ color: isCredit ? palette.success : palette.error }}>
        {isCredit ? '+' : ''}{formatElliottBucks(txn.amount)}
      </span>
    </div>
  );
};
