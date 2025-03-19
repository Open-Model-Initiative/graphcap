// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Types
 *
 * This module serves as the single source of truth for all type definitions
 * used within the perspectives feature. It consolidates all Zod schemas,
 * inferred types, domain types, and utility types in one location.
 */

import type { Image } from "@/services/images";
import { z } from "zod";

// ============================================================================
// SECTION A - ZOD SCHEMAS
// ============================================================================

/**
 * Defines the field type for a schema field.
 * This allows for either primitive types or complex nested types.
 */
export const FieldTypeSchema = z.union([
	z.enum(["str", "float"]),
	z.object({}).passthrough(), // Allow any object structure
]);

/**
 * Defines the structure of a schema field with properties like name, type,
 * description, and optional flags for lists or complex types.
 */
export const SchemaFieldSchema: z.ZodType<{
	name: string;
	type: string | object;  // Changed from enum to accept any type
	description: string;
	is_list?: boolean;
	is_complex?: boolean;
	fields?: Array<{
		name: string;
		type: string | object;  // Changed from enum to accept any type
		description: string;
		is_list?: boolean;
		is_complex?: boolean;
	}> | null;
}> = z.object({
	name: z.string(),
	type: z.union([z.string(), z.object({}).passthrough()]),  // Accept string or object
	description: z.string(),
	is_list: z.boolean().optional(),
	is_complex: z.boolean().optional(),
	fields: z.nullable(z.array(z.lazy(() => SchemaFieldSchema))).optional(),
});

/**
 * Defines a table column with properties such as name and style.
 */
export const TableColumnSchema = z.object({
	name: z.string(),
	style: z.string(),
	description: z.string().optional(),
});

/**
 * Describes a full perspective schema with properties such as name,
 * display_name, version, prompt, schema_fields, table_columns, and context_template.
 */
export const PerspectiveSchemaSchema = z.object({
	name: z.string(),
	display_name: z.string(),
	version: z.string(),
	prompt: z.string(),
	schema_fields: z.array(SchemaFieldSchema),
	table_columns: z.array(TableColumnSchema),
	context_template: z.string(),
});

/**
 * Defines a perspective with name, display_name, version, description,
 * and an optional schema.
 */
export const PerspectiveSchema = z.object({
	name: z.string(),
	display_name: z.string(),
	version: z.string(),
	description: z.string(),
	schema: PerspectiveSchemaSchema.optional(),
});

/**
 * Wraps an array of perspectives under a 'perspectives' property.
 */
export const PerspectiveListResponseSchema = z.object({
	perspectives: z.array(PerspectiveSchema),
});

/**
 * Defines the request structure for generating a caption.
 */
export const CaptionRequestSchema = z.object({
	image_path: z.string(),
	perspective: z.string(),
	provider_id: z.number().optional(),
	provider: z.string().optional(), // For backward compatibility
	options: z
		.object({
			max_tokens: z.number().optional(),
			temperature: z.number().optional(),
			top_p: z.number().optional(),
			repetition_penalty: z.number().optional(),
			global_context: z.string().optional(),
			context: z.array(z.string()).optional(),
			resize: z.boolean().optional(),
			resize_resolution: z.string().optional(),
		})
		.optional(),
});

/**
 * Defines the response structure for a generated caption.
 */
export const CaptionResponseSchema = z.object({
	perspective: z.string(),
	provider: z.string(),
	result: z.record(z.any()),
	content: z.record(z.any()).optional(), // For backward compatibility
	raw_text: z.string().optional(),
	metadata: z
		.object({
			model: z.string(),
			provider: z.string(),
			version: z.string(),
			config_name: z.string(),
		})
		.optional(),
});

// ============================================================================
// SECTION B - INFERRED TYPES
// ============================================================================

/**
 * Type representing a schema field.
 */
export type SchemaField = z.infer<typeof SchemaFieldSchema>;

/**
 * Type representing a table column.
 */
export type TableColumn = z.infer<typeof TableColumnSchema>;

/**
 * Type representing a perspective schema.
 */
export type PerspectiveSchema = z.infer<typeof PerspectiveSchemaSchema>;

/**
 * Type representing a perspective.
 */
export type Perspective = z.infer<typeof PerspectiveSchema>;

/**
 * Type representing a list of perspectives.
 */
export type PerspectiveListResponse = z.infer<
	typeof PerspectiveListResponseSchema
>;

/**
 * Type representing a caption request.
 */
export type CaptionRequest = z.infer<typeof CaptionRequestSchema>;

/**
 * Type representing a caption response.
 */
export type CaptionResponse = z.infer<typeof CaptionResponseSchema>;

// ============================================================================
// SECTION C - DOMAIN & UTILITY TYPES
// ============================================================================

/**
 * Describes a connection to a server.
 */
export type ServerConnection = {
	id: string;
	url?: string;
	status?: string;
};

/**
 * Specifies options for generating captions.
 */
export type CaptionOptions = {
	max_tokens?: number;
	temperature?: number;
	top_p?: number;
	repetition_penalty?: number;
	global_context?: string;
	context?: string[];
	resize?: boolean;
	resize_resolution?: string;
};

/**
 * String alias that allows any perspective name to be used.
 */
export type PerspectiveType = string;

/**
 * Describes a provider with id and name.
 */
export interface Provider {
	id: number;
	name: string;
}

/**
 * Contains the details of a generated perspective.
 */
export interface PerspectiveData {
	config_name: string;
	version: string;
	model: string;
	provider: string;
	content: Record<string, any>;
	options: CaptionOptions;
}

/**
 * Defines the overall captioning data for an image.
 */
export interface ImageCaptions {
	image: Image;
	perspectives: Record<string, PerspectiveData>;
	metadata: {
		captioned_at: string;
		provider: string;
		model: string;
	};
}

// ============================================================================
// SECTION D - COMPOSITE TYPES
// ============================================================================

/**
 * Result type for the useImagePerspectives hook.
 */
export interface ImagePerspectivesResult {
	isLoading: boolean;
	error: string | null;
	captions: ImageCaptions | null;
	generatedPerspectives: PerspectiveType[];
	generatingPerspectives: string[];
	generatePerspective: (
		perspective: PerspectiveType,
		providerId?: number,
		options?: CaptionOptions,
	) => void;
	generateAllPerspectives: () => void;
	availablePerspectives: Perspective[];
	availableProviders: Provider[];
}

/**
 * Context type for the perspectives feature.
 */
export interface PerspectivesContextType {
	// UI state
	selectedProviderId: number | undefined;
	isGeneratingAll: boolean;
	perspectives: Perspective[];
	isLoading: boolean;
	error: Error | null;

	// UI actions
	setSelectedProviderId: (providerId: number | undefined) => void;
	setIsGeneratingAll: (isGenerating: boolean) => void;
	handleProviderChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Props for the perspectives provider component.
 */
export interface PerspectivesProviderProps {
	children: React.ReactNode;
	initialSelectedProviderId?: number | undefined;
}
