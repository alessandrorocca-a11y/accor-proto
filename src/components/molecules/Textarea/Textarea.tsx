import type { TextareaHTMLAttributes, ReactNode } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  fullWidth?: boolean;
}

export function Textarea({
  label,
  error,
  hint,
  fullWidth,
  id: idProp,
  className = '',
  ...props
}: TextareaProps) {
  const id = idProp ?? `ads-textarea-${Math.random().toString(36).slice(2, 9)}`;
  const classes = [
    'ads-textarea',
    fullWidth ? 'ads-textarea-full' : '',
    error ? 'ads-textarea-error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={fullWidth ? 'ads-textarea-wrap ads-textarea-wrap-full' : 'ads-textarea-wrap'}>
      {label && (
        <label htmlFor={id} className="ads-textarea-label">
          {label}
        </label>
      )}
      <textarea id={id} className={classes} aria-invalid={!!error} {...props} />
      {hint && !error && <span className="ads-textarea-hint">{hint}</span>}
      {error && <span className="ads-textarea-error-msg" role="alert">{error}</span>}
    </div>
  );
}
