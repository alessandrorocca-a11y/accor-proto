import {
  EVENT_REGISTRY,
  getEffectivePointsCost,
  getEventById,
  isEventAffordableWithBalance,
  type EventData,
} from '@/data/events/eventRegistry';

export interface RecommendedEventsOptions {
  excludeEventId?: string;
  currentEvent?: EventData | null;
  userPoints: number;
  favouriteIds: readonly string[];
  /** When there is no registry event (e.g. plan prototype), bias by category/city. */
  contextCategory?: string;
  contextCity?: string;
  limit?: number;
}

/**
 * Ranks other registry events using favourite categories, similarity to the viewed event,
 * and whether the user can afford them with their points balance.
 */
export function getRecommendedEvents(options: RecommendedEventsOptions): EventData[] {
  const limit = options.limit ?? 6;
  const excludeId = options.excludeEventId ?? options.currentEvent?.id;
  const current = options.currentEvent ?? null;
  const favCategories = new Set<string>();
  for (const id of options.favouriteIds) {
    const ev = getEventById(id);
    if (ev) favCategories.add(ev.category);
  }
  const favIdSet = new Set(options.favouriteIds);

  const pool = EVENT_REGISTRY.filter((e) => e.id !== excludeId);

  const scored = pool.map((e) => {
    let score = 0;
    if (favIdSet.has(e.id)) score += 120;
    if (favCategories.has(e.category)) score += 55;
    const catMatch =
      (current && e.category === current.category) ||
      (!!options.contextCategory && e.category === options.contextCategory);
    if (catMatch) score += 72;
    const cityMatch =
      (current && e.city === current.city) || (!!options.contextCity && e.city === options.contextCity);
    if (cityMatch) score += 36;
    if (isEventAffordableWithBalance(e, options.userPoints)) score += 48;
    else {
      const cost = getEffectivePointsCost(e);
      if (cost > 0 && options.userPoints >= cost * 0.65) score += 18;
    }
    if (current) {
      const c0 = getEffectivePointsCost(current);
      const c1 = getEffectivePointsCost(e);
      if (c0 > 0 && c1 > 0) {
        const lo = Math.min(c0, c1);
        const hi = Math.max(c0, c1);
        const ratio = hi / Math.max(lo, 1);
        if (ratio <= 2.5) score += 28;
      }
    }
    return { e, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.e.title.localeCompare(b.e.title);
  });

  return scored.slice(0, limit).map((s) => s.e);
}
