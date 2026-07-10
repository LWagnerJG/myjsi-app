import {
    DISCONTINUED_FINISHES,
    DISCONTINUED_FINISH_SOURCE_GROUPS,
    DISCONTINUED_FINISH_API_ENV,
    FINISH_CATEGORIES,
} from '../screens/resources/discontinued-finishes/data.js';
import { FINISH_SAMPLES } from '../screens/samples/data.js';
import { readLocalStorageJsonObject, writeLocalStorageJson } from '../utils/persistence.js';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DISCONTINUED_FINISH_CACHE_KEY = 'myjsi.discontinued-finish-cache.v1';
const CATEGORY_SWATCH_TONES = {
    'Wood Veneer': '#E7DED0',
    'Laminate': '#E4E7E9',
    'Metal': '#DDE2DF',
};

const categoryOrder = new Map(FINISH_CATEGORIES.map((category, index) => [category, index]));

const normalizeArchiveDate = (value) => {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    if (/^\d{4}-\d{2}$/.test(value)) return value;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';

    const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
    const day = `${parsed.getDate()}`.padStart(2, '0');
    return `${parsed.getFullYear()}-${month}-${day}`;
};

const getMonthKey = (value) => {
    const normalizedDate = normalizeArchiveDate(value);
    if (!normalizedDate) return '';
    return normalizedDate.slice(0, 7);
};

const formatArchiveDate = (value) => {
    const normalizedDate = normalizeArchiveDate(value);
    if (!normalizedDate) return '';

    const [year, month, day] = normalizedDate.split('-');
    if (day) {
        return `${MONTH_LABELS[Number(month) - 1]} ${Number(day)}, ${year}`;
    }

    return `${MONTH_LABELS[Number(month) - 1]} ${year}`;
};

const formatLongMonthYear = (value) => {
    const monthValue = getMonthKey(value);
    if (!monthValue) return '';

    const [year, month] = monthValue.split('-');
    return `${MONTH_LABELS[Number(month) - 1]} ${year}`;
};

const createSampleIndex = () => new Map(
    FINISH_SAMPLES.map((sample) => [(sample.name || '').trim().toLowerCase(), sample])
);

const createSourceMap = (sources) => new Map((sources || []).map((source) => [source.id, source]));

const buildRecords = (records, sources) => {
    const sampleIndex = createSampleIndex();
    const sourceMap = createSourceMap(sources);

    return (records || [])
        .map((record, index) => {
            const category = FINISH_CATEGORIES.includes(record.category) ? record.category : 'Other';
            const replacementSample = sampleIndex.get((record.newName || '').trim().toLowerCase()) || null;
            const sourceIds = Array.isArray(record.sourceIds) && record.sourceIds.length
                ? record.sourceIds
                : DISCONTINUED_FINISH_SOURCE_GROUPS.map((source) => source.id).slice(0, 1);
            const archiveDate = normalizeArchiveDate(
                record.effectiveOn || record.discontinuedOn || record.discontinuedMonth || record.discontinuedDate
            );
            const discontinuedMonth = getMonthKey(archiveDate);
            const sourceLabels = sourceIds.map((sourceId) => sourceMap.get(sourceId)?.shortLabel || sourceMap.get(sourceId)?.label).filter(Boolean);

            return {
                id: record.id || `discontinued-finish-${index + 1}`,
                oldName: record.oldName,
                newName: record.newName,
                category,
                sourceIndex: index,
                labReference: record.lab || record.labReference || '',
                archiveDate,
                discontinuedMonth,
                discontinuedLabel: formatArchiveDate(archiveDate),
                sourceSection: record.sourceSection || '',
                sourceCodes: Array.isArray(record.sourceCodes) ? record.sourceCodes : [],
                sourceCodesSummary: Array.isArray(record.sourceCodes) ? record.sourceCodes.join(' / ') : '',
                replacementImage: record.replacementImage || replacementSample?.image || replacementSample?.webp || '',
                replacementSampleId: replacementSample?.id || null,
                replacementCode: replacementSample?.code || '',
                legacySwatchTone: record.legacySwatchTone || CATEGORY_SWATCH_TONES[category] || '#E5E5E5',
                sourceIds,
                sourceLabels,
                sourceSummary: sourceLabels.join(', '),
            };
        })
        .sort((left, right) => {
            const categoryDelta = (categoryOrder.get(left.category) ?? 999) - (categoryOrder.get(right.category) ?? 999);
            if (categoryDelta !== 0) return categoryDelta;
            return left.sourceIndex - right.sourceIndex;
        });
};

