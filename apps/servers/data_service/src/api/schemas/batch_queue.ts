// SPDX-License-Identifier: Apache-2.0
/**
 * Batch Queue Schemas
 * 
 * Zod schemas for batch queue job validation.
 */

import { JOB_TYPE } from '@graphcap/datamodel/src/schema/batch_queue';
import { z } from 'zod';

// Job creation schema
export const batchJobCreateSchema = z.object({
  type: z.enum([
    JOB_TYPE.MULTI_PERSPECTIVE, 
    JOB_TYPE.DATASET_PERSPECTIVE, 
    JOB_TYPE.BACKFILL, 
    JOB_TYPE.DEPENDENCY_CHAIN
  ]),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  perspectives: z.array(z.string()).min(1, 'At least one perspective is required'),
  options: z.object({
    max_tokens: z.number().optional(),
    temperature: z.number().optional(),
    top_p: z.number().optional(),
    repetition_penalty: z.number().optional(),
    provider: z.string().optional(),
    global_context: z.string().optional(),
    resize: z.boolean().optional(),
    resize_resolution: z.string().optional()
  }).optional(),
  priority: z.number().optional(),
  dependencies: z.array(z.string().uuid()).optional()
});

export type BatchJobCreate = z.infer<typeof batchJobCreateSchema>;

// Job response schema
export const batchJobSchema = z.object({
  jobId: z.string().uuid(),
  type: z.string(),
  status: z.string(),
  priority: z.number(),
  totalImages: z.number(),
  processedImages: z.number(),
  failedImages: z.number(),
  progress: z.number(),
  config: z.record(z.any()),
  createdAt: z.string().or(z.date()),
  startedAt: z.string().or(z.date()).nullable(),
  completedAt: z.string().or(z.date()).nullable(),
  archived: z.boolean()
});

export type BatchJob = z.infer<typeof batchJobSchema>;

// Job item schema
export const batchJobItemSchema = z.object({
  id: z.number(),
  jobId: z.string().uuid(),
  imagePath: z.string(),
  perspective: z.string(),
  status: z.string(),
  error: z.string().nullable(),
  startedAt: z.string().or(z.date()).nullable(),
  completedAt: z.string().or(z.date()).nullable(),
  processingTime: z.number().nullable()
});

export type BatchJobItem = z.infer<typeof batchJobItemSchema>;

// Job cancellation response
export const batchJobCancelResponseSchema = z.object({
  success: z.boolean(),
  jobId: z.string().uuid(),
  status: z.string()
});

export type BatchJobCancelResponse = z.infer<typeof batchJobCancelResponseSchema>;

// Job reorder schema
export const batchJobReorderSchema = z.object({
  jobIds: z.array(z.string().uuid())
});

export type BatchJobReorder = z.infer<typeof batchJobReorderSchema>;

// Job reorder response
export const batchJobReorderResponseSchema = z.object({
  success: z.boolean(),
  updatedJobs: z.number()
});

export type BatchJobReorderResponse = z.infer<typeof batchJobReorderResponseSchema>;

// Job status response including items
export const batchJobStatusResponseSchema = z.object({
  job: batchJobSchema,
  items: z.array(batchJobItemSchema).optional()
});

export type BatchJobStatusResponse = z.infer<typeof batchJobStatusResponseSchema>; 