import type { HTMLAttributes, ReactNode } from 'react';

export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  steps: ReactNode[];
  currentStep: number;
}

export function Stepper({ steps, currentStep, className = '', ...props }: StepperProps) {
  return (
    <div className={`ads-stepper ${className}`.trim()} role="list" {...props}>
      {steps.map((label, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isPast = step < currentStep;
        return (
          <div
            key={step}
            className={`ads-stepper-item ${isActive ? 'ads-stepper-item-active' : ''} ${isPast ? 'ads-stepper-item-past' : ''}`}
            role="listitem"
          >
            <span className="ads-stepper-dot" aria-current={isActive ? 'step' : undefined}>
              {isPast ? '✓' : step}
            </span>
            <span className="ads-stepper-label">{label}</span>
            {i < steps.length - 1 && <span className="ads-stepper-line" />}
          </div>
        );
      })}
    </div>
  );
}
