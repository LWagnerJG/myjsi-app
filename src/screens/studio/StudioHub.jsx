import React, { useState, useMemo, useCallback } from 'react';
import {
  Sparkles, Plus, Award, TrendingUp, Eye, Download, ChevronRight,
  Lock, Building2, Globe, Search, Send, MessageCircle, Trophy,
} from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import {
  ONE_PAGERS, TEMPLATES, CHALLENGES, PROJECT_STORIES, STUDIO_STATS,
  FEEDBACK_PROMPTS, SCOPES,
} from './data.js';

const SCOPE_ICON = { public: Globe, company: Building2, private: Lock };

const SectionHeader = ({ theme, label, action, onAction }) => (
  <div className="flex items-end justify-between mb-3 px-1">
    <h2 className="text-sm font-bold uppercase tracking-[0.14em]" style={{ color: theme.colors.textSecondary, opacity: 0.75 }}>{label}</h2>
    {action ? (
      <button onClick={onAction} className="text-xs font-semibold inline-flex items-center gap-0.5 transition-opacity active:opacity-60" style={{ color: theme.colors.textSecondary }}>
        {action} <ChevronRight className="w-3.5 h-3.5" />
      </button>
    ) : null}
  </div>
);

const ScopeBadge = ({ scope }) => {
  const Icon = SCOPE_ICON[scope] || Globe;
  const meta = SCOPES[scope] || SCOPES.public;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[0.625rem] font-bold uppercase tracking-wider"
      style={{ backgroundColor: `${meta.tint}1A`, color: meta.tint }}>
      <Icon className="w-2.5 h-2.5" /> {meta.label}
    </span>
  );
};

const OnePagerCard = ({ resource, theme, dark, onOpen }) => (
  <button
    onClick={() => onOpen(resource)}
    className="text-left group rounded-2xl overflow-hidden transition-all active:scale-[0.99] hover:-translate-y-0.5"
    style={{
      backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
      boxShadow: dark ? '0 1px 4px rgba(0,0,0,0.20)' : '0 1px 4px rgba(53,53,53,0.05)',
    }}
  >
    <div className="aspect-[4/3] overflow-hidden" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#F0EDE8' }}>
      {resource.cover ? (
        <img src={resource.cover} alt={resource.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      ) : null}
    </div>
    <div className="p-3.5 space-y-2">
      <div className="flex items-center gap-1.5">
        <ScopeBadge scope={resource.scope} />
        <span className="text-[0.625rem] font-semibold uppercase tracking-wider" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>{resource.series}</span>
      </div>
      <h3 className="text-sm font-bold leading-snug line-clamp-2" style={{ color: theme.colors.textPrimary }}>{resource.title}</h3>
      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: theme.colors.textSecondary }}>{resource.summary}</p>
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-medium truncate" style={{ color: theme.colors.textSecondary }}>{resource.author?.name}</span>
        <span className="inline-flex items-center gap-2.5 text-[0.6875rem] font-semibold" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>
          <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" /> {resource.views}</span>
          <span className="inline-flex items-center gap-1"><Download className="w-3 h-3" /> {resource.downloads}</span>
        </span>
      </div>
    </div>
  </button>
);

