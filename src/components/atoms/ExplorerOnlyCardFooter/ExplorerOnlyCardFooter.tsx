import explorerOnlyStripUrl from '@/assets/explorer-only-card-footer.svg';
import './ExplorerOnlyCardFooter.css';

export type ExplorerOnlyCardFooterVariant = 'horizontal' | 'vertical' | 'imageOverlay';

export interface ExplorerOnlyCardFooterProps {
  /** `horizontal` / `vertical`: under content. `imageOverlay`: absolute bottom of a `position: relative` image wrapper. */
  variant?: ExplorerOnlyCardFooterVariant;
}

export function ExplorerOnlyCardFooter({ variant = 'horizontal' }: ExplorerOnlyCardFooterProps) {
  const isOverlay = variant === 'imageOverlay';

  return (
    <div
      className={`explorer-only-card-footer explorer-only-card-footer--${variant}`}
      aria-hidden
    >
      {isOverlay ? <span className="explorer-only-card-footer__scrim" /> : null}
      <img
        src={explorerOnlyStripUrl}
        alt=""
        className="explorer-only-card-footer__img"
        decoding="async"
      />
    </div>
  );
}
