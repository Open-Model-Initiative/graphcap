import { Box, Heading, Text } from "@chakra-ui/react";
import { usePerspectiveEditor } from "../context/PerspectiveEditorContext";

/**
 * FieldsTab displays the field definitions for a perspective schema
 */
export function FieldsTab() {
  const { perspective, colors, getFieldTypeDisplay } = usePerspectiveEditor();
  
  if (!perspective.schema?.schema_fields || perspective.schema.schema_fields.length === 0) {
    return <Text>No fields defined for this perspective.</Text>;
  }
  
  return (
    <Box>
      <Heading size="md" mb={4}>
        Field Definitions
      </Heading>
      <Box overflowX="auto">
        <Box
          as="table"
          width="100%"
          borderWidth="1px"
          borderColor={colors.tableBorderColor}
          borderRadius="md"
        >
          <Box as="thead" bg={colors.tableHeaderBg}>
            <Box as="tr">
              <Box as="th" p={3} textAlign="left">
                Name
              </Box>
              <Box as="th" p={3} textAlign="left">
                Type
              </Box>
              <Box as="th" p={3} textAlign="left">
                Description
              </Box>
              <Box as="th" p={3} textAlign="center">
                List
              </Box>
              <Box as="th" p={3} textAlign="center">
                Complex
              </Box>
            </Box>
          </Box>
          <Box as="tbody">
            {perspective.schema.schema_fields.map((field) => (
              <Box as="tr" key={`field-${field.name}`}>
                <Box as="td" p={3} fontWeight="bold">
                  {field.name}
                </Box>
                <Box as="td" p={3}>
                  {getFieldTypeDisplay(field.type)}
                </Box>
                <Box as="td" p={3}>
                  {field.description}
                </Box>
                <Box as="td" p={3} textAlign="center">
                  {field.is_list ? "Yes" : "No"}
                </Box>
                <Box as="td" p={3} textAlign="center">
                  {field.is_complex ? "Yes" : "No"}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 