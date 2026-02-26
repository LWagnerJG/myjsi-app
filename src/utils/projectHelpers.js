export const getProjectDisplayName = (project) => {
  if (!project || typeof project !== 'object') return '';
  return String(project.name || project.projectName || '').trim();
};

export const projectNameMatches = (project, candidateName) => {
  const projectName = getProjectDisplayName(project).toLowerCase();
  const candidate = String(candidateName || '').trim().toLowerCase();
  if (!projectName || !candidate) return false;
  return projectName === candidate;
};

export const createProjectDraft = (name, overrides = {}) => ({
  id: `proj_${Date.now()}`,
  name: String(name || '').trim(),
  stage: 'Discovery',
  status: 'Open',
  createdAt: Date.now(),
  ...overrides,
});

