// SPDX-License-Identifier: Apache-2.0
import { Box, Spinner, Text } from "@chakra-ui/react";

interface LoadingMessageProps {
  readonly isSubmitting: boolean;
  readonly saveSuccess: boolean;
}

export function LoadingMessage({ isSubmitting, saveSuccess }: LoadingMessageProps) {
  if (!isSubmitting && !saveSuccess) return null;

  return (
    <Box mt={4}>
      {isSubmitting && (
        <Box
          p={2}
          bg="blue.50"
          color="blue.800"
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={2}
        >
          <Spinner size="sm" />
          <Text>Saving changes...</Text>
        </Box>
      )}

      {!isSubmitting && saveSuccess && (
        <Box
          p={2}
          bg="green.100"
          color="green.800"
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text>Provider saved successfully!</Text>
        </Box>
      )}
    </Box>
  );
} 