import React from 'react';
import { SUBREDDITS } from './data.js';

export const ChannelChips = ({ theme, dark, onSelect }) => (
  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-2 pb-1">
    {SUBREDDITS.map((sub) => (
      <button
        key={sub.id}
        onClick={() => onSelect(sub)}
        className="text-[11px] font-medium px-3 py-1.5 rounded-full flex-shrink-0 whitespace-nowrap transition-all active:scale-95 border"
        style={{
          color: theme.colors.textSecondary,
          borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          backgroundColor: 'transparent',
        }}
      >
        {sub.name}
      </button>
    ))}
  </div>
);
