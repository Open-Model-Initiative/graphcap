// SPDX-License-Identifier: Apache-2.0
/**
 * FormatPreview Component
 *
 * Shows a preview of how the content will be formatted based on current format settings.
 * Uses actual data from the perspective/caption when available.
 */
import { useColorModeValue } from "@/components/ui/theme/color-mode";
import type { PerspectiveSchema } from "@/types/perspective-types";
import { Box } from "@chakra-ui/react";
import { useMemo } from "react";

// Format types
type FormatType = 'newline' | 'double-newline' | 'csv' | 'xml-tags';

// User preferences interface
interface FormatPreferences {
  fieldFilters: Record<string, boolean>;
  includeLabels: boolean;
  formatType: FormatType;
}

/**
 * Format the caption based on current format preferences
 */
export const formatContent = (
  data: Record<string, any> | null,
  schema: PerspectiveSchema,
  preferences: FormatPreferences
): string => {
  if (!data?.content) {
    return "No content available";
  }
  
  const { content } = data;
  const schemaFields = schema.schema_fields;
  const { fieldFilters, includeLabels, formatType } = preferences;
  const parts: string[] = [];
  
  for (const field of schemaFields) {
    const key = field.name;
    
    // Skip fields that are filtered out
    if (fieldFilters[key] === false) continue;
    
    if (content.hasOwnProperty(key) && content[key] !== null && content[key] !== undefined) {
      const value = content[key];
      let formattedValue: string;
      
      if (field.is_list && Array.isArray(value)) {
        if (includeLabels) {
          formattedValue = `${key}:\n- ${value.join("\n- ")}`;
        } else {
          formattedValue = `- ${value.join("\n- ")}`;
        }
      } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        if (includeLabels) {
          formattedValue = `${key}: ${value}`;
        } else {
          formattedValue = `${value}`;
        }
      } else if (typeof value === 'object') {
        if (includeLabels) {
          formattedValue = `${key}: ${JSON.stringify(value, null, 2)}`;
        } else {
          formattedValue = JSON.stringify(value, null, 2);
        }
      } else {
        continue; // Skip if no valid value
      }
      
      // For XML-tags format, wrap the value
      if (formatType === 'xml-tags') {
        if (field.is_list && Array.isArray(value)) {
          formattedValue = `<${key}>\n  <item>${value.join("</item>\n  <item>")}</item>\n</${key}>`;
        } else {
          formattedValue = `<${key}>${value}</${key}>`;
        }
      }
      
      parts.push(formattedValue);
    }
  }
  
  if (parts.length === 0) {
    return "No fields selected";
  }
  
  // Join parts based on the selected format
  switch (formatType) {
    case 'newline':
      return parts.join("\n");
    case 'double-newline':
      return parts.join("\n\n");
    case 'csv':
      return parts.join(",");
    case 'xml-tags':
      return parts.join("\n");
    default:
      return parts.join("\n");
  }
};

interface FormatPreviewProps {
  schema: PerspectiveSchema;
  data: Record<string, any> | null;
  preferences: FormatPreferences;
  height?: string | number;
}

/**
 * Component that renders a preview of how the content will be formatted
 */
export function FormatPreview({ 
  schema, 
  data, 
  preferences,
  height = "400px"
}: FormatPreviewProps) {
  const previewBg = useColorModeValue("gray.100", "gray.750");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  
  // Generate the formatted content for preview
  const previewContent = useMemo(() => {
    return formatContent(data, schema, preferences);
  }, [data, schema, preferences]);
  
  return (
    <Box
      p={3}
      bg={previewBg}
      borderRadius="md"
      whiteSpace="pre-wrap"
      fontFamily="monospace"
      fontSize="sm"
      height={height}
      overflowY="auto"
      borderWidth="1px"
      borderStyle="solid"
      borderColor={borderColor}
    >
      {previewContent}
    </Box>
  );
} 