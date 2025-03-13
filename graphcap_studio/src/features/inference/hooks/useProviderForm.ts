// SPDX-License-Identifier: Apache-2.0
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Provider, ProviderCreate, ProviderUpdate } from '@/features/inference/providers/types';
import { DEFAULT_PROVIDER_FORM_DATA } from '../constants';
import { useCreateProvider, useUpdateProvider } from '@/features/inference/services/providers';

type FormData = ProviderCreate | ProviderUpdate;

/**
 * Custom hook for managing provider form state and operations
 */
export function useProviderForm(initialData: Partial<FormData> = {}) {
  // Track selected provider
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Initialize react-hook-form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue
  } = useForm<FormData>({
    defaultValues: {
      ...DEFAULT_PROVIDER_FORM_DATA,
      ...initialData
    }
  });

  // Watch the provider name for use in UI
  const providerName = watch('name');
  
  // Mutations
  const createProvider = useCreateProvider();
  const updateProvider = useUpdateProvider();

  // Start creating a new provider
  const startCreating = useCallback(() => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedProviderId(null);
    reset(DEFAULT_PROVIDER_FORM_DATA);
  }, [reset]);

  // Start editing an existing provider
  const startEditing = useCallback((provider: Provider) => {
    setIsEditing(true);
    setIsCreating(false);
    setSelectedProviderId(provider.id);
    reset({
      name: provider.name,
      kind: provider.kind,
      environment: provider.environment,
      baseUrl: provider.baseUrl,
      envVar: provider.envVar,
      isEnabled: provider.isEnabled,
      models: provider.models,
      rateLimits: provider.rateLimits
    });
  }, [reset]);

  // Cancel form editing/creating
  const cancelForm = useCallback(() => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedProviderId(null);
    reset(DEFAULT_PROVIDER_FORM_DATA);
  }, [reset]);
  
  // Handle form submission
  const onSubmit = useCallback(async (data: FormData) => {
    try {
      if (isCreating) {
        await createProvider.mutateAsync(data as ProviderCreate);
        setIsCreating(false);
      } else if (isEditing && selectedProviderId) {
        await updateProvider.mutateAsync({
          id: selectedProviderId,
          data: data as ProviderUpdate
        });
        setIsEditing(false);
      }
      reset(DEFAULT_PROVIDER_FORM_DATA);
      setSelectedProviderId(null);
      return { success: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [isCreating, isEditing, selectedProviderId, createProvider, updateProvider, reset]);
  
  return {
    // Form state
    control,
    handleSubmit,
    errors,
    watch,
    providerName,
    
    // Provider selection state
    selectedProviderId,
    setSelectedProviderId,
    
    // Form mode
    isCreating,
    isEditing,
    
    // Actions
    startCreating,
    startEditing,
    cancelForm,
    onSubmit,
    
    // Loading state
    isSubmitting: createProvider.isPending || updateProvider.isPending
  };
} 