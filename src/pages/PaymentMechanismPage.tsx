import { useState, useMemo, useEffect, useRef } from 'react';
import {
  MarketplaceHeader,
  Menu,
  MarketingTag,
} from '@/components';
import type { MenuFavouriteEvent, MenuView } from '@/components';
import { CURRENT_COUNTRY, getNearbyCities, searchCities } from '@/data/europeanCities';
import { EVENT_REGISTRY, getEventRoute, formatPoints, type MarketingTagType } from '@/data/events/eventRegistry';
import { useUser } from '@/context/UserContext';
import { useFavourites } from '@/context/FavouritesContext';
import './CategoryPage.css';

type PaymentType = 'prize-draw' | 'redeem' | 'auction' | 'cash' | 'flex' | 'linkout' | 'waitlist';

interface PaymentEvent {
  id: string;
  title: string;
  date: string;
  image: string;
  categories: string[];
  eventTag?: string;
  paymentType: PaymentType;
  points?: string;
  cashPrice?: string;
  hasTimer?: boolean;
  msLeft?: number;
  showBrandLogo?: boolean;
  marketingTag?: MarketingTagType;
}

type MechanismOption = PaymentType | 'standard';

const PAYMENT_MECHANISMS: { label: string; type: MechanismOption }[] = [
  { label: 'Standard', type: 'standard' },
  { label: 'Auctions', type: 'auction' },
  { label: 'Prize Draws', type: 'prize-draw' },
  { label: 'Redeem now', type: 'redeem' },
  { label: 'Waitlist', type: 'waitlist' },
];

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
  'All Accor Plus Exclusives',
];

const CITY_NAME = 'Homepage';

const paymentTypeMap: Record<string, PaymentType> = {
  auction: 'auction', 'prize-draw': 'prize-draw', redeem: 'redeem', standard: 'cash', waitlist: 'waitlist',
};

const ALL_EVENTS: PaymentEvent[] = EVENT_REGISTRY.map((e) => ({
  id: e.id,
  title: e.title,
  date: e.date,
  image: e.image,
  categories: [e.category],
  eventTag: e.eventTag,
  paymentType: paymentTypeMap[e.pageType] ?? 'cash',
  points: e.pageType !== 'standard' ? formatPoints(e.points) : undefined,
  cashPrice: e.pageType === 'standard' ? `${formatPoints(e.points)} pts` : undefined,
  hasTimer: !!e.msLeft,
  msLeft: e.msLeft,
  marketingTag: e.marketingTag,
}));

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

type FilterType = 'date' | 'category' | 'location' | 'hotel' | null;
type SortOption = 'relevance' | 'price-desc' | 'price-asc' | 'date';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-desc', label: 'Price high to low' },
  { value: 'price-asc', label: 'Price low to high' },
  { value: 'date', label: 'Date' },
];

function parsePrice(event: PaymentEvent): number {
  if (event.cashPrice) {
    return parseFloat(event.cashPrice.replace(/[^\d,]/g, '').replace(',', '.'));
  }
  if (event.points) {
    return parseFloat(event.points.replace(/\./g, '').replace(',', '.'));
  }
  return 0;
}

