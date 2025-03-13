// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Service Types
 * 
 * This module defines types used by the perspectives service.
 */

import { z } from 'zod';
import { Image } from '@/services/images';

// Zod schemas for type validation
export const SchemaFieldSchema: z.ZodType<{
  name: string;
  type: 'str' | 'float';
  description: string;
  is_list?: boolean;
  is_complex?: boolean;
  fields?: Array<{
    name: string;
    type: 'str' | 'float';
    description: string;
    is_list?: boolean;
    is_complex?: boolean;
  }>;
}> = z.object({
  name: z.string(),
  type: z.enum(['str', 'float']),
  description: z.string(),
  is_list: z.boolean().optional(),
  is_complex: z.boolean().optional(),
  fields: z.array(z.lazy(() => SchemaFieldSchema)).optional(),
});

export const TableColumnSchema = z.object({
  name: z.string(),
  style: z.string(),
});

export const PerspectiveSchemaSchema = z.object({
  name: z.string(),
  display_name: z.string(),
  version: z.string(),
  prompt: z.string(),
  schema_fields: z.array(SchemaFieldSchema),
  table_columns: z.array(TableColumnSchema),
  context_template: z.string(),
});

export const PerspectiveSchema = z.object({
  name: z.string(),
  display_name: z.string(),
  version: z.string(),
  description: z.string(),
  schema: PerspectiveSchemaSchema.optional(),
});

export const PerspectiveListResponseSchema = z.object({
  perspectives: z.array(PerspectiveSchema),
});

export const CaptionRequestSchema = z.object({
  perspective: z.string(),
  image_path: z.string(),
  provider: z.string().optional(),
  max_tokens: z.number().optional(),
  temperature: z.number().optional(),
  top_p: z.number().optional(),
  repetition_penalty: z.number().optional(),
  context: z.union([z.array(z.string()), z.string()]).optional(),
  global_context: z.string().optional(),
});

export const CaptionResponseSchema = z.object({
  perspective: z.string(),
  provider: z.string(),
  result: z.record(z.any()),
  raw_text: z.string().optional(),
});

// Types derived from Zod schemas
export type SchemaField = z.infer<typeof SchemaFieldSchema>;
export type TableColumn = z.infer<typeof TableColumnSchema>;
export type PerspectiveSchema = z.infer<typeof PerspectiveSchemaSchema>;
export type Perspective = z.infer<typeof PerspectiveSchema>;
export type PerspectiveListResponse = z.infer<typeof PerspectiveListResponseSchema>;
export type CaptionRequest = z.infer<typeof CaptionRequestSchema>;
export type CaptionResponse = z.infer<typeof CaptionResponseSchema>;

// Type for server connection
export type ServerConnection = {
  id: string;
  url?: string;
  status?: string;
};

// Type for caption options
export type CaptionOptions = {
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  repetition_penalty?: number;
  global_context?: string;
  context?: string[];
};

// Types for image captions functionality
export type PerspectiveType = string; // Use string type to allow any perspective name from the API

export interface PerspectiveData {
  config_name: string;
  version: string;
  model: string;
  provider: string;
  content: Record<string, any>;
}

export interface ImageCaptions {
  image: Image;
  perspectives: Record<string, PerspectiveData>;
  metadata: {
    captioned_at: string;
    provider: string;
    model: string;
  };
}

export interface ImagePerspectivesResult {
  isLoading: boolean;
  error: string | null;
  captions: ImageCaptions | null;
  activePerspective: PerspectiveType | null;
  generatedPerspectives: PerspectiveType[];
  setActivePerspective: (perspective: PerspectiveType) => void;
  generatePerspective: (perspective: PerspectiveType, providerId?: number) => void;
  generateAllPerspectives: () => void;
  availablePerspectives: Perspective[];
  availableProviders: { id: number; name: string }[];
  perspectiveData: PerspectiveData | null;
}

export interface Provider {
  id: number;
  name: string;
} 