// SPDX-License-Identifier: Apache-2.0
/**
 * Generate All Button Component
 * 
 * This component displays a button to generate all perspectives.
 */

import { Button, Center, Spinner } from '@chakra-ui/react';
import { LuDownload } from 'react-icons/lu';

interface GenerateAllButtonProps {
  readonly isLoading: boolean;
  readonly isDisabled: boolean;
  readonly onGenerateAll: () => void;
}

/**
 * Button component for generating all perspectives
 */
export function GenerateAllButton({ 
  isLoading, 
  isDisabled, 
  onGenerateAll 
}: GenerateAllButtonProps) {
  return (
    <Center mt={4}>
      <Button
        colorScheme="blue"
        size="md"
        onClick={onGenerateAll}
        disabled={isDisabled || isLoading}
        width={{ base: 'full', sm: 'auto' }}
      >
        {isLoading ? (
          <>
            <Spinner size="xs" mr={2} />
            Generating All Perspectives...
          </>
        ) : (
          <>
            <LuDownload style={{ marginRight: '8px' }} />
            Generate All Perspectives
          </>
        )}
      </Button>
    </Center>
  );
} 