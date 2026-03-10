import type { HTMLAttributes } from 'react';

export interface RatingProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md';
}

export function Rating({ value, max = 5, size = 'md', className = '', ...props }: RatingProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  const classes = ['ads-rating', size === 'sm' ? 'ads-rating-sm' : '', className].filter(Boolean).join(' ');
  return (
    <div className={classes} role="img" aria-label={`Rating: ${value} out of ${max}`} {...props}>
      {stars.map((star) => (
        <span
          key={star}
          className={`ads-rating-star ${star <= value ? 'ads-rating-star-filled' : ''}`}
          aria-hidden
        >
          ★
        </span>
      ))}
    </div>
  );
}
