// SPDX-License-Identifier: Apache-2.0
/**
 * CaptionTabContent Component
 *
 * Renders the content for the "Caption" tab within PerspectiveCardTabbed,
 * including a custom clipboard formatter for the caption data.
 */
import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { ClipboardButton } from "@/features/clipboard";
import type { PerspectiveSchema } from "@/types/perspective-types";
import { Box, Text } from "@chakra-ui/react";
import { CaptionRenderer } from "./schema-fields";

export interface CaptionTabContentProps {
	readonly schema: PerspectiveSchema;
	readonly data: Record<string, any> | null;
}

/**
 * Dynamically formats the caption data into a readable string based on the perspective's schema.
 * Iterates through schema properties and extracts corresponding values from data.content.
 */
const formatCaptionForClipboard = (
	data: Record<string, any> | null,
	schema: PerspectiveSchema | null,
): string => {
	// Check for data.content and the schema_fields definition
	if (!data?.content || !schema?.schema_fields) {
		return data?.content ? JSON.stringify(data.content, null, 2) : "";
	}

	const { content } = data;
	// Iterate through the fields defined in schema_fields
	const schemaFields = schema.schema_fields;
	const parts: string[] = [];

	// Iterate through the fields defined in the schema
	for (const field of schemaFields) {
		const key = field.name; // The name of the field acts as the key in data.content
		// Use the concise field name (key) as the label
		const label = key; 

		// Check if the data actually contains this key
		if (content.hasOwnProperty(key) && content[key] !== null && content[key] !== undefined) {
			const value = content[key];

			// Use field.is_list to determine if it's an array
			if (field.is_list && Array.isArray(value)) {
				// Format arrays based on is_list flag
				parts.push(`${label}:\n- ${value.join("\n- ")}`);
			} else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
				parts.push(`${label}: ${value}`);
			} else if (typeof value === 'object') {
				// For nested objects, stringify them (could be refined if complex types need specific formatting)
				parts.push(`${label}: ${JSON.stringify(value, null, 2)}`);
			}
		}
	}

	// Join parts with a single newline for less noise
	return parts.join("\n");
};


/**
 * Renders the content for the "Caption" tab within PerspectiveCardTabbed.
 */
export function CaptionTabContent({ schema, data }: CaptionTabContentProps) {
	const mutedTextColor = useColorModeValue("gray.600", "gray.400");

	return data ? (
		<Box position="relative">
			<Box display="flex" justifyContent="flex-end" mb={2} >
				<ClipboardButton
					content={data} // Pass the full data object
					formatValue={(d) => formatCaptionForClipboard(d, schema)} // Pass schema to formatter
					label="Copy formatted caption to clipboard"
					buttonText="Copy all fields" // Pass custom button text
					size="xs"
				/>
			</Box>
			<CaptionRenderer data={data} schema={schema} />
		</Box>
	) : (
		<Box textAlign="center" py={4}>
			<Text fontSize="sm" color={mutedTextColor} fontStyle="italic">
				Generate this perspective to see caption
			</Text>
		</Box>
	);
} 