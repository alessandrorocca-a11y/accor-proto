import type { HTMLAttributes, ReactNode } from 'react';

export interface SegmentOption<T = string> {
  value: T;
  label: ReactNode;
}

export interface SegmentedControlProps<T = string> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  name = 'ads-segment',
  className = '',
  ...props
}: SegmentedControlProps<T>) {
  return (
    <div className={`ads-segmented-control ${className}`.trim()} role="group" {...props}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={opt.value === value}
          className={`ads-segment-btn ${opt.value === value ? 'ads-segment-btn-active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
