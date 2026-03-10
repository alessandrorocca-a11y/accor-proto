import type { HTMLAttributes, ReactNode } from 'react';

export type ChipVariant = 'default' | 'eco' | 'family';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  onRemove?: () => void;
  children: ReactNode;
}

const variantClass: Record<ChipVariant, string> = {
  default: 'ads-chip-default',
  eco: 'ads-chip-eco',
  family: 'ads-chip-family',
};

export function Chip({ variant = 'default', onRemove, children, className = '', ...props }: ChipProps) {
  const classes = ['ads-chip', variantClass[variant], className].filter(Boolean).join(' ');
  return (
    <span className={classes} {...props}>
      <span className="ads-chip-text">{children}</span>
      {onRemove && (
        <button type="button" className="ads-chip-remove" onClick={onRemove} aria-label="Remove">
          ×
        </button>
      )}
    </span>
  );
}
