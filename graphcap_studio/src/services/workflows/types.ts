/**
 * @license Apache-2.0
 * 
 * Type definitions and schemas for workflow management
 * 
 * @module WorkflowTypes
 */

import { z } from 'zod'

// Base schemas
export const WorkflowMetadataSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  version: z.string()
})

export const WorkflowBaseSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  config: z.record(z.unknown()),
  workflow_metadata: WorkflowMetadataSchema.optional(),
  file_hash: z.string().optional()
})

export const WorkflowCreateSchema = WorkflowBaseSchema

export const WorkflowResponseSchema = WorkflowBaseSchema.extend({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

// Response schemas
export const WorkflowListResponseSchema = z.array(WorkflowResponseSchema)

// Request schemas
export const WorkflowUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  config: z.record(z.unknown()).optional(),
  workflow_metadata: WorkflowMetadataSchema.optional()
})

// Types
export type WorkflowMetadata = z.infer<typeof WorkflowMetadataSchema>
export type WorkflowBase = z.infer<typeof WorkflowBaseSchema>
export type Workflow = z.infer<typeof WorkflowResponseSchema>
export type CreateWorkflowInput = z.infer<typeof WorkflowCreateSchema>
export type UpdateWorkflowInput = z.infer<typeof WorkflowUpdateSchema> & { id: string } 