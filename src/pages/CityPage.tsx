import { useState, useRef, useEffect } from 'react';
import { MarketplaceHeader, Menu, MarketingTag } from '@/components';
import type { MenuFavouriteEvent, MenuView } from '@/components';
import { getNearbyCities, searchCities } from '@/data/europeanCities';
import { EVENT_REGISTRY, getEventRoute, getPaymentLabel, formatPoints, type EventData, type MarketingTagType } from '@/data/events/eventRegistry';
import { useUser } from '@/context/UserContext';
import { useFavourites } from '@/context/FavouritesContext';
import './CityPage.css';

/* ── Types ──────────────────────────────────────────────────────────── */

type PaymentType = 'prize-draw' | 'redeem' | 'auction' | 'cash' | 'flex' | 'linkout' | 'waitlist';

interface EventCard {
  id: string;
  title: string;
  date: string;
  image: string;
  paymentType?: PaymentType;
  points?: string;
  cashPrice?: string;
  hasTimer?: boolean;
  msLeft?: number;
  eventTag?: string;
  route?: string;
  marketingTag?: MarketingTagType;
}

interface CityConfig {
  heroImage: string;
  subtitle: string;
}

export interface CityPageProps {
  cityName: string;
  country: string;
  dateFrom?: string;
  dateTo?: string;
}

/* ── City-specific config ───────────────────────────────────────────── */

const CITY_CONFIGS: Record<string, CityConfig> = {
  Paris: {
    heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=600&fit=crop',
    subtitle: 'Things to do: events, experiences and more',
  },
  Rome: {
    heroImage: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&h=600&fit=crop',
    subtitle: 'Things to do: events, experiences and more',
  },
  Madrid: {
    heroImage: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=600&fit=crop',
    subtitle: 'Things to do: events, experiences and more',
  },
  London: {
    heroImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=600&fit=crop',
    subtitle: 'Things to do: events, experiences and more',
  },
  Barcelona: {
    heroImage: 'https://images.unsplash.com/photo-1583422409516-2895a77efed6?w=1200&h=600&fit=crop',
    subtitle: 'Things to do: events, experiences and more',
  },
  Lisbon: {
    heroImage: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&h=600&fit=crop',
    subtitle: 'Things to do: events, experiences and more',
  },
  Amsterdam: {
    heroImage: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5571?w=1200&h=600&fit=crop',
    subtitle: 'Things to do: events, experiences and more',
  },
  Berlin: {
    heroImage: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200&h=600&fit=crop',
    subtitle: 'Things to do: events, experiences and more',
  },
  Vienna: {
    heroImage: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1200&h=600&fit=crop',
    subtitle: 'Things to do: events, experiences and more',
  },
  Prague: {
    heroImage: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1200&h=600&fit=crop',
    subtitle: 'Things to do: events, experiences and more',
  },
  Lyon: {
    heroImage: 'https://images.unsplash.com/photo-1524396309943-e03f5249f002?w=1200&h=600&fit=crop',
    subtitle: 'Things to do: events, experiences and more',
  },
  Marseille: {
    heroImage: 'https://images.unsplash.com/photo-1589098489687-3f596595bac5?w=1200&h=600&fit=crop',
    subtitle: 'Things to do: events, experiences and more',
  },
  Nice: {
    heroImage: 'https://images.unsplash.com/photo-1491166617655-0723a0999cfc?w=1200&h=600&fit=crop',
    subtitle: 'Things to do: events, experiences and more',
  },
  Bordeaux: {
    heroImage: 'https://images.unsplash.com/photo-1565791380713-1756b9a05343?w=1200&h=600&fit=crop',
    subtitle: 'Things to do: events, experiences and more',
  },
  Toulouse: {
    heroImage: 'https://images.unsplash.com/photo-1582652625584-40bfcb26a0c5?w=1200&h=600&fit=crop',
    subtitle: 'Things to do: events, experiences and more',
  },
  Strasbourg: {
    heroImage: 'https://images.unsplash.com/photo-1555990793-da11153b2473?w=1200&h=600&fit=crop',
    subtitle: 'Things to do: events, experiences and more',
  },
};

