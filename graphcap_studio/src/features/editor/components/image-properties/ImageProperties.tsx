// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';
import { Image } from '@/services/images';
import { useImageProperties } from './hooks';
import { 
  BasicInformation, 
  FileInformation, 
  LoadingState, 
  ErrorState,
  Perspectives,
  Segments
} from './components';

interface ImagePropertiesProps {
  image: Image;
  onSave?: (properties: Record<string, any>) => void;
}

type TabType = 'basic' | 'perspectives' | 'segments';

/**
 * A component for displaying and editing image properties
 * 
 * This component uses the EditorContext through the useImageProperties hook
 * to access datasets and other shared state.
 */
export function ImageProperties({ 
  image, 
  onSave 
}: ImagePropertiesProps) {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  
  const {
    properties,
    newTag,
    isEditing,
    isLoading,
    error,
    setNewTag,
    handlePropertyChange,
    handleAddTag,
    handleRemoveTag,
    handleSave,
    toggleEditing
  } = useImageProperties(image);

  // Call the onSave prop if provided
  const handleSaveWithCallback = () => {
    handleSave();
    if (onSave) {
      onSave(properties);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'basic'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('basic')}
        >
          Basic
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'perspectives'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('perspectives')}
        >
          Perspectives
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'segments'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('segments')}
        >
          Segments
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'basic' && (
        <>
          <BasicInformation
            properties={properties}
            isEditing={isEditing}
            newTag={newTag}
            onPropertyChange={handlePropertyChange}
            onNewTagChange={setNewTag}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onSave={handleSaveWithCallback}
            onToggleEdit={toggleEditing}
          />

          <FileInformation image={image} />
        </>
      )}

      {activeTab === 'perspectives' && (
        <Perspectives image={image} />
      )}

      {activeTab === 'segments' && (
        <Segments image={image} />
      )}
    </div>
  );
} 