export const StudioHub = ({ theme, currentUserId, onNavigate, onCreateOnePager }) => {
  const dark = isDarkTheme(theme);
  const [scopeFilter, setScopeFilter] = useState('all');
  const [search, setSearch] = useState('');

  const subtle = (s = 1) => dark ? `rgba(255,255,255,${0.04 * s})` : `rgba(0,0,0,${0.025 * s})`;

  const openOnePager = useCallback((resource) => {
    if (typeof onNavigate === 'function') onNavigate(`community/studio/${resource.id}`);
  }, [onNavigate]);

  const visibleResources = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ONE_PAGERS.filter((r) => {
      if (scopeFilter !== 'all' && r.scope !== scopeFilter) return false;
      if (!q) return true;
      return [r.title, r.summary, r.series, r.author?.name, ...(r.tags || [])]
        .filter(Boolean).join(' ').toLowerCase().includes(q);
    });
  }, [search, scopeFilter]);

  const myResources = useMemo(
    () => ONE_PAGERS.filter((r) => (currentUserId ? r.author?.id === currentUserId : r.author?.name === 'Luke Wagner')),
    [currentUserId],
  );

  const xpPct = Math.min(100, Math.round((STUDIO_STATS.xp / STUDIO_STATS.xpToNext) * 100));

  return (
    <div className="space-y-6 pb-10">

      {/* Hero */}
      <GlassCard theme={theme} className="p-6 sm:p-8" variant="elevated">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-center">
          <div className="space-y-3.5">
            <div className="inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" style={{ color: theme.colors.accent, opacity: 0.7 }} />
              <span className="text-[0.6875rem] font-bold uppercase tracking-[0.18em]" style={{ color: theme.colors.textSecondary }}>JSI Makers Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black leading-[1.1] tracking-tight" style={{ color: theme.colors.textPrimary }}>
              Build the resources you wish JSI already had.
            </h1>
            <p className="text-sm leading-relaxed max-w-xl" style={{ color: theme.colors.textSecondary }}>
              Publish one-pagers, project stories, and competitive sheets. Keep them private, share with your company, or send them to the whole network. Earn studio credits when others use what you make.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button onClick={onCreateOnePager}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95"
                style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}>
                <Plus className="w-3.5 h-3.5" /> Publish a one-pager
              </button>
              <button onClick={() => document.getElementById('studio-library')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95"
                style={{ backgroundColor: subtle(2), color: theme.colors.textPrimary }}>
                Browse Studio Library
              </button>
            </div>
          </div>

          {/* Status mini-card */}
          <div className="rounded-2xl p-4 sm:p-5" style={{ backgroundColor: subtle(1.5) }}>
            <div className="flex items-center gap-2 mb-2.5">
              <Award className="w-4 h-4" style={{ color: theme.colors.accent }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>Champion · {STUDIO_STATS.level}</span>
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>{STUDIO_STATS.xp} XP</span>
              <span className="text-xs" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>{STUDIO_STATS.xpToNext - STUDIO_STATS.xp} to {STUDIO_STATS.nextLevel}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${xpPct}%`, backgroundColor: theme.colors.accent }} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <div className="text-lg font-black tabular-nums" style={{ color: theme.colors.textPrimary }}>{STUDIO_STATS.published}</div>
                <div className="text-[0.625rem] font-semibold uppercase tracking-wider mt-0.5" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>Published</div>
              </div>
              <div>
                <div className="text-lg font-black tabular-nums" style={{ color: theme.colors.textPrimary }}>{STUDIO_STATS.usedByOthers}</div>
                <div className="text-[0.625rem] font-semibold uppercase tracking-wider mt-0.5" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>Used by others</div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Templates — Start From */}
      <section>
        <SectionHeader theme={theme} label="Start from a template" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {TEMPLATES.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => onCreateOnePager?.(t.id)}
                className="text-left rounded-2xl p-4 transition-all active:scale-[0.98] hover:-translate-y-0.5"
                style={{
                  backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                  border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
                }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${t.accent}1A`, color: t.accent }}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold leading-tight" style={{ color: theme.colors.textPrimary }}>{t.title}</h3>
                <p className="text-xs leading-relaxed mt-1.5 line-clamp-2" style={{ color: theme.colors.textSecondary }}>{t.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Studio Library */}
      <section id="studio-library">
        <SectionHeader theme={theme} label="Studio Library" />

        {/* Filter row */}
        <div className="flex items-center gap-2 mb-3 px-1 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources, series, authors\u2026"
              className="w-full pl-9 pr-3 py-2 rounded-full text-xs outline-none"
              style={{
                backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)'}`,
                color: theme.colors.textPrimary,
              }}
            />
          </div>
          <div className="inline-flex rounded-full p-0.5" style={{ backgroundColor: subtle(1.5) }}>
            {[['all', 'All'], ['public', 'Public'], ['company', 'Company'], ['private', 'Private']].map(([val, label]) => (
              <button key={val} onClick={() => setScopeFilter(val)}
                className="px-3 py-1 rounded-full text-[0.6875rem] font-bold uppercase tracking-wider transition-all"
                style={{
                  backgroundColor: scopeFilter === val ? (dark ? 'rgba(255,255,255,0.12)' : '#FFFFFF') : 'transparent',
                  color: scopeFilter === val ? theme.colors.textPrimary : theme.colors.textSecondary,
                  boxShadow: scopeFilter === val ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {visibleResources.length === 0 ? (
          <div className="text-center py-10 text-sm" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>
            No resources match those filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleResources.map((r) => (
              <OnePagerCard key={r.id} resource={r} theme={theme} dark={dark} onOpen={openOnePager} />
            ))}
          </div>
        )}
      </section>

      {/* My Studio */}
      {myResources.length > 0 ? (
        <section>
          <SectionHeader theme={theme} label="My Studio" action={`${myResources.length} published`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {myResources.map((r) => (
              <OnePagerCard key={r.id} resource={r} theme={theme} dark={dark} onOpen={openOnePager} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Project Stories + Challenges side-by-side on desktop */}
      <div className="grid lg:grid-cols-2 gap-4">
        <section>
          <SectionHeader theme={theme} label="Project Stories" />
          <div className="space-y-2.5">
            {PROJECT_STORIES.map((s) => (
              <div key={s.id} className="rounded-2xl p-4" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}` }}>
                <p className="text-sm font-semibold leading-snug" style={{ color: theme.colors.textPrimary }}>&ldquo;{s.quote}&rdquo;</p>
                <p className="text-xs mt-2" style={{ color: theme.colors.textSecondary }}>{s.detail}</p>
                <p className="text-[0.6875rem] font-semibold uppercase tracking-wider mt-2" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>{s.author}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader theme={theme} label="Open Challenges" />
          <div className="space-y-2.5">
            {CHALLENGES.map((c) => (
              <div key={c.id} className="rounded-2xl p-4" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}` }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>{c.title}</h3>
                    <p className="text-xs leading-relaxed mt-1" style={{ color: theme.colors.textSecondary }}>{c.blurb}</p>
                  </div>
                  <Trophy className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C4956A', opacity: 0.7 }} />
                </div>
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` }}>
                  <span className="text-[0.6875rem] font-semibold uppercase tracking-wider" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>{c.deadline}</span>
                  <button className="text-xs font-bold inline-flex items-center gap-1" style={{ color: theme.colors.accent }}>
                    Enter <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Shape JSI feedback loop */}
      <section>
        <SectionHeader theme={theme} label="Shape JSI" />
        <GlassCard theme={theme} className="p-5" variant="elevated">
          <p className="text-sm leading-relaxed mb-4" style={{ color: theme.colors.textSecondary }}>
            What you publish here becomes what JSI builds next. Pick a lane and send it.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {FEEDBACK_PROMPTS.map((p) => {
              const Icon = p.icon;
              return (
                <button key={p.id}
                  className="text-left rounded-xl p-3.5 transition-all active:scale-[0.98]"
                  style={{ backgroundColor: subtle(1.5) }}>
                  <Icon className="w-3.5 h-3.5 mb-2" style={{ color: theme.colors.textSecondary }} />
                  <div className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>{p.title}</div>
                  <div className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>{p.desc}</div>
                </button>
              );
            })}
          </div>
        </GlassCard>
      </section>

    </div>
  );
};
