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
  size?: "xs" | "sm" | "md" | "lg";
  width?: string | number;
  bg?: string;
  placeholder?: string;
}

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
  
  // Set placeholder text based on connection state
  const displayPlaceholder = !isConnected 
    ? "Connecting..." 
    : isProvidersLoading 
      ? "Loading..." 
      : placeholder;

  // Debug logging - simplified
  useEffect(() => {
    debugLog("CompactProviderSelector", "State:", {
      itemCount: providerCollection.items.length,
      selected: options.provider_name,
      isLoading: isProvidersLoading,
      isConnected
    });
  }, [providerCollection.items.length, options.provider_name, isProvidersLoading, isConnected]);

  return (
    <Box width={width}>
      <Select.Root
        collection={providerCollection}
        value={options.provider_name ? [options.provider_name] : []}
        onValueChange={handleProviderChange}
        disabled={isProvidersLoading || isGenerating || !isConnected}
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
              {providerCollection.items.map((provider) => (
                <Select.Item key={provider.value} item={provider}>
                  {provider.label}
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

  // Set placeholder text based on connection state
  const displayPlaceholder = !isConnected 
    ? "Connecting..." 
    : !hasProviders
      ? "No providers" 
      : isModelsLoading
        ? "Loading..."
        : placeholder;

  // Debug logging - simplified
  useEffect(() => {
    debugLog("CompactModelSelector", "State:", {
      itemCount: modelCollection.items.length,
      selected: options.model_name,
      isLoading: isModelsLoading,
      hasProviders,
      isConnected
    });
  }, [modelCollection.items.length, options.model_name, isModelsLoading, hasProviders, isConnected]);

  return (
    <Box width={width}>
      <Select.Root
        collection={modelCollection}
        value={options.model_name ? [options.model_name] : []}
        onValueChange={handleModelChange}
        disabled={isModelsLoading || !hasProviders || isGenerating || !isConnected}
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
              {modelCollection.items.map((model) => (
                <Select.Item key={model.value} item={model}>
                  {model.label}
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