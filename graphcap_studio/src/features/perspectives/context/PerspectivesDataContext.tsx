// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Data Context
 *
 * This consolidated context provides all data-related functionality:
 * 1. Provider management (selection, fetching)
 * 2. Perspectives data (schemas, metadata)
 * 3. Caption generation and storage
 * 4. Server connection status
 */

import { useServerConnectionsContext } from "@/context";
import { useGenerationOptions } from "@/features/inference/generation-options/context";
import { SERVER_IDS } from "@/features/server-connections/constants";
import { useProviders } from "@/features/server-connections/services/providers";
import type { Image } from "@/services/images";
import type {
	Perspective,
	PerspectiveData,
	PerspectiveSchema
} from "@/types";
import type { GenerationOptions } from "@/types/generation-option-types";
import type { Provider } from "@/types/provider-config-types";
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { useGeneratePerspectiveCaption } from "../hooks/useGeneratePerspectiveCaption";
import { usePerspectives } from "../hooks/usePerspectives";
import {
	getAllPerspectiveCaptions,
	loadHiddenPerspectives,
	saveHiddenPerspectives,
	savePerspectiveCaption,
} from "../utils";

// Local storage key for selected perspective provider
const SELECTED_PERSPECTIVE_PROVIDER_KEY =
	"graphcap-selected-perspective-provider";

/**
 * Save provider name to localStorage
 * @param providerName - The provider name to save
 */
const saveProviderNameToStorage = (providerName: string | undefined) => {
	try {
		if (providerName !== undefined) {
			localStorage.setItem(SELECTED_PERSPECTIVE_PROVIDER_KEY, providerName);
		} else {
			localStorage.removeItem(SELECTED_PERSPECTIVE_PROVIDER_KEY);
		}
	} catch (error) {
		console.error(
			"Error saving perspective provider name to localStorage:",
			error,
		);
	}
};

/**
 * Load provider name from localStorage
 * @returns The selected provider name, or undefined if none is stored
 */
const loadProviderNameFromStorage = (): string | undefined => {
	try {
		const storedProvider = localStorage.getItem(
			SELECTED_PERSPECTIVE_PROVIDER_KEY,
		);
		return storedProvider ?? undefined;
	} catch (error) {
		console.error(
			"Error loading perspective provider name from localStorage:",
			error,
		);
		return undefined;
	}
};

// Define the context type with explicit typing
interface PerspectivesDataContextType {
	// Provider state
	selectedProvider: string | undefined;
	availableProviders: Provider[];
	isGeneratingAll: boolean;

	// Provider actions
	setSelectedProvider: (provider: string | undefined) => void;
	setAvailableProviders: (providers: Provider[]) => void;
	setIsGeneratingAll: (isGenerating: boolean) => void;
	handleProviderChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;

	// Data fetching
	fetchProviders: () => Promise<void>;
	isLoadingProviders: boolean;
	providerError: unknown;

	// Perspectives data
	perspectives: Perspective[];
	schemas: Record<string, PerspectiveSchema>;
	isLoadingPerspectives: boolean;
	perspectivesError: Error | null;
	refetchPerspectives: () => Promise<Perspective[]>;

	// Captions data
	captions: Record<string, unknown>;
	generatedPerspectives: string[];
	isGenerating: boolean;
	isServerConnected: boolean;

	// Generation options from the GenerationOptions context
	generationOptions: GenerationOptions;

	// Current image
	currentImage: Image | null;
	setCurrentImage: (image: Image | null) => void;

	// Generation operations
	generatePerspective: (
		schemaName: string,
		imagePath: string,
		provider?: Provider,
		options?: GenerationOptions,
	) => Promise<unknown>;

	// Status helpers
	isPerspectiveGenerated: (schemaName: string) => boolean;
	isPerspectiveGenerating: (schemaName: string) => boolean;

	// Data helpers
	getPerspectiveData: (schemaName: string) => Record<string, unknown> | null;

	// Perspective visibility
	hiddenPerspectives: string[];
	togglePerspectiveVisibility: (perspectiveName: string) => void;
	isPerspectiveVisible: (perspectiveName: string) => boolean;
	setAllPerspectivesVisible: () => void;
}

/**
 * Create the context with an undefined initial value
 * We'll check inside the hook that it's used within a provider
 */
const PerspectivesDataContext = createContext<
	PerspectivesDataContextType | undefined
