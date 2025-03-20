// SPDX-License-Identifier: Apache-2.0
/**
 * Batch Queue Controllers
 *
 * This module defines the controller functions for batch job queue management.
 */

import { and, asc, eq } from "drizzle-orm";
import { type SQL, sql } from "drizzle-orm/sql";
import type { Context } from "hono";
import { db } from "../../db";
import {
	JOB_STATUS,
	batchJobDependencies,
	batchJobItems,
	batchJobs,
} from "../../db/schema/batch_queue";
import { logger } from "../../utils/logger";
import type { BatchJobCreate, BatchJobReorder } from "../schemas/batch_queue";
import { StatusCodes } from "../schemas/common";

// Type for validated parameters
type ValidatedParams = {
	jobId: string;
};

/**
 * Create a new batch job
 */
export const createBatchJob = async (c: Context) => {
	try {
		// Access validated data from OpenAPI middleware
		// @ts-ignore - Hono OpenAPI validation types are not properly recognized
		const data = c.req.valid("json") as BatchJobCreate;

		// Calculate total number of tasks (image * perspective combinations)
		const totalImages = data.images.length * data.perspectives.length;

		// Store job configuration including images, perspectives and options
		const config = {
			images: data.images,
			perspectives: data.perspectives,
			options: data.options ?? {},
		};

		// Create the job record
		const [job] = await db
			.insert(batchJobs)
			.values({
				// UUID is generated by the database defaultRandom() function
				type: data.type,
				status: JOB_STATUS.PENDING,
				priority: data.priority ?? 100,
				config,
				totalImages,
				processedImages: 0,
				failedImages: 0,
				progress: 0,
			})
			.returning();

		if (!job) {
			logger.error("Failed to create batch job");
			throw new Error("Failed to create batch job");
		}

		// Create job items for each image/perspective combination
		const itemValues = [];
		for (const imagePath of data.images) {
			for (const perspective of data.perspectives) {
				itemValues.push({
					jobId: job.jobId,
					imagePath,
					perspective,
					status: JOB_STATUS.PENDING,
				});
			}
		}

		// Insert all job items
		await db.insert(batchJobItems).values(itemValues);

		// Handle dependencies if specified
		if (data.dependencies && data.dependencies.length > 0) {
			const dependencyValues = data.dependencies.map((dependsOnJobId) => ({
				jobId: job.jobId,
				dependsOnJobId,
			}));

			await db.insert(batchJobDependencies).values(dependencyValues);
		}

		// Return the created job
		return c.json(
			{
				jobId: job.jobId,
				status: job.status,
				createdAt: job.createdAt.toISOString(),
				position: 0, // To be calculated later when implementing job queue position tracking
			},
			StatusCodes.CREATED,
		);
	} catch (error) {
		logger.error({ error }, "Error creating batch job");
		return c.json(
			{ error: error instanceof Error ? error.message : "Failed to create batch job" },
			StatusCodes.SERVER_ERROR,
		);
	}
};

/**
 * List active batch jobs
 */
export const listBatchJobs = async (c: Context) => {
	try {
		const status = c.req.query("status") ?? "all";
		const limit = Number.parseInt(c.req.query("limit") ?? "20");
		const offset = Number.parseInt(c.req.query("offset") ?? "0");
		const includeArchived = c.req.query("include_archived") === "true";

		// Build where conditions
		const conditions: SQL[] = [];

		if (status !== "all") {
			conditions.push(eq(batchJobs.status, status));
		}

		if (!includeArchived) {
			conditions.push(eq(batchJobs.archived, false));
		}

		// Combined where clause using AND
		const whereClause =
			conditions.length > 0 ? sql.join(conditions, sql` AND `) : sql`TRUE`;

		// Execute the query with all conditions
		const jobs = await db
			.select()
			.from(batchJobs)
			.where(whereClause)
			.orderBy(asc(batchJobs.priority), asc(batchJobs.createdAt))
			.limit(limit)
			.offset(offset);

		// Count total jobs with the same filter
		const [countResult] = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(batchJobs)
			.where(whereClause);

		const total = countResult?.count ?? 0;

		// Format dates as strings to satisfy the schema
		const formattedJobs = jobs.map(job => ({
			...job,
			createdAt: job.createdAt.toISOString(),
			startedAt: job.startedAt ? job.startedAt.toISOString() : null,
			completedAt: job.completedAt ? job.completedAt.toISOString() : null,
		}));

		return c.json(
			{
				jobs: formattedJobs,
				total,
				offset,
				limit,
			},
			StatusCodes.OK,
		);
	} catch (error) {
		logger.error({ error }, "Error listing batch jobs");
		return c.json(
			{ error: error instanceof Error ? error.message : "Failed to list batch jobs" },
			StatusCodes.SERVER_ERROR,
		);
	}
};

