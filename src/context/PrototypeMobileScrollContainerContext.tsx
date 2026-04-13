import { createContext, useContext } from 'react';

/** Scroll container for mobile prototype shell (`mobile-prototype-shell__screen`). Null when prototype is off or outside the shell. */
export const PrototypeMobileScrollContainerContext = createContext<HTMLElement | null>(null);

export function usePrototypeMobileScrollContainer(): HTMLElement | null {
  return useContext(PrototypeMobileScrollContainerContext);
}
