import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { Avatar } from './SharedComponents.jsx';
import { cardBg, formatTimestamp, formatExactTimestamp } from './utils.js';

const pollTimeLeft = (endsAt) => {
  if (!endsAt) return null;
  const diff = endsAt - Date.now();
  if (diff <= 0) return 'Voting closed';
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 1) return `${days}d left to vote`;
  if (days === 1) return `${hrs}h left to vote`;
  if (hrs > 0) return `${hrs}h ${mins}m left`;
  if (mins > 0) return `${mins}m left`;
  return 'Closing soon';
};

export const PollCard = React.memo(({ poll, theme, dark, votedOption, onPollVote }) => {
  const totalVotes = (poll.options || []).reduce((s, o) => s + (o.votes || 0), 0);
  const timeLeft = pollTimeLeft(poll.endsAt);
  const isClosed = poll.endsAt && poll.endsAt < Date.now();
  return (
    <div className="rounded-2xl overflow-hidden p-3.5 space-y-2.5" style={{ backgroundColor: cardBg(dark) }}>
      <div className="flex items-center gap-1.5">
        <BarChart3 className="w-3 h-3" style={{ color: theme.colors.textSecondary }} />
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: theme.colors.textSecondary }}>Poll</span>
        {timeLeft && (
          <span
            className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: isClosed
                ? (dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)')
                : (dark ? 'rgba(74,124,89,0.18)' : 'rgba(74,124,89,0.10)'),
              color: isClosed ? theme.colors.textSecondary : '#4A7C59',
            }}
          >
            {timeLeft}
          </span>
        )}
      </div>
      <div className="flex items-start gap-2.5">
        <Avatar src={poll.user?.avatar} alt={poll.user?.name} dark={dark} theme={theme} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold" style={{ color: theme.colors.textPrimary }}>{poll.user?.name}</span>
            <span
              className="text-xs cursor-default"
              title={formatExactTimestamp(poll.createdAt)}
              style={{ color: theme.colors.textSecondary }}
            >{formatTimestamp(poll.createdAt)}</span>
          </div>
          <p className="text-[13px] mt-1 font-semibold" style={{ color: theme.colors.textPrimary }}>{poll.question}</p>
          <div className="mt-2 space-y-1.5">
            {poll.options.map(opt => {
              const percent = totalVotes ? Math.round((opt.votes || 0) / totalVotes * 100) : 0;
              const active = votedOption === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { if (!votedOption) onPollVote?.(poll.id, opt.id); }}
                  className="w-full text-left px-3 py-2 rounded-xl relative overflow-hidden transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                    border: active ? `1px solid ${theme.colors.accent}` : `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    color: active ? theme.colors.accent : votedOption ? theme.colors.textSecondary : theme.colors.textPrimary,
                    cursor: votedOption ? 'default' : 'pointer',
                    opacity: votedOption && !active ? 0.65 : 1,
                  }}
                >
                  <span className="relative z-10 text-xs font-medium flex justify-between">
                    <span>{opt.text}</span>
                    {!!votedOption && <span className="font-bold">{percent}%</span>}
                  </span>
                  {votedOption && (
                    <motion.div
                      className="absolute inset-0"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      style={{
                        transformOrigin: 'left',
                        background: `linear-gradient(90deg, ${theme.colors.accent}20 ${percent}%, transparent ${percent}%)`,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          {totalVotes > 0 && (
            <p className="text-[11px] mt-1.5 font-medium" style={{ color: theme.colors.textSecondary }}>
              {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
PollCard.displayName = 'PollCard';