/**
 * Get detailed information for a specific job
 */
export const getBatchJobStatus = async (c: Context) => {
	try {
		const { jobId } = c.req.param() as ValidatedParams;
		const includeItems = c.req.query("includeItems") === "true";

		// Get job record
		const [job] = await db
			.select()
			.from(batchJobs)
			.where(eq(batchJobs.jobId, jobId));

		if (!job) {
			return c.json({ error: "Job not found" }, StatusCodes.NOT_FOUND);
		}

		// Format dates as strings to satisfy the schema
		const formattedJob = {
			...job,
			createdAt: job.createdAt.toISOString(),
			startedAt: job.startedAt ? job.startedAt.toISOString() : null,
			completedAt: job.completedAt ? job.completedAt.toISOString() : null,
		};

		// If includeItems is true, also fetch job items
		let items = undefined;
		if (includeItems) {
			const rawItems = await db
				.select()
				.from(batchJobItems)
				.where(eq(batchJobItems.jobId, jobId));
				
			// Format dates in items
			items = rawItems.map(item => ({
				...item,
				startedAt: item.startedAt ? item.startedAt.toISOString() : null,
				completedAt: item.completedAt ? item.completedAt.toISOString() : null,
			}));
		}

		return c.json(
			{
				job: formattedJob,
				items,
			},
			StatusCodes.OK,
		);
	} catch (error) {
		logger.error({ error }, "Error getting batch job status");
		return c.json(
			{ error: error instanceof Error ? error.message : "Failed to get job status" },
			StatusCodes.SERVER_ERROR,
		);
	}
};

/**
 * Cancel a batch job
 */
export const cancelBatchJob = async (c: Context) => {
	try {
		const { jobId } = c.req.param() as ValidatedParams;

		// Get job record
		const [job] = await db
			.select()
			.from(batchJobs)
			.where(eq(batchJobs.jobId, jobId));

		if (!job) {
			return c.json({ error: "Job not found" }, StatusCodes.NOT_FOUND);
		}

		// Check if job can be cancelled
		if (
			job.status === JOB_STATUS.COMPLETED ||
			job.status === JOB_STATUS.CANCELLED
		) {
			return c.json(
				{
					error: "Cannot cancel job that is already completed or cancelled",
				},
				StatusCodes.BAD_REQUEST,
			);
		}

		// Update job status
		await db
			.update(batchJobs)
			.set({ status: JOB_STATUS.CANCELLED })
			.where(eq(batchJobs.jobId, jobId));

		// Update all pending job items to cancelled
		await db
			.update(batchJobItems)
			.set({ status: JOB_STATUS.CANCELLED })
			.where(
				and(
					eq(batchJobItems.jobId, jobId),
					eq(batchJobItems.status, JOB_STATUS.PENDING),
				),
			);

		return c.json(
			{
				success: true,
				jobId,
				status: JOB_STATUS.CANCELLED,
			},
			StatusCodes.OK,
		);
	} catch (error) {
		logger.error({ error }, "Error cancelling batch job");
		return c.json(
			{ error: error instanceof Error ? error.message : "Failed to cancel job" },
			StatusCodes.SERVER_ERROR,
		);
	}
};

/**
 * Reorder batch jobs
 */
export const reorderBatchJobs = async (c: Context) => {
	try {
		// @ts-ignore - Hono OpenAPI validation types are not properly recognized
		const data = c.req.valid("json") as BatchJobReorder;

		// Update priority for each job based on its position in the array
		let updatedCount = 0;
		for (let i = 0; i < data.jobIds.length; i++) {
			const result = await db
				.update(batchJobs)
				.set({ priority: i * 10 })
				.where(eq(batchJobs.jobId, data.jobIds[i]));

			if (result.rowCount) {
				updatedCount += result.rowCount;
			}
		}

		return c.json(
			{
				success: true,
				updatedJobs: updatedCount,
			},
			StatusCodes.OK,
		);
	} catch (error) {
		logger.error({ error }, "Error reordering batch jobs");
		return c.json(
			{ error: error instanceof Error ? error.message : "Failed to reorder jobs" },
			StatusCodes.SERVER_ERROR,
		);
	}
};
