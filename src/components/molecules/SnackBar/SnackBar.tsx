import type { ReactNode } from 'react';
import { useEffect } from 'react';

export interface SnackBarProps {
  open: boolean;
  onClose: () => void;
  message: ReactNode;
  action?: ReactNode;
  autoHideDuration?: number;
}

export function SnackBar({
  open,
  onClose,
  message,
  action,
  autoHideDuration = 6000,
}: SnackBarProps) {
  useEffect(() => {
    if (!open || autoHideDuration <= 0) return;
    const t = setTimeout(onClose, autoHideDuration);
    return () => clearTimeout(t);
  }, [open, onClose, autoHideDuration]);

  if (!open) return null;

  return (
    <div className="ads-snackbar" role="status">
      <span className="ads-snackbar-message">{message}</span>
      {action && <span className="ads-snackbar-action">{action}</span>}
      <button type="button" className="ads-snackbar-close" onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  );
}
