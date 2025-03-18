// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Module Types
 *
 * This module defines types related to perspective modules and management.
 */

import type { Perspective } from "./perspectivesTypes";

/**
 * Represents a module containing multiple perspectives
 */
export interface PerspectiveModule {
	id: string;
	name: string;
	enabled: boolean;
	perspectives: Perspective[];
}

/**
 * Represents a list of perspective modules
 */
export interface PerspectiveModuleList {
	modules: PerspectiveModule[];
}

/**
 * Groups perspectives by module
 * @param perspectives Array of all perspectives
 * @returns Map of modules with their perspectives
 */
export function groupPerspectivesByModule(
	perspectives: Perspective[],
): PerspectiveModule[] {
	// Initialize with default modules
	const moduleMap = new Map<string, PerspectiveModule>();

	// Add core module as default
	moduleMap.set("core", {
		id: "core",
		name: "Core",
		enabled: true,
		perspectives: [],
	});

	// Group perspectives by module
	perspectives.forEach((perspective) => {
		// Extract module from perspective name or use "core" as default
		// The module can be detected by checking for "/" in the perspective name
		const moduleId = perspective.name.includes("/")
			? perspective.name.split("/")[0]
			: "core";

		const moduleName = moduleId.charAt(0).toUpperCase() + moduleId.slice(1);

		// Create module if it doesn't exist
		if (!moduleMap.has(moduleId)) {
			moduleMap.set(moduleId, {
				id: moduleId,
				name: moduleName,
				enabled: true,
				perspectives: [],
			});
		}

		// Add perspective to module
		moduleMap.get(moduleId)?.perspectives.push(perspective);
	});

	// Convert map to array
	return Array.from(moduleMap.values());
}