const buildSummary = (records, sourceMode, syncedAt, sources) => {
    const datedRecords = records
        .filter((record) => record.discontinuedMonth)
        .map((record) => record.discontinuedMonth)
        .sort((left, right) => left.localeCompare(right));
    const oldest = datedRecords[0] || '';
    const newest = datedRecords[datedRecords.length - 1] || '';
    const sourceLabel = sourceMode === 'api'
        ? 'Live API'
        : sourceMode === 'cache'
            ? 'Cached API'
            : sources?.[0]?.shortLabel || 'Local archive';

    return {
        totalRecords: records.length,
        oldestDateLabel: formatArchiveDate(oldest),
        newestDateLabel: formatArchiveDate(newest),
        sourceLabel,
        syncedAtLabel: syncedAt ? formatLongMonthYear(syncedAt) : '',
    };
};

const createDataset = ({ records, sources, sourceMode = 'local', syncedAt = '' }) => {
    const normalizedSources = Array.isArray(sources) && sources.length ? sources : DISCONTINUED_FINISH_SOURCE_GROUPS;
    const normalizedRecords = buildRecords(records, normalizedSources);

    return {
        records: normalizedRecords,
        sources: normalizedSources,
        categoryOrder: FINISH_CATEGORIES,
        sourceMode,
        summary: buildSummary(normalizedRecords, sourceMode, syncedAt, normalizedSources),
    };
};

const readCachedPayload = () => {
    const cached = readLocalStorageJsonObject(DISCONTINUED_FINISH_CACHE_KEY, null);
    return cached && typeof cached === 'object' ? cached : null;
};

const writeCachedPayload = (payload) => {
    writeLocalStorageJson(DISCONTINUED_FINISH_CACHE_KEY, payload);
};

const normalizePayload = (payload, sourceMode, syncedAt = '') => {
    if (Array.isArray(payload)) {
        return createDataset({ records: payload, sources: DISCONTINUED_FINISH_SOURCE_GROUPS, sourceMode, syncedAt });
    }

    return createDataset({
        records: payload?.records || [],
        sources: payload?.sources || DISCONTINUED_FINISH_SOURCE_GROUPS,
        sourceMode,
        syncedAt: syncedAt || payload?.syncedAt || payload?.updatedAt || payload?.fetchedAt || '',
    });
};

export const getDiscontinuedFinishesSeed = () => createDataset({
    records: DISCONTINUED_FINISHES,
    sources: DISCONTINUED_FINISH_SOURCE_GROUPS,
    sourceMode: 'local',
    syncedAt: DISCONTINUED_FINISH_SOURCE_GROUPS[0]?.capturedAt || '',
});

export const loadDiscontinuedFinishes = async () => {
    const apiUrl = import.meta.env.VITE_DISCONTINUED_FINISHES_API_URL?.trim();
    if (!apiUrl) {
        return getDiscontinuedFinishesSeed();
    }

    try {
        const response = await fetch(apiUrl, {
            headers: {
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to load discontinued finishes (${response.status})`);
        }

        const payload = await response.json();
        writeCachedPayload({ payload, cachedAt: new Date().toISOString() });
        return normalizePayload(payload, 'api', new Date().toISOString());
    } catch (error) {
        const cachedPayload = readCachedPayload();
        if (cachedPayload?.payload) {
            console.warn('[DiscontinuedFinishes] Falling back to cached API data.', error);
            return normalizePayload(cachedPayload.payload, 'cache', cachedPayload.cachedAt || '');
        }

        console.warn(`[DiscontinuedFinishes] ${DISCONTINUED_FINISH_API_ENV} is not configured or fetch failed. Using local archive data.`, error);
        return getDiscontinuedFinishesSeed();
    }
};