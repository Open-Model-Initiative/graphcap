// SPDX-License-Identifier: Apache-2.0
import { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { ProviderCreate, ProviderUpdate } from '../../../../services/types/providers';
import { ProviderFormData } from '../form';
import { useProviderForm, useModelSelection } from '../../../../features/inference/hooks';

type ProviderFormContextType = {
  // Form state
  control: any;
  handleSubmit: any;
  errors: any;
  providerName: string;
  
  // Model selection state
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
  providerModelsData: any;
  isLoadingModels: boolean;
  isModelsError: boolean;
  modelsError: any;
  
  // Form actions
  handleModelSelect: () => void;
  isSubmitting: boolean;
  isCreating: boolean;
  
  // Form callbacks
  onSubmit: (data: ProviderFormData) => void;
  onCancel: () => void;
};

const ProviderFormContext = createContext<ProviderFormContextType | undefined>(undefined);

type ProviderFormProviderProps = {
  readonly children: ReactNode;
  readonly initialData?: Partial<ProviderCreate | ProviderUpdate>;
  readonly isCreating: boolean;
  readonly onSubmit: (data: ProviderFormData) => void;
  readonly onCancel: () => void;
  readonly isSubmitting: boolean;
  readonly onModelSelect?: (providerName: string, modelId: string) => void;
};

/**
 * Provider component for the ProviderForm context
 */
export function ProviderFormProvider({
  children,
  initialData = {},
  isCreating,
  onSubmit,
  onCancel,
  isSubmitting,
  onModelSelect
}: ProviderFormProviderProps) {
  // Use the form hook
  const { control, handleSubmit, errors, providerName } = useProviderForm(initialData);
  
  // Use the model selection hook
  const {
    selectedModelId,
    setSelectedModelId,
    providerModelsData,
    isLoadingModels,
    isModelsError,
    modelsError,
    handleModelSelect: handleModelSelectBase
  } = useModelSelection(providerName, onModelSelect);
  
  // Create a memoized version of handleModelSelect
  const handleModelSelect = useCallback(() => {
    handleModelSelectBase();
  }, [handleModelSelectBase]);
  
  // Create the context value wrapped in useMemo to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    // Form state
    control,
    handleSubmit,
    errors,
    providerName,
    
    // Model selection state
    selectedModelId,
    setSelectedModelId,
    providerModelsData,
    isLoadingModels,
    isModelsError,
    modelsError,
    
    // Form actions
    handleModelSelect,
    isSubmitting,
    isCreating,
    
    // Form callbacks
    onSubmit,
    onCancel
  }), [
    control, 
    handleSubmit, 
    errors, 
    providerName, 
    selectedModelId, 
    setSelectedModelId, 
    providerModelsData, 
    isLoadingModels, 
    isModelsError, 
    modelsError, 
    handleModelSelect, 
    isSubmitting, 
    isCreating, 
    onSubmit, 
    onCancel
  ]);
  
  return (
    <ProviderFormContext.Provider value={contextValue}>
      {children}
    </ProviderFormContext.Provider>
  );
}

/**
 * Hook to use the ProviderForm context
 */
export function useProviderFormContext() {
  const context = useContext(ProviderFormContext);
  
  if (context === undefined) {
    throw new Error('useProviderFormContext must be used within a ProviderFormProvider');
  }
  
  return context;
} 