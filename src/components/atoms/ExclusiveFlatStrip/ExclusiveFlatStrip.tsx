import './ExclusiveFlatStrip.css';

export type ExclusiveFlatStripKind = 'explorer' | 'signature';

export type ExclusiveFlatStripVariant = 'horizontal' | 'vertical' | 'imageOverlay';

export interface ExclusiveFlatStripProps {
  kind: ExclusiveFlatStripKind;
  /** `imageOverlay`: bottom of a `position: relative` image wrapper. */
  variant?: ExclusiveFlatStripVariant;
}

const LABELS: Record<ExclusiveFlatStripKind, string> = {
  explorer: 'ALL Accor+ Explorer',
  signature: 'ALL Signature',
};

export function ExclusiveFlatStrip({ kind, variant = 'imageOverlay' }: ExclusiveFlatStripProps) {
  return (
    <div
      className={`exclusive-flat-strip exclusive-flat-strip--${variant}`}
      aria-hidden
    >
      {LABELS[kind]}
    </div>
  );
}
