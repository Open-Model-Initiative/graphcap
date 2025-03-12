// SPDX-License-Identifier: Apache-2.0
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProviderCreate, ProviderUpdate } from '../../../../services/types/providers';
import { providerFormSchema, ProviderFormData } from '../form/index';

/**
 * Custom hook for managing provider form state
 * 
 * @param initialData - Initial data for the form
 * @returns Form state and methods
 */
export function useProviderForm(initialData: Partial<ProviderCreate | ProviderUpdate> = {}) {
  const { 
    control, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm<ProviderFormData>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      name: initialData.name ?? '',
      kind: initialData.kind ?? '',
      environment: initialData.environment ?? 'cloud',
      baseUrl: initialData.baseUrl ?? '',
      envVar: initialData.envVar ?? '',
      isEnabled: initialData.isEnabled ?? true,
      rateLimits: {
        requestsPerMinute: initialData.rateLimits?.requestsPerMinute ?? 0,
        tokensPerMinute: initialData.rateLimits?.tokensPerMinute ?? 0
      }
    }
  });
  
  // Watch the name field for model selection
  const providerName = watch('name');
  
  return {
    control,
    handleSubmit,
    errors,
    providerName
  };
} 