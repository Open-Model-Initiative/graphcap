// SPDX-License-Identifier: Apache-2.0
import { Field } from '@/components/ui/field';
import {
  Box,
  Heading,
  Text,
  createListCollection
} from '@chakra-ui/react';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValueText,
} from '@/components/ui/select';
import { useColorMode } from '@/components/ui/color-mode';

// Define the model item type for the select component
export interface ModelItem {
  label: string;
  value: string;
}

export interface ModelSelectorProps {
  modelItems: ModelItem[];
  selectedModelId: string | null;
  setSelectedModelId: (id: string) => void;
}

/**
 * Component for selecting a model from a list
 */
export function ModelSelector({ 
  modelItems, 
  selectedModelId, 
  setSelectedModelId
}: ModelSelectorProps) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  
  const cardBg = isDark ? 'gray.800' : 'white';
  const borderColor = isDark ? 'gray.700' : 'gray.200';
  const headingColor = isDark ? 'gray.100' : 'gray.700';
  const labelColor = isDark ? 'gray.300' : 'gray.600';
  
  const modelCollection = createListCollection({
    items: modelItems
  });
  
  // Convert selectedModelId to string array format
  const value = selectedModelId ? [selectedModelId] : [];
  
  return (
    <Box 
      bg={cardBg} 
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
  );
} 