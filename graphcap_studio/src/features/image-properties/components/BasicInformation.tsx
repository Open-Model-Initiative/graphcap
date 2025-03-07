// SPDX-License-Identifier: Apache-2.0
import { ImagePropertiesData } from '../hooks/useImageProperties';

interface BasicInformationProps {
  readonly properties: ImagePropertiesData;
  readonly isEditing: boolean;
  readonly newTag: string;
  readonly onPropertyChange: (key: keyof ImagePropertiesData, value: any) => void;
  readonly onNewTagChange: (value: string) => void;
  readonly onAddTag: () => void;
  readonly onRemoveTag: (tag: string) => void;
  readonly onSave: () => void;
  readonly onToggleEdit: () => void;
}

/**
 * Component for displaying and editing basic image information
 */
export function BasicInformation({
  properties,
  isEditing,
  newTag,
  onPropertyChange,
  onNewTagChange,
  onAddTag,
  onRemoveTag,
  onSave,
  onToggleEdit
}: BasicInformationProps) {
  return (
    <div className="rounded-lg bg-gray-800 p-4 shadow-sm border border-gray-700">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium text-gray-200">Basic Information</h3>
        <button
          className="text-sm text-blue-400 hover:text-blue-300"
          onClick={onToggleEdit}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>
      
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label htmlFor="image-title" className="mb-1 block text-sm font-medium text-gray-300">
              Title
            </label>
            <input
              id="image-title"
              type="text"
              value={properties.title}
              onChange={(e) => onPropertyChange('title', e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label htmlFor="image-description" className="mb-1 block text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              id="image-description"
              value={properties.description}
              onChange={(e) => onPropertyChange('description', e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
              rows={3}
            />
          </div>
          <div>
            <label htmlFor="image-rating" className="mb-1 block text-sm font-medium text-gray-300">
              Rating
            </label>
            <select
              id="image-rating"
              value={properties.rating}
              onChange={(e) => onPropertyChange('rating', Number(e.target.value))}
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
            <label htmlFor="image-tags" className="mb-1 block text-sm font-medium text-gray-300">
              Tags
            </label>
            <div className="flex">
              <input
                id="image-tags"
                type="text"
                value={newTag}
                onChange={(e) => onNewTagChange(e.target.value)}
                className="flex-1 rounded-l-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
                placeholder="Add a tag"
                onKeyDown={(e) => e.key === 'Enter' && onAddTag()}
              />
              <button
                onClick={onAddTag}
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
                    onClick={() => onRemoveTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onSave}
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
  );
} 