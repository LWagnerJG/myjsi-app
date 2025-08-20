// Centralized data exports (legacy) - many modules migrated to screen folders
export * from './theme/themeData.js';
export * from './navigation.js';
export * from './sales.js';
// Backward compatibility shim: re-export project data from feature folder
export { INITIAL_OPPORTUNITIES, MY_PROJECTS_DATA, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS, EMPTY_LEAD } from '../screens/projects/data.js';