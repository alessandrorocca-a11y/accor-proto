import type { SelectHTMLAttributes, ReactNode } from 'react';

export interface SelectOption {
  value: string;
  label: ReactNode;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[];
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  fullWidth?: boolean;
}

export function Select({
  options,
  label,
  hint,
  error,
  fullWidth,
  id: idProp,
  className = '',
  ...props
}: SelectProps) {
  const id = idProp ?? `ads-select-${Math.random().toString(36).slice(2, 9)}`;
  const classes = [
    'ads-select',
    fullWidth ? 'ads-select-full' : '',
    error ? 'ads-select-error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={fullWidth ? 'ads-select-wrap ads-select-wrap-full' : 'ads-select-wrap'}>
      {label && (
        <label htmlFor={id} className="ads-select-label">
          {label}
        </label>
      )}
      <select id={id} className={classes} aria-invalid={!!error} {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && !error && <span className="ads-select-hint">{hint}</span>}
      {error && <span className="ads-select-error-msg" role="alert">{error}</span>}
    </div>
  );
}
