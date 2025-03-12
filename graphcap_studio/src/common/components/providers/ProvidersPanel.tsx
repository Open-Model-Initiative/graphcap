// SPDX-License-Identifier: Apache-2.0
import { useMemo } from 'react';
import { useProviders } from '../../../services/providers';
import { useDatabaseHealth, useProviderForm } from '../../../services/providers/hooks';
import ProvidersList from './ProvidersList';
import ProviderDetails from './ProviderDetails';
import ProviderForm from './ProviderForm';

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
    handleInputChange,
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
        <button
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-150"
          onClick={startCreating}
        >
          Add Provider
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Provider List */}
        {!isCreating && !isEditing && (
          <ProvidersList 
            providers={providers} 
            selectedProviderId={selectedProviderId} 
            onSelectProvider={handleSelectProvider} 
          />
        )}
        
        {/* Provider Details */}
        {selectedProvider && !isCreating && !isEditing && (
          <ProviderDetails 
            provider={selectedProvider} 
            onEdit={handleEditProvider} 
          />
        )}
        
        {/* Create/Edit Form */}
        {(isCreating || isEditing) && (
          <ProviderForm 
            formData={formData}
            isCreating={isCreating}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={cancelForm}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
} 