function parseEventDate(dateStr: string): number {
  return new Date(dateStr).getTime() || 0;
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

const FILTER_CHIPS = [
  { label: 'Date', icon: 'calendar' },
  { label: 'Category', icon: 'grid' },
  { label: 'Location', icon: 'location' },
  { label: 'Hotel Brand', icon: 'hotel' },
] as const;

function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function IconStar() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M7.64903 4.06886C7.7899 3.77365 8.21012 3.77365 8.35099 4.06886L9.25318 5.95956C9.30987 6.07836 9.42282 6.16043 9.55334 6.17763L11.6303 6.45141C11.9546 6.49416 12.0844 6.89381 11.8472 7.11901L10.3278 8.5613C10.2324 8.65194 10.1892 8.78472 10.2132 8.91416L10.5946 10.9741C10.6542 11.2957 10.3142 11.5427 10.0267 11.3867L8.18552 10.3873C8.06982 10.3246 7.9302 10.3246 7.8145 10.3873L5.97329 11.3867C5.68581 11.5427 5.34584 11.2957 5.4054 10.9741L5.78683 8.91416C5.8108 8.78472 5.76766 8.65194 5.67218 8.5613L4.15282 7.11901C3.91559 6.89381 4.04544 6.49416 4.36974 6.45141L6.44668 6.17763C6.5772 6.16043 6.69015 6.07836 6.74684 5.95956L7.64903 4.06886Z" stroke="#3a34ab" />
      <circle cx="8" cy="8" r="6" stroke="#3a34ab" strokeLinejoin="round" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
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

function IconHotel() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 21V7a2 2 0 012-2h14a2 2 0 012 2v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 21V17h6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 9h2M7 13h2M15 9h2M15 13h2M11 9h2M11 13h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconOrderBy() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const filterIconMap: Record<string, () => JSX.Element> = {
  calendar: IconCalendar,
  grid: IconGrid,
  location: IconLocation,
  hotel: IconHotel,
};

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
    const id = setInterval(() => {
      setElapsed(Date.now() - startRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, [initialMs]);

  const remaining = Math.max(0, initialMs - elapsed);

  return (
    <div className="category-page__card-timer">
      <span className="category-page__card-timer-label">Time left:</span>
      <span className="category-page__card-timer-value">
        {formatTimeLeft(remaining)}
      </span>
    </div>
  );
}

function paymentLabel(type: PaymentType): string {
  switch (type) {
    case 'prize-draw': return 'Prize Draw';
    case 'redeem': return 'Redeem';
    case 'auction': return 'Current bid';
    case 'waitlist': return 'Waitlist';
    case 'linkout': return '';
    case 'cash': return '';
    default: return '';
  }
}

function mechanismLabel(type: MechanismOption): string {
  if (type === 'standard' || type === 'flex' || type === 'cash') return 'Standard';
  return PAYMENT_MECHANISMS.find((m) => m.type === type)?.label ?? '';
}

export default function PaymentMechanismPage({ defaultMechanism = 'auction' }: { defaultMechanism?: PaymentType }) {
  const { points: USER_POINTS, loyaltyTier: userLoyaltyTier } = useUser();
  useFavourites();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuInitialView, setMenuInitialView] = useState<MenuView>('navigation');
  const [loyaltyOpen, setLoyaltyOpen] = useState(false);
  const [mechanismsOpen, setMechanismsOpen] = useState(false);
  const [selectedMechanism, setSelectedMechanism] = useState<MechanismOption>(
    defaultMechanism === 'flex' || defaultMechanism === 'cash' ? 'standard' : defaultMechanism,
  );
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);

  const [calMonth, setCalMonth] = useState(6);
  const [calYear, setCalYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const [filterCategories, setFilterCategories] = useState<Set<string>>(new Set());
  const [filterBrands, setFilterBrands] = useState<Set<string>>(new Set());
  const [brandSearch, setBrandSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [orderOpen, setOrderOpen] = useState(false);

  const filteredEvents = ALL_EVENTS.filter((e) => {
    if (selectedMechanism === 'standard') {
      if (e.paymentType !== 'flex' && e.paymentType !== 'cash') return false;
    } else if (e.paymentType !== selectedMechanism) return false;
    if (filterCategories.size > 0 && !e.categories.some((c) => filterCategories.has(c))) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-desc') return parsePrice(b) - parsePrice(a);
    if (sortBy === 'price-asc') return parsePrice(a) - parsePrice(b);
    if (sortBy === 'date') return parseEventDate(a.date) - parseEventDate(b.date);
    return 0;
  });

  const handleMechanismSelect = (type: MechanismOption) => {
    setSelectedMechanism(type);
    setMechanismsOpen(false);
  };

  const toggleFavourite = (id: string) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const menuFavourites: MenuFavouriteEvent[] = useMemo(() =>
    ALL_EVENTS
      .filter((e) => favourites.has(e.id))
      .map((e) => ({
        id: e.id,
        image: e.image,
        date: e.date,
        title: e.title,
        eventTag: e.eventTag ?? '',
        paymentLabel: paymentLabel(e.paymentType) || (e.paymentType === 'cash' ? 'Cash' : e.paymentType === 'flex' ? 'Flex' : ''),
        points: e.points ? `${e.points} Reward Points` : e.cashPrice ?? '',
        countdown: e.msLeft ? formatTimeLeft(e.msLeft) : '',
      })),
    [favourites],
  );

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
    if (label === 'Hotel Brand' && filterBrands.size > 0) {
      if (filterBrands.size === 1) return [...filterBrands][0];
      return `${label} (${filterBrands.size})`;
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
    <div className="category-page">
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
        favouriteEvents={menuFavourites}
        onToggleFavourite={toggleFavourite}
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
              <a href="https://all.accor.com/loyalty-program/en/reasontojoin/index.vhtml" className="loyalty-sheet__link" target="_blank" rel="noopener noreferrer">
                Discover your benefits and status level
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="category-page__content">
        <nav className="category-page__breadcrumb" aria-label="Breadcrumb">
          <a
            href="#"
            className="category-page__breadcrumb-link"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '#';
            }}
          >
            <IconChevronLeft />
            {CITY_NAME}
          </a>
          <span className="category-page__breadcrumb-divider">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="category-page__breadcrumb-current">{mechanismLabel(selectedMechanism)}</span>
        </nav>

        <div className="category-page__header">
          <h1 className="category-page__title">{mechanismLabel(selectedMechanism)}</h1>
          <button
            type="button"
            className="category-page__title-dropdown"
            aria-label="Change payment mechanism"
            onClick={() => setMechanismsOpen(true)}
          >
            <IconChevronDown />
          </button>
        </div>

        <div className="category-page__filters-order-row">
          <div className="category-page__filters">
            {FILTER_CHIPS.map((chip) => {
              const FilterIcon = filterIconMap[chip.icon];
              const isActive =
                (chip.label === 'Date' && selectedDate !== null) ||
                (chip.label === 'Category' && filterCategories.size > 0) ||
                (chip.label === 'Hotel Brand' && filterBrands.size > 0);
              return (
                <button
                  key={chip.label}
                  type="button"
                  className={`category-page__filter-chip${isActive ? ' category-page__filter-chip--active' : ''}`}
                  onClick={() => handleFilterChipClick(chip.label)}
                >
                  {FilterIcon && <FilterIcon />}
                  <span className="category-page__filter-chip-label">{getChipLabel(chip.label)}</span>
                  {isActive && (
                    <span
                      className="category-page__filter-chip-clear"
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
          <div className="category-page__desktop-order">
            <span className="category-page__desktop-order-label">Order by</span>
            <button type="button" className="category-page__order-btn" onClick={() => setOrderOpen(true)}>
              {sortBy === 'relevance' ? 'Relevance' : SORT_OPTIONS.find((o) => o.value === sortBy)!.label}
              <IconOrderBy />
            </button>
          </div>
        </div>

        <div className="category-page__results-bar">
          <div className="category-page__results-count">
            <span className="category-page__results-showing">Showing </span>
            <strong>{filteredEvents.length}</strong>
            <span> experiences</span>
          </div>
          <button type="button" className="category-page__order-btn" onClick={() => setOrderOpen(true)}>
            {sortBy === 'relevance' ? 'Order by' : SORT_OPTIONS.find((o) => o.value === sortBy)!.label}
            <IconOrderBy />
          </button>
        </div>

        <div className="category-page__list">
          {filteredEvents.map((event) => {
            const registryEvent = EVENT_REGISTRY.find((e) => e.id === event.id);
            const href = registryEvent ? getEventRoute(registryEvent) : '#';
            return (
            <article
              key={event.id}
              className="category-page__card"
              onClick={() => { window.location.hash = href; }}
            >
              <div className="category-page__card-img-wrap">
                <img
                  src={event.image}
                  alt={event.title}
                  className="category-page__card-img"
                  loading="lazy"
                />
                {event.marketingTag && <MarketingTag type={event.marketingTag} className="category-page__card-marketing-tag" />}
                <button
                  type="button"
                  className="category-page__card-fav"
                  aria-label={favourites.has(event.id) ? 'Remove from favourites' : 'Add to favourites'}
                  onClick={(e) => { e.stopPropagation(); toggleFavourite(event.id); }}
                >
                  <IconHeart filled={favourites.has(event.id)} />
                </button>
                {event.showBrandLogo && (
                  <img
                    src="/all-accor-badge.png"
                    alt="ALL Accor"
                    className="category-page__card-logo"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
              </div>

              <div className="category-page__card-body">
                <div className="category-page__card-header">
                  <div className="category-page__card-date-title">
                    <span className="category-page__card-date">{event.date}</span>
                    <h3 className="category-page__card-title">{event.title}</h3>
                  </div>
                  {event.eventTag && (
                    <span className="category-page__card-event-tag">{event.eventTag}</span>
                  )}
                </div>

                {event.paymentType !== 'linkout' && (
                  <div className={`category-page__card-payment${(event.paymentType === 'auction' || event.paymentType === 'prize-draw') && event.msLeft != null ? ' category-page__card-payment--with-timer' : ''}`}>

                    {(event.paymentType === 'auction' || event.paymentType === 'prize-draw' || event.paymentType === 'redeem') && (
                      <>
                        <span className="category-page__card-payment-label">
                          {paymentLabel(event.paymentType)}
                        </span>
                        {event.points && (
                          <div className="category-page__card-points-badge">
                            <IconStar />
                            <span className="category-page__card-points-value">
                              {event.points} Reward Points
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {event.paymentType === 'flex' && (
                      <>
                        {event.points && (
                          <div className="category-page__card-points-badge">
                            <IconStar />
                            <span className="category-page__card-points-value">
                              {event.points} Reward Points
                            </span>
                          </div>
                        )}
                        {event.cashPrice && (
                          <div className="category-page__card-cash">
                            <span className="category-page__card-cash-from">or</span>
                            <span className="category-page__card-cash-price">{event.cashPrice}</span>
                          </div>
                        )}
                      </>
                    )}

                    {event.paymentType === 'cash' && (
                      <div className="category-page__card-cash">
                        <span className="category-page__card-cash-from">from</span>
                        <span className="category-page__card-cash-price">{event.cashPrice}</span>
                      </div>
                    )}

                    {event.paymentType === 'waitlist' && (
                      <span className="category-page__card-waitlist-label">Waitlist</span>
                    )}

                    {(event.paymentType === 'auction' || event.paymentType === 'prize-draw') && event.msLeft != null && (
                      <LiveTimer initialMs={event.msLeft} />
                    )}
                  </div>
                )}
              </div>
            </article>
            );
          })}
        </div>
      </div>

      {/* Payment mechanism title picker */}
      {mechanismsOpen && (
        <div className="filter-sheet__backdrop" onClick={() => setMechanismsOpen(false)}>
          <div className="filter-sheet" role="dialog" aria-modal aria-label="Payment mechanisms" onClick={(e) => e.stopPropagation()}>
            <div className="filter-sheet__nav">
              <span className="filter-sheet__spacer" />
              <span className="filter-sheet__title">Payment mechanisms</span>
              <button type="button" className="filter-sheet__close" onClick={() => setMechanismsOpen(false)} aria-label="Close"><IconClose /></button>
            </div>
            <div className="filter-sheet__body">
              {PAYMENT_MECHANISMS.map((mech) => (
                <button
                  key={mech.type}
                  type="button"
                  className={`filter-sheet__list-item${mech.type === selectedMechanism ? ' filter-sheet__list-item--active' : ''}`}
                  onClick={() => handleMechanismSelect(mech.type)}
                >
                  {mech.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Order by dialog */}
      {orderOpen && (
        <div className="filter-sheet__backdrop" onClick={() => setOrderOpen(false)}>
          <div className="filter-sheet" role="dialog" aria-modal aria-label="Order by" onClick={(e) => e.stopPropagation()}>
            <div className="filter-sheet__nav">
              <span className="filter-sheet__spacer" />
              <span className="filter-sheet__title">Order by</span>
              <button type="button" className="filter-sheet__close" onClick={() => setOrderOpen(false)} aria-label="Close"><IconClose /></button>
            </div>
            <div className="filter-sheet__body">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`filter-sheet__list-item${opt.value === sortBy ? ' filter-sheet__list-item--active' : ''}`}
                  onClick={() => { setSortBy(opt.value); setOrderOpen(false); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter dialogs */}
      {activeFilter && (
        <div className="filter-sheet__backdrop" onClick={closeFilter}>
          <div className="filter-sheet" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
            <div className="filter-sheet__nav">
              <span className="filter-sheet__spacer" />
              <span className="filter-sheet__title">
                {activeFilter === 'date' && 'Date'}
                {activeFilter === 'category' && 'Categories'}
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
                      <button key={city.name} type="button" className="filter-city-list__item" onClick={closeFilter}>
                        <strong>{city.name},</strong> {city.country}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="filter-sheet__footer">
              <button type="button" className="filter-sheet__submit" onClick={closeFilter}>
                Show {filteredEvents.length} experiences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
