import type { ReactNode } from 'react';
import { useEffect } from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
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
    <div className="ads-modal-backdrop" onClick={onClose} role="dialog" aria-modal aria-labelledby={title ? 'ads-modal-title' : undefined}>
      <div className="ads-modal" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="ads-modal-header">
            <h2 id="ads-modal-title" className="ads-modal-title">{title}</h2>
            <button type="button" className="ads-modal-close" onClick={onClose} aria-label="Close">×</button>
          </div>
        )}
        <div className="ads-modal-body">{children}</div>
        {footer !== undefined && <div className="ads-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
