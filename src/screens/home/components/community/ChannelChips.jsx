import React from 'react';
import { SUBREDDITS } from './data.js';

export const ChannelChips = ({ theme, dark, onSelect, activeId }) => (
  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-2 pb-1">
    <button
      onClick={() => onSelect(null)}
      className="text-[11px] font-semibold px-3 py-1.5 rounded-full flex-shrink-0 whitespace-nowrap transition-all active:scale-95 border"
      style={{
        color: !activeId ? theme.colors.accentText : theme.colors.textSecondary,
        borderColor: !activeId ? theme.colors.accent : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
        backgroundColor: !activeId ? theme.colors.accent : 'transparent',
      }}
    >
      All
    </button>
    {SUBREDDITS.map((sub) => (
      <button
        key={sub.id}
        onClick={() => onSelect(sub)}
        className="text-[11px] font-medium px-3 py-1.5 rounded-full flex-shrink-0 whitespace-nowrap transition-all active:scale-95 border"
        style={{
          color: activeId === sub.id ? theme.colors.accentText : theme.colors.textSecondary,
          borderColor: activeId === sub.id ? theme.colors.accent : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
          backgroundColor: activeId === sub.id ? theme.colors.accent : 'transparent',
        }}
      >
        {sub.name}
      </button>
    ))}
  </div>
);
