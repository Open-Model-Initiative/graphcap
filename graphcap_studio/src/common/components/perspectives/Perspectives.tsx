// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Component
 * 
 * This component displays and manages image perspectives from GraphCap.
 */

import React from 'react';
import { PerspectiveCard } from './PerspectiveCard';
import { PerspectiveUIProvider } from './context/PerspectiveUIContext';
import { usePerspectivesContext } from './context/PerspectivesContext';
import { EmptyPerspectives } from './components/EmptyPerspectives';
import { PerspectiveHeader } from './components/PerspectiveHeader';
import { PerspectiveSchema } from '@/services/perspectives/types';
import { Image } from '@/services/images';
import { useImagePerspectives } from '@/services/perspectives';

interface PerspectivesProps {
  image: Image | null;
}

/**
 * Component for displaying and managing image perspectives from GraphCap
 */
export function Perspectives({ image }: PerspectivesProps) {
  const {
    perspectives,
    isLoading: contextLoading,
    error: contextError,
    activePerspective,
    handleSelectPerspective,
  } = usePerspectivesContext();

  // Get image-specific perspective data
  const {
    captions,
    isLoading: imageLoading,
    error: imageError,
    generatePerspective,
    availableProviders,
    generatedPerspectives,
  } = useImagePerspectives(image);

  // Combine loading and error states
  const isLoading = contextLoading || imageLoading;
  const error = contextError || imageError;

  // Convert perspectives array to schema record
  const schemas = React.useMemo(() => {
    return perspectives.reduce((acc, perspective) => {
      if (perspective.schema) {
        acc[perspective.name] = perspective.schema;
      }
      return acc;
    }, {} as Record<string, PerspectiveSchema>);
  }, [perspectives]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <PerspectiveHeader isLoading={true} />
        <EmptyPerspectives />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <div className="text-gray-400 text-center">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium">Error Loading Perspectives</h3>
          <p className="mt-1 text-sm">{error instanceof Error ? error.message : error}</p>
        </div>
      </div>
    );
  }

  // Handle empty schemas
  if (Object.keys(schemas).length === 0) {
    return (
      <div className="space-y-4">
        <PerspectiveHeader isLoading={false} />
        <EmptyPerspectives />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PerspectiveHeader isLoading={false} />
      <PerspectiveUIProvider schemas={schemas}>
        <div className="grid grid-cols-1 gap-6">
          {Object.entries(schemas).map(([key, schema]) => (
            <PerspectiveCard
              key={key}
              schema={schema}
              data={captions?.perspectives[key]?.content || null}
              isActive={activePerspective === key}
              isGenerated={!!captions?.perspectives[key]}
              onGenerate={(providerId) => generatePerspective(key, providerId)}
              onSetActive={() => handleSelectPerspective(key)}
              providers={availableProviders}
              isGenerating={generatedPerspectives.includes(key)}
            />
          ))}
        </div>
      </PerspectiveUIProvider>
    </div>
  );
}

/**
 * Format a date string from the format YYYYMMDD_HHMMSS to a more readable format
 */
function formatDate(dateString: string): string {
  // Check if the date is in ISO format
  if (dateString.includes('T') && dateString.includes('Z')) {
    return new Date(dateString).toLocaleString();
  }
  
  // Check if the date is in the expected format
  const regex = /^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})$/;
  const match = regex.exec(dateString);
  if (!match) return dateString;
  
  const [, year, month, day, hour, minute, second] = match;
  
  // Create a date object
  const date = new Date(
    parseInt(year),
    parseInt(month) - 1, // Month is 0-indexed in JavaScript
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
    parseInt(second)
  );
  
  // Format the date
  return date.toLocaleString();
} 