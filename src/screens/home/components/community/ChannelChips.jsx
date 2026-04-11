import React from 'react';
import { SUBREDDITS } from './data.js';

export const ChannelChips = ({ theme, dark, onSelect, activeId }) => {
  const chip = (id, label, onClick, active) => (
    <button
      key={id}
      onClick={onClick}
      aria-pressed={active}
      className="px-3.5 py-2 rounded-full text-[0.75rem] font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-200 active:scale-95"
      style={{
        color: active ? theme.colors.textPrimary : theme.colors.textSecondary,
        opacity: active ? 1 : 0.72,
        backgroundColor: active
          ? (dark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.92)')
          : 'transparent',
        boxShadow: active
          ? (dark ? '0 8px 18px rgba(0,0,0,0.16)' : '0 6px 14px rgba(53,53,53,0.05)')
          : 'none',
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {chip('all', 'All', () => onSelect(null), !activeId)}
      {SUBREDDITS.map(sub =>
        chip(sub.id, sub.name, () => onSelect(sub), activeId === sub.id)
      )}
    </div>
  );
};
