// SPDX-License-Identifier: Apache-2.0
/**
 * PerspectiveDebug Component
 * 
 * A component for displaying debug information about a perspective,
 * including its data, options, and metadata.
 */
import { useEffect } from 'react';
import { Box, Stack } from '@chakra-ui/react';
import { PerspectiveSchema, PerspectiveData } from '../../types';
import { ClipboardButton } from '@/components/ui/buttons';
import {
  MissingDataAlert,
  MetadataSection,
  OptionsSection,
  DataStatistics,
  RawDataSection,
  Separator
} from './debug-fields';

interface PerspectiveDebugProps {
  readonly data: Record<string, any> | null;
  readonly schema: PerspectiveSchema;
}

/**
 * Process perspective data to create debug information
 */
function processDebugInfo(data: Record<string, any> | null, schema: PerspectiveSchema) {
  if (!data) return null;
  
  // Extract debug information - Cast to PerspectiveData if possible
  const perspectiveData = data as PerspectiveData | null;
  
  // Track missing data
  const missingFields = [];
  if (!perspectiveData?.provider) missingFields.push('provider');
  if (!perspectiveData?.model) missingFields.push('model');
  if (!perspectiveData?.options) missingFields.push('options');
  if (!perspectiveData?.version) missingFields.push('version');
  
  return {
    // Metadata - do not provide defaults
    metadata: {
      provider: perspectiveData?.provider,
      model: perspectiveData?.model,
      version: perspectiveData?.version,
      config_name: perspectiveData?.config_name ?? schema.name,
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
  };
}

/**
 * Component for displaying debug information about a perspective
 */
export function PerspectiveDebug({ data, schema }: PerspectiveDebugProps) {
  // Log warnings for missing data
  useEffect(() => {
    if (!data) return;
    
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
  }, [data, schema.name]);

  const debugInfo = processDebugInfo(data, schema);

  if (!debugInfo) {
    return (
      <Box p={3} bg="red.500" color="white" borderRadius="md" fontWeight="bold">
        No debug data available!
      </Box>
    );
  }

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

      <Stack 
        gap={3} 
        direction="column"
        maxHeight="350px" 
        overflow="auto" 
        p={2}
      >
        <MissingDataAlert missingFields={debugInfo.missingFields} />
        <MetadataSection metadata={debugInfo.metadata} />
        <Separator />
        <OptionsSection options={debugInfo.options} />
        <Separator />
        <DataStatistics stats={debugInfo.stats} />
        <Separator />
        <RawDataSection data={debugInfo.rawData} />
      </Stack>
    </Box>
  );
} 