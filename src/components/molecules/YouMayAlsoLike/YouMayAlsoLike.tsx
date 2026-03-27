import { useEffect, useMemo, useRef, useState } from 'react';
import { ExplorerOnlyCardFooter, IconHeart } from '@/components/atoms';
import { useFavourites } from '@/context/FavouritesContext';
import { useUser } from '@/context/UserContext';
import type { EventData } from '@/data/events/eventRegistry';
import {
  formatPoints,
  formatStandardEventListPrice,
  getEffectivePointsCost,
  getEventRoute,
  getPaymentLabel,
  isExplorerExclusiveMarketingTag,
} from '@/data/events/eventRegistry';
import { getRecommendedEvents } from '@/utils/recommendedEvents';
import type { MenuFavouriteEvent } from '../Menu/Menu';
import '@/pages/LinkoutPage.css';

export interface YouMayAlsoLikeProps {
  event?: EventData | null;
  excludeEventId?: string;
  contextCategory?: string;
  contextCity?: string;
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

function MsLeftTimer({ initialMs }: { initialMs: number }) {
  const startRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    startRef.current = Date.now();
    setElapsed(0);
    const id = setInterval(() => setElapsed(Date.now() - startRef.current), 1000);
    return () => clearInterval(id);
  }, [initialMs]);

  const remaining = Math.max(0, initialMs - elapsed);
  if (remaining <= 0) return null;

  return (
    <div className="linkout__card-countdown">
      <span>Time left:</span>
      <span>{formatTimeLeft(remaining)}</span>
    </div>
  );
}

function DrawEndTimer({ endIso }: { endIso: string }) {
  const [ms, setMs] = useState(() => Math.max(0, new Date(endIso).getTime() - Date.now()));

  useEffect(() => {
    const id = setInterval(() => setMs(Math.max(0, new Date(endIso).getTime() - Date.now())), 1000);
    return () => clearInterval(id);
  }, [endIso]);

  if (ms <= 0) return null;

  return (
    <div className="linkout__card-countdown">
      <span>Time left:</span>
      <span>{formatTimeLeft(ms)}</span>
    </div>
  );
}

function EventCountdown({ event }: { event: EventData }) {
  if (event.drawEndDate) return <DrawEndTimer endIso={event.drawEndDate} />;
  if (event.msLeft != null) return <MsLeftTimer initialMs={event.msLeft} />;
  return null;
}

function badgePointsLabel(event: EventData): string {
  if (event.pageType === 'standard') {
    return formatStandardEventListPrice(event);
  }
  if (event.pageType === 'waitlist') {
    return formatPoints(event.points);
  }
  return formatPoints(getEffectivePointsCost(event));
}

function snapshotCountdown(event: EventData): string {
  if (event.drawEndDate) {
    return formatTimeLeft(Math.max(0, new Date(event.drawEndDate).getTime() - Date.now()));
  }
  if (event.msLeft != null) return formatTimeLeft(event.msLeft);
  return '';
}

function toMenuFavourite(event: EventData): MenuFavouriteEvent {
  return {
    id: event.id,
    image: event.image,
    date: event.date,
    title: event.title,
    eventTag: event.eventTag ?? '',
    paymentLabel: getPaymentLabel(event.pageType),
    points: badgePointsLabel(event),
    countdown: snapshotCountdown(event),
    hideRewardsIcon: event.pageType === 'standard',
  };
}

function IconStar() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M7.64903 4.06886C7.7899 3.77365 8.21012 3.77365 8.35099 4.06886L9.25318 5.95956C9.30987 6.07836 9.42282 6.16043 9.55334 6.17763L11.6303 6.45141C11.9546 6.49416 12.0844 6.89381 11.8472 7.11901L10.3278 8.5613C10.2324 8.65194 10.1892 8.78472 10.2132 8.91416L10.5946 10.9741C10.6542 11.2957 10.3142 11.5427 10.0267 11.3867L8.18552 10.3873C8.06982 10.3246 7.9302 10.3246 7.8145 10.3873L5.97329 11.3867C5.68581 11.5427 5.34584 11.2957 5.4054 10.9741L5.78683 8.91416C5.8108 8.78472 5.76766 8.65194 5.67218 8.5613L4.15282 7.11901C3.91559 6.89381 4.04544 6.49416 4.36974 6.45141L6.44668 6.17763C6.5772 6.16043 6.69015 6.07836 6.74684 5.95956L7.64903 4.06886Z"
        stroke="#3a34ab"
      />
      <circle cx="8" cy="8" r="6" stroke="#3a34ab" strokeLinejoin="round" />
    </svg>
  );
}

export function YouMayAlsoLike({ event = null, excludeEventId, contextCategory, contextCity }: YouMayAlsoLikeProps) {
  const { points } = useUser();
  const { isFavourite, toggleFavourite, favourites } = useFavourites();

  const favouriteIds = useMemo(() => Array.from(favourites.keys()), [favourites]);

  const items = useMemo(
    () =>
      getRecommendedEvents({
        excludeEventId,
        currentEvent: event,
        userPoints: points,
        favouriteIds,
        contextCategory,
        contextCity,
        limit: 6,
      }),
    [excludeEventId, event, points, favouriteIds, contextCategory, contextCity],
  );

  if (items.length === 0) return null;

  return (
    <section className="linkout__recommendations" aria-label="You may also like">
      <h2 className="linkout__recommendations-title">You may also like</h2>
      <div className="linkout__recommendations-scroll">
        {items.map((e) => {
          const route = getEventRoute(e);
          const fav = toMenuFavourite(e);
          return (
            <a
              key={e.id}
              className="linkout__card"
              href={route}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="linkout__card-img-wrap">
                <img
                  src={e.image}
                  alt={e.title}
                  className="linkout__card-img"
                  style={e.imagePosition ? { objectPosition: e.imagePosition } : undefined}
                />
                <button
                  type="button"
                  className="linkout__card-fav"
                  aria-label={isFavourite(e.id) ? 'Remove from favourites' : 'Add to favourites'}
                  aria-pressed={isFavourite(e.id)}
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    toggleFavourite(fav);
                  }}
                >
                  <IconHeart filled={isFavourite(e.id)} />
                </button>
                {isExplorerExclusiveMarketingTag(e.marketingTag) ? (
                  <ExplorerOnlyCardFooter variant="imageOverlay" />
                ) : null}
              </div>
              <div className="linkout__card-body">
                <p className="linkout__card-date">{e.date}</p>
                <p className="linkout__card-title">{e.title}</p>
                <div className="linkout__card-price-badge">
                  {e.pageType !== 'standard' ? <IconStar /> : null}
                  <span>{fav.points}</span>
                </div>
                <EventCountdown event={e} />
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
