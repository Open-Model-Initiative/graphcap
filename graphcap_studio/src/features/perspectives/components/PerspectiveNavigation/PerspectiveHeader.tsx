// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Header Component
 * 
 * This component displays the header for a specific perspective with navigation controls.
 */

import { Box, Flex, Text, HStack, IconButton } from '@chakra-ui/react';
import { LoadingSpinner } from '@/components/ui/status/LoadingSpinner';
import { useColorModeValue } from '@/components/ui/theme/color-mode';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

interface PerspectiveHeaderProps {
  readonly isLoading: boolean;
  readonly currentPerspectiveName: string;
  readonly totalPerspectives: number;
  readonly currentIndex: number;
  readonly onNavigate: (index: number) => void;
}

/**
 * Header component for a specific perspective with navigation controls
 */
export function PerspectiveHeader({ 
  isLoading, 
  currentPerspectiveName,
  totalPerspectives,
  currentIndex,
  onNavigate
}: PerspectiveHeaderProps) {
  const textColor = useColorModeValue('gray.800', 'gray.200');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };
  
  const handleNext = () => {
    if (currentIndex < totalPerspectives - 1) {
      onNavigate(currentIndex + 1);
    }
  };
  
  return (
    <Box 
      position="sticky" 
      top={0} 
      bg={bgColor} 
      pt={2} 
      pb={2} 
      px={4}
      zIndex={10}
      borderBottomWidth="1px"
      borderColor={borderColor}
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Text fontSize="md" fontWeight="medium" color={textColor}>
          {currentPerspectiveName}
        </Text>
        
        <Flex alignItems="center" gap={4}>
          {isLoading && (
            <Flex alignItems="center" gap={2}>
              <LoadingSpinner size="sm" color="primary" className="h-3 w-3" />
              <Text fontSize="xs" color={mutedColor}>
                Processing...
              </Text>
            </Flex>
          )}
          
          {totalPerspectives > 1 && (
            <HStack gap={2}>
              <Text fontSize="sm" color={mutedColor}>
                {currentIndex + 1} of {totalPerspectives}
              </Text>
              
              <IconButton
                aria-label="Previous perspective"
                size="sm"
                variant="ghost"
                disabled={isLoading || currentIndex === 0}
                onClick={handlePrevious}
              >
                <LuChevronLeft />
              </IconButton>
              
              <IconButton
                aria-label="Next perspective"
                size="sm"
                variant="ghost"
                disabled={isLoading || currentIndex === totalPerspectives - 1}
                onClick={handleNext}
              >
                <LuChevronRight />
              </IconButton>
            </HStack>
          )}
        </Flex>
      </Flex>
    </Box>
  );
} 