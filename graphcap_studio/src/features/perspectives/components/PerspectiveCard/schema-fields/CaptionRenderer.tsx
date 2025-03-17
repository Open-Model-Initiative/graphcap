// SPDX-License-Identifier: Apache-2.0
/**
 * Caption Renderer Component
 *
 * A component that renders caption data according to its schema definition
 * using appropriate field renderers from schema-fields.
 */

import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { SchemaField } from "@/features/perspectives/types";
import { Box, Stack, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import {
	CaptionData,
	CaptionProvider,
	useCaptionContext,
} from "./CaptionContext";
import { SchemaFieldFactory } from "./SchemaFieldFactory";

interface CaptionRendererProps {
	readonly schema: any; // PerspectiveSchema
	readonly data: CaptionData;
	readonly className?: string;
}

export function CaptionRenderer({
	schema,
	data,
	className = "",
}: CaptionRendererProps) {
	return (
		<CaptionProvider schema={schema} data={data}>
			<CaptionContent className={className} />
		</CaptionProvider>
	);
}

interface CaptionContentProps {
	readonly className?: string;
}

function CaptionContent({ className = "" }: CaptionContentProps) {
	const { schema, data, isLoading } = useCaptionContext();
	const mutedTextColor = useColorModeValue("gray.600", "gray.400");

	// Get schema fields for the caption data - moved before conditional returns
	const fieldsToRender = useMemo(() => {
		if (!data) return [];

		// If there are schema fields, use them for rendering
		if (schema.schema_fields && schema.schema_fields.length > 0) {
			return schema.schema_fields;
		}

		// If no schema fields, create basic fields from the data
		return Object.keys(data).map((key) => ({
			name: key,
			type: "str",
			description: `${key} field`,
			is_list: Array.isArray(data[key]),
			is_complex:
				typeof data[key] === "object" &&
				data[key] !== null &&
				!Array.isArray(data[key]),
		})) as SchemaField[];
	}, [schema, data]);

	// If we have no data, show a placeholder
	if (isLoading) {
		return (
			<Box textAlign="center" py={4}>
				<Text fontSize="sm" color={mutedTextColor} fontStyle="italic">
					Loading caption data...
				</Text>
			</Box>
		);
	}

	if (!data) {
		return (
			<Box textAlign="center" py={4}>
				<Text fontSize="sm" color={mutedTextColor} fontStyle="italic">
					No caption data available
				</Text>
			</Box>
		);
	}

	// Render each field using SchemaFieldFactory
	return (
		<Stack direction="column" gap={4} className={className}>
			{fieldsToRender.map((field) => {
				const fieldValue = data[field.name];
				return (
					<Box key={field.name}>
						<SchemaFieldFactory field={field} value={fieldValue} />
					</Box>
				);
			})}
		</Stack>
	);
}
