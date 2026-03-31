import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ExplorerOnlyCardFooter, IconHeart, MarketplaceHeader, Menu, MarketingTag, SignatureOnlyCardFooter } from '@/components';
import type { MenuFavouriteEvent, MenuView } from '@/components';
import { useUser } from '@/context/UserContext';
import { CURRENT_COUNTRY, getNearbyCities, searchCities } from '@/data/europeanCities';
import { ACCOR_PLUS_EXCLUSIVES_CATEGORY, formatPoints, isExplorerExclusiveMarketingTag, isSignatureExclusiveMarketingTag } from '@/data/events/eventRegistry';
import './NearYouPage.css';
import './CategoryPage.css';

/* ── Types ──────────────────────────────────────────────────────────── */

type PaymentType = 'prize-draw' | 'redeem' | 'auction' | 'cash' | 'flex' | 'linkout' | 'waitlist';

interface MapEventCard {
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
  route?: string;
  marketingTag?: 'presale' | 'exclusivity' | 'signature' | 'sold-out' | 'discount';
}

export interface NearYouPageProps {
  cityName?: string;
}

/* ── Data ───────────────────────────────────────────────────────────── */

const CITY_COORDS: Record<string, [number, number]> = {
  Paris: [48.8566, 2.3522],
  London: [51.5074, -0.1278],
  Barcelona: [41.3874, 2.1686],
  Rome: [41.9028, 12.4964],
  Berlin: [52.5200, 13.4050],
  Amsterdam: [52.3676, 4.9041],
  Madrid: [40.4168, -3.7038],
  Lisbon: [38.7223, -9.1393],
  Vienna: [48.2082, 16.3738],
  Prague: [50.0755, 14.4378],
  Lyon: [45.7640, 4.8357],
  Marseille: [43.2965, 5.3698],
  Nice: [43.7102, 7.2620],
};

const MAP_ZOOM = 14;
const TILE_SIZE = 256;

const MAP_PINS = [
  { id: 'p1', top: '25%', left: '18%', isYou: false, eventIndex: 0 },
  { id: 'p2', top: '20%', left: '42%', isYou: false, eventIndex: 4 },
  { id: 'p3', top: '33%', left: '48%', isYou: false, eventIndex: 1 },
  { id: 'p4', top: '38%', left: '8%', isYou: false, eventIndex: 5 },
  { id: 'p5', top: '42%', left: '28%', isYou: false, count: 3 },
  { id: 'p6', top: '46%', left: '50%', isYou: true },
  { id: 'p7', top: '37%', left: '62%', isYou: false, eventIndex: 2 },
  { id: 'p8', top: '28%', left: '70%', isYou: false, eventIndex: 6 },
  { id: 'p9', top: '48%', left: '72%', isYou: false, eventIndex: 3 },
  { id: 'p10', top: '55%', left: '82%', isYou: false, eventIndex: 7 },
  { id: 'p11', top: '60%', left: '25%', isYou: false, eventIndex: 8 },
  { id: 'p12', top: '52%', left: '55%', isYou: false, eventIndex: 9 },
];

const MAP_EVENTS: MapEventCard[] = [
  {
    id: 'me1',
    title: 'Roland Garros VIP 2026',
    date: 'March 7, 2026',
    image: '/roland-garros-1.png',
    paymentType: 'prize-draw',
    points: '1.000.000',
    hasTimer: true,
    msLeft: 80 * 24 * 60 * 60 * 1000,
    eventTag: 'Limitless Experiences',
    route: '#draw',
  },
  {
    id: 'me2',
    title: 'Candlelight: Best of Hans Zimmer',
    date: 'March 18, 2026',
    image: 'https://applications-media.feverup.com/image/upload/f_auto,w_720,h_720/fever2/plan/photo/443ebdda-88ac-11ea-bf03-06551cb39bc6.jpg',
    paymentType: 'redeem',
    points: '6.000',
    eventTag: 'Limitless Experiences',
    route: '#redeem',
  },
  {
    id: 'me3',
    title: 'Immersive Van Gogh Experience',
    date: 'May 1, 2026',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop',
    paymentType: 'redeem',
    points: '9.500',
    cashPrice: '49,00 €',
    eventTag: 'Limitless Experiences',
    route: '#standard',
  },
  {
    id: 'me4',
    title: 'Seine River Jazz Cruise',
    date: 'June 2, 2026',
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop',
    paymentType: 'redeem',
    points: '12.000',
    route: '#redeem',
  },
  {
    id: 'me5',
    title: 'Moulin Rouge Dinner Show',
    date: 'April 12, 2026',
    image: 'https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?w=400&h=400&fit=crop',
    paymentType: 'redeem',
    points: '18.000',
    eventTag: 'Limitless Experiences',
    route: '#redeem',
  },
  {
    id: 'me6',
    title: 'Versailles Private Tour',
    date: 'March 22, 2026',
    image: 'https://images.unsplash.com/photo-1551410224-699683e15636?w=400&h=400&fit=crop',
    paymentType: 'auction',
    points: '8.500',
    eventTag: 'Signature Exclusive',
    route: '#auction',
  },
  {
    id: 'me7',
    title: 'Louvre After-Hours Experience',
    date: 'April 5, 2026',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=400&fit=crop',
    paymentType: 'redeem',
    points: '15.000',
    eventTag: 'Limitless Experiences',
    route: '#redeem',
  },
  {
    id: 'me8',
    title: 'Paris Wine & Cheese Tasting',
    date: 'March 29, 2026',
    image: 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=400&h=400&fit=crop',
    paymentType: 'redeem',
    points: '4.500',
    eventTag: 'Food & Drinks',
    route: '#standard',
  },
  {
    id: 'me9',
    title: 'Sofitel x Devialet Candle Experience',
    date: 'May 15, 2026',
    image: 'https://limitlessexperiences.accor.com/media/.renditions/wysiwyg/2025/ALL/December2025/SofitelxDevialet/Sofitel_Candle_Experience_Banner_355x320.png',
    paymentType: 'redeem',
    points: '7.200',
    eventTag: 'Hotel Experiences',
    route: '#standard',
  },
  {
    id: 'me10',
    title: 'Eiffel Tower Sunset Dinner',
    date: 'June 14, 2026',
    image: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=400&h=400&fit=crop',
    paymentType: 'prize-draw',
    points: '500.000',
    hasTimer: true,
    msLeft: 100 * 24 * 60 * 60 * 1000,
    eventTag: 'Signature Exclusive',
    route: '#draw',
  },
];

