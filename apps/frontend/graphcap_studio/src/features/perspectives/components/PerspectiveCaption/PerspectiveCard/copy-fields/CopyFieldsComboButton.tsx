// SPDX-License-Identifier: Apache-2.0
/**
 * CopyFieldsComboButton Component
 *
 * A combined button for copying perspective fields with configurable options
 * through a dialog menu that allows users to filter which fields to include.
 */
import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { ClipboardButton } from "@/features/clipboard";
import type { PerspectiveSchema } from "@/types/perspective-types";
import {
    Box,
    Button,
    CloseButton,
    Dialog,
    Flex,
    Portal,
    Stack,
    Text
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { LuSettings } from "react-icons/lu";
import { FieldSelectionPanel } from "./FieldSelectionPanel";
import { FormatOptionsPanel } from "./FormatOptionsPanel";
import { FormatPreview, formatContent } from "./FormatPreview";
import { CopyFieldsPreferences, FormatType, getFieldPreferences, saveFieldPreferences } from "./types";

export interface CopyFieldsComboButtonProps {
  readonly schema: PerspectiveSchema;
  readonly data: Record<string, any> | null;
  readonly size?: "xs" | "sm" | "md" | "lg";
}

/**
 * Button component that combines clipboard functionality with field selection options
 */
export function CopyFieldsComboButton({
  schema,
  data,
  size = "md"
}: CopyFieldsComboButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const schemaId = useMemo(() => `${schema.name}-${schema.version}`, [schema]);
  
  // State for field preferences
  const [fieldFilters, setFieldFilters] = useState<Record<string, boolean>>({});
  const [includeLabels, setIncludeLabels] = useState(true);
  const [formatType, setFormatType] = useState<FormatType>('newline');
  
  // Initialize preferences from localStorage
  useEffect(() => {
    const savedPreferences = getFieldPreferences(schemaId);
    
    // Create a default state where all fields are included (true)
    const defaultFilters: Record<string, boolean> = {};
    schema.schema_fields.forEach(field => {
      defaultFilters[field.name] = true;
    });
    
    // Merge saved filters with defaults
    setFieldFilters({ ...defaultFilters, ...savedPreferences.fieldFilters });
    setIncludeLabels(savedPreferences.includeLabels);
    setFormatType(savedPreferences.formatType);
  }, [schemaId, schema.schema_fields]);
  
  // Toggle a specific field filter
  const toggleFieldFilter = (fieldName: string) => {
    setFieldFilters(prev => {
      const updated = { ...prev, [fieldName]: !prev[fieldName] };
      saveFieldPreferences(schemaId, {
        fieldFilters: updated,
        includeLabels,
        formatType
      });
      return updated;
    });
  };
  
  // Toggle all fields on or off
  const toggleAllFields = (value: boolean) => {
    const updated: Record<string, boolean> = {};
    schema.schema_fields.forEach(field => {
      updated[field.name] = value;
    });
    setFieldFilters(updated);
    saveFieldPreferences(schemaId, {
      fieldFilters: updated,
      includeLabels,
      formatType
    });
  };
  
  // Toggle includeLabels
  const toggleIncludeLabels = () => {
    setIncludeLabels(prev => {
      const updated = !prev;
      saveFieldPreferences(schemaId, {
        fieldFilters,
        includeLabels: updated,
        formatType
      });
      return updated;
    });
  };
  
  // Change format type
  const changeFormatType = (type: FormatType) => {
    setFormatType(type);
    saveFieldPreferences(schemaId, {
      fieldFilters,
      includeLabels,
      formatType: type
    });
  };
  
  // Background colors for dialog
  const dialogBg = useColorModeValue("white", "gray.800");
  const dialogHeaderBg = useColorModeValue("gray.50", "gray.700");
  
  // Get current preferences for clipboard formatter
  const currentPreferences: CopyFieldsPreferences = {
    fieldFilters,
    includeLabels,
    formatType
  };
  
  return (
    <Flex alignItems="center" gap={1}>
      {/* Copy Button */}
      <ClipboardButton
        content={data}
        formatValue={(d) => formatContent(d, schema, currentPreferences)}
        label="Copy formatted caption to clipboard"
        buttonText="Copy Fields"
        size={size}
      />
      
      {/* Settings Button */}
      <Button
        size={size}
        variant="ghost"
        onClick={() => setIsDialogOpen(true)}
        aria-label="Field copy settings"
        title="Configure which fields to copy"
      >
        <LuSettings />
      </Button>
      
      {/* Dialog for Field Selection */}
      <Dialog.Root 
        open={isDialogOpen} 
        onOpenChange={(details) => setIsDialogOpen(details.open)}
        size="xl"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content bg={dialogBg} maxWidth="80%">
              <Dialog.Header bg={dialogHeaderBg}>
                <Dialog.Title>Copy Fields Options</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              
              <Dialog.Body>
                <Flex gap={4}>
                  {/* Field Selection Panel - 25% width */}
                  <Box width="25%">
                    <FieldSelectionPanel
                      schema={schema}
                      fieldFilters={fieldFilters}
                      onToggleField={toggleFieldFilter}
                      onToggleAllFields={toggleAllFields}
                    />
                  </Box>
                  
                  {/* Preview Panel - 50% width */}
                  <Box width="50%">
                    <Stack
                      gap={2}
                      p={3}
                      bg={useColorModeValue("gray.50", "gray.700")}
                      borderRadius="md"
                      height="100%"
                    >
                      <Text fontWeight="medium">Preview</Text>
                      <FormatPreview 
                        schema={schema}
                        data={data}
                        preferences={currentPreferences}
                        height="400px"
                      />
                    </Stack>
                  </Box>
                  
                  {/* Format Options Panel - 25% width */}
                  <Box width="25%">
                    <FormatOptionsPanel 
                      includeLabels={includeLabels}
                      formatType={formatType}
                      onToggleIncludeLabels={toggleIncludeLabels}
                      onChangeFormatType={changeFormatType}
                    />
                  </Box>
                </Flex>
              </Dialog.Body>
              
              <Dialog.Footer>
                <Button 
                  colorScheme="blue" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Done
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Flex>
  );
} 