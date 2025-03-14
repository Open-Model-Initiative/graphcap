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
  Button, 
  Flex, 
  Stack, 
  Badge, 
  Spinner
} from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';
import { LuEye, LuRefreshCw, LuExternalLink } from 'react-icons/lu';

export interface PerspectiveCardProps {
  readonly title: string;
  readonly description: string;
  readonly type: string;
  readonly isActive: boolean;
  readonly isGenerated: boolean;
  readonly onGenerate: () => void;
  readonly onSetActive: () => void;
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
  isActive,
  isGenerated,
  onGenerate,
  onSetActive,
  children,
  providers = [],
  isGenerating = false,
  selectedProviderId,
  onProviderChange,
  className = ''
}: PerspectiveCardProps) {
  const borderColor = useColorModeValue('blue.500', 'blue.400');
  const inactiveBorderColor = useColorModeValue('gray.200', 'gray.700');
  const badgeBg = useColorModeValue('gray.100', 'gray.700');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  
  return (
    <Card.Root 
      variant="outline" 
      borderColor={isActive ? borderColor : inactiveBorderColor}
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
      {isActive && isGenerated && children && (
        <Card.Body bg={useColorModeValue('white', 'gray.900')} p={3} borderTop="1px" borderColor={inactiveBorderColor}>
          {children}
        </Card.Body>
      )}
      
      {/* Action Bar - Always present */}
      <Card.Footer 
        bg={useColorModeValue('gray.50', 'gray.800')} 
        p={3} 
        borderTop="1px" 
        borderColor={inactiveBorderColor}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack direction="row" gap={2}>
          {isGenerated ? (
            <Button
              size="xs"
              variant={isActive ? "solid" : "outline"}
              colorScheme={isActive ? "blue" : "gray"}
              onClick={onSetActive}
            >
              <LuEye style={{ marginRight: '4px' }} />
              {isActive ? 'Active' : 'View'}
            </Button>
          ) : (
            <Text fontSize="xs" fontStyle="italic" color={mutedTextColor}>Not generated yet</Text>
          )}
        </Stack>
        
        <Stack direction="row" gap={2}>
          {providers.length > 0 && (
            <select
              value={selectedProviderId || ''}
              onChange={onProviderChange}
              disabled={isGenerating}
              style={{
                fontSize: '0.75rem',
                backgroundColor: useColorModeValue('white', 'var(--chakra-colors-gray-700)'),
                color: useColorModeValue('var(--chakra-colors-gray-800)', 'var(--chakra-colors-gray-200)'),
                borderRadius: 'var(--chakra-radii-md)',
                borderColor: inactiveBorderColor,
                padding: '0.25rem 0.5rem',
                width: 'auto'
              }}
            >
              <option value="">Default Provider</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          )}
          
          <Button
            size="xs"
            colorScheme={isGenerated ? "green" : "blue"}
            onClick={onGenerate}
            disabled={isGenerating}
          >
            {isGenerated ? (
              <>
                <LuRefreshCw style={{ marginRight: '4px' }} />
                {isGenerating ? 'Regenerating...' : 'Regenerate'}
              </>
            ) : (
              <>
                <LuExternalLink style={{ marginRight: '4px' }} />
                {isGenerating ? 'Generating...' : 'Generate'}
              </>
            )}
          </Button>
        </Stack>
      </Card.Footer>
    </Card.Root>
  );
} 