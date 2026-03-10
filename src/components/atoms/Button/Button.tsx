import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'eco' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'ads-btn-sm',
  md: 'ads-btn-md',
  lg: 'ads-btn-lg',
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'ads-btn-primary',
  secondary: 'ads-btn-secondary',
  tertiary: 'ads-btn-tertiary',
  eco: 'ads-btn-eco',
  ghost: 'ads-btn-ghost',
  link: 'ads-btn-link',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const classes = [
    'ads-btn',
    sizeStyles[size],
    variantStyles[variant],
    fullWidth ? 'ads-btn-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
