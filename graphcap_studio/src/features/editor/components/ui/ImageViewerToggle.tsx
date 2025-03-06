// SPDX-License-Identifier: Apache-2.0
import { useEditorContext, ViewMode } from '../../context/EditorContext';

interface ImageViewerToggleProps {
  onToggle?: (mode: ViewMode) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * A toggle component for switching between grid and carousel view modes
 * 
 * This component provides icon-based buttons for toggling between grid and carousel views.
 * It uses the EditorContext directly for the viewMode state.
 */
export function ImageViewerToggle({
  onToggle,
  className = '',
  disabled = false,
}: ImageViewerToggleProps) {
  const { viewMode, setViewMode } = useEditorContext();
  
  const handleToggle = (mode: ViewMode) => {
    // Use the custom onToggle if provided, otherwise use the context's setViewMode
    if (onToggle) {
      onToggle(mode);
    }
    
    // Always update the context's viewMode to ensure it's properly updated
    setViewMode(mode);
  };
  
  return (
    <div className={`flex rounded-md overflow-hidden border border-gray-600 ${className} ${disabled ? 'opacity-50' : ''}`}>
      <button
        className={`flex items-center justify-center p-1 text-white transition-colors ${
          viewMode === 'grid' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-700 hover:bg-gray-600'
        }`}
        onClick={() => handleToggle('grid')}
        title="Grid View"
        disabled={disabled}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
      <button
        className={`flex items-center justify-center p-1 text-white transition-colors ${
          viewMode === 'carousel' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-700 hover:bg-gray-600'
        }`}
        onClick={() => handleToggle('carousel')}
        title="Carousel View"
        disabled={disabled}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21V3" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21V3" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18" />
        </svg>
      </button>
    </div>
  );
} 