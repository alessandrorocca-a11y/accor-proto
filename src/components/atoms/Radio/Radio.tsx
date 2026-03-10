import type { InputHTMLAttributes, ReactNode } from 'react';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

export function Radio({ label, id: idProp, className = '', ...props }: RadioProps) {
  const id = idProp ?? `ads-radio-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className={`ads-radio-wrap ${className}`.trim()}>
      <input type="radio" id={id} className="ads-radio" {...props} />
      {label && (
        <label htmlFor={id} className="ads-radio-label">
          {label}
        </label>
      )}
    </div>
  );
}
