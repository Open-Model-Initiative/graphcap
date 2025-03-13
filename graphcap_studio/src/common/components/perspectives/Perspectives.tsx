// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Component
 * 
 * This component displays and manages image perspectives from GraphCap.
 */

import { Image } from '@/services/images';
import { PerspectiveCard } from './PerspectiveCard';
import { PerspectiveContent } from './PerspectiveContent';
import { PerspectivesProvider, usePerspectivesContext } from './context/PerspectivesContext';
import { usePerspectiveOperations } from './hooks';
import { PerspectiveHeader } from './components/PerspectiveHeader';
import { ErrorMessage } from './components/ErrorMessage';
import { MetadataDisplay } from './components/MetadataDisplay';
import { EmptyPerspectives } from './components/EmptyPerspectives';
import { GenerateAllButton } from './components/GenerateAllButton';

interface PerspectivesProps {
  readonly image: Image;
}

/**
 * Component for displaying and managing image perspectives from GraphCap
 */
export function Perspectives({ image }: PerspectivesProps) {
  return (
    <PerspectivesProvider>
      <PerspectivesContent image={image} />
    </PerspectivesProvider>
  );
}

/**
 * Inner component that uses the perspectives context
 */
function PerspectivesContent({ image }: PerspectivesProps) {
  const { activePerspective, setActivePerspective } = usePerspectivesContext();
  
  const {
    isLoading,
    error,
    captions,
    generatedPerspectives,
    availablePerspectives,
    availableProviders,
    generatePerspective,
    generateAllPerspectives,
    formatDate
  } = usePerspectiveOperations(image);

  return (
    <div className="rounded-lg bg-gray-800 p-4 shadow-sm border border-gray-700">
      <PerspectiveHeader isLoading={isLoading} />
      
      <ErrorMessage message={error} />
      
      <MetadataDisplay 
        metadata={captions?.metadata} 
        formatDate={formatDate} 
      />
      
      {/* Perspective cards */}
      {availablePerspectives.length === 0 ? (
        <EmptyPerspectives />
      ) : (
        <div className="grid grid-cols-1 gap-4 mt-4">
          {availablePerspectives.map((perspective) => {
            const perspectiveKey = perspective.name;
            const isGenerated = generatedPerspectives.includes(perspectiveKey);
            const isActive = activePerspective === perspectiveKey;
            
            // Get the perspective data if it exists
            const perspectiveData = isGenerated && captions ? captions.perspectives[perspectiveKey] : null;
            
            return (
              <PerspectiveCard
                key={perspectiveKey}
                title={perspective.display_name}
                description={perspective.description}
                type="Perspective" // Generic type for all perspectives
                isActive={isActive}
                isGenerated={isGenerated}
                onGenerate={(providerId) => generatePerspective(perspectiveKey, providerId)}
                onSetActive={() => setActivePerspective(perspectiveKey)}
                providers={availableProviders}
                isGenerating={isLoading}
                perspectiveKey={perspectiveKey}
              >
                {isGenerated && perspectiveData && (
                  <PerspectiveContent 
                    content={perspectiveData.content} 
                    type={perspectiveKey} 
                  />
                )}
              </PerspectiveCard>
            );
          })}
          
          <GenerateAllButton 
            isLoading={isLoading} 
            isDisabled={availablePerspectives.length === 0}
            onGenerateAll={generateAllPerspectives}
          />
        </div>
      )}
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