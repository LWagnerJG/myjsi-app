import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { isDarkTheme } from '../../../design-system/tokens.js';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { FileText, Clock, Wrench, ExternalLink, Play, X } from 'lucide-react';
import { INSTALL_INSTRUCTIONS_DATA } from './data.js';
import { UNIFIED_MODAL_Z } from '../../../components/common/modalUtils.js';

const DEMO_VIMEO_EMBED_URL = 'https://player.vimeo.com/video/76979871';

const TYPE_META = {
  Casegoods: { bgLightA: '#E1DDD6', bgLightB: '#C8BFB3', bgDarkA: '#383735', bgDarkB: '#2B2A28' },
  Seating: { bgLightA: '#DADBD8', bgLightB: '#BCC3BC', bgDarkA: '#343734', bgDarkB: '#282A28' },
  Lounge: { bgLightA: '#E3DCD6', bgLightB: '#CBBDB0', bgDarkA: '#3B3734', bgDarkB: '#2B2825' },
  Tables: { bgLightA: '#DAD7D1', bgLightB: '#BDB8AE', bgDarkA: '#383631', bgDarkB: '#282621' },
  'Open Plan': { bgLightA: '#D7DBDC', bgLightB: '#B5C0C3', bgDarkA: '#32373A', bgDarkB: '#272D31' },
  Education: { bgLightA: '#D9DDD7', bgLightB: '#B8C2B6', bgDarkA: '#343834', bgDarkB: '#272B27' },
  General: { bgLightA: '#DDD9D2', bgLightB: '#C2BCB0', bgDarkA: '#37342F', bgDarkB: '#2A2723' },
};

const normalizeText = (value) => (
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
);

const toEmbedUrl = (rawUrl) => {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();

    if (host.includes('player.vimeo.com')) return rawUrl;

    if (host.includes('vimeo.com')) {
      const id = url.pathname.split('/').filter(Boolean).pop();
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
      return null;
    }

    if (host.includes('youtube.com')) {
      const id = url.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host.includes('youtu.be')) {
      const id = url.pathname.split('/').filter(Boolean).pop();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    return null;
  } catch {
    return null;
  }
};

