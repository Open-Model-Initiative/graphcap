import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { usePerspectiveEditor } from "../context/PerspectiveEditorContext";
import { TableColumns } from "./TableColumns";

/**
 * ManagementTab displays the perspective management options
 */
export function ManagementTab() {
  const { perspective, colors } = usePerspectiveEditor();
  
  return (
    <Box>
      <Heading size="md" mb={4}>
        Perspective Management
      </Heading>
      <Text mb={5} fontSize="md">
        This section allows you to edit and manage the perspective configuration.
      </Text>

      <Box
        p={5}
        borderWidth="1px"
        borderRadius="md"
        borderColor={colors.borderColor}
        mb={6}
      >
        <Stack gap={5}>
          {perspective.schema?.table_columns && perspective.schema.table_columns.length > 0 && (
            <TableColumns tableColumns={perspective.schema.table_columns} />
          )}

          <Box mt={4}>
            <Text fontWeight="bold" mb={3} fontSize="md">
              Actions
            </Text>
            <Flex gap={3}>
              <Button colorScheme="blue" size="md" disabled>
                Edit Perspective
              </Button>
              <Button colorScheme="red" variant="outline" size="md" disabled>
                Deprecate
              </Button>
            </Flex>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
} 