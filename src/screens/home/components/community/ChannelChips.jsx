import React from 'react';
import { SUBREDDITS } from './data.js';

export const ChannelChips = ({ theme, dark, onSelect }) => (
  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-3 pb-0.5">
    {SUBREDDITS.map((sub) => (
      <button
        key={sub.id}
        onClick={() => onSelect(sub)}
        className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap transition-all active:scale-95"
        style={{
          color: theme.colors.textSecondary,
          backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        }}
      >
        {sub.name}
      </button>
    ))}
  </div>
);
