// SPDX-License-Identifier: Apache-2.0
import { useProviderFormContext } from './context';
import {
  Button,
  Flex,
  HStack,
} from '@chakra-ui/react';
import { useColorMode } from '@/components/ui/theme/color-mode';

/**
 * Component for rendering form action buttons with Chakra UI styling
 */
export function FormActions() {
  const { 
    isSubmitting, 
    isCreating, 
    onCancel 
  } = useProviderFormContext();
  
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  
  // Determine the button text based on form state
  let buttonText = 'Save';
  if (isSubmitting) {
    buttonText = 'Saving...';
  } else if (isCreating) {
    buttonText = 'Create';
  }
  
  // Theme-based colors
  const cancelBg = isDark ? 'gray.700' : 'gray.100';
  const cancelHoverBg = isDark ? 'gray.600' : 'gray.200';
  const cancelColor = isDark ? 'gray.200' : 'gray.800';
  
  const primaryBg = isDark ? 'blue.500' : 'blue.500';
  const primaryHoverBg = isDark ? 'blue.600' : 'blue.600';
  
  return (
    <Flex justify="flex-end" mt={6}>
      <HStack gap={3}>
        <Button
          onClick={onCancel}
          size="md"
          bg={cancelBg}
          color={cancelColor}
          px={5}
          fontWeight="medium"
          _hover={{ 
            bg: cancelHoverBg,
            transform: 'translateY(-1px)'
          }}
          _active={{ 
            transform: 'translateY(0)'
          }}
          transition="all 0.2s ease-in-out"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isSubmitting}
          colorScheme="blue"
          bg={primaryBg}
          size="md"
          px={5}
          fontWeight="medium"
          boxShadow="sm"
          _hover={{ 
            bg: primaryHoverBg,
            transform: 'translateY(-1px)',
            boxShadow: 'md'
          }}
          _active={{ 
            transform: 'translateY(0)',
            boxShadow: 'sm',
            opacity: 0.9
          }}
          _disabled={{
            opacity: 0.6,
            cursor: 'not-allowed',
            _hover: { transform: 'none' }
          }}
          transition="all 0.2s ease-in-out"
        >
          {buttonText}
        </Button>
      </HStack>
    </Flex>
  );
} 