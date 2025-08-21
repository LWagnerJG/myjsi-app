// Normalized indices for sample products & finishes to avoid repeated linear scans
import { SAMPLE_PRODUCTS, FINISH_SAMPLES } from './data.js';

// Build maps once at module load
const productMap = new Map();
SAMPLE_PRODUCTS.forEach(p => productMap.set(String(p.id), p));

const finishMap = new Map();
FINISH_SAMPLES.forEach(f => finishMap.set(String(f.id), f));

export const getSampleProduct = (id) => productMap.get(String(id));
export const getFinishSample = (id) => finishMap.get(String(id));
export const SAMPLE_PRODUCT_MAP = productMap; // if iteration needed
export const FINISH_SAMPLE_MAP = finishMap;
