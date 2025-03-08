// SPDX-License-Identifier: Apache-2.0
import { ReactNode, ButtonHTMLAttributes } from 'react';

interface NavigationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly direction: 'prev' | 'next';
  readonly label?: string;
  readonly icon?: ReactNode;
  readonly position?: 'left' | 'right';
  readonly className?: string;
}

/**
 * A navigation button component for carousel navigation
 */
export function NavigationButton({
  direction,
  label,
  icon,
  position = direction === 'prev' ? 'left' : 'right',
  className = '',
  ...props
}: NavigationButtonProps) {
  // Default icons
  const defaultIcons = {
    prev: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    ),
    next: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    ),
  };

  // Position classes
  const positionClasses = {
    left: 'absolute left-4',
    right: 'absolute right-4',
  };

  return (
    <button
      className={`z-10 rounded-full bg-gray-700 p-2 text-white hover:bg-gray-600 ${positionClasses[position]} ${className}`}
      aria-label={label ?? (direction === 'prev' ? 'Previous' : 'Next')}
      {...props}
    >
      {icon ?? defaultIcons[direction]}
    </button>
  );
} 