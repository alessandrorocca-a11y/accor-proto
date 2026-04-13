import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDevicePreviewBottomChromeTarget } from '@/context/DevicePreviewBottomChromeContext';
import './BottomTabBar.css';

const ROOT_PAD_CLASS = 'has-bottom-tab-bar';

export function BottomTabBar() {
  const devicePreviewBottomTarget = useDevicePreviewBottomChromeTarget();
  const [canBack, setCanBack] = useState(false);
  const [canForward, setCanForward] = useState(false);

  const syncHistory = useCallback(() => {
    setCanBack(window.history.length > 1);
    /* Hash-only SPA navigation rarely exposes a forward stack in session. */
    setCanForward(false);
  }, []);

  useEffect(() => {
    syncHistory();
    window.addEventListener('popstate', syncHistory);
    window.addEventListener('hashchange', syncHistory);
    return () => {
      window.removeEventListener('popstate', syncHistory);
      window.removeEventListener('hashchange', syncHistory);
    };
  }, [syncHistory]);

  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    root.classList.add(ROOT_PAD_CLASS);
    return () => root.classList.remove(ROOT_PAD_CLASS);
  }, []);

  const icon = (d: string) => (
    <svg className="bottom-tab-bar__icon" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  if (devicePreviewBottomTarget === null) {
    return null;
  }

  const bar = (
    <div
      className={`bottom-tab-bar${devicePreviewBottomTarget ? ' bottom-tab-bar--device-preview' : ''}`}
      role="toolbar"
      aria-label="Browser navigation"
    >
      <div className="bottom-tab-bar__browser-row">
        <button
          type="button"
          className="bottom-tab-bar__tool"
          aria-label="Back"
          disabled={!canBack}
          onClick={() => canBack && window.history.back()}
        >
          {icon('M15 18l-6-6 6-6')}
        </button>
        <span className="bottom-tab-bar__browser-spacer" aria-hidden />
        <button
          type="button"
          className="bottom-tab-bar__tool"
          aria-label="Forward"
          disabled={!canForward}
          onClick={() => canForward && window.history.forward()}
        >
          {icon('M9 18l6-6-6-6')}
        </button>
      </div>
    </div>
  );

  return devicePreviewBottomTarget != null ? createPortal(bar, devicePreviewBottomTarget) : bar;
}
