import {
  Box,
  Heading,
  Text,
} from "@chakra-ui/react";

interface ErrorDisplayProps {
  message: string;
}

/**
 * ErrorDisplay component displays an error message
 */
export function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <Box p={6}>
      <Box p={4} bg="red.100" color="red.800" borderRadius="md">
        <Heading size="md">Error</Heading>
        <Text mt={2}>{message}</Text>
      </Box>
    </Box>
  );
} 