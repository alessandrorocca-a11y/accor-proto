import { createContext, useContext } from 'react';

/**
 * Mount node for {@link MarketplaceHeader} in the mobile prototype: a fixed strip between the
 * fake status bar and the scrolling `mobile-prototype-shell__screen` (not inside the scroll area).
 */
export const PrototypeNavChromePortalContext = createContext<HTMLElement | null>(null);

export function usePrototypeNavChromePortal(): HTMLElement | null {
  return useContext(PrototypeNavChromePortalContext);
}
