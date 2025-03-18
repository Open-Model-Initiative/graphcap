import { useColorModeValue } from "@/components/ui/theme/color-mode";
import type { PerspectiveModule } from "@/features/perspectives/types";
import {
  Badge,
  Box,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";

interface ModuleInfoProps {
  module: PerspectiveModule;
}

/**
 * ModuleInfo component displays information about a perspective module
 */
export function ModuleInfo({ module }: ModuleInfoProps) {
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <>
      <Flex alignItems="center" mb={4} gap={3}>
        <Heading size="lg">{module.name}</Heading>
        <Badge colorScheme={module.enabled ? "green" : "red"}>
          {module.enabled ? "Enabled" : "Disabled"}
        </Badge>
      </Flex>

      <Box borderBottom="1px solid" borderColor={borderColor} mb={4} />

      <Box mb={6}>
        <Heading size="md" mb={3}>
          Module Information
        </Heading>
        <Text mb={2}>
          This module contains {module.perspectives.length}{" "}
          perspectives.
        </Text>
      </Box>
    </>
  );
} 