import { useState, useEffect, useCallback } from 'react';
import { BottomTabBar } from './components/BottomTabBar/BottomTabBar';
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
import { extractEventId, parseHashParams } from './utils/hashRoute';

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

interface MomentumRouteConfig {
  momentumSlug: string;
  pageTitle: string;
  breadcrumbs: BreadcrumbItem[];
}

const CATEGORY_ROUTES: Record<string, CategoryRouteConfig> = {
  '#category': { category: 'Sports and activities', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/arts-and-culture': { category: 'Arts and culture', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/shows-and-culture': { category: 'Arts and culture', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/concerts-and-festivals': { category: 'Concerts and festivals', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/sports-and-activities': { category: 'Sports and activities', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/sport-and-leisure': { category: 'Sports and activities', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/food-and-drink': { category: 'Food and drink', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/food-and-drinks': { category: 'Food and drink', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/wellness': { category: 'Wellness', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/visits': { category: 'Visits', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/hotel-experiences': { category: 'Hotel experiences', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/paris-saint-germain': {
    category: 'Paris Saint Germain',
    breadcrumbs: [{ label: 'Homepage', href: '#' }, { label: 'Sports and activities', href: '#category/sports-and-activities' }],
  },
  '#category/arena': {
    category: 'Arena',
    pageTitle: 'Accor arena',
    breadcrumbs: [{ label: 'Homepage', href: '#' }, { label: 'Concerts and festivals', href: '#category/concerts-and-festivals' }],
  },
  '#category/all-signature-exclusives': { category: 'ALL Signature exclusives', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/all-accor-plus-exclusives': { category: 'ALL Accor+ exclusives', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
  '#category/suggested-for-you': { category: 'Arts and culture', breadcrumbs: [{ label: 'Homepage', href: '#' }], pageTitle: 'Suggested for you' },
  '#category/tech': { category: 'Tech', breadcrumbs: [{ label: 'Homepage', href: '#' }] },
};

const MOMENTUM_ROUTES: Record<string, MomentumRouteConfig> = {
  '#momentum/roland-garros': {
    momentumSlug: 'roland-garros',
    pageTitle: 'Roland Garros',
    breadcrumbs: [{ label: 'Homepage', href: '#' }],
  },
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
  '#city/rio-de-janeiro': { cityName: 'Rio de Janeiro', country: 'Brazil' },
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

  const { basePath: hashBase, params: hashParams } = parseHashParams(hash);
  const isHomeRoot = hashBase === '' || hashBase === '#';

  if (hashBase === '#demo') return <Demo />;
  if (hashBase === '#email/highest-bidder') return <HighestBidderEmail />;
  if (hashBase === '#email/outbid') return <OutbidEmail />;
  if (hashBase === '#email/auction-winner') return <AuctionWinnerEmail />;
  if (hashBase === '#email/purchase-confirmation') return <PurchaseConfirmationEmail />;
  if (hashBase === '#email/prize-draw-winner') return <PrizeDrawWinnerEmail />;
  if (hashBase === '#email/expiring-auction') return <ExpiringAuctionEmail />;
  if (hashBase === '#email/auction-24h-left') return <Auction24hLeftEmail />;
  if (hashBase === '#email/prize-draw-24h-left') return <PrizeDraw24hLeftEmail />;
  if (hashBase === '#email/prize-draw-loser') return <PrizeDrawLoserEmail />;
  if (hashBase === '#email/prize-draw-purchase') return <PrizeDrawPurchaseEmail />;

  let page: React.ReactNode;

  const auctionEventId = extractEventId(hash, '#auction');
  const drawEventId = extractEventId(hash, '#draw');
  const redeemEventId = extractEventId(hash, '#redeem');
  const standardEventId = extractEventId(hash, '#standard');
  const waitlistEventId = extractEventId(hash, '#waitlist');
  const linkoutEventId = extractEventId(hash, '#linkout');

  if (auctionEventId) page = <AuctionPage eventId={auctionEventId} />;
  else if (drawEventId) page = <PrizeDrawPage eventId={drawEventId} />;
  else if (redeemEventId) page = <RedeemPage eventId={redeemEventId} />;
  else if (standardEventId) page = <StandardPage eventId={standardEventId} />;
  else if (waitlistEventId) page = <WaitlistPage eventId={waitlistEventId} />;
  else if (hashBase === '#draw') page = <PrizeDrawPage />;
  else if (linkoutEventId) page = <LinkoutPage eventId={linkoutEventId} />;
  else if (hashBase === '#linkout') page = <LinkoutPage />;
  else if (hashBase === '#redeem') page = <RedeemPage />;
  else if (hashBase === '#waitlist') page = <WaitlistPage />;
  else if (hashBase === '#standard') page = <StandardPage />;
  else if (hashBase === '#categories') page = <AllCategoriesPage />;
  else if (hashBase === '#category/next-trip') {
    const cityName = hashParams.get('city')?.trim() || 'Paris';
    const from = hashParams.get('from')?.trim() || undefined;
    const to = hashParams.get('to')?.trim() || undefined;
    page = (
      <CategoryPage
        defaultCategory="Arts and culture"
        breadcrumbs={[{ label: 'Homepage', href: '#' }]}
        pageTitle={`Next trip to ${cityName}`}
        defaultLocation={cityName}
        initialStayDateFrom={from}
        initialStayDateTo={to}
      />
    );
  } else if (hashBase in CATEGORY_ROUTES) {
    const route = CATEGORY_ROUTES[hashBase];
    page = <CategoryPage defaultCategory={route.category} breadcrumbs={route.breadcrumbs} pageTitle={route.pageTitle} defaultLocation={route.defaultLocation} />;
  } else if (hashBase in MOMENTUM_ROUTES) {
    const route = MOMENTUM_ROUTES[hashBase];
    page = (
      <CategoryPage
        defaultCategory="Sports and activities"
        breadcrumbs={route.breadcrumbs}
        pageTitle={route.pageTitle}
        momentumSlug={route.momentumSlug}
      />
    );
  } else if (hashBase in PAYMENT_ROUTES) page = <PaymentMechanismPage defaultMechanism={PAYMENT_ROUTES[hashBase]} />;
  else if (hashBase in CITY_ROUTES) {
    const route = CITY_ROUTES[hashBase];
    page = <CityPage cityName={route.cityName} country={route.country} dateFrom={hashParams.get('from') || undefined} dateTo={hashParams.get('to') || undefined} />;
  }
  else if (hashBase === '#auction') page = <AuctionPage />;
  else if (hashBase.startsWith('#plan/')) {
    const planSlug = hashBase.replace('#plan/', '');
    page = <PlanPage planSlug={planSlug} />;
  }
  else if (hashBase === '#near-you-list' || hashBase.startsWith('#near-you-list/')) {
    const citySlug = hashBase.replace('#near-you-list/', '').replace('#near-you-list', '');
    const cityName = citySlug
      ? Object.keys(CITY_ROUTES).map(k => CITY_ROUTES[k].cityName).find(c => c.toLowerCase() === citySlug.toLowerCase()) || 'Paris'
      : 'Paris';
    page = <NearYouListPage cityName={cityName} />;
  }
  else if (hashBase === '#near-you' || hashBase.startsWith('#near-you/')) {
    const citySlug = hashBase.replace('#near-you/', '').replace('#near-you', '');
    const cityName = citySlug
      ? Object.keys(CITY_ROUTES).map(k => CITY_ROUTES[k].cityName).find(c => c.toLowerCase() === citySlug.toLowerCase()) || 'Paris'
      : 'Paris';
    page = <NearYouPage cityName={cityName} />;
  }
  else page = <HomePage />;

  return (
    <UserProvider>
      <FavouritesProvider>
        {page}
        {!isHomeRoot ? <BottomTabBar /> : null}
      </FavouritesProvider>
    </UserProvider>
  );
}