const FILTER_CHIPS = [
  { id: 'date', label: 'Date', icon: 'calendar' as const },
  { id: 'category', label: 'Category', icon: 'grid' as const },
  { id: 'payment', label: 'Payment', icon: 'payment' as const },
  { id: 'price', label: 'Price range', icon: 'price-range' as const },
  { id: 'location', label: 'Location', icon: 'location' as const },
  { id: 'hotel', label: 'Hotel Brand', icon: 'hotel' as const },
];

type FilterType = 'date' | 'category' | 'payment' | 'price-range' | 'location' | 'hotel' | null;

function parseOptionalEurBound(s: string): number | null {
  const t = s.trim().replace(',', '.');
  if (!t) return null;
  const n = parseFloat(t);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function parseOptionalPointsBound(s: string): number | null {
  const t = s.trim().replace(/\./g, '').replace(/\s/g, '');
  if (!t) return null;
  const n = parseInt(t, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function mapEventCashEur(e: MapEventCard): number | null {
  if (!e.cashPrice) return null;
  const n = parseFloat(e.cashPrice.replace(/[^\d,]/g, '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function mapEventPoints(e: MapEventCard): number | null {
  if (!e.points) return null;
  const n = parseInt(e.points.replace(/\./g, '').replace(/\s/g, ''), 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

const MAP_PRICE_BOUNDS = (() => {
  let maxEur = 100;
  for (const e of MAP_EVENTS) {
    const v = mapEventCashEur(e);
    if (v != null) {
      const c = Math.ceil(v);
      if (c > maxEur) maxEur = c;
    }
  }
  return { min: 0, max: Math.max(100, maxEur) };
})();

const MAP_POINTS_BOUNDS = (() => {
  let maxPts = 1000;
  for (const e of MAP_EVENTS) {
    const p = mapEventPoints(e);
    if (p != null && p > maxPts) maxPts = p;
  }
  const rounded = Math.max(5000, Math.ceil(maxPts / 1000) * 1000);
  return { min: 0, max: rounded };
})();

type MapDualRangeSliderProps = {
  min: number;
  max: number;
  step?: number;
  lo: number;
  hi: number;
  onChange: (lo: number, hi: number) => void;
  ariaLabel: string;
};

function MapDualRangeSlider({ min, max, step = 1, lo, hi, onChange, ariaLabel }: MapDualRangeSliderProps) {
  const span = Math.max(1, max - min);
  const pct = (n: number) => ((Math.min(max, Math.max(min, n)) - min) / span) * 100;
  const left = pct(lo);
  const width = Math.max(0, pct(hi) - pct(lo));
  const onMinInput = (raw: number) => {
    const stepped = step > 0 ? Math.round(raw / step) * step : raw;
    onChange(Math.min(Math.max(min, stepped), hi), hi);
  };
  const onMaxInput = (raw: number) => {
    const stepped = step > 0 ? Math.round(raw / step) * step : raw;
    const v = Math.max(Math.min(max, stepped), lo);
    onChange(lo, v);
  };
  return (
    <div className="filter-dual-slider" role="group" aria-label={ariaLabel}>
      <div className="filter-dual-slider__track" aria-hidden>
        <div className="filter-dual-slider__track-bg" />
        <div className="filter-dual-slider__track-fill" style={{ left: `${left}%`, width: `${width}%` }} />
      </div>
      <input
        type="range"
        className="filter-dual-slider__thumb filter-dual-slider__thumb--min"
        min={min}
        max={max}
        step={step}
        value={lo}
        aria-label={`${ariaLabel} minimum`}
        onChange={(e) => onMinInput(Number(e.target.value))}
      />
      <input
        type="range"
        className="filter-dual-slider__thumb filter-dual-slider__thumb--max"
        min={min}
        max={max}
        step={step}
        value={hi}
        aria-label={`${ariaLabel} maximum`}
        onChange={(e) => onMaxInput(Number(e.target.value))}
      />
    </div>
  );
}

const CATEGORIES = [
  'Shows and culture',
  'Concerts and festivals',
  'Sport and leisure',
  'Food and drinks',
  'Wellness',
  'Visits',
  'Hotel experiences',
  'Paris Saint Germain',
  'Arena',
  'All Signature Exclusives',
  ACCOR_PLUS_EXCLUSIVES_CATEGORY,
];

const PAYMENT_OPTIONS = ['Standard', 'Auctions', 'Prize Draws', 'Redeem now', 'Waitlist'];
const HOTEL_BRANDS = ['Fairmont', 'Ibis', 'Mercure', 'Novotel', 'Pullman', 'Raffles', 'Sofitel'];

const DAYS_OF_WEEK = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

/* ── Helpers ────────────────────────────────────────────────────────── */

function latLonToTile(lat: number, lon: number, zoom: number): [number, number] {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return [x, y];
}

function formatTimeLeft(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

function paymentLabel(type: PaymentType): string {
  switch (type) {
    case 'prize-draw': return 'Prize Draw';
    case 'redeem': return 'Redeem';
    case 'auction': return 'Current bid';
    default: return '';
  }
}

/* ── Icons ──────────────────────────────────────────────────────────── */

function IconChipCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconChipGrid() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconChipPayment() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconChipPriceRange() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="8" r="3" fill="#fff" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="8" r="3" fill="#fff" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="16" r="3" fill="#fff" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="3" fill="#fff" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconChipLocation() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconChipHotel() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 21V7a2 2 0 0 1 2-2h6v16M21 21V11a2 2 0 0 0-2-2h-6v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 9h2M7 13h2M13 13h2M13 17h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconListView() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCompass() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" />
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

function IconBreadcrumbChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M11 19a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function chipIcon(type: string) {
  switch (type) {
    case 'calendar': return <IconChipCalendar />;
    case 'grid': return <IconChipGrid />;
    case 'payment': return <IconChipPayment />;
    case 'price-range': return <IconChipPriceRange />;
    case 'location': return <IconChipLocation />;
    case 'hotel': return <IconChipHotel />;
    default: return null;
  }
}

/* ── Live Timer ─────────────────────────────────────────────────────── */

function LiveTimer({ initialMs }: { initialMs: number }) {
  const startRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    startRef.current = Date.now();
    setElapsed(0);
    const id = setInterval(() => setElapsed(Date.now() - startRef.current), 1000);
    return () => clearInterval(id);
  }, [initialMs]);

  return (
    <div className="near-you__card-timer">
      <span className="near-you__card-timer-label">Time left:</span>
      <span>{formatTimeLeft(Math.max(0, initialMs - elapsed))}</span>
    </div>
  );
}

/* ── Map Event Card (horizontal layout) ─────────────────────────────── */

function MapEventHorizontalCard({
  event,
  active,
  isFav,
  onFavToggle,
  onClick,
}: {
  event: MapEventCard;
  active: boolean;
  isFav: boolean;
  onFavToggle: () => void;
  onClick: () => void;
}) {
  const label = paymentLabel(event.paymentType);

  return (
    <article
      className={`near-you__event-card${active ? ' near-you__event-card--active' : ' near-you__event-card--inactive'}`}
      onClick={onClick}
    >
      <div className="near-you__event-card-img">
        <img src={event.image} alt={event.title} loading="lazy" style={event.imagePosition ? { objectPosition: event.imagePosition } : undefined} />
        {event.marketingTag && <MarketingTag type={event.marketingTag} className="near-you__event-card-marketing-tag" />}
        <button
          type="button"
          className="near-you__event-card-fav"
          aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
          onClick={(e) => { e.stopPropagation(); onFavToggle(); }}
        >
          <IconHeart filled={isFav} />
        </button>
      </div>
      <div className="near-you__event-card-body">
        <span className="near-you__event-card-date">{event.date}</span>
        <h3 className="near-you__event-card-title">{event.title}</h3>
        {event.eventTag && (
          <span className="near-you__event-card-tag">{event.eventTag}</span>
        )}
        <div className="near-you__event-card-body-bottom">
          <div className="near-you__event-card-payment">
            {label && <span className="near-you__event-card-payment-label">{label}</span>}
            {event.points && (
              <div className="near-you__event-card-points">
                <IconStar />
                <span>{event.points}</span>
              </div>
            )}
            {event.hasTimer && event.msLeft != null && (
              <LiveTimer initialMs={event.msLeft} />
            )}
          </div>
          {isSignatureExclusiveMarketingTag(event.marketingTag) ? (
            <SignatureOnlyCardFooter variant="vertical" />
          ) : isExplorerExclusiveMarketingTag(event.marketingTag) ? (
            <ExplorerOnlyCardFooter variant="vertical" />
          ) : null}
        </div>
      </div>
    </article>
  );
}

/* ── Main Component ─────────────────────────────────────────────────── */

export default function NearYouPage({ cityName = 'Paris' }: NearYouPageProps) {
  const { points: userPoints, loyaltyTier: userLoyaltyTier } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuInitialView, setMenuInitialView] = useState<MenuView>('navigation');
  const [loyaltyOpen, setLoyaltyOpen] = useState(false);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [activeFilteredIndex, setActiveFilteredIndex] = useState(0);
  const mapRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ dragging: false, didDrag: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });
  const carouselRef = useRef<HTMLDivElement>(null);

  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [calMonth, setCalMonth] = useState(6);
  const [calYear, setCalYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [filterCategories, setFilterCategories] = useState<Set<string>>(new Set());
  const [filterPayments, setFilterPayments] = useState<Set<string>>(new Set());
  const [filterBrands, setFilterBrands] = useState<Set<string>>(new Set());
  const [brandSearch, setBrandSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [pointsMin, setPointsMin] = useState('');
  const [pointsMax, setPointsMax] = useState('');

  const filteredMapEntries = useMemo(() => {
    const priceFilterOn = priceMin.trim() !== '' || priceMax.trim() !== '';
    const pointsFilterOn = pointsMin.trim() !== '' || pointsMax.trim() !== '';
    const eurLo = parseOptionalEurBound(priceMin);
    const eurHi = parseOptionalEurBound(priceMax);
    const ptsLo = parseOptionalPointsBound(pointsMin);
    const ptsHi = parseOptionalPointsBound(pointsMax);
    return MAP_EVENTS.map((ev, idx) => ({ ev, idx })).filter(({ ev }) => {
      if (priceFilterOn) {
        const eur = mapEventCashEur(ev);
        if (eur == null) return false;
        if (eurLo != null && eur < eurLo) return false;
        if (eurHi != null && eur > eurHi) return false;
      }
      if (pointsFilterOn) {
        const pts = mapEventPoints(ev);
        if (pts == null) return false;
        if (ptsLo != null && pts < ptsLo) return false;
        if (ptsHi != null && pts > ptsHi) return false;
      }
      return true;
    });
  }, [priceMin, priceMax, pointsMin, pointsMax]);

  useEffect(() => {
    setActiveFilteredIndex((i) => {
      const max = Math.max(0, filteredMapEntries.length - 1);
      return Math.min(i, max);
    });
  }, [filteredMapEntries.length]);

  const onPriceSliderChange = (lo: number, hi: number) => {
    const { min, max } = MAP_PRICE_BOUNDS;
    const rLo = Math.round(lo);
    const rHi = Math.round(hi);
    setPriceMin(rLo <= min ? '' : String(rLo));
    setPriceMax(rHi >= max ? '' : String(rHi));
  };

  const onPointsSliderChange = (lo: number, hi: number) => {
    const { min, max } = MAP_POINTS_BOUNDS;
    const rLo = Math.round(lo);
    const rHi = Math.round(hi);
    setPointsMin(rLo <= min ? '' : formatPoints(rLo));
    setPointsMax(rHi >= max ? '' : formatPoints(rHi));
  };

  const rawEurLo = parseOptionalEurBound(priceMin);
  const rawEurHi = parseOptionalEurBound(priceMax);
  const eurLoSlider = rawEurLo ?? MAP_PRICE_BOUNDS.min;
  const eurHiSlider = rawEurHi ?? MAP_PRICE_BOUNDS.max;
  const [eurLo, eurHi] = eurLoSlider <= eurHiSlider ? [eurLoSlider, eurHiSlider] : [eurHiSlider, eurLoSlider];

  const rawPtsLo = parseOptionalPointsBound(pointsMin);
  const rawPtsHi = parseOptionalPointsBound(pointsMax);
  const ptsLoSlider = rawPtsLo ?? MAP_POINTS_BOUNDS.min;
  const ptsHiSlider = rawPtsHi ?? MAP_POINTS_BOUNDS.max;
  const [ptsLo, ptsHi] = ptsLoSlider <= ptsHiSlider ? [ptsLoSlider, ptsHiSlider] : [ptsHiSlider, ptsLoSlider];

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const coords = CITY_COORDS[cityName] ?? CITY_COORDS.Paris;
  const [cx, cy] = latLonToTile(coords[0], coords[1], MAP_ZOOM);

  const COLS = 7;
  const ROWS = 5;
  const tiles: { x: number; y: number; key: string }[] = [];
  const halfCols = Math.floor(COLS / 2);
  const halfRows = Math.floor(ROWS / 2);
  for (let dy = -halfRows; dy <= halfRows; dy++) {
    for (let dx = -halfCols; dx <= halfCols; dx++) {
      tiles.push({ x: cx + dx, y: cy + dy, key: `${cx + dx}-${cy + dy}` });
    }
  }

  const gridWidth = COLS * TILE_SIZE;
  const gridHeight = ROWS * TILE_SIZE;

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    el.scrollLeft = (gridWidth - el.clientWidth) / 2;
    el.scrollTop = (gridHeight - el.clientHeight) / 2;
  }, [gridWidth, gridHeight]);

  const onMapPointerDown = useCallback((e: React.PointerEvent) => {
    const el = mapRef.current;
    if (!el) return;
    dragState.current = {
      dragging: true,
      didDrag: false,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
    };
    el.setPointerCapture(e.pointerId);
  }, []);

  const onMapPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragState.current;
    if (!d.dragging) return;
    const el = mapRef.current;
    if (!el) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.didDrag = true;
    el.scrollLeft = d.scrollLeft - dx;
    el.scrollTop = d.scrollTop - dy;
  }, []);

  const onMapPointerUp = useCallback(() => {
    dragState.current.dragging = false;
  }, []);

  const toggleFav = (id: string) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const navigateTo = (hash: string) => {
    window.location.hash = hash;
  };

  const menuFavourites: MenuFavouriteEvent[] = [];

  const handleCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = 377;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveFilteredIndex(Math.min(idx, Math.max(0, filteredMapEntries.length - 1)));
  };

  const handlePinClick = (eventIndex: number) => {
    const pos = filteredMapEntries.findIndex((x) => x.idx === eventIndex);
    if (pos < 0) return;
    setActiveFilteredIndex(pos);
    const el = carouselRef.current;
    if (!el) return;
    const card = el.children[pos] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  };

  const stopPropagation = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  const toggleSetItem = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, item: string) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const handleFilterChipClick = (label: string) => {
    const map: Record<string, FilterType> = {
      'Date': 'date',
      'Category': 'category',
      'Payment': 'payment',
      'Price range': 'price-range',
      'Location': 'location',
      'Hotel Brand': 'hotel',
    };
    setActiveFilter(map[label] ?? null);
    if (label === 'Hotel Brand') setBrandSearch('');
    if (label === 'Location') setCitySearch('');
  };

  const closeFilter = () => setActiveFilter(null);

  const clearFilter = (label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (label === 'Date') setSelectedDate(null);
    if (label === 'Category') setFilterCategories(new Set());
    if (label === 'Payment') setFilterPayments(new Set());
    if (label === 'Price range') {
      setPriceMin('');
      setPriceMax('');
      setPointsMin('');
      setPointsMax('');
    }
    if (label === 'Location') setSelectedCity(null);
    if (label === 'Hotel Brand') setFilterBrands(new Set());
  };

  const getChipLabel = (label: string): string => {
    if (label === 'Date' && selectedDate !== null) {
      return `${selectedDate} ${MONTH_NAMES[calMonth].slice(0, 3)}`;
    }
    if (label === 'Category' && filterCategories.size > 0) {
      if (filterCategories.size === 1) return [...filterCategories][0];
      return `${label} (${filterCategories.size})`;
    }
    if (label === 'Payment' && filterPayments.size > 0) {
      if (filterPayments.size === 1) return [...filterPayments][0];
      return `${label} (${filterPayments.size})`;
    }
    if (label === 'Location' && selectedCity) {
      return selectedCity;
    }
    if (label === 'Hotel Brand' && filterBrands.size > 0) {
      if (filterBrands.size === 1) return [...filterBrands][0];
      return `${label} (${filterBrands.size})`;
    }
    if (label === 'Price range') {
      const pActive = priceMin.trim() !== '' || priceMax.trim() !== '';
      const ptActive = pointsMin.trim() !== '' || pointsMax.trim() !== '';
      if (!pActive && !ptActive) return label;
      const parts: string[] = [];
      if (pActive) {
        const lo = parseOptionalEurBound(priceMin);
        const hi = parseOptionalEurBound(priceMax);
        const pp: string[] = [];
        if (lo != null) pp.push(`${lo} €`);
        if (hi != null) pp.push(`${hi} €`);
        if (pp.length === 2) parts.push(`${pp[0]} – ${pp[1]}`);
        else if (pp.length === 1) parts.push(pp[0]);
      }
      if (ptActive) {
        const lo = parseOptionalPointsBound(pointsMin);
        const hi = parseOptionalPointsBound(pointsMax);
        const fmt = (n: number) => n.toLocaleString('de-DE');
        const pp: string[] = [];
        if (lo != null) pp.push(fmt(lo));
        if (hi != null) pp.push(fmt(hi));
        if (pp.length === 2) parts.push(`${pp[0]} – ${pp[1]} pts`);
        else if (pp.length === 1) parts.push(`${pp[0]} pts`);
      }
      if (parts.length === 0) return label;
      return parts.join(' · ');
    }
    return label;
  };

  const filteredBrands = HOTEL_BRANDS.filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase())
  );
  const nearbyCities = getNearbyCities(CURRENT_COUNTRY);
  const filteredCities = citySearch.trim()
    ? searchCities(citySearch)
    : nearbyCities;

  const calDaysInMonth = getDaysInMonth(calYear, calMonth);
  const calFirstDay = getFirstDayOfMonth(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
    setSelectedDate(null);
  };

  return (
    <div className="near-you">
      <MarketplaceHeader
        theme="light"
        isLoggedIn
        avatarSrc="/avatar.png"
        points={userPoints}
        loyaltyTier={userLoyaltyTier}
        onLogoClick={() => navigateTo('')}
        onMenu={() => { setMenuInitialView('navigation'); setMenuOpen(true); }}
        onAvatarClick={() => { setMenuInitialView('profile'); setMenuOpen(true); }}
        onPointsClick={() => setLoyaltyOpen(true)}
      />

      {/* ── Top bar: breadcrumbs + filters ─────────────────────────── */}
      <div className="near-you__top-bar">
        <nav className="near-you__breadcrumbs" aria-label="Breadcrumb">
          <button
            type="button"
            className="near-you__breadcrumb-link"
            onClick={() => navigateTo(`#city/${cityName.toLowerCase()}`)}
          >
            {cityName}
          </button>
          <IconBreadcrumbChevron />
          <span className="near-you__breadcrumb-current">Near you</span>
        </nav>

        <div className="near-you__filters">
          <div className="near-you__filters-scroll">
            {FILTER_CHIPS.map((chip) => {
              const isActive =
                (chip.label === 'Date' && selectedDate !== null) ||
                (chip.label === 'Category' && filterCategories.size > 0) ||
                (chip.label === 'Payment' && filterPayments.size > 0) ||
                (chip.label === 'Price range' && (priceMin.trim() !== '' || priceMax.trim() !== '' || pointsMin.trim() !== '' || pointsMax.trim() !== '')) ||
                (chip.label === 'Location' && selectedCity !== null) ||
                (chip.label === 'Hotel Brand' && filterBrands.size > 0);
              return (
                <button
                  key={chip.id}
                  type="button"
                  className={`near-you__chip${isActive ? ' near-you__chip--active' : ''}`}
                  onClick={() => handleFilterChipClick(chip.label)}
                >
                  {chipIcon(chip.icon)}
                  <span>{getChipLabel(chip.label)}</span>
                  {isActive && (
                    <span
                      className="near-you__chip-clear"
                      role="button"
                      aria-label={`Clear ${chip.label} filter`}
                      onClick={(e) => clearFilter(chip.label, e)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
                        <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Full-screen map ──────────────────────────────────────────── */}
      <div className="near-you__map-container">
        <div
          ref={mapRef}
          className="near-you__map-viewport"
          onPointerDown={onMapPointerDown}
          onPointerMove={onMapPointerMove}
          onPointerUp={onMapPointerUp}
          onPointerCancel={onMapPointerUp}
        >
          <div className="near-you__map-content" style={{ width: gridWidth, height: gridHeight }}>
            <div
              className="near-you__map-tiles"
              style={{ gridTemplateColumns: `repeat(${COLS}, ${TILE_SIZE}px)` }}
            >
              {tiles.map((t) => (
                <img
                  key={t.key}
                  src={`https://a.basemaps.cartocdn.com/light_all/${MAP_ZOOM}/${t.x}/${t.y}@2x.png`}
                  alt=""
                  draggable={false}
                />
              ))}
            </div>

            <div className="near-you__pins-layer">
              {MAP_PINS.map((pin) => {
                if (pin.eventIndex != null && !filteredMapEntries.some((x) => x.idx === pin.eventIndex)) {
                  return null;
                }
                const activeOriginalIdx = filteredMapEntries[activeFilteredIndex]?.idx;
                const isActive = pin.eventIndex != null && pin.eventIndex === activeOriginalIdx;
                return (
                  <div
                    key={pin.id}
                    className={`near-you__pin${pin.isYou ? ' near-you__pin--you' : ''}${pin.count ? ' near-you__pin--cluster' : ''}${isActive ? ' near-you__pin--active' : ''}`}
                    style={{ top: pin.top, left: pin.left }}
                    onPointerDown={pin.eventIndex != null ? stopPropagation : undefined}
                    onClick={pin.eventIndex != null ? () => handlePinClick(pin.eventIndex!) : undefined}
                  >
                    {pin.count ? <span>{pin.count}</span> : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── "Search in this area" button ────────────────────────────── */}
        <button type="button" className="near-you__search-area-btn">
          Search in this area
        </button>

        {/* ── "List view" button ──────────────────────────────────────── */}
        <button
          type="button"
          className="near-you__list-view-btn"
          onClick={() => navigateTo(`#near-you-list/${cityName.toLowerCase()}`)}
        >
          <IconListView />
          <span>List view</span>
        </button>

        {/* ── Compass / re-center button ─────────────────────────────── */}
        <button
          type="button"
          className="near-you__compass-btn"
          aria-label="Re-center map"
          onClick={() => {
            const el = mapRef.current;
            if (!el) return;
            el.scrollLeft = (gridWidth - el.clientWidth) / 2;
            el.scrollTop = (gridHeight - el.clientHeight) / 2;
          }}
        >
          <IconCompass />
        </button>

        {/* ── Bottom event carousel ──────────────────────────────────── */}
        <div
          ref={carouselRef}
          className="near-you__event-carousel"
          onScroll={handleCarouselScroll}
        >
          {filteredMapEntries.map(({ ev: event }, i) => (
            <MapEventHorizontalCard
              key={event.id}
              event={event}
              active={i === activeFilteredIndex}
              isFav={favourites.has(event.id)}
              onFavToggle={() => toggleFav(event.id)}
              onClick={() => navigateTo(event.route ?? '#standard')}
            />
          ))}
        </div>
      </div>

      {/* ── Menu ─────────────────────────────────────────────────────── */}
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
        points={userPoints}
        avatarSrc="/avatar.png"
        favouriteEvents={menuFavourites}
        onToggleFavourite={toggleFav}
      />

      {/* ── Loyalty Sheet ────────────────────────────────────────────── */}
      {loyaltyOpen && (
        <div className="near-you__loyalty-backdrop" onClick={() => setLoyaltyOpen(false)}>
          <div className="near-you__loyalty-sheet" role="dialog" aria-modal aria-label="Loyalty" onClick={(e) => e.stopPropagation()}>
            <div className="near-you__loyalty-header">
              <span className="near-you__loyalty-title">Loyalty Programme</span>
              <button type="button" className="near-you__loyalty-close" onClick={() => setLoyaltyOpen(false)} aria-label="Close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <div className="near-you__loyalty-body">
              <div className="near-you__loyalty-info">
                <div className="near-you__loyalty-col">
                  <span className="near-you__loyalty-label">Status</span>
                  <span className="near-you__loyalty-value near-you__loyalty-value--gold">Gold</span>
                  <span className="near-you__loyalty-expire">Expire on December 31, 2026</span>
                </div>
                <div className="near-you__loyalty-divider" />
                <div className="near-you__loyalty-col">
                  <span className="near-you__loyalty-label">Reward Points</span>
                  <span className="near-you__loyalty-value">42.430</span>
                  <span className="near-you__loyalty-expire">Expire on February 12, 2027</span>
                </div>
              </div>
              <div className="near-you__loyalty-card near-you__loyalty-card--gold">
                <span className="near-you__loyalty-card-tier">GOLD</span>
                <svg className="near-you__loyalty-card-logo" width="76" height="64" viewBox="0 0 38 32" fill="none" aria-hidden>
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

      {activeFilter && (
        <div className="filter-sheet__backdrop" onClick={closeFilter}>
          <div className="filter-sheet" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
            <div className="filter-sheet__nav">
              <span className="filter-sheet__spacer" />
              <span className="filter-sheet__title">
                {activeFilter === 'date' && 'Date'}
                {activeFilter === 'category' && 'Categories'}
                {activeFilter === 'payment' && 'Payment mechanisms'}
                {activeFilter === 'price-range' && 'Price range'}
                {activeFilter === 'location' && 'Location'}
                {activeFilter === 'hotel' && 'Hotel Brands'}
              </span>
              <button type="button" className="filter-sheet__close" onClick={closeFilter} aria-label="Close"><IconClose /></button>
            </div>

            <div className="filter-sheet__body">
              {activeFilter === 'date' && (
                <div className="filter-cal">
                  <div className="filter-cal__header">
                    <button type="button" className="filter-cal__arrow" onClick={prevMonth} aria-label="Previous month">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    <span className="filter-cal__month">{MONTH_NAMES[calMonth]} {calYear}</span>
                    <button type="button" className="filter-cal__arrow" onClick={nextMonth} aria-label="Next month">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </div>
                  <div className="filter-cal__grid">
                    {DAYS_OF_WEEK.map((d) => (
                      <span key={d} className="filter-cal__day-label">{d}</span>
                    ))}
                    {Array.from({ length: calFirstDay }).map((_, i) => (
                      <span key={`e-${i}`} className="filter-cal__empty" />
                    ))}
                    {Array.from({ length: calDaysInMonth }).map((_, i) => {
                      const day = i + 1;
                      return (
                        <button
                          key={day}
                          type="button"
                          className={`filter-cal__day${selectedDate === day ? ' filter-cal__day--selected' : ''}`}
                          onClick={() => setSelectedDate(day)}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeFilter === 'category' && (
                <div className="filter-check-list">
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="filter-check-list__item">
                      <input
                        type="checkbox"
                        className="filter-check-list__checkbox"
                        checked={filterCategories.has(cat)}
                        onChange={() => toggleSetItem(setFilterCategories, cat)}
                      />
                      <span className="filter-check-list__label">{cat}</span>
                    </label>
                  ))}
                </div>
              )}

              {activeFilter === 'payment' && (
                <div className="filter-check-list">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <label key={opt} className="filter-check-list__item">
                      <input
                        type="checkbox"
                        className="filter-check-list__checkbox"
                        checked={filterPayments.has(opt)}
                        onChange={() => toggleSetItem(setFilterPayments, opt)}
                      />
                      <span className="filter-check-list__label">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {activeFilter === 'price-range' && (
                <div className="filter-price-range">
                  <section className="filter-price-range__block" aria-labelledby="ny-map-filter-price-heading">
                    <h2 id="ny-map-filter-price-heading" className="filter-price-range__section-title">Price</h2>
                    <div className="filter-price-range__cols">
                      <div className="filter-price-range__field">
                        <label className="filter-price-range__label" htmlFor="ny-map-filter-price-min">Minimum</label>
                        <div className="filter-price-range__input-wrap">
                          <input
                            id="ny-map-filter-price-min"
                            type="text"
                            inputMode="decimal"
                            className="filter-price-range__input"
                            placeholder="0"
                            value={priceMin}
                            onChange={(e) => setPriceMin(e.target.value)}
                            autoComplete="off"
                          />
                          <span className="filter-price-range__suffix" aria-hidden>€</span>
                        </div>
                      </div>
                      <div className="filter-price-range__field">
                        <label className="filter-price-range__label" htmlFor="ny-map-filter-price-max">Maximum</label>
                        <div className="filter-price-range__input-wrap">
                          <input
                            id="ny-map-filter-price-max"
                            type="text"
                            inputMode="decimal"
                            className="filter-price-range__input"
                            placeholder={String(MAP_PRICE_BOUNDS.max)}
                            value={priceMax}
                            onChange={(e) => setPriceMax(e.target.value)}
                            autoComplete="off"
                          />
                          <span className="filter-price-range__suffix" aria-hidden>€</span>
                        </div>
                      </div>
                    </div>
                    <MapDualRangeSlider
                      min={MAP_PRICE_BOUNDS.min}
                      max={MAP_PRICE_BOUNDS.max}
                      step={1}
                      lo={eurLo}
                      hi={eurHi}
                      onChange={onPriceSliderChange}
                      ariaLabel="Price in euros"
                    />
                  </section>
                  <section className="filter-price-range__block" aria-labelledby="ny-map-filter-points-heading">
                    <h2 id="ny-map-filter-points-heading" className="filter-price-range__section-title">Points</h2>
                    <div className="filter-price-range__cols">
                      <div className="filter-price-range__field">
                        <label className="filter-price-range__label" htmlFor="ny-map-filter-points-min">Minimum</label>
                        <div className="filter-price-range__input-wrap">
                          <input
                            id="ny-map-filter-points-min"
                            type="text"
                            inputMode="numeric"
                            className="filter-price-range__input"
                            placeholder="0"
                            value={pointsMin}
                            onChange={(e) => setPointsMin(e.target.value)}
                            autoComplete="off"
                          />
                          <span className="filter-price-range__suffix" aria-hidden>pts</span>
                        </div>
                      </div>
                      <div className="filter-price-range__field">
                        <label className="filter-price-range__label" htmlFor="ny-map-filter-points-max">Maximum</label>
                        <div className="filter-price-range__input-wrap">
                          <input
                            id="ny-map-filter-points-max"
                            type="text"
                            inputMode="numeric"
                            className="filter-price-range__input"
                            placeholder={formatPoints(MAP_POINTS_BOUNDS.max)}
                            value={pointsMax}
                            onChange={(e) => setPointsMax(e.target.value)}
                            autoComplete="off"
                          />
                          <span className="filter-price-range__suffix" aria-hidden>pts</span>
                        </div>
                      </div>
                    </div>
                    <MapDualRangeSlider
                      min={MAP_POINTS_BOUNDS.min}
                      max={MAP_POINTS_BOUNDS.max}
                      step={100}
                      lo={ptsLo}
                      hi={ptsHi}
                      onChange={onPointsSliderChange}
                      ariaLabel="Reward points"
                    />
                  </section>
                </div>
              )}

              {activeFilter === 'hotel' && (
                <>
                  <div className="filter-search">
                    <IconSearch />
                    <input
                      type="text"
                      className="filter-search__input"
                      placeholder="Search Hotel Brand"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                    />
                  </div>
                  <div className="filter-check-list">
                    {filteredBrands.map((brand) => (
                      <label key={brand} className="filter-check-list__item">
                        <input
                          type="checkbox"
                          className="filter-check-list__checkbox"
                          checked={filterBrands.has(brand)}
                          onChange={() => toggleSetItem(setFilterBrands, brand)}
                        />
                        <span className="filter-check-list__label">{brand}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              {activeFilter === 'location' && (
                <>
                  <div className="filter-search">
                    <IconSearch />
                    <input
                      type="text"
                      className="filter-search__input"
                      placeholder="Search for City"
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                    />
                  </div>
                  <div className="filter-city-list">
                    <span className="filter-city-list__heading">
                      {citySearch.trim() ? 'Results' : 'Nearby cities'}
                    </span>
                    {filteredCities.map((city) => (
                      <button
                        key={city.name}
                        type="button"
                        className={`filter-city-list__item${selectedCity === city.name ? ' filter-city-list__item--active' : ''}`}
                        onClick={() => { setSelectedCity(city.name); closeFilter(); }}
                      >
                        <strong>{city.name},</strong> {city.country}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="filter-sheet__footer">
              <button type="button" className="filter-sheet__submit" onClick={closeFilter}>
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
