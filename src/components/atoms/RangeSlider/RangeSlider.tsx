import type { InputHTMLAttributes } from 'react';

export interface RangeSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

export function RangeSlider({
  min = 0,
  max = 100,
  step = 1,
  label,
  id: idProp,
  className = '',
  ...props
}: RangeSliderProps) {
  const id = idProp ?? `ads-range-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className={`ads-range-wrap ${className}`.trim()}>
      {label && <label htmlFor={id} className="ads-range-label">{label}</label>}
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        className="ads-range"
        {...props}
      />
    </div>
  );
}
