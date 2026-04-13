import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  Button,
  Countdown,
  IconHeart,
  Input,
  Link,
  MarketplaceHeader,
  MarketingTag,
  Menu,
  TermsDialog,
  VoyagerBadge,
  VoyagerDialog,
  useVoyagerGate,
  YouMayAlsoLike,
} from '@/components';
import type { MenuView } from '@/components';
import { getPreviousPage } from '@/utils/navigationHistory';
import { getEventById, isVoyagerExclusiveEvent } from '@/data/events/eventRegistry';
import { RIO_SAMBADROME_MAP_IMAGE } from '@/data/events/venueData';
import { useUser } from '@/context/UserContext';
import './AuctionPage.css';

const DEFAULT_AUCTION_MS_LEFT = (21 * 24 * 60 + 5 * 60 + 34) * 60 * 1000;

const DEFAULT_HERO_IMAGES = [
  { src: '/carnival-hero.png', alt: 'Rio de Janeiro Carnival 2026' },
  { src: 'https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?w=800&h=600&fit=crop', alt: 'Sambadrome parade with colourful floats' },
  { src: 'https://images.unsplash.com/photo-1551279880-03041531948f?w=800&h=600&fit=crop', alt: 'Rio carnival dancers in costume' },
  { src: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop', alt: 'Christ the Redeemer overlooking Rio' },
  { src: 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800&h=600&fit=crop', alt: 'Copacabana beach aerial view' },
  { src: 'https://images.unsplash.com/photo-1544989164-31dc3c645987?w=800&h=600&fit=crop', alt: 'Fairmont Copacabana Palace at dusk' },
];

function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const DEFAULT_CURRENT_BID = 25000;

const DEFAULT_BID_CHIPS = [25500, 26000, 26500, 27000];

const DEFAULT_INCLUDED_ITEMS = [
  '2 tickets for 16/02',
  '2 exclusive t-shirts for 16/02',
  'Collection of kits and t-shirt customisation at Fairmont Copacabana',
  'Round-trip transfer from Jockey Club to the Sambadrome',
  'Exclusive ALL Accor lounge inside the Alma Rio Box, with premium food and beverage service and a privileged view of the parades',
  'Semi-private space in the frisa, allowing you to watch the parades even closer, with maximum comfort (new)',
  'Open Food and Premium Open Bar, live shows, beauty services and much more',
];

function formatChipPoints(n: number) {
  const k = Math.floor(n / 1000);
  const rest = n % 1000;
  return rest === 0 ? `${k}.000` : `${k}.${String(rest).padStart(3, '0')}`;
}

/** When exactly two tags are shown and one is Limitless, show Limitless first. */
function orderEventTagsForDisplay(tags: readonly string[]): string[] {
  if (tags.length !== 2) return [...tags];
  const [a, b] = tags;
  const bLimitless = /limitless/i.test(b);
  const aLimitless = /limitless/i.test(a);
  if (bLimitless && !aLimitless) return [b, a];
  return [...tags];
}

const AUCTION_HERO_EVENT_TAGS = orderEventTagsForDisplay([
  'Sustainable experience',
  'Limitless experience',
]);

function IconBell({ filled }: { filled: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? '#2D4CD5' : 'none'} aria-hidden>
      <path
        d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9ZM13.73 21a2 2 0 0 1-3.46 0"
        stroke={filled ? '#2D4CD5' : 'currentColor'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPin() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconGallery() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 16l4-4 4 4 3-3 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" />
    </svg>
  );
}

export default function AuctionPage({ eventId }: { eventId?: string }) {
  const eventData = eventId ? getEventById(eventId) : undefined;
  const {
    points: userPoints,
    loyaltyTier: userLoyaltyTier,
    isVoyagerSubscriber,
    deductPoints,
    recordAuctionBid,
    settleAuctionEnd,
  } = useUser();

  const HERO_IMAGES = eventData?.heroImages ?? DEFAULT_HERO_IMAGES;
  const AUCTION_MS_LEFT = eventData?.msLeft ?? DEFAULT_AUCTION_MS_LEFT;
  const USER_POINTS = userPoints;
  const CURRENT_BID_INIT = eventData?.currentBid ?? DEFAULT_CURRENT_BID;
  const BID_CHIPS = eventData?.bidChips ?? DEFAULT_BID_CHIPS;
  const INCLUDED_ITEMS = eventData?.includedItems ?? DEFAULT_INCLUDED_ITEMS;
  const EVENT_TITLE = eventData?.title ?? 'Rio de Janeiro Carnival 2026 – ALL Accor Lounge at the Alma Rio Box';
  const EVENT_DESCRIPTION = eventData?.description ?? 'Experience the world\'s most famous carnival from an exclusive VIP position.';
  const EVENT_LOCATION = eventData?.location ?? 'Fairmont Copacabana Palace, Rio de Janeiro';
  const EVENT_DATE = eventData?.date ?? 'February 16, 2026';

  const endDate = useMemo(
    () => new Date(Date.now() + AUCTION_MS_LEFT),
    []
  );

  const [bid, setBid] = useState('');
  const [isFavourite, setFavourite] = useState(false);
  const [showFavSnack, setShowFavSnack] = useState(false);
  const [isNotifyOn, setNotifyOn] = useState(false);
  const [showNotifySnack, setShowNotifySnack] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuInitialView, setMenuInitialView] = useState<MenuView>('navigation');
  const [loyaltyOpen, setLoyaltyOpen] = useState(false);
  const [confirmBidOpen, setConfirmBidOpen] = useState(false);
  const [showBidError, setShowBidError] = useState(false);
  const [currentBid, setCurrentBid] = useState(CURRENT_BID_INIT);
  const [bidCount, setBidCount] = useState(12);
  const [isHighestBidder, setIsHighestBidder] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const isVoyagerExclusive = isVoyagerExclusiveEvent(eventData);
  const { dialogOpen: voyagerOpen, setDialogOpen: setVoyagerOpen, gate: voyagerGate } = useVoyagerGate(isVoyagerExclusive, isVoyagerSubscriber);
  const [termsOpen, setTermsOpen] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const placeBidRef = useRef<HTMLDivElement>(null);
  const notifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const favTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bidErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAuctionEnd = useCallback(() => {
    setAuctionEnded(true);
    if (eventData?.id) settleAuctionEnd(eventData.id, isHighestBidder);
  }, [eventData?.id, isHighestBidder, settleAuctionEnd]);

  useEffect(() => {
    const el = placeBidRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [auctionEnded]);

  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const slideWidth = track.offsetWidth;
    const index = Math.round(track.scrollLeft / slideWidth);
    setActiveSlide(Math.min(index, HERO_IMAGES.length - 1));
  }, []);

  const handleChipClick = (value: number) => {
    setBid(value.toLocaleString('en-US'));
  };

  const handleBellClick = () => {
    const next = !isNotifyOn;
    setNotifyOn(next);

    if (notifyTimerRef.current) clearTimeout(notifyTimerRef.current);

    if (next) {
      setShowNotifySnack(true);
      notifyTimerRef.current = setTimeout(() => setShowNotifySnack(false), 5000);
    } else {
      setShowNotifySnack(false);
    }
  };

  const handleHeartClick = () => {
    const next = !isFavourite;
    setFavourite(next);

    if (favTimerRef.current) clearTimeout(favTimerRef.current);

    if (next) {
      setShowFavSnack(true);
      favTimerRef.current = setTimeout(() => setShowFavSnack(false), 5000);
    } else {
      setShowFavSnack(false);
    }
  };

  const parseBidValue = (raw: string): number => {
    const cleaned = raw.replace(/[^0-9]/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  const bidNumeric = parseBidValue(bid);

  const handlePlaceBidInner = () => {
    if (!bidNumeric || bidNumeric <= currentBid) return;

    if (bidNumeric > USER_POINTS) {
      if (bidErrorTimerRef.current) clearTimeout(bidErrorTimerRef.current);
      setShowBidError(true);
      bidErrorTimerRef.current = setTimeout(() => setShowBidError(false), 6000);
      return;
    }

    setConfirmBidOpen(true);
  };

  const handlePlaceBid = () => voyagerGate(handlePlaceBidInner);

  const handleConfirmBid = () => {
    if (eventData) {
      deductPoints(bidNumeric);
      recordAuctionBid(eventData, bidNumeric);
    }
    setCurrentBid(bidNumeric);
    setBidCount((c) => c + 1);
    setIsHighestBidder(true);
    setConfirmBidOpen(false);
    setBid('');
  };

  return (
    <div className="auction-page">
      <MarketplaceHeader
        theme="light"
        isLoggedIn
        avatarSrc="/avatar.png"
        points={USER_POINTS}
        loyaltyTier={userLoyaltyTier}
        onLogoClick={() => { window.location.href = window.location.pathname; }}
        onMenu={() => { setMenuInitialView('navigation'); setMenuOpen(true); }}
        onAvatarClick={() => { setMenuInitialView('profile'); setMenuOpen(true); }}
        onPointsClick={() => setLoyaltyOpen(true)}
      />

      <Menu
        open={menuOpen}
        initialView={menuInitialView}
        onClose={() => setMenuOpen(false)}
        userName="Alessandro"
        userSurname="Rocca"
        userEmail="alessandro.rocca@email.com"
        userPhone="+33 661458723"
        userBirthday="29/10/1993"
        userCountry="Spain"
        loyaltyTier={userLoyaltyTier}
        points={USER_POINTS}
        avatarSrc="/avatar.png"
      />

      {/* Loyalty Programme bottom sheet */}
      {loyaltyOpen && (
        <div className="loyalty-sheet__backdrop" onClick={() => setLoyaltyOpen(false)}>
          <div
            className="loyalty-sheet"
            role="dialog"
            aria-modal
            aria-label="Loyalty Programme"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="loyalty-sheet__header">
              <span className="loyalty-sheet__title">Loyalty Programme</span>
              <button
                type="button"
                className="loyalty-sheet__close"
                onClick={() => setLoyaltyOpen(false)}
                aria-label="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="loyalty-sheet__body">
              <div className="loyalty-sheet__info">
                <div className="loyalty-sheet__info-col">
                  <span className="loyalty-sheet__label">Status</span>
                  <span className={`loyalty-sheet__value loyalty-sheet__value--${userLoyaltyTier}`}>{userLoyaltyTier.charAt(0).toUpperCase() + userLoyaltyTier.slice(1)}</span>
                  <span className="loyalty-sheet__expire">Expire on December 31, 2026</span>
                </div>
                <div className="loyalty-sheet__divider" />
                <div className="loyalty-sheet__info-col">
                  <span className="loyalty-sheet__label">Reward Points</span>
                  <span className="loyalty-sheet__value">{USER_POINTS.toLocaleString('de-DE')}</span>
                  <span className="loyalty-sheet__expire">Expire on February 12, 2027</span>
                </div>
              </div>

              <div className={`loyalty-sheet__card loyalty-sheet__card--${userLoyaltyTier}`}>
                <span className="loyalty-sheet__card-tier">{userLoyaltyTier.toUpperCase()}</span>
                <svg className="loyalty-sheet__card-logo" width="76" height="64" viewBox="0 0 38 32" fill="none" aria-hidden>
                  <path d="M37.9997 31.8653L36.3392 29.8751C37.2136 29.6723 37.7471 29.1668 37.7471 28.2871C37.7471 27.2932 36.9111 26.7953 35.8521 26.7953H32.5333V31.8653H33.4133V29.947H35.3871L36.9077 31.8653H37.9997ZM33.4133 27.5822H35.8764C36.4831 27.5822 36.8453 27.8689 36.8453 28.3489C36.8453 28.8418 36.465 29.1602 35.8764 29.1602H33.4133V27.5822Z" fill="white"/>
                  <path d="M2.59991 26.7953L0.00423325 31.8653H0.999631L1.55328 30.7362H4.50927L5.06292 31.8653H6.081L3.48532 26.7953H2.59991ZM1.9392 29.9494L3.03134 27.722L4.12347 29.9494H1.9392Z" fill="white"/>
                  <path d="M10.736 27.4622C11.5636 27.4622 12.2458 27.7767 12.5957 28.329L13.3055 27.8482C12.8085 27.1462 11.9292 26.6608 10.736 26.6608C8.80719 26.6608 7.69913 27.9291 7.69913 29.3303C7.69913 30.7315 8.80719 32 10.736 32C11.9294 32 12.8085 31.5147 13.3055 30.8127L12.5957 30.3319C12.2458 30.8842 11.5636 31.1986 10.736 31.1986C9.43923 31.1986 8.60136 30.4653 8.60136 29.3305C8.60136 28.1956 9.43923 27.4622 10.736 27.4622Z" fill="white"/>
                  <path d="M18.7279 27.4622C19.5554 27.4622 20.2377 27.7767 20.5876 28.329L21.2973 27.8482C20.8004 27.1462 19.9211 26.6608 18.7279 26.6608C16.799 26.6608 15.691 27.9291 15.691 29.3303C15.691 30.7315 16.799 32 18.7279 32C19.9212 32 20.8004 31.5147 21.2973 30.8127L20.5876 30.3319C20.2377 30.8842 19.5554 31.1986 18.7279 31.1986C17.4311 31.1986 16.5932 30.4653 16.5932 29.3305C16.5932 28.1956 17.4311 27.4622 18.7279 27.4622Z" fill="white"/>
                  <path d="M26.7208 26.6608C24.7919 26.6608 23.6839 27.9291 23.6839 29.3303C23.6839 30.7315 24.7919 31.9999 26.7208 31.9999C28.6496 31.9999 29.7577 30.7315 29.7577 29.3303C29.7577 27.9291 28.6496 26.6608 26.7208 26.6608ZM26.7208 31.2072C25.424 31.2072 24.5861 30.4705 24.5861 29.3303C24.5861 28.1901 25.424 27.4534 26.7208 27.4534C28.0176 27.4534 28.8555 28.1903 28.8555 29.3303C28.8555 30.4704 28.0176 31.2072 26.7208 31.2072Z" fill="white"/>
                  <path d="M29.5938 22.5944H26.3473C24.9793 22.5944 24.2908 22.2917 23.7891 21.6319C23.2547 20.929 23.2547 19.8581 23.2547 18.8433V0.0096291H27.4283V19.4476C27.4283 20.9863 27.5996 22.0875 29.5939 22.5263V22.5945L29.5938 22.5944Z" fill="white"/>
                  <path d="M21.152 22.5912H15.9292L12.09 14.5315C9.9944 15.6791 8.79891 18.3367 6.67391 20.092C5.5912 20.9863 4.32395 21.7838 2.7447 22.3231C2.02982 22.5672 0.815335 22.8829 0.358166 22.9286C0.167371 22.9476 0.033037 22.9399 0.00461532 22.8704C-0.0173064 22.8168 0.0353313 22.7757 0.238872 22.6767C0.470961 22.5637 1.43003 22.1639 2.03097 21.7419C2.78115 21.2153 3.21092 20.6455 3.24469 20.206C3.03822 19.4736 1.56921 17.8478 3.072 14.8647C3.61124 13.7944 4.07759 13.0241 4.41164 12.2499C4.7954 11.3606 5.06687 10.1078 5.15927 9.1767C5.16462 9.12239 5.17431 9.12508 5.20375 9.15526C5.93558 9.90041 8.77176 12.8421 8.36175 15.7663C9.30476 15.4013 10.9404 14.293 11.6946 13.7016C12.4907 13.0773 13.0095 12.426 13.8527 12.4115C14.6079 12.3986 14.6729 12.7622 15.2743 12.8421C15.4233 12.8619 15.6438 12.8328 15.7578 12.7765C15.804 12.7538 15.7927 12.703 15.7228 12.6864C14.9027 12.4915 14.7063 11.8183 13.6462 11.8183C12.6952 11.8183 11.9383 12.7003 11.3901 13.0624L8.70816 7.43218C7.58646 5.07744 7.92892 3.36617 10.3908 0L21.152 22.5912Z" fill="white"/>
                  <path d="M37.9999 22.5944H34.7534C33.3854 22.5944 32.6969 22.2917 32.1952 21.6319C31.6608 20.929 31.6608 19.8581 31.6608 18.8433V0.0096291H35.8343V19.4476C35.8343 20.9863 36.0056 22.0875 38 22.5263V22.5945L37.9999 22.5944Z" fill="white"/>
                </svg>
              </div>

              <a href="https://all.accor.com/loyalty-program/en/reasontojoin/index.vhtml" className="loyalty-sheet__link" target="_blank" rel="noopener noreferrer">
                Discover your benefits and status level
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb — desktop only */}
      <nav className="auction-page__breadcrumb" aria-label="Breadcrumb">
        <a
          href={getPreviousPage().href}
          className="auction-page__breadcrumb-link"
          onClick={(e) => { e.preventDefault(); window.location.hash = getPreviousPage().href; }}
        >
          <IconChevronLeft />
          {getPreviousPage().label}
        </a>
      </nav>

      {/* Hero gallery */}
      <section className="auction-page__hero-full">
        {/* Notification snack bar — overlays hero, 16px below navbar */}
        {showNotifySnack && (
          <div className="auction-page__notify-snack" role="status">
            <svg className="auction-page__notify-snack-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="10" fill="#00513f" />
              <path d="M8 12l3 3 5-5" stroke="#caffea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="auction-page__notify-snack-content">
              <p className="auction-page__notify-snack-title">Notifications enabled for this auction</p>
              <p className="auction-page__notify-snack-body">You can review your preferences in communication settings.</p>
            </div>
            <button
              type="button"
              className="auction-page__notify-snack-close"
              onClick={() => setShowNotifySnack(false)}
              aria-label="Close notification"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {showFavSnack && (
          <div className="auction-page__notify-snack auction-page__notify-snack--fav" role="status">
            <svg className="auction-page__notify-snack-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="10" fill="#00513f" />
              <path d="M8 12l3 3 5-5" stroke="#caffea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="auction-page__notify-snack-content">
              <p className="auction-page__notify-snack-title">Added to your favourites</p>
              <p className="auction-page__notify-snack-body">You can review your favourites in your profile menu.</p>
            </div>
            <button
              type="button"
              className="auction-page__notify-snack-close"
              onClick={() => setShowFavSnack(false)}
              aria-label="Close notification"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {showBidError && (
          <div className="auction-page__notify-snack auction-page__notify-snack--error" role="alert">
            <svg className="auction-page__notify-snack-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" fill="#9e0031" />
              <path d="M12 9v4M12 17h.01" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="auction-page__notify-snack-content">
              <p className="auction-page__notify-snack-title auction-page__notify-snack-title--error">Insufficient Points balance</p>
              <p className="auction-page__notify-snack-body auction-page__notify-snack-body--error">You do not have enough points to place this bid. Review your point balance before trying again.</p>
            </div>
            <button
              type="button"
              className="auction-page__notify-snack-close"
              onClick={() => setShowBidError(false)}
              aria-label="Close notification"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        <div className="auction-page__hero-image">
          {eventData?.marketingTag && (
            <MarketingTag type={eventData.marketingTag} className="auction-page__hero-tag" />
          )}

          {/* Swipeable image track */}
          <div
            className="auction-page__hero-track"
            ref={trackRef}
            onScroll={handleScroll}
          >
            {HERO_IMAGES.map((img, i) => (
              <img
                key={i}
                src={img.src}
                alt={img.alt}
                className="auction-page__hero-img"
                draggable={false}
              />
            ))}
          </div>
          <div className="auction-page__hero-counter">
            <IconGallery />
            <span>{activeSlide + 1}/{HERO_IMAGES.length}</span>
          </div>
          <div className="auction-page__hero-dots">
            {HERO_IMAGES.map((_, i) => (
              <span
                key={i}
                className={`auction-page__hero-dot${i === activeSlide ? ' auction-page__hero-dot--active' : ''}`}
              />
            ))}
          </div>
        </div>
        <div className="auction-page__hero-label-container">
          <span className="auction-page__hero-auction-badge">Auction</span>
          {auctionEnded && isHighestBidder && (
            <span className="auction-page__hero-status-badge auction-page__hero-status-badge--winner">Winner</span>
          )}
          {!auctionEnded && isHighestBidder && (
            <span className="auction-page__hero-status-badge auction-page__hero-status-badge--winning">Winning</span>
          )}
        </div>
      </section>

      {/* Content layout */}
      <div className="auction-page__content-layout">
        <main className="auction-page__main">
          <section className="auction-page__hero-info">
            <div className="auction-page__date-row">
              <span className="auction-page__date">{EVENT_DATE}</span>
              <div className="auction-page__date-icons">
                <button
                  type="button"
                  className={`auction-page__icon-btn${isNotifyOn ? ' auction-page__icon-btn--notify-on' : ''}`}
                  aria-label={isNotifyOn ? 'Disable notifications' : 'Enable notifications'}
                  aria-pressed={isNotifyOn}
                  onClick={handleBellClick}
                >
                  <IconBell filled={isNotifyOn} />
                </button>
                <button
                  type="button"
                  className={`auction-page__icon-btn${isFavourite ? ' auction-page__icon-btn--fav-on' : ''}`}
                  aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                  aria-pressed={isFavourite}
                  onClick={handleHeartClick}
                >
                  <IconHeart filled={isFavourite} outlineWhenUnfilled />
                </button>
              </div>
            </div>

            <h1 className="auction-page__title">
              {EVENT_TITLE}
            </h1>

            <p className="auction-page__location">
              <IconPin />
              {EVENT_LOCATION}
            </p>

            <div className="auction-page__tags">
              {AUCTION_HERO_EVENT_TAGS.map((tag) => (
                <span key={tag} className="auction-page__tag">
                  {tag}
                </span>
              ))}
            </div>

            {isVoyagerExclusive && <VoyagerBadge />}

            {isHighestBidder && (
              <div className="auction-page__highest-bidder" role="status">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="10" fill="#00513f" />
                  <path d="M8 12l3 3 5-5" stroke="#caffea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>
                  {auctionEnded
                    ? "You won this auction. You'll receive an email with all the related informations."
                    : 'You are the highest bidder'}
                </span>
              </div>
            )}
          </section>

          <hr className="auction-page__divider auction-page__divider--mobile-only" aria-hidden />
          <section className="auction-page__bid-section auction-page__bid-section--mobile">
            {auctionEnded && (
              <span className="auction-page__ended-badge">Ended</span>
            )}
            <div className="auction-page__clock-wrap">
              <div className="auction-page__time-box">
                <p className="auction-page__time-label">
                  {auctionEnded ? 'Ended' : 'Ends'}{' '}
                  {endDate.toLocaleString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {!auctionEnded && (
                <Countdown endDate={endDate} onEnd={handleAuctionEnd} className="auction-page__countdown" />
              )}
            </div>

            <div className="auction-page__current-bid">
              <span className="auction-page__current-bid-label">
                {auctionEnded && isHighestBidder ? 'Winner Bid' : 'Current Bid'}
              </span>
              <div className="auction-page__current-bid-row">
                <span className="auction-page__current-bid-value">{formatChipPoints(currentBid)} Points</span>
                <span className="auction-page__current-bid-count">{bidCount} bids</span>
              </div>
            </div>

            {!auctionEnded && (
              <div className="auction-page__place-bid">
                <Input
                  label="Place your bid"
                  placeholder="Enter amount"
                  value={bid}
                  onChange={(e) => setBid(e.target.value)}
                  fullWidth
                  className="auction-page__bid-input"
                />
                <div className="auction-page__increments">
                  <span>Min bid increment: <strong>500 points</strong></span>
                  <span>Max bid increment: <strong>2000 points</strong></span>
                </div>
                <div className="auction-page__chips">
                  {BID_CHIPS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className="auction-page__chip"
                      onClick={() => handleChipClick(value)}
                    >
                      {formatChipPoints(value)}
                    </button>
                  ))}
                </div>
                <div ref={placeBidRef}>
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="auction-page__place-bid-btn"
                    onClick={handlePlaceBid}
                  >
                    Place bid
                  </Button>
                </div>
              </div>
            )}
          </section>

          <hr className="auction-page__divider" aria-hidden />

          <section className="auction-page__section auction-page__section--description">
            <p className="auction-page__body">
              {EVENT_DESCRIPTION}
            </p>
            <p className="auction-page__body">
              Don't miss this exclusive opportunity available only to ALL Accor members. Place your bid and secure your spot for {EVENT_DATE}.
            </p>
            <img
              src={HERO_IMAGES[1]?.src ?? HERO_IMAGES[0]?.src}
              alt={EVENT_TITLE}
              className="auction-page__section-img"
            />
          </section>

          <hr className="auction-page__divider" aria-hidden />

          <section className="auction-page__section">
            <h2 className="auction-page__heading">What is included in the package</h2>
            <ul className="auction-page__list">
              {INCLUDED_ITEMS.map((item, i) => (
                <li key={i} className="auction-page__list-item">{item}</li>
              ))}
            </ul>
          </section>

          <hr className="auction-page__divider" aria-hidden />

          <section className="auction-page__section auction-page__section--side-image">
            <div className="auction-page__section-text">
              <h2 className="auction-page__heading">About the venue</h2>
              <p className="auction-page__body auction-page__body--strong">Marquês de Sapucaí Sambadrome</p>
              <p className="auction-page__body">
                The Sambadrome Marquês de Sapucaí is a purpose-built parade area built for the Rio Carnival in Rio de Janeiro, Brazil. The venue is also known as Passarela Professor Darcy Ribeiro or simply the Sambódromo in Portuguese or Sambadrome in English.
              </p>
              <Link href="#">Read more</Link>
            </div>
            <img
              src="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=422&h=280&fit=crop"
              alt="Sambadrome venue"
              className="auction-page__side-img"
            />
          </section>

          <hr className="auction-page__divider" aria-hidden />

          <section className="auction-page__section auction-page__section--side-image">
            <div className="auction-page__section-text">
              <h2 className="auction-page__heading">How to get there</h2>
              <p className="auction-page__body auction-page__body--strong">Alma Rio Box – Marquês de Sapucaí Sambadrome</p>
              <p className="auction-page__body auction-page__body--muted">
                R. Marquês de Sapucaí - Santo Cristo, Rio de Janeiro - RJ, 20220-007, Brazil
              </p>
            </div>
            <img
              className="auction-page__map"
              src={RIO_SAMBADROME_MAP_IMAGE}
              alt="Aerial view of Rio de Janeiro — approximate area of Marquês de Sapucaí Sambadrome"
              loading="lazy"
              decoding="async"
            />
          </section>

          <hr className="auction-page__divider" aria-hidden />

          <section className="auction-page__section">
            <h2 className="auction-page__heading">Terms & Conditions</h2>
            <p className="auction-page__body">
              Participation in the Auction is open to individuals aged 18 years or older (or the legal age of majority in their jurisdiction). Employees of ACCOR, its affiliates, partners...
            </p>
            <Link href="#" onClick={(e) => { e.preventDefault(); setTermsOpen(true); }}>Read more</Link>
          </section>

          <hr className="auction-page__divider" aria-hidden />
          <YouMayAlsoLike event={eventData ?? null} excludeEventId={eventId} />
        </main>

        <aside className="auction-page__sidebar">
          <div className="auction-page__bid-card">
            <span className="auction-page__hero-auction-badge auction-page__bid-card-badge">Auction</span>
            {isHighestBidder && !auctionEnded && (
              <span className="auction-page__hero-status-badge auction-page__hero-status-badge--winning auction-page__bid-card-badge">Winning</span>
            )}
            {isHighestBidder && auctionEnded && (
              <span className="auction-page__hero-status-badge auction-page__hero-status-badge--winner auction-page__bid-card-badge">Winner</span>
            )}
            <section className="auction-page__bid-section">
              {auctionEnded && (
                <span className="auction-page__ended-badge">Ended</span>
              )}
              <div className="auction-page__clock-wrap">
                <div className="auction-page__time-box">
                  <p className="auction-page__time-label">
                    {auctionEnded ? 'Ended' : 'Ends'}{' '}
                    {endDate.toLocaleString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!auctionEnded && (
                  <Countdown endDate={endDate} onEnd={handleAuctionEnd} className="auction-page__countdown" />
                )}
              </div>

              <div className="auction-page__current-bid">
                <span className="auction-page__current-bid-label">
                  {auctionEnded && isHighestBidder ? 'Winner Bid' : 'Current Bid'}
                </span>
                <div className="auction-page__current-bid-row">
                  <span className="auction-page__current-bid-value">{formatChipPoints(currentBid)} Points</span>
                  <span className="auction-page__current-bid-count">{bidCount} bids</span>
                </div>
              </div>

              {!auctionEnded && (
                <div className="auction-page__place-bid">
                  <Input
                    label="Place your bid"
                    placeholder="Enter amount"
                    value={bid}
                    onChange={(e) => setBid(e.target.value)}
                    fullWidth
                    className="auction-page__bid-input"
                  />
                  <div className="auction-page__increments">
                    <span>Min bid increment: <strong>500 points</strong></span>
                    <span>Max bid increment: <strong>2000 points</strong></span>
                  </div>
                  <div className="auction-page__chips">
                    {BID_CHIPS.map((value) => (
                      <button
                        key={value}
                        type="button"
                        className="auction-page__chip"
                        onClick={() => handleChipClick(value)}
                      >
                        {formatChipPoints(value)}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="auction-page__place-bid-btn"
                    onClick={handlePlaceBid}
                  >
                    Place bid
                  </Button>
                </div>
              )}

              {isHighestBidder && (
                <div className="auction-page__highest-bidder" role="status">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="10" fill="#00513f" />
                    <path d="M8 12l3 3 5-5" stroke="#caffea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    {auctionEnded
                      ? "You won this auction. You'll receive an email with all the related informations."
                      : 'You are the highest bidder'}
                  </span>
                </div>
              )}
            </section>
          </div>
        </aside>
      </div>

      {showStickyBar && !auctionEnded && (
        <div className="auction-page__sticky-bar">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="auction-page__place-bid-btn"
            onClick={handlePlaceBid}
          >
            Place bid
          </Button>
        </div>
      )}

      {confirmBidOpen && (
        <div className="confirm-bid__backdrop" onClick={() => setConfirmBidOpen(false)}>
          <div
            className="confirm-bid"
            role="dialog"
            aria-modal
            aria-label="Confirm your bid"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-bid__header">
              <span className="confirm-bid__spacer" />
              <h2 className="confirm-bid__title">Confirm your bid</h2>
              <button
                type="button"
                className="confirm-bid__close"
                onClick={() => setConfirmBidOpen(false)}
                aria-label="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="confirm-bid__body">
              <div className="confirm-bid__info">
                <div className="confirm-bid__time-row">
                  <span className="confirm-bid__time-left">
                    Ends in{' '}
                    <strong>
                      {(() => {
                        const diff = Math.max(0, Math.floor((endDate.getTime() - Date.now()) / 1000));
                        const d = Math.floor(diff / 86400);
                        const h = Math.floor((diff % 86400) / 3600);
                        const m = Math.floor((diff % 3600) / 60);
                        const s = diff % 60;
                        return `${d}d ${h}h ${m}m ${s}s`;
                      })()}
                    </strong>
                  </span>
                  <span className="confirm-bid__time-date">
                    {endDate.toLocaleString('en-GB', { weekday: 'long', day: '2-digit', month: 'long' })} - {endDate.toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="confirm-bid__actual">
                  <span className="confirm-bid__actual-label">Current bid:</span>
                  <span className="confirm-bid__actual-value">{formatChipPoints(currentBid)} points</span>
                </div>
              </div>

              <div className="confirm-bid__your-bid">
                <span className="confirm-bid__your-bid-label">Your bid</span>
                <span className="confirm-bid__your-bid-value">{formatChipPoints(bidNumeric)} points</span>
              </div>

              <div className="confirm-bid__actions">
                <Button variant="tertiary" size="md" fullWidth onClick={() => setConfirmBidOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" fullWidth onClick={handleConfirmBid}>
                  Confirm bid
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <TermsDialog open={termsOpen} onClose={() => setTermsOpen(false)} />
      <VoyagerDialog open={voyagerOpen} onClose={() => setVoyagerOpen(false)} />
    </div>
  );
}
