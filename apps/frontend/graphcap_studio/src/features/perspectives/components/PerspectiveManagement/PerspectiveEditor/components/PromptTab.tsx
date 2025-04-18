import { Box, Code, Heading } from "@chakra-ui/react";
import { usePerspectiveEditor } from "../context/PerspectiveEditorContext";

/**
 * PromptTab displays the prompt template for the perspective
 */
export function PromptTab() {
  const { colors, getPromptContent } = usePerspectiveEditor();
  
  return (
    <Box>
      <Heading size="md" mb={4}>
        Prompt Template
      </Heading>
      <Box
        borderWidth="1px"
        borderRadius="md"
        borderColor={colors.borderColor}
      >
        <Code
          p={5}
          borderRadius="md"
          whiteSpace="pre-wrap"
          fontSize="sm"
          display="block"
          bg="gray.100"
          _dark={{ bg: "gray.700" }}
          height="auto"
          minHeight="200px"
        >
          {getPromptContent()}
        </Code>
      </Box>
    </Box>
  );
} 