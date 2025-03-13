// SPDX-License-Identifier: Apache-2.0
import { useMemo } from 'react';
import { useProviders } from '../services/providers';
import { useDatabaseHealth, useProviderForm } from '../hooks';
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
  const { isConnected } = useDatabaseHealth();
  const { 
    isCreating, 
    isEditing, 
    selectedProviderId, 
    setSelectedProviderId,
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

  // Loading state
  if (isLoading) {
    return (
      <Center p={4}>
        <Text color={textColor}>Loading providers...</Text>
      </Center>
    );
  }

  // Error state
  if (isError) {
    return (
      <Center p={4}>
        <Text color="red.500">Error loading providers: {error?.message}</Text>
      </Center>
    );
  }

  // No providers state
  if (providers.length === 0 && !isCreating) {
    return (
      <VStack p={4} gap={4}>
        <Text color={textColor}>No providers configured</Text>
        <Button
          colorScheme="blue"
          onClick={startCreating}
        >
          Add Provider
        </Button>
      </VStack>
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
        gap={4}
      >
        {/* Provider Selection Dropdown */}
        {!isCreating && providers.length > 0 && (
          <Box flex="1">
            <ProviderSelect
              providers={providers}
              selectedProviderId={selectedProviderId}
              onChange={handleSelectProvider}
              className="w-full"
              aria-label="Select Provider"
            />
          </Box>
        )}
        <Button
          size="sm"
          colorScheme="blue"
          onClick={startCreating}
          disabled={isCreating || isEditing}
        >
          Add Provider
        </Button>
      </Flex>
      
      {/* Content */}
      <Box flex="1" overflow="auto">
        {/* Provider Form */}
        {(isCreating || selectedProvider) && (
          <ProviderForm
            provider={selectedProvider}
            isEditing={isCreating || isEditing}
            onEdit={handleEditProvider}
            onSubmit={cancelForm}
            onCancel={cancelForm}
            isSubmitting={isSubmitting}
            onModelSelect={handleModelSelect}
          />
        )}
        
        {/* No Provider Selected Message */}
        {!selectedProvider && !isCreating && providers.length > 0 && (
          <Center p={4}>
            <Text color={textColor}>Select a provider to view details</Text>
          </Center>
        )}
      </Box>
    </Flex>
  );
} 