import React, { useState, useMemo } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { PillButton } from '../../../components/common/JSIButtons.jsx';
import { Play, FileText } from 'lucide-react';
import { INSTALL_INSTRUCTIONS_DATA } from './data.js';

const CARD_SHADOW = '0 4px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.06)';

const WhiteCard = ({ children, className='', style={} }) => (
  <div className={`rounded-3xl border transition-shadow duration-200 bg-white ${className}`} style={{ borderColor:'rgba(0,0,0,0.07)', boxShadow: CARD_SHADOW, ...style }}>
    {children}
  </div>
);

export const InstallInstructionsScreen = ({ theme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const instructions = INSTALL_INSTRUCTIONS_DATA || [];

  const types = useMemo(() => [ 'all', ...new Set(instructions.map(i => i.type)) ], [instructions]);

  const filteredInstructions = useMemo(() => {
    let list = instructions;
    if (selectedType !== 'all') list = list.filter(i => i.type === selectedType);
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(t) || i.type.toLowerCase().includes(t));
    }
    return list;
  }, [instructions, selectedType, searchTerm]);

  const handleVideoPlay = (instruction) => window.open(instruction.videoUrl, '_blank');
  const handlePdfDownload = (instruction) => window.open(instruction.pdfUrl, '_blank');

  const FilterBar = () => (
    <div className="flex w-full items-center justify-between gap-2 overflow-x-auto scrollbar-hide">
      {types.map(type => {
        const active = selectedType === type;
        return (
          <PillButton
            key={type}
            isSelected={active}
            onClick={()=>setSelectedType(type)}
            theme={theme}
            size="compact"
            className="whitespace-nowrap"
          >
            {type === 'all' ? 'All Types' : type}
          </PillButton>
        );
      })}
    </div>
  );

  const InstructionCard = ({ instruction }) => (
    <WhiteCard className="p-4">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div
          className="w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer relative group"
          onClick={()=>handleVideoPlay(instruction)}
          style={{ backgroundColor: theme.colors.subtle }}
        >
          <img src={instruction.thumbnail} alt={instruction.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/45 transition-colors">
            <Play className="w-6 h-6 text-white" />
          </div>
          <span className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-black/60 text-white tracking-wide">{instruction.duration}</span>
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="font-semibold text-base leading-snug flex-1" style={{ color: theme.colors.textPrimary }}>{instruction.name}</h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: theme.colors.accent+'20', color: theme.colors.accent }}>{instruction.type}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <PillButton
              onClick={()=>handleVideoPlay(instruction)}
              isSelected={true}
              theme={theme}
              size="compact"
              className="flex items-center justify-center gap-1.5"
            >
              <Play className="w-4 h-4" />
              Watch Video
            </PillButton>
            <PillButton
              onClick={()=>handlePdfDownload(instruction)}
              isSelected={false}
              theme={theme}
              size="compact"
              className="flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              PDF Guide
            </PillButton>
          </div>
        </div>
      </div>
    </WhiteCard>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Removed PageTitle per request */}
      <div className="px-4 pt-3 space-y-4 pb-4">
        <StandardSearchBar
          value={searchTerm}
          onChange={(e)=>setSearchTerm(e.target.value)}
          placeholder="Search product series installation instructions..."
          theme={theme}
        />
        <FilterBar />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-6 space-y-3">
        {filteredInstructions.length ? (
          filteredInstructions.map(item => <InstructionCard key={item.id} instruction={item} />)
        ) : (
          <GlassCard theme={theme} className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.accent }} />
            <h3 className="font-bold text-lg mb-2" style={{ color: theme.colors.textPrimary }}>No Instructions Found</h3>
            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{searchTerm? 'Try adjusting your search terms.' : 'No installation instructions available.'}</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
};