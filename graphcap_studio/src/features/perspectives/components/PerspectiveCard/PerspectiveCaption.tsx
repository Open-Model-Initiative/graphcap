// SPDX-License-Identifier: Apache-2.0
/**
 * PerspectiveCaption Component
 * 
 * This component allows users to select a perspective and generate captions for images.
 * It's been refactored to separate UI from logic using custom hooks.
 */

import { useState } from 'react';
import { 
  Box, 
  Button, 
  Flex, 
  Heading, 
  Text, 
  Stack, 
  Card,
  Spinner
} from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { useColorModeValue } from '@/components/ui/theme/color-mode';
import { useGeneratePerspectiveCaption, usePerspectives } from '@/features/perspectives/hooks';
import { Provider } from '@/features/inference/providers/types';
import { LuZap, LuTriangleAlert } from 'react-icons/lu';

export interface PerspectiveCaptionProps {
  readonly imagePath: string;
  readonly provider: Provider;
  readonly className?: string;
}

/**
 * Component for generating and displaying perspective captions
 */
export function PerspectiveCaption({ 
  imagePath, 
  provider,
  className = ''
}: PerspectiveCaptionProps) {
  // State
  const [selectedPerspective, setSelectedPerspective] = useState<string>('');
  const [caption, setCaption] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Data fetching
  const { data: perspectivesData, isLoading: perspectivesLoading } = usePerspectives();
  const generateCaption = useGeneratePerspectiveCaption();
  
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const resultBgColor = useColorModeValue('gray.50', 'gray.900');
  const fieldNameColor = useColorModeValue('gray.600', 'gray.400');
  const errorBgColor = useColorModeValue('red.50', 'rgba(254, 178, 178, 0.16)');
  const errorBorderColor = useColorModeValue('red.300', 'red.500');
  const errorTextColor = useColorModeValue('red.600', 'red.300');
  
  // Event handlers
  const handlePerspectiveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPerspective(e.target.value);
    setCaption(null);
    setError(null);
  };
  
  const handleGenerateCaption = async () => {
    if (!selectedPerspective || !imagePath) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const options = {
        temperature: 0.7,
        max_tokens: 4096
      };
      
      const result = await generateCaption.mutateAsync({
        imagePath,
        perspective: selectedPerspective,
        provider: provider.name,
        options
      });
      
      setCaption(result.result);
    } catch (err) {
      console.error('Error generating caption:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate caption');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box mt={4} className={className}>
      <Heading as="h3" size="sm" fontWeight="medium" mb={2}>
        Generate Perspective Caption
      </Heading>
      
      <Stack direction="column" gap={3}>
        {/* Perspective selection */}
        <Field.Root>
          <Field.Label htmlFor="perspective-select" fontSize="xs" color={labelColor}>
            Select Perspective
          </Field.Label>
          <select
            id="perspective-select"
            value={selectedPerspective}
            onChange={handlePerspectiveChange}
            disabled={perspectivesLoading}
            style={{
              width: '100%',
              backgroundColor: useColorModeValue('white', 'var(--chakra-colors-gray-700)'),
              color: useColorModeValue('var(--chakra-colors-gray-800)', 'white'),
              fontSize: '0.875rem',
              borderRadius: 'var(--chakra-radii-md)',
              padding: '0.5rem 0.75rem',
              border: `1px solid ${useColorModeValue('var(--chakra-colors-gray-200)', 'var(--chakra-colors-gray-600)')}`,
              outline: 'none'
            }}
          >
            <option value="">Select a perspective...</option>
            {perspectivesData?.map((perspective) => (
              <option key={perspective.name} value={perspective.name}>
                {perspective.display_name}
              </option>
            ))}
          </select>
        </Field.Root>
        
        {/* Generate button */}
        <Box>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={handleGenerateCaption}
            disabled={!selectedPerspective || loading || !imagePath}
            width={{ base: 'full', sm: 'auto' }}
          >
            {loading ? (
              <>
                <Spinner size="xs" mr={2} />
                Generating...
              </>
            ) : (
              <>
                <LuZap style={{ marginRight: '8px' }} />
                Generate Caption
              </>
            )}
          </Button>
        </Box>
        
        {/* Error message */}
        {error && (
          <Flex 
            alignItems="center" 
            bg={errorBgColor} 
            borderLeft="4px" 
            borderColor={errorBorderColor} 
            borderRadius="md" 
            p={2}
          >
            <LuTriangleAlert color={errorTextColor} style={{ marginRight: '8px' }} />
            <Text fontSize="xs" color={errorTextColor}>{error}</Text>
          </Flex>
        )}
        
        {/* Caption result */}
        {caption && (
          <Card.Root variant="outline" mt={2} borderColor={borderColor}>
            <Card.Body p={3} bg={resultBgColor}>
              <Stack direction="column" gap={3}>
                {Object.entries(caption).map(([key, value]) => (
                  <Box key={key}>
                    <Text fontSize="xs" fontWeight="medium" color={fieldNameColor} mb={1}>
                      {key}
                    </Text>
                    <Text fontSize="sm" whiteSpace="pre-wrap">
                      {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                    </Text>
                  </Box>
                ))}
              </Stack>
            </Card.Body>
          </Card.Root>
        )}
      </Stack>
    </Box>
  );
} 