>(undefined);

// Custom error class for provider errors
export class PerspectivesDataProviderError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "PerspectivesDataProviderError";
	}
}

interface PerspectivesDataProviderProps {
	readonly children: ReactNode;
	readonly image: Image | null;
	readonly initialProvider?: string;
	readonly initialProviders?: Provider[];
}

/**
 * Provider component for perspectives data
 * @param props - Provider props
 */
export function PerspectivesDataProvider({
	children,
	image: initialImage,
	initialProvider,
	initialProviders = [],
}: PerspectivesDataProviderProps) {
	// Server connection state
	const { connections } = useServerConnectionsContext();
	const graphcapServerConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.INFERENCE_BRIDGE,
	);
	const isServerConnected = graphcapServerConnection?.status === "connected";

	// Get generation options from context
	const generationOptions = useGenerationOptions();

	// Current image state
	const [currentImage, setCurrentImage] = useState<Image | null>(initialImage);

	// Provider state
	const [selectedProvider, setSelectedProvider] = useState<string | undefined>(
		initialProvider ?? loadProviderNameFromStorage(),
	);
	const [availableProviders, setAvailableProviders] =
		useState<Provider[]>(initialProviders);
	const [isGeneratingAll, setIsGeneratingAll] = useState(false);

	// Captions state
	const [captions, setCaptions] = useState<Record<string, unknown>>({});

	// Generation state
	const [generatingPerspectives, setGeneratingPerspectives] = useState<
		string[]
	>([]);

	// Perspective visibility state
	const [hiddenPerspectives, setHiddenPerspectives] = useState<string[]>(
		loadHiddenPerspectives(),
	);

	// Data fetching - perspectives
	const {
		data: perspectivesData,
		isLoading: isLoadingPerspectives,
		error: perspectivesError,
		refetch: refetchPerspectivesQuery,
	} = usePerspectives();

	// Data fetching - providers
	const {
		data: providersData,
		isLoading: isLoadingProviders,
		error: providerError,
		refetch: refetchProviders,
	} = useProviders();

	// Generate caption mutation
	const generateCaptionMutation = useGeneratePerspectiveCaption();

	// Save selected provider when it changes
	useEffect(() => {
		saveProviderNameToStorage(selectedProvider);
	}, [selectedProvider]);

	// Save hidden perspectives when they change
	useEffect(() => {
		saveHiddenPerspectives(hiddenPerspectives);
	}, [hiddenPerspectives]);

	// Convert perspectives array to schemas record for easier access
	const schemas = React.useMemo(() => {
		if (!perspectivesData) return {};

		return perspectivesData.reduce(
			(acc, perspective) => {
				if (perspective.schema) {
					acc[perspective.name] = perspective.schema;
				}
				return acc;
			},
			{} as Record<string, PerspectiveSchema>,
		);
	}, [perspectivesData]);

	// Update providers when data is fetched
	useEffect(() => {
		if (providersData) {
			setAvailableProviders(providersData);
		}
	}, [providersData]);

	// Update current image when initialImage changes
	useEffect(() => {
		setCurrentImage(initialImage);
	}, [initialImage]);

	// Provider change handler
	const handleProviderChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			try {
				const value = e.target.value;
				setSelectedProvider(value || undefined);
			} catch (error) {
				console.error("Error handling provider change:", error);
				// Continue with undefined provider on error
				setSelectedProvider(undefined);
			}
		},
		[],
	);

	// Toggle perspective visibility
	const togglePerspectiveVisibility = useCallback((perspectiveName: string) => {
		setHiddenPerspectives((prev) => {
			if (prev.includes(perspectiveName)) {
				// If already hidden, make it visible (remove from hidden list)
				return prev.filter((name) => name !== perspectiveName);
			}
			// If visible, hide it (add to hidden list)
			return [...prev, perspectiveName];
		});
	}, []);

	// Check if a perspective is visible
	const isPerspectiveVisible = useCallback(
		(perspectiveName: string) => {
			return !hiddenPerspectives.includes(perspectiveName);
		},
		[hiddenPerspectives],
	);

	// Make all perspectives visible
	const setAllPerspectivesVisible = useCallback(() => {
		setHiddenPerspectives([]);
	}, []);

	// Method to fetch providers on demand
	const fetchProviders = useCallback(async () => {
		await refetchProviders();
	}, [refetchProviders]);

	// Refetch perspectives and return the data
	const refetchPerspectives = useCallback(async (): Promise<Perspective[]> => {
		if (!isServerConnected) {
			throw new Error(
				"Cannot refetch perspectives: Server connection not established",
			);
		}

		try {
			const result = await refetchPerspectivesQuery();
			return result.data ?? [];
		} catch (error) {
			console.error("Error refetching perspectives:", error);
			throw error;
		}
	}, [isServerConnected, refetchPerspectivesQuery]);

	// Load captions from localStorage when image changes
	useEffect(() => {
		if (!currentImage) {
			setCaptions({});
			return;
		}

		// Load all captions for this image from localStorage using the image path
		const storedPerspectives = getAllPerspectiveCaptions(currentImage.path);

		// Format captions to match expected structure
		if (Object.keys(storedPerspectives).length > 0) {
			setCaptions({
				perspectives: storedPerspectives,
				metadata: {
					captioned_at: new Date().toISOString(),
					// Use metadata from the first perspective as a fallback
					provider:
						Object.values(storedPerspectives)[0]?.provider || selectedProvider,
					model: Object.values(storedPerspectives)[0]?.model || "unknown",
				},
			});
		} else {
			setCaptions({});
		}
	}, [currentImage, selectedProvider]);

	// Get generated perspectives based on captions
	const generatedPerspectives = React.useMemo(() => {
		const perspectives = captions.perspectives as Record<string, unknown> | undefined;
		if (!perspectives) return [];
		return Object.keys(perspectives);
	}, [captions]);

	// Generate a perspective caption and save to localStorage
	const generatePerspective = useCallback(
		async (
			schemaName: string,
			imagePath: string,
			provider?: Provider,
			options?: GenerationOptions,
		) => {
			if (!isServerConnected) {
				throw new Error(
					"Cannot generate caption: Server connection not established",
				);
			}

			if (!currentImage) return;

			try {
				// Add to generating list
				setGeneratingPerspectives((prev) => [...prev, schemaName]);

				// Use provided provider or get the selected provider by name from available providers
				let effectiveProvider = provider;
				if (!effectiveProvider && selectedProvider) {
					// Find the provider object by name
					effectiveProvider = availableProviders.find(p => p.name === selectedProvider);
				}

				if (!effectiveProvider) {
					throw new Error("No provider selected for caption generation");
				}

				// Get current options from GenerationOptions context if not provided
				const effectiveOptions = options || generationOptions.options;
				
				// Log the options to ensure they're being passed correctly
				console.debug(`Generating perspective "${schemaName}" with options:`, {
					providedOptions: options,
					contextOptions: generationOptions.options,
					finalOptions: effectiveOptions,
					provider: effectiveProvider,
				});

				// Use the direct mutation to generate caption via API
				const result = await generateCaptionMutation.mutateAsync({
					perspective: schemaName,
					imagePath,
					provider: effectiveProvider,
					options: effectiveOptions,
				});

				// Validate required data
				if (!result.metadata?.model) {
					console.error(
						`ERROR: Missing model information in API response for perspective ${schemaName}`,
					);
				}

				// Format the data as PerspectiveData object
				const perspectiveData = {
					config_name: schemaName,
					version: "1.0",
					model: result.metadata?.model ?? effectiveOptions.model_name ?? "MISSING_MODEL",
					provider: effectiveProvider.name,
					content: result.result || {},
					options: {
						model: effectiveOptions.model_name,
						max_tokens: effectiveOptions.max_tokens,
						temperature: effectiveOptions.temperature,
						top_p: effectiveOptions.top_p,
						repetition_penalty: effectiveOptions.repetition_penalty,
						global_context: effectiveOptions.global_context,
						context: effectiveOptions.context,
						resize_resolution: effectiveOptions.resize_resolution
					},
					metadata: {
						provider: effectiveProvider.name,
						model: result.metadata?.model ?? effectiveOptions.model_name ?? "MISSING_MODEL",
						version: "1.0",
						config_name: schemaName,
						generatedAt: new Date().toISOString()
					}
				};

				// Save the perspective directly to localStorage
				savePerspectiveCaption(imagePath, schemaName, perspectiveData);

				// Update captions state with this new perspective data
				setCaptions((prev) => {
					const prevPerspectives = (prev.perspectives || {}) as Record<string, unknown>;
					const newCaptions = {
						...prev,
						perspectives: {
							...prevPerspectives,
							[schemaName]: perspectiveData,
						},
						metadata: {
							captioned_at: new Date().toISOString(),
							provider: effectiveProvider?.name || "",
							model: result.metadata?.model ?? effectiveOptions.model_name ?? "unknown",
						},
					};

					return newCaptions;
				});

				// Return the result for chaining
				return result;
			} catch (error) {
				console.error(`Error generating perspective "${schemaName}":`, error);
				throw error;
			} finally {
				// Remove from generating list whether successful or failed
				setGeneratingPerspectives((prev) =>
					prev.filter((p) => p !== schemaName),
				);
			}
		},
		[
			isServerConnected,
			currentImage,
			selectedProvider,
			availableProviders,
			generationOptions.options,
			generateCaptionMutation,
		],
	);

	// Helper to check if a perspective is generated
	const isPerspectiveGenerated = useCallback(
		(schemaName: string) => {
			const perspectives = captions.perspectives as Record<string, unknown> | undefined;
			return !!perspectives?.[schemaName];
		},
		[captions],
	);

	// Helper to check if a perspective is currently generating
	const isPerspectiveGenerating = useCallback(
		(schemaName: string) => {
			return generatingPerspectives.includes(schemaName);
		},
		[generatingPerspectives],
	);

	// Helper to get the data for a specific perspective
	const getPerspectiveData = useCallback(
		(schemaName: string) => {
			// Try to get data from our in-memory state
			const perspectives = captions.perspectives as Record<string, PerspectiveData> | undefined;
			const perspectiveData = perspectives?.[schemaName];

			console.debug("getPerspectiveData for", schemaName, perspectiveData);

			// Always return the complete perspective data object
			// to preserve options and metadata
			return perspectiveData ? { ...perspectiveData } as Record<string, unknown> : null;
		},
		[captions],
	);

	// Create consolidated context value
	const value = useMemo<PerspectivesDataContextType>(() => ({
		// Provider state
		selectedProvider,
		availableProviders,
		isGeneratingAll,

		// Provider actions
		setSelectedProvider,
		setAvailableProviders,
		setIsGeneratingAll,
		handleProviderChange,

		// Data fetching - providers
		fetchProviders,
		isLoadingProviders,
		providerError,

		// Perspectives data
		perspectives: perspectivesData || [],
		schemas,
		isLoadingPerspectives,
		perspectivesError,
		refetchPerspectives,

		// Captions data
		captions,
		generatedPerspectives,
		isGenerating: generatingPerspectives.length > 0,
		isServerConnected,

		// Generation options from context
		generationOptions: generationOptions.options,

		// Current image
		currentImage,
		setCurrentImage,

		// Generation operations
		generatePerspective,

		// Status helpers
		isPerspectiveGenerated,
		isPerspectiveGenerating,

		// Data helpers
		getPerspectiveData,

		// Perspective visibility
		hiddenPerspectives,
		togglePerspectiveVisibility,
		isPerspectiveVisible,
		setAllPerspectivesVisible,
	}), [
		selectedProvider,
		availableProviders,
		isGeneratingAll,
		handleProviderChange,
		fetchProviders,
		isLoadingProviders,
		providerError,
		perspectivesData,
		schemas,
		isLoadingPerspectives,
		perspectivesError,
		refetchPerspectives,
		captions,
		generatedPerspectives,
		generatingPerspectives.length,
		isServerConnected,
		generationOptions.options,
		currentImage,
		generatePerspective,
		isPerspectiveGenerated,
		isPerspectiveGenerating,
		getPerspectiveData,
		hiddenPerspectives,
		togglePerspectiveVisibility,
		isPerspectiveVisible,
		setAllPerspectivesVisible
	]);

	return (
		<PerspectivesDataContext.Provider value={value}>
			{children}
		</PerspectivesDataContext.Provider>
	);
}

/**
 * Hook to access perspectives data context
 * Must be used within a PerspectivesDataProvider
 */
export function usePerspectivesData() {
	const context = useContext(PerspectivesDataContext);

	if (context === undefined) {
		console.error(
			"usePerspectivesData was called outside of a PerspectivesDataProvider",
		);
		throw new PerspectivesDataProviderError(
			"usePerspectivesData must be used within a PerspectivesDataProvider",
		);
	}

	return context;
}
