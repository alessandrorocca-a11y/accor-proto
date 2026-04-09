import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { IconHeart } from '@/components/atoms';
import { useUser, type OrderItem, type TestProfileId, TEST_PROFILES } from '@/context/UserContext';
import { searchCities, type City } from '@/data/europeanCities';
import { formatPoints } from '@/data/events/eventRegistry';

export interface MenuFavouriteEvent {
  id: string;
  image: string;
  date: string;
  title: string;
  eventTag: string;
  paymentLabel: string;
  points: string;
  countdown: string;
  /** When true, omit the Reward-points star (e.g. standard cash price in €). */
  hideRewardsIcon?: boolean;
}

export interface MenuProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
  userSurname?: string;
  userEmail?: string;
  userPhone?: string;
  userBirthday?: string;
  userCountry?: string;
  loyaltyTier?: 'classic' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points?: number;
  avatarSrc?: string | null;
  initialView?: MenuView;
  favouriteEvents?: MenuFavouriteEvent[];
  onToggleFavourite?: (id: string) => void;
  selectedCity?: string;
}

export type MenuView =
  | 'navigation'
  | 'profile'
  | 'account'
  | 'favourites'
  | 'orders'
  | 'auction-history'
  | 'communications'
  | 'test-account';

const TIER_LABELS: Record<string, string> = {
  classic: 'Classic',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  diamond: 'Diamond',
};

interface MenuItem {
  label: string;
  icon: string;
  action?: MenuView;
  href?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Account details', icon: 'account', action: 'account' },
  { label: 'Favourites', icon: 'favourites', action: 'favourites' },
  { label: 'Orders', icon: 'orders', action: 'orders' },
  { label: 'Auctions history', icon: 'auctions', action: 'auction-history' },
  { label: 'Communications preferences', icon: 'communications', action: 'communications' },
  { label: 'Test account', icon: 'test-account', action: 'test-account' },
  { label: 'Logout', icon: 'logout', href: '#' },
];

/* ── Sidebar navigation data ──────────────────────────────────────────── */

interface SidebarCategory {
  label: string;
  hash: string;
  image?: string;
}

