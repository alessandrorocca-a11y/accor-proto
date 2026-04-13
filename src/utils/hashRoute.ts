import { getEventById } from '@/data/events/eventRegistry';

export function parseHashParams(hash: string): { basePath: string; params: URLSearchParams } {
  const qIdx = hash.indexOf('?');
  if (qIdx === -1) return { basePath: hash, params: new URLSearchParams() };
  return { basePath: hash.slice(0, qIdx), params: new URLSearchParams(hash.slice(qIdx + 1)) };
}

/** Checkout / confirmation steps for prize draw, redeem, and standard flows (hash routes). */
export type CheckoutFlowStep = 'detail' | 'checkout' | 'confirmation';

/** Session keys for cross-route checkout state (prototype). */
export const PRIZE_DRAW_SESSION_CONFIRM = 'proto_prize_draw_last_confirm_v1';
export const REDEEM_SESSION_CONFIRM = 'proto_redeem_last_confirm_v1';
export const STANDARD_CHECKOUT_DRAFT_KEY = 'proto_standard_checkout_draft_v1';
export const STANDARD_CONFIRMATION_KEY = 'proto_standard_confirmation_v1';

export type PrizeDrawConfirmPayload = {
  eventId: string | null;
  tickets: number;
  totalPoints: number;
};

export type RedeemConfirmPayload = PrizeDrawConfirmPayload;

export type StandardCheckoutDraftV1 = {
  v: 1;
  eventId: string | null;
  selectedDate: number;
  selectedTimeIdx: number | null;
  zoneQty: Record<string, number>;
  flexCancelQty: number;
  voucherApplied: boolean;
  voucherCode: string;
  rewardsPointsUsed: number;
  paymentMethod: 'card' | 'apple-pay' | 'google-pay' | null;
};

export type StandardConfirmationSnapshotV1 = {
  v: 1;
  eventId: string | null;
  selectedDate: number;
  selectedTimeIdx: number | null;
  zoneQty: Record<string, number>;
  flexCancelQty: number;
  voucherApplied: boolean;
  rewardsPointsUsed: number;
  finalTotalEur: number;
  confirmedTickets: number;
  confirmedTicketName: string;
};

function parseTicketsFromParams(params: URLSearchParams): number {
  const raw = params.get('tickets');
  if (!raw) return 1;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(99, Math.max(1, n));
}

function parseCheckoutSegments(
  segments: string[],
): { eventId?: string; step: CheckoutFlowStep } {
  if (segments.length === 0) return { step: 'detail' };
  if (segments[0] === 'checkout') return { step: 'checkout' };
  if (segments[0] === 'confirmation') return { step: 'confirmation' };
  if (segments[0].startsWith('evt-')) {
    const eventId = segments[0];
    if (segments[1] === 'checkout') return { eventId, step: 'checkout' };
    if (segments[1] === 'confirmation') return { eventId, step: 'confirmation' };
    return { eventId, step: 'detail' };
  }
  return { step: 'detail' };
}

function parsePrefixedCheckoutHash(
  hash: string,
  prefix: '#draw' | '#redeem',
): { eventId?: string; step: CheckoutFlowStep; tickets: number } {
  const { basePath, params } = parseHashParams(hash);
  const tickets = parseTicketsFromParams(params);
  if (basePath === prefix || basePath === `${prefix}/`) {
    return { step: 'detail', tickets };
  }
  if (!basePath.startsWith(`${prefix}/`)) {
    return { step: 'detail', tickets: 1 };
  }
  const rest = basePath.slice(prefix.length + 1);
  const segments = rest.split('/').filter(Boolean);
  const { eventId, step } = parseCheckoutSegments(segments);
  return { eventId, step, tickets };
}

/** `#draw`, `#draw/evt-021`, `#draw/evt-021/checkout?tickets=2`, `#draw/checkout?tickets=1` */
export function parsePrizeDrawRoute(hash: string): {
  eventId?: string;
  step: CheckoutFlowStep;
  tickets: number;
} {
  return parsePrefixedCheckoutHash(hash, '#draw');
}

/** Same segment rules as prize draw, with `#redeem` prefix. */
export function parseRedeemRoute(hash: string): {
  eventId?: string;
  step: CheckoutFlowStep;
  tickets: number;
} {
  return parsePrefixedCheckoutHash(hash, '#redeem');
}

/** `#standard`, `#standard/evt-x/checkout`, `#standard/checkout` (no event id). */
export function parseStandardRoute(hash: string): { eventId?: string; step: CheckoutFlowStep } {
  const { basePath } = parseHashParams(hash);
  const prefix = '#standard';
  if (basePath === prefix || basePath === `${prefix}/`) return { step: 'detail' };
  if (!basePath.startsWith(`${prefix}/`)) return { step: 'detail' };
  const rest = basePath.slice(prefix.length + 1);
  const segments = rest.split('/').filter(Boolean);
  return parseCheckoutSegments(segments);
}

export function buildPrizeDrawDetailPath(eventId?: string): string {
  return eventId ? `#draw/${eventId}` : '#draw';
}

export function buildPrizeDrawCheckoutPath(eventId: string | undefined, tickets: number): string {
  const q = `?tickets=${tickets}`;
  return eventId ? `#draw/${eventId}/checkout${q}` : `#draw/checkout${q}`;
}

export function buildPrizeDrawConfirmationPath(eventId: string | undefined, tickets: number): string {
  const q = `?tickets=${tickets}`;
  return eventId ? `#draw/${eventId}/confirmation${q}` : `#draw/confirmation${q}`;
}

export function buildRedeemDetailPath(eventId?: string): string {
  return eventId ? `#redeem/${eventId}` : '#redeem';
}

export function buildRedeemCheckoutPath(eventId: string | undefined, tickets: number): string {
  const q = `?tickets=${tickets}`;
  return eventId ? `#redeem/${eventId}/checkout${q}` : `#redeem/checkout${q}`;
}

export function buildRedeemConfirmationPath(eventId: string | undefined, tickets: number): string {
  const q = `?tickets=${tickets}`;
  return eventId ? `#redeem/${eventId}/confirmation${q}` : `#redeem/confirmation${q}`;
}

export function buildStandardDetailPath(eventId?: string): string {
  return eventId ? `#standard/${eventId}` : '#standard';
}

export function buildStandardCheckoutPath(eventId?: string): string {
  return eventId ? `#standard/${eventId}/checkout` : '#standard/checkout';
}

export function buildStandardConfirmationPath(eventId?: string): string {
  return eventId ? `#standard/${eventId}/confirmation` : '#standard/confirmation';
}

/** Event id from paths like `#auction/evt-073` or `#draw/evt-021/checkout` (first path segment only). */
export function extractEventId(hash: string, prefix: string): string | undefined {
  const { basePath } = parseHashParams(hash);
  if (!basePath.startsWith(prefix + '/')) return undefined;
  const rest = basePath.slice(prefix.length + 1);
  const first = rest.split('/')[0];
  if (first?.startsWith('evt-')) return first;
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
