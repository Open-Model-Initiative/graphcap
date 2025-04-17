import { Box, Code, Heading, Stack, Text } from "@chakra-ui/react";
import { usePerspectiveEditor } from "../context/PerspectiveEditorContext";

/**
 * SchemaInfoTab displays the basic schema information for a perspective
 */
export function SchemaInfoTab() {
  const { perspective, colors } = usePerspectiveEditor();
  
  if (!perspective.schema) {
    return <Text>No schema information available for this perspective.</Text>;
  }
  
  return (
    <Box>
      <Heading size="md" mb={4}>
        Schema Information
      </Heading>
      <Stack gap={6} p={4} borderWidth="1px" borderRadius="md" borderColor={colors.borderColor}>
        <Box>
          <Text fontWeight="bold" mb={1}>Name:</Text>
          <Text>{perspective.schema.name}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold" mb={1}>Version:</Text>
          <Text>{perspective.schema.version}</Text>
        </Box>

        <Box>
          <Text fontWeight="bold" mb={2}>Context Template:</Text>
          <Code
            p={4}
            borderRadius="md"
            whiteSpace="pre-wrap"
            fontSize="sm"
            display="block"
            bg="gray.100"
            _dark={{ bg: "gray.700" }}
          >
            {perspective.schema.context_template || "None"}
          </Code>
        </Box>
      </Stack>
    </Box>
  );
} 