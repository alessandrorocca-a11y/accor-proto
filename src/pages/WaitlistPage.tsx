import { useState, useRef, useCallback } from 'react';
import {
  Link,
  MarketingTag,
  MarketplaceHeader,
  Menu,
  TermsDialog,
} from '@/components';
import type { MenuView } from '@/components';
import { useFavourites } from '@/context/FavouritesContext';
import { getEventById } from '@/data/events/eventRegistry';
import { getVenueInfo } from '@/data/events/venueData';
import { useUser } from '@/context/UserContext';
import { getPreviousPage } from '@/utils/navigationHistory';
import './WaitlistPage.css';

const DEFAULT_HERO_IMAGES = [
  { src: '/carnival-hero.png', alt: 'Rio de Janeiro Carnival 2026' },
  { src: 'https://english.news.cn/20260219/d885f812d03c40e7aa0e4eb54f317216/20260219d885f812d03c40e7aa0e4eb54f317216_202602198e26df7794f1485eb79cdc333ea4b903.jpg', alt: 'Sambadrome parade with colourful floats' },
  { src: 'https://english.news.cn/20260219/d885f812d03c40e7aa0e4eb54f317216/20260219d885f812d03c40e7aa0e4eb54f317216_20260219fdf5e866a18e49c0ae3143a8c6e8d5fd.jpg', alt: 'Rio carnival dancers in costume' },
  { src: 'https://english.news.cn/20260219/d885f812d03c40e7aa0e4eb54f317216/20260219d885f812d03c40e7aa0e4eb54f317216_20260219d0b178a09112433a8eb12ff67b9df0e9.jpg', alt: 'Rio carnival float' },
  { src: 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800&h=600&fit=crop', alt: 'Copacabana beach aerial view' },
  { src: 'https://images.unsplash.com/photo-1544989164-31dc3c645987?w=800&h=600&fit=crop', alt: 'Fairmont Copacabana Palace at dusk' },
];

const DEFAULT_INCLUDED_ITEMS = [
  '2 tickets for 16/02',
  '2 exclusive t-shirts for 16/02',
  'Collection of kits and t-shirt customisation at Fairmont Copacabana',
  'Round-trip transfer from Jockey Club to the Sambadrome',
  'Exclusive ALL Accor lounge inside the Alma Rio Box, with premium food and beverage service and a privileged view of the parades',
  'Semi-private space in the frisa, allowing you to watch the parades even closer, with maximum comfort (new)',
  'Open Food and Premium Open Bar, live shows, beauty services and much more',
];

const RECOMMENDED_EVENTS = [
  {
    id: 'rec-golf',
    title: 'Golf Day at Le Golf National',
    date: 'May 3, 2026',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=400&fit=crop',
    points: '150.000',
    eventTag: 'Limitless Experiences',
    paymentLabel: 'Prize Draw',
    countdown: '30d 04h 10m 55s',
    route: '#redeem/evt-026',
  },
  {
    id: 'rec-pastry',
    title: 'Private Pastry Workshop at Le Meurice',
    date: 'March 22, 2026',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop',
    points: '12.000',
    eventTag: 'Hotel Experience',
    paymentLabel: 'Redeem',
    countdown: '',
    route: '#standard/evt-051',
  },
  {
    id: 'rec-rugby',
    title: 'Stade de France Rugby VIP Experience',
    date: 'March 15, 2026',
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=400&fit=crop',
    points: '120.000',
    eventTag: '',
    paymentLabel: 'Auction',
    countdown: '10d 14h 28m 00s',
    route: '#auction/evt-024',
  },
];

function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


function IconHeart({ filled }: { filled: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? '#B40875' : 'none'} aria-hidden>
      <path
        d="M12 21l-1.35-1.2C4.8 14.4 1.5 11.3 1.5 7.4 1.5 4.4 3.9 2 6.9 2c1.8 0 3.4.9 4.5 2.3C12.5 2.9 14.2 2 16 2c3 0 5.4 2.4 5.4 5.4 0 3.9-3.3 7-9.1 12.4L12 21z"
        stroke={filled ? '#B40875' : 'currentColor'}
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

function IconStar() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M7.64903 4.06886C7.7899 3.77365 8.21012 3.77365 8.35099 4.06886L9.25318 5.95956C9.30987 6.07836 9.42282 6.16043 9.55334 6.17763L11.6303 6.45141C11.9546 6.49416 12.0844 6.89381 11.8472 7.11901L10.3278 8.5613C10.2324 8.65194 10.1892 8.78472 10.2132 8.91416L10.5946 10.9741C10.6542 11.2957 10.3142 11.5427 10.0267 11.3867L8.18552 10.3873C8.06982 10.3246 7.9302 10.3246 7.8145 10.3873L5.97329 11.3867C5.68581 11.5427 5.34584 11.2957 5.4054 10.9741L5.78683 8.91416C5.8108 8.78472 5.76766 8.65194 5.67218 8.5613L4.15282 7.11901C3.91559 6.89381 4.04544 6.49416 4.36974 6.45141L6.44668 6.17763C6.5772 6.16043 6.69015 6.07836 6.74684 5.95956L7.64903 4.06886Z" stroke="#3a34ab" />
      <circle cx="8" cy="8" r="6" stroke="#3a34ab" strokeLinejoin="round" />
    </svg>
  );
}

