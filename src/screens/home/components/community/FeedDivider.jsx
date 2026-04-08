import React from 'react';

export const FeedDivider = ({ label, dark, theme, first }) => (
  <div className={`flex items-center justify-center ${first ? 'mt-2 mb-3' : 'mt-5 mb-3'}`}>
    <span className="text-[0.625rem] font-bold uppercase tracking-[0.15em]" style={{ color: theme.colors.textSecondary, opacity: 0.35 }}>{label}</span>
  </div>
);
