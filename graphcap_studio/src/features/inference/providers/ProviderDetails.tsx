// SPDX-License-Identifier: Apache-2.0
import { memo, useCallback } from 'react';
import { Provider } from './types';
import { useDeleteProvider, useUpdateProviderApiKey } from '../services/providers';
import {
  Box,
  Button,
  Flex,
  Stack,
  Text,
  Circle,
  List,
  Accordion,
  Span,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { useColorMode } from '@/components/ui/color-mode';

type ProviderDetailsProps = {
  readonly provider: Provider;
  readonly onEdit: () => void;
};

/**
 * Component for displaying provider details
 */
function ProviderDetails({ provider, onEdit }: ProviderDetailsProps) {
  const deleteProvider = useDeleteProvider();
  const updateApiKey = useUpdateProviderApiKey();
  const { colorMode } = useColorMode();
  
  const textColor = colorMode === 'light' ? 'gray.600' : 'gray.300';
  const labelColor = colorMode === 'light' ? 'gray.500' : 'gray.400';
  const bgColor = colorMode === 'light' ? 'gray.50' : 'gray.800';
  
  const handleDelete = useCallback(() => {
    if (confirm(`Are you sure you want to delete ${provider.name}?`)) {
      deleteProvider.mutate(provider.id);
    }
  }, [provider.id, provider.name, deleteProvider]);
  
  const handleUpdateApiKey = useCallback(() => {
    const apiKey = prompt('Enter new API key:');
    if (apiKey) {
      updateApiKey.mutate({ id: provider.id, apiKey });
    }
  }, [provider.id, updateApiKey]);
  
  return (
    <Box p={4}>
      {/* Header with Status */}
      <Flex mb={6} justify="space-between" align="center">
        <Stack direction="row" align="center" gap={3}>
          <Text fontSize="xl" fontWeight="medium" color={textColor}>
            {provider.name}
          </Text>
          <Circle 
            size="3" 
            bg={provider.isEnabled ? 'green.500' : 'gray.300'} 
          />
          <Text fontSize="sm" color={labelColor}>
            {provider.isEnabled ? 'Enabled' : 'Disabled'}
          </Text>
        </Stack>
        <Stack direction="row" gap={2}>
          <Button
            size="sm"
            variant="outline"
            colorScheme="gray"
            onClick={onEdit}
          >
            Edit
          </Button>
          <Button
            size="sm"
            colorScheme="red"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Stack>
      </Flex>

      <Accordion.Root defaultValue={['basic']} multiple>
        {/* Basic Details */}
        <Accordion.Item value="basic">
          <Accordion.ItemTrigger>
            <Span flex="1">Basic Information</Span>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Accordion.ItemBody>
              <Stack gap={4} bg={bgColor} p={4} borderRadius="md">
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem>
                    <Text fontSize="sm" color={labelColor}>Kind</Text>
                    <Text color={textColor}>{provider.kind}</Text>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="sm" color={labelColor}>Environment</Text>
                    <Text color={textColor}>{provider.environment}</Text>
                  </GridItem>
                </Grid>
              </Stack>
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>

        {/* Connection Details */}
        <Accordion.Item value="connection">
          <Accordion.ItemTrigger>
            <Span flex="1">Connection Details</Span>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Accordion.ItemBody>
              <Stack gap={4} bg={bgColor} p={4} borderRadius="md">
                <Box>
                  <Text fontSize="sm" color={labelColor}>Base URL</Text>
                  <Text color={textColor} wordBreak="break-all">{provider.baseUrl}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color={labelColor}>Environment Variable</Text>
                  <Text color={textColor}>{provider.envVar}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color={labelColor}>API Key</Text>
                  <Stack direction="row" gap={2} align="center">
                    <Text color={textColor}>{provider.apiKey ? '••••••••' : 'Not set'}</Text>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="gray"
                      onClick={handleUpdateApiKey}
                    >
                      Update
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>

        {/* Models Section */}
        <Accordion.Item value="models">
          <Accordion.ItemTrigger>
            <Span flex="1">Models</Span>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Accordion.ItemBody>
              <Box bg={bgColor} p={4} borderRadius="md">
                {provider.models && provider.models.length > 0 ? (
                  <List.Root variant="plain">
                    {provider.models.map(model => (
                      <List.Item key={model.id}>
                        <Flex justify="space-between" align="center" py={2}>
                          <Text fontSize="sm" color={textColor}>{model.name}</Text>
                          <Circle 
                            size="2" 
                            bg={model.isEnabled ? 'green.500' : 'gray.300'} 
                          />
                        </Flex>
                      </List.Item>
                    ))}
                  </List.Root>
                ) : (
                  <Text fontSize="sm" color={labelColor}>No models configured</Text>
                )}
              </Box>
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>

        {/* Rate Limits Section */}
        <Accordion.Item value="rateLimits">
          <Accordion.ItemTrigger>
            <Span flex="1">Rate Limits</Span>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Accordion.ItemBody>
              <Box bg={bgColor} p={4} borderRadius="md">
                {provider.rateLimits ? (
                  <List.Root variant="plain">
                    {provider.rateLimits.requestsPerMinute && (
                      <List.Item>
                        <Text fontSize="sm" color={textColor} py={2}>
                          Requests per minute: {provider.rateLimits.requestsPerMinute}
                        </Text>
                      </List.Item>
                    )}
                    {provider.rateLimits.tokensPerMinute && (
                      <List.Item>
                        <Text fontSize="sm" color={textColor} py={2}>
                          Tokens per minute: {provider.rateLimits.tokensPerMinute}
                        </Text>
                      </List.Item>
                    )}
                  </List.Root>
                ) : (
                  <Text fontSize="sm" color={labelColor}>No rate limits configured</Text>
                )}
              </Box>
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </Box>
  );
}

export default memo(ProviderDetails); 