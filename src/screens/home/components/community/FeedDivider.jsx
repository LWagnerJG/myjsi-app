import React from 'react';

export const FeedDivider = ({ label, theme, first }) => (
  <div className={`${first ? 'pt-1 pb-2.5' : 'pt-4 pb-2.5'}`}>
    <div className="relative flex items-center justify-center">
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px"
        style={{ backgroundColor: theme.colors.border || 'rgba(0,0,0,0.05)', opacity: 0.45 }}
      />
      <span
        className="relative inline-flex items-center rounded-full px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.16em]"
        style={{
          color: theme.colors.textSecondary,
          backgroundColor: theme.colors.background,
          opacity: 0.7,
        }}
      >
        {label}
      </span>
    </div>
  </div>
);
