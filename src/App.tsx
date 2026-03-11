import { useState, useEffect, useCallback } from 'react';
import Demo from './Demo';
import HomePage from './pages/HomePage';
import AuctionPage from './pages/AuctionPage';
import PrizeDrawPage from './pages/PrizeDrawPage';
import LinkoutPage from './pages/LinkoutPage';
import RedeemPage from './pages/RedeemPage';
import WaitlistPage from './pages/WaitlistPage';
import StandardPage from './pages/StandardPage';
import CategoryPage from './pages/CategoryPage';
import PaymentMechanismPage from './pages/PaymentMechanismPage';
import AllCategoriesPage from './pages/AllCategoriesPage';
import CityPage from './pages/CityPage';
import NearYouPage from './pages/NearYouPage';
import NearYouListPage from './pages/NearYouListPage';
import PlanPage from './pages/plans/PlanPage';
import HighestBidderEmail from './pages/emails/HighestBidderEmail';
import OutbidEmail from './pages/emails/OutbidEmail';
import AuctionWinnerEmail from './pages/emails/AuctionWinnerEmail';
import PurchaseConfirmationEmail from './pages/emails/PurchaseConfirmationEmail';
import PrizeDrawWinnerEmail from './pages/emails/PrizeDrawWinnerEmail';
import ExpiringAuctionEmail from './pages/emails/ExpiringAuctionEmail';
import Auction24hLeftEmail from './pages/emails/Auction24hLeftEmail';
import PrizeDraw24hLeftEmail from './pages/emails/PrizeDraw24hLeftEmail';
import PrizeDrawLoserEmail from './pages/emails/PrizeDrawLoserEmail';
import PrizeDrawPurchaseEmail from './pages/emails/PrizeDrawPurchaseEmail';
import { FavouritesProvider } from './context/FavouritesContext';
import { UserProvider } from './context/UserContext';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface CategoryRouteConfig {
  category: string;
  breadcrumbs: BreadcrumbItem[];
  pageTitle?: string;
  defaultLocation?: string;
}

