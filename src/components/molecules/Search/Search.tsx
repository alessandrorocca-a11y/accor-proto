import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePrototypeShellOverlayPortal } from '@/context/PrototypeShellOverlayPortalContext';
import { useDevicePreviewScrollContainer } from '@/context/DevicePreviewScrollContainerContext';
import { searchCities } from '@/data/europeanCities';
import {
  ACCOR_PLUS_EXCLUSIVES_CATEGORY,
  ALL_SIGNATURE_EXCLUSIVES_CATEGORY,
  EVENT_REGISTRY,
  getEventRoute,
  type EventData,
} from '@/data/events/eventRegistry';

export interface SearchProps {
  open: boolean;
  onClose: () => void;
}

const SUGGESTION_CHIPS = [
  'Food and drink',
  'Arts and culture',
  'Wellness',
  'Sports and activities',
  'Concerts and festivals',
];

function IconArrowLeft() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
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

function IconGrid() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface BrowseCategory {
  name: string;
  image: string;
}

const BROWSE_CATEGORIES: BrowseCategory[] = [
  {
    name: 'Sports and activities',
    image: 'https://images.unsplash.com/photo-1461896836934-bd45ba24e9c4?w=128&h=128&fit=crop',
  },
  {
    name: 'Concerts and festivals',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=128&h=128&fit=crop',
  },
  {
    name: 'Wellness',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=128&h=128&fit=crop',
  },
];

/** Hash routes for `CategoryPage` — see `CATEGORY_ROUTES` in App.tsx */
const CATEGORY_NAME_TO_HASH: Record<string, string> = {
  'Food and drink': '#category/food-and-drink',
  'Arts and culture': '#category/arts-and-culture',
  Wellness: '#category/wellness',
  'Sports and activities': '#category/sports-and-activities',
  'Concerts and festivals': '#category/concerts-and-festivals',
  'Hotel experiences': '#category/hotel-experiences',
  Visits: '#category/visits',
  Tech: '#category/tech',
  [ACCOR_PLUS_EXCLUSIVES_CATEGORY]: '#category/all-accor-plus-exclusives',
  [ALL_SIGNATURE_EXCLUSIVES_CATEGORY]: '#category/all-signature-exclusives',
};

function categoryNameToHash(name: string): string | null {
  return CATEGORY_NAME_TO_HASH[name] ?? null;
}

function cityNameToHashPath(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

function match(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

function searchEvents(query: string): EventData[] {
  const q = query.toLowerCase();
  return EVENT_REGISTRY.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q),
  );
}

export interface SearchResultsPanelProps {
  query: string;
  onQueryChange: (q: string) => void;
  /** Called after navigating (hash change); e.g. close full-screen search or desktop dropdown */
  onNavigate?: () => void;
}

