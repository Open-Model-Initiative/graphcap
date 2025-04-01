// SPDX-License-Identifier: Apache-2.0
import { z } from "zod";
import { ImageSchema } from "./image-types"; // Import ImageSchema

/**
 * Zod schema for a single dataset.
 * A dataset contains a name and an array of images.
 */
export const DatasetSchema = z.object({
  name: z.string(),
  images: z.array(ImageSchema), // Use imported ImageSchema
});

/**
 * TypeScript type inferred from the DatasetSchema.
 * Represents a single dataset object.
 */
export type Dataset = z.infer<typeof DatasetSchema>;

/**
 * Zod schema for the API response when listing datasets.
 * Contains an array of datasets.
 */
export const DatasetListResponseSchema = z.object({
  datasets: z.array(DatasetSchema),
});

/**
 * TypeScript type inferred from the DatasetListResponseSchema.
 * Represents the structure of the API response for listing datasets.
 */
export type DatasetListResponse = z.infer<typeof DatasetListResponseSchema>;

/**
 * Zod schema for the API response when creating a dataset.
 */
export const DatasetCreateResponseSchema = z.object({
  success: z.boolean(),
  path: z.string().optional(),
  message: z.string().optional(),
});

/**
 * TypeScript type inferred from the DatasetCreateResponseSchema.
 */
export type DatasetCreateResponse = z.infer<typeof DatasetCreateResponseSchema>;

/**
 * Zod schema for the API response when adding an image to a dataset.
 */
export const AddImageToDatasetResponseSchema = z.object({
  success: z.boolean(),
  path: z.string().optional(),
  message: z.string().optional(),
});

/**
 * TypeScript type inferred from the AddImageToDatasetResponseSchema.
 */
export type AddImageToDatasetResponse = z.infer<
  typeof AddImageToDatasetResponseSchema
>;

/**
 * Zod schema for the API response when deleting a dataset.
 */
export const DatasetDeleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

/**
 * TypeScript type inferred from the DatasetDeleteResponseSchema.
 */
export type DatasetDeleteResponse = z.infer<typeof DatasetDeleteResponseSchema>; 