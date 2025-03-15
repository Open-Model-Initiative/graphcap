// SPDX-License-Identifier: Apache-2.0
/**
 * PerspectiveCardTabbed Component
 * 
 * A card component for displaying a perspective with tabbed content for caption, prompt, and schema.
 * This component uses Chakra UI tabs for the tabbed interface.
 */

import { ReactNode, useState } from 'react';
import { 
  Card, 
  Box, 
  Text, 
  Flex, 
  Stack, 
  Badge, 
  Spinner,
  Button as ChakraButton,
  Tabs,
  Select
} from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/theme/color-mode';
import { LuRefreshCw, LuExternalLink, LuCopy, LuCheck } from 'react-icons/lu';
import { PerspectiveSchema } from '../types';
import { useClipboard } from '@/common/hooks/useClipboard';

export interface PerspectiveCardTabbedProps {
  readonly schema: PerspectiveSchema;
  readonly data: Record<string, any> | null;
  readonly isActive: boolean;
  readonly isGenerated: boolean;
  readonly onGenerate: () => void;
  readonly onSetActive: () => void;
  readonly providers?: Array<{ id: number; name: string }>;
  readonly isGenerating?: boolean;
  readonly selectedProviderId?: number | undefined;
  readonly onProviderChange: (providerId: number | undefined) => void;
  readonly className?: string;
}

/**
 * Card component for displaying a perspective with tabbed controls
 */
export function PerspectiveCardTabbed({
  schema,
  data,
  isActive,
  isGenerated,
  onGenerate,
  onSetActive,
  providers = [],
  isGenerating = false,
  selectedProviderId,
  onProviderChange,
  className = ''
}: PerspectiveCardTabbedProps) {
  const { copyToClipboard, hasCopied } = useClipboard();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const badgeBg = useColorModeValue('gray.100', 'gray.700');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const activeBorderColor = useColorModeValue('blue.500', 'blue.400');
  
  // Data handlers
  const handleCopy = () => {
    if (!data) return;
    
    const dataStr = typeof data === 'string' 
      ? data 
      : JSON.stringify(data, null, 2);
    
    copyToClipboard(dataStr);
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onProviderChange(value ? Number(value) : undefined);
  };
  
  return (
    <Card.Root 
      variant="outline" 
      borderColor={isActive ? activeBorderColor : borderColor}
      borderWidth="1px"
      borderLeftWidth={isActive ? "4px" : "1px"}
      overflow="hidden"
      className={className}
      onClick={onSetActive}
      cursor="pointer"
      transition="border-color 0.2s"
      _hover={{ borderColor: isActive ? activeBorderColor : useColorModeValue('gray.300', 'gray.600') }}
    >
      <Card.Header bg={useColorModeValue('gray.50', 'gray.800')} p={3}>
        <Flex justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Card.Title fontSize="md" fontWeight="medium">{schema.display_name}</Card.Title>
            <Badge 
              mt={2} 
              size="sm" 
              bg={badgeBg} 
              color={mutedTextColor} 
              borderRadius="full" 
              px={2} 
              py={0.5}
              fontSize="xs"
            >
              {schema.name}
            </Badge>
          </Box>
          
          <Flex gap={2}>
            {/* Copy button (visible when data exists) */}
            {data && (
              <ChakraButton
                size="xs"
                variant="ghost"
                colorScheme="gray"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                aria-label="Copy content"
              >
                {hasCopied ? <LuCheck /> : <LuCopy />}
              </ChakraButton>
            )}
            
            {/* Status indicator */}
            {isGenerating && (
              <Stack direction="row" gap={1} bg={useColorModeValue('gray.100', 'gray.700')} px={2} py={1} borderRadius="md" fontSize="xs">
                <Spinner size="xs" color="blue.500" />
                <Text>Processing</Text>
              </Stack>
            )}
          </Flex>
        </Flex>
      </Card.Header>
      
      {/* Content Area with Tabs */}
      <Box>
        <Tabs.Root 
          defaultValue={isGenerated ? "caption" : "prompt"} 
          variant="enclosed" 
          colorPalette="blue"
          onClick={(e) => e.stopPropagation()}
        >
          <Tabs.List 
            bg={useColorModeValue('gray.100', 'gray.700')} 
            px={2} 
            pt={2}
            width="100%"
          >
            <Tabs.Trigger value="caption" disabled={!isGenerated}>Caption</Tabs.Trigger>
            <Tabs.Trigger value="prompt">Prompt</Tabs.Trigger>
            <Tabs.Trigger value="schema">Schema</Tabs.Trigger>
            <Tabs.Trigger value="debug">Debug</Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>
          
          <Box bg={useColorModeValue('white', 'gray.900')} p={3}>
            <Tabs.Content value="caption">
              {data ? (
                <ContentView data={data} />
              ) : (
                <Box textAlign="center" py={4}>
                  <Text fontSize="sm" color={mutedTextColor} fontStyle="italic">
                    Generate this perspective to see caption
                  </Text>
                </Box>
              )}
            </Tabs.Content>
            
            <Tabs.Content value="prompt">
              <Box whiteSpace="pre-wrap" fontSize="sm" p={2} bg={useColorModeValue('gray.50', 'gray.800')} borderRadius="md">
                {schema.prompt}
              </Box>
            </Tabs.Content>
            
            <Tabs.Content value="schema">
              <SchemaView schema={schema} />
            </Tabs.Content>
            
            <Tabs.Content value="debug">
              <Box p={2} bg="gray.800" borderRadius="md" overflowX="auto">
                <Text fontSize="xs" fontWeight="bold" mb={2} color="yellow.300">Debug Information:</Text>
                <Box as="pre" fontSize="xs" whiteSpace="pre-wrap" color="green.300">
                  isGenerated: {String(isGenerated)}{'\n'}
                  Data type: {data ? typeof data : 'null'}{'\n'}
                  Data keys: {data ? Object.keys(data).join(', ') : 'none'}{'\n'}
                  Raw data: {data ? JSON.stringify(data, null, 2) : 'null'}
                </Box>
              </Box>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Box>
      
      {/* Action Bar - Always present */}
      <Card.Footer 
        bg={useColorModeValue('gray.50', 'gray.800')} 
        p={3} 
        borderTop="1px" 
        borderColor={borderColor}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        onClick={(e) => e.stopPropagation()}
      >
        <Stack direction="row" gap={2}>
          {isGenerated ? (
            <ChakraButton
              size="xs"
              variant="outline"
              colorScheme="gray"
              onClick={(e) => {
                e.stopPropagation();
                onGenerate();
              }}
              display="flex"
              alignItems="center"
              gap={2}
            >
              <LuRefreshCw />
              Regenerate
            </ChakraButton>
          ) : (
            <Text fontSize="xs" fontStyle="italic" color={mutedTextColor}>Not generated yet</Text>
          )}
        </Stack>
        
        {/* Provider Selection */}
        {providers.length > 0 && (
          <Stack direction="row" gap={2} alignItems="center">
            <select
              value={selectedProviderId?.toString() || ''}
              onChange={handleProviderChange}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                border: '1px solid',
                borderColor: useColorModeValue('var(--chakra-colors-gray-300)', 'var(--chakra-colors-gray-600)'),
                backgroundColor: useColorModeValue('white', 'var(--chakra-colors-gray-700)'),
                color: useColorModeValue('var(--chakra-colors-gray-800)', 'white')
              }}
            >
              <option value="">Default Provider</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id.toString()}>
                  {provider.name}
                </option>
              ))}
            </select>
            
            {!isGenerated && (
              <ChakraButton
                size="xs"
                variant="solid"
                colorScheme="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerate();
                }}
                disabled={isGenerating}
                display="flex"
                alignItems="center"
                gap={2}
              >
                {isGenerating ? (
                  <>
                    <Spinner size="xs" />
                    Generating...
                  </>
                ) : (
                  <>
                    <LuExternalLink />
                    Generate
                  </>
                )}
              </ChakraButton>
            )}
          </Stack>
        )}
      </Card.Footer>
    </Card.Root>
  );
}

