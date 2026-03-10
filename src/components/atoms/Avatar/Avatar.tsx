import type { HTMLAttributes } from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
}

const sizeClass: Record<AvatarSize, string> = {
  sm: 'ads-avatar-sm',
  md: 'ads-avatar-md',
  lg: 'ads-avatar-lg',
};

export function Avatar({ src, alt, initials, size = 'md', className = '', ...props }: AvatarProps) {
  const classes = ['ads-avatar', sizeClass[size], className].filter(Boolean).join(' ');
  return (
    <div className={classes} {...props}>
      {src ? (
        <img src={src} alt={alt ?? ''} className="ads-avatar-img" />
      ) : (
        <span className="ads-avatar-initials">{initials ?? '?'}</span>
      )}
    </div>
  );
}
