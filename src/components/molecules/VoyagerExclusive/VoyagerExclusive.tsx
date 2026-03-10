import { useState, useCallback } from 'react';
import voyagerCard from '@/assets/voyager-card.svg';
import './VoyagerExclusive.css';

function IconClose() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function VoyagerBadge() {
  return (
    <div className="voyager-badge">
      <img src={voyagerCard} alt="ALL Accor+ Voyager" className="voyager-badge__card" />
    </div>
  );
}

interface VoyagerDialogProps {
  open: boolean;
  onClose: () => void;
}

export function VoyagerDialog({ open, onClose }: VoyagerDialogProps) {
  if (!open) return null;

  return (
    <div className="voyager-dialog__backdrop" onClick={onClose}>
      <div
        className="voyager-dialog"
        role="dialog"
        aria-modal
        aria-label="Exclusive event — Upgrade to Voyager"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="voyager-dialog__header">
          <span className="voyager-dialog__spacer" />
          <h2 className="voyager-dialog__title">Exclusive Event</h2>
          <button
            type="button"
            className="voyager-dialog__close"
            onClick={onClose}
            aria-label="Close"
          >
            <IconClose />
          </button>
        </div>

        <div className="voyager-dialog__body">
          <img src={voyagerCard} alt="ALL Accor+ Voyager Card" className="voyager-dialog__card" />

          <div className="voyager-dialog__content">
            <p className="voyager-dialog__heading">You found an exclusive experience!</p>
            <p className="voyager-dialog__text">
              This event is reserved for <strong>ALL Accor+ Voyager</strong> subscribers.
              Upgrade now to unlock exclusive events, premium experiences, and guaranteed discounts at over 4,500 hotels worldwide.
            </p>
          </div>

          <div className="voyager-dialog__actions">
            <a
              href="https://all.accor.com/loyalty-program/all-plus/index.en.shtml"
              target="_blank"
              rel="noopener noreferrer"
              className="voyager-dialog__cta"
            >
              Upgrade to Voyager
            </a>
          </div>
        </div>
      </div>
    </div>
  );
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
