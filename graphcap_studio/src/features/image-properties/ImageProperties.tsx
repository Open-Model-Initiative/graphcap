// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';
import { Image } from '@/services/images';
import { BasicInformation, FileInformation, Segments, LoadingState, ErrorState } from './components';
import { useImageProperties } from './hooks';
import { Perspectives } from '@/common/components/perspectives';
import { PerspectivesProvider } from '@/common/components/perspectives/context/PerspectivesContext';

interface ImagePropertiesProps {
  readonly image: Image | null;
  readonly isLoading?: boolean;
  readonly error?: string | null;
}

/**
 * Component for displaying image properties and metadata
 */
export function ImageProperties({ image, isLoading = false, error = null }: ImagePropertiesProps) {
  const [activeTab, setActiveTab] = useState<string>('basic');
  
  // Get image properties data
  const { 
    properties, 
    isLoading: propertiesLoading, 
    error: propertiesError,
    newTag,
    isEditing,
    setNewTag,
    handlePropertyChange,
    handleAddTag,
    handleRemoveTag,
    handleSave,
    setIsEditing
  } = useImageProperties(image);
  
  // Toggle editing function
  const toggleEditing = () => setIsEditing(!isEditing);
  
  // Combine loading and error states
  const isLoadingState = isLoading || propertiesLoading;
  const errorState = error ?? propertiesError;
  
  // Define tabs
  const tabs = [
    { id: 'basic', label: 'Basic' },
    { id: 'file', label: 'File' },
    { id: 'segments', label: 'Segments' },
    { id: 'perspectives', label: 'Perspectives' }
  ];
  
  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };
  
  // Render loading state
  if (isLoadingState) {
    return <LoadingState />;
  }
  
  // Render error state
  if (errorState) {
    return <ErrorState message={errorState} />;
  }
  
  // Render no image selected state
  if (!image) {
    return (
      <div className="p-4 text-center text-gray-400">
        <p>No image selected</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-4 px-4" aria-label="Image properties tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-3 px-1 text-sm font-medium border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'basic' && properties && (
          <BasicInformation 
            properties={properties}
            isEditing={isEditing}
            newTag={newTag}
            onPropertyChange={handlePropertyChange}
            onNewTagChange={setNewTag}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onSave={handleSave}
            onToggleEdit={toggleEditing}
          />
        )}
        
        {activeTab === 'file' && (
          <FileInformation image={image} />
        )}
        
        {activeTab === 'segments' && (
          <Segments image={image} />
        )}
        
        {activeTab === 'perspectives' && (
          <PerspectivesProvider>
            <Perspectives image={image} />
          </PerspectivesProvider>
        )}
      </div>
    </div>
  );
} 