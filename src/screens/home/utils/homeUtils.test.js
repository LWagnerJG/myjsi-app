import { describe, it, expect } from 'vitest';
import {
    getAppBadge,
    MIN_PINNED_APPS,
    MAX_PINNED_APPS,
    NON_REMOVABLE_APPS,
    EXCLUDED_ROUTES,
    areArraysEqual,
    getCommunityAuthorSafe,
    getCommunityTextSafe,
} from './homeUtils.js';

describe('homeUtils', () => {
    describe('getAppBadge', () => {
        it('returns open order count for orders route', () => {
            const orders = [
                { status: 'In Production', net: 100 },
                { status: 'Delivered', net: 200 },
                { status: 'Shipping', net: 300 },
            ];
            const badge = getAppBadge('orders', orders, [], [], 0);
            expect(badge).toEqual({ value: '2', label: 'Open', color: '#5B7B8C' });
        });

        it('returns null for orders when all delivered', () => {
            const orders = [{ status: 'Delivered' }, { status: 'Cancelled' }];
            expect(getAppBadge('orders', orders, [], [], 0)).toBeNull();
        });

        it('returns formatted YTD for sales route', () => {
            const orders = [
                { net: 500000 },
                { net: 700000 },
            ];
            const badge = getAppBadge('sales', orders, [], [], 0);
            expect(badge).toEqual({ value: '$1.2M', label: 'YTD', color: '#4A7C59' });
        });

        it('returns K format for smaller sales amounts', () => {
            const orders = [{ net: 75000 }];
            const badge = getAppBadge('sales', orders, [], [], 0);
            expect(badge).toEqual({ value: '$75K', label: 'YTD', color: '#4A7C59' });
        });

        it('returns post count for community route', () => {
            const posts = [{}, {}, {}];
            const badge = getAppBadge('community', [], posts, [], 0);
            expect(badge).toEqual({ value: '3', label: 'Posts', color: '#C4956A' });
        });

        it('returns cart count for samples route', () => {
            const badge = getAppBadge('samples', [], [], [], 5);
            expect(badge).toEqual({ value: '5', label: 'In Cart', color: '#C4956A' });
        });

        it('returns null for samples with empty cart', () => {
            expect(getAppBadge('samples', [], [], [], 0)).toBeNull();
        });

        it('returns null for unknown routes', () => {
            expect(getAppBadge('settings', [], [], [], 0)).toBeNull();
        });
    });

    describe('areArraysEqual', () => {
        it('returns true for identical references', () => {
            const arr = [1, 2, 3];
            expect(areArraysEqual(arr, arr)).toBe(true);
        });

        it('returns true for equal arrays', () => {
            expect(areArraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
        });

        it('returns false for different lengths', () => {
            expect(areArraysEqual([1, 2], [1, 2, 3])).toBe(false);
        });

        it('returns false for different elements', () => {
            expect(areArraysEqual([1, 2, 3], [1, 4, 3])).toBe(false);
        });

        it('returns false for non-array inputs', () => {
            expect(areArraysEqual(null, [1])).toBe(false);
            expect(areArraysEqual([1], 'string')).toBe(false);
        });

        it('returns true for two empty arrays', () => {
            expect(areArraysEqual([], [])).toBe(true);
        });
    });

    describe('getCommunityAuthorSafe', () => {
        it('returns "Community" for null/undefined', () => {
            expect(getCommunityAuthorSafe(null)).toBe('Community');
            expect(getCommunityAuthorSafe(undefined)).toBe('Community');
        });

        it('returns user string directly', () => {
            expect(getCommunityAuthorSafe({ user: 'Alice' })).toBe('Alice');
        });

        it('returns name field', () => {
            expect(getCommunityAuthorSafe({ name: 'Bob' })).toBe('Bob');
        });

        it('returns author field', () => {
            expect(getCommunityAuthorSafe({ author: 'Charlie' })).toBe('Charlie');
        });

        it('returns user.name when user is an object', () => {
            expect(getCommunityAuthorSafe({ user: { name: 'Dave' } })).toBe('Dave');
        });

        it('concatenates user firstName and lastName', () => {
            expect(getCommunityAuthorSafe({ user: { firstName: 'John', lastName: 'Doe' } })).toBe('John Doe');
        });

        it('returns "Community" when no known fields present', () => {
            expect(getCommunityAuthorSafe({ id: 1 })).toBe('Community');
        });
    });

    describe('getCommunityTextSafe', () => {
        it('returns "New update available" for null/undefined', () => {
            expect(getCommunityTextSafe(null)).toBe('New update available');
        });

        it('returns text field', () => {
            expect(getCommunityTextSafe({ text: 'Hello world' })).toBe('Hello world');
        });

        it('returns content field', () => {
            expect(getCommunityTextSafe({ content: 'Some content' })).toBe('Some content');
        });

        it('returns message field', () => {
            expect(getCommunityTextSafe({ message: 'A message' })).toBe('A message');
        });

        it('returns title field as fallback', () => {
            expect(getCommunityTextSafe({ title: 'A title' })).toBe('A title');
        });

        it('returns default for empty object', () => {
            expect(getCommunityTextSafe({ id: 1 })).toBe('New update available');
        });
    });

    describe('constants', () => {
        it('MIN_PINNED_APPS is 3', () => {
            expect(MIN_PINNED_APPS).toBe(3);
        });

        it('MAX_PINNED_APPS is 12', () => {
            expect(MAX_PINNED_APPS).toBe(12);
        });

        it('resources is non-removable', () => {
            expect(NON_REMOVABLE_APPS.has('resources')).toBe(true);
        });

        it('settings is excluded from home', () => {
            expect(EXCLUDED_ROUTES.has('settings')).toBe(true);
        });
    });
});
