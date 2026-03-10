import './TermsDialog.css';

interface TermsDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
}

const SECTIONS = [
  {
    heading: 'Bidding Process',
    body: `Bids are placed during the Auction event within the specified time frame.
All bids are final and binding once placed.
The highest valid bid at the close of the Auction will be deemed the winning bid, subject to confirmation by the Organizer.`,
  },
  {
    heading: 'Winning Bids and Payment',
    body: `Winning bidders will be notified at the conclusion of the Auction or shortly thereafter.
Payment must be completed within the timeframe communicated by the Organizer.
Accepted payment methods will be communicated prior to or during the Auction.
Failure to complete payment may result in forfeiture of the Auction Item and/or disqualification from future events.`,
  },
  {
    heading: 'Taxes and Fees',
    body: 'Unless otherwise stated, winning bidders are responsible for all applicable taxes, fees, duties, or charges associated with the Auction Item.',
  },
  {
    heading: 'Cancellation or Modification',
    body: 'The Organizer reserves the right to cancel, suspend, or modify the Auction, in whole or in part, at any time, including due to force majeure events, without liability.',
  },
  {
    heading: 'Liability',
    body: 'To the maximum extent permitted by law, ACCOR shall not be liable for any loss, damage, injury, or disappointment suffered by any participant as a result of participating in the Auction or using any Auction Item.',
  },
  {
    heading: 'Acceptance of Terms',
    body: 'Participation in the Auction constitutes full and unconditional acceptance of these Terms & Conditions.',
  },
];

const INTRO = `The event auction (the "Auction") is organized by ACCOR (the "Organizer"), or any of its affiliated entities, at a designated ACCOR property or venue.

Participation in the Auction is open to individuals aged 18 years or older (or the legal age of majority in their jurisdiction). Employees of ACCOR, its affiliates, partners, and their immediate family members may be excluded, unless otherwise stated.

All items, experiences, or packages offered in the Auction (the "Auction Items") are described to the best of the Organizer's knowledge. Auction Items are subject to availability and may be modified, substituted, or withdrawn at the Organizer's discretion.`;

export function TermsDialog({ open, onClose, title = 'Terms & Conditions (Auctions)' }: TermsDialogProps) {
  if (!open) return null;

  return (
    <div className="terms-sheet__backdrop" onClick={onClose}>
      <div
        className="terms-sheet"
        role="dialog"
        aria-modal
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="terms-sheet__header">
          <span className="terms-sheet__spacer" />
          <h2 className="terms-sheet__title">{title}</h2>
          <button
            type="button"
            className="terms-sheet__close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="terms-sheet__body">
          <p className="terms-sheet__intro">{INTRO}</p>

          {SECTIONS.map((s) => (
            <div key={s.heading} className="terms-sheet__section">
              <h3 className="terms-sheet__section-title">{s.heading}</h3>
              <p className="terms-sheet__section-body">{s.body}</p>
            </div>
          ))}

          <hr className="terms-sheet__divider" />

          <div className="terms-sheet__footer">
            <p className="terms-sheet__footer-title">Any question?</p>
            <div className="terms-sheet__footer-row">
              <span className="terms-sheet__footer-label">Contact</span>
              <a href="#" className="terms-sheet__footer-link">Customer Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
