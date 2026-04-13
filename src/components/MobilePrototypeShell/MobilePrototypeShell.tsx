import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { PrototypeMobileScrollContainerContext } from '@/context/PrototypeMobileScrollContainerContext';
import { PrototypeNavChromePortalContext } from '@/context/PrototypeNavChromePortalContext';
import { PrototypeShellOverlayPortalContext } from '@/context/PrototypeShellOverlayPortalContext';
import { usePrototypePreview } from '@/context/PrototypePreviewContext';
import './MobilePrototypeShell.css';

const MOBILE_MAX = '(max-width: 1023px)';
const IOS_SCROLL_TOP_SHOW = 36;
const IOS_SCROLL_DELTA = 10;
const DRAG_SCROLL_THRESHOLD_PX = 8;

const INTERACTIVE_DRAG_SKIP =
  'a, button, input, textarea, select, label, summary, [role="button"], [role="link"], [role="checkbox"], [role="switch"], [role="slider"], [role="menuitem"], [role="option"], [role="tab"], [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

/** Home (and similar) horizontal strips: mouse-drag must scroll this row, not only the shell vertically. */
const HORIZONTAL_SCROLL_STRIP_SELECTOR =
  '.home-page__scroll, .city-page__scroll, .linkout__recommendations-scroll';

