import type { AnchorHTMLAttributes } from 'react';

export interface SkipLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: string;
}

export function SkipLink({ href, children = 'Skip to main content', className = '', ...props }: SkipLinkProps) {
  return (
    <a href={href} className={`ads-skip-link ${className}`.trim()} {...props}>
      {children}
    </a>
  );
}
