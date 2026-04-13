import { useState, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Avatar, IconHeart } from '@/components/atoms';
import { useDevicePreviewScrollContainer } from '@/context/DevicePreviewScrollContainerContext';
import { usePrototypeMobileScrollContainer } from '@/context/PrototypeMobileScrollContainerContext';
import { usePrototypeNavChromePortal } from '@/context/PrototypeNavChromePortalContext';
import { Search, SearchResultsPanel } from '@/components/molecules/Search/Search';
import allAccorLogo from '@/assets/all-accor-logo.svg';

/** Payment / offer type label (e.g. Instant purchase, Auction) */
export type PaymentLabelType =
  | 'Instant purchase'
  | 'Auction'
  | 'Prize draw'
  | 'Waitlist'
  | 'Linkout';

/** Event / experience category label */
export type EventLabelType =
  | 'Sustainable experience'
  | 'Fever Original'
  | 'Limitless experience'
  | 'Brand Hotel experience'
  | string;

/** Loyalty tier for points badge styling */
export type LoyaltyTier = 'classic' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface MarketplaceHeaderProps {
  /** Light or dark theme */
  theme?: 'light' | 'dark';
  /** Logged-in state: show points badge, avatar, menu */
  isLoggedIn?: boolean;
  /** Points to show in badge when logged in */
  points?: number;
  /** Loyalty tier (menu / profile; points badge uses unified marketplace styling) */
  loyaltyTier?: LoyaltyTier;
  /** Avatar image URL when logged in */
  avatarSrc?: string | null;
  /** Payment/offer label below or near title */
  paymentLabel?: PaymentLabelType | string;
  /** Event/experience label */
  eventLabel?: EventLabelType;
  /** Show favourite heart; controlled */
  isFavourite?: boolean;
  /** Logo slot (default: "ALL ACCOR" text) */
  logo?: ReactNode;
  /** Callbacks */
  onAccount?: () => void;
  onMenu?: () => void;
  onAvatarClick?: () => void;
  onFavouriteToggle?: () => void;
  onLogoClick?: () => void;
  onPointsClick?: () => void;
  /** Hide the search bar & icon (e.g. when search lives in the hero) */
  hideSearch?: boolean;
  /** When true, the header is transparent at the very top and becomes white on scroll */
  transparentOnTop?: boolean;
  /** Optional class name */
  className?: string;
}

const PAYMENT_LABELS: PaymentLabelType[] = [
  'Instant purchase',
  'Auction',
  'Prize draw',
  'Waitlist',
  'Linkout',
];

