// SPDX-License-Identifier: Apache-2.0
import { useState, FormEvent, useCallback } from 'react';
import { Provider, ProviderCreate, ProviderUpdate } from '../../types/providers';
import { DEFAULT_PROVIDER_FORM_DATA } from '../constants';
import { useCreateProvider, useUpdateProvider } from '../../providers';

/**
 * Custom hook for managing provider form state and operations
 */
export function useProviderForm() {
  const [formData, setFormData] = useState<Partial<ProviderCreate | ProviderUpdate>>({
    ...DEFAULT_PROVIDER_FORM_DATA
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  
  // Mutations
  const createProvider = useCreateProvider();
  const updateProvider = useUpdateProvider();
  
  // Reset form to default values
  const resetForm = useCallback(() => {
    setFormData({ ...DEFAULT_PROVIDER_FORM_DATA });
  }, []);
  
  // Start creating a new provider
  const startCreating = useCallback(() => {
    setIsCreating(true);
    setSelectedProviderId(null);
    setIsEditing(false);
    resetForm();
  }, [resetForm]);
  
  // Start editing an existing provider
  const startEditing = useCallback((provider: Provider) => {
    setIsEditing(true);
    setIsCreating(false);
    setSelectedProviderId(provider.id);
    setFormData({
      name: provider.name,
      kind: provider.kind,
      environment: provider.environment,
      baseUrl: provider.baseUrl,
      envVar: provider.envVar,
      isEnabled: provider.isEnabled,
      models: provider.models,
      rateLimits: provider.rateLimits
    });
  }, []);
  
  // Cancel form editing/creating
  const cancelForm = useCallback(() => {
    setIsCreating(false);
    setIsEditing(false);
    resetForm();
  }, [resetForm]);
  
  // Handle form input changes
  const handleInputChange = useCallback((field: keyof Provider, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  // Handle form submission
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (isCreating) {
        await createProvider.mutateAsync(formData as ProviderCreate);
        setIsCreating(false);
      } else if (isEditing && selectedProviderId) {
        await updateProvider.mutateAsync({
          id: selectedProviderId,
          data: formData as ProviderUpdate
        });
        setIsEditing(false);
      }
      resetForm();
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
    return { success: true };
  }, [formData, isCreating, isEditing, selectedProviderId, createProvider, updateProvider, resetForm]);
  
  return {
    formData,
    isCreating,
    isEditing,
    selectedProviderId,
    setSelectedProviderId,
    handleInputChange,
    handleSubmit,
    startCreating,
    startEditing,
    cancelForm,
    isSubmitting: createProvider.isPending || updateProvider.isPending
  };
} 