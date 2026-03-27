import { useState, useMemo, useEffect, useRef } from 'react';
import { ExplorerOnlyCardFooter, IconHeart, MarketplaceHeader, Menu, MarketingTag } from '@/components';
import { Search, SearchResultsPanel } from '@/components/molecules/Search/Search';
import type { MenuFavouriteEvent, MenuView } from '@/components';
import allAccorLogo from '@/assets/all-accor-logo.svg';
import {
  EVENT_REGISTRY,
  getEventRoute,
  getPaymentLabel,
  formatPoints,
  formatStandardEventListPrice,
  isExplorerExclusiveMarketingTag,
  type EventData,
  type MarketingTagType,
} from '@/data/events/eventRegistry';
import { useUser, type LoyaltyTier } from '@/context/UserContext';
import { useFavourites } from '@/context/FavouritesContext';
import {
  sortEventsForProfileAndPointsBalance,
  sortEventsForProfileAndPointsBalancePreferredCityFirst,
  takeSortedWithVoyagerExclusiveCap,
} from '@/utils/profileSort';
import './HomePage.css';

/* ── Data types ──────────────────────────────────────────────────────── */

type PaymentType = 'prize-draw' | 'redeem' | 'auction' | 'cash' | 'flex' | 'linkout' | 'waitlist';

interface EventCard {
  id: string;
  title: string;
  date: string;
  image: string;
  paymentType: PaymentType;
  points?: string;
  cashPrice?: string;
  hasTimer?: boolean;
  msLeft?: number;
  eventTag?: string;
  marketingTag?: MarketingTagType;
}

interface TopExperience {
  id: string;
  title: string;
  image: string;
  video?: string;
  hash: string;
}

interface City {
  name: string;
  country: string;
  image: string;
}

interface Category {
  label: string;
  image: string;
  hash: string;
}

/* ── Trip config (null = no planned trip) ─────────────────────────────── */

interface PlannedTrip {
  city: string;
  hotelName: string;
  dates: string;
  dateFrom: string;
  dateTo: string;
  image: string;
}

const PLANNED_TRIP: PlannedTrip | null = {
  city: 'Paris',
  hotelName: 'Staying at Sofitel Le Scribe Paris',
  dates: '12 - 15 April 2026',
  dateFrom: '2026-04-12',
  dateTo: '2026-04-15',
  image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=200&h=200&fit=crop',
};

/* ── Constants ────────────────────────────────────────────────────────── */

const HERO_IMAGE = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=800&fit=crop';

function registryToCard(e: EventData): EventCard {
  const ptMap: Record<string, PaymentType> = {
    auction: 'auction', 'prize-draw': 'prize-draw', redeem: 'redeem', standard: 'cash', waitlist: 'waitlist',
  };
  return {
    id: e.id,
    title: e.title,
    date: e.date,
    image: e.image,
    paymentType: ptMap[e.pageType] ?? 'cash',
    points: e.pageType !== 'standard' ? formatPoints(e.points) : undefined,
    cashPrice: e.pageType === 'standard' ? formatStandardEventListPrice(e) : undefined,
    hasTimer: !!e.msLeft,
    msLeft: e.msLeft,
    eventTag: e.eventTag,
    marketingTag: e.marketingTag,
  };
}

const isAccor = (e: EventData) => e.eventTag === 'Limitless Experiences';

const TOP_EXPERIENCES: TopExperience[] = [
  {
    id: 'te1',
    title: 'Paris Saint-Germain - Monaco',
    image: '/psg-stadium.jpg',
    video: 'https://cdn.pixabay.com/video/2020/07/30/45349-446050392_tiny.mp4',
    hash: '#draw/evt-031',
  },
  {
    id: 'te2',
    title: 'Rio de Janeiro Carnaval 2026',
    image: 'https://english.news.cn/20260219/d885f812d03c40e7aa0e4eb54f317216/20260219d885f812d03c40e7aa0e4eb54f317216_202602198e26df7794f1485eb79cdc333ea4b903.jpg',
    video: 'https://cdn.pixabay.com/video/2024/03/08/203849-921386938_tiny.mp4',
    hash: '#auction/evt-101',
  },
  {
    id: 'te3',
    title: 'Andrea Bocelli',
    image: 'https://limitlessexperiences.accor.com/media/catalog/product/A/n/Andrea_Bocelli_2026_affiche_aa_0727.jpg',
    hash: '#auction/evt-003',
  },
  {
    id: 'te4',
    title: 'Monaco Grand Prix 2026',
    image: 'https://images.unsplash.com/photo-1752884991193-f40e0018e483?w=400&h=700&fit=crop',
    video: 'https://cdn.pixabay.com/video/2017/08/05/11080-228267789_tiny.mp4',
    hash: '#auction/evt-024',
  },
  {
    id: 'te5',
    title: 'Sofitel x Devialet Candle Experience',
    image: 'https://limitlessexperiences.accor.com/media/.renditions/wysiwyg/2025/ALL/December2025/SofitelxDevialet/Sofitel_Candle_Experience_Banner_355x320.png',
    hash: '#redeem/evt-076',
  },
  {
    id: 'te6',
    title: 'Roland Garros VIP 2026',
    image: '/roland-garros-1.png',
    video: 'https://cdn.pixabay.com/video/2020/05/25/39738-424930741_tiny.mp4',
    hash: '#draw/evt-021',
  },
];

