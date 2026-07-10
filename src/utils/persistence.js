/**
 * Shared localStorage / ID primitives for client-side persistence.
 * Prefer these over hand-rolled JSON.parse + crypto ID helpers.
 */

/** Cryptographically random hex ID — not guessable unlike Date.now(). */
export const createRandomId = (byteLength = 12) => {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Parse a JSON string that must resolve to an array.
 * @param {string | null | undefined} value
 * @returns {Array}
 */
export const safeParseJsonArray = (value) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Parse a JSON string that must resolve to a plain object.
 * @param {string | null | undefined} value
 * @param {object|null} [fallback]
 * @returns {object|null}
 */
export const safeParseJsonObject = (value, fallback = {}) => {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

/**
 * Read a JSON array from localStorage.
 * @param {string} key
 * @returns {Array}
 */
export const readLocalStorageJsonArray = (key) => {
  if (!canUseStorage()) return [];
  return safeParseJsonArray(window.localStorage.getItem(key));
};

/**
 * Read a JSON object from localStorage.
 * @param {string} key
 * @param {object|null} [fallback]
 * @returns {object|null}
 */
export const readLocalStorageJsonObject = (key, fallback = {}) => {
  if (!canUseStorage()) return fallback;
  const raw = window.localStorage.getItem(key);
  if (raw == null) return fallback;
  return safeParseJsonObject(raw, fallback);
};

/**
 * Write a JSON-serialisable value to localStorage. Failures are swallowed.
 * @param {string} key
 * @param {*} value
 * @returns {boolean}
 */
export const writeLocalStorageJson = (key, value) => {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

/**
 * Prepend an item to a capped localStorage JSON array (newest first).
 * @param {string} key
 * @param {*} item
 * @param {number} [maxItems]
 * @returns {Array} The updated list (or [item] when storage is unavailable)
 */
export const prependToLocalStorageList = (key, item, maxItems = 100) => {
  const current = readLocalStorageJsonArray(key);
  const next = [item, ...current].slice(0, maxItems);
  writeLocalStorageJson(key, next);
  return next;
};
