import { Badge, Box, Button, Flex, HStack, Heading, Text } from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { usePerspectiveEditor } from "../context/PerspectiveEditorContext";

/**
 * PerspectiveHeader displays the perspective title, version, description, and navigation
 */
export function PerspectiveHeader() {
  const { perspective, moduleName, colors, onNavigateNext, onNavigatePrevious, hasPrevious, hasNext } = usePerspectiveEditor();
  
  return (
    <Box 
      py={5} 
      px={6} 
      bg={colors.headerBgColor} 
      borderBottom="1px solid" 
      borderColor={colors.borderColor}
    >
      <Flex justifyContent="space-between" alignItems="flex-start">
        <Box maxW="70%">
          <Flex alignItems="center" gap={2} mb={2}>
            <Heading size="lg">
              {perspective.display_name || perspective.name}
            </Heading>
            <Badge colorScheme="blue" fontSize="sm" px={2} py={1}>| Version : {perspective.version} | Module : {moduleName}</Badge>
          </Flex>
          <Text fontSize="md" lineHeight="1.6" color="gray.600" _dark={{ color: "gray.400" }}>
            {perspective.description || "No description available for this perspective."}
          </Text>
        </Box>
        <HStack gap={3}>
          <Button
            aria-label="Previous perspective"
            variant="ghost"
            size="sm"
            onClick={onNavigatePrevious}
            disabled={!hasPrevious}
          >
            <LuChevronLeft />
            Previous
          </Button>
          <Button
            aria-label="Next perspective"
            variant="ghost"
            size="sm"
            onClick={onNavigateNext}
            disabled={!hasNext}
          >
            Next
            <LuChevronRight />
          </Button>
          <Link to="/perspectives/module/$moduleName" params={{ moduleName }}>
            <Button colorScheme="blue" variant="outline" size="sm">
              Close
            </Button>
          </Link>
        </HStack>
      </Flex>
    </Box>
  );
} 