// SPDX-License-Identifier: Apache-2.0
import { Box, Heading, Text } from "@chakra-ui/react";
import { ReactNode } from "react";

interface SetupSectionProps {
  readonly title: string;
  readonly description: string;
  readonly children?: ReactNode;
}

export function SetupSection({ title, description, children }: SetupSectionProps) {
  return (
    <Box>
      <Heading as="h3" size="sm" mb={2}>
        {title}
      </Heading>
      <Text mb={4} color="gray.600" fontSize="sm" _dark={{ color: "gray.300" }}>
        {description}
      </Text>
      <Box pl={2} borderLeftWidth="2px" borderLeftColor="blue.200">
        {children}
      </Box>
    </Box>
  );
} 