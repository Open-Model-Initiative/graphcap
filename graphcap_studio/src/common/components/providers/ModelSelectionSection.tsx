// SPDX-License-Identifier: Apache-2.0
import { ChangeEvent } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import { FormField, Select, Button } from './form/index';
import { useProviderFormContext } from './context';

// Define the model type
interface ProviderModel {
  id: string;
  name: string;
  is_default?: boolean;
}

/**
 * Component for selecting a model from a provider
 */
export function ModelSelectionSection() {
  const {
    providerName,
    selectedModelId,
    setSelectedModelId,
    providerModelsData,
    isLoadingModels,
    isModelsError,
    modelsError,
    handleModelSelect
  } = useProviderFormContext();

  if (!providerName) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
        <p className="text-sm">Please enter a provider name to view available models.</p>
      </div>
    );
  }
  
  if (isLoadingModels) {
    return (
      <div className="flex items-center justify-center py-2">
        <Loader className="w-4 h-4 mr-2 animate-spin" />
        <span>Loading models...</span>
      </div>
    );
  }
  
  if (isModelsError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium">Error loading models</h3>
            <p className="text-sm">
              {modelsError instanceof Error ? modelsError.message : 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!providerModelsData?.models || providerModelsData.models.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium">No models available</h3>
            <p className="text-sm">
              This provider has no available models.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <FormField id="model" label="Model">
        <Select
          value={selectedModelId}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedModelId(e.target.value)}
          options={providerModelsData.models.map((model: ProviderModel) => ({
            value: model.id,
            label: `${model.name}${model.is_default ? ' (Default)' : ''}`
          }))}
        />
      </FormField>
      
      <div className="flex justify-end mt-2">
        <Button 
          type="button" 
          onClick={handleModelSelect}
          disabled={!selectedModelId}
        >
          Use Selected Model
        </Button>
      </div>
    </div>
  );
} 