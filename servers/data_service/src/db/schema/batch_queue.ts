import { relations } from 'drizzle-orm';
// SPDX-License-Identifier: Apache-2.0
import { boolean, integer, jsonb, pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Job Status Enum Values
 */
export const JOB_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  PARTIAL: 'partial'
} as const;

/**
 * Job Type Enum Values
 */
export const JOB_TYPE = {
  MULTI_PERSPECTIVE: 'MULTI_PERSPECTIVE',
  DATASET_PERSPECTIVE: 'DATASET_PERSPECTIVE',
  BACKFILL: 'BACKFILL',
  DEPENDENCY_CHAIN: 'DEPENDENCY_CHAIN'
} as const;

/**
 * Job Item Status Enum Values
 */
export const JOB_ITEM_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const;

/**
 * Batch Jobs table schema
 * Stores metadata about batch captioning jobs
 */
export const batchJobs = pgTable('batch_jobs', {
  // Use UUID for job IDs for better distribution and client-side generation
  jobId: uuid('job_id').defaultRandom().primaryKey(),
  
  // Job metadata
  type: text('type').notNull(),
  status: text('status').notNull().default(JOB_STATUS.PENDING),
  priority: integer('priority').notNull().default(100),
  
  // Configuration stored as JSON for flexibility
  config: jsonb('config').notNull(),
  
  // Statistics
  totalImages: integer('total_images').notNull(),
  processedImages: integer('processed_images').notNull().default(0),
  failedImages: integer('failed_images').notNull().default(0),
  progress: integer('progress').notNull().default(0), // 0-100 percentage
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  
  // Archiving
  archived: boolean('archived').notNull().default(false),
});

/**
 * Job Items table schema
 * Stores individual image-perspective pairs for processing
 */
export const batchJobItems = pgTable('batch_job_items', {
  id: serial('id').primaryKey(),
  jobId: uuid('job_id').references(() => batchJobs.jobId, { onDelete: 'cascade' }).notNull(),
  
  // Item details
  imagePath: text('image_path').notNull(),
  perspective: text('perspective').notNull(),
  status: text('status').notNull().default(JOB_ITEM_STATUS.PENDING),
  
  // Optional error information
  error: text('error'),
  
  // Timestamps
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  
  // Performance metrics
  processingTime: integer('processing_time'), // in milliseconds
});

/**
 * Job Dependencies table schema
 * Tracks dependencies between jobs
 */
export const batchJobDependencies = pgTable('batch_job_dependencies', {
  id: serial('id').primaryKey(),
  jobId: uuid('job_id').references(() => batchJobs.jobId, { onDelete: 'cascade' }).notNull(),
  dependsOnJobId: uuid('depends_on_job_id').references(() => batchJobs.jobId).notNull(),
});

/**
 * Define relations for batch jobs table
 */
export const batchJobsRelations = relations(batchJobs, ({ many }) => ({
  items: many(batchJobItems),
  dependencies: many(batchJobDependencies, { relationName: 'job_dependencies' }),
  dependentJobs: many(batchJobDependencies, { relationName: 'dependent_jobs' }),
}));

/**
 * Define relations for batch job items table
 */
export const batchJobItemsRelations = relations(batchJobItems, ({ one }) => ({
  job: one(batchJobs, {
    fields: [batchJobItems.jobId],
    references: [batchJobs.jobId],
  }),
}));

/**
 * Define relations for batch job dependencies table
 */
export const batchJobDependenciesRelations = relations(batchJobDependencies, ({ one }) => ({
  job: one(batchJobs, {
    fields: [batchJobDependencies.jobId],
    references: [batchJobs.jobId],
    relationName: 'job_dependencies',
  }),
  dependsOnJob: one(batchJobs, {
    fields: [batchJobDependencies.dependsOnJobId],
    references: [batchJobs.jobId],
    relationName: 'dependent_jobs',
  }),
})); 