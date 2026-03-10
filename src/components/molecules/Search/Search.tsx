import { useCallback, useEffect, useRef, useState } from 'react';
import { searchCities } from '@/data/europeanCities';

export interface SearchProps {
  open: boolean;
  onClose: () => void;
}

const SUGGESTION_CHIPS = [
  'Food and drinks',
  'Shows & culture',
  'Wellness',
  'Sport and leisure',
  'Concerts and festivals',
];

interface CategoryResult {
  name: string;
  count: number;
}

interface EventResult {
  image: string;
  date: string;
  title: string;
}

const CATEGORIES: CategoryResult[] = [
  { name: 'Candlelight Concerts', count: 9 },
  { name: 'Carnival Experiences', count: 4 },
  { name: 'Food and drinks', count: 12 },
  { name: 'Shows & culture', count: 8 },
  { name: 'Wellness', count: 6 },
  { name: 'Sport and leisure', count: 15 },
  { name: 'Concerts and festivals', count: 11 },
  { name: 'VIP Experiences', count: 7 },
  { name: 'Family Experiences', count: 5 },
];

const EVENTS: EventResult[] = [
  {
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=128&h=128&fit=crop',
    date: 'March 18, 2026',
    title: 'Candlelight Southampton: Homenaje a Coldplay',
  },
  {
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=128&h=128&fit=crop',
    date: 'March 13, 2026',
    title: "Candlelight: Hans Zimmer's Best Works",
  },
  {
    image: 'https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?w=128&h=128&fit=crop',
    date: 'February 16, 2026',
    title: 'Rio de Janeiro Carnival 2026 - ALL Accor Lounge',
  },
  {
    image: 'https://images.unsplash.com/photo-1551279880-03041531948f?w=128&h=128&fit=crop',
    date: 'February 16, 2026',
    title: 'Carnival VIP Samba Parade Experience',
  },
  {
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=128&h=128&fit=crop',
    date: 'April 5, 2026',
    title: 'Cannes Gourmet Food & Wine Festival',
  },
  {
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=128&h=128&fit=crop',
    date: 'May 20, 2026',
    title: 'Cannes Film Festival - VIP Access',
  },
  {
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=128&h=128&fit=crop',
    date: 'April 12, 2026',
    title: 'Paris Jazz Festival - Private Lounge',
  },
  {
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=128&h=128&fit=crop',
    date: 'March 28, 2026',
    title: 'Barcelona Concert Series: Mediterranean Nights',
  },
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
    name: 'Sport and leisure',
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

function match(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

export interface SearchResultsPanelProps {
  query: string;
  onQueryChange: (q: string) => void;
}

export function SearchResultsPanel({ query, onQueryChange }: SearchResultsPanelProps) {
  const q = query.trim();
  const hasQuery = q.length > 0;

  const matchedCities = hasQuery ? searchCities(q).slice(0, 2) : [];
  const matchedCategories = hasQuery ? CATEGORIES.filter((c) => match(c.name, q)).slice(0, 2) : [];
  const matchedEvents = hasQuery ? EVENTS.filter((e) => match(e.title, q)).slice(0, 3) : [];

  const topCity = matchedCities[0];
  const hasResults = matchedCities.length > 0 || matchedCategories.length > 0 || matchedEvents.length > 0;

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
            <button type="button" className="search-results__row">
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
                onClick={() => { window.location.hash = `#city/${city.name.toLowerCase()}`; }}
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
              <button key={cat.name} type="button" className="search-results__row">
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
                {matchedEvents.map((event, i) => (
                  <a key={i} href="#" className="search-results__event-card">
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
                onClick={() => onQueryChange(cat.name)}
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
  const [cardStyle, setCardStyle] = useState<React.CSSProperties | undefined>();

  const positionCard = useCallback(() => {
    setCardStyle(undefined);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setQuery('');
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        positionCard();
      });
      window.addEventListener('resize', positionCard);
      return () => window.removeEventListener('resize', positionCard);
    } else {
      setCardStyle(undefined);
    }
  }, [open, positionCard]);

  if (!open) return null;

  const q = query.trim();

  return (
    <div className="search-overlay" role="dialog" aria-modal aria-label="Search" onClick={onClose}>
      <div className="search-overlay__content" style={cardStyle} onClick={(e) => e.stopPropagation()}>
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

        <SearchResultsPanel query={query} onQueryChange={setQuery} />
      </div>
    </div>
  );
}
