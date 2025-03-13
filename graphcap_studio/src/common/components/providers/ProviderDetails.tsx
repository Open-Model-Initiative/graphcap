// SPDX-License-Identifier: Apache-2.0
import { memo, useCallback } from 'react';
import { Provider } from '../../../services/types/providers';
import { useDeleteProvider, useUpdateProviderApiKey } from '../../../features/inference/services/providers';
import {
  Box,
  Button,
  Flex,
  Stack,
  Text,
  Circle,
  List,
  Fieldset,
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
      <Fieldset.Root size="lg">
        <Stack>
          <Fieldset.Legend>{provider.name}</Fieldset.Legend>
          <Stack direction="row" gap={2} justify="flex-end">
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
        </Stack>

        <Fieldset.Content>
          <Stack direction="column" gap={3}>
            <Box>
              <Text fontSize="sm" color={labelColor}>Kind</Text>
              <Text color={textColor}>{provider.kind}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color={labelColor}>Environment</Text>
              <Text color={textColor}>{provider.environment}</Text>
            </Box>
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
              <Stack direction="row" gap={2}>
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
            <Box>
              <Text fontSize="sm" color={labelColor}>Status</Text>
              <Text color={textColor}>{provider.isEnabled ? 'Enabled' : 'Disabled'}</Text>
            </Box>
          </Stack>
        </Fieldset.Content>
      </Fieldset.Root>

      {/* Models Section */}
      <Fieldset.Root size="lg" mt={6}>
        <Fieldset.Legend>Models</Fieldset.Legend>
        <Fieldset.Content>
          {provider.models && provider.models.length > 0 ? (
            <List.Root variant="plain">
              {provider.models.map(model => (
                <List.Item key={model.id}>
                  <Flex justify="space-between" align="center">
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
        </Fieldset.Content>
      </Fieldset.Root>

      {/* Rate Limits Section */}
      <Fieldset.Root size="lg" mt={6}>
        <Fieldset.Legend>Rate Limits</Fieldset.Legend>
        <Fieldset.Content>
          {provider.rateLimits ? (
            <List.Root variant="plain">
              {provider.rateLimits.requestsPerMinute && (
                <List.Item>
                  <Text fontSize="sm" color={textColor}>
                    Requests per minute: {provider.rateLimits.requestsPerMinute}
                  </Text>
                </List.Item>
              )}
              {provider.rateLimits.tokensPerMinute && (
                <List.Item>
                  <Text fontSize="sm" color={textColor}>
                    Tokens per minute: {provider.rateLimits.tokensPerMinute}
                  </Text>
                </List.Item>
              )}
            </List.Root>
          ) : (
            <Text fontSize="sm" color={labelColor}>No rate limits configured</Text>
          )}
        </Fieldset.Content>
      </Fieldset.Root>
    </Box>
  );
}

export default memo(ProviderDetails); 