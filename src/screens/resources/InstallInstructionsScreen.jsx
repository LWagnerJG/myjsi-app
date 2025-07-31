import React, { useState, useMemo } from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { SearchInput } from '../../components/common/SearchInput.jsx';
import { Play, FileText, ExternalLink, Download } from 'lucide-react';
import * as Data from '../../data.jsx';

export const InstallInstructionsScreen = ({ theme }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');

    const instructions = Data.INSTALL_INSTRUCTIONS_DATA || [];

    const types = useMemo(() => [
        'all',
        ...new Set(instructions.map(item => item.type))
    ], [instructions]);

    const filteredInstructions = useMemo(() => {
        let filtered = instructions;

        if (selectedType !== 'all') {
            filtered = filtered.filter(item => item.type === selectedType);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(term) ||
                item.type.toLowerCase().includes(term)
            );
        }

        return filtered;
    }, [instructions, selectedType, searchTerm]);

    const handleVideoPlay = (instruction) => {
        window.open(instruction.videoUrl, '_blank');
    };

    const handlePdfDownload = (instruction) => {
        window.open(instruction.pdfUrl, '_blank');
    };

    const InstructionCard = ({ instruction }) => (
        <GlassCard theme={theme} className="p-4">
            <div className="flex items-start space-x-4">
                {/* Thumbnail */}
                <div 
                    className="w-24 h-18 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer relative group"
                    onClick={() => handleVideoPlay(instruction)}
                    style={{ backgroundColor: theme.colors.subtle }}
                >
                    <img 
                        src={instruction.thumbnail} 
                        alt={instruction.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                        <Play className="w-6 h-6 text-white" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="font-semibold text-lg" style={{ color: theme.colors.textPrimary }}>
                                {instruction.name}
                            </h3>
                            <span 
                                className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                    backgroundColor: theme.colors.accent + '20',
                                    color: theme.colors.accent 
                                }}
                            >
                                {instruction.type}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-3">
                        <button
                            onClick={() => handleVideoPlay(instruction)}
                            className="px-3 py-2 rounded-lg font-medium text-sm flex items-center space-x-2"
                            style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                        >
                            <Play className="w-4 h-4" />
                            <span>Watch Video</span>
                        </button>
                        <button
                            onClick={() => handlePdfDownload(instruction)}
                            className="px-3 py-2 rounded-lg font-medium text-sm flex items-center space-x-2"
                            style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
                        >
                            <FileText className="w-4 h-4" />
                            <span>PDF Guide</span>
                        </button>
                        <button
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textSecondary }}
                        >
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </GlassCard>
    );

    return (
        <div className="flex flex-col h-full">
            <PageTitle title="Install Instructions" theme={theme} />

            <div className="px-4 pb-4 space-y-4">
                {/* Search */}
                <SearchInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by product name or type..."
                    theme={theme}
                />

                {/* Type Filter */}
                <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
                    {types.map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                selectedType === type ? 'font-bold' : ''
                            }`}
                            style={{
                                backgroundColor: selectedType === type 
                                    ? theme.colors.accent + '20' 
                                    : theme.colors.subtle,
                                color: selectedType === type 
                                    ? theme.colors.accent 
                                    : theme.colors.textPrimary
                            }}
                        >
                            {type === 'all' ? 'All Types' : type}
                        </button>
                    ))}
                </div>

                {/* Info Card */}
                <GlassCard theme={theme} className="p-4">
                    <div className="flex items-start space-x-3">
                        <FileText className="w-6 h-6 mt-0.5" style={{ color: theme.colors.accent }} />
                        <div>
                            <h3 className="font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>
                                Installation Resources
                            </h3>
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                Access video tutorials and PDF guides for JSI product installation. 
                                Each product includes step-by-step instructions and helpful tips.
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 space-y-3 pb-4">
                    {filteredInstructions.length > 0 ? (
                        filteredInstructions.map((instruction) => (
                            <InstructionCard key={instruction.id} instruction={instruction} />
                        ))
                    ) : (
                        <GlassCard theme={theme} className="p-8 text-center">
                            <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.accent }} />
                            <h3 className="font-bold text-lg mb-2" style={{ color: theme.colors.textPrimary }}>
                                No Instructions Found
                            </h3>
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                {searchTerm ? 'Try adjusting your search terms.' : 'No installation instructions available.'}
                            </p>
                        </GlassCard>
                    )}
                </div>
            </div>
        </div>
    );
};
