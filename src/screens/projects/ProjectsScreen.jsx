import React, { useState, useMemo, useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Plus, Briefcase, Check, Trash2 } from 'lucide-react';
import * as Data from '../../data.jsx';
import { FormInput, PortalNativeSelect, TagInput } from '../../components/common/FormComponents.jsx';

const fmtCurrency = (v) =>
    typeof v === 'string'
        ? v
        : (v ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const StageChip = ({ stage, theme }) => (
    <span
        className="px-2.5 py-1 text-xs font-semibold rounded-full"
        style={{
            backgroundColor: theme.colors.subtle,
            color: theme.colors.textSecondary,
            border: `1px solid ${theme.colors.border}`,
        }}
    >
        {stage}
    </span>
);

const StatTile = ({ label, value, theme }) => (
    <div
        className="rounded-xl px-3 py-2 text-center flex-1"
        style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
    >
        <div className="text-xs mb-1" style={{ color: theme.colors.textSecondary }}>
            {label}
        </div>
        <div className="font-bold" style={{ color: theme.colors.textPrimary }}>
            {value}
        </div>
    </div>
);

const ProjectCard = ({ opp, theme, onClick }) => (
    <button onClick={onClick} className="w-full text-left">
        <GlassCard
            theme={theme}
            className="p-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
                background: `linear-gradient(145deg, ${theme.colors.surface} 0%, ${theme.colors.subtle} 100%)`,
                border: `1px solid ${theme.colors.border}`,
            }}
        >
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                    <p className="font-bold text-lg truncate" style={{ color: theme.colors.textPrimary }}>
                        {opp.name}
                    </p>
                    <p className="text-sm truncate" style={{ color: theme.colors.textSecondary }}>
                        {opp.company}
                    </p>
                </div>
                <StageChip stage={opp.stage} theme={theme} />
            </div>

            <div className="flex items-center justify-between">
                <p className="font-extrabold text-2xl" style={{ color: theme.colors.accent }}>
                    {fmtCurrency(opp.value)}
                </p>
                {opp.winProbability && (
                    <span
                        className="px-2 py-1 text-xs font-bold rounded-full"
                        style={{
                            backgroundColor: `${theme.colors.accent}14`,
                            color: theme.colors.accent,
                            border: `1px solid ${theme.colors.accent}40`,
                        }}
                    >
                        {opp.winProbability}
                    </span>
                )}
            </div>
        </GlassCard>
    </button>
);

