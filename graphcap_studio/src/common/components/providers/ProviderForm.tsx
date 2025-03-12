// SPDX-License-Identifier: Apache-2.0
import { memo } from 'react';
import { Provider, ProviderCreate, ProviderUpdate } from '../../../services/types/providers';
import { PROVIDER_ENVIRONMENTS } from '../../../services/providers/constants';

type ProviderFormProps = {
  readonly formData: Partial<ProviderCreate | ProviderUpdate>;
  readonly isCreating: boolean;
  readonly onInputChange: (field: keyof Provider, value: any) => void;
  readonly onSubmit: (e: React.FormEvent) => void;
  readonly onCancel: () => void;
  readonly isSubmitting: boolean;
};

/**
 * Component for provider creation/editing form
 */
function ProviderForm({ 
  formData, 
  isCreating, 
  onInputChange, 
  onSubmit, 
  onCancel,
  isSubmitting 
}: ProviderFormProps) {
  // Determine the button text based on state
  const getButtonText = () => {
    if (isSubmitting) return 'Saving...';
    return isCreating ? 'Create' : 'Save';
  };

  return (
    <form onSubmit={onSubmit} className="p-4">
      <h3 className="text-sm font-medium mb-4">
        {isCreating ? 'Add Provider' : 'Edit Provider'}
      </h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs text-gray-500 mb-1">Name</label>
          <input
            id="name"
            type="text"
            value={formData.name ?? ''}
            onChange={(e) => onInputChange('name', e.target.value)}
            className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="kind" className="block text-xs text-gray-500 mb-1">Kind</label>
          <input
            id="kind"
            type="text"
            value={formData.kind ?? ''}
            onChange={(e) => onInputChange('kind', e.target.value)}
            className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="environment" className="block text-xs text-gray-500 mb-1">Environment</label>
          <select
            id="environment"
            value={formData.environment ?? 'cloud'}
            onChange={(e) => onInputChange('environment', e.target.value)}
            className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
          >
            {PROVIDER_ENVIRONMENTS.map(env => (
              <option key={env} value={env}>{env}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="baseUrl" className="block text-xs text-gray-500 mb-1">Base URL</label>
          <input
            id="baseUrl"
            type="url"
            value={formData.baseUrl ?? ''}
            onChange={(e) => onInputChange('baseUrl', e.target.value)}
            className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="envVar" className="block text-xs text-gray-500 mb-1">Environment Variable</label>
          <input
            id="envVar"
            type="text"
            value={formData.envVar ?? ''}
            onChange={(e) => onInputChange('envVar', e.target.value)}
            className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isEnabled"
            checked={formData.isEnabled ?? false}
            onChange={(e) => onInputChange('isEnabled', e.target.checked)}
            className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isEnabled" className="text-xs">Enabled</label>
        </div>
        
        <div>
          <label htmlFor="rateLimits" className="block text-xs text-gray-500 mb-1">Rate Limits</label>
          <div className="space-y-2">
            <div>
              <label htmlFor="requestsPerMinute" className="block text-xs text-gray-500">Requests per minute</label>
              <input
                id="requestsPerMinute"
                type="number"
                value={formData.rateLimits?.requestsPerMinute ?? 0}
                onChange={(e) => onInputChange('rateLimits', {
                  ...formData.rateLimits,
                  requestsPerMinute: parseInt(e.target.value)
                })}
                className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="tokensPerMinute" className="block text-xs text-gray-500">Tokens per minute</label>
              <input
                id="tokensPerMinute"
                type="number"
                value={formData.rateLimits?.tokensPerMinute ?? 0}
                onChange={(e) => onInputChange('rateLimits', {
                  ...formData.rateLimits,
                  tokensPerMinute: parseInt(e.target.value)
                })}
                className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                min="0"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            className="text-xs px-3 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors duration-150"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-150"
            disabled={isSubmitting}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </form>
  );
}

export default memo(ProviderForm); 