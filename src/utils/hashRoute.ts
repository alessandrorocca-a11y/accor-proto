import { getEventById } from '@/data/events/eventRegistry';

export function parseHashParams(hash: string): { basePath: string; params: URLSearchParams } {
  const qIdx = hash.indexOf('?');
  if (qIdx === -1) return { basePath: hash, params: new URLSearchParams() };
  return { basePath: hash.slice(0, qIdx), params: new URLSearchParams(hash.slice(qIdx + 1)) };
}

/** Event id from paths like `#auction/evt-073` (query string after `?` is ignored). */
export function extractEventId(hash: string, prefix: string): string | undefined {
  const { basePath } = parseHashParams(hash);
  if (!basePath.startsWith(prefix + '/')) return undefined;
  const id = basePath.slice(prefix.length + 1);
  if (id.startsWith('evt-')) return id;
  return undefined;
}

/**
 * Event `date` field from registry when the hash includes `?evt=evt-xxx` (same string as listing cards).
 * Use for email previews and any screen driven by hash query.
 */
export function getRegistryEventDateFromHash(hash: string, fallback: string): string {
  const { params } = parseHashParams(hash);
  const id = params.get('evt');
  if (id?.startsWith('evt-')) {
    const d = getEventById(id)?.date;
    if (d) return d;
  }
  return fallback;
}

/** Demo fallback for static Rio / email fixtures (registry-style, no weekday). */
export const EMAIL_DEMO_EVENT_DATE_FALLBACK = 'February 16, 2026';
