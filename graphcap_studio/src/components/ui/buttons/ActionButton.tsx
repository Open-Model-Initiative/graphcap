// SPDX-License-Identifier: Apache-2.0
import {
  Flex,
  Button,
} from '@chakra-ui/react';

export interface ActionButtonProps {
  readonly onClick: () => void;
  readonly disabled: boolean;
  readonly isLoading: boolean;
  readonly label?: string;
}

/**
 * Component for action buttons with consistent styling
 */
export function ActionButton({ 
  onClick, 
  disabled, 
  isLoading, 
  label = 'Use Selected Model'
}: ActionButtonProps) {

  
  return (
    <Flex justify="flex-end" mt={4}>
      <Button 
        onClick={onClick}
        disabled={disabled}
        loading={isLoading}
        colorScheme="blue"
        size="md"
        variant="solid"
        px={6}
        fontWeight="medium"
        _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
        _active={{ transform: 'translateY(0)', boxShadow: 'sm' }}
        transition="all 0.2s"
      >
        {label}
      </Button>
    </Flex>
  );
} 