function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 19a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM21 21l-4.35-4.35"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconAccount({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMenu({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconStar({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M7.64903 4.06886C7.7899 3.77365 8.21012 3.77365 8.35099 4.06886L9.25318 5.95956C9.30987 6.07836 9.42282 6.16043 9.55334 6.17763L11.6303 6.45141C11.9546 6.49416 12.0844 6.89381 11.8472 7.11901L10.3278 8.5613C10.2324 8.65194 10.1892 8.78472 10.2132 8.91416L10.5946 10.9741C10.6542 11.2957 10.3142 11.5427 10.0267 11.3867L8.18552 10.3873C8.06982 10.3246 7.9302 10.3246 7.8145 10.3873L5.97329 11.3867C5.68581 11.5427 5.34584 11.2957 5.4054 10.9741L5.78683 8.91416C5.8108 8.78472 5.76766 8.65194 5.67218 8.5613L4.15282 7.11901C3.91559 6.89381 4.04544 6.49416 4.36974 6.45141L6.44668 6.17763C6.5772 6.16043 6.69015 6.07836 6.74684 5.95956L7.64903 4.06886Z" fill="currentColor" stroke="currentColor" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function MarketplaceHeader({
  theme = 'light',
  isLoggedIn = false,
  points,
  loyaltyTier = 'gold',
  avatarSrc,
  paymentLabel,
  eventLabel,
  isFavourite = false,
  logo,
  onAccount,
  onMenu,
  onAvatarClick,
  onFavouriteToggle,
  onLogoClick,
  onPointsClick,
  hideSearch = false,
  transparentOnTop = false,
  className = '',
}: MarketplaceHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [desktopSearchActive, setDesktopSearchActive] = useState(false);
  const [desktopQuery, setDesktopQuery] = useState('');
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const headerRef = useRef<HTMLElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const desktopSearchWrapRef = useRef<HTMLDivElement>(null);
  const prototypeScrollContainer = usePrototypeMobileScrollContainer();
  const devicePreviewScrollContainer = useDevicePreviewScrollContainer();
  const prototypeNavChrome = usePrototypeNavChromePortal();

  /** Bind in layout phase so prototype scroll container from ref+state is ready before paint; avoids a frame on `window`. */
  useLayoutEffect(() => {
    if (prototypeNavChrome) {
      setHidden(false);
    }

    /** Pixels scrolled before hide-on-scroll-down applies; aligns with window scroll (no prototype chrome). */
    const WINDOW_TOP_REVEAL_PX = 8;
    /** Prototype scroll view starts below portaled nav (iOS status bar removed in shell). */
    const PROTOTYPE_TOP_REVEAL_PX = 40;

    let scrollRoot: HTMLElement | null = prototypeScrollContainer ?? devicePreviewScrollContainer;

    if (!scrollRoot && headerRef.current) {
      let el: HTMLElement | null = headerRef.current.parentElement;
      while (el) {
        if (el.scrollHeight > el.clientHeight + 1) {
          const { overflowY } = getComputedStyle(el);
          if (overflowY === 'auto' || overflowY === 'scroll') {
            scrollRoot = el;
            break;
          }
        }
        el = el.parentElement;
      }
    }

    const topRevealPx =
      prototypeScrollContainer != null ? PROTOTYPE_TOP_REVEAL_PX : WINDOW_TOP_REVEAL_PX;
    /** Ignore small downward jitter when deciding to hide; keep separate from scroll-up reveal. */
    const hideDelta = 8;

    const getScrollY = () => (scrollRoot ? scrollRoot.scrollTop : window.scrollY);

    lastScrollY.current = getScrollY();

    const handleScroll = () => {
      const currentY = getScrollY();
      const prevY = lastScrollY.current;
      setAtTop(currentY < topRevealPx);
      if (currentY < topRevealPx) {
        setHidden(false);
      } else if (currentY > prevY + hideDelta) {
        setHidden(true);
      } else if (currentY < prevY) {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };

    const target: Window | HTMLElement = scrollRoot ?? window;
    target.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => target.removeEventListener('scroll', handleScroll);
  }, [prototypeScrollContainer, devicePreviewScrollContainer, prototypeNavChrome]);

  const closeDesktopSearch = () => {
    setDesktopSearchActive(false);
    setDesktopQuery('');
  };

  useEffect(() => {
    if (!desktopSearchActive) return;
    requestAnimationFrame(() => desktopInputRef.current?.focus());
  }, [desktopSearchActive]);

  useEffect(() => {
    if (!desktopSearchActive) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopSearchWrapRef.current && !desktopSearchWrapRef.current.contains(e.target as Node)) {
        closeDesktopSearch();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDesktopSearch();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [desktopSearchActive]);

  const handleSearchClick = () => {
    const isDesktop =
      window.matchMedia('(min-width: 1024px)').matches && devicePreviewScrollContainer == null;
    if (isDesktop) {
      setDesktopSearchActive(true);
    } else {
      setSearchOpen(true);
    }
  };

  const logoContent = logo ?? (
    <img
      src={allAccorLogo}
      alt="ALL – Accor Live Limitless"
      className="marketplace-header__logo-img"
    />
  );

  const headerChromeClass = prototypeNavChrome ? ' marketplace-header--prototype-nav-chrome' : '';
  const headerHiddenClass = !prototypeNavChrome && hidden ? ' marketplace-header--hidden' : '';
  const prototypeBarHiddenClass =
    prototypeNavChrome && hidden ? ' marketplace-header--prototype-bar-hidden' : '';
  const headerTransparentClass = transparentOnTop && atTop ? ' marketplace-header--transparent' : '';

  const headerEl = (
    <header
      ref={headerRef}
      className={`marketplace-header marketplace-header--${theme}${headerHiddenClass}${prototypeBarHiddenClass}${headerTransparentClass}${headerChromeClass} ${className}`.trim()}
      data-logged-in={isLoggedIn}
    >
      <div className="marketplace-header__bar">
        {(onMenu || !hideSearch) && (
          <div className="marketplace-header__left-cluster">
            {onMenu && (
              <button
                type="button"
                className="marketplace-header__menu-btn"
                onClick={onMenu}
                aria-label="Menu"
              >
                <IconMenu className="marketplace-header__menu-icon" />
                <span className="marketplace-header__menu-label">MENU</span>
              </button>
            )}
            {!hideSearch && (
              <button
                type="button"
                className="marketplace-header__icon-btn"
                onClick={handleSearchClick}
                aria-label="Search"
              >
                <IconSearch />
              </button>
            )}
          </div>
        )}

        <div className="marketplace-header__logo-slot">
          {onLogoClick ? (
            <button
              type="button"
              className="marketplace-header__logo"
              onClick={onLogoClick}
              aria-label="Home"
            >
              {logoContent}
            </button>
          ) : (
            <div className="marketplace-header__logo">{logoContent}</div>
          )}
        </div>

        <div className="marketplace-header__mobile-trailing">
          {isLoggedIn && points != null && (
            onPointsClick ? (
              <button
                type="button"
                className="marketplace-header__points"
                aria-label={`${points.toLocaleString()} points`}
                onClick={onPointsClick}
              >
                <IconStar className="marketplace-header__points-icon" />
                <span className="marketplace-header__points-value">
                  {points.toLocaleString()}
                </span>
              </button>
            ) : (
              <div
                className="marketplace-header__points"
                aria-label={`${points.toLocaleString()} points`}
              >
                <IconStar className="marketplace-header__points-icon" />
                <span className="marketplace-header__points-value">
                  {points.toLocaleString()}
                </span>
              </div>
            )
          )}
          <div className="marketplace-header__icon-group">
            {!isLoggedIn && (onAccount || onMenu) && (
              <button
                type="button"
                className="marketplace-header__icon-btn"
                onClick={onMenu ?? onAccount}
                aria-label="Account"
              >
                <IconAccount />
              </button>
            )}
            {isLoggedIn && (
              <Avatar
                src={avatarSrc ?? undefined}
                alt=""
                initials={avatarSrc ? undefined : '?'}
                size="md"
                className="marketplace-header__avatar"
                onClick={onAvatarClick ?? onMenu}
                onKeyDown={
                  (onAvatarClick ?? onMenu)
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          (onAvatarClick ?? onMenu)?.();
                        }
                      }
                    : undefined
                }
                role={(onAvatarClick ?? onMenu) ? 'button' : undefined}
                tabIndex={(onAvatarClick ?? onMenu) ? 0 : undefined}
                aria-label={(onAvatarClick ?? onMenu) ? 'Open profile menu' : undefined}
                style={{ cursor: (onAvatarClick ?? onMenu) ? 'pointer' : undefined }}
              />
            )}
          </div>
        </div>

        {!hideSearch && (
          <div className="marketplace-header__center-wrap" ref={desktopSearchWrapRef}>
            <div
              className={`marketplace-header__center${desktopSearchActive ? ' marketplace-header__center--active' : ''}`}
              onClick={() => !desktopSearchActive && setDesktopSearchActive(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && !desktopSearchActive && setDesktopSearchActive(true)}
            >
              <IconSearch />
              {desktopSearchActive ? (
                <input
                  ref={desktopInputRef}
                  type="text"
                  className="marketplace-header__center-input"
                  placeholder="Find event or city"
                  value={desktopQuery}
                  onChange={(e) => setDesktopQuery(e.target.value)}
                />
              ) : (
                <span className="marketplace-header__center-placeholder">
                  Search for event name or category
                </span>
              )}
            </div>
            {desktopSearchActive && (
              <div className="marketplace-header__search-dropdown">
                <SearchResultsPanel
                  query={desktopQuery}
                  onQueryChange={setDesktopQuery}
                  onNavigate={() => {
                    setDesktopSearchActive(false);
                    setDesktopQuery('');
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {(paymentLabel || eventLabel || onFavouriteToggle) && (
        <div className="marketplace-header__labels">
          {paymentLabel && (
            <span className="marketplace-header__payment-label">{paymentLabel}</span>
          )}
          {eventLabel && (
            <span className="marketplace-header__event-label">{eventLabel}</span>
          )}
          {onFavouriteToggle && (
            <button
              type="button"
              className="marketplace-header__favourite"
              onClick={onFavouriteToggle}
              aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
              aria-pressed={isFavourite}
            >
              <IconHeart filled={isFavourite} size={32} />
            </button>
          )}
        </div>
      )}
    </header>
  );

  return (
    <>
      {prototypeNavChrome ? createPortal(headerEl, prototypeNavChrome) : headerEl}
      <Search open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export { PAYMENT_LABELS };