const DEFAULT_CONFIG: CityConfig = {
  heroImage: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&h=600&fit=crop',
  subtitle: 'Things to do: events, experiences and more',
};

/* ── Helpers ────────────────────────────────────────────────────────── */

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
    <div className="city-page__event-card-timer">
      <span className="city-page__event-card-timer-label">Time left:</span>
      <span>{formatTimeLeft(remaining)}</span>
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

function parseEventDate(dateStr: string): Date | null {
  const cleaned = dateStr.replace(/[-–]\d+/, '');
  const ts = Date.parse(cleaned);
  return isNaN(ts) ? null : new Date(ts);
}

function isEventInRange(dateStr: string, from: string, to: string): boolean {
  const eventDate = parseEventDate(dateStr);
  if (!eventDate) return false;
  const start = new Date(from + 'T00:00:00');
  const end = new Date(to + 'T23:59:59');
  return eventDate >= start && eventDate <= end;
}

function formatFilterDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
}

/* ── Registry-derived event helpers ─────────────────────────────────── */

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
    points: e.pageType !== 'standard' ? `${formatPoints(e.points)} Reward Points` : undefined,
    cashPrice: e.pageType === 'standard' ? `${formatPoints(e.points)} Points` : undefined,
    hasTimer: !!e.msLeft,
    msLeft: e.msLeft,
    eventTag: e.eventTag,
    route: getEventRoute(e),
    marketingTag: e.marketingTag,
  };
}

function getEventsForCity(cityName: string): EventData[] {
  const cityEvents = EVENT_REGISTRY.filter((e) => e.city === cityName);
  if (cityEvents.length >= 10) return cityEvents;
  const parisEvents = EVENT_REGISTRY.filter((e) => e.city === 'Paris');
  return [...cityEvents, ...parisEvents].slice(0, Math.max(cityEvents.length, 20));
}

function getTopForCity(cityName: string): EventCard[] {
  return getEventsForCity(cityName).slice(0, 10).map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date,
    image: e.image,
    route: getEventRoute(e),
  }));
}

function latLonToTile(lat: number, lon: number, zoom: number): [number, number] {
  const n = Math.pow(2, zoom);
  const x = Math.floor((lon + 180) / 360 * n);
  const latRad = lat * Math.PI / 180;
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return [x, y];
}

const MAP_ZOOM = 14;

const CITY_COORDS: Record<string, [number, number]> = {
  Paris: [48.8566, 2.3522],
  London: [51.5074, -0.1278],
  Barcelona: [41.3874, 2.1686],
  Rome: [41.9028, 12.4964],
  Berlin: [52.5200, 13.4050],
  Amsterdam: [52.3676, 4.9041],
  Madrid: [40.4168, -3.7038],
  Lisbon: [38.7223, -9.1393],
};

const MAP_PINS = [
  { id: 'p1', top: '22%', left: '30%', label: 'Event 1', isYou: false },
  { id: 'p2', top: '18%', left: '62%', label: 'Event 2', isYou: false },
  { id: 'p3', top: '35%', left: '72%', label: 'Event 3', isYou: false },
  { id: 'p4', top: '32%', left: '22%', label: 'Event 4', isYou: false },
  { id: 'p5', top: '42%', left: '38%', label: 'Event 5', isYou: false, count: 3 },
  { id: 'p6', top: '40%', left: '62%', label: 'Event 6', isYou: false },
  { id: 'p7', top: '50%', left: '50%', label: 'You are here', isYou: true },
  { id: 'p8', top: '65%', left: '78%', label: 'Event 7', isYou: false },
];

/* Event arrays are now derived from the registry inside the component */

