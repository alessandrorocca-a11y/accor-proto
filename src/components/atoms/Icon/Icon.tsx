import type { HTMLAttributes } from 'react';

export interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClass = { sm: 'ads-icon-sm', md: 'ads-icon-md', lg: 'ads-icon-lg' };

export function Icon({ name, size = 'md', className = '', ...props }: IconProps) {
  const classes = ['ads-icon', sizeClass[size], className].filter(Boolean).join(' ');
  return (
    <span className={classes} role="img" aria-label={name} data-icon={name} {...props}>
      {/* Placeholder: use SVG sprite or inline SVG per name in real implementation */}
      <span className="ads-icon-placeholder" aria-hidden>{name.slice(0, 1)}</span>
    </span>
  );
}
