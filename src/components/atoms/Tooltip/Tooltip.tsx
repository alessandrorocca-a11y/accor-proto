import type { HTMLAttributes, ReactNode } from 'react';

export interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  content: ReactNode;
  children: ReactNode;
}

export function Tooltip({ content, children, className = '', ...props }: TooltipProps) {
  return (
    <div className={`ads-tooltip-wrap ${className}`.trim()} {...props}>
      {children}
      <span className="ads-tooltip" role="tooltip">
        {content}
      </span>
    </div>
  );
}
