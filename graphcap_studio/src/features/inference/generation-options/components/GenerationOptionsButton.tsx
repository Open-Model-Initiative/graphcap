// SPDX-License-Identifier: Apache-2.0
/**
 * Generation Options Button
 * 
 * This component provides a button that triggers the generation options popover.
 */

import React from 'react';
import { Button } from '@/components/ui';
import { useGenerationOptions } from '../context';
import { GenerationOptionsPopover } from './GenerationOptionsPopover';

interface GenerationOptionsButtonProps {
  readonly label?: React.ReactNode;
  readonly size?: 'xs' | 'sm' | 'md' | 'lg';
  readonly variant?: 'solid' | 'outline' | 'ghost';
}

/**
 * Button component for triggering generation options popover
 */
export function GenerationOptionsButton({
  label = 'Options',
  size = 'sm',
  variant = 'outline'
}: GenerationOptionsButtonProps) {
  const { togglePopover, isGenerating } = useGenerationOptions();
  
  return (
    <GenerationOptionsPopover>
      <Button
        onClick={togglePopover}
        disabled={isGenerating}
        size={size}
        variant={variant}
      >
        {label}
      </Button>
    </GenerationOptionsPopover>
  );
} 