const CATEGORIES: Category[] = [
  { label: 'Shows & culture', image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=350&h=200&fit=crop', hash: '#category/shows-and-culture' },
  { label: 'Food & drinks', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=350&h=200&fit=crop', hash: '#category/food-and-drinks' },
  { label: 'Sports & leisure', image: '/psg-stadium.jpg', hash: '#category/sport-and-leisure' },
  { label: 'Wellness', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=350&h=200&fit=crop', hash: '#category/wellness' },
  { label: 'Concerts & festivals', image: 'https://limitlessexperiences.accor.com/media/wysiwyg/Accor-Arena-760x524.jpg', hash: '#category/concerts-and-festivals' },
  { label: 'Visits', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=350&h=200&fit=crop', hash: '#category/visits' },
  { label: 'Hotel experiences', image: 'https://limitlessexperiences.accor.com/media/.renditions/wysiwyg/2025/ALL/December2025/EmblemsDreamStays/EDS-HeroBanner_510x510.jpg', hash: '#category/hotel-experiences' },
];

/* Events are now derived from EVENT_REGISTRY above */

const POPULAR_CITIES: City[] = [
  { name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=700&fit=crop' },
  { name: 'Rome', country: 'Italy', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=700&fit=crop' },
  { name: 'Madrid', country: 'Spain', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=700&fit=crop' },
  { name: 'London', country: 'United Kingdom', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=700&fit=crop' },
];

const NEAR_CITIES = [
  { name: 'Lyon', hash: '#city/lyon' },
  { name: 'Marseille', hash: '#city/marseille' },
  { name: 'Nice', hash: '#city/nice' },
];

const ALL_CITIES = [
  { name: 'Paris', country: 'France', hash: '#city/paris' },
  { name: 'Rome', country: 'Italy', hash: '#city/rome' },
  { name: 'Madrid', country: 'Spain', hash: '#city/madrid' },
  { name: 'London', country: 'United Kingdom', hash: '#city/london' },
  { name: 'Barcelona', country: 'Spain', hash: '#city/barcelona' },
  { name: 'Lisbon', country: 'Portugal', hash: '#city/lisbon' },
  { name: 'Amsterdam', country: 'Netherlands', hash: '#city/amsterdam' },
  { name: 'Berlin', country: 'Germany', hash: '#city/berlin' },
  { name: 'Vienna', country: 'Austria', hash: '#city/vienna' },
  { name: 'Prague', country: 'Czech Republic', hash: '#city/prague' },
  { name: 'Lyon', country: 'France', hash: '#city/lyon' },
  { name: 'Marseille', country: 'France', hash: '#city/marseille' },
  { name: 'Nice', country: 'France', hash: '#city/nice' },
];

const BANNER_IMAGE = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=320&fit=crop&q=80';

const LOYALTY_CARD_LOGO_PATHS = (
  <>
    <path d="M37.9997 31.8653L36.3392 29.8751C37.2136 29.6723 37.7471 29.1668 37.7471 28.2871C37.7471 27.2932 36.9111 26.7953 35.8521 26.7953H32.5333V31.8653H33.4133V29.947H35.3871L36.9077 31.8653H37.9997ZM33.4133 27.5822H35.8764C36.4831 27.5822 36.8453 27.8689 36.8453 28.3489C36.8453 28.8418 36.465 29.1602 35.8764 29.1602H33.4133V27.5822Z" fill="white" />
    <path d="M2.59991 26.7953L0.00423325 31.8653H0.999631L1.55328 30.7362H4.50927L5.06292 31.8653H6.081L3.48532 26.7953H2.59991ZM1.9392 29.9494L3.03134 27.722L4.12347 29.9494H1.9392Z" fill="white" />
    <path d="M10.736 27.4622C11.5636 27.4622 12.2458 27.7767 12.5957 28.329L13.3055 27.8482C12.8085 27.1462 11.9292 26.6608 10.736 26.6608C8.80719 26.6608 7.69913 27.9291 7.69913 29.3303C7.69913 30.7315 8.80719 32 10.736 32C11.9294 32 12.8085 31.5147 13.3055 30.8127L12.5957 30.3319C12.2458 30.8842 11.5636 31.1986 10.736 31.1986C9.43923 31.1986 8.60136 30.4653 8.60136 29.3305C8.60136 28.1956 9.43923 27.4622 10.736 27.4622Z" fill="white" />
    <path d="M18.7279 27.4622C19.5554 27.4622 20.2377 27.7767 20.5876 28.329L21.2973 27.8482C20.8004 27.1462 19.9211 26.6608 18.7279 26.6608C16.799 26.6608 15.691 27.9291 15.691 29.3303C15.691 30.7315 16.799 32 18.7279 32C19.9212 32 20.8004 31.5147 21.2973 30.8127L20.5876 30.3319C20.2377 30.8842 19.5554 31.1986 18.7279 31.1986C17.4311 31.1986 16.5932 30.4653 16.5932 29.3305C16.5932 28.1956 17.4311 27.4622 18.7279 27.4622Z" fill="white" />
    <path d="M26.7208 26.6608C24.7919 26.6608 23.6839 27.9291 23.6839 29.3303C23.6839 30.7315 24.7919 31.9999 26.7208 31.9999C28.6496 31.9999 29.7577 30.7315 29.7577 29.3303C29.7577 27.9291 28.6496 26.6608 26.7208 26.6608ZM26.7208 31.2072C25.424 31.2072 24.5861 30.4705 24.5861 29.3303C24.5861 28.1901 25.424 27.4534 26.7208 27.4534C28.0176 27.4534 28.8555 28.1903 28.8555 29.3303C28.8555 30.4704 28.0176 31.2072 26.7208 31.2072Z" fill="white" />
    <path d="M29.5938 22.5944H26.3473C24.9793 22.5944 24.2908 22.2917 23.7891 21.6319C23.2547 20.929 23.2547 19.8581 23.2547 18.8433V0.0096291H27.4283V19.4476C27.4283 20.9863 27.5996 22.0875 29.5939 22.5263V22.5945L29.5938 22.5944Z" fill="white" />
    <path d="M21.152 22.5912H15.9292L12.09 14.5315C9.9944 15.6791 8.79891 18.3367 6.67391 20.092C5.5912 20.9863 4.32395 21.7838 2.7447 22.3231C2.02982 22.5672 0.815335 22.8829 0.358166 22.9286C0.167371 22.9476 0.033037 22.9399 0.00461532 22.8704C-0.0173064 22.8168 0.0353313 22.7757 0.238872 22.6767C0.470961 22.5637 1.43003 22.1639 2.03097 21.7419C2.78115 21.2153 3.21092 20.6455 3.24469 20.206C3.03822 19.4736 1.56921 17.8478 3.072 14.8647C3.61124 13.7944 4.07759 13.0241 4.41164 12.2499C4.7954 11.3606 5.06687 10.1078 5.15927 9.1767C5.16462 9.12239 5.17431 9.12508 5.20375 9.15526C5.93558 9.90041 8.77176 12.8421 8.36175 15.7663C9.30476 15.4013 10.9404 14.293 11.6946 13.7016C12.4907 13.0773 13.0095 12.426 13.8527 12.4115C14.6079 12.3986 14.6729 12.7622 15.2743 12.8421C15.4233 12.8619 15.6438 12.8328 15.7578 12.7765C15.804 12.7538 15.7927 12.703 15.7228 12.6864C14.9027 12.4915 14.7063 11.8183 13.6462 11.8183C12.6952 11.8183 11.9383 12.7003 11.3901 13.0624L8.70816 7.43218C7.58646 5.07744 7.92892 3.36617 10.3908 0L21.152 22.5912Z" fill="white" />
    <path d="M37.9999 22.5944H34.7534C33.3854 22.5944 32.6969 22.2917 32.1952 21.6319C31.6608 20.929 31.6608 19.8581 31.6608 18.8433V0.0096291H35.8343V19.4476C35.8343 20.9863 36.0056 22.0875 38 22.5263V22.5945L37.9999 22.5944Z" fill="white" />
  </>
);

/** Same ALL card art as the loyalty sheet (points button), for banner + sheet. Banner: bg only is non-uniform-scaled; tier + logo use uniform scale. */
function LoyaltyProgramCardVisual({
  tier,
  className,
  variant = 'sheet',
  'aria-label': ariaLabel,
}: {
  tier: LoyaltyTier;
  className?: string;
  variant?: 'sheet' | 'banner';
  'aria-label'?: string;
}) {
  if (variant === 'banner') {
    return (
      <>
        <div
          className={`loyalty-sheet__card loyalty-sheet__card--${tier} home-page__banner-loyalty-card-bg`}
          aria-hidden
        />
        <div className="home-page__banner-loyalty-card-front-wrap">
          <div
            className={[
              'home-page__banner-loyalty-card-front',
              tier === 'diamond' ? 'home-page__banner-loyalty-card-front--diamond' : '',
            ].filter(Boolean).join(' ')}
          >
            <span className="loyalty-sheet__card-tier">{tier.toUpperCase()}</span>
            <svg className="loyalty-sheet__card-logo" width="76" height="64" viewBox="0 0 38 32" fill="none" aria-hidden>
              {LOYALTY_CARD_LOGO_PATHS}
            </svg>
          </div>
        </div>
      </>
    );
  }

  /* Sheet dialog: 270×180 frame; gradient scales vertically only; tier + logo keep 270×130 proportions */
  return (
    <div
      className={['loyalty-sheet__card-stack', className].filter(Boolean).join(' ')}
      {...(ariaLabel ? { role: 'img' as const, 'aria-label': ariaLabel } : {})}
    >
      <div className={`loyalty-sheet__card loyalty-sheet__card--${tier} loyalty-sheet__card-bg`} aria-hidden />
      <div className="loyalty-sheet__card-front-wrap">
        <div
          className={[
            'loyalty-sheet__card-front',
            tier === 'diamond' ? 'loyalty-sheet__card-front--diamond' : '',
          ].filter(Boolean).join(' ')}
        >
          <span className="loyalty-sheet__card-tier">{tier.toUpperCase()}</span>
          <svg className="loyalty-sheet__card-logo" width="76" height="64" viewBox="0 0 38 32" fill="none" aria-hidden>
            {LOYALTY_CARD_LOGO_PATHS}
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

function formatTimeLeft(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

function LiveTimer({ initialMs }: { initialMs: number }) {
  const startRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    startRef.current = Date.now();
    setElapsed(0);
    const id = setInterval(() => setElapsed(Date.now() - startRef.current), 1000);
    return () => clearInterval(id);
  }, [initialMs]);

  const remaining = Math.max(0, initialMs - elapsed);

  return (
    <div className="home-page__event-card-timer">
      <span className="home-page__event-card-timer-label">Time left:</span>
      <span className="home-page__event-card-timer-value">{formatTimeLeft(remaining)}</span>
    </div>
  );
}

function paymentLabel(type: PaymentType): string {
  switch (type) {
    case 'prize-draw': return 'Prize Draw';
    case 'redeem': return 'Redeem';
    case 'auction': return 'Current bid';
    default: return '';
  }
}

const PAYMENT_ROUTE_MAP: Record<PaymentType, string> = {
  'prize-draw': '#draw',
  'redeem': '#redeem',
  'auction': '#auction',
  'cash': '#standard',
  'flex': '#standard',
  'linkout': '#linkout',
  'waitlist': '#waitlist',
};

function getCardRoute(event: EventCard): string {
  const registryEvent = EVENT_REGISTRY.find((e) => e.id === event.id);
  if (registryEvent) return getEventRoute(registryEvent);
  return PAYMENT_ROUTE_MAP[event.paymentType] ?? '#';
}

/* ── Icons ────────────────────────────────────────────────────────────── */

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M11 19a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function IconCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path fillRule="evenodd" clipRule="evenodd" d="M12.798 3.72C11.444 3.117 9.93 2.967 8.485 3.294 7.039 3.62 5.737 4.406 4.774 5.533 3.81 6.66 3.237 8.068 3.14 9.548 3.042 11.027 3.426 12.498 4.233 13.742 5.04 14.986 6.227 15.935 7.617 16.449 9.008 16.963 10.528 17.013 11.949 16.593 13.371 16.173 14.619 15.304 15.506 14.116 16.394 12.929 16.874 11.487 16.875 10.004V8.689H18.125V10.004C18.124 11.756 17.557 13.462 16.508 14.865 15.459 16.268 13.984 17.295 12.304 17.792 10.624 18.288 8.828 18.229 7.184 17.622 5.541 17.014 4.138 15.892 3.184 14.422 2.23 12.952 1.777 11.214 1.893 9.465 2.008 7.717 2.685 6.053 3.824 4.721 4.962 3.389 6.5 2.461 8.21 2.075 9.918 1.689 11.707 1.865 13.307 2.578L13.878 2.833 13.369 3.975 12.798 3.72Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M18.384 4.178L9.808 12.54 6.616 9.43 7.488 8.535 9.807 10.794 17.511 3.283 18.384 4.178Z" fill="currentColor"/>
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconAccount() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconMenuBurger() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden>
      <path d="M0 1h16M0 6h16M0 11h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}


/* ── Top Experiences Carousel ─────────────────────────────────────────── */

function TopExperiencesCarousel({ experiences }: { experiences: TopExperience[] }) {
  const len = experiences.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const wrap = (i: number) => ((i % len) + len) % len;

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === activeIndex) {
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [activeIndex]);

  const goTo = (index: number) => {
    setActiveIndex(wrap(index));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchDeltaX.current < -40) goTo(activeIndex + 1);
    else if (touchDeltaX.current > 40) goTo(activeIndex - 1);
    touchDeltaX.current = 0;
  };

  const visibleCards = () => {
    const cards: { exp: TopExperience; index: number; position: 'left' | 'center' | 'right' }[] = [];
    for (let offset = -2; offset <= 2; offset++) {
      const idx = wrap(activeIndex + offset);
      cards.push({
        exp: experiences[idx],
        index: idx,
        position: offset === 0 ? 'center' : offset < 0 ? 'left' : 'right',
      });
    }
    return cards;
  };

  return (
    <section className="home-page__top-section">
      <div className="home-page__section-header">
        <h2 className="home-page__section-title">Top experiences worldwide</h2>
      </div>

      <div
        ref={containerRef}
        className="home-page__top-carousel"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {visibleCards().map(({ exp, index, position }) => {
          const isActive = position === 'center';
          return (
            <div
              key={exp.id}
              className={`home-page__top-card${isActive ? ' home-page__top-card--active' : ''}`}
              onClick={() => {
                if (isActive) {
                  window.location.hash = exp.hash;
                } else {
                  goTo(index);
                }
              }}
            >
              {isActive && exp.video ? (
                <video
                  ref={(el) => { videoRefs.current[index] = el; }}
                  className="home-page__top-card-media"
                  src={exp.video}
                  poster={exp.image}
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img className="home-page__top-card-media" src={exp.image} alt={exp.title} loading="lazy" />
              )}
              <div className="home-page__top-card-gradient" />

              {isActive && exp.video && (
                <button
                  type="button"
                  className="home-page__top-card-play"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  onClick={(e) => {
                    e.stopPropagation();
                    const vid = videoRefs.current[index];
                    if (!vid) return;
                    if (vid.paused) {
                      vid.play().then(() => setIsPlaying(true)).catch(() => {});
                    } else {
                      vid.pause();
                      setIsPlaying(false);
                    }
                  }}
                >
                  {isPlaying ? <IconPause /> : <IconPlay />}
                </button>
              )}

              <h3 className="home-page__top-card-title">{exp.title}</h3>
            </div>
          );
        })}
      </div>

      <div className="home-page__top-indicators">
        {experiences.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`home-page__top-indicator${i === activeIndex ? ' home-page__top-indicator--active' : ''}`}
            aria-label={`Go to experience ${i + 1}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </section>
  );
}

/* ── Sub-components ───────────────────────────────────────────────────── */

function EventCardCompact({
  event,
  isFav,
  onFavToggle,
}: {
  event: EventCard;
  isFav: boolean;
  onFavToggle: () => void;
}) {
  const label = paymentLabel(event.paymentType);

  const handleCardClick = () => {
    window.location.hash = getCardRoute(event);
  };

  return (
    <article className="home-page__event-card" onClick={handleCardClick}>
      <div className="home-page__event-card-img">
        <img src={event.image} alt={event.title} loading="lazy" style={event.imagePosition ? { objectPosition: event.imagePosition } : undefined} />
        {event.marketingTag && <MarketingTag type={event.marketingTag} className="home-page__event-card-marketing-tag" />}
        <button
          type="button"
          className="home-page__event-card-fav"
          aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
          aria-pressed={isFav}
          onClick={(e) => { e.stopPropagation(); onFavToggle(); }}
        >
          <IconHeart filled={isFav} />
        </button>
        {isExplorerExclusiveMarketingTag(event.marketingTag) ? (
          <ExplorerOnlyCardFooter variant="imageOverlay" />
        ) : null}
      </div>
      <div className="home-page__event-card-body">
        <div className="home-page__event-card-meta">
          <div className="home-page__event-card-date-title">
            <span className="home-page__event-card-date">{event.date}</span>
            <h3 className="home-page__event-card-title">{event.title}</h3>
          </div>
          {event.eventTag ? (
            <span className="home-page__event-card-tag">{event.eventTag}</span>
          ) : null}
        </div>
        <div className="home-page__event-card-payment-stack">
          {(label || event.points || (event.paymentType === 'cash' && event.cashPrice)) ? (
            <div className="home-page__event-card-payment-primary">
              {label ? <span className="home-page__event-card-payment-label">{label}</span> : null}
              {event.points ? (
                <div className="home-page__event-card-points">
                  <IconStar />
                  <span>{event.points}</span>
                </div>
              ) : null}
              {event.paymentType === 'cash' && event.cashPrice ? (
                <div className="home-page__event-card-points home-page__event-card-points--eur">
                  <span className="home-page__event-card-cash-from">from</span>
                  <span>{event.cashPrice}</span>
                </div>
              ) : null}
            </div>
          ) : null}
          {event.hasTimer && event.msLeft != null ? (
            <LiveTimer initialMs={event.msLeft} />
          ) : null}
        </div>
      </div>
    </article>
  );
}

/* ── Desktop-only components ──────────────────────────────────────────── */

function Pagination({ current, total, onPrev, onNext }: { current: number; total: number; onPrev?: () => void; onNext?: () => void }) {
  if (total <= 1) return null;
  return (
    <div className="home-page__pagination">
      <button type="button" className="home-page__pagination-btn" disabled={current <= 1} aria-label="Previous page" onClick={onPrev}>
        <IconChevronLeft />
      </button>
      <span className="home-page__pagination-counter">{current} / {total}</span>
      <button type="button" className="home-page__pagination-btn" disabled={current >= total} aria-label="Next page" onClick={onNext}>
        <IconChevronRight />
      </button>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */

export default function HomePage() {
  const { points: USER_POINTS, loyaltyTier: userLoyaltyTier, testProfileId, isVoyagerSubscriber } = useUser();

  const NEXT_TRIP_EVENTS = useMemo(
    () =>
      takeSortedWithVoyagerExclusiveCap(
        sortEventsForProfileAndPointsBalance(
          EVENT_REGISTRY.filter((e) => e.city === 'Paris' && isAccor(e)),
          testProfileId,
          USER_POINTS,
          'home-next-trip',
        ),
        isVoyagerSubscriber,
        8,
        /* Up to 3 Explorer-only (presale/exclusivity) cards per page so the strip is visible without a subscriber profile */
        isVoyagerSubscriber ? 8 : 3,
      ).map(registryToCard),
    [testProfileId, USER_POINTS, isVoyagerSubscriber],
  );

  const CONCERTS_EVENTS = useMemo(
    () =>
      takeSortedWithVoyagerExclusiveCap(
        sortEventsForProfileAndPointsBalance(
          EVENT_REGISTRY.filter((e) => e.category === 'Concerts and festivals' && isAccor(e)),
          testProfileId,
          USER_POINTS,
          'home-concerts',
        ),
        isVoyagerSubscriber,
        8,
        1,
      ).map(registryToCard),
    [testProfileId, USER_POINTS, isVoyagerSubscriber],
  );

  const SPORT_EVENTS = useMemo(
    () =>
      takeSortedWithVoyagerExclusiveCap(
        sortEventsForProfileAndPointsBalance(
          EVENT_REGISTRY.filter((e) => e.category === 'Sport and leisure' && isAccor(e)),
          testProfileId,
          USER_POINTS,
          'home-sport',
        ),
        isVoyagerSubscriber,
        8,
        1,
      ).map(registryToCard),
    [testProfileId, USER_POINTS, isVoyagerSubscriber],
  );

  const PRIZE_DRAW_EVENTS = useMemo(
    () =>
      takeSortedWithVoyagerExclusiveCap(
        sortEventsForProfileAndPointsBalance(
          EVENT_REGISTRY.filter((e) => e.pageType === 'prize-draw' && isAccor(e)),
          testProfileId,
          USER_POINTS,
          'home-prize-draw',
        ),
        isVoyagerSubscriber,
        8,
        1,
      ).map(registryToCard),
    [testProfileId, USER_POINTS, isVoyagerSubscriber],
  );

  const AUCTION_EVENTS = useMemo(
    () =>
      takeSortedWithVoyagerExclusiveCap(
        sortEventsForProfileAndPointsBalance(
          EVENT_REGISTRY.filter((e) => e.pageType === 'auction'),
          testProfileId,
          USER_POINTS,
          'home-auctions',
        ),
        isVoyagerSubscriber,
        8,
        1,
      ).map(registryToCard),
    [testProfileId, USER_POINTS, isVoyagerSubscriber],
  );

  const suggestedHomeCity = PLANNED_TRIP?.city ?? 'Paris';

  const SUGGESTED_FOR_YOU_EVENTS = useMemo(
    () =>
      takeSortedWithVoyagerExclusiveCap(
        sortEventsForProfileAndPointsBalancePreferredCityFirst(
          EVENT_REGISTRY.filter((e) => isAccor(e)),
          testProfileId,
          USER_POINTS,
          'home-suggested-for-you',
          suggestedHomeCity,
        ),
        isVoyagerSubscriber,
        8,
        2,
      ).map(registryToCard),
    [testProfileId, USER_POINTS, isVoyagerSubscriber, suggestedHomeCity],
  );

  const { toggleFavourite: toggleFavCtx } = useFavourites();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuInitialView, setMenuInitialView] = useState<MenuView>('navigation');
  const [loyaltyOpen, setLoyaltyOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [showFavSnack, setShowFavSnack] = useState(false);

  const [citySelectorOpen, setCitySelectorOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState('');
  const cityInputRef = useRef<HTMLInputElement>(null);

  const filteredCities = useMemo(() => {
    if (!cityQuery.trim()) return ALL_CITIES;
    const q = cityQuery.toLowerCase();
    return ALL_CITIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q),
    );
  }, [cityQuery]);

  useEffect(() => {
    if (citySelectorOpen) {
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => cityInputRef.current?.focus());
    } else {
      document.body.style.overflow = '';
      setCityQuery('');
    }
    return () => { document.body.style.overflow = ''; };
  }, [citySelectorOpen]);

  const [heroSearchActive, setHeroSearchActive] = useState(false);
  const [heroQuery, setHeroQuery] = useState('');
  const heroInputRef = useRef<HTMLInputElement>(null);
  const heroSearchWrapRef = useRef<HTMLDivElement>(null);

  const closeHeroSearch = () => {
    setHeroSearchActive(false);
    setHeroQuery('');
  };

  useEffect(() => {
    if (!heroSearchActive) return;
    requestAnimationFrame(() => heroInputRef.current?.focus());
  }, [heroSearchActive]);

  useEffect(() => {
    if (!heroSearchActive) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (heroSearchWrapRef.current && !heroSearchWrapRef.current.contains(e.target as Node)) {
        closeHeroSearch();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeHeroSearch();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [heroSearchActive]);

  const handleHeroSearchClick = () => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (isDesktop) {
      setHeroSearchActive(true);
    } else {
      setSearchOpen(true);
    }
  };

  const perPage = 4;

  const [ntPage, setNtPage] = useState(1);
  const ntTotalPages = Math.ceil(NEXT_TRIP_EVENTS.length / perPage);
  const ntVisible = NEXT_TRIP_EVENTS.slice((ntPage - 1) * perPage, ntPage * perPage);

  const [cfPage, setCfPage] = useState(1);
  const cfTotalPages = Math.ceil(CONCERTS_EVENTS.length / perPage);
  const cfVisible = CONCERTS_EVENTS.slice((cfPage - 1) * perPage, cfPage * perPage);

  const [slPage, setSlPage] = useState(1);
  const slTotalPages = Math.ceil(SPORT_EVENTS.length / perPage);
  const slVisible = SPORT_EVENTS.slice((slPage - 1) * perPage, slPage * perPage);

  const [pdPage, setPdPage] = useState(1);
  const pdTotalPages = Math.ceil(PRIZE_DRAW_EVENTS.length / perPage);
  const pdVisible = PRIZE_DRAW_EVENTS.slice((pdPage - 1) * perPage, pdPage * perPage);

  const [auPage, setAuPage] = useState(1);
  const auTotalPages = Math.ceil(AUCTION_EVENTS.length / perPage);
  const auVisible = AUCTION_EVENTS.slice((auPage - 1) * perPage, auPage * perPage);

  const [sgPage, setSgPage] = useState(1);
  const sgTotalPages = Math.ceil(SUGGESTED_FOR_YOU_EVENTS.length / perPage);
  const sgVisible = SUGGESTED_FOR_YOU_EVENTS.slice((sgPage - 1) * perPage, sgPage * perPage);

  const [citiesPage, setCitiesPage] = useState(1);
  const citiesTotalPages = Math.ceil(POPULAR_CITIES.length / perPage);
  const citiesVisible = POPULAR_CITIES.slice((citiesPage - 1) * perPage, citiesPage * perPage);

  const toggleFavourite = (id: string) => {
    const wasAdded = !favourites.has(id);
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (wasAdded) {
      setShowFavSnack(true);
      setTimeout(() => setShowFavSnack(false), 5000);
    }
    const evt = EVENT_REGISTRY.find((e) => e.id === id);
    if (evt) {
      toggleFavCtx({
        id: evt.id,
        image: evt.image,
        date: evt.date,
        title: evt.title,
        eventTag: evt.eventTag ?? '',
        paymentLabel: getPaymentLabel(evt.pageType),
        points: evt.pageType === 'standard' ? formatStandardEventListPrice(evt) : formatPoints(evt.points),
        countdown: evt.msLeft ? '' : '',
        hideRewardsIcon: evt.pageType === 'standard',
      });
    }
  };

  const allEvents = useMemo(
    () =>
      Array.from(
        new Map(
          [...NEXT_TRIP_EVENTS, ...SUGGESTED_FOR_YOU_EVENTS, ...CONCERTS_EVENTS, ...SPORT_EVENTS, ...PRIZE_DRAW_EVENTS, ...AUCTION_EVENTS].map((e) => [e.id, e]),
        ).values(),
      ),
    [NEXT_TRIP_EVENTS, SUGGESTED_FOR_YOU_EVENTS, CONCERTS_EVENTS, SPORT_EVENTS, PRIZE_DRAW_EVENTS, AUCTION_EVENTS],
  );

  useEffect(() => {
    setSgPage(1);
  }, [testProfileId, USER_POINTS]);

  const menuFavourites: MenuFavouriteEvent[] = useMemo(
    () =>
      allEvents
        .filter((e) => favourites.has(e.id))
        .map((e) => ({
          id: e.id,
          image: e.image,
          date: e.date,
          title: e.title,
          eventTag: e.eventTag ?? '',
          paymentLabel: paymentLabel(e.paymentType),
          points: e.points ?? e.cashPrice ?? '',
          countdown: e.msLeft ? formatTimeLeft(e.msLeft) : '',
          hideRewardsIcon: e.paymentType === 'cash',
        })),
    [allEvents, favourites],
  );

  return (
    <div className="home-page">
      <MarketplaceHeader
        theme="light"
        isLoggedIn
        avatarSrc="/avatar.png"
        points={USER_POINTS}
        loyaltyTier={userLoyaltyTier}
        hideSearch
        transparentOnTop
        className="home-page__mobile-header"
        onLogoClick={() => { window.location.href = window.location.pathname; }}
        onMenu={() => { setMenuInitialView('navigation'); setMenuOpen(true); }}
        onAvatarClick={() => { setMenuInitialView('profile'); setMenuOpen(true); }}
        onPointsClick={() => setLoyaltyOpen(true)}
      />

      {showFavSnack && (
        <div className="home-page__fav-snack" role="status">
          <svg className="home-page__fav-snack-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="10" fill="#00513f" />
            <path d="M8 12l3 3 5-5" stroke="#caffea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="home-page__fav-snack-content">
            <p className="home-page__fav-snack-title">Added to your favourites</p>
            <p className="home-page__fav-snack-body">You can review your favourites in your profile menu.</p>
          </div>
          <button
            type="button"
            className="home-page__fav-snack-close"
            onClick={() => setShowFavSnack(false)}
            aria-label="Close notification"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Desktop Navbar (desktop only) ─────────────────────────────── */}
      <nav className="home-page__desktop-nav">
        <img src={allAccorLogo} alt="ALL Accor" className="home-page__desktop-nav-logo" />
        <button
          type="button"
          className="home-page__desktop-nav-points"
          onClick={() => setLoyaltyOpen(true)}
          aria-label={`${USER_POINTS.toLocaleString()} points`}
        >
          <IconStar />
          <span>{USER_POINTS.toLocaleString()}</span>
        </button>
        <div className="home-page__desktop-nav-actions">
          <button
            type="button"
            className="home-page__desktop-nav-btn"
            aria-label="Account"
            onClick={() => { setMenuInitialView('profile'); setMenuOpen(true); }}
          >
            <IconAccount />
          </button>
          <button
            type="button"
            className="home-page__desktop-nav-btn home-page__desktop-nav-menu"
            onClick={() => { setMenuInitialView('navigation'); setMenuOpen(true); }}
          >
            <IconMenuBurger />
            <span>MENU</span>
          </button>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="home-page__hero">
        <div className="home-page__hero-bg">
          <img src={HERO_IMAGE} alt="" />
        </div>

        <MarketplaceHeader
          theme="light"
          isLoggedIn
          avatarSrc="/avatar.png"
          points={USER_POINTS}
          loyaltyTier={userLoyaltyTier}
          hideSearch
          transparentOnTop
          className="home-page__mobile-header"
          onLogoClick={() => { window.location.href = window.location.pathname; }}
          onMenu={() => { setMenuInitialView('navigation'); setMenuOpen(true); }}
          onAvatarClick={() => { setMenuInitialView('profile'); setMenuOpen(true); }}
          onPointsClick={() => setLoyaltyOpen(true)}
        />

        <div className="home-page__hero-content">
          <h1 className="home-page__hero-title">
            Unforgettable
            <br />
            experiences
          </h1>
          <p className="home-page__hero-subtitle">
            Cinema, music, sports, culture &amp; more
          </p>
          <div className="home-page__hero-search-wrap" ref={heroSearchWrapRef}>
            <div
              className={`home-page__hero-search${heroSearchActive ? ' home-page__hero-search--active' : ''}`}
              role="button"
              tabIndex={0}
              aria-label="Search for events"
              onClick={handleHeroSearchClick}
              onKeyDown={(e) => e.key === 'Enter' && handleHeroSearchClick()}
            >
              <IconSearch />
              {heroSearchActive ? (
                <input
                  ref={heroInputRef}
                  type="text"
                  className="home-page__hero-search-input"
                  placeholder="Find event or city"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span>Find event or city</span>
              )}
            </div>
            {heroSearchActive && (
              <div className="home-page__hero-search-dropdown">
                <SearchResultsPanel query={heroQuery} onQueryChange={setHeroQuery} />
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ── Next trip to [city] ──────────────────────────────────────── */}
      {PLANNED_TRIP && (
        <section className="home-page__section home-page__next-trip-section">
          <div className="home-page__section-header">
            <h2 className="home-page__section-title">Next trip to {PLANNED_TRIP.city}</h2>
            <button
              type="button"
              className="home-page__section-link"
              onClick={() => { window.location.hash = `#city/${PLANNED_TRIP!.city.toLowerCase()}?from=${PLANNED_TRIP!.dateFrom}&to=${PLANNED_TRIP!.dateTo}`; }}
            >See all</button>
          </div>
          <div className="home-page__scroll">
            {ntVisible.map((event) => (
              <EventCardCompact
                key={event.id}
                event={event}
                isFav={favourites.has(event.id)}
                onFavToggle={() => toggleFavourite(event.id)}
              />
            ))}
          </div>
          <Pagination
            current={ntPage}
            total={ntTotalPages}
            onPrev={() => setNtPage((p) => Math.max(1, p - 1))}
            onNext={() => setNtPage((p) => Math.min(ntTotalPages, p + 1))}
          />
        </section>
      )}

      {/* ── Top experiences worldwide ────────────────────────────────── */}
      <TopExperiencesCarousel experiences={TOP_EXPERIENCES} />

      {/* ── Categories (mobile only) ─────────────────────────────────── */}
      <section className="home-page__section home-page__categories-section">
        <div className="home-page__section-header">
          <h2 className="home-page__section-title">Categories</h2>
          <button type="button" className="home-page__section-link" onClick={() => { window.location.hash = '#categories'; }}>See all</button>
        </div>
        <div className="home-page__scroll">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.label}
              className="home-page__category-card"
              href={cat.hash}
              onClick={(e) => { e.preventDefault(); window.location.hash = cat.hash; }}
            >
              <div className="home-page__category-card-img">
                <img src={cat.image} alt={cat.label} loading="lazy" />
              </div>
              <span className="home-page__category-card-label">{cat.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── Suggested for you (profile + points + Explorer-exclusive cap) ───────── */}
      {SUGGESTED_FOR_YOU_EVENTS.length > 0 ? (
        <section
          className={`home-page__section home-page__suggested home-page__suggested--${userLoyaltyTier}`}
          aria-labelledby="home-suggested-heading"
        >
          <div className="home-page__section-header">
            <h2 id="home-suggested-heading" className="home-page__section-title">
              Suggested for you
            </h2>
            <button
              type="button"
              className="home-page__section-link"
              onClick={() => { window.location.hash = '#category/suggested-for-you'; }}
            >
              See all
            </button>
          </div>
          <div className="home-page__scroll">
            {sgVisible.map((event) => (
              <EventCardCompact
                key={event.id}
                event={event}
                isFav={favourites.has(event.id)}
                onFavToggle={() => toggleFavourite(event.id)}
              />
            ))}
          </div>
          <Pagination
            current={sgPage}
            total={sgTotalPages}
            onPrev={() => setSgPage((p) => Math.max(1, p - 1))}
            onNext={() => setSgPage((p) => Math.min(sgTotalPages, p + 1))}
          />
        </section>
      ) : null}

      {/* ── Event sections (order varies by profile) ─────────────────── */}
      {(() => {
        const makeSection = (key: string, title: string, hash: string, visible: EventCard[], page: number, totalPages: number, onPrev: () => void, onNext: () => void) => (
          <section key={key} className="home-page__section">
            <div className="home-page__section-header">
              <h2 className="home-page__section-title">{title}</h2>
              <button type="button" className="home-page__section-link" onClick={() => { window.location.hash = hash; }}>See all</button>
            </div>
            <div className="home-page__scroll">
              {visible.map((event) => (
                <EventCardCompact
                  key={event.id}
                  event={event}
                  isFav={favourites.has(event.id)}
                  onFavToggle={() => toggleFavourite(event.id)}
                />
              ))}
            </div>
            <Pagination current={page} total={totalPages} onPrev={onPrev} onNext={onNext} />
          </section>
        );

        const concertsSection = makeSection('concerts', 'Concerts and festivals', '#category/concerts-and-festivals', cfVisible, cfPage, cfTotalPages, () => setCfPage((p) => Math.max(1, p - 1)), () => setCfPage((p) => Math.min(cfTotalPages, p + 1)));
        const sportSection = makeSection('sport', 'Sport and leisure', '#category/sport-and-leisure', slVisible, slPage, slTotalPages, () => setSlPage((p) => Math.max(1, p - 1)), () => setSlPage((p) => Math.min(slTotalPages, p + 1)));
        const prizeDrawSection = makeSection('prize-draw', 'Prize Draw', '#payment/prize-draws', pdVisible, pdPage, pdTotalPages, () => setPdPage((p) => Math.max(1, p - 1)), () => setPdPage((p) => Math.min(pdTotalPages, p + 1)));
        const auctionsSection = makeSection('auctions', 'Auctions', '#payment/auctions', auVisible, auPage, auTotalPages, () => setAuPage((p) => Math.max(1, p - 1)), () => setAuPage((p) => Math.min(auTotalPages, p + 1)));

        if (testProfileId === 'silver') {
          return [prizeDrawSection, concertsSection, sportSection, auctionsSection];
        }
        return [auctionsSection, concertsSection, sportSection, prizeDrawSection];
      })()}

      {/* ── Popular cities ───────────────────────────────────────────── */}
      <section className="home-page__section home-page__cities-section">
        <div className="home-page__section-header">
          <h2 className="home-page__section-title">Popular cities</h2>
        </div>
        <div className="home-page__scroll home-page__cities-scroll">
          {citiesVisible.map((city) => (
            <div
              key={city.name}
              className="home-page__city-card"
              role="button"
              tabIndex={0}
              onClick={() => { window.location.hash = `#city/${city.name.toLowerCase()}`; }}
              onKeyDown={(e) => { if (e.key === 'Enter') { window.location.hash = `#city/${city.name.toLowerCase()}`; } }}
            >
              <img className="home-page__city-card-img" src={city.image} alt={city.name} loading="lazy" />
              <div className="home-page__city-card-ratio" />
              <div className="home-page__city-card-overlay">
                <div className="home-page__city-card-gradient" />
                <div className="home-page__city-card-text">
                  <span className="home-page__city-card-country">{city.country}</span>
                  <h3 className="home-page__city-card-name">{city.name}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Pagination
          current={citiesPage}
          total={citiesTotalPages}
          onPrev={() => setCitiesPage((p) => Math.max(1, p - 1))}
          onNext={() => setCitiesPage((p) => Math.min(citiesTotalPages, p + 1))}
        />
      </section>

      {/* ── Near cities ──────────────────────────────────────────────── */}
      <section className="home-page__section home-page__near-cities-section">
        <div className="home-page__near-cities-card">
          <h2 className="home-page__near-cities-title">Near cities</h2>
          <div className="home-page__near-cities">
            {NEAR_CITIES.map((city) => (
              <button
                key={city.name}
                type="button"
                className="home-page__near-city-chip"
                onClick={() => { window.location.hash = city.hash; }}
              >
                <IconPin />
                {city.name}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="home-page__find-city-btn"
            onClick={() => setCitySelectorOpen(true)}
          >
            <IconSearch />
            Find your city
          </button>
        </div>
      </section>

      {/* ── City Selector Dialog ──────────────────────────────────────── */}
      {citySelectorOpen && (
        <div className="city-selector__backdrop" onClick={() => setCitySelectorOpen(false)}>
          <div
            className="city-selector"
            role="dialog"
            aria-modal
            aria-label="Select your city"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="city-selector__header">
              <span className="city-selector__title">Select your city</span>
              <button
                type="button"
                className="city-selector__close"
                onClick={() => setCitySelectorOpen(false)}
                aria-label="Close"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M11 1L1 11M1 1l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="city-selector__body">
              <button
                type="button"
                className="city-selector__back"
                onClick={() => setCitySelectorOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to Homepage
              </button>
              <div className="city-selector__input-wrap">
                <IconSearch />
                <input
                  ref={cityInputRef}
                  type="text"
                  className="city-selector__input"
                  placeholder="Search a city"
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                />
              </div>
              <div className="city-selector__list">
                {filteredCities.map((city) => (
                  <button
                    key={city.hash}
                    type="button"
                    className="city-selector__item"
                    onClick={() => { window.location.hash = city.hash; }}
                  >
                    <span className="city-selector__item-name">{city.name},</span>
                    {' '}
                    <span className="city-selector__item-country">{city.country}</span>
                  </button>
                ))}
                {filteredCities.length === 0 && (
                  <p className="city-selector__empty">No cities found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ALL Accor Banner (Figma 6905-44832) ───────────────────────── */}
      <div className="home-page__banner">
        <div className="home-page__banner-visual">
          <img src={BANNER_IMAGE} alt="" />
          <div
            className="home-page__banner-loyalty-card"
            role="img"
            aria-label={`ALL Accor ${userLoyaltyTier.charAt(0).toUpperCase() + userLoyaltyTier.slice(1)} membership card`}
          >
            <div className="home-page__banner-loyalty-card-scale">
              <LoyaltyProgramCardVisual tier={userLoyaltyTier} variant="banner" />
            </div>
          </div>
        </div>
        <div className="home-page__banner-content">
          <div className="home-page__banner-text">
            <h2 className="home-page__banner-title">
              ALL Accor, the world's most awarded travel programme.
            </h2>
            <ul className="home-page__banner-checks">
              <li className="home-page__banner-check">
                <IconCheck />
                <span>Best rates guaranteed</span>
              </li>
              <li className="home-page__banner-check">
                <IconCheck />
                <span>Earn &amp; redeem points in 100+ ways</span>
              </li>
              <li className="home-page__banner-check">
                <IconCheck />
                <span>Exclusive perks on every stay</span>
              </li>
              <li className="home-page__banner-check">
                <IconCheck />
                <span>Access 2000+ unique global events</span>
              </li>
            </ul>
          </div>
          <button type="button" className="home-page__banner-cta">
            Join ALL Accor for free
          </button>
        </div>
      </div>

      {/* ── Menu ─────────────────────────────────────────────────────── */}
      <Menu
        open={menuOpen}
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
        favouriteEvents={menuFavourites}
        onToggleFavourite={toggleFavourite}
        selectedCity="Paris"
        initialView={menuInitialView}
      />

      {/* ── Search ─────────────────────────────────────────────────── */}
      <Search open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ── Loyalty Sheet ────────────────────────────────────────────── */}
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
              <LoyaltyProgramCardVisual tier={userLoyaltyTier} />
              <a
                href="https://all.accor.com/loyalty-program/en/reasontojoin/index.vhtml"
                className="loyalty-sheet__link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Discover your benefits and status level
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
