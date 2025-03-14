// SPDX-License-Identifier: Apache-2.0
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Provider, ProviderCreate, ProviderUpdate } from '@/features/inference/providers/types';
import { DEFAULT_PROVIDER_FORM_DATA } from '../constants';
import { useCreateProvider, useUpdateProvider } from '@/features/inference/services/providers';

type FormData = ProviderCreate | ProviderUpdate;

/**
 * Custom hook for managing provider form state and operations
 */
export function useProviderForm(initialData: Partial<FormData> = {}) {
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

  // Handle form submission
  const onSubmit = useCallback(async (data: FormData, isCreating: boolean, providerId?: number) => {
    try {
      if (isCreating) {
        await createProvider.mutateAsync(data as ProviderCreate);
      } else if (providerId) {
        await updateProvider.mutateAsync({
          id: providerId,
          data: data as ProviderUpdate
        });
      }
      reset(DEFAULT_PROVIDER_FORM_DATA);
      return { success: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [createProvider, updateProvider, reset]);
  
  return {
    // Form state
    control,
    handleSubmit,
    errors,
    watch,
    providerName,
    reset,
    
    // Form submission
    onSubmit,
    
    // Loading state
    isSubmitting: createProvider.isPending || updateProvider.isPending
  };
} 