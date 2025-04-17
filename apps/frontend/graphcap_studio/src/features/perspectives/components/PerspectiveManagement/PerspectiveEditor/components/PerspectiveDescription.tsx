import { Box, Heading, Text } from "@chakra-ui/react";
import { usePerspectiveEditor } from "../context/PerspectiveEditorContext";

/**
 * PerspectiveDescription displays the description of the perspective
 */
export function PerspectiveDescription() {
  const { perspective, colors } = usePerspectiveEditor();
  
  return (
    <Box 
      p={6} 
      pb={8}
      mb={4} 
      bg={colors.descriptionBgColor}
      borderBottom="1px solid" 
      borderColor={colors.borderColor}
    >
      <Heading size="md" mb={3}>
        Description
      </Heading>
      <Text fontSize="md" lineHeight="1.6">
        {perspective.description || "No description available for this perspective."}
      </Text>
    </Box>
  );
} 