export function SearchResultsPanel({ query, onQueryChange, onNavigate }: SearchResultsPanelProps) {
  const q = query.trim();
  const hasQuery = q.length > 0;

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const evt of EVENT_REGISTRY) {
      map.set(evt.category, (map.get(evt.category) ?? 0) + 1);
    }
    return Array.from(map, ([name, count]) => ({ name, count }));
  }, []);

  const matchedCities = hasQuery ? searchCities(q).slice(0, 2) : [];
  const matchedCategories = hasQuery ? categories.filter((c) => match(c.name, q)).slice(0, 2) : [];
  const matchedEvents = hasQuery ? searchEvents(q).slice(0, 6) : [];

  const topCity = matchedCities[0];
  const hasResults = matchedCities.length > 0 || matchedCategories.length > 0 || matchedEvents.length > 0;

  const navigateSeeAll = () => {
    const cat = matchedCategories[0];
    const city = matchedCities[0];
    if (cat) {
      const h = categoryNameToHash(cat.name);
      window.location.hash = h ?? '#categories';
    } else if (city) {
      window.location.hash = `#city/${cityNameToHashPath(city.name)}`;
    } else {
      window.location.hash = '#categories';
    }
    onNavigate?.();
  };

  const navigateToCategory = (name: string) => {
    const h = categoryNameToHash(name);
    window.location.hash = h ?? '#categories';
    onNavigate?.();
  };

  return (
    <>
      {!hasQuery && (
        <div className="search-overlay__suggestions">
          <h2 className="search-overlay__suggestions-title">Want some ideas?</h2>
          <div className="search-overlay__chips">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                className="search-overlay__chip"
                onClick={() => onQueryChange(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasQuery && hasResults && (
        <div className="search-overlay__results">
          <div className="search-results__rows">
            <button type="button" className="search-results__row" onClick={navigateSeeAll}>
              <span className="search-results__row-icon search-results__row-icon--search">
                <IconSearch />
              </span>
              <span className="search-results__row-texts">
                <span className="search-results__row-title">"{q}"</span>
                <span className="search-results__row-sub">See all experiences</span>
              </span>
              <span className="search-results__row-chevron"><IconChevronRight /></span>
            </button>

            {matchedCities.map((city) => (
              <button
                key={city.name}
                type="button"
                className="search-results__row"
                onClick={() => {
                  window.location.hash = `#city/${cityNameToHashPath(city.name)}`;
                  onNavigate?.();
                }}
              >
                <span className="search-results__row-icon search-results__row-icon--city">
                  <IconPin />
                </span>
                <span className="search-results__row-texts">
                  <span className="search-results__row-title">{city.name}</span>
                  <span className="search-results__row-sub">{city.country}</span>
                </span>
                <span className="search-results__row-chevron"><IconChevronRight /></span>
              </button>
            ))}

            {matchedCategories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                className="search-results__row"
                onClick={() => navigateToCategory(cat.name)}
              >
                <span className="search-results__row-icon search-results__row-icon--category">
                  <IconGrid />
                </span>
                <span className="search-results__row-texts">
                  <span className="search-results__row-title">{cat.name}</span>
                  <span className="search-results__row-sub">{cat.count} experiences</span>
                </span>
                <span className="search-results__row-chevron"><IconChevronRight /></span>
              </button>
            ))}
          </div>

          {matchedEvents.length > 0 && (
            <div className="search-results__events">
              <h3 className="search-results__events-title">
                Experiences{topCity ? ` in ${topCity.name}` : ''}
              </h3>
              <div className="search-results__events-list">
                {matchedEvents.map((event) => (
                  <a
                    key={event.id}
                    href={getEventRoute(event)}
                    className="search-results__event-card"
                    onClick={() => onNavigate?.()}
                  >
                    <img
                      src={event.image}
                      alt=""
                      className="search-results__event-img"
                    />
                    <span className="search-results__event-info">
                      <span className="search-results__event-date">{event.date}</span>
                      <span className="search-results__event-title">{event.title}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {hasQuery && !hasResults && (
        <div className="search-no-results">
          <div className="search-no-results__message">
            <p className="search-no-results__title">
              Sorry, we couldn't find what you're looking for.
            </p>
            <p className="search-no-results__body">
              Try adjusting your search or exploring our categories to find new and exciting experiences.
            </p>
          </div>
        </div>
      )}

      {hasQuery && !hasResults && (
        <div className="search-no-results__categories">
          <h3 className="search-no-results__categories-title">Categories</h3>
          <div className="search-no-results__categories-list">
            {BROWSE_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                type="button"
                className="search-no-results__category-card"
                onClick={() => navigateToCategory(cat.name)}
              >
                <img
                  src={cat.image}
                  alt=""
                  className="search-no-results__category-img"
                />
                <span className="search-no-results__category-name">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export function Search({ open, onClose }: SearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const overlayPortalTarget = usePrototypeShellOverlayPortal();
  const deviceScrollContainer = useDevicePreviewScrollContainer();

  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEscape);

    const scrollTarget = deviceScrollContainer ?? document.body;
    const prev = scrollTarget.style.overflow;
    scrollTarget.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onEscape);
      scrollTarget.style.overflow = prev;
    };
  }, [open, onClose, deviceScrollContainer]);

  useEffect(() => {
    if (open) {
      setQuery('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  if (!open) return null;

  const q = query.trim();

  const searchTree = (
    <div className="search-overlay" role="dialog" aria-modal aria-label="Search" onClick={onClose}>
      <div className="search-overlay__content" onClick={(e) => e.stopPropagation()}>
        <div className={`search-overlay__input-wrap${q ? ' search-overlay__input-wrap--focused' : ''}`}>
          <button
            type="button"
            className="search-overlay__back"
            onClick={onClose}
            aria-label="Close search"
          >
            <IconArrowLeft />
          </button>
          <span className="search-overlay__search-icon" aria-hidden>
            <IconSearch />
          </span>
          <input
            ref={inputRef}
            type="text"
            className="search-overlay__input"
            placeholder="Search for event name or category"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <SearchResultsPanel query={query} onQueryChange={setQuery} onNavigate={onClose} />
      </div>
    </div>
  );

  return overlayPortalTarget
    ? createPortal(searchTree, overlayPortalTarget)
    : createPortal(searchTree, document.body);
}
