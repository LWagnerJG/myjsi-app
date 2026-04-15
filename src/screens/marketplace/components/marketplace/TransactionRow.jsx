import React from 'react';
import { getIcon } from './utils.js';
import { formatElliottBucks } from '../../data.js';
import { formatLongDate } from '../../../../utils/format.js';

export const TransactionRow = ({ txn, theme, isLast }) => {
  const Icon = getIcon(txn.icon);
  const isCredit = txn.type === 'credit';
  return (
    <div className={`flex items-center gap-3 py-3 ${!isLast ? 'border-b' : ''}`} style={{ borderColor: theme.colors.border }}>
      <div
        className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: isCredit ? theme.colors.successLight : theme.colors.errorLight }}
      >
        <Icon className="w-4 h-4" style={{ color: isCredit ? theme.colors.success : theme.colors.error }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{txn.description}</p>
        <p className="text-[0.6875rem]" style={{ color: theme.colors.textSecondary }}>
          {formatLongDate(txn.date)}
        </p>
      </div>
      <span className="text-[0.8125rem] font-bold flex-shrink-0" style={{ color: isCredit ? theme.colors.success : theme.colors.error }}>
        {isCredit ? '+' : ''}{formatElliottBucks(txn.amount)}
      </span>
    </div>
  );
};