const ProjectDetailScreen = ({ project, theme, onBack, onUpdateProject, onDeleteProject }) => {
    const [edited, setEdited] = useState(project);
    const [dirty, setDirty] = useState(false);

    const setField = (k, v) => {
        setEdited((p) => ({ ...p, [k]: v }));
        setDirty(true);
    };

    const save = () => {
        onUpdateProject(edited);
        setDirty(false);
        onBack();
    };
    const remove = () => {
        if (window.confirm('Delete this project? This cannot be undone.')) {
            onDeleteProject(project.id);
            onBack();
        }
    };

    const showWinTile = Boolean(edited.winProbability);

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <div className="px-4 pt-6 space-y-4">
                <GlassCard theme={theme} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="font-bold text-xl truncate" style={{ color: theme.colors.textPrimary }}>
                                {edited.name}
                            </p>
                            <p className="text-sm truncate" style={{ color: theme.colors.textSecondary }}>
                                {edited.company}
                            </p>
                        </div>
                        <StageChip stage={edited.stage} theme={theme} />
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-3">
                        <StatTile label="Value" value={fmtCurrency(edited.value)} theme={theme} />
                        {showWinTile && <StatTile label="Win Prob." value={edited.winProbability} theme={theme} />}
                        <StatTile label="Discount" value={edited.discount || '—'} theme={theme} />
                    </div>
                </GlassCard>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4 space-y-4 scrollbar-hide">
                <GlassCard theme={theme} className="p-4 space-y-4">
                    <FormInput label="Project Name" value={edited.name} onChange={(e) => setField('name', e.target.value)} theme={theme} />
                    <FormInput label="Company" value={edited.company} onChange={(e) => setField('company', e.target.value)} theme={theme} />
                </GlassCard>

                <GlassCard theme={theme} className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput label="Value" value={edited.value} onChange={(e) => setField('value', e.target.value)} theme={theme} />
                        <PortalNativeSelect
                            label="Stage"
                            value={edited.stage}
                            onChange={(e) => setField('stage', e.target.value)}
                            options={Data.STAGES.map((s) => ({ label: s, value: s }))}
                            theme={theme}
                        />
                    </div>
                    <PortalNativeSelect
                        label="Discount"
                        value={edited.discount}
                        onChange={(e) => setField('discount', e.target.value)}
                        options={Data.DISCOUNT_OPTIONS.map((d) => ({ label: d, value: d }))}
                        theme={theme}
                    />
                    <PortalNativeSelect
                        label="Win Probability"
                        value={edited.winProbability}
                        onChange={(e) => setField('winProbability', e.target.value)}
                        options={Data.WIN_PROBABILITY_OPTIONS.map((p) => ({ label: p, value: p }))}
                        theme={theme}
                    />
                </GlassCard>

                <GlassCard theme={theme} className="p-4 space-y-4">
                    <TagInput
                        label="Competitors"
                        tags={edited.competitors || []}
                        onTagsChange={(tags) => setField('competitors', tags)}
                        theme={theme}
                        suggestions={Data.COMPETITORS}
                    />
                </GlassCard>

                <button
                    onClick={remove}
                    className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl text-red-500 bg-red-500/10"
                >
                    <Trash2 className="w-4 h-4" /> Delete Project
                </button>
            </div>

            <div
                className="fixed bottom-0 left-0 right-0 z-20 px-4 py-3"
                style={{ backgroundColor: theme.colors.surface, borderTop: `1px solid ${theme.colors.border}` }}
            >
                <div className="max-w-screen-md mx-auto flex items-center justify-end gap-2">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 rounded-full font-semibold text-sm"
                        style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={save}
                        disabled={!dirty}
                        className="px-5 py-2 rounded-full font-semibold text-sm text-white disabled:opacity-50"
                        style={{ backgroundColor: theme.colors.accent }}
                    >
                        <span className="inline-flex items-center gap-2">
                            <Check className="w-4 h-4" /> Save
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ProjectsScreen = forwardRef(
    ({ onNavigate, theme, opportunities, setOpportunities, myProjects, setSelectedProject }, ref) => {
        const [projectsTab, setProjectsTab] = useState('pipeline');
        const [selectedPipelineStage, setSelectedPipelineStage] = useState('Discovery');
        const [selectedOpportunity, setSelectedOpportunity] = useState(null);
        const [isScrolled, setIsScrolled] = useState(false);
        const scrollContainerRef = useRef(null);

        useImperativeHandle(ref, () => ({
            clearSelection: () => {
                if (selectedOpportunity) {
                    setSelectedOpportunity(null);
                    return true;
                }
                return false;
            },
        }));

        const handleScroll = useCallback(() => {
            if (scrollContainerRef.current) setIsScrolled(scrollContainerRef.current.scrollTop > 10);
        }, []);

        const [mainTabSlider, setMainTabSlider] = useState({ left: 0, width: 0, opacity: 0 });
        const [stageSlider, setStageSlider] = useState({ left: 0, width: 0, opacity: 0 });
        const mainTabRefs = useRef([]);
        const stageButtonRefs = useRef([]);

        useEffect(() => {
            const idx = projectsTab === 'pipeline' ? 0 : 1;
            const el = mainTabRefs.current[idx];
            if (el) setMainTabSlider({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 });
        }, [projectsTab]);

        useEffect(() => {
            const idx = Data.STAGES.findIndex((s) => s === selectedPipelineStage);
            const el = stageButtonRefs.current[idx];
            if (el) setStageSlider({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 });
        }, [selectedPipelineStage]);

        const handleAddClick = () => {
            if (projectsTab === 'pipeline') onNavigate('new-lead');
            else onNavigate('add-new-install');
        };

        const updateProject = (updated) => {
            setOpportunities((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
            setSelectedOpportunity(updated);
        };

        const deleteProject = (id) => {
            setOpportunities((prev) => prev.filter((o) => o.id !== id));
        };

        const filteredOpportunities = useMemo(
            () => (opportunities || []).filter((o) => o.stage === selectedPipelineStage),
            [selectedPipelineStage, opportunities]
        );

        if (selectedOpportunity) {
            return (
                <ProjectDetailScreen
                    project={selectedOpportunity}
                    theme={theme}
                    onBack={() => setSelectedOpportunity(null)}
                    onUpdateProject={updateProject}
                    onDeleteProject={deleteProject}
                />
            );
        }

        return (
            <div className="h-full flex flex-col" style={{ backgroundColor: theme.colors.background }}>
                <div
                    className={`sticky top-0 z-10 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}
                    style={{
                        backgroundColor: isScrolled ? `${theme.colors.background}e0` : theme.colors.background,
                        backdropFilter: isScrolled ? 'blur(12px)' : 'none',
                        WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
                        borderBottom: `1px solid ${isScrolled ? theme.colors.border + '40' : 'transparent'}`,
                    }}
                >
                    <div className="px-4 pt-6 pb-2 flex items-center gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <div className="flex gap-6 pb-2">
                                    <button
                                        ref={(el) => (mainTabRefs.current[0] = el)}
                                        onClick={() => setProjectsTab('pipeline')}
                                        className="text-sm font-semibold"
                                        style={{ color: projectsTab === 'pipeline' ? theme.colors.accent : theme.colors.textSecondary }}
                                    >
                                        Pipeline
                                    </button>
                                    <button
                                        ref={(el) => (mainTabRefs.current[1] = el)}
                                        onClick={() => setProjectsTab('my-projects')}
                                        className="text-sm font-semibold"
                                        style={{ color: projectsTab === 'my-projects' ? theme.colors.accent : theme.colors.textSecondary }}
                                    >
                                        My Projects
                                    </button>
                                </div>
                                <div className="absolute left-0 right-0 bottom-0 h-px" style={{ backgroundColor: theme.colors.border }} />
                                <div
                                    className="absolute bottom-0 h-[2px] rounded-full transition-all duration-300"
                                    style={{
                                        left: mainTabSlider.left,
                                        width: mainTabSlider.width,
                                        backgroundColor: theme.colors.accent,
                                        opacity: mainTabSlider.opacity,
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleAddClick}
                            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                            style={{ backgroundColor: theme.colors.accent, color: '#fff' }}
                        >
                            <span>{projectsTab === 'pipeline' ? 'New Lead' : 'Add Install'}</span>
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {projectsTab === 'pipeline' && (
                        <div className="px-4 pt-1 pb-2">
                            <div className="relative overflow-x-auto scrollbar-hide">
                                <div className="relative flex gap-6 pb-2 whitespace-nowrap">
                                    {Data.STAGES.map((stage, i) => (
                                        <button
                                            key={stage}
                                            ref={(el) => (stageButtonRefs.current[i] = el)}
                                            onClick={() => setSelectedPipelineStage(stage)}
                                            className="text-sm font-semibold"
                                            style={{ color: selectedPipelineStage === stage ? theme.colors.accent : theme.colors.textSecondary }}
                                        >
                                            {stage}
                                        </button>
                                    ))}
                                    <div className="absolute left-0 right-0 bottom-0 h-px" style={{ backgroundColor: theme.colors.border }} />
                                    <div
                                        className="absolute bottom-0 h-[2px] rounded-full transition-all duration-300"
                                        style={{
                                            left: stageSlider.left,
                                            width: stageSlider.width,
                                            backgroundColor: theme.colors.accent,
                                            opacity: stageSlider.opacity,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto scrollbar-hide">
                    <div className="px-4 pt-4 pb-6 space-y-3">
                        {projectsTab === 'pipeline' ? (
                            filteredOpportunities.length ? (
                                filteredOpportunities.map((opp) => (
                                    <ProjectCard key={opp.id} opp={opp} theme={theme} onClick={() => setSelectedOpportunity(opp)} />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Briefcase className="w-12 h-12 mb-4" style={{ color: theme.colors.textSecondary }} />
                                    <p className="text-center text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                                        No projects in {selectedPipelineStage}
                                    </p>
                                    <p className="text-center text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                                        Add a new lead to get started
                                    </p>
                                </div>
                            )
                        ) : myProjects?.length ? (
                            myProjects.map((p) => (
                                <GlassCard
                                    key={p.id}
                                    theme={theme}
                                    className="p-0 overflow-hidden cursor-pointer group transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={() => setSelectedProject(p)}
                                    style={{ border: `1px solid ${theme.colors.border}`, borderRadius: '16px' }}
                                >
                                    <div className="relative aspect-video w-full">
                                        <img src={p.image} alt={p.name} className="absolute h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                        <div className="absolute bottom-0 left-0 p-4">
                                            <h3 className="text-xl font-bold text-white tracking-tight mb-1">{p.name}</h3>
                                            <p className="text-white/90 font-medium text-sm">{p.location}</p>
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
                        )}
                    </div>
                </div>
            </div>
        );
    }
);
