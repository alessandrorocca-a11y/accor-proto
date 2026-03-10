import type { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ width, height, style, className = '', ...props }: SkeletonProps) {
  const combinedStyle = {
    ...style,
    ...(width != null && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height != null && { height: typeof height === 'number' ? `${height}px` : height }),
  };
  return <div className={`ads-skeleton ${className}`.trim()} style={combinedStyle} {...props} />;
}
