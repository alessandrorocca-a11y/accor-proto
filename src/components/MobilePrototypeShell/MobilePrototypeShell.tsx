import { useEffect, useState, type ReactNode } from 'react';
import { usePrototypePreview } from '@/context/PrototypePreviewContext';
import './MobilePrototypeShell.css';

const MOBILE_MAX = '(max-width: 1023px)';

function IosSystemBar() {
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
    <div className="mobile-prototype-shell__ios-bar">
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

  if (mobilePlatform === 'off') {
    return <>{children}</>;
  }

  const fullBleed = isMobileViewport;

  return (
    <div className={`mobile-prototype-shell mobile-prototype-shell--${mobilePlatform}`}>
      <div
        className={
          fullBleed
            ? 'mobile-prototype-shell__device mobile-prototype-shell__device--full-bleed'
            : 'mobile-prototype-shell__device'
        }
      >
        <div className="mobile-prototype-shell__screen">{children}</div>
        {mobilePlatform === 'ios' ? <IosSystemBar /> : <AndroidSystemBar />}
      </div>
    </div>
  );
}
