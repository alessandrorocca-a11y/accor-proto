export interface IconHeartProps {
  filled: boolean;
  /** Rendered width/height in px; viewBox stays 24×24. Default 24. */
  size?: number;
  className?: string;
}

const PATH =
  'M12 21l-1.35-1.2C4.8 14.4 1.5 11.3 1.5 7.4 1.5 4.4 3.9 2 6.9 2c1.8 0 3.4.9 4.5 2.3C12.5 2.9 14.2 2 16 2c3 0 5.4 2.4 5.4 5.4 0 3.9-3.3 7-9.1 12.4L12 21z';

const ACTIVE = '#B40875';
const STROKE_SELECTED = '#ffffff';
/** Default: translucent dark fill + light outline (not tied to parent `color`). */
const FILL_DEFAULT = 'rgba(5, 0, 51, 0.22)';
const STROKE_DEFAULT = '#ecebf2';

export function IconHeart({ filled, size = 24, className }: IconHeartProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={PATH}
        fill={filled ? ACTIVE : FILL_DEFAULT}
        stroke={filled ? STROKE_SELECTED : STROKE_DEFAULT}
        strokeWidth={filled ? '2' : '1.5'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
