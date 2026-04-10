import React from 'react';
import { SUBREDDITS } from './data.js';

export const ChannelChips = ({ theme, dark, onSelect, activeId }) => {
  const chip = (id, label, onClick, active) => (
    <button
      key={id}
      onClick={onClick}
      aria-pressed={active}
      className="px-2.5 py-1 rounded-full text-[0.6875rem] font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-200 active:scale-95"
      style={{
        color: theme.colors.textPrimary,
        opacity: active ? 0.85 : 0.3,
        backgroundColor: active
          ? (dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.055)')
          : 'transparent',
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar -mx-0.5">
      {chip('all', 'All', () => onSelect(null), !activeId)}
      {SUBREDDITS.map(sub =>
        chip(sub.id, sub.name, () => onSelect(sub), activeId === sub.id)
      )}
    </div>
  );
};
