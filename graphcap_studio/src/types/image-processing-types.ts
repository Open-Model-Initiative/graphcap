// SPDX-License-Identifier: Apache-2.0
import { z } from "zod";

/**
 * Zod schema for an image processing request.
 */
export const ImageProcessRequestSchema = z.object({
  imagePath: z.string(),
  operations: z
    .object({
      crop: z
        .object({
          left: z.number(),
          top: z.number(),
          width: z.number(),
          height: z.number(),
        })
        .optional(),
      rotate: z.number().optional(),
      resize: z
        .object({
          width: z.number(),
          height: z.number(),
        })
        .optional(),
      flip: z.boolean().optional(),
      flop: z.boolean().optional(),
    })
    .optional(),
  outputName: z.string().optional(),
  overwrite: z.boolean().optional(),
});

/**
 * TypeScript type inferred from the ImageProcessRequestSchema.
 */
export type ImageProcessRequest = z.infer<typeof ImageProcessRequestSchema>;

/**
 * Zod schema for an image processing response.
 */
export const ImageProcessResponseSchema = z.object({
  success: z.boolean(),
  path: z.string(),
  url: z.string(),
});

/**
 * TypeScript type inferred from the ImageProcessResponseSchema.
 */
export type ImageProcessResponse = z.infer<typeof ImageProcessResponseSchema>; 