const CATEGORIES = [
  { label: 'Shows & culture', image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=350&h=200&fit=crop', hash: '#category/shows-and-culture' },
  { label: 'Food & drinks', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=350&h=200&fit=crop', hash: '#category/food-and-drinks' },
  { label: 'Sports & leisure', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=350&h=200&fit=crop', hash: '#category/sport-and-leisure' },
  { label: 'Wellness', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=350&h=200&fit=crop', hash: '#category/wellness' },
  { label: 'Concerts & festivals', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=350&h=200&fit=crop', hash: '#category/concerts-and-festivals' },
  { label: 'Visits', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=350&h=200&fit=crop', hash: '#category/visits' },
  { label: 'Hotel experiences', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=350&h=200&fit=crop', hash: '#category/hotel-experiences' },
];

/* ── Icons ──────────────────────────────────────────────────────────── */

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

function IconHeart({ filled }: { filled: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? '#B40875' : 'none'} aria-hidden>
      <path d="M12 21l-1.35-1.2C4.8 14.4 1.5 11.3 1.5 7.4 1.5 4.4 3.9 2 6.9 2c1.8 0 3.4.9 4.5 2.3C12.5 2.9 14.2 2 16 2c3 0 5.4 2.4 5.4 5.4 0 3.9-3.3 7-9.1 12.4L12 21z" stroke={filled ? '#B40875' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function IconChevronLeft() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function Pagination({ current, total, onPrev, onNext }: { current: number; total: number; onPrev?: () => void; onNext?: () => void }) {
  if (total <= 1) return null;
  return (
    <div className="city-page__pagination">
      <button type="button" className="city-page__pagination-btn" disabled={current <= 1} aria-label="Previous page" onClick={onPrev}>
        <IconChevronLeft />
      </button>
      <span className="city-page__pagination-counter">{current} / {total}</span>
      <button type="button" className="city-page__pagination-btn" disabled={current >= total} aria-label="Next page" onClick={onNext}>
        <IconChevronRight />
      </button>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────── */

function EventCardCompact({
  event,
  isFav,
  onFavToggle,
}: {
  event: EventCard;
  isFav: boolean;
  onFavToggle: () => void;
}) {
  const label = event.paymentType ? paymentLabel(event.paymentType) : '';

  const handleCardClick = () => {
    const hash = event.route ?? (event.paymentType ? PAYMENT_ROUTE_MAP[event.paymentType] : undefined) ?? '#';
    window.location.hash = hash;
  };

  return (
    <article className="city-page__event-card" onClick={handleCardClick}>
      <div className="city-page__event-card-img">
        <img src={event.image} alt={event.title} loading="lazy" style={event.imagePosition ? { objectPosition: event.imagePosition } : undefined} />
        {event.marketingTag && <MarketingTag type={event.marketingTag} className="city-page__event-card-marketing-tag" />}
        <button
          type="button"
          className="city-page__event-card-fav"
          aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
          onClick={(e) => { e.stopPropagation(); onFavToggle(); }}
        >
          <IconHeart filled={isFav} />
        </button>
      </div>
      <div className="city-page__event-card-body">
        <span className="city-page__event-card-date">{event.date}</span>
        <h3 className="city-page__event-card-title">{event.title}</h3>
        <div className="city-page__event-card-payment">
          {label && <span className="city-page__event-card-payment-label">{label}</span>}

          {event.points && (
            <div className="city-page__event-card-points">
              <IconStar />
              <span>{event.points}</span>
            </div>
          )}

          {event.paymentType === 'cash' && event.cashPrice && (
            <span className="city-page__event-card-cash">
              <span className="city-page__event-card-cash-from">from</span>
              {event.cashPrice}
            </span>
          )}

          {event.hasTimer && event.msLeft != null && (
            <LiveTimer initialMs={event.msLeft} />
          )}
        </div>
      </div>
    </article>
  );
}

function EventSection({ title, events, favourites, onToggleFav, page, totalPages, onPrev, onNext, linkHash, linkLabel }: {
  title: string;
  events: EventCard[];
  favourites: Set<string>;
  onToggleFav: (id: string) => void;
  page?: number;
  totalPages?: number;
  onPrev?: () => void;
  onNext?: () => void;
  linkHash?: string;
  linkLabel?: string;
}) {
  return (
    <section className="city-page__section">
      <div className="city-page__section-header">
        <h2 className="city-page__section-title">{title}</h2>
        {linkHash && (
          <button type="button" className="city-page__section-link" onClick={() => { window.location.hash = linkHash; }}>{linkLabel || 'See all'}</button>
        )}
      </div>
      <div className="city-page__scroll">
        {events.map((e) => (
          <EventCardCompact key={e.id} event={e} isFav={favourites.has(e.id)} onFavToggle={() => onToggleFav(e.id)} />
        ))}
      </div>
      {page != null && totalPages != null && (
        <Pagination current={page} total={totalPages} onPrev={onPrev} onNext={onNext} />
      )}
    </section>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */

export default function CityPage({ cityName, country, dateFrom, dateTo }: CityPageProps) {
  useEffect(() => { window.scrollTo(0, 0); }, [cityName]);

  const { points: USER_POINTS, loyaltyTier: userLoyaltyTier } = useUser();
  const { toggleFavourite: toggleFavCtx } = useFavourites();

  const config = CITY_CONFIGS[cityName] ?? DEFAULT_CONFIG;
  const nearbyCities = getNearbyCities(country).filter((c) => c.name !== cityName).slice(0, 3);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuInitialView, setMenuInitialView] = useState<MenuView>('navigation');
  const [loyaltyOpen, setLoyaltyOpen] = useState(false);
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState(cityName);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [showFavSnack, setShowFavSnack] = useState(false);
  const [dateFilterActive, setDateFilterActive] = useState(!!(dateFrom && dateTo));
  const cityInputRef = useRef<HTMLInputElement>(null);

  const matchedCities = searchCities(cityQuery.trim()).slice(0, 10);

  const allCityEvents = getEventsForCity(cityName);
  const cityEvents = (dateFilterActive && dateFrom && dateTo)
    ? allCityEvents.filter((e) => isEventInRange(e.date, dateFrom, dateTo))
    : allCityEvents;
  const TOP_10 = cityEvents.slice(0, 10).map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date,
    image: e.image,
    route: getEventRoute(e),
  }));
  const ACCOR_PLUS_EVENTS = cityEvents.filter((e) => e.category === 'Hotel experiences').map(registryToCard);
  const CONCERTS_EVENTS = cityEvents.filter((e) => e.category === 'Concerts and festivals').map(registryToCard);
  const SPORT_EVENTS = cityEvents.filter((e) => e.category === 'Sport and leisure').map(registryToCard);
  const PRIZE_DRAW_EVENTS = cityEvents.filter((e) => e.pageType === 'prize-draw').map(registryToCard);
  const AUCTION_EVENTS = cityEvents.filter((e) => e.pageType === 'auction').map(registryToCard);
  const PSG_EVENTS = cityEvents.filter((e) => e.category === 'Sport and leisure' && e.title.toLowerCase().includes('psg')).map(registryToCard);

  const perPage = 4;
  const top10PerPage = 5;

  const [topPage, setTopPage] = useState(1);
  const topTotalPages = Math.ceil(TOP_10.length / top10PerPage);
  const topVisible = TOP_10.slice((topPage - 1) * top10PerPage, topPage * top10PerPage);

  const [apPage, setApPage] = useState(1);
  const apTotalPages = Math.ceil(ACCOR_PLUS_EVENTS.length / perPage);
  const apVisible = ACCOR_PLUS_EVENTS.slice((apPage - 1) * perPage, apPage * perPage);

  const [cePage, setCePage] = useState(1);
  const ceTotalPages = Math.ceil(CONCERTS_EVENTS.length / perPage);
  const ceVisible = CONCERTS_EVENTS.slice((cePage - 1) * perPage, cePage * perPage);

  const [spPage, setSpPage] = useState(1);
  const spTotalPages = Math.ceil(SPORT_EVENTS.length / perPage);
  const spVisible = SPORT_EVENTS.slice((spPage - 1) * perPage, spPage * perPage);

  const [pdPage, setPdPage] = useState(1);
  const pdTotalPages = Math.ceil(PRIZE_DRAW_EVENTS.length / perPage);
  const pdVisible = PRIZE_DRAW_EVENTS.slice((pdPage - 1) * perPage, pdPage * perPage);

  const [auPage, setAuPage] = useState(1);
  const auTotalPages = Math.ceil(AUCTION_EVENTS.length / perPage);
  const auVisible = AUCTION_EVENTS.slice((auPage - 1) * perPage, auPage * perPage);

  const [psPage, setPsPage] = useState(1);
  const psTotalPages = Math.ceil(PSG_EVENTS.length / perPage);
  const psVisible = PSG_EVENTS.slice((psPage - 1) * perPage, psPage * perPage);

  const toggleFav = (id: string) => {
    const wasAdded = !favourites.has(id);
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
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
        points: `${formatPoints(evt.points)} Reward Points`,
        countdown: '',
      });
    }
  };

  const navigateTo = (hash: string) => {
    window.location.hash = hash;
  };

  const menuFavourites: MenuFavouriteEvent[] = [];

  return (
    <div className="city-page">
      {showFavSnack && (
        <div className="city-page__fav-snack" role="status">
          <svg className="city-page__fav-snack-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="10" fill="#00513f" />
            <path d="M8 12l3 3 5-5" stroke="#caffea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="city-page__fav-snack-content">
            <p className="city-page__fav-snack-title">Added to your favourites</p>
            <p className="city-page__fav-snack-body">You can review your favourites in your profile menu.</p>
          </div>
          <button
            type="button"
            className="city-page__fav-snack-close"
            onClick={() => setShowFavSnack(false)}
            aria-label="Close notification"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      <MarketplaceHeader
        theme="light"
        isLoggedIn
        avatarSrc="/avatar.png"
        points={USER_POINTS}
        loyaltyTier={userLoyaltyTier}
        onLogoClick={() => navigateTo('')}
        onMenu={() => { setMenuInitialView('navigation'); setMenuOpen(true); }}
        onAvatarClick={() => { setMenuInitialView('profile'); setMenuOpen(true); }}
        onPointsClick={() => setLoyaltyOpen(true)}
      />

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="city-page__hero">
        <img className="city-page__hero-bg" src={config.heroImage} alt={cityName} />
        <div className="city-page__hero-gradient" />
        <div className="city-page__hero-content">
          <div className="city-page__hero-name">
            <h1>{cityName}</h1>
            <button
              type="button"
              className="city-page__hero-badge"
              onClick={() => { setCitySelectorOpen(true); setCityQuery(cityName); setTimeout(() => cityInputRef.current?.select(), 100); }}
              aria-label="Change city"
            >
              <IconChevronDown />
            </button>
          </div>
          <p className="city-page__hero-subtitle">{config.subtitle}</p>
        </div>
      </section>

      {/* ── Date filter banner ─────────────────────────────────────── */}
      {dateFrom && dateTo && dateFilterActive && (
        <div className="city-page__date-filter-bar">
          <div className="city-page__date-filter-bar-inner">
            <span className="city-page__date-filter-label">
              Showing: from {formatFilterDate(dateFrom)} to {formatFilterDate(dateTo)}
            </span>
            <button
              type="button"
              className="city-page__date-filter-clear"
              onClick={() => setDateFilterActive(false)}
              aria-label="Clear date filter"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          {cityEvents.length === 0 && (
            <p className="city-page__date-filter-empty">No events found during your trip dates.</p>
          )}
        </div>
      )}

      {/* ── Top 10 / For you ────────────────────────────────────────── */}
      <section className="city-page__section city-page__top10">
        <div className="city-page__section-header">
          <h2 className="city-page__section-title">For you</h2>
        </div>
        <div className="city-page__scroll city-page__top10-scroll">
          {topVisible.map((event, i) => (
            <button
              key={event.id}
              type="button"
              className="city-page__numbered-card"
              onClick={() => { window.location.hash = event.route || '#standard'; }}
            >
              <div className="city-page__numbered-card-img">
                <img src={event.image} alt={event.title} loading="lazy" />
                <span className="city-page__numbered-card-number">{(topPage - 1) * top10PerPage + i + 1}</span>
              </div>
              <p className="city-page__numbered-card-title">{event.title}</p>
            </button>
          ))}
        </div>
        <Pagination
          current={topPage}
          total={topTotalPages}
          onPrev={() => setTopPage((p) => Math.max(1, p - 1))}
          onNext={() => setTopPage((p) => Math.min(topTotalPages, p + 1))}
        />
      </section>

      {/* ── Near you ───────────────────────────────────────────────── */}
      <section className="city-page__section">
        <div className="city-page__section-header">
          <h2 className="city-page__section-title">Near you</h2>
          <button type="button" className="city-page__section-link" onClick={() => navigateTo(`#near-you/${cityName.toLowerCase()}`)}>See on map</button>
        </div>
        {(() => {
          const coords = CITY_COORDS[cityName] ?? [48.8566, 2.3522];
          const [cx, cy] = latLonToTile(coords[0], coords[1], MAP_ZOOM);
          const tiles: { x: number; y: number; key: string }[] = [];
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              tiles.push({ x: cx + dx, y: cy + dy, key: `${cx + dx}-${cy + dy}` });
            }
          }
          return (
            <div className="city-page__near-map">
              <div className="city-page__near-map-tiles">
                {tiles.map((t) => (
                  <img key={t.key} src={`https://a.basemaps.cartocdn.com/light_all/${MAP_ZOOM}/${t.x}/${t.y}@2x.png`} alt="" draggable={false} />
                ))}
              </div>
              {MAP_PINS.map((pin) => (
                <div
                  key={pin.id}
                  className={`city-page__map-pin${pin.isYou ? ' city-page__map-pin--you' : ''}${pin.count ? ' city-page__map-pin--cluster' : ''}`}
                  style={{ top: pin.top, left: pin.left }}
                  title={pin.label}
                >
                  {pin.count ? <span>{pin.count}</span> : null}
                </div>
              ))}
              <button
                type="button"
                className="city-page__map-expand-btn"
                aria-label="See on map"
                onClick={() => navigateTo(`#near-you/${cityName.toLowerCase()}`)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          );
        })()}
      </section>

      <EventSection title="ALL Accor Plus events" events={apVisible} favourites={favourites} onToggleFav={toggleFav}
        page={apPage} totalPages={apTotalPages} onPrev={() => setApPage((p) => Math.max(1, p - 1))} onNext={() => setApPage((p) => Math.min(apTotalPages, p + 1))}
        linkHash="#category/all-accor-plus-exclusives" />

      {/* ── Categories ─────────────────────────────────────────────── */}
      <section className="city-page__section city-page__categories">
        <div className="city-page__section-header">
          <h2 className="city-page__section-title">Categories</h2>
          <button type="button" className="city-page__section-link" onClick={() => navigateTo('#categories')}>See all</button>
        </div>
        <div className="city-page__scroll city-page__categories-scroll">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.label}
              className="city-page__category-card"
              href={cat.hash}
              onClick={(e) => { e.preventDefault(); navigateTo(cat.hash); }}
            >
              <div className="city-page__category-card-img">
                <img src={cat.image} alt={cat.label} loading="lazy" />
              </div>
              <span className="city-page__category-card-label">{cat.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── Content sections ───────────────────────────────────────── */}
      <EventSection title="Concerts and festivals" events={ceVisible} favourites={favourites} onToggleFav={toggleFav}
        page={cePage} totalPages={ceTotalPages} onPrev={() => setCePage((p) => Math.max(1, p - 1))} onNext={() => setCePage((p) => Math.min(ceTotalPages, p + 1))}
        linkHash="#category/concerts-and-festivals" />
      <EventSection title="Sport and leisure" events={spVisible} favourites={favourites} onToggleFav={toggleFav}
        page={spPage} totalPages={spTotalPages} onPrev={() => setSpPage((p) => Math.max(1, p - 1))} onNext={() => setSpPage((p) => Math.min(spTotalPages, p + 1))}
        linkHash="#category/sport-and-leisure" />
      <EventSection title="Prize Draw" events={pdVisible} favourites={favourites} onToggleFav={toggleFav}
        page={pdPage} totalPages={pdTotalPages} onPrev={() => setPdPage((p) => Math.max(1, p - 1))} onNext={() => setPdPage((p) => Math.min(pdTotalPages, p + 1))}
        linkHash="#payment/prize-draws" />
      <EventSection title="Auctions" events={auVisible} favourites={favourites} onToggleFav={toggleFav}
        page={auPage} totalPages={auTotalPages} onPrev={() => setAuPage((p) => Math.max(1, p - 1))} onNext={() => setAuPage((p) => Math.min(auTotalPages, p + 1))}
        linkHash="#payment/auctions" />
      <EventSection title="PSG Match Experience" events={psVisible} favourites={favourites} onToggleFav={toggleFav}
        page={psPage} totalPages={psTotalPages} onPrev={() => setPsPage((p) => Math.max(1, p - 1))} onNext={() => setPsPage((p) => Math.min(psTotalPages, p + 1))}
        linkHash="#category/paris-saint-germain" />

      {/* ── Near cities ────────────────────────────────────────────── */}
      <section className="city-page__section city-page__near-cities">
        <div className="city-page__near-cities-card">
          <h2 className="city-page__near-cities-title">Near cities</h2>
          <div className="city-page__near-cities-chips">
            {nearbyCities.map((c) => (
              <button
                key={c.name}
                type="button"
                className="city-page__near-city-chip"
                onClick={() => navigateTo(`#city/${c.name.toLowerCase()}`)}
              >
                <IconPin />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
          <button type="button" className="city-page__find-city-btn" onClick={() => navigateTo('')}>
            <IconSearch />
            <span>Find your city</span>
          </button>
        </div>
      </section>

      {/* ── Menu ───────────────────────────────────────────────────── */}
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
        onToggleFavourite={toggleFav}
        selectedCity={cityName}
        initialView={menuInitialView}
      />

      {/* ── City Selector ─────────────────────────────────────────── */}
      {citySelectorOpen && (
        <div className="city-selector__backdrop" onClick={() => setCitySelectorOpen(false)}>
          <div className="city-selector" role="dialog" aria-modal aria-label="Select your city" onClick={(e) => e.stopPropagation()}>
            <div className="city-selector__header">
              <span className="city-selector__title">Select your city</span>
              <button type="button" className="city-selector__close" onClick={() => setCitySelectorOpen(false)} aria-label="Close">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <div className="city-selector__body">
              <button type="button" className="city-selector__back" onClick={() => navigateTo('')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span>Back to Homepage</span>
              </button>
              <div className="city-selector__input-wrap">
                <IconSearch />
                <input
                  ref={cityInputRef}
                  type="text"
                  className="city-selector__input"
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  placeholder="Search city"
                />
              </div>
              <div className="city-selector__list">
                {matchedCities.map((city) => (
                  <button
                    key={`${city.name}-${city.country}`}
                    type="button"
                    className="city-selector__item"
                    onClick={() => { setCitySelectorOpen(false); navigateTo(`#city/${city.name.toLowerCase()}`); }}
                  >
                    <span className="city-selector__item-name">{city.name}</span>
                    <span className="city-selector__item-country">, {city.country}</span>
                  </button>
                ))}
                {cityQuery.trim() && matchedCities.length === 0 && (
                  <p className="city-selector__empty">No cities found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Loyalty Sheet ──────────────────────────────────────────── */}
      {loyaltyOpen && (
        <div className="loyalty-sheet__backdrop" onClick={() => setLoyaltyOpen(false)}>
          <div className="loyalty-sheet" role="dialog" aria-modal aria-label="Loyalty" onClick={(e) => e.stopPropagation()}>
            <div className="loyalty-sheet__header">
              <span className="loyalty-sheet__title">Loyalty Programme</span>
              <button type="button" className="loyalty-sheet__close" onClick={() => setLoyaltyOpen(false)} aria-label="Close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <div className="loyalty-sheet__body">
              <div className="loyalty-sheet__info">
                <div className="loyalty-sheet__info-col">
                  <span className="loyalty-sheet__label">Status</span>
                  <span className="loyalty-sheet__value loyalty-sheet__value--gold">Gold</span>
                  <span className="loyalty-sheet__expire">Expire on December 31, 2026</span>
                </div>
                <div className="loyalty-sheet__divider" />
                <div className="loyalty-sheet__info-col">
                  <span className="loyalty-sheet__label">Reward Points</span>
                  <span className="loyalty-sheet__value">42.430</span>
                  <span className="loyalty-sheet__expire">Expire on February 12, 2027</span>
                </div>
              </div>
              <div className="loyalty-sheet__card loyalty-sheet__card--gold">
                <span className="loyalty-sheet__card-tier">GOLD</span>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
