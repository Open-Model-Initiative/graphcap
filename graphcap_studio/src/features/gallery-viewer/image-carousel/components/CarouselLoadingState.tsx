// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { LoadingSpinner } from '@/components/ui/status/LoadingSpinner';

interface CarouselLoadingStateProps {
  className?: string;
}

/**
 * Loading state component for the carousel
 * 
 * This component displays a centered loading spinner with optional custom styling.
 */
export function CarouselLoadingState({ className = '' }: CarouselLoadingStateProps) {
  return (
    <div className={`flex items-center justify-center w-full h-full min-h-[320px] ${className}`}>
      <LoadingSpinner size="lg" />
    </div>
  );
} 