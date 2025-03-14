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
import { PerspectiveSchema } from '@/features/perspectives/types';
import { Image } from '@/services/images';
import { useImagePerspectives } from '@/features/perspectives/services';


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

  const isPerspectivesListLoading = contextLoading;
  const error = contextError || imageError;

  // Log the perspectives data
  console.log(`Perspectives data received: ${perspectives ? perspectives.length : 0} perspectives`, { 
    perspectiveNames: perspectives?.map(p => p.name).join(', ') || 'none'
  });

  // Convert perspectives array to schema record
  const schemas = React.useMemo(() => {
    const result = perspectives.reduce((acc, perspective) => {
      if (perspective.schema) {
        acc[perspective.name] = perspective.schema;
      }
      return acc;
    }, {} as Record<string, PerspectiveSchema>);
    
    // Log the schemas
    console.log(`Converted ${Object.keys(result).length} perspectives to schemas`, { 
      schemaKeys: Object.keys(result).join(', ') || 'none'
    });
    
    return result;
  }, [perspectives]);

  // Handle loading state for perspectives list only
  if (isPerspectivesListLoading) {
    console.log('Rendering loading state');
    return (
      <div className="space-y-4">
        <PerspectiveHeader isLoading={true} />
        <EmptyPerspectives />
      </div>
    );
  }

  // Handle error state
  if (error) {
    console.error('Rendering error state', { error: error instanceof Error ? error.message : error });
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
    console.warn('No schemas available, rendering empty state');
    return (
      <div className="space-y-4">
        <PerspectiveHeader isLoading={false} />
        <EmptyPerspectives />
      </div>
    );
  }

  console.log(`Rendering ${Object.keys(schemas).length} perspective cards`);
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
              onGenerate={(providerId, options) => generatePerspective(key, providerId, options)}
              onSetActive={() => handleSelectPerspective(key)}
              providers={availableProviders}
              isGenerating={generatedPerspectives.includes(key) && imageLoading}
            />
          ))}
        </div>
      </PerspectiveUIProvider>
    </div>
  );
}

