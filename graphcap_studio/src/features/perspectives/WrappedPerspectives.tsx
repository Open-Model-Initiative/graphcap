// SPDX-License-Identifier: Apache-2.0
/**
 * Wrapped Perspectives Component
 * 
 * This component wraps the Perspectives component with the necessary providers
 * to ensure proper error handling and context availability.
 */

import React, { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PerspectivesProvider } from './context';
import { Perspectives } from './Perspectives';
import { Image } from '@/services/images';

interface WrappedPerspectivesProps {
  image: Image | null;
  initialProviderId?: number;
  fallback?: ReactNode;
}

/**
 * Wrapped Perspectives component with error boundary and context providers
 * Use this component in place of the raw Perspectives component
 * to ensure proper error handling and context availability.
 */
export function WrappedPerspectives({
  image,
  initialProviderId,
  fallback
}: WrappedPerspectivesProps) {
  // Default error fallback
  const defaultFallback = (
    <div className="p-4 bg-gray-800 rounded-lg">
      <div className="text-gray-400 text-center">
        <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium">Error in Perspectives Component</h3>
        <p className="mt-1 text-sm">There was an error loading the perspectives. Please try again later.</p>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback || defaultFallback}>
      <PerspectivesProvider initialProviderId={initialProviderId} image={image}>
        <Perspectives image={image} />
      </PerspectivesProvider>
    </ErrorBoundary>
  );
} 