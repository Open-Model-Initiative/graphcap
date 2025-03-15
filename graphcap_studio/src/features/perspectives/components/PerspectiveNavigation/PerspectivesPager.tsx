// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Pager Component
 * 
 * This component displays perspectives in a paged layout with fixed header and footer.
 */

import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { PerspectiveCardTabbed } from '../PerspectiveCard/PerspectiveCardTabbed';
import { PerspectiveSchema } from '@/features/perspectives/types';
import { PerspectivesFooter } from '../PerspectiveActions/PerspectivesFooter';
import { PerspectiveHeader } from './PerspectiveHeader';
import { Provider } from '@/features/perspectives/types';
import { useColorModeValue } from '@/components/ui/theme/color-mode';
import { EmptyPerspectives } from '../EmptyPerspectives';

interface PerspectivesPagerProps {
  schemas: Record<string, PerspectiveSchema>;
  activeSchemaName: string;
  selectedProviderId?: number;
  captions: any;
  generatedPerspectives: string[];
  availableProviders: Provider[];
  isLoading: boolean;
  onGenerate: (schemaKey: string) => void;
  onSetActiveSchema: (schemaName: string) => void;
  onProviderChange: (providerId: number | undefined) => void;
  optionsControl: {
    isOpen: boolean;
    onToggle: () => void;
    buttonRef: React.RefObject<HTMLButtonElement | null>;
  };
}

/**
 * Component for displaying perspectives in a paged layout
 */
export function PerspectivesPager({
  schemas,
  activeSchemaName,
  selectedProviderId,
  captions,
  generatedPerspectives,
  availableProviders,
  isLoading,
  onGenerate,
  onSetActiveSchema,
  onProviderChange,
  optionsControl
}: PerspectivesPagerProps) {
  // Get the array of schema keys for navigation
  const schemaKeys = Object.keys(schemas);
  
  // Find the current index based on active schema
  const currentIndex = schemaKeys.indexOf(activeSchemaName);
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  
  // Handle navigation between perspectives
  const handleNavigate = React.useCallback((index: number) => {
    if (index >= 0 && index < schemaKeys.length) {
      onSetActiveSchema(schemaKeys[index]);
    }
  }, [schemaKeys, onSetActiveSchema]);

  // If no schemas are available, show the empty state
  if (schemaKeys.length === 0) {
    return <EmptyPerspectives />;
  }

  // Get the active schema
  const activeSchema = schemas[activeSchemaName];
  const captionData = captions?.perspectives[activeSchemaName]?.content || null;
  const isGenerated = !!captions?.perspectives[activeSchemaName];
  const isGenerating = generatedPerspectives.includes(activeSchemaName) && isLoading;

  return (
    <Flex 
      direction="column" 
      height="100%"
      width="100%"
      overflow="hidden"
      position="relative"
    >
      {/* Fixed Header with Selection Controls */}
      <Box flexShrink={0} height="auto" minHeight="40px">
        <PerspectiveHeader 
          isLoading={isLoading}
          currentPerspectiveName={activeSchema.display_name}
          totalPerspectives={schemaKeys.length}
          currentIndex={currentIndex}
          onNavigate={handleNavigate}
        />
      </Box>
      
      {/* Scrollable Content Area - takes remaining space but reserves room for footer */}
      <Box 
        flex="1"
        overflow="auto"
        px={2}
        py={2}
        bg={bgColor}
        minHeight="0"
      >
        {/* Active Perspective Card */}
        {activeSchema && (
          <PerspectiveCardTabbed
            key={activeSchemaName}
            schema={activeSchema}
            data={captionData}
            isActive={true}
            isGenerated={isGenerated}
            onGenerate={() => onGenerate(activeSchemaName)}
            onSetActive={() => onSetActiveSchema(activeSchemaName)}
            providers={availableProviders}
            isGenerating={isGenerating}
            selectedProviderId={selectedProviderId}
            onProviderChange={onProviderChange}
          />
        )}
      </Box>
      
      {/* Fixed Footer with Action Controls */}
      <Box 
        flexShrink={0} 
        height="auto" 
        minHeight="40px" 
        bg={bgColor} 
        zIndex={5}
        mt="auto"
      >
        <PerspectivesFooter
          isLoading={isLoading}
          isGenerated={isGenerated}
          availableProviders={availableProviders}
          selectedProviderId={selectedProviderId}
          onGenerate={() => onGenerate(activeSchemaName)}
          onProviderChange={onProviderChange}
          optionsControl={optionsControl}
        />
      </Box>
    </Flex>
  );
} 