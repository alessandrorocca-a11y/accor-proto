import { useState } from 'react';
import { MarketplaceHeader, Menu } from '@/components';
import { Search } from '@/components/molecules/Search/Search';
import './AllCategoriesPage.css';

const USER_POINTS = 42430;

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

export default function AllCategoriesPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loyaltyOpen, setLoyaltyOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="all-categories-page">
      <MarketplaceHeader
        theme="light"
        isLoggedIn
        avatarSrc="/avatar.png"
        points={USER_POINTS}
        loyaltyTier="gold"
        onLogoClick={() => { window.location.hash = ''; }}
        onMenu={() => setMenuOpen(true)}
        onPointsClick={() => setLoyaltyOpen(true)}
        onSearch={() => setSearchOpen(true)}
      />

      <Menu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        loyaltyOpen={loyaltyOpen}
        onLoyaltyClose={() => setLoyaltyOpen(false)}
        favourites={[]}
      />

      <Search open={searchOpen} onClose={() => setSearchOpen(false)} />

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
