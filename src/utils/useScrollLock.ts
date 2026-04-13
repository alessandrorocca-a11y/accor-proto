import { useEffect } from 'react';
import { useDevicePreviewScrollContainer } from '@/context/DevicePreviewScrollContainerContext';

/**
 * Disables scrolling on the main content while overlays (filter sheets, loyalty, etc.) are open.
 * In the device preview shell, the scrollable element is not `document.body`, so we target the same
 * container as Menu and Search.
 */
export function useScrollLock(locked: boolean) {
  const deviceScrollContainer = useDevicePreviewScrollContainer();

  useEffect(() => {
    if (!locked) return;
    const scrollTarget = deviceScrollContainer ?? document.body;
    const prev = scrollTarget.style.overflow;
    scrollTarget.style.overflow = 'hidden';
    return () => {
      scrollTarget.style.overflow = prev;
    };
  }, [locked, deviceScrollContainer]);
}
