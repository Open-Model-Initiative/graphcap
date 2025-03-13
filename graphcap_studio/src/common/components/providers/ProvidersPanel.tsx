// SPDX-License-Identifier: Apache-2.0
import { useMemo } from 'react';
import { useProviders } from '../../../features/inference/services/providers';
import { useDatabaseHealth, useProviderForm } from '../../../features/inference/hooks';
import ProviderDetails from './ProviderDetails';
import ProviderForm from './ProviderForm';
import { ProviderSelect } from './form';
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useColorMode } from '@/components/ui/color-mode';

/**
 * Providers Panel Component
 * 
 * This component displays a list of providers and allows for CRUD operations
 * on provider configurations.
 */
export function ProvidersPanel() {
  // Custom hooks
  const { isConnected, checkDatabaseConnection } = useDatabaseHealth();
  const { 
    formData, 
    isCreating, 
    isEditing, 
    selectedProviderId, 
    setSelectedProviderId,
    handleSubmit,
    startCreating,
    startEditing,
    cancelForm,
    isSubmitting
  } = useProviderForm();
  
  // Fetch providers
  const { 
    data: providers = [], 
    isLoading, 
    isError, 
    error 
  } = useProviders();
  
  // Get selected provider
  const selectedProvider = useMemo(() => 
    providers.find(p => p.id === selectedProviderId),
    [providers, selectedProviderId]
  );
  
  // Handle provider selection
  const handleSelectProvider = (id: number) => {
    setSelectedProviderId(id);
  };
  
  // Handle edit button click
  const handleEditProvider = () => {
    if (selectedProvider) {
      startEditing(selectedProvider);
    }
  };

  // Handle model selection
  const handleModelSelect = (providerName: string, modelId: string) => {
    console.log(`Selected model: ${modelId} from provider: ${providerName}`);
    // Add your logic here to handle the selected model
  };

  const { colorMode } = useColorMode();
  const textColor = colorMode === 'light' ? 'gray.600' : 'gray.300';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.700';
  
  // Render based on connection status
  if (!isConnected) {
    return (
      <Center p={4}>
        <VStack gap={2}>
          <Text color={textColor}>Data Service is not connected</Text>
          <Text fontSize="sm" color={textColor}>Connect to the Data Service to manage providers</Text>
        </VStack>
      </Center>
    );
  }
  
  // Render loading state
  if (isLoading) {
    return (
      <Center p={4}>
        <Text color={textColor}>Loading providers...</Text>
      </Center>
    );
  }
  
  // Render error state
  if (isError) {
    return (
      <Center p={4}>
        <VStack gap={4}>
          <Text color="red.500">Error loading providers</Text>
          <Text fontSize="sm" color={textColor}>{error instanceof Error ? error.message : String(error)}</Text>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={async () => {
              const result = await checkDatabaseConnection();
              if (result.success) {
                alert(result.message);
              } else if (result.error) {
                alert(`Database error: ${result.error}`);
              }
            }}
          >
            Check Database Connection
          </Button>
        </VStack>
      </Center>
    );
  }
  
  return (
    <Flex direction="column" h="full">
      {/* Header */}
      <Flex 
        p={3} 
        borderBottom="1px" 
        borderColor={borderColor}
        justify="space-between" 
        align="center"
      >
        <Heading size="sm" color={textColor}>Providers</Heading>
        <Button
          size="sm"
          colorScheme="blue"
          onClick={startCreating}
        >
          Add Provider
        </Button>
      </Flex>
      
      {/* Content */}
      <Box flex="1" overflow="auto">
        {/* Provider Selection Dropdown */}
        {!isCreating && !isEditing && providers.length > 0 && (
          <Box p={4} borderBottom="1px" borderColor={borderColor}>
            <Text id="provider-select-label" fontSize="sm" color={textColor} mb={1}>
              Select Provider
            </Text>
            <ProviderSelect
              providers={providers}
              selectedProviderId={selectedProviderId}
              onChange={handleSelectProvider}
              className="w-full"
              aria-labelledby="provider-select-label"
            />
          </Box>
        )}
        
        {/* Provider Details */}
        {selectedProvider && !isCreating && !isEditing && (
          <ProviderDetails 
            provider={selectedProvider} 
            onEdit={handleEditProvider} 
          />
        )}
        
        {/* No Provider Selected Message */}
        {!selectedProvider && !isCreating && !isEditing && providers.length > 0 && (
          <Center p={4}>
            <Text color={textColor}>Select a provider to view details</Text>
          </Center>
        )}
        
        {/* Empty State */}
        {providers.length === 0 && !isCreating && !isEditing && (
          <Center p={4}>
            <VStack gap={2}>
              <Text color={textColor}>No providers configured</Text>
              <Text fontSize="sm" color={textColor}>Click "Add Provider" to create your first provider</Text>
            </VStack>
          </Center>
        )}
        
        {/* Create/Edit Form */}
        {(isCreating || isEditing) && (
          <ProviderForm 
            initialData={formData}
            isCreating={isCreating}
            onSubmit={() => {
              // Convert the data to the format expected by handleSubmit
              const event = { preventDefault: () => {} } as React.FormEvent;
              handleSubmit(event);
            }}
            onCancel={cancelForm}
            isSubmitting={isSubmitting}
            onModelSelect={handleModelSelect}
          />
        )}
      </Box>
    </Flex>
  );
} 