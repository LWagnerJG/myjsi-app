import { LEAD_TIMES_DATA } from '../lead-times/data.js';

export const WEIGHT_LIMIT_LBS = 275;
export const WEIGHT_FAILURE_TEST_LBS = 450;
export const WEIGHT_RATINGS_ROUTE = 'resources/weight-ratings';
export const WEIGHT_RATINGS_TYPES = ['Seating', 'Upholstery', 'Wood Seating'];
export const WEIGHT_RATINGS_FALLBACK_IMAGE = '/myjsi-icon.png';

export const toWeightRatingSlug = (value) => (
    value
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
);

export function createWeightRatingsSeries(leadTimesData = LEAD_TIMES_DATA) {
    const seatingSeriesMap = new Map();

    leadTimesData.forEach(({ series, type, image, cloudinaryPublicId }) => {
        if (!WEIGHT_RATINGS_TYPES.includes(type)) return;
        const key = String(series || '').trim();
        if (!key) return;

        if (!seatingSeriesMap.has(key)) {
            seatingSeriesMap.set(key, {
                series: key,
                slug: toWeightRatingSlug(key),
                image: image || '',
                cloudinaryPublicId: cloudinaryPublicId || '',
                supportedTypes: new Set([type]),
                weightLimit: WEIGHT_LIMIT_LBS,
                failureTestLbs: WEIGHT_FAILURE_TEST_LBS
            });
            return;
        }

        const existing = seatingSeriesMap.get(key);
        existing.supportedTypes.add(type);
        if (!existing.image && image) existing.image = image;
        if (!existing.cloudinaryPublicId && cloudinaryPublicId) existing.cloudinaryPublicId = cloudinaryPublicId;
    });

    return Array
        .from(seatingSeriesMap.values())
        .map((item) => ({
            ...item,
            supportedTypes: Array.from(item.supportedTypes).sort()
        }))
        .sort((a, b) => a.series.localeCompare(b.series));
}

export const WEIGHT_RATINGS_SERIES = createWeightRatingsSeries();

export const WEIGHT_RATINGS_BIFMA_POINTS = [
    'Static load testing on seat and back structures',
    'Durability cycles for repeated commercial use',
    'Stability checks for tip resistance'
];

export const WEIGHT_RATINGS_CERTIFICATION_NOTE = `Rated to ${WEIGHT_LIMIT_LBS} lbs for applicable ANSI/BIFMA commercial seating standards. Internal validation continues beyond ${WEIGHT_FAILURE_TEST_LBS} lbs to confirm structural reserve above the published rating.`;

export const WEIGHT_RATINGS_SOURCE_LINKS = [
    {
        label: 'BIFMA Standards Overview',
        url: 'https://www.bifma.org/page/StandardsShortDesc'
    },
    {
        label: 'ANSI Accreditation (BIFMA)',
        url: 'https://www.bifma.org/page/ansi-accreditation'
    }
];