export const InstallInstructionsScreen = ({ theme }) => {
  const c = theme.colors;
  const isDark = isDarkTheme(theme);
  const listRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [activeVideo, setActiveVideo] = useState(null);
  const [isTopCollapsed, setIsTopCollapsed] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  const instructions = useMemo(
    () => [...(INSTALL_INSTRUCTIONS_DATA || [])].sort((a, b) => a.title.localeCompare(b.title)),
    []
  );
  const types = useMemo(() => ['all', ...new Set(instructions.map(i => i.type))], [instructions]);

  const filtered = useMemo(() => {
    const normalizedQuery = normalizeText(searchTerm);
    return instructions.filter((item) => {
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      if (!normalizedQuery) return true;
      const searchable = normalizeText([
        item.title,
        item.series,
        item.type,
        ...(item.tags || []),
      ].join(' '));
      return searchable.includes(normalizedQuery);
    });
  }, [instructions, selectedType, searchTerm]);

  const divider = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';
  const cardBg = isDark ? 'rgba(255,255,255,0.08)' : '#fff';
  const subtleBg = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.03)';
  const typeCount = useMemo(() => new Set(instructions.map(i => i.type)).size, [instructions]);

  useEffect(() => {
    if (!activeVideo) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeVideo]);

  useEffect(() => {
    if (!activeVideo) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActiveVideo(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeVideo]);

  useEffect(() => {
    const onResize = () => setIsMobileViewport(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleSearchChange = (value) => {
    if (typeof value === 'string') setSearchTerm(value);
    else setSearchTerm(value?.target?.value || '');
  };

  const openLink = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openVideo = (item) => {
    setActiveVideo({
      title: item.title,
      url: toEmbedUrl(item?.video?.url) || DEMO_VIMEO_EMBED_URL,
    });
  };

  const handleListScroll = (e) => {
    const scrollTop = e.currentTarget.scrollTop;
    const isMobile = window.innerWidth < 768;
    const shouldCollapse = isMobile && scrollTop > 28;
    setIsTopCollapsed(shouldCollapse);
  };

  const showCompactSearch = isMobileViewport && isTopCollapsed;

  return (
    <div className="flex flex-col h-full app-header-offset">
      <div className={`px-4 sm:px-5 pt-2 ${showCompactSearch ? 'pb-2' : 'pb-4'}`}>
        {showCompactSearch ? (
          <div className="transition-all duration-200">
            <StandardSearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by series, type, or keyword..."
              theme={theme}
            />
          </div>
        ) : (
          <div className="rounded-2xl border p-4 sm:p-5 lg:p-6 space-y-4" style={{ backgroundColor: cardBg, borderColor: divider }}>
            <div
              className="overflow-hidden transition-all duration-200"
              style={{ maxHeight: isTopCollapsed ? 0 : 120, opacity: isTopCollapsed ? 0 : 1 }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="text-[1.1875rem] sm:text-xl font-bold tracking-tight" style={{ color: c.textPrimary }}>Install Instructions</h2>
                <p className="text-xs mt-0.5" style={{ color: c.textSecondary }}>
                  {instructions.length} guides organized by product type.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ backgroundColor: subtleBg }}>
                  <FileText className="w-3.5 h-3.5" style={{ color: c.textSecondary }} />
                  <span className="text-[0.6875rem] leading-none font-semibold" style={{ color: c.textSecondary }}>{instructions.length} Docs</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ backgroundColor: subtleBg }}>
                  <span className="text-[0.6875rem] leading-none font-semibold" style={{ color: c.textSecondary }}>{typeCount} Types</span>
                </div>
              </div>
              </div>
            </div>

            <StandardSearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by series, type, or keyword..."
              theme={theme}
            />

            <div
              className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 overflow-hidden transition-all duration-200"
              style={{ maxHeight: isTopCollapsed ? 0 : 240, opacity: isTopCollapsed ? 0 : 1 }}
            >
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className="h-9 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-colors inline-flex items-center justify-center leading-none"
                  style={{
                    backgroundColor: selectedType === type ? c.accent : subtleBg,
                    color: selectedType === type ? c.accentText : c.textSecondary,
                    border: selectedType === type ? 'none' : `1px solid ${divider}`,
                  }}
                >
                  {type === 'all' ? 'All Types' : type}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div ref={listRef} onScroll={handleListScroll} className="flex-1 overflow-y-auto scrollbar-hide px-4 sm:px-5 pb-8">
        {filtered.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filtered.map((item) => {
              const tone = TYPE_META[item.type] || TYPE_META.General;
              const mediaBackground = `linear-gradient(145deg, ${isDark ? tone.bgDarkA : tone.bgLightA} 0%, ${isDark ? tone.bgDarkB : tone.bgLightB} 100%)`;

              return (
                <article
                  key={item.id}
                  className="rounded-2xl overflow-hidden border transition-all duration-200 motion-card group"
                  style={{ backgroundColor: cardBg, border: `1px solid ${divider}` }}
                >
                  <div className="relative aspect-[16/10] overflow-hidden" style={{ background: mediaBackground }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />

                    <button
                      type="button"
                      onClick={() => openVideo(item)}
                      aria-label={`Play ${item.title} video`}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <span
                        className="w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 active:scale-95"
                        style={{ backgroundColor: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.34)' }}
                      >
                        <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                      </span>
                    </button>

                    <div className="absolute top-2.5 right-2.5 h-6 px-2.5 rounded-full inline-flex items-center pointer-events-none" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                      <span className="text-[0.6875rem] leading-none font-semibold text-white/90 tracking-wide">{item.type}</span>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 h-6 flex items-center gap-1 px-2 rounded-lg pointer-events-none" style={{ backgroundColor: 'rgba(0,0,0,0.52)' }}>
                      <Clock className="w-3 h-3 text-white/80" />
                      <span className="text-[0.6875rem] leading-none font-semibold text-white tracking-wide">{item.duration}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-[0.6875rem] uppercase tracking-wide font-semibold mb-1" style={{ color: c.textSecondary }}>{item.series}</p>
                      <h3 className="text-[0.9375rem] font-bold leading-snug tracking-tight" style={{ color: c.textPrimary }}>{item.title}</h3>
                    </div>

                    <div>
                      <button
                        onClick={() => openLink(item.pdfUrl)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all motion-tap"
                        style={{
                          backgroundColor: c.accent,
                          color: c.accentText,
                          border: 'none',
                        }}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Guide
                        <ExternalLink className="w-3.5 h-3.5" style={{ opacity: 0.9 }} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: subtleBg }}>
              <Wrench className="w-6 h-6" style={{ color: c.textSecondary, opacity: 0.4 }} />
            </div>
            <h3 className="text-base font-bold mb-1.5" style={{ color: c.textPrimary }}>No Instructions Found</h3>
            <p className="text-[0.8125rem] max-w-xs" style={{ color: c.textSecondary, opacity: 0.7 }}>
              {searchTerm ? `No results for "${searchTerm}"` : 'No installation instructions available.'}
            </p>
          </div>
        )}
      </div>

      {activeVideo && createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: UNIFIED_MODAL_Z + 30, backgroundColor: 'rgba(0,0,0,0.62)' }}
            onClick={() => setActiveVideo(null)}
          >
            <div
              className="relative w-full max-w-5xl rounded-2xl overflow-hidden border"
              style={{ backgroundColor: c.surface, borderColor: divider, boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-12 px-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${divider}` }}>
                <p className="text-[0.8125rem] font-semibold" style={{ color: c.textPrimary }}>{activeVideo.title} · Video Preview</p>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="w-8 h-8 rounded-full inline-flex items-center justify-center"
                  style={{ backgroundColor: subtleBg, color: c.textSecondary }}
                  aria-label="Close video"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative w-full" style={{ paddingTop: '56.25%', backgroundColor: '#111' }}>
                <iframe
                  title="Install Instruction Video"
                  src={activeVideo.url + (activeVideo.url.includes('?') ? '&' : '?') + 'autoplay=1&muted=0'}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
