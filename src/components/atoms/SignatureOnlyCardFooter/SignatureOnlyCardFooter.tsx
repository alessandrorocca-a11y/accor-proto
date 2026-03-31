import signatureOnlyStripUrl from '@/assets/signature-only-card-footer.svg';
import './SignatureOnlyCardFooter.css';

export type SignatureOnlyCardFooterVariant = 'horizontal' | 'vertical' | 'imageOverlay';

export interface SignatureOnlyCardFooterProps {
  /** `horizontal` / `vertical`: under content. `imageOverlay`: absolute bottom of a `position: relative` image wrapper. */
  variant?: SignatureOnlyCardFooterVariant;
}

export function SignatureOnlyCardFooter({ variant = 'horizontal' }: SignatureOnlyCardFooterProps) {
  const isOverlay = variant === 'imageOverlay';

  return (
    <div
      className={`signature-only-card-footer signature-only-card-footer--${variant}`}
      aria-hidden
    >
      {isOverlay ? <span className="signature-only-card-footer__scrim" /> : null}
      <img
        src={signatureOnlyStripUrl}
        alt=""
        className="signature-only-card-footer__img"
        decoding="async"
      />
    </div>
  );
}
