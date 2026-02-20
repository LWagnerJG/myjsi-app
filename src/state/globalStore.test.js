import { describe, it, expect, beforeEach } from 'vitest';
import { useGlobalStore, getState, setState, updateCartItem, useGlobalState } from './globalStore.js';

describe('globalStore (Zustand)', () => {
    beforeEach(() => {
        // Reset cart to empty state before each test (merge mode preserves actions)
        useGlobalStore.setState({ cart: {} });
    });

    describe('initial state', () => {
        it('starts with an empty cart', () => {
            expect(getState().cart).toEqual({});
        });
    });

    describe('updateCartItem', () => {
        it('adds an item to the cart', () => {
            updateCartItem('item1', 1);
            expect(getState().cart).toEqual({ item1: 1 });
        });

        it('increments an existing item', () => {
            updateCartItem('item1', 1);
            updateCartItem('item1', 2);
            expect(getState().cart).toEqual({ item1: 3 });
        });

        it('removes an item when quantity reaches 0', () => {
            updateCartItem('item1', 3);
            updateCartItem('item1', -3);
            expect(getState().cart).toEqual({});
        });

        it('does not go below 0', () => {
            updateCartItem('item1', 1);
            updateCartItem('item1', -5);
            expect(getState().cart).toEqual({});
        });

        it('handles multiple items independently', () => {
            updateCartItem('a', 2);
            updateCartItem('b', 3);
            updateCartItem('a', 1);
            expect(getState().cart).toEqual({ a: 3, b: 3 });
        });
    });

    describe('setState', () => {
        it('merges partial state', () => {
            setState({ cart: { x: 5 } });
            expect(getState().cart).toEqual({ x: 5 });
        });

        it('accepts an updater function', () => {
            setState({ cart: { x: 1 } });
            setState((prev) => ({ cart: { ...prev.cart, y: 2 } }));
            expect(getState().cart).toEqual({ x: 1, y: 2 });
        });
    });

    describe('useGlobalState', () => {
        it('is a function (hook reference)', () => {
            expect(typeof useGlobalState).toBe('function');
        });
    });
});