const CATEGORY_ROUTES: Record<string, CategoryRouteConfig> = {
  '#category': { category: 'Sport and leisure', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/shows-and-culture': { category: 'Shows and culture', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/concerts-and-festivals': { category: 'Concerts and festivals', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/sport-and-leisure': { category: 'Sport and leisure', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/food-and-drinks': { category: 'Food and drinks', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/wellness': { category: 'Wellness', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/visits': { category: 'Visits', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/hotel-experiences': { category: 'Hotel experiences', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/paris-saint-germain': { category: 'Paris Saint Germain', breadcrumbs: [{ label: 'Homepage', href: '#' }, { label: 'Sport and leisure', href: '#category/sport-and-leisure' }] },
  '#category/arena': { category: 'Arena', breadcrumbs: [{ label: 'Homepage', href: '#' }, { label: 'Concerts and festivals', href: '#category/concerts-and-festivals' }] },
  '#category/all-signature-exclusives': { category: 'All Signature Exclusives', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/all-accor-plus-exclusives': { category: 'All Accor Plus Exclusives', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/next-trip-to-paris': { category: 'Shows and culture', breadcrumbs: [{ label: 'Homepage', href: '#' }], pageTitle: 'Next trip to Paris', defaultLocation: 'Paris' },
  '#category/suggested-for-you': { category: 'Shows and culture', breadcrumbs: [{ label: 'Homepage', href: '#' }], pageTitle: 'Suggested for you' },
  '#category/tech': { category: 'Tech', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
};

interface CityRouteConfig {
  cityName: string;
  country: string;
}

const CITY_ROUTES: Record<string, CityRouteConfig> = {
  '#city/paris': { cityName: 'Paris', country: 'France' },
  '#city/rome': { cityName: 'Rome', country: 'Italy' },
  '#city/madrid': { cityName: 'Madrid', country: 'Spain' },
  '#city/london': { cityName: 'London', country: 'United Kingdom' },
  '#city/barcelona': { cityName: 'Barcelona', country: 'Spain' },
  '#city/lisbon': { cityName: 'Lisbon', country: 'Portugal' },
  '#city/amsterdam': { cityName: 'Amsterdam', country: 'Netherlands' },
  '#city/berlin': { cityName: 'Berlin', country: 'Germany' },
  '#city/vienna': { cityName: 'Vienna', country: 'Austria' },
  '#city/prague': { cityName: 'Prague', country: 'Czech Republic' },
  '#city/lyon': { cityName: 'Lyon', country: 'France' },
  '#city/marseille': { cityName: 'Marseille', country: 'France' },
  '#city/nice': { cityName: 'Nice', country: 'France' },
  '#city/bordeaux': { cityName: 'Bordeaux', country: 'France' },
  '#city/toulouse': { cityName: 'Toulouse', country: 'France' },
  '#city/strasbourg': { cityName: 'Strasbourg', country: 'France' },
};

type PaymentType = 'prize-draw' | 'redeem' | 'auction' | 'cash' | 'flex' | 'linkout' | 'waitlist';

const PAYMENT_ROUTES: Record<string, PaymentType> = {
  '#payment/auctions': 'auction',
  '#payment/prize-draws': 'prize-draw',
  '#payment/redeem': 'redeem',
  '#payment/flex': 'flex',
  '#payment/cash': 'cash',
  '#payment/linkout': 'linkout',
  '#payment/waitlist': 'waitlist',
};

function extractEventId(hash: string, prefix: string): string | undefined {
  if (hash.startsWith(prefix + '/')) {
    const id = hash.slice(prefix.length + 1);
    if (id.startsWith('evt-')) return id;
  }
  return undefined;
}

function parseHashParams(hash: string): { basePath: string; params: URLSearchParams } {
  const qIdx = hash.indexOf('?');
  if (qIdx === -1) return { basePath: hash, params: new URLSearchParams() };
  return { basePath: hash.slice(0, qIdx), params: new URLSearchParams(hash.slice(qIdx + 1)) };
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash);

  const onHashChange = useCallback(() => {
    setHash(window.location.hash);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [onHashChange]);

  if (hash === '#demo') return <Demo />;
  if (hash === '#email/highest-bidder') return <HighestBidderEmail />;
  if (hash === '#email/outbid') return <OutbidEmail />;
  if (hash === '#email/auction-winner') return <AuctionWinnerEmail />;
  if (hash === '#email/purchase-confirmation') return <PurchaseConfirmationEmail />;
  if (hash === '#email/prize-draw-winner') return <PrizeDrawWinnerEmail />;
  if (hash === '#email/expiring-auction') return <ExpiringAuctionEmail />;
  if (hash === '#email/auction-24h-left') return <Auction24hLeftEmail />;
  if (hash === '#email/prize-draw-24h-left') return <PrizeDraw24hLeftEmail />;
  if (hash === '#email/prize-draw-loser') return <PrizeDrawLoserEmail />;
  if (hash === '#email/prize-draw-purchase') return <PrizeDrawPurchaseEmail />;

  let page: React.ReactNode;

  const auctionEventId = extractEventId(hash, '#auction');
  const drawEventId = extractEventId(hash, '#draw');
  const redeemEventId = extractEventId(hash, '#redeem');
  const standardEventId = extractEventId(hash, '#standard');
  const waitlistEventId = extractEventId(hash, '#waitlist');

  if (auctionEventId) page = <AuctionPage eventId={auctionEventId} />;
  else if (drawEventId) page = <PrizeDrawPage eventId={drawEventId} />;
  else if (redeemEventId) page = <RedeemPage eventId={redeemEventId} />;
  else if (standardEventId) page = <StandardPage eventId={standardEventId} />;
  else if (waitlistEventId) page = <WaitlistPage eventId={waitlistEventId} />;
  else if (hash === '#draw') page = <PrizeDrawPage />;
  else if (hash === '#linkout') page = <LinkoutPage />;
  else if (hash === '#redeem') page = <RedeemPage />;
  else if (hash === '#waitlist') page = <WaitlistPage />;
  else if (hash === '#standard') page = <StandardPage />;
  else if (hash === '#categories') page = <AllCategoriesPage />;
  else if (hash in CATEGORY_ROUTES) {
    const route = CATEGORY_ROUTES[hash];
    page = <CategoryPage defaultCategory={route.category} breadcrumbs={route.breadcrumbs} pageTitle={route.pageTitle} defaultLocation={route.defaultLocation} />;
  }   else if (hash in PAYMENT_ROUTES) page = <PaymentMechanismPage defaultMechanism={PAYMENT_ROUTES[hash]} />;
  else if (hash in CITY_ROUTES) {
    const route = CITY_ROUTES[hash];
    page = <CityPage cityName={route.cityName} country={route.country} />;
  }
  else if ((() => { const { basePath } = parseHashParams(hash); return basePath in CITY_ROUTES; })()) {
    const { basePath, params } = parseHashParams(hash);
    const route = CITY_ROUTES[basePath];
    page = <CityPage cityName={route.cityName} country={route.country} dateFrom={params.get('from') || undefined} dateTo={params.get('to') || undefined} />;
  }
  else if (hash === '#auction') page = <AuctionPage />;
  else if (hash.startsWith('#plan/')) {
    const planSlug = hash.replace('#plan/', '');
    page = <PlanPage planSlug={planSlug} />;
  }
  else if (hash === '#near-you-list' || hash.startsWith('#near-you-list/')) {
    const citySlug = hash.replace('#near-you-list/', '').replace('#near-you-list', '');
    const cityName = citySlug
      ? Object.keys(CITY_ROUTES).map(k => CITY_ROUTES[k].cityName).find(c => c.toLowerCase() === citySlug.toLowerCase()) || 'Paris'
      : 'Paris';
    page = <NearYouListPage cityName={cityName} />;
  }
  else if (hash === '#near-you' || hash.startsWith('#near-you/')) {
    const citySlug = hash.replace('#near-you/', '').replace('#near-you', '');
    const cityName = citySlug
      ? Object.keys(CITY_ROUTES).map(k => CITY_ROUTES[k].cityName).find(c => c.toLowerCase() === citySlug.toLowerCase()) || 'Paris'
      : 'Paris';
    page = <NearYouPage cityName={cityName} />;
  }
  else page = <HomePage />;

  return (
    <UserProvider>
      <FavouritesProvider>{page}</FavouritesProvider>
    </UserProvider>
  );
}
