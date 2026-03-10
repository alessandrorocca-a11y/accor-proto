import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { MenuFavouriteEvent } from '@/components/molecules/Menu/Menu';

interface FavouritesContextValue {
  favourites: Map<string, MenuFavouriteEvent>;
  isFavourite: (id: string) => boolean;
  toggleFavourite: (event: MenuFavouriteEvent) => void;
  removeFavourite: (id: string) => void;
  favouritesList: MenuFavouriteEvent[];
}

const FavouritesContext = createContext<FavouritesContextValue | null>(null);

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [favourites, setFavourites] = useState<Map<string, MenuFavouriteEvent>>(new Map());

  const isFavourite = useCallback((id: string) => favourites.has(id), [favourites]);

  const toggleFavourite = useCallback((event: MenuFavouriteEvent) => {
    setFavourites((prev) => {
      const next = new Map(prev);
      if (next.has(event.id)) {
        next.delete(event.id);
      } else {
        next.set(event.id, event);
      }
      return next;
    });
  }, []);

  const removeFavourite = useCallback((id: string) => {
    setFavourites((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const favouritesList = Array.from(favourites.values());

  return (
    <FavouritesContext.Provider value={{ favourites, isFavourite, toggleFavourite, removeFavourite, favouritesList }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error('useFavourites must be used within FavouritesProvider');
  return ctx;
}
