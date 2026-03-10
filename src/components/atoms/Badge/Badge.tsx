import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant = 'default' | 'eco' | 'family' | 'neutral';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variantClass: Record<BadgeVariant, string> = {
  default: 'ads-badge-default',
  eco: 'ads-badge-eco',
  family: 'ads-badge-family',
  neutral: 'ads-badge-neutral',
};

export function Badge({ variant = 'default', children, className = '', ...props }: BadgeProps) {
  const classes = ['ads-badge', variantClass[variant], className].filter(Boolean).join(' ');
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
