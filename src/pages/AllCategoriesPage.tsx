import { useState } from 'react';
import { MarketplaceHeader, Menu } from '@/components';
import { useUser } from '@/context/UserContext';
import './AuctionPage.css';
import './AllCategoriesPage.css';

interface Category {
  label: string;
  image: string;
  hash: string;
}

const CATEGORIES: Category[] = [
  { label: 'Shows & culture', image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=350&h=200&fit=crop', hash: '#category/shows-and-culture' },
  { label: 'Food & drinks', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=350&h=200&fit=crop', hash: '#category/food-and-drinks' },
  { label: 'Sports & leisure', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=350&h=200&fit=crop', hash: '#category/sport-and-leisure' },
  { label: 'Wellness', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=350&h=200&fit=crop', hash: '#category/wellness' },
  { label: 'Concerts & festivals', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=350&h=200&fit=crop', hash: '#category/concerts-and-festivals' },
  { label: 'Visits', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=350&h=200&fit=crop', hash: '#category/visits' },
  { label: 'Hotel experiences', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=350&h=200&fit=crop', hash: '#category/hotel-experiences' },
];

function IconStar({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M7.64903 4.06886C7.7899 3.77365 8.21012 3.77365 8.35099 4.06886L9.25318 5.95956C9.30987 6.07836 9.42282 6.16043 9.55334 6.17763L11.6303 6.45141C11.9546 6.49416 12.0844 6.89381 11.8472 7.11901L10.3278 8.5613C10.2324 8.65194 10.1892 8.78472 10.2132 8.91416L10.5946 10.9741C10.6542 11.2957 10.3142 11.5427 10.0267 11.3867L8.18552 10.3873C8.06982 10.3246 7.9302 10.3246 7.8145 10.3873L5.97329 11.3867C5.68581 11.5427 5.34584 11.2957 5.4054 10.9741L5.78683 8.91416C5.8108 8.78472 5.76766 8.65194 5.67218 8.5613L4.15282 7.11901C3.91559 6.89381 4.04544 6.49416 4.36974 6.45141L6.44668 6.17763C6.5772 6.16043 6.69015 6.07836 6.74684 5.95956L7.64903 4.06886Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export default function AllCategoriesPage() {
  const { points: userPoints, loyaltyTier: userLoyaltyTier } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loyaltyOpen, setLoyaltyOpen] = useState(false);

  return (
    <div className="all-categories-page">
      <MarketplaceHeader
        theme="light"
        isLoggedIn
        avatarSrc="/avatar.png"
        points={userPoints}
        loyaltyTier={userLoyaltyTier}
        onLogoClick={() => { window.location.hash = ''; }}
        onMenu={() => setMenuOpen(true)}
        onPointsClick={() => setLoyaltyOpen(true)}
      />

      <Menu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        loyaltyTier={userLoyaltyTier}
        points={userPoints}
        avatarSrc="/avatar.png"
        favouriteEvents={[]}
      />

      {loyaltyOpen && (
        <div className="loyalty-sheet__backdrop" onClick={() => setLoyaltyOpen(false)}>
          <div
            className="loyalty-sheet"
            role="dialog"
            aria-modal
            aria-label="Loyalty Programme"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="loyalty-sheet__header">
              <span className="loyalty-sheet__title">Loyalty Programme</span>
              <button
                type="button"
                className="loyalty-sheet__close"
                onClick={() => setLoyaltyOpen(false)}
                aria-label="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="loyalty-sheet__body">
              <div className="loyalty-sheet__info">
                <div className="loyalty-sheet__info-col">
                  <span className="loyalty-sheet__label">Status</span>
                  <span className={`loyalty-sheet__value loyalty-sheet__value--${userLoyaltyTier}`}>
                    {userLoyaltyTier.charAt(0).toUpperCase() + userLoyaltyTier.slice(1)}
                  </span>
                  <span className="loyalty-sheet__expire">Expire on December 31, 2026</span>
                </div>
                <div className="loyalty-sheet__divider" />
                <div className="loyalty-sheet__info-col">
                  <span className="loyalty-sheet__label">Reward Points</span>
                  <span className="loyalty-sheet__value loyalty-sheet__value--points">
                    <IconStar className="loyalty-sheet__points-icon" />
                    {userPoints.toLocaleString('de-DE')}
                  </span>
                  <span className="loyalty-sheet__expire">Expire on February 12, 2027</span>
                </div>
              </div>
              <div className={`loyalty-sheet__card loyalty-sheet__card--${userLoyaltyTier}`}>
                <span className="loyalty-sheet__card-tier">{userLoyaltyTier.toUpperCase()}</span>
                <svg className="loyalty-sheet__card-logo" width="76" height="64" viewBox="0 0 38 32" fill="none" aria-hidden>
                  <path d="M37.9997 31.8653L36.3392 29.8751C37.2136 29.6723 37.7471 29.1668 37.7471 28.2871C37.7471 27.2932 36.9111 26.7953 35.8521 26.7953H32.5333V31.8653H33.4133V29.947H35.3871L36.9077 31.8653H37.9997ZM33.4133 27.5822H35.8764C36.4831 27.5822 36.8453 27.8689 36.8453 28.3489C36.8453 28.8418 36.465 29.1602 35.8764 29.1602H33.4133V27.5822Z" fill="white" />
                  <path d="M2.59991 26.7953L0.00423325 31.8653H0.999631L1.55328 30.7362H4.50927L5.06292 31.8653H6.081L3.48532 26.7953H2.59991ZM1.9392 29.9494L3.03134 27.722L4.12347 29.9494H1.9392Z" fill="white" />
                  <path d="M10.736 27.4622C11.5636 27.4622 12.2458 27.7767 12.5957 28.329L13.3055 27.8482C12.8085 27.1462 11.9292 26.6608 10.736 26.6608C8.80719 26.6608 7.69913 27.9291 7.69913 29.3303C7.69913 30.7315 8.80719 32 10.736 32C11.9294 32 12.8085 31.5147 13.3055 30.8127L12.5957 30.3319C12.2458 30.8842 11.5636 31.1986 10.736 31.1986C9.43923 31.1986 8.60136 30.4653 8.60136 29.3305C8.60136 28.1956 9.43923 27.4622 10.736 27.4622Z" fill="white" />
                  <path d="M18.7279 27.4622C19.5554 27.4622 20.2377 27.7767 20.5876 28.329L21.2973 27.8482C20.8004 27.1462 19.9211 26.6608 18.7279 26.6608C16.799 26.6608 15.691 27.9291 15.691 29.3303C15.691 30.7315 16.799 32 18.7279 32C19.9212 32 20.8004 31.5147 21.2973 30.8127L20.5876 30.3319C20.2377 30.8842 19.5554 31.1986 18.7279 31.1986C17.4311 31.1986 16.5932 30.4653 16.5932 29.3305C16.5932 28.1956 17.4311 27.4622 18.7279 27.4622Z" fill="white" />
                  <path d="M26.7208 26.6608C24.7919 26.6608 23.6839 27.9291 23.6839 29.3303C23.6839 30.7315 24.7919 31.9999 26.7208 31.9999C28.6496 31.9999 29.7577 30.7315 29.7577 29.3303C29.7577 27.9291 28.6496 26.6608 26.7208 26.6608ZM26.7208 31.2072C25.424 31.2072 24.5861 30.4705 24.5861 29.3303C24.5861 28.1901 25.424 27.4534 26.7208 27.4534C28.0176 27.4534 28.8555 28.1903 28.8555 29.3303C28.8555 30.4704 28.0176 31.2072 26.7208 31.2072Z" fill="white" />
                  <path d="M29.5938 22.5944H26.3473C24.9793 22.5944 24.2908 22.2917 23.7891 21.6319C23.2547 20.929 23.2547 19.8581 23.2547 18.8433V0.0096291H27.4283V19.4476C27.4283 20.9863 27.5996 22.0875 29.5939 22.5263V22.5945L29.5938 22.5944Z" fill="white" />
                  <path d="M21.152 22.5912H15.9292L12.09 14.5315C9.9944 15.6791 8.79891 18.3367 6.67391 20.092C5.5912 20.9863 4.32395 21.7838 2.7447 22.3231C2.02982 22.5672 0.815335 22.8829 0.358166 22.9286C0.167371 22.9476 0.033037 22.9399 0.00461532 22.8704C-0.0173064 22.8168 0.0353313 22.7757 0.238872 22.6767C0.470961 22.5637 1.43003 22.1639 2.03097 21.7419C2.78115 21.2153 3.21092 20.6455 3.24469 20.206C3.03822 19.4736 1.56921 17.8478 3.072 14.8647C3.61124 13.7944 4.07759 13.0241 4.41164 12.2499C4.7954 11.3606 5.06687 10.1078 5.15927 9.1767C5.16462 9.12239 5.17431 9.12508 5.20375 9.15526C5.93558 9.90041 8.77176 12.8421 8.36175 15.7663C9.30476 15.4013 10.9404 14.293 11.6946 13.7016C12.4907 13.0773 13.0095 12.426 13.8527 12.4115C14.6079 12.3986 14.6729 12.7622 15.2743 12.8421C15.4233 12.8619 15.6438 12.8328 15.7578 12.7765C15.804 12.7538 15.7927 12.703 15.7228 12.6864C14.9027 12.4915 14.7063 11.8183 13.6462 11.8183C12.6952 11.8183 11.9383 12.7003 11.3901 13.0624L8.70816 7.43218C7.58646 5.07744 7.92892 3.36617 10.3908 0L21.152 22.5912Z" fill="white" />
                  <path d="M37.9999 22.5944H34.7534C33.3854 22.5944 32.6969 22.2917 32.1952 21.6319C31.6608 20.929 31.6608 19.8581 31.6608 18.8433V0.0096291H35.8343V19.4476C35.8343 20.9863 36.0056 22.0875 38 22.5263V22.5945L37.9999 22.5944Z" fill="white" />
                </svg>
              </div>
              <a href="https://all.accor.com/loyalty-program/en/reasontojoin/index.vhtml" className="loyalty-sheet__link" target="_blank" rel="noopener noreferrer">
                Discover your benefits and status level
              </a>
            </div>
          </div>
        </div>
      )}

      <nav className="all-categories-page__breadcrumb" aria-label="Breadcrumb">
        <a
          href="#"
          className="all-categories-page__breadcrumb-link"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = '#';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Previous page</span>
        </a>

        <span className="all-categories-page__breadcrumb-trail">
          <a
            href="#"
            className="all-categories-page__breadcrumb-trail-link"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '#';
            }}
          >
            Homepage
          </a>
          <span className="all-categories-page__breadcrumb-divider">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
        <span className="all-categories-page__breadcrumb-current">Categories</span>
      </nav>

      <main className="all-categories-page__main">
        <h1 className="all-categories-page__title">Categories</h1>

        <div className="all-categories-page__grid">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.label}
              className="all-categories-page__card"
              href={cat.hash}
              onClick={(e) => { e.preventDefault(); window.location.hash = cat.hash; }}
            >
              <div className="all-categories-page__card-img">
                <img src={cat.image} alt={cat.label} loading="lazy" />
              </div>
              <span className="all-categories-page__card-label">{cat.label}</span>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
