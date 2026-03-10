import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
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

interface UserContextValue {
  points: number;
  orders: OrderItem[];
  deductPoints: (amount: number) => boolean;
  addOrder: (event: EventData, pointsSpent: number) => void;
  hasOrdered: (eventId: string) => boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

const INITIAL_POINTS = 42500;

export function UserProvider({ children }: { children: ReactNode }) {
  const [points, setPoints] = useState(INITIAL_POINTS);
  const [orders, setOrders] = useState<OrderItem[]>([]);

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
    <UserContext.Provider value={{ points, orders, deductPoints, addOrder, hasOrdered }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
