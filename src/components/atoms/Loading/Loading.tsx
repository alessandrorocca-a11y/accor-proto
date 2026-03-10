import type { HTMLAttributes } from 'react';

export type LoadingSize = 'sm' | 'md' | 'lg';

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  size?: LoadingSize;
}

const sizeClass: Record<LoadingSize, string> = {
  sm: 'ads-loading-sm',
  md: 'ads-loading-md',
  lg: 'ads-loading-lg',
};

export function Loading({ size = 'md', className = '', ...props }: LoadingProps) {
  const classes = ['ads-loading', sizeClass[size], className].filter(Boolean).join(' ');
  return (
    <div className={classes} aria-label="Loading" role="status" {...props}>
      <span className="ads-loading-dot" />
      <span className="ads-loading-dot" />
      <span className="ads-loading-dot" />
    </div>
  );
}
