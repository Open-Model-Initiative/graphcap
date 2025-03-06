// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect } from 'react';
import { Image, Dataset } from '@/services/images';

interface ImagePropertiesProps {
  image: Image;
  onSave: (properties: Record<string, any>) => void;
  datasets?: Dataset[];
  currentDataset?: string;
  onAddToDataset?: (imagePath: string, targetDataset: string) => void;
}

interface ImagePropertiesData {
  title: string;
  description: string;
  tags: string[];
  rating: number;
  metadata: Record<string, any>;
}

/**
 * A component for displaying and editing image properties
 */
export function ImageProperties({ 
  image, 
  onSave, 
  datasets = [], 
  currentDataset = '',
  onAddToDataset 
}: ImagePropertiesProps) {
  const [properties, setProperties] = useState<ImagePropertiesData>({
    title: '',
    description: '',
    tags: [],
    rating: 0,
    metadata: {}
  });
  const [newTag, setNewTag] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load properties from localStorage if available
  useEffect(() => {
    if (!image) {
      setError("No image selected");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const savedProps = localStorage.getItem(`image-props:${image.path}`);
      if (savedProps) {
        setProperties(JSON.parse(savedProps));
      } else {
        // Initialize with default properties and image info
        setProperties({
          title: image.name || 'Untitled',
          description: '',
          tags: [],
          rating: 0,
          metadata: {
            path: image.path,
            directory: image.directory,
            url: image.url
          }
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading image properties:', error);
      setError("Failed to load properties");
      setIsLoading(false);
    }
  }, [image]);

  // Reset selected dataset when datasets change
  useEffect(() => {
    if (datasets.length > 0 && !selectedDataset) {
      // Default to current dataset if available
      setSelectedDataset(currentDataset || datasets[0].name);
    }
  }, [datasets, currentDataset, selectedDataset]);

  const handlePropertyChange = (key: keyof ImagePropertiesData, value: any) => {
    setProperties(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    setProperties(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }));
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setProperties(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSave = () => {
    // Save to localStorage for demo purposes
    localStorage.setItem(`image-props:${image.path}`, JSON.stringify(properties));
    onSave(properties);
    setIsEditing(false);
  };

  const handleAddToDataset = () => {
    if (onAddToDataset && selectedDataset) {
      onAddToDataset(image.path, selectedDataset);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <div className="text-red-500 text-center">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="rounded-lg bg-gray-800 p-4 shadow-sm border border-gray-700">
        <h3 className="mb-2 font-medium text-gray-200">Actions</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Add to Dataset
            </label>
            <div className="flex space-x-2">
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="flex-1 rounded-l-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
                data-action="add-to-dataset"
              >
                <option value="">Select a dataset</option>
                {datasets
                  .filter(dataset => dataset.name !== currentDataset)
                  .map(dataset => (
                    <option key={dataset.name} value={dataset.name}>
                      {dataset.name}
                    </option>
                  ))}
              </select>
              <button
                onClick={handleAddToDataset}
                disabled={!selectedDataset}
                className="rounded-r-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-gray-800 p-4 shadow-sm border border-gray-700">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-medium text-gray-200">Basic Information</h3>
          <button
            className="text-sm text-blue-400 hover:text-blue-300"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Title
              </label>
              <input
                type="text"
                value={properties.title}
                onChange={(e) => handlePropertyChange('title', e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                value={properties.description}
                onChange={(e) => handlePropertyChange('description', e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
                rows={3}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Rating
              </label>
              <select
                value={properties.rating}
                onChange={(e) => handlePropertyChange('rating', Number(e.target.value))}
                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
              >
                <option value={0}>Not rated</option>
                <option value={1}>★</option>
                <option value={2}>★★</option>
                <option value={3}>★★★</option>
                <option value={4}>★★★★</option>
                <option value={5}>★★★★★</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Tags
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 rounded-l-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
                  placeholder="Add a tag"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <button
                  onClick={handleAddTag}
                  className="rounded-r-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {properties.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-blue-900/50 px-2.5 py-0.5 text-xs font-medium text-blue-200"
                  >
                    {tag}
                    <button
                      type="button"
                      className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-blue-300 hover:bg-blue-800 hover:text-blue-100"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={handleSave}
              className="mt-2 w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-400">Title:</span>
              <p className="text-sm text-gray-200">{properties.title || 'No title'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-400">Description:</span>
              <p className="text-sm text-gray-200">{properties.description || 'No description'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-400">Rating:</span>
              <p className="text-sm text-gray-200">
                {properties.rating ? '★'.repeat(properties.rating) : 'Not rated'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-400">Tags:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {properties.tags.length > 0 ? (
                  properties.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-blue-900/50 px-2 py-0.5 text-xs font-medium text-blue-200"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No tags</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-gray-800 p-4 shadow-sm border border-gray-700">
        <h3 className="mb-2 font-medium text-gray-200">File Information</h3>
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium text-gray-400">Filename:</span>
            <p className="text-sm break-all text-gray-200">{image.name}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-400">Path:</span>
            <p className="text-sm break-all text-gray-200">{image.path}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-400">Directory:</span>
            <p className="text-sm break-all text-gray-200">{image.directory}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 