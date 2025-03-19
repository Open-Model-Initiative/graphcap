import type { Perspective, PerspectiveModule } from "@/features/perspectives/types";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";

interface ModuleListProps {
  module: PerspectiveModule;
}

/**
 * ModuleList component displays a list of perspectives from a specific module
 */
export function ModuleList({ module }: ModuleListProps) {
  if (module.perspectives.length === 0) {
    return <Text color="gray.500">No perspectives found in this module.</Text>;
  }

  return (
    <VStack gap={3} align="stretch" width="100%">
      {module.perspectives.map((perspective: Perspective) => (
        <Box
          key={perspective.name}
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          p={3}
          width="100%"
        >
          <Flex justifyContent="space-between" alignItems="center" mb={2}>
            <Heading size="sm" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
              {perspective.display_name || perspective.name}
            </Heading>
            <Badge colorScheme="blue" fontSize="xs">{perspective.version}</Badge>
          </Flex>
          <Text fontSize="xs" mb={2} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
            {perspective.schema?.prompt?.substring(0, 60) || "No prompt available"}...
          </Text>
          {perspective.name && (
            <Link 
              to="/perspectives/module/$moduleName/perspective/$perspectiveName"
              params={{ 
                moduleName: module.name,
                perspectiveName: perspective.name.includes("/") 
                  ? perspective.name.split("/").pop() || perspective.name
                  : perspective.name
              }}
            >
              <Button
                size="xs" 
                colorScheme="blue" 
                variant="outline"
                width="100%"
              >
                View Details
              </Button>
            </Link>
          )}
        </Box>
      ))}
    </VStack>
  );
} 