// SPDX-License-Identifier: Apache-2.0

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'light' | 'dark';
  className?: string;
}

/**
 * A reusable loading spinner component
 */
export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className = '',
}: LoadingSpinnerProps) {
  // Size classes
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  // Color classes
  const colorMap = {
    primary: 'border-gray-600 border-t-blue-500',
    light: 'border-gray-300 border-t-blue-600',
    dark: 'border-gray-700 border-t-blue-400',
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 ${sizeMap[size]} ${colorMap[color]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
} 