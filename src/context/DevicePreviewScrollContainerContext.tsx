import { createContext, useContext } from 'react';

/**
 * Scroll container for the iPhone device preview (`device-preview-frame__viewport`).
 * When set, MarketplaceHeader hide-on-scroll listens here instead of `window`.
 */
export const DevicePreviewScrollContainerContext = createContext<HTMLElement | null>(null);

export function useDevicePreviewScrollContainer(): HTMLElement | null {
  return useContext(DevicePreviewScrollContainerContext);
}
