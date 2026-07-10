import { useEffect, useState } from 'react';
import { readLocalStorageJsonArray, writeLocalStorageJson } from '../utils/persistence.js';

/** Legacy key — keep stable so Settings + Home stay in sync. */
export const LEAD_TIME_FAVORITES_KEY = 'leadTimeFavorites';

export const readLeadTimeFavorites = () => readLocalStorageJsonArray(LEAD_TIME_FAVORITES_KEY);

export const writeLeadTimeFavorites = (favorites) =>
  writeLocalStorageJson(LEAD_TIME_FAVORITES_KEY, Array.isArray(favorites) ? favorites : []);

/**
 * Shared lead-time favorites state for Settings + Home.
 * Uses the historical localStorage key (not usePersistentState versioning)
 * so existing user selections are preserved.
 */
export function useLeadTimeFavorites() {
  const [leadTimeFavorites, setLeadTimeFavorites] = useState(() => readLeadTimeFavorites());

  useEffect(() => {
    writeLeadTimeFavorites(leadTimeFavorites);
  }, [leadTimeFavorites]);

  return [leadTimeFavorites, setLeadTimeFavorites];
}
