const OPEN_EVENT = 'myjsi:spotlight-menu-open';

/** Ensure only one Spotlight/combobox menu is open at a time. */
export const claimSpotlightMenu = (menuId, onForceClose) => {
  if (typeof window === 'undefined') return () => {};

  const handler = (event) => {
    if (event.detail?.menuId !== menuId) onForceClose();
  };

  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
};

export const announceSpotlightMenuOpen = (menuId) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { menuId } }));
};
