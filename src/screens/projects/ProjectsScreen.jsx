import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Plus, Briefcase, DollarSign, Percent, Users, FileText, Calendar, Edit, Trash2, Check } from 'lucide-react';
import * as Data from '../../data.jsx';
import { FormInput, PortalNativeSelect, TagInput } from '../../components/common/FormComponents.jsx';

const ProjectDetailScreen = ({ project, theme, onBack, onUpdateProject, onDeleteProject }) => {
    const [editedProject, setEditedProject] = useState(project);

    const handleInputChange = (field, value) => {
        setEditedProject(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onUpdateProject(editedProject);
        onBack();
    };
    
    const handleDelete = () => {
        onDeleteProject(project.id);
        onBack();
    };

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <PageTitle title="Project Details" theme={theme} showBack={false}>
                <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                    style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                >
                    <Check className="w-4 h-4" />
                    <span>Save</span>
                </button>
            </PageTitle>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-hide pt-6">
                <GlassCard theme={theme} className="p-4 space-y-4">
                    <FormInput
                        label="Project Name"
                        value={editedProject.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        theme={theme}
                    />
                    <FormInput
                        label="Company"
                        value={editedProject.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        theme={theme}
                    />
                </GlassCard>

                <GlassCard theme={theme} className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Value"
                            value={editedProject.value}
                            onChange={(e) => handleInputChange('value', e.target.value)}
                            theme={theme}
                            type="text"
                        />
                        <PortalNativeSelect
                            label="Stage"
                            value={editedProject.stage}
                            onChange={(e) => handleInputChange('stage', e.target.value)}
                            options={Data.STAGES.map(s => ({ label: s, value: s }))}
                            theme={theme}
                        />
                    </div>
                    <PortalNativeSelect
                        label="Discount"
                        value={editedProject.discount}
                        onChange={(e) => handleInputChange('discount', e.target.value)}
                        options={Data.DISCOUNT_OPTIONS.map(d => ({ label: d, value: d }))}
                        theme={theme}
                    />
                     <PortalNativeSelect
                        label="Win Probability"
                        value={editedProject.winProbability}
                        onChange={(e) => handleInputChange('winProbability', e.target.value)}
                        options={Data.WIN_PROBABILITY_OPTIONS.map(p => ({ label: p, value: p }))}
                        theme={theme}
                    />
                </GlassCard>

                <GlassCard theme={theme} className="p-4 space-y-4">
                    <TagInput
                        label="Competitors"
                        tags={editedProject.competitors || []}
                        onTagsChange={(newTags) => handleInputChange('competitors', newTags)}
                        theme={theme}
                        suggestions={Data.COMPETITORS}
                    />
                </GlassCard>
                
                <div className="px-4">
                    <button
                        onClick={handleDelete}
                        className="w-full flex items-center justify-center space-x-2 font-bold py-3 px-6 rounded-lg text-red-500 bg-red-500/10"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Project</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ProjectsScreen = ({
    onNavigate,
    theme,
    opportunities,
    setOpportunities,
    myProjects,
    setSelectedProject
}) => {
    const [projectsTab, setProjectsTab] = useState('pipeline');
    const [selectedPipelineStage, setSelectedPipelineStage] = useState('Discovery');
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollContainerRef = useRef(null);

    const handleScroll = useCallback(() => {
        if (scrollContainerRef.current) {
            setIsScrolled(scrollContainerRef.current.scrollTop > 10);
        }
    }, []);

    // Unified slider state for both tab sections
    const [mainTabSlider, setMainTabSlider] = useState({ left: 0, width: 0, opacity: 0 });
    const [stageSlider, setStageSlider] = useState({ left: 0, width: 0, opacity: 0 });
    
    const mainTabRefs = useRef([]);
    const stageButtonRefs = useRef([]);

    // Update main tab slider position
    useEffect(() => {
        const tabIndex = projectsTab === 'pipeline' ? 0 : 1;
        const buttonEl = mainTabRefs.current[tabIndex];
        if (buttonEl) {
            setMainTabSlider({
                left: buttonEl.offsetLeft,
                width: buttonEl.offsetWidth,
                opacity: 1,
            });
        }
    }, [projectsTab]);

    // Update stage slider position
    useEffect(() => {
        const stageIndex = Data.STAGES.findIndex(s => s === selectedPipelineStage);
        const buttonEl = stageButtonRefs.current[stageIndex];
        if (buttonEl) {
            setStageSlider({
                left: buttonEl.offsetLeft,
                width: buttonEl.offsetWidth,
                opacity: 1,
            });
        }
    }, [selectedPipelineStage]);

    const handleAddClick = () => {
        if (projectsTab === 'pipeline') {
            onNavigate('new-lead');
        } else {
            onNavigate('add-new-install');
        }
    };

    const handleUpdateProject = (updatedProject) => {
        setOpportunities(prev => prev.map(opp => opp.id === updatedProject.id ? updatedProject : opp));
        setSelectedOpportunity(updatedProject);
    };

    const handleDeleteProject = (projectId) => {
        setOpportunities(prev => prev.filter(opp => opp.id !== projectId));
    };

    const filteredOpportunities = useMemo(() => {
        if (!opportunities) return [];
        return opportunities.filter(opp => opp.stage === selectedPipelineStage);
    }, [selectedPipelineStage, opportunities]);

    if (selectedOpportunity) {
        return (
            <ProjectDetailScreen
                project={selectedOpportunity}
                theme={theme}
                onBack={() => setSelectedOpportunity(null)}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
            />
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div 
                className={`sticky top-0 z-10 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}
                style={{
                    backgroundColor: isScrolled ? `${theme.colors.background}e0` : 'transparent',
                    backdropFilter: isScrolled ? 'blur(12px)' : 'none',
                    WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
                    borderBottom: `1px solid ${isScrolled ? theme.colors.border + '40' : 'transparent'}`
                }}
            >
                <PageTitle title="Projects" theme={theme}>
                    <button
                        onClick={handleAddClick}
                        className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                    >
                        <div className="relative h-5 w-[110px] flex items-center justify-center">
                            <span className={`absolute transition-opacity duration-200 ${projectsTab === 'pipeline' ? 'opacity-100' : 'opacity-0'}`}>New Lead</span>
                            <span className={`absolute transition-opacity duration-200 ${projectsTab === 'my-projects' ? 'opacity-100' : 'opacity-0'}`}>Add Install</span>
                        </div>
                        <Plus className="w-4 h-4" />
                    </button>
                </PageTitle>
            </div>

            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto scrollbar-hide"
            >
                <div className="px-4 space-y-3">
                    {/* Main Tab Selector - Now consistent with stage selector */}
                    <GlassCard theme={theme} className="p-1.5">
                        <div className="relative flex space-x-1">
                            {/* Animated background pill */}
                            <div 
                                className="absolute top-0 bottom-0 rounded-full transition-all duration-300 ease-out" 
                                style={{ 
                                    backgroundColor: theme.colors.accent, 
                                    left: mainTabSlider.left, 
                                    width: mainTabSlider.width, 
                                    opacity: mainTabSlider.opacity 
                                }} 
                            />
                            
                            <button 
                                ref={el => (mainTabRefs.current[0] = el)}
                                onClick={() => setProjectsTab('pipeline')} 
                                className="relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors duration-200" 
                                style={{ color: projectsTab === 'pipeline' ? 'white' : theme.colors.textSecondary }}
                            >
                                Pipeline
                            </button>
                            <button 
                                ref={el => (mainTabRefs.current[1] = el)}
                                onClick={() => setProjectsTab('my-projects')} 
                                className="relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors duration-200" 
                                style={{ color: projectsTab === 'my-projects' ? 'white' : theme.colors.textSecondary }}
                            >
                                My Projects
                            </button>
                        </div>
                    </GlassCard>

                    {/* Stage Selector - Improved with better spacing and consistency */}
                    {projectsTab === 'pipeline' && (
                        <GlassCard theme={theme} className="p-1.5">
                            <div className="relative flex space-x-1 overflow-x-auto scrollbar-hide">
                                {/* Animated background pill */}
                                <div 
                                    className="absolute top-0 bottom-0 rounded-full transition-all duration-300 ease-out" 
                                    style={{ 
                                        backgroundColor: theme.colors.accent, 
                                        left: stageSlider.left, 
                                        width: stageSlider.width, 
                                        opacity: stageSlider.opacity 
                                    }} 
                                />
                                
                                {Data.STAGES.map((stage, index) => (
                                    <button 
                                        key={stage} 
                                        ref={el => (stageButtonRefs.current[index] = el)} 
                                        onClick={() => setSelectedPipelineStage(stage)} 
                                        className="relative z-10 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors duration-200 flex-shrink-0" 
                                        style={{ color: selectedPipelineStage === stage ? 'white' : theme.colors.textSecondary }}
                                    >
                                        {stage}
                                    </button>
                                ))}
                            </div>
                        </GlassCard>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-3 scrollbar-hide">
                {projectsTab === 'pipeline' ? (
                    filteredOpportunities.length > 0 ? (
                        filteredOpportunities.map(opp => (
                            <GlassCard 
                                key={opp.id} 
                                theme={theme} 
                                className="overflow-hidden p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" 
                                onClick={() => setSelectedOpportunity(opp)}
                                style={{
                                    border: `1px solid ${theme.colors.border}`,
                                    background: `linear-gradient(135deg, ${theme.colors.surface} 0%, ${theme.colors.subtle} 100%)`
                                }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg leading-tight" style={{ color: theme.colors.textPrimary }}>
                                        {opp.name}
                                    </h3>
                                    <span 
                                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${Data.STAGE_COLORS[opp.stage]}`}
                                    >
                                        {opp.stage}
                                    </span>
                                </div>
                                <p className="text-sm mb-3" style={{ color: theme.colors.textSecondary }}>
                                    {opp.company}
                                </p>
                                <div className="flex items-center justify-between">
                                    <p className="font-bold text-2xl" style={{ color: theme.colors.accent }}>
                                        {opp.value}
                                    </p>
                                    {opp.discount && (
                                        <span className="text-xs px-2 py-1 rounded-full" style={{ 
                                            backgroundColor: theme.colors.subtle, 
                                            color: theme.colors.textSecondary 
                                        }}>
                                            {opp.discount}
                                        </span>
                                    )}
                                </div>
                            </GlassCard>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Briefcase className="w-12 h-12 mb-4" style={{ color: theme.colors.textSecondary }} />
                            <p className="text-center text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                                No projects in {selectedPipelineStage} stage
                            </p>
                            <p className="text-center text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                                Add a new lead to get started
                            </p>
                        </div>
                    )
                ) : (
                    myProjects && myProjects.length > 0 ? (
                        myProjects.map(project => (
                            <GlassCard 
                                key={project.id} 
                                theme={theme} 
                                className="p-0 overflow-hidden cursor-pointer group transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" 
                                onClick={() => setSelectedProject(project)}
                                style={{
                                    border: `1px solid ${theme.colors.border}`,
                                    borderRadius: '16px'
                                }}
                            >
                                <div className="relative aspect-video w-full">
                                    <img 
                                        src={project.image} 
                                        alt={project.name} 
                                        className="absolute h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-4">
                                        <h3 className="text-xl font-bold text-white tracking-tight mb-1">
                                            {project.name}
                                        </h3>
                                        <p className="text-white/90 font-medium text-sm">
                                            {project.location}
                                        </p>
                                    </div>
                                </div>
                            </GlassCard>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Briefcase className="w-12 h-12 mb-4" style={{ color: theme.colors.textSecondary }} />
                            <p className="text-center text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                                No projects added yet
                            </p>
                            <p className="text-center text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                                Add your first install to get started
                            </p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};