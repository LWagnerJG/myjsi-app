import React, { useState, useMemo } from 'react';
import { isDarkTheme } from '../../../design-system/tokens.js';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { PillButton } from '../../../components/common/JSIButtons.jsx';
import { Play, FileText, Clock, BarChart3, Wrench } from 'lucide-react';
import { INSTALL_INSTRUCTIONS_DATA } from './data.js';

/* difficulty config */
const DIFF_META = {
  Beginner:     { color: '#4A7C59', label: 'Beginner' },
  Intermediate: { color: '#C4956A', label: 'Intermediate' },
  Advanced:     { color: '#B85C5C', label: 'Advanced' },
};

export const InstallInstructionsScreen = ({ theme }) => {
  const c = theme.colors;
  const isDark = isDarkTheme(theme);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const instructions = useMemo(() => INSTALL_INSTRUCTIONS_DATA || [], []);
  const types = useMemo(() => ['all', ...new Set(instructions.map(i => i.type))], [instructions]);

  const filtered = useMemo(() => {
    let list = instructions;
    if (selectedType !== 'all') list = list.filter(i => i.type === selectedType);
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(t) || i.type.toLowerCase().includes(t));
    }
    return list;
  }, [instructions, selectedType, searchTerm]);

  const divider = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#fff';
  const subtleBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';

  return (
    <div className="flex flex-col h-full app-header-offset">
      {/* Sticky header area */}
      <div className="px-4 sm:px-5 pt-1 pb-4 space-y-3">
        <StandardSearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search installation instructions..."
          theme={theme}
        />
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {types.map(type => (
            <PillButton
              key={type}
              isSelected={selectedType === type}
              onClick={() => setSelectedType(type)}
              theme={theme}
              size="compact"
              className="whitespace-nowrap"
            >
              {type === 'all' ? 'All Types' : type}
            </PillButton>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 sm:px-5 pb-8">
        {filtered.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(item => {
              const diff = DIFF_META[item.difficulty] || DIFF_META.Beginner;
              return (
                <div key={item.id} className="rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg group"
                  style={{ backgroundColor: cardBg, border: `1px solid ${divider}` }}>

                  {/* Video thumbnail area */}
                  <div className="relative aspect-video cursor-pointer overflow-hidden"
                    onClick={() => window.open(item.videoUrl, '_blank')}
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#e8e4df' }}>
                    <img src={item.thumbnail} alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={e => { e.target.style.display = 'none'; }} />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(255,255,255,0.3)' }}>
                        <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                    {/* Duration badge */}
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-lg"
                      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                      <Clock className="w-3 h-3 text-white/80" />
                      <span className="text-[11px] font-semibold text-white tracking-wide">{item.duration}</span>
                    </div>
                    {/* Type badge */}
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg"
                      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                      <span className="text-[11px] font-semibold text-white/90 tracking-wide">{item.type}</span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="text-[15px] font-bold leading-snug tracking-tight" style={{ color: c.textPrimary }}>{item.name}</h3>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: `${diff.color}15` }}>
                        <BarChart3 className="w-3 h-3" style={{ color: diff.color }} />
                        <span className="text-[10px] font-bold tracking-wide" style={{ color: diff.color }}>{diff.label}</span>
                      </div>
                    </div>

                    {/* Action row */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => window.open(item.videoUrl, '_blank')}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all active:scale-[0.98] hover:opacity-90"
                        style={{ backgroundColor: c.accent, color: c.accentText }}>
                        <Play className="w-3.5 h-3.5" /> Watch Video
                      </button>
                      <button onClick={() => window.open(item.pdfUrl, '_blank')}
                        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[12px] font-bold transition-all active:scale-[0.98]"
                        style={{ backgroundColor: subtleBg, color: c.textPrimary, border: `1px solid ${divider}` }}>
                        <FileText className="w-3.5 h-3.5" style={{ opacity: 0.6 }} /> PDF
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: subtleBg }}>
              <Wrench className="w-6 h-6" style={{ color: c.textSecondary, opacity: 0.4 }} />
            </div>
            <h3 className="text-[16px] font-bold mb-1.5" style={{ color: c.textPrimary }}>No Instructions Found</h3>
            <p className="text-[13px] max-w-xs" style={{ color: c.textSecondary, opacity: 0.6 }}>
              {searchTerm ? 'Try adjusting your search terms.' : 'No installation instructions available.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
