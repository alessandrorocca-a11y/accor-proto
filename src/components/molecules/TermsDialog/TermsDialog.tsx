import './TermsDialog.css';

export type TermsVariant = 'auction' | 'redeem' | 'prize-draw' | 'standard' | 'waitlist';

interface TermsDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  variant?: TermsVariant;
}

interface TermsContent {
  intro: string;
  sections: { heading: string; body: string }[];
}

const AUCTION_CONTENT: TermsContent = {
  intro: `The event auction (the "Auction") is organized by ACCOR (the "Organizer"), or any of its affiliated entities, at a designated ACCOR property or venue.

Participation in the Auction is open to individuals aged 18 years or older (or the legal age of majority in their jurisdiction). Employees of ACCOR, its affiliates, partners, and their immediate family members may be excluded, unless otherwise stated.

All items, experiences, or packages offered in the Auction (the "Auction Items") are described to the best of the Organizer's knowledge. Auction Items are subject to availability and may be modified, substituted, or withdrawn at the Organizer's discretion.`,
  sections: [
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
  ],
};

const REDEEM_CONTENT: TermsContent = {
  intro: `The Redeem experience (the "Experience") is organized by ACCOR (the "Organizer"), or any of its affiliated entities, through the ALL – Accor Live Limitless loyalty programme.

Participation is open to ALL programme members aged 18 years or older (or the legal age of majority in their jurisdiction) who hold a sufficient Reward Points balance. Employees of ACCOR, its affiliates, partners, and their immediate family members may be excluded, unless otherwise stated.

All experiences, items, or packages available for redemption are described to the best of the Organizer's knowledge and are subject to availability. The Organizer reserves the right to modify, substitute, or withdraw any offer at its discretion.`,
  sections: [
    {
      heading: 'Points Redemption',
      body: `Reward Points will be deducted from the member's account at the time of purchase confirmation.
All redemptions are final. Points used for a redemption cannot be refunded or re-credited except at the sole discretion of the Organizer.
Members must ensure they have a sufficient points balance before completing a redemption.`,
    },
    {
      heading: 'Tickets and Delivery',
      body: `Upon successful redemption, confirmation details and any applicable tickets or vouchers will be sent to the email address associated with your ALL account.
Tickets are personal and non-transferable unless otherwise stated.
The Organizer is not responsible for emails not received due to incorrect email addresses or spam filters.`,
    },
    {
      heading: 'Experience Conditions',
      body: `Experiences are subject to the specific conditions communicated on the experience page (date, time, location, inclusions).
The Organizer is not responsible for travel, accommodation, or any ancillary costs unless explicitly included in the package description.
Some experiences may require a minimum age, specific attire, or physical ability — please check the experience details carefully.`,
    },
    {
      heading: 'Cancellation and Modifications',
      body: `The Organizer reserves the right to cancel, postpone, or modify an Experience at any time due to unforeseen circumstances, including force majeure events, without liability.
In the event of cancellation by the Organizer, members will be re-credited with the full points amount used for the redemption.
Cancellations initiated by the member are subject to the cancellation policy stated on the experience page.`,
    },
    {
      heading: 'Liability',
      body: 'To the maximum extent permitted by law, ACCOR shall not be liable for any loss, damage, injury, or disappointment suffered by any participant as a result of redeeming or attending any Experience.',
    },
    {
      heading: 'Acceptance of Terms',
      body: 'Completing a redemption constitutes full and unconditional acceptance of these Terms & Conditions.',
    },
  ],
};

