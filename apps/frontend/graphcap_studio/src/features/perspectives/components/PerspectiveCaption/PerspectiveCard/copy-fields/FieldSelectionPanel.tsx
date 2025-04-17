// SPDX-License-Identifier: Apache-2.0
/**
 * FieldSelectionPanel Component
 *
 * Panel for selecting which fields to include when copying perspective data.
 * Allows selecting/deselecting individual fields or all fields at once.
 */
import { Checkbox } from "@/components/ui/checkbox";
import { useColorModeValue } from "@/components/ui/theme/color-mode";
import type { PerspectiveSchema } from "@/types/perspective-types";
import { Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useMemo } from "react";

interface FieldSelectionPanelProps {
  readonly schema: PerspectiveSchema;
  readonly fieldFilters: Record<string, boolean>;
  readonly onToggleField: (fieldName: string) => void;
  readonly onToggleAllFields: (value: boolean) => void;
}

/**
 * Panel component for selecting which fields to include in the copied output
 */
export function FieldSelectionPanel({
  schema,
  fieldFilters,
  onToggleField,
  onToggleAllFields
}: FieldSelectionPanelProps) {
  const sectionBg = useColorModeValue("gray.50", "gray.700");
  
  // Calculate if all fields are selected or none are selected
  const allFieldsSelected = useMemo(() => {
    return schema.schema_fields.every(field => fieldFilters[field.name] !== false);
  }, [fieldFilters, schema.schema_fields]);
  
  const noFieldsSelected = useMemo(() => {
    return schema.schema_fields.every(field => fieldFilters[field.name] === false);
  }, [fieldFilters, schema.schema_fields]);
  
  return (
    <Stack 
      flex="1"
      gap={2} 
      p={3} 
      bg={sectionBg} 
      borderRadius="md"
      height="100%"
    >
      <Text fontWeight="medium">Field Selection</Text>
      
      <Flex justifyContent="space-between">
        <Button 
          size="xs" 
          variant="outline" 
          onClick={() => onToggleAllFields(true)}
          disabled={allFieldsSelected}
        >
          Select All
        </Button>
        <Button 
          size="xs" 
          variant="outline" 
          onClick={() => onToggleAllFields(false)}
          disabled={noFieldsSelected}
        >
          Deselect All
        </Button>
      </Flex>
      
      <Stack gap={2} maxHeight="350px" overflowY="auto" paddingRight={2}>
        {schema.schema_fields.map(field => (
          <Checkbox
            key={field.name}
            checked={fieldFilters[field.name] !== false}
            onChange={() => {
              onToggleField(field.name);
            }}
          >
            {field.name}
          </Checkbox>
        ))}
      </Stack>
    </Stack>
  );
} 