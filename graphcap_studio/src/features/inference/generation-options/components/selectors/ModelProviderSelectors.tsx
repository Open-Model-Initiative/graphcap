// SPDX-License-Identifier: Apache-2.0
/**
 * Reusable Provider and Model Selector Components
 *
 * Provides core selector components that can be composed into different layouts
 * while sharing the same data source and behavior.
 */

import { useServerConnectionsContext } from "@/context/ServerConnectionsContext";
import { queryKeys } from "@/features/inference/services/providers";
import { SERVER_IDS } from "@/features/server-connections/constants";
import { debugLog } from "@/utils/logger";
import { Box, Portal, Select, createListCollection } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useGenerationOptions } from "../../context";

// Component name for logging
const COMPONENT_NAME = "ModelProviderSelectors";

/**
 * Hook that provides common model and provider selection functionality
 */
export function useModelProviderSelectors() {
  const { 
    options, 
    providers, 
    models,
    actions,
    uiState
  } = useGenerationOptions();
  
  const { selectProvider, selectModel } = actions;
  const { isGenerating } = uiState;
  
  // Get connection status directly
  const { connections } = useServerConnectionsContext();
  const dataServiceConnection = connections.find(
    (conn) => conn.id === SERVER_IDS.DATA_SERVICE,
  );
  const isConnected = dataServiceConnection?.status === "connected";
  
  // Need query client to trigger refetch
  const queryClient = useQueryClient();
  
  // Track connection status for re-fetching
  const connectionRef = useRef<boolean | null>(null);

  // Debug logging - simplified to essentials
  useEffect(() => {
    debugLog(COMPONENT_NAME, "Provider state:", {
      itemCount: providers.items.length,
      selected: providers.selected,
      isLoading: providers.isLoading,
      hasError: !!providers.error
    });
  }, [providers]);

  useEffect(() => {
    debugLog(COMPONENT_NAME, "Model state:", {
      itemCount: models.items.length,
      defaultModel: models.defaultModel,
      isLoading: models.isLoading,
      hasError: !!models.error
    });
  }, [models]);
  
  // Re-fetch providers when connection status changes
  useEffect(() => {
    // If connection status changed from disconnected to connected
    if (connectionRef.current === false && isConnected === true) {
      debugLog(COMPONENT_NAME, "Connection status changed to connected, refreshing providers");
      // Invalidate providers query to trigger refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.providers });
    }
    
    // Update ref with current status
    connectionRef.current = isConnected;
  }, [isConnected, queryClient]);

  // Create collections for selects - always include at least one item
  const providerCollection = createListCollection({
    items: providers.items.length > 0
      ? providers.items.map((provider) => ({
        label: provider.name,
        value: provider.name,
        disabled: false,
      }))
      : [{ label: "No providers available", value: "none", disabled: false }]
  });

  // Create model collection using names as both label and value
  const modelCollection = createListCollection({
    items: models.items.length > 0
      ? models.items.map((model) => ({
        label: model.name,
        value: model.name,
        disabled: false,
      }))
      : [{ label: "No models available", value: "none", disabled: false }]
  });

  // Handle provider change
  const handleProviderChange = (details: { value: string[] }) => {
    if (details.value.length > 0 && details.value[0] !== "none") {
      debugLog(COMPONENT_NAME, "Selecting provider:", details.value[0]);
      selectProvider(details.value[0]);
    }
  };

  // Handle model change
  const handleModelChange = (details: { value: string[] }) => {
    if (details.value.length > 0 && details.value[0] !== "none") {
      debugLog(COMPONENT_NAME, "Selecting model:", details.value[0]);
      selectModel(details.value[0]);
    }
  };

  // Check if any providers are available
  const hasProviders = providers.items.length > 0;
  
  // Loading state
  const isProvidersLoading = providers.isLoading;
  const isModelsLoading = models.isLoading;

  return {
    options,
    providerCollection,
    modelCollection,
    handleProviderChange,
    handleModelChange,
    hasProviders,
    isProvidersLoading,
    isModelsLoading,
    isGenerating
  };
}

interface SelectorProps {
  readonly size?: "xs" | "sm" | "md" | "lg";
  readonly width?: string | number;
  readonly bg?: string;
  readonly placeholder?: string;
}

// ---- Base Selector Component ----

// Interface for individual select items
interface SelectItem {
  value: string;
  label: string;
  disabled: boolean;
}

// Simplified collection type for props
interface SimpleCollection<T> {
  items: T[];
}

interface CompactSelectorBaseProps {
  readonly collection: SimpleCollection<SelectItem> & ReturnType<typeof createListCollection>;
  readonly value: string | undefined;
  readonly onValueChange: (details: { value: string[] }) => void;
  readonly isDisabled: boolean;
  readonly displayPlaceholder: string;
  readonly size?: "xs" | "sm" | "md" | "lg";
  readonly width?: string | number;
  readonly bg?: string;
}

