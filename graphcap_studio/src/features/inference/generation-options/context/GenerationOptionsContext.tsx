// SPDX-License-Identifier: Apache-2.0
/**
 * Generation Options Context
 *
 * This module provides a context for managing generation options state.
 */

import {
	DEFAULT_OPTIONS,
	type GenerationOptions,
	GenerationOptionsSchema,
} from "@/types/generation-option-types";
import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { usePersistGenerationOptions } from "../persist-generation-options";

// Define the context interface
interface GenerationOptionsContextValue {
	// State
	options: GenerationOptions;
	isDialogOpen: boolean;
	isGenerating: boolean;

	// Actions
	updateOption: <K extends keyof GenerationOptions>(
		key: K,
		value: GenerationOptions[K],
	) => void;
	resetOptions: () => void;
	setOptions: (options: Partial<GenerationOptions>) => void;
	openDialog: () => void;
	closeDialog: () => void;
	toggleDialog: () => void;
	setIsGenerating: (isGenerating: boolean) => void;
}

// Create the context with a default value
const GenerationOptionsContext = createContext<
	GenerationOptionsContextValue | undefined
>(undefined);

// Provider props interface
interface GenerationOptionsProviderProps {
	readonly children: React.ReactNode;
	readonly initialOptions?: Partial<GenerationOptions>;
	readonly onOptionsChange?: (options: GenerationOptions) => void;
	readonly initialGenerating?: boolean;
}

/**
 * Provider component for generation options
 */
export function GenerationOptionsProvider({
	children,
	initialOptions = {},
	onOptionsChange,
	initialGenerating = false,
}: Readonly<GenerationOptionsProviderProps>) {
	const { loadPersistedOptions, saveOptions } = usePersistGenerationOptions();

	// Parse initial options through the schema to ensure valid defaults
	const defaultOptions = useMemo(() => {
		// Merge defaults with persisted options and initialOptions (with initialOptions taking precedence)
		const persistedOptions = loadPersistedOptions();
		const mergedOptions = {
			...DEFAULT_OPTIONS,
			...persistedOptions,
			...initialOptions,
		};
		return GenerationOptionsSchema.parse(mergedOptions);
	}, [initialOptions, loadPersistedOptions]);

	// State
	const [options, setOptions] = useState<GenerationOptions>(defaultOptions);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isGenerating, setIsGenerating] = useState(initialGenerating);

	// Save options to localStorage when they change
	useEffect(() => {
		saveOptions(options);
	}, [options, saveOptions]);

	// Update generating state when initialGenerating changes
	useEffect(() => {
		setIsGenerating(initialGenerating);
	}, [initialGenerating]);

	// Update a single option
	const updateOption = useCallback(
		<K extends keyof GenerationOptions>(
			key: K,
			value: GenerationOptions[K],
		) => {
			setOptions((prev) => {
				const newOptions = { ...prev, [key]: value };
				// Notify parent if callback is provided
				if (onOptionsChange) {
					onOptionsChange(newOptions);
				}
				return newOptions;
			});
		},
		[onOptionsChange],
	);

	// Reset options to defaults
	const resetOptions = useCallback(() => {
		setOptions(defaultOptions);
		if (onOptionsChange) {
			onOptionsChange(defaultOptions);
		}
	}, [defaultOptions, onOptionsChange]);

	// Set multiple options at once
	const mergeOptions = useCallback(
		(newOptions: Partial<GenerationOptions>) => {
			setOptions((prev) => {
				const updatedOptions = { ...prev, ...newOptions };
				if (onOptionsChange) {
					onOptionsChange(updatedOptions);
				}
				return updatedOptions;
			});
		},
		[onOptionsChange],
	);

	// Dialog controls
	const openDialog = useCallback(() => setIsDialogOpen(true), []);
	const closeDialog = useCallback(() => setIsDialogOpen(false), []);
	const toggleDialog = useCallback(() => setIsDialogOpen((prev) => !prev), []);

	// Context value
	const value = useMemo(
		() => ({
			// State
			options,
			isDialogOpen,
			isGenerating,

			// Actions
			updateOption,
			resetOptions,
			setOptions: mergeOptions,
			openDialog,
			closeDialog,
			toggleDialog,
			setIsGenerating,
		}),
		[
			options,
			isDialogOpen,
			isGenerating,
			updateOption,
			resetOptions,
			mergeOptions,
			openDialog,
			closeDialog,
			toggleDialog,
		],
	);

	return (
		<GenerationOptionsContext.Provider value={value}>
			{children}
		</GenerationOptionsContext.Provider>
	);
}

/**
 * Hook to access the generation options context
 */
export function useGenerationOptions() {
	const context = useContext(GenerationOptionsContext);

	if (context === undefined) {
		throw new Error(
			"useGenerationOptions must be used within a GenerationOptionsProvider",
		);
	}

	return context;
}

// Export a named export for the context
export { GenerationOptionsContext };
