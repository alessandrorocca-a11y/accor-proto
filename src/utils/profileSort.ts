import type { TestProfileId } from '@/context/UserContext';
import type { EventData, MarketingTagType } from '@/data/events/eventRegistry';
import { isEventAffordableWithBalance } from '@/data/events/eventRegistry';

function isVoyagerSubscriberOnlyTag(tag?: MarketingTagType): boolean {
  return tag === 'presale' || tag === 'exclusivity';
}

/** Deterministic seed → RNG (stable shuffle across re-renders for same inputs). */
function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i);
  }
  return h >>> 0;
}

function shuffleInPlace<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

interface SortableEvent {
  pageType?: string;
  paymentType?: string;
  eventTag?: string;
  marketingTag?: MarketingTagType;
}

function profileScore(event: SortableEvent, profileId: TestProfileId): number {
  const pt = event.pageType ?? event.paymentType ?? '';
  const isLimitless = event.eventTag === 'Limitless Experiences';
  const voyagerOnly = isVoyagerSubscriberOnlyTag(event.marketingTag);

  if (profileId === 'silver') {
    if (pt === 'prize-draw') return 4;
    if (pt === 'standard' || pt === 'cash') return 3;
    if (pt === 'redeem' || pt === 'flex') return 2;
    return 0;
  }

  // Gold without Explorer subscription: never prioritise presale / exclusivity (subscriber-only) experiences
  if (profileId === 'gold' && voyagerOnly) {
    return -10;
  }

  // goldVoyager = Gold + Explorer subscriber (+ shared gold mechanics below when not subscriber-only)
  if (pt === 'auction' && isLimitless) return 5;
  if (pt === 'auction') return 4;
  if (isLimitless) return 3;
  if (pt === 'prize-draw') return 2;
  return 0;
}

export function sortEventsForProfile<T extends SortableEvent>(
  events: T[],
  profileId: TestProfileId,
): T[] {
  return [...events].sort((a, b) => profileScore(b, profileId) - profileScore(a, profileId));
}

/**
 * Homepage / city: profile preference first, then affordable-with-balance.
 * Within each tier, order is shuffled (no cost ordering) — seeded by profile,
 * balance and `orderSeed` so lists don’t reshuffle every React render.
 */
export function sortEventsForProfileAndPointsBalance(
  events: EventData[],
  profileId: TestProfileId,
  userPoints: number,
  orderSeed: string,
): EventData[] {
  const bucketMap = new Map<string, EventData[]>();
  for (const e of events) {
    const prof = profileScore(e, profileId);
    const aff = isEventAffordableWithBalance(e, userPoints) ? 0 : 1;
    const key = `${prof}_${aff}`;
    const list = bucketMap.get(key);
    if (list) list.push(e);
    else bucketMap.set(key, [e]);
  }

  const keys = [...bucketMap.keys()].sort((ka, kb) => {
    const [pa, aa] = ka.split('_').map(Number);
    const [pb, ab] = kb.split('_').map(Number);
    if (pa !== pb) return pb - pa;
    return aa - ab;
  });

  const baseSeed = `${profileId}|${userPoints}|${orderSeed}`;
  const out: EventData[] = [];
  for (const k of keys) {
    const bucket = [...(bucketMap.get(k) ?? [])];
    const rng = mulberry32(hashStringToSeed(`${baseSeed}|${k}`));
    shuffleInPlace(bucket, rng);
    out.push(...bucket);
  }
  return out;
}

/**
 * Without Explorer subscription: same order, but only the first `maxExclusive` presale/exclusivity
 * events in this list are kept (rest of exclusives dropped). Other events unchanged.
 */
export function limitVoyagerExclusivePerSection<T extends { marketingTag?: MarketingTagType }>(
  eventsInSectionOrder: T[],
  isVoyagerSubscriber: boolean,
  maxExclusive = 1,
): T[] {
  if (isVoyagerSubscriber) return eventsInSectionOrder;
  let used = 0;
  return eventsInSectionOrder.filter((e) => {
    if (!isVoyagerSubscriberOnlyTag(e.marketingTag)) return true;
    if (used < maxExclusive) {
      used++;
      return true;
    }
    return false;
  });
}

/**
 * Take up to `take` items from a sorted pool. Without an Explorer subscription, at most `maxExclusive`
 * presale/exclusivity items appear in that result (skips further exclusives while filling slots).
 */
export function takeSortedWithVoyagerExclusiveCap<T extends { marketingTag?: MarketingTagType }>(
  sortedPool: T[],
  isVoyagerSubscriber: boolean,
  take: number,
  maxExclusive = 1,
): T[] {
  if (isVoyagerSubscriber) return sortedPool.slice(0, take);
  let exclusiveUsed = 0;
  const out: T[] = [];
  for (const e of sortedPool) {
    if (out.length >= take) break;
    if (isVoyagerSubscriberOnlyTag(e.marketingTag)) {
      if (exclusiveUsed >= maxExclusive) continue;
      exclusiveUsed++;
    }
    out.push(e);
  }
  return out;
}
