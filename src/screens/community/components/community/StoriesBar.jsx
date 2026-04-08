import React from 'react';
import { Megaphone, Users } from 'lucide-react';
import { STORIES } from '../../data.js';

export const StoriesBar = ({ theme, dark }) => (
  <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
    {STORIES.map((story) => (
      <button
        key={story.id}
        className="flex flex-col items-center gap-1 flex-shrink-0 group"
      >
        <div
          className="w-14 h-14 rounded-full p-[2px] transition-transform group-hover:scale-105 group-active:scale-95"
          style={{
            background: story.isJSI
              ? 'linear-gradient(135deg, #353535, #666, #353535)'
              : `linear-gradient(135deg, ${dark ? '#888' : '#999'}, ${dark ? '#555' : '#ccc'})`,
          }}
        >
          <div
            className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: theme.colors.background, border: `2px solid ${theme.colors.background}` }}
          >
            {story.isJSI ? (
              <Megaphone className="w-4 h-4" style={{ color: theme.colors.textPrimary }} />
            ) : story.avatar ? (
              <img src={story.avatar} alt={story.label} className="w-full h-full object-cover" />
            ) : (
              <Users className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
            )}
          </div>
        </div>
        <span className="text-[0.6875rem] font-medium max-w-[56px] truncate" style={{ color: theme.colors.textSecondary }}>
          {story.label}
        </span>
      </button>
    ))}
  </div>
);
