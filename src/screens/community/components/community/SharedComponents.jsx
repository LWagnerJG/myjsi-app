import React from 'react';
import { Users } from 'lucide-react';

export const Avatar = React.memo(({ src, alt, size = 36, dark, theme }) => (
  <div
    className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
    style={{ width: size, height: size, backgroundColor: dark ? '#444' : '#E3E0D8' }}
  >
    {src
      ? <img src={src} alt={alt} className="w-full h-full object-cover" />
      : <Users className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />}
  </div>
));
Avatar.displayName = 'Avatar';

export const ActionBtn = React.memo(({ active, icon: Icon, count, onClick, label, theme, dark }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full transition-all active:scale-95"
    style={{
      color: active ? theme.colors.accent : theme.colors.textSecondary,
      backgroundColor: active
        ? (dark ? 'rgba(255,255,255,0.08)' : `${theme.colors.accent}10`)
        : 'transparent',
    }}
  >
    <Icon className="w-3.5 h-3.5" style={active ? { fill: theme.colors.accent } : undefined} />
    {count > 0 && <span>{count}</span>}
  </button>
));
ActionBtn.displayName = 'ActionBtn';
