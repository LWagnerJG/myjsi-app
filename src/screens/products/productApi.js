/**
 * Product API abstraction layer.
 *
 * Every function returns data shaped the same way regardless of source.
 * Today: returns static mock data from productHierarchy.js.
 * Tomorrow: swap each function body for a fetch() call — callers stay the same.
 */

import {
  PRODUCT_FAMILIES,
  PRODUCT_SUBCATEGORIES,
  PRODUCT_MODELS,
  PRODUCT_CATEGORIES,
} from './productHierarchy.js';

// ─── Families (L1) ──────────────────────────────────────────────────────────

/** All product families, alphabetical by name. */
export function getFamilies() {
  return [...PRODUCT_FAMILIES].sort((a, b) => a.name.localeCompare(b.name));
}

/** Single family by id. */
export function getFamily(familyId) {
  return PRODUCT_FAMILIES.find((f) => f.id === familyId) ?? null;
}

// ─── Subcategories (L2) ─────────────────────────────────────────────────────

/** All subcategories for a given family. */
export function getSubcategoriesByFamily(familyId) {
  return PRODUCT_SUBCATEGORIES.filter((sc) => sc.familyId === familyId);
}

/** All subcategories within a product category (e.g. 'casegoods'). */
export function getSubcategoriesByCategory(categorySlug) {
  return PRODUCT_SUBCATEGORIES.filter((sc) => sc.categorySlug === categorySlug);
}

/** Single subcategory by id. */
export function getSubcategory(subcategoryId) {
  return PRODUCT_SUBCATEGORIES.find((sc) => sc.id === subcategoryId) ?? null;
}

// ─── Models (leaf products) ─────────────────────────────────────────────────

/** All models within a subcategory. */
export function getModelsBySubcategory(subcategoryId) {
  return PRODUCT_MODELS.filter((m) => m.subcategoryId === subcategoryId);
}

/** Single model by id. */
export function getModel(modelId) {
  return PRODUCT_MODELS.find((m) => m.id === modelId) ?? null;
}

/** All models within a product category (flat). */
export function getModelsByCategory(categorySlug) {
  const subIds = new Set(
    PRODUCT_SUBCATEGORIES
      .filter((sc) => sc.categorySlug === categorySlug)
      .map((sc) => sc.id),
  );
  return PRODUCT_MODELS.filter((m) => subIds.has(m.subcategoryId));
}

// ─── Categories ─────────────────────────────────────────────────────────────

/** The 8 top-level product category slugs + names. */
export function getCategories() {
  return [...PRODUCT_CATEGORIES];
}

// ─── Convenience: Families that appear in a category ────────────────────────

/** Families that have at least one subcategory in the given category. */
export function getFamiliesByCategory(categorySlug) {
  const familyIds = new Set(
    PRODUCT_SUBCATEGORIES
      .filter((sc) => sc.categorySlug === categorySlug)
      .map((sc) => sc.familyId),
  );
  return PRODUCT_FAMILIES.filter((f) => familyIds.has(f.id));
}
