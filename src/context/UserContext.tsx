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

/** Test profile id for prototype: switch user type from profile menu */
export type TestProfileId = 'silver' | 'gold' | 'goldVoyager';

/** Loyalty tier shown in header/menu (same as MarketplaceHeader) */
export type LoyaltyTier = 'classic' | 'silver' | 'gold' | 'platinum' | 'diamond';

export const TEST_PROFILES: Record<
  TestProfileId,
  { points: number; loyaltyTier: LoyaltyTier; isVoyagerSubscriber: boolean }
> = {
  silver: { points: 3000, loyaltyTier: 'silver', isVoyagerSubscriber: false },
  gold: { points: 20000, loyaltyTier: 'gold', isVoyagerSubscriber: false },
  goldVoyager: { points: 20000, loyaltyTier: 'gold', isVoyagerSubscriber: true },
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
  loyaltyTier: LoyaltyTier;
  isVoyagerSubscriber: boolean;
  testProfileId: TestProfileId;
  setTestProfile: (id: TestProfileId) => void;
  deductPoints: (amount: number) => boolean;
  addOrder: (event: EventData, pointsSpent: number) => void;
  hasOrdered: (eventId: string) => boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [testProfileId, setTestProfileIdState] = useState<TestProfileId>(getStoredTestProfile);
  const profile = TEST_PROFILES[testProfileId];
  const [points, setPoints] = useState(profile.points);
  const [orders, setOrders] = useState<OrderItem[]>([]);

  const setTestProfile = useCallback((id: TestProfileId) => {
    setTestProfileIdState(id);
    setPoints(TEST_PROFILES[id].points);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

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

  return (
    <UserContext.Provider
      value={{
        points,
        orders,
        loyaltyTier: profile.loyaltyTier,
        isVoyagerSubscriber: profile.isVoyagerSubscriber,
        testProfileId,
        setTestProfile,
        deductPoints,
        addOrder,
        hasOrdered,
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
