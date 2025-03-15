// SPDX-License-Identifier: Apache-2.0
/**
 * PerspectiveCard Component
 * 
 * A card component for displaying a perspective with controls.
 * This is a presentational component that receives all data and callbacks as props.
 */

import { ReactNode } from 'react';
import { 
  Card, 
  Box, 
  Text, 
  Flex, 
  Stack, 
  Badge, 
  Spinner,
  Button as ChakraButton
} from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/theme/color-mode';
import { LuRefreshCw, LuExternalLink } from 'react-icons/lu';

export interface PerspectiveCardProps {
  readonly title: string;
  readonly description: string;
  readonly type: string;
  readonly isGenerated: boolean;
  readonly onGenerate: () => void;
  readonly children?: ReactNode;
  readonly providers?: Array<{ id: number; name: string }>;
  readonly isGenerating?: boolean;
  readonly selectedProviderId?: number | undefined;
  readonly onProviderChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  readonly className?: string;
}

/**
 * Card component for displaying a perspective with controls
 */
export function PerspectiveCard({
  title,
  description,
  type,
  isGenerated,
  onGenerate,
  children,
  providers = [],
  isGenerating = false,
  selectedProviderId,
  onProviderChange,
  className = ''
}: PerspectiveCardProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const badgeBg = useColorModeValue('gray.100', 'gray.700');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  
  return (
    <Card.Root 
      variant="outline" 
      borderColor={borderColor}
      borderWidth="1px"
      overflow="hidden"
      className={className}
    >
      <Card.Header bg={useColorModeValue('gray.50', 'gray.800')} p={3}>
        <Flex justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Card.Title fontSize="md" fontWeight="medium">{title}</Card.Title>
            <Text fontSize="xs" color={mutedTextColor} mt={1}>{description}</Text>
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
              {type}
            </Badge>
          </Box>
          
          {/* Status indicator */}
          {isGenerating && (
            <Stack direction="row" gap={1} bg={useColorModeValue('gray.100', 'gray.700')} px={2} py={1} borderRadius="md" fontSize="xs">
              <Spinner size="xs" color="blue.500" />
              <Text>Processing</Text>
            </Stack>
          )}
        </Flex>
      </Card.Header>
      
      {/* Content Area */}
      {isGenerated && children && (
        <Card.Body bg={useColorModeValue('white', 'gray.900')} p={3} borderTop="1px" borderColor={borderColor}>
          {children}
        </Card.Body>
      )}
      
      {/* Action Bar - Always present */}
      <Card.Footer 
        bg={useColorModeValue('gray.50', 'gray.800')} 
        p={3} 
        borderTop="1px" 
        borderColor={borderColor}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack direction="row" gap={2}>
          {isGenerated ? (
            <ChakraButton
              size="xs"
              variant="outline"
              colorScheme="gray"
              onClick={onGenerate}
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
              value={selectedProviderId || ''}
              onChange={onProviderChange}
              className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option value="">Default Provider</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
            
            {!isGenerated && (
              <ChakraButton
                size="xs"
                variant="solid"
                colorScheme="blue"
                onClick={onGenerate}
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