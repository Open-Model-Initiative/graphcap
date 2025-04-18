// SPDX-License-Identifier: Apache-2.0
import { z } from "zod";

/**
 * Zod schema for a single image.
 */
export const ImageSchema = z.object({
  path: z.string(),
  name: z.string(),
  directory: z.string(),
  url: z.string(),
});

/**
 * TypeScript type inferred from the ImageSchema.
 * Represents a single image object.
 */
export type Image = z.infer<typeof ImageSchema>;

/**
 * Zod schema for the API response when listing images.
 */
export const ImageListResponseSchema = z.object({
  images: z.array(ImageSchema),
});

/**
 * TypeScript type inferred from the ImageListResponseSchema.
 * Represents the structure of the API response for listing images.
 */
export type ImageListResponse = z.infer<typeof ImageListResponseSchema>; 