import type { ReactNode } from 'react';
import { Link } from '@/components/atoms';

export interface BreadcrumbItem {
  href?: string;
  label: ReactNode;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="ads-breadcrumb" aria-label="Breadcrumb">
      <ol className="ads-breadcrumb-list">
        {items.map((item, i) => (
          <li key={i} className="ads-breadcrumb-item">
            {i > 0 && <span className="ads-breadcrumb-sep" aria-hidden>/</span>}
            {item.href != null ? (
              <Link href={item.href} className="ads-breadcrumb-link">
                {item.label}
              </Link>
            ) : (
              <span className="ads-breadcrumb-current" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
