import { create } from 'zustand';

export const useGlobalStore = create((set, get) => ({
  cart: {},
  updateCartItem: (id, delta) => set((state) => {
    const next = { ...state.cart };
    const current = next[id] || 0;
    const quantity = Math.max(0, current + delta);
    if (quantity === 0) delete next[id]; else next[id] = quantity;
    return { cart: next };
  }),
  setState: (partialOrFn) => set((state) => {
    return typeof partialOrFn === 'function' ? partialOrFn(state) : partialOrFn;
  }),
}));

export const getState = () => useGlobalStore.getState();
export const setState = (partialOrFn) => useGlobalStore.getState().setState(partialOrFn);
export const updateCartItem = (id, delta) => useGlobalStore.getState().updateCartItem(id, delta);
export const useGlobalState = (selector = s => s) => useGlobalStore(selector);

