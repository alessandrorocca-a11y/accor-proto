import { createContext, useContext } from 'react';

/**
 * Mount node for BottomTabBar inside the device preview: below the scroll viewport
 * so browser chrome stays pinned to the bottom of the phone glass.
 *
 * - `undefined`: not inside DevicePreviewFrame (render the bar as fixed to the window).
 * - `null`: slot not mounted yet (render nothing briefly to avoid a misplaced fixed bar).
 * - `HTMLElement`: portal target ready.
 */
export const DevicePreviewBottomChromeTargetContext = createContext<
  HTMLElement | null | undefined
>(undefined);

export function useDevicePreviewBottomChromeTarget(): HTMLElement | null | undefined {
  return useContext(DevicePreviewBottomChromeTargetContext);
}
