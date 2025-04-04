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
import { CopyFieldsPreferences } from "./types";

/**
 * Formats a field value based on its type and the format preferences
 */
const formatFieldValue = (
  key: string,
  value: any,
  isList: boolean,
  includeLabels: boolean,
  formatType: string
): string => {
  // Handle lists (arrays)
  if (isList && Array.isArray(value)) {
    return formatListField(key, value, includeLabels, formatType);
  }
  
  // Handle primitive values
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return formatPrimitiveField(key, value, includeLabels, formatType);
  }
  
  // Handle object values
  if (typeof value === 'object') {
    return formatObjectField(key, value, includeLabels, formatType);
  }
  
  return ''; // Return empty string for unsupported types
};

/**
 * Formats a list field
 */
const formatListField = (
  key: string,
  values: any[],
  includeLabels: boolean,
  formatType: string
): string => {
  if (formatType === 'xml-tags') {
    return `<${key}>\n  <item>${values.join("</item>\n  <item>")}</item>\n</${key}>`;
  }
  
  if (includeLabels) {
    return `${key}:\n- ${values.join("\n- ")}`;
  }
  
  return `- ${values.join("\n- ")}`;
};

/**
 * Formats a primitive field (string, number, boolean)
 */
const formatPrimitiveField = (
  key: string,
  value: string | number | boolean,
  includeLabels: boolean,
  formatType: string
): string => {
  if (formatType === 'xml-tags') {
    return `<${key}>${value}</${key}>`;
  }
  
  if (includeLabels) {
    return `${key}: ${value}`;
  }
  
  return `${value}`;
};

/**
 * Formats an object field
 */
const formatObjectField = (
  key: string,
  value: object,
  includeLabels: boolean,
  formatType: string
): string => {
  const stringified = JSON.stringify(value, null, 2);
  
  if (formatType === 'xml-tags') {
    return `<${key}>${stringified}</${key}>`;
  }
  
  if (includeLabels) {
    return `${key}: ${stringified}`;
  }
  
  return stringified;
};

/**
 * Joins formatted parts based on the format type
 */
const joinFormattedParts = (parts: string[], formatType: string): string => {
  switch (formatType) {
    case 'double-newline':
      return parts.join("\n\n");
    case 'csv':
      return parts.join(",");
    case 'xml-tags':
      return parts.join("\n");
    case 'newline':
    default:
      return parts.join("\n");
  }
};

/**
 * Format the caption based on current format preferences
 */
export const formatContent = (
  data: Record<string, any> | null,
  schema: PerspectiveSchema,
  preferences: CopyFieldsPreferences
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
    
    // Skip fields that are filtered out or don't exist
    if (fieldFilters[key] === false || !content.hasOwnProperty(key)) continue;
    
    const value = content[key];
    
    // Skip null or undefined values
    if (value === null || value === undefined) continue;
    
    const formattedValue = formatFieldValue(key, value, Boolean(field.is_list), includeLabels, formatType);
    if (formattedValue) {
      parts.push(formattedValue);
    }
  }
  
  if (parts.length === 0) {
    return "No fields selected";
  }
  
  return joinFormattedParts(parts, formatType);
};

interface FormatPreviewProps {
  readonly schema: PerspectiveSchema;
  readonly data: Record<string, any> | null;
  readonly preferences: CopyFieldsPreferences;
  readonly height?: string | number;
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