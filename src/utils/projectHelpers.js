/**
 * Return the display name of a project object.
 * Prefers `project.name`; falls back to `project.projectName` for legacy
 * objects that were created before the shape was standardised.
 * @param {{ name?: string, projectName?: string } | null | undefined} project
 * @returns {string}
 */
export const getProjectDisplayName = (project) => {
  if (!project || typeof project !== 'object') return '';
  return String(project.name || project.projectName || '').trim();
};

/**
 * Check whether a project's display name matches a candidate string
 * (case-insensitive, trimmed).
 * @param {{ name?: string, projectName?: string }} project
 * @param {string} candidateName
 * @returns {boolean}
 */
export const projectNameMatches = (project, candidateName) => {
  const projectName = getProjectDisplayName(project).toLowerCase();
  const candidate = String(candidateName || '').trim().toLowerCase();
  if (!projectName || !candidate) return false;
  return projectName === candidate;
};

/**
 * Create a minimal project draft object with a canonical `name` field.
 * @param {string} name - Project display name
 * @param {Object} [overrides] - Additional fields to merge into the draft
 * @returns {{ id: string, name: string, stage: string, status: string, createdAt: number }}
 */
export const createProjectDraft = (name, overrides = {}) => ({
  id: `proj_${Date.now()}`,
  name: String(name || '').trim(),
  stage: 'Discovery',
  status: 'Open',
  createdAt: Date.now(),
  ...overrides,
});

