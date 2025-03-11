// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';
import { 
  useProviders, 
  useCreateProvider, 
  useUpdateProvider, 
  useDeleteProvider, 
  useUpdateProviderApiKey 
} from '../../../services/providers';
import { Provider, ProviderCreate, ProviderUpdate } from '../../../services/types/providers';
import { SERVER_IDS } from '../../constants';
import { useServerConnectionsContext } from '../../context/ServerConnectionsContext';

/**
 * Providers Panel Component
 * 
 * This component displays a list of providers and allows for CRUD operations
 * on provider configurations.
 */
export function ProvidersPanel() {
  const { connections } = useServerConnectionsContext();
  const dataServiceConnection = connections.find(conn => conn.id === SERVER_IDS.DATA_SERVICE);
  const isConnected = dataServiceConnection?.status === 'connected';
  
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch providers
  const { 
    data: providers = [], 
    isLoading, 
    isError, 
    error 
  } = useProviders();
  
  // Mutations
  const createProvider = useCreateProvider();
  const updateProvider = useUpdateProvider();
  const deleteProvider = useDeleteProvider();
  const updateApiKey = useUpdateProviderApiKey();
  
  // Handle provider selection
  const handleSelectProvider = (id: number) => {
    setSelectedProviderId(id);
    setIsEditing(false);
  };
  
  // Get selected provider
  const selectedProvider = providers.find(p => p.id === selectedProviderId);
  
  // Check database connection
  const checkDatabaseConnection = async () => {
    try {
      const response = await fetch(`${dataServiceConnection?.url}/health/db`);
      if (response.ok) {
        alert('Database connection is healthy');
      } else {
        const data = await response.json();
        alert(`Database error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Failed to check database health: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  if (!isConnected) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500 mb-2">Data Service is not connected</p>
        <p className="text-xs">Connect to the Data Service to manage providers</p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm">Loading providers...</p>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-red-500 mb-2">Error loading providers</p>
        <p className="text-xs mb-4">{error instanceof Error ? error.message : String(error)}</p>
        <button
          className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-150"
          onClick={checkDatabaseConnection}
        >
          Check Database Connection
        </button>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b flex justify-between items-center">
        <h3 className="text-sm font-medium">Providers</h3>
        <button
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-150"
          onClick={() => {
            setIsCreating(true);
            setSelectedProviderId(null);
            setIsEditing(false);
          }}
        >
          Add Provider
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Provider List */}
        {!isCreating && !isEditing && (
          <div className="divide-y">
            {providers.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No providers configured
              </div>
            ) : (
              providers.map(provider => (
                <div 
                  key={provider.id}
                  className={`p-3 cursor-pointer transition-colors duration-150 hover:bg-gray-800 ${
                    selectedProviderId === provider.id ? 'bg-gray-800' : ''
                  }`}
                  onClick={() => handleSelectProvider(provider.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">{provider.name}</h4>
                      <p className="text-xs text-gray-500">{provider.kind}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${provider.isEnabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Provider Details */}
        {selectedProvider && !isCreating && !isEditing && (
          <div className="p-4">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-sm font-medium">{selectedProvider.name}</h3>
              <div className="flex space-x-2">
                <button
                  className="text-xs px-2 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors duration-150"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
                <button
                  className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-150"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${selectedProvider.name}?`)) {
                      deleteProvider.mutate(selectedProvider.id);
                      setSelectedProviderId(null);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Kind</p>
                <p>{selectedProvider.kind}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Environment</p>
                <p>{selectedProvider.environment}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Base URL</p>
                <p className="break-all">{selectedProvider.baseUrl}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Environment Variable</p>
                <p>{selectedProvider.envVar}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">API Key</p>
                <div className="flex items-center space-x-2">
                  <p>{selectedProvider.apiKey ? '••••••••' : 'Not set'}</p>
                  <button
                    className="text-xs px-2 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors duration-150"
                    onClick={() => {
                      const apiKey = prompt('Enter new API key:');
                      if (apiKey) {
                        updateApiKey.mutate({ id: selectedProvider.id, apiKey });
                      }
                    }}
                  >
                    Update
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p>{selectedProvider.isEnabled ? 'Enabled' : 'Disabled'}</p>
              </div>
              
              {/* Models */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Models</p>
                {selectedProvider.models && selectedProvider.models.length > 0 ? (
                  <ul className="text-xs space-y-1">
                    {selectedProvider.models.map(model => (
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
                {selectedProvider.rateLimits ? (
                  <ul className="text-xs space-y-1">
                    {selectedProvider.rateLimits.requestsPerMinute && (
                      <li>Requests per minute: {selectedProvider.rateLimits.requestsPerMinute}</li>
                    )}
                    {selectedProvider.rateLimits.tokensPerMinute && (
                      <li>Tokens per minute: {selectedProvider.rateLimits.tokensPerMinute}</li>
                    )}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500">No rate limits configured</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Create/Edit Form would go here */}
        {/* This is a simplified placeholder - a real implementation would have proper form handling */}
        {(isCreating || isEditing) && (
          <div className="p-4">
            <h3 className="text-sm font-medium mb-4">
              {isCreating ? 'Add Provider' : 'Edit Provider'}
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Form implementation would go here with fields for:
              </p>
              <ul className="text-xs list-disc pl-5 space-y-1">
                <li>Name</li>
                <li>Kind</li>
                <li>Environment</li>
                <li>Base URL</li>
                <li>Environment Variable</li>
                <li>API Key</li>
                <li>Enabled/Disabled</li>
                <li>Models</li>
                <li>Rate Limits</li>
              </ul>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  className="text-xs px-3 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors duration-150"
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-150"
                  onClick={() => {
                    // In a real implementation, this would submit the form data
                    setIsCreating(false);
                    setIsEditing(false);
                  }}
                >
                  {isCreating ? 'Create' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 