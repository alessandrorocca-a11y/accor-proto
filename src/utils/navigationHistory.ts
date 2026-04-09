const HASH_LABELS: Record<string, string> = {
  '': 'Homepage',
  '#': 'Homepage',
  '#categories': 'All categories',
  '#category': 'Sports and activities',
  '#category/arts-and-culture': 'Arts and culture',
  '#category/shows-and-culture': 'Arts and culture',
  '#category/concerts-and-festivals': 'Concerts and festivals',
  '#category/sports-and-activities': 'Sports and activities',
  '#category/sport-and-leisure': 'Sports and activities',
  '#category/food-and-drink': 'Food and drink',
  '#category/food-and-drinks': 'Food and drink',
  '#category/wellness': 'Wellness',
  '#category/visits': 'Visits',
  '#category/hotel-experiences': 'Hotel experiences',
  '#category/paris-saint-germain': 'Paris Saint Germain',
  '#category/arena': 'Arena',
  '#category/all-signature-exclusives': 'ALL Signature exclusives',
  '#category/all-accor-plus-exclusives': 'ALL Accor+ exclusives',
  '#category/next-trip': 'Next trip',
  '#category/suggested-for-you': 'Suggested for you',
  '#payment/auctions': 'Auction',
  '#payment/prize-draws': 'Prize draw',
  '#payment/redeem': 'Instant purchase',
  '#payment/flex': 'Instant purchase',
  '#payment/cash': 'Instant purchase',
  '#payment/linkout': 'Linkout',
  '#payment/waitlist': 'Waitlist',
};

function labelForHash(hash: string): string {
  const base = hash.split('?')[0];
  if (base in HASH_LABELS) return HASH_LABELS[base];

  // Fallback: convert slug to title case  (e.g. "#category/my-slug" → "My slug")
  const slug = base.split('/').pop() ?? '';
  return slug.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) || 'Homepage';
}

const KEY_PREV = 'nav_prev_hash';
const KEY_CURR = 'nav_curr_hash';

// On load: rotate current → previous, then save current hash
const storedCurrent = sessionStorage.getItem(KEY_CURR) ?? '';
sessionStorage.setItem(KEY_PREV, storedCurrent);
sessionStorage.setItem(KEY_CURR, window.location.hash || '');

export function getPreviousPage(): { label: string; href: string } {
  const prevHash = sessionStorage.getItem(KEY_PREV) ?? '';
  return { label: labelForHash(prevHash), href: prevHash || '#' };
}
