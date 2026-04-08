import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '../../../../components/common/GlassCard.jsx';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import {
  GraduationCap, Eye, MessageCircle, Trophy, Gem,
  Lock, ChevronRight, ChevronDown, Star, Palette, BookOpen,
  Lightbulb, Zap, Award, Users, Sparkles, CheckCircle2,
} from 'lucide-react';

/* ── static data ── */

const STATS = [
  { label: 'Soft Members', value: '273', icon: Users },
  { label: 'Trusted Contributor', value: 'Active', icon: Award },
  { label: 'Design Influence', value: '+100%', icon: Sparkles },
  { label: 'Challenges', value: '25', icon: Zap },
];

const PILLARS = [
  {
    id: 'academy',
    icon: GraduationCap,
    title: 'Academy',
    desc: 'Learn material language, presentation techniques, and how to give product feedback that moves the needle.',
    color: '#4A7C59',
    courses: [
      { title: 'Material Language for Dealer Designers', tag: 'Studio Lesson' },
      { title: 'Presenting JSI Through Project Story', tag: 'Guided Walkthrough' },
      { title: 'How to Give Product Feedback That Moves', tag: 'Micro Lesson' },
    ],
  },
  {
    id: 'previews',
    icon: Eye,
    title: 'Previews',
    desc: 'Get early access to unreleased series, concept reviews, and development-stage products before they launch.',
    color: '#5B7B8C',
    items: [
      { title: 'Vision Focus Suite', detail: 'A refinement pass on private office, built for quiet focus, hospitality, and layered storage.' },
      { title: 'Poet Soft Geometry', detail: 'Exploring a softer collaborative footprint for lounge-forward workspaces.' },
      { title: 'Makers Table Study', detail: 'A studio-making-a-product designed training warmth and conversation.' },
    ],
  },
  {
    id: 'community',
    icon: MessageCircle,
    title: 'Community',
    desc: 'A private conversation surface where trusted dealers share notes, influence product direction, and earn recognition.',
    color: '#C4956A',
  },
  {
    id: 'challenges',
    icon: Trophy,
    title: 'Challenges',
    desc: 'Monthly design challenges that sharpen skills, build portfolio pieces, and unlock studio credits.',
    color: '#8C7B63',
  },
  {
    id: 'rewards',
    icon: Gem,
    title: 'Rewards',
    desc: 'Earn merch, early product access, and influence credits by contributing to the studio ecosystem.',
    color: '#6A6762',
  },
];

/* ── component ── */

