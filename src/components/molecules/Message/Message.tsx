import type { ReactNode } from 'react';

export type MessageVariant = 'info' | 'success' | 'warning' | 'error';

export interface MessageProps {
  variant?: MessageVariant;
  title?: ReactNode;
  children: ReactNode;
}

const variantClass: Record<MessageVariant, string> = {
  info: 'ads-msg-info',
  success: 'ads-msg-success',
  warning: 'ads-msg-warning',
  error: 'ads-msg-error',
};

export function Message({ variant = 'info', title, children }: MessageProps) {
  const classes = ['ads-message', variantClass[variant]].filter(Boolean).join(' ');
  return (
    <div className={classes} role="alert">
      {title && <div className="ads-message-title">{title}</div>}
      <div className="ads-message-body">{children}</div>
    </div>
  );
}
