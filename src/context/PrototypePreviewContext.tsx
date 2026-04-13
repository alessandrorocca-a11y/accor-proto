import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type MobilePrototypePlatform = 'off' | 'ios' | 'android';

const STORAGE_KEY = 'accor-prototype-mobile-platform';

function readStoredPlatform(): MobilePrototypePlatform {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s === 'ios' || s === 'android' || s === 'off') return s;
  } catch {
    /* ignore */
  }
  return 'off';
}

interface PrototypePreviewContextValue {
  mobilePlatform: MobilePrototypePlatform;
  setMobilePlatform: (p: MobilePrototypePlatform) => void;
}

const PrototypePreviewContext = createContext<PrototypePreviewContextValue | null>(null);

export function PrototypePreviewProvider({ children }: { children: ReactNode }) {
  const [mobilePlatform, setMobilePlatformState] = useState<MobilePrototypePlatform>(readStoredPlatform);

  const setMobilePlatform = useCallback((p: MobilePrototypePlatform) => {
    setMobilePlatformState(p);
    try {
      localStorage.setItem(STORAGE_KEY, p);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ mobilePlatform, setMobilePlatform }),
    [mobilePlatform, setMobilePlatform],
  );

  return <PrototypePreviewContext.Provider value={value}>{children}</PrototypePreviewContext.Provider>;
}

export function usePrototypePreview(): PrototypePreviewContextValue {
  const ctx = useContext(PrototypePreviewContext);
  if (!ctx) {
    throw new Error('usePrototypePreview must be used within PrototypePreviewProvider');
  }
  return ctx;
}
