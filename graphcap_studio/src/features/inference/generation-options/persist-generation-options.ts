// SPDX-License-Identifier: Apache-2.0
/**
 * Generation Options Persistence
 *
 * This module provides utilities for persisting generation options to localStorage.
 */

import {
	type GenerationOptions,
	GenerationOptionsSchema,
} from "@/types/generation-option-types";

/**
 * Storage key for saving generation options in localStorage
 */
const STORAGE_KEY = "graphcap:generation-options";

/**
 * Save generation options to localStorage
 */
export function saveGenerationOptions(options: GenerationOptions): void {
	try {
		// Create a copy to ensure we don't modify the original
		const optionsToSave = { ...options };
		
		// Ensure provider_id is stored as a string
		if (optionsToSave.provider_id !== undefined) {
			optionsToSave.provider_id = String(optionsToSave.provider_id);
		}
		
		// Verify we have a model name, not an ID
		if (optionsToSave.model_id && /^\d+$/.test(optionsToSave.model_id)) {
			throw new Error('model_id must be a model name, not a numeric ID');
		}
		
		const serialized = JSON.stringify(optionsToSave);
		localStorage.setItem(STORAGE_KEY, serialized);
	} catch (error) {
		console.error("Failed to save generation options to localStorage:", error);
	}
}

/**
 * Load generation options from localStorage
 *
 * Returns the saved options if available and valid, otherwise returns null
 */
export function loadGenerationOptions(): GenerationOptions | null {
	try {
		const serialized = localStorage.getItem(STORAGE_KEY);
		if (!serialized) return null;

		const parsed = JSON.parse(serialized);
		
		// If provider_id exists and is a number, convert it to string
		if (parsed.provider_id !== undefined && typeof parsed.provider_id === 'number') {
			parsed.provider_id = parsed.provider_id.toString();
		}
		
		// Check if model_id appears to be a numeric ID and not a name
		if (parsed.model_id && /^\d+$/.test(parsed.model_id)) {
			console.error('Invalid model_id format: Must be a model name, not a numeric ID');
			throw new Error('model_id must be a model name, not a numeric ID');
		}
		
		// Validate the loaded data against the schema
		return GenerationOptionsSchema.parse(parsed);
	} catch (error) {
		console.error(
			"Failed to load generation options from localStorage:",
			error,
		);
		// Remove potentially corrupted data
		localStorage.removeItem(STORAGE_KEY);
		return null;
	}
}

/**
 * Clear stored generation options from localStorage
 */
export function clearGenerationOptions(): void {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch (error) {
		console.error(
			"Failed to clear generation options from localStorage:",
			error,
		);
	}
}

/**
 * Hook to sync generation options with localStorage
 *
 * This hook can be used inside the GenerationOptionsProvider to:
 * 1. Initialize options from localStorage if available
 * 2. Save options to localStorage when they change
 */
export function usePersistGenerationOptions() {
	const loadPersistedOptions = (): Partial<GenerationOptions> => {
		const savedOptions = loadGenerationOptions();
		return savedOptions || {};
	};

	return {
		loadPersistedOptions,
		saveOptions: saveGenerationOptions,
		clearOptions: clearGenerationOptions,
	};
}