/**
 * Base component for rendering a compact Select input.
 * Handles the common UI structure and state.
 */
function CompactSelectorBase({
  collection,
  value,
  onValueChange,
  isDisabled,
  displayPlaceholder,
  size = "sm",
  width = "full",
  bg,
}: CompactSelectorBaseProps) {
  return (
    <Box width={width}>
      <Select.Root
        collection={collection}
        value={value ? [value] : []}
        onValueChange={onValueChange}
        disabled={isDisabled}
        size={size}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger bg={bg}>
            <Select.ValueText placeholder={displayPlaceholder} />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>

        <Portal>
          <Select.Positioner>
            <Select.Content>
              {collection.items.map((item) => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </Box>
  );
}

// ---- Specific Selector Implementations ----

/**
 * Provider Selector Component using the shared generation options context
 */
export function CompactProviderSelector({ 
  size = "sm", 
  width = "full", 
  bg,
  placeholder = "Select provider"
}: SelectorProps) {
  const {
    options,
    providerCollection,
    handleProviderChange,
    isProvidersLoading,
    isGenerating
  } = useModelProviderSelectors();
  
  // Get connection status directly
  const { connections } = useServerConnectionsContext();
  const dataServiceConnection = connections.find(
    (conn) => conn.id === SERVER_IDS.DATA_SERVICE,
  );
  const isConnected = dataServiceConnection?.status === "connected";
  
  // Determine placeholder text
  let displayPlaceholder: string;
  if (!isConnected) {
    displayPlaceholder = "Connecting...";
  } else if (isProvidersLoading) {
    displayPlaceholder = "Loading...";
  } else if (providerCollection.items.length === 1 && providerCollection.items[0].value === 'none') {
    // Handle the case where the collection only contains the 'none' item
    displayPlaceholder = providerCollection.items[0].label;
  } else {
    displayPlaceholder = placeholder;
  }

  // Determine disabled state
  const isDisabled = isProvidersLoading || isGenerating || !isConnected;

  // Debug logging - simplified
  useEffect(() => {
    debugLog("CompactProviderSelector", "State:", {
      itemCount: providerCollection.items.length,
      selected: options.provider_name,
      isLoading: isProvidersLoading,
      isConnected,
      isDisabled,
    });
  }, [providerCollection.items.length, options.provider_name, isProvidersLoading, isConnected, isDisabled]);

  return (
    <CompactSelectorBase
      collection={providerCollection}
      value={options.provider_name}
      onValueChange={handleProviderChange}
      isDisabled={isDisabled}
      displayPlaceholder={displayPlaceholder}
      size={size}
      width={width}
      bg={bg}
    />
  );
}

/**
 * Model Selector Component using the shared generation options context
 */
export function CompactModelSelector({ 
  size = "sm", 
  width = "full", 
  bg,
  placeholder = "Select model"
}: SelectorProps) {
  const {
    options,
    modelCollection,
    handleModelChange,
    hasProviders,
    isModelsLoading,
    isGenerating
  } = useModelProviderSelectors();
  
  // Get connection status directly
  const { connections } = useServerConnectionsContext();
  const dataServiceConnection = connections.find(
    (conn) => conn.id === SERVER_IDS.DATA_SERVICE,
  );
  const isConnected = dataServiceConnection?.status === "connected";

  // Determine placeholder text
  let displayPlaceholder: string;
  if (!isConnected) {
    displayPlaceholder = "Connecting...";
  } else if (!hasProviders) {
    displayPlaceholder = "No providers";
  } else if (isModelsLoading) {
    displayPlaceholder = "Loading...";
  } else if (modelCollection.items.length === 1 && modelCollection.items[0].value === 'none') {
     // Handle the case where the collection only contains the 'none' item
    displayPlaceholder = modelCollection.items[0].label;
  } else {
    displayPlaceholder = placeholder;
  }

  // Determine disabled state
  const isDisabled = isModelsLoading || !hasProviders || isGenerating || !isConnected;

  // Debug logging - simplified
  useEffect(() => {
    debugLog("CompactModelSelector", "State:", {
      itemCount: modelCollection.items.length,
      selected: options.model_name,
      isLoading: isModelsLoading,
      hasProviders,
      isConnected,
      isDisabled,
    });
  }, [modelCollection.items.length, options.model_name, isModelsLoading, hasProviders, isConnected, isDisabled]);

  return (
    <CompactSelectorBase
      collection={modelCollection}
      value={options.model_name}
      onValueChange={handleModelChange}
      isDisabled={isDisabled}
      displayPlaceholder={displayPlaceholder}
      size={size}
      width={width}
      bg={bg}
    />
  );
} 