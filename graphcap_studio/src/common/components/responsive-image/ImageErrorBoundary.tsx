// SPDX-License-Identifier: Apache-2.0
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { ReactNode } from 'react';
import { Button } from '@chakra-ui/react';

interface ImageErrorBoundaryProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly compact?: boolean;
}

interface ImageErrorFallbackProps extends FallbackProps {
  readonly className?: string;
  readonly compact?: boolean;
}

/**
 * The fallback component to display when an image fails to load
 */
function ImageErrorFallback({ 
  error, 
  resetErrorBoundary, 
  className = '', 
  compact = false 
}: ImageErrorFallbackProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-2 bg-gray-800/20 h-full w-full ${className}`}>
      {!compact && (
        <svg
          className="h-6 w-6 text-red-500 mb-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      )}
      <div className={`${compact ? 'text-xs' : 'text-sm'} text-red-400 text-center mb-1`}>
        {compact ? 'Failed to load' : error.message}
      </div>
      <Button
        onClick={resetErrorBoundary}
        size={compact ? "xs" : "sm"}
        colorScheme="blue"
        aria-label="Retry loading image"
      >
        Retry
      </Button>
    </div>
  );
}

/**
 * Creates a fallback render function for the error boundary
 */
function createFallbackRender(className: string, compact: boolean) {
  return (props: FallbackProps) => (
    <ImageErrorFallback
      {...props}
      className={className}
      compact={compact}
    />
  );
}

/**
 * A specialized error boundary component for images
 * 
 * This component provides a consistent error UI with retry capabilities
 * for all image-related components.
 * 
 * @param children - The components to render inside the error boundary
 * @param className - Additional CSS classes for the error UI
 * @param compact - Whether to use a compact version of the error UI
 */
export function ImageErrorBoundary({ 
  children, 
  className = '',
  compact = false
}: ImageErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallbackRender={createFallbackRender(className, compact)}
    >
      {children}
    </ErrorBoundary>
  );
} 