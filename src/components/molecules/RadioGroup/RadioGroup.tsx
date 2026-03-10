import type { ReactNode } from 'react';
import { Radio } from '@/components/atoms';

export interface RadioGroupOption {
  value: string;
  label: ReactNode;
}

export interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioGroupOption[];
  label?: ReactNode;
}

export function RadioGroup({ name, value, onChange, options, label }: RadioGroupProps) {
  return (
    <div className="ads-radio-group" role="radiogroup" aria-label={typeof label === 'string' ? label : undefined}>
      {label && <div className="ads-radio-group-label">{label}</div>}
      <div className="ads-radio-group-options">
        {options.map((opt) => (
          <Radio
            key={opt.value}
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            label={opt.label}
          />
        ))}
      </div>
    </div>
  );
}
