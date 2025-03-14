// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';
import { Image } from '@/services/images';
import { BasicInformation, FileInformation, Segments, LoadingState, ErrorState } from './components';
import { useImageProperties } from './hooks';
import { Perspectives } from '@/features/perspectives';
import { PerspectivesProvider } from '@/features/perspectives/context/PerspectivesContext';
import { Box } from '@chakra-ui/react';
import { Tabs } from '@chakra-ui/react';

interface ImagePropertiesProps {
  readonly image: Image | null;
  readonly isLoading?: boolean;
  readonly error?: string | null;
}

/**
 * Component for displaying image properties and metadata
 */
export function ImageProperties({ image, isLoading = false, error = null }: ImagePropertiesProps) {
  // Get image properties data
  const { 
    properties, 
    isLoading: propertiesLoading, 
    error: propertiesError,
    newTag,
    isEditing,
    setNewTag,
    handlePropertyChange,
    handleAddTag,
    handleRemoveTag,
    handleSave,
    setIsEditing
  } = useImageProperties(image);
  
  // Toggle editing function
  const toggleEditing = () => setIsEditing(!isEditing);
  
  // Combine loading and error states
  const isLoadingState = isLoading || propertiesLoading;
  const errorState = error ?? propertiesError;
  
  // Render loading state
  if (isLoadingState) {
    return <LoadingState />;
  }
  
  // Render error state
  if (errorState) {
    return <ErrorState message={errorState} />;
  }
  
  // Render no image selected state
  if (!image) {
    return (
      <Box p={4} textAlign="center" color="gray.400">
        <p>No image selected</p>
      </Box>
    );
  }
  
  return (
    <Box height="full" display="flex" flexDirection="column">
      <Tabs.Root defaultValue="basic" variant="line" colorPalette="blue" size="md">
        <Tabs.List borderBottomColor="gray.700">
          <Tabs.Trigger value="basic">Basic</Tabs.Trigger>
          <Tabs.Trigger value="file">File</Tabs.Trigger>
          <Tabs.Trigger value="segments">Segments</Tabs.Trigger>
          <Tabs.Trigger value="perspectives">Perspectives</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
        
        <Tabs.Content value="basic" p={2} overflow="auto">
          {properties && (
            <BasicInformation 
              properties={properties}
              isEditing={isEditing}
              newTag={newTag}
              onPropertyChange={handlePropertyChange}
              onNewTagChange={setNewTag}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              onSave={handleSave}
              onToggleEdit={toggleEditing}
            />
          )}
        </Tabs.Content>
        
        <Tabs.Content value="file" p={2} overflow="auto">
          <FileInformation image={image} />
        </Tabs.Content>
        
        <Tabs.Content value="segments" p={2} overflow="auto">
          <Segments image={image} />
        </Tabs.Content>
        
        <Tabs.Content value="perspectives" p={2} overflow="auto">
          <PerspectivesProvider>
            <Perspectives image={image} />
          </PerspectivesProvider>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
} 