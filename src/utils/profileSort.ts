import type { TestProfileId } from '@/context/UserContext';
import type { EventData } from '@/data/events/eventRegistry';
import { getEffectivePointsCost, isEventAffordableWithBalance } from '@/data/events/eventRegistry';

interface SortableEvent {
  pageType?: string;
  paymentType?: string;
  eventTag?: string;
}

function profileScore(event: SortableEvent, profileId: TestProfileId): number {
  const pt = event.pageType ?? event.paymentType ?? '';
  const isLimitless = event.eventTag === 'Limitless Experiences';

  if (profileId === 'silver') {
    if (pt === 'prize-draw') return 4;
    if (pt === 'standard' || pt === 'cash') return 3;
    if (pt === 'redeem' || pt === 'flex') return 2;
    return 0;
  }

  // gold / goldVoyager: auctions + Limitless first
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
 * Homepage / city: affordable-with-balance first, then ascending points cost,
 * then profile relevance as tiebreaker.
 */
export function sortEventsForProfileAndPointsBalance(
  events: EventData[],
  profileId: TestProfileId,
  userPoints: number,
): EventData[] {
  return [...events].sort((a, b) => {
    const affA = isEventAffordableWithBalance(a, userPoints) ? 0 : 1;
    const affB = isEventAffordableWithBalance(b, userPoints) ? 0 : 1;
    if (affA !== affB) return affA - affB;

    const costA = getEffectivePointsCost(a);
    const costB = getEffectivePointsCost(b);
    if (costA !== costB) return costA - costB;

    return profileScore(b, profileId) - profileScore(a, profileId);
  });
}
