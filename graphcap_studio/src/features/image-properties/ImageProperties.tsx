// SPDX-License-Identifier: Apache-2.0
import { BasicInformation, FileInformation, Segments, LoadingState, ErrorState } from './components';
import { Perspectives } from '@/features/perspectives';
import { PerspectivesProvider } from '@/features/perspectives/context/PerspectivesContext';
import { Box } from '@chakra-ui/react';
import { Tabs } from '@chakra-ui/react';
import { useImagePropertiesContext } from './context';

/**
 * Component for displaying image properties and metadata
 * 
 * This component uses the ImagePropertiesContext to access and manage
 * image properties data.
 */
export function ImageProperties() {
  // Get context data and methods
  const { 
    properties, 
    isLoading,
    error,
    image,
    newTag,
    isEditing,
    setNewTag,
    handlePropertyChange,
    handleAddTag,
    handleRemoveTag,
    handleSave,
    toggleEditing
  } = useImagePropertiesContext();
  
  // Render loading state
  if (isLoading) {
    return <LoadingState />;
  }
  
  // Render error state
  if (error) {
    return <ErrorState message={error} />;
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