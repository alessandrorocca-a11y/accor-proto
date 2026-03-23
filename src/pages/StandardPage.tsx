import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  Button,
  IconHeart,
  Link,
  MarketingTag,
  MarketplaceHeader,
  Menu,
  TermsDialog,
  YouMayAlsoLike,
} from '@/components';
import type { MenuView } from '@/components';
import { useFavourites } from '@/context/FavouritesContext';
import { getPreviousPage } from '@/utils/navigationHistory';
import './StandardPage.css';
import { getEventById } from '@/data/events/eventRegistry';
import { getVenueInfo } from '@/data/events/venueData';
import { useUser } from '@/context/UserContext';

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

interface TimeSlot {
  time: string;
  state: 'selected' | 'disabled' | 'best' | 'default';
}

const TIME_SLOTS: TimeSlot[] = [
  { time: '17:30', state: 'default' },
  { time: '18:00', state: 'disabled' },
  { time: '18:30', state: 'best' },
  { time: '19:30', state: 'default' },
  { time: '17:30', state: 'default' },
  { time: '17:30', state: 'default' },
  { time: '17:30', state: 'default' },
  { time: '17:30', state: 'default' },
];

type CalendarDayInfo = {
  price: number;
  availability: 'available' | 'sold_out' | 'unavailable';
  indicator: 'best' | 'low' | 'both' | 'none';
};

const TODAY_DAY = new Date().getDate();

const CALENDAR_PRICES: Record<number, CalendarDayInfo> = {};
for (let d = 1; d <= 28; d++) {
  if (d <= 3) {
    CALENDAR_PRICES[d] = { price: 10, availability: 'available', indicator: 'low' };
  } else if (d >= 25) {
    CALENDAR_PRICES[d] = { price: 10, availability: 'available', indicator: 'low' };
  } else if ([7, 14, 21].includes(d)) {
    CALENDAR_PRICES[d] = { price: 10, availability: 'available', indicator: 'best' };
  } else {
    CALENDAR_PRICES[d] = { price: 10, availability: 'available', indicator: 'both' };
  }
}

interface ZoneTicket {
  id: string;
  zone: string;
  category: string;
  sectionColor: string;
  description: string;
  discount: number | null;
  originalPrice: number;
  price: number;
  bookingFee: number;
  soldOut: boolean;
  maxQty: number;
  defaultQty: number;
}

const ZONE_TICKETS: ZoneTicket[] = [
  { id: 'frisa-premium', zone: 'Frisa Premium', category: 'Best view', sectionColor: '#e91e8c', description: 'Front-row seats with unobstructed view of the parade floats and performers.', discount: 15, originalPrice: 295.00, price: 250.75, bookingFee: 3.50, soldOut: false, maxQty: 4, defaultQty: 1 },
  { id: 'lounge-vip', zone: 'ALL Lounge VIP', category: 'Exclusive', sectionColor: '#3a34ab', description: 'Private lounge with premium open bar, gourmet catering and dedicated service.', discount: 10, originalPrice: 185.00, price: 166.50, bookingFee: 2.50, soldOut: false, maxQty: 6, defaultQty: 1 },
  { id: 'grandstand', zone: 'Grandstand', category: 'Standard', sectionColor: '#3a34ab', description: 'Covered grandstand seating with great views of the Sambadrome main stage.', discount: null, originalPrice: 95.00, price: 95.00, bookingFee: 1.50, soldOut: false, maxQty: 8, defaultQty: 0 },
  { id: 'standing-general', zone: 'General Admission', category: 'Standing', sectionColor: '#898c8e', description: 'Open standing area near the parade route with a lively atmosphere.', discount: null, originalPrice: 55.00, price: 55.00, bookingFee: 1.00, soldOut: true, maxQty: 0, defaultQty: 0 },
];

const ADDON_FLEX = {
  id: 'flex-cancel',
  name: 'Flexible cancellation',
  description: 'Reschedule hassle-free or claim a refund when you cancel up to 48 hours before the start time.',
  price: 1.85,
};

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];


