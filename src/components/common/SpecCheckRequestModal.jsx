import React, { useMemo, useRef, useState } from 'react';
import { FileText, Search, Upload, X } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from './JSIButtons.jsx';
import { Modal } from './Modal.jsx';

export const SpecCheckRequestModal = ({
    show,
    onClose,
    theme,
    myProjects = [],
    onSubmit,
}) => {
    const [notes, setNotes] = useState('');
    const [projectQuery, setProjectQuery] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const colors = {
        textPrimary: theme?.colors?.textPrimary || '#353535',
        textSecondary: theme?.colors?.textSecondary || '#6B7280',
        border: theme?.colors?.border || '#E5E7EB',
        subtle: theme?.colors?.subtle || '#F3F4F6',
        accent: theme?.colors?.accent || '#353535',
        surface: theme?.colors?.surface || '#FFFFFF',
    };

    const normalizedProjects = useMemo(
        () => (myProjects || []).map((project) => ({
            ...project,
            displayName: project?.name || project?.projectName || '',
        })),
        [myProjects]
    );

    const filteredProjects = useMemo(() => {
        const query = projectQuery.trim().toLowerCase();
        if (!query) return normalizedProjects.slice(0, 6);
        return normalizedProjects
            .filter((project) => project.displayName.toLowerCase().includes(query))
            .slice(0, 6);
    }, [normalizedProjects, projectQuery]);

    const selectedProject = useMemo(
        () => normalizedProjects.find((project) => String(project.id) === String(selectedProjectId)) || null,
        [normalizedProjects, selectedProjectId]
    );

    const canSubmit = files.length > 0 && notes.trim().length > 0;

    const resetForm = () => {
        setNotes('');
        setProjectQuery('');
        setSelectedProjectId('');
        setFiles([]);
    };

    const handleClose = () => {
        resetForm();
        onClose?.();
    };

    const handleFileSelect = (event) => {
        const nextFiles = Array.from(event.target.files || []);
        if (!nextFiles.length) return;
        setFiles((prev) => [...prev, ...nextFiles]);
        event.target.value = '';
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
    };

    const handleProjectPick = (project) => {
        setSelectedProjectId(project.id);
        setProjectQuery(project.displayName);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!canSubmit) return;

        onSubmit?.({
            files,
            notes: notes.trim(),
            selectedProject,
            projectInput: projectQuery.trim(),
        });

        resetForm();
    };

    return (
        <Modal show={show} onClose={handleClose} title="Spec Check Request" theme={theme} maxWidth="max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: colors.textSecondary }}>
                        Quote Attachment *
                    </label>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full rounded-2xl border px-4 py-4 text-left transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.08]"
                        style={{ borderColor: colors.border, backgroundColor: colors.subtle }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.surface }}>
                                <Upload className="w-5 h-5" style={{ color: colors.accent }} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Upload quote file</p>
                                <p className="text-xs" style={{ color: colors.textSecondary }}>PDF, DOCX, XLSX, image files</p>
                            </div>
                        </div>
                    </button>
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
                    {files.length > 0 && (
                        <div className="space-y-2">
                            {files.map((file, index) => (
                                <div
                                    key={`${file.name}-${index}`}
                                    className="flex items-center justify-between rounded-xl border px-3 py-2"
                                    style={{ borderColor: colors.border }}
                                >
                                    <div className="min-w-0 flex items-center gap-2">
                                        <FileText className="w-4 h-4 flex-shrink-0" style={{ color: colors.textSecondary }} />
                                        <p className="text-xs font-medium truncate" style={{ color: colors.textPrimary }}>{file.name}</p>
                                    </div>
                                    <button
                                        type="button"
                                        aria-label="Remove file"
                                        onClick={() => removeFile(index)}
                                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                    >
                                        <X className="w-4 h-4" style={{ color: colors.textSecondary }} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: colors.textSecondary }}>
                        Notes *
                    </label>
                    <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="Add context for the spec check..."
                        rows={4}
                        className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-shadow focus:ring-2"
                        style={{ borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surface }}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: colors.textSecondary }}>
                        Tie To Project (Optional)
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textSecondary }} />
                        <input
                            value={projectQuery}
                            onChange={(event) => {
                                setProjectQuery(event.target.value);
                                setSelectedProjectId('');
                            }}
                            placeholder="Search existing projects"
                            className="w-full rounded-2xl border pl-10 pr-4 py-3 text-sm outline-none transition-shadow focus:ring-2"
                            style={{ borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surface }}
                        />
                    </div>
                    {projectQuery.trim().length > 0 && filteredProjects.length > 0 && (
                        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: colors.border }}>
                            {filteredProjects.map((project) => (
                                <button
                                    key={project.id}
                                    type="button"
                                    onClick={() => handleProjectPick(project)}
                                    className="w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.08]"
                                    style={{
                                        color: colors.textPrimary,
                                        backgroundColor: String(project.id) === String(selectedProjectId) ? colors.subtle : colors.surface,
                                    }}
                                >
                                    {project.displayName}
                                </button>
                            ))}
                        </div>
                    )}
                    {projectQuery.trim().length > 0 && !filteredProjects.length && (
                        <p className="text-xs" style={{ color: colors.textSecondary }}>
                            No matching project found. Submitting will create a new project with this name.
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3 pt-1">
                    <SecondaryButton
                        type="button"
                        onClick={handleClose}
                        theme={theme}
                        className="flex-1 h-11 !py-0 px-5 text-[0.8125rem]"
                    >
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton
                        type="submit"
                        disabled={!canSubmit}
                        theme={theme}
                        className="flex-1 h-11 !py-0 px-5 text-[0.8125rem] disabled:cursor-not-allowed"
                    >
                        Submit Request
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
};

export default SpecCheckRequestModal;