function AndroidStatusBar() {
  return (
    <div className="mobile-prototype-shell__status-bar mobile-prototype-shell__status-bar--android" aria-hidden>
      <span className="mobile-prototype-shell__status-time">9:41</span>
      <div className="mobile-prototype-shell__status-icons">
        <svg className="mobile-prototype-shell__status-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"
            fill="currentColor"
          />
        </svg>
        <svg className="mobile-prototype-shell__status-icon mobile-prototype-shell__status-battery" width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden>
          <rect x="1" y="2" width="8" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <path d="M3 1.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <rect x="2.5" y="4" width="5" height="7" rx="0.5" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

function IosSystemBar({ collapsed }: { collapsed: boolean }) {
  const [canBack, setCanBack] = useState(false);
  const [canFwd, setCanFwd] = useState(false);

  useEffect(() => {
    const sync = () => {
      setCanBack(window.history.length > 1);
      setCanFwd(false);
    };
    sync();
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  const icon = (d: string) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div
      className={`mobile-prototype-shell__ios-bar${collapsed ? ' mobile-prototype-shell__ios-bar--hidden' : ''}`}
      aria-hidden={collapsed}
    >
      <div className="mobile-prototype-shell__ios-tools">
        <button
          type="button"
          className="mobile-prototype-shell__ios-tool"
          aria-label="Back"
          disabled={!canBack}
          onClick={() => canBack && window.history.back()}
        >
          {icon('M15 18l-6-6 6-6')}
        </button>
        <button
          type="button"
          className="mobile-prototype-shell__ios-tool"
          aria-label="Forward"
          disabled={!canFwd}
          onClick={() => canFwd && window.history.forward()}
        >
          {icon('M9 18l6-6-6-6')}
        </button>
        <button type="button" className="mobile-prototype-shell__ios-tool" aria-label="Share (prototype)" disabled>
          {icon('M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13')}
        </button>
        <button type="button" className="mobile-prototype-shell__ios-tool" aria-label="Bookmarks (prototype)" disabled>
          {icon('M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20l-7-4-7 4V2z')}
        </button>
        <button type="button" className="mobile-prototype-shell__ios-tool" aria-label="Tabs (prototype)" disabled>
          {icon('M4 6h16M4 12h16M4 18h7')}
        </button>
      </div>
      <div className="mobile-prototype-shell__ios-home-indicator" aria-hidden />
    </div>
  );
}

function AndroidSystemBar() {
  return (
    <div className="mobile-prototype-shell__android-bar">
      <button
        type="button"
        className="mobile-prototype-shell__android-btn"
        aria-label="Back"
        onClick={() => window.history.back()}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        className="mobile-prototype-shell__android-btn"
        aria-label="Home"
        onClick={() => {
          window.location.hash = '';
          window.scrollTo(0, 0);
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
      <button type="button" className="mobile-prototype-shell__android-btn" aria-label="Overview (prototype)" disabled>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M9 9h6M9 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function MobilePrototypeShell({ children }: { children: ReactNode }) {
  const { mobilePlatform } = usePrototypePreview();
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_MAX).matches : false,
  );
  const [iosToolbarCollapsed, setIosToolbarCollapsed] = useState(false);
  const [prototypeScrollContainerEl, setPrototypeScrollContainerEl] = useState<HTMLDivElement | null>(null);
  const [prototypeNavChromeEl, setPrototypeNavChromeEl] = useState<HTMLDivElement | null>(null);
  const [prototypeDeviceEl, setPrototypeDeviceEl] = useState<HTMLDivElement | null>(null);
  const screenRef = useRef<HTMLDivElement | null>(null);
  const lastScrollTop = useRef(0);

  const setScreenRef = useCallback((node: HTMLDivElement | null) => {
    screenRef.current = node;
    setPrototypeScrollContainerEl(node);
  }, []);

  const setNavChromeRef = useCallback((node: HTMLDivElement | null) => {
    setPrototypeNavChromeEl(node);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MAX);
    const onChange = () => setIsMobileViewport(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (mobilePlatform === 'off') return;
    document.body.classList.add('prototype-mobile-frame');
    return () => document.body.classList.remove('prototype-mobile-frame');
  }, [mobilePlatform]);

  useEffect(() => {
    setIosToolbarCollapsed(false);
    lastScrollTop.current = 0;
  }, [mobilePlatform]);

  useLayoutEffect(() => {
    if (mobilePlatform !== 'ios' || !screenRef.current) return;
    lastScrollTop.current = screenRef.current.scrollTop;
  }, [mobilePlatform]);

  useEffect(() => {
    if (mobilePlatform !== 'ios') return;
    const el = screenRef.current;
    if (!el) return;

    const onScroll = () => {
      const st = el.scrollTop;
      const delta = st - lastScrollTop.current;
      lastScrollTop.current = st;

      if (st <= IOS_SCROLL_TOP_SHOW) {
        setIosToolbarCollapsed(false);
        return;
      }
      if (delta > IOS_SCROLL_DELTA) {
        setIosToolbarCollapsed(true);
      } else if (delta < -IOS_SCROLL_DELTA) {
        setIosToolbarCollapsed(false);
      }
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [mobilePlatform, prototypeScrollContainerEl]);

  useEffect(() => {
    if (mobilePlatform !== 'ios') return;
    const onHash = () => {
      setIosToolbarCollapsed(false);
      requestAnimationFrame(() => {
        lastScrollTop.current = screenRef.current?.scrollTop ?? 0;
      });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [mobilePlatform]);

  /** Touch: native pan-y + touch scrolling. Mouse: click-drag to scroll (desktop prototype testing). */
  useEffect(() => {
    if (mobilePlatform === 'off') return;
    const el = screenRef.current;
    if (!el) return;

    let activePointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let scrollStart = 0;
    let scrollLeftStart = 0;
    let dragging = false;
    let dragAxis: 'vertical' | 'horizontal' | null = null;
    let horizontalStripEl: HTMLElement | null = null;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest(INTERACTIVE_DRAG_SKIP)) return;

      activePointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      scrollStart = el.scrollTop;
      dragging = false;
      dragAxis = null;
      horizontalStripEl = (t?.closest(HORIZONTAL_SCROLL_STRIP_SELECTOR) as HTMLElement | null) ?? null;
      scrollLeftStart = horizontalStripEl?.scrollLeft ?? 0;
      /* Do not setPointerCapture here — it steals events from children and breaks clicks.
         Capture only after we know the user is dragging (see pointermove). */
    };

    const onPointerMove = (e: PointerEvent) => {
      if (activePointerId === null || e.pointerId !== activePointerId) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!dragging) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < DRAG_SCROLL_THRESHOLD_PX) return;
        if (horizontalStripEl && Math.abs(dx) > Math.abs(dy)) {
          dragAxis = 'horizontal';
        } else {
          dragAxis = 'vertical';
        }
        dragging = true;
        el.classList.add('mobile-prototype-shell__screen--dragging');
        try {
          if (dragAxis === 'horizontal' && horizontalStripEl) {
            horizontalStripEl.setPointerCapture(e.pointerId);
          } else {
            el.setPointerCapture(e.pointerId);
          }
        } catch {
          /* ignore */
        }
      }

      e.preventDefault();
      if (dragAxis === 'horizontal' && horizontalStripEl) {
        horizontalStripEl.scrollLeft = scrollLeftStart - dx;
        return;
      }
      el.scrollTop = scrollStart - dy;
    };

    const onPointerEnd = (e: PointerEvent) => {
      if (activePointerId === null || e.pointerId !== activePointerId) return;
      if (dragging) {
        try {
          if (dragAxis === 'horizontal' && horizontalStripEl) {
            horizontalStripEl.releasePointerCapture(e.pointerId);
          } else {
            el.releasePointerCapture(e.pointerId);
          }
        } catch {
          /* ignore */
        }
        el.classList.remove('mobile-prototype-shell__screen--dragging');
      }
      activePointerId = null;
      dragging = false;
      dragAxis = null;
      horizontalStripEl = null;
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove, { passive: false });
    el.addEventListener('pointerup', onPointerEnd);
    el.addEventListener('pointercancel', onPointerEnd);

    return () => {
      el.classList.remove('mobile-prototype-shell__screen--dragging');
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerEnd);
      el.removeEventListener('pointercancel', onPointerEnd);
    };
  }, [mobilePlatform, prototypeScrollContainerEl]);

  if (mobilePlatform === 'off') {
    return <>{children}</>;
  }

  const fullBleed = isMobileViewport;

  const shellClass =
    `mobile-prototype-shell mobile-prototype-shell--${mobilePlatform}` +
    (mobilePlatform === 'ios' && iosToolbarCollapsed ? ' mobile-prototype-shell--ios-toolbar-hidden' : '');

  const setDeviceRef = useCallback((node: HTMLDivElement | null) => {
    setPrototypeDeviceEl(node);
  }, []);

  return (
    <PrototypeShellOverlayPortalContext.Provider value={prototypeDeviceEl}>
      <div className={shellClass}>
        <div
          ref={setDeviceRef}
          className={
            fullBleed
              ? 'mobile-prototype-shell__device mobile-prototype-shell__device--full-bleed'
              : 'mobile-prototype-shell__device'
          }
        >
          {mobilePlatform === 'android' ? <AndroidStatusBar /> : null}
          <div ref={setNavChromeRef} className="mobile-prototype-shell__nav-chrome" />
          <div ref={setScreenRef} className="mobile-prototype-shell__screen">
            <PrototypeMobileScrollContainerContext.Provider value={prototypeScrollContainerEl}>
              <PrototypeNavChromePortalContext.Provider value={prototypeNavChromeEl}>
                {children}
              </PrototypeNavChromePortalContext.Provider>
            </PrototypeMobileScrollContainerContext.Provider>
          </div>
          {mobilePlatform === 'ios' ? <IosSystemBar collapsed={iosToolbarCollapsed} /> : <AndroidSystemBar />}
        </div>
      </div>
    </PrototypeShellOverlayPortalContext.Provider>
  );
}
