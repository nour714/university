import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark';
}

/**
 * High-performance, accessible skeleton loading component with animated shimmer effect.
 */
export function Skeleton({ className = '', variant = 'light', ...props }: SkeletonProps) {
  const baseClass = variant === 'dark' ? 'shimmer-dark' : 'shimmer bg-slate-200/80';
  
  return (
    <div
      role="status"
      aria-label="جاري التحميل..."
      className={`rounded-xl ${baseClass} ${className}`}
      {...props}
    />
  );
}
