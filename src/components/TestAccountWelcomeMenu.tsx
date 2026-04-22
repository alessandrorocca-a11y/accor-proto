import { useCallback, useState } from 'react';
import { Menu } from '@/components';
import { TEST_ACCOUNT_GATE_SESSION_KEY } from '@/constants/testAccountGate';
import { useFavourites } from '@/context/FavouritesContext';
import { useUser } from '@/context/UserContext';

/**
 * First screen in a session: full-menu overlay on the Test account view so users
 * pick a prototype profile before using the app. Dismiss is remembered for the tab session.
 */
export function TestAccountWelcomeMenu() {
  const { points, loyaltyTier } = useUser();
  const { favouritesList, removeFavourite } = useFavourites();
  const [open, setOpen] = useState(() => {
    try {
      return sessionStorage.getItem(TEST_ACCOUNT_GATE_SESSION_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const handleClose = useCallback(() => {
    try {
      sessionStorage.setItem(TEST_ACCOUNT_GATE_SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
    setOpen(false);
  }, []);

  if (!open) return null;

  return (
    <Menu
      open
      onClose={handleClose}
      initialView="test-account"
      userName="Alessandro"
      userSurname="Rocca"
      userEmail="alessandro.rocca@email.com"
      userPhone="+33 661458723"
      userBirthday="29/10/1993"
      userCountry="Spain"
      loyaltyTier={loyaltyTier}
      points={points}
      avatarSrc="/avatar.png"
      favouriteEvents={favouritesList}
      onToggleFavourite={(id) => removeFavourite(id)}
      selectedCity="Paris"
    />
  );
}
