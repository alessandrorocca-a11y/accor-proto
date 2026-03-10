const HASH_LABELS: Record<string, string> = {
  '': 'Homepage',
  '#': 'Homepage',
  '#categories': 'All categories',
  '#category': 'Sport and leisure',
  '#category/shows-and-culture': 'Shows and culture',
  '#category/concerts-and-festivals': 'Concerts and festivals',
  '#category/sport-and-leisure': 'Sport and leisure',
  '#category/food-and-drinks': 'Food and drinks',
  '#category/wellness': 'Wellness',
  '#category/visits': 'Visits',
  '#category/hotel-experiences': 'Hotel experiences',
  '#category/paris-saint-germain': 'Paris Saint Germain',
  '#category/arena': 'Arena',
  '#category/all-signature-exclusives': 'All Signature Exclusives',
  '#category/all-accor-plus-exclusives': 'All Accor Plus Exclusives',
  '#category/next-trip-to-paris': 'Next trip to Paris',
  '#category/suggested-for-you': 'Suggested for you',
  '#payment/auctions': 'Auctions',
  '#payment/prize-draws': 'Prize draws',
  '#payment/redeem': 'Redeem',
  '#payment/flex': 'Flex',
  '#payment/cash': 'Cash',
  '#payment/linkout': 'Linkout',
  '#payment/waitlist': 'Waitlist',
};

function labelForHash(hash: string): string {
  if (hash in HASH_LABELS) return HASH_LABELS[hash];

  // Fallback: convert slug to title case  (e.g. "#category/my-slug" → "My slug")
  const slug = hash.split('/').pop() ?? '';
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