const PRIZE_DRAW_CONTENT: TermsContent = {
  intro: `The Prize Draw (the "Draw") is organized by ACCOR (the "Organizer"), or any of its affiliated entities, through the ALL – Accor Live Limitless loyalty programme.

Participation is open to ALL programme members aged 18 years or older (or the legal age of majority in their jurisdiction). Employees of ACCOR, its affiliates, partners, and their immediate family members may be excluded, unless otherwise stated.

All prizes are described to the best of the Organizer's knowledge and are subject to availability. The Organizer reserves the right to modify, substitute, or withdraw any prize at its discretion.`,
  sections: [
    {
      heading: 'Entry and Tickets',
      body: `Each ticket purchased with Reward Points grants one entry into the Prize Draw.
Points spent on Draw tickets are non-refundable, regardless of the outcome.
The number of tickets per participant may be limited as stated on the Draw page.`,
    },
    {
      heading: 'Winner Selection',
      body: `Winners will be selected at random after the Draw closing date.
Winners will be notified via the email address associated with their ALL account.
If a winner cannot be contacted within 7 days of notification, the prize may be forfeited and an alternative winner selected.`,
    },
    {
      heading: 'Prizes',
      body: `Prizes are non-transferable, non-exchangeable, and cannot be redeemed for cash or points.
The Organizer reserves the right to substitute a prize of equivalent or greater value.`,
    },
    {
      heading: 'Cancellation or Modification',
      body: 'The Organizer reserves the right to cancel, suspend, or modify the Draw, in whole or in part, at any time, including due to force majeure events, without liability.',
    },
    {
      heading: 'Liability',
      body: 'To the maximum extent permitted by law, ACCOR shall not be liable for any loss, damage, injury, or disappointment suffered by any participant as a result of participating in the Draw or using any prize.',
    },
    {
      heading: 'Acceptance of Terms',
      body: 'Participation in the Prize Draw constitutes full and unconditional acceptance of these Terms & Conditions.',
    },
  ],
};

const STANDARD_CONTENT: TermsContent = {
  intro: `This experience (the "Experience") is organized by ACCOR (the "Organizer"), or any of its affiliated entities, and made available through the ALL – Accor Live Limitless programme.

Participation is open to individuals aged 18 years or older (or the legal age of majority in their jurisdiction). Employees of ACCOR, its affiliates, partners, and their immediate family members may be excluded, unless otherwise stated.

All experiences and packages are described to the best of the Organizer's knowledge and are subject to availability. The Organizer reserves the right to modify, substitute, or withdraw any offer at its discretion.`,
  sections: [
    {
      heading: 'Purchase and Payment',
      body: `Purchases can be made using the accepted payment methods displayed at checkout.
All purchases are final and confirmed upon successful payment.
Pricing is inclusive of applicable fees unless otherwise stated.`,
    },
    {
      heading: 'Tickets and Delivery',
      body: `Upon successful purchase, confirmation details and any applicable tickets or vouchers will be sent to the email address provided.
Tickets are personal and non-transferable unless otherwise stated.`,
    },
    {
      heading: 'Cancellation and Refunds',
      body: `The Organizer reserves the right to cancel, postpone, or modify an Experience at any time due to unforeseen circumstances, including force majeure events, without liability.
In the event of cancellation by the Organizer, a full refund will be issued using the original payment method.
Cancellations by the purchaser are subject to the cancellation policy stated on the experience page.`,
    },
    {
      heading: 'Liability',
      body: 'To the maximum extent permitted by law, ACCOR shall not be liable for any loss, damage, injury, or disappointment suffered by any participant as a result of purchasing or attending any Experience.',
    },
    {
      heading: 'Acceptance of Terms',
      body: 'Completing a purchase constitutes full and unconditional acceptance of these Terms & Conditions.',
    },
  ],
};

const CONTENT_MAP: Record<TermsVariant, TermsContent> = {
  auction: AUCTION_CONTENT,
  redeem: REDEEM_CONTENT,
  'prize-draw': PRIZE_DRAW_CONTENT,
  standard: STANDARD_CONTENT,
  waitlist: STANDARD_CONTENT,
};

const TITLE_MAP: Record<TermsVariant, string> = {
  auction: 'Terms & Conditions (Auctions)',
  redeem: 'Terms & Conditions (Redeem)',
  'prize-draw': 'Terms & Conditions (Prize Draw)',
  standard: 'Terms & Conditions',
  waitlist: 'Terms & Conditions',
};

export function TermsDialog({ open, onClose, title, variant = 'auction' }: TermsDialogProps) {
  const content = CONTENT_MAP[variant];
  const resolvedTitle = title ?? TITLE_MAP[variant];
  if (!open) return null;

  return (
    <div className="terms-sheet__backdrop" onClick={onClose}>
      <div
        className="terms-sheet"
        role="dialog"
        aria-modal
        aria-label={resolvedTitle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="terms-sheet__header">
          <span className="terms-sheet__spacer" />
          <h2 className="terms-sheet__title">{resolvedTitle}</h2>
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
          <p className="terms-sheet__intro">{content.intro}</p>

          {content.sections.map((s) => (
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
