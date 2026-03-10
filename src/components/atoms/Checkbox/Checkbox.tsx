import type { InputHTMLAttributes, ReactNode } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  hint?: ReactNode;
}

export function Checkbox({
  label,
  hint,
  id: idProp,
  className = '',
  ...props
}: CheckboxProps) {
  const id = idProp ?? `ads-checkbox-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className={`ads-checkbox-wrap ${className}`.trim()}>
      <input type="checkbox" id={id} className="ads-checkbox" {...props} />
      {label && (
        <label htmlFor={id} className="ads-checkbox-label">
          {label}
        </label>
      )}
      {hint && <span className="ads-checkbox-hint">{hint}</span>}
    </div>
  );
}
