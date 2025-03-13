// SPDX-License-Identifier: Apache-2.0
/**
 * Generate All Button Component
 * 
 * This component displays a button to generate all perspectives.
 */

import { Button } from '@/common/ui';

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
    <div className="mt-4 flex justify-center">
      <Button
        variant="primary"
        size="md"
        isLoading={isLoading}
        disabled={isDisabled || isLoading}
        onClick={onGenerateAll}
        leftIcon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        }
      >
        {isLoading ? 'Generating All Perspectives...' : 'Generate All Perspectives'}
      </Button>
    </div>
  );
} 