// SPDX-License-Identifier: Apache-2.0
import { useState } from "react";
import { useTestProviderConnection } from "../../../services/providers";
import { useInferenceProviderContext } from "../../context";
import { type Provider, toServerConfig } from "../../types";

interface UseProviderConnectionResult {
  isTestingConnection: boolean;
  connectionError: Record<string, unknown> | string | null;
  connectionDetails: Record<string, unknown> | null;
  dialogs: {
    error: boolean;
    success: boolean;
  };
  handleTestConnection: () => Promise<void>;
  closeDialog: (dialog: 'error' | 'success') => void;
}

/**
 * Hook for managing provider connection testing
 */
export function useProviderConnection(selectedProvider: Provider | null): UseProviderConnectionResult {
  const { watch } = useInferenceProviderContext();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionError, setConnectionError] = useState<Record<string, unknown> | string | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<Record<string, unknown> | null>(null);
  const [dialogs, setDialogs] = useState({
    error: false,
    success: false
  });

  const testConnection = useTestProviderConnection();

  const closeDialog = (dialog: keyof typeof dialogs) => {
    setDialogs(prev => ({ ...prev, [dialog]: false }));
  };

  const handleTestConnection = async () => {
    // Get current form values
    const currentFormValues = {
      ...selectedProvider, // Base values from saved provider
      name: watch('name'),
      apiKey: watch('apiKey'),
      baseUrl: watch('baseUrl'),
      kind: watch('kind'),
      environment: watch('environment'),
      // Add other necessary fields from the form
    } as Provider;

    if (!currentFormValues.apiKey) {
      setConnectionError({
        title: "Connection failed",
        timestamp: new Date().toISOString(),
        message: "API key is required",
        name: "ValidationError",
        details: "Please provide an API key in the provider configuration.",
        suggestions: [
          "Enter an API key in the form",
          "API keys should be non-empty strings",
        ],
        requestDetails: {
          provider: currentFormValues.name,
          config: {
            ...toServerConfig(currentFormValues),
            api_key: '[MISSING]'
          }
        }
      });
      setDialogs(prev => ({ ...prev, error: true }));
      return;
    }

    setIsTestingConnection(true);
    setConnectionError(null);

    try {
      const config = toServerConfig(currentFormValues);
      const requestDetails = {
        provider: currentFormValues.name,
        config: {
          ...config,
          api_key: config.api_key ? '[REDACTED]' : undefined
        }
      };

      const result = await testConnection.mutateAsync({
        providerName: currentFormValues.name,
        config,
      });

      setConnectionDetails(result);
      setDialogs(prev => ({ ...prev, success: true }));
    } catch (error) {
      console.error("Connection test failed:", error);

      let errorObj: Record<string, unknown> = {
        title: "Connection failed",
        timestamp: new Date().toISOString(),
        requestDetails: {
          provider: currentFormValues.name,
          config: {
            ...toServerConfig(currentFormValues),
            api_key: '[REDACTED]'
          }
        }
      };

      if (error instanceof Error) {
        errorObj.message = error.message;
        errorObj.name = error.name;

        if (error.message?.includes("[object Object]")) {
          errorObj.message = "Invalid provider configuration";
          errorObj.details = "The server rejected the request due to invalid parameters.";
          errorObj.suggestions = [
            "Check API key and endpoint URL in the form",
            "Verify the provider configuration is correct",
            "Check server logs for more details",
          ];
        }

        if ('cause' in error && typeof error.cause === 'object') {
          errorObj.errorDetails = error.cause;
        }
      } else if (typeof error === "object" && error !== null) {
        errorObj = {
          ...errorObj,
          ...(error as Record<string, unknown>),
        };
      } else {
        errorObj.message = String(error);
      }

      setConnectionError(errorObj);
      setDialogs(prev => ({ ...prev, error: true }));
    } finally {
      setIsTestingConnection(false);
    }
  };

  return {
    isTestingConnection,
    connectionError,
    connectionDetails,
    dialogs,
    handleTestConnection,
    closeDialog,
  };
} 