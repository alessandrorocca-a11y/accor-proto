import { EMAIL_DEMO_EVENT_DATE_FALLBACK, getRegistryEventDateFromHash } from '@/utils/hashRoute';

/** Same registry `date` string as listing cards when URL has `?evt=evt-xxx` (e.g. `#email/outbid?evt=evt-073`). */
export function getEmailPreviewEventDate(): string {
  return getRegistryEventDateFromHash(
    typeof globalThis !== 'undefined' && 'location' in globalThis
      ? (globalThis as typeof globalThis & { location: Location }).location.hash
      : '',
    EMAIL_DEMO_EVENT_DATE_FALLBACK,
  );
}
