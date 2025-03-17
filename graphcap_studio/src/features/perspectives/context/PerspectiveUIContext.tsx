// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective UI Context
 *
 * This context manages UI state and rendering utilities for perspectives.
 * It follows the Context API best practices and focuses exclusively on UI concerns.
 */

import React, {
	createContext,
	useContext,
	ReactNode,
	useEffect,
	useMemo,
	useState,
	useRef,
	useCallback,
} from "react";
import { PerspectiveSchema } from "../types";
import {
	getSelectedPerspective,
	saveSelectedPerspective,
} from "../utils/localStorage";

// Define the context type with explicit typing
interface PerspectiveUIContextType {
	// UI state
	activeSchemaName: string | null;
	expandedPanels: Record<string, boolean>;
	isLoading: boolean;
	isGenerated: boolean;

	// Options control
	optionsControl: {
		isOpen: boolean;
		onToggle: () => void;
		buttonRef: React.RefObject<HTMLButtonElement | null>;
	};

	// UI actions
	setActiveSchemaName: (schemaName: string | null) => void;
	togglePanelExpansion: (panelId: string) => void;
	setAllPanelsExpanded: (expanded: boolean) => void;
	setIsLoading: (isLoading: boolean) => void;
	setIsGenerated: (isGenerated: boolean) => void;

	// Rendering utilities
	renderField: (
		field: PerspectiveSchema["schema_fields"][0],
		value: any,
	) => ReactNode;
}

// Create context with undefined default value
const PerspectiveUIContext = createContext<
	PerspectiveUIContextType | undefined
>(undefined);

/**
 * Error type for when the PerspectiveUIContext is used outside of a provider
 */
export class PerspectiveUIProviderError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "PerspectiveUIProviderError";
	}
}

interface PerspectiveUIProviderProps {
	readonly children: ReactNode;
}

/**
 * Provider component for perspective UI state and utilities
 * Focused exclusively on UI concerns
 */
export function PerspectiveUIProvider({
	children,
}: PerspectiveUIProviderProps) {
	// UI state - initialize with value from localStorage if available
	const [activeSchemaName, setActiveSchemaName] = useState<string | null>(
		getSelectedPerspective,
	);
	const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>(
		{},
	);
	const [isLoading, setIsLoading] = useState(false);
	const [isGenerated, setIsGenerated] = useState(false);

	// Option panel controls
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const [isOptionsOpen, setIsOptionsOpen] = useState(false);

	const toggleOptions = useCallback(() => {
		setIsOptionsOpen((prev) => !prev);
	}, []);

	// Persist activeSchemaName to localStorage when it changes
	useEffect(() => {
		if (activeSchemaName) {
			saveSelectedPerspective(activeSchemaName);
		}
	}, [activeSchemaName]);

	// Wrapper for setActiveSchemaName to also save to localStorage
	const handleActiveSchemaNameChange = useCallback(
		(schemaName: string | null) => {
			setActiveSchemaName(schemaName);
			if (schemaName) {
				saveSelectedPerspective(schemaName);
			}
		},
		[],
	);

	// Panel expansion handlers
	const togglePanelExpansion = useCallback((panelId: string) => {
		setExpandedPanels((prev) => ({
			...prev,
			[panelId]: !prev[panelId],
		}));
	}, []);

	const setAllPanelsExpanded = useCallback((expanded: boolean) => {
		setExpandedPanels((prev) => {
			const newState = { ...prev };
			Object.keys(newState).forEach((key) => {
				newState[key] = expanded;
			});
			return newState;
		});
	}, []);

	// Field rendering utility function
	const renderField = useCallback(
		(field: PerspectiveSchema["schema_fields"][0], value: any) => {
			try {
				if (!field) return null;

				if (field.is_list && field.is_complex && field.fields) {
					return (
						<div className="space-y-2">
							{Array.isArray(value) &&
								value.map((item: any, index: number) => (
									<div
										key={`${field.name}-${index}`}
										className="bg-gray-800 p-2 rounded"
									>
										{field.fields?.map((subField: any) => (
											<div key={subField.name} className="text-sm">
												<span className="text-gray-400">{subField.name}: </span>
												<span className="text-gray-200">
													{subField.type === "float" &&
													typeof item[subField.name] === "number"
														? item[subField.name].toFixed(2)
														: item[subField.name]}
												</span>
											</div>
										))}
									</div>
								))}
						</div>
					);
				}

				if (field.type === "str") {
					return <p className="text-gray-200">{value}</p>;
				}

				if (field.type === "float" && typeof value === "number") {
					return <p className="text-gray-200">{value.toFixed(2)}</p>;
				}

				return null;
			} catch (error) {
				console.error("Error rendering field:", error);
				return (
					<p className="text-red-500 text-sm">
						Error rendering field:{" "}
						{error instanceof Error ? error.message : "Unknown error"}
					</p>
				);
			}
		},
		[],
	);

	// Create context value object wrapped in useMemo
	const value = useMemo<PerspectiveUIContextType>(
		() => ({
			// UI state
			activeSchemaName,
			expandedPanels,
			isLoading,
			isGenerated,

			// Options control
			optionsControl: {
				isOpen: isOptionsOpen,
				onToggle: toggleOptions,
				buttonRef,
			},

			// UI actions
			setActiveSchemaName: handleActiveSchemaNameChange,
			togglePanelExpansion,
			setAllPanelsExpanded,
			setIsLoading,
			setIsGenerated,

			// Rendering utilities
			renderField,
		}),
		[
			activeSchemaName,
			expandedPanels,
			isLoading,
			isGenerated,
			isOptionsOpen,
			toggleOptions,
			buttonRef,
			handleActiveSchemaNameChange,
			togglePanelExpansion,
			setAllPanelsExpanded,
			renderField,
		],
	);

	return (
		<PerspectiveUIContext.Provider value={value}>
			{children}
		</PerspectiveUIContext.Provider>
	);
}

/**
 * Hook to access perspective UI context
 * Must be used within a PerspectiveUIProvider
 */
export function usePerspectiveUI() {
	const context = useContext(PerspectiveUIContext);

	if (context === undefined) {
		console.error(
			"usePerspectiveUI was called outside of a PerspectiveUIProvider",
		);
		throw new PerspectiveUIProviderError(
			"usePerspectiveUI must be used within a PerspectiveUIProvider",
		);
	}

	return context;
}
