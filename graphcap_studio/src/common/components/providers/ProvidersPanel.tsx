// SPDX-License-Identifier: Apache-2.0
import { useMemo } from 'react';
import { useProviders } from '../../../services/providers';
import { useDatabaseHealth, useProviderForm } from '../../../services/providers/hooks';
import ProviderDetails from './ProviderDetails';
import ProviderForm from './ProviderForm';
import { ProviderSelect } from './form';

/**
 * Providers Panel Component
 * 
 * This component displays a list of providers and allows for CRUD operations
 * on provider configurations.
 */
export function ProvidersPanel() {
  // Custom hooks
  const { isConnected, checkDatabaseConnection } = useDatabaseHealth();
  const { 
    formData, 
    isCreating, 
    isEditing, 
    selectedProviderId, 
    setSelectedProviderId,
    handleSubmit,
    startCreating,
    startEditing,
    cancelForm,
    isSubmitting
  } = useProviderForm();
  
  // Fetch providers
  const { 
    data: providers = [], 
    isLoading, 
    isError, 
    error 
  } = useProviders();
  
  // Get selected provider
  const selectedProvider = useMemo(() => 
    providers.find(p => p.id === selectedProviderId),
    [providers, selectedProviderId]
  );
  
  // Handle provider selection
  const handleSelectProvider = (id: number) => {
    setSelectedProviderId(id);
  };
  
  // Handle edit button click
  const handleEditProvider = () => {
    if (selectedProvider) {
      startEditing(selectedProvider);
    }
  };

  // Handle model selection
  const handleModelSelect = (providerName: string, modelId: string) => {
    console.log(`Selected model: ${modelId} from provider: ${providerName}`);
    // Add your logic here to handle the selected model
  };
  
  // Render based on connection status
  if (!isConnected) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500 mb-2">Data Service is not connected</p>
        <p className="text-xs">Connect to the Data Service to manage providers</p>
      </div>
    );
  }
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm">Loading providers...</p>
      </div>
    );
  }
  
  // Render error state
  if (isError) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-red-500 mb-2">Error loading providers</p>
        <p className="text-xs mb-4">{error instanceof Error ? error.message : String(error)}</p>
        <button
          className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-150"
          onClick={async () => {
            const result = await checkDatabaseConnection();
            if (result.success) {
              alert(result.message);
            } else if (result.error) {
              alert(`Database error: ${result.error}`);
            }
          }}
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
        <div className="flex space-x-2">
          <button
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-150"
            onClick={startCreating}
          >
            Add Provider
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Provider Selection Dropdown */}
        {!isCreating && !isEditing && providers.length > 0 && (
          <div className="p-4 border-b">
            <div className="mb-2">
              <span id="provider-select-label" className="block text-xs text-gray-500 mb-1">Select Provider</span>
              <ProviderSelect
                providers={providers}
                selectedProviderId={selectedProviderId}
                onChange={handleSelectProvider}
                className="w-full"
                aria-labelledby="provider-select-label"
              />
            </div>
          </div>
        )}
        
        {/* Provider Details */}
        {selectedProvider && !isCreating && !isEditing && (
          <ProviderDetails 
            provider={selectedProvider} 
            onEdit={handleEditProvider} 
          />
        )}
        
        {/* No Provider Selected Message */}
        {!selectedProvider && !isCreating && !isEditing && providers.length > 0 && (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">Select a provider to view details</p>
          </div>
        )}
        
        {/* Empty State */}
        {providers.length === 0 && !isCreating && !isEditing && (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500 mb-2">No providers configured</p>
            <p className="text-xs mb-4">Click "Add Provider" to create your first provider</p>
          </div>
        )}
        
        {/* Create/Edit Form */}
        {(isCreating || isEditing) && (
          <ProviderForm 
            initialData={formData}
            isCreating={isCreating}
            onSubmit={() => {
              // Convert the data to the format expected by handleSubmit
              const event = { preventDefault: () => {} } as React.FormEvent;
              handleSubmit(event);
            }}
            onCancel={cancelForm}
            isSubmitting={isSubmitting}
            onModelSelect={handleModelSelect}
          />
        )}
      </div>
    </div>
  );
} 