export const MakersStudioTab = ({ theme }) => {
  const dark = isDarkTheme(theme);
  const [ready, setReady] = useState(false);
  const [expanded, setExpanded] = useState({ academy: true });
  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t); }, []);

  const toggleExpand = useCallback((id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] })), []);

  const subtle = (strength = 1) =>
    dark ? `rgba(255,255,255,${(0.04 * strength).toFixed(3)})` : `rgba(0,0,0,${(0.025 * strength).toFixed(4)})`;

  return (
    <div className="space-y-6 pb-8">

      {/* ── Hero ── */}
      <GlassCard theme={theme} className="p-6 sm:p-8" variant="elevated">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.15em]" style={{ color: theme.colors.textSecondary }}>
              JSI Makers Studio
            </span>
            <span className="text-[0.625rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ backgroundColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)', color: theme.colors.textSecondary }}>
              Quiet Prestige
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight" style={{ color: theme.colors.textPrimary }}>
            A private studio for dealer designers to learn, influence, unlock, and earn.
          </h1>

          <p className="text-sm leading-relaxed max-w-xl" style={{ color: theme.colors.textSecondary }}>
            Makers Studio turns product feedback, idea writing, and training into a quiet, self-accelerating loop — where influence builds reputation, reputation unlocks access, and access fuels contribution.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button className="px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95"
              style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}>
              Open Early Preview
            </button>
            <button className="px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95"
              style={{ backgroundColor: subtle(2), color: theme.colors.textPrimary }}>
              Enter Academy
            </button>
          </div>
        </div>
      </GlassCard>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATS.map((s, i) => (
          <GlassCard key={s.label} theme={theme} className="p-4 text-center" variant="elevated">
            <div style={{
              opacity: ready ? 1 : 0,
              transform: ready ? 'none' : 'translateY(6px)',
              transition: `opacity 0.3s ease ${0.05 + i * 0.06}s, transform 0.3s ease ${0.05 + i * 0.06}s`,
            }}>
              <s.icon className="w-4 h-4 mx-auto mb-2" style={{ color: theme.colors.textSecondary, opacity: 0.4 }} />
              <div className="text-lg font-black tabular-nums" style={{ color: theme.colors.textPrimary }}>{s.value}</div>
              <div className="text-[0.6875rem] font-semibold uppercase tracking-wider mt-0.5" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>{s.label}</div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* ── Pillars ── */}
      {PILLARS.map((pillar, idx) => {
        const Icon = pillar.icon;
        const isOpen = !!expanded[pillar.id];
        const hasContent = pillar.courses || pillar.items;
        return (
          <GlassCard key={pillar.id} theme={theme} className="overflow-hidden" variant="elevated">
            <div style={{
              opacity: ready ? 1 : 0,
              transition: `opacity 0.3s ease ${0.15 + idx * 0.08}s`,
            }}>
              {/* Header — clickable to expand/collapse */}
              <button
                onClick={() => hasContent && toggleExpand(pillar.id)}
                className="w-full flex items-center gap-2.5 p-5 sm:p-6 text-left transition-colors"
                style={{ cursor: hasContent ? 'pointer' : 'default' }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${pillar.color}14`, color: pillar.color }}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[0.9375rem] font-bold" style={{ color: theme.colors.textPrimary }}>{pillar.title}</h2>
                  <p className={`text-sm leading-relaxed mt-0.5 ${isOpen ? '' : 'line-clamp-1'}`} style={{ color: theme.colors.textSecondary }}>{pillar.desc}</p>
                </div>
                {hasContent && (
                  <ChevronDown
                    className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                    style={{ color: theme.colors.textSecondary, opacity: 0.35, transform: isOpen ? 'rotate(180deg)' : 'none' }}
                  />
                )}
              </button>

              {/* Expandable content */}
              <div
                className="transition-all duration-300 ease-in-out overflow-hidden"
                style={{ maxHeight: isOpen ? 500 : 0, opacity: isOpen ? 1 : 0 }}
              >
                <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                  {/* Academy courses */}
                  {pillar.courses && (
                    <div className="space-y-2">
                      {pillar.courses.map((c) => (
                        <button key={c.title} className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl transition-all active:scale-[0.99] text-left group"
                          style={{ backgroundColor: subtle() }}>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{c.title}</div>
                            <div className="text-[0.6875rem] font-medium mt-0.5" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>{c.tag}</div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-20 group-hover:opacity-50 transition-opacity flex-shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Preview items */}
                  {pillar.items && (
                    <div className="space-y-2">
                      {pillar.items.map((item) => (
                        <button key={item.title} className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl transition-all active:scale-[0.99] text-left group"
                          style={{ backgroundColor: subtle() }}>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{item.title}</div>
                            <div className="text-xs mt-0.5 line-clamp-1" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>{item.detail}</div>
                          </div>
                          <Lock className="w-3 h-3 opacity-20 flex-shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Placeholder for community / challenges / rewards */}
              {!pillar.courses && !pillar.items && (
                <div className="flex items-center gap-2 py-3 px-3.5 mx-5 mb-5 sm:mx-6 sm:mb-6 rounded-xl" style={{ backgroundColor: subtle() }}>
                  <Lock className="w-3.5 h-3.5 opacity-25 flex-shrink-0" />
                  <span className="text-xs font-medium" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Coming soon — invitation only</span>
                </div>
              )}
            </div>
          </GlassCard>
        );
      })}

      {/* ── Bottom CTA ── */}
      <div className="text-center space-y-2 pt-2">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: theme.colors.textSecondary, opacity: 0.35 }}>
          Prestige is earned, not given.
        </p>
      </div>
    </div>
  );
};
