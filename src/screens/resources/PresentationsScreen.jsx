import React, { useState } from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { FileText, Download, ExternalLink, Users, Monitor } from 'lucide-react';

export const PresentationsScreen = ({ theme }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');

    const presentations = [
        {
            id: 1,
            title: 'JSI Product Overview 2025',
            category: 'Product Training',
            type: 'PowerPoint',
            size: '12.4 MB',
            lastUpdated: '2025-01-15',
            description: 'Comprehensive overview of all JSI product lines with pricing and specifications.',
            downloadUrl: '#'
        },
        {
            id: 2,
            title: 'Vision Casegoods Series',
            category: 'Product Specific',
            type: 'PowerPoint',
            size: '8.2 MB',
            lastUpdated: '2025-01-10',
            description: 'Detailed presentation on Vision casegoods configurations and options.',
            downloadUrl: '#'
        },
        {
            id: 3,
            title: 'Sustainability & JSI',
            category: 'Company',
            type: 'PDF',
            size: '5.6 MB',
            lastUpdated: '2024-12-20',
            description: 'JSI\'s commitment to sustainable practices and environmental responsibility.',
            downloadUrl: '#'
        },
        {
            id: 4,
            title: 'Contract Pricing Guide',
            category: 'Sales Training',
            type: 'PowerPoint',
            size: '4.1 MB',
            lastUpdated: '2025-01-05',
            description: 'Understanding contract pricing structures and discount calculations.',
            downloadUrl: '#'
        },
        {
            id: 5,
            title: 'New Product Launches 2025',
            category: 'Product Training',
            type: 'PowerPoint',
            size: '15.2 MB',
            lastUpdated: '2025-01-20',
            description: 'Latest product introductions and key selling points.',
            downloadUrl: '#'
        }
    ];

    const categories = ['all', ...new Set(presentations.map(p => p.category))];

    const filteredPresentations = selectedCategory === 'all' 
        ? presentations 
        : presentations.filter(p => p.category === selectedCategory);

    const handleDownload = (presentation) => {
        // In a real app, this would trigger the actual download
        console.log('Downloading:', presentation.title);
    };

    const PresentationCard = ({ presentation }) => (
        <GlassCard theme={theme} className="p-4">
            <div className="flex items-start space-x-4">
                <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: theme.colors.accent + '20' }}
                >
                    <FileText className="w-6 h-6" style={{ color: theme.colors.accent }} />
                </div>

                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="font-semibold text-lg" style={{ color: theme.colors.textPrimary }}>
                                {presentation.title}
                            </h3>
                            <div className="flex items-center space-x-3 mt-1">
                                <span 
                                    className="px-2 py-1 rounded-full text-xs font-medium"
                                    style={{ 
                                        backgroundColor: theme.colors.accent + '20',
                                        color: theme.colors.accent 
                                    }}
                                >
                                    {presentation.category}
                                </span>
                                <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                    {presentation.type} • {presentation.size}
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm mb-3" style={{ color: theme.colors.textSecondary }}>
                        {presentation.description}
                    </p>

                    <div className="flex items-center justify-between">
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                            Updated: {new Date(presentation.lastUpdated).toLocaleDateString()}
                        </p>
                        
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleDownload(presentation)}
                                className="px-3 py-2 rounded-lg font-medium text-sm flex items-center space-x-2"
                                style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                            >
                                <Download className="w-4 h-4" />
                                <span>Download</span>
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
            </div>
        </GlassCard>
    );

    return (
        <div className="flex flex-col h-full">
            <PageTitle title="Presentations" theme={theme} />

            <div className="px-4 pb-4 space-y-4">
                {/* Info Card */}
                <GlassCard theme={theme} className="p-4">
                    <div className="flex items-start space-x-3">
                        <Monitor className="w-6 h-6 mt-0.5" style={{ color: theme.colors.accent }} />
                        <div>
                            <h3 className="font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>
                                Sales & Training Presentations
                            </h3>
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                Download professional presentations for client meetings, training sessions, and product demonstrations.
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* Category Filter */}
                <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                selectedCategory === category ? 'font-bold' : ''
                            }`}
                            style={{
                                backgroundColor: selectedCategory === category 
                                    ? theme.colors.accent + '20' 
                                    : theme.colors.subtle,
                                color: selectedCategory === category 
                                    ? theme.colors.accent 
                                    : theme.colors.textPrimary
                            }}
                        >
                            {category === 'all' ? 'All Categories' : category}
                        </button>
                    ))}
                </div>

                {/* Stats */}
                <GlassCard theme={theme} className="p-3">
                    <div className="flex justify-between items-center">
                        <p className="text-sm" style={{ color: theme.colors.textPrimary }}>
                            <span className="font-semibold">{filteredPresentations.length}</span> presentation{filteredPresentations.length !== 1 ? 's' : ''} available
                        </p>
                        <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                            <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                Updated regularly
                            </span>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 space-y-3 pb-4">
                    {filteredPresentations.map((presentation) => (
                        <PresentationCard key={presentation.id} presentation={presentation} />
                    ))}
                </div>
            </div>
        </div>
    );
};
