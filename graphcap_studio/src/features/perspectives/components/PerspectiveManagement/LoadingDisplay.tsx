import {
  Box,
  Spinner,
  Text,
} from "@chakra-ui/react";

interface LoadingDisplayProps {
  message?: string;
}

/**
 * LoadingDisplay component shows a loading spinner with an optional message
 */
export function LoadingDisplay({ message = "Loading..." }: LoadingDisplayProps) {
  return (
    <Box p={6} textAlign="center">
      <Spinner size="xl" />
      <Text mt={4}>{message}</Text>
    </Box>
  );
} 