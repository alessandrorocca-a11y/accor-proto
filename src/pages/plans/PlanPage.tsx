import { useState, useRef, useCallback, useMemo } from 'react';
import {
  Button,
  Countdown,
  Input,
  Link,
  MarketplaceHeader,
  Menu,
  TermsDialog,
} from '@/components';
import type { MenuView } from '@/components';
import { useFavourites } from '@/context/FavouritesContext';
import { useUser } from '@/context/UserContext';
import { getPreviousPage } from '@/utils/navigationHistory';
import {
  PLANS,
  getPlanBySlug,
  getHeroImages,
  getIncludedItems,
  getDescription,
  getVenueDescription,
  getBidChips,
} from '@/data/plans';
import type { PlanData } from '@/data/plans';
import '../AuctionPage.css';
import '../PrizeDrawPage.css';
import '../RedeemPage.css';
import '../StandardPage.css';
import '../LinkoutPage.css';
import '../WaitlistPage.css';

interface PlanPageProps {
  planSlug: string;
}

const REDIRECT_DELAY_MS = 2500;

function formatPoints(n: number): string {
  if (n >= 1000) {
    const k = Math.floor(n / 1000);
    const rest = n % 1000;
    return rest === 0 ? `${k}.000` : `${k}.${String(rest).padStart(3, '0')}`;
  }
  return String(n);
}

function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconHeart({ filled }: { filled: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? '#B40875' : 'none'} aria-hidden>
      <path
        d="M12 21l-1.35-1.2C4.8 14.4 1.5 11.3 1.5 7.4 1.5 4.4 3.9 2 6.9 2c1.8 0 3.4.9 4.5 2.3C12.5 2.9 14.2 2 16 2c3 0 5.4 2.4 5.4 5.4 0 3.9-3.3 7-9.1 12.4L12 21z"
        stroke={filled ? '#B40875' : 'currentColor'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPin() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconGallery() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 16l4-4 4 4 3-3 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" />
    </svg>
  );
}

