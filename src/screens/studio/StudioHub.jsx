import React, { useState, useMemo, useCallback } from 'react';
import {
  Plus, Award, Eye, Download, ChevronRight,
  Lock, Building2, Globe, Search, Trophy,
} from 'lucide-react';
import { isDarkTheme } from '../../design-system/tokens.js';
import {
  ONE_PAGERS, TEMPLATES, CHALLENGES, PROJECT_STORIES, STUDIO_STATS,
  SCOPES,
} from './data.js';

const SCOPE_ICON = { public: Globe, company: Building2, private: Lock };

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
    className="text-left group rounded-2xl overflow-hidden transition-all active:scale-[0.99]"
    style={{ backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#FFFFFF' }}
  >
    <div className="aspect-[4/3] overflow-hidden" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#F0EDE8' }}>
      {resource.cover && (
        <img src={resource.cover} alt={resource.title} loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      )}
    </div>
    <div className="p-3 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <ScopeBadge scope={resource.scope} />
        <span className="text-[0.625rem] font-semibold uppercase tracking-wider" style={{ color: theme.colors.textSecondary, opacity: 0.4 }}>{resource.series}</span>
      </div>
      <h3 className="text-sm font-bold leading-snug line-clamp-2" style={{ color: theme.colors.textPrimary }}>{resource.title}</h3>
      <div className="flex items-center justify-between">
        <span className="text-xs truncate" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>{resource.author?.name}</span>
        <span className="inline-flex items-center gap-2 text-[0.625rem]" style={{ color: theme.colors.textSecondary, opacity: 0.4 }}>
          <span className="inline-flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {resource.views}</span>
          <span className="inline-flex items-center gap-0.5"><Download className="w-2.5 h-2.5" /> {resource.downloads}</span>
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
    <div className="space-y-5 pb-10">

      {/* Header */}
      <div className="flex items-start justify-between px-1 pt-1 gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <h1 className="text-xl font-black tracking-tight" style={{ color: theme.colors.textPrimary }}>
            Makers Studio
          </h1>
          {/* Stats row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Award className="w-3 h-3 flex-shrink-0" style={{ color: theme.colors.accent, opacity: 0.75 }} />
              <span className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
                {STUDIO_STATS.level}
              </span>
            </div>
            <span className="text-[0.625rem]" style={{ color: theme.colors.textSecondary, opacity: 0.4 }}>·</span>
            <span className="text-xs" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>
              <strong style={{ color: theme.colors.textPrimary }}>{STUDIO_STATS.published}</strong> published
            </span>
            <span className="text-[0.625rem]" style={{ color: theme.colors.textSecondary, opacity: 0.4 }}>·</span>
            <span className="text-xs" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>
              <strong style={{ color: theme.colors.textPrimary }}>{STUDIO_STATS.usedByOthers}</strong> used
            </span>
          </div>
          {/* XP bar */}
          <div className="h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}>
            <div className="h-full rounded-full" style={{ width: `${xpPct}%`, backgroundColor: theme.colors.accent }} />
          </div>
        </div>
        <button
          onClick={onCreateOnePager}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95"
          style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
        >
          <Plus className="w-3.5 h-3.5" /> Publish
        </button>
      </div>

      {/* Templates — compact horizontal rows */}
      <section>
        <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] mb-2 px-1"
          style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>Templates</p>
        <div className="grid grid-cols-2 gap-1.5">
          {TEMPLATES.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => onCreateOnePager?.(t.id)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all active:scale-[0.98] text-left"
                style={{ backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#FFFFFF' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${t.accent}18`, color: t.accent }}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold leading-tight" style={{ color: theme.colors.textPrimary }}>{t.title}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Studio Library */}
      <section id="studio-library">
        {/* Search + filters in one row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.colors.textSecondary, opacity: 0.35 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
              style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#FFFFFF', color: theme.colors.textPrimary }}
            />
          </div>
          <div className="inline-flex rounded-xl p-0.5 gap-0.5" style={{ backgroundColor: subtle(1.5) }}>
            {[['all', 'All'], ['public', 'Pub'], ['company', 'Co.'], ['private', 'Me']].map(([val, label]) => (
              <button key={val} onClick={() => setScopeFilter(val)}
                className="px-2.5 py-1.5 rounded-lg text-[0.625rem] font-bold uppercase tracking-wider transition-all"
                style={{
                  backgroundColor: scopeFilter === val ? (dark ? 'rgba(255,255,255,0.12)' : '#FFFFFF') : 'transparent',
                  color: scopeFilter === val ? theme.colors.textPrimary : theme.colors.textSecondary,
                  opacity: scopeFilter === val ? 1 : 0.6,
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {visibleResources.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>
            No resources match those filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {visibleResources.map((r) => (
              <OnePagerCard key={r.id} resource={r} theme={theme} dark={dark} onOpen={openOnePager} />
            ))}
          </div>
        )}
      </section>

      {/* My Studio */}
      {myResources.length > 0 && (
        <section>
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] mb-2 px-1"
            style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>
            My Studio <span style={{ opacity: 0.6 }}>· {myResources.length}</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {myResources.map((r) => (
              <OnePagerCard key={r.id} resource={r} theme={theme} dark={dark} onOpen={openOnePager} />
            ))}
          </div>
        </section>
      )}

      {/* Project Stories + Challenges */}
      <div className="grid lg:grid-cols-2 gap-4">
        <section>
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] mb-2 px-1"
            style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>Project Stories</p>
          <div className="space-y-1.5">
            {PROJECT_STORIES.map((s) => (
              <div key={s.id} className="rounded-2xl p-3.5"
                style={{ backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#FFFFFF' }}>
                <p className="text-sm font-semibold leading-snug" style={{ color: theme.colors.textPrimary }}>&ldquo;{s.quote}&rdquo;</p>
                <p className="text-xs mt-1.5" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>{s.detail}</p>
                <p className="text-[0.6875rem] font-semibold uppercase tracking-wider mt-2"
                  style={{ color: theme.colors.textSecondary, opacity: 0.35 }}>{s.author}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] mb-2 px-1"
            style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>Open Challenges</p>
          <div className="space-y-1.5">
            {CHALLENGES.map((c) => (
              <div key={c.id} className="rounded-2xl p-3.5"
                style={{ backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#FFFFFF' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>{c.title}</h3>
                    <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>{c.blurb}</p>
                  </div>
                  <Trophy className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#C4956A', opacity: 0.55 }} />
                </div>
                <div className="flex items-center justify-between mt-2.5 pt-2.5"
                  style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` }}>
                  <span className="text-[0.625rem] font-semibold uppercase tracking-wider"
                    style={{ color: theme.colors.textSecondary, opacity: 0.4 }}>{c.deadline}</span>
                  <button className="text-xs font-bold inline-flex items-center gap-0.5" style={{ color: theme.colors.accent }}>
                    Enter <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

    </div>
  );
};
