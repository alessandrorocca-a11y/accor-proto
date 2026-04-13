import { createContext, useContext } from 'react';

/** Portal target for full-device overlays (Menu, etc.) so they are not inside the scrolling `mobile-prototype-shell__screen`. */
export const PrototypeShellOverlayPortalContext = createContext<HTMLElement | null>(null);

export function usePrototypeShellOverlayPortal(): HTMLElement | null {
  return useContext(PrototypeShellOverlayPortalContext);
}
