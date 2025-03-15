// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Card Component
 * 
 * This component displays a perspective with controls.
 */

import React from 'react';
import { Button } from '@/components/ui';
import { usePerspectiveUI } from './context';
import { PerspectiveContent } from './PerspectiveContent';
import { SchemaView } from './components/SchemaView';
import { PerspectiveSchema, Provider, CaptionOptions } from './types';
import { useClipboard } from '@/common/hooks/useClipboard';
import { GenerationOptionForm, DEFAULT_OPTIONS } from './components/GenerationOptionForm';

// Define style classes for perspective cards
const cardStyles = {
  active: "bg-gray-750 hover:bg-gray-700",
  inactive: "bg-gray-800 hover:bg-gray-750",
  text: "text-gray-200",
  border: "border-blue-500"
};

interface PerspectiveCardProps {
  schema: PerspectiveSchema;
  data: Record<string, any> | null;
  isActive: boolean;
  isGenerated: boolean;
  onGenerate: (providerId?: number, options?: CaptionOptions) => void;
  onSetActive: () => void;
  providers?: Provider[];
  isGenerating?: boolean;
}

/**
 * Card component that displays a perspective with generation controls
 */
export function PerspectiveCard({
  schema,
  data,
  isActive,
  isGenerated,
  onGenerate,
  onSetActive,
  providers = [],
  isGenerating = false
}: PerspectiveCardProps) {
  const [isOptionsOpen, setIsOptionsOpen] = React.useState(false);
  const [options, setOptions] = React.useState<CaptionOptions>(DEFAULT_OPTIONS);
  const { renderField, selectedProviderId } = usePerspectiveUI();
  const { copyToClipboard, hasCopied } = useClipboard();
  
  // Card class based on active state
  const cardClass = isActive
    ? `${cardStyles.active} border-l-4 ${cardStyles.border}`
    : `${cardStyles.inactive} border-l-4 border-transparent`;
  
  // Handler for generating perspective
  const handleGenerate = () => {
    // Close options panel if open
    if (isOptionsOpen) {
      setIsOptionsOpen(false);
    }
    
    // Call the generate function with provider and options
    onGenerate(selectedProviderId, options);
  };
  
  // Handler for copying perspective data
  const handleCopy = () => {
    if (!data) return;
    
    const dataStr = typeof data === 'string' 
      ? data 
      : JSON.stringify(data, null, 2);
    
    copyToClipboard(dataStr);
  };
  
  // Toggle options panel
  const toggleOptions = () => {
    setIsOptionsOpen(!isOptionsOpen);
  };
  
  return (
    <div className={`rounded-lg transition-colors duration-200 p-4 ${cardClass}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className={`text-lg font-medium ${cardStyles.text}`}>
          {schema.display_name}
        </h3>
        <div className="flex space-x-2">
          {/* Copy button (visible when data exists) */}
          {data && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleCopy}
              aria-label="Copy content"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </Button>
          )}
          
          {/* Generate button */}
          <Button
            variant={isGenerated ? "outline" : "solid"}
            size="xs"
            onClick={handleGenerate}
            loading={isGenerating}
            disabled={isGenerating}
          >
            {isGenerated ? "Regenerate" : "Generate"}
          </Button>
          
          {/* Options button */}
          <Button
            variant="ghost"
            size="xs"
            onClick={toggleOptions}
            aria-label="Options"
            aria-expanded={isOptionsOpen}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </Button>
        </div>
      </div>
      
      {/* Options form (conditionally rendered) */}
      {isOptionsOpen && (
        <GenerationOptionForm
          options={options}
          onChange={setOptions}
          onClose={() => setIsOptionsOpen(false)}
          isGenerating={isGenerating}
        />
      )}
      
      {/* Card content */}
      <div onClick={onSetActive} className="cursor-pointer">
        {isGenerated && data ? (
          <PerspectiveContent 
            data={data} 
            schema={schema}
            renderField={renderField}
          />
        ) : (
          <SchemaView schema={schema} />
        )}
      </div>
    </div>
  );
} 