function IconBell({ filled }: { filled: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? '#2D4CD5' : 'none'} aria-hidden>
      <path
        d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9ZM13.73 21a2 2 0 0 1-3.46 0"
        stroke={filled ? '#2D4CD5' : 'currentColor'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMinus() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const ROOT_MODIFIER: Record<PlanData['paymentType'], string> = {
  auction: '',
  'prize-draw': ' draw-page',
  redeem: ' redeem-page',
  standard: ' standard-page',
  linkout: ' linkout',
  waitlist: ' waitlist',
};

export default function PlanPage({ planSlug }: PlanPageProps) {
  const plan = useMemo(() => getPlanBySlug(planSlug), [planSlug]);
  const planIndex = useMemo(() => (plan ? PLANS.indexOf(plan) : -1), [plan]);
  const heroImages = useMemo(() => (plan ? getHeroImages(plan, planIndex) : []), [plan, planIndex]);
  const includedItems = useMemo(() => (plan ? getIncludedItems(plan.category) : []), [plan]);
  const description = useMemo(() => (plan ? getDescription(plan) : []), [plan]);
  const venueDescription = useMemo(() => (plan ? getVenueDescription(plan) : ''), [plan]);
  const chips = useMemo(() => getBidChips(plan?.currentBid || 0), [plan?.currentBid]);

  const endDate = useMemo(
    () => new Date(Date.now() + (plan?.msLeft || 0)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plan?.msLeft],
  );

  // --- Shared state ---
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuInitialView, setMenuInitialView] = useState<MenuView>('navigation');
  const [loyaltyOpen, setLoyaltyOpen] = useState(false);
  const [isFavourite, setFavourite] = useState(false);
  const [showFavSnack, setShowFavSnack] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [termsOpen, setTermsOpen] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const favTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { points: userPoints, loyaltyTier: userLoyaltyTier } = useUser();
  const { favouritesList, removeFavourite } = useFavourites();
  const USER_POINTS = userPoints;

  // --- Auction state ---
  const [bidValue, setBidValue] = useState('');
  const [currentBid, setCurrentBid] = useState(plan?.currentBid || 0);
  const [bidCount, setBidCount] = useState(42);
  const [showConfirmBid, setShowConfirmBid] = useState(false);
  const [isHighestBidder, setIsHighestBidder] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [showBidError, setShowBidError] = useState(false);

  // --- Prize-draw state ---
  const [ticketCount, setTicketCount] = useState(1);
  const [hasEntered, setHasEntered] = useState(false);

  // --- Redeem state ---
  const [redeemCount, setRedeemCount] = useState(1);
  const [hasRedeemed, setHasRedeemed] = useState(false);

  // --- Linkout state ---
  const [showLoader, setShowLoader] = useState(false);

  // --- Waitlist state ---
  const [hasJoined, setHasJoined] = useState(false);
  const [showJoinedSnack, setShowJoinedSnack] = useState(false);

  // --- Shared handlers ---
  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const slideWidth = track.offsetWidth;
    const index = Math.round(track.scrollLeft / slideWidth);
    setActiveSlide(Math.min(index, heroImages.length - 1));
  }, [heroImages.length]);

  const handleHeartClick = () => {
    const next = !isFavourite;
    setFavourite(next);
    if (favTimerRef.current) clearTimeout(favTimerRef.current);
    if (next) {
      setShowFavSnack(true);
      favTimerRef.current = setTimeout(() => setShowFavSnack(false), 5000);
    } else {
      setShowFavSnack(false);
    }
  };

  // --- Linkout handler ---
  const handleBookNow = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLoader(true);
    setTimeout(() => {
      window.open(plan?.externalUrl || 'https://www.all.accor.com', '_blank', 'noopener,noreferrer');
      setShowLoader(false);
    }, REDIRECT_DELAY_MS);
  };

  // --- Waitlist handler ---
  const handleJoinWaitlist = () => {
    if (hasJoined) return;
    setHasJoined(true);
    setShowJoinedSnack(true);
    setTimeout(() => setShowJoinedSnack(false), 5000);
  };

  // --- Not found ---
  if (!plan) {
    return (
      <div className="auction-page" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <MarketplaceHeader
          theme="light"
          isLoggedIn
          avatarSrc="/avatar.png"
          points={USER_POINTS}
          loyaltyTier={userLoyaltyTier}
          onLogoClick={() => { window.location.href = window.location.pathname; }}
          onMenu={() => {}}
          onPointsClick={() => {}}
        />
        <h1 style={{ marginTop: 80 }}>Plan not found</h1>
        <p style={{ marginTop: 16 }}>The plan you're looking for doesn't exist.</p>
        <a href={window.location.pathname} style={{ marginTop: 24, display: 'inline-block', color: '#508ffa' }}>
          Back to home
        </a>
      </div>
    );
  }

  const rootModifier = ROOT_MODIFIER[plan.paymentType] ?? '';

  // --- Payment-specific sections ---
  const renderPaymentSection = () => {
    switch (plan.paymentType) {
      case 'auction':
        return !auctionEnded ? (
          <>
            <hr className="auction-page__divider" aria-hidden />
            <section className="auction-page__bid-section">
              <div className="auction-page__time-left-row">
                <span className="auction-page__time-left-label">Time left</span>
              </div>
              <Countdown endDate={endDate} onEnd={() => setAuctionEnded(true)} />
              <div className="auction-page__bid-info">
                <span className="auction-page__bid-label">{auctionEnded ? 'Winner Bid' : 'Current Bid'}</span>
                <span className="auction-page__bid-value">{formatPoints(currentBid)} Reward Points</span>
                <span className="auction-page__bid-count">{bidCount} bids</span>
              </div>
              <div className="auction-page__bid-input-row">
                <Input
                  label="Place your bid"
                  value={bidValue}
                  onChange={(e) => setBidValue(e.target.value)}
                  placeholder={`Min. ${formatPoints(currentBid + 500)}`}
                  type="number"
                />
              </div>
              <div className="auction-page__bid-chips">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className={`auction-page__bid-chip${bidValue === String(chip) ? ' auction-page__bid-chip--selected' : ''}`}
                    onClick={() => setBidValue(String(chip))}
                  >
                    {formatPoints(chip)}
                  </button>
                ))}
              </div>
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  const val = Number(bidValue);
                  if (!val || val <= currentBid) return;
                  if (val > USER_POINTS) {
                    setShowBidError(true);
                    setTimeout(() => setShowBidError(false), 5000);
                    return;
                  }
                  setShowConfirmBid(true);
                }}
              >
                Place bid
              </Button>
            </section>
          </>
        ) : null;

      case 'prize-draw':
        return (
          <>
            <hr className="auction-page__divider" aria-hidden />
            <section className="draw-page__section">
              <div className="auction-page__time-left-row">
                <span className="auction-page__time-left-label">Time left</span>
              </div>
              <Countdown endDate={endDate} />
              {!hasEntered ? (
                <>
                  <div className="draw-page__ticket-row">
                    <span className="draw-page__ticket-label">Tickets</span>
                    <div className="draw-page__stepper">
                      <button type="button" className="draw-page__stepper-btn" onClick={() => setTicketCount(Math.max(1, ticketCount - 1))} disabled={ticketCount <= 1}><IconMinus /></button>
                      <span className="draw-page__stepper-value">{ticketCount}</span>
                      <button type="button" className="draw-page__stepper-btn" onClick={() => setTicketCount(Math.min(plan.maxTickets || 10, ticketCount + 1))} disabled={ticketCount >= (plan.maxTickets || 10)}><IconPlus /></button>
                    </div>
                  </div>
                  <div className="draw-page__price-row">
                    <span>{formatPoints(plan.ticketPrice || 0)} pts × {ticketCount}</span>
                    <span className="draw-page__total">{formatPoints((plan.ticketPrice || 0) * ticketCount)} Reward Points</span>
                  </div>
                  <Button variant="primary" fullWidth onClick={() => setHasEntered(true)}>
                    Enter Prize Draw
                  </Button>
                </>
              ) : (
                <div className="draw-page__entered">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="10" fill="#00513f" />
                    <path d="M8 12l3 3 5-5" stroke="#e0f5ec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p>You've entered the prize draw with {ticketCount} ticket{ticketCount > 1 ? 's' : ''}!</p>
                </div>
              )}
            </section>
          </>
        );

      case 'redeem':
        return (
          <>
            <hr className="auction-page__divider" aria-hidden />
            <section className="redeem-page__section">
              {!hasRedeemed ? (
                <>
                  <div className="redeem-page__ticket-row">
                    <span className="redeem-page__ticket-label">Tickets</span>
                    <div className="redeem-page__stepper">
                      <button type="button" className="redeem-page__stepper-btn" onClick={() => setRedeemCount(Math.max(1, redeemCount - 1))} disabled={redeemCount <= 1}><IconMinus /></button>
                      <span className="redeem-page__stepper-value">{redeemCount}</span>
                      <button type="button" className="redeem-page__stepper-btn" onClick={() => setRedeemCount(Math.min(plan.maxTickets || 10, redeemCount + 1))} disabled={redeemCount >= (plan.maxTickets || 10)}><IconPlus /></button>
                    </div>
                  </div>
                  <div className="redeem-page__price-row">
                    <span>{formatPoints(plan.ticketPrice || 0)} pts × {redeemCount}</span>
                    <span className="redeem-page__total">{formatPoints((plan.ticketPrice || 0) * redeemCount)} Reward Points</span>
                  </div>
                  <Button variant="primary" fullWidth onClick={() => setHasRedeemed(true)}>
                    Redeem with Points
                  </Button>
                </>
              ) : (
                <div className="redeem-page__redeemed">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="10" fill="#00513f" />
                    <path d="M8 12l3 3 5-5" stroke="#e0f5ec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p>Successfully redeemed {redeemCount} ticket{redeemCount > 1 ? 's' : ''}!</p>
                </div>
              )}
            </section>
          </>
        );

      case 'standard':
        return (
          <>
            <hr className="auction-page__divider" aria-hidden />
            <section className="standard-page__price-section">
              <div className="standard-page__price-row">
                <span className="standard-page__price-label">Price per person</span>
                <span className="standard-page__price-value">{plan.price?.toFixed(2).replace('.', ',')} €</span>
              </div>
              <Button variant="primary" fullWidth onClick={() => {}}>
                Book Now
              </Button>
            </section>
          </>
        );

      case 'linkout':
      case 'waitlist':
      default:
        return null;
    }
  };

  const renderSidebar = () => {
    switch (plan.paymentType) {
      case 'auction':
        return (
          <div className="auction-page__bid-card">
            <div className="auction-page__bid-info">
              <span className="auction-page__bid-label">{auctionEnded ? 'Winner Bid' : 'Current Bid'}</span>
              <span className="auction-page__bid-value">{formatPoints(currentBid)} Reward Points</span>
              <span className="auction-page__bid-count">{bidCount} bids</span>
            </div>
            {!auctionEnded && (
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  const val = Number(bidValue);
                  if (!val || val <= currentBid) return;
                  if (val > USER_POINTS) {
                    setShowBidError(true);
                    setTimeout(() => setShowBidError(false), 5000);
                    return;
                  }
                  setShowConfirmBid(true);
                }}
              >
                Place bid
              </Button>
            )}
          </div>
        );

      case 'prize-draw':
        return (
          <div className="auction-page__bid-card draw-page__sidebar-card">
            <div className="draw-page__price-row">
              <span className="draw-page__total">{formatPoints((plan.ticketPrice || 0) * ticketCount)} Reward Points</span>
            </div>
            {!hasEntered && (
              <Button variant="primary" fullWidth onClick={() => setHasEntered(true)}>
                Enter Prize Draw
              </Button>
            )}
          </div>
        );

      case 'redeem':
        return (
          <div className="auction-page__bid-card redeem-page__sidebar-card">
            <div className="redeem-page__price-row">
              <span className="redeem-page__total">{formatPoints((plan.ticketPrice || 0) * redeemCount)} Reward Points</span>
            </div>
            {!hasRedeemed && (
              <Button variant="primary" fullWidth onClick={() => setHasRedeemed(true)}>
                Redeem with Points
              </Button>
            )}
          </div>
        );

      case 'standard':
        return (
          <div className="auction-page__bid-card standard-page__sidebar-card">
            <div className="standard-page__price-row">
              <span className="standard-page__price-value">{plan.price?.toFixed(2).replace('.', ',')} €</span>
            </div>
            <Button variant="primary" fullWidth>
              Book Now
            </Button>
          </div>
        );

      case 'linkout':
        return (
          <div className="auction-page__bid-card linkout__sidebar-card">
            <a
              href={plan.externalUrl || 'https://www.all.accor.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="linkout__sidebar-cta-btn"
              onClick={handleBookNow}
            >
              Book Now
              <IconArrowRight />
            </a>
            <p className="linkout__sidebar-disclaimer">You will be transferred to an external provider</p>
          </div>
        );

      case 'waitlist':
        return (
          <div className="auction-page__bid-card waitlist__sidebar-card">
            <button
              type="button"
              className={`waitlist__sidebar-cta-btn${hasJoined ? ' waitlist__sidebar-cta-btn--joined' : ''}`}
              onClick={handleJoinWaitlist}
            >
              {hasJoined ? 'Joined' : 'Join Waitlist'}
            </button>
            <p className="waitlist__sidebar-disclaimer">
              Join the waitlist and get exclusive access to pre-sale tickets before they go on sale to the general public!
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const renderBottomBar = () => {
    switch (plan.paymentType) {
      case 'linkout':
        return (
          <>
            <div className="linkout__cta-bar">
              <a
                href={plan.externalUrl || 'https://www.all.accor.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="linkout__cta-btn"
                onClick={handleBookNow}
              >
                Book Now
                <IconArrowRight />
              </a>
              <p className="linkout__cta-disclaimer">You will be transferred to an external provider</p>
            </div>
            <div className="linkout__cta-spacer" />
          </>
        );

      case 'waitlist':
        return (
          <>
            <div className="waitlist__cta-bar">
              <button
                type="button"
                className={`waitlist__cta-btn${hasJoined ? ' waitlist__cta-btn--joined' : ''}`}
                onClick={handleJoinWaitlist}
              >
                {hasJoined ? 'Joined' : 'Join Waitlist'}
              </button>
              <p className="waitlist__cta-disclaimer">
                Join the waitlist and get exclusive access to pre-sale tickets before they go on sale to the general public!
              </p>
            </div>
            <div className="waitlist__cta-spacer" />
          </>
        );

      default:
        return null;
    }
  };

  const renderDialogs = () => (
    <>
      {/* Auction: Confirm Bid Dialog */}
      {showConfirmBid && (
        <div className="auction-page__confirm-overlay" onClick={() => setShowConfirmBid(false)}>
          <div className="auction-page__confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="auction-page__confirm-header">
              <h2 className="auction-page__confirm-title">Confirm your bid</h2>
              <button type="button" className="auction-page__confirm-close" onClick={() => setShowConfirmBid(false)} aria-label="Close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="auction-page__confirm-body">
              <p className="auction-page__confirm-actual">Actual bid: {formatPoints(currentBid)} points</p>
              <p className="auction-page__confirm-your-bid">{formatPoints(Number(bidValue))}</p>
              <p className="auction-page__confirm-your-bid-label">Your bid</p>
            </div>
            <div className="auction-page__confirm-actions">
              <button type="button" className="auction-page__confirm-cancel" onClick={() => setShowConfirmBid(false)}>Cancel</button>
              <Button
                variant="primary"
                onClick={() => {
                  setCurrentBid(Number(bidValue));
                  setBidCount((prev) => prev + 1);
                  setIsHighestBidder(true);
                  setShowConfirmBid(false);
                  setBidValue('');
                }}
              >
                Confirm bid
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Linkout: Loader overlay */}
      {plan.paymentType === 'linkout' && showLoader && (
        <div className="linkout__loader-overlay">
          <div className="linkout__loader-content">
            <div className="linkout__spinner" aria-label="Loading" />
            <p className="linkout__loader-text">
              We're redirecting you to <strong>{plan.providerName || 'ALL Accor'}</strong> website.
            </p>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className={`auction-page${rootModifier}`}>
      {/* Header */}
      <MarketplaceHeader
        theme="light"
        isLoggedIn
        avatarSrc="/avatar.png"
        points={USER_POINTS}
        loyaltyTier={userLoyaltyTier}
        onLogoClick={() => { window.location.href = window.location.pathname; }}
        onMenu={() => { setMenuInitialView('navigation'); setMenuOpen(true); }}
        onAvatarClick={() => { setMenuInitialView('profile'); setMenuOpen(true); }}
        onPointsClick={() => setLoyaltyOpen(true)}
      />

      {/* Menu */}
      <Menu
        open={menuOpen}
        initialView={menuInitialView}
        onClose={() => setMenuOpen(false)}
        userName="Alessandro"
        userSurname="Rocca"
        userEmail="alessandro.rocca@email.com"
        userPhone="+33 661458723"
        userBirthday="29/10/1993"
        userCountry="Spain"
        loyaltyTier={userLoyaltyTier}
        points={USER_POINTS}
        avatarSrc="/avatar.png"
        favouriteEvents={favouritesList}
        onToggleFavourite={removeFavourite}
      />

      {/* Loyalty Sheet */}
      {loyaltyOpen && (
        <div className="loyalty-sheet__backdrop" onClick={() => setLoyaltyOpen(false)}>
          <div className="loyalty-sheet" role="dialog" aria-modal aria-label="Loyalty Programme" onClick={(e) => e.stopPropagation()}>
            <div className="loyalty-sheet__header">
              <span className="loyalty-sheet__title">Loyalty Programme</span>
              <button type="button" className="loyalty-sheet__close" onClick={() => setLoyaltyOpen(false)} aria-label="Close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="loyalty-sheet__body">
              <div className="loyalty-sheet__info">
                <div className="loyalty-sheet__info-col">
                  <span className="loyalty-sheet__label">Status</span>
                  <span className="loyalty-sheet__value loyalty-sheet__value--gold">Gold</span>
                  <span className="loyalty-sheet__expire">Expire on December 31, 2026</span>
                </div>
                <div className="loyalty-sheet__divider" />
                <div className="loyalty-sheet__info-col">
                  <span className="loyalty-sheet__label">Reward Points</span>
                  <span className="loyalty-sheet__value">42.430</span>
                  <span className="loyalty-sheet__expire">Expire on February 12, 2027</span>
                </div>
              </div>
              <div className="loyalty-sheet__card loyalty-sheet__card--gold">
                <span className="loyalty-sheet__card-tier">GOLD</span>
                <svg className="loyalty-sheet__card-logo" width="76" height="64" viewBox="0 0 38 32" fill="none" aria-hidden>
                  <path d="M37.9997 31.8653L36.3392 29.8751C37.2136 29.6723 37.7471 29.1668 37.7471 28.2871C37.7471 27.2932 36.9111 26.7953 35.8521 26.7953H32.5333V31.8653H33.4133V29.947H35.3871L36.9077 31.8653H37.9997ZM33.4133 27.5822H35.8764C36.4831 27.5822 36.8453 27.8689 36.8453 28.3489C36.8453 28.8418 36.465 29.1602 35.8764 29.1602H33.4133V27.5822Z" fill="white"/>
                  <path d="M2.59991 26.7953L0.00423325 31.8653H0.999631L1.55328 30.7362H4.50927L5.06292 31.8653H6.081L3.48532 26.7953H2.59991ZM1.9392 29.9494L3.03134 27.722L4.12347 29.9494H1.9392Z" fill="white"/>
                  <path d="M10.736 27.4622C11.5636 27.4622 12.2458 27.7767 12.5957 28.329L13.3055 27.8482C12.8085 27.1462 11.9292 26.6608 10.736 26.6608C8.80719 26.6608 7.69913 27.9291 7.69913 29.3303C7.69913 30.7315 8.80719 32 10.736 32C11.9294 32 12.8085 31.5147 13.3055 30.8127L12.5957 30.3319C12.2458 30.8842 11.5636 31.1986 10.736 31.1986C9.43923 31.1986 8.60136 30.4653 8.60136 29.3305C8.60136 28.1956 9.43923 27.4622 10.736 27.4622Z" fill="white"/>
                  <path d="M18.7279 27.4622C19.5554 27.4622 20.2377 27.7767 20.5876 28.329L21.2973 27.8482C20.8004 27.1462 19.9211 26.6608 18.7279 26.6608C16.799 26.6608 15.691 27.9291 15.691 29.3303C15.691 30.7315 16.799 32 18.7279 32C19.9212 32 20.8004 31.5147 21.2973 30.8127L20.5876 30.3319C20.2377 30.8842 19.5554 31.1986 18.7279 31.1986C17.4311 31.1986 16.5932 30.4653 16.5932 29.3305C16.5932 28.1956 17.4311 27.4622 18.7279 27.4622Z" fill="white"/>
                  <path d="M26.7208 26.6608C24.7919 26.6608 23.6839 27.9291 23.6839 29.3303C23.6839 30.7315 24.7919 31.9999 26.7208 31.9999C28.6496 31.9999 29.7577 30.7315 29.7577 29.3303C29.7577 27.9291 28.6496 26.6608 26.7208 26.6608ZM26.7208 31.2072C25.424 31.2072 24.5861 30.4705 24.5861 29.3303C24.5861 28.1901 25.424 27.4534 26.7208 27.4534C28.0176 27.4534 28.8555 28.1903 28.8555 29.3303C28.8555 30.4704 28.0176 31.2072 26.7208 31.2072Z" fill="white"/>
                  <path d="M29.5938 22.5944H26.3473C24.9793 22.5944 24.2908 22.2917 23.7891 21.6319C23.2547 20.929 23.2547 19.8581 23.2547 18.8433V0.0096291H27.4283V19.4476C27.4283 20.9863 27.5996 22.0875 29.5939 22.5263V22.5945L29.5938 22.5944Z" fill="white"/>
                  <path d="M21.152 22.5912H15.9292L12.09 14.5315C9.9944 15.6791 8.79891 18.3367 6.67391 20.092C5.5912 20.9863 4.32395 21.7838 2.7447 22.3231C2.02982 22.5672 0.815335 22.8829 0.358166 22.9286C0.167371 22.9476 0.033037 22.9399 0.00461532 22.8704C-0.0173064 22.8168 0.0353313 22.7757 0.238872 22.6767C0.470961 22.5637 1.43003 22.1639 2.03097 21.7419C2.78115 21.2153 3.21092 20.6455 3.24469 20.206C3.03822 19.4736 1.56921 17.8478 3.072 14.8647C3.61124 13.7944 4.07759 13.0241 4.41164 12.2499C4.7954 11.3606 5.06687 10.1078 5.15927 9.1767C5.16462 9.12239 5.17431 9.12508 5.20375 9.15526C5.93558 9.90041 8.77176 12.8421 8.36175 15.7663C9.30476 15.4013 10.9404 14.293 11.6946 13.7016C12.4907 13.0773 13.0095 12.426 13.8527 12.4115C14.6079 12.3986 14.6729 12.7622 15.2743 12.8421C15.4233 12.8619 15.6438 12.8328 15.7578 12.7765C15.804 12.7538 15.7927 12.703 15.7228 12.6864C14.9027 12.4915 14.7063 11.8183 13.6462 11.8183C12.6952 11.8183 11.9383 12.7003 11.3901 13.0624L8.70816 7.43218C7.58646 5.07744 7.92892 3.36617 10.3908 0L21.152 22.5912Z" fill="white"/>
                  <path d="M37.9999 22.5944H34.7534C33.3854 22.5944 32.6969 22.2917 32.1952 21.6319C31.6608 20.929 31.6608 19.8581 31.6608 18.8433V0.0096291H35.8343V19.4476C35.8343 20.9863 36.0056 22.0875 38 22.5263V22.5945L37.9999 22.5944Z" fill="white"/>
                </svg>
              </div>
              <a href="https://all.accor.com/loyalty-program/en/reasontojoin/index.vhtml" className="loyalty-sheet__link" target="_blank" rel="noopener noreferrer">
                Discover your benefits and status level
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="auction-page__breadcrumb" aria-label="Breadcrumb">
        <a
          href={getPreviousPage().href}
          className="auction-page__breadcrumb-link"
          onClick={(e) => { e.preventDefault(); window.location.hash = getPreviousPage().href; }}
        >
          <IconChevronLeft />
          {getPreviousPage().label}
        </a>
      </nav>

      {/* Hero Section */}
      <section className="auction-page__hero-full">
        {/* Fav snackbar */}
        {showFavSnack && (
          <div className="auction-page__notify-snack auction-page__notify-snack--fav" role="status">
            <svg className="auction-page__notify-snack-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="10" fill="#00513f" />
              <path d="M8 12l3 3 5-5" stroke="#caffea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="auction-page__notify-snack-content">
              <p className="auction-page__notify-snack-title">Added to your favourites</p>
              <p className="auction-page__notify-snack-body">You can review your favourites in your profile menu.</p>
            </div>
            <button type="button" className="auction-page__notify-snack-close" onClick={() => setShowFavSnack(false)} aria-label="Close notification">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Waitlist joined snackbar */}
        {plan.paymentType === 'waitlist' && showJoinedSnack && (
          <div className="auction-page__notify-snack" role="status">
            <svg className="auction-page__notify-snack-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="10" fill="#00513f" />
              <path d="M8 12l3 3 5-5" stroke="#caffea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="auction-page__notify-snack-content">
              <p className="auction-page__notify-snack-title">You've joined the waitlist!</p>
              <p className="auction-page__notify-snack-body">We'll notify you when pre-sale tickets become available.</p>
            </div>
            <button type="button" className="auction-page__notify-snack-close" onClick={() => setShowJoinedSnack(false)} aria-label="Close notification">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Auction error snackbar */}
        {plan.paymentType === 'auction' && showBidError && (
          <div className="auction-page__notify-snack auction-page__notify-snack--error" role="status">
            <svg className="auction-page__notify-snack-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 2L2 22h20L12 2z" fill="#9e0031" />
              <path d="M12 10v4M12 17h.01" stroke="#ffecec" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className="auction-page__notify-snack-content">
              <p className="auction-page__notify-snack-title auction-page__notify-snack-title--error">Insufficient Points balance</p>
              <p className="auction-page__notify-snack-body auction-page__notify-snack-body--error">You do not have enough points to place this bid.</p>
            </div>
            <button type="button" className="auction-page__notify-snack-close" onClick={() => setShowBidError(false)} aria-label="Close notification">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Mobile hero gallery */}
        <div className="auction-page__hero-image">
          <div className="auction-page__hero-track" ref={trackRef} onScroll={handleScroll}>
            {heroImages.map((img, i) => (
              <img key={i} src={img.src} alt={img.alt} className="auction-page__hero-img" draggable={false} />
            ))}
          </div>
          <div className="auction-page__hero-counter">
            <IconGallery />
            <span>{activeSlide + 1}/{heroImages.length}</span>
          </div>
          <div className="auction-page__hero-dots">
            {heroImages.map((_, i) => (
              <span key={i} className={`auction-page__hero-dot${i === activeSlide ? ' auction-page__hero-dot--active' : ''}`} />
            ))}
          </div>
        </div>

        {/* Desktop 5-image grid */}
        <div className="auction-page__hero-grid">
          {heroImages.slice(0, 5).map((img, i) => (
            <img key={i} src={img.src} alt={img.alt} className={`auction-page__hero-grid-img${i === 0 ? ' auction-page__hero-grid-img--large' : ''}`} />
          ))}
        </div>

        {/* Badge container */}
        <div className="auction-page__hero-label-container">
          {plan.paymentType === 'auction' && (
            <span className={`auction-page__hero-auction-badge${isHighestBidder ? (auctionEnded ? ' auction-page__hero-auction-badge--winner' : ' auction-page__hero-auction-badge--winning') : ''}`}>
              {auctionEnded && isHighestBidder ? 'Winner' : isHighestBidder ? 'Winning' : 'Auction'}
            </span>
          )}
          {plan.paymentType === 'prize-draw' && (
            <span className="auction-page__hero-auction-badge draw-page__badge">Prize Draw</span>
          )}
          {plan.paymentType === 'waitlist' && (
            <span className="auction-page__hero-auction-badge waitlist__badge">Waitlist</span>
          )}
          {plan.paymentType === 'redeem' && (
            <span className="auction-page__hero-auction-badge redeem-page__badge">Redeem</span>
          )}
          {plan.eventTag && (
            <span className="auction-page__hero-event-tag">{plan.eventTag}</span>
          )}
        </div>
      </section>

      {/* Two-column content layout */}
      <div className="auction-page__content-layout">
        <main className="auction-page__main">
          {/* Info Section */}
          <section className="auction-page__hero-info">
            <div className="auction-page__date-row">
              <span className="auction-page__date">{plan.date}</span>
              <div className="auction-page__date-icons">
                {plan.paymentType === 'auction' && (
                  <button type="button" className="auction-page__icon-btn" aria-label="Notifications">
                    <IconBell filled={false} />
                  </button>
                )}
                <button
                  type="button"
                  className={`auction-page__icon-btn${isFavourite ? ' auction-page__icon-btn--fav-on' : ''}`}
                  aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                  aria-pressed={isFavourite}
                  onClick={handleHeartClick}
                >
                  <IconHeart filled={isFavourite} />
                </button>
              </div>
            </div>
            <h1 className="auction-page__title">{plan.title}</h1>
            <p className="auction-page__location"><IconPin />{plan.city}, France</p>
            {plan.tags.length > 0 && (
              <div className="auction-page__tags">
                {plan.tags.map((tag, i) => (
                  <span key={i} className="auction-page__tag">{tag}</span>
                ))}
              </div>
            )}
            {/* Highest bidder banner for auction */}
            {plan.paymentType === 'auction' && isHighestBidder && (
              <div className="auction-page__winner-banner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="10" fill="#00513f" />
                  <path d="M8 12l3 3 5-5" stroke="#e0f5ec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{auctionEnded ? "You won this auction. You'll receive an email with all the related informations." : 'You are the highest bidder'}</span>
              </div>
            )}
          </section>

          {/* Payment-specific section */}
          {renderPaymentSection()}

          <hr className="auction-page__divider" aria-hidden />

          {/* Description */}
          <section className="auction-page__section auction-page__section--description">
            {description.map((p, i) => (
              <p key={i} className="auction-page__body">{p}</p>
            ))}
            <img
              src={heroImages[1]?.src || heroImages[0]?.src}
              alt={plan.title}
              className="auction-page__section-img"
            />
          </section>

          <hr className="auction-page__divider" aria-hidden />

          {/* What's included */}
          <section className="auction-page__section">
            <h2 className="auction-page__heading">What is included in the package</h2>
            <ul className="auction-page__list">
              {includedItems.map((item, i) => (
                <li key={i} className="auction-page__list-item">{item}</li>
              ))}
            </ul>
          </section>

          <hr className="auction-page__divider" aria-hidden />

          {/* About the venue */}
          <section className="auction-page__section auction-page__section--side-image">
            <div className="auction-page__section-text">
              <h2 className="auction-page__heading">About the venue</h2>
              <p className="auction-page__body auction-page__body--strong">{plan.venue}</p>
              <p className="auction-page__body">{venueDescription}</p>
              <Link href="#">Read more</Link>
            </div>
            <img
              src={heroImages[2]?.src || heroImages[0]?.src}
              alt={plan.venue}
              className="auction-page__side-img"
            />
          </section>

          <hr className="auction-page__divider" aria-hidden />

          {/* How to get there */}
          <section className="auction-page__section auction-page__section--side-image">
            <div className="auction-page__section-text">
              <h2 className="auction-page__heading">How to get there</h2>
              <p className="auction-page__body auction-page__body--strong">{plan.venue}</p>
              <p className="auction-page__body auction-page__body--muted">{plan.address}</p>
            </div>
            <iframe
              className="auction-page__map"
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${plan.mapQuery}`}
              title={`${plan.venue} location`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </section>

          <hr className="auction-page__divider" aria-hidden />

          {/* Terms & Conditions */}
          <section className="auction-page__section">
            <h2 className="auction-page__heading">Terms & Conditions</h2>
            <p className="auction-page__body">
              Participation is open to individuals aged 18 years or older. Employees of ACCOR, its affiliates, partners, and their families are not eligible. By participating you agree to all terms and conditions.
            </p>
            <Link href="#" onClick={(e) => { e.preventDefault(); setTermsOpen(true); }}>Read more</Link>
          </section>
        </main>

        {/* Sidebar */}
        <aside className="auction-page__sidebar">
          {renderSidebar()}
        </aside>
      </div>

      {/* Mobile bottom bar */}
      {renderBottomBar()}

      {/* Dialogs */}
      {renderDialogs()}

      <TermsDialog open={termsOpen} onClose={() => setTermsOpen(false)} />
    </div>
  );
}
