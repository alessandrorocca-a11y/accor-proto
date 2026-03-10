import type { ReactNode } from 'react';
import { useEffect } from 'react';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  side?: 'left' | 'right';
}

export function Drawer({ open, onClose, title, children, side = 'right' }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ads-drawer-backdrop" onClick={onClose}>
      <div
        className={`ads-drawer ads-drawer-${side}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        aria-labelledby={title ? 'ads-drawer-title' : undefined}
      >
        {title && (
          <div className="ads-drawer-header">
            <h2 id="ads-drawer-title" className="ads-drawer-title">{title}</h2>
            <button type="button" className="ads-drawer-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        )}
        <div className="ads-drawer-body">{children}</div>
      </div>
    </div>
  );
}
