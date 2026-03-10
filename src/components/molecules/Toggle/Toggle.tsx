import type { InputHTMLAttributes, ReactNode } from 'react';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

export function Toggle({ label, id: idProp, className = '', ...props }: ToggleProps) {
  const id = idProp ?? `ads-toggle-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className={`ads-toggle-wrap ${className}`.trim()}>
      <input type="checkbox" id={id} className="ads-toggle-input" role="switch" {...props} />
      <label htmlFor={id} className="ads-toggle-track">
        <span className="ads-toggle-thumb" />
      </label>
      {label && <label htmlFor={id} className="ads-toggle-label">{label}</label>}
    </div>
  );
}
