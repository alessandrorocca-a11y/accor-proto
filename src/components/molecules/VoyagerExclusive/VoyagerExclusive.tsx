import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import explorerCardArt from '@/assets/explorer-card.png';
import signatureCardArt from '@/assets/all-signature-member-card.png';
import { usePrototypeShellOverlayPortal } from '@/context/PrototypeShellOverlayPortalContext';
import { useDevicePreviewScrollContainer } from '@/context/DevicePreviewScrollContainerContext';
import './VoyagerExclusive.css';

function IconClose() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type VoyagerExclusiveVariant = 'explorer' | 'signature';

const CARD_BY_VARIANT: Record<VoyagerExclusiveVariant, string> = {
  explorer: explorerCardArt,
  signature: signatureCardArt,
};

const DIALOG_COPY: Record<
  VoyagerExclusiveVariant,
  {
    ariaLabel: string;
    cardAlt: string;
    ctaLabel: string;
    ctaHref: string;
    ctaExternal: boolean;
  }
> = {
  explorer: {
    ariaLabel: 'Exclusive event — Upgrade to Explorer',
    cardAlt: 'ALL Explorer member card',
    ctaLabel: 'Upgrade to Explorer',
    ctaHref: 'https://all.accor.com/loyalty-program/all-plus/index.en.shtml',
    ctaExternal: true,
  },
  signature: {
    ariaLabel: 'Exclusive event — ALL Signature',
    cardAlt: 'ALL Signature member card',
    ctaLabel: 'Discover ALL Signature',
    ctaHref: '#category/all-signature-exclusives',
    ctaExternal: false,
  },
};

export interface VoyagerBadgeProps {
  variant?: VoyagerExclusiveVariant;
}

export function VoyagerBadge({ variant = 'explorer' }: VoyagerBadgeProps) {
  const src = CARD_BY_VARIANT[variant];
  const alt = variant === 'explorer' ? 'ALL Explorer member card' : 'ALL Signature member card';

  return (
    <div className="voyager-badge">
      <img src={src} alt={alt} className="voyager-badge__card" />
    </div>
  );
}

export interface VoyagerDialogProps {
  open: boolean;
  onClose: () => void;
  variant?: VoyagerExclusiveVariant;
}

export function VoyagerDialog({ open, onClose, variant = 'explorer' }: VoyagerDialogProps) {
  const overlayPortalTarget = usePrototypeShellOverlayPortal();
  const deviceScrollContainer = useDevicePreviewScrollContainer();
  const copy = DIALOG_COPY[variant];
  const cardSrc = CARD_BY_VARIANT[variant];

  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEscape);

    const scrollTarget = deviceScrollContainer ?? document.body;
    const prevOverflow = scrollTarget.style.overflow;
    scrollTarget.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onEscape);
      scrollTarget.style.overflow = prevOverflow;
    };
  }, [open, onClose, deviceScrollContainer]);

  if (!open) return null;

  const bodyText =
    variant === 'explorer' ? (
      <>
        This event is reserved for <strong>ALL+ Accor Explorer</strong> subscribers. Upgrade now to unlock exclusive
        events, premium experiences, and guaranteed discounts at over 4,500 hotels worldwide.
      </>
    ) : (
      <>
        This experience is reserved for <strong>ALL Signature</strong> members. Subscribe to unlock Signature-exclusive
        experiences, hotel benefits, and member-only rewards.
      </>
    );

  const cta = copy.ctaExternal ? (
    <a
      href={copy.ctaHref}
      target="_blank"
      rel="noopener noreferrer"
      className="voyager-dialog__cta"
    >
      {copy.ctaLabel}
    </a>
  ) : (
    <a href={copy.ctaHref} className="voyager-dialog__cta" onClick={onClose}>
      {copy.ctaLabel}
    </a>
  );

  const dialogTree = (
    <div
      className={`voyager-dialog__backdrop${overlayPortalTarget ? ' voyager-dialog__backdrop--portaled' : ''}`}
      onClick={onClose}
    >
      <div
        className="voyager-dialog"
        role="dialog"
        aria-modal
        aria-label={copy.ariaLabel}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="voyager-dialog__header">
          <span className="voyager-dialog__spacer" />
          <h2 className="voyager-dialog__title">Exclusive Event</h2>
          <button type="button" className="voyager-dialog__close" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>

        <div className="voyager-dialog__body">
          <img src={cardSrc} alt={copy.cardAlt} className="voyager-dialog__card" />

          <div className="voyager-dialog__content">
            <p className="voyager-dialog__heading">You found an exclusive experience!</p>
            <p className="voyager-dialog__text">{bodyText}</p>
          </div>

          <div className="voyager-dialog__actions">{cta}</div>
        </div>
      </div>
    </div>
  );

  return overlayPortalTarget
    ? createPortal(dialogTree, overlayPortalTarget)
    : createPortal(dialogTree, document.body);
}

export function useVoyagerGate(isVoyagerExclusive: boolean, isSubscribed: boolean) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const gate = useCallback(
    (action: () => void) => {
      if (isVoyagerExclusive && !isSubscribed) {
        setDialogOpen(true);
      } else {
        action();
      }
    },
    [isVoyagerExclusive, isSubscribed]
  );

  return { dialogOpen, setDialogOpen, gate };
}
