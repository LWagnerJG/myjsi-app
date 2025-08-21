// Simple global store using a minimal pub/sub (could swap to Zustand later)
import { useEffect, useState } from 'react';

const listeners = new Set();
let state = {
  cart: {},
};

export const getState = () => state;

export const setState = (partial) => {
  state = { ...state, ...partial };
  listeners.forEach((l) => l(state));
};

export const updateCartItem = (id, delta) => {
  setState(({ cart }) => {
    const next = { ...cart };
    const current = next[id] || 0;
    const quantity = Math.max(0, current + delta);
    if (quantity === 0) delete next[id]; else next[id] = quantity;
    return { cart: next };
  });
};

export function useGlobalState(selector = s => s) {
  const [slice, setSlice] = useState(() => selector(state));
  useEffect(() => {
    const listener = (s) => setSlice(selector(s));
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, [selector]);
  return slice;
}
