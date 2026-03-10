import type { ReactNode } from 'react';

export interface BannerProps {
  title?: ReactNode;
  children: ReactNode;
  onClose?: () => void;
}

export function Banner({ title, children, onClose }: BannerProps) {
  return (
    <div className="ads-banner">
      <div className="ads-banner-content">
        {title && <div className="ads-banner-title">{title}</div>}
        <div className="ads-banner-body">{children}</div>
      </div>
      {onClose && (
        <button type="button" className="ads-banner-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
}