function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBell({ filled }: { filled: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? '#2D4CD5' : 'none'} aria-hidden>
      <path d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9ZM13.73 21a2 2 0 0 1-3.46 0" stroke={filled ? '#2D4CD5' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

function IconMinus() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function formatEur(n: number) {
  return '€' + n.toFixed(2).replace('.', ',');
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function StandardPage({ eventId }: { eventId?: string }) {
  const eventData = eventId ? getEventById(eventId) : undefined;
  const { points: userPoints, loyaltyTier: userLoyaltyTier, deductPoints, addOrder } = useUser();

  const HERO_IMAGES = eventData?.heroImages ?? DEFAULT_HERO_IMAGES;
  const USER_POINTS = userPoints;
  const INCLUDED_ITEMS = eventData?.includedItems ?? DEFAULT_INCLUDED_ITEMS;
  const EVENT_TITLE = eventData?.title ?? 'Rio de Janeiro Carnival 2026 – Standard Tickets';
  const EVENT_DESCRIPTION = eventData?.description ?? 'Get your tickets to this unforgettable event.';
  const EVENT_LOCATION = eventData?.location ?? 'Fairmont Copacabana Palace, Rio de Janeiro';
  const EVENT_CITY = eventData?.city ?? 'Rio de Janeiro';
  const _EVENT_DATE = eventData?.date ?? 'February 16, 2026';
  const venueInfo = getVenueInfo(EVENT_LOCATION, EVENT_CITY);
  const isEventSoldOut = eventData?.marketingTag === 'sold-out';
  const hasEventDiscount = eventData?.marketingTag === 'discount';

  const [selectedDate, setSelectedDate] = useState(16);
  const [selectedTimeIdx, setSelectedTimeIdx] = useState<number | null>(null);
  const [zoneQty, setZoneQty] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    ZONE_TICKETS.forEach((z) => { init[z.id] = z.defaultQty; });
    return init;
  });
  const [flexCancelQty, setFlexCancelQty] = useState(0);
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);
  const [isFavourite, setFavourite] = useState(false);
  const [showFavSnack, setShowFavSnack] = useState(false);
  const [isNotifyOn, setNotifyOn] = useState(false);
  const [showNotifySnack, setShowNotifySnack] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuInitialView, setMenuInitialView] = useState<MenuView>('navigation');
  const [loyaltyOpen, setLoyaltyOpen] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [confirmedTickets, setConfirmedTickets] = useState(1);
  const [confirmedTicketName, setConfirmedTicketName] = useState('');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [termsOpen, setTermsOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple-pay' | 'google-pay' | null>(null);
  const [showRewardsSheet, setShowRewardsSheet] = useState(false);
  const { favouritesList, removeFavourite } = useFavourites();
  const [rewardsPointsUsed, setRewardsPointsUsed] = useState(0);
  const [rewardsStepperValue, setRewardsStepperValue] = useState(0);
  const POINTS_PER_EUR = 100;
  const [showVoucher, setShowVoucher] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [showVoucherSnack, setShowVoucherSnack] = useState(false);
  const VOUCHER_DISCOUNT = 10;
  const trackRef = useRef<HTMLDivElement>(null);
  const buyBtnRef = useRef<HTMLDivElement>(null);
  const notifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const favTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voucherTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calendarDays = useMemo(() => getCalendarDays(2026, 1), []);

  const selectedTimeSlot = selectedTimeIdx !== null ? TIME_SLOTS[selectedTimeIdx] : null;

  const ticketsSubtotal = useMemo(() => {
    let total = 0;
    ZONE_TICKETS.forEach((z) => {
      const qty = zoneQty[z.id] || 0;
      total += qty * (z.price + z.bookingFee);
    });
    return total;
  }, [zoneQty]);

  const totalPriceEur = ticketsSubtotal + flexCancelQty * ADDON_FLEX.price;
  const totalTickets = useMemo(() => {
    return Object.values(zoneQty).reduce((s, v) => s + v, 0);
  }, [zoneQty]);

  const handleZoneQtyChange = (id: string, delta: number) => {
    setZoneQty((prev) => {
      const zone = ZONE_TICKETS.find((z) => z.id === id);
      if (!zone || zone.soldOut) return prev;
      const next = Math.max(0, Math.min(zone.maxQty, (prev[id] || 0) + delta));
      return { ...prev, [id]: next };
    });
  };

  useEffect(() => {
    const el = buyBtnRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const slideWidth = track.offsetWidth;
    const index = Math.round(track.scrollLeft / slideWidth);
    setActiveSlide(Math.min(index, HERO_IMAGES.length - 1));
  }, []);

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

  const recapItems = useMemo(() => {
    const items: { label: string; qty: number; unitPrice: number }[] = [];
    ZONE_TICKETS.forEach((z) => {
      const qty = zoneQty[z.id] || 0;
      if (qty > 0) items.push({ label: z.zone, qty, unitPrice: z.price + z.bookingFee });
    });
    if (flexCancelQty > 0) {
      items.push({ label: ADDON_FLEX.name, qty: flexCancelQty, unitPrice: ADDON_FLEX.price });
    }
    return items;
  }, [zoneQty, flexCancelQty]);

  const handleBuyTicket = () => {
    if (totalTickets === 0) return;
    setShowRecap(true);
    window.scrollTo(0, 0);
  };

  const handlePayNow = () => {
    setConfirmedTotal(totalPriceEur);
    setConfirmedTickets(totalTickets);
    setConfirmedTicketName('Standard');
    setShowRecap(false);
    setShowConfirmation(true);
    setShowSuccessBanner(true);
    window.scrollTo(0, 0);
    if (eventData) {
      const cost = eventData.points;
      deductPoints(cost);
      addOrder(eventData, cost);
    }
  };

  const handleBackToEvent = () => {
    const citySlug = EVENT_CITY.toLowerCase().replace(/\s+/g, '-');
    window.location.hash = `#city/${citySlug}`;
  };

  const handleViewOrders = () => {
    setShowConfirmation(false);
    setShowSuccessBanner(false);
    setMenuInitialView('orders');
    setMenuOpen(true);
  };

  const handleDateSelect = (d: number) => {
    if (CALENDAR_PRICES[d]) {
      setSelectedDate(d);
      setSelectedTimeIdx(null);
    }
  };

  const selectedDateLabel = useMemo(() => {
    const d = new Date(2026, 1, selectedDate);
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  }, [selectedDate]);
  const selectedTimeLabel = selectedTimeSlot?.time ?? '';

  const purchaseSection = (variant: 'mobile' | 'sidebar') => isEventSoldOut ? (
    <section className={`standard__purchase${variant === 'mobile' ? ' standard__purchase--mobile' : ''}`}>
      <div ref={variant === 'mobile' ? buyBtnRef : undefined}>
        <Button variant="primary" size="lg" fullWidth className="standard__buy-btn" disabled>
          Sold out
        </Button>
      </div>
    </section>
  ) : (
    <section className={`standard__purchase${variant === 'mobile' ? ' standard__purchase--mobile' : ''}`}>
      {/* ── Calendar ────────────────────────────────────────────── */}
      <div className="standard__cal-wrap">
        <div className="standard__calendar">
          <div className="standard__calendar-header">
            <button type="button" className="standard__calendar-nav" aria-label="Previous month">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <span className="standard__calendar-title">February 2026</span>
            <button type="button" className="standard__calendar-nav" aria-label="Next month">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <div className="standard__calendar-weekdays">
            {WEEKDAYS.map((wd, i) => (
              <span key={i} className="standard__calendar-wd">{wd}</span>
            ))}
          </div>
          <div className="standard__calendar-grid">
            {calendarDays.map((d, i) => {
              const info = d !== null ? CALENDAR_PRICES[d] : null;
              const isSelected = d === selectedDate;
              const isToday = d === TODAY_DAY;
              const isAvailable = info?.availability === 'available';
              const isSoldOut = info?.availability === 'sold_out';
              const isUnavailable = info?.availability === 'unavailable' || d === null;

              const dayCls = [
                'standard__calendar-day',
                d === null && 'standard__calendar-day--empty',
                isSelected && 'standard__calendar-day--selected',
                isToday && !isSelected && 'standard__calendar-day--today',
                isAvailable && !isSelected && 'standard__calendar-day--available',
                (isSoldOut || isUnavailable) && !isSelected && 'standard__calendar-day--muted',
              ].filter(Boolean).join(' ');

              return (
                <button
                  key={i}
                  type="button"
                  className={dayCls}
                  disabled={d === null || isUnavailable}
                  onClick={() => d !== null && handleDateSelect(d)}
                >
                  {d !== null && (
                    <>
                      {isSelected && <span className="standard__calendar-day-corner" />}
                      <span className="standard__calendar-day-num">{d}</span>
                      {info && (
                        <span className="standard__calendar-day-price">${info.price}</span>
                      )}
                      {info && info.indicator !== 'none' && (
                        <span className="standard__calendar-day-indicators">
                          {(info.indicator === 'best' || info.indicator === 'both') && (
                            <span className="standard__calendar-day-bar standard__calendar-day-bar--best" />
                          )}
                          {(info.indicator === 'low' || info.indicator === 'both') && (
                            <span className="standard__calendar-day-bar standard__calendar-day-bar--low" />
                          )}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="standard__calendar-legend">
          <span className="standard__calendar-legend-note">All prices shown in US Dollars</span>
          <div className="standard__calendar-legend-keys">
            <span className="standard__calendar-legend-key standard__calendar-legend-key--low">
              <span className="standard__calendar-legend-dash" /> Low availability
            </span>
            <span className="standard__calendar-legend-key standard__calendar-legend-key--best">
              <span className="standard__calendar-legend-dash" /> Best price
            </span>
          </div>
        </div>
      </div>

      {/* ── Time slots ──────────────────────────────────────────── */}
      <div className="standard__times-wrap">
        <div className="standard__times-scroll">
          {TIME_SLOTS.map((slot, i) => (
            <button
              key={i}
              type="button"
              className={`standard__time-pill standard__time-pill--${selectedTimeIdx === i ? 'selected' : slot.state}`}
              disabled={slot.state === 'disabled'}
              onClick={() => slot.state !== 'disabled' && setSelectedTimeIdx(i)}
            >
              <span className="standard__time-pill-label">{slot.time}</span>
              {selectedTimeIdx === i && slot.state !== 'disabled' && (
                <span className="standard__time-pill-check">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              )}
              {slot.state === 'best' && selectedTimeIdx !== i && (
                <span className="standard__time-pill-best-line" />
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="standard__times-fade"
          onClick={(e) => {
            const scroll = (e.currentTarget as HTMLElement).parentElement?.querySelector('.standard__times-scroll');
            scroll?.scrollBy({ left: 120, behavior: 'smooth' });
          }}
          aria-label="Show more times"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      {/* ── Zone ticket cards ───────────────────────────────────── */}
      <div className="standard__zones">
        {ZONE_TICKETS.map((zone) => {
          const qty = zoneQty[zone.id] || 0;
          const isActive = qty > 0;
          const borderColor = isActive ? 'var(--wel-sem-color-outline-accent, #2d4cd5)' : '#ccd2d8';

          return (
            <div key={zone.id} className="standard__zone-item">
              <div className="standard__ticket-row">
                {zone.soldOut ? (
                  <div className="standard__ticket-sold-out-wrap">
                    <div className="standard__ticket-content" style={{ borderColor: 'var(--wel-sem-color-outline-mid, #afb1b3)' }}>
                      <div className="standard__ticket-info">
                        <span className="standard__ticket-zone">{zone.zone}</span>
                        {expandedInfo === zone.id ? (
                          <span className="standard__ticket-desc">{zone.description} <button type="button" className="standard__ticket-link" onClick={() => setExpandedInfo(null)}>Hide info</button></span>
                        ) : (
                          <button type="button" className="standard__ticket-link" onClick={() => setExpandedInfo(zone.id)}>More info</button>
                        )}
                      </div>
                      <div className="standard__ticket-bottom">
                        <div className="standard__ticket-pricing">
                          {hasEventDiscount && zone.discount !== null && <span className="standard__ticket-original">{formatEur(zone.originalPrice)}</span>}
                          <span className="standard__ticket-price">{formatEur(zone.price)}</span>
                        </div>
                        <span className="standard__ticket-fee">+ {formatEur(zone.bookingFee)} booking fee</span>
                      </div>
                    </div>
                    <div className="standard__ticket-selector-sold" />
                    <span className="standard__sold-out-badge">SOLD OUT</span>
                  </div>
                ) : (
                  <>
                    <div className="standard__ticket-content" style={{ borderColor, borderRightColor: 'transparent' }}>
                    <div className="standard__ticket-info">
                      <span className="standard__ticket-zone">{zone.zone}</span>
                      {expandedInfo === zone.id ? (
                        <span className="standard__ticket-desc">{zone.description} <button type="button" className="standard__ticket-link" onClick={() => setExpandedInfo(null)}>Hide info</button></span>
                      ) : (
                        <button type="button" className="standard__ticket-link" onClick={() => setExpandedInfo(zone.id)}>More info</button>
                      )}
                    </div>
                      <div className="standard__ticket-bottom">
                        {hasEventDiscount && zone.discount !== null && (
                          <span className="standard__ticket-discount">{zone.discount}% discount</span>
                        )}
                        <div className="standard__ticket-pricing">
                          {hasEventDiscount && zone.discount !== null && <span className="standard__ticket-original">{formatEur(zone.originalPrice)}</span>}
                          <span className="standard__ticket-price">{formatEur(zone.price)}</span>
                        </div>
                        <span className="standard__ticket-fee">+ {formatEur(zone.bookingFee)} booking fee</span>
                      </div>
                    </div>
                    <div className="standard__ticket-selector" style={{ borderColor, borderLeftColor: 'transparent', background: isActive ? 'var(--wel-sem-color-surface-container-mid, #f7f9fb)' : 'transparent' }}>
                      <div className="standard__zone-stepper">
                        <button type="button" className="standard__zone-stepper-btn standard__zone-stepper-btn--tertiary" disabled={qty <= 0} onClick={() => handleZoneQtyChange(zone.id, -1)} aria-label={`Remove ${zone.zone} ticket`}><IconMinus /></button>
                        <span className="standard__zone-stepper-val">{qty}</span>
                        <button type="button" className="standard__zone-stepper-btn standard__zone-stepper-btn--tertiary" disabled={qty >= zone.maxQty} onClick={() => handleZoneQtyChange(zone.id, 1)} aria-label={`Add ${zone.zone} ticket`}><IconPlus /></button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── ADD-ONS divider ─────────────────────────────────────── */}
      <div className="standard__addons-divider">
        <span className="standard__addons-line" />
        <span className="standard__addons-label">ADD-ONS</span>
        <span className="standard__addons-line" />
      </div>

      {/* ── Flexible cancellation add-on ────────────────────────── */}
      <div className="standard__addon-card">
        <div className="standard__addon-header">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" stroke="#232136" strokeWidth="1.5" />
            <path d="M9 12l2 2 4-4" stroke="#232136" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="standard__addon-name">{ADDON_FLEX.name}</span>
        </div>
        <p className="standard__addon-desc">{ADDON_FLEX.description}</p>
        <div className="standard__addon-bottom">
          <span className="standard__addon-price">{formatEur(ADDON_FLEX.price)}</span>
          <div className="standard__zone-stepper">
            <button type="button" className="standard__zone-stepper-btn standard__zone-stepper-btn--tertiary" disabled={flexCancelQty <= 0} onClick={() => setFlexCancelQty((q) => Math.max(0, q - 1))} aria-label="Remove flexible cancellation"><IconMinus /></button>
            <span className="standard__zone-stepper-val">{flexCancelQty}</span>
            <button type="button" className="standard__zone-stepper-btn standard__zone-stepper-btn--tertiary" disabled={flexCancelQty >= 10} onClick={() => setFlexCancelQty((q) => Math.min(10, q + 1))} aria-label="Add flexible cancellation"><IconPlus /></button>
          </div>
        </div>
      </div>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <div ref={variant === 'mobile' ? buyBtnRef : undefined}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="standard__buy-btn"
          disabled={totalTickets === 0}
          onClick={handleBuyTicket}
        >
          Get it - {Math.round(totalPriceEur * 100).toLocaleString('de-DE')} Reward points
        </Button>
        <p className="standard__reward-points-alt">
          or {formatEur(totalPriceEur)}
        </p>
      </div>
    </section>
  );

  return (
    <div className={`auction-page standard${isEventSoldOut ? ' standard--sold-out' : ''}`}>
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

      <Menu open={menuOpen} initialView={menuInitialView} onClose={() => setMenuOpen(false)} userName="Alessandro" userSurname="Rocca" userEmail="alessandro.rocca@email.com" userPhone="+33 661458723" userBirthday="29/10/1993" userCountry="Spain" loyaltyTier={userLoyaltyTier} points={USER_POINTS} avatarSrc="/avatar.png" favouriteEvents={favouritesList} onToggleFavourite={removeFavourite} />

      {loyaltyOpen && (
        <div className="loyalty-sheet__backdrop" onClick={() => setLoyaltyOpen(false)}>
          <div className="loyalty-sheet" role="dialog" aria-modal aria-label="Loyalty Programme" onClick={(e) => e.stopPropagation()}>
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
                  <path d="M37.9997 31.8653L36.3392 29.8751C37.2136 29.6723 37.7471 29.1668 37.7471 28.2871C37.7471 27.2932 36.9111 26.7953 35.8521 26.7953H32.5333V31.8653H33.4133V29.947H35.3871L36.9077 31.8653H37.9997ZM33.4133 27.5822H35.8764C36.4831 27.5822 36.8453 27.8689 36.8453 28.3489C36.8453 28.8418 36.465 29.1602 35.8764 29.1602H33.4133V27.5822Z" fill="white"/><path d="M2.59991 26.7953L0.00423325 31.8653H0.999631L1.55328 30.7362H4.50927L5.06292 31.8653H6.081L3.48532 26.7953H2.59991ZM1.9392 29.9494L3.03134 27.722L4.12347 29.9494H1.9392Z" fill="white"/><path d="M10.736 27.4622C11.5636 27.4622 12.2458 27.7767 12.5957 28.329L13.3055 27.8482C12.8085 27.1462 11.9292 26.6608 10.736 26.6608C8.80719 26.6608 7.69913 27.9291 7.69913 29.3303C7.69913 30.7315 8.80719 32 10.736 32C11.9294 32 12.8085 31.5147 13.3055 30.8127L12.5957 30.3319C12.2458 30.8842 11.5636 31.1986 10.736 31.1986C9.43923 31.1986 8.60136 30.4653 8.60136 29.3305C8.60136 28.1956 9.43923 27.4622 10.736 27.4622Z" fill="white"/><path d="M18.7279 27.4622C19.5554 27.4622 20.2377 27.7767 20.5876 28.329L21.2973 27.8482C20.8004 27.1462 19.9211 26.6608 18.7279 26.6608C16.799 26.6608 15.691 27.9291 15.691 29.3303C15.691 30.7315 16.799 32 18.7279 32C19.9212 32 20.8004 31.5147 21.2973 30.8127L20.5876 30.3319C20.2377 30.8842 19.5554 31.1986 18.7279 31.1986C17.4311 31.1986 16.5932 30.4653 16.5932 29.3305C16.5932 28.1956 17.4311 27.4622 18.7279 27.4622Z" fill="white"/><path d="M26.7208 26.6608C24.7919 26.6608 23.6839 27.9291 23.6839 29.3303C23.6839 30.7315 24.7919 31.9999 26.7208 31.9999C28.6496 31.9999 29.7577 30.7315 29.7577 29.3303C29.7577 27.9291 28.6496 26.6608 26.7208 26.6608ZM26.7208 31.2072C25.424 31.2072 24.5861 30.4705 24.5861 29.3303C24.5861 28.1901 25.424 27.4534 26.7208 27.4534C28.0176 27.4534 28.8555 28.1903 28.8555 29.3303C28.8555 30.4704 28.0176 31.2072 26.7208 31.2072Z" fill="white"/><path d="M29.5938 22.5944H26.3473C24.9793 22.5944 24.2908 22.2917 23.7891 21.6319C23.2547 20.929 23.2547 19.8581 23.2547 18.8433V0.0096291H27.4283V19.4476C27.4283 20.9863 27.5996 22.0875 29.5939 22.5263V22.5945L29.5938 22.5944Z" fill="white"/><path d="M21.152 22.5912H15.9292L12.09 14.5315C9.9944 15.6791 8.79891 18.3367 6.67391 20.092C5.5912 20.9863 4.32395 21.7838 2.7447 22.3231C2.02982 22.5672 0.815335 22.8829 0.358166 22.9286C0.167371 22.9476 0.033037 22.9399 0.00461532 22.8704C-0.0173064 22.8168 0.0353313 22.7757 0.238872 22.6767C0.470961 22.5637 1.43003 22.1639 2.03097 21.7419C2.78115 21.2153 3.21092 20.6455 3.24469 20.206C3.03822 19.4736 1.56921 17.8478 3.072 14.8647C3.61124 13.7944 4.07759 13.0241 4.41164 12.2499C4.7954 11.3606 5.06687 10.1078 5.15927 9.1767C5.16462 9.12239 5.17431 9.12508 5.20375 9.15526C5.93558 9.90041 8.77176 12.8421 8.36175 15.7663C9.30476 15.4013 10.9404 14.293 11.6946 13.7016C12.4907 13.0773 13.0095 12.426 13.8527 12.4115C14.6079 12.3986 14.6729 12.7622 15.2743 12.8421C15.4233 12.8619 15.6438 12.8328 15.7578 12.7765C15.804 12.7538 15.7927 12.703 15.7228 12.6864C14.9027 12.4915 14.7063 11.8183 13.6462 11.8183C12.6952 11.8183 11.9383 12.7003 11.3901 13.0624L8.70816 7.43218C7.58646 5.07744 7.92892 3.36617 10.3908 0L21.152 22.5912Z" fill="white"/><path d="M37.9999 22.5944H34.7534C33.3854 22.5944 32.6969 22.2917 32.1952 21.6319C31.6608 20.929 31.6608 19.8581 31.6608 18.8433V0.0096291H35.8343V19.4476C35.8343 20.9863 36.0056 22.0875 38 22.5263V22.5945L37.9999 22.5944Z" fill="white"/>
                </svg>
              </div>
              <a href="https://all.accor.com/loyalty-program/en/reasontojoin/index.vhtml" className="loyalty-sheet__link" target="_blank" rel="noopener noreferrer">Discover your benefits and status level</a>
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
        {showNotifySnack && (
          <div className="auction-page__notify-snack" role="status">
            <svg className="auction-page__notify-snack-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="12" r="10" fill="#00513f" /><path d="M8 12l3 3 5-5" stroke="#caffea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div className="auction-page__notify-snack-content">
              <p className="auction-page__notify-snack-title">Notifications enabled for this event</p>
              <p className="auction-page__notify-snack-body">You can review your preferences in communication settings.</p>
            </div>
            <button type="button" className="auction-page__notify-snack-close" onClick={() => setShowNotifySnack(false)} aria-label="Close notification">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        )}
        {showFavSnack && (
          <div className="auction-page__notify-snack auction-page__notify-snack--fav" role="status">
            <svg className="auction-page__notify-snack-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="12" r="10" fill="#00513f" /><path d="M8 12l3 3 5-5" stroke="#caffea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div className="auction-page__notify-snack-content">
              <p className="auction-page__notify-snack-title">Added to your favourites</p>
              <p className="auction-page__notify-snack-body">You can review your favourites in your profile menu.</p>
            </div>
            <button type="button" className="auction-page__notify-snack-close" onClick={() => setShowFavSnack(false)} aria-label="Close notification">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        )}

        <div className="auction-page__hero-image">
          {eventData?.marketingTag && (
            <MarketingTag type={eventData.marketingTag} className="auction-page__hero-tag" />
          )}
          <div className="auction-page__hero-track" ref={trackRef} onScroll={handleScroll}>
            {HERO_IMAGES.map((img, i) => (<img key={i} src={img.src} alt={img.alt} className="auction-page__hero-img" draggable={false} />))}
          </div>
          <div className="auction-page__hero-counter"><IconGallery /><span>{activeSlide + 1}/{HERO_IMAGES.length}</span></div>
          <div className="auction-page__hero-dots">
            {HERO_IMAGES.map((_, i) => (<span key={i} className={`auction-page__hero-dot${i === activeSlide ? ' auction-page__hero-dot--active' : ''}`} />))}
          </div>
        </div>
        <div className="auction-page__hero-grid">
          {HERO_IMAGES.slice(0, 5).map((img, i) => (<img key={i} src={img.src} alt={img.alt} className={`auction-page__hero-grid-img${i === 0 ? ' auction-page__hero-grid-img--large' : ''}`} />))}
        </div>
      </section>

      <div className="auction-page__content-layout">
        <main className="auction-page__main">
          <section className="auction-page__hero-info">
            <div className="auction-page__date-row">
              <span className="auction-page__date">{_EVENT_DATE}</span>
              <div className="auction-page__date-icons">
                <button type="button" className={`auction-page__icon-btn${isNotifyOn ? ' auction-page__icon-btn--notify-on' : ''}`} aria-label={isNotifyOn ? 'Disable notifications' : 'Enable notifications'} aria-pressed={isNotifyOn} onClick={handleBellClick}><IconBell filled={isNotifyOn} /></button>
                <button type="button" className={`auction-page__icon-btn${isFavourite ? ' auction-page__icon-btn--fav-on' : ''}`} aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'} aria-pressed={isFavourite} onClick={handleHeartClick}><IconHeart filled={isFavourite} /></button>
              </div>
            </div>
            <h1 className="auction-page__title">{EVENT_TITLE}</h1>
            <p className="auction-page__location"><IconPin /> {EVENT_LOCATION}</p>
            <div className="auction-page__tags">
              <span className="auction-page__tag">Sustainable Experience</span>
              <span className="auction-page__tag">Limitless Experience</span>
            </div>
          </section>

          <hr className="auction-page__divider auction-page__divider--mobile-only" aria-hidden />
          {purchaseSection('mobile')}

          <hr className="auction-page__divider" aria-hidden />

          <section className="auction-page__section auction-page__section--description">
            <p className="auction-page__body">{EVENT_DESCRIPTION}</p>
            <p className="auction-page__body">Get ready to samba, celebrate, and experience the greatest show in the world with all the comfort and exclusivity that only ALL Accor can offer.</p>
            <p className="auction-page__body">On {_EVENT_DATE}, ALL Accor invites you to a unique experience at the exclusive ALL Accor lounge inside the Alma Rio Box, one of the most sophisticated and sought-after spaces at the Marquês de Sapucaí Sambadrome. An unmissable opportunity for ALL members to redeem this experience with Reward points and enjoy the Special Group parades up close.</p>
            <img src={HERO_IMAGES[1]?.src ?? HERO_IMAGES[0]?.src} alt={EVENT_TITLE} className="auction-page__section-img" />
          </section>

          <hr className="auction-page__divider" aria-hidden />
          <section className="auction-page__section">
            <h2 className="auction-page__heading">What is included in the package</h2>
            <ul className="auction-page__list">{INCLUDED_ITEMS.map((item, i) => (<li key={i} className="auction-page__list-item">{item}</li>))}</ul>
          </section>

          <hr className="auction-page__divider" aria-hidden />
          <section className="auction-page__section auction-page__section--side-image">
            <div className="auction-page__section-text">
              <h2 className="auction-page__heading">About the venue</h2>
              <p className="auction-page__body auction-page__body--strong">{venueInfo.name}</p>
              <p className="auction-page__body">{venueInfo.description}</p>
              <Link href="#">Read more</Link>
            </div>
            <img src={venueInfo.imageUrl} alt={venueInfo.name} className="auction-page__side-img" />
          </section>

          <hr className="auction-page__divider" aria-hidden />
          <section className="auction-page__section auction-page__section--side-image">
            <div className="auction-page__section-text">
              <h2 className="auction-page__heading">How to get there</h2>
              <p className="auction-page__body auction-page__body--strong">{venueInfo.name}</p>
              <p className="auction-page__body auction-page__body--muted">{venueInfo.address}</p>
            </div>
            <iframe className="auction-page__map" src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${venueInfo.mapQuery}`} title={`${venueInfo.name} location`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          </section>

          <hr className="auction-page__divider" aria-hidden />
          <section className="auction-page__section">
            <h2 className="auction-page__heading">Terms & Conditions</h2>
            <p className="auction-page__body">Participation is open to individuals aged 18 years or older (or the legal age of majority in their jurisdiction). Employees of ACCOR, its affiliates, partners...</p>
            <Link href="#" onClick={(e) => { e.preventDefault(); setTermsOpen(true); }}>Read more</Link>
          </section>

          <hr className="auction-page__divider" aria-hidden />
          <YouMayAlsoLike event={eventData ?? null} excludeEventId={eventId} />
        </main>

        <aside className="auction-page__sidebar">
          <div className="auction-page__bid-card standard__sidebar-card">
            {purchaseSection('sidebar')}
          </div>
        </aside>
      </div>

      {showStickyBar && !showRecap && !showConfirmation && !isEventSoldOut && totalTickets > 0 && (
        <div className="standard__sticky-bar">
          <Button variant="primary" size="lg" fullWidth className="standard__buy-btn" onClick={handleBuyTicket}>
            Get it - {Math.round(totalPriceEur * 100).toLocaleString('de-DE')} Reward points
          </Button>
        </div>
      )}

      {showRecap && (
        <div className="recap-page">
          <MarketplaceHeader theme="light" isLoggedIn avatarSrc="/avatar.png" points={USER_POINTS} loyaltyTier={userLoyaltyTier} onLogoClick={() => { window.location.href = window.location.pathname; }} onMenu={() => {}} onPointsClick={() => {}} />
          {showVoucherSnack && (
            <div className="auction-page__notify-snack" role="status">
              <svg className="auction-page__notify-snack-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="12" r="10" fill="#00513f" /><path d="M8 12l3 3 5-5" stroke="#caffea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div className="auction-page__notify-snack-content">
                <p className="auction-page__notify-snack-title">Voucher discount applied correctly</p>
                <p className="auction-page__notify-snack-body">Your voucher has been applied to this order.</p>
              </div>
              <button type="button" className="auction-page__notify-snack-close" onClick={() => setShowVoucherSnack(false)} aria-label="Close notification">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          )}
          <div className="recap-page__content">
            <button type="button" className="recap-page__back" onClick={() => { setShowRecap(false); window.scrollTo(0, 0); }} aria-label="Go back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> Back
            </button>
            <h1 className="recap-page__title">Confirm and pay</h1>
            <div className="recap-page__event-card">
              <img src={HERO_IMAGES[0]?.src ?? '/carnival-hero.png'} alt={HERO_IMAGES[0]?.alt ?? EVENT_TITLE} className="recap-page__event-thumb" />
              <div className="recap-page__event-info">
                <p className="recap-page__event-name">{EVENT_TITLE} – {totalTickets} ticket{totalTickets > 1 ? 's' : ''}</p>
                <span className="recap-page__event-label">{eventData?.eventTag ?? 'Limitless Experience'}</span>
              </div>
            </div>
            <hr className="recap-page__divider" aria-hidden />
            <div className="recap-page__details">
              <div className="recap-page__detail-group">
                <div className="recap-page__detail-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  <span className="recap-page__detail-label">Date</span>
                </div>
                <p className="recap-page__detail-value">{selectedDateLabel} · {selectedTimeLabel}</p>
              </div>
              <div className="recap-page__detail-group">
                <div className="recap-page__detail-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" /></svg>
                  <span className="recap-page__detail-label">Location</span>
                </div>
                <p className="recap-page__detail-value">{venueInfo.address}</p>
              </div>
              <div className="recap-page__detail-group">
                <div className="recap-page__detail-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3h0a3 3 0 0 0-3 3v0a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9Z" stroke="currentColor" strokeWidth="1.5" /><path d="M13 12h3M13 15h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  <span className="recap-page__detail-label">Tickets and Add-ons</span>
                </div>
                {recapItems.map((item, i) => (
                  <div key={i} className="recap-page__detail-row">
                    <span className="recap-page__detail-row-label">{item.qty}x {item.label}</span>
                    <span className="recap-page__detail-row-value">{formatEur(item.qty * item.unitPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
            <hr className="recap-page__divider" aria-hidden />
            <div className="recap-page__pricing">
              <div className="recap-page__pricing-row"><span>Subtotal</span><span>{formatEur(totalPriceEur)}</span></div>
              <div className="recap-page__pricing-row"><span>Fees</span><span>Included</span></div>
              {voucherApplied && (
                <div className="recap-page__pricing-row"><span>Voucher or gift card</span><span>-{formatEur(VOUCHER_DISCOUNT)}</span></div>
              )}
              {rewardsPointsUsed > 0 && (
                <div className="recap-page__pricing-row"><span>ALL Reward Points <span className="recap-page__pricing-muted">({rewardsPointsUsed.toLocaleString('de-DE')})</span></span><span>-{formatEur(rewardsPointsUsed / POINTS_PER_EUR)}</span></div>
              )}
              <div className="recap-page__pricing-total"><span>Total</span><span>{formatEur(Math.max(0, totalPriceEur - (voucherApplied ? VOUCHER_DISCOUNT : 0) - rewardsPointsUsed / POINTS_PER_EUR))}</span></div>
            </div>

            <div className="recap-page__payment">
              <div className="recap-page__payment-divider">
                <span className="recap-page__payment-line" />
                <span className="recap-page__payment-label">PAYMENT METHOD</span>
                <span className="recap-page__payment-line" />
              </div>

              {rewardsPointsUsed > 0 ? (
                <div className="recap-page__rewards-applied">
                  <div className="recap-page__rewards-applied-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M11.649 5.73553C11.7899 5.44032 12.2101 5.44032 12.351 5.73553L13.9252 9.03458C13.9819 9.15339 14.0948 9.23545 14.2254 9.25266L17.8494 9.73037C18.1737 9.77312 18.3036 10.1728 18.0663 10.398L15.4152 12.9146C15.3197 13.0052 15.2766 13.138 15.3006 13.2675L15.9661 16.8618C16.0257 17.1834 15.6857 17.4304 15.3982 17.2744L12.1855 15.5307C12.0698 15.4679 11.9302 15.4679 11.8145 15.5307L8.60178 17.2744C8.3143 17.4304 7.97433 17.1834 8.03389 16.8618L8.69945 13.2675C8.72341 13.138 8.68027 13.0052 8.5848 12.9146L5.93368 10.398C5.69644 10.1728 5.8263 9.77312 6.15059 9.73037L9.77464 9.25266C9.90515 9.23545 10.0181 9.15339 10.0748 9.03458L11.649 5.73553Z" stroke="currentColor" />
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeLinejoin="round" />
                    </svg>
                    <span className="recap-page__rewards-applied-title">ALL Rewards Points</span>
                  </div>
                  <div className="recap-page__rewards-chip" onClick={() => { setRewardsStepperValue(rewardsPointsUsed); setShowRewardsSheet(true); }}>
                    <span className="recap-page__rewards-chip-label">{rewardsPointsUsed.toLocaleString('de-DE')} Points</span>
                    <button
                      type="button"
                      className="recap-page__rewards-chip-remove"
                      onClick={(e) => { e.stopPropagation(); setRewardsPointsUsed(0); }}
                      aria-label="Remove points"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" className="recap-page__rewards-link" onClick={() => { setRewardsStepperValue(1000); setShowRewardsSheet(true); }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M11.649 5.73553C11.7899 5.44032 12.2101 5.44032 12.351 5.73553L13.9252 9.03458C13.9819 9.15339 14.0948 9.23545 14.2254 9.25266L17.8494 9.73037C18.1737 9.77312 18.3036 10.1728 18.0663 10.398L15.4152 12.9146C15.3197 13.0052 15.2766 13.138 15.3006 13.2675L15.9661 16.8618C16.0257 17.1834 15.6857 17.4304 15.3982 17.2744L12.1855 15.5307C12.0698 15.4679 11.9302 15.4679 11.8145 15.5307L8.60178 17.2744C8.3143 17.4304 7.97433 17.1834 8.03389 16.8618L8.69945 13.2675C8.72341 13.138 8.68027 13.0052 8.5848 12.9146L5.93368 10.398C5.69644 10.1728 5.8263 9.77312 6.15059 9.73037L9.77464 9.25266C9.90515 9.23545 10.0181 9.15339 10.0748 9.03458L11.649 5.73553Z" stroke="currentColor" />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeLinejoin="round" />
                  </svg>
                  <span>ALL Rewards Points</span>
                </button>
              )}

              {!showVoucher ? (
                <button type="button" className="recap-page__voucher-link" onClick={() => setShowVoucher(true)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="9.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="14.5" cy="14.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span>Voucher or gift card</span>
                </button>
              ) : voucherApplied ? (
                <div className="recap-page__voucher-section">
                  <div className="recap-page__voucher-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="9.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="14.5" cy="14.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <p className="recap-page__voucher-title">Voucher or gift card</p>
                  </div>
                  <div className="recap-page__voucher-chip">
                    <span className="recap-page__voucher-chip-label">{voucherCode}</span>
                    <button
                      type="button"
                      className="recap-page__voucher-chip-remove"
                      onClick={() => { setVoucherApplied(false); setVoucherCode(''); }}
                      aria-label="Remove voucher"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="recap-page__voucher-section">
                  <p className="recap-page__voucher-title">Voucher or gift card</p>
                  <div className="recap-page__voucher-form">
                    <input
                      type="text"
                      className="recap-page__voucher-input"
                      placeholder=" Voucher number"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                    />
                    <button
                      type="button"
                      className="recap-page__voucher-apply"
                      disabled={voucherCode.trim().length === 0}
                      onClick={() => {
                        if (voucherCode.trim().length > 0) {
                          setVoucherApplied(true);
                          setShowVoucherSnack(true);
                          if (voucherTimerRef.current) clearTimeout(voucherTimerRef.current);
                          voucherTimerRef.current = setTimeout(() => setShowVoucherSnack(false), 5000);
                        }
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}

              <div className="recap-page__payment-options">
                <div className={`recap-page__payment-option-wrap${paymentMethod === 'card' ? ' recap-page__payment-option-wrap--selected' : ''}`}>
                  <label className="recap-page__payment-option-row" onClick={() => setPaymentMethod('card')}>
                    <input
                      type="radio"
                      name="payment-method"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="recap-page__payment-radio"
                    />
                    <span className="recap-page__payment-radio-circle" />
                    <span className="recap-page__payment-option-label">Credit or Debit card</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="recap-page__payment-option-icon">
                      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </label>
                  {paymentMethod === 'card' && (
                    <div className="recap-page__card-form">
                      <input
                        type="text"
                        className="recap-page__card-input"
                        placeholder="Card number"
                        inputMode="numeric"
                        autoComplete="cc-number"
                      />
                      <div className="recap-page__card-row">
                        <input
                          type="text"
                          className="recap-page__card-input"
                          placeholder="Expiration date ( MM/YY)"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                        />
                        <input
                          type="text"
                          className="recap-page__card-input"
                          placeholder="Security code"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                        />
                      </div>
                      <div className="recap-page__card-secure">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span>Your payment info is stored securely</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className={`recap-page__payment-option-wrap${paymentMethod === 'apple-pay' ? ' recap-page__payment-option-wrap--selected' : ''}`}>
                  <label className="recap-page__payment-option-row" onClick={() => setPaymentMethod('apple-pay')}>
                    <input
                      type="radio"
                      name="payment-method"
                      value="apple-pay"
                      checked={paymentMethod === 'apple-pay'}
                      onChange={() => setPaymentMethod('apple-pay')}
                      className="recap-page__payment-radio"
                    />
                    <span className="recap-page__payment-radio-circle" />
                    <span className="recap-page__payment-option-label">Apple Pay</span>
                    <svg width="48" height="24" viewBox="0 0 48 24" fill="none" aria-hidden className="recap-page__payment-option-icon">
                      <path d="M21.7277 4.375C24.4989 4.375 26.4286 6.21123 26.4286 8.88464C26.4286 11.5676 24.4592 13.4134 21.6582 13.4134H18.5899V18.1038H16.373V4.375L21.7277 4.375ZM18.5899 11.6247H21.1336C23.0637 11.6247 24.1622 10.6258 24.1622 8.89418C24.1622 7.16274 23.0637 6.17324 21.1435 6.17324H18.5899V11.6247Z" fill="black"/>
                      <path d="M27.0078 15.259C27.0078 13.5083 28.4034 12.4332 30.8779 12.3L33.7282 12.1383V11.3678C33.7282 10.2546 32.9462 9.58862 31.64 9.58862C30.4026 9.58862 29.6305 10.1593 29.4427 11.0538H27.4236C27.5424 9.246 29.1456 7.91406 31.7191 7.91406C34.2429 7.91406 35.8561 9.19847 35.8561 11.2059V18.1036H33.8073V16.4577H33.758C33.1543 17.5709 31.8378 18.2748 30.4721 18.2748C28.4331 18.2748 27.0078 17.057 27.0078 15.259ZM33.7282 14.3552V13.5655L31.1647 13.7176C29.8879 13.8033 29.1655 14.3456 29.1655 15.2019C29.1655 16.0771 29.9177 16.648 31.0658 16.648C32.5602 16.648 33.7282 15.6585 33.7282 14.3552Z" fill="black"/>
                      <path d="M37.7911 21.7845V20.1195C37.9492 20.1575 38.3054 20.1575 38.4837 20.1575C39.4734 20.1575 40.0079 19.758 40.3344 18.7305C40.3344 18.7114 40.5226 18.1216 40.5226 18.1121L36.7617 8.09375H39.0775L41.7105 16.2378H41.7498L44.3828 8.09375H46.6394L42.7395 18.6257C41.8491 21.0519 40.8197 21.832 38.662 21.832C38.4837 21.832 37.9492 21.813 37.7911 21.7845Z" fill="black"/>
                      <path d="M9.83386 5.71444C10.3682 5.07206 10.7307 4.20953 10.6351 3.32812C9.85297 3.36551 8.89854 3.82412 8.34598 4.46701C7.84983 5.01754 7.4107 5.91619 7.52518 6.76064C8.40315 6.83385 9.28031 6.3388 9.83386 5.71444Z" fill="black"/>
                      <path d="M10.6259 6.92676C9.35087 6.85376 8.26679 7.62236 7.6579 7.62236C7.04868 7.62236 6.11627 6.96355 5.10779 6.98131C3.7952 6.99984 2.57726 7.71324 1.91118 8.84787C0.54115 11.1177 1.54963 14.4846 2.8819 16.3333C3.52889 17.2479 4.30861 18.2549 5.33602 18.2187C6.30675 18.1821 6.68724 17.6145 7.8672 17.6145C9.04629 17.6145 9.38903 18.2187 10.4166 18.2004C11.4822 18.1821 12.1484 17.2854 12.7954 16.3699C13.5376 15.3273 13.8414 14.3206 13.8606 14.2654C13.8414 14.2471 11.8057 13.4964 11.7869 11.2454C11.7676 9.36066 13.3851 8.46416 13.4612 8.40856C12.5478 7.10998 11.1207 6.96355 10.6259 6.92676Z" fill="black"/>
                    </svg>
                  </label>
                </div>
                <div className={`recap-page__payment-option-wrap${paymentMethod === 'google-pay' ? ' recap-page__payment-option-wrap--selected' : ''}`}>
                  <label className="recap-page__payment-option-row" onClick={() => setPaymentMethod('google-pay')}>
                    <input
                      type="radio"
                      name="payment-method"
                      value="google-pay"
                      checked={paymentMethod === 'google-pay'}
                      onChange={() => setPaymentMethod('google-pay')}
                      className="recap-page__payment-radio"
                    />
                    <span className="recap-page__payment-radio-circle" />
                    <span className="recap-page__payment-option-label">Google Pay</span>
                    <svg width="48" height="24" viewBox="0 0 48 24" fill="none" aria-hidden className="recap-page__payment-option-icon">
                      <path d="M22.3 11.7v3.4h-1.1V6.6h2.9c.7 0 1.4.3 1.9.7.5.5.8 1.1.8 1.8s-.3 1.3-.8 1.8c-.5.5-1.1.7-1.9.7h-1.8Zm0-4v3h1.8c.5 0 .9-.2 1.2-.5.3-.3.5-.7.5-1.1 0-.4-.2-.8-.5-1.1-.3-.3-.7-.4-1.2-.4h-1.8Z" fill="#3C4043"/>
                      <path d="M29.8 9.3c.8 0 1.5.2 2 .7.5.5.8 1.1.8 1.9v3.3h-1v-.7h-.1c-.5.6-1.1.9-1.8.9-.6 0-1.2-.2-1.6-.6-.4-.4-.6-.8-.6-1.4 0-.6.2-1 .7-1.4.4-.3 1-.5 1.8-.5.6 0 1.2.1 1.5.4v-.3c0-.4-.2-.7-.4-1-.3-.2-.6-.4-1-.4-.6 0-1 .3-1.3.7l-1-.6c.4-.7 1.1-1 2-1Zm-1.4 3.9c0 .3.1.5.4.7.2.2.5.3.8.3.5 0 .9-.2 1.3-.5.3-.3.5-.7.5-1.1-.3-.3-.8-.4-1.4-.4-.4 0-.8.1-1.1.3-.3.2-.5.4-.5.7Z" fill="#3C4043"/>
                      <path d="M37.5 9.5l-3.4 7.9h-1.1l1.3-2.7-2.2-5.2h1.2l1.6 3.9 1.5-3.9h1.1Z" fill="#3C4043"/>
                      <path d="M17.6 11.3c0-.3 0-.7-.1-1h-5v2h2.9c-.1.6-.5 1.1-1 1.5v1.2h1.6c1-.9 1.6-2.2 1.6-3.7Z" fill="#4285F4"/>
                      <path d="M12.5 16.1c1.4 0 2.5-.5 3.3-1.2l-1.6-1.2c-.5.3-1 .5-1.7.5-1.3 0-2.4-.9-2.8-2h-1.6v1.2c.9 1.6 2.5 2.7 4.4 2.7Z" fill="#34A853"/>
                      <path d="M9.7 12.2c-.1-.3-.2-.7-.2-1s.1-.7.2-1V8.9H8.1c-.4.7-.6 1.4-.6 2.2s.2 1.5.6 2.2l1.6-1.1Z" fill="#FBBC04"/>
                      <path d="M12.5 8.1c.7 0 1.4.3 1.9.7l1.4-1.4c-.9-.8-2-1.3-3.3-1.3-1.9 0-3.5 1.1-4.4 2.7l1.6 1.2c.4-1.2 1.5-1.9 2.8-1.9Z" fill="#EA4335"/>
                    </svg>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="recap-page__footer">
            {paymentMethod === 'apple-pay' ? (
              <button type="button" className="recap-page__apple-pay-btn" onClick={handlePayNow}>
                <svg width="48" height="24" viewBox="0 0 48 24" fill="none" aria-hidden>
                  <path d="M9.2 7.4c-.6.7-1.5 1.2-2.4 1.1-.1-1 .4-2 .9-2.6.6-.7 1.6-1.2 2.3-1.2.1 1-.3 2-.8 2.7Zm.8 1.4c-1.3-.1-2.5.8-3.1.8-.6 0-1.7-.7-2.8-.7-1.4 0-2.8.8-3.5 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7 1.3 0 1.6.7 2.8.7 1.2 0 2-1 2.7-2.1.9-1.2 1.2-2.4 1.2-2.5-.1 0-2.4-.9-2.4-3.6 0-2.3 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7l-.2.3Zm10.4-2.5v15.5h2.3v-5.3h3.2c2.9 0 5-2 5-5.1s-2-5.1-4.9-5.1h-5.6Zm2.3 2h2.6c2 0 3.1 1.1 3.1 3.1 0 2-1.1 3.1-3.1 3.1h-2.6V8.3Zm12.6 13.7c1.5 0 2.8-.7 3.4-1.9h.1v1.7h2.1V14c0-2.2-1.7-3.5-4.3-3.5-2.4 0-4.2 1.4-4.2 3.3h2c.2-.9 1-1.5 2.1-1.5 1.4 0 2.1.6 2.1 1.8v.8l-2.8.2c-2.6.2-4 1.2-4 3.1 0 2 1.5 3.3 3.5 3.3Zm.6-1.8c-1.2 0-2-.6-2-1.5 0-1 .7-1.5 2.2-1.6l2.5-.2v.8c0 1.4-1.2 2.5-2.7 2.5Zm7 5.8c2.2 0 3.3-.9 4.2-3.4l4-11.4H45l-2.7 8.7h-.1l-2.7-8.7h-2.4l3.9 10.8-.2.7c-.4 1.2-1 1.6-2 1.6-.2 0-.5 0-.7-.1v1.8c.2 0 .6.1.8 0Z" fill="#fff" />
                </svg>
              </button>
            ) : paymentMethod === 'google-pay' ? (
              <button type="button" className="recap-page__google-pay-btn" onClick={handlePayNow}>
                <svg width="48" height="24" viewBox="0 0 48 24" fill="none" aria-hidden>
                  <path d="M22.3 11.7v3.4h-1.1V6.6h2.9c.7 0 1.4.3 1.9.7.5.5.8 1.1.8 1.8s-.3 1.3-.8 1.8c-.5.5-1.1.7-1.9.7h-1.8Zm0-4v3h1.8c.5 0 .9-.2 1.2-.5.3-.3.5-.7.5-1.1 0-.4-.2-.8-.5-1.1-.3-.3-.7-.4-1.2-.4h-1.8Z" fill="#3C4043"/>
                  <path d="M29.8 9.3c.8 0 1.5.2 2 .7.5.5.8 1.1.8 1.9v3.3h-1v-.7h-.1c-.5.6-1.1.9-1.8.9-.6 0-1.2-.2-1.6-.6-.4-.4-.6-.8-.6-1.4 0-.6.2-1 .7-1.4.4-.3 1-.5 1.8-.5.6 0 1.2.1 1.5.4v-.3c0-.4-.2-.7-.4-1-.3-.2-.6-.4-1-.4-.6 0-1 .3-1.3.7l-1-.6c.4-.7 1.1-1 2-1Zm-1.4 3.9c0 .3.1.5.4.7.2.2.5.3.8.3.5 0 .9-.2 1.3-.5.3-.3.5-.7.5-1.1-.3-.3-.8-.4-1.4-.4-.4 0-.8.1-1.1.3-.3.2-.5.4-.5.7Z" fill="#3C4043"/>
                  <path d="M37.5 9.5l-3.4 7.9h-1.1l1.3-2.7-2.2-5.2h1.2l1.6 3.9 1.5-3.9h1.1Z" fill="#3C4043"/>
                  <path d="M17.6 11.3c0-.3 0-.7-.1-1h-5v2h2.9c-.1.6-.5 1.1-1 1.5v1.2h1.6c1-.9 1.6-2.2 1.6-3.7Z" fill="#4285F4"/>
                  <path d="M12.5 16.1c1.4 0 2.5-.5 3.3-1.2l-1.6-1.2c-.5.3-1 .5-1.7.5-1.3 0-2.4-.9-2.8-2h-1.6v1.2c.9 1.6 2.5 2.7 4.4 2.7Z" fill="#34A853"/>
                  <path d="M9.7 12.2c-.1-.3-.2-.7-.2-1s.1-.7.2-1V8.9H8.1c-.4.7-.6 1.4-.6 2.2s.2 1.5.6 2.2l1.6-1.1Z" fill="#FBBC04"/>
                  <path d="M12.5 8.1c.7 0 1.4.3 1.9.7l1.4-1.4c-.9-.8-2-1.3-3.3-1.3-1.9 0-3.5 1.1-4.4 2.7l1.6 1.2c.4-1.2 1.5-1.9 2.8-1.9Z" fill="#EA4335"/>
                </svg>
              </button>
            ) : (
              <Button variant="primary" size="lg" fullWidth className="standard__buy-btn" onClick={handlePayNow} disabled={!paymentMethod}>Pay now</Button>
            )}
          </div>

          {showRewardsSheet && (
            <div className="recap-page__rewards-overlay" onClick={() => setShowRewardsSheet(false)}>
              <div className="recap-page__rewards-sheet" onClick={(e) => e.stopPropagation()}>
                <div className="recap-page__rewards-sheet-nav">
                  <span className="recap-page__rewards-sheet-spacer" />
                  <h2 className="recap-page__rewards-sheet-title">Reward Points Discount</h2>
                  <button type="button" className="recap-page__rewards-sheet-close" onClick={() => setShowRewardsSheet(false)} aria-label="Close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                <div className="recap-page__rewards-sheet-body">
                  <div className="recap-page__rewards-badge-row">
                    <span className="recap-page__rewards-badge-icon">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M11.649 5.73553C11.7899 5.44032 12.2101 5.44032 12.351 5.73553L13.9252 9.03458C13.9819 9.15339 14.0948 9.23545 14.2254 9.25266L17.8494 9.73037C18.1737 9.77312 18.3036 10.1728 18.0663 10.398L15.4152 12.9146C15.3197 13.0052 15.2766 13.138 15.3006 13.2675L15.9661 16.8618C16.0257 17.1834 15.6857 17.4304 15.3982 17.2744L12.1855 15.5307C12.0698 15.4679 11.9302 15.4679 11.8145 15.5307L8.60178 17.2744C8.3143 17.4304 7.97433 17.1834 8.03389 16.8618L8.69945 13.2675C8.72341 13.138 8.68027 13.0052 8.5848 12.9146L5.93368 10.398C5.69644 10.1728 5.8263 9.77312 6.15059 9.73037L9.77464 9.25266C9.90515 9.23545 10.0181 9.15339 10.0748 9.03458L11.649 5.73553Z" stroke="#fff" />
                        <circle cx="12" cy="12" r="9" stroke="#fff" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="recap-page__rewards-badge-text">You have {USER_POINTS.toLocaleString('de-DE')} Reward points available</span>
                  </div>

                  <p className="recap-page__rewards-sheet-desc">Choose the number of Reward Points you'd like to redeem for a discount on this purchase</p>

                  <div className="recap-page__rewards-inputs">
                    <div className="recap-page__rewards-input-group">
                      <label className="recap-page__rewards-input-label">Reward points</label>
                      <input
                        type="text"
                        className="recap-page__rewards-input-field"
                        value={rewardsStepperValue === 0 ? '0' : rewardsStepperValue.toLocaleString('de-DE')}
                        onChange={(e) => {
                          const num = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
                          setRewardsStepperValue(Math.min(num, USER_POINTS));
                        }}
                        inputMode="numeric"
                      />
                    </div>
                    <div className="recap-page__rewards-input-group">
                      <label className="recap-page__rewards-input-label">Euros</label>
                      <input
                        type="text"
                        className="recap-page__rewards-input-field"
                        value={`€${(rewardsStepperValue / POINTS_PER_EUR).toFixed(2).replace('.', ',')}`}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                          const euros = parseFloat(raw) || 0;
                          const pts = Math.round(euros * POINTS_PER_EUR);
                          setRewardsStepperValue(Math.min(pts, USER_POINTS));
                        }}
                        inputMode="decimal"
                      />
                    </div>
                  </div>

                  <div className="recap-page__rewards-slider-group">
                    <input
                      type="range"
                      className="recap-page__rewards-slider"
                      min={0}
                      max={USER_POINTS}
                      step={10}
                      value={rewardsStepperValue}
                      onChange={(e) => setRewardsStepperValue(Number(e.target.value))}
                      style={{
                        background: `linear-gradient(to right, #050033 0%, #050033 ${(rewardsStepperValue / USER_POINTS) * 100}%, #d9dadc ${(rewardsStepperValue / USER_POINTS) * 100}%, #d9dadc 100%)`
                      }}
                    />
                    <p className="recap-page__rewards-slider-caption">You have earned {USER_POINTS.toLocaleString('de-DE')} Points</p>
                  </div>

                  <p className="recap-page__rewards-sheet-discount">
                    <strong>{formatEur(rewardsStepperValue / POINTS_PER_EUR)}</strong> discount on your purchase
                  </p>

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={rewardsStepperValue <= 0}
                    onClick={() => {
                      setRewardsPointsUsed(rewardsStepperValue);
                      setShowRewardsSheet(false);
                    }}
                  >
                    Apply Reward Points discount
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showConfirmation && (
        <div className="recap-page">
          <MarketplaceHeader theme="light" isLoggedIn avatarSrc="/avatar.png" points={USER_POINTS} loyaltyTier={userLoyaltyTier} onLogoClick={() => { window.location.href = window.location.pathname; }} onMenu={() => {}} onPointsClick={() => {}} />
          <div className="recap-page__content">
            {showSuccessBanner && (
              <div className="confirmation__success-banner">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="12" r="10" fill="#00513f" /><path d="M8 12l3 3 5-5" stroke="#caffea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <p className="confirmation__success-text">Success! Your purchase is complete. View it in your profile.</p>
                <button type="button" className="confirmation__success-close" onClick={() => setShowSuccessBanner(false)} aria-label="Close">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            )}
            <div className="confirmation__header">
              <h1 className="recap-page__title">Purchase confirmed</h1>
              <span className="confirmation__order-id">Order ID: R{Math.floor(1000000 + Math.random() * 9000000)}</span>
            </div>
            <div className="recap-page__event-card">
              <img src={HERO_IMAGES[0]?.src ?? '/carnival-hero.png'} alt={HERO_IMAGES[0]?.alt ?? EVENT_TITLE} className="recap-page__event-thumb" />
              <div className="recap-page__event-info">
                <p className="recap-page__event-name">{EVENT_TITLE} – {confirmedTickets} ticket{confirmedTickets > 1 ? 's' : ''}</p>
                <span className="recap-page__event-label">{eventData?.eventTag ?? 'Limitless Experience'}</span>
              </div>
            </div>
            <hr className="recap-page__divider" aria-hidden />
            <div className="recap-page__details">
              <div className="recap-page__detail-group">
                <div className="recap-page__detail-header"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg><span className="recap-page__detail-label">Date</span></div>
                <p className="recap-page__detail-value">{selectedDateLabel} · {selectedTimeLabel}</p>
              </div>
              <div className="recap-page__detail-group">
                <div className="recap-page__detail-header"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" /></svg><span className="recap-page__detail-label">Location</span></div>
                <p className="recap-page__detail-value">{venueInfo.address}</p>
              </div>
              <div className="recap-page__detail-group">
                <div className="recap-page__detail-header"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3h0a3 3 0 0 0-3 3v0a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9Z" stroke="currentColor" strokeWidth="1.5" /><path d="M13 12h3M13 15h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg><span className="recap-page__detail-label">Tickets and Add-ons</span></div>
                <div className="recap-page__detail-row"><span className="recap-page__detail-row-label">{confirmedTickets}x {confirmedTicketName}</span><span className="recap-page__detail-row-value">{formatEur(confirmedTotal)}</span></div>
              </div>
            </div>
            <hr className="recap-page__divider" aria-hidden />
            <div className="recap-page__pricing">
              <div className="recap-page__pricing-row"><span>Subtotal</span><span>{formatEur(confirmedTotal)}</span></div>
              <div className="recap-page__pricing-row"><span>Fees</span><span>Included</span></div>
              <div className="recap-page__pricing-total"><span>Total</span><span>{formatEur(confirmedTotal)}</span></div>
            </div>
            <div className="confirmation__info-box">
              <div className="confirmation__info-row"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg><p className="confirmation__info-text">All your tickets have been sent to your email <strong>johnsmith@gmail.com</strong></p></div>
              <div className="confirmation__info-row"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" /><path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg><span className="confirmation__info-text">Need help?</span><a href="#" className="confirmation__info-link">Contact Customer Center</a></div>
            </div>
            <div className="confirmation__actions">
              <Button variant="tertiary" size="md" fullWidth onClick={handleBackToEvent}>Continue exploring</Button>
              <button type="button" className="confirmation__orders-btn" onClick={handleViewOrders}>View all my orders</button>
            </div>
          </div>
        </div>
      )}

      <TermsDialog open={termsOpen} onClose={() => setTermsOpen(false)} variant="standard" />
    </div>
  );
}
