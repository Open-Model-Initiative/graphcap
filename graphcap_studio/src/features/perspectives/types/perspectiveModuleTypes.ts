// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Module Types
 *
 * This module defines types related to perspective modules and management.
 */

import { z } from "zod";
import { PerspectiveSchema } from "./perspectivesTypes";
import type { Perspective } from "./perspectivesTypes";

/**
 * Schema for module information
 */
export const ModuleInfoSchema = z.object({
	name: z.string(),
	display_name: z.string(),
	description: z.string(),
	enabled: z.boolean(),
	perspective_count: z.number()
});

/**
 * Schema for module list response
 */
export const ModuleListResponseSchema = z.object({
	modules: z.array(ModuleInfoSchema)
});

/**
 * Schema for module perspectives response
 */
export const ModulePerspectivesResponseSchema = z.object({
	module: ModuleInfoSchema,
	perspectives: z.array(PerspectiveSchema)
});

/**
 * Type representing module information
 */
export type ModuleInfo = z.infer<typeof ModuleInfoSchema>;

/**
 * Type representing a module list response
 */
export type ModuleListResponse = z.infer<typeof ModuleListResponseSchema>;

/**
 * Type representing a module perspectives response
 */
export type ModulePerspectivesResponse = z.infer<typeof ModulePerspectivesResponseSchema>;

/**
 * Represents a module containing multiple perspectives
 */
export interface PerspectiveModule {
	name: string;
	display_name: string;
	description: string;
	enabled: boolean;
	perspectives: Perspective[];
}

/**
 * Represents a list of perspective modules
 */
export interface PerspectiveModuleList {
	modules: PerspectiveModule[];
}
