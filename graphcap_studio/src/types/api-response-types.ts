// SPDX-License-Identifier: Apache-2.0
import { z } from "zod";

/**
 * Generic Zod schema for API responses indicating success/failure with an optional message.
 */
export const GenericApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

/**
 * Generic TypeScript type inferred from the GenericApiResponseSchema.
 */
export type GenericApiResponse = z.infer<typeof GenericApiResponseSchema>;

// Specific response types can extend or use this if needed, or be defined separately.
// For now, we'll use GenericApiResponse for mutations that return this structure.

// Example explicit types if needed later:
// export type AddImageToDatasetResponse = GenericApiResponse;
// export type DeleteDatasetResponse = GenericApiResponse;
// export type RenameDatasetResponse = GenericApiResponse;
// export type DeleteImageFromDatasetResponse = GenericApiResponse;
// export type RenameDatasetImageResponse = GenericApiResponse; 