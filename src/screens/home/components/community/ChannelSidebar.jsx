import React from 'react';
import { SUBREDDITS } from './data.js';

const ROW_BASE = 'w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors';

export const ChannelSidebar = ({ theme, dark, activeId, onSelect }) => {
  const activeBg = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
  const hoverBg = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)';

  const renderRow = (id, label, Icon, color, onClick, active) => (
    <button
      key={id}
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={ROW_BASE}
      style={{
        backgroundColor: active ? activeBg : 'transparent',
        color: active ? theme.colors.textPrimary : theme.colors.textSecondary,
      }}
      onMouseEnter={(event) => { if (!active) event.currentTarget.style.backgroundColor = hoverBg; }}
      onMouseLeave={(event) => { if (!active) event.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      {Icon ? (
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: color ? `${color}1A` : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)') }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: color || theme.colors.textSecondary }} />
        </span>
      ) : (
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[0.7rem] font-bold"
          style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: theme.colors.textSecondary }}
        >
          #
        </span>
      )}
      <span className="text-[0.85rem] font-semibold tracking-tight truncate">{label}</span>
    </button>
  );

  return (
    <aside className="sticky top-0 self-start py-1 space-y-0.5">
      <div className="px-2.5 pb-1.5 text-[0.65rem] font-bold uppercase tracking-[0.18em]" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>
        Channels
      </div>
      {renderRow('all', 'All', null, null, () => onSelect(null), !activeId)}
      {SUBREDDITS.map((subreddit) =>
        renderRow(
          subreddit.id,
          subreddit.name,
          subreddit.icon,
          subreddit.color,
          () => onSelect(subreddit),
          activeId === subreddit.id,
        ),
      )}
    </aside>
  );
};

export default ChannelSidebar;
