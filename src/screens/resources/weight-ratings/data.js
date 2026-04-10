import { LEAD_TIMES_DATA } from '../lead-times/data.js';

export const WEIGHT_LIMIT_LBS = 275;
export const WEIGHT_FAILURE_TEST_LBS = 450;
export const WEIGHT_RATINGS_ROUTE = 'resources/weight-ratings';
export const WEIGHT_RATINGS_TYPES = ['Seating', 'Upholstery', 'Wood Seating'];
export const WEIGHT_RATINGS_FALLBACK_IMAGE = '/myjsi-icon.png';

const toSlug = (value) => (
    value
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
);

const seatingSeriesMap = new Map();

LEAD_TIMES_DATA.forEach(({ series, type, image }) => {
    if (!WEIGHT_RATINGS_TYPES.includes(type)) return;
    const key = series.trim();
    if (!seatingSeriesMap.has(key)) {
        seatingSeriesMap.set(key, {
            series: key,
            slug: toSlug(key),
            image: image || WEIGHT_RATINGS_FALLBACK_IMAGE,
            supportedTypes: new Set([type]),
            weightLimit: WEIGHT_LIMIT_LBS
        });
        return;
    }

    const existing = seatingSeriesMap.get(key);
    existing.supportedTypes.add(type);
    if (!existing.image && image) existing.image = image;
});

export const WEIGHT_RATINGS_SERIES = Array
    .from(seatingSeriesMap.values())
    .map((item) => ({
        ...item,
        supportedTypes: Array.from(item.supportedTypes).sort()
    }))
    .sort((a, b) => a.series.localeCompare(b.series));

export const WEIGHT_RATINGS_BIFMA_POINTS = [
    'Seat and back static load checks',
    'Durability cycle testing for repeated daily use',
    'Stability checks to reduce tip-over risk'
];

export const WEIGHT_RATINGS_CERTIFICATION_NOTE = `JSI certifies these seating models to applicable ANSI/BIFMA commercial standards at ${WEIGHT_LIMIT_LBS} lbs, then continues internal load testing through failure beyond ${WEIGHT_FAILURE_TEST_LBS} lbs to understand structural reserve above the certification threshold.`;

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