interface ContentViewProps {
  readonly data: Record<string, any>;
}

function ContentView({ data }: ContentViewProps) {
  const fieldNameColor = useColorModeValue('gray.600', 'gray.400');
  
  // Debug the incoming data
  console.log("ContentView received data:", data);
  
  // Handle empty data
  if (!data || Object.keys(data).length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Text fontSize="sm" color="red.400" fontStyle="italic">
          Caption data is empty
        </Text>
      </Box>
    );
  }
  
  // Check if data is nested within 'content' or 'result' property (API might return either)
  let displayData = data;
  if (data.content && typeof data.content === 'object') {
    console.log("Unwrapping nested content object:", data.content);
    displayData = data.content;
  } else if (data.result && typeof data.result === 'object') {
    console.log("Unwrapping nested result object:", data.result);
    displayData = data.result;
  }
  
  return (
    <Stack direction="column" gap={3}>
      {Object.entries(displayData).map(([key, value]) => (
        <Box key={key}>
          <Text fontSize="xs" fontWeight="medium" color={fieldNameColor} mb={1}>
            {key.replace(/_/g, ' ')}
          </Text>
          <Text fontSize="sm" whiteSpace="pre-wrap">
            {typeof value === 'string' 
              ? value 
              : typeof value === 'object' && value !== null
                ? JSON.stringify(value, null, 2)
                : String(value)
            }
          </Text>
        </Box>
      ))}
    </Stack>
  );
}

interface SchemaViewProps {
  readonly schema: PerspectiveSchema;
}

function SchemaView({ schema }: SchemaViewProps) {
  const fieldNameColor = useColorModeValue('gray.600', 'gray.400');
  const fieldBgColor = useColorModeValue('gray.50', 'gray.800');
  
  return (
    <Stack direction="column" gap={3}>
      {schema.schema_fields.map((field) => (
        <Box key={field.name} p={2} bg={fieldBgColor} borderRadius="md">
          <Text fontSize="xs" fontWeight="medium" color={fieldNameColor} mb={1}>
            {field.description || field.name}
          </Text>
          <Text fontSize="sm" color={fieldNameColor}>
            Type: {field.type}
          </Text>
        </Box>
      ))}
    </Stack>
  );
} 