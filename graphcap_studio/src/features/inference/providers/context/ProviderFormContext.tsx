// SPDX-License-Identifier: Apache-2.0
import { createContext, useContext, ReactNode, useCallback, useMemo, useState, useEffect } from 'react';
import { Provider, ProviderCreate, ProviderUpdate } from '../types';
import { useProviderForm, useModelSelection } from '../../hooks';

type ViewMode = 'view' | 'edit' | 'create';
type FormData = ProviderCreate | ProviderUpdate;

type ProviderFormContextType = {
  // View state
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  selectedProvider: Provider | null;
  setSelectedProvider: (provider: Provider | null) => void;
  
  // Form state
  control: any;
  handleSubmit: any;
  errors: any;
  watch: any;
  providerName: string | undefined;
  
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
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
};

const ProviderFormContext = createContext<ProviderFormContextType | undefined>(undefined);

export function useProviderFormContext() {
  const context = useContext(ProviderFormContext);
  if (!context) {
    throw new Error('useProviderFormContext must be used within a ProviderFormProvider');
  }
  return context;
}

type ProviderFormProviderProps = {
  readonly children: ReactNode;
  readonly initialData?: Partial<ProviderCreate | ProviderUpdate>;
  readonly isCreating: boolean;
  readonly onSubmit: (data: FormData) => void;
  readonly onCancel: () => void;
  readonly isSubmitting: boolean;
  readonly onModelSelect?: (providerName: string, modelId: string) => void;
  readonly selectedProvider?: Provider | null;
};

/**
 * Provider component for the ProviderForm context
 */
export function ProviderFormProvider({
  children,
  initialData = {},
  isCreating,
  onSubmit: onSubmitProp,
  onCancel,
  isSubmitting,
  onModelSelect,
  selectedProvider: selectedProviderProp
}: ProviderFormProviderProps) {
  // View state
  const [mode, setMode] = useState<ViewMode>(isCreating ? 'create' : 'view');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(selectedProviderProp || null);
  
  // Update selected provider when prop changes
  useEffect(() => {
    setSelectedProvider(selectedProviderProp || null);
  }, [selectedProviderProp]);
  
  // Use the form hook
  const { control, handleSubmit, errors, providerName, onSubmit: onSubmitForm, watch } = useProviderForm(initialData);
  
  // Use the model selection hook with null check
  const {
    selectedModelId,
    setSelectedModelId,
    providerModelsData,
    isLoadingModels,
    isModelsError,
    modelsError,
    handleModelSelect: handleModelSelectBase
  } = useModelSelection(selectedProvider?.name || '', onModelSelect);
  
  // Create a memoized version of handleModelSelect
  const handleModelSelect = useCallback(() => {
    handleModelSelectBase();
  }, [handleModelSelectBase]);

  // Create a memoized version of onSubmit that calls both form and prop handlers
  const onSubmitHandler = useCallback(async (data: FormData) => {
    const result = await onSubmitForm(data);
    if (result.success) {
      onSubmitProp(data);
      setMode('view');
    }
  }, [onSubmitForm, onSubmitProp]);

  // Create a memoized version of onCancel that resets mode
  const onCancelHandler = useCallback(() => {
    setMode('view');
    onCancel();
  }, [onCancel]);
  
  // Create the context value
  const contextValue = useMemo(() => ({
    // View state
    mode,
    setMode,
    selectedProvider,
    setSelectedProvider,
    
    // Form state
    control,
    handleSubmit,
    errors,
    watch,
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
    onSubmit: onSubmitHandler,
    onCancel: onCancelHandler
  }), [
    mode,
    selectedProvider,
    control, 
    handleSubmit, 
    errors, 
    watch, 
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
    onSubmitHandler, 
    onCancelHandler
  ]);

  return (
    <ProviderFormContext.Provider value={contextValue}>
      {children}
    </ProviderFormContext.Provider>
  );
} 