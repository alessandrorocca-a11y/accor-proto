import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { EventData } from '@/data/events/eventRegistry';
import { formatPoints, getPaymentLabel } from '@/data/events/eventRegistry';

export interface OrderItem {
  id: string;
  eventId: string;
  image: string;
  date: string;
  title: string;
  eventTag: string;
  paymentLabel: string;
  points: string;
  countdown: string;
  purchasedAt: number;
}

/** Ongoing auction the user has bid on (menu: Auctions history → Ongoing) */
export interface UserAuctionOngoing {
  id: string;
  eventId: string;
  image: string;
  date: string;
  title: string;
  eventTag: string;
  bidAmount: number;
  auctionEndsAt: number;
  status: 'winning' | 'outbid';
}

/** Ended auction the user won (menu: Auctions history → Ended) */
export interface UserAuctionWon {
  id: string;
  eventId: string;
  image: string;
  date: string;
  title: string;
  eventTag: string;
  winningBid: number;
}

const DEFAULT_AUCTION_MS_LEFT = (21 * 24 * 60 + 5 * 60 + 34) * 60 * 1000;

/** Test profile id for prototype: switch user type from profile menu */
export type TestProfileId = 'silver' | 'gold' | 'goldVoyager';

/** Loyalty tier shown in header/menu (same as MarketplaceHeader) */
export type LoyaltyTier = 'classic' | 'silver' | 'gold' | 'platinum' | 'diamond';

export const TEST_PROFILES: Record<
  TestProfileId,
  { points: number; loyaltyTier: LoyaltyTier; isVoyagerSubscriber: boolean }
> = {
  silver: { points: 2500, loyaltyTier: 'silver', isVoyagerSubscriber: false },
  gold: { points: 15000, loyaltyTier: 'gold', isVoyagerSubscriber: false },
  goldVoyager: { points: 25000, loyaltyTier: 'gold', isVoyagerSubscriber: true },
};

const STORAGE_KEY = 'accor-test-profile';

function getStoredTestProfile(): TestProfileId {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s === 'silver' || s === 'gold' || s === 'goldVoyager') return s;
  } catch {
    /* ignore */
  }
  return 'gold';
}

interface UserContextValue {
  points: number;
  orders: OrderItem[];
  auctionOngoing: UserAuctionOngoing[];
  auctionWon: UserAuctionWon[];
  loyaltyTier: LoyaltyTier;
  isVoyagerSubscriber: boolean;
  testProfileId: TestProfileId;
  setTestProfile: (id: TestProfileId) => void;
  deductPoints: (amount: number) => boolean;
  addOrder: (event: EventData, pointsSpent: number) => void;
  hasOrdered: (eventId: string) => boolean;
  recordAuctionBid: (event: EventData, bidAmount: number) => void;
  settleAuctionEnd: (eventId: string, won: boolean) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [testProfileId, setTestProfileIdState] = useState<TestProfileId>(getStoredTestProfile);
  const profile = TEST_PROFILES[testProfileId];
  const [points, setPoints] = useState(profile.points);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [auctionOngoing, setAuctionOngoing] = useState<UserAuctionOngoing[]>([]);
  const [auctionWon, setAuctionWon] = useState<UserAuctionWon[]>([]);

  const setTestProfile = useCallback(
    (id: TestProfileId) => {
      if (id === testProfileId) return;
      try {
        localStorage.setItem(STORAGE_KEY, id);
      } catch {
        /* ignore */
      }
      // Full reload so every page picks up profile (sorting, Explorer subscription gates, local UI state).
      window.location.reload();
    },
    [testProfileId],
  );

  useEffect(() => {
    setPoints(TEST_PROFILES[testProfileId].points);
  }, [testProfileId]);

  const deductPoints = useCallback((amount: number) => {
    let success = false;
    setPoints((prev) => {
      if (prev >= amount) {
        success = true;
        return prev - amount;
      }
      return prev;
    });
    return success;
  }, []);

  const addOrder = useCallback((event: EventData, pointsSpent: number) => {
    const order: OrderItem = {
      id: `order-${Date.now()}`,
      eventId: event.id,
      image: event.image,
      date: event.date,
      title: event.title,
      eventTag: event.eventTag ?? '',
      paymentLabel: getPaymentLabel(event.pageType),
      points: `${formatPoints(pointsSpent)} Reward Points`,
      countdown: '',
      purchasedAt: Date.now(),
    };
    setOrders((prev) => [order, ...prev]);
  }, []);

  const hasOrdered = useCallback(
    (eventId: string) => orders.some((o) => o.eventId === eventId),
    [orders],
  );

  const recordAuctionBid = useCallback((event: EventData, bidAmount: number) => {
    const msLeft = event.msLeft ?? DEFAULT_AUCTION_MS_LEFT;
    const auctionEndsAt = Date.now() + msLeft;
    const row: UserAuctionOngoing = {
      id: `auction-bid-${event.id}-${Date.now()}`,
      eventId: event.id,
      image: event.image,
      date: event.date,
      title: event.title,
      eventTag: event.eventTag ?? '',
      bidAmount,
      auctionEndsAt,
      status: 'winning',
    };
    setAuctionOngoing((prev) => {
      const rest = prev.filter((a) => a.eventId !== event.id);
      return [row, ...rest];
    });
  }, []);

  const settleAuctionEnd = useCallback((eventId: string, won: boolean) => {
    let wonEntry: UserAuctionWon | null = null;
    setAuctionOngoing((prev) => {
      const i = prev.findIndex((a) => a.eventId === eventId);
      if (i === -1) return prev;
      const entry = prev[i]!;
      if (won) {
        wonEntry = {
          id: `auction-won-${entry.eventId}-${Date.now()}`,
          eventId: entry.eventId,
          image: entry.image,
          date: entry.date,
          title: entry.title,
          eventTag: entry.eventTag,
          winningBid: entry.bidAmount,
        };
        return prev.filter((_, j) => j !== i);
      }
      return prev.map((e, j) => (j === i ? { ...e, status: 'outbid' as const } : e));
    });
    if (wonEntry) setAuctionWon((w) => [wonEntry!, ...w]);
  }, []);

  return (
    <UserContext.Provider
      value={{
        points,
        orders,
        auctionOngoing,
        auctionWon,
        loyaltyTier: profile.loyaltyTier,
        isVoyagerSubscriber: profile.isVoyagerSubscriber,
        testProfileId,
        setTestProfile,
        deductPoints,
        addOrder,
        hasOrdered,
        recordAuctionBid,
        settleAuctionEnd,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