const SIDEBAR_CATEGORIES: SidebarCategory[] = [
  { label: 'Arts and culture', hash: '#category/arts-and-culture', image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=96&h=96&fit=crop' },
  { label: 'Concerts and festivals', hash: '#category/concerts-and-festivals', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=96&h=96&fit=crop' },
  { label: 'Sports and activities', hash: '#category/sports-and-activities', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=96&h=96&fit=crop' },
  { label: 'Food and drink', hash: '#category/food-and-drink', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=96&h=96&fit=crop' },
  { label: 'Wellness', hash: '#category/wellness', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=96&h=96&fit=crop' },
  { label: 'Visits', hash: '#category/visits', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=96&h=96&fit=crop' },
  { label: 'Hotel experiences', hash: '#category/hotel-experiences', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=96&h=96&fit=crop' },
  { label: 'Arena', hash: '#category/arena', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=96&h=96&fit=crop' },
  { label: 'Paris Saint Germain', hash: '#category/paris-saint-germain', image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=96&h=96&fit=crop' },
  { label: 'Roland Garros', hash: '#momentum/roland-garros', image: '/roland-garros-1.png' },
];

interface SidebarSubscription {
  label: string;
  hash: string;
  image: string;
}

const SIDEBAR_SUBSCRIPTIONS: SidebarSubscription[] = [
  { label: 'ALL Signature exclusives', hash: '#category/all-signature-exclusives', image: '/all-signature.png' },
  { label: 'ALL Accor+ exclusives', hash: '#category/all-accor-plus-exclusives', image: '/all-accorplus.png' },
];

interface SidebarPayment {
  label: string;
  hash: string;
}

const SIDEBAR_PAYMENTS: SidebarPayment[] = [
  { label: 'Instant purchase', hash: '#payment/flex' },
  { label: 'Auction', hash: '#payment/auctions' },
  { label: 'Prize draw', hash: '#payment/prize-draws' },
  { label: 'Waitlist', hash: '#payment/waitlist' },
];

/* ── Icons ────────────────────────────────────────────────────────────── */

function IconPin() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronUp() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M11 19a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuItemIcon({ name }: { name: string }) {
  switch (name) {
    case 'account':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'favourites':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 21l-1.35-1.2C4.8 14.4 1.5 11.3 1.5 7.4 1.5 4.4 3.9 2 6.9 2c1.8 0 3.4.9 4.5 2.3C12.5 2.9 14.2 2 16 2c3 0 5.4 2.4 5.4 5.4 0 3.9-3.3 7-9.1 12.4L12 21z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'orders':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <g transform="translate(2, 5.33)">
            <path d="M0.875 0.5H2.65625C2.8607 0.5 3.04418 0.624634 3.12012 0.814453L3.23145 1.0918C3.69216 2.2433 5.27182 2.3699 5.91016 1.30664L6.24902 0.743164C6.33938 0.592562 6.5021 0.5 6.67773 0.5H19C19.2761 0.5 19.5 0.723858 19.5 1V12.333C19.5 12.6091 19.2761 12.833 19 12.833H6.67773C6.50225 12.833 6.33943 12.7412 6.24902 12.5908L5.91016 12.0273C5.27201 10.9638 3.69235 11.0898 3.23145 12.2412L3.12012 12.5186C3.04419 12.7084 2.8607 12.833 2.65625 12.833H1C0.723857 12.833 0.5 12.6091 0.5 12.333V0.875L0.507812 0.798828C0.542851 0.628283 0.694088 0.5 0.875 0.5ZM1 12.333H2.65137L2.7793 12.0254C3.40855 10.5181 5.49348 10.3611 6.33887 11.7695L6.53125 12.0908L6.67773 12.333H19V1H6.67773L6.53125 1.24316L6.33887 1.56348C5.49352 2.97224 3.40845 2.81527 2.7793 1.30762L2.65137 1H1V12.333ZM4.72266 8.72168C4.90655 8.72191 5.05566 8.87171 5.05566 9.05566C5.05555 9.23952 4.90648 9.38844 4.72266 9.38867C4.53863 9.38867 4.38879 9.23966 4.38867 9.05566C4.38867 8.87157 4.53856 8.72168 4.72266 8.72168ZM4.72266 6.27832C4.90655 6.27855 5.05566 6.42738 5.05566 6.61133C5.05566 6.79528 4.90655 6.9441 4.72266 6.94434C4.53856 6.94434 4.38867 6.79542 4.38867 6.61133C4.38867 6.42723 4.53856 6.27832 4.72266 6.27832ZM4.72266 3.83301C4.90655 3.83324 5.05566 3.98304 5.05566 4.16699C5.05549 4.35079 4.90644 4.49977 4.72266 4.5C4.53867 4.5 4.38885 4.35094 4.38867 4.16699C4.38867 3.9829 4.53856 3.83301 4.72266 3.83301Z" fill="currentColor" stroke="currentColor" strokeWidth="0.3" />
          </g>
        </svg>
      );
    case 'auctions':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <g transform="translate(3.36, 3.45)">
            <path d="M11.49 0.000144073C10.1529 0.00224032 8.85727 0.464682 7.82103 1.30971C6.78478 2.15473 6.0711 3.3308 5.8 4.64014C6.30515 4.64399 6.80828 4.70437 7.3 4.82014C7.4759 4.0666 7.85188 3.37449 8.3883 2.81678C8.92471 2.25908 9.60167 1.85646 10.3478 1.65138C11.0939 1.4463 11.8816 1.44636 12.6277 1.65156C13.3738 1.85675 14.0507 2.25947 14.587 2.81725C15.1233 3.37503 15.4992 4.0672 15.675 4.82077C15.8508 5.57434 15.82 6.36138 15.5858 7.0989C15.3516 7.83642 14.9228 8.49708 14.3445 9.01122C13.7662 9.52536 13.0599 9.87392 12.3 10.0201C12.3838 10.4451 12.4274 10.877 12.43 11.3101C12.4349 11.3801 12.4349 11.4502 12.43 11.5201C13.8684 11.279 15.1631 10.5047 16.0562 9.35167C16.9493 8.19862 17.3753 6.75143 17.2491 5.29841C17.123 3.8454 16.4541 2.49324 15.3757 1.51134C14.2972 0.529436 12.8884 -0.0101301 11.43 0.000144073H11.49Z" fill="currentColor" />
            <path d="M5.8 17.1101C4.65287 17.1101 3.5315 16.77 2.5777 16.1327C1.62389 15.4954 0.88049 14.5895 0.441501 13.5297C0.00251305 12.4699 -0.112346 11.3037 0.111448 10.1786C0.335242 9.05353 0.887639 8.02007 1.69878 7.20892C2.50993 6.39778 3.54339 5.84538 4.66848 5.62159C5.79357 5.39779 6.95975 5.51265 8.01957 5.95164C9.07938 6.39063 9.98521 7.13403 10.6225 8.08784C11.2598 9.04164 11.6 10.163 11.6 11.3101C11.5974 12.8476 10.9854 14.3213 9.8983 15.4084C8.81116 16.4956 7.33745 17.1075 5.8 17.1101ZM5.8 7.01014C4.94954 7.01014 4.11818 7.26233 3.41105 7.73482C2.70392 8.20731 2.15278 8.87888 1.82732 9.6646C1.50186 10.4503 1.41671 11.3149 1.58263 12.149C1.74854 12.9831 2.15808 13.7493 2.75944 14.3507C3.36081 14.9521 4.127 15.3616 4.96111 15.5275C5.79523 15.6934 6.65982 15.6083 7.44554 15.2828C8.23126 14.9574 8.90283 14.4062 9.37532 13.6991C9.84781 12.992 10.1 12.1606 10.1 11.3101C10.0974 10.1705 9.64348 9.07834 8.83764 8.2725C8.03181 7.46667 6.93962 7.01278 5.8 7.01014Z" fill="currentColor" />
            <path d="M6.56 8.42014C6.56 8.22123 6.48098 8.03047 6.34033 7.88981C6.19968 7.74916 6.00892 7.67014 5.81 7.67014C5.61109 7.67014 5.42032 7.74916 5.27967 7.88981C5.13902 8.03047 5.06 8.22123 5.06 8.42014V9.95014L4.59 9.67014C4.41894 9.56538 4.21326 9.53287 4.01823 9.57975C3.82319 9.62664 3.65476 9.74908 3.55 9.92014C3.44524 10.0912 3.41273 10.2969 3.45961 10.4919C3.5065 10.687 3.62894 10.8554 3.8 10.9601L5.41 11.9101C5.51852 11.9658 5.63809 11.9965 5.76 12.0001H5.8C5.91552 11.9963 6.02854 11.9655 6.13 11.9101L6.21 11.8601C6.28517 11.8099 6.34973 11.7453 6.4 11.6701C6.4 11.6701 6.4 11.6701 6.4 11.6201C6.4 11.5701 6.4 11.5301 6.45 11.4801V11.3401C6.45 11.3401 6.45 11.3401 6.45 11.2901L6.56 8.42014Z" fill="currentColor" />
            <path d="M13.3 5.08014H12.24V3.08014C12.24 2.88123 12.161 2.69047 12.0203 2.54981C11.8797 2.40916 11.6889 2.33014 11.49 2.33014C11.2911 2.33014 11.1003 2.40916 10.9597 2.54981C10.819 2.69047 10.74 2.88123 10.74 3.08014V5.83014C10.74 6.02906 10.819 6.21982 10.9597 6.36047C11.1003 6.50113 11.2911 6.58014 11.49 6.58014H13.3C13.4989 6.58014 13.6897 6.50113 13.8303 6.36047C13.971 6.21982 14.05 6.02906 14.05 5.83014C14.05 5.63123 13.971 5.44047 13.8303 5.29981C13.6897 5.15916 13.4989 5.08014 13.3 5.08014Z" fill="currentColor" />
          </g>
        </svg>
      );
    case 'communications':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'logout':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <g transform="translate(3, 3)">
            <path d="M10.2 16.4045C9.80925 16.4674 9.40844 16.5 9 16.5C7.60087 16.5 6.29122 16.1169 5.17024 15.4498L5.24017 15.2095C5.39911 14.6631 5.51968 14.306 5.62719 14.0662C5.73537 13.8249 5.79814 13.7782 5.80013 13.7768L5.80107 13.7762C5.80162 13.7759 5.80539 13.7741 5.8143 13.7714C5.83412 13.7655 5.87462 13.7568 5.95342 13.7513C6.07262 13.7429 6.19616 13.7446 6.37109 13.747C6.47336 13.7483 6.5932 13.75 6.74002 13.75H10.1575C10.2967 13.2091 10.5241 12.7037 10.8235 12.25H6.74002C6.65456 12.25 6.56477 12.2489 6.47407 12.2477C6.25483 12.245 6.03005 12.2422 5.84849 12.2549C5.55751 12.2753 5.21936 12.3393 4.90491 12.5732C4.60432 12.7968 4.41084 13.1127 4.25848 13.4525C4.13421 13.7296 4.01567 14.0735 3.88933 14.4892C2.41934 13.12 1.5 11.1674 1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C13.1421 1.5 16.5 4.85786 16.5 9C16.5 9.40844 16.4674 9.80925 16.4045 10.2C16.9098 10.3476 17.3819 10.5728 17.8072 10.8618C17.9335 10.2611 18 9.6383 18 9C18 4.02944 13.9706 0 9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18C9.6383 18 10.2611 17.9335 10.8618 17.8072C10.5728 17.3819 10.3476 16.9098 10.2 16.4045Z" fill="currentColor" />
            <path fillRule="evenodd" clipRule="evenodd" d="M5.25 7C5.25 4.92893 6.92893 3.25 9 3.25C11.0711 3.25 12.75 4.92893 12.75 7C12.75 9.07107 11.0711 10.75 9 10.75C6.92893 10.75 5.25 9.07107 5.25 7ZM9 4.75C7.75736 4.75 6.75 5.75736 6.75 7C6.75 8.24264 7.75736 9.25 9 9.25C10.2426 9.25 11.25 8.24264 11.25 7C11.25 5.75736 10.2426 4.75 9 4.75Z" fill="currentColor" />
            <path fillRule="evenodd" clipRule="evenodd" d="M13.9414 15.002L12.3504 13.411C12.0575 13.1181 12.0575 12.6432 12.3504 12.3503C12.6433 12.0574 13.1182 12.0574 13.4111 12.3503L15.002 13.9413L16.593 12.3503C16.8859 12.0574 17.3608 12.0574 17.6537 12.3503C17.9466 12.6432 17.9466 13.1181 17.6537 13.411L16.0627 15.002L17.6537 16.593C17.9466 16.8859 17.9466 17.3607 17.6537 17.6536C17.3608 17.9465 16.8859 17.9465 16.593 17.6536L15.002 16.0626L13.4111 17.6536C13.1182 17.9465 12.6433 17.9465 12.3504 17.6536C12.0575 17.3607 12.0575 16.8859 12.3504 16.593L13.9414 15.002Z" fill="currentColor" />
          </g>
        </svg>
      );
    case 'test-account':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M9 3v2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2V3h-2zm2 0h2v2h-2V3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 10v4M10 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

function IconAllStatus() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <path
        d="M28.5676 29.5725H23.2581L19.3538 21.0889C18.1581 21.7395 17.2503 22.8678 16.3023 24.0459C15.5606 24.9678 14.7943 25.9201 13.8463 26.6981C12.7429 27.6031 11.4604 28.4044 9.85714 28.9512C9.13098 29.1963 7.89556 29.5168 7.43346 29.564C7.23541 29.5828 7.10338 29.5734 7.07509 29.5074C7.05623 29.4508 7.10338 29.4131 7.31086 29.3094C7.35281 29.2893 7.41806 29.2599 7.50045 29.2228C7.88105 29.0514 8.62715 28.7154 9.13098 28.3667C9.89486 27.8294 10.3287 27.2543 10.3664 26.8112C10.3279 26.6748 10.2449 26.5072 10.145 26.3055C9.70667 25.4201 8.94293 23.8776 10.1872 21.4283C10.4071 20.9926 10.6147 20.6071 10.8065 20.2511C11.0919 19.7213 11.3422 19.2567 11.5452 18.7887C11.9319 17.8931 12.2148 16.6299 12.3091 15.6872C12.3185 15.6306 12.328 15.6306 12.3563 15.6683C13.1013 16.4225 15.9871 19.3826 15.5627 22.3333C16.5246 21.9657 18.1844 20.8438 18.9483 20.2499C19.1278 20.1101 19.2934 19.9694 19.4518 19.8349C20.0093 19.3613 20.4774 18.9637 21.1456 18.949C21.5749 18.9437 21.7838 19.0575 21.9932 19.1716C22.1565 19.2605 22.32 19.3496 22.5885 19.3826C22.7394 19.4015 22.9658 19.3732 23.0789 19.3166C23.1261 19.2978 23.1167 19.2412 23.0412 19.2224C22.6959 19.14 22.4583 18.9744 22.2212 18.809C21.8884 18.5771 21.5565 18.3456 20.9287 18.3456C20.205 18.3456 19.5881 18.8472 19.0899 19.2523C18.926 19.3856 18.7749 19.5084 18.6371 19.5994L15.9116 13.9243C14.7799 11.5486 15.1194 9.82347 17.628 6.42969L28.5676 29.5725Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Reward-points glyph (Iris status card) — 24×24, star in circle */
function IconMenuRewardPoints() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.125" />
      <path
        d="M11.4736 6.10329C11.6848 5.66047 12.3152 5.66047 12.5264 6.10329L13.8798 8.93934C13.9648 9.11754 14.1342 9.24065 14.3301 9.26645L17.4455 9.67712C17.9319 9.74124 18.1266 10.3407 17.7708 10.6785L15.4917 12.842C15.3486 12.9779 15.2838 13.1761 15.3198 13.3712L15.8919 16.4612C15.9813 16.9436 15.4713 17.314 15.04 17.0801L12.2783 15.581C12.1047 15.4872 11.8953 15.4872 11.7217 15.581L8.95994 17.0801C8.52871 17.314 8.01871 16.9436 8.10806 16.4612L8.68024 13.3712C8.71623 13.1761 8.65143 12.9779 8.50827 12.842L6.22918 10.6785C5.87343 10.3407 6.06806 9.74124 6.55451 9.67712L9.66994 9.26645C9.86577 9.24065 10.0352 9.11754 10.1202 8.93934L11.4736 6.10329Z"
        stroke="currentColor"
        strokeWidth="1.125"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPointsStar() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M7.64903 4.06886C7.7899 3.77365 8.21012 3.77365 8.35099 4.06886L9.25318 5.95956C9.30987 6.07836 9.42282 6.16043 9.55334 6.17763L11.6303 6.45141C11.9546 6.49416 12.0844 6.89381 11.8472 7.11901L10.3278 8.5613C10.2324 8.65194 10.1892 8.78472 10.2132 8.91416L10.5946 10.9741C10.6542 11.2957 10.3142 11.5427 10.0267 11.3867L8.18552 10.3873C8.06982 10.3246 7.9302 10.3246 7.8145 10.3873L5.97329 11.3867C5.68581 11.5427 5.34584 11.2957 5.4054 10.9741L5.78683 8.91416C5.8108 8.78472 5.76766 8.65194 5.67218 8.5613L4.15282 7.11901C3.91559 6.89381 4.04544 6.49416 4.36974 6.45141L6.44668 6.17763C6.5772 6.16043 6.69015 6.07836 6.74684 5.95956L7.64903 4.06886Z" stroke="currentColor" />
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeLinejoin="round" />
    </svg>
  );
}

interface FavouriteEvent {
  id: string;
  image: string;
  date: string;
  title: string;
  eventTag: string;
  paymentLabel: string;
  points: string;
  countdown: string;
}

const FAVOURITE_EVENTS: FavouriteEvent[] = [
  {
    id: '1',
    image: 'https://limitlessexperiences.accor.com/media/catalog/product/A/n/Andrea_Bocelli_2026_affiche_aa_0727.jpg',
    date: 'April 1, 2026',
    title: 'Andrea Bocelli – 2 Tickets',
    eventTag: 'Limitless experience',
    paymentLabel: 'Current bid',
    points: '18.000 Reward Points',
    countdown: '43d 12h 00m 00s',
  },
  {
    id: '2',
    image: 'https://limitlessexperiences.accor.com/media/catalog/product/R/o/Rosalia_2026_Affiche_01_032b.jpg',
    date: 'March 20, 2026',
    title: 'Rosalía – VIP Suite & Night at Pullman',
    eventTag: 'Limitless experience',
    paymentLabel: 'Current bid',
    points: '20.000 Reward Points',
    countdown: '14d 08h 00m 00s',
  },
  {
    id: '3',
    image: '/roland-garros-1.png',
    date: 'May 25-29, 2026',
    title: 'Roland-Garros Prize Draw – One Point Away',
    eventTag: 'Limitless experience',
    paymentLabel: 'Prize draw',
    points: '40 Reward Points',
    countdown: '80d 00h 00m 00s',
  },
  {
    id: '4',
    image: 'https://limitlessexperiences.accor.com/media/catalog/product/W/u/Wu_Tang_Clan_500x500_510c.jpg',
    date: 'March 28, 2026',
    title: 'Wu-Tang Clan – 2x Suite Tickets',
    eventTag: 'Limitless experience',
    paymentLabel: 'Current bid',
    points: '8.000 Reward Points',
    countdown: '22d 16h 00m 00s',
  },
];

interface OrderEvent {
  id: string;
  image: string;
  date: string;
  title: string;
  eventTag: string;
  paymentLabel: string;
  points: string;
  countdown: string;
}

const STATIC_PAST_ORDERS: OrderEvent[] = [];

/** Image badge = Figma 💠 web.badge (nodes 2567:31676–31677, 2567:31675) */
export type AuctionHistoryBadgeVariant = 'winning' | 'outbid' | 'winner';

type AuctionHistoryListRow = {
  id: string;
  eventId: string;
  image: string;
  date: string;
  title: string;
  eventTag: string;
  paymentLabel: string;
  points: string;
  auctionBadge: AuctionHistoryBadgeVariant;
  auctionEndsAt?: number;
};

const AUCTION_BADGE_LABEL: Record<AuctionHistoryBadgeVariant, string> = {
  winning: 'Winning',
  outbid: 'Outbid',
  winner: 'Winner',
};

function MenuAuctionImageBadge({ variant }: { variant: AuctionHistoryBadgeVariant }) {
  return (
    <span className={`menu__order-card-img-badge menu__order-card-img-badge--${variant}`}>
      {AUCTION_BADGE_LABEL[variant]}
    </span>
  );
}

function padTimeUnit(n: number) {
  return n.toString().padStart(2, '0');
}

function formatTimeLeftMs(ms: number): string {
  if (ms <= 0) return '';
  const sec = Math.floor(ms / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  return `${days}d ${padTimeUnit(hours)}h ${padTimeUnit(minutes)}m ${padTimeUnit(seconds)}s`;
}

function MenuAuctionCountdown({ endsAt }: { endsAt: number }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  const text = formatTimeLeftMs(endsAt - Date.now());
  if (!text) return null;
  return (
    <span className="menu__order-card-countdown">
      <span className="menu__order-card-countdown-label">Time left:</span>
      <span className="menu__order-card-countdown-value">{text}</span>
    </span>
  );
}

/* ── Field display ────────────────────────────────────────────────────── */

function AccountField({ label, value }: { label: string; value: string }) {
  return (
    <div className="menu__field">
      <span className="menu__field-label">{label}</span>
      <span className="menu__field-value">{value}</span>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */

export function Menu({
  open,
  onClose,
  userName = 'Member',
  userSurname = '',
  userEmail = '',
  userPhone = '',
  userBirthday = '',
  userCountry = '',
  loyaltyTier = 'classic',
  points = 0,
  avatarSrc,
  initialView = 'navigation',
  favouriteEvents,
  onToggleFavourite,
  selectedCity,
}: MenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const [view, setView] = useState<MenuView>(initialView);
  const [navHidden, setNavHidden] = useState(false);
  const [ordersTab, setOrdersTab] = useState<'upcoming' | 'past'>('upcoming');
  const [auctionsHistoryTab, setAuctionsHistoryTab] = useState<'ongoing' | 'ended'>('ongoing');
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [subscriptionsExpanded, setSubscriptionsExpanded] = useState(true);
  const [paymentsExpanded, setPaymentsExpanded] = useState(true);
  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState('');
  const cityInputRef = useRef<HTMLInputElement>(null);

  let userCtx: ReturnType<typeof useUser> | null = null;
  try { userCtx = useUser(); } catch { /* Menu might render outside UserProvider */ }

  /** One row per active subscription; section hidden if none (silver/gold or no UserProvider). */
  const visibleSidebarSubscriptions = useMemo((): SidebarSubscription[] => {
    if (!userCtx?.isVoyagerSubscriber) return [];
    if (userCtx.testProfileId === 'goldSignature') {
      return SIDEBAR_SUBSCRIPTIONS.filter((s) => s.hash === '#category/all-signature-exclusives');
    }
    if (userCtx.testProfileId === 'goldVoyager') {
      return SIDEBAR_SUBSCRIPTIONS.filter((s) => s.hash === '#category/all-accor-plus-exclusives');
    }
    return [];
  }, [userCtx?.isVoyagerSubscriber, userCtx?.testProfileId]);

  const showSubscriptionsSection = visibleSidebarSubscriptions.length > 0;

  const UPCOMING_ORDERS: OrderEvent[] = useMemo(() => {
    if (!userCtx) return [];
    return userCtx.orders.map((o: OrderItem) => ({
      id: o.id,
      image: o.image,
      date: o.date,
      title: o.title,
      eventTag: o.eventTag,
      paymentLabel: o.paymentLabel,
      points: o.points,
      countdown: o.countdown,
    }));
  }, [userCtx?.orders]);

  const PAST_ORDERS = STATIC_PAST_ORDERS;

  const auctionHistoryOngoingRows: AuctionHistoryListRow[] = useMemo(() => {
    if (!userCtx) return [];
    return userCtx.auctionOngoing.map((a) => ({
      id: a.id,
      eventId: a.eventId,
      image: a.image,
      date: a.date,
      title: a.title,
      eventTag: a.eventTag,
      paymentLabel: 'Your bid',
      points: `${formatPoints(a.bidAmount)} Reward Points`,
      auctionEndsAt: a.auctionEndsAt,
      auctionBadge: a.status === 'winning' ? 'winning' : 'outbid',
    }));
  }, [userCtx?.auctionOngoing]);

  const auctionHistoryEndedRows: AuctionHistoryListRow[] = useMemo(() => {
    if (!userCtx) return [];
    return userCtx.auctionWon.map((w) => ({
      id: w.id,
      eventId: w.eventId,
      image: w.image,
      date: w.date,
      title: w.title,
      eventTag: w.eventTag,
      paymentLabel: 'Winning bid',
      points: `${formatPoints(w.winningBid)} Reward Points`,
      auctionBadge: 'winner',
    }));
  }, [userCtx?.auctionWon]);
  const [prefEmail, setPrefEmail] = useState(true);
  const [prefHigherBid, setPrefHigherBid] = useState(true);
  const [prefLastDay, setPrefLastDay] = useState(true);

  const handleContentScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const currentY = el.scrollTop;
    const threshold = 4;
    if (currentY > lastScrollY.current + threshold && currentY > 48) {
      setNavHidden(true);
    } else if (currentY < lastScrollY.current - threshold) {
      setNavHidden(false);
    }
    lastScrollY.current = currentY;
  }, []);

  useEffect(() => {
    if (open) {
      setView(initialView);
      setCitySearchOpen(false);
      setCityQuery('');
    } else {
      setView(initialView);
      setOrdersTab('upcoming');
      setAuctionsHistoryTab('ongoing');
      setNavHidden(false);
      setCitySearchOpen(false);
      setCityQuery('');
    }
  }, [open, initialView]);

  useEffect(() => {
    setNavHidden(false);
    lastScrollY.current = 0;
  }, [view]);

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
    if (open && menuRef.current) {
      const close = menuRef.current.querySelector<HTMLElement>('.menu__close');
      close?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleHashChange = () => onClose();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [open, onClose]);

  useEffect(() => {
    if (citySearchOpen && cityInputRef.current) {
      cityInputRef.current.focus();
    }
  }, [citySearchOpen]);

  const filteredCities = useMemo<City[]>(() => {
    if (!cityQuery.trim()) return [];
    return searchCities(cityQuery).slice(0, 10);
  }, [cityQuery]);

  const navigateTo = useCallback((hash: string) => {
    window.location.hash = hash;
  }, []);

  if (!open) return null;

  const handleItemClick = (item: MenuItem, e: React.MouseEvent) => {
    if (item.action) {
      e.preventDefault();
      setView(item.action);
    }
  };

  return (
    <div className="menu-overlay" onClick={onClose}>
      <div
        ref={menuRef}
        className="menu"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        aria-label={
          view === 'navigation' ? 'Menu' :
          view === 'profile' ? 'Profile menu' :
          view === 'account' ? 'My account' :
          view === 'favourites' ? 'Favourites' :
          view === 'orders' ? 'Orders' :
          view === 'auction-history' ? 'Auctions history' :
          view === 'communications' ? 'Communications preferences' :
          view === 'test-account' ? 'Test account' : 'Menu'
        }
      >
        {/* ── Navigation view (Figma sidebar) ────────────────────── */}
        {view === 'navigation' && (
          <>
            <div className={`menu__nav${navHidden ? ' menu__nav--hidden' : ''}`}>
              <div className="menu__nav-spacer" aria-hidden />
              <h2 className="menu__nav-title">Menu</h2>
              <button
                type="button"
                className="menu__close"
                onClick={onClose}
                aria-label="Close menu"
              >
                <IconClose />
              </button>
            </div>

            <div className="menu__content" onScroll={handleContentScroll}>
              {/* City + Language selector row */}
              {selectedCity && (
                <div className="menu__selector-row">
                  <div className="menu__selector-left">
                    <button
                      type="button"
                      className="menu__city-btn"
                      onClick={() => setCitySearchOpen(!citySearchOpen)}
                    >
                      <span className="menu__city-icon"><IconPin /></span>
                      <span className="menu__city-label">{selectedCity}</span>
                    </button>
                  </div>
                  <span className="menu__selector-divider" aria-hidden />
                  <span className="menu__lang-label">English</span>
                </div>
              )}

              {/* City search panel */}
              {citySearchOpen && (
                <div className="menu__city-search">
                  <div className="menu__city-search-input-wrap">
                    <IconSearch />
                    <input
                      ref={cityInputRef}
                      type="text"
                      className="menu__city-search-input"
                      placeholder="Search for a city..."
                      value={cityQuery}
                      onChange={(e) => setCityQuery(e.target.value)}
                    />
                  </div>
                  {filteredCities.length > 0 && (
                    <ul className="menu__city-results">
                      {filteredCities.map((city) => (
                        <li key={`${city.name}-${city.country}`}>
                          <button
                            type="button"
                            className="menu__city-result-btn"
                            onClick={() => navigateTo(`#city/${city.name.toLowerCase().replace(/\s+/g, '-')}`)}
                          >
                            <span className="menu__city-result-name">{city.name}</span>
                            <span className="menu__city-result-country">{city.country}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {cityQuery.trim() && filteredCities.length === 0 && (
                    <p className="menu__city-no-results">No cities found</p>
                  )}
                </div>
              )}

              {/* Categories accordion */}
              <div className="menu__sidebar-section">
                <button
                  type="button"
                  className="menu__accordion-trigger"
                  onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                  aria-expanded={categoriesExpanded}
                >
                  <span className="menu__accordion-label">Categories</span>
                  {categoriesExpanded ? <IconChevronUp /> : <IconChevronDown />}
                </button>

                {categoriesExpanded && (
                  <div className="menu__accordion-body">
                    {SIDEBAR_CATEGORIES.map((cat) => (
                      <button
                        key={cat.hash}
                        type="button"
                        className="menu__category-row"
                        onClick={() => navigateTo(cat.hash)}
                      >
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt=""
                            className="menu__category-thumb"
                            loading="lazy"
                          />
                        ) : (
                          <span className="menu__category-thumb-empty" />
                        )}
                        <span className="menu__category-name">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Subscriptions accordion — only the user’s plan (Explorer vs Signature); hidden if none */}
              {showSubscriptionsSection ? (
                <div className="menu__sidebar-section">
                  <button
                    type="button"
                    className="menu__accordion-trigger"
                    onClick={() => setSubscriptionsExpanded(!subscriptionsExpanded)}
                    aria-expanded={subscriptionsExpanded}
                  >
                    <span className="menu__accordion-label">Subscriptions</span>
                    {subscriptionsExpanded ? <IconChevronUp /> : <IconChevronDown />}
                  </button>

                  {subscriptionsExpanded && (
                    <div className="menu__accordion-body">
                      {visibleSidebarSubscriptions.map((sub) => (
                        <button
                          key={sub.hash}
                          type="button"
                          className="menu__category-row"
                          onClick={() => navigateTo(sub.hash)}
                        >
                          <img
                            src={sub.image}
                            alt=""
                            className="menu__subscription-thumb"
                            loading="lazy"
                          />
                          <span className="menu__category-name">{sub.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Payment mechanisms accordion */}
              <div className="menu__sidebar-section">
                <button
                  type="button"
                  className="menu__accordion-trigger"
                  onClick={() => setPaymentsExpanded(!paymentsExpanded)}
                  aria-expanded={paymentsExpanded}
                >
                  <span className="menu__accordion-label">Payment methods</span>
                  {paymentsExpanded ? <IconChevronUp /> : <IconChevronDown />}
                </button>

                {paymentsExpanded && (
                  <div className="menu__accordion-body">
                    {SIDEBAR_PAYMENTS.map((item) => (
                      <button
                        key={item.hash}
                        type="button"
                        className="menu__payment-row"
                        onClick={() => navigateTo(item.hash)}
                      >
                        <span className="menu__payment-name">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </>
        )}

        {/* ── Profile view ────────────────────────────────────────── */}
        {view === 'profile' && (
          <>
            <div className={`menu__nav${navHidden ? ' menu__nav--hidden' : ''}`}>
              <button
                type="button"
                className="menu__back"
                onClick={() => setView('navigation')}
                aria-label="Back to menu"
              >
                <IconChevronLeft />
              </button>
              <h2 className="menu__nav-title">Profile</h2>
              <button
                type="button"
                className="menu__close"
                onClick={onClose}
                aria-label="Close menu"
              >
                <IconClose />
              </button>
            </div>

            <div className="menu__content" onScroll={handleContentScroll}>
              <div className="menu__profile">
                <div className="menu__user">
                  <div className="menu__avatar-wrap">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="" className="menu__avatar-img" />
                    ) : (
                      <span className="menu__avatar-initials">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="menu__avatar-dot" aria-hidden />
                  </div>
                  <div className="menu__user-info">
                    <span className="menu__user-name">
                      {userName}{userSurname ? ` ${userSurname}` : ''}
                    </span>
                    {userEmail && (
                      <span className="menu__user-email">{userEmail}</span>
                    )}
                  </div>
                </div>

                <div className={`menu__status menu__status--${userCtx?.loyaltyTier ?? loyaltyTier}`}>
                  <div className="menu__status-icon">
                    <IconAllStatus />
                  </div>
                  <div className="menu__status-info">
                    <span className="menu__status-label">Status</span>
                    <span className="menu__status-tier">
                      {TIER_LABELS[userCtx?.loyaltyTier ?? loyaltyTier] ?? (userCtx?.loyaltyTier ?? loyaltyTier)}
                    </span>
                  </div>
                  <div className="menu__status-points-wrap">
                    <span className="menu__status-reward-icon" aria-hidden>
                      <IconMenuRewardPoints />
                    </span>
                    <span className="menu__status-points">
                      {(userCtx?.points ?? points).toLocaleString()} Reward points
                    </span>
                  </div>
                </div>

                <ul className="menu__list">
                  {MENU_ITEMS.map((item, i) => (
                    <li
                      key={item.label}
                      className={`menu__item${i < MENU_ITEMS.length - 1 ? ' menu__item--bordered' : ''}`}
                    >
                      <a
                        href={item.href ?? '#'}
                        className="menu__link"
                        onClick={(e) => handleItemClick(item, e)}
                      >
                        <span className="menu__link-icon">
                          <MenuItemIcon name={item.icon} />
                        </span>
                        <span className="menu__link-label">{item.label}</span>
                        <span className="menu__link-chevron">
                          <IconChevronRight />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}

        {/* ── Account detail view ─────────────────────────────────── */}
        {view === 'account' && (
          <>
            <div className={`menu__nav${navHidden ? ' menu__nav--hidden' : ''}`}>
              <button
                type="button"
                className="menu__back"
                onClick={() => setView('profile')}
                aria-label="Back to profile"
              >
                <IconChevronLeft />
              </button>
              <h2 className="menu__nav-title">My account</h2>
              <button
                type="button"
                className="menu__close"
                onClick={onClose}
                aria-label="Close menu"
              >
                <IconClose />
              </button>
            </div>

            <div className="menu__content" onScroll={handleContentScroll}>
              <div className="menu__account">
                {/* Avatar row + Edit */}
                <div className="menu__account-header">
                  <div className="menu__account-avatar">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="" className="menu__account-avatar-img" />
                    ) : (
                      <span className="menu__account-avatar-initials">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="menu__account-spacer" />
                  <a href="#" className="menu__account-edit">
                    <span>Edit</span>
                    <IconEdit />
                  </a>
                </div>

                {/* Contact fields */}
                <div className="menu__fields-group">
                  {userEmail && <AccountField label="E-mail" value={userEmail} />}
                  {userPhone && <AccountField label="Phone number" value={userPhone} />}
                </div>

                <hr className="menu__fields-divider" aria-hidden />

                {/* Personal fields */}
                <div className="menu__fields-group">
                  {userName && <AccountField label="Name" value={userName} />}
                  {userSurname && <AccountField label="Surname" value={userSurname} />}
                  {userBirthday && <AccountField label="Birthday" value={userBirthday} />}
                  {userCountry && <AccountField label="Country of Residence" value={userCountry} />}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Favourites view ─────────────────────────────────────── */}
        {view === 'favourites' && (
          <>
            <div className={`menu__nav${navHidden ? ' menu__nav--hidden' : ''}`}>
              <button
                type="button"
                className="menu__back"
                onClick={() => setView('profile')}
                aria-label="Back to profile"
              >
                <IconChevronLeft />
              </button>
              <h2 className="menu__nav-title">Favourites</h2>
              <button
                type="button"
                className="menu__close"
                onClick={onClose}
                aria-label="Close menu"
              >
                <IconClose />
              </button>
            </div>

            <div className="menu__content" onScroll={handleContentScroll}>
              <div className="menu__favourites">
                {(favouriteEvents ?? FAVOURITE_EVENTS).map((event) => (
                  <div key={event.id} className="menu__fav-card">
                    <div className="menu__fav-card-img-wrap">
                      <img
                        src={event.image}
                        alt=""
                        className="menu__fav-card-img"
                      />
                      <button
                        type="button"
                        className="menu__fav-card-heart"
                        aria-label="Remove from favourites"
                        onClick={() => onToggleFavourite?.(event.id)}
                      >
                        <IconHeart filled size={24} />
                      </button>
                    </div>
                    <div className="menu__fav-card-info">
                      <span className="menu__fav-card-date">{event.date}</span>
                      <span className="menu__fav-card-title">{event.title}</span>
                      {event.eventTag && <span className="menu__fav-card-tag">{event.eventTag}</span>}
                      <span className="menu__fav-card-payment">{event.paymentLabel}</span>
                      <span className="menu__fav-card-points">
                        {!event.hideRewardsIcon && <IconPointsStar />}
                        {event.points}
                      </span>
                      {event.countdown && (
                        <span className="menu__fav-card-countdown">
                          Time left: {event.countdown}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {(favouriteEvents ?? FAVOURITE_EVENTS).length === 0 && (
                  <p className="menu__empty-state">No favourites yet. Tap the heart on an event to save it here.</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Orders view ─────────────────────────────────────────── */}
        {view === 'orders' && (
          <>
            <div className={`menu__nav${navHidden ? ' menu__nav--hidden' : ''}`}>
              <button
                type="button"
                className="menu__back"
                onClick={() => setView('profile')}
                aria-label="Back to profile"
              >
                <IconChevronLeft />
              </button>
              <h2 className="menu__nav-title">Orders</h2>
              <button
                type="button"
                className="menu__close"
                onClick={onClose}
                aria-label="Close menu"
              >
                <IconClose />
              </button>
            </div>

            <div className="menu__content" onScroll={handleContentScroll}>
              <div className="menu__orders">
                {/* Tabs */}
                <div className="menu__orders-tabs" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    className={`menu__orders-tab${ordersTab === 'upcoming' ? ' menu__orders-tab--active' : ''}`}
                    aria-selected={ordersTab === 'upcoming'}
                    onClick={() => setOrdersTab('upcoming')}
                  >
                    Upcoming Events
                  </button>
                  <button
                    type="button"
                    role="tab"
                    className={`menu__orders-tab${ordersTab === 'past' ? ' menu__orders-tab--active' : ''}`}
                    aria-selected={ordersTab === 'past'}
                    onClick={() => setOrdersTab('past')}
                  >
                    Past Events
                  </button>
                </div>

                {/* Card list */}
                <div className="menu__orders-list">
                  {(ordersTab === 'upcoming' ? UPCOMING_ORDERS : PAST_ORDERS).map((event) => (
                    <a key={event.id} href="#" className="menu__order-card">
                      <div className="menu__order-card-img-wrap">
                        <img
                          src={event.image}
                          alt=""
                          className="menu__order-card-img"
                        />
                      </div>
                      <div className="menu__order-card-body">
                        <div className="menu__order-card-header">
                          <div className="menu__order-card-date-title">
                            <span className="menu__order-card-date">{event.date}</span>
                            <span className="menu__order-card-title">{event.title}</span>
                          </div>
                          <span className="menu__order-card-tag">{event.eventTag}</span>
                        </div>
                        <div className="menu__order-card-payment">
                          <span className="menu__order-card-payment-label">{event.paymentLabel}</span>
                          <div className="menu__order-card-points">
                            <IconPointsStar />
                            <span className="menu__order-card-points-value">{event.points}</span>
                          </div>
                        </div>
                        <span className="menu__order-card-countdown">
                          <span className="menu__order-card-countdown-label">Time left:</span>
                          <span className="menu__order-card-countdown-value">{event.countdown}</span>
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Auctions history view (same layout as orders) ───────── */}
        {view === 'auction-history' && (
          <>
            <div className={`menu__nav${navHidden ? ' menu__nav--hidden' : ''}`}>
              <button
                type="button"
                className="menu__back"
                onClick={() => setView('profile')}
                aria-label="Back to profile"
              >
                <IconChevronLeft />
              </button>
              <h2 className="menu__nav-title">Auctions history</h2>
              <button
                type="button"
                className="menu__close"
                onClick={onClose}
                aria-label="Close menu"
              >
                <IconClose />
              </button>
            </div>

            <div className="menu__content" onScroll={handleContentScroll}>
              <div className="menu__orders">
                <div className="menu__orders-tabs" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    className={`menu__orders-tab${auctionsHistoryTab === 'ongoing' ? ' menu__orders-tab--active' : ''}`}
                    aria-selected={auctionsHistoryTab === 'ongoing'}
                    onClick={() => setAuctionsHistoryTab('ongoing')}
                  >
                    Ongoing
                  </button>
                  <button
                    type="button"
                    role="tab"
                    className={`menu__orders-tab${auctionsHistoryTab === 'ended' ? ' menu__orders-tab--active' : ''}`}
                    aria-selected={auctionsHistoryTab === 'ended'}
                    onClick={() => setAuctionsHistoryTab('ended')}
                  >
                    Ended
                  </button>
                </div>

                <div className="menu__orders-list">
                  {(auctionsHistoryTab === 'ongoing' ? auctionHistoryOngoingRows : auctionHistoryEndedRows).map(
                    (event) => (
                      <a
                        key={event.id}
                        href={`#auction/${event.eventId}`}
                        className="menu__order-card"
                        onClick={onClose}
                      >
                        <div className="menu__order-card-img-wrap">
                          <MenuAuctionImageBadge variant={event.auctionBadge} />
                          <img
                            src={event.image}
                            alt=""
                            className="menu__order-card-img"
                          />
                        </div>
                        <div className="menu__order-card-body">
                          <div className="menu__order-card-header">
                            <div className="menu__order-card-date-title">
                              <span className="menu__order-card-date">{event.date}</span>
                              <span className="menu__order-card-title">{event.title}</span>
                            </div>
                            <span className="menu__order-card-tag">{event.eventTag}</span>
                          </div>
                          <div className="menu__order-card-payment">
                            <span className="menu__order-card-payment-label">{event.paymentLabel}</span>
                            <div className="menu__order-card-points">
                              <IconPointsStar />
                              <span className="menu__order-card-points-value">{event.points}</span>
                            </div>
                          </div>
                          {event.auctionEndsAt != null ? (
                            <MenuAuctionCountdown endsAt={event.auctionEndsAt} />
                          ) : null}
                        </div>
                      </a>
                    ),
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Communications preferences view ─────────────────────── */}
        {view === 'communications' && (
          <>
            <div className={`menu__nav${navHidden ? ' menu__nav--hidden' : ''}`}>
              <button
                type="button"
                className="menu__back"
                onClick={() => setView('profile')}
                aria-label="Back to profile"
              >
                <IconChevronLeft />
              </button>
              <h2 className="menu__nav-title">Communications preferences</h2>
              <button
                type="button"
                className="menu__close"
                onClick={onClose}
                aria-label="Close menu"
              >
                <IconClose />
              </button>
            </div>

            <div className="menu__content" onScroll={handleContentScroll}>
              <div className="menu__comms">
                {/* Email toggle */}
                <div className="menu__comms-group">
                  <div className="menu__comms-toggle">
                    <div className="menu__comms-texts">
                      <span className="menu__comms-label">Email</span>
                      <span className="menu__comms-desc">
                        I want to receive discount vouchers, exclusive offers and the latest news
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefEmail}
                      className={`menu__comms-switch${prefEmail ? ' menu__comms-switch--on' : ''}`}
                      onClick={() => setPrefEmail(!prefEmail)}
                    >
                      <span className="menu__comms-switch-thumb" />
                    </button>
                  </div>
                </div>

                <hr className="menu__comms-divider" aria-hidden />

                {/* My Auctions section */}
                <span className="menu__comms-section-title">My Auctions</span>

                <div className="menu__comms-group">
                  <div className="menu__comms-toggle menu__comms-toggle--margin-bottom">
                    <div className="menu__comms-texts">
                      <span className="menu__comms-label">Higher bid</span>
                      <span className="menu__comms-desc">
                        I want to receive a notification when someone outbids me.
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefHigherBid}
                      className={`menu__comms-switch${prefHigherBid ? ' menu__comms-switch--on' : ''}`}
                      onClick={() => setPrefHigherBid(!prefHigherBid)}
                    >
                      <span className="menu__comms-switch-thumb" />
                    </button>
                  </div>
                </div>

                <div className="menu__comms-group">
                  <div className="menu__comms-toggle">
                    <div className="menu__comms-texts">
                      <span className="menu__comms-label">Last day alert</span>
                      <span className="menu__comms-desc">
                        I would like to receive a notification on the auction's final day.
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefLastDay}
                      className={`menu__comms-switch${prefLastDay ? ' menu__comms-switch--on' : ''}`}
                      onClick={() => setPrefLastDay(!prefLastDay)}
                    >
                      <span className="menu__comms-switch-thumb" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Test account view (prototype: switch user type) ───────────────── */}
        {view === 'test-account' && (
          <>
            <div className={`menu__nav${navHidden ? ' menu__nav--hidden' : ''}`}>
              <button
                type="button"
                className="menu__back"
                onClick={() => setView('profile')}
                aria-label="Back to profile"
              >
                <IconChevronLeft />
              </button>
              <h2 className="menu__nav-title">Test account</h2>
              <button
                type="button"
                className="menu__close"
                onClick={onClose}
                aria-label="Close menu"
              >
                <IconClose />
              </button>
            </div>

            <div className="menu__content" onScroll={handleContentScroll}>
              <div className="menu__account">
                <p className="menu__test-account-desc">
                  Switch user type for prototype testing. Selection is saved for this session.
                </p>
                <ul className="menu__list" role="radiogroup" aria-label="Test account type">
                  {(['silver', 'gold', 'goldVoyager', 'goldSignature'] as TestProfileId[]).map((id) => {
                    const p = TEST_PROFILES[id];
                    const isSelected = userCtx?.testProfileId === id;
                    const pts = p.points.toLocaleString('de-DE');
                    const label =
                      id === 'silver'
                        ? `Silver — ${pts} points, no subscription`
                        : id === 'gold'
                          ? `Gold — ${pts} points, no subscription`
                          : id === 'goldVoyager'
                            ? `Gold + Explorer — ${pts} points, Explorer subscriber`
                            : `Gold + ALL Signature — ${pts} points, ALL Signature subscriber`;
                    return (
                      <li key={id} className="menu__item menu__item--bordered">
                        <button
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          className={`menu__link menu__link--selectable${isSelected ? ' menu__link--selected' : ''}`}
                          onClick={() => {
                            userCtx?.setTestProfile(id);
                          }}
                        >
                          <span className="menu__link-label">{label}</span>
                          {isSelected && (
                            <span className="menu__link-check" aria-hidden>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
