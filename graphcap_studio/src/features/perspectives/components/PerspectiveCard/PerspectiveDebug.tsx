// SPDX-License-Identifier: Apache-2.0
/**
 * PerspectiveDebug Component
 * 
 * A component for displaying debug information about a perspective,
 * including its data, options, and metadata.
 */
import React, { useEffect } from 'react';
import { 
  Box, 
  Text, 
  Stack, 
  Heading, 
  Badge 
} from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/theme/color-mode';
import { PerspectiveSchema, PerspectiveData } from '../../types';
import { ClipboardButton } from '@/components/ui/buttons';

interface PerspectiveDebugProps {
  readonly data: Record<string, any> | null;
  readonly schema: PerspectiveSchema;
}

/**
 * Component for displaying debug information about a perspective
 */
export function PerspectiveDebug({ data, schema }: PerspectiveDebugProps) {
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('blue.600', 'blue.300');
  const valueColor = useColorModeValue('gray.800', 'gray.200');
  const errorColor = useColorModeValue('red.500', 'red.300');
  const errorBgColor = useColorModeValue('red.50', 'red.900');

  // Log warnings for missing data
  useEffect(() => {
    if (data) {
      // Check for expected fields and throw errors in console
      if (!data.provider) {
        console.error(`MISSING DATA: Provider information absent for perspective ${schema.name}`);
      }
      if (!data.model) {
        console.error(`MISSING DATA: Model information absent for perspective ${schema.name}`);
      }
      if (!data.options) {
        console.error(`MISSING DATA: Generation options absent for perspective ${schema.name}`);
      } else if (Object.keys(data.options).length === 0) {
        console.warn(`NOTE: Options object is present but empty for perspective ${schema.name}`);
      }
    }
  }, [data, schema.name]);

  // Extract debug information - Cast to PerspectiveData if possible
  const perspectiveData = data as PerspectiveData | null;
  
  // Track missing data
  const missingFields = [];
  if (data) {
    if (!perspectiveData?.provider) missingFields.push('provider');
    if (!perspectiveData?.model) missingFields.push('model');
    if (!perspectiveData?.options) missingFields.push('options');
    if (!perspectiveData?.version) missingFields.push('version');
  }
  
  const debugInfo = data ? {
    // Metadata - do not provide defaults
    metadata: {
      provider: perspectiveData?.provider,
      model: perspectiveData?.model,
      version: perspectiveData?.version,
      config_name: perspectiveData?.config_name || schema.name,
      generatedAt: data.metadata?.timestamp 
        ? new Date(data.metadata.timestamp).toISOString() 
        : null,
    },
    // Generation options - directly from the PerspectiveData interface
    options: perspectiveData?.options || null,
    // Data stats
    stats: {
      dataType: typeof data,
      dataKeys: Object.keys(data),
      contentKeys: data.content ? Object.keys(data.content) : [],
      contentType: data.content ? typeof data.content : null,
    },
    // Content data
    content: data.content || null,
    // Missing data tracking
    missingFields,
    // Raw data for debugging
    rawData: data
  } : null;

  return (
    <Box position="relative">
      <Box position="absolute" top="0" right="0" zIndex="1">
        <ClipboardButton 
          content={debugInfo || 'No data'} 
          label="Copy debug info to clipboard" 
          size="xs" 
          iconOnly
        />
      </Box>

      {!debugInfo ? (
        <Box p={3} bg="red.500" color="white" borderRadius="md" fontWeight="bold">
          No debug data available!
        </Box>
      ) : (
        <Stack 
          gap={3} 
          direction="column"
          maxHeight="350px" 
          overflow="auto" 
          p={2}
        >
          {/* Missing data alert */}
          {debugInfo.missingFields.length > 0 && (
            <Box p={3} bg={errorBgColor} borderRadius="md" borderLeft="4px solid" borderColor={errorColor}>
              <Text fontWeight="bold" fontSize="sm" color={errorColor}>Missing Required Data!</Text>
              <Text fontSize="xs" color={errorColor}>
                The following fields are missing: {debugInfo.missingFields.join(', ')}
              </Text>
            </Box>
          )}

          {/* Metadata Section */}
          <Box>
            <Heading size="xs" mb={2} color={labelColor}>Perspective Metadata</Heading>
            <Stack direction="column" gap={1}>
              <Box display="flex" justifyContent="space-between">
                <Text fontSize="xs" color={labelColor}>Provider:</Text>
                {debugInfo.metadata.provider ? (
                  <Text fontSize="xs" color={valueColor}>{debugInfo.metadata.provider}</Text>
                ) : (
                  <Badge colorScheme="red" fontSize="xs">MISSING</Badge>
                )}
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Text fontSize="xs" color={labelColor}>Model:</Text>
                {debugInfo.metadata.model ? (
                  <Text fontSize="xs" color={valueColor}>{debugInfo.metadata.model}</Text>
                ) : (
                  <Badge colorScheme="red" fontSize="xs">MISSING</Badge>
                )}
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Text fontSize="xs" color={labelColor}>Version:</Text>
                {debugInfo.metadata.version ? (
                  <Text fontSize="xs" color={valueColor}>{debugInfo.metadata.version}</Text>
                ) : (
                  <Badge colorScheme="red" fontSize="xs">MISSING</Badge>
                )}
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Text fontSize="xs" color={labelColor}>Config:</Text>
                <Text fontSize="xs" color={valueColor}>{debugInfo.metadata.config_name}</Text>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Text fontSize="xs" color={labelColor}>Generated:</Text>
                {debugInfo.metadata.generatedAt ? (
                  <Text fontSize="xs" color={valueColor}>{debugInfo.metadata.generatedAt}</Text>
                ) : (
                  <Badge colorScheme="red" fontSize="xs">MISSING</Badge>
                )}
              </Box>
            </Stack>
          </Box>

          <Box height="1px" bg={borderColor} my={1} />

          {/* Options Section */}
          <Box>
            <Heading size="xs" mb={2} color={labelColor}>Generation Options</Heading>
            {!debugInfo.options ? (
              <Box p={2} bg={errorBgColor} borderRadius="md" borderLeft="4px solid" borderLeftColor={errorColor}>
                <Text fontSize="xs" color={errorColor} fontWeight="bold">
                  ERROR: GENERATION OPTIONS ARE MISSING
                </Text>
                <Text fontSize="xs" color={errorColor}>
                  All perspectives must include generation options!
                </Text>
              </Box>
            ) : Object.keys(debugInfo.options).length === 0 ? (
              <Box p={2} bg={useColorModeValue('yellow.50', 'yellow.900')} borderRadius="md" borderLeft="4px solid" borderLeftColor={useColorModeValue('yellow.500', 'yellow.300')}>
                <Text fontSize="xs" color={useColorModeValue('yellow.700', 'yellow.200')} fontWeight="bold">
                  NOTE: Options object is present but empty
                </Text>
                <Text fontSize="xs" color={useColorModeValue('yellow.600', 'yellow.200')}>
                  Options are saved correctly but no values were provided.
                </Text>
              </Box>
            ) : (
              <Stack direction="column" gap={1}>
                {Object.entries(debugInfo.options).map(([key, value]) => (
                  <Box key={key} display="flex" justifyContent="space-between">
                    <Text fontSize="xs" color={labelColor}>{key}:</Text>
                    <Text fontSize="xs" color={valueColor}>
                      {Array.isArray(value) 
                        ? value.join(', ') 
                        : String(value)}
                    </Text>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          <Box height="1px" bg={borderColor} my={1} />

          {/* Data Statistics */}
          <Box>
            <Heading size="xs" mb={2} color={labelColor}>Data Information</Heading>
            <Stack direction="column" gap={1}>
              <Box display="flex" justifyContent="space-between">
                <Text fontSize="xs" color={labelColor}>Data Type:</Text>
                <Badge fontSize="xs">{debugInfo.stats.dataType}</Badge>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Text fontSize="xs" color={labelColor}>Content Type:</Text>
                <Badge fontSize="xs">{debugInfo.stats.contentType || "MISSING"}</Badge>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Text fontSize="xs" color={labelColor}>Top-level Keys:</Text>
                <Text fontSize="xs" color={valueColor}>{debugInfo.stats.dataKeys.join(', ')}</Text>
              </Box>
              {debugInfo.stats.contentKeys.length > 0 && (
                <Box display="flex" justifyContent="space-between">
                  <Text fontSize="xs" color={labelColor}>Content Keys:</Text>
                  <Text fontSize="xs" color={valueColor}>{debugInfo.stats.contentKeys.join(', ')}</Text>
                </Box>
              )}
            </Stack>
          </Box>

          <Box height="1px" bg={borderColor} my={1} />

          {/* Raw Data Section */}
          <Box>
            <Heading size="xs" mb={2} color={labelColor}>Raw Data</Heading>
            <Box 
              as="pre" 
              fontSize="xs" 
              p={2} 
              bg={bgColor} 
              borderRadius="md" 
              border="1px" 
              borderColor={borderColor}
              overflowX="auto"
              whiteSpace="pre-wrap"
            >
              {JSON.stringify(debugInfo.rawData, null, 2)}
            </Box>
          </Box>
        </Stack>
      )}
    </Box>
  );
} 