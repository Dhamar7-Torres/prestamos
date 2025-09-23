import React from 'react';
import { classNames } from '@/utils/helpers';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = false,
  className
}) => {
  const baseClasses = 'inline-flex items-center font-medium';

  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const roundedClasses = rounded ? 'rounded-full' : 'rounded';

  return (
    <span
      className={classNames(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        roundedClasses,
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;