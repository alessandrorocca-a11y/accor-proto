import type { InputHTMLAttributes, ReactNode } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  label?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  fullWidth?: boolean;
}

const sizeClass: Record<InputSize, string> = {
  sm: 'ads-input-sm',
  md: 'ads-input-md',
  lg: 'ads-input-lg',
};

export function Input({
  size = 'md',
  label,
  error,
  hint,
  fullWidth,
  id: idProp,
  className = '',
  ...props
}: InputProps) {
  const id = idProp ?? `ads-input-${Math.random().toString(36).slice(2, 9)}`;
  const classes = [
    'ads-input',
    sizeClass[size],
    fullWidth ? 'ads-input-full' : '',
    error ? 'ads-input-error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={fullWidth ? 'ads-input-wrap ads-input-wrap-full' : 'ads-input-wrap'}>
      {label && (
        <label htmlFor={id} className="ads-input-label">
          {label}
        </label>
      )}
      <input id={id} className={classes} aria-invalid={!!error} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
      {hint && !error && (
        <span id={`${id}-hint`} className="ads-input-hint">
          {hint}
        </span>
      )}
      {error && (
        <span className="ads-input-error-msg" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
