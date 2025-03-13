// SPDX-License-Identifier: Apache-2.0
import { ChangeEvent } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import { Field } from '@/components/ui/field';
import { useProviderFormContext } from './context';
import {
  Box,
  Flex,
  Text,
  Spinner,
  Heading,
  Button,
} from '@chakra-ui/react';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValueText,
} from '@/components/ui/select';
import { createListCollection } from '@chakra-ui/react';
import { useColorMode } from '@/components/ui/color-mode';

// Define the model type
interface ProviderModel {
  id: string;
  name: string;
  is_default?: boolean;
}

// Define the model item type for the select component
interface ModelItem {
  label: string;
  value: string;
}

/**
 * Component for selecting a model from a provider
 */
export function ModelSelectionSection() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  
  const {
    providerName,
    selectedModelId,
    setSelectedModelId,
    providerModelsData,
    isLoadingModels,
    isModelsError,
    modelsError,
    handleModelSelect,
    isSubmitting
  } = useProviderFormContext();

  // Background and border colors based on theme
  const cardBg = isDark ? 'gray.800' : 'white';
  const borderColor = isDark ? 'gray.700' : 'gray.200';
  const headingColor = isDark ? 'gray.100' : 'gray.700';
  const labelColor = isDark ? 'gray.300' : 'gray.600';
  const buttonColorScheme = isDark ? 'blue' : 'blue';

  if (!providerName) {
    return (
      <Box bg={isDark ? 'gray.800' : 'yellow.50'} 
           borderWidth="1px" 
           borderColor={isDark ? 'yellow.700' : 'yellow.200'} 
           borderRadius="md"
           p={4}
      >
        <Flex align="center">
          <Box as={AlertCircle} w={5} h={5} mr={3} color={isDark ? 'yellow.400' : 'yellow.500'} />
          <Text color={isDark ? 'yellow.400' : 'yellow.700'}>
            Please enter a provider name to view available models.
          </Text>
        </Flex>
      </Box>
    );
  }
  
  if (isLoadingModels) {
    return (
      <Box bg={cardBg} 
           borderWidth="1px" 
           borderColor={borderColor} 
           borderRadius="md"
           p={4}
      >
        <Flex align="center" justify="center" py={2}>
          <Spinner size="sm" mr={3} color={isDark ? 'blue.400' : 'blue.500'} />
          <Text color={labelColor}>Loading models...</Text>
        </Flex>
      </Box>
    );
  }
  
  if (isModelsError) {
    return (
      <Box bg={isDark ? 'gray.800' : 'red.50'} 
           borderWidth="1px" 
           borderColor={isDark ? 'red.700' : 'red.200'} 
           borderRadius="md"
           p={4}
      >
        <Flex align="flex-start">
          <Box as={AlertCircle} w={5} h={5} mr={3} color={isDark ? 'red.400' : 'red.500'} />
          <Box>
            <Text fontWeight="medium" color={isDark ? 'red.300' : 'red.700'}>Error loading models</Text>
            <Text fontSize="sm" color={isDark ? 'red.300' : 'red.700'} mt={1} opacity={0.9}>
              {modelsError instanceof Error ? modelsError.message : 'Unknown error'}
            </Text>
          </Box>
        </Flex>
      </Box>
    );
  }
  
  if (!providerModelsData?.models || providerModelsData.models.length === 0) {
    return (
      <Box bg={isDark ? 'gray.800' : 'red.50'} 
           borderWidth="1px" 
           borderColor={isDark ? 'red.700' : 'red.200'} 
           borderRadius="md"
           p={4}
      >
        <Flex align="flex-start">
          <Box as={AlertCircle} w={5} h={5} mr={3} color={isDark ? 'red.400' : 'red.500'} />
          <Box>
            <Text fontWeight="medium" color={isDark ? 'red.300' : 'red.700'}>No models available</Text>
            <Text fontSize="sm" color={isDark ? 'red.300' : 'red.700'} mt={1} opacity={0.9}>
              This provider has no available models.
            </Text>
          </Box>
        </Flex>
      </Box>
    );
  }

  // Convert models to the format expected by SelectRoot
  const modelItems = providerModelsData.models.map((model: ProviderModel) => ({
    label: `${model.name}${model.is_default ? ' (Default)' : ''}`,
    value: model.id
  }));
  
  const modelCollection = createListCollection({
    items: modelItems
  });
  
  // Convert selectedModelId to string array format
  const value = selectedModelId ? [selectedModelId] : [];
  
  return (
    <Box>
      <Box bg={cardBg} 
           borderWidth="1px" 
           borderColor={borderColor} 
           borderRadius="md" 
           p={4}
           mb={4}
           boxShadow="sm"
      >
        <Heading as="h3" size="sm" mb={3} color={headingColor}>Model</Heading>
        <Text mb={2} fontSize="sm" color={labelColor}>Select a model to use with this provider</Text>
        <Field id="model">
          <SelectRoot
            collection={modelCollection}
            value={value}
            onValueChange={(details) => setSelectedModelId(details.value[0])}
          >
            <SelectTrigger>
              <SelectValueText placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {modelItems.map((item: ModelItem) => (
                <SelectItem key={item.value} item={item}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </Field>
      </Box>
      
      <Flex justify="flex-end" mt={4}>
        <Button 
          onClick={handleModelSelect}
          disabled={!selectedModelId}
          loading={isSubmitting}
          colorScheme={buttonColorScheme}
          size="md"
          variant="solid"
          px={6}
          fontWeight="medium"
          _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
          _active={{ transform: 'translateY(0)', boxShadow: 'sm' }}
          transition="all 0.2s"
        >
          Use Selected Model
        </Button>
      </Flex>
    </Box>
  );
} 