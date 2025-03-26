// SPDX-License-Identifier: Apache-2.0
import { useState } from "react";
import { useTestProviderConnection } from "../../../services/providers";
import { useInferenceProviderContext } from "../../context";
import { type Provider, type ProviderCreate, type ProviderUpdate, toServerConfig } from "../../types";

interface UseProviderFormResult {
  mode: 'view' | 'edit' | 'create';
  isSubmitting: boolean;
  saveSuccess: boolean;
  isTestingConnection: boolean;
  selectedProvider?: Provider | null;
  formError: unknown;
  connectionError: Record<string, unknown> | string | null;
  connectionDetails: Record<string, unknown> | null;
  dialogs: {
    error: boolean;
    success: boolean;
    formError: boolean;
  };
  onSubmit: (data: ProviderCreate | ProviderUpdate) => Promise<void>;
  handleSubmit: (handler: (data: ProviderCreate | ProviderUpdate) => Promise<void>) => (e: React.FormEvent) => void;
  handleTestConnection: () => Promise<void>;
  setMode: (mode: 'view' | 'edit' | 'create') => void;
  closeDialog: (dialog: 'error' | 'success' | 'formError') => void;
}

/**
 * Custom hook that manages provider form state and logic
 */
export function useProviderForm(selectedProvider: Provider | null): UseProviderFormResult {
  const {
    handleSubmit,
    isSubmitting,
    onSubmit: onSubmitProp,
    mode,
    setMode,
  } = useInferenceProviderContext();

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionError, setConnectionError] = useState<Record<string, unknown> | string | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<Record<string, unknown> | null>(null);
  const [formError, setFormError] = useState<unknown | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dialogs, setDialogs] = useState({
    error: false,
    success: false,
    formError: false
  });

  const testConnection = useTestProviderConnection();

  const closeDialog = (dialog: keyof typeof dialogs) => {
    setDialogs(prev => ({ ...prev, [dialog]: false }));
  };

  const onSubmit = async (data: ProviderCreate | ProviderUpdate) => {
    try {
      setFormError(null);
      setSaveSuccess(false);
      await onSubmitProp(data);
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Provider form submission error:", error);
      setFormError(error);
      setDialogs(prev => ({ ...prev, formError: true }));
    }
  };

  const handleTestConnection = async () => {
    if (!selectedProvider) return;

    // Validate API key is present
    if (!selectedProvider.apiKey) {
      setConnectionError({
        title: "Connection failed",
        timestamp: new Date().toISOString(),
        message: "API key is required",
        name: "ValidationError",
        details: "Please provide an API key in the provider configuration.",
        suggestions: [
          "Edit the provider to add an API key",
          "API keys should be non-empty strings",
        ],
      });
      setDialogs(prev => ({ ...prev, error: true }));
      return;
    }

    setIsTestingConnection(true);
    setConnectionError(null);

    try {
      const config = toServerConfig(selectedProvider);
      const result = await testConnection.mutateAsync({
        providerName: selectedProvider.name,
        config,
      });

      setConnectionDetails(result);
      setDialogs(prev => ({ ...prev, success: true }));
    } catch (error) {
      console.error("Connection test failed:", error);

      let errorObj: Record<string, unknown> = {
        title: "Connection failed",
        timestamp: new Date().toISOString(),
      };

      if (error instanceof Error) {
        errorObj.message = error.message;
        errorObj.name = error.name;

        if (error.message?.includes("[object Object]")) {
          errorObj.message = "Invalid provider configuration";
          errorObj.details = "The server rejected the request due to invalid parameters.";
          errorObj.suggestions = [
            "Check API key and endpoint URL",
            "Verify the provider is correctly configured",
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
    mode,
    isSubmitting,
    saveSuccess,
    isTestingConnection,
    selectedProvider,
    formError,
    connectionError,
    connectionDetails,
    dialogs,
    onSubmit,
    handleSubmit,
    handleTestConnection,
    setMode,
    closeDialog,
  };
} 