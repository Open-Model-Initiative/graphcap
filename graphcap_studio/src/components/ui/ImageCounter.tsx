// SPDX-License-Identifier: Apache-2.0
import { Text } from "@chakra-ui/react";

interface ImageCounterProps {
  readonly currentIndex: number;
  readonly totalImages: number;
  readonly className?: string;
}

/**
 * A component for displaying the current image position in a collection
 */
export function ImageCounter({
  currentIndex,
  totalImages,
  className = '',
}: ImageCounterProps) {
  if (totalImages <= 0) {
    return null;
  }

  return (
    <Text fontSize="xs" color="gray.400" className={className}>
      {currentIndex} / {totalImages}
    </Text>
  );
} 