export default function WaitlistPage({ eventId }: { eventId?: string }) {
  const eventData = eventId ? getEventById(eventId) : undefined;
  const { points: userPoints, loyaltyTier: userLoyaltyTier } = useUser();

  const HERO_IMAGES = eventData?.heroImages ?? DEFAULT_HERO_IMAGES;
  const USER_POINTS = userPoints;
  const INCLUDED_ITEMS = eventData?.includedItems ?? DEFAULT_INCLUDED_ITEMS;
  const EVENT_TITLE = eventData?.title ?? 'Rio de Janeiro Carnival 2026 – Waitlist';
  const EVENT_DESCRIPTION = eventData?.description ?? 'Join the waitlist for this exclusive event.';
  const EVENT_LOCATION = eventData?.location ?? 'Fairmont Copacabana Palace, Rio de Janeiro';
  const EVENT_CITY = eventData?.city ?? 'Rio de Janeiro';
  const venueInfo = getVenueInfo(EVENT_LOCATION, EVENT_CITY);

  const [isFavourite, setFavourite] = useState(false);
  const [showFavSnack, setShowFavSnack] = useState(false);
  const [showJoinedSnack, setShowJoinedSnack] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuInitialView, setMenuInitialView] = useState<MenuView>('navigation');
  const [loyaltyOpen, setLoyaltyOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [termsOpen, setTermsOpen] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const favTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const joinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isFavourite: isGlobalFav, toggleFavourite: toggleGlobalFav, favouritesList, removeFavourite } = useFavourites();

  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const slideWidth = track.offsetWidth;
    const index = Math.round(track.scrollLeft / slideWidth);
    setActiveSlide(Math.min(index, HERO_IMAGES.length - 1));
  }, []);

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

  const handleJoinWaitlist = () => {
    if (hasJoined) return;
    setHasJoined(true);
    if (joinTimerRef.current) clearTimeout(joinTimerRef.current);
    setShowJoinedSnack(true);
    joinTimerRef.current = setTimeout(() => setShowJoinedSnack(false), 5000);
  };

  return (
    <div className="auction-page waitlist">
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
        onClose={() => setMenuOpen(false)}
        initialView={menuInitialView}
        userName="Alessandro"
        userSurname="Rocca"
        userEmail="alessandro.rocca@email.com"
        userPhone="+33 661458723"
        userBirthday="29/10/1993"
        userCountry="Spain"
        loyaltyTier={userLoyaltyTier}
        points={USER_POINTS}
        avatarSrc="/avatar.png"
        favouriteEvents={favouritesList}
        onToggleFavourite={removeFavourite}
      />

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

      <section className="auction-page__hero-full">
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

        {showJoinedSnack && (
          <div className="auction-page__notify-snack" role="status">
            <svg className="auction-page__notify-snack-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="10" fill="#00513f" />
              <path d="M8 12l3 3 5-5" stroke="#caffea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="auction-page__notify-snack-content">
              <p className="auction-page__notify-snack-title">You've joined the waitlist!</p>
              <p className="auction-page__notify-snack-body">We'll notify you when pre-sale tickets become available.</p>
            </div>
            <button
              type="button"
              className="auction-page__notify-snack-close"
              onClick={() => setShowJoinedSnack(false)}
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
        <div className="auction-page__hero-grid">
          {HERO_IMAGES.slice(0, 5).map((img, i) => (
            <img
              key={i}
              src={img.src}
              alt={img.alt}
              className={`auction-page__hero-grid-img${i === 0 ? ' auction-page__hero-grid-img--large' : ''}`}
            />
          ))}
        </div>
        <div className="auction-page__hero-label-container">
          <span className="auction-page__hero-auction-badge waitlist__badge">Waitlist</span>
        </div>
      </section>

      <div className="auction-page__content-layout">
        <main className="auction-page__main">
          <section className="auction-page__hero-info">
            <div className="auction-page__date-row">
              <span className="auction-page__date">Monday, 16 February</span>
              <div className="auction-page__date-icons">
                <button
                  type="button"
                  className={`auction-page__icon-btn${isFavourite ? ' auction-page__icon-btn--fav-on' : ''}`}
                  aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                  aria-pressed={isFavourite}
                  onClick={handleHeartClick}
                >
                  <IconHeart filled={isFavourite} />
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
              <span className="auction-page__tag">Sustainable Experience</span>
            </div>
          </section>

          <hr className="auction-page__divider" aria-hidden />

          <section className="auction-page__section auction-page__section--description">
            <p className="auction-page__body">
              {EVENT_DESCRIPTION}
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
              <p className="auction-page__body auction-page__body--strong">{venueInfo.name}</p>
              <p className="auction-page__body">{venueInfo.description}</p>
              <Link href="#">Read more</Link>
            </div>
            <img
              src={venueInfo.imageUrl}
              alt={venueInfo.name}
              className="auction-page__side-img"
            />
          </section>

          <hr className="auction-page__divider" aria-hidden />

          <section className="auction-page__section auction-page__section--side-image">
            <div className="auction-page__section-text">
              <h2 className="auction-page__heading">How to get there</h2>
              <p className="auction-page__body auction-page__body--strong">{venueInfo.name}</p>
              <p className="auction-page__body auction-page__body--muted">{venueInfo.address}</p>
            </div>
            <iframe
              className="auction-page__map"
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${venueInfo.mapQuery}`}
              title={`${venueInfo.name} location`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
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

          <section className="linkout__recommendations">
            <h2 className="linkout__recommendations-title">You may also like</h2>
            <div className="linkout__recommendations-scroll">
              {RECOMMENDED_EVENTS.map((event) => (
                <a key={event.id} className="linkout__card" href={event.route} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="linkout__card-img-wrap">
                    <img src={event.image} alt={event.title} className="linkout__card-img" />
                    <button
                      type="button"
                      className="linkout__card-fav"
                      aria-label={isGlobalFav(event.id) ? 'Remove from favourites' : 'Add to favourites'}
                      aria-pressed={isGlobalFav(event.id)}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleGlobalFav({ id: event.id, image: event.image, date: event.date, title: event.title, eventTag: event.eventTag, paymentLabel: event.paymentLabel, points: event.points + ' Reward Points', countdown: event.countdown }); }}
                    >
                      <IconHeart filled={isGlobalFav(event.id)} />
                    </button>
                  </div>
                  <div className="linkout__card-body">
                    <p className="linkout__card-date">{event.date}</p>
                    <p className="linkout__card-title">{event.title}</p>
                    <div className="linkout__card-price-badge">
                      <IconStar />
                      <span>{event.points} Reward Points</span>
                    </div>
                    {event.countdown && (
                      <div className="linkout__card-countdown">
                        <span>Time left:</span>
                        <span>{event.countdown}</span>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        </main>

        <aside className="auction-page__sidebar">
          <div className="auction-page__bid-card waitlist__sidebar-card">
            <button
              type="button"
              className={`waitlist__sidebar-cta-btn${hasJoined ? ' waitlist__sidebar-cta-btn--joined' : ''}`}
              onClick={handleJoinWaitlist}
            >
              {hasJoined ? 'Joined' : 'Join Waitlist'}
            </button>
            <p className="waitlist__sidebar-disclaimer">
              Join the waitlist and get exclusive access to pre-sale tickets before they go on sale to the general public!
            </p>
          </div>
        </aside>
      </div>

      <div className="waitlist__cta-bar">
        <button
          type="button"
          className={`waitlist__cta-btn${hasJoined ? ' waitlist__cta-btn--joined' : ''}`}
          onClick={handleJoinWaitlist}
        >
          {hasJoined ? 'Joined' : 'Join Waitlist'}
        </button>
        <p className="waitlist__cta-disclaimer">
          Join the waitlist and get exclusive access to pre-sale tickets before they go on sale to the general public!
        </p>
      </div>
      <div className="waitlist__cta-spacer" />

      <TermsDialog open={termsOpen} onClose={() => setTermsOpen(false)} variant="waitlist" />
    </div>
  );
}
