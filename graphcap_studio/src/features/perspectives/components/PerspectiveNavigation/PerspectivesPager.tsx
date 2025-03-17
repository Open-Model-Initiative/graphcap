// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Pager Component
 * 
 * This component displays perspectives in a paged layout with fixed header and footer.
 */

import React, { useMemo } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { PerspectiveCardTabbed } from '../PerspectiveCard/PerspectiveCardTabbed';
import { PerspectivesFooter } from '../PerspectiveActions/PerspectivesFooter';
import { PerspectiveHeader } from './PerspectiveHeader';
import { useColorModeValue } from '@/components/ui/theme/color-mode';
import { EmptyPerspectives } from '../EmptyPerspectives';
import { usePerspectivesData, usePerspectiveUI } from '@/features/perspectives/context';

interface OptionsControl {
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly buttonRef: React.RefObject<HTMLButtonElement | null>;
  readonly options: any;
}

/**
 * Component for displaying perspectives in a paged layout
 */
export function PerspectivesPager({ 
  optionsControl
}: { 
  optionsControl: OptionsControl;
}) {
  // Get data context props
  const { 
    schemas,
    isGenerating, 
    generatePerspective,
    isPerspectiveGenerated, 
    isPerspectiveGenerating,
    getPerspectiveData,
    currentImage,
    isPerspectiveVisible,
    selectedProvider
  } = usePerspectivesData();
  
  // Get UI-related props from UI context
  const { 
    activeSchemaName, 
    setActiveSchemaName
  } = usePerspectiveUI();
  
  // Get the array of schema keys for navigation, filtered to only show visible perspectives
  const schemaKeys = useMemo(() => {
    const allKeys = Object.keys(schemas || {});
    return allKeys.filter(key => isPerspectiveVisible(key));
  }, [schemas, isPerspectiveVisible]);
  
  // Find the current index based on active schema
  const currentIndex = activeSchemaName ? schemaKeys.indexOf(activeSchemaName) : -1;
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  
  // Handle navigation between perspectives
  const handleNavigate = React.useCallback((index: number) => {
    if (index >= 0 && index < schemaKeys.length) {
      setActiveSchemaName(schemaKeys[index]);
    }
  }, [schemaKeys, setActiveSchemaName]);

  // If no schemas are available, show the empty state
  if (!schemas || schemaKeys.length === 0) {
    return <EmptyPerspectives />;
  }

  // Check if we have a valid activeSchemaName that is visible
  if (!activeSchemaName || !schemas[activeSchemaName] || !isPerspectiveVisible(activeSchemaName)) {
    // If current perspective is hidden or invalid, select the first visible one
    if (schemaKeys.length > 0) {
      setActiveSchemaName(schemaKeys[0]);
      return <EmptyPerspectives />;
    }
    return <EmptyPerspectives />;
  }

  // Get the active schema
  const activeSchema = schemas[activeSchemaName];
  const captionData = getPerspectiveData(activeSchemaName);
  const isGenerated = isPerspectiveGenerated(activeSchemaName);
  const isGeneratingCurrent = isPerspectiveGenerating(activeSchemaName);

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
          isLoading={isGenerating}
          currentPerspectiveName={activeSchema?.display_name || 'Loading...'}
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
            onGenerate={() => {
              if (currentImage) {
                generatePerspective(activeSchemaName, currentImage.path, selectedProvider);
              }
            }}
            onSetActive={() => setActiveSchemaName(activeSchemaName)}
            isGenerating={isGeneratingCurrent}
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
          isLoading={isGenerating}
          isGenerated={isGenerated}
          optionsControl={optionsControl}
          captionOptions={optionsControl.options}
        />
      </Box>
    </Flex>
  );
} 