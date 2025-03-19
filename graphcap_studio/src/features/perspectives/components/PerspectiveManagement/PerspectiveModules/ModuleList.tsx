import type { Perspective, PerspectiveModule } from "@/features/perspectives/types";
import {
  Badge,
  Box,
  Flex,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";

interface ModuleListProps {
  readonly module: PerspectiveModule;
}

/**
 * ModuleList component displays a list of perspectives from a specific module
 */
export function ModuleList({ module }: ModuleListProps) {
  if (module.perspectives.length === 0) {
    return <Text color="gray.400" px={4}>No perspectives found in this module.</Text>;
  }

  return (
    <VStack gap={2} align="stretch" width="100%">
      {module.perspectives.map((perspective: Perspective) => (
        <Link
          key={perspective.name}
          to="/perspectives/module/$moduleName/perspective/$perspectiveName"
          params={{ 
            moduleName: module.name,
            perspectiveName: perspective.name.includes("/") 
              ? perspective.name.split("/").pop() ?? perspective.name
              : perspective.name
          }}
          className="no-underline"
          style={{ textDecoration: 'none' }}
        >
          <Box
            px={4}
            py={3}
            _hover={{ bg: "gray.800" }}
            cursor="pointer"
            width="100%"
            transition="background-color 0.2s"
          >
            <Flex justifyContent="space-between" alignItems="center" mb={1}>
              <Heading 
                size="sm" 
                overflow="hidden" 
                textOverflow="ellipsis" 
                whiteSpace="nowrap"
                fontWeight="medium"
              >
                {perspective.display_name || perspective.name}
              </Heading>
              <Badge 
                variant="solid" 
                colorScheme="blue" 
                fontSize="xs"
              >
                {perspective.version}
              </Badge>
            </Flex>
            <Text 
              fontSize="xs" 
              color="gray.400" 
              overflow="hidden" 
              textOverflow="ellipsis" 
              whiteSpace="nowrap"
              mb={1}
            >
              {perspective.description?.substring(0, 60) ?? "No description available"}...
            </Text>
          </Box>
        </Link>
      ))}
    </VStack>
  );
} 