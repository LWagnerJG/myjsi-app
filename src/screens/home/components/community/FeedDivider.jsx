import React from 'react';

export const FeedDivider = ({ label, dark, theme, first }) => (
  <div className={`flex items-center gap-2.5 ${first ? 'mt-3 mb-4' : 'mt-6 mb-4'}`}>
    <div className="flex-1 h-px" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
    <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>{label}</span>
    <div className="flex-1 h-px" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
  </div>
);
