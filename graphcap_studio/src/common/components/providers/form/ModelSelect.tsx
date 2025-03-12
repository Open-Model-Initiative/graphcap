// SPDX-License-Identifier: Apache-2.0
import { UseFormRegister } from 'react-hook-form';
import { ProviderModelInfo } from '../../../../services/types/providers';
import { Loader, AlertCircle } from 'lucide-react';

interface ModelSelectProps {
  readonly models: readonly ProviderModelInfo[];
  readonly register: UseFormRegister<any>;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error?: any;
  readonly className?: string;
  readonly labelClassName?: string;
}

/**
 * A reusable model select component
 */
export default function ModelSelect({
  models,
  register,
  isLoading,
  isError,
  error,
  className = 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  labelClassName = 'block text-sm font-medium mb-1',
}: ModelSelectProps) {
  
  const renderLoadingState = () => (
    <div className="flex items-center justify-center py-2">
      <Loader className="w-4 h-4 mr-2 animate-spin" />
      <span>Loading models...</span>
    </div>
  );

  const renderErrorState = () => (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 mr-2 mt-0.5" />
        <div>
          <h3 className="font-medium">Error loading models</h3>
          <p className="text-sm">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderEmptyModelsState = () => (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 mr-2 mt-0.5" />
        <div>
          <h3 className="font-medium">No models available</h3>
          <p className="text-sm">
            This provider has no available models. Please select a different provider.
          </p>
        </div>
      </div>
    </div>
  );

  const renderModelSelect = () => (
    <select
      id="model"
      className={className}
      {...register('model')}
    >
      {models.map((model) => (
        <option key={model.id} value={model.id}>
          {model.name} {model.is_default ? '(Default)' : ''}
        </option>
      ))}
    </select>
  );

  const renderContent = () => {
    if (isLoading) {
      return renderLoadingState();
    }
    
    if (isError) {
      return renderErrorState();
    }
    
    if (models.length === 0) {
      return renderEmptyModelsState();
    }
    
    return renderModelSelect();
  };

  return (
    <div className="mb-4">
      <label htmlFor="model" className={labelClassName}>
        Model
      </label>
      {renderContent()}
    </div>
  );
} 