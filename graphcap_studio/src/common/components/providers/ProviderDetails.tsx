// SPDX-License-Identifier: Apache-2.0
import { memo, useCallback } from 'react';
import { Provider } from '../../../services/types/providers';
import { useDeleteProvider, useUpdateProviderApiKey } from '../../../services/providers';

type ProviderDetailsProps = {
  readonly provider: Provider;
  readonly onEdit: () => void;
};

/**
 * Component for displaying provider details
 */
function ProviderDetails({ provider, onEdit }: ProviderDetailsProps) {
  const deleteProvider = useDeleteProvider();
  const updateApiKey = useUpdateProviderApiKey();
  
  const handleDelete = useCallback(() => {
    if (confirm(`Are you sure you want to delete ${provider.name}?`)) {
      deleteProvider.mutate(provider.id);
    }
  }, [provider.id, provider.name, deleteProvider]);
  
  const handleUpdateApiKey = useCallback(() => {
    const apiKey = prompt('Enter new API key:');
    if (apiKey) {
      updateApiKey.mutate({ id: provider.id, apiKey });
    }
  }, [provider.id, updateApiKey]);
  
  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-sm font-medium">{provider.name}</h3>
        <div className="flex space-x-2">
          <button
            className="text-xs px-2 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors duration-150"
            onClick={onEdit}
          >
            Edit
          </button>
          <button
            className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-150"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Kind</p>
          <p>{provider.kind}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Environment</p>
          <p>{provider.environment}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Base URL</p>
          <p className="break-all">{provider.baseUrl}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Environment Variable</p>
          <p>{provider.envVar}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">API Key</p>
          <div className="flex items-center space-x-2">
            <p>{provider.apiKey ? '••••••••' : 'Not set'}</p>
            <button
              className="text-xs px-2 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors duration-150"
              onClick={handleUpdateApiKey}
            >
              Update
            </button>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500">Status</p>
          <p>{provider.isEnabled ? 'Enabled' : 'Disabled'}</p>
        </div>
        
        {/* Models */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Models</p>
          {provider.models && provider.models.length > 0 ? (
            <ul className="text-xs space-y-1">
              {provider.models.map(model => (
                <li key={model.id} className="flex items-center justify-between">
                  <span>{model.name}</span>
                  <span className={`w-2 h-2 rounded-full ${model.isEnabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500">No models configured</p>
          )}
        </div>
        
        {/* Rate Limits */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Rate Limits</p>
          {provider.rateLimits ? (
            <ul className="text-xs space-y-1">
              {provider.rateLimits.requestsPerMinute && (
                <li>Requests per minute: {provider.rateLimits.requestsPerMinute}</li>
              )}
              {provider.rateLimits.tokensPerMinute && (
                <li>Tokens per minute: {provider.rateLimits.tokensPerMinute}</li>
              )}
            </ul>
          ) : (
            <p className="text-xs text-gray-500">No rate limits configured</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ProviderDetails); 