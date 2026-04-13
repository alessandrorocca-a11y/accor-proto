import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import explorerCardArt from '@/assets/explorer-card.png';
import signatureCardArt from '@/assets/all-signature-member-card.png';
import { usePrototypeShellOverlayPortal } from '@/context/PrototypeShellOverlayPortalContext';
import { useDevicePreviewScrollContainer } from '@/context/DevicePreviewScrollContainerContext';
import './VoyagerExclusive.css';

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

/** Non-dismissible overlay: `onClose` is kept for API compatibility; no in-UI path invokes it. */
export function VoyagerDialog({ open, onClose: _onClose, variant = 'explorer' }: VoyagerDialogProps) {
  const overlayPortalTarget = usePrototypeShellOverlayPortal();
  const deviceScrollContainer = useDevicePreviewScrollContainer();
  const copy = DIALOG_COPY[variant];
  const cardSrc = CARD_BY_VARIANT[variant];

  useEffect(() => {
    if (!open) return;

    const scrollTarget = deviceScrollContainer ?? document.body;
    const prevOverflow = scrollTarget.style.overflow;
    scrollTarget.style.overflow = 'hidden';

    return () => {
      scrollTarget.style.overflow = prevOverflow;
    };
  }, [open, deviceScrollContainer]);

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

  const dialogTree = (
    <div className={`voyager-dialog__backdrop${overlayPortalTarget ? ' voyager-dialog__backdrop--portaled' : ''}`}>
      <div
        className="voyager-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-label={copy.ariaLabel}
        aria-describedby="voyager-dialog-desc"
      >
        <div className="voyager-dialog__header">
          <h2 className="voyager-dialog__title">Exclusive Event</h2>
        </div>

        <div className="voyager-dialog__body" id="voyager-dialog-desc">
          <img src={cardSrc} alt="" className="voyager-dialog__card" aria-hidden />

          <div className="voyager-dialog__content">
            <p className="voyager-dialog__heading">You found an exclusive experience!</p>
            <p className="voyager-dialog__text">{bodyText}</p>
          </div>

          <div className="voyager-dialog__actions">
            <span className="voyager-dialog__cta voyager-dialog__cta--static" aria-hidden>
              {copy.ctaLabel}
            </